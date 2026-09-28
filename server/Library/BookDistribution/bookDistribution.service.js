import mongoose from "mongoose";

import Book from "../Bookcurd/book.model.js";
import BookDistribution from "./BookDistribution.model.js";

import Student from "../../student/student.model.js";
import User from "../../user/models/user.model.js";

import TeachingFaculty from "../../user/models/teachingFaculty.model.js";
import NonTeachingFaculty from "../../user/models/nonTeachingFaculty.model.js";


// ============================================================
// COMMON HELPERS
// ============================================================

const escapeRegex = (value = "") => {
  return String(value)
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


// ============================================================
// 1. SEARCH BORROWERS
// ============================================================
//
// Searches:
// Student:
//   - studentName
//   - registerNumber
//
// Faculty:
//   - fullName
//   - employeeId
//
// Both Student + Faculty are returned together.
// ============================================================

export const searchBorrowersService = async ({
  institutionId,
  search,
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  if (!search || !search.trim()) {
    return {
      students: [],
      faculty: [],
    };
  }


  const searchRegex = new RegExp(
    escapeRegex(search),
    "i"
  );


  // ==========================================================
  // STUDENTS
  // ==========================================================

  const students =
    await Student.find({
      institutionId,

      isDeleted: false,

      $or: [
        {
          studentName:
            searchRegex,
        },

        {
          registerNumber:
            searchRegex,
        },
      ],
    })
      .populate(
        "departmentId",
        "departmentName"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode"
      )
      .populate(
        "classId",
        "year section"
      )
      .select(
        "studentName registerNumber profilePhoto institutionId departmentId programmeId classId admissionStatus studentType"
      )
      .limit(20)
      .lean();


  // ==========================================================
  // USERS WHO MATCH FACULTY NAME
  // ==========================================================

  const matchingFacultyUsers =
    await User.find({
      institution: institutionId,

      isDeleted: false,

      status: "active",

      role: {
        $in: [
          "teaching_faculty",
          "non_teaching_faculty",
        ],
      },

      fullName:
        searchRegex,
    })
      .select(
        "_id fullName email phone institution department role status profileImage"
      )
      .populate(
        "department",
        "departmentName"
      )
      .lean();


  const matchingUserIds =
    matchingFacultyUsers.map(
      (user) => user._id
    );


  // ==========================================================
  // TEACHING FACULTY
  // ==========================================================

  const teachingFaculty =
    await TeachingFaculty.find({

      $or: [
        {
          employeeId:
            searchRegex,
        },

        {
          userId: {
            $in:
              matchingUserIds,
          },
        },
      ],

    })
      .populate({
        path: "userId",
        match: {
          institution:
            institutionId,

          isDeleted: false,

          status: "active",

          role:
            "teaching_faculty",
        },

        select:
          "fullName email phone institution department role status profileImage",

        populate: {
          path: "department",
          select:
            "departmentName",
        },
      })
      .select(
        "userId employeeId designation department"
      )
      .lean();


  // ==========================================================
  // NON-TEACHING FACULTY
  // ==========================================================

  const nonTeachingFaculty =
    await NonTeachingFaculty.find({

      $or: [
        {
          employeeId:
            searchRegex,
        },

        {
          userId: {
            $in:
              matchingUserIds,
          },
        },
      ],

    })
      .populate({
        path: "userId",
        match: {
          institution:
            institutionId,

          isDeleted: false,

          status: "active",

          role:
            "non_teaching_faculty",
        },

        select:
          "fullName email phone institution department role status profileImage",

        populate: {
          path: "department",
          select:
            "departmentName",
        },
      })
      .select(
        "userId employeeId designation department"
      )
      .lean();


  // ==========================================================
  // FORMAT FACULTY
  // ==========================================================

  const faculty = [
    ...teachingFaculty,
    ...nonTeachingFaculty,
  ]
    .filter(
      (facultyMember) =>
        facultyMember.userId
    )
    .map(
      (facultyMember) => ({
        id:
          facultyMember.userId._id,

        facultyId:
          facultyMember.userId._id,

        employeeId:
          facultyMember.employeeId,

        fullName:
          facultyMember.userId.fullName,

        email:
          facultyMember.userId.email,

        phone:
          facultyMember.userId.phone,

        profileImage:
          facultyMember.userId.profileImage,

        role:
          facultyMember.userId.role,

        designation:
          facultyMember.designation,

        department:
          facultyMember.userId.department,

        facultyType:
          facultyMember.userId.role ===
          "teaching_faculty"
            ? "Teaching Faculty"
            : "Non-Teaching Faculty",
      })
    );


  return {
    students,

    faculty,
  };
};


// ============================================================
// 2. GET AVAILABLE BOOKS
// ============================================================
//
// Only books belonging to the authenticated institution,
// active, non-deleted and having available copies.
// ============================================================

export const getAvailableBooksService = async ({
  institutionId,
  libraryId,
  search,
  category,
  language,
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  const query = {
    institutionId,

    isDeleted: false,

    status: "Active",

    availableQuantity: {
      $gt: 0,
    },
  };


  if (libraryId) {
    query.libraryId =
      libraryId;
  }


  if (search?.trim()) {

    const searchRegex =
      new RegExp(
        escapeRegex(search),
        "i"
      );

    query.$or = [
      {
        bookNumber:
          searchRegex,
      },

      {
        bookName:
          searchRegex,
      },

      {
        author:
          searchRegex,
      },
    ];
  }


  if (category?.trim()) {
    query.category = {
      $regex:
        escapeRegex(category),
      $options: "i",
    };
  }


  if (language?.trim()) {
    query.language = {
      $regex:
        escapeRegex(language),
      $options: "i",
    };
  }


  return await Book.find(query)
    .populate(
      "libraryId",
      "libraryName libraryCode"
    )
    .select(
      "libraryId bookNumber bookName author category language quantity availableQuantity price status"
    )
    .sort({
      bookName: 1,
    })
    .lean();
};


// ============================================================
// 3. ISSUE / DISTRIBUTE BOOKS
// ============================================================
//
// One borrower can receive multiple selected books.
//
// Every issued book gets its own BookDistribution document.
//
// Book availability is decreased atomically.
// ============================================================

export const issueBooksService = async ({
  institutionId,
  libraryId,
  borrowerType,
  studentId,
  facultyId,
  bookIds,
  dueDate,
  remarks,
  issuedBy,
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  if (!issuedBy) {
    throw new Error(
      "Issued by user is required."
    );
  }


  if (
    !["Student", "Faculty"]
      .includes(
        borrowerType
      )
  ) {
    throw new Error(
      "Invalid borrower type."
    );
  }


  // ==========================================================
  // BORROWER VALIDATION
  // ==========================================================

  if (
    borrowerType === "Student"
  ) {

    if (!studentId) {
      throw new Error(
        "Student ID is required."
      );
    }

    if (facultyId) {
      throw new Error(
        "Faculty ID must not be supplied for a student distribution."
      );
    }

  } else {

    if (!facultyId) {
      throw new Error(
        "Faculty ID is required."
      );
    }

    if (studentId) {
      throw new Error(
        "Student ID must not be supplied for a faculty distribution."
      );
    }
  }


  // ==========================================================
  // BOOK VALIDATION
  // ==========================================================

  if (
    !Array.isArray(bookIds) ||
    bookIds.length === 0
  ) {
    throw new Error(
      "At least one book must be selected."
    );
  }


  const uniqueBookIds =
    [
      ...new Set(
        bookIds.map(
          (id) =>
            String(id)
        )
      ),
    ];


  const session =
    await mongoose.startSession();


  try {

    session.startTransaction();


    // ========================================================
    // VALIDATE BORROWER
    // ========================================================

    if (
      borrowerType === "Student"
    ) {

      const student =
        await Student.findOne({
          _id: studentId,

          institutionId,

          isDeleted: false,
        })
          .session(session)
          .lean();


      if (!student) {
        throw new Error(
          "Student not found in the authenticated institution."
        );
      }

    } else {

      const faculty =
        await User.findOne({
          _id: facultyId,

          institution:
            institutionId,

          isDeleted: false,

          status: "active",

          role: {
            $in: [
              "teaching_faculty",
              "non_teaching_faculty",
            ],
          },
        })
          .session(session)
          .lean();


      if (!faculty) {
        throw new Error(
          "Faculty not found in the authenticated institution."
        );
      }
    }


    // ========================================================
    // VALIDATE BOOKS
    // ========================================================

    const books =
      await Book.find({
        _id: {
          $in:
            uniqueBookIds,
        },

        institutionId,

        ...(libraryId
          ? { libraryId }
          : {}),

        isDeleted: false,

        status: "Active",
      })
        .session(session);


    if (
      books.length !==
      uniqueBookIds.length
    ) {
      throw new Error(
        "One or more selected books were not found in the selected library."
      );
    }


    // ========================================================
    // PREVENT DUPLICATE ACTIVE ISSUE
    // ========================================================

    const existingDistributionQuery =
      {
        institutionId,

        bookId: {
          $in:
            uniqueBookIds,
        },

        status: "Issued",

        ...(borrowerType ===
        "Student"
          ? {
              studentId,
              facultyId: null,
            }
          : {
              facultyId,
              studentId: null,
            }),
      };


    const existingDistributions =
      await BookDistribution.find(
        existingDistributionQuery
      )
        .session(session)
        .lean();


    if (
      existingDistributions.length
    ) {

      const existingBookIds =
        existingDistributions.map(
          (item) =>
            String(
              item.bookId
            )
        );


      throw new Error(
        `One or more selected books are already issued to this ${borrowerType.toLowerCase()}: ${existingBookIds.join(", ")}.`
      );
    }


    // ========================================================
    // CHECK AVAILABILITY
    // ========================================================

    for (
      const book of books
    ) {

      if (
        book.availableQuantity <=
        0
      ) {

        throw new Error(
          `Book "${book.bookName}" (${book.bookNumber}) is currently unavailable.`
        );
      }
    }


    // ========================================================
    // ISSUE DATE
    // ========================================================

    const issueDate =
      new Date();


    // ========================================================
    // CREATE DISTRIBUTION RECORDS
    // ========================================================

    const distributionDocuments =
      books.map(
        (book) => ({
          institutionId,

          libraryId:
            book.libraryId,

          bookId:
            book._id,

          borrowerType,

          studentId:
            borrowerType ===
            "Student"
              ? studentId
              : null,

          facultyId:
            borrowerType ===
            "Faculty"
              ? facultyId
              : null,

          issueDate,

          dueDate:
            dueDate
              ? new Date(
                  dueDate
                )
              : null,

          returnDate:
            null,

          daysTaken:
            0,

          status:
            "Issued",

          issuedBy,

          receivedBy:
            null,

          remarks:
            remarks?.trim() ||
            "",
        })
      );


    const createdDistributions =
      await BookDistribution.insertMany(
        distributionDocuments,
        {
          session,
        }
      );


    // ========================================================
    // DECREASE AVAILABLE QUANTITY
    // ========================================================

    for (
      const book of books
    ) {

      const updatedBook =
        await Book.findOneAndUpdate(
          {
            _id:
              book._id,

            institutionId,

            isDeleted:
              false,

            availableQuantity:
              {
                $gt: 0,
              },
          },
          {
            $inc: {
              availableQuantity:
                -1,
            },
          },
          {
            new: true,

            session,
          }
        );


      if (!updatedBook) {

        throw new Error(
          `Book "${book.bookName}" became unavailable while processing the distribution.`
        );
      }
    }


    await session.commitTransaction();


    return {
      createdCount:
        createdDistributions.length,

      data:
        createdDistributions,
    };

  } catch (error) {

    await session.abortTransaction();

    throw error;

  } finally {

    await session.endSession();
  }
};


// ============================================================
// 4. GET BOOK DISTRIBUTION
// ============================================================
//
// Used by Component A when a librarian clicks a book.
//
// Returns people currently holding the book.
// ============================================================

export const getBookDistributionService = async ({
  institutionId,
  bookId,
  status = "Issued",
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  if (!bookId) {
    throw new Error(
      "Book ID is required."
    );
  }


  const query = {
    institutionId,

    bookId,
  };


  if (status) {
    query.status =
      status;
  }


  const distributions =
    await BookDistribution.find(
      query
    )
      .populate(
        "bookId",
        "bookNumber bookName category language"
      )
      .populate(
        "libraryId",
        "libraryName libraryCode"
      )
      .populate(
        "studentId",
        "studentName registerNumber profilePhoto departmentId programmeId"
      )
      .populate(
        "facultyId",
        "fullName email phone department profileImage role"
      )
      .populate(
        "issuedBy",
        "fullName email"
      )
      .populate(
        "receivedBy",
        "fullName email"
      )
      .sort({
        issueDate: -1,
      })
      .lean();


  return distributions;
};


// ============================================================
// 5. GET STUDENT BOOKS
// ============================================================
//
// Component B uses this to check whether a student
// currently has books or previous distribution history.
// ============================================================

export const getStudentBooksService = async ({
  institutionId,
  studentId,
  currentOnly = false,
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  if (!studentId) {
    throw new Error(
      "Student ID is required."
    );
  }


  const student =
    await Student.findOne({
      _id: studentId,

      institutionId,

      isDeleted: false,
    })
      .select(
        "studentName registerNumber institutionId departmentId programmeId classId"
      )
      .populate(
        "departmentId",
        "departmentName"
      )
      .populate(
        "programmeId",
        "programmeName programmeCode"
      )
      .populate(
        "classId",
        "year section"
      )
      .lean();


  if (!student) {
    throw new Error(
      "Student not found in the authenticated institution."
    );
  }


  const query = {
    institutionId,

    studentId,
  };


  if (currentOnly) {
    query.status =
      "Issued";
  }


  const distributions =
    await BookDistribution.find(
      query
    )
      .populate(
        "bookId",
        "bookNumber bookName author category language"
      )
      .populate(
        "libraryId",
        "libraryName libraryCode"
      )
      .populate(
        "issuedBy",
        "fullName email"
      )
      .populate(
        "receivedBy",
        "fullName email"
      )
      .sort({
        issueDate: -1,
      })
      .lean();


  return {
    student,
    distributions,
  };
};


// ============================================================
// 6. GET FACULTY BOOKS
// ============================================================
//
// Component C uses this to check whether a faculty member
// currently has books or previous distribution history.
// ============================================================

export const getFacultyBooksService = async ({
  institutionId,
  facultyId,
  currentOnly = false,
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  if (!facultyId) {
    throw new Error(
      "Faculty ID is required."
    );
  }


  // ==========================================================
  // FACULTY USER
  // ==========================================================

  const faculty =
    await User.findOne({
      _id: facultyId,

      institution:
        institutionId,

      isDeleted: false,

      status: "active",

      role: {
        $in: [
          "teaching_faculty",
          "non_teaching_faculty",
        ],
      },
    })
      .select(
        "fullName email phone institution department role status profileImage"
      )
      .populate(
        "institution",
        "institutionName institutionCode"
      )
      .populate(
        "department",
        "departmentName"
      )
      .lean();


  if (!faculty) {
    throw new Error(
      "Faculty not found in the authenticated institution."
    );
  }


  // ==========================================================
  // TEACHING PROFILE
  // ==========================================================

  let facultyProfile =
    await TeachingFaculty.findOne({
      userId:
        facultyId,

      isDeleted:
        false,
    })
      .select(
        "employeeId designation department"
      )
      .populate(
        "department",
        "departmentName"
      )
      .lean();


  let facultyType =
    "Teaching Faculty";


  // ==========================================================
  // NON-TEACHING PROFILE
  // ==========================================================

  if (!facultyProfile) {

    facultyProfile =
      await NonTeachingFaculty.findOne({
        userId:
          facultyId,

        isDeleted:
          false,
      })
        .select(
          "employeeId designation department"
        )
        .populate(
          "department",
          "departmentName"
        )
        .lean();

    facultyType =
      "Non-Teaching Faculty";
  }


  const query = {
    institutionId,

    facultyId,
  };


  if (currentOnly) {
    query.status =
      "Issued";
  }


  const distributions =
    await BookDistribution.find(
      query
    )
      .populate(
        "bookId",
        "bookNumber bookName author category language"
      )
      .populate(
        "libraryId",
        "libraryName libraryCode"
      )
      .populate(
        "issuedBy",
        "fullName email"
      )
      .populate(
        "receivedBy",
        "fullName email"
      )
      .sort({
        issueDate: -1,
      })
      .lean();


  return {
    faculty: {
      ...faculty,

      employeeId:
        facultyProfile?.employeeId ??
        null,

      designation:
        facultyProfile?.designation ??
        null,

      facultyType,

      profileDepartment:
        facultyProfile?.department ??
        null,
    },

    distributions,
  };
};


// ============================================================
// 7. RETURN BOOK
// ============================================================
//
// Marks one active distribution as Returned,
// calculates daysTaken,
// and increases availableQuantity.
// ============================================================

export const returnBookService = async ({
  institutionId,
  distributionId,
  receivedBy,
  status,
  remarks,
}) => {

  // ============================================================
  // VALIDATION
  // ============================================================

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  if (!distributionId) {
    throw new Error(
      "Distribution ID is required."
    );
  }


  if (!receivedBy) {
    throw new Error(
      "Received by user is required."
    );
  }


  // ============================================================
  // RETURN STATUS VALIDATION
  // ============================================================

  const allowedStatuses = [
    "Returned",
    "Damaged",
    "Lost",
  ];


  if (
    !status ||
    !allowedStatuses.includes(status)
  ) {
    throw new Error(
      "Valid return status is required. Allowed values: Returned, Damaged, Lost."
    );
  }


  // ============================================================
  // DATABASE SESSION
  // ============================================================

  const session =
    await mongoose.startSession();


  try {

    session.startTransaction();


    // ========================================================
    // FIND ACTIVE DISTRIBUTION
    // ========================================================

    const distribution =
      await BookDistribution.findOne({

        _id:
          distributionId,

        institutionId,

        status:
          "Issued",

      })
        .session(session);


    if (!distribution) {

      throw new Error(
        "Active book distribution record not found."
      );

    }


    // ========================================================
    // FIND BOOK
    // ========================================================

    const book =
      await Book.findOne({

        _id:
          distribution.bookId,

        institutionId,

        libraryId:
          distribution.libraryId,

        isDeleted:
          false,

      })
        .session(session);


    if (!book) {

      throw new Error(
        "Book associated with this distribution was not found."
      );

    }


    // ========================================================
    // RETURN DATE
    // ========================================================

    const returnDate =
      new Date();


    // ========================================================
    // CALCULATE DAYS TAKEN
    // ========================================================

    const issueDate =
      new Date(
        distribution.issueDate
      );


    const millisecondsPerDay =
      1000 *
      60 *
      60 *
      24;


    const daysTaken =
      Math.max(

        0,

        Math.ceil(

          (
            returnDate.getTime() -
            issueDate.getTime()
          ) /
          millisecondsPerDay

        )

      );


    // ========================================================
    // UPDATE DISTRIBUTION
    // ========================================================

    distribution.returnDate =
      returnDate;


    distribution.daysTaken =
      daysTaken;


    distribution.status =
      status;


    distribution.receivedBy =
      receivedBy;


    // ========================================================
    // REMARKS
    // ========================================================

    if (
      remarks !==
      undefined
    ) {

      distribution.remarks =
        String(
          remarks
        ).trim();

    }


    await distribution.save({
      session,
    });


    // ========================================================
    // RESTORE AVAILABLE QUANTITY
    //
    // ONLY A NORMAL RETURN MAKES THE BOOK AVAILABLE AGAIN.
    //
    // Returned  → availableQuantity + 1
    // Damaged   → no inventory increase
    // Lost      → no inventory increase
    // ========================================================

    let updatedBook =
      book;


    if (
      status ===
      "Returned"
    ) {

      updatedBook =
        await Book.findOneAndUpdate(

          {

            _id:
              book._id,

            institutionId,

            libraryId:
              book.libraryId,

            isDeleted:
              false,

            $expr: {

              $lt: [
                "$availableQuantity",
                "$quantity",
              ],

            },

          },

          {

            $inc: {

              availableQuantity:
                1,

            },

          },

          {

            new: true,

            session,

          }

        );


      if (!updatedBook) {

        throw new Error(
          "Book inventory could not be restored during return."
        );

      }

    }


    // ========================================================
    // COMMIT TRANSACTION
    // ========================================================

    await session.commitTransaction();


    // ========================================================
    // RESPONSE
    // ========================================================

    return {

      distribution:
        distribution.toObject(),

      book:
        updatedBook.toObject(),

    };


  } catch (error) {

    await session.abortTransaction();

    throw error;

  } finally {

    await session.endSession();

  }

};


// ============================================================
// 8. GET DISTRIBUTION HISTORY
// ============================================================
//
// Can be used by Component A for complete book history.
// ============================================================

export const getDistributionHistoryService = async ({
  institutionId,
  bookId,
  studentId,
  facultyId,
  libraryId,
}) => {

  if (!institutionId) {
    throw new Error(
      "Institution is required."
    );
  }


  const query = {
    institutionId,
  };


  if (bookId) {
    query.bookId =
      bookId;
  }


  if (studentId) {
    query.studentId =
      studentId;
  }


  if (facultyId) {
    query.facultyId =
      facultyId;
  }


  if (libraryId) {
    query.libraryId =
      libraryId;
  }


  const history =
    await BookDistribution.find(
      query
    )
      .populate(
        "bookId",
        "bookNumber bookName author category language"
      )
      .populate(
        "libraryId",
        "libraryName libraryCode"
      )
      .populate(
        "studentId",
        "studentName registerNumber profilePhoto departmentId programmeId"
      )
      .populate(
        "facultyId",
        "fullName email phone department role profileImage"
      )
      .populate(
        "issuedBy",
        "fullName email"
      )
      .populate(
        "receivedBy",
        "fullName email"
      )
      .sort({
        issueDate: -1,
      })
      .lean();


  return history;
};