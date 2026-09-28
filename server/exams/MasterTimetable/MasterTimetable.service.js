import MasterTimetable from  "./MasterTimetable.model.js"
import Institution from "../../institution/institution.model.js"

import ProgrammeStructure from "../../subject/ProgrammeStructureSchema/programmeStructureSchema.model.js";
import Class from "../../class/class.model.js";
import Batch from "../../batch/batch.model.js";
import Subject from "../../subject/subject.model.js";

// =========================
// CREATE MASTER TIMETABLE
// =========================
export const createMasterTimetableService = async (
  institutionId,
  data
) => {

  // =========================
  // VALIDATION
  // =========================

  if (!institutionId) {
    throw new Error(
      "Institution ID is required."
    );
  }

  if (!data.examTitleId) {
    throw new Error(
      "Exam title is required."
    );
  }

  if (!data.semesterType) {
    throw new Error(
      "Semester type is required."
    );
  }

  if (!data.academicYear) {
    throw new Error(
      "Academic year is required."
    );
  }

  // =========================
  // CREATE MASTER TIMETABLE
  // =========================

  const timetable =
    await MasterTimetable.create({

      institutionId,

      examTitleId:
        data.examTitleId,

      semesterType:
        data.semesterType,

      academicYear:
        data.academicYear,

    });

  // =========================
  // RETURN CREATED DATA
  // =========================

  return timetable;
};


// =========================
// GET MASTER TIMETABLE
// =========================
// ======================================================
// GET ALL MASTER TIMETABLES
// ======================================================

export const getMasterTimetablesService = async (
  institutionId
) => {

  // =========================
  // VALIDATE INSTITUTION
  // =========================

  if (!institutionId) {
    throw new Error(
      "Institution ID is required."
    );
  }

  // =========================
  // FETCH ALL ACTIVE
  // MASTER TIMETABLES
  // =========================

  const timetables =
    await MasterTimetable.find({
      institutionId,
      isDeleted: false,
    })
      .populate(
        "examTitleId"
      )
      .sort({
        createdAt: -1,
      });

  // =========================
  // RETURN
  // =========================

  return timetables;
};
// =========================
// GET MASTER TIMETABLE
// =========================

export const getMasterTimetableService = async (
  timetableId
) => {

  const timetable =
    await MasterTimetable.findOne({
      _id: timetableId,
      isDeleted: false,
    })
      .populate(
        "institutionId",
        "institutionName institutionCode address"
      )
      .populate(
        "examTitleId"
      )
      .populate(
        "schedules.subjectId",
        "subjectCode subjectName"
      );

  if (!timetable) {
    throw new Error(
      "Master timetable not found"
    );
  }

  return timetable;
};


// =========================
// UPDATE MASTER TIMETABLE
// =========================
export const updateMasterTimetableService =
  async (
    timetableId,
    updateData
  ) => {

    // =========================
    // CHECK EXISTS
    // =========================

    const existingTimetable =
      await MasterTimetable.findOne({
        _id: timetableId,
        isDeleted: false,
      });

    if (!existingTimetable) {
      throw new Error(
        "Master timetable not found"
      );
    }

    // =========================
    // ALLOWED HEADER FIELDS
    // =========================

    const allowedFields = [
      "examTitleId",
      "semesterType",
      "academicYear",
    ];

    const updateFields = {};

    allowedFields.forEach((field) => {

      if (
        Object.prototype.hasOwnProperty.call(
          updateData,
          field
        )
      ) {
        updateFields[field] =
          updateData[field];
      }

    });

    // =========================
    // UPDATE
    // =========================

    const updatedTimetable =
      await MasterTimetable.findOneAndUpdate(
        {
          _id: timetableId,
          isDeleted: false,
        },
        updateFields,
        {
          returnDocument: "after",
          runValidators: true,
        }
      )
        .populate(
          "institutionId",
          "institutionName institutionCode address"
        )
        .populate(
          "examTitleId"
        )
        .populate(
          "schedules.subjectId",
          "subjectCode subjectName"
        );

    // =========================
    // CHECK UPDATED RECORD
    // =========================

    if (!updatedTimetable) {
      throw new Error(
        "Failed to update master timetable"
      );
    }

    // =========================
    // RETURN
    // =========================

    return updatedTimetable;
  };


  // =========================
// DELETE MASTER TIMETABLE
// =========================
export const deleteMasterTimetableService =
  async (
    timetableId
  ) => {

    const timetable =
      await MasterTimetable.findOne({
        _id: timetableId,
        isDeleted: false,
      });

    if (!timetable) {
      throw new Error(
        "Master timetable not found"
      );
    }

    timetable.isDeleted = true;
    timetable.deletedAt = new Date();

    await timetable.save();

    return timetable;
  };



// ======================================================
// GET CLASSES BY YEAR
// ======================================================

// ======================================================
// GET CLASSES BY YEAR
// ======================================================

export const getClassesByYearService = async (
  institutionId,
  year
) => {

  // =========================
  // VALIDATE YEAR
  // =========================

  const currentYear = Number(year);

  if (
    !Number.isInteger(currentYear) ||
    currentYear < 1
  ) {
    throw new Error(
      "Valid year is required"
    );
  }

  // =========================
  // FIND ACTIVE BATCHES
  // FOR SELECTED YEAR
  // =========================

  const batches =
    await Batch.find({
      institutionId,
      currentYear,
      status: "Active",
      isDeleted: false,
    })
      .select(
        "_id batchName admissionYear graduationYear currentYear status"
      )
      .lean();

  if (!batches.length) {
    return [];
  }

  // =========================
  // BATCH IDS
  // =========================

  const batchIds =
    batches.map(
      (batch) => batch._id
    );

  // =========================
  // FIND CLASSES
  // =========================

  const classes =
    await Class.find({
      institution: institutionId,

      batchId: {
        $in: batchIds,
      },

      isActive: true,
      isDeleted: false,
    })
      .populate(
        "department",
        "departmentName"
      )
      .populate(
        "programme",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      )
      .sort({
        "programme.programmeName": 1,
        section: 1,
      })
      .lean();

  return classes;
};


// ======================================================
// ADD DATE + SESSIONS
// ======================================================

export const addTimetableDateService = async (
  timetableId,
  dateData
) => {
  const {
    date,
    sessions,
  } = dateData;

  // =========================
  // CHECK TIMETABLE
  // =========================

  const timetable =
    await MasterTimetable.findOne({
      _id: timetableId,
      isDeleted: false,
    });

  if (!timetable) {
    throw new Error(
      "Master timetable not found"
    );
  }

  // =========================
  // VALIDATE DATE
  // =========================

  if (!date) {
    throw new Error(
      "Examination date is required"
    );
  }

  // =========================
  // VALIDATE SESSIONS
  // =========================

  if (
    !Array.isArray(sessions) ||
    sessions.length === 0
  ) {
    throw new Error(
      "At least one session is required"
    );
  }

  // =========================
  // CHECK DUPLICATE DATE
  // =========================

  const normalizedDate =
    new Date(date);

  if (
    Number.isNaN(
      normalizedDate.getTime()
    )
  ) {
    throw new Error(
      "Invalid examination date"
    );
  }

  const duplicateDate =
    timetable.dates.some(
      (item) =>
        new Date(item.date)
          .toISOString()
          .split("T")[0] ===
        normalizedDate
          .toISOString()
          .split("T")[0]
    );

  if (duplicateDate) {
    throw new Error(
      "This examination date already exists"
    );
  }

  // =========================
  // VALIDATE SESSION TIMES
  // =========================

  const normalizedSessions =
    sessions.map((session) => ({
      startTime:
        session.startTime
          ?.trim(),

      endTime:
        session.endTime
          ?.trim(),
    }));

  for (
    const session of normalizedSessions
  ) {
    if (
      !session.startTime ||
      !session.endTime
    ) {
      throw new Error(
        "Each session must have a start time and end time"
      );
    }

    if (
      session.startTime >=
      session.endTime
    ) {
      throw new Error(
        "Session end time must be after start time"
      );
    }
  }

  // =========================
  // CHECK OVERLAPPING SESSIONS
  // =========================

  const timeToMinutes = (
    time
  ) => {
    const [hours, minutes] =
      time.split(":").map(Number);

    return (
      hours * 60 +
      minutes
    );
  };

  for (
    let i = 0;
    i <
    normalizedSessions.length;
    i++
  ) {
    const current =
      normalizedSessions[i];

    const currentStart =
      timeToMinutes(
        current.startTime
      );

    const currentEnd =
      timeToMinutes(
        current.endTime
      );

    for (
      let j = i + 1;
      j <
      normalizedSessions.length;
      j++
    ) {
      const other =
        normalizedSessions[j];

      const otherStart =
        timeToMinutes(
          other.startTime
        );

      const otherEnd =
        timeToMinutes(
          other.endTime
        );

      const overlaps =
        currentStart <
          otherEnd &&
        currentEnd >
          otherStart;

      if (overlaps) {
        throw new Error(
          `Session ${i + 1} overlaps with session ${j + 1}`
        );
      }
    }
  }

  // =========================
  // ADD DATE
  // =========================

  timetable.dates.push({
    date: normalizedDate,
    sessions:
      normalizedSessions,
  });

  await timetable.save();

  return timetable;
};


// ======================================================
// ASSIGN SUBJECT TO TIMETABLE CELL
// ======================================================

// ======================================================
// ASSIGN SUBJECT TO TIMETABLE CELL
// ======================================================

export const assignSubjectToTimetableCellService =
  async (
    timetableId,
    assignmentData
  ) => {

    const {
      classId,
      subjectId,
      dateId,
      sessionId,
    } = assignmentData;


    // =========================
    // VALIDATE INPUT
    // =========================

    if (!classId) {
      throw new Error(
        "Class is required"
      );
    }

    if (!subjectId) {
      throw new Error(
        "Subject is required"
      );
    }

    if (!dateId) {
      throw new Error(
        "Timetable date is required"
      );
    }

    if (!sessionId) {
      throw new Error(
        "Timetable session is required"
      );
    }


    // =========================
    // FIND MASTER TIMETABLE
    // =========================

    const timetable =
      await MasterTimetable.findOne({
        _id: timetableId,
        isDeleted: false,
      });

    if (!timetable) {
      throw new Error(
        "Master timetable not found"
      );
    }


    // =========================
    // FIND DATE
    // =========================

    const timetableDate =
      timetable.dates.id(
        dateId
      );

    if (!timetableDate) {
      throw new Error(
        "Timetable date not found"
      );
    }


    // =========================
    // FIND SESSION
    // =========================

    const timetableSession =
      timetableDate.sessions.id(
        sessionId
      );

    if (!timetableSession) {
      throw new Error(
        "Timetable session not found"
      );
    }


    // =========================
    // FIND CLASS
    // =========================

    const classData =
      await Class.findOne({
        _id: classId,

        institution:
          timetable.institutionId,

        isActive: true,
        isDeleted: false,
      })
        .populate(
          "programme",
          "programmeName programmeCode programmeType"
        )
        .populate(
          "batchId",
          "batchName admissionYear graduationYear currentYear status"
        );


    if (!classData) {
      throw new Error(
        "Class not found"
      );
    }


    // =========================
    // VALIDATE BATCH
    // =========================

    if (!classData.batchId) {
      throw new Error(
        "Batch is not assigned to this class"
      );
    }


    if (
      classData.batchId.status !==
      "Active"
    ) {
      throw new Error(
        "Batch is not active"
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
        "Programme structure not found"
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
          classData.batchId._id.toString()
      );


    if (!activeSemester) {
      throw new Error(
        "Current semester is not configured for this batch"
      );
    }


    // =========================
    // GET CURRENT STUDY YEAR
    // =========================

    const studyYear =
      Number(
        classData.batchId.currentYear
      );


    if (
      !Number.isInteger(
        studyYear
      ) ||
      studyYear < 1
    ) {
      throw new Error(
        "Current study year is not configured for this batch"
      );
    }


    // =========================
    // GET CURRENT SEMESTER
    // =========================

    const currentSemester =
      Number(
        activeSemester.semesterNumber
      );


    // =========================
    // VERIFY SEMESTER BELONGS
    // TO STUDY YEAR
    // =========================

    const yearStructure =
      programmeStructure.structure.find(
        (year) =>
          Number(
            year.studyYear
          ) === studyYear
      );


    if (!yearStructure) {
      throw new Error(
        `Study Year ${studyYear} not found in programme structure`
      );
    }


    const semesterExists =
      yearStructure.semesters.some(
        (semester) =>
          Number(
            semester.semesterNumber
          ) === currentSemester
      );


    if (!semesterExists) {
      throw new Error(
        `Semester ${currentSemester} does not belong to Study Year ${studyYear}`
      );
    }


    // =========================
    // VERIFY SUBJECT
    // BELONGS TO CURRENT
    // SEMESTER OF CLASS
    // =========================

    const subject =
      await Subject.findOne({

        _id: subjectId,

        programmeId:
          classData.programme._id,

        studyYear,

        semesterNumber:
          currentSemester,

        isDeleted: false,

        isActive: true,

      });


    if (!subject) {
      throw new Error(
        "This subject does not belong to the current semester of the selected class"
      );
    }


    // =========================
    // CHECK CELL ALREADY USED
    // =========================

    const existingCell =
      timetable.schedules.find(
        (schedule) =>

          schedule.classId.toString() ===
            classId.toString() &&

          schedule.dateId.toString() ===
            dateId.toString() &&

          schedule.sessionId.toString() ===
            sessionId.toString()
      );


    if (existingCell) {

      const error =
        new Error(
          "This timetable cell already has a subject assigned"
        );

      error.code =
        "CELL_ALREADY_ASSIGNED";

      error.details = {
        classId,
        dateId,
        sessionId,
        scheduleId:
          existingCell._id,
        subjectId:
          existingCell.subjectId,
      };

      throw error;
    }


    // =========================
    // CHECK SUBJECT ALREADY
    // USED FOR SAME CLASS
    // =========================

    const existingSubject =
      timetable.schedules.find(
        (schedule) =>

          schedule.classId.toString() ===
            classId.toString() &&

          schedule.subjectId.toString() ===
            subjectId.toString()
      );


    if (existingSubject) {

      // =========================
      // FIND EXISTING DATE
      // =========================

      const existingDate =
        timetable.dates.id(
          existingSubject.dateId
        );


      // =========================
      // FIND EXISTING SESSION
      // =========================

      const existingSession =
        existingDate?.sessions.id(
          existingSubject.sessionId
        );


      // =========================
      // FORMAT DATE
      // =========================

      const formattedDate =
        existingDate
          ? new Date(
              existingDate.date
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )
          : "Unknown date";


      // =========================
      // FORMAT SESSION
      // =========================

      const sessionTime =
        existingSession
          ? `${existingSession.startTime} - ${existingSession.endTime}`
          : "Unknown session";


      // =========================
      // DUPLICATE ERROR
      // =========================

      const error =
        new Error(
          `${subject.subjectName} is already scheduled for ${classData.programme.programmeName} on ${formattedDate}, ${sessionTime}`
        );


      error.code =
        "SUBJECT_ALREADY_SCHEDULED";


      error.details = {

        classId,

        subjectId,

        subjectName:
          subject.subjectName,

        subjectCode:
          subject.subjectCode,

        existingScheduleId:
          existingSubject._id,

        dateId:
          existingSubject.dateId,

        sessionId:
          existingSubject.sessionId,

        date:
          existingDate?.date ||
          null,

        startTime:
          existingSession?.startTime ||
          null,

        endTime:
          existingSession?.endTime ||
          null,
      };


      throw error;
    }


    // =========================
    // ADD SCHEDULE
    // =========================

    timetable.schedules.push({

      classId,

      subjectId,

      dateId,

      sessionId,

    });


    // =========================
    // SAVE
    // =========================
await timetable.save();

await timetable.populate(
  "schedules.subjectId",
  "subjectCode subjectName"
);

return timetable;
  };




  // ======================================================
// GET SUBJECTS FOR CLASS
// ======================================================

// ======================================================
// GET CURRENT SEMESTER SUBJECTS FOR CLASS
// ======================================================

export const getSubjectsForClassService = async (
  timetableId,
  classId
) => {

  // =========================
  // FIND TIMETABLE
  // =========================

  const timetable =
    await MasterTimetable.findOne({
      _id: timetableId,
      isDeleted: false,
    });

  if (!timetable) {
    throw new Error(
      "Master timetable not found"
    );
  }

  // =========================
  // FIND CLASS
  // =========================

  const classData =
    await Class.findOne({
      _id: classId,

      institution:
        timetable.institutionId,

      isActive: true,
      isDeleted: false,

    })
      .populate(
        "programme",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );

  if (!classData) {
    throw new Error(
      "Class not found"
    );
  }

  // =========================
  // VALIDATE BATCH
  // =========================

  if (!classData.batchId) {
    throw new Error(
      "Batch is not assigned to this class"
    );
  }

  const batch =
    classData.batchId;

  if (
    batch.status !== "Active"
  ) {
    throw new Error(
      "Batch is not active"
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
      "Programme structure not found"
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
      "Current semester is not configured for this batch"
    );
  }

  // =========================
  // CURRENT STUDY YEAR
  // =========================

  const studyYear =
    Number(batch.currentYear);

  if (
    !studyYear ||
    studyYear < 1
  ) {
    throw new Error(
      "Current study year is not configured for this batch"
    );
  }

  // =========================
  // CURRENT SEMESTER
  // =========================

  const currentSemester =
    Number(
      activeSemester.semesterNumber
    );

  // =========================
  // VALIDATE SEMESTER
  // BELONGS TO STUDY YEAR
  // =========================

  const yearStructure =
    programmeStructure.structure.find(
      (year) =>
        Number(year.studyYear) ===
        studyYear
    );

  if (!yearStructure) {
    throw new Error(
      `Study Year ${studyYear} not found in programme structure`
    );
  }

  const semesterExists =
    yearStructure.semesters.some(
      (semester) =>
        Number(
          semester.semesterNumber
        ) === currentSemester
    );

  if (!semesterExists) {
    throw new Error(
      `Semester ${currentSemester} does not belong to Study Year ${studyYear}`
    );
  }

  // =========================
  // FETCH SUBJECTS
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
      })
      .lean();

  // =========================
  // FIND ALREADY SCHEDULED
  // SUBJECTS FOR THIS CLASS
  // =========================

  const classSchedules =
    timetable.schedules.filter(
      (schedule) =>
        schedule.classId.toString() ===
        classId.toString()
    );

  // =========================
  // PREPARE SUBJECT RESPONSE
  // =========================

  const formattedSubjects =
    subjects.map(
      (subject) => {

        const existingSchedule =
          classSchedules.find(
            (schedule) =>
              schedule.subjectId.toString() ===
              subject._id.toString()
          );

        // =========================
        // NOT SCHEDULED
        // =========================

        if (!existingSchedule) {

          return {
            _id:
              subject._id,

            subjectName:
              subject.subjectName,

            subjectCode:
              subject.subjectCode,

            subjectType:
              subject.subjectType,

            subjectScore:
              subject.subjectScore,

            isScheduled:
              false,
          };
        }

        // =========================
        // FIND DATE
        // =========================

        const existingDate =
          timetable.dates.id(
            existingSchedule.dateId
          );

        // =========================
        // FIND SESSION
        // =========================

        const existingSession =
          existingDate?.sessions.id(
            existingSchedule.sessionId
          );

        // =========================
        // SCHEDULED
        // =========================

        return {
          _id:
            subject._id,

          subjectName:
            subject.subjectName,

          subjectCode:
            subject.subjectCode,

          subjectType:
            subject.subjectType,

          subjectScore:
            subject.subjectScore,

          isScheduled:
            true,

          scheduledAt: {

            dateId:
              existingSchedule.dateId,

            sessionId:
              existingSchedule.sessionId,

            date:
              existingDate?.date ||
              null,

            startTime:
              existingSession?.startTime ||
              null,

            endTime:
              existingSession?.endTime ||
              null,
          },
        };
      }
    );

  // =========================
  // RETURN
  // =========================

  return {
    classId:
      classData._id,

    programme:
      classData.programme,

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

    subjects:
      formattedSubjects,
  };
};




// ======================================================
// UPDATE TIMETABLE DATE
// ======================================================

// ======================================================
// UPDATE TIMETABLE DATE
// ======================================================

export const updateTimetableDateService = async (
  timetableId,
  dateId,
  updateData
) => {

  const {
    date,
    sessions,
  } = updateData;


  // =========================
  // VALIDATE INPUT
  // =========================

  if (!date) {
    throw new Error(
      "Examination date is required"
    );
  }

  if (
    !Array.isArray(sessions) ||
    sessions.length === 0
  ) {
    throw new Error(
      "At least one examination session is required"
    );
  }


  // =========================
  // FIND TIMETABLE
  // =========================

  const timetable =
    await MasterTimetable.findOne({
      _id: timetableId,
      isDeleted: false,
    });

  if (!timetable) {
    throw new Error(
      "Master timetable not found"
    );
  }


  // =========================
  // FIND DATE
  // =========================

  const timetableDate =
    timetable.dates.id(
      dateId
    );

  if (!timetableDate) {
    throw new Error(
      "Timetable date not found"
    );
  }


  // =========================
  // CHECK EXISTING ASSIGNMENTS
  // =========================

  const existingAssignments =
    timetable.schedules.filter(
      (schedule) =>
        schedule.dateId.toString() ===
        dateId.toString()
    );


  if (
    existingAssignments.length > 0
  ) {

    const error =
      new Error(
        `Cannot update this date because ${existingAssignments.length} examination assignment(s) are already scheduled on it.`
      );

    error.code =
      "DATE_HAS_ASSIGNMENTS";

    error.details = {
      dateId,
      assignmentCount:
        existingAssignments.length,
    };

    throw error;
  }


  // =========================
  // NORMALIZE SESSIONS
  // =========================

  const normalizedSessions =
    sessions.map(
      (session) => {

        if (
          !session.startTime ||
          !session.endTime
        ) {
          throw new Error(
            "Each session must have a start time and end time"
          );
        }

        return {
          startTime:
            session.startTime.trim(),

          endTime:
            session.endTime.trim(),
        };
      }
    );


  // =========================
  // VALIDATE SESSION TIMES
  // =========================

  for (
    const session
    of normalizedSessions
  ) {

    const start =
      session.startTime;

    const end =
      session.endTime;


    if (
      start >= end
    ) {
      throw new Error(
        `Invalid session time: ${start} - ${end}`
      );
    }
  }


  // =========================
  // CHECK DUPLICATE SESSIONS
  // =========================

  const sessionKeys =
    normalizedSessions.map(
      (session) =>
        `${session.startTime}-${session.endTime}`
    );


  const uniqueSessionKeys =
    new Set(
      sessionKeys
    );


  if (
    uniqueSessionKeys.size !==
    sessionKeys.length
  ) {
    throw new Error(
      "Duplicate examination sessions are not allowed"
    );
  }


  // =========================
  // UPDATE DATE
  // =========================

  timetableDate.date =
    date;

  timetableDate.sessions =
    normalizedSessions;


  // =========================
  // SAVE
  // =========================

  await timetable.save();


  // =========================
  // RETURN
  // =========================

  return timetable;
};



// ======================================================
// DELETE TIMETABLE DATE
// ======================================================

export const deleteTimetableDateService =
  async (
    timetableId,
    dateId
  ) => {

    const timetable =
      await MasterTimetable.findOne({
        _id: timetableId,
        isDeleted: false,
      });

    if (!timetable) {
      throw new Error(
        "Master timetable not found"
      );
    }

    const timetableDate =
      timetable.dates.id(dateId);

    if (!timetableDate) {
      throw new Error(
        "Timetable date not found"
      );
    }

    // =========================
    // CHECK ASSIGNMENTS
    // =========================

    const assignments =
      timetable.schedules.filter(
        (schedule) =>
          schedule.dateId.toString() ===
          dateId.toString()
      );

    if (assignments.length > 0) {

      const error =
        new Error(
          `Cannot delete this date because ${assignments.length} examination assignment(s) are already scheduled on it.`
        );

      error.code =
        "DATE_HAS_ASSIGNMENTS";

      error.details = {
        dateId,
        assignmentCount:
          assignments.length,
      };

      throw error;
    }

    // =========================
    // DELETE DATE
    // =========================

schedule.deleteOne();

await timetable.save();

await timetable.populate(
  "schedules.subjectId",
  "subjectCode subjectName"
);

return timetable;
  };





  // ======================================================
// CHANGE SUBJECT IN CELL
// ======================================================

// ======================================================
// CHANGE SUBJECT IN TIMETABLE CELL
// ======================================================

export const changeSubjectInCellService =
  async (
    timetableId,
    scheduleId,
    newSubjectId
  ) => {

    // =========================
    // VALIDATE INPUT
    // =========================

    if (!newSubjectId) {
      throw new Error(
        "New subject is required"
      );
    }


    // =========================
    // FIND TIMETABLE
    // =========================

    const timetable =
      await MasterTimetable.findOne({
        _id: timetableId,
        isDeleted: false,
      });

    if (!timetable) {
      throw new Error(
        "Master timetable not found"
      );
    }


    // =========================
    // FIND SCHEDULE
    // =========================

    const schedule =
      timetable.schedules.id(
        scheduleId
      );

    if (!schedule) {
      throw new Error(
        "Timetable assignment not found"
      );
    }


    // =========================
    // FIND CLASS
    // =========================

    const classData =
      await Class.findOne({
        _id: schedule.classId,

        institution:
          timetable.institutionId,

        isActive: true,

        isDeleted: false,
      })
        .populate(
          "programme",
          "programmeName programmeCode programmeType"
        )
        .populate(
          "batchId",
          "batchName admissionYear graduationYear currentYear status"
        );


    if (!classData) {
      throw new Error(
        "Class not found"
      );
    }


    // =========================
    // VALIDATE BATCH
    // =========================

    if (!classData.batchId) {
      throw new Error(
        "Batch is not assigned to this class"
      );
    }


    if (
      classData.batchId.status !==
      "Active"
    ) {
      throw new Error(
        "Batch is not active"
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
        "Programme structure not found"
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
          classData.batchId._id.toString()
      );


    if (!activeSemester) {
      throw new Error(
        "Current semester is not configured for this batch"
      );
    }


    // =========================
    // GET CURRENT STUDY YEAR
    // =========================

    const studyYear =
      Number(
        classData.batchId.currentYear
      );


    if (
      !Number.isInteger(
        studyYear
      ) ||
      studyYear < 1
    ) {
      throw new Error(
        "Current study year is not configured for this batch"
      );
    }


    // =========================
    // GET CURRENT SEMESTER
    // =========================

    const currentSemester =
      Number(
        activeSemester.semesterNumber
      );


    // =========================
    // VERIFY SEMESTER BELONGS
    // TO STUDY YEAR
    // =========================

    const yearStructure =
      programmeStructure.structure.find(
        (year) =>
          Number(
            year.studyYear
          ) === studyYear
      );


    if (!yearStructure) {
      throw new Error(
        `Study Year ${studyYear} not found in programme structure`
      );
    }


    const semesterExists =
      yearStructure.semesters.some(
        (semester) =>
          Number(
            semester.semesterNumber
          ) === currentSemester
      );


    if (!semesterExists) {
      throw new Error(
        `Semester ${currentSemester} does not belong to Study Year ${studyYear}`
      );
    }


    // =========================
    // VERIFY NEW SUBJECT
    // BELONGS TO CURRENT
    // SEMESTER OF CLASS
    // =========================

    const newSubject =
      await Subject.findOne({

        _id: newSubjectId,

        programmeId:
          classData.programme._id,

        studyYear,

        semesterNumber:
          currentSemester,

        isDeleted: false,

        isActive: true,

      });


    if (!newSubject) {
      throw new Error(
        "This subject does not belong to the current semester of the selected class"
      );
    }


    // =========================
    // CHECK DUPLICATE SUBJECT
    // IN SAME CLASS
    // =========================

    const duplicate =
      timetable.schedules.find(
        (item) =>

          item._id.toString() !==
            scheduleId.toString() &&

          item.classId.toString() ===
            schedule.classId.toString() &&

          item.subjectId.toString() ===
            newSubjectId.toString()
      );


    if (duplicate) {

      const existingDate =
        timetable.dates.id(
          duplicate.dateId
        );


      const existingSession =
        existingDate?.sessions.id(
          duplicate.sessionId
        );


      const formattedDate =
        existingDate
          ? new Date(
              existingDate.date
            ).toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )
          : "Unknown date";


      const sessionTime =
        existingSession
          ? `${existingSession.startTime} - ${existingSession.endTime}`
          : "Unknown session";


      const error =
        new Error(
          `${newSubject.subjectName} is already scheduled for ${classData.programme.programmeName} on ${formattedDate}, ${sessionTime}`
        );


      error.code =
        "SUBJECT_ALREADY_SCHEDULED";


      error.details = {

        classId:
          schedule.classId,

        subjectId:
          newSubjectId,

        subjectName:
          newSubject.subjectName,

        subjectCode:
          newSubject.subjectCode,

        existingScheduleId:
          duplicate._id,

        dateId:
          duplicate.dateId,

        sessionId:
          duplicate.sessionId,

        date:
          existingDate?.date ||
          null,

        startTime:
          existingSession?.startTime ||
          null,

        endTime:
          existingSession?.endTime ||
          null,
      };


      throw error;
    }


    // =========================
    // UPDATE SUBJECT
    // =========================

    schedule.subjectId =
      newSubjectId;


    // =========================
    // SAVE
    // =========================

await timetable.save();

await timetable.populate(
  "schedules.subjectId",
  "subjectCode subjectName"
);

return timetable;
  };




  // ======================================================
// REMOVE SUBJECT FROM CELL
// ======================================================

export const removeSubjectFromCellService =
  async (
    timetableId,
    scheduleId
  ) => {

    const timetable =
      await MasterTimetable.findOne({
        _id: timetableId,
        isDeleted: false,
      });

    if (!timetable) {
      throw new Error(
        "Master timetable not found"
      );
    }

    const schedule =
      timetable.schedules.id(
        scheduleId
      );

    if (!schedule) {
      throw new Error(
        "Timetable assignment not found"
      );
    }

    schedule.deleteOne();

    await timetable.save();

    return timetable;
  };



