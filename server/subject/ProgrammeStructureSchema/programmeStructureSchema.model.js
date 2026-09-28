import mongoose from "mongoose";

const programmeStructureSchema = new mongoose.Schema(
  {
    // ==================== ORGANIZATION ====================

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    programmeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Programme",
      required: true,
    },

    // ==================== ACADEMIC STRUCTURE ====================

    structure: {
      type: [
        {
          _id: false,

          studyYear: {
            type: Number,
            required: true,
            min: 1,
          },

          semesters: {
            type: [
              {
                _id: false,

                semesterNumber: {
                  type: Number,
                  required: true,
                  min: 1,
                },
              
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },

activeSemesters: {
  type: [
    {
      _id: false,

      batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },

      semesterNumber: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  default: [],
},

    // ==================== STATUS ====================

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    // ==================== AUDIT ====================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==================== UNIQUE PROGRAMME STRUCTURE ====================

programmeStructureSchema.index(
  {
    programmeId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

// ==================== FILTER INDEXES ====================

programmeStructureSchema.index({
  institutionId: 1,
});

programmeStructureSchema.index({
  departmentId: 1,
});

programmeStructureSchema.index({
  isActive: 1,
});

programmeStructureSchema.index({
  isDeleted: 1,
});

export default mongoose.model(
  "ProgrammeStructure",
  programmeStructureSchema
);

/*
=====================================================
/*
=====================================================

Programme Structure

Defines the academic structure of a programme.

Example

B.Com

Year 1
  Semester 1
  Semester 2

Year 2
  Semester 3
  Semester 4

Year 3
  Semester 5
  Semester 6


Active Semester Assignment

Each batch can have its own current semester.

Example:

Batch 2021–2024
  Current Year: 2
  Current Semester: 3

Batch 2022–2025
  Current Year: 2
  Current Semester: 4

Batch 2023–2026
  Current Year: 1
  Current Semester: 1


The active semester is stored in:

activeSemesters

Each entry contains:

• batchId
• semesterNumber


This schema DOES NOT store:

• Subjects
• Timetable
• Attendance
• Exam Titles
• Exam Results

=====================================================
*/