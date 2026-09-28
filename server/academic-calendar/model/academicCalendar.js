import mongoose from "mongoose";

const academicCalendarSchema =
  new mongoose.Schema(
    {
      institutionId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      academicYear: {
        type: String,
        required: true,
        trim: true,
      },

      semesterName: {
        type: String,
        required: true,
        trim: true,
      },

      semesterNumber: {
        type: Number,
        required: true,
      },

      startDate: {
        type: Date,
        required: true,
      },

      endDate: {
        type: Date,
        required: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      createdBy: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      // Soft Delete
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
    }
  );

export default mongoose.model(
  "AcademicCalendar",
  academicCalendarSchema
);