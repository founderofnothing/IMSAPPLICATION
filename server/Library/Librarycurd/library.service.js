import Library from "./library.model.js";

/**
 * CREATE LIBRARY
 */
export const createLibraryService = async (libraryData) => {
  const {
    institutionId,
    libraryName,
    libraryCode,
    about,
    status,
    createdBy,
  } = libraryData;

  // Check duplicate active library code
  const existingLibrary = await Library.findOne({
    institutionId,
    libraryCode: libraryCode.trim().toUpperCase(),
    isDeleted: false,
  });

  if (existingLibrary) {
    throw new Error(
      "A library with this code already exists in this institution."
    );
  }

  const library = await Library.create({
    institutionId,
    libraryName: libraryName.trim(),
    libraryCode: libraryCode.trim().toUpperCase(),
    about: about?.trim() || "",
    status: status || "Active",
    createdBy,
  });

  return library;
};

/**
 * GET ALL LIBRARIES
 */
export const getLibrariesService = async (filters = {}) => {
  const {
    institutionId,
    search,
    status,
  } = filters;

  const query = {
    isDeleted: false,
    institutionId,
  };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      {
        libraryName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        libraryCode: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const libraries = await Library.find(query)
    .populate(
      "institutionId",
      "institutionName institutionCode"
    )
    .populate(
      "createdBy",
      "name email"
    )
    .sort({ createdAt: -1 });

  return libraries;
};

/**
 * GET SINGLE LIBRARY
 */
export const getLibraryByIdService = async (
  libraryId,
  institutionId
) => {
  const library = await Library.findOne({
    _id: libraryId,
    institutionId,
    isDeleted: false,
  })
    .populate(
      "institutionId",
      "institutionName institutionCode"
    )
    .populate(
      "createdBy",
      "name email"
    );

  if (!library) {
    throw new Error("Library not found.");
  }

  return library;
};

/**
 * UPDATE LIBRARY
 */
export const updateLibraryService = async (
  libraryId,
  institutionId,
  updateData
) => {
  const library = await Library.findOne({
    _id: libraryId,
    institutionId,
    isDeleted: false,
  });

  if (!library) {
    throw new Error("Library not found.");
  }

  const {
    libraryName,
    libraryCode,
    about,
    status,
  } = updateData;

  // Check duplicate library code
  if (libraryCode !== undefined) {
    const normalizedCode =
      libraryCode.trim().toUpperCase();

    const duplicateLibrary = await Library.findOne({
      institutionId,
      libraryCode: normalizedCode,
      isDeleted: false,
      _id: { $ne: libraryId },
    });

    if (duplicateLibrary) {
      throw new Error(
        "A library with this code already exists in this institution."
      );
    }

    library.libraryCode = normalizedCode;
  }

  if (libraryName !== undefined) {
    library.libraryName = libraryName.trim();
  }

  if (about !== undefined) {
    library.about = about.trim();
  }

  if (status !== undefined) {
    library.status = status;
  }

  await library.save();

  return library;
};

/**
 * SOFT DELETE LIBRARY
 */
export const deleteLibraryService = async (
  libraryId,
  institutionId,
  deletedBy
) => {
  const library = await Library.findOne({
    _id: libraryId,
    institutionId,
    isDeleted: false,
  });

  if (!library) {
    throw new Error("Library not found.");
  }

  library.isDeleted = true;
  library.deletedAt = new Date();
  library.deletedBy = deletedBy;

  await library.save();

  return library;
};



/**
 * GET ALL DELETED LIBRARIES
 */
export const getDeletedLibrariesService = async ({
  institutionId,
  search,
}) => {
  const query = {
    institutionId,
    isDeleted: true,
  };

  if (search) {
    query.$or = [
      {
        libraryName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        libraryCode: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const libraries = await Library.find(query)
    .populate(
      "institutionId",
      "institutionName institutionCode"
    )
    .populate(
      "createdBy",
      "name email"
    )
    .populate(
      "deletedBy",
      "name email"
    )
    .sort({ deletedAt: -1 });

  return libraries;
};


/**
 * RESTORE LIBRARY
 */
export const restoreLibraryService = async (
  libraryId,
  institutionId
) => {
  const library = await Library.findOne({
    _id: libraryId,
    institutionId,
    isDeleted: true,
  });

  if (!library) {
    throw new Error("Deleted library not found.");
  }

  // Check whether another active library
  // already uses the same library code.
  const existingActiveLibrary = await Library.findOne({
    institutionId,
    libraryCode: library.libraryCode,
    isDeleted: false,
    _id: { $ne: libraryId },
  });

  if (existingActiveLibrary) {
    throw new Error(
      "Cannot restore library. An active library with the same code already exists."
    );
  }

  library.isDeleted = false;
  library.deletedAt = null;
  library.deletedBy = null;

  await library.save();

  return library;
};


/**
 * PERMANENTLY DELETE LIBRARY
 */
export const permanentlyDeleteLibraryService = async (
  libraryId,
  institutionId
) => {
  const library = await Library.findOne({
    _id: libraryId,
    institutionId,
    isDeleted: true,
  });

  if (!library) {
    throw new Error("Deleted library not found.");
  }

  await Library.deleteOne({
    _id: libraryId,
  });

  return library;
};