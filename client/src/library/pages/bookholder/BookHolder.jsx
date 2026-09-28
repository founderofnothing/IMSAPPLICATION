import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import API from "../../../api/axios";

import "./bookholder.css";

// import "./bookholder.css";


const BookHolder = () => {

  /* =========================================================
                        ROUTE
  ========================================================= */

  const {
    bookId,
  } = useParams();

  const navigate =
    useNavigate();


  /* =========================================================
                          BOOK
  ========================================================= */

  const [book, setBook] =
    useState(null);

  const [bookLoading, setBookLoading] =
    useState(true);


  /* =========================================================
                    DISTRIBUTION
  ========================================================= */

  const [distributions, setDistributions] =
    useState([]);

  const [distributionLoading, setDistributionLoading] =
    useState(true);


  /* =========================================================
                       STATUS TAB
  ========================================================= */

  const [status, setStatus] =
    useState("Issued");


  /* =========================================================
                     FETCH BOOK
  ========================================================= */

  const fetchBook = async () => {

    try {

      setBookLoading(true);


      const response =
        await API.get(
          `/book/${bookId}`
        );


      setBook(
        response.data?.data ||
        null
      );

    } catch (error) {

      console.error(
        "Fetch book error:",
        error.response?.data ||
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch book."
      );

    } finally {

      setBookLoading(false);

    }

  };


  /* =========================================================
                FETCH DISTRIBUTION
  ========================================================= */

  const fetchDistribution = async (
    selectedStatus = status
  ) => {

    try {

      setDistributionLoading(true);


      const response =
        await API.get(
          "/book-distribution/book",
          {
            params: {
              bookId,
              status:
                selectedStatus,
            },
          }
        );


      setDistributions(
        response.data?.data ||
        []
      );

    } catch (error) {

      console.error(
        "Fetch book distribution error:",
        error.response?.data ||
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch book distribution."
      );

    } finally {

      setDistributionLoading(false);

    }

  };


  /* =========================================================
                    STATUS CHANGE
  ========================================================= */

  const handleStatusChange = (
    newStatus
  ) => {

    setStatus(
      newStatus
    );

    fetchDistribution(
      newStatus
    );

  };


  /* =========================================================
                       INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    if (!bookId) {
      return;
    }

    fetchBook();

    fetchDistribution(
      "Issued"
    );

  }, [bookId]);


  /* =========================================================
                     FORMAT DATE
  ========================================================= */

  const formatDate = (
    date
  ) => {

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


  /* =========================================================
                  BORROWER NAME
  ========================================================= */

  const getBorrowerName = (
    distribution
  ) => {

    if (
      distribution.borrowerType ===
      "Student"
    ) {

      return (
        distribution.studentId
          ?.studentName ||
        "-"
      );

    }


    return (
      distribution.facultyId
        ?.fullName ||
      "-"
    );

  };


  /* =========================================================
                BORROWER IDENTIFIER
  ========================================================= */

  const getBorrowerIdentifier = (
    distribution
  ) => {

    if (
      distribution.borrowerType ===
      "Student"
    ) {

      return (
        distribution.studentId
          ?.registerNumber ||
        "-"
      );

    }


    return (
      distribution.facultyId
        ?.email ||
      "-"
    );

  };


  /* =========================================================
                       LOADING
  ========================================================= */

  if (
    bookLoading
  ) {

    return (

      <div className="library_bookholder_page">

        <div className="library_bookholder_loading">

          Loading book information...

        </div>

      </div>

    );

  }


  /* =========================================================
                    BOOK NOT FOUND
  ========================================================= */

  if (!book) {

    return (

      <div className="library_bookholder_page">

        <div className="library_bookholder_empty">

          <h3>
            Book not found
          </h3>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/library/booklist"
              )
            }
          >
            Back to Books
          </button>

        </div>

      </div>

    );

  }


  /* =========================================================
                         RENDER
  ========================================================= */

  return (

    <div className="library_bookholder_page">


      {/* =====================================================
                            HEADER
      ===================================================== */}

      <div className="library_bookholder_header">

        <div>

          <button
            type="button"
            className="library_bookholder_back_btn"
            onClick={() =>
              navigate(
                "/library/booklist"
              )
            }
          >
            ← Back to Books
          </button>


          <h2>
            {book.bookName}
          </h2>

          <p>
            View current holder and
            distribution history.
          </p>

        </div>

      </div>


      {/* =====================================================
                       BOOK INFORMATION
      ===================================================== */}

      <div className="library_bookholder_book_card">

        <div>

          <span>
            Book Number
          </span>

          <strong>
            {book.bookNumber || "-"}
          </strong>

        </div>


        <div>

          <span>
            Author
          </span>

          <strong>
            {book.author || "-"}
          </strong>

        </div>


        <div>

          <span>
            Category
          </span>

          <strong>
            {book.category || "-"}
          </strong>

        </div>


        <div>

          <span>
            Library
          </span>

          <strong>
            {book.libraryId?.libraryName ||
              "-"}
          </strong>

        </div>


        <div>

          <span>
            Quantity
          </span>

          <strong>
            {book.quantity ?? 0}
          </strong>

        </div>


        <div>

          <span>
            Available
          </span>

          <strong>
            {book.availableQuantity ?? 0}
          </strong>

        </div>

      </div>


      {/* =====================================================
                         STATUS TABS
      ===================================================== */}

      <div className="library_bookholder_tabs">

        <button
          type="button"
          className={
            status === "Issued"
              ? "active"
              : ""
          }
          onClick={() =>
            handleStatusChange(
              "Issued"
            )
          }
        >
          Currently Issued
        </button>


        <button
          type="button"
          className={
            status === "Returned"
              ? "active"
              : ""
          }
          onClick={() =>
            handleStatusChange(
              "Returned"
            )
          }
        >
          Returned
        </button>


        <button
          type="button"
          className={
            status === "Lost"
              ? "active"
              : ""
          }
          onClick={() =>
            handleStatusChange(
              "Lost"
            )
          }
        >
          Lost
        </button>


        <button
          type="button"
          className={
            status === "Damaged"
              ? "active"
              : ""
          }
          onClick={() =>
            handleStatusChange(
              "Damaged"
            )
          }
        >
          Damaged
        </button>

      </div>


      {/* =====================================================
                         HOLDER SECTION
      ===================================================== */}

      <div className="library_bookholder_section">

        <div className="library_bookholder_section_header">

          <div>

            <h3>

              {status === "Issued"
                ? "Currently Holding This Book"
                : `${status} History`}

            </h3>

            <p>

              {status === "Issued"
                ? "People who have not yet returned this book."
                : `Previous distribution records with status ${status}.`}

            </p>

          </div>


          <span>
            {distributions.length}
            {" "}
            record
            {distributions.length !== 1
              ? "s"
              : ""}
          </span>

        </div>


        {/* ===================================================
                         LOADING
        =================================================== */}

        {distributionLoading ? (

          <div className="library_bookholder_table_state">

            Loading distribution records...

          </div>

        ) : distributions.length === 0 ? (

          /* ================================================
                             EMPTY
          ================================================ */

          <div className="library_bookholder_table_state">

            {status === "Issued"
              ? "No one currently has this book."
              : `No ${status.toLowerCase()} records found for this book.`}

          </div>

        ) : (

          /* ================================================
                             TABLE
          ================================================ */

          <div className="library_bookholder_table_wrapper">

            <table className="library_bookholder_table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Borrower
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    ID
                  </th>

                  <th>
                    Issue Date
                  </th>

                  <th>
                    Due Date
                  </th>

                  <th>
                    Return Date
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Remarks
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

                        <div className="library_bookholder_borrower">

                          <strong>
                            {
                              getBorrowerName(
                                distribution
                              )
                            }
                          </strong>

                        </div>

                      </td>


                      <td>

                        <span
                          className={
                            "library_bookholder_type_badge"
                          }
                        >
                          {
                            distribution.borrowerType
                          }
                        </span>

                      </td>


                      <td>
                        {
                          getBorrowerIdentifier(
                            distribution
                          )
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
                        {
                          formatDate(
                            distribution.returnDate
                          )
                        }
                      </td>


                      <td>

                        <span
                          className={
                            `library_bookholder_status_badge ${
                              distribution.status
                                ?.toLowerCase()
                            }`
                          }
                        >
                          {
                            distribution.status
                          }
                        </span>

                      </td>


                      <td>
                        {
                          distribution.remarks ||
                          "-"
                        }
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

};


export default BookHolder;