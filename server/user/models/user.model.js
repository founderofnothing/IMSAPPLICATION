import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "teaching_faculty",
        "non_teaching_faculty",
        "student",
        "parent",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },

    profileImage: {
      type: String,
      default: null,
    },

   institution: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Institution",
  required: true,
},

    // Null for Principal, Super Admin, Admin, etc.
   department: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Department",
  default: null,
},

    lastLogin: {
      type: Date,
      default: null,
    },


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

export default mongoose.model("User", userSchema);