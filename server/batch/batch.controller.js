import {
  createBatchService,
  getAllBatchService,
  getBatchesByInstitutionService,
  getStudentsByBatchService,
  updateBatchService,
  deleteBatchService,
  getDeletedBatchService,
  restoreBatchService,
  permanentDeleteBatchService
} from "./batch.service.js";

// CREATE BATCH
export const createBatch = async (req, res) => {
  try {

    const batch = await createBatchService(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "Batch created successfully.",
      data: batch,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};
  // FETCH ALL BATCHES
// FETCH ALL BATCHES
export const getAllBatch = async (req, res) => {
  try {

    const result = await getAllBatchService(
      req.query,
      req.user
    );

    return res.status(200).json({

      success: true,

      message:
        result.pagination.totalRecords > 0
          ? "Batches fetched successfully."
          : "No batches found.",

      statistics:
        result.statistics,

      pagination:
        result.pagination,

      data:
        result.batches,

    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message,

    });

  }
};
// ==================== GET BATCHES BY INSTITUTION ====================
export const getBatchesByInstitution =
  async (req, res) => {
    try {

      const batches =
        await getBatchesByInstitutionService(
          req.params.institutionId
        );

      return res.status(200).json({
        success: true,

        message:
          batches.length > 0
            ? "Batches fetched successfully."
            : "No batches found.",

        count:
          batches.length,

        data:
          batches,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }
  };

//   / FETCH SINGLE BATCH
export const getStudentsByBatch =
  async (req, res) => {

    try {

      const result =
        await getStudentsByBatchService(
          req.params.id,
          req.query,
          req.user
        );

      return res.status(200).json({

        success: true,

        message:
          result.pagination.totalRecords > 0
            ? "Students fetched successfully."
            : "No students found in this batch.",

        batch:
          result.batch,

        pagination:
          result.pagination,

        data:
          result.students,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // UPDATE BATCH
export const updateBatch =
  async (req, res) => {

    try {

      const batch =
     await updateBatchService(
  req.params.id,
  req.body,
  req.user
);

      return res.status(200).json({

        success: true,

        message:
          "Batch updated successfully.",

        data:
          batch,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // DELETE BATCH
export const deleteBatch =
  async (req, res) => {

    try {

      const batch =
      await deleteBatchService(
  req.params.id,
  req.user
);

      return res.status(200).json({

        success: true,

        message:
          "Batch moved to recycle bin successfully.",

        data:
          batch,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // FETCH ALL DELETED BATCHES
export const getDeletedBatch =
  async (req, res) => {

    try {

      const result =
      await getDeletedBatchService(
  req.query,
  req.user
);

      return res.status(200).json({

        success: true,

        message:
          result.totalRecords > 0
            ? "Deleted batches fetched successfully."
            : "No deleted batches found.",

        currentPage:
          result.currentPage,

        totalPages:
          result.totalPages,

        totalRecords:
          result.totalRecords,

        limit:
          result.limit,

        data:
          result.batches,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // RESTORE BATCH
export const restoreBatch =
  async (req, res) => {

    try {

      const batch =
      await restoreBatchService(
  req.params.id,
  req.user
);

      return res.status(200).json({

        success: true,

        message:
          "Batch restored successfully.",

        data:
          batch,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };
  // PERMANENT DELETE BATCH
export const permanentDeleteBatch =
  async (req, res) => {

    try {

   await permanentDeleteBatchService(
  req.params.id,
  req.user
);

      return res.status(200).json({

        success: true,

        message:
          "Batch permanently deleted successfully.",

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };