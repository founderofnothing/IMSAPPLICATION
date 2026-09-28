import {
    createAttendanceService,
    updateAttendanceService,
    getAttendanceService,
    getAttendanceStatusService,
    deleteAttendanceService,
  getStudentAttendanceService,
} from "./service.js";




// create attendance
export const createAttendance =
  async (req, res) => {
    try {

      const attendance =
        await createAttendanceService(
          req.body,
          req.user
        );

      return res.status(201).json({
        success: true,

        message:
          "Attendance taken successfully.",

        data:
          attendance,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   update attendance
export const updateAttendance =
  async (req, res) => {
    try {

      const attendance =
        await updateAttendanceService(
          req.body,
          req.user
        );

      return res.status(200).json({
        success: true,

        message:
          "Attendance updated successfully.",

        data:
          attendance,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };
//   get attendance by class id
// ==================== GET ATTENDANCE ====================
export const getAttendance =
  async (req, res) => {

    try {

      const {

        classId,

        attendanceDate,

        dayOrder,

        periodNumber,

      } = req.query;

      const attendance =
        await getAttendanceService(

          classId,

          attendanceDate,

          Number(dayOrder),

          Number(periodNumber)

        );

      return res.status(200).json({

        success: true,

        message:
          "Attendance fetched successfully.",

        data:
          attendance,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // ==================== GET ATTENDANCE STATUS ====================

export const getAttendanceStatus =
  async (req, res) => {

    try {

      const {

        classId,

        attendanceDate,

      } = req.query;

      const attendanceStatus =
        await getAttendanceStatusService(

          classId,

          attendanceDate

        );

      return res.status(200).json({

        success: true,

        message:
          "Attendance status fetched successfully.",

        count:
          attendanceStatus.length,

        data:
          attendanceStatus,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
//   delete attandance
export const deleteAttendance =
  async (req, res) => {
    try {

      const attendance =
        await deleteAttendanceService(
          req.params.id
        );

      return res.status(200).json({
        success: true,

        message:
          "Attendance deleted successfully.",

        data: attendance,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };

  // ======================================================
// GET STUDENT ATTENDANCE
// ======================================================


// ======================================================
// GET STUDENT ATTENDANCE
// ======================================================

export const getStudentAttendance =
  async (
    req,
    res
  ) => {

    try {

      const attendance =
        await getStudentAttendanceService(
          req.params.studentId
        );


      return res.status(200).json({

        success: true,

        message:
          "Student attendance fetched successfully.",

        data:
          attendance,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };