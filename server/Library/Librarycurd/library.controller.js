import {
  createLibraryService,
  getLibrariesService,
  getLibraryByIdService,
  updateLibraryService,
  deleteLibraryService,
  getDeletedLibrariesService,
  restoreLibraryService,
  permanentlyDeleteLibraryService,
} from "./library.service.js";

/**
 * CREATE LIBRARY
 */
export const createLibrary = async (req, res) => {
  try {
    const {
      libraryName,
      libraryCode,
      about,
      status,
    } = req.body;

    // JWT values
    const createdBy = req.user?.userId;
    const institutionId = req.user?.institution;

    // Basic validation
    if (!libraryName || !libraryCode) {
      return res.status(400).json({
        success: false,
        message: "Library name and library code are required.",
      });
    }

    // Check authenticated institution
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    // Check authenticated user
    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    const library = await createLibraryService({
      institutionId,
      libraryName,
      libraryCode,
      about,
      status,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Library created successfully.",
      data: library,
    });
  } catch (error) {
    console.error("Create Library Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create library.",
    });
  }
};

/**
 * GET ALL LIBRARIES
 */
export const getLibraries = async (req, res) => {
  try {
    const {
      search,
      status,
    } = req.query;

    // Institution comes from JWT
    const institutionId = req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    const libraries = await getLibrariesService({
      institutionId,
      search,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Libraries fetched successfully.",
      count: libraries.length,
      data: libraries,
    });
  } catch (error) {
    console.error("Get Libraries Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch libraries.",
    });
  }
};

/**
 * GET SINGLE LIBRARY
 */
export const getLibraryById = async (req, res) => {
  try {
    const { id } = req.params;

    const institutionId = req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Library ID is required.",
      });
    }

    const library = await getLibraryByIdService(
      id,
      institutionId
    );

    return res.status(200).json({
      success: true,
      message: "Library fetched successfully.",
      data: library,
    });
  } catch (error) {
    console.error("Get Library By ID Error:", error);

    if (error.message === "Library not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch library.",
    });
  }
};

/**
 * UPDATE LIBRARY
 */
export const updateLibrary = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      libraryName,
      libraryCode,
      about,
      status,
    } = req.body;

    const institutionId = req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Library ID is required.",
      });
    }

    const updatedLibrary = await updateLibraryService(
      id,
      institutionId,
      {
        libraryName,
        libraryCode,
        about,
        status,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Library updated successfully.",
      data: updatedLibrary,
    });
  } catch (error) {
    console.error("Update Library Error:", error);

    if (error.message === "Library not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update library.",
    });
  }
};
/**
 * SOFT DELETE LIBRARY
 */
export const deleteLibrary = async (req, res) => {
  try {
    const { id } = req.params;

    const institutionId = req.user?.institution;
    const deletedBy = req.user?.userId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    if (!deletedBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Library ID is required.",
      });
    }

    const deletedLibrary = await deleteLibraryService(
      id,
      institutionId,
      deletedBy
    );

    return res.status(200).json({
      success: true,
      message: "Library deleted successfully.",
      data: deletedLibrary,
    });
  } catch (error) {
    console.error("Delete Library Error:", error);

    if (error.message === "Library not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete library.",
    });
  }
};
/**
 * GET ALL DELETED LIBRARIES
 */
export const getDeletedLibraries = async (req, res) => {
  try {
    const institutionId = req.user?.institution;
    const { search } = req.query;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    const libraries = await getDeletedLibrariesService({
      institutionId,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Deleted libraries fetched successfully.",
      count: libraries.length,
      data: libraries,
    });
  } catch (error) {
    console.error(
      "Get Deleted Libraries Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch deleted libraries.",
    });
  }
};
/**
 * RESTORE LIBRARY
 */
export const restoreLibrary = async (req, res) => {
  try {
    const { id } = req.params;
    const institutionId = req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Library ID is required.",
      });
    }

    const library = await restoreLibraryService(
      id,
      institutionId
    );

    return res.status(200).json({
      success: true,
      message: "Library restored successfully.",
      data: library,
    });
  } catch (error) {
    console.error(
      "Restore Library Error:",
      error
    );

    if (
      error.message === "Deleted library not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes(
        "An active library with the same code already exists"
      )
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to restore library.",
    });
  }
};
/**
 * PERMANENTLY DELETE LIBRARY
 */
export const permanentlyDeleteLibrary = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const institutionId = req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Library ID is required.",
      });
    }

    const library =
      await permanentlyDeleteLibraryService(
        id,
        institutionId
      );

    return res.status(200).json({
      success: true,
      message:
        "Library permanently deleted successfully.",
      data: library,
    });
  } catch (error) {
    console.error(
      "Permanent Delete Library Error:",
      error
    );

    if (
      error.message === "Deleted library not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to permanently delete library.",
    });
  }
};