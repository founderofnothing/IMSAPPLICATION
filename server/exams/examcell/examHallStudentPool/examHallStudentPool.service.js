import Student from "../../../student/student.model.js";
import Programme from "../../../programme/programme.model.js";
import Batch from "../../../batch/batch.model.js";
import ExamSession from "../../../exams/model/examSession.model.js";
import ExamPaper from "../../../exams/model/examPaper.model.js";
import ExamHall from "../examHall/examHall.model.js";
import ExamHallStudentPool from "./examHallStudentPool.model.js";
import mongoose from "mongoose";
// =====================================================
// GET AVAILABLE STUDENTS
// =====================================================

export const getAvailableStudents = async (
  institutionId,
  data
) => {
  const {
    examSessionId,
    hallId,
    programmeId,
    batchId,
    examPaperId,
    rangeFrom,
    rangeTo,
  } = data;

  // ===================================================
  // CHECK EXAM SESSION
  // ===================================================

  const examSession = await ExamSession.findOne({
    _id: examSessionId,
    institutionId,
    isDeleted: false,
  });

  if (!examSession) {
    throw new Error("Exam session not found.");
  }

  // ===================================================
  // CHECK HALL
  // ===================================================

  const hall = await ExamHall.findOne({
    _id: hallId,
    institutionId,
  });

  if (!hall) {
    throw new Error("Exam hall not found.");
  }

  // ===================================================
  // CHECK PROGRAMME
  // ===================================================

  const programme = await Programme.findOne({
    _id: programmeId,
    isDeleted: false,
  });

  if (!programme) {
    throw new Error("Programme not found.");
  }

  // ===================================================
  // CHECK BATCH
  // ===================================================

  const batch = await Batch.findOne({
    _id: batchId,
    institutionId,
    isDeleted: false,
  });

  if (!batch) {
    throw new Error("Batch not found.");
  }

  // ===================================================
  // CHECK EXAM PAPER
  // ===================================================

  const examPaper = await ExamPaper.findOne({
    _id: examPaperId,
    examSessionId,
    isDeleted: false,
  }).populate(
    "subjectId",
    "subjectName subjectCode programmeId studyYear semesterNumber"
  );

  if (!examPaper) {
    throw new Error(
      "Exam paper not found for this exam session."
    );
  }

  // ===================================================
  // VERIFY SUBJECT BELONGS TO PROGRAMME
  // ===================================================

  if (
    examPaper.subjectId.programmeId.toString() !==
    programmeId.toString()
  ) {
    throw new Error(
      "Selected subject does not belong to the selected programme."
    );
  }

  // ===================================================
  // VALIDATE RANGE
  // ===================================================

  if (!rangeFrom || !rangeTo) {
    throw new Error(
      "Register number range is required."
    );
  }

  // ===================================================
  // FETCH STUDENTS
  // ===================================================

  const students = await Student.find({
    institutionId,
    programmeId,
    batchId,

    registerNumber: {
      $gte: String(rangeFrom).trim(),
      $lte: String(rangeTo).trim(),
    },

    admissionStatus: {
      $in: ["Selected", "Admitted"],
    },

    isDeleted: false,
  })
    .select(
      "_id registerNumber studentName programmeId batchId"
    )
    .sort({
      registerNumber: 1,
    });

  // ===================================================
  // FIND ALREADY POOL-SELECTED STUDENTS
  // ===================================================

  const existingPools =
    await ExamHallStudentPool.find({
      institutionId,
      examSessionId,
    }).select("students hallId");

  const alreadySelectedStudentIds = new Set();

  for (const pool of existingPools) {
    for (const student of pool.students) {
      alreadySelectedStudentIds.add(
        student.studentId.toString()
      );
    }
  }

  // ===================================================
  // SEPARATE AVAILABLE / ALREADY SELECTED
  // ===================================================

  const availableStudents = [];
  const alreadySelected = [];

  for (const student of students) {
    if (
      alreadySelectedStudentIds.has(
        student._id.toString()
      )
    ) {
      alreadySelected.push(student);
    } else {
      availableStudents.push(student);
    }
  }

  return {
    examSession,
    hall,
    programme,
    batch,
    examPaper,

    range: {
      from: rangeFrom,
      to: rangeTo,
    },

    students: availableStudents,

    totalStudents: students.length,

    alreadySelectedCount:
      alreadySelected.length,

    availableStudentsCount:
      availableStudents.length,

    alreadySelectedStudents:
      alreadySelected,
  };
};

// =====================================================
// CREATE STUDENT POOL
// =====================================================

export const createStudentPool = async (
  institutionId,
  data
) => {
  const {
    examSessionId,
    hallId,
    programmeId,
    batchId,
    examPaperId,
    rangeFrom,
    rangeTo,
  } = data;

  // ===================================================
  // FETCH AVAILABLE STUDENTS
  // ===================================================

  const result = await getAvailableStudents(
    institutionId,
    data
  );

  const {
    examPaper,
    students,
  } = result;

  // ===================================================
  // CHECK EXISTING POOL
  // ===================================================

  const existingPool =
    await ExamHallStudentPool.findOne({
      institutionId,
      examSessionId,
      hallId,
      programmeId,
      batchId,
      subjectId: examPaper.subjectId._id,
    });

  if (existingPool) {
    throw new Error(
      "Student pool already exists for this programme, batch, and subject in this hall."
    );
  }

  // ===================================================
  // NO STUDENTS
  // ===================================================

  if (students.length === 0) {
    throw new Error(
      "No available students found for the selected range."
    );
  }

  // ===================================================
  // CREATE SNAPSHOT
  // ===================================================

  const selectedStudents = students.map(
    (student) => ({
      studentId: student._id,
      registerNumber: student.registerNumber,
      studentName: student.studentName,
    })
  );

  // ===================================================
  // CREATE POOL
  // ===================================================

  const studentPool =
    await ExamHallStudentPool.create({
      institutionId,

      examSessionId,

      hallId,

      programmeId,

      batchId,

      examPaperId,

      subjectId: examPaper.subjectId._id,

      rangeFrom,
      rangeTo,

      students: selectedStudents,
    });

  return studentPool;
};

// =====================================================
// GET STUDENT POOLS FOR HALL
// =====================================================

export const getStudentPools = async (
  institutionId,
  hallId,
  examSessionId
) => {
  const query = {
    institutionId,
    hallId,
  };

  if (examSessionId) {
    query.examSessionId = examSessionId;
  }

  const pools =
    await ExamHallStudentPool.find(query)
      .populate(
        "programmeId",
        "programmeName programmeCode"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear"
      )
      .populate(
        "subjectId",
        "subjectName subjectCode"
      )
      .populate(
        "examPaperId",
        "displayOrder conductedMark"
      )
      .sort({
        createdAt: 1,
      });

  return pools;
};

// =====================================================
// DELETE STUDENT POOL
// =====================================================

export const deleteStudentPool = async (
  institutionId,
  poolId
) => {
  const pool =
    await ExamHallStudentPool.findOne({
      _id: poolId,
      institutionId,
    });

  if (!pool) {
    throw new Error(
      "Student pool not found."
    );
  }

  await ExamHallStudentPool.findOneAndDelete({
    _id: poolId,
    institutionId,
  });

  return pool;
};





// =====================================================
// GET STUDENTS BY PROGRAMME + BATCH
// INSTITUTION COMES FROM JWT
// =====================================================

export const getExamCellStudents = async (
  institutionId,
  filters = {}
) => {
  const {
    programmeId,
    batchId,
    page = 1,
    limit = 20,
    search,
  } = filters;

  // ===================================================
  // REQUIRED FILTERS
  // ===================================================

  if (!programmeId) {
    throw new Error("Programme ID is required.");
  }

  if (!batchId) {
    throw new Error("Batch ID is required.");
  }

  // ===================================================
  // VALIDATE IDS
  // ===================================================

  if (!mongoose.Types.ObjectId.isValid(programmeId)) {
    throw new Error("Invalid programme ID.");
  }

  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new Error("Invalid batch ID.");
  }

  // ===================================================
  // PAGINATION
  // ===================================================

  const currentPage = Math.max(
    parseInt(page, 10) || 1,
    1
  );

  const itemsPerPage = Math.max(
    parseInt(limit, 10) || 20,
    1
  );

  const skip =
    (currentPage - 1) * itemsPerPage;

  // ===================================================
  // BASE FILTER
  // ===================================================

  const filter = {
    institutionId,
    programmeId,
    batchId,
    isDeleted: false,
  };

  // ===================================================
  // SEARCH
  // ===================================================

  if (search && search.trim()) {
    const searchValue = search.trim();

    const escapedSearch = searchValue.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.$or = [
      {
        studentName: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        registerNumber: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
      {
        applicationNumber: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  // ===================================================
  // FETCH STUDENTS + COUNT
  // ===================================================

  const [students, totalRecords] =
    await Promise.all([
      Student.find(filter)
        .select(`
          _id
          registerNumber
          applicationNumber
          studentName
          gender
          programmeId
          batchId
          classId
        `)
        .populate(
          "programmeId",
          "programmeName programmeCode programmeType"
        )
        .populate(
          "batchId",
          "batchName admissionYear graduationYear currentYear"
        )
        .populate(
          "classId",
          "year section"
        )
        .sort({
          registerNumber: 1,
        })
        .skip(skip)
        .limit(itemsPerPage),

      Student.countDocuments(filter),
    ]);

  // ===================================================
  // PAGINATION
  // ===================================================

  const totalPages = Math.ceil(
    totalRecords / itemsPerPage
  );

  return {
    students,

    pagination: {
      currentPage,
      itemsPerPage,
      totalRecords,
      totalPages,

      hasNextPage:
        currentPage < totalPages,

      hasPreviousPage:
        currentPage > 1,
    },
  };
};