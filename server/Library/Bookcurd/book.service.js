import Book from "./book.model.js";
import Library from "./../Librarycurd/library.model.js";
import BookDistribution from "../BookDistribution/BookDistribution.model.js"
/**
 * CREATE BOOK
 */
export const createBookService = async (bookData) => {
  const {
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
  } = bookData;

  // =========================
  // CHECK LIBRARY
  // =========================

  const library = await Library.findOne({
    _id: libraryId,
    institutionId,
    isDeleted: false,
  });

  if (!library) {
    throw new Error(
      "Library not found or does not belong to this institution."
    );
  }

  // =========================
  // NORMALIZE BOOK NUMBER
  // =========================

  const normalizedBookNumber =
    bookNumber.trim().toUpperCase();

  // =========================
  // CHECK DUPLICATE BOOK
  // =========================

  const existingBook = await Book.findOne({
    institutionId,
    libraryId,
    bookNumber: normalizedBookNumber,
    isDeleted: false,
  });

  if (existingBook) {
    throw new Error(
      "A book with this book number already exists in this library."
    );
  }

  // =========================
  // QUANTITY
  // =========================

  const bookQuantity = Number(quantity);

  if (
    !Number.isInteger(bookQuantity) ||
    bookQuantity < 1
  ) {
    throw new Error(
      "Quantity must be a whole number greater than 0."
    );
  }

  // =========================
  // MISSING FIELDS
  // =========================

  const missingFields = [];

  if (!publisher?.trim()) {
    missingFields.push("publisher");
  }

  if (!edition?.trim()) {
    missingFields.push("edition");
  }

  // =========================
  // CREATE BOOK
  // =========================

  const book = await Book.create({
    institutionId,
    libraryId,
    bookNumber: normalizedBookNumber,
    bookName: bookName.trim(),
    author: author.trim(),
    publisher: publisher?.trim() || "",
    edition: edition?.trim() || "",
    category: category.trim(),
    language: language.trim(),

    quantity: bookQuantity,

    // New book means all copies
    // are initially available.
    availableQuantity: bookQuantity,

    price: price !== undefined ? Number(price) : 0,

    status: status || "Active",

    missingFields,

    createdBy,
  });

  return book;
};


/**
 * GET ALL BOOKS
 */
export const getBooksService = async ({
  institutionId,
  libraryId,
  search,
  category,
  language,
  status,
  page = 1,
  limit = 10,
}) => {
  // =========================
  // PAGINATION
  // =========================

  const currentPage = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const perPage = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || 10,
      1
    ),
    100
  );

  const skip =
    (currentPage - 1) * perPage;

  // =========================
  // BASE QUERY
  // =========================

  const query = {
    institutionId,
    isDeleted: false,
  };

  // =========================
  // LIBRARY FILTER
  // =========================

  if (libraryId) {
    query.libraryId = libraryId;
  }

  // =========================
  // STATUS FILTER
  // =========================

  if (status) {
    query.status = status;
  }

  // =========================
  // CATEGORY FILTER
  // =========================

  if (category) {
    query.category = {
      $regex: category,
      $options: "i",
    };
  }

  // =========================
  // LANGUAGE FILTER
  // =========================

  if (language) {
    query.language = {
      $regex: language,
      $options: "i",
    };
  }

  // =========================
  // SEARCH
  // BOOK NAME + BOOK NUMBER
  // =========================

  if (search?.trim()) {
    const searchValue = search.trim();

    query.$or = [
      {
        bookName: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        bookNumber: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  // =========================
  // TOTAL COUNT
  // =========================

  const totalBooks = await Book.countDocuments(
    query
  );

  // =========================
  // FETCH BOOKS
  // =========================

  const books = await Book.find(query)
    .populate(
      "libraryId",
      "libraryName libraryCode"
    )
    .populate(
      "institutionId",
      "institutionName institutionCode"
    )
    .populate(
      "createdBy",
      "name email"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage);

  // =========================
  // PAGINATION INFO
  // =========================

  const totalPages = Math.ceil(
    totalBooks / perPage
  );

  return {
    books,
    pagination: {
      currentPage,
      limit: perPage,
      totalBooks,
      totalPages,
      hasNextPage:
        currentPage < totalPages,
      hasPreviousPage:
        currentPage > 1,
    },
  };
};


/**
 * GET SINGLE BOOK
 */
export const getBookByIdService = async (
  bookId,
  institutionId
) => {
  const book = await Book.findOne({
    _id: bookId,
    institutionId,
    isDeleted: false,
  })
    .populate(
      "libraryId",
      "libraryName libraryCode"
    )
    .populate(
      "institutionId",
      "institutionName institutionCode"
    )
    .populate(
      "createdBy",
      "name email"
    );

  if (!book) {
    throw new Error("Book not found.");
  }

  return book;
};


/**
 * UPDATE BOOK
 */
export const updateBookService = async (
  bookId,
  institutionId,
  updateData
) => {
  // =========================
  // FIND BOOK
  // =========================

  const book = await Book.findOne({
    _id: bookId,
    institutionId,
    isDeleted: false,
  });

  if (!book) {
    throw new Error("Book not found.");
  }

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
  } = updateData;

  // =========================
  // LIBRARY CHANGE
  // =========================

  if (
    libraryId !== undefined &&
    libraryId.toString() !==
      book.libraryId.toString()
  ) {
    const library = await Library.findOne({
      _id: libraryId,
      institutionId,
      isDeleted: false,
    });

    if (!library) {
      throw new Error(
        "Library not found or does not belong to this institution."
      );
    }

    book.libraryId = libraryId;
  }

  // =========================
  // BOOK NUMBER
  // =========================

  if (bookNumber !== undefined) {
    const normalizedBookNumber =
      bookNumber.trim().toUpperCase();

    const duplicateBook = await Book.findOne({
      institutionId,
      libraryId:
        libraryId !== undefined
          ? libraryId
          : book.libraryId,
      bookNumber: normalizedBookNumber,
      isDeleted: false,
      _id: { $ne: bookId },
    });

    if (duplicateBook) {
      throw new Error(
        "A book with this book number already exists in this library."
      );
    }

    book.bookNumber = normalizedBookNumber;
  }

  // =========================
  // BASIC INFORMATION
  // =========================

  if (bookName !== undefined) {
    book.bookName = bookName.trim();
  }

  if (author !== undefined) {
    book.author = author.trim();
  }

  if (publisher !== undefined) {
    book.publisher = publisher.trim();
  }

  if (edition !== undefined) {
    book.edition = edition.trim();
  }

  if (category !== undefined) {
    book.category = category.trim();
  }

  if (language !== undefined) {
    book.language = language.trim();
  }

  // =========================
  // QUANTITY
  // =========================

  if (quantity !== undefined) {
    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      throw new Error(
        "Quantity must be a whole number greater than 0."
      );
    }

    const issuedQuantity =
      book.quantity - book.availableQuantity;

    if (newQuantity < issuedQuantity) {
      throw new Error(
        `Quantity cannot be less than the ${issuedQuantity} copies currently issued to students.`
      );
    }

    book.quantity = newQuantity;

    // Preserve currently issued copies.
    book.availableQuantity =
      newQuantity - issuedQuantity;
  }

  // =========================
  // PRICE
  // =========================

  if (price !== undefined) {
    const newPrice = Number(price);

    if (newPrice < 0) {
      throw new Error(
        "Price cannot be negative."
      );
    }

    book.price = newPrice;
  }

  // =========================
  // STATUS
  // =========================

  if (status !== undefined) {
    book.status = status;
  }

  // =========================
  // UPDATE MISSING FIELDS
  // =========================

  const missingFields = [];

  if (!book.publisher?.trim()) {
    missingFields.push("publisher");
  }

  if (!book.edition?.trim()) {
    missingFields.push("edition");
  }

  book.missingFields = missingFields;

  await book.save();

  return book;
};


/**
 * SOFT DELETE BOOK
 */
export const deleteBookService = async (
  bookId,
  institutionId,
  deletedBy
) => {
  const book = await Book.findOne({
    _id: bookId,
    institutionId,
    isDeleted: false,
  });

  if (!book) {
    throw new Error("Book not found.");
  }

  // =========================
  // CHECK ISSUED COPIES
  // =========================

  const issuedQuantity =
    book.quantity - book.availableQuantity;

  if (issuedQuantity > 0) {
    throw new Error(
      `Cannot delete this book because ${issuedQuantity} ${issuedQuantity === 1 ? "copy is" : "copies are"} currently issued to students.`
    );
  }

  // =========================
  // SOFT DELETE
  // =========================

  book.isDeleted = true;
  book.deletedAt = new Date();
  book.deletedBy = deletedBy;

  await book.save();

  return book;
};

/**
 * GET ALL DELETED BOOKS
 */
export const getDeletedBooksService = async ({
  institutionId,
  libraryId,
  search,
  category,
  language,
  status,
  page = 1,
  limit = 10,
}) => {
  // =========================
  // PAGINATION
  // =========================

  const currentPage = Math.max(
    Number.parseInt(page, 10) || 1,
    1
  );

  const perPage = Math.min(
    Math.max(
      Number.parseInt(limit, 10) || 10,
      1
    ),
    100
  );

  const skip =
    (currentPage - 1) * perPage;

  // =========================
  // BASE QUERY
  // =========================

  const query = {
    institutionId,
    isDeleted: true,
  };

  // =========================
  // LIBRARY FILTER
  // =========================

  if (libraryId) {
    query.libraryId = libraryId;
  }

  // =========================
  // STATUS FILTER
  // =========================

  if (status) {
    query.status = status;
  }

  // =========================
  // CATEGORY FILTER
  // =========================

  if (category) {
    query.category = {
      $regex: category,
      $options: "i",
    };
  }

  // =========================
  // LANGUAGE FILTER
  // =========================

  if (language) {
    query.language = {
      $regex: language,
      $options: "i",
    };
  }

  // =========================
  // SEARCH
  // =========================

  if (search?.trim()) {
    const searchValue = search.trim();

    query.$or = [
      {
        bookName: {
          $regex: searchValue,
          $options: "i",
        },
      },
      {
        bookNumber: {
          $regex: searchValue,
          $options: "i",
        },
      },
    ];
  }

  // =========================
  // TOTAL COUNT
  // =========================

  const totalBooks =
    await Book.countDocuments(query);

  // =========================
  // FETCH DELETED BOOKS
  // =========================

  const books = await Book.find(query)
    .populate(
      "libraryId",
      "libraryName libraryCode"
    )
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
    .sort({ deletedAt: -1 })
    .skip(skip)
    .limit(perPage);

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    totalBooks / perPage
  );

  return {
    books,
    pagination: {
      currentPage,
      limit: perPage,
      totalBooks,
      totalPages,
      hasNextPage:
        currentPage < totalPages,
      hasPreviousPage:
        currentPage > 1,
    },
  };
};
/**
 * RESTORE BOOK
 */
export const restoreBookService = async (
  bookId,
  institutionId
) => {
  // =========================
  // FIND DELETED BOOK
  // =========================

  const book = await Book.findOne({
    _id: bookId,
    institutionId,
    isDeleted: true,
  });

  if (!book) {
    throw new Error(
      "Deleted book not found."
    );
  }

  // =========================
  // CHECK LIBRARY
  // =========================

  const library = await Library.findOne({
    _id: book.libraryId,
    institutionId,
    isDeleted: false,
  });

  if (!library) {
    throw new Error(
      "Cannot restore book because its library is deleted or no longer exists."
    );
  }

  // =========================
  // CHECK DUPLICATE BOOK NUMBER
  // =========================

  const existingActiveBook =
    await Book.findOne({
      institutionId,
      libraryId: book.libraryId,
      bookNumber: book.bookNumber,
      isDeleted: false,
      _id: { $ne: bookId },
    });

  if (existingActiveBook) {
    throw new Error(
      "Cannot restore book. An active book with the same book number already exists in this library."
    );
  }

  // =========================
  // RESTORE
  // =========================

  book.isDeleted = false;
  book.deletedAt = null;
  book.deletedBy = null;

  await book.save();

  return book;
};

/**
 * PERMANENTLY DELETE BOOK
 */
export const permanentlyDeleteBookService = async (
  bookId,
  institutionId
) => {
  // =========================
  // FIND DELETED BOOK
  // =========================

  const book = await Book.findOne({
    _id: bookId,
    institutionId,
    isDeleted: true,
  });

  if (!book) {
    throw new Error(
      "Deleted book not found."
    );
  }

  // =========================
  // CHECK DISTRIBUTION HISTORY
  // =========================

  const distributionExists =
    await BookDistribution.exists({
      bookId: book._id,
    });

  if (distributionExists) {
    throw new Error(
      "Cannot permanently delete this book because borrowing history exists for this book."
    );
  }

  // =========================
  // PERMANENT DELETE
  // =========================

  await Book.deleteOne({
    _id: book._id,
  });

  return book;
};