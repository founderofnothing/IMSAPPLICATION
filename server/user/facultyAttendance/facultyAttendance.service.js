import XLSX from "xlsx";
import mongoose from "mongoose";

import TeachingFaculty from "../models/teachingFaculty.model.js";
import FacultyAttendance from "../models/FacultyAttendance.js";


// ============================================================
// HELPERS
// ============================================================

const normalizeHeader = (value) => {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};


const normalizeEmployeeId = (value) => {
  return String(value ?? "")
    .trim()
    .toUpperCase();
};


const normalizeAttendanceStatus = (value) => {
  const status = String(value ?? "")
    .trim()
    .toUpperCase();

  if (status === "P" || status === "PRESENT") {
    return "present";
  }

  if (status === "A" || status === "ABSENT") {
    return "absent";
  }

  return null;
};


// ============================================================
// EXCEL DATE PARSER
// ============================================================

const parseExcelDate = (value) => {
  // ==========================================================
  // JAVASCRIPT DATE
  // ==========================================================

  if (
    value instanceof Date &&
    !isNaN(value.getTime())
  ) {
    return value;
  }


  // ==========================================================
  // EXCEL SERIAL DATE
  // ==========================================================

  if (typeof value === "number") {

    const parsed =
      XLSX.SSF.parse_date_code(value);

    if (!parsed) {
      return null;
    }

    return new Date(
      Date.UTC(
        parsed.y,
        parsed.m - 1,
        parsed.d
      )
    );
  }


  // ==========================================================
  // STRING DATE
  // ==========================================================

  if (typeof value === "string") {

    const text =
      value.trim();

    if (!text) {
      return null;
    }


    // --------------------------------------------------------
    // DD-MM-YYYY
    // --------------------------------------------------------

    let match =
      text.match(
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/
      );

    if (match) {

      const day =
        Number(match[1]);

      const month =
        Number(match[2]);

      const year =
        Number(match[3]);

      return new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );
    }


    // --------------------------------------------------------
    // DD/MM/YYYY
    // --------------------------------------------------------

    match =
      text.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );

    if (match) {

      const day =
        Number(match[1]);

      const month =
        Number(match[2]);

      const year =
        Number(match[3]);

      return new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );
    }


    // --------------------------------------------------------
    // YYYY-MM-DD
    // --------------------------------------------------------

    match =
      text.match(
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/
      );

    if (match) {

      const year =
        Number(match[1]);

      const month =
        Number(match[2]);

      const day =
        Number(match[3]);

      return new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );
    }


    // --------------------------------------------------------
    // DD-MMM-YYYY
    //
    // Example:
    // 01-Sep-2026
    // 02-Sep-2026
    // --------------------------------------------------------

    match =
      text.match(
        /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/
      );

    if (match) {

      const day =
        Number(match[1]);

      const monthText =
        match[2].toLowerCase();

      const year =
        Number(match[3]);


      const months = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };


      if (
        months[monthText] === undefined
      ) {
        return null;
      }


      return new Date(
        Date.UTC(
          year,
          months[monthText],
          day
        )
      );
    }


    // --------------------------------------------------------
    // DD MMM YYYY
    //
    // Example:
    // 01 Sep 2026
    // --------------------------------------------------------

    match =
      text.match(
        /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/
      );

    if (match) {

      const day =
        Number(match[1]);

      const monthText =
        match[2].toLowerCase();

      const year =
        Number(match[3]);


      const months = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };


      if (
        months[monthText] === undefined
      ) {
        return null;
      }


      return new Date(
        Date.UTC(
          year,
          months[monthText],
          day
        )
      );
    }
  }


  return null;
};


// ============================================================
// DATE KEY
// ============================================================

const getDateKey = (date) => {

  return date
    .toISOString()
    .slice(0, 10);
};


// ============================================================
// READ EXCEL
// ============================================================

const readAttendanceExcel = (file) => {

  if (!file?.buffer && !file?.path) {
    throw new Error(
      "Excel file data is not available."
    );
  }


  let workbook;


  // ----------------------------------------------------------
  // Memory storage
  // ----------------------------------------------------------

  if (file.buffer) {

    workbook =
      XLSX.read(
        file.buffer,
        {
          type: "buffer",
          cellDates: true,
        }
      );

  } else {

    workbook =
      XLSX.readFile(
        file.path,
        {
          cellDates: true,
        }
      );
  }


  if (!workbook.SheetNames.length) {

    const error =
      new Error(
        "Excel file does not contain any worksheet."
      );

    error.code =
      "EXCEL_SHEET_REQUIRED";

    throw error;
  }


  const sheetName =
    workbook.SheetNames[0];

  const worksheet =
    workbook.Sheets[sheetName];


  const rows =
    XLSX.utils.sheet_to_json(
      worksheet,
      {
        header: 1,
        defval: "",
        raw: true,
      }
    );


  if (!rows.length) {

    const error =
      new Error(
        "Excel file is empty."
      );

    error.code =
      "EXCEL_EMPTY";

    throw error;
  }


  return {
    sheetName,
    rows,
  };
};


// ============================================================
// VALIDATE EXCEL STRUCTURE
// ============================================================

const parseAttendanceRows = (file) => {

  const {
    sheetName,
    rows,
  } = readAttendanceExcel(file);


  const headerRow =
    rows[0] ?? [];


  const normalizedHeaders =
    headerRow.map(normalizeHeader);


  const employeeIdIndex =
    normalizedHeaders.findIndex(
      (header) =>
        header === "employee id" ||
        header === "employeeid" ||
        header === "employee_id"
    );


  const facultyNameIndex =
    normalizedHeaders.findIndex(
      (header) =>
        header === "faculty name" ||
        header === "facultyname" ||
        header === "name"
    );


  const departmentIndex =
    normalizedHeaders.findIndex(
      (header) =>
        header === "department"
    );


  // ----------------------------------------------------------
  // Required identification columns
  // ----------------------------------------------------------

  if (employeeIdIndex === -1) {

    const error =
      new Error(
        "Excel must contain an 'Employee ID' column."
      );

    error.code =
      "EXCEL_HEADER_VALIDATION_FAILED";

    error.details = {
      sheetName,
      totalColumns:
        headerRow.length,
      errors: [
        {
          field: "Employee ID",
          reason:
            "Employee ID column is missing.",
        },
      ],
      warnings: [],
    };

    throw error;
  }


  // ----------------------------------------------------------
  // Date columns
  // ----------------------------------------------------------

  const dateColumns = [];


  for (
    let columnIndex = 0;
    columnIndex < headerRow.length;
    columnIndex++
  ) {

    if (
      columnIndex === employeeIdIndex ||
      columnIndex === facultyNameIndex ||
      columnIndex === departmentIndex
    ) {
      continue;
    }


    const headerValue =
      headerRow[columnIndex];


    const date =
      parseExcelDate(headerValue);


    if (!date) {
      continue;
    }


    dateColumns.push({
      columnIndex,
      date,
      dateKey:
        getDateKey(date),
      originalHeader:
        headerValue,
    });
  }


  if (!dateColumns.length) {

    const error =
      new Error(
        "Excel must contain at least one attendance date column."
      );

    error.code =
      "EXCEL_HEADER_VALIDATION_FAILED";

    error.details = {
      sheetName,
      totalColumns:
        headerRow.length,
      errors: [
        {
          field: "Attendance Dates",
          reason:
            "No valid attendance date columns were found.",
        },
      ],
      warnings: [],
    };

    throw error;
  }


  // ----------------------------------------------------------
  // Duplicate date columns
  // ----------------------------------------------------------

  const seenDates =
    new Set();

  const duplicateDates = [];


  for (const column of dateColumns) {

    if (seenDates.has(column.dateKey)) {

      duplicateDates.push(
        column.dateKey
      );

    } else {

      seenDates.add(
        column.dateKey
      );
    }
  }


  if (duplicateDates.length) {

    const error =
      new Error(
        "Excel contains duplicate attendance date columns."
      );

    error.code =
      "EXCEL_HEADER_VALIDATION_FAILED";

    error.details = {
      sheetName,
      totalColumns:
        headerRow.length,
      errors:
        duplicateDates.map(
          (date) => ({
            field: date,
            reason:
              "Duplicate attendance date column.",
          })
        ),
      warnings: [],
    };

    throw error;
  }


  // ----------------------------------------------------------
  // Convert rows
  // ----------------------------------------------------------

  const attendanceRows = [];


  for (
    let rowIndex = 1;
    rowIndex < rows.length;
    rowIndex++
  ) {

    const row =
      rows[rowIndex] ?? [];


    const employeeId =
      normalizeEmployeeId(
        row[employeeIdIndex]
      );


    // Completely empty row
    const hasAnyValue =
      row.some(
        (value) =>
          String(value ?? "").trim() !== ""
      );


    if (!hasAnyValue) {
      continue;
    }


    attendanceRows.push({
      excelRow:
        rowIndex + 1,

      employeeId,

      facultyName:
        facultyNameIndex !== -1
          ? String(
              row[facultyNameIndex] ?? ""
            ).trim()
          : null,

      department:
        departmentIndex !== -1
          ? String(
              row[departmentIndex] ?? ""
            ).trim()
          : null,

      attendance:
        dateColumns.map(
          (dateColumn) => ({
            date:
              dateColumn.date,

            dateKey:
              dateColumn.dateKey,

            rawValue:
              row[
                dateColumn.columnIndex
              ],
          })
        ),
    });
  }


  return {
    sheetName,
    dateColumns,
    attendanceRows,
  };
};


// ============================================================
// FIND FACULTY
// ============================================================

// ============================================================
// FIND FACULTY BY EMPLOYEE ID
// ============================================================
//
//
// IMPORTANT:
//
// TeachingFaculty does NOT contain `institution`.
//
// Institution belongs to User:
//
// User
//   └── institution
//
// TeachingFaculty
//   └── userId -> User
//
// Employee ID is stored directly on TeachingFaculty.
//
// ============================================================

const getFacultyMap = async (
  employeeIds,
  institutionId
) => {

  console.log("");
  console.log("============================================");
  console.log("ATTENDANCE FACULTY LOOKUP");
  console.log("============================================");

  console.log("Institution ID:", institutionId);

  console.log(
    "Requested Employee IDs:",
    employeeIds
  );


  // ==========================================================
  // FIND FACULTY
  // ==========================================================
  //
  // We intentionally DO NOT filter institution here because
  // institution is stored inside User, not TeachingFaculty.
  //
  // We populate userId and check the institution afterwards.
  //
  // ==========================================================

// ============================================================
// CASE-INSENSITIVE EMPLOYEE ID REGEX
// ============================================================

const employeeIdRegexes =
  employeeIds.map(
    (employeeId) =>
      new RegExp(
        `^${String(employeeId).replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        )}$`,
        "i"
      )
  );


// ============================================================
// FIND FACULTY
// ============================================================

const faculties =
  await TeachingFaculty.find({
    isDeleted: false,

    employeeId: {
      $in: employeeIdRegexes,
    },
  })
      .select(
        "_id employeeId designation department userId isDeleted"
      )
      .populate({
        path: "userId",
        select:
          "fullName email phone profileImage institution department isDeleted",
      })
      .lean();


  // ==========================================================
  // DEBUG DATABASE RESULT
  // ==========================================================

  console.log(
    "FACULTIES FOUND BEFORE INSTITUTION CHECK:",
    faculties.map(
      (faculty) => ({
        facultyId:
          faculty._id,

        employeeId:
          faculty.employeeId,

        designation:
          faculty.designation,

        userId:
          faculty.userId?._id,

        userName:
          faculty.userId?.fullName,

        userInstitution:
          faculty.userId?.institution,

        userIsDeleted:
          faculty.userId?.isDeleted,
      })
    )
  );


  // ==========================================================
  // CREATE FACULTY MAP
  // ==========================================================

  const facultyMap =
    new Map();


  // ==========================================================
  // PROCESS FACULTIES
  // ==========================================================

  for (const faculty of faculties) {

    // ========================================================
    // USER MUST EXIST
    // ========================================================

    if (!faculty.userId) {

      console.warn(
        "FACULTY HAS NO USER:",
        faculty.employeeId
      );

      continue;
    }


    // ========================================================
    // USER MUST NOT BE DELETED
    // ========================================================

    if (
      faculty.userId.isDeleted === true
    ) {

      console.warn(
        "USER IS DELETED:",
        faculty.employeeId
      );

      continue;
    }


    // ========================================================
    // INSTITUTION SAFETY CHECK
    // ========================================================

    if (
      String(
        faculty.userId.institution
      ) !== String(institutionId)
    ) {

      console.warn(
        "FACULTY BELONGS TO DIFFERENT INSTITUTION:",
        {
          employeeId:
            faculty.employeeId,

          facultyInstitution:
            faculty.userId.institution,

          requestedInstitution:
            institutionId,
        }
      );

      continue;
    }


    // ========================================================
    // NORMALIZED EMPLOYEE ID
    // ========================================================

    const normalizedEmployeeId =
      normalizeEmployeeId(
        faculty.employeeId
      );


    // ========================================================
    // STORE IN MAP
    // ========================================================

    facultyMap.set(
      normalizedEmployeeId,
      faculty
    );
  }


  // ==========================================================
  // DEBUG FINAL MAP
  // ==========================================================

  console.log(
    "============================================"
  );

  console.log(
    "MATCHED FACULTIES:",
    [...facultyMap.entries()].map(
      ([employeeId, faculty]) => ({
        employeeId,
        facultyId: faculty._id,
        name:
          faculty.userId?.fullName,
      })
    )
  );

  console.log(
    "============================================"
  );


  return facultyMap;
};


// ============================================================
// VALIDATE + PREPARE ATTENDANCE
// ============================================================

const prepareAttendanceRecords = async (
  parsedExcel,
  institutionId
) => {

  const {
    attendanceRows,
  } = parsedExcel;


  const employeeIds =
    [
      ...new Set(
        attendanceRows
          .map(
            (row) =>
              row.employeeId
          )
          .filter(Boolean)
      ),
    ];


  if (!employeeIds.length) {

    const error =
      new Error(
        "No valid Employee IDs were found in the Excel file."
      );

    error.code =
      "NO_EMPLOYEE_IDS";

    throw error;
  }


  const facultyMap =
    await getFacultyMap(
      employeeIds,
      institutionId
    );


  const records = [];

  const failedRows = [];


  for (const row of attendanceRows) {

    // --------------------------------------------------------
    // Employee ID
    // --------------------------------------------------------

    if (!row.employeeId) {

      failedRows.push({
        excelRow:
          row.excelRow,

        employeeId:
          null,

        reason:
          "Employee ID is required.",
      });

      continue;
    }


    // --------------------------------------------------------
    // Find faculty
    // --------------------------------------------------------

    const faculty =
      facultyMap.get(
        row.employeeId
      );


    if (!faculty) {

      failedRows.push({
        excelRow:
          row.excelRow,

        employeeId:
          row.employeeId,

        reason:
          "Faculty with this Employee ID was not found.",
      });

      continue;
    }


    // --------------------------------------------------------
    // Institution safety
    // --------------------------------------------------------

    if (
      String(faculty.department ?? "") === ""
    ) {
      // Department can legitimately be null
      // for principal.
    }


    // --------------------------------------------------------
    // Attendance values
    // --------------------------------------------------------

    for (const attendance of row.attendance) {

      const status =
        normalizeAttendanceStatus(
          attendance.rawValue
        );


      if (!status) {

        failedRows.push({
          excelRow:
            row.excelRow,

          employeeId:
            row.employeeId,

          date:
            attendance.dateKey,

          receivedValue:
            attendance.rawValue,

          reason:
            "Attendance must be P, A, Present, or Absent.",
        });

        continue;
      }


      records.push({
        faculty:
          faculty._id,

        employeeId:
          faculty.employeeId,

        institution:
          institutionId,

        department:
          faculty.department ?? null,

        date:
          attendance.date,

        status,

        source:
          "excel_upload",

        isDeleted:
          false,

        deletedAt:
          null,
      });
    }
  }


  return {
    records,
    failedRows,
  };
};


// ============================================================
// BULK UPLOAD
// ============================================================
//
// Creates attendance records.
// Existing faculty + date records are rejected.
// No partial database write is performed if validation fails.
// ============================================================

export const bulkUploadFacultyAttendanceService =
  async (
    file,
    institutionId
  ) => {

    const parsedExcel =
      parseAttendanceRows(file);


    const {
      records,
      failedRows,
    } =
      await prepareAttendanceRecords(
        parsedExcel,
        institutionId
      );


    if (!records.length) {

      return {
        insertedCount: 0,

        failedCount:
          failedRows.length,

        failedRows,

        sheetName:
          parsedExcel.sheetName,

        totalRows:
          parsedExcel.attendanceRows.length,

        totalAttendanceRecords:
          0,
      };
    }


    // --------------------------------------------------------
    // Check duplicate records before inserting
    // --------------------------------------------------------

    const facultyIds =
      [
        ...new Set(
          records.map(
            (record) =>
              String(record.faculty)
          )
        ),
      ];


    const dates =
      records.map(
        (record) =>
          record.date
      );


    const existingRecords =
      await FacultyAttendance.find({
        faculty: {
          $in:
            facultyIds.map(
              (id) =>
                new mongoose.Types.ObjectId(
                  id
                )
            ),
        },

        date: {
          $in: dates,
        },

        institution:
          institutionId,

        isDeleted:
          false,
      })
        .select(
          "faculty date employeeId"
        )
        .lean();


    const existingSet =
      new Set(
        existingRecords.map(
          (record) =>
            `${record.faculty}_${getDateKey(record.date)}`
        )
      );


    const recordsToInsert = [];


    for (const record of records) {

      const key =
        `${record.faculty}_${getDateKey(record.date)}`;


      if (existingSet.has(key)) {

        failedRows.push({
          employeeId:
            record.employeeId,

          date:
            getDateKey(record.date),

          reason:
            "Attendance already exists for this faculty and date.",
        });

        continue;
      }


      recordsToInsert.push(
        record
      );

      existingSet.add(key);
    }


    // --------------------------------------------------------
    // Insert
    // --------------------------------------------------------

    let insertedRecords = [];


    if (recordsToInsert.length) {

      insertedRecords =
        await FacultyAttendance.insertMany(
          recordsToInsert,
          {
            ordered: true,
          }
        );
    }


    return {
      insertedCount:
        insertedRecords.length,

      failedCount:
        failedRows.length,

      failedRows,

      sheetName:
        parsedExcel.sheetName,

      totalRows:
        parsedExcel.attendanceRows.length,

      totalAttendanceRecords:
        records.length,
    };
  };


// ============================================================
// BULK UPDATE
// ============================================================
//
// Creates missing records and updates existing records.
// ============================================================

export const bulkUpdateFacultyAttendanceService =
  async (
    file,
    institutionId
  ) => {

    const parsedExcel =
      parseAttendanceRows(file);


    const {
      records,
      failedRows,
    } =
      await prepareAttendanceRecords(
        parsedExcel,
        institutionId
      );


    if (!records.length) {

      return {
        success: false,

        updatedCount: 0,

        insertedCount: 0,

        failedCount:
          failedRows.length,

        failedRows,

        sheetName:
          parsedExcel.sheetName,
      };
    }


    const operations =
      records.map(
        (record) => ({
          updateOne: {
            filter: {
              faculty:
                record.faculty,

              date:
                record.date,

              institution:
                record.institution,
            },

            update: {
              $set: {
                employeeId:
                  record.employeeId,

                department:
                  record.department,

                status:
                  record.status,

                source:
                  "excel_upload",

                isDeleted:
                  false,

                deletedAt:
                  null,
              },
            },

            upsert: true,
          },
        })
      );


    const result =
      await FacultyAttendance.bulkWrite(
        operations,
        {
          ordered: true,
        }
      );


    return {
      success: true,

      matchedCount:
        result.matchedCount ?? 0,

      modifiedCount:
        result.modifiedCount ?? 0,

      upsertedCount:
        result.upsertedCount ?? 0,

      insertedCount:
        result.upsertedCount ?? 0,

      failedCount:
        failedRows.length,

      failedRows,

      sheetName:
        parsedExcel.sheetName,

      totalRows:
        parsedExcel.attendanceRows.length,

      totalAttendanceRecords:
        records.length,
    };
  };


  export const getSingleFacultyAttendanceService = async (
  facultyId,
  institutionId
) => {
  const attendance = await FacultyAttendance.find({
    faculty: facultyId,
    institution: institutionId,
    isDeleted: false,
  })
    .populate({
      path: "faculty",
      populate: {
        path: "userId",
        select: "fullName email phone profileImage",
      },
    })
    .populate(
      "department",
      "name"
    )
    .sort({
      date: -1,
    })
    .lean();

  if (!attendance.length) {
    return {
      faculty: null,
      attendance: [],
      totalRecords: 0,
    };
  }

  const faculty = attendance[0].faculty;

  return {
    faculty: {
      _id: faculty._id,
      employeeId: faculty.employeeId,
      designation: faculty.designation,
      department: faculty.department,
      fullName: faculty.userId?.fullName ?? null,
      email: faculty.userId?.email ?? null,
      phone: faculty.userId?.phone ?? null,
      profileImage:
        faculty.userId?.profileImage ?? null,
    },

    attendance: attendance.map(
      (record) => ({
        _id: record._id,
        date: record.date,
        status: record.status,
        source: record.source,
      })
    ),

    totalRecords: attendance.length,
  };
};