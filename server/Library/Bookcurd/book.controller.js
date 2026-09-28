import {
  createBookService,
  getBooksService,
  getBookByIdService,
  updateBookService,
  deleteBookService,
  getDeletedBooksService,
  restoreBookService,
  permanentlyDeleteBookService,
} from "./book.service.js";

import {
  bulkUploadBooksService,
    bulkUpdateBooksService,
} from "./book.bulk.service.js";

/**
 * CREATE BOOK
 */
export const createBook = async (req, res) => {
  try {
    const {
      libraryId,
      bookNumber,
      bookName,
      author,
      publisher,
      edition,
      category,
      language,
      quantity,
      price,
      status,
    } = req.body;

    const institutionId = req.user?.institution;
    const createdBy = req.user?.userId;

    // =========================
    // AUTHENTICATION
    // =========================

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: "Institution not found in authenticated user.",
      });
    }

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    // =========================
    // REQUIRED FIELDS
    // =========================

    if (
      !libraryId ||
      !bookNumber ||
      !bookName ||
      !author ||
      !category ||
      !language ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Library, book number, book name, author, category, language and quantity are required.",
      });
    }

    const book = await createBookService({
      institutionId,
      libraryId,
      bookNumber,
      bookName,
      author,
      publisher,
      edition,
      category,
      language,
      quantity,
      price,
      status,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully.",
      data: book,
    });
  } catch (error) {
    console.error("Create Book Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create book.",
    });
  }
};


/**
 * GET ALL BOOKS
 */
export const getBooks = async (req, res) => {
  try {
    const institutionId =
      req.user?.institution;

    const {
      libraryId,
      search,
      category,
      language,
      status,
      page,
      limit,
    } = req.query;

    // =========================
    // AUTHENTICATION
    // =========================

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message:
          "Institution not found in authenticated user.",
      });
    }

    // =========================
    // FETCH BOOKS
    // =========================

    const result =
      await getBooksService({
        institutionId,
        libraryId,
        search,
        category,
        language,
        status,
        page,
        limit,
      });

    return res.status(200).json({
      success: true,
      message:
        "Books fetched successfully.",
      count: result.books.length,
      pagination: result.pagination,
      data: result.books,
    });
  } catch (error) {
    console.error(
      "Get Books Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch books.",
    });
  }
};


/**
 * GET SINGLE BOOK
 */
export const getBookById = async (req, res) => {
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
        message: "Book ID is required.",
      });
    }

    const book = await getBookByIdService(
      id,
      institutionId
    );

    return res.status(200).json({
      success: true,
      message: "Book fetched successfully.",
      data: book,
    });
  } catch (error) {
    console.error("Get Book By ID Error:", error);

    if (error.message === "Book not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to fetch book.",
    });
  }
};


/**
 * UPDATE BOOK
 */
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      libraryId,
      bookNumber,
      bookName,
      author,
      publisher,
      edition,
      category,
      language,
      quantity,
      price,
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
        message: "Book ID is required.",
      });
    }

    const updatedBook = await updateBookService(
      id,
      institutionId,
      {
        libraryId,
        bookNumber,
        bookName,
        author,
        publisher,
        edition,
        category,
        language,
        quantity,
        price,
        status,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Book updated successfully.",
      data: updatedBook,
    });
  } catch (error) {
    console.error("Update Book Error:", error);

    if (error.message === "Book not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to update book.",
    });
  }
};


/**
 * SOFT DELETE BOOK
 */
export const deleteBook = async (req, res) => {
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
        message: "Book ID is required.",
      });
    }

    const deletedBook = await deleteBookService(
      id,
      institutionId,
      deletedBy
    );

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully.",
      data: deletedBook,
    });
  } catch (error) {
    console.error("Delete Book Error:", error);

    if (error.message === "Book not found.") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to delete book.",
    });
  }
};

/**
 * GET ALL DELETED BOOKS
 */
export const getDeletedBooks = async (req, res) => {
  try {
    const institutionId =
      req.user?.institution;

    const {
      libraryId,
      search,
      category,
      language,
      status,
      page,
      limit,
    } = req.query;

    // =========================
    // AUTHENTICATION
    // =========================

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message:
          "Institution not found in authenticated user.",
      });
    }

    // =========================
    // FETCH DELETED BOOKS
    // =========================

    const result =
      await getDeletedBooksService({
        institutionId,
        libraryId,
        search,
        category,
        language,
        status,
        page,
        limit,
      });

    return res.status(200).json({
      success: true,
      message:
        "Deleted books fetched successfully.",
      count: result.books.length,
      pagination: result.pagination,
      data: result.books,
    });
  } catch (error) {
    console.error(
      "Get Deleted Books Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch deleted books.",
    });
  }
};




/**
 * RESTORE BOOK
 */
export const restoreBook = async (req, res) => {
  try {
    const { id } = req.params;

    const institutionId =
      req.user?.institution;

    // =========================
    // AUTHENTICATION
    // =========================

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message:
          "Institution not found in authenticated user.",
      });
    }

    // =========================
    // BOOK ID
    // =========================

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Book ID is required.",
      });
    }

    // =========================
    // RESTORE
    // =========================

    const book =
      await restoreBookService(
        id,
        institutionId
      );

    return res.status(200).json({
      success: true,
      message:
        "Book restored successfully.",
      data: book,
    });
  } catch (error) {
    console.error(
      "Restore Book Error:",
      error
    );

    // Deleted book not found
    if (
      error.message ===
      "Deleted book not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Library is deleted
    if (
      error.message.includes(
        "library is deleted"
      )
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // Duplicate book number
    if (
      error.message.includes(
        "same book number already exists"
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
        "Failed to restore book.",
    });
  }
};


/**
 * PERMANENTLY DELETE BOOK
 */
export const permanentlyDeleteBook = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const institutionId =
      req.user?.institution;

    // =========================
    // AUTHENTICATION
    // =========================

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message:
          "Institution not found in authenticated user.",
      });
    }

    // =========================
    // BOOK ID
    // =========================

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Book ID is required.",
      });
    }

    // =========================
    // PERMANENT DELETE
    // =========================

    const book =
      await permanentlyDeleteBookService(
        id,
        institutionId
      );

    return res.status(200).json({
      success: true,
      message:
        "Book permanently deleted successfully.",
      data: book,
    });
  } catch (error) {
    console.error(
      "Permanent Delete Book Error:",
      error
    );

    // Deleted book not found
    if (
      error.message ===
      "Deleted book not found."
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Distribution history exists
    if (
      error.message.includes(
        "borrowing history exists"
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
        "Failed to permanently delete book.",
    });
  }
};










/**
 * BULK UPLOAD BOOKS
 */
export const bulkUploadBooks = async (
  req,
  res
) => {
  try {
    // ======================================================
    // CHECK UPLOADED FILE
    // ======================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,

        code:
          "EXCEL_FILE_REQUIRED",

        message:
          "Please upload an Excel file.",
      });
    }


    // ======================================================
    // GET INSTITUTION FROM JWT
    // ======================================================

    const institutionId =
      req.user?.institution;

    if (!institutionId) {
      return res.status(400).json({
        success: false,

        code:
          "INSTITUTION_REQUIRED",

        message:
          "Institution not found in user account.",
      });
    }


    // ======================================================
    // GET USER FROM JWT
    // ======================================================

    const createdBy =
      req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({
        success: false,

        code:
          "USER_REQUIRED",

        message:
          "Authenticated user not found.",
      });
    }


    // ======================================================
    // CALL BULK UPLOAD SERVICE
    // ======================================================

    const result =
      await bulkUploadBooksService(
        req.file,
        {
          institutionId,
          createdBy,
        }
      );


    // ======================================================
    // NO BOOKS INSERTED
    // ======================================================

    if (
      !result.insertedCount ||
      result.insertedCount <= 0
    ) {
      return res.status(422).json({
        ...result,

        success: false,

        code:
          "NO_BOOKS_INSERTED",

        message:
          result.failedCount > 0
            ? "No books were imported. Please correct the rejected book data and try again."
            : "No books were imported from the uploaded Excel file.",
      });
    }


    // ======================================================
    // SUCCESS / PARTIAL SUCCESS
    // ======================================================

    return res
      .status(201)
      .json({
        ...result,

        success: true,
      });

  } catch (error) {

    console.error(
      "BULK BOOK UPLOAD ERROR:",
      error
    );


    // ======================================================
    // EXCEL HEADER VALIDATION ERROR
    // ======================================================

    if (
      error.code ===
      "EXCEL_HEADER_VALIDATION_FAILED"
    ) {
      return res.status(400).json({
        success: false,

        code:
          error.code,

        message:
          error.message,

        sheetName:
          error.details
            ?.sheetName ??
          null,

        totalColumns:
          error.details
            ?.totalColumns ??
          0,

        errors:
          error.details
            ?.errors ??
          [],

        warnings:
          error.details
            ?.warnings ??
          [],
      });
    }


    // ======================================================
    // MONGODB DUPLICATE KEY ERROR
    // ======================================================

    if (
      error.code === 11000
    ) {
      const duplicateField =
        Object.keys(
          error.keyPattern ??
          error.keyValue ??
          {}
        )[0] ?? null;

      const duplicateValue =
        duplicateField
          ? error.keyValue?.[
              duplicateField
            ] ?? null
          : null;

      return res.status(409).json({
        success: false,

        code:
          "DUPLICATE_BOOK_DATA",

        message:
          duplicateField
            ? `A book already exists with the same ${duplicateField}.`
            : "Book data conflicts with an existing record.",

        field:
          duplicateField,

        receivedValue:
          duplicateValue,

        expected:
          duplicateField
            ? `Unique ${duplicateField}`
            : null,
      });
    }


    // ======================================================
    // MONGOOSE VALIDATION ERROR
    // ======================================================

    if (
      error.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors ?? {}
        ).map(
          (validationError) => ({
            field:
              validationError.path ??
              null,

            receivedValue:
              validationError.value ??
              null,

            reason:
              validationError.message,
          })
        );

      return res.status(400).json({
        success: false,

        code:
          "BOOK_VALIDATION_FAILED",

        message:
          "Book data failed database validation.",

        errors,
      });
    }


    // ======================================================
    // INVALID MONGODB OBJECT ID / CAST ERROR
    // ======================================================

    if (
      error.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,

        code:
          "INVALID_REFERENCE_ID",

        message:
          "One of the book or library references is invalid.",

        field:
          error.path ??
          null,

        receivedValue:
          error.value ??
          null,
      });
    }


    // ======================================================
    // GENERAL BULK UPLOAD ERROR
    // ======================================================

    return res.status(400).json({
      success: false,

      code:
        error.code ??
        "BULK_BOOK_UPLOAD_FAILED",

      message:
        error.message ||
        "Book bulk upload failed.",
    });
  }
};

// ============================================================
// BULK UPDATE BOOKS
// ============================================================

export const bulkUpdateBooks = async (
  req,
  res
) => {

  try {

    // ========================================================
    // CHECK UPLOADED FILE
    // ========================================================

    if (!req.file) {

      return res.status(400).json({
        success: false,

        code:
          "EXCEL_FILE_REQUIRED",

        message:
          "Please upload an Excel file.",
      });

    }


    // ========================================================
    // GET INSTITUTION FROM JWT
    // ========================================================

    const institutionId =
      req.user?.institution;

    if (!institutionId) {

      return res.status(400).json({
        success: false,

        code:
          "INSTITUTION_REQUIRED",

        message:
          "Institution not found in authenticated user.",
      });

    }


    // ========================================================
    // CALL BULK UPDATE SERVICE
    // ========================================================

    const result =
      await bulkUpdateBooksService(
        req.file,
        {
          institutionId,
        }
      );


    // ========================================================
    // NO BOOKS UPDATED
    // ========================================================

    if (
      !result.success ||
      !result.modifiedCount
    ) {

      return res.status(422).json({
        ...result,

        success: false,

        code:
          result.code ??
          "NO_BOOKS_UPDATED",

        message:
          result.message ??
          "No books were updated. Please review the rejected rows and try again.",
      });

    }


    // ========================================================
    // SUCCESS / PARTIAL SUCCESS
    // ========================================================

    return res.status(200).json({
      ...result,

      success: true,
    });

  } catch (error) {

    console.error(
      "BULK BOOK UPDATE ERROR:",
      error
    );


    // ========================================================
    // EXCEL HEADER VALIDATION ERROR
    // ========================================================

    if (
      error.code ===
      "EXCEL_HEADER_VALIDATION_FAILED"
    ) {

      return res.status(400).json({
        success: false,

        code:
          error.code,

        message:
          error.message,

        sheetName:
          error.details
            ?.sheetName ??
          null,

        totalColumns:
          error.details
            ?.totalColumns ??
          0,

        errors:
          error.details
            ?.errors ??
          [],

        warnings:
          error.details
            ?.warnings ??
          [],
      });

    }


    // ========================================================
    // MONGODB DUPLICATE KEY ERROR
    // ========================================================

    if (
      error.code === 11000
    ) {

      const duplicateField =
        Object.keys(
          error.keyPattern ??
          error.keyValue ??
          {}
        )[0] ??
        null;

      const duplicateValue =
        duplicateField
          ? error.keyValue?.[
              duplicateField
            ] ?? null
          : null;

      return res.status(409).json({
        success: false,

        code:
          "DUPLICATE_BOOK_DATA",

        message:
          duplicateField
            ? `A book already exists with the same ${duplicateField}.`
            : "Book data conflicts with an existing record.",

        field:
          duplicateField,

        receivedValue:
          duplicateValue,

        expected:
          duplicateField
            ? `Unique ${duplicateField}`
            : null,
      });

    }


    // ========================================================
    // MONGOOSE VALIDATION ERROR
    // ========================================================

    if (
      error.name ===
      "ValidationError"
    ) {

      const errors =
        Object.values(
          error.errors ?? {}
        ).map(
          (validationError) => ({
            field:
              validationError.path ??
              null,

            receivedValue:
              validationError.value ??
              null,

            reason:
              validationError.message,
          })
        );

      return res.status(400).json({
        success: false,

        code:
          "BOOK_VALIDATION_FAILED",

        message:
          "Book data failed database validation.",

        errors,
      });

    }


    // ========================================================
    // INVALID OBJECT ID
    // ========================================================

    if (
      error.name ===
      "CastError"
    ) {

      return res.status(400).json({
        success: false,

        code:
          "INVALID_REFERENCE_ID",

        message:
          "One of the supplied book or library references is invalid.",

        field:
          error.path ??
          null,

        receivedValue:
          error.value ??
          null,
      });

    }


    // ========================================================
    // GENERAL BULK UPDATE ERROR
    // ========================================================

    return res.status(400).json({
      success: false,

      code:
        error.code ??
        "BULK_BOOK_UPDATE_FAILED",

      message:
        error.message ||
        "Book bulk update failed.",
    });

  }
};