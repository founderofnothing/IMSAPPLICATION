import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";

import API from "../../../api/axios";
import { NavLink } from "react-router-dom";

// import "./bookrecycleBin.css";


const BookrecycleBin = ({
  onClose,
  onBookRestored,
}) => {

  /* =========================================================
                         DELETED BOOKS
  ========================================================= */

  const [deletedBooks, setDeletedBooks] = useState([]);

  const [loading, setLoading] = useState(false);


  /* =========================================================
                         PAGINATION
  ========================================================= */

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalBooks: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });


  /* =========================================================
                       SEARCH / FILTERS
  ========================================================= */

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [language, setLanguage] = useState("");

  const [status, setStatus] = useState("");

  const [libraryId, setLibraryId] = useState("");


  /* =========================================================
                          LIBRARIES
  ========================================================= */

  const [libraries, setLibraries] = useState([]);

  const [librariesLoading, setLibrariesLoading] =
    useState(false);


  /* =========================================================
                       ACTION LOADING
       
       Stores the book ID currently being restored/
       permanently deleted.
  ========================================================= */

  const [actionLoading, setActionLoading] =
    useState(null);


  /* =========================================================
                       FETCH LIBRARIES
  ========================================================= */

  const fetchLibraries = async () => {

    try {

      setLibrariesLoading(true);

      const response = await API.get(
        "/library"
      );

      setLibraries(
        response.data?.data || []
      );

    } catch (error) {

      console.error(
        "Fetch libraries error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch libraries."
      );

    } finally {

      setLibrariesLoading(false);

    }

  };


  /* =========================================================
                    FETCH DELETED BOOKS

       GET /api/book/deleted

       Institution is automatically determined by
       the authenticated user's JWT.
  ========================================================= */

  const fetchDeletedBooks = async (
    page = pagination.currentPage
  ) => {

    try {

      setLoading(true);

      const response = await API.get(
        "/book/deleted",
        {
          params: {
            page,
            limit: pagination.limit,
            search,
            category,
            language,
            status,
            libraryId,
          },
        }
      );


      setDeletedBooks(
        response.data?.data || []
      );


      const backendPagination =
        response.data?.pagination;


      setPagination((prev) => ({
        ...prev,

        currentPage:
          backendPagination?.currentPage ||
          page,

        totalBooks:
          backendPagination?.totalBooks ||
          0,

        totalPages:
          backendPagination?.totalPages ||
          1,

        hasNextPage:
          backendPagination?.hasNextPage ||
          false,

        hasPreviousPage:
          backendPagination?.hasPreviousPage ||
          false,
      }));


    } catch (error) {

      console.error(
        "Fetch deleted books error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch deleted books."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
                         RESTORE BOOK

       PATCH /api/book/:id/restore
  ========================================================= */

  const handleRestoreBook = async (bookId) => {

    if (!bookId) {

      toast.error(
        "Book ID is missing."
      );

      return;

    }


    const confirmed = window.confirm(
      "Are you sure you want to restore this book?"
    );


    if (!confirmed) {
      return;
    }


    try {

      setActionLoading(bookId);


      const response = await API.patch(
        `/book/${bookId}/restore`
      );


      toast.success(
        response.data?.message ||
        "Book restored successfully."
      );


      /*
       * Remove the restored book from the
       * current recycle-bin list immediately.
       */
      setDeletedBooks((prev) =>
        prev.filter(
          (book) => book._id !== bookId
        )
      );


      /*
       * Refresh recycle-bin data so pagination
       * and counts remain accurate.
       */
      await fetchDeletedBooks(
        pagination.currentPage
      );


      /*
       * Tell Bookcurd to refresh its active
       * book list.
       */
      if (onBookRestored) {
        onBookRestored();
      }


    } catch (error) {

      console.error(
        "Restore book error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to restore book."
      );

    } finally {

      setActionLoading(null);

    }

  };


  /* =========================================================
                    PERMANENTLY DELETE BOOK

       DELETE /api/book/:id/permanent

       This permanently removes the deleted book
       from the database.

       Backend will reject the operation if the
       book has borrowing history.
  ========================================================= */

  const handlePermanentDeleteBook = async (
    bookId
  ) => {

    if (!bookId) {

      toast.error(
        "Book ID is missing."
      );

      return;

    }


    const confirmed = window.confirm(
      "This will permanently delete the book from the database. This action cannot be undone. Continue?"
    );


    if (!confirmed) {
      return;
    }


    try {

      setActionLoading(bookId);


      const response = await API.delete(
        `/book/${bookId}/permanent`
      );


      toast.success(
        response.data?.message ||
        "Book permanently deleted successfully."
      );


      /*
       * Remove from current UI immediately.
       */
      setDeletedBooks((prev) =>
        prev.filter(
          (book) => book._id !== bookId
        )
      );


      /*
       * Refresh deleted-book list.
       */
      await fetchDeletedBooks(
        pagination.currentPage
      );


    } catch (error) {

      console.error(
        "Permanent delete book error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to permanently delete book."
      );

    } finally {

      setActionLoading(null);

    }

  };


  /* =========================================================
                       FILTER HANDLERS
  ========================================================= */

  const handleSearchChange = (e) => {

    setSearch(e.target.value);

    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

  };


  const handleFilterChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    if (name === "category") {
      setCategory(value);
    }

    if (name === "language") {
      setLanguage(value);
    }

    if (name === "status") {
      setStatus(value);
    }

    if (name === "libraryId") {
      setLibraryId(value);
    }


    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

  };


  /* =========================================================
                         PAGINATION
  ========================================================= */

  const nextPage = () => {

    if (!pagination.hasNextPage) {
      return;
    }


    setPagination((prev) => ({
      ...prev,
      currentPage:
        prev.currentPage + 1,
    }));

  };


  const previousPage = () => {

    if (!pagination.hasPreviousPage) {
      return;
    }


    setPagination((prev) => ({
      ...prev,
      currentPage:
        prev.currentPage - 1,
    }));

  };


  /* =========================================================
                         INITIAL FETCH
  ========================================================= */

  useEffect(() => {

    fetchLibraries();

  }, []);


  /* =========================================================
                    FETCH DELETED BOOKS
  ========================================================= */

  useEffect(() => {

    fetchDeletedBooks(
      pagination.currentPage
    );

  }, [
    pagination.currentPage,
    search,
    category,
    language,
    status,
    libraryId,
  ]);


  /* =========================================================
                           RENDER
  ========================================================= */

  return (

    <div className="book_recycle_bin_container">
<NavLink to="/library/booklist"><h2>recyclebin</h2></NavLink>


      {/* =====================================================
                             HEADER
      ===================================================== */}

      <div className="book_recycle_bin_header">

        <div>

          <h2>
            Recycle Bin
          </h2>

          <p>
            Manage deleted library books.
          </p>

        </div>


        <button
          type="button"
          onClick={onClose}
        >
          Close
        </button>

      </div>


      {/* =====================================================
                        SEARCH / FILTERS
      ===================================================== */}

      <div className="book_recycle_bin_filters">


        {/* SEARCH */}

        <input
          type="text"
          placeholder="Search deleted books..."
          value={search}
          onChange={handleSearchChange}
        />


        {/* LIBRARY */}

        <select
          name="libraryId"
          value={libraryId}
          onChange={handleFilterChange}
          disabled={librariesLoading}
        >

          <option value="">
            All Libraries
          </option>


          {libraries.map(
            (library) => (

              <option
                key={library._id}
                value={library._id}
              >
                {library.libraryName}
                {" "}
                ({library.libraryCode})
              </option>

            )
          )}

        </select>


        {/* CATEGORY */}

        <input
          type="text"
          name="category"
          placeholder="Category"
          value={category}
          onChange={handleFilterChange}
        />


        {/* LANGUAGE */}

        <input
          type="text"
          name="language"
          placeholder="Language"
          value={language}
          onChange={handleFilterChange}
        />


        {/* STATUS */}

        <select
          name="status"
          value={status}
          onChange={handleFilterChange}
        >

          <option value="">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Inactive">
            Inactive
          </option>

        </select>

      </div>


      {/* =====================================================
                         BOOK TABLE
      ===================================================== */}

      <div className="book_recycle_bin_table_wrapper">

        <table className="book_recycle_bin_table">

          <thead>

            <tr>

              <th>#</th>

              <th>Book Number</th>

              <th>Book Name</th>

              <th>Author</th>

              <th>Library</th>

              <th>Category</th>

              <th>Language</th>

              <th>Quantity</th>

              <th>Deleted At</th>

              <th>Actions</th>

            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="10"
                >
                  Loading deleted books...
                </td>

              </tr>

            ) : deletedBooks.length === 0 ? (

              <tr>

                <td
                  colSpan="10"
                >
                  No deleted books found.
                </td>

              </tr>

            ) : (

              deletedBooks.map(
                (book, index) => {

                  const library =
                    book.libraryId;


                  const isActionLoading =
                    actionLoading ===
                    book._id;


                  return (

                    <tr
                      key={book._id}
                    >

                      {/* NUMBER */}

                      <td>

                        {
                          (
                            (
                              pagination.currentPage -
                              1
                            ) *
                            pagination.limit
                          ) +
                          index +
                          1
                        }

                      </td>


                      {/* BOOK NUMBER */}

                      <td>

                        {
                          book.bookNumber ||
                          "-"
                        }

                      </td>


                      {/* BOOK NAME */}

                      <td>

                        {
                          book.bookName ||
                          "-"
                        }

                      </td>


                      {/* AUTHOR */}

                      <td>

                        {
                          book.author ||
                          "-"
                        }

                      </td>


                      {/* LIBRARY */}

                      <td>

                        {
                          library?.libraryName ||
                          "-"
                        }

                      </td>


                      {/* CATEGORY */}

                      <td>

                        {
                          book.category ||
                          "-"
                        }

                      </td>


                      {/* LANGUAGE */}

                      <td>

                        {
                          book.language ||
                          "-"
                        }

                      </td>


                      {/* QUANTITY */}

                      <td>

                        {
                          book.quantity ??
                          0
                        }

                      </td>


                      {/* DELETED DATE */}

                      <td>

                        {
                          book.deletedAt
                            ? new Date(
                                book.deletedAt
                              ).toLocaleDateString()
                            : "-"
                        }

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="book_recycle_bin_actions">

                          <button
                            type="button"
                            disabled={
                              isActionLoading
                            }
                            onClick={() =>
                              handleRestoreBook(
                                book._id
                              )
                            }
                          >

                            {
                              isActionLoading
                                ? "Processing..."
                                : "Restore"
                            }

                          </button>


                          <button
                            type="button"
                            disabled={
                              isActionLoading
                            }
                            onClick={() =>
                              handlePermanentDeleteBook(
                                book._id
                              )
                            }
                          >

                            Permanently Delete

                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                }
              )

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
                         PAGINATION
      ===================================================== */}

      <div className="book_recycle_bin_pagination">

        <button
          type="button"
          onClick={previousPage}
          disabled={
            !pagination.hasPreviousPage
          }
        >
          Previous
        </button>


        <span>

          Page{" "}

          <strong>
            {pagination.currentPage}
          </strong>

          {" "}of{" "}

          <strong>
            {pagination.totalPages}
          </strong>

        </span>


        <button
          type="button"
          onClick={nextPage}
          disabled={
            !pagination.hasNextPage
          }
        >
          Next
        </button>

      </div>

    </div>

  );

};


export default BookrecycleBin;