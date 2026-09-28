import ProgrammeSeatLimit from "./ProgrammeSeatLimit.model.js";
import Institution from "../institution/institution.model.js";
import Department from "../department/department.model.js";
import Programme from "../programme/programme.model.js";
import Batch from "../batch/batch.model.js";


// ============================================================
// CREATE PROGRAMME SEAT LIMIT
// ============================================================
export const createProgrammeSeatLimitService = async (
  seatLimitData
) => {

  const {
    institutionId,
    programmeId,
    batchId,
    seatLimit,
  } = seatLimitData;


  // ==========================================================
  // VALIDATE REQUIRED DATA
  // ==========================================================

  if (!institutionId) {
    throw new Error(
      "Institution is required"
    );
  }

  if (!programmeId) {
    throw new Error(
      "Programme is required"
    );
  }

  if (!batchId) {
    throw new Error(
      "Batch is required"
    );
  }

  if (
    seatLimit === undefined ||
    seatLimit === null
  ) {
    throw new Error(
      "Seat limit is required"
    );
  }


  // ==========================================================
  // VALIDATE SEAT LIMIT
  // ==========================================================

  if (
    !Number.isInteger(
      Number(seatLimit)
    ) ||
    Number(seatLimit) < 1
  ) {
    throw new Error(
      "Seat limit must be a whole number greater than 0"
    );
  }


  // ==========================================================
  // CHECK INSTITUTION
  // ==========================================================

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


  // ==========================================================
  // CHECK PROGRAMME
  // ==========================================================

  const programme =
    await Programme.findOne({
      _id: programmeId,
      isDeleted: false,
    });

  if (!programme) {
    throw new Error(
      "Programme not found"
    );
  }


  // ==========================================================
  // CHECK PROGRAMME'S DEPARTMENT
  // ==========================================================

  const department =
    await Department.findOne({
      _id: programme.department,
      institution: institutionId,
      isDeleted: false,
    });

  if (!department) {
    throw new Error(
      "Programme does not belong to the selected institution"
    );
  }


  // ==========================================================
  // CHECK BATCH
  // ==========================================================

  const batch =
    await Batch.findOne({
      _id: batchId,
      institutionId: institutionId,
      isDeleted: false,
    });

  if (!batch) {
    throw new Error(
      "Batch does not belong to the selected institution"
    );
  }


  // ==========================================================
  // CHECK DUPLICATE PROGRAMME + BATCH
  // ==========================================================

  const existingSeatLimit =
    await ProgrammeSeatLimit.findOne({
      programmeId: programmeId,
      batchId: batchId,
    });

  if (existingSeatLimit) {

    if (existingSeatLimit.isDeleted) {
      throw new Error(
        "A deleted seat limit already exists for this programme and batch. Please restore it instead."
      );
    }

    throw new Error(
      "Seat limit already exists for this programme and batch"
    );
  }


  // ==========================================================
  // CREATE SEAT LIMIT
  // ==========================================================

  const seatLimitRecord =
    await ProgrammeSeatLimit.create({
      institutionId: institutionId,
      programmeId: programmeId,
      batchId: batchId,
      seatLimit: Number(seatLimit),
    });


  // ==========================================================
  // RETURN POPULATED DATA
  // ==========================================================

  const createdSeatLimit =
    await ProgrammeSeatLimit.findById(
      seatLimitRecord._id
    )
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType duration"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );


  return createdSeatLimit;
};


// ============================================================
// GET ALL PROGRAMME SEAT LIMITS
// ============================================================
export const getAllProgrammeSeatLimitsService = async () => {

  const seatLimits =
    await ProgrammeSeatLimit.find({
      isDeleted: false,
    })
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType duration"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      )
      .sort({
        createdAt: -1,
      });


  return seatLimits;
};


// ============================================================
// GET SINGLE PROGRAMME SEAT LIMIT
// ============================================================
export const getProgrammeSeatLimitByIdService = async (
  seatLimitId
) => {

  const seatLimit =
    await ProgrammeSeatLimit.findOne({
      _id: seatLimitId,
      isDeleted: false,
    })
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType duration"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );


  if (!seatLimit) {
    throw new Error(
      "Programme seat limit not found"
    );
  }


  return seatLimit;
};


// ============================================================
// UPDATE PROGRAMME SEAT LIMIT
// ============================================================
export const updateProgrammeSeatLimitService = async (
  seatLimitId,
  updateData
) => {

  // ==========================================================
  // CHECK EXISTING SEAT LIMIT
  // ==========================================================

  const existingSeatLimit =
    await ProgrammeSeatLimit.findOne({
      _id: seatLimitId,
      isDeleted: false,
    });

  if (!existingSeatLimit) {
    throw new Error(
      "Programme seat limit not found"
    );
  }


  // ==========================================================
  // GET UPDATE VALUES
  // ==========================================================

  const {
    institutionId,
    programmeId,
    batchId,
    seatLimit,
  } = updateData;


  // ==========================================================
  // PREPARE FINAL VALUES
  // ==========================================================

  const finalInstitutionId =
    institutionId ||
    existingSeatLimit.institutionId;

  const finalProgrammeId =
    programmeId ||
    existingSeatLimit.programmeId;

  const finalBatchId =
    batchId ||
    existingSeatLimit.batchId;

  const finalSeatLimit =
    seatLimit !== undefined
      ? seatLimit
      : existingSeatLimit.seatLimit;


  // ==========================================================
  // VALIDATE SEAT LIMIT
  // ==========================================================

  if (
    !Number.isInteger(
      Number(finalSeatLimit)
    ) ||
    Number(finalSeatLimit) < 1
  ) {
    throw new Error(
      "Seat limit must be a whole number greater than 0"
    );
  }


  // ==========================================================
  // CHECK INSTITUTION
  // ==========================================================

  const institution =
    await Institution.findOne({
      _id: finalInstitutionId,
      isDeleted: false,
    });

  if (!institution) {
    throw new Error(
      "Institution not found"
    );
  }


  // ==========================================================
  // CHECK PROGRAMME
  // ==========================================================

  const programme =
    await Programme.findOne({
      _id: finalProgrammeId,
      isDeleted: false,
    });

  if (!programme) {
    throw new Error(
      "Programme not found"
    );
  }


  // ==========================================================
  // CHECK PROGRAMME → DEPARTMENT → INSTITUTION
  // ==========================================================

  const department =
    await Department.findOne({
      _id: programme.department,
      institution: finalInstitutionId,
      isDeleted: false,
    });

  if (!department) {
    throw new Error(
      "Programme does not belong to the selected institution"
    );
  }


  // ==========================================================
  // CHECK BATCH → INSTITUTION
  // ==========================================================

  const batch =
    await Batch.findOne({
      _id: finalBatchId,
      institutionId: finalInstitutionId,
      isDeleted: false,
    });

  if (!batch) {
    throw new Error(
      "Batch does not belong to the selected institution"
    );
  }


  // ==========================================================
  // CHECK DUPLICATE PROGRAMME + BATCH
  // ==========================================================

  const duplicateSeatLimit =
    await ProgrammeSeatLimit.findOne({
      _id: {
        $ne: seatLimitId,
      },

      programmeId: finalProgrammeId,

      batchId: finalBatchId,

      isDeleted: false,
    });

  if (duplicateSeatLimit) {
    throw new Error(
      "Seat limit already exists for this programme and batch"
    );
  }


  // ==========================================================
  // UPDATE
  // ==========================================================

  const updatedSeatLimit =
    await ProgrammeSeatLimit.findByIdAndUpdate(
      seatLimitId,
      {
        institutionId:
          finalInstitutionId,

        programmeId:
          finalProgrammeId,

        batchId:
          finalBatchId,

        seatLimit:
          Number(finalSeatLimit),
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    )
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType duration"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );


  return updatedSeatLimit;
};


// ============================================================
// DELETE PROGRAMME SEAT LIMIT
// SOFT DELETE
// ============================================================
export const deleteProgrammeSeatLimitService = async (
  seatLimitId
) => {
  const seatLimit =
    await ProgrammeSeatLimit.findOne({
      _id: seatLimitId,
      isDeleted: false,
    });

  if (!seatLimit) {
    throw new Error(
      "Programme seat limit not found"
    );
  }

  const deletedSeatLimit =
    await ProgrammeSeatLimit.findByIdAndUpdate(
      seatLimitId,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      {
        returnDocument: "after",
      }
    );

  return deletedSeatLimit;
};

// ============================================================
// GET DELETED PROGRAMME SEAT LIMITS
// ============================================================
export const getDeletedProgrammeSeatLimitsService = async () => {
  const seatLimits =
    await ProgrammeSeatLimit.find({
      isDeleted: true,
    })
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType duration"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      )
      .sort({ deletedAt: -1 });

  return seatLimits;
};


// ============================================================
// PERMANENT DELETE PROGRAMME SEAT LIMIT
// ============================================================

export const permanentDeleteProgrammeSeatLimitService =
  async (seatLimitId) => {
    const seatLimit =
      await ProgrammeSeatLimit.findById(
        seatLimitId
      );

    if (!seatLimit) {
      throw new Error(
        "Programme seat limit not found"
      );
    }

    const deletedSeatLimit =
      await ProgrammeSeatLimit.findByIdAndDelete(
        seatLimitId
      );

    return deletedSeatLimit;
  };


// ============================================================
// RESTORE PROGRAMME SEAT LIMIT
// ============================================================
export const restoreProgrammeSeatLimitService = async (
  seatLimitId
) => {
  const seatLimit =
    await ProgrammeSeatLimit.findOne({
      _id: seatLimitId,
      isDeleted: true,
    });

  if (!seatLimit) {
    throw new Error(
      "Deleted programme seat limit not found"
    );
  }

  // Check whether another active seat limit
  // already exists for the same programme + batch
  const existingActiveSeatLimit =
    await ProgrammeSeatLimit.findOne({
      _id: { $ne: seatLimitId },
      programmeId: seatLimit.programmeId,
      batchId: seatLimit.batchId,
      isDeleted: false,
    });

  if (existingActiveSeatLimit) {
    throw new Error(
      "An active seat limit already exists for this programme and batch. The deleted record cannot be restored."
    );
  }

  const restoredSeatLimit =
    await ProgrammeSeatLimit.findByIdAndUpdate(
      seatLimitId,
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        returnDocument: "after",
      }
    )
      .populate(
        "institutionId",
        "institutionName institutionCode"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType duration"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );

  return restoredSeatLimit;
};