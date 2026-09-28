import mongoose from "mongoose";


// ============================================================
// DYNAMIC FIELD MAPPING
// ============================================================

const fieldMappingSchema = new mongoose.Schema(
  {
    // Fabric object's unique ID
    fieldId: {
      type: String,
      required: true,
      trim: true,
    },

    // Type of dynamic element
    fieldType: {
      type: String,
      enum: [
        "text",
        "image",
        "qr",
      ],
      required: true,
    },

    // Path used to resolve actual data
    // Example:
    // studentName
    // registerNumber
    // department.departmentName
    // programme.programmeName
    dataPath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);


// ============================================================
// QR MAPPING
// ============================================================

const qrMappingSchema = new mongoose.Schema(
  {
    // Fabric QR object's fieldId
    fieldId: {
      type: String,
      required: true,
      trim: true,
    },

    // QR will use our permanent identity token
    dataSource: {
      type: String,
      enum: [
        "identityToken",
      ],
      default: "identityToken",
    },
  },
  {
    _id: false,
  }
);


// ============================================================
// ID CARD ASSIGNMENT SCHEMA
// ============================================================

const idCardAssignmentSchema =
  new mongoose.Schema(
    {

      // ========================================================
      // TEMPLATE
      // ========================================================

      templateId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "IDCardTemplate",

        required: true,
      },


      // ========================================================
      // INSTITUTION
      // ========================================================

      institutionId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "Institution",

        required: true,
      },


      // ========================================================
      // WHO WILL USE THIS TEMPLATE?
      // ========================================================

      targetType: {
        type: String,

        enum: [
          "student",
          "teaching_faculty",
          "non_teaching_faculty",
        ],

        required: true,
      },


      // ========================================================
      // DYNAMIC FIELD MAPPINGS
      // ========================================================

      fieldMappings: {
        type: [
          fieldMappingSchema,
        ],

        default: [],
      },


      // ========================================================
      // QR MAPPING
      // ========================================================

      qrMapping: {
        type:
          qrMappingSchema,

        default: null,
      },


      // ========================================================
      // STATUS
      // ========================================================

      isActive: {
        type: Boolean,
        default: true,
      },


      isDefault: {
        type: Boolean,
        default: false,
      },


      // ========================================================
      // AUDIT
      // ========================================================

      assignedBy: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
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

idCardAssignmentSchema.index({
  institutionId: 1,
});

idCardAssignmentSchema.index({
  templateId: 1,
});

idCardAssignmentSchema.index({
  targetType: 1,
});

idCardAssignmentSchema.index({
  institutionId: 1,
  targetType: 1,
  isActive: 1,
});


// ============================================================
// MODEL
// ============================================================

export default mongoose.model(
  "IDCardAssignment",
  idCardAssignmentSchema
);