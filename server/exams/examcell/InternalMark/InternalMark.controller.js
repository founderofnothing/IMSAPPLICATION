import {
  getMyClassService,
  getClassInternalMarkContextService,
  createInternalMarkService,
  getInternalMarkService,
  updateInternalMarkService,
  deleteInternalMarkService,
  restoreInternalMarkService,
  completeInternalMarkSheetService
} from "./InternalMark.service.js";

// ======================================================
// 1. GET MY CLASS
// ======================================================

export const getMyClass = async (
  req,
  res
) => {
  try {

    const classData =
      await getMyClassService(
        req.user
      );

    return res.status(200).json({
      success: true,
      data: classData,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};


// ======================================================
// 2. GET CLASS INTERNAL MARK CONTEXT
// ======================================================

export const getClassInternalMarkContext =
  async (
    req,
    res
  ) => {

    try {

      const {
        classId,
      } = req.params;


      const institutionId =
        req.user?.institution;


      if (!institutionId) {
        return res.status(401).json({
          success: false,
          message:
            "Institution not found in authentication token",
        });
      }


      const data =
        await getClassInternalMarkContextService(
          classId,
          institutionId
        );


      return res.status(200).json({

        success: true,

        data,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ======================================================
// 3. CREATE INTERNAL MARK SHEET
// ======================================================

export const createInternalMark =
  async (
    req,
    res
  ) => {

    try {

      const internalMark =
        await createInternalMarkService(
          req.body,
          req.user
        );


      return res.status(201).json({

        success: true,

        message:
          "Internal mark sheet created successfully",

        data:
          internalMark,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ======================================================
// 4. GET INTERNAL MARK SHEET
// ======================================================

export const getInternalMark =
  async (
    req,
    res
  ) => {

    try {

      const {
        classId,
        examTitleId,
      } = req.params;


      const internalMark =
        await getInternalMarkService(

          classId,

          examTitleId,

          req.user

        );


      return res.status(200).json({

        success: true,

        data:
          internalMark,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ======================================================
// 5. UPDATE INTERNAL MARK SHEET
// ======================================================

export const updateInternalMark =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      const internalMark =
        await updateInternalMarkService(

          id,

          req.body,

          req.user

        );


      return res.status(200).json({

        success: true,

        message:
          "Internal marks updated successfully",

        data:
          internalMark,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ======================================================
// 6. DELETE INTERNAL MARK SHEET
// ======================================================

export const deleteInternalMark =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      const internalMark =
        await deleteInternalMarkService(

          id,

          req.user

        );


      return res.status(200).json({

        success: true,

        message:
          "Internal mark sheet deleted successfully",

        data:
          internalMark,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ======================================================
// 7. RESTORE INTERNAL MARK SHEET
// ======================================================

export const restoreInternalMark =
  async (
    req,
    res
  ) => {

    try {

      const {
        id,
      } = req.params;


      const internalMark =
        await restoreInternalMarkService(

          id,

          req.user

        );


      return res.status(200).json({

        success: true,

        message:
          "Internal mark sheet restored successfully",

        data:
          internalMark,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };

  // ======================================================
// COMPLETE INTERNAL MARK SHEET
// ======================================================

export const completeInternalMarkSheet = async (
  req,
  res
) => {
  try {

    const markSheet =
      await completeInternalMarkSheetService(
        req.params.id,
        req.user
      );

    return res.status(200).json({
      success: true,
      message:
        "Internal mark sheet completed successfully",
      data: markSheet,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      code:
        error.code || "INTERNAL_MARK_ERROR",
      message:
        error.message,
      details:
        error.details || null,
    });

  }
};  