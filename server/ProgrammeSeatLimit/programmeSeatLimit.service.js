import mongoose from "mongoose";
import ProgrammeSeatLimit from "./ProgrammeSeatLimit.model.js";
import Institution from "../institution/institution.model.js";
import Programme from "../programme/programme.model.js";
import Batch from "../batch/batch.model.js";

/**
 * CREATE PROGRAMME SEAT LIMIT
 */
export const createProgrammeSeatLimitService = async (data) => {
  try {
    const {
      institutionId,
      programmeId,
      batchId,
      seatLimit,
    } = data;

    // -----------------------------------------
    // Validate ObjectIds
    // -----------------------------------------
    if (!mongoose.Types.ObjectId.isValid(institutionId)) {
      throw new Error("Invalid institution ID");
    }

    if (!mongoose.Types.ObjectId.isValid(programmeId)) {
      throw new Error("Invalid programme ID");
    }

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      throw new Error("Invalid batch ID");
    }

    // -----------------------------------------
    // Validate seat limit
    // -----------------------------------------
    if (
      seatLimit === undefined ||
      seatLimit === null ||
      !Number.isInteger(Number(seatLimit)) ||
      Number(seatLimit) < 1
    ) {
      throw new Error("Seat limit must be a whole number greater than 0");
    }

    // -----------------------------------------
    // Check Institution
    // -----------------------------------------
    const institution = await Institution.findOne({
      _id: institutionId,
      isDeleted: false,
    });

    if (!institution) {
      throw new Error("Institution not found");
    }

    // -----------------------------------------
    // Check Programme
    // -----------------------------------------
    const programme = await Programme.findOne({
      _id: programmeId,
      isDeleted: false,
    });

    if (!programme) {
      throw new Error("Programme not found");
    }

    // -----------------------------------------
    // Check Batch
    // -----------------------------------------
    const batch = await Batch.findOne({
      _id: batchId,
      institutionId,
      isDeleted: false,
    });

    if (!batch) {
      throw new Error(
        "Batch not found or batch does not belong to the selected institution"
      );
    }

    // -----------------------------------------
    // Check Programme belongs to Institution
    // -----------------------------------------
    const department = await mongoose.model("Department").findOne({
      _id: programme.department,
      institutionId,
      isDeleted: false,
    });

    if (!department) {
      throw new Error(
        "Programme does not belong to the selected institution"
      );
    }

    // -----------------------------------------
    // Check duplicate configuration
    // -----------------------------------------
    const existingSeatLimit = await ProgrammeSeatLimit.findOne({
      programmeId,
      batchId,
    });

    if (existingSeatLimit) {
      if (existingSeatLimit.isDeleted) {
        throw new Error(
          "A deleted seat-limit configuration already exists for this programme and batch. Restore it instead."
        );
      }

      throw new Error(
        "Seat limit already exists for this programme and batch"
      );
    }

    // -----------------------------------------
    // Create Seat Limit
    // -----------------------------------------
    const seatLimitRecord = await ProgrammeSeatLimit.create({
      institutionId,
      programmeId,
      batchId,
      seatLimit: Number(seatLimit),
    });

    // -----------------------------------------
    // Return populated document
    // -----------------------------------------
    const result = await ProgrammeSeatLimit.findById(
      seatLimitRecord._id
    )
      .populate("institutionId", "institutionName")
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );

    return result;
  } catch (error) {
    throw error;
  }
};


/**
 * GET ALL ACTIVE PROGRAMME SEAT LIMITS
 */
export const getAllProgrammeSeatLimitsService = async (
  institutionId
) => {
  try {
    const filter = {
      isDeleted: false,
    };

    // Optional institution filter
    if (institutionId) {
      if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID");
      }

      filter.institutionId = institutionId;
    }

    const seatLimits = await ProgrammeSeatLimit.find(filter)
      .populate("institutionId", "institutionName")
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      )
      .sort({ createdAt: -1 });

    return seatLimits;
  } catch (error) {
    throw error;
  }
};


/**
 * GET SINGLE PROGRAMME SEAT LIMIT
 */
export const getProgrammeSeatLimitByIdService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid programme seat limit ID");
    }

    const seatLimit = await ProgrammeSeatLimit.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("institutionId", "institutionName")
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );

    if (!seatLimit) {
      throw new Error("Programme seat limit not found");
    }

    return seatLimit;
  } catch (error) {
    throw error;
  }
};


/**
 * UPDATE PROGRAMME SEAT LIMIT
 */
export const updateProgrammeSeatLimitService = async (
  id,
  data
) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid programme seat limit ID");
    }

    const {
      institutionId,
      programmeId,
      batchId,
      seatLimit,
    } = data;

    // -----------------------------------------
    // Find existing record
    // -----------------------------------------
    const existingSeatLimit =
      await ProgrammeSeatLimit.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!existingSeatLimit) {
      throw new Error("Programme seat limit not found");
    }

    // -----------------------------------------
    // Validate seat limit
    // -----------------------------------------
    if (
      seatLimit !== undefined &&
      (
        !Number.isInteger(Number(seatLimit)) ||
        Number(seatLimit) < 1
      )
    ) {
      throw new Error(
        "Seat limit must be a whole number greater than 0"
      );
    }

    // -----------------------------------------
    // Determine final values
    // -----------------------------------------
    const finalInstitutionId =
      institutionId || existingSeatLimit.institutionId;

    const finalProgrammeId =
      programmeId || existingSeatLimit.programmeId;

    const finalBatchId =
      batchId || existingSeatLimit.batchId;

    // -----------------------------------------
    // Validate ObjectIds
    // -----------------------------------------
    if (
      !mongoose.Types.ObjectId.isValid(
        finalInstitutionId
      )
    ) {
      throw new Error("Invalid institution ID");
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        finalProgrammeId
      )
    ) {
      throw new Error("Invalid programme ID");
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        finalBatchId
      )
    ) {
      throw new Error("Invalid batch ID");
    }

    // -----------------------------------------
    // Check Institution
    // -----------------------------------------
    const institution = await Institution.findOne({
      _id: finalInstitutionId,
      isDeleted: false,
    });

    if (!institution) {
      throw new Error("Institution not found");
    }

    // -----------------------------------------
    // Check Programme
    // -----------------------------------------
    const programme = await Programme.findOne({
      _id: finalProgrammeId,
      isDeleted: false,
    });

    if (!programme) {
      throw new Error("Programme not found");
    }

    // -----------------------------------------
    // Check Batch
    // -----------------------------------------
    const batch = await Batch.findOne({
      _id: finalBatchId,
      institutionId: finalInstitutionId,
      isDeleted: false,
    });

    if (!batch) {
      throw new Error(
        "Batch not found or batch does not belong to the selected institution"
      );
    }

    // -----------------------------------------
    // Check Programme belongs to Institution
    // -----------------------------------------
    const department = await mongoose.model("Department").findOne({
      _id: programme.department,
      institutionId: finalInstitutionId,
      isDeleted: false,
    });

    if (!department) {
      throw new Error(
        "Programme does not belong to the selected institution"
      );
    }

    // -----------------------------------------
    // Check duplicate configuration
    // -----------------------------------------
    const duplicate = await ProgrammeSeatLimit.findOne({
      _id: { $ne: id },
      programmeId: finalProgrammeId,
      batchId: finalBatchId,
      isDeleted: false,
    });

    if (duplicate) {
      throw new Error(
        "Another seat-limit configuration already exists for this programme and batch"
      );
    }

    // -----------------------------------------
    // Update
    // -----------------------------------------
    existingSeatLimit.institutionId =
      finalInstitutionId;

    existingSeatLimit.programmeId =
      finalProgrammeId;

    existingSeatLimit.batchId =
      finalBatchId;

    if (seatLimit !== undefined) {
      existingSeatLimit.seatLimit =
        Number(seatLimit);
    }

    await existingSeatLimit.save();

    // -----------------------------------------
    // Return populated document
    // -----------------------------------------
    const result = await ProgrammeSeatLimit.findById(
      existingSeatLimit._id
    )
      .populate("institutionId", "institutionName")
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );

    return result;
  } catch (error) {
    throw error;
  }
};


/**
 * SOFT DELETE PROGRAMME SEAT LIMIT
 */
export const deleteProgrammeSeatLimitService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid programme seat limit ID");
    }

    const seatLimit = await ProgrammeSeatLimit.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!seatLimit) {
      throw new Error("Programme seat limit not found");
    }

    seatLimit.isDeleted = true;
    seatLimit.deletedAt = new Date();

    await seatLimit.save();

    return seatLimit;
  } catch (error) {
    throw error;
  }
};


/**
 * GET ALL DELETED PROGRAMME SEAT LIMITS
 */
export const getDeletedProgrammeSeatLimitsService = async (
  institutionId
) => {
  try {
    const filter = {
      isDeleted: true,
    };

    if (institutionId) {
      if (!mongoose.Types.ObjectId.isValid(institutionId)) {
        throw new Error("Invalid institution ID");
      }

      filter.institutionId = institutionId;
    }

    const seatLimits = await ProgrammeSeatLimit.find(filter)
      .populate("institutionId", "institutionName")
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      )
      .sort({ deletedAt: -1 });

    return seatLimits;
  } catch (error) {
    throw error;
  }
};


/**
 * RESTORE PROGRAMME SEAT LIMIT
 */
export const restoreProgrammeSeatLimitService = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid programme seat limit ID");
    }

    const seatLimit = await ProgrammeSeatLimit.findOne({
      _id: id,
      isDeleted: true,
    });

    if (!seatLimit) {
      throw new Error(
        "Deleted programme seat limit not found"
      );
    }

    // -----------------------------------------
    // Check if another active configuration
    // already exists
    // -----------------------------------------
    const existingActive =
      await ProgrammeSeatLimit.findOne({
        _id: { $ne: id },
        programmeId: seatLimit.programmeId,
        batchId: seatLimit.batchId,
        isDeleted: false,
      });

    if (existingActive) {
      throw new Error(
        "An active seat-limit configuration already exists for this programme and batch"
      );
    }

    seatLimit.isDeleted = false;
    seatLimit.deletedAt = null;

    await seatLimit.save();

    const result = await ProgrammeSeatLimit.findById(
      seatLimit._id
    )
      .populate("institutionId", "institutionName")
      .populate(
        "programmeId",
        "programmeName programmeCode programmeType"
      )
      .populate(
        "batchId",
        "batchName admissionYear graduationYear currentYear status"
      );

    return result;
  } catch (error) {
    throw error;
  }
};


/**
 * PERMANENT DELETE PROGRAMME SEAT LIMIT
 */
export const permanentDeleteProgrammeSeatLimitService =
  async (id) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(
          "Invalid programme seat limit ID"
        );
      }

      const seatLimit =
        await ProgrammeSeatLimit.findOne({
          _id: id,
          isDeleted: true,
        });

      if (!seatLimit) {
        throw new Error(
          "Deleted programme seat limit not found"
        );
      }

      await ProgrammeSeatLimit.deleteOne({
        _id: id,
      });

      return {
        message:
          "Programme seat limit permanently deleted",
      };
    } catch (error) {
      throw error;
    }
  };