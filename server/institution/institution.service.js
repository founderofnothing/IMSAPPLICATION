import Institution from "./institution.model.js";
import Department from "../department/department.model.js"
import Class from "../class/class.model.js"
import Student from "../student/student.model.js"










// create institution 
export const createInstitutionService = async (institutionData) => {
  const {
    institutionName,
    institutionCode,
    principal,
    departments,
    address,
  } = institutionData;

  // =========================
  // NORMALIZATION
  // =========================

  const normalizeText = (value) => {
    if (typeof value !== "string") return value;

    return value
      .trim()
      .replace(/\s+/g, " ");
  };

  const normalizedInstitutionName =
    normalizeText(institutionName);

  const normalizedInstitutionCode =
    normalizeText(institutionCode).toUpperCase();

  const normalizedAddress = {
    addressLine1: normalizeText(address?.addressLine1 || ""),
    addressLine2: normalizeText(address?.addressLine2 || ""),
    city: normalizeText(address?.city || ""),
    district: normalizeText(address?.district || ""),
    state: normalizeText(address?.state || ""),
    pincode: normalizeText(address?.pincode || ""),
    country: normalizeText(address?.country || "India"),
  };

  // =========================
  // CHECK DUPLICATE CODE
  // =========================

  const existingInstitution =
    await Institution.findOne({
      institutionCode: normalizedInstitutionCode,
      isDeleted: false,
    });

  if (existingInstitution) {
    throw new Error("Institution code already exists");
  }

  // =========================
  // CREATE INSTITUTION
  // =========================

  const institution = await Institution.create({
    institutionName: normalizedInstitutionName,
    institutionCode: normalizedInstitutionCode,
    principal: principal || null,
    departments: departments || [],
    address: normalizedAddress,
  });

  return institution;
};
// get all institution 
export const getAllInstitutionsService = async () => {
   const institutions =
  await Institution.find({
    isDeleted: false,
  })
      .populate("principal", "fullName email role")
      .populate("departments", "departmentName");
  
    return institutions;
};
//   get single institution 
export const getInstitutionByIdService = async (
    institutionId
  ) => {
 const institution =
  await Institution.findOne({
    _id: institutionId,
    isDeleted: false,
  })
      .populate(
        "principal",
        "fullName email role"
      )
  
      // Uncomment after creating Department model
      .populate(
        "departments",
        "departmentName"
      );
  
    if (!institution) {
      throw new Error("Institution not found");
    }
  
    return institution;
};
// update intitution 
// =========================
// UPDATE INSTITUTION SERVICE
// =========================

export const updateInstitutionService = async (
  institutionId,
  updateData
) => {

  // =========================
  // NORMALIZATION HELPER
  // =========================

  const normalizeText = (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return value
      .trim()
      .replace(/\s+/g, " ");
  };

  // =========================
  // CHECK INSTITUTION EXISTS
  // =========================

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

  // =========================
  // PREPARE UPDATE DATA
  // =========================

  const normalizedUpdate = {
    ...updateData,
  };

  // =========================
  // NORMALIZE INSTITUTION NAME
  // =========================

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

  // =========================
  // NORMALIZE INSTITUTION CODE
  // =========================

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

    // =========================
    // CHECK DUPLICATE CODE
    // =========================

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

  // =========================
  // NORMALIZE ADDRESS
  // =========================

  if (
    updateData.address &&
    typeof updateData.address === "object"
  ) {

    const existingAddress =
      existingInstitution.address
        ? existingInstitution.address.toObject
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

    addressFields.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(
          updateData.address,
          field
        )
      ) {
        normalizedUpdate.address[field] =
          normalizeText(
            updateData.address[field]
          );
      }
    });
  }

  // =========================
  // UPDATE INSTITUTION
  // =========================

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
// delete institution 
export const deleteInstitutionService = async (
    institutionId
  ) => {
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
      deletedAt:
        new Date(),
    },
    {
      returnDocument:
        "after",
    }
  );

return deletedInstitution;
};  


// get the deleted institution from the department 
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
// restore the deleted institution 
export const restoreInstitutionService =
  async (
    institutionId
  ) => {

    const institution =
      await Institution.findOne({
        _id:
          institutionId,

        isDeleted:
          true,
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
        returnDocument:
          "after",
      }
    );
};
// delete permamnat from the db
export const permanentDeleteInstitutionService =
  async (
    institutionId
  ) => {

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









// GET INSTITUTION FROM JWT 
export const getMyInstitutionService = async (institutionId) => {
  // 1. Fetch institution
  const institution = await Institution.findOne({
    _id: institutionId,
    isDeleted: false,
  })
    .select("institutionName institutionCode principal")
    .populate("principal", "fullName email role")
    .lean();

  if (!institution) {
    throw new Error("Institution not found");
  }

  // 2. Fetch departments belonging to this institution
  const departments = await Department.find({
    institution: institutionId,
    isDeleted: false,
  })
    .select("_id departmentName departmentCode")
    .lean();

  // 3. Fetch dashboard statistics
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

  // 4. Return frontend-friendly data
  return {
    institution: {
      _id: institution._id,
      institutionName: institution.institutionName,
      institutionCode: institution.institutionCode,
      principal: institution.principal,
    },

    departments,

    stats: {
      totalDepartments: departments.length,
      totalClasses,
      totalStudents,
    },
  };
};



  // get dept by institution id
export const getDepartmentsByInstitutionService = async (
  institutionId
) => {
const departments =
  await Department.find({
    institution:
      institutionId,

    isDeleted:
      false,
  })
   .select("departmentName")
      .sort({
        departmentName: 1,
      });

  return departments;
};