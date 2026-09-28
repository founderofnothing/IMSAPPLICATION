import mongoose from "mongoose";
import xlsx from "xlsx";
import fs from "fs";

import Book from "./book.model.js";
import Library from "./../Librarycurd/library.model.js";


// ============================================================
// BOOK BULK UPLOAD CONFIGURATION
// ============================================================

const REQUIRED_HEADERS = [
  "libraryCode",
  "bookNumber",
  "bookName",
  "author",
  "category",
  "language",
  "quantity",
  "price",
  "status",
];

const STATUS_VALUES = [
  "Active",
  "Inactive",
  "Archived",
];


// ============================================================
// BOOK BULK UPDATE HEADERS
// ============================================================

const BULK_UPDATE_HEADERS = [
  "libraryCode",
  "bookNumber",
  "bookName",
  "author",
  "publisher",
  "edition",
  "category",
  "language",
  "quantity",
  "availableQuantity",
  "price",
  "status",
];


// ============================================================
// TEXT CLEANER
// ============================================================

const cleanText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ");
};


// ============================================================
// HEADER NORMALIZER
// ============================================================

const normalizeHeader = (header) => {
  return cleanText(header)
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "");
};


// ============================================================
// EXCEL HEADER ALIASES
// ============================================================

const HEADER_ALIASES = {
  librarycode: "libraryCode",
  library: "libraryCode",

  booknumber: "bookNumber",
  bookid: "bookNumber",
  bookcode: "bookNumber",

  bookname: "bookName",
  booktitle: "bookName",
  title: "bookName",

  author: "author",
  authorname: "author",

  publisher: "publisher",
  publishername: "publisher",

  edition: "edition",

  category: "category",

  language: "language",

  quantity: "quantity",
  qty: "quantity",

  availablequantity: "availableQuantity",
  availableqty: "availableQuantity",

  price: "price",
  bookprice: "price",

  status: "status",
};


// ============================================================
// NORMALIZE EXCEL ROW
// ============================================================

const normalizeExcelRow = (row) => {
  const normalizedRow = {};

  Object.entries(row).forEach(
    ([key, value]) => {

      const normalizedHeader =
        normalizeHeader(key);

      const field =
        HEADER_ALIASES[
          normalizedHeader
        ];

      if (!field) {
        return;
      }

      normalizedRow[field] = value;
    }
  );

  return normalizedRow;
};


// ============================================================
// VALIDATE EXCEL HEADERS
// ============================================================

const validateExcelHeaders = (
  originalHeaders
) => {

  const errors = [];
  const warnings = [];

  const normalizedHeaders =
    originalHeaders.map(
      (header) => ({
        original: cleanText(header),
        normalized:
          normalizeHeader(header),
      })
    );

  const mappedFields =
    normalizedHeaders
      .map(
        (item) =>
          HEADER_ALIASES[
            item.normalized
          ]
      )
      .filter(Boolean);

  // ----------------------------------------------------------
  // CHECK REQUIRED HEADERS
  // ----------------------------------------------------------

  for (
    const requiredHeader
    of REQUIRED_HEADERS
  ) {

    if (
      !mappedFields.includes(
        requiredHeader
      )
    ) {

      errors.push({
        field:
          requiredHeader,

        reason:
          `Required column "${requiredHeader}" is missing from the Excel file.`,
      });
    }
  }


  // ----------------------------------------------------------
  // CHECK DUPLICATE HEADERS
  // ----------------------------------------------------------

  const seenHeaders =
    new Map();

  for (
    const item
    of normalizedHeaders
  ) {

    const field =
      HEADER_ALIASES[
        item.normalized
      ];

    if (!field) {
      continue;
    }

    if (
      seenHeaders.has(field)
    ) {

      errors.push({
        field,

        reason:
          `Duplicate Excel columns detected for "${field}".`,
      });

      continue;
    }

    seenHeaders.set(
      field,
      item.original
    );
  }


  // ----------------------------------------------------------
  // WARN ABOUT UNKNOWN HEADERS
  // ----------------------------------------------------------

  for (
    const item
    of normalizedHeaders
  ) {

    if (
      !item.original
    ) {
      continue;
    }

if (
  !HEADER_ALIASES[
    item.normalized
  ]
) {

  warnings.push({
    header:
      item.original,

    reason:
      "This column is not used by the Book bulk upload and will be ignored.",
  });
}
  }




  return {
    isValid:
      errors.length === 0,

    errors,
    warnings,
  };
};


// ============================================================
// VALIDATE SINGLE BOOK ROW
// ============================================================

const validateBookRow = ({
  row,
  rowNumber,
}) => {

  const errors = [];
  const warnings = [];

  // ----------------------------------------------------------
  // REQUIRED TEXT FIELDS
  // ----------------------------------------------------------

  const requiredTextFields = [
    "libraryCode",
    "bookNumber",
    "bookName",
    "author",
    "category",
    "language",
    "status",
  ];

  for (
    const field
    of requiredTextFields
  ) {

    const value =
      cleanText(row[field]);

    if (!value) {

      errors.push({
        row: rowNumber,

        field,

        receivedValue:
          row[field] ?? null,

        reason:
          `${field} is required.`,

        expected:
          "A non-empty value.",
      });
    }
  }


  // ----------------------------------------------------------
  // QUANTITY
  // ----------------------------------------------------------

  const quantityValue =
    cleanText(row.quantity);

  if (!quantityValue) {

    errors.push({
      row: rowNumber,

      field: "quantity",

      receivedValue:
        row.quantity ?? null,

      reason:
        "Quantity is required.",

      expected:
        "A whole number greater than 0.",
    });

  } else {

    const quantity =
      Number(quantityValue);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {

      errors.push({
        row: rowNumber,

        field: "quantity",

        receivedValue:
          row.quantity,

        reason:
          "Quantity must be a whole number greater than 0.",

        expected:
          "Example: 10",
      });
    }
  }


  // ----------------------------------------------------------
  // PRICE
  // ----------------------------------------------------------

  const priceValue =
    cleanText(row.price);

  if (!priceValue) {

    errors.push({
      row: rowNumber,

      field: "price",

      receivedValue:
        row.price ?? null,

      reason:
        "Price is required.",

      expected:
        "A number greater than or equal to 0.",
    });

  } else {

    const price =
      Number(priceValue);

    if (
      Number.isNaN(price) ||
      price < 0
    ) {

      errors.push({
        row: rowNumber,

        field: "price",

        receivedValue:
          row.price,

        reason:
          "Price must be a valid number greater than or equal to 0.",

        expected:
          "Example: 650 or 650.50",
      });
    }
  }


  // ----------------------------------------------------------
  // STATUS
  // ----------------------------------------------------------

  const normalizedStatus =
    cleanText(row.status);

  if (
    normalizedStatus &&
    !STATUS_VALUES.includes(
      normalizedStatus
    )
  ) {

    errors.push({
      row: rowNumber,

      field: "status",

      receivedValue:
        row.status,

      reason:
        "Invalid book status.",

      expected:
        STATUS_VALUES.join(", "),
    });
  }


  // ----------------------------------------------------------
  // RETURN
  // ----------------------------------------------------------

  return {
    isValid:
      errors.length === 0,

    errors,

    warnings,

    normalizedValues: {
      libraryCode:
        cleanText(
          row.libraryCode
        ).toUpperCase(),

      bookNumber:
        cleanText(
          row.bookNumber
        ).toUpperCase(),

      bookName:
        cleanText(
          row.bookName
        ),

      author:
        cleanText(
          row.author
        ),

      category:
        cleanText(
          row.category
        ),

      language:
        cleanText(
          row.language
        ),

      quantity:
        Number(
          row.quantity
        ),

      price:
        Number(
          row.price
        ),

      status:
        cleanText(
          row.status
        ),
    },
  };
};


// ============================================================
// BULK UPDATE - HEADER VALIDATION
// ============================================================

const validateBulkUpdateBookHeaders = (
  originalHeaders
) => {

  const errors = [];
  const warnings = [];

  const normalizedHeaders =
    originalHeaders.map(
      (header) => ({
        original:
          cleanText(header),

        normalized:
          normalizeHeader(header),
      })
    );


  const mappedFields =
    normalizedHeaders
      .map(
        (item) =>
          HEADER_ALIASES[
            item.normalized
          ]
      )
      .filter(Boolean);


  // ==========================================================
  // REQUIRED UPDATE HEADERS
  // ==========================================================

  for (
    const requiredHeader
    of BULK_UPDATE_HEADERS
  ) {

    if (
      !mappedFields.includes(
        requiredHeader
      )
    ) {

      errors.push({
        field:
          requiredHeader,

        reason:
          `Required column "${requiredHeader}" is missing from the Book bulk update Excel file.`,
      });
    }
  }


  // ==========================================================
  // DUPLICATE HEADERS
  // ==========================================================

  const seenHeaders =
    new Map();

  for (
    const item
    of normalizedHeaders
  ) {

    const field =
      HEADER_ALIASES[
        item.normalized
      ];

    if (!field) {
      continue;
    }

    if (
      seenHeaders.has(field)
    ) {

      errors.push({
        field,

        reason:
          `Duplicate Excel columns detected for "${field}".`,
      });

      continue;
    }

    seenHeaders.set(
      field,
      item.original
    );
  }


  // ==========================================================
  // UNKNOWN HEADERS
  // ==========================================================

  for (
    const item
    of normalizedHeaders
  ) {

    if (
      !item.original
    ) {
      continue;
    }

if (
  !HEADER_ALIASES[
    item.normalized
  ]
) {

  warnings.push({
    header:
      item.original,

    reason:
      "This column is not used by Book bulk update and will be ignored.",
  });
}


  }


  return {
    isValid:
      errors.length === 0,

    errors,

    warnings,
  };
};


// ============================================================
// BULK UPDATE - EXCEL FIELD LOCATION MAP
// ============================================================

const buildBookExcelFieldLocationMap = (
  originalHeaders
) => {

  const fieldLocationMap =
    new Map();

  originalHeaders.forEach(
    (header, index) => {

      const normalized =
        normalizeHeader(
          header
        );

      const field =
        HEADER_ALIASES[
          normalized
        ];

      if (!field) {
        return;
      }

      fieldLocationMap.set(
        field,
        {
          column:
            index + 1,

          header:
            cleanText(
              header
            ),
        }
      );
    }
  );

  return fieldLocationMap;
};


// ============================================================
// BULK UPDATE - GET FIELD LOCATION
// ============================================================

const getBookExcelFieldLocation = (
  fieldLocationMap,
  field
) => {

  return (
    fieldLocationMap.get(
      field
    ) || {
      column: null,
      header: field,
    }
  );
};


// ============================================================
// BULK UPDATE - TEXT CLEANER
// ============================================================

const cleanBookNullableText = (
  value
) => {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .replace(/\s+/g, " ");
};


// ============================================================
// BULK UPDATE - NORMALIZE ROW
// ============================================================

const normalizeBookBulkUpdateRow = (
  row
) => {

  const normalizedRow = {};

  Object.entries(row).forEach(
    ([key, value]) => {

      const normalizedHeader =
        normalizeHeader(
          key
        );

      const field =
        HEADER_ALIASES[
          normalizedHeader
        ];

      if (!field) {
        return;
      }

      normalizedRow[field] =
        value;
    }
  );

  return normalizedRow;
};

// ============================================================
// BULK UPLOAD BOOKS
// ============================================================

export const bulkUploadBooksService =
  async (
    file,
    {
      institutionId,
      createdBy,
    }
  ) => {

    // ========================================================
    // STEP 1 - BASIC INPUT VALIDATION
    // ========================================================

    if (!file) {
      throw new Error(
        "Please upload an Excel file."
      );
    }

    if (!institutionId) {
      throw new Error(
        "Institution is required."
      );
    }

    if (!createdBy) {
      throw new Error(
        "Created by user is required."
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        createdBy
      )
    ) {
      throw new Error(
        "Invalid user ID."
      );
    }


    // ========================================================
    // STEP 2 - READ EXCEL
    // ========================================================

    const workbook =
      xlsx.readFile(
        file.path
      );

    const sheetName =
      workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error(
        "Uploaded Excel file does not contain any worksheet."
      );
    }

    const worksheet =
      workbook.Sheets[
        sheetName
      ];

    if (!worksheet) {
      throw new Error(
        "Unable to read the Excel worksheet."
      );
    }


    // ========================================================
    // STEP 3 - READ ORIGINAL HEADERS
    // ========================================================

    const sheetAsArray =
      xlsx.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
          defval: null,
          raw: false,
        }
      );

    if (
      !Array.isArray(
        sheetAsArray
      ) ||
      sheetAsArray.length === 0
    ) {
      throw new Error(
        "Uploaded Excel file is empty."
      );
    }

    const originalHeaders =
      Array.isArray(
        sheetAsArray[0]
      )
        ? sheetAsArray[0]
        : [];


    // ========================================================
    // STEP 4 - VALIDATE HEADERS
    // ========================================================

    const headerValidation =
      validateExcelHeaders(
        originalHeaders
      );

    if (
      !headerValidation.isValid
    ) {

      const error =
        new Error(
          "Excel header validation failed."
        );

      error.code =
        "EXCEL_HEADER_VALIDATION_FAILED";

      error.details = {
        sheetName,

        totalColumns:
          originalHeaders.length,

        errors:
          headerValidation.errors,

        warnings:
          headerValidation.warnings,
      };

      throw error;
    }


    // ========================================================
    // STEP 5 - READ ROWS
    // ========================================================

    const rawRows =
      xlsx.utils.sheet_to_json(
        worksheet,
        {
          defval: null,
          raw: false,
        }
      );

    if (
      rawRows.length === 0
    ) {
      throw new Error(
        "Excel file contains headers but no book rows."
      );
    }


    // ========================================================
    // STEP 6 - NORMALIZE ROWS
    // ========================================================

    const rows =
      rawRows
        .map(
          normalizeExcelRow
        )
        .filter(
          (row) =>
            Object.values(
              row
            ).some(
              (value) => {

                if (
                  value === null ||
                  value === undefined
                ) {
                  return false;
                }

                return (
                  String(value)
                    .trim() !== ""
                );
              }
            )
        );

    if (
      rows.length === 0
    ) {
      throw new Error(
        "Excel file does not contain any book data."
      );
    }


    // ========================================================
    // STEP 7 - VALIDATE EACH ROW
    // ========================================================

    const validBooks = [];
    const failedBooks = [];

    for (
      let index = 0;
      index < rows.length;
      index++
    ) {

      const row =
        rows[index];

      const rowNumber =
        index + 2;

      const validation =
        validateBookRow({
          row,
          rowNumber,
        });

      if (
        !validation.isValid
      ) {

        failedBooks.push({
          row:
            rowNumber,

          bookNumber:
            validation
              .normalizedValues
              ?.bookNumber ||
            cleanText(
              row.bookNumber
            ),

          bookName:
            validation
              .normalizedValues
              ?.bookName ||
            cleanText(
              row.bookName
            ),

          errors:
            validation.errors,

          warnings:
            validation.warnings,
        });

        continue;
      }

      validBooks.push({
        row:
          rowNumber,

        book:
          validation
            .normalizedValues,

        warnings:
          validation.warnings,
      });
    }


    // ========================================================
    // STEP 8 - DUPLICATE CHECK INSIDE EXCEL
    // ========================================================

    const bookSet =
      new Set();

    const duplicateCheckedBooks =
      [];

    for (
      const item
      of validBooks
    ) {

      const book =
        item.book;

      const uniqueKey =
        `${book.libraryCode}::${book.bookNumber}`;

      if (
        bookSet.has(
          uniqueKey
        )
      ) {

        failedBooks.push({
          row:
            item.row,

          bookNumber:
            book.bookNumber,

          bookName:
            book.bookName,

          reason:
            "Duplicate book number inside uploaded Excel.",

          errors: [
            {
              row:
                item.row,

              field:
                "bookNumber",

              receivedValue:
                book.bookNumber,

              reason:
                "Another row in this Excel file already uses the same book number for the same library.",

              expected:
                "Unique Library Code + Book Number combination.",
            },
          ],

          warnings:
            item.warnings ?? [],
        });

        continue;
      }

      bookSet.add(
        uniqueKey
      );

      duplicateCheckedBooks.push(
        item
      );
    }


    // ========================================================
    // STEP 9 - FIND LIBRARIES
    // ========================================================

    const libraryCodes =
      [
        ...new Set(
          duplicateCheckedBooks.map(
            (item) =>
              item.book.libraryCode
          )
        ),
      ];

    const libraries =
      await Library.find({
        institutionId,
        libraryCode: {
          $in:
            libraryCodes,
        },
        isDeleted: false,
      }).select(
        "_id libraryCode libraryName"
      );

    const libraryMap =
      new Map();

    libraries.forEach(
      (library) => {

        libraryMap.set(
          library.libraryCode
            .toUpperCase(),
          library
        );

      }
    );


    // ========================================================
    // STEP 10 - VALIDATE LIBRARY REFERENCES
    // ========================================================

    const booksReadyForDatabase =
      [];

    for (
      const item
      of duplicateCheckedBooks
    ) {

      const book =
        item.book;

      const library =
        libraryMap.get(
          book.libraryCode
        );

      if (!library) {

        failedBooks.push({
          row:
            item.row,

          bookNumber:
            book.bookNumber,

          bookName:
            book.bookName,

          reason:
            "Library not found.",

          errors: [
            {
              row:
                item.row,

              field:
                "libraryCode",

              receivedValue:
                book.libraryCode,

              reason:
                "The library code does not belong to an active library in the authenticated institution.",

              expected:
                "A valid active Library Code.",
            },
          ],

          warnings:
            item.warnings ?? [],
        });

        continue;
      }

      booksReadyForDatabase.push({
        row:
          item.row,

        book: {
          ...book,

          libraryId:
            library._id,

          institutionId,

          createdBy,

          // New bulk-uploaded books
          // start with every copy available.
          availableQuantity:
            book.quantity,

          // Publisher and Edition are
          // intentionally not part of
          // the bulk Excel.
          missingFields: [],
        },

        warnings:
          item.warnings ?? [],
      });
    }


    // ========================================================
    // STEP 11 - CHECK EXISTING BOOKS
    // ========================================================

    const existingBookQuery =
      booksReadyForDatabase.map(
        (item) => ({
          institutionId,
          libraryId:
            item.book.libraryId,
          bookNumber:
            item.book.bookNumber,
          isDeleted: false,
        })
      );

    let existingBooks = [];

    if (
      existingBookQuery.length > 0
    ) {

      existingBooks =
        await Book.find({
          $or:
            existingBookQuery,
        }).select(
          "institutionId libraryId bookNumber"
        );
    }


    const existingBookSet =
      new Set();

    existingBooks.forEach(
      (book) => {

        existingBookSet.add(
          `${book.libraryId.toString()}::${book.bookNumber}`
        );

      }
    );


    // ========================================================
    // STEP 12 - REMOVE DATABASE DUPLICATES
    // ========================================================

    const booksForInsertion =
      [];

    for (
      const item
      of booksReadyForDatabase
    ) {

      const book =
        item.book;

      const uniqueKey =
        `${book.libraryId.toString()}::${book.bookNumber}`;

      if (
        existingBookSet.has(
          uniqueKey
        )
      ) {

        failedBooks.push({
          row:
            item.row,

          bookNumber:
            book.bookNumber,

          bookName:
            book.bookName,

          reason:
            "Book already exists in this library.",

          errors: [
            {
              row:
                item.row,

              field:
                "bookNumber",

              receivedValue:
                book.bookNumber,

              reason:
                "An active book with the same book number already exists in this library.",

              expected:
                "A unique book number.",
            },
          ],

          warnings:
            item.warnings ?? [],
        });

        continue;
      }

      booksForInsertion.push(
        item
      );
    }


    // ========================================================
    // STEP 13 - INSERT VALID BOOKS
    // ========================================================

    let insertedBooks = [];

    if (
      booksForInsertion.length > 0
    ) {

      insertedBooks =
        await Book.insertMany(
          booksForInsertion.map(
            (item) =>
              item.book
          ),
          {
            ordered: false,
          }
        );
    }


    // ========================================================
    // STEP 14 - BUILD WARNINGS
    // ========================================================

    const importedWithWarnings =
      booksForInsertion
        .filter(
          (item) =>
            item.warnings &&
            item.warnings.length > 0
        )
        .map(
          (item) => ({
            row:
              item.row,

            bookNumber:
              item.book.bookNumber,

            bookName:
              item.book.bookName,

            warnings:
              item.warnings,
          })
        );


    // ========================================================
    // STEP 15 - FINAL RESULT
    // ========================================================

    return {
      success:
        insertedBooks.length > 0,

      message:
        insertedBooks.length > 0
          ? failedBooks.length > 0
            ? "Book bulk upload completed with some rejected rows."
            : importedWithWarnings.length > 0
              ? "Book bulk upload completed with warnings."
              : "Book bulk upload completed successfully."
          : "No books were uploaded.",

      sheetName,

      totalRows:
        rows.length,

      insertedCount:
        insertedBooks.length,

      failedCount:
        failedBooks.length,

      warningCount:
        importedWithWarnings.length,

      headerWarnings:
        headerValidation
          .warnings ?? [],

      importedWithWarnings,

      failedBooks,
    };
  };


  // ============================================================
// BULK UPDATE BOOKS
// ============================================================

export const bulkUpdateBooksService = async (
  file,
  {
    institutionId,
  }
) => {

  try {

    // ========================================================
    // STEP 1 - BASIC INPUT VALIDATION
    // ========================================================

    if (!file) {
      throw new Error(
        "Please upload an Excel file."
      );
    }

    if (!institutionId) {
      throw new Error(
        "Institution is required."
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        institutionId
      )
    ) {
      throw new Error(
        "Invalid institution ID."
      );
    }


    // ========================================================
    // STEP 2 - READ EXCEL WORKBOOK
    // ========================================================

    const workbook =
      xlsx.readFile(
        file.path
      );

    const sheetName =
      workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error(
        "Uploaded Excel file does not contain any worksheet."
      );
    }

    const worksheet =
      workbook.Sheets[
        sheetName
      ];

    if (!worksheet) {
      throw new Error(
        "Unable to read the Excel worksheet."
      );
    }


    // ========================================================
    // STEP 3 - READ ORIGINAL EXCEL HEADERS
    // ========================================================

    const sheetAsArray =
      xlsx.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
          defval: null,
          raw: false,
        }
      );

    if (
      !Array.isArray(
        sheetAsArray
      ) ||
      sheetAsArray.length === 0
    ) {
      throw new Error(
        "Uploaded Excel file is empty."
      );
    }

    const originalHeaders =
      Array.isArray(
        sheetAsArray[0]
      )
        ? sheetAsArray[0]
        : [];


    // ========================================================
    // STEP 4 - VALIDATE EXCEL HEADERS
    // ========================================================

const headerValidation =
  validateBulkUpdateBookHeaders(
    originalHeaders
  );

const headerWarnings =
  headerValidation.warnings ?? [];

if (
  !headerValidation.isValid
) {

      const error =
        new Error(
          "Excel header validation failed."
        );

      error.code =
        "EXCEL_HEADER_VALIDATION_FAILED";

      error.details = {
        sheetName,

        totalColumns:
          originalHeaders.length,

        errors:
          headerValidation.errors,

        warnings:
          headerValidation.warnings,
      };

      throw error;
    }


    // ========================================================
    // STEP 5 - BUILD FIELD LOCATION MAP
    // ========================================================

    const fieldLocationMap =
      buildBookExcelFieldLocationMap(
        originalHeaders
      );


    // ========================================================
    // STEP 6 - CONVERT EXCEL INTO OBJECT ROWS
    // ========================================================

    const rawRows =
      xlsx.utils.sheet_to_json(
        worksheet,
        {
          defval: null,
          raw: false,
        }
      );

    if (
      rawRows.length === 0
    ) {
      throw new Error(
        "Excel file contains headers but no book rows."
      );
    }


    // ========================================================
    // STEP 7 - NORMALIZE HEADERS + REMOVE EMPTY ROWS
    // ========================================================

    const rows =
      rawRows
        .map(
          normalizeBookBulkUpdateRow
        )
        .filter(
          (row) =>
            Object.values(
              row
            ).some(
              (value) => {

                if (
                  value === null ||
                  value === undefined
                ) {
                  return false;
                }

                return (
                  String(value)
                    .trim() !== ""
                );
              }
            )
        );

    if (
      rows.length === 0
    ) {
      throw new Error(
        "Excel file does not contain any book data."
      );
    }


    // ========================================================
    // PROCESSING ARRAYS
    // ========================================================

    const failedBooks = [];

    const validBooks = [];


    // ========================================================
    // STEP 8 - VALIDATE + BUILD PARTIAL UPDATES
    // ========================================================

    rows.forEach(
      (row, index) => {

        const rowNumber =
          index + 2;

        const errors = [];

        const warnings = [];


        // ====================================================
        // HELPER - CHECK WHETHER VALUE WAS SUPPLIED
        // ====================================================

        const hasValue =
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== "";


        // ====================================================
        // IDENTIFICATION
        // ====================================================

        const libraryCode =
          cleanBookNullableText(
            row.libraryCode
          )?.toUpperCase();

        const bookNumber =
          cleanBookNullableText(
            row.bookNumber
          )?.toUpperCase();

        const bookName =
          cleanBookNullableText(
            row.bookName
          ) || "";


        // ====================================================
        // LIBRARY CODE REQUIRED
        // ====================================================

        if (!libraryCode) {

          const location =
            getBookExcelFieldLocation(
              fieldLocationMap,
              "libraryCode"
            );

          errors.push({
            row:
              rowNumber,

            column:
              location.column,

            header:
              location.header,

            field:
              "libraryCode",

            receivedValue:
              row.libraryCode,

            reason:
              "Library code is required to identify the book.",

            expected:
              "Existing active library code",
          });
        }


        // ====================================================
        // BOOK NUMBER REQUIRED
        // ====================================================

        if (!bookNumber) {

          const location =
            getBookExcelFieldLocation(
              fieldLocationMap,
              "bookNumber"
            );

          errors.push({
            row:
              rowNumber,

            column:
              location.column,

            header:
              location.header,

            field:
              "bookNumber",

            receivedValue:
              row.bookNumber,

            reason:
              "Book number is required to identify the book.",

            expected:
              "Existing book number",
          });
        }


        // ====================================================
        // UPDATE DATA
        // ====================================================

        const updateData = {};


        // ====================================================
        // BOOK INFORMATION
        // ====================================================

        if (
          hasValue(
            row.bookName
          )
        ) {

          updateData.bookName =
            cleanBookNullableText(
              row.bookName
            );
        }


        if (
          hasValue(
            row.author
          )
        ) {

          updateData.author =
            cleanBookNullableText(
              row.author
            );
        }


        if (
          hasValue(
            row.publisher
          )
        ) {

          updateData.publisher =
            cleanBookNullableText(
              row.publisher
            );
        }


        if (
          hasValue(
            row.edition
          )
        ) {

          updateData.edition =
            cleanBookNullableText(
              row.edition
            );
        }


        if (
          hasValue(
            row.category
          )
        ) {

          updateData.category =
            cleanBookNullableText(
              row.category
            );
        }


        if (
          hasValue(
            row.language
          )
        ) {

          updateData.language =
            cleanBookNullableText(
              row.language
            );
        }


        // ====================================================
        // PRICE
        // ====================================================

        if (
          hasValue(
            row.price
          )
        ) {

          const price =
            Number(
              row.price
            );

          if (
            Number.isNaN(price) ||
            price < 0
          ) {

            const location =
              getBookExcelFieldLocation(
                fieldLocationMap,
                "price"
              );

            errors.push({
              row:
                rowNumber,

              column:
                location.column,

              header:
                location.header,

              field:
                "price",

              receivedValue:
                row.price,

              reason:
                "Price must be a valid number greater than or equal to 0.",

              expected:
                "Example: 650 or 650.50",
            });

          } else {

            updateData.price =
              price;
          }
        }


        // ====================================================
        // STATUS
        // ====================================================

        if (
          hasValue(
            row.status
          )
        ) {

          const status =
            cleanBookNullableText(
              row.status
            );

          if (
            !STATUS_VALUES.includes(
              status
            )
          ) {

            const location =
              getBookExcelFieldLocation(
                fieldLocationMap,
                "status"
              );

            errors.push({
              row:
                rowNumber,

              column:
                location.column,

              header:
                location.header,

              field:
                "status",

              receivedValue:
                row.status,

              reason:
                "Invalid book status.",

              expected:
                STATUS_VALUES.join(
                  ", "
                ),
            });

          } else {

            updateData.status =
              status;
          }
        }


        // ====================================================
        // QUANTITY
        // ====================================================

        let requestedQuantity =
          null;

        if (
          hasValue(
            row.quantity
          )
        ) {

          const quantity =
            Number(
              row.quantity
            );

          if (
            !Number.isInteger(
              quantity
            ) ||
            quantity < 0
          ) {

            const location =
              getBookExcelFieldLocation(
                fieldLocationMap,
                "quantity"
              );

            errors.push({
              row:
                rowNumber,

              column:
                location.column,

              header:
                location.header,

              field:
                "quantity",

              receivedValue:
                row.quantity,

              reason:
                "Quantity must be a whole number greater than or equal to 0.",

              expected:
                "Example: 10",
            });

          } else {

            requestedQuantity =
              quantity;
          }
        }


        // ====================================================
        // AVAILABLE QUANTITY
        // ====================================================

        let requestedAvailableQuantity =
          null;

        if (
          hasValue(
            row.availableQuantity
          )
        ) {

          const availableQuantity =
            Number(
              row.availableQuantity
            );

          if (
            !Number.isInteger(
              availableQuantity
            ) ||
            availableQuantity < 0
          ) {

            const location =
              getBookExcelFieldLocation(
                fieldLocationMap,
                "availableQuantity"
              );

            errors.push({
              row:
                rowNumber,

              column:
                location.column,

              header:
                location.header,

              field:
                "availableQuantity",

              receivedValue:
                row.availableQuantity,

              reason:
                "Available quantity must be a whole number greater than or equal to 0.",

              expected:
                "Example: 7",
            });

          } else {

            requestedAvailableQuantity =
              availableQuantity;
          }
        }


        // ====================================================
        // BOTH QUANTITY FIELDS
        // ====================================================

        if (
          requestedQuantity !== null &&
          requestedAvailableQuantity !== null
        ) {

          if (
            requestedAvailableQuantity >
            requestedQuantity
          ) {

            const location =
              getBookExcelFieldLocation(
                fieldLocationMap,
                "availableQuantity"
              );

            errors.push({
              row:
                rowNumber,

              column:
                location.column,

              header:
                location.header,

              field:
                "availableQuantity",

              receivedValue:
                requestedAvailableQuantity,

              reason:
                "Available quantity cannot be greater than total quantity.",

              expected:
                `Available quantity must be between 0 and ${requestedQuantity}.`,
            });
          }

          updateData.quantity =
            requestedQuantity;

          updateData.availableQuantity =
            requestedAvailableQuantity;
        }


        // ====================================================
        // ONLY QUANTITY PROVIDED
        // ====================================================

        if (
          requestedQuantity !== null &&
          requestedAvailableQuantity === null
        ) {

          updateData.quantity =
            requestedQuantity;

          // availableQuantity will be calculated
          // after the existing book is fetched.
        }


        // ====================================================
        // ONLY AVAILABLE QUANTITY PROVIDED
        // ====================================================

        if (
          requestedQuantity === null &&
          requestedAvailableQuantity !== null
        ) {

          updateData.availableQuantity =
            requestedAvailableQuantity;

          // Quantity validation will be performed
          // against the existing book.
        }


        // ====================================================
        // REJECT INVALID ROW
        // ====================================================

        if (
          errors.length > 0
        ) {

          failedBooks.push({
            row:
              rowNumber,

            libraryCode:
              libraryCode || null,

            bookNumber:
              bookNumber || null,

            bookName,

            reason:
              "Book update row contains invalid data.",

            errors,

            warnings,
          });

          return;
        }


        // ====================================================
        // NOTHING TO UPDATE
        // ====================================================

        if (
          Object.keys(
            updateData
          ).length === 0
        ) {

          failedBooks.push({
            row:
              rowNumber,

            libraryCode:
              libraryCode || null,

            bookNumber:
              bookNumber || null,

            bookName,

            reason:
              "No valid update values were supplied.",

            errors: [],

            warnings,
          });

          return;
        }


        // ====================================================
        // VALID UPDATE
        // ====================================================

validBooks.push({
  rowNumber,
  libraryCode,
  bookNumber,
  bookName,
  updateData,
  requestedQuantity,
  requestedAvailableQuantity,
  warnings,
});

      }
    );


    // ========================================================
    // STEP 9 - DUPLICATE IDENTIFIER CHECK INSIDE EXCEL
    // ========================================================

    const bookIdentifierMap =
      new Map();

    const duplicateBookIdentifiers =
      new Set();


    for (
      const item of validBooks
    ) {

      const identifier =
        `${item.libraryCode}::${item.bookNumber}`;

      if (
        bookIdentifierMap.has(
          identifier
        )
      ) {

        duplicateBookIdentifiers.add(
          identifier
        );

      } else {

        bookIdentifierMap.set(
          identifier,
          item.rowNumber
        );
      }
    }


    // ========================================================
    // REMOVE DUPLICATE UPDATE ROWS
    // ========================================================

    const booksForDatabaseCheck =
      validBooks.filter(
        (item) => {

          const identifier =
            `${item.libraryCode}::${item.bookNumber}`;

          if (
            !duplicateBookIdentifiers.has(
              identifier
            )
          ) {
            return true;
          }


          const firstRow =
            bookIdentifierMap.get(
              identifier
            );


          failedBooks.push({
            row:
              item.rowNumber,

            libraryCode:
              item.libraryCode,

            bookNumber:
              item.bookNumber,

            bookName:
              item.bookName,

            reason:
              "Duplicate library code and book number inside uploaded Excel.",

            errors: [
              {
                row:
                  item.rowNumber,

                field:
                  "bookNumber",

                receivedValue:
                  item.bookNumber,

                reason:
                  `This Library Code + Book Number combination is repeated in the Excel file. First occurrence is at row ${firstRow}.`,

                expected:
                  "One update row per Library Code + Book Number.",
              },
            ],

            warnings:
              item.warnings ??
              [],
          });


          return false;
        }
      );


    // ========================================================
    // STEP 10 - FETCH EXISTING LIBRARIES
    // ========================================================

    const libraryCodes =
      [
        ...new Set(
          booksForDatabaseCheck.map(
            (item) =>
              item.libraryCode
          )
        ),
      ];


    const libraries =
      libraryCodes.length > 0
        ? await Library.find({
            institutionId,

            libraryCode: {
              $in:
                libraryCodes,
            },

            isDeleted:
              false,
          })
            .select(
              "_id libraryCode libraryName"
            )
            .lean()
        : [];


    const libraryMap =
      new Map();


    libraries.forEach(
      (library) => {

        libraryMap.set(
          library.libraryCode
            .toUpperCase(),
          library
        );

      }
    );


    // ========================================================
    // STEP 11 - FETCH EXISTING BOOKS
    // ========================================================

    const bookConditions =
      booksForDatabaseCheck
        .map(
          (item) => {

            const library =
              libraryMap.get(
                item.libraryCode
              );

            if (!library) {
              return null;
            }

            return {
              institutionId,

              libraryId:
                library._id,

              bookNumber:
                item.bookNumber,

              isDeleted:
                false,
            };
          }
        )
        .filter(Boolean);


    const existingBooks =
      bookConditions.length > 0
        ? await Book.find({
            $or:
              bookConditions,
          })
            .select(
              "institutionId libraryId bookNumber bookName author publisher edition category language quantity availableQuantity price status"
            )
            .lean()
        : [];


    // ========================================================
    // BUILD EXISTING BOOK MAP
    // ========================================================

    const existingBookMap =
      new Map();


    existingBooks.forEach(
      (book) => {

        const identifier =
          `${book.libraryId.toString()}::${book.bookNumber}`;

        existingBookMap.set(
          identifier,
          book
        );

      }
    );


    // ========================================================
    // STEP 12 - BUILD BULK UPDATE OPERATIONS
    // ========================================================

    const operations = [];

    const updatedWithWarnings = [];


    for (
      const item of
      booksForDatabaseCheck
    ) {

      const rowNumber =
        item.rowNumber;


      const library =
        libraryMap.get(
          item.libraryCode
        );


      // ------------------------------------------------------
      // LIBRARY MUST EXIST
      // ------------------------------------------------------

      if (!library) {

        failedBooks.push({
          row:
            rowNumber,

          libraryCode:
            item.libraryCode,

          bookNumber:
            item.bookNumber,

          bookName:
            item.bookName,

          reason:
            "Library not found.",

          errors: [
            {
              row:
                rowNumber,

              field:
                "libraryCode",

              receivedValue:
                item.libraryCode,

              reason:
                "The library code does not belong to an active library in the authenticated institution.",

              expected:
                "A valid active Library Code.",
            },
          ],

          warnings:
            item.warnings ??
            [],
        });

        continue;
      }


      const identifier =
        `${library._id.toString()}::${item.bookNumber}`;


      const existingBook =
        existingBookMap.get(
          identifier
        );


      // ------------------------------------------------------
      // BOOK MUST EXIST
      // ------------------------------------------------------

      if (!existingBook) {

        failedBooks.push({
          row:
            rowNumber,

          libraryCode:
            item.libraryCode,

          bookNumber:
            item.bookNumber,

          bookName:
            item.bookName,

          reason:
            "Book not found in database.",

          errors: [
            {
              row:
                rowNumber,

              field:
                "bookNumber",

              receivedValue:
                item.bookNumber,

              reason:
                "No active book exists with this Library Code + Book Number combination.",

              expected:
                "Existing active book.",
            },
          ],

          warnings:
            item.warnings ??
            [],
        });

        continue;
      }


      // ------------------------------------------------------
      // CURRENT INVENTORY
      // ------------------------------------------------------

      const currentQuantity =
        Number(
          existingBook.quantity
        );

      const currentAvailableQuantity =
        Number(
          existingBook.availableQuantity
        );


      const currentIssuedQuantity =
        currentQuantity -
        currentAvailableQuantity;


      // ------------------------------------------------------
      // INVENTORY VALIDATION
      // ------------------------------------------------------

      if (
        currentIssuedQuantity < 0
      ) {

        failedBooks.push({
          row:
            rowNumber,

          libraryCode:
            item.libraryCode,

          bookNumber:
            item.bookNumber,

          bookName:
            item.bookName,

          reason:
            "Existing book inventory is inconsistent.",

          errors: [
            {
              row:
                rowNumber,

              field:
                "availableQuantity",

              receivedValue:
                item.requestedAvailableQuantity,

              reason:
                "Existing available quantity is greater than total quantity.",

              expected:
                "A valid existing inventory state.",
            },
          ],

          warnings:
            item.warnings ??
            [],
        });

        continue;
      }


      // ======================================================
      // QUANTITY + AVAILABLE QUANTITY
      // ======================================================

      if (
        item.requestedQuantity !==
        null
      ) {

        const newQuantity =
          item.requestedQuantity;


        // ----------------------------------------------------
        // If available quantity was NOT supplied
        // preserve the currently issued count.
        // ----------------------------------------------------

        if (
          item.requestedAvailableQuantity ===
          null
        ) {

          const newAvailableQuantity =
            newQuantity -
            currentIssuedQuantity;


          if (
            newAvailableQuantity < 0
          ) {

            failedBooks.push({
              row:
                rowNumber,

              libraryCode:
                item.libraryCode,

              bookNumber:
                item.bookNumber,

              bookName:
                item.bookName,

              reason:
                "New quantity is smaller than the number of books currently issued to students.",

              errors: [
                {
                  row:
                    rowNumber,

                  field:
                    "quantity",

                  receivedValue:
                    newQuantity,

                  reason:
                    `The book currently has ${currentIssuedQuantity} issued copies.`,

                  expected:
                    `Quantity must be at least ${currentIssuedQuantity}.`,
                },
              ],

              warnings:
                item.warnings ??
                [],
            });

            continue;
          }


          item.updateData.quantity =
            newQuantity;

          item.updateData.availableQuantity =
            newAvailableQuantity;
        }

      }


      // ======================================================
      // ONLY AVAILABLE QUANTITY
      // ======================================================

      if (
        item.requestedQuantity ===
        null &&
        item.requestedAvailableQuantity !==
          null
      ) {

        const newAvailableQuantity =
          item.requestedAvailableQuantity;


        if (
          newAvailableQuantity >
          currentQuantity
        ) {

          failedBooks.push({
            row:
              rowNumber,

            libraryCode:
              item.libraryCode,

            bookNumber:
              item.bookNumber,

            bookName:
              item.bookName,

            reason:
              "Available quantity cannot be greater than total quantity.",

            errors: [
              {
                row:
                  rowNumber,

                field:
                  "availableQuantity",

                receivedValue:
                  newAvailableQuantity,

                reason:
                  "Available quantity exceeds the existing total quantity.",

                expected:
                  `A value between 0 and ${currentQuantity}.`,
              },
            ],

            warnings:
              item.warnings ??
              [],
          });

          continue;
        }


        // ----------------------------------------------------
        // Prevent manually claiming more/less issued books
        // than the current distribution state.
        // ----------------------------------------------------

        const newIssuedQuantity =
          currentQuantity -
          newAvailableQuantity;


        if (
          newIssuedQuantity !==
          currentIssuedQuantity
        ) {

item.warnings.push({
  row:
    rowNumber,

  column:
    getBookExcelFieldLocation(
      fieldLocationMap,
      "availableQuantity"
    ).column,

  header:
    getBookExcelFieldLocation(
      fieldLocationMap,
      "availableQuantity"
    ).header,

  field:
    "availableQuantity",

  receivedValue:
    newAvailableQuantity,

  reason:
    "Available quantity was accepted as supplied. Distribution history reconciliation will be required when book distribution is implemented.",
});
        }


        item.updateData.availableQuantity =
          newAvailableQuantity;
      }


      // ======================================================
      // BOTH QUANTITY FIELDS - FINAL VALIDATION
      // ======================================================

      if (
        item.updateData.quantity !==
          undefined &&
        item.updateData.availableQuantity !==
          undefined
      ) {

        if (
          item.updateData.availableQuantity >
          item.updateData.quantity
        ) {

          failedBooks.push({
            row:
              rowNumber,

            libraryCode:
              item.libraryCode,

            bookNumber:
              item.bookNumber,

            bookName:
              item.bookName,

            reason:
              "Available quantity cannot be greater than total quantity.",

            errors: [
              {
                row:
                  rowNumber,

                field:
                  "availableQuantity",

                receivedValue:
                  item.updateData
                    .availableQuantity,

                reason:
                  "Available quantity must be less than or equal to total quantity.",

                expected:
                  `A value between 0 and ${item.updateData.quantity}.`,
              },
            ],

            warnings:
              item.warnings ??
              [],
          });

          continue;
        }
      }


      // ======================================================
      // MISSING FIELDS
      // ======================================================

      const finalBookName =
        item.updateData.bookName ??
        existingBook.bookName ??
        "";

      const finalAuthor =
        item.updateData.author ??
        existingBook.author ??
        "";

      const finalPublisher =
        item.updateData.publisher ??
        existingBook.publisher ??
        "";

      const finalEdition =
        item.updateData.edition ??
        existingBook.edition ??
        "";

      const finalCategory =
        item.updateData.category ??
        existingBook.category ??
        "";

      const finalLanguage =
        item.updateData.language ??
        existingBook.language ??
        "";


      const missingFields = [];


      if (
        !String(
          finalBookName
        ).trim()
      ) {
        missingFields.push(
          "bookName"
        );
      }

      if (
        !String(
          finalAuthor
        ).trim()
      ) {
        missingFields.push(
          "author"
        );
      }

      if (
        !String(
          finalPublisher
        ).trim()
      ) {
        missingFields.push(
          "publisher"
        );
      }

      if (
        !String(
          finalEdition
        ).trim()
      ) {
        missingFields.push(
          "edition"
        );
      }

      if (
        !String(
          finalCategory
        ).trim()
      ) {
        missingFields.push(
          "category"
        );
      }

      if (
        !String(
          finalLanguage
        ).trim()
      ) {
        missingFields.push(
          "language"
        );
      }


      item.updateData.missingFields =
        missingFields;


      // ======================================================
      // BUILD OPERATION
      // ======================================================

      operations.push({
        updateOne: {

          filter: {
            _id:
              existingBook._id,

            institutionId,

            libraryId:
              library._id,

            bookNumber:
              item.bookNumber,

            isDeleted:
              false,
          },

          update: {
            $set:
              item.updateData,
          },
        },
      });


      // ======================================================
      // WARNINGS
      // ======================================================

      if (
        item.warnings?.length > 0
      ) {

        updatedWithWarnings.push({
          row:
            rowNumber,

          libraryCode:
            item.libraryCode,

          bookNumber:
            item.bookNumber,

          bookName:
            finalBookName,

          warnings:
            item.warnings,
        });
      }

    }


    // ========================================================
    // STEP 13 - NO VALID BOOKS TO UPDATE
    // ========================================================

    if (
      operations.length === 0
    ) {

      if (
        file?.path &&
        fs.existsSync(
          file.path
        )
      ) {

        fs.unlinkSync(
          file.path
        );
      }


      return {
        success:
          false,

        code:
          "NO_BOOKS_UPDATED",

        message:
          "No books were updated. Please review the rejected rows and try again.",

        totalRows:
          rows.length,

        processedCount:
          0,

        matchedCount:
          0,

        modifiedCount:
          0,

        unchangedCount:
          0,

        failedCount:
          failedBooks.length,

        warningCount:
          0,

        headerWarnings,

        updatedWithWarnings:
          [],

        failedBooks,
      };
    }


    // ========================================================
    // STEP 14 - RUN BULK UPDATE TRANSACTION
    // ========================================================

    const session =
      await mongoose.startSession();

    let bulkResult;


    try {

      session.startTransaction();


      bulkResult =
        await Book.bulkWrite(
          operations,
          {
            session,

            ordered:
              true,
          }
        );


      await session.commitTransaction();

    } catch (error) {

      await session.abortTransaction();

      throw error;

    } finally {

      await session.endSession();
    }


    // ========================================================
    // DELETE EXCEL AFTER SUCCESS
    // ========================================================

    if (
      file?.path &&
      fs.existsSync(
        file.path
      )
    ) {

      fs.unlinkSync(
        file.path
      );
    }


    // ========================================================
    // STEP 15 - FINAL REPORT
    // ========================================================

    const matchedCount =
      bulkResult?.matchedCount ??
      0;

    const modifiedCount =
      bulkResult?.modifiedCount ??
      0;

    const unchangedCount =
      matchedCount -
      modifiedCount;


    const warningCount =
      updatedWithWarnings.reduce(
        (
          total,
          item
        ) =>
          total +
          (
            item.warnings
              ?.length ??
            0
          ),

        0
      );


    const hasFailures =
      failedBooks.length >
      0;

    const hasWarnings =
      warningCount > 0 ||
      headerWarnings.length > 0;


    let message =
      "Bulk Book Update Completed Successfully.";


    if (
      hasFailures
    ) {

      message =
        "Book bulk update completed with some rejected rows.";

    } else if (
      hasWarnings
    ) {

      message =
        "Book bulk update completed with warnings.";
    }


    // ========================================================
    // RETURN REPORT
    // ========================================================

    return {
      success:
        true,

      message,

      totalRows:
        rows.length,

      processedCount:
        operations.length,

      matchedCount,

      modifiedCount,

      unchangedCount,

      failedCount:
        failedBooks.length,

      warningCount,

      headerWarnings,

      updatedWithWarnings,

      failedBooks,
    };


  } catch (error) {

    // ========================================================
    // DELETE EXCEL ON ERROR
    // ========================================================

    if (
      file?.path &&
      fs.existsSync(
        file.path
      )
    ) {

      fs.unlinkSync(
        file.path
      );
    }

    throw error;
  }
};