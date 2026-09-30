import mongoose from "mongoose";
import Subject from "./subject.model.js";
import Class from "../class/class.model.js";
import ProgrammeStructure from "./ProgrammeStructureSchema/programmeStructureSchema.model.js"
import Programme from "../programme/programme.model.js"
import Institution from "./../institution/institution.model.js"
import Student from "../student/student.model.js";
import Batch from "../batch/batch.model.js";




// ==================== GET PROGRAMME BATCHES ====================



export const getProgrammeBatchesService = async (
  programmeId
) => {

  // =========================
  // VALIDATE PROGRAMME ID
  // =========================

  if (
    !mongoose.Types.ObjectId.isValid(programmeId)
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }

  // =========================
  // FIND STUDENTS OF PROGRAMME
  // =========================

  const students =
    await Student.find({

      programmeId,

      isDeleted: false,

      batchId: {
        $ne: null,
      },

    })
      .select("batchId")
      .lean();

  if (!students.length) {
    return [];
  }

  // =========================
  // UNIQUE BATCH IDS
  // =========================

  const batchIds = [
    ...new Set(
      students
        .map(
          (student) =>
            student.batchId.toString()
        )
    ),
  ];

  // =========================
  // FETCH ACTIVE BATCHES
  // =========================

  const batches =
    await Batch.find({

      _id: {
        $in: batchIds,
      },

      status: "Active",

      isDeleted: false,

    })
      .select(
        "batchName admissionYear graduationYear currentYear status"
      )
      .sort({
        admissionYear: 1,
      })
      .lean();

  return batches;
};

// ==================== CREATE PROGRAMME STRUCTURE ====================
export const createProgrammeStructureService = async (
  programmeId,
  user
) => {

  // ==================== VALIDATE PROGRAMME ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      programmeId
    )
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }

  // ==================== FIND PROGRAMME ====================

  console.log(
  "PROGRAMME ID:",
  programmeId
);

console.log(
  "USER:",
  user
);
  const programme =
    await Programme.findOne({

      _id: programmeId,

      isDeleted: false,

    });

      console.log(
  "PROGRAMME FOUND:",
  programme
);

  if (!programme) {
    throw new Error(
      "Programme not found."
    );
  }



  // ==================== CHECK EXISTING STRUCTURE ====================

  const existingStructure =
    await ProgrammeStructure.findOne({

      programmeId,

      isDeleted: false,

    });

  if (existingStructure) {
    throw new Error(
      "Programme structure already exists."
    );
  }

  // ==================== PREPARE STUDY YEARS ====================

  const structure = [];

  for (
    let year = 1;
    year <= programme.duration;
    year++
  ) {

    structure.push({

      studyYear: year,

      semesters: [],

    });

  }

  // ==================== CREATE PROGRAMME STRUCTURE ====================

  const programmeStructure =
    await ProgrammeStructure.create({

      institutionId:
        user.institution,

      departmentId:
        programme.department,

      programmeId:
        programme._id,

      structure,

      createdBy:
        user.userId,

    });

  // ==================== RETURN ====================

  return programmeStructure;

};
// ==================== ADD SEMESTER ====================
// ==================== ADD SEMESTER ====================

export const addSemesterService = async (
  programmeId,
  studyYear
) => {

  // =========================
  // VALIDATE PROGRAMME ID
  // =========================

  if (
    !mongoose.Types.ObjectId.isValid(
      programmeId
    )
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }

  // =========================
  // VALIDATE STUDY YEAR
  // =========================

  const year = Number(studyYear);

  if (
    !Number.isInteger(year) ||
    year <= 0
  ) {
    throw new Error(
      "Invalid study year."
    );
  }

  // =========================
  // FIND PROGRAMME STRUCTURE
  // =========================

  const programmeStructure =
    await ProgrammeStructure.findOne({

      programmeId,

      isDeleted: false,

      isActive: true,

    });

  if (!programmeStructure) {

    throw new Error(
      "Programme structure not found."
    );

  }

  // =========================
  // FIND STUDY YEAR
  // =========================

  const yearStructure =
    programmeStructure.structure.find(
      (item) =>
        item &&
        Number(item.studyYear) === year
    );

  if (!yearStructure) {

    throw new Error(
      `Study Year ${year} not found.`
    );

  }

  // =========================
  // VALIDATE PREVIOUS YEARS
  // =========================

  for (
    let previousYear = 1;
    previousYear < year;
    previousYear++
  ) {

    const previousYearStructure =
      programmeStructure.structure.find(
        (item) =>
          item &&
          Number(item.studyYear) ===
            previousYear
      );

    if (
      !previousYearStructure ||
      !Array.isArray(
        previousYearStructure.semesters
      ) ||
      previousYearStructure.semesters.length < 2
    ) {

      throw new Error(
        `Please complete Study Year ${previousYear} before adding semesters to Study Year ${year}.`
      );

    }

  }

  // =========================
  // ENSURE SEMESTERS ARRAY
  // =========================

  if (
    !Array.isArray(
      yearStructure.semesters
    )
  ) {

    yearStructure.semesters = [];

  }

  // =========================
  // CALCULATE ALLOWED
  // SEMESTERS FOR THIS YEAR
  // =========================

  const firstSemester =
    ((year - 1) * 2) + 1;

  const secondSemester =
    firstSemester + 1;

  // Example:
  //
  // Year 1 → 1, 2
  // Year 2 → 3, 4
  // Year 3 → 5, 6

  // =========================
  // CHECK EXISTING SEMESTERS
  // =========================

  const existingSemesterNumbers =
    yearStructure.semesters
      .filter(
        (item) =>
          item &&
          Number.isInteger(
            Number(item.semesterNumber)
          )
      )
      .map(
        (item) =>
          Number(
            item.semesterNumber
          )
      );

  // =========================
  // DETERMINE NEXT SEMESTER
  // =========================

  let nextSemester = null;

  if (
    !existingSemesterNumbers.includes(
      firstSemester
    )
  ) {

    nextSemester =
      firstSemester;

  } else if (
    !existingSemesterNumbers.includes(
      secondSemester
    )
  ) {

    nextSemester =
      secondSemester;

  } else {

    throw new Error(
      `Study Year ${year} already has both semesters (${firstSemester} and ${secondSemester}).`
    );

  }

  // =========================
  // CREATE SEMESTER
  // =========================

  yearStructure.semesters.push({

    semesterNumber:
      nextSemester,

  });

  // =========================
  // SORT SEMESTERS
  // =========================

  yearStructure.semesters.sort(
    (a, b) =>
      a.semesterNumber -
      b.semesterNumber
  );

  // =========================
  // SAVE
  // =========================

  await programmeStructure.save();

  // =========================
  // RETURN
  // =========================

  return programmeStructure;
};
// ==================== REMOVE SEMESTER ====================
export const removeSemesterService = async (
  programmeId,
  studyYear,
  semesterNumber
) => {

  // ==================== VALIDATE PROGRAMME ID ====================

  if (
    !mongoose.Types.ObjectId.isValid(
      programmeId
    )
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }

  // ==================== FIND PROGRAMME STRUCTURE ====================

  const programmeStructure =
    await ProgrammeStructure.findOne({

      programmeId,

      isDeleted: false,

    });

  if (!programmeStructure) {
    throw new Error(
      "Programme structure not found."
    );
  }

  // ==================== FIND STUDY YEAR ====================

  const yearStructure =
    programmeStructure.structure.find(

      (year) =>
        year.studyYear ===
        Number(studyYear)

    );

  if (!yearStructure) {
    throw new Error(
      "Study year not found."
    );
  }

  // ==================== FIND SEMESTER ====================

  const semesterIndex =
    yearStructure.semesters.findIndex(

      (semester) =>

        semester.semesterNumber ===
        Number(semesterNumber)

    );

  if (
    semesterIndex === -1
  ) {
    throw new Error(
      "Semester not found."
    );
  }

  // ==================== VALIDATE LAST SEMESTER ====================

  const lastSemester =
    yearStructure.semesters[
      yearStructure.semesters.length - 1
    ];

  if (
    lastSemester.semesterNumber !==
    Number(semesterNumber)
  ) {
    throw new Error(
      "Only the last semester of a study year can be removed."
    );
  }

  // ==================== CHECK NEXT STUDY YEARS ====================

  const nextYears =
    programmeStructure.structure.filter(

      (year) =>

        year.studyYear >
        Number(studyYear)

    );

  const hasSemesters =
    nextYears.some(

      (year) =>

        year.semesters.length > 0

    );

  if (hasSemesters) {
    throw new Error(
      "Remove semesters from later study years first."
    );
  }

  // ==================== REMOVE SEMESTER ====================

  yearStructure.semesters.splice(
    semesterIndex,
    1
  );

  // ==================== SAVE ====================

  await programmeStructure.save();

  // ==================== RETURN ====================

  return programmeStructure;

};
// ==================== GET PROGRAMME STRUCTURE ====================
export const getProgrammeStructureService =
  async (programmeId) => {

    // ==================== VALIDATE PROGRAMME ID ====================

    if (
      !mongoose.Types.ObjectId.isValid(
        programmeId
      )
    ) {
      throw new Error(
        "Invalid programme ID."
      );
    }

    // ==================== FIND STRUCTURE ====================

    const programmeStructure =
      await ProgrammeStructure.findOne({

        programmeId,

        isDeleted: false,

      })
        .populate(
          "programmeId",
          "programmeName programmeCode duration"
        )
        .lean();

    if (!programmeStructure) {
      throw new Error(
        "Programme structure not found."
      );
    }

    // ==================== RETURN ====================

    return programmeStructure;

};


















// ========================================================
// CREATE SUBJECT
// ========================================================

export const createSubjectService = async (
  subjectData,
  user
) => {

  const {
    programmeId,
    studyYear,
    semesterNumber,
    subjectName,
    subjectCode,
    subjectScore,
    subjectType,
    syllabusType = "CURRENT",
  } = subjectData;


  // ========================================================
  // VALIDATE SYLLABUS TYPE
  // ========================================================

  if (!["CURRENT", "OLD"].includes(syllabusType)) {
    throw new Error(
      "Invalid syllabus type. Use CURRENT or OLD."
    );
  }


  // ========================================================
  // VALIDATE PROGRAMME ID
  // ========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      programmeId
    )
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }


  // ========================================================
  // VALIDATE STUDY YEAR
  // ========================================================

  if (
    !Number.isInteger(
      Number(studyYear)
    ) ||
    Number(studyYear) <= 0
  ) {
    throw new Error(
      "Invalid study year."
    );
  }


  // ========================================================
  // VALIDATE SEMESTER
  // ========================================================

  if (
    !Number.isInteger(
      Number(semesterNumber)
    ) ||
    Number(semesterNumber) <= 0
  ) {
    throw new Error(
      "Invalid semester."
    );
  }


  // ========================================================
  // FIND PROGRAMME
  // ========================================================

  const programme =
    await Programme.findOne({

      _id: programmeId,

      isDeleted: false,

    });


  if (!programme) {

    throw new Error(
      "Programme not found."
    );

  }


  // ========================================================
  // FIND PROGRAMME STRUCTURE
  // ========================================================

  const programmeStructure =
    await ProgrammeStructure.findOne({

      programmeId,

      isDeleted: false,

      isActive: true,

    });


  if (!programmeStructure) {

    throw new Error(
      "Programme structure not found."
    );

  }


  // ========================================================
  // FIND STUDY YEAR
  // ========================================================

  const yearStructure =
    programmeStructure.structure.find(

      (year) =>
        year.studyYear ===
        Number(studyYear)

    );


  if (!yearStructure) {

    throw new Error(
      "Study year not found."
    );

  }


  // ========================================================
  // FIND SEMESTER
  // ========================================================

  const semester =
    yearStructure.semesters.find(

      (item) =>
        item.semesterNumber ===
        Number(semesterNumber)

    );


  if (!semester) {

    throw new Error(
      "Semester not found in the selected study year."
    );

  }


  // ========================================================
  // NORMALIZE SUBJECT DATA
  // ========================================================

  const normalizedSubjectCode =
    subjectCode
      .trim()
      .toUpperCase();

  const normalizedSubjectName =
    subjectName
      .trim();


  // ========================================================
  // CHECK DUPLICATE SUBJECT CODE
  //
  // IMPORTANT:
  // CURRENT and OLD are treated separately.
  // ========================================================

  const existingSubject =
    await Subject.findOne({

      programmeId,

      studyYear:
        Number(studyYear),

      semesterNumber:
        Number(semesterNumber),

      syllabusType,

      subjectCode:
        normalizedSubjectCode,

      isDeleted: false,

    });


  if (existingSubject) {

    throw new Error(
      `Subject code already exists for this ${syllabusType} syllabus in this semester.`
    );

  }


  // ========================================================
  // CHECK DUPLICATE SUBJECT NAME
  // ========================================================

  const existingSubjectName =
    await Subject.findOne({

      programmeId,

      studyYear:
        Number(studyYear),

      semesterNumber:
        Number(semesterNumber),

      syllabusType,

      subjectName:
        normalizedSubjectName,

      isDeleted: false,

    });


  if (existingSubjectName) {

    throw new Error(
      `Subject name already exists for this ${syllabusType} syllabus in this semester.`
    );

  }


  // ========================================================
  // CREATE SUBJECT
  // ========================================================

  const subject =
    await Subject.create({

      institutionId:
        user.institution,

      departmentId:
        programme.department,

      programmeId,

      studyYear:
        Number(studyYear),

      semesterNumber:
        Number(semesterNumber),

      subjectName:
        normalizedSubjectName,

      subjectCode:
        normalizedSubjectCode,

      subjectScore:
        Number(subjectScore),

      subjectType,

      syllabusType,

      createdBy:
        user.userId,

    });


  // ========================================================
  // RETURN
  // ========================================================

  return subject;

};


// ========================================================
// GET SUBJECTS
// ========================================================

export const getSubjectsService =
  async (

    programmeId,

    studyYear,

    semesterNumber,

    syllabusType = "CURRENT"

  ) => {


    // ======================================================
    // VALIDATE SYLLABUS TYPE
    // ======================================================

    if (
      !["CURRENT", "OLD"].includes(
        syllabusType
      )
    ) {

      throw new Error(
        "Invalid syllabus type. Use CURRENT or OLD."
      );

    }


    // ======================================================
    // VALIDATE PROGRAMME ID
    // ======================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        programmeId
      )
    ) {

      throw new Error(
        "Invalid programme ID."
      );

    }


    // ======================================================
    // FETCH SUBJECTS
    // ======================================================

    const subjects =
      await Subject.find({

        programmeId,

        studyYear:
          Number(studyYear),

        semesterNumber:
          Number(semesterNumber),

        syllabusType,

        isDeleted: false,

      })
      .sort({

        subjectCode: 1,

      });


    return subjects;

};


// ========================================================
// UPDATE SUBJECT
// ========================================================

export const updateSubjectService =
  async (

    subjectId,

    updateData

  ) => {


    // ======================================================
    // VALIDATE SUBJECT ID
    // ======================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        subjectId
      )
    ) {

      throw new Error(
        "Invalid subject ID."
      );

    }


    // ======================================================
    // FIND SUBJECT
    // ======================================================

    const subject =
      await Subject.findOne({

        _id: subjectId,

        isDeleted: false,

      });


    if (!subject) {

      throw new Error(
        "Subject not found."
      );

    }


    // ======================================================
    // PREPARE UPDATED VALUES
    // ======================================================

    const programmeId =
      updateData.programmeId ??
      subject.programmeId;

    const studyYear =
      updateData.studyYear ??
      subject.studyYear;

    const semesterNumber =
      updateData.semesterNumber ??
      subject.semesterNumber;

    const syllabusType =
      updateData.syllabusType ??
      subject.syllabusType ??
      "CURRENT";

    const subjectCode =
      updateData.subjectCode !== undefined
        ? updateData.subjectCode
            .trim()
            .toUpperCase()
        : subject.subjectCode;

    const subjectName =
      updateData.subjectName !== undefined
        ? updateData.subjectName.trim()
        : subject.subjectName;


    // ======================================================
    // VALIDATE SYLLABUS TYPE
    // ======================================================

    if (
      !["CURRENT", "OLD"].includes(
        syllabusType
      )
    ) {

      throw new Error(
        "Invalid syllabus type. Use CURRENT or OLD."
      );

    }


    // ======================================================
    // CHECK DUPLICATE SUBJECT CODE
    // ======================================================

    const duplicateCode =
      await Subject.findOne({

        _id: {
          $ne: subjectId,
        },

        programmeId,

        studyYear:
          Number(studyYear),

        semesterNumber:
          Number(semesterNumber),

        syllabusType,

        subjectCode,

        isDeleted: false,

      });


    if (duplicateCode) {

      throw new Error(
        `Subject code already exists for this ${syllabusType} syllabus in this semester.`
      );

    }


    // ======================================================
    // CHECK DUPLICATE SUBJECT NAME
    // ======================================================

    const duplicateName =
      await Subject.findOne({

        _id: {
          $ne: subjectId,
        },

        programmeId,

        studyYear:
          Number(studyYear),

        semesterNumber:
          Number(semesterNumber),

        syllabusType,

        subjectName,

        isDeleted: false,

      });


    if (duplicateName) {

      throw new Error(
        `Subject name already exists for this ${syllabusType} syllabus in this semester.`
      );

    }


    // ======================================================
    // UPDATE SUBJECT
    // ======================================================

    subject.programmeId =
      programmeId;

    subject.studyYear =
      Number(studyYear);

    subject.semesterNumber =
      Number(semesterNumber);

    subject.subjectName =
      subjectName;

    subject.subjectCode =
      subjectCode;

    subject.subjectScore =
      updateData.subjectScore !== undefined
        ? Number(updateData.subjectScore)
        : subject.subjectScore;

    subject.subjectType =
      updateData.subjectType ??
      subject.subjectType;

    subject.syllabusType =
      syllabusType;


    // ======================================================
    // SAVE
    // ======================================================

    await subject.save();


    // ======================================================
    // RETURN
    // ======================================================

    return subject;

};


// ========================================================
// DELETE SUBJECT
// ========================================================

export const deleteSubjectService = async (
  subjectId
) => {

  // ======================================================
  // FIND SUBJECT
  // ======================================================

  const subject =
    await Subject.findOne({

      _id: subjectId,

      isDeleted: false,

    });


  if (!subject) {

    throw new Error(
      "Subject not found."
    );

  }


  // ======================================================
  // SOFT DELETE
  // ======================================================

  subject.isActive = false;

  subject.isDeleted = true;

  subject.deletedAt =
    new Date();


  await subject.save();


  return subject;

};


// ========================================================
// RESTORE SUBJECT
// ========================================================

export const restoreSubjectService =
  async (
    subjectId
  ) => {


    // ====================================================
    // FIND DELETED SUBJECT
    // ====================================================

    const subject =
      await Subject.findOne({

        _id: subjectId,

        isDeleted: true,

      });


    if (!subject) {

      throw new Error(
        "Deleted subject not found."
      );

    }


    // ====================================================
    // GET SYLLABUS TYPE
    // ====================================================

    const syllabusType =
      subject.syllabusType ??
      "CURRENT";


    // ====================================================
    // CHECK DUPLICATE SUBJECT CODE
    // ====================================================

    const existingCode =
      await Subject.findOne({

        _id: {
          $ne: subjectId,
        },

        programmeId:
          subject.programmeId,

        studyYear:
          subject.studyYear,

        semesterNumber:
          subject.semesterNumber,

        syllabusType,

        subjectCode:
          subject.subjectCode,

        isDeleted: false,

      });


    if (existingCode) {

      throw new Error(
        `Cannot restore. Another ${syllabusType} syllabus subject with the same code already exists.`
      );

    }


    // ====================================================
    // CHECK DUPLICATE SUBJECT NAME
    // ====================================================

    const existingName =
      await Subject.findOne({

        _id: {
          $ne: subjectId,
        },

        programmeId:
          subject.programmeId,

        studyYear:
          subject.studyYear,

        semesterNumber:
          subject.semesterNumber,

        syllabusType,

        subjectName:
          subject.subjectName,

        isDeleted: false,

      });


    if (existingName) {

      throw new Error(
        `Cannot restore. Another ${syllabusType} syllabus subject with the same name already exists.`
      );

    }


    // ====================================================
    // RESTORE
    // ====================================================

    subject.isActive = true;

    subject.isDeleted = false;

    subject.deletedAt = null;


    await subject.save();


    // ====================================================
    // RETURN
    // ====================================================

    return subject;

};


// ========================================================
// GET DELETED SUBJECTS
// ========================================================

export const getDeletedSubjectsService =
  async (
    user
  ) => {

    // ====================================================
    // VALIDATE USER
    // ====================================================

    if (!user.department) {

      throw new Error(
        "Department not found in token."
      );

    }


    // ====================================================
    // FETCH DELETED SUBJECTS
    // ====================================================

    const subjects =
      await Subject.find({

        departmentId:
          user.department,

        isDeleted: true,

      })
      .populate(

        "programmeId",

        "programmeName programmeCode"

      )
      .sort({

        deletedAt: -1,

      });


    return subjects;

};


// ========================================================
// PERMANENT DELETE SUBJECT
// ========================================================

export const permanentDeleteSubjectService =
  async (
    subjectId
  ) => {


    // ====================================================
    // FIND DELETED SUBJECT
    // ====================================================

    const subject =
      await Subject.findOne({

        _id: subjectId,

        isDeleted: true,

      });


    if (!subject) {

      throw new Error(
        "Deleted subject not found."
      );

    }


    // ====================================================
    // PERMANENT DELETE
    // ====================================================

    await Subject.findByIdAndDelete(
      subjectId
    );


    return subject;

};



// ==================== UPDATE CURRENT SEMESTER ====================

export const updateCurrentSemesterService = async (
  programmeId,
  batchId,
  semesterNumber
) => {

  // =========================
  // VALIDATE PROGRAMME ID
  // =========================

  if (
    !mongoose.Types.ObjectId.isValid(programmeId)
  ) {
    throw new Error(
      "Invalid programme ID."
    );
  }

  // =========================
  // VALIDATE BATCH ID
  // =========================

  if (
    !mongoose.Types.ObjectId.isValid(batchId)
  ) {
    throw new Error(
      "Invalid batch ID."
    );
  }

  // =========================
  // VALIDATE SEMESTER
  // =========================

  const semester = Number(
    semesterNumber
  );

  if (
    !Number.isInteger(semester) ||
    semester < 1
  ) {
    throw new Error(
      "Invalid semester."
    );
  }

  // =========================
  // FIND PROGRAMME STRUCTURE
  // =========================

  const programmeStructure =
    await ProgrammeStructure.findOne({
      programmeId: programmeId,
      isDeleted: false,
      isActive: true,
    });

  if (!programmeStructure) {
    throw new Error(
      "Programme structure not found."
    );
  }

  // =========================
  // FIND BATCH
  // =========================

  const batch =
    await Batch.findOne({
      _id: batchId,
      status: "Active",
      isDeleted: false,
    }).lean();

  if (!batch) {
    throw new Error(
      "Batch not found or inactive."
    );
  }

  // =========================
  // VERIFY PROGRAMME + BATCH
  // =========================

  const programmeBatchStudent =
    await Student.findOne({
      programmeId: programmeId,
      batchId: batchId,
      isDeleted: false,
    })
      .select("_id")
      .lean();

  if (!programmeBatchStudent) {
    throw new Error(
      "Batch is not associated with this programme."
    );
  }

  // =========================
  // FIND STUDY YEAR
  // =========================

  const yearStructure =
    programmeStructure.structure.find(
      (year) => {

        if (!year) {
          return false;
        }

        return (
          Number(year.studyYear) ===
          Number(batch.currentYear)
        );

      }
    );

  if (!yearStructure) {
    throw new Error(
      `Study Year ${batch.currentYear} not found in programme structure.`
    );
  }

  // =========================
  // CHECK SEMESTERS ARRAY
  // =========================

  const semesters =
    Array.isArray(
      yearStructure.semesters
    )
      ? yearStructure.semesters
      : [];

  // =========================
  // FIND SELECTED SEMESTER
  // =========================

  const selectedSemester =
    semesters.find(
      (item) => {

        if (!item) {
          return false;
        }

        return (
          Number(
            item.semesterNumber
          ) === semester
        );

      }
    );

  // =========================
  // VALIDATE SELECTED SEMESTER
  // =========================

  if (!selectedSemester) {
    throw new Error(
      `Semester ${semester} does not belong to Study Year ${batch.currentYear}.`
    );
  }

  // =========================
  // ENSURE ACTIVE SEMESTERS
  // =========================

  if (
    !Array.isArray(
      programmeStructure.activeSemesters
    )
  ) {
    programmeStructure.activeSemesters = [];
  }

  // =========================
  // FIND EXISTING BATCH ENTRY
  // =========================

  const existingEntry =
    programmeStructure.activeSemesters.find(
      (item) => {

        if (!item) {
          return false;
        }

        if (!item.batchId) {
          return false;
        }

        return (
          item.batchId.toString() ===
          batchId.toString()
        );

      }
    );

  // =========================
  // UPDATE EXISTING ENTRY
  // =========================

  if (existingEntry) {

    existingEntry.semesterNumber =
      semester;

  }

  // =========================
  // CREATE NEW ENTRY
  // =========================

  else {

    programmeStructure.activeSemesters.push({

      batchId: batchId,

      semesterNumber: semester,

    });

  }

  // =========================
  // SAVE
  // =========================

  await programmeStructure.save();

  // =========================
  // RETURN
  // =========================

  return programmeStructure;
};



// ==================== GET CURRENT SEMESTER SUBJECTS ====================

export const getCurrentSemesterSubjectsService =
  async (classId) => {

    // =========================
    // VALIDATE CLASS ID
    // =========================

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {
      throw new Error(
        "Invalid class ID."
      );
    }


    // =========================
    // FIND CLASS
    // =========================

    const classData =
      await Class.findOne({

        _id: classId,

        isDeleted: false,

        isActive: true,

      })
        .populate(
          "programme",
          "programmeName programmeCode"
        )
        .populate(
          "batchId",
          "batchName admissionYear graduationYear currentYear status"
        );


    if (!classData) {

      throw new Error(
        "Class not found."
      );

    }


    // =========================
    // VALIDATE BATCH
    // =========================

    if (!classData.batchId) {

      throw new Error(
        "Batch is not assigned to this class."
      );

    }


    const batch =
      classData.batchId;


    if (
      batch.status !== "Active"
    ) {

      throw new Error(
        "Batch is not active."
      );

    }


    // =========================
    // FIND PROGRAMME STRUCTURE
    // =========================

    const programmeStructure =
      await ProgrammeStructure.findOne({

        programmeId:
          classData.programme._id,

        isDeleted: false,

        isActive: true,

      });


    if (!programmeStructure) {

      throw new Error(
        "Programme structure not found."
      );

    }


    // =========================
    // FIND ACTIVE SEMESTER
    // FOR THIS BATCH
    // =========================

    const activeSemester =
      programmeStructure.activeSemesters.find(

        (item) =>
          item.batchId.toString() ===
          batch._id.toString()

      );


    if (!activeSemester) {

      throw new Error(
        "Current semester is not configured for this batch."
      );

    }


    // =========================
    // CURRENT ACADEMIC YEAR
    // =========================

    const studyYear =
      batch.currentYear;


    if (
      !studyYear ||
      studyYear < 1
    ) {

      throw new Error(
        "Current study year is not configured for this batch."
      );

    }


    // =========================
    // CURRENT SEMESTER
    // =========================

    const currentSemester =
      activeSemester.semesterNumber;


    // =========================
    // VALIDATE SEMESTER
    // BELONGS TO STUDY YEAR
    // =========================

    const yearStructure =
      programmeStructure.structure.find(

        (year) =>
          year.studyYear ===
          studyYear

      );


    if (!yearStructure) {

      throw new Error(
        `Study Year ${studyYear} not found in programme structure.`
      );

    }


    const semesterExists =
      yearStructure.semesters.some(

        (semester) =>
          semester.semesterNumber ===
          currentSemester

      );


    if (!semesterExists) {

      throw new Error(
        `Semester ${currentSemester} does not belong to Study Year ${studyYear}.`
      );

    }


    // =========================
    // FIND SUBJECTS
    // =========================

    const subjects =
      await Subject.find({

        programmeId:
          classData.programme._id,

        studyYear,

        semesterNumber:
          currentSemester,

        isDeleted: false,

        isActive: true,

      })
        .select(
          "subjectName subjectCode subjectType subjectScore"
        )
        .sort({

          subjectCode: 1,

        });


    // =========================
    // RETURN
    // =========================

    return {

      classData,

      batch: {

        _id:
          batch._id,

        batchName:
          batch.batchName,

        admissionYear:
          batch.admissionYear,

        graduationYear:
          batch.graduationYear,

        currentYear:
          batch.currentYear,

      },

      studyYear,

      currentSemester,

      subjects,

    };

  };












