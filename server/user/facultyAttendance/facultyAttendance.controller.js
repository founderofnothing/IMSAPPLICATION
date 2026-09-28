import mongoose from "mongoose";

import {
  bulkUploadFacultyAttendanceService,
  bulkUpdateFacultyAttendanceService,
  getSingleFacultyAttendanceService,
} from "./facultyAttendance.service.js";

// ============================================================
// BULK UPLOAD FACULTY ATTENDANCE
// ============================================================

export const bulkUploadFacultyAttendance =
  async (
    req,
    res
  ) => {

    try {

      // ======================================================
      // CHECK FILE
      // ======================================================

      if (!req.file) {

        return res.status(400).json({
          success: false,

          code:
            "EXCEL_FILE_REQUIRED",

          message:
            "Please upload an Excel file.",
        });
      }


      // ======================================================
      // GET INSTITUTION FROM JWT
      // ======================================================

      const institutionId =
        req.user?.institution;


      if (!institutionId) {

        return res.status(400).json({
          success: false,

          code:
            "INSTITUTION_REQUIRED",

          message:
            "Institution not found in user account.",
        });
      }


      // ======================================================
      // CALL SERVICE
      // ======================================================

      const result =
        await bulkUploadFacultyAttendanceService(
          req.file,
          institutionId
        );


      // ======================================================
      // NOTHING INSERTED
      // ======================================================

      if (
        !result.insertedCount ||
        result.insertedCount <= 0
      ) {

        return res.status(422).json({

          ...result,

          success: false,

          code:
            "NO_ATTENDANCE_INSERTED",

          message:
            result.failedCount > 0
              ? "No faculty attendance records were imported. Please correct the rejected data and try again."
              : "No faculty attendance records were imported.",
        });
      }


      // ======================================================
      // SUCCESS / PARTIAL SUCCESS
      // ======================================================

      return res.status(201).json({

        ...result,

        success: true,

        message:
          result.failedCount > 0
            ? "Faculty attendance uploaded with some rejected records."
            : "Faculty attendance uploaded successfully.",
      });

    } catch (error) {

      console.error(
        "BULK FACULTY ATTENDANCE UPLOAD ERROR:",
        error
      );


      // ======================================================
      // EXCEL HEADER ERROR
      // ======================================================

      if (
        error.code ===
        "EXCEL_HEADER_VALIDATION_FAILED"
      ) {

        return res.status(400).json({

          success: false,

          code:
            error.code,

          message:
            error.message,

          sheetName:
            error.details
              ?.sheetName ?? null,

          totalColumns:
            error.details
              ?.totalColumns ?? 0,

          errors:
            error.details
              ?.errors ?? [],

          warnings:
            error.details
              ?.warnings ?? [],
        });
      }


      // ======================================================
      // EMPTY EXCEL
      // ======================================================

      if (
        error.code ===
        "EXCEL_EMPTY"
      ) {

        return res.status(400).json({

          success: false,

          code:
            error.code,

          message:
            error.message,
        });
      }


      // ======================================================
      // NO EMPLOYEE IDs
      // ======================================================

      if (
        error.code ===
        "NO_EMPLOYEE_IDS"
      ) {

        return res.status(422).json({

          success: false,

          code:
            error.code,

          message:
            error.message,
        });
      }


      // ======================================================
      // MONGOOSE VALIDATION
      // ======================================================

      if (
        error.name ===
        "ValidationError"
      ) {

        const errors =
          Object.values(
            error.errors ?? {}
          ).map(
            (validationError) => ({
              field:
                validationError.path ??
                null,

              receivedValue:
                validationError.value ??
                null,

              reason:
                validationError.message,
            })
          );


        return res.status(400).json({

          success: false,

          code:
            "FACULTY_ATTENDANCE_VALIDATION_FAILED",

          message:
            "Faculty attendance data failed database validation.",

          errors,
        });
      }


      // ======================================================
      // INVALID OBJECT ID
      // ======================================================

      if (
        error.name ===
        "CastError"
      ) {

        return res.status(400).json({

          success: false,

          code:
            "INVALID_REFERENCE_ID",

          message:
            "One of the faculty references is invalid.",

          field:
            error.path ??
            null,

          receivedValue:
            error.value ??
            null,
        });
      }


      // ======================================================
      // DUPLICATE KEY
      // ======================================================

      if (
        error.code === 11000
      ) {

        return res.status(409).json({

          success: false,

          code:
            "DUPLICATE_FACULTY_ATTENDANCE",

          message:
            "Attendance already exists for this faculty and date.",

          field:
            error.keyPattern ??
            null,

          receivedValue:
            error.keyValue ??
            null,
        });
      }


      // ======================================================
      // GENERAL ERROR
      // ======================================================

      return res.status(400).json({

        success: false,

        code:
          error.code ??
          "FACULTY_ATTENDANCE_UPLOAD_FAILED",

        message:
          error.message ||
          "Faculty attendance upload failed.",
      });
    }
  };


// ============================================================
// BULK UPDATE FACULTY ATTENDANCE
// ============================================================

export const bulkUpdateFacultyAttendance =
  async (
    req,
    res
  ) => {

    try {

      // ======================================================
      // CHECK FILE
      // ======================================================

      if (!req.file) {

        return res.status(400).json({

          success: false,

          code:
            "EXCEL_FILE_REQUIRED",

          message:
            "Please upload an Excel file.",
        });
      }


      // ======================================================
      // GET INSTITUTION
      // ======================================================

      const institutionId =
        req.user?.institution;


      if (!institutionId) {

        return res.status(400).json({

          success: false,

          code:
            "INSTITUTION_REQUIRED",

          message:
            "Institution not found in user account.",
        });
      }


      // ======================================================
      // SERVICE
      // ======================================================

      const result =
        await bulkUpdateFacultyAttendanceService(
          req.file,
          institutionId
        );


      // ======================================================
      // RESPONSE
      // ======================================================

      return res.status(200).json({

        ...result,

        message:
          result.failedCount > 0
            ? "Faculty attendance updated with some rejected records."
            : "Faculty attendance updated successfully.",
      });

    } catch (error) {

      console.error(
        "BULK FACULTY ATTENDANCE UPDATE ERROR:",
        error
      );


      return res.status(400).json({

        success: false,

        code:
          error.code ??
          "FACULTY_ATTENDANCE_UPDATE_FAILED",

        message:
          error.message ||
          "Faculty attendance update failed.",
      });
    }
  };




export const getSingleFacultyAttendance = async (
  req,
  res
) => {
  try {
    const { facultyId } = req.params;

    const institutionId =
      req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in user account.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        facultyId
      )
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_FACULTY_ID",
        message:
          "Invalid faculty ID.",
      });
    }

    const result =
      await getSingleFacultyAttendanceService(
        facultyId,
        institutionId
      );

    if (!result.faculty) {
      return res.status(404).json({
        success: false,
        code: "FACULTY_ATTENDANCE_NOT_FOUND",
        message:
          "No attendance records found for this faculty.",
        faculty: null,
        attendance: [],
        totalRecords: 0,
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error(
      "GET SINGLE FACULTY ATTENDANCE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      code:
        error.code ??
        "FACULTY_ATTENDANCE_FETCH_FAILED",
      message:
        error.message ||
        "Failed to fetch faculty attendance.",
    });
  }
};