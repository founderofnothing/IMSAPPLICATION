import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "react-toastify";

import API from "../../../api/axios";

import "./LibraryFaculty.css"  

const LibraryFaculty = () => {

  /* ============================================================
                          FACULTY STATE
  ============================================================ */

  const [search, setSearch] =
    useState("");

  const [facultyList, setFacultyList] =
    useState([]);

  const [selectedFacultyType, setSelectedFacultyType] =
    useState("All");


  /* ============================================================
                         FACULTY LOADING
  ============================================================ */

  const [facultyLoading, setFacultyLoading] =
    useState(false);

  const [facultyError, setFacultyError] =
    useState("");


  /* ============================================================
                       SELECTED FACULTY
  ============================================================ */

  const [selectedFaculty, setSelectedFaculty] =
    useState(null);


  /* ============================================================
                         FACULTY BOOKS
  ============================================================ */

  const [distributions, setDistributions] =
    useState([]);

  const [distributionLoading, setDistributionLoading] =
    useState(false);

  const [distributionError, setDistributionError] =
    useState("");


    const [selectedFacultyModalOpen, setSelectedFacultyModalOpen] =
  useState(false);

  /* ============================================================
                       RETURN MODAL STATE
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
                      FETCH ALL FACULTY
  ============================================================ */

  const fetchFaculty = async () => {

    try {

      setFacultyLoading(true);

      setFacultyError("");


      const response =
        await API.get(
          "/users/faculty",
          {
            params: {
              page: 1,
              limit: 1000,
            },
          }
        );


      const faculty =
        response.data?.data || [];


      setFacultyList(
        faculty
      );


    } catch (error) {

      console.error(
        "FETCH FACULTY ERROR:",
        error.response?.data ||
        error
      );


      setFacultyList([]);


      setFacultyError(
        error.response?.data?.message ||
        "Failed to fetch faculty."
      );


    } finally {

      setFacultyLoading(
        false
      );

    }

  };


  /* ============================================================
                    INITIAL FACULTY FETCH
  ============================================================ */

  useEffect(() => {

    fetchFaculty();

  }, []);


  /* ============================================================
                       SEARCH FACULTY
  ============================================================ */

  const searchedFaculty =
    useMemo(() => {

      const trimmedSearch =
        search
          .trim()
          .toLowerCase();


      if (!trimmedSearch) {

        return facultyList;

      }


      return facultyList.filter(
        (faculty) => {

          const name =
            faculty.user?.fullName
              ?.toLowerCase() ||
            "";


          const employeeId =
            faculty.employeeId
              ?.toLowerCase() ||
            "";


          const email =
            faculty.user?.email
              ?.toLowerCase() ||
            "";


          return (
            name.includes(
              trimmedSearch
            ) ||
            employeeId.includes(
              trimmedSearch
            ) ||
            email.includes(
              trimmedSearch
            )
          );

        }
      );

    }, [
      facultyList,
      search,
    ]);


  /* ============================================================
                     FACULTY TYPE FILTER
  ============================================================ */

  const filteredFaculty =
    useMemo(() => {

      if (
        selectedFacultyType ===
        "All"
      ) {

        return searchedFaculty;

      }


      return searchedFaculty.filter(
        (faculty) =>
          faculty.facultyType ===
          selectedFacultyType
      );

    }, [
      searchedFaculty,
      selectedFacultyType,
    ]);


  /* ============================================================
                    FETCH FACULTY BOOKS
  ============================================================ */

  const fetchFacultyBooks =
    async (userId) => {

      if (!userId) {

        toast.error(
          "Faculty user ID is missing."
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
            "/book-distribution/faculty/books",
            {
              params: {
                facultyId:
                  userId,

                currentOnly:
                  true,
              },
            }
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
          "FETCH FACULTY BOOKS ERROR:",
          error.response?.data ||
          error
        );


        setDistributions([]);


        setDistributionError(
          error.response?.data?.message ||
          "Failed to fetch faculty books."
        );


        toast.error(
          error.response?.data?.message ||
          "Failed to fetch faculty books."
        );


      } finally {

        setDistributionLoading(
          false
        );

      }

    };


  /* ============================================================
                       SELECT FACULTY
  ============================================================ */

const handleSelectFaculty = (faculty) => {
  setSelectedFaculty(faculty);

  setDistributions([]);

  setDistributionError("");

  setSelectedFacultyModalOpen(true);

  fetchFacultyBooks(
    faculty.userId
  );
};


const handleCloseFacultyModal = () => {
  if (returningBookId) {
    return;
  }

  setSelectedFacultyModalOpen(false);
};

  /* ============================================================
                    OPEN RETURN MODAL
  ============================================================ */

/* ============================================================
   OPEN RETURN MODAL
============================================================ */

const handleOpenReturnModal = (distribution) => {

  if (!distribution?._id) {

    toast.error(
      "Distribution information is missing."
    );

    return;
  }

  // Store selected book
  setSelectedDistribution(
    distribution
  );

  // Reset return form
  setReturnStatus(
    "Returned"
  );

  setReturnRemarks(
    ""
  );

  // Close faculty popup
  setSelectedFacultyModalOpen(
    false
  );

  // Open return popup
  setReturnModalOpen(
    true
  );

};


  /* ============================================================
                    CLOSE RETURN MODAL
  ============================================================ */

/* ============================================================
   CLOSE RETURN MODAL
============================================================ */

const handleCloseReturnModal = () => {

  if (returningBookId) {
    return;
  }

  // Close return modal
  setReturnModalOpen(
    false
  );

  // Clear selected distribution
  setSelectedDistribution(
    null
  );

  // Reset form
  setReturnStatus(
    "Returned"
  );

  setReturnRemarks(
    ""
  );

  // Re-open faculty popup
  setSelectedFacultyModalOpen(
    true
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
           Remove returned book from current list
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
           Close modal
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
           Success message
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
                         CLEAR FILTERS
  ============================================================ */

  const handleClearFilters =
    () => {

      setSearch("");

      setSelectedFacultyType(
        "All"
      );

    };


  /* ============================================================
                         FORMAT DATE
  ============================================================ */

  const formatDate =
    (date) => {

      if (!date) {

        return "-";

      }


      return new Date(
        date
      ).toLocaleDateString(
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

    <div className="library-faculty-page">


      {/* ========================================================
                              HEADER
      ======================================================== */}

      <div className="library-faculty-header">

        <div>

          <h1>
            Faculty Library
          </h1>

          <p>
            Search and select a faculty
            member to view and receive
            their currently issued books.
          </p>

        </div>

      </div>


      {/* ========================================================
                     FACULTY SEARCH / LIST
      ======================================================== */}

      <section className="library-faculty-list-section">


        {/* ======================================================
                         SEARCH / FILTERS
        ====================================================== */}

        <div className="library-faculty-toolbar">


          <div className="library-faculty-search">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search faculty by name, employee ID or email..."
            />

          </div>


          <div className="library-faculty-filter">

            <select
              value={
                selectedFacultyType
              }
              onChange={(event) =>
                setSelectedFacultyType(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Faculty
              </option>

              <option value="Teaching">
                Teaching Faculty
              </option>

              <option value="Non Teaching">
                Non-Teaching Faculty
              </option>

            </select>

          </div>


          {(search ||
            selectedFacultyType !==
              "All") && (

            <button
              type="button"
              onClick={
                handleClearFilters
              }
              className="library-faculty-clear-button"
            >
              Clear
            </button>

          )}

        </div>


        {/* ======================================================
                            LOADING
        ====================================================== */}

        {facultyLoading && (

          <div className="library-faculty-loading">

            <p>
              Loading faculty...
            </p>

          </div>

        )}


        {/* ======================================================
                              ERROR
        ====================================================== */}

        {!facultyLoading &&
          facultyError && (

            <div className="library-faculty-error">

              <p>
                {facultyError}
              </p>

              <button
                type="button"
                onClick={
                  fetchFaculty
                }
              >
                Try Again
              </button>

            </div>

          )}


        {/* ======================================================
                          NO FACULTY
        ====================================================== */}

        {!facultyLoading &&
          !facultyError &&
          facultyList.length ===
            0 && (

            <div className="library-faculty-empty">

              <h3>
                No faculty found
              </h3>

              <p>
                No faculty members are
                currently available.
              </p>

            </div>

          )}


        {/* ======================================================
                       SEARCH NO RESULT
        ====================================================== */}

        {!facultyLoading &&
          !facultyError &&
          facultyList.length > 0 &&
          filteredFaculty.length ===
            0 && (

            <div className="library-faculty-empty">

              <h3>
                No matching faculty
              </h3>

              <p>
                Try changing your search
                or faculty type filter.
              </p>

            </div>

          )}


        {/* ======================================================
                          FACULTY TABLE
        ====================================================== */}

        {!facultyLoading &&
          !facultyError &&
          filteredFaculty.length > 0 && (

            <div className="library-faculty-table-wrapper">

              <table className="library-faculty-table">

                <thead>

                  <tr>

                    <th>#</th>

                    <th>Faculty</th>

                    <th>Employee ID</th>

                    <th>Designation</th>

                    <th>Faculty Type</th>

                    <th>Action</th>

                  </tr>

                </thead>


                <tbody>

                  {filteredFaculty.map(
                    (
                      faculty,
                      index
                    ) => (

                      <tr
                        key={
                          faculty.userId ||
                          faculty.employeeId ||
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>


                        <td>

                          <div className="library-faculty-profile">

                            {faculty.user
                              ?.profileImage ? (

                              <img
                                src={
                                  faculty.user
                                    .profileImage
                                }
                                alt={
                                  faculty.user
                                    ?.fullName ||
                                  "Faculty"
                                }
                                className="library-faculty-profile-image"
                              />

                            ) : (

                              <div className="library-faculty-profile-placeholder">

                                {
                                  faculty.user
                                    ?.fullName
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase() ||
                                  "F"
                                }

                              </div>

                            )}


                            <div>

                              <p className="library-faculty-name">

                                {
                                  faculty.user
                                    ?.fullName ||
                                  "N/A"
                                }

                              </p>


                              <p className="library-faculty-email">

                                {
                                  faculty.user
                                    ?.email ||
                                  "No email"
                                }

                              </p>

                            </div>

                          </div>

                        </td>


                        <td>

                          {
                            faculty.employeeId ||
                            "N/A"
                          }

                        </td>


                        <td>

                          {
                            faculty.designation ||
                            "N/A"
                          }

                        </td>


                        <td>

                          {
                            faculty.facultyType ||
                            "N/A"
                          }

                        </td>


                        <td>

                          <button
                            type="button"
                            className="library-faculty-select-button"
                            onClick={() =>
                              handleSelectFaculty(
                                faculty
                              )
                            }
                          >
                            Select
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
                         SELECTED FACULTY
      ======================================================== */}

{/* ========================================================
                   SELECTED FACULTY POPUP
======================================================== */}

{selectedFacultyModalOpen &&
  selectedFaculty && (

    <div
      className="library-selected-faculty-modal-overlay"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          handleCloseFacultyModal();
        }

      }}
    >

      <div
        className="library-selected-faculty-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="selected-faculty-modal-title"
      >

        {/* ==================================================
                       POPUP HEADER
        ================================================== */}

        <div className="library-selected-faculty-modal-header">

          <div>

            <span>
              Faculty Library
            </span>

            <h2 id="selected-faculty-modal-title">
              Selected Faculty
            </h2>

            <p>
              View books currently issued to
              this faculty member.
            </p>

          </div>


          <button
            type="button"
            className="library-selected-faculty-modal-close"
            onClick={
              handleCloseFacultyModal
            }
          >
            ×
          </button>

        </div>


        {/* ==================================================
                     FACULTY INFORMATION
        ================================================== */}

        <div className="library-selected-faculty-card">

          <div className="library-selected-faculty-profile">

            {selectedFaculty.user
              ?.profileImage ? (

              <img
                src={
                  selectedFaculty.user
                    .profileImage
                }
                alt={
                  selectedFaculty.user
                    ?.fullName ||
                  "Faculty"
                }
                className="library-faculty-profile-image"
              />

            ) : (

              <div className="library-faculty-profile-placeholder">

                {
                  selectedFaculty.user
                    ?.fullName
                    ?.charAt(0)
                    ?.toUpperCase() ||
                  "F"
                }

              </div>

            )}


            <div>

              <h2>
                {
                  selectedFaculty.user
                    ?.fullName ||
                  "Faculty"
                }
              </h2>

              <p>
                {
                  selectedFaculty.employeeId ||
                  "No Employee ID"
                }
              </p>

            </div>

          </div>


          <div className="library-selected-faculty-details">

            <div>

              <span>
                Designation
              </span>

              <strong>
                {
                  selectedFaculty.designation ||
                  "-"
                }
              </strong>

            </div>


            <div>

              <span>
                Faculty Type
              </span>

              <strong>
                {
                  selectedFaculty.facultyType ||
                  "-"
                }
              </strong>

            </div>

          </div>

        </div>


        {/* ==================================================
                       CURRENTLY ISSUED BOOKS
        ================================================== */}

        <div className="library-selected-faculty-books">

          <div className="library-selected-faculty-books-header">

            <div>

              <h3>
                Currently Issued Books
              </h3>

              <p>
                Books currently held by this
                faculty member.
              </p>

            </div>


            <span>

              {distributions.length}

              {" "}

              {
                distributions.length === 1
                  ? "Book"
                  : "Books"
              }

            </span>

          </div>


          {/* ==================================================
                         BOOK LOADING
          ================================================== */}

          {distributionLoading && (

            <div className="library-faculty-books-state">

              <p>
                Loading issued books...
              </p>

            </div>

          )}


          {/* ==================================================
                           BOOK ERROR
          ================================================== */}

          {!distributionLoading &&
            distributionError && (

              <div className="library-faculty-books-state">

                <p>
                  {
                    distributionError
                  }
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchFacultyBooks(
                      selectedFaculty.userId
                    )
                  }
                >
                  Try Again
                </button>

              </div>

            )}


          {/* ==================================================
                            NO BOOKS
          ================================================== */}

          {!distributionLoading &&
            !distributionError &&
            distributions.length ===
              0 && (

              <div className="library-faculty-books-state">

                <h3>
                  No books pending
                </h3>

                <p>
                  This faculty member has no
                  books currently issued from
                  the library.
                </p>

              </div>

            )}


          {/* ==================================================
                            BOOK TABLE
          ================================================== */}

          {!distributionLoading &&
            !distributionError &&
            distributions.length >
              0 && (

              <div className="library-faculty-books-table-wrapper">

                <table className="library-faculty-books-table">

                  <thead>

                    <tr>

                      <th>#</th>

                      <th>Book</th>

                      <th>Book Number</th>

                      <th>Issue Date</th>

                      <th>Due Date</th>

                      <th>Status</th>

                      <th>Action</th>

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
                                `library-faculty-status-badge ${
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
                              className="library-faculty-return-button"
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

        <div className="library-selected-faculty-modal-footer">

          <button
            type="button"
            onClick={
              handleCloseFacultyModal
            }
          >
            Close
          </button>

        </div>

      </div>

    </div>

  )}


      {/* ========================================================
                       RETURN BOOK MODAL
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
            className="flt_library-return-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="library-return-modal-title"
          >


            {/* ==================================================
                              MODAL HEADER
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
                  returningBookId !== null
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
                      Book is in normal condition
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
                      Book returned with damage
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
                      Book was not physically returned
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

                <label htmlFor="return-remarks">
                  Remarks
                </label>

                <span>
                  Optional
                </span>

              </div>


              <textarea
                id="return-remarks"
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
                              MODAL FOOTER
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


export default LibraryFaculty;