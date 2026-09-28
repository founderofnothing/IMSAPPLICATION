import mongoose from "mongoose";

const idCardTemplateAssignmentSchema =
  new mongoose.Schema(
    {
      // ============================================================
      // ID CARD TEMPLATE
      // ============================================================

      templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IDCardTemplate",
        required: true,
      },

      // ============================================================
      // INSTITUTION
      // ============================================================

      institutionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },

      // ============================================================
      // ASSIGNED BY
      // ============================================================

      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      // ============================================================
      // ASSIGNMENT STATUS
      // ============================================================

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },

      assignedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
      versionKey: false,
    }
  );

// ============================================================
// INDEXES
// ============================================================

// Find active template for an institution
idCardTemplateAssignmentSchema.index({
  institutionId: 1,
  isActive: 1,
});

// Find assignments belonging to a template
idCardTemplateAssignmentSchema.index({
  templateId: 1,
});

// One active ID-card template per institution
idCardTemplateAssignmentSchema.index(
  {
    institutionId: 1,
    isActive: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isActive: true,
    },
  }
);

export default mongoose.model(
  "IDCardTemplateAssignment",
  idCardTemplateAssignmentSchema
);