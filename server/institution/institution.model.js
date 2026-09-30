import mongoose from "mongoose";

// =========================
// ATTENDANCE FORMAT DESCRIPTIONS
// =========================

export const ATTENDANCE_FORMAT_DESCRIPTIONS = {
  FULL_DAY:
    "One attendance is recorded for the entire day.",

  TWO_PER_DAY:
    "Two attendance records are recorded each day, one for morning and one for afternoon.",

  HOUR_BASED:
    "Attendance is recorded separately for each timetable hour.",
};

// =========================
// INSTITUTION SCHEMA
// =========================

const institutionSchema = new mongoose.Schema(
  {
    // =========================
    // INSTITUTION INFORMATION
    // =========================

    institutionName: {
      type: String,
      required: true,
      trim: true,
    },

    institutionCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // =========================
    // INSTITUTION ADDRESS
    // =========================

    address: {
      addressLine1: {
        type: String,
        trim: true,
        default: "",
      },

      addressLine2: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      district: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      pincode: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },
    },

    // =========================
    // DEPARTMENTS
    // =========================

    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    ],

    // =========================
    // PRINCIPAL
    // =========================

    principal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================
    // FINANCE CONFIGURATION
    // =========================

    finance: {
      // Controls whether students can view
      // their fee details from the student dashboard

      showStudentFees: {
        type: Boolean,
        default: false,
      },
    },

    // =========================
    // ATTENDANCE CONFIGURATION
    // =========================

    attendance: {
      // ---------------------------------
      // MASTER ATTENDANCE SWITCH
      // ---------------------------------

      enabled: {
        type: Boolean,
        default: true,
      },

      // ---------------------------------
      // ATTENDANCE METHOD
      // ---------------------------------

      format: {
        type: String,
        enum: {
          values: [
            "FULL_DAY",
            "TWO_PER_DAY",
            "HOUR_BASED",
          ],
          message:
            "Attendance format must be FULL_DAY, TWO_PER_DAY, or HOUR_BASED.",
        },
        default: "FULL_DAY",
      },

      // ---------------------------------
      // ATTENDANCE SCHEDULE
      // ---------------------------------
      //
      // Period numbers are manually
      // configured by the institution.
      //
      // FULL_DAY:
      //   Example:
      //   Period 1 = daily attendance
      //
      // TWO_PER_DAY:
      //   Example:
      //   Period 1 = morning attendance
      //   Period 5 = afternoon attendance
      //
      // HOUR_BASED:
      //   No standard attendance period.
      //   Attendance is taken for each
      //   applicable teaching period.
      //

      schedule: {
        // ---------------------------------
        // FULL DAY ATTENDANCE
        // ---------------------------------

        fullDay: {
          periodNumber: {
            type: Number,
            min: 1,
            default: null,
          },
        },

        // ---------------------------------
        // TWO ATTENDANCE PER DAY
        // ---------------------------------

        twoPerDay: {
          morningPeriodNumber: {
            type: Number,
            min: 1,
            default: null,
          },

          afternoonPeriodNumber: {
            type: Number,
            min: 1,
            default: null,
          },
        },
      },
    },

    // =========================
    // SOFT DELETE
    // =========================

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =========================
// INDEXES
// =========================

institutionSchema.index({
  isDeleted: 1,
});

// =========================
// EXPORT MODEL
// =========================

export default mongoose.model(
  "Institution",
  institutionSchema
);