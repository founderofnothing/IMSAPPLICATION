import mongoose from "mongoose";

import ExamHallStudentAllocation from "./examHallStudentAllocation.model.js";
import ExamDeskArrangement from "../examDeskArrangement/examDeskArrangement.model.js";
import ExamHall from "../examHall/examHall.model.js";
import ExamTitle from "../../model/examTitle.model.js";
import Student from "../../../student/student.model.js";

// =====================================================
// VALIDATE OBJECT ID
// =====================================================

const validateObjectId = (
  value,
  fieldName
) => {
  if (
    !value ||
    !mongoose.Types.ObjectId.isValid(value)
  ) {
    throw new Error(
      `Invalid ${fieldName}.`
    );
  }
};

// =====================================================
// GET DESK / BENCH
// =====================================================

// =====================================================
// GET DESK / BENCH
// =====================================================
//
// Finds a specific bench inside a specific column.
//
// Structure:
//
// ExamDeskArrangement
//   └── columns[]
//        └── benches[]
//
// Example:
//
// LC1
//   ├── Bench 1
//   ├── Bench 2
//   └── Bench 3
//
// =====================================================

const getDesk = async (
  institutionId,
  hallId,
  columnKey,
  benchNumber
) => {

  // =================================================
  // FETCH DESK ARRANGEMENT
  // =================================================

  const arrangement =
    await ExamDeskArrangement.findOne({
      institutionId,
      hallId,
    });

  if (!arrangement) {
    throw new Error(
      "Desk arrangement not found for this exam hall."
    );
  }

  // =================================================
  // NORMALIZE COLUMN KEY
  // =================================================

  const normalizedColumn =
    String(columnKey)
      .trim()
      .toUpperCase();

  // =================================================
  // FIND COLUMN
  // =================================================

  const column =
    arrangement.columns?.find(
      (item) =>
        String(item.columnKey)
          .trim()
          .toUpperCase() ===
        normalizedColumn
    );

  if (!column) {
    throw new Error(
      `Column ${columnKey} not found in this exam hall.`
    );
  }

  // =================================================
  // FIND BENCH INSIDE COLUMN
  // =================================================

  const bench =
    column.benches?.find(
      (item) =>
        Number(item.benchNumber) ===
        Number(benchNumber)
    );

  if (!bench) {
    throw new Error(
      `Bench ${benchNumber} not found in column ${columnKey}.`
    );
  }

  // =================================================
  // RETURN BENCH
  // =================================================

  return bench;
};

// =====================================================
// VALIDATE EXAM TITLE
// =====================================================

const validateExamTitle = async (
  institutionId,
  examTitleId
) => {

  validateObjectId(
    examTitleId,
    "examTitleId"
  );

  const examTitle =
    await ExamTitle.findOne({
      _id: examTitleId,
      institutionId,
      isDeleted: false,
    });

  if (!examTitle) {
    throw new Error(
      "Exam title not found."
    );
  }

  return examTitle;
};

// =====================================================
// VALIDATE EXAM HALL
// =====================================================

const validateExamHall = async (
  institutionId,
  hallId
) => {

  validateObjectId(
    hallId,
    "hallId"
  );

  const hall =
    await ExamHall.findOne({
      _id: hallId,
      institutionId,
    });

  if (!hall) {
    throw new Error(
      "Exam hall not found."
    );
  }

  return hall;
};

// =====================================================
// VALIDATE STUDENT
// =====================================================

const validateStudent = async (
  institutionId,
  studentId
) => {

  validateObjectId(
    studentId,
    "studentId"
  );

  const student =
    await Student.findOne({
      _id: studentId,
      institutionId,
    });

  if (!student) {
    throw new Error(
      `Student ${studentId} not found.`
    );
  }

  return student;
};

// =====================================================
// VALIDATE ACADEMIC REFERENCES
// =====================================================
//
// We validate that the selected student actually belongs
// to the selected programme and batch.
//
// Subject is validated separately through the allocation
// input because the student itself does not necessarily
// contain a single subject reference.
//
// =====================================================

const validateStudentAcademicData = async ({
  student,
  programmeId,
  batchId,
}) => {

  validateObjectId(
    programmeId,
    "programmeId"
  );

  validateObjectId(
    batchId,
    "batchId"
  );

  // -------------------------------------------------
  // Programme validation
  // -------------------------------------------------

  if (
    student.programmeId &&
    String(student.programmeId) !==
      String(programmeId)
  ) {
    throw new Error(
      "Selected student does not belong to the selected programme."
    );
  }

  // -------------------------------------------------
  // Batch validation
  // -------------------------------------------------

  if (
    student.batchId &&
    String(student.batchId) !==
      String(batchId)
  ) {
    throw new Error(
      "Selected student does not belong to the selected batch."
    );
  }
};

// =====================================================
// VALIDATE SUBJECT
// =====================================================

const validateSubject = async (
  subjectId
) => {

  validateObjectId(
    subjectId,
    "subjectId"
  );

  // -------------------------------------------------
  // We intentionally don't fetch ExamPaper here.
  //
  // Subject selection belongs to the seating UI.
  // ExamPaper belongs to the marks-entry workflow.
  //
  // -------------------------------------------------

  return true;
};

// =====================================================
// VALIDATE DUPLICATE STUDENT
// =====================================================
//
// A student can only have one seat for one exam title.
//
// =====================================================

const validateStudentNotAllocated = async ({
  examTitleId,
  studentId,
}) => {

  const existing =
    await ExamHallStudentAllocation.findOne({
      examTitleId,
      studentId,
      status: {
        $ne: "removed",
      },
    });

  if (existing) {

    throw new Error(
      `Student ${existing.registerNumber} is already allocated in this exam title.`
    );
  }
};

// =====================================================
// VALIDATE SEAT
// =====================================================

const validateSeat = async ({
  institutionId,
  hallId,
  columnKey,
  benchNumber,
  seatNumber,
  examTitleId,
}) => {

  const desk =
    await getDesk(
      institutionId,
      hallId,
      columnKey,
      benchNumber
    );

  const capacity =
    Number(desk.capacity);

  const seat =
    Number(seatNumber);

  // =================================================
  // VALIDATE SEAT NUMBER
  // =================================================

  if (
    !Number.isInteger(seat) ||
    seat < 1 ||
    seat > capacity
  ) {

    throw new Error(
      `Invalid seat ${seatNumber}. Bench ${benchNumber} in ${columnKey} has capacity ${capacity}.`
    );
  }

  // =================================================
  // CHECK OCCUPIED SEAT
  // =================================================

  const existing =
    await ExamHallStudentAllocation.findOne({
      examTitleId,

      hallId,

      columnKey:
        String(columnKey)
          .trim()
          .toUpperCase(),

      benchNumber,

      seatNumber: seat,

      status: {
        $ne: "removed",
      },
    });

  if (existing) {

    throw new Error(
      `Seat ${seat} of ${columnKey} Bench ${benchNumber} is already occupied.`
    );
  }

  return desk;
};

// =====================================================
// CREATE SINGLE STUDENT ALLOCATION
// =====================================================
//
// Used for MANUAL allocation.
//
// One student → one seat.
//
// =====================================================

export const createStudentAllocation =
  async (
    institutionId,
    data,
    userId
  ) => {

    const {
      examTitleId,

      hallId,

      columnKey,

      columnName,

      benchNumber,

      seatNumber,

      studentId,

      programmeId,

      batchId,

      subjectId,

      assignmentMode,
    } = data;

    // =================================================
    // REQUIRED FIELDS
    // =================================================

    if (
      !examTitleId ||
      !hallId ||
      !columnKey ||
      !benchNumber ||
      !seatNumber ||
      !studentId ||
      !programmeId ||
      !batchId ||
      !subjectId ||
      !assignmentMode
    ) {

      throw new Error(
        "Exam title, hall, column, bench, seat, student, programme, batch, subject and assignment mode are required."
      );
    }

    // =================================================
    // VALIDATE IDS
    // =================================================

    validateObjectId(
      examTitleId,
      "examTitleId"
    );

    validateObjectId(
      hallId,
      "hallId"
    );

    validateObjectId(
      studentId,
      "studentId"
    );

    validateObjectId(
      programmeId,
      "programmeId"
    );

    validateObjectId(
      batchId,
      "batchId"
    );

    validateObjectId(
      subjectId,
      "subjectId"
    );

    // =================================================
    // VALIDATE ASSIGNMENT MODE
    // =================================================

    if (
      ![
        "automatic",
        "manual",
      ].includes(assignmentMode)
    ) {

      throw new Error(
        "Invalid assignment mode."
      );
    }

    // =================================================
    // VALIDATE EXAM TITLE
    // =================================================

    await validateExamTitle(
      institutionId,
      examTitleId
    );

    // =================================================
    // VALIDATE EXAM HALL
    // =================================================

    await validateExamHall(
      institutionId,
      hallId
    );

    // =================================================
    // VALIDATE STUDENT
    // =================================================

    const student =
      await validateStudent(
        institutionId,
        studentId
      );

    // =================================================
    // VALIDATE PROGRAMME + BATCH
    // =================================================

    await validateStudentAcademicData({
      student,
      programmeId,
      batchId,
    });

    // =================================================
    // VALIDATE SUBJECT
    // =================================================

    await validateSubject(
      subjectId
    );

    // =================================================
    // DUPLICATE STUDENT CHECK
    // =================================================

    await validateStudentNotAllocated({
      examTitleId,
      studentId,
    });

    // =================================================
    // VALIDATE SEAT
    // =================================================

    await validateSeat({
      institutionId,
      examTitleId,
      hallId,
      columnKey,
      benchNumber,
      seatNumber,
    });

    // =================================================
    // CREATE ALLOCATION
    // =================================================

    const allocation =
      await ExamHallStudentAllocation.create({

        institutionId,

        examTitleId,

        hallId,

        columnKey:
          String(columnKey)
            .trim()
            .toUpperCase(),

        columnName:
          String(
            columnName || columnKey
          ).trim(),

        benchNumber:
          Number(benchNumber),

        seatNumber:
          Number(seatNumber),

        studentId,

        registerNumber:
          student.registerNumber,

        studentName:
          student.studentName,

        programmeId,

        batchId,

        subjectId,

        assignmentMode,

        status:
          "allocated",

        assignedBy:
          userId,

        assignedAt:
          new Date(),
      });

    return allocation;
  };

// =====================================================
// CREATE BULK STUDENT ALLOCATIONS
// =====================================================
//
// Used by automatic allocation.
//
// =====================================================

export const createBulkStudentAllocations =
  async (
    institutionId,
    allocations,
    userId
  ) => {

    if (
      !Array.isArray(
        allocations
      ) ||
      allocations.length === 0
    ) {

      throw new Error(
        "At least one allocation is required."
      );
    }

    const createdAllocations =
      [];

    // =================================================
    // PROCESS ONE BY ONE
    // =================================================

    for (
      const allocation of allocations
    ) {

      const created =
        await createStudentAllocation(
          institutionId,
          allocation,
          userId
        );

      createdAllocations.push(
        created
      );
    }

    return createdAllocations;
  };

// =====================================================
// GET HALL ALLOCATIONS
// =====================================================
//
// API remains:
// GET
// /session/:examSessionId/hall/:hallId
//
// IMPORTANT:
// The route name can remain unchanged for now so we
// don't have to change the API structure everywhere.
//
// But internally we now interpret the first parameter
// as examTitleId.
//
// =====================================================

export const getHallAllocations =
  async (
    institutionId,
    examTitleId,
    hallId
  ) => {

    // =================================================
    // VALIDATE EXAM TITLE
    // =================================================

    await validateExamTitle(
      institutionId,
      examTitleId
    );

    // =================================================
    // VALIDATE HALL
    // =================================================

    await validateExamHall(
      institutionId,
      hallId
    );

    // =================================================
    // FETCH ALLOCATIONS
    // =================================================

    const allocations =
      await ExamHallStudentAllocation.find({
        institutionId,

        examTitleId,

        hallId,

        status: {
          $ne: "removed",
        },
      })

        .populate(
          "examTitleId",
          "title"
        )

        .populate(
          "studentId",
          "studentName registerNumber"
        )

        .populate(
          "programmeId",
          "programmeName programmeCode"
        )

        .populate(
          "batchId",
          "batchName"
        )

        .populate(
          "subjectId",
          "subjectName subjectCode"
        )

        .sort({
          columnKey: 1,
          benchNumber: 1,
          seatNumber: 1,
        });

    return allocations;
  };

// =====================================================
// REMOVE STUDENT ALLOCATION
// =====================================================
//
// Used later for:
// Remove
// Reassign
//
// =====================================================

export const removeStudentAllocation =
  async (
    institutionId,
    allocationId,
    userId
  ) => {

    validateObjectId(
      allocationId,
      "allocationId"
    );

    const allocation =
      await ExamHallStudentAllocation.findOne({
        _id: allocationId,

        institutionId,

        status: {
          $ne: "removed",
        },
      });

    if (!allocation) {

      throw new Error(
        "Student allocation not found."
      );
    }

    allocation.status =
      "removed";

    allocation.removedAt =
      new Date();

    allocation.removedBy =
      userId;

    await allocation.save();

    return allocation;
  };


  // =====================================================
// GET HALL ATTENDANCE LIST
// =====================================================
//
// Returns students allocated to a particular
// exam title + hall, arranged department-wise.
//
// Flow:
//
// Exam Hall Allocation
//      ↓
// Programme
//      ↓
// Department
//      ↓
// Department-wise attendance list
//
// =====================================================

export const getHallAttendanceList = async (
  institutionId,
  examTitleId,
  hallId
) => {

  // ===================================================
  // FETCH ACTIVE ALLOCATIONS
  // ===================================================

  const allocations =
    await ExamHallStudentAllocation.find({

      institutionId,

      examTitleId,

      hallId,

      // Removed students should not appear
      status: {
        $ne: "removed",
      },

    })
      .populate({
        path: "programmeId",
        select:
          "programmeName programmeCode department",

        populate: {
          path: "department",
          select:
            "departmentName",
        },
      })
      .lean();


  // ===================================================
  // SORT RAW DATA
  // ===================================================
  //
  // Department
  //      ↓
  // Programme
  //      ↓
  // Register Number
  //
  // ===================================================

  allocations.sort(
    (a, b) => {

      const departmentA =
        a.programmeId?.department
          ?.departmentName || "";

      const departmentB =
        b.programmeId?.department
          ?.departmentName || "";

      const departmentCompare =
        departmentA.localeCompare(
          departmentB
        );

      if (
        departmentCompare !== 0
      ) {
        return departmentCompare;
      }


      const programmeA =
        a.programmeId
          ?.programmeName || "";

      const programmeB =
        b.programmeId
          ?.programmeName || "";

      const programmeCompare =
        programmeA.localeCompare(
          programmeB
        );

      if (
        programmeCompare !== 0
      ) {
        return programmeCompare;
      }


      return (
        a.registerNumber || ""
      ).localeCompare(
        b.registerNumber || "",
        undefined,
        {
          numeric: true,
        }
      );

    }
  );


  // ===================================================
  // GROUP BY DEPARTMENT
  // ===================================================

  const departmentMap =
    new Map();


  for (
    const allocation of allocations
  ) {

    const programme =
      allocation.programmeId;

    const department =
      programme?.department;


    if (!department) {
      continue;
    }


    const departmentId =
      department._id.toString();


    // =================================================
    // CREATE DEPARTMENT
    // =================================================

    if (
      !departmentMap.has(
        departmentId
      )
    ) {

      departmentMap.set(
        departmentId,
        {
          departmentId:
            department._id,

          departmentName:
            department.departmentName,

          programmes: [],
        }
      );

    }


    const departmentData =
      departmentMap.get(
        departmentId
      );


    // =================================================
    // FIND PROGRAMME
    // =================================================

    const programmeId =
      programme._id.toString();


    let programmeData =
      departmentData.programmes.find(
        (item) =>
          item.programmeId.toString() ===
          programmeId
      );


    // =================================================
    // CREATE PROGRAMME
    // =================================================

    if (!programmeData) {

      programmeData = {

        programmeId:
          programme._id,

        programmeName:
          programme.programmeName,

        programmeCode:
          programme.programmeCode,

        students: [],

      };


      departmentData.programmes.push(
        programmeData
      );

    }


    // =================================================
    // ADD STUDENT
    // =================================================

    programmeData.students.push({

      studentId:
        allocation.studentId,

      studentName:
        allocation.studentName,

      registerNumber:
        allocation.registerNumber,

    });

  }


  // ===================================================
  // FINAL ARRAY
  // ===================================================

  const departments =
    Array.from(
      departmentMap.values()
    );


  // ===================================================
  // TOTAL STUDENTS
  // ===================================================

  const totalStudents =
    allocations.length;


  return {

    totalStudents,

    totalDepartments:
      departments.length,

    departments,

  };

};