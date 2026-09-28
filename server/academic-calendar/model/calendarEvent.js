import mongoose from "mongoose";

const calendarEventSchema =
  new mongoose.Schema(
    {
      calendarId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicCalendar",
        required: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
      },

      eventType: {
        type: String,
        required: true,
        enum: [
          "working_day",
          "holiday",
          "exam",
          "study_holiday",
          "semester_holiday",
          "function",
          "sports",
          "workshop",
          "seminar",
          "event",
        ],
      },

      startDate: {
        type: Date,
        required: true,
      },

      endDate: {
        type: Date,
        required: true,
      },

      description: {
        type: String,
        default: "",
      },

      color: {
        type: String,
        default: "#3B82F6",
      },

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "CalendarEvent",
  calendarEventSchema
);