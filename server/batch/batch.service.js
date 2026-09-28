import Batch from "./batch.model.js";
import Student from "../student/student.model.js"
import mongoose from "mongoose";










// CREATE BATCH
export const createBatchService =
  async (batchData, user) => {

    // Normalize Input

    batchData.batchName =
      batchData.batchName?.trim();

    batchData.remarks =
      batchData.remarks?.trim();

    // Check Duplicate Batch Name

  const existingBatch =
  await Batch.findOne({

    institutionId: user.institution,

    batchName: batchData.batchName,

    isDeleted: {
      $ne: true,
    },

  });

    if (existingBatch) {

      throw new Error(
        "Batch already exists."
      );

    }

    // Validate Years

    if (
      batchData.admissionYear >=
      batchData.graduationYear
    ) {

      throw new Error(
        "Graduation year must be greater than admission year."
      );

    }

    // Validate Current Year

    const duration =
      batchData.graduationYear -
      batchData.admissionYear;

    if (
      batchData.currentYear <
        1 ||
      batchData.currentYear >
        duration
    ) {

      throw new Error(
        `Current year must be between 1 and ${duration}.`
      );

    }

    // Create Batch
 batchData.institutionId = user.institution;
    const batch =
      await Batch.create(
        batchData
      );

    return batch;
  };
  // FETCH ALL BATCHES
export const getAllBatchService =
async (query, user) => {

    const {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = query;

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

    // -------------------------
    // Base Filter
    // -------------------------

  const filter = {

  institutionId: user.institution,

  isDeleted: {
    $ne: true,
  },

};

    // -------------------------
    // Search
    // -------------------------

    if (search) {

      filter.batchName = {
        $regex: search,
        $options: "i",
      };

    }

    // -------------------------
    // Status
    // -------------------------

    if (status) {
      filter.status = status;
    }

    // -------------------------
    // Count
    // -------------------------

    const totalRecords =
      await Batch.countDocuments(
        filter
      );

    // -------------------------
    // Fetch Batches
    // -------------------------

    const batches =
      await Batch.find(filter)
        .sort({
          admissionYear: -1,
        })
        .skip(
          (currentPage - 1) *
            pageLimit
        )
        .limit(pageLimit);

    // -------------------------
    // Statistics
    // -------------------------

   const activeBatches =
  await Batch.countDocuments({

    institutionId: user.institution,

    isDeleted: false,

    status: "Active",

  });

   const completedBatches =
  await Batch.countDocuments({

    institutionId: user.institution,

    isDeleted: false,

    status: "Completed",

  });

    return {

      statistics: {

        totalBatches:
          totalRecords,

        activeBatches,

        completedBatches,

      },

      pagination: {

        currentPage,

        totalPages:
          Math.ceil(
            totalRecords /
              pageLimit
          ),

        totalRecords,

        limit:
          pageLimit,

      },

      batches,

    };

  };
  // ==================== GET BATCHES BY INSTITUTION ====================
export const getBatchesByInstitutionService = async (
  institutionId
) => {

  if (
    !mongoose.Types.ObjectId.isValid(
      institutionId
    )
  ) {
    throw new Error(
      "Invalid institution ID."
    );
  }

  const batches = await Batch.find({
    institutionId,
    isDeleted: {
      $ne: true,
    },
  })
    .sort({
      admissionYear: -1,
    })
    .lean();

  return batches;
};
  // FETCH SINGLE BATCH
export const getStudentsByBatchService = async (
  batchId,
  query,
  user
) => {
  // -------------------------
  // Validate Batch Id
  // -------------------------

  if (!mongoose.Types.ObjectId.isValid(batchId)) {
    throw new Error("Invalid batch ID.");
  }
  const batch = await Batch.findOne({
  _id: batchId,
  institutionId: user.institution,
  isDeleted: {
    $ne: true,
  },
}).select(
  "batchName admissionYear graduationYear currentYear status"
);

if (!batch) {
  throw new Error("Batch not found.");
}

  const {
    page = 1,
    limit = 10,
    search = "",
    department,
    programme,
    gender,
  } = query;

  const currentPage = Number(page);
  const pageLimit = Number(limit);

  // -------------------------
  // Base Filter
  // -------------------------

  const filter = {
    institutionId: user.institution,
    batchId,
    isDeleted: {
      $ne: true,
    },
  };

  // -------------------------
  // Department Filter
  // -------------------------

  if (department) {
    filter.departmentId = department;
  }

  // -------------------------
  // Programme Filter
  // -------------------------

  if (programme) {
    filter.programmeId = programme;
  }

  // -------------------------
  // Gender Filter
  // -------------------------

  if (gender) {
    filter.gender = gender;
  }

  // -------------------------
  // Search
  // -------------------------

  if (search) {
    filter.$or = [
      {
        studentName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        studentEmail: {
          $regex: search,
          $options: "i",
        },
      },
      {
        registerNumber: {
          $regex: search,
          $options: "i",
        },
      },
      {
        applicationNumber: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // -------------------------
  // Total Records
  // -------------------------

  const totalRecords =
    await Student.countDocuments(filter);

  // -------------------------
  // Fetch Students
  // -------------------------

const students = await Student.find(filter)
  .select(
    `
      registerNumber
      studentName
      profileImage
      studentEmail
      departmentId
      programmeId
      classId
    `
  )
  .populate(
    "departmentId",
    "departmentName departmentCode"
  )
  .populate(
    "programmeId",
    "programmeName programmeCode"
  )
  .populate(
    "classId",
    "className year section"
  )
 .sort({
  registerNumber: 1,
})
  .skip((currentPage - 1) * pageLimit)
  .limit(pageLimit);

  // -------------------------
  // Response
  // -------------------------

return {
  batch,

  pagination: {
    currentPage,

    totalPages: Math.ceil(
      totalRecords / pageLimit
    ),

    totalRecords,

    limit: pageLimit,
  },

  students,
};
};
  // UPDATE BATCH
export const updateBatchService =
  async (
  batchId,
  updateData,
  user
)=> {

    // Validate ObjectId

    if (
      !mongoose.Types.ObjectId.isValid(
        batchId
      )
    ) {

      throw new Error(
        "Invalid batch ID."
      );

    }

    // Check Batch Exists

  const existingBatch =
  await Batch.findOne({

    _id: batchId,

    institutionId: user.institution,

    isDeleted: {
      $ne: true,
    },

  });

    if (!existingBatch) {

      throw new Error(
        "Batch not found."
      );

    }

    // Normalize Input

    if (
      updateData.batchName
    ) {

      updateData.batchName =
        updateData.batchName.trim();

    }

    if (
      updateData.remarks
    ) {

      updateData.remarks =
        updateData.remarks.trim();

    }

    // Check Duplicate Batch Name

    if (
      updateData.batchName
    ) {

    const duplicateBatch =
  await Batch.findOne({

    institutionId: user.institution,

    batchName:
      updateData.batchName,

    _id: {
      $ne: batchId,
    },

    isDeleted: {
      $ne: true,
    },

  });

      if (duplicateBatch) {

        throw new Error(
          "Batch already exists."
        );

      }

    }

    // Validate Years

    const admissionYear =
      updateData.admissionYear ??
      existingBatch.admissionYear;

    const graduationYear =
      updateData.graduationYear ??
      existingBatch.graduationYear;

    const currentYear =
      updateData.currentYear ??
      existingBatch.currentYear;

    if (
      admissionYear >=
      graduationYear
    ) {

      throw new Error(
        "Graduation year must be greater than admission year."
      );

    }

    const duration =
      graduationYear -
      admissionYear;

    if (
      currentYear < 1 ||
      currentYear > duration
    ) {

      throw new Error(
        `Current year must be between 1 and ${duration}.`
      );

    }

    // Update Batch

const updatedBatch =
  await Batch.findOneAndUpdate(
    {
      _id: batchId,
      institutionId: user.institution,
      isDeleted: {
        $ne: true,
      },
    },
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

    return updatedBatch;

  };
  // DELETE BATCH
export const deleteBatchService =
 async (batchId, user) => {

    // Validate ObjectId

    if (
      !mongoose.Types.ObjectId.isValid(
        batchId
      )
    ) {

      throw new Error(
        "Invalid batch ID."
      );

    }

    // Check Batch Exists

const existingBatch =
  await Batch.findOne({

    _id: batchId,

    institutionId: user.institution,

    isDeleted: {
      $ne: true,
    },

  });

    if (!existingBatch) {

      throw new Error(
        "Batch not found."
      );

    }

    // Soft Delete

    const deletedBatch =
   await Batch.findOneAndUpdate(
  {
    _id: batchId,

    institutionId: user.institution,

    isDeleted: {
      $ne: true,
    },
  },
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

    return deletedBatch;

  };


// /RECYCLE BIN 



  // FETCH ALL DELETED BATCHES
export const getDeletedBatchService =
  async (query, user) => {

    const {
      page = 1,
      limit = 10,
      search = "",
      status,
    } = query;

    const currentPage =
      Number(page);

    const pageLimit =
      Number(limit);

  const filter = {

  institutionId: user.institution,

  isDeleted: true,

};

    // Search

    if (search) {

      filter.batchName = {

        $regex: search,

        $options: "i",

      };

    }

    // Status

    if (status) {
      filter.status = status;
    }

    const totalRecords =
      await Batch.countDocuments(
        filter
      );

    const batches =
      await Batch.find(filter)
        .sort({
          deletedAt: -1,
        })
        .skip(
          (currentPage - 1) *
            pageLimit
        )
        .limit(pageLimit);

    return {

      currentPage,

      totalPages:
        Math.ceil(
          totalRecords /
            pageLimit
        ),

      totalRecords,

      limit:
        pageLimit,

      batches,

    };

  };
  // RESTORE BATCH
export const restoreBatchService =
 async (batchId, user) => {

    if (
      !mongoose.Types.ObjectId.isValid(
        batchId
      )
    ) {

      throw new Error(
        "Invalid batch ID."
      );

    }

   const batch =
  await Batch.findOne({

    _id: batchId,

    institutionId: user.institution,

    isDeleted: true,

  });

    if (!batch) {

      throw new Error(
        "Deleted batch not found."
      );

    }

    const restoredBatch =
   await Batch.findOneAndUpdate(
  {
    _id: batchId,

    institutionId: user.institution,

    isDeleted: true,
  },
  {
    isDeleted: false,

    deletedAt: null,
  },
  {
    returnDocument: "after",

    runValidators: true,
  }
);

    return restoredBatch;

  };
  // PERMANENT DELETE BATCH
export const permanentDeleteBatchService =
  async (batchId, user)=> {

    if (
      !mongoose.Types.ObjectId.isValid(
        batchId
      )
    ) {

      throw new Error(
        "Invalid batch ID."
      );

    }

   const batch =
  await Batch.findOne({

    _id: batchId,

    institutionId: user.institution,

  });

    if (!batch) {

      throw new Error(
        "Batch not found."
      );

    }

    if (!batch.isDeleted) {

      throw new Error(
        "Please move the batch to the recycle bin before permanently deleting it."
      );

    }

   await Batch.findOneAndDelete({
  _id: batchId,

  institutionId: user.institution,

  isDeleted: true,
});

    return;
  };