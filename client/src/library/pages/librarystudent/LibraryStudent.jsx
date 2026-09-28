import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "react-toastify";

import API from "../../../api/axios";

import "./LibraryStudent.css";


const LibraryStudent = () => {

  /* ============================================================
                         STUDENT STATE
  ============================================================ */

  const [search, setSearch] =
    useState("");

  const [studentList, setStudentList] =
    useState([]);


  /* ============================================================
                       STUDENT LOADING
  ============================================================ */

  const [studentLoading, setStudentLoading] =
    useState(false);

  const [studentError, setStudentError] =
    useState("");


  /* ============================================================
                      SELECTED STUDENT
  ============================================================ */

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [selectedStudentModalOpen, setSelectedStudentModalOpen] =
    useState(false);


  /* ============================================================
                        STUDENT BOOKS
  ============================================================ */

  const [distributions, setDistributions] =
    useState([]);

  const [distributionLoading, setDistributionLoading] =
    useState(false);

  const [distributionError, setDistributionError] =
    useState("");


  /* ============================================================
                         RETURN MODAL
  ============================================================ */

  const [returnModalOpen, setReturnModalOpen] =
    useState(false);

  const [selectedDistribution, setSelectedDistribution] =
    useState(null);

  const [returnStatus, setReturnStatus] =
    useState("Returned");

  const [returnRemarks, setReturnRemarks] =
    useState("");

  const [returningBookId, setReturningBookId] =
    useState(null);


  /* ============================================================
                       FETCH ALL STUDENTS
  ============================================================ */

  const fetchStudents = async () => {

    try {

      setStudentLoading(true);

      setStudentError("");


      const response =
        await API.get(
          "/students/",
          {
            params: {
              page: 1,
              limit: 1000,
            },
          }
        );


      const students =
        response.data?.data || [];


      setStudentList(
        students
      );


    } catch (error) {

      console.error(
        "FETCH STUDENTS ERROR:",
        error.response?.data ||
        error
      );


      setStudentList([]);


      setStudentError(
        error.response?.data?.message ||
        "Failed to fetch students."
      );


    } finally {

      setStudentLoading(
        false
      );

    }

  };


  /* ============================================================
                    INITIAL STUDENT FETCH
  ============================================================ */

  useEffect(() => {

    fetchStudents();

  }, []);


  /* ============================================================
                       SEARCH STUDENTS
  ============================================================ */

  const filteredStudents =
    useMemo(() => {

      const trimmedSearch =
        search
          .trim()
          .toLowerCase();


      if (!trimmedSearch) {

        return studentList;

      }


      return studentList.filter(
        (student) => {

          const name =
            student.studentName
              ?.toLowerCase() ||
            "";


          const registerNumber =
            student.registerNumber
              ?.toLowerCase() ||
            "";


          const email =
            student.studentEmail
              ?.toLowerCase() ||
            "";


          return (
            name.includes(
              trimmedSearch
            ) ||
            registerNumber.includes(
              trimmedSearch
            ) ||
            email.includes(
              trimmedSearch
            )
          );

        }
      );

    }, [
      studentList,
      search,
    ]);


  /* ============================================================
                    FETCH STUDENT BOOKS
  ============================================================ */

  const fetchStudentBooks =
    async (studentId) => {

      if (!studentId) {

        toast.error(
          "Student ID is missing."
        );

        return;

      }


      try {

        setDistributionLoading(
          true
        );

        setDistributionError("");


        const response =
          await API.get(
            "/book-distribution/student/books",
            {
              params: {
                studentId,

                currentOnly:
                  true,
              },
            }
          );


        console.log(
          "STUDENT BOOK API RESPONSE:",
          response.data
        );


        const distributions =
          response.data?.data
            ?.distributions ||
          [];


        setDistributions(
          distributions
        );


      } catch (error) {

        console.error(
          "FETCH STUDENT BOOKS ERROR:",
          error.response?.data ||
          error
        );


        setDistributions([]);


        setDistributionError(
          error.response?.data?.message ||
          "Failed to fetch student books."
        );


        toast.error(
          error.response?.data?.message ||
          "Failed to fetch student books."
        );


      } finally {

        setDistributionLoading(
          false
        );

      }

    };


  /* ============================================================
                       SELECT STUDENT
  ============================================================ */

  const handleSelectStudent =
    (student) => {

      console.log(
        "SELECTED STUDENT:",
        student
      );


      if (!student?._id) {

        toast.error(
          "Student ID is missing."
        );

        return;

      }


      setSelectedStudent(
        student
      );


      setDistributions([]);

      setDistributionError("");


      setSelectedStudentModalOpen(
        true
      );


      fetchStudentBooks(
        student._id
      );

    };


  /* ============================================================
                  CLOSE STUDENT POPUP
  ============================================================ */

  const handleCloseStudentModal =
    () => {

      if (returningBookId) {

        return;

      }


      setSelectedStudentModalOpen(
        false
      );

    };


  /* ============================================================
                    OPEN RETURN MODAL
  ============================================================ */

  const handleOpenReturnModal =
    (distribution) => {

      if (!distribution?._id) {

        toast.error(
          "Distribution information is missing."
        );

        return;

      }


      setSelectedDistribution(
        distribution
      );


      setReturnStatus(
        "Returned"
      );


      setReturnRemarks(
        ""
      );


      setReturnModalOpen(
        true
      );

    };


  /* ============================================================
                    CLOSE RETURN MODAL
  ============================================================ */

  const handleCloseReturnModal =
    () => {

      if (returningBookId) {

        return;

      }


      setReturnModalOpen(
        false
      );


      setSelectedDistribution(
        null
      );


      setReturnStatus(
        "Returned"
      );


      setReturnRemarks(
        ""
      );

    };


  /* ============================================================
                       RETURN BOOK
  ============================================================ */

  const handleReturnBook =
    async () => {

      const distributionId =
        selectedDistribution?._id;


      if (!distributionId) {

        toast.error(
          "Distribution information is missing."
        );

        return;

      }


      try {

        setReturningBookId(
          distributionId
        );


        const response =
          await API.patch(
            "/book-distribution/return",
            {
              distributionId,

              status:
                returnStatus,

              remarks:
                returnRemarks.trim(),
            }
          );


        /* ------------------------------------------------------
                     REMOVE RETURNED BOOK
        ------------------------------------------------------ */

        setDistributions(
          (currentDistributions) =>
            currentDistributions.filter(
              (item) =>
                item._id !==
                distributionId
            )
        );


        /* ------------------------------------------------------
                       CLOSE RETURN MODAL
        ------------------------------------------------------ */

        setReturnModalOpen(
          false
        );


        setSelectedDistribution(
          null
        );


        setReturnStatus(
          "Returned"
        );


        setReturnRemarks(
          ""
        );


        /* ------------------------------------------------------
                         SUCCESS MESSAGE
        ------------------------------------------------------ */

        toast.success(
          response.data?.message ||
          (
            returnStatus ===
            "Returned"
              ? "Book returned successfully."
              : returnStatus ===
                "Damaged"
                ? "Book marked as damaged successfully."
                : "Book marked as lost successfully."
          )
        );


      } catch (error) {

        console.error(
          "RETURN BOOK ERROR:",
          error.response?.data ||
          error
        );


        toast.error(
          error.response?.data?.message ||
          "Failed to process book return."
        );


      } finally {

        setReturningBookId(
          null
        );

      }

    };


  /* ============================================================
                         CLEAR SEARCH
  ============================================================ */

  const handleClearSearch =
    () => {

      setSearch("");

    };


  /* ============================================================
                         FORMAT DATE
  ============================================================ */

  const formatDate =
    (date) => {

      if (!date) {

        return "-";

      }


      const parsedDate =
        new Date(date);


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return "-";

      }


      return parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    };


  /* ============================================================
                            RENDER
  ============================================================ */

  return (

    <div className="library-student-page">


      {/* ========================================================
                              HEADER
      ======================================================== */}

      <div className="library-student-header">

        <div>

          <h1>
            Student Library
          </h1>

          <p>
            Search and select a student
            to view and receive their
            currently issued books.
          </p>

        </div>

      </div>


      {/* ========================================================
                         STUDENT LIST
      ======================================================== */}

      <section className="library-student-list-section">


        {/* ======================================================
                         TOOLBAR
        ====================================================== */}

        <div className="library-student-toolbar">


          <div className="library-student-search">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search student by name, register number or email..."
            />

          </div>


          {search && (

            <button
              type="button"
              className="library-student-clear-button"
              onClick={
                handleClearSearch
              }
            >
              Clear
            </button>

          )}

        </div>


        {/* ======================================================
                            LOADING
        ====================================================== */}

        {studentLoading && (

          <div className="library-student-loading">

            <p>
              Loading students...
            </p>

          </div>

        )}


        {/* ======================================================
                             ERROR
        ====================================================== */}

        {!studentLoading &&
          studentError && (

            <div className="library-student-error">

              <p>
                {studentError}
              </p>


              <button
                type="button"
                onClick={
                  fetchStudents
                }
              >
                Try Again
              </button>

            </div>

          )}


        {/* ======================================================
                         NO STUDENTS
        ====================================================== */}

        {!studentLoading &&
          !studentError &&
          studentList.length ===
            0 && (

            <div className="library-student-empty">

              <h3>
                No students found
              </h3>

              <p>
                No students are currently
                available.
              </p>

            </div>

          )}


        {/* ======================================================
                      SEARCH NO RESULT
        ====================================================== */}

        {!studentLoading &&
          !studentError &&
          studentList.length > 0 &&
          filteredStudents.length ===
            0 && (

            <div className="library-student-empty">

              <h3>
                No matching students
              </h3>

              <p>
                Try changing your search.
              </p>

            </div>

          )}


        {/* ======================================================
                        STUDENT TABLE
        ====================================================== */}

        {!studentLoading &&
          !studentError &&
          filteredStudents.length >
            0 && (

            <div className="library-student-table-wrapper">

              <table className="library-student-table">

                <thead>

                  <tr>

                    <th>
                      #
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Register Number
                    </th>

                    <th>
                      Class
                    </th>

                    <th>
                      Gender
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredStudents.map(
                    (
                      student,
                      index
                    ) => (

                      <tr
                        key={
                          student._id ||
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>


                        {/* STUDENT */}

                        <td>

                          <div className="library-student-profile">

                            <div className="library-student-profile-placeholder">

                              {
                                student.studentName
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                "S"
                              }

                            </div>


                            <div>

                              <p className="library-student-name">

                                {
                                  student.studentName ||
                                  "N/A"
                                }

                              </p>


                              <p className="library-student-email">

                                {
                                  student.studentEmail ||
                                  "No email"
                                }

                              </p>

                            </div>

                          </div>

                        </td>


                        {/* REGISTER NUMBER */}

                        <td>

                          {
                            student.registerNumber ||
                            "N/A"
                          }

                        </td>


                        {/* CLASS */}

                        <td>

                          {student.classId
                            ? `${student.classId.year || ""} ${
                                student.classId.section || ""
                              }`
                            : "N/A"}

                        </td>


                        {/* GENDER */}

                        <td>

                          {
                            student.gender ||
                            "N/A"
                          }

                        </td>


                        {/* ACTION */}

                        <td>

                          <button
                            type="button"
                            className="library-student-select-button"
                            onClick={() =>
                              handleSelectStudent(
                                student
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </section>


      {/* ========================================================
                    SELECTED STUDENT POPUP
      ======================================================== */}

      {selectedStudentModalOpen &&
        selectedStudent && (

        <div
          className="library-selected-student-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              handleCloseStudentModal();

            }

          }}
        >

          <div
            className="library-selected-student-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="selected-student-modal-title"
          >


            {/* ==================================================
                           POPUP HEADER
            ================================================== */}

            <div className="library-selected-student-modal-header">

              <div>

                <span>
                  Student Library
                </span>

                <h2 id="selected-student-modal-title">
                  Selected Student
                </h2>

                <p>
                  View books currently issued
                  to this student.
                </p>

              </div>


              <button
                type="button"
                className="library-selected-student-modal-close"
                onClick={
                  handleCloseStudentModal
                }
                disabled={
                  returningBookId !==
                  null
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* ==================================================
                         STUDENT INFORMATION
            ================================================== */}

            <div className="library-selected-student-card">


              <div className="library-selected-student-profile">

                <div className="library-student-profile-placeholder">

                  {
                    selectedStudent.studentName
                      ?.charAt(
                        0
                      )
                      ?.toUpperCase() ||
                    "S"
                  }

                </div>


                <div>

                  <h2>

                    {
                      selectedStudent.studentName ||
                      "Student"
                    }

                  </h2>


                  <p>

                    {
                      selectedStudent.registerNumber ||
                      "No Register Number"
                    }

                  </p>

                </div>

              </div>


              <div className="library-selected-student-details">


                <div>

                  <span>
                    Gender
                  </span>

                  <strong>

                    {
                      selectedStudent.gender ||
                      "-"
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Class
                  </span>

                  <strong>

                    {selectedStudent.classId
                      ? `${selectedStudent.classId.year || ""} ${
                          selectedStudent.classId.section || ""
                        }`
                      : "-"}

                  </strong>

                </div>


                <div>

                  <span>
                    Email
                  </span>

                  <strong>

                    {
                      selectedStudent.studentEmail ||
                      "-"
                    }

                  </strong>

                </div>

              </div>

            </div>


            {/* ==================================================
                       CURRENTLY ISSUED BOOKS
            ================================================== */}

            <div className="library-selected-student-books">


              <div className="library-selected-student-books-header">

                <div>

                  <h3>
                    Currently Issued Books
                  </h3>

                  <p>
                    Books currently held by this
                    student.
                  </p>

                </div>


                <span>

                  {distributions.length}

                  {" "}

                  {
                    distributions.length ===
                    1
                      ? "Book"
                      : "Books"
                  }

                </span>

              </div>


              {/* =================================================
                          BOOK LOADING
              ================================================= */}

              {distributionLoading && (

                <div className="library-student-books-state">

                  <p>
                    Loading issued books...
                  </p>

                </div>

              )}


              {/* =================================================
                           BOOK ERROR
              ================================================= */}

              {!distributionLoading &&
                distributionError && (

                <div className="library-student-books-state">

                  <h3>
                    Unable to load books
                  </h3>

                  <p>
                    {
                      distributionError
                    }
                  </p>


                  <button
                    type="button"
                    onClick={() =>
                      fetchStudentBooks(
                        selectedStudent._id
                      )
                    }
                  >
                    Try Again
                  </button>

                </div>

              )}


              {/* =================================================
                            NO BOOKS
              ================================================= */}

              {!distributionLoading &&
                !distributionError &&
                distributions.length ===
                  0 && (

                <div className="library-student-books-state">

                  <h3>
                    No books pending
                  </h3>

                  <p>
                    This student has no books
                    currently issued from the
                    library.
                  </p>

                </div>

              )}


              {/* =================================================
                           BOOK TABLE
              ================================================= */}

              {!distributionLoading &&
                !distributionError &&
                distributions.length >
                  0 && (

                <div className="library-student-books-table-wrapper">

                  <table className="library-student-books-table">

                    <thead>

                      <tr>

                        <th>
                          #
                        </th>

                        <th>
                          Book
                        </th>

                        <th>
                          Book Number
                        </th>

                        <th>
                          Issue Date
                        </th>

                        <th>
                          Due Date
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {distributions.map(
                        (
                          distribution,
                          index
                        ) => (

                          <tr
                            key={
                              distribution._id
                            }
                          >

                            <td>
                              {index + 1}
                            </td>


                            <td>

                              <div>

                                <strong>

                                  {
                                    distribution.bookId
                                      ?.bookName ||
                                    "-"
                                  }

                                </strong>


                                {distribution.bookId
                                  ?.author && (

                                  <p>

                                    {
                                      distribution.bookId
                                        .author
                                    }

                                  </p>

                                )}

                              </div>

                            </td>


                            <td>

                              {
                                distribution.bookId
                                  ?.bookNumber ||
                                "-"
                              }

                            </td>


                            <td>

                              {
                                formatDate(
                                  distribution.issueDate
                                )
                              }

                            </td>


                            <td>

                              {
                                formatDate(
                                  distribution.dueDate
                                )
                              }

                            </td>


                            <td>

                              <span
                                className={
                                  `library-student-status-badge ${
                                    distribution.status
                                      ?.toLowerCase() ||
                                    ""
                                  }`
                                }
                              >

                                {
                                  distribution.status
                                }

                              </span>

                            </td>


                            <td>

                              <button
                                type="button"
                                className="library-student-return-button"
                                disabled={
                                  returningBookId ===
                                  distribution._id
                                }
                                onClick={() =>
                                  handleOpenReturnModal(
                                    distribution
                                  )
                                }
                              >
                                Received
                              </button>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>


            {/* ==================================================
                            POPUP FOOTER
            ================================================== */}

            <div className="library-selected-student-modal-footer">

              <button
                type="button"
                onClick={
                  handleCloseStudentModal
                }
                disabled={
                  returningBookId !==
                  null
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ========================================================
                         RECEIVE BOOK POPUP
      ======================================================== */}

      {returnModalOpen &&
        selectedDistribution && (

        <div
          className="library-return-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              handleCloseReturnModal();

            }

          }}
        >

          <div
            className="std_library-return-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-return-modal-title"
          >


            {/* ==================================================
                              HEADER
            ================================================== */}

            <div className="library-return-modal-header">

              <div>

                <span className="library-return-modal-eyebrow">
                  Library Return
                </span>

                <h2 id="library-return-modal-title">
                  Receive Book
                </h2>

                <p>
                  Confirm the condition of the
                  book before completing the return.
                </p>

              </div>


              <button
                type="button"
                className="library-return-modal-close"
                onClick={
                  handleCloseReturnModal
                }
                disabled={
                  returningBookId !==
                  null
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>


            {/* ==================================================
                           BOOK DETAILS
            ================================================== */}

            <div className="library-return-book-details">

              <div className="library-return-book-main">

                <h3>

                  {
                    selectedDistribution.bookId
                      ?.bookName ||
                    "Unknown Book"
                  }

                </h3>

                <p>

                  {
                    selectedDistribution.bookId
                      ?.author ||
                    "Unknown Author"
                  }

                </p>

              </div>


              <div className="library-return-book-meta">


                <div>

                  <span>
                    Book Number
                  </span>

                  <strong>

                    {
                      selectedDistribution.bookId
                        ?.bookNumber ||
                      "-"
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Issue Date
                  </span>

                  <strong>

                    {
                      formatDate(
                        selectedDistribution.issueDate
                      )
                    }

                  </strong>

                </div>


                <div>

                  <span>
                    Due Date
                  </span>

                  <strong>

                    {
                      formatDate(
                        selectedDistribution.dueDate
                      )
                    }

                  </strong>

                </div>

              </div>

            </div>


            {/* ==================================================
                        RETURN CONDITION
            ================================================== */}

            <div className="library-return-condition-section">

              <div className="library-return-field-header">

                <label>
                  Return Condition
                </label>

                <span>
                  Required
                </span>

              </div>


              <div className="library-return-condition-options">


                {/* RETURNED */}

                <button
                  type="button"
                  className={
                    `library-return-condition-option ${
                      returnStatus ===
                      "Returned"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setReturnStatus(
                      "Returned"
                    )
                  }
                  disabled={
                    returningBookId !==
                    null
                  }
                >

                  <span className="library-return-condition-radio">

                    {returnStatus ===
                      "Returned" && (

                      <span />

                    )}

                  </span>


                  <span>

                    <strong>
                      Returned
                    </strong>

                    <small>
                      Book is in normal condition.
                    </small>

                  </span>

                </button>


                {/* DAMAGED */}

                <button
                  type="button"
                  className={
                    `library-return-condition-option ${
                      returnStatus ===
                      "Damaged"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setReturnStatus(
                      "Damaged"
                    )
                  }
                  disabled={
                    returningBookId !==
                    null
                  }
                >

                  <span className="library-return-condition-radio">

                    {returnStatus ===
                      "Damaged" && (

                      <span />

                    )}

                  </span>


                  <span>

                    <strong>
                      Damaged
                    </strong>

                    <small>
                      Book returned with damage.
                    </small>

                  </span>

                </button>


                {/* LOST */}

                <button
                  type="button"
                  className={
                    `library-return-condition-option ${
                      returnStatus ===
                      "Lost"
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setReturnStatus(
                      "Lost"
                    )
                  }
                  disabled={
                    returningBookId !==
                    null
                  }
                >

                  <span className="library-return-condition-radio">

                    {returnStatus ===
                      "Lost" && (

                      <span />

                    )}

                  </span>


                  <span>

                    <strong>
                      Lost
                    </strong>

                    <small>
                      Book was not physically returned.
                    </small>

                  </span>

                </button>

              </div>

            </div>


            {/* ==================================================
                              REMARKS
            ================================================== */}

            <div className="library-return-remarks-section">

              <div className="library-return-field-header">

                <label htmlFor="student-return-remarks">
                  Remarks
                </label>

                <span>
                  Optional
                </span>

              </div>


              <textarea
                id="student-return-remarks"
                value={
                  returnRemarks
                }
                onChange={(event) =>
                  setReturnRemarks(
                    event.target.value
                  )
                }
                placeholder={
                  returnStatus ===
                  "Damaged"
                    ? "Describe the damage..."
                    : returnStatus ===
                      "Lost"
                      ? "Add details about the lost book..."
                      : "Add any remarks about this return..."
                }
                rows={4}
                disabled={
                  returningBookId !==
                  null
                }
              />

            </div>


            {/* ==================================================
                             FOOTER
            ================================================== */}

            <div className="library-return-modal-footer">

              <button
                type="button"
                className="library-return-cancel-button"
                onClick={
                  handleCloseReturnModal
                }
                disabled={
                  returningBookId !==
                  null
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="library-return-confirm-button"
                onClick={
                  handleReturnBook
                }
                disabled={
                  returningBookId !==
                  null
                }
              >

                {returningBookId !==
                null

                  ? "Processing..."

                  : returnStatus ===
                    "Returned"

                    ? "Confirm Return"

                    : returnStatus ===
                      "Damaged"

                      ? "Mark as Damaged"

                      : "Mark as Lost"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};


export default LibraryStudent;