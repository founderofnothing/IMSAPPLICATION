import mongoose from "mongoose";

import Institution from "./institution.model.js";
import Department from "../department/department.model.js";
import Class from "../class/class.model.js";
import Student from "../student/student.model.js";

// =====================================================
// ATTENDANCE FORMAT CONSTANTS
// =====================================================

const ATTENDANCE_FORMATS = [
  "FULL_DAY",
  "TWO_PER_DAY",
  "HOUR_BASED",
];

// =====================================================
// HELPER - NORMALIZE TEXT
// =====================================================

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .trim()
    .replace(/\s+/g, " ");
};

// =====================================================
// HELPER - VALIDATE PERIOD NUMBER
// =====================================================

const validatePeriodNumber = (
  value,
  fieldName,
  required = false
) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    if (required) {
      throw new Error(
        `${fieldName} is required.`
      );
    }

    return null;
  }

  const number = Number(value);

  if (
    !Number.isInteger(number) ||
    number < 1
  ) {
    throw new Error(
      `${fieldName} must be a positive integer.`
    );
  }

  return number;
};

// =====================================================
// NORMALIZE ATTENDANCE
// =====================================================

const normalizeAttendance = (
  attendanceData,
  existingAttendance = {}
) => {
  const format =
    attendanceData?.format !== undefined
      ? normalizeText(attendanceData.format).toUpperCase()
      : existingAttendance?.format || "FULL_DAY";

  const existingSchedule =
    existingAttendance?.schedule || {};

  const incomingSchedule =
    attendanceData?.schedule || {};

  const existingFullDay =
    existingSchedule?.fullDay || {};

  const existingTwoPerDay =
    existingSchedule?.twoPerDay || {};

  const incomingFullDay =
    incomingSchedule?.fullDay || {};

  const incomingTwoPerDay =
    incomingSchedule?.twoPerDay || {};

  const attendance = {
    enabled:
      typeof attendanceData?.enabled === "boolean"
        ? attendanceData.enabled
        : existingAttendance?.enabled ?? true,

    format,

    schedule: {
      fullDay: {
        periodNumber:
          incomingFullDay.periodNumber !== undefined
            ? validatePeriodNumber(
                incomingFullDay.periodNumber,
                "attendance.schedule.fullDay.periodNumber"
              )
            : existingFullDay.periodNumber ?? null,
      },

      twoPerDay: {
        morningPeriodNumber:
          incomingTwoPerDay.morningPeriodNumber !== undefined
            ? validatePeriodNumber(
                incomingTwoPerDay.morningPeriodNumber,
                "attendance.schedule.twoPerDay.morningPeriodNumber"
              )
            : existingTwoPerDay.morningPeriodNumber ?? null,

        afternoonPeriodNumber:
          incomingTwoPerDay.afternoonPeriodNumber !== undefined
            ? validatePeriodNumber(
                incomingTwoPerDay.afternoonPeriodNumber,
                "attendance.schedule.twoPerDay.afternoonPeriodNumber"
              )
            : existingTwoPerDay.afternoonPeriodNumber ?? null,
      },
    },
  };

  // ===================================================
  // VALIDATE FORMAT
  // ===================================================

  if (!ATTENDANCE_FORMATS.includes(attendance.format)) {
    throw new Error(
      "Attendance format must be FULL_DAY, TWO_PER_DAY, or HOUR_BASED."
    );
  }

  // ===================================================
  // FULL DAY
  // ===================================================

  if (attendance.format === "FULL_DAY") {
    if (
      attendance.schedule.fullDay.periodNumber === null
    ) {
      throw new Error(
        "attendance.schedule.fullDay.periodNumber is required when attendance format is FULL_DAY."
      );
    }

    // Clear irrelevant TWO_PER_DAY values
    attendance.schedule.twoPerDay.morningPeriodNumber = null;
    attendance.schedule.twoPerDay.afternoonPeriodNumber = null;
  }

  // ===================================================
  // TWO PER DAY
  // ===================================================

  if (attendance.format === "TWO_PER_DAY") {
    if (
      attendance.schedule.twoPerDay.morningPeriodNumber === null
    ) {
      throw new Error(
        "attendance.schedule.twoPerDay.morningPeriodNumber is required when attendance format is TWO_PER_DAY."
      );
    }

    if (
      attendance.schedule.twoPerDay.afternoonPeriodNumber === null
    ) {
      throw new Error(
        "attendance.schedule.twoPerDay.afternoonPeriodNumber is required when attendance format is TWO_PER_DAY."
      );
    }

    if (
      attendance.schedule.twoPerDay.morningPeriodNumber ===
      attendance.schedule.twoPerDay.afternoonPeriodNumber
    ) {
      throw new Error(
        "Morning and afternoon attendance periods must be different."
      );
    }

    // Clear irrelevant FULL_DAY value
    attendance.schedule.fullDay.periodNumber = null;
  }

  // ===================================================
  // HOUR BASED
  // ===================================================

  if (attendance.format === "HOUR_BASED") {
    attendance.schedule.fullDay.periodNumber = null;

    attendance.schedule.twoPerDay.morningPeriodNumber = null;

    attendance.schedule.twoPerDay.afternoonPeriodNumber = null;
  }

  return attendance;
};

// =====================================================
// CREATE INSTITUTION
// =====================================================

export const createInstitutionService = async (
  institutionData
) => {
  const {
    institutionName,
    institutionCode,
    principal,
    departments,
    address,
    finance,
    attendance,
  } = institutionData;

  // ===================================================
  // NORMALIZE INSTITUTION INFORMATION
  // ===================================================

  const normalizedInstitutionName =
    normalizeText(institutionName);

  const normalizedInstitutionCode =
    normalizeText(
      institutionCode
    ).toUpperCase();

  // ===================================================
  // NORMALIZE ADDRESS
  // ===================================================

  const normalizedAddress = {
    addressLine1: normalizeText(
      address?.addressLine1 || ""
    ),

    addressLine2: normalizeText(
      address?.addressLine2 || ""
    ),

    city: normalizeText(
      address?.city || ""
    ),

    district: normalizeText(
      address?.district || ""
    ),

    state: normalizeText(
      address?.state || ""
    ),

    pincode: normalizeText(
      address?.pincode || ""
    ),

    country: normalizeText(
      address?.country || "India"
    ),
  };

  // ===================================================
  // NORMALIZE FINANCE
  // ===================================================

  const normalizedFinance = {
    showStudentFees:
      typeof finance?.showStudentFees ===
      "boolean"
        ? finance.showStudentFees
        : false,
  };

  // ===================================================
  // NORMALIZE ATTENDANCE
  // ===================================================

  const normalizedAttendance =
    normalizeAttendance(attendance);

  // ===================================================
  // CHECK DUPLICATE INSTITUTION CODE
  // ===================================================

  const existingInstitution =
    await Institution.findOne({
      institutionCode:
        normalizedInstitutionCode,
      isDeleted: false,
    });

  if (existingInstitution) {
    throw new Error(
      "Institution code already exists"
    );
  }

  // ===================================================
  // CREATE INSTITUTION
  // ===================================================

  const institution =
    await Institution.create({
      institutionName:
        normalizedInstitutionName,

      institutionCode:
        normalizedInstitutionCode,

      principal:
        principal || null,

      departments:
        departments || [],

      address:
        normalizedAddress,

      finance:
        normalizedFinance,

      attendance:
        normalizedAttendance,
    });

  return institution;
};

// =====================================================
// GET ALL INSTITUTIONS
// =====================================================

export const getAllInstitutionsService =
  async () => {
    const institutions =
      await Institution.find({
        isDeleted: false,
      })
        .populate(
          "principal",
          "fullName email role"
        )
        .populate(
          "departments",
          "departmentName"
        );

    return institutions;
  };

// =====================================================
// GET SINGLE INSTITUTION
// =====================================================

export const getInstitutionByIdService =
  async (institutionId) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    const institution =
      await Institution.findOne({
        _id: institutionId,
        isDeleted: false,
      })
        .populate(
          "principal",
          "fullName email role"
        )
        .populate(
          "departments",
          "departmentName"
        );

    if (!institution) {
      throw new Error(
        "Institution not found"
      );
    }

    return institution;
  };

// =====================================================
// UPDATE INSTITUTION
// =====================================================
export const updateInstitutionService =
  async (
    institutionId,
    updateData
  ) => {
    // =================================================
    // CHECK ID
    // =================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    // =================================================
    // CHECK INSTITUTION EXISTS
    // =================================================
   
   
    const existingInstitution =
      await Institution.findOne({
        _id: institutionId,
        isDeleted: false,
      });

    if (!existingInstitution) {
      throw new Error(
        "Institution not found"
      );
    }

    // =================================================
    // PREPARE UPDATE
    // =================================================

    const normalizedUpdate = {
      ...updateData,
    };

    // =================================================
    // NORMALIZE INSTITUTION NAME
    // =================================================

    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "institutionName"
      )
    ) {
      normalizedUpdate.institutionName =
        normalizeText(
          updateData.institutionName
        );
    }

    // =================================================
    // NORMALIZE INSTITUTION CODE
    // =================================================

    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        "institutionCode"
      )
    ) {
      normalizedUpdate.institutionCode =
        normalizeText(
          updateData.institutionCode
        ).toUpperCase();

      const duplicateInstitution =
        await Institution.findOne({
          institutionCode:
            normalizedUpdate.institutionCode,

          _id: {
            $ne: institutionId,
          },

          isDeleted: false,
        });

      if (duplicateInstitution) {
        throw new Error(
          "Institution code already exists"
        );
      }
    }

    // =================================================
    // NORMALIZE ADDRESS
    // =================================================

    if (
      updateData.address &&
      typeof updateData.address ===
        "object"
    ) {
      const existingAddress =
        existingInstitution.address
          ? existingInstitution.address
              .toObject
            ? existingInstitution.address.toObject()
            : existingInstitution.address
          : {};

      normalizedUpdate.address = {
        ...existingAddress,
        ...updateData.address,
      };

      const addressFields = [
        "addressLine1",
        "addressLine2",
        "city",
        "district",
        "state",
        "pincode",
        "country",
      ];

      addressFields.forEach(
        (field) => {
          if (
            Object.prototype.hasOwnProperty.call(
              updateData.address,
              field
            )
          ) {
            normalizedUpdate.address[
              field
            ] = normalizeText(
              updateData.address[field]
            );
          }
        }
      );
    }

    // =================================================
    // NORMALIZE FINANCE
    // =================================================

    if (
      updateData.finance &&
      typeof updateData.finance ===
        "object"
    ) {
      const existingFinance =
        existingInstitution.finance
          ? existingInstitution.finance
              .toObject
            ? existingInstitution.finance.toObject()
            : existingInstitution.finance
          : {};

      normalizedUpdate.finance = {
        ...existingFinance,
        ...updateData.finance,
      };

      if (
        Object.prototype.hasOwnProperty.call(
          updateData.finance,
          "showStudentFees"
        )
      ) {
        if (
          typeof updateData.finance
            .showStudentFees !==
          "boolean"
        ) {
          throw new Error(
            "showStudentFees must be a boolean"
          );
        }

        normalizedUpdate.finance.showStudentFees =
          updateData.finance.showStudentFees;
      }
    }






// =================================================
// NORMALIZE ATTENDANCE
// =================================================

if (
  updateData.attendance &&
  typeof updateData.attendance === "object"
) {
  const existingAttendance =
    existingInstitution.attendance
      ? existingInstitution.attendance.toObject
        ? existingInstitution.attendance.toObject()
        : existingInstitution.attendance
      : {};

  const existingSchedule =
    existingAttendance.schedule || {};

  const incomingSchedule =
    updateData.attendance.schedule || {};

  const existingFullDay =
    existingSchedule.fullDay || {};

  const existingTwoPerDay =
    existingSchedule.twoPerDay || {};

  const incomingFullDay =
    incomingSchedule.fullDay || {};

  const incomingTwoPerDay =
    incomingSchedule.twoPerDay || {};

  const mergedAttendance = {
    ...existingAttendance,
    ...updateData.attendance,

    schedule: {
      fullDay: {
        ...existingFullDay,
        ...incomingFullDay,
      },

      twoPerDay: {
        ...existingTwoPerDay,
        ...incomingTwoPerDay,
      },
    },
  };

  // -----------------------------------------------
  // ENABLED
  // -----------------------------------------------

  if (
    Object.prototype.hasOwnProperty.call(
      updateData.attendance,
      "enabled"
    )
  ) {
    if (
      typeof updateData.attendance.enabled !== "boolean"
    ) {
      throw new Error(
        "attendance.enabled must be a boolean"
      );
    }
  }

  // -----------------------------------------------
  // FORMAT
  // -----------------------------------------------

  if (
    Object.prototype.hasOwnProperty.call(
      updateData.attendance,
      "format"
    )
  ) {
    mergedAttendance.format =
      normalizeText(
        updateData.attendance.format
      ).toUpperCase();
  }

  // -----------------------------------------------
  // FULL DAY PERIOD
  // -----------------------------------------------

  if (
    Object.prototype.hasOwnProperty.call(
      incomingFullDay,
      "periodNumber"
    )
  ) {
    mergedAttendance.schedule.fullDay.periodNumber =
      validatePeriodNumber(
        incomingFullDay.periodNumber,
        "attendance.schedule.fullDay.periodNumber"
      );
  }

  // -----------------------------------------------
  // MORNING PERIOD
  // -----------------------------------------------

  if (
    Object.prototype.hasOwnProperty.call(
      incomingTwoPerDay,
      "morningPeriodNumber"
    )
  ) {
    mergedAttendance.schedule.twoPerDay.morningPeriodNumber =
      validatePeriodNumber(
        incomingTwoPerDay.morningPeriodNumber,
        "attendance.schedule.twoPerDay.morningPeriodNumber"
      );
  }

  // -----------------------------------------------
  // AFTERNOON PERIOD
  // -----------------------------------------------

  if (
    Object.prototype.hasOwnProperty.call(
      incomingTwoPerDay,
      "afternoonPeriodNumber"
    )
  ) {
    mergedAttendance.schedule.twoPerDay.afternoonPeriodNumber =
      validatePeriodNumber(
        incomingTwoPerDay.afternoonPeriodNumber,
        "attendance.schedule.twoPerDay.afternoonPeriodNumber"
      );
  }

  // -----------------------------------------------
  // FINAL ATTENDANCE VALIDATION
  // -----------------------------------------------

  normalizedUpdate.attendance =
    normalizeAttendance(
      mergedAttendance,
      existingAttendance
    );
}
    // =================================================
    // UPDATE DATABASE
    // =================================================

    const updatedInstitution =
      await Institution.findByIdAndUpdate(
        institutionId,
        normalizedUpdate,
        {
          returnDocument: "after",
          runValidators: true,
        }
      )
        .populate(
          "principal",
          "fullName email role"
        )
        .populate(
          "departments",
          "departmentName"
        );

    return updatedInstitution;
  };

// =====================================================
// DELETE INSTITUTION
// =====================================================

export const deleteInstitutionService =
  async (institutionId) => {
    const institution =
      await Institution.findOne({
        _id: institutionId,
        isDeleted: false,
      });

    if (!institution) {
      throw new Error(
        "Institution not found"
      );
    }

    const deletedInstitution =
      await Institution.findByIdAndUpdate(
        institutionId,
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        {
          returnDocument: "after",
        }
      );

    return deletedInstitution;
  };

// =====================================================
// GET DELETED INSTITUTIONS
// =====================================================

export const getDeletedInstitutionsService =
  async () => {
    return await Institution.find({
      isDeleted: true,
    })
      .populate(
        "principal",
        "fullName email role"
      )
      .populate(
        "departments",
        "departmentName"
      );
  };

// =====================================================
// RESTORE INSTITUTION
// =====================================================

export const restoreInstitutionService =
  async (institutionId) => {
    const institution =
      await Institution.findOne({
        _id: institutionId,
        isDeleted: true,
      });

    if (!institution) {
      throw new Error(
        "Institution not found."
      );
    }

    return await Institution.findByIdAndUpdate(
      institutionId,
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        returnDocument: "after",
      }
    );
  };

// =====================================================
// PERMANENT DELETE INSTITUTION
// =====================================================

export const permanentDeleteInstitutionService =
  async (institutionId) => {
    const institution =
      await Institution.findById(
        institutionId
      );

    if (!institution) {
      throw new Error(
        "Institution not found."
      );
    }

    return await Institution.findByIdAndDelete(
      institutionId
    );
  };

// =====================================================
// GET MY INSTITUTION FROM JWT
// =====================================================

export const getMyInstitutionService =
  async (institutionId) => {
    const institution =
      await Institution.findOne({
        _id: institutionId,
        isDeleted: false,
      })
        .select(
          "institutionName institutionCode principal finance attendance"
        )
        .populate(
          "principal",
          "fullName email role"
        )
        .lean();

    if (!institution) {
      throw new Error(
        "Institution not found"
      );
    }

    // =================================================
    // FETCH DEPARTMENTS
    // =================================================

    const departments =
      await Department.find({
        institution: institutionId,
        isDeleted: false,
      })
        .select(
          "_id departmentName departmentCode"
        )
        .lean();

    // =================================================
    // DASHBOARD STATISTICS
    // =================================================

    const [
      totalClasses,
      totalStudents,
    ] = await Promise.all([
      Class.countDocuments({
        institution: institutionId,
        isDeleted: false,
      }),

      Student.countDocuments({
        institutionId: institutionId,
        isDeleted: false,
      }),
    ]);

    // =================================================
    // RETURN FRONTEND DATA
    // =================================================

    return {
      institution: {
        _id: institution._id,

        institutionName:
          institution.institutionName,

        institutionCode:
          institution.institutionCode,

        principal:
          institution.principal,

        // Finance
        finance:
          institution.finance,

        // Attendance
        attendance:
          institution.attendance,
      },

      departments,

      stats: {
        totalDepartments:
          departments.length,

        totalClasses,

        totalStudents,
      },
    };
  };

// =====================================================
// GET DEPARTMENTS BY INSTITUTION
// =====================================================

export const getDepartmentsByInstitutionService =
  async (institutionId) => {
    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    const departments =
      await Department.find({
        institution:
          institutionId,

        isDeleted:
          false,
      })
        .select(
          "departmentName departmentCode"
        )
        .sort({
          departmentName: 1,
        });

    return departments;
  };