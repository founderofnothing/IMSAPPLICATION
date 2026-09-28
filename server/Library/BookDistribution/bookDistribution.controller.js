import {
  searchBorrowersService,
  getAvailableBooksService,
  issueBooksService,
  getBookDistributionService,
  getStudentBooksService,
  getFacultyBooksService,
  returnBookService,
  getDistributionHistoryService,
} from "./bookDistribution.service.js";


// ============================================================
// 1. SEARCH BORROWERS
// ============================================================

export const searchBorrowers = async (
  req,
  res
) => {
  try {

    const institutionId =
      req.user?.institution;

    const {
      search,
    } = req.query;


    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in authenticated user.",
      });
    }


    const result =
      await searchBorrowersService({
        institutionId,
        search,
      });


    return res.status(200).json({
      success: true,
      message:
        "Borrowers fetched successfully.",
      count:
        result.students.length +
        result.faculty.length,
      data: result,
    });

  } catch (error) {

    console.error(
      "SEARCH BORROWERS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to search borrowers.",
    });
  }
};


// ============================================================
// 2. GET AVAILABLE BOOKS
// ============================================================

export const getAvailableBooks = async (
  req,
  res
) => {
  try {

    const institutionId =
      req.user?.institution;

    const {
      libraryId,
      search,
      category,
      language,
    } = req.query;


    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in authenticated user.",
      });
    }


    const books =
      await getAvailableBooksService({
        institutionId,
        libraryId,
        search,
        category,
        language,
      });


    return res.status(200).json({
      success: true,
      message:
        "Available books fetched successfully.",
      count:
        books.length,
      data:
        books,
    });

  } catch (error) {

    console.error(
      "GET AVAILABLE BOOKS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch available books.",
    });
  }
};


// ============================================================
// 3. ISSUE / DISTRIBUTE BOOKS
// ============================================================

export const issueBooks = async (
  req,
  res
) => {
  try {

    const institutionId =
      req.user?.institution;

    const issuedBy =
      req.user?.userId;


    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in authenticated user.",
      });
    }


    if (!issuedBy) {
      return res.status(400).json({
        success: false,
        code: "USER_REQUIRED",
        message:
          "Authenticated user ID not found.",
      });
    }


    const {
      libraryId,
      borrowerType,
      studentId,
      facultyId,
      bookIds,
      dueDate,
      remarks,
    } = req.body;


    const result =
      await issueBooksService({
        institutionId,
        libraryId,
        borrowerType,
        studentId,
        facultyId,
        bookIds,
        dueDate,
        remarks,
        issuedBy,
      });


    return res.status(201).json({
      success: true,
      message:
        "Books distributed successfully.",
      createdCount:
        result.createdCount,
      data:
        result.data,
    });

  } catch (error) {

    console.error(
      "ISSUE BOOKS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to distribute books.",
    });
  }
};


// ============================================================
// 4. GET BOOK DISTRIBUTION
// ============================================================
//
// Used when clicking a book.
// Shows people currently holding the book.
// ============================================================

export const getBookDistribution = async (
  req,
  res
) => {
  try {

    const institutionId =
      req.user?.institution;

    const {
      bookId,
      status,
    } = req.query;


    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in authenticated user.",
      });
    }


    if (!bookId) {
      return res.status(400).json({
        success: false,
        code: "BOOK_ID_REQUIRED",
        message:
          "Book ID is required.",
      });
    }


    const distributions =
      await getBookDistributionService({
        institutionId,
        bookId,
        status:
          status || "Issued",
      });


    return res.status(200).json({
      success: true,
      message:
        "Book distribution details fetched successfully.",
      count:
        distributions.length,
      data:
        distributions,
    });

  } catch (error) {

    console.error(
      "GET BOOK DISTRIBUTION ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch book distribution.",
    });
  }
};


// ============================================================
// 5. GET STUDENT BOOKS
// ============================================================

export const getStudentBooks = async (
  req,
  res
) => {
  try {

    const institutionId =
      req.user?.institution;

    const {
      studentId,
      currentOnly,
    } = req.query;


    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in authenticated user.",
      });
    }


    if (!studentId) {
      return res.status(400).json({
        success: false,
        code: "STUDENT_ID_REQUIRED",
        message:
          "Student ID is required.",
      });
    }


    const result =
      await getStudentBooksService({
        institutionId,
        studentId,
        currentOnly:
          currentOnly === "true",
      });


    return res.status(200).json({
      success: true,
      message:
        "Student library books fetched successfully.",
      count:
        result.distributions.length,
      data:
        result,
    });

  } catch (error) {

    console.error(
      "GET STUDENT BOOKS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch student books.",
    });
  }
};


// ============================================================
// 6. GET FACULTY BOOKS
// ============================================================

export const getFacultyBooks = async (
  req,
  res
) => {
  try {

    const institutionId =
      req.user?.institution;

    const {
      facultyId,
      currentOnly,
    } = req.query;


    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in authenticated user.",
      });
    }


    if (!facultyId) {
      return res.status(400).json({
        success: false,
        code: "FACULTY_ID_REQUIRED",
        message:
          "Faculty ID is required.",
      });
    }


    const result =
      await getFacultyBooksService({
        institutionId,
        facultyId,
        currentOnly:
          currentOnly === "true",
      });


    return res.status(200).json({
      success: true,
      message:
        "Faculty library books fetched successfully.",
      count:
        result.distributions.length,
      data:
        result,
    });

  } catch (error) {

    console.error(
      "GET FACULTY BOOKS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch faculty books.",
    });
  }
};


// ============================================================
// 7. RETURN BOOK
// ============================================================

export const returnBook = async (
  req,
  res
) => {

  try {

    // ==========================================================
    // AUTHENTICATED USER INFORMATION
    // ==========================================================

    const institutionId =
      req.user?.institution;


    const receivedBy =
      req.user?.userId;


    // ==========================================================
    // REQUEST BODY
    // ==========================================================

    const {
      distributionId,
      status,
      remarks,
    } = req.body;


    // ==========================================================
    // INSTITUTION VALIDATION
    // ==========================================================

    if (!institutionId) {

      return res.status(400).json({

        success: false,

        code:
          "INSTITUTION_REQUIRED",

        message:
          "Institution not found in authenticated user.",

      });

    }


    // ==========================================================
    // RECEIVED BY VALIDATION
    // ==========================================================

    if (!receivedBy) {

      return res.status(400).json({

        success: false,

        code:
          "USER_REQUIRED",

        message:
          "Authenticated user ID not found.",

      });

    }


    // ==========================================================
    // DISTRIBUTION VALIDATION
    // ==========================================================

    if (!distributionId) {

      return res.status(400).json({

        success: false,

        code:
          "DISTRIBUTION_ID_REQUIRED",

        message:
          "Distribution ID is required.",

      });

    }


    // ==========================================================
    // STATUS VALIDATION
    // ==========================================================

    const allowedStatuses = [
      "Returned",
      "Damaged",
      "Lost",
    ];


    if (
      !status ||
      !allowedStatuses.includes(
        status
      )
    ) {

      return res.status(400).json({

        success: false,

        code:
          "INVALID_RETURN_STATUS",

        message:
          "Valid return status is required. Allowed values: Returned, Damaged, Lost.",

      });

    }


    // ==========================================================
    // RETURN BOOK SERVICE
    // ==========================================================

    const result =
      await returnBookService({

        institutionId,

        distributionId,

        receivedBy,

        status,

        remarks,

      });


    // ==========================================================
    // SUCCESS RESPONSE
    // ==========================================================

    return res.status(200).json({

      success: true,

      message:
        status === "Returned"
          ? "Book returned successfully."
          : status === "Damaged"
            ? "Book marked as damaged successfully."
            : "Book marked as lost successfully.",

      data:
        result,

    });


  } catch (error) {

    console.error(
      "RETURN BOOK ERROR:",
      error
    );


    return res.status(400).json({

      success: false,

      message:
        error.message ||
        "Failed to process book return.",

    });

  }

};


// ============================================================
// 8. GET DISTRIBUTION HISTORY
// ============================================================

export const getDistributionHistory = async (
  req,
  res
) => {
  try {

    const institutionId =
      req.user?.institution;

    const {
      bookId,
      studentId,
      facultyId,
      libraryId,
    } = req.query;


    if (!institutionId) {
      return res.status(400).json({
        success: false,
        code: "INSTITUTION_REQUIRED",
        message:
          "Institution not found in authenticated user.",
      });
    }


    const history =
      await getDistributionHistoryService({
        institutionId,
        bookId,
        studentId,
        facultyId,
        libraryId,
      });


    return res.status(200).json({
      success: true,
      message:
        "Book distribution history fetched successfully.",
      count:
        history.length,
      data:
        history,
    });

  } catch (error) {

    console.error(
      "GET DISTRIBUTION HISTORY ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch distribution history.",
    });
  }
};