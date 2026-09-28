import Attendance from "./model/attendance.model.js";
import mongoose from "mongoose";
import Class from "../class/class.model.js";
import Timetable from "../timetable/model/timetable.model.js";








// ==================== CREATE ATTENDANCE ====================
export const createAttendanceService =
  async (
    attendanceData,
    user
  ) => {

    const {

      classId,

      attendanceDate,

      dayOrder,

      periodNumber,

      students,

    } = attendanceData;

    // ==================== VALIDATE CLASS ====================

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {

      throw new Error(
        "Invalid class ID."
      );

    }

    // ==================== CHECK CLASS ====================

    const classData =
      await Class.findById(
        classId
      );

    if (!classData) {

      throw new Error(
        "Class not found."
      );

    }

    // ==================== FETCH TIMETABLE ====================

    const timetable =
      await Timetable.findOne({

        classId,

      });

    if (!timetable) {

      throw new Error(
        "Timetable not found."
      );

    }

    // ==================== FIND DAY ====================

    const selectedDay =
      timetable.timetable.find(

        (day) =>

          day.dayOrder ===
          dayOrder

      );

    if (!selectedDay) {

      throw new Error(
        "Invalid day order."
      );

    }

    // ==================== FIND PERIOD ====================

    const selectedPeriod =
      selectedDay.periods.find(

        (period) =>

          period.periodNumber ===
          periodNumber

      );

    if (!selectedPeriod) {

      throw new Error(
        "Invalid period."
      );

    }

    // ==================== SUBJECT ====================

    const subjectId =
      selectedPeriod.subjectId;

    // ==================== CHECK DUPLICATE ====================

    const existingAttendance =
      await Attendance.findOne({

        classId,

        attendanceDate:
          new Date(
            attendanceDate
          ),

        dayOrder,

        periodNumber,

      })

        .populate(
          "facultyId",
          "fullName"
        )

        .populate(
          "subjectId",
          "subjectName"
        );

    if (
      existingAttendance
    ) {

      throw new Error(

        `Attendance already taken by ${existingAttendance.facultyId.fullName} for ${existingAttendance.subjectId.subjectName}.`

      );

    }

    // ==================== CREATE ATTENDANCE ====================

    const attendance =
      await Attendance.create({

        institutionId:
          user.institution,

        departmentId:
          user.department,

        classId,

        subjectId,

        facultyId:
          user.userId,

        attendanceDate,

        dayOrder,

        periodNumber,

        students,

      });

    // ==================== RETURN ====================

  await attendance.populate(
  "facultyId",
  "fullName"
);

return attendance;

  };
// ==================== UPDATE ATTENDANCE ====================
export const updateAttendanceService =
  async (
    attendanceData,
    user
  ) => {

    const {

      classId,

      attendanceDate,

      dayOrder,

      periodNumber,

      students,

    } = attendanceData;

    // ==================== FIND ATTENDANCE ====================

    const attendance =
      await Attendance.findOne({

        classId,

        attendanceDate:
          new Date(
            attendanceDate
          ),

        dayOrder,

        periodNumber,

      });

    if (!attendance) {

      throw new Error(
        "Attendance not found."
      );

    }

    // ==================== UPDATE STUDENTS ====================

    attendance.students =
      students;

    // ==================== UPDATE AUDIT ====================

    attendance.modifiedBy =
      user.userId;

    attendance.modifiedAt =
      new Date();

    await attendance.save();

    // ==================== RETURN ====================

    return attendance;

  };
// ==================== GET ATTENDANCE ====================

export const getAttendanceService =
  async (
    classId,
    attendanceDate,
    dayOrder,
    periodNumber
  ) => {

    // ==================== VALIDATE CLASS ID ====================

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {

      throw new Error(
        "Invalid class ID."
      );

    }

    // ==================== DATE RANGE ====================

    const startDate =
      new Date(attendanceDate);

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const endDate =
      new Date(attendanceDate);

    endDate.setHours(
      23,
      59,
      59,
      999
    );

    // ==================== FETCH ATTENDANCE ====================

    const attendance =
      await Attendance.findOne({

        classId,

        attendanceDate: {

          $gte: startDate,

          $lte: endDate,

        },

        dayOrder,

        periodNumber,

      })

        .populate(
          "subjectId",
          "subjectName subjectCode"
        )

        .populate(
          "facultyId",
          "fullName email"
        )

        .populate(
          "modifiedBy",
          "fullName"
        )

        .populate(
          "students.studentId",
          "studentName registerNumber"
        );

    // ==================== VALIDATE ====================

    if (!attendance) {

      throw new Error(
        "Attendance not found."
      );

    }

    // ==================== RETURN ====================

    return attendance;

  };
// ==================== DELETE ATTENDANCE ====================
export const deleteAttendanceService =
  async (attendanceId) => {

    // ==================== VALIDATE ID ====================

    if (
      !mongoose.Types.ObjectId.isValid(
        attendanceId
      )
    ) {

      throw new Error(
        "Invalid attendance ID."
      );

    }

    // ==================== DELETE ATTENDANCE ====================

    const attendance =
      await Attendance.findOneAndDelete({

        _id: attendanceId,

      });

    if (!attendance) {

      throw new Error(
        "Attendance not found."
      );

    }

    // ==================== RETURN ====================

    return attendance;

  };


  // ==================== GET ATTENDANCE STATUS ====================
export const getAttendanceStatusService =
  async (
    classId,
    attendanceDate
  ) => {

    // ==================== VALIDATE CLASS ID ====================

    if (
      !mongoose.Types.ObjectId.isValid(
        classId
      )
    ) {

      throw new Error(
        "Invalid class ID."
      );

    }

    // ==================== DATE RANGE ====================

    const startDate =
      new Date(attendanceDate);

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    const endDate =
      new Date(attendanceDate);

    endDate.setHours(
      23,
      59,
      59,
      999
    );

    // ==================== FETCH ATTENDANCE ====================

    const attendance =
      await Attendance.find({

        classId,

        attendanceDate: {

          $gte: startDate,

          $lte: endDate,

        },

      })

        .populate(
          "subjectId",
          "subjectName subjectCode"
        )

        .populate(
          "facultyId",
          "fullName"
        )

        .sort({

          dayOrder: 1,

          periodNumber: 1,

        });

    // ==================== FORMAT RESPONSE ====================

    return attendance.map(

      (item) => ({

        attendanceId:
          item._id,

        dayOrder:
          item.dayOrder,

        periodNumber:
          item.periodNumber,

        completed: true,

        subjectId:
          item.subjectId?._id,

        subjectName:
          item.subjectId?.subjectName,

        subjectCode:
          item.subjectId?.subjectCode,

        facultyId:
          item.facultyId?._id,

        facultyName:
          item.facultyId?.fullName,

      })

    );

  };


  // ======================================================
// GET STUDENT ATTENDANCE
// Day-wise + Period-wise
// ======================================================

export const getStudentAttendanceService = async (
  studentId
) => {

  // ======================================================
  // VALIDATE STUDENT ID
  // ======================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      studentId
    )
  ) {
    throw new Error(
      "Invalid student ID."
    );
  }


  // ======================================================
  // FIND STUDENT
  // ======================================================

  const student =
    await mongoose.model("Student")
      .findOne({
        _id: studentId,
        isDeleted: false,
      })
      .select(
        "studentName registerNumber classId"
      )
      .lean();


  if (!student) {

    throw new Error(
      "Student not found."
    );

  }


  // ======================================================
  // STUDENT MUST HAVE CLASS
  // ======================================================

  if (!student.classId) {

    throw new Error(
      "Student is not assigned to a class."
    );

  }


  // ======================================================
  // FIND TIMETABLE
  // ======================================================

  const timetable =
    await Timetable.findOne({
      classId:
        student.classId,
    })
      .lean();


  if (!timetable) {

    throw new Error(
      "Timetable not found for this class."
    );

  }


  // ======================================================
  // FETCH ATTENDANCE RECORDS
  // ======================================================

  const attendanceRecords =
    await Attendance.find({

      classId:
        student.classId,

      "students.studentId":
        studentId,

    })
      .populate(
        "subjectId",
        "subjectName subjectCode"
      )
      .sort({
        attendanceDate: -1,
        dayOrder: 1,
        periodNumber: 1,
      })
      .lean();


  // ======================================================
  // BUILD ATTENDANCE MAP
  // ======================================================

  const attendanceMap =
    new Map();


  attendanceRecords.forEach(
    (attendance) => {

      const dateKey =
        new Date(
          attendance.attendanceDate
        )
          .toISOString()
          .split("T")[0];


      const key =
        `${dateKey}_${attendance.periodNumber}`;


      const studentRecord =
        attendance.students.find(
          (item) =>
            item.studentId?.toString() ===
            studentId.toString()
        );


      if (!studentRecord) {
        return;
      }


      attendanceMap.set(
        key,
        {

          attendanceId:
            attendance._id,

          date:
            dateKey,

          dayOrder:
            attendance.dayOrder,

          periodNumber:
            attendance.periodNumber,

          subjectId:
            attendance.subjectId?._id,

          subjectName:
            attendance.subjectId
              ?.subjectName,

          subjectCode:
            attendance.subjectId
              ?.subjectCode,

          status:
            studentRecord.status,

          remarks:
            studentRecord.remarks || "",

        }
      );

    }
  );


  // ======================================================
  // BUILD DAY-WISE ATTENDANCE
  // ======================================================

  const attendanceByDate =
    new Map();


  // ======================================================
  // ATTENDANCE DATE RECORDS
  // ======================================================

  attendanceRecords.forEach(
    (attendance) => {

      const dateKey =
        new Date(
          attendance.attendanceDate
        )
          .toISOString()
          .split("T")[0];


      if (
        !attendanceByDate.has(
          dateKey
        )
      ) {

        attendanceByDate.set(
          dateKey,
          {

            date:
              dateKey,

            dayOrder:
              attendance.dayOrder,

            periods:
              [],

          }
        );

      }

    }
  );


  // ======================================================
  // ADD RECORDED ATTENDANCE TO DATE
  // ======================================================

  attendanceMap.forEach(
    (period) => {

      const day =
        attendanceByDate.get(
          period.date
        );


      if (!day) {
        return;
      }


      day.periods.push(
        period
      );

    }
  );


  // ======================================================
  // SORT PERIODS
  // ======================================================

  attendanceByDate.forEach(
    (day) => {

      day.periods.sort(
        (a, b) =>
          a.periodNumber -
          b.periodNumber
      );

    }
  );


  // ======================================================
  // DAY NAME
  // ======================================================

  const dayNames = {

    1: "Monday",

    2: "Tuesday",

    3: "Wednesday",

    4: "Thursday",

    5: "Friday",

    6: "Saturday",

  };


  // ======================================================
  // ADD DAY NAME
  // ======================================================

  const attendance =
    Array.from(
      attendanceByDate.values()
    )
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .map(
        (day) => ({

          ...day,

          dayName:
            dayNames[
              day.dayOrder
            ] || "Unknown",

        })
      );


  // ======================================================
  // SUMMARY
  // ======================================================

  let totalHours = 0;

  let present = 0;

  let absent = 0;


  attendance.forEach(
    (day) => {

      day.periods.forEach(
        (period) => {

          if (
            period.status ===
            "present"
          ) {

            present++;

            totalHours++;

          }

          else if (
            period.status ===
            "absent"
          ) {

            absent++;

            totalHours++;

          }

        }
      );

    }
  );


  const percentage =
    totalHours > 0
      ? Number(
          (
            (present /
              totalHours) *
            100
          ).toFixed(2)
        )
      : 0;


  // ======================================================
  // SUBJECT-WISE SUMMARY
  // ======================================================

  const subjectMap =
    new Map();


  attendance.forEach(
    (day) => {

      day.periods.forEach(
        (period) => {

          if (
            !period.subjectId
          ) {
            return;
          }


          const subjectKey =
            period.subjectId.toString();


          if (
            !subjectMap.has(
              subjectKey
            )
          ) {

            subjectMap.set(
              subjectKey,
              {

                subjectId:
                  period.subjectId,

                subjectName:
                  period.subjectName,

                subjectCode:
                  period.subjectCode,

                total: 0,

                present: 0,

                absent: 0,

              }
            );

          }


          const subject =
            subjectMap.get(
              subjectKey
            );


          subject.total++;


          if (
            period.status ===
            "present"
          ) {

            subject.present++;

          }


          if (
            period.status ===
            "absent"
          ) {

            subject.absent++;

          }

        }
      );

    }
  );


  const subjects =
    Array.from(
      subjectMap.values()
    )
      .map(
        (subject) => ({

          ...subject,

          percentage:
            subject.total > 0
              ? Number(
                  (
                    (subject.present /
                      subject.total) *
                    100
                  ).toFixed(2)
                )
              : 0,

        })
      )
      .sort(
        (a, b) =>
          a.subjectCode
            ?.localeCompare(
              b.subjectCode
            )
      );


  // ======================================================
  // RETURN
  // ======================================================

  return {

    student: {

      studentId:
        student._id,

      studentName:
        student.studentName,

      registerNumber:
        student.registerNumber,

      classId:
        student.classId,

    },


    summary: {

      totalHours,

      present,

      absent,

      percentage,

    },


    subjects,


    attendance,

  };

};