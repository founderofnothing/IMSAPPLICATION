import React, {
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";

import API from "../../../api/axios";
import { NavLink } from "react-router-dom";

import {
  EyeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";

import {
  useNavigate,
} from "react-router-dom";

// "import "./Bookcurd.css";";

import "././Bookcurd.css"


const Bookcurd = () => {

  const navigate =
  useNavigate();

  /* =========================================================
                        LIBRARIES
  ========================================================= */

  const [libraries, setLibraries] = useState([]);

  const [librariesLoading, setLibrariesLoading] =
    useState(false);


  /* =========================================================
                          BOOKS
  ========================================================= */

  const [books, setBooks] = useState([]);

  const [loading, setLoading] = useState(false);

  /* =========================================================
                    SELECTED BOOKS
========================================================= */

const [selectedBooks, setSelectedBooks] =
  useState([]);

  /* =========================================================
                    BOOK DISTRIBUTION
========================================================= */

const [showDistributionModal, setShowDistributionModal] =
  useState(false);

const [distributionStep, setDistributionStep] =
  useState(1);

const [borrowerType, setBorrowerType] =
  useState("Student");

const [borrowerSearch, setBorrowerSearch] =
  useState("");

const [borrowerResults, setBorrowerResults] =
  useState({
    students: [],
    faculty: [],
  });

const [selectedBorrower, setSelectedBorrower] =
  useState(null);

const [distributionForm, setDistributionForm] =
  useState({
    dueDate: "",
    remarks: "",
  });

const [borrowerSearching, setBorrowerSearching] =
  useState(false);

const [distributionSubmitting, setDistributionSubmitting] =
  useState(false);


  /* =========================================================
                    BOOK DETAILS
========================================================= */

const [selectedBookDetails, setSelectedBookDetails] =
  useState(null);
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

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    language: "",
    status: "",
    libraryId: "",
  });


  /* =========================================================
                       CREATE / EDIT BOOK
  ========================================================= */

  const [showBookModal, setShowBookModal] =
    useState(false);

  const [editingBook, setEditingBook] =
    useState(null);

  const [bookSubmitting, setBookSubmitting] =
    useState(false);


  const [bookForm, setBookForm] = useState({
    libraryId: "",
    bookNumber: "",
    bookName: "",
    author: "",
    publisher: "",
    edition: "",
    category: "",
    language: "",
    quantity: "",
    price: "",
    status: "Active",
  });


  /* =========================================================
                    FETCH LIBRARIES
     
     Institution is NOT sent from frontend.

     Backend gets:
     
     req.user.institution
     
     from JWT and returns only that institution's
     active libraries.
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
                         FETCH BOOKS
  ========================================================= */

  const fetchBooks = async (
    page = pagination.currentPage
  ) => {

    try {

      setLoading(true);

      const response = await API.get(
        "/book",
        {
          params: {
            page,
            limit: pagination.limit,
            search: filters.search,
            category: filters.category,
            language: filters.language,
            status: filters.status,
            libraryId: filters.libraryId,
          },
        }
      );


      setBooks(
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
        "Fetch books error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch books."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =========================================================
                       FILTER HANDLER
  ========================================================= */

  const handleFilterChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));


    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

  };



  /* =========================================================
                 TOGGLE BOOK SELECTION
========================================================= */

const handleBookSelection = (bookId) => {

  setSelectedBooks((prev) => {

    if (prev.includes(bookId)) {

      return prev.filter(
        (id) => id !== bookId
      );

    }

    return [
      ...prev,
      bookId,
    ];

  });

};


/* =========================================================
                 CURRENT PAGE BOOK IDS
========================================================= */

const currentPageBookIds =
  books.map(
    (book) => book._id
  );


/* =========================================================
                    SELECT ALL
========================================================= */

const areAllCurrentPageBooksSelected =
  books.length > 0 &&
  books.every(
    (book) =>
      selectedBooks.includes(
        book._id
      )
  );


const handleSelectAllBooks = () => {

  const pageBookIds =
    books.map(
      (book) => book._id
    );


  if (
    areAllCurrentPageBooksSelected
  ) {

    // Remove current page books
    // from selection

    setSelectedBooks((prev) =>
      prev.filter(
        (id) =>
          !pageBookIds.includes(id)
      )
    );

    return;
  }


  // Add current page books
  // without creating duplicates

  setSelectedBooks((prev) => [

    ...new Set([
      ...prev,
      ...pageBookIds,
    ]),

  ]);

};


/* =========================================================
                  SEARCH BORROWERS
========================================================= */

const searchDistributionBorrowers = async () => {

  if (!borrowerSearch.trim()) {

    setBorrowerResults({
      students: [],
      faculty: [],
    });

    return;
  }


  try {

    setBorrowerSearching(true);


    const response = await API.get(
      "/book-distribution/borrowers/search",
      {
        params: {
          search:
            borrowerSearch.trim(),
        },
      }
    );


    setBorrowerResults({
      students:
        response.data?.data?.students ||
        [],

      faculty:
        response.data?.data?.faculty ||
        [],
    });

  } catch (error) {

    console.error(
      "Search borrowers error:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to search borrowers."
    );

  } finally {

    setBorrowerSearching(false);

  }

};

/* =========================================================
                 SELECT BORROWER
========================================================= */

const handleSelectDistributionBorrower = (
  borrower
) => {

  setSelectedBorrower(
    borrower
  );

};


/* =========================================================
                BORROWER TYPE CHANGE
========================================================= */

const handleBorrowerTypeChange = (
  type
) => {

  setBorrowerType(type);

  setBorrowerSearch("");

  setBorrowerResults({
    students: [],
    faculty: [],
  });

  setSelectedBorrower(null);

};


/* =========================================================
              DISTRIBUTION FORM CHANGE
========================================================= */

const handleDistributionFormChange = (
  e
) => {

  const {
    name,
    value,
  } = e.target;


  setDistributionForm((prev) => ({
    ...prev,
    [name]: value,
  }));

};


/* =========================================================
                RESET DISTRIBUTION
========================================================= */

const resetDistribution = () => {

  setShowDistributionModal(false);

  setDistributionStep(1);

  setBorrowerType("Student");

  setBorrowerSearch("");

  setBorrowerResults({
    students: [],
    faculty: [],
  });

  setSelectedBorrower(null);

  setDistributionForm({
    dueDate: "",
    remarks: "",
  });

  setDistributionSubmitting(false);

};


/* =========================================================
             GO TO DISTRIBUTION PREVIEW
========================================================= */

const handleDistributionPreview = () => {

  if (
    selectedBooks.length === 0
  ) {

    toast.error(
      "Please select at least one book."
    );

    return;

  }


  if (!selectedBorrower) {

    toast.error(
      `Please select a ${borrowerType.toLowerCase()}.`
    );

    return;

  }


  setDistributionStep(2);

};


/* =========================================================
              CONFIRM DISTRIBUTION
========================================================= */

const handleConfirmDistribution =
  async () => {

    if (!selectedBorrower) {

      toast.error(
        "Please select a borrower."
      );

      return;

    }


    try {

      setDistributionSubmitting(true);


const payload = {

  borrowerType,

  studentId:
    borrowerType === "Student"
      ? selectedBorrower._id
      : null,

  facultyId:
    borrowerType === "Faculty"
      ? (
          selectedBorrower.facultyId ||
          selectedBorrower.id ||
          selectedBorrower._id
        )
      : null,

  bookIds:
    selectedBooks,

  dueDate:
    distributionForm.dueDate ||
    null,

  remarks:
    distributionForm.remarks.trim(),

};


      const response = await API.post(
        "/book-distribution/issue",
        payload
      );


      toast.success(
        response.data?.message ||
        "Books distributed successfully."
      );


      // Clear selection
      setSelectedBooks([]);


      // Close distribution
      resetDistribution();


      // Refresh book quantities
      await fetchBooks(
        pagination.currentPage
      );


    } catch (error) {

      console.error(
        "Book distribution error:",
        error.response?.data || error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to distribute books."
      );

    } finally {

      setDistributionSubmitting(false);

    }

  };
  /* =========================================================
                         BOOK FORM
  ========================================================= */

  const handleBookFormChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setBookForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  /* =========================================================
                       RESET BOOK FORM
  ========================================================= */

  const resetBookForm = () => {

    setBookForm({
      libraryId: "",
      bookNumber: "",
      bookName: "",
      author: "",
      publisher: "",
      edition: "",
      category: "",
      language: "",
      quantity: "",
      price: "",
      status: "Active",
    });

    setEditingBook(null);

  };


  /* =========================================================
                      OPEN CREATE MODAL
  ========================================================= */

  const openCreateBookModal = () => {

    resetBookForm();

    setShowBookModal(true);

  };


  /* =========================================================
                       OPEN EDIT MODAL
  ========================================================= */

  const openEditBookModal = (book) => {

    setEditingBook(book);


    setBookForm({
      libraryId:
        book.libraryId?._id ||
        book.libraryId ||
        "",

      bookNumber:
        book.bookNumber || "",

      bookName:
        book.bookName || "",

      author:
        book.author || "",

      publisher:
        book.publisher || "",

      edition:
        book.edition || "",

      category:
        book.category || "",

      language:
        book.language || "",

      quantity:
        book.quantity ?? "",

      price:
        book.price ?? "",

      status:
        book.status || "Active",
    });


    setShowBookModal(true);

  };

  /* =========================================================
                  OPEN BOOK DETAILS
========================================================= */

const openBookDetails = (book) => {
  setSelectedBookDetails(book);
};


/* =========================================================
                  CLOSE BOOK DETAILS
========================================================= */

const closeBookDetails = () => {
  setSelectedBookDetails(null);
};


  /* =========================================================
                       CLOSE BOOK MODAL
  ========================================================= */

  const closeBookModal = () => {

    if (bookSubmitting) {
      return;
    }

    setShowBookModal(false);

    resetBookForm();

  };


  /* =========================================================
                       CREATE BOOK
  ========================================================= */

  const handleCreateBook = async () => {

    try {

      setBookSubmitting(true);


      const payload = {
        libraryId:
          bookForm.libraryId,

        bookNumber:
          bookForm.bookNumber.trim(),

        bookName:
          bookForm.bookName.trim(),

        author:
          bookForm.author.trim(),

        publisher:
          bookForm.publisher.trim(),

        edition:
          bookForm.edition.trim(),

        category:
          bookForm.category.trim(),

        language:
          bookForm.language.trim(),

        quantity:
          Number(bookForm.quantity),

        price:
          bookForm.price === ""
            ? undefined
            : Number(bookForm.price),

        status:
          bookForm.status,
      };


      const response = await API.post(
        "/book",
        payload
      );


      toast.success(
        response.data?.message ||
        "Book created successfully."
      );


      setShowBookModal(false);

      resetBookForm();


      await fetchBooks(
        pagination.currentPage
      );

    } catch (error) {

      console.error(
        "Create book error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to create book."
      );

    } finally {

      setBookSubmitting(false);

    }

  };


  /* =========================================================
                        UPDATE BOOK
  ========================================================= */

  const handleUpdateBook = async () => {

    if (!editingBook?._id) {

      toast.error(
        "Book information is missing."
      );

      return;

    }


    try {

      setBookSubmitting(true);


      const payload = {
        libraryId:
          bookForm.libraryId,

        bookNumber:
          bookForm.bookNumber.trim(),

        bookName:
          bookForm.bookName.trim(),

        author:
          bookForm.author.trim(),

        publisher:
          bookForm.publisher.trim(),

        edition:
          bookForm.edition.trim(),

        category:
          bookForm.category.trim(),

        language:
          bookForm.language.trim(),

        quantity:
          Number(bookForm.quantity),

        price:
          bookForm.price === ""
            ? undefined
            : Number(bookForm.price),

        status:
          bookForm.status,
      };


      const response = await API.put(
        `/book/${editingBook._id}`,
        payload
      );


      toast.success(
        response.data?.message ||
        "Book updated successfully."
      );


      setShowBookModal(false);

      resetBookForm();


      await fetchBooks(
        pagination.currentPage
      );

    } catch (error) {

      console.error(
        "Update book error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to update book."
      );

    } finally {

      setBookSubmitting(false);

    }

  };


  /* =========================================================
                         DELETE BOOK
  ========================================================= */

  const handleDeleteBook = async (bookId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );


    if (!confirmed) {
      return;
    }


    try {

      const response = await API.delete(
        `/book/${bookId}`
      );


      toast.success(
        response.data?.message ||
        "Book deleted successfully."
      );


      await fetchBooks(
        pagination.currentPage
      );

    } catch (error) {

      console.error(
        "Delete book error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to delete book."
      );

    }

  };


  /* =========================================================
                           PAGINATION
  ========================================================= */

  const nextPage = () => {

    if (
      pagination.hasNextPage
    ) {

      setPagination((prev) => ({
        ...prev,
        currentPage:
          prev.currentPage + 1,
      }));

    }

  };


  const previousPage = () => {

    if (
      pagination.hasPreviousPage
    ) {

      setPagination((prev) => ({
        ...prev,
        currentPage:
          prev.currentPage - 1,
      }));

    }

  };


  /* =========================================================
                       INITIAL LIBRARIES
  ========================================================= */

  useEffect(() => {

    fetchLibraries();

  }, []);


  /* =========================================================
                         FETCH BOOKS
  ========================================================= */

  useEffect(() => {

    fetchBooks(
      pagination.currentPage
    );

  }, [
    pagination.currentPage,
    filters.search,
    filters.category,
    filters.language,
    filters.status,
    filters.libraryId,
  ]);


  /* =========================================================
                           RENDER
  ========================================================= */

  return (

    <div className="library_bookcurd_container">



<NavLink to="/library/BookrecycleBin"><h2>recyclebin</h2></NavLink>
      {/* =====================================================
                         PAGE HEADER
      ===================================================== */}

      <div className="library_bookcurd_page_header">

        <div className="library_bookcurd_header_left">

          <h2 className="library_bookcurd_page_title">
            Book Management
          </h2>

          <p className="library_bookcurd_page_subtitle">
            Manage library books, inventory and
            availability.
          </p>

        </div>


        <div className="library_bookcurd_header_actions">

          <button
            type="button"
            className="library_bookcurd_primary_btn"
            onClick={
              openCreateBookModal
            }
          >
            Add Book
          </button>


   

<button
  type="button"
  className="library_bookcurd_secondary_btn"
  onClick={() =>
    setShowDistributionModal(true)
  }
  disabled={
    selectedBooks.length === 0
  }
>
  Add Distribution
</button>

        </div>

      </div>


      {/* =====================================================
                         FILTERS
      ===================================================== */}

{/* =====================================================
                         FILTERS
===================================================== */}

<div className="library_bookcurd_filter_wrapper">


  {/* =====================================================
                       SEARCH
  ===================================================== */}

  <div className="library_bookcurd_filter_field">

    <input
      type="text"
      name="search"
      className="library_bookcurd_search_input"
      placeholder="Search by book name or book number..."
      value={
        filters.search
      }
      onChange={
        handleFilterChange
      }
    />

  </div>


  {/* =====================================================
                       LIBRARY
  ===================================================== */}

  <div className="library_bookcurd_filter_field">

    <select
      name="libraryId"
      className="library_bookcurd_filter_select"
      value={
        filters.libraryId
      }
      onChange={
        handleFilterChange
      }
      disabled={
        librariesLoading
      }
    >

      <option value="">
        All Libraries
      </option>

      {libraries.map(
        (library) => (

          <option
            key={
              library._id
            }
            value={
              library._id
            }
          >
            {library.libraryName}
            {" "}
            (
            {library.libraryCode}
            )
          </option>

        )
      )}

    </select>

  </div>


  {/* =====================================================
                       CATEGORY
  ===================================================== */}

  <div className="library_bookcurd_filter_field">

    <input
      type="text"
      name="category"
      className="library_bookcurd_filter_input"
      placeholder="Search category..."
      value={
        filters.category
      }
      onChange={
        handleFilterChange
      }
    />

  </div>


  {/* =====================================================
                       LANGUAGE
  ===================================================== */}

  <div className="library_bookcurd_filter_field">

    <select
      name="language"
      className="library_bookcurd_filter_select"
      value={
        filters.language
      }
      onChange={
        handleFilterChange
      }
    >

      <option value="">
        All Languages
      </option>

      <option value="English">
        English
      </option>

      <option value="Tamil">
        Tamil
      </option>

      <option value="Hindi">
        Hindi
      </option>

      <option value="Malayalam">
        Malayalam
      </option>

      <option value="Kannada">
        Kannada
      </option>

      <option value="Telugu">
        Telugu
      </option>

    </select>

  </div>


  {/* =====================================================
                       STATUS
  ===================================================== */}

  <div className="library_bookcurd_filter_field">

    <select
      name="status"
      className="library_bookcurd_filter_select"
      value={
        filters.status
      }
      onChange={
        handleFilterChange
      }
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

      <option value="Archived">
        Archived
      </option>

    </select>

  </div>

</div>


      {/* =====================================================
                         BOOK TABLE
      ===================================================== */}

{/* =====================================================
                     BOOK TABLE
===================================================== */}

{/* =====================================================
                     BOOK TABLE
===================================================== */}

<div className="library_bookcurd_table_wrapper">

  {/* =====================================================
                  SELECTION COUNT
  ===================================================== */}

  {selectedBooks.length > 0 && (
    <div className="library_bookcurd_selection_info">
      {selectedBooks.length} book
      {selectedBooks.length !== 1 ? "s" : ""} selected
    </div>
  )}

  {/* =====================================================
                        TABLE
  ===================================================== */}

  <table className="library_bookcurd_table">

    {/* ===================================================
                         TABLE HEAD
    =================================================== */}

    <thead>

      <tr>

        {/* SELECT ALL */}

        <th>

          <input
            type="checkbox"
            checked={
              areAllCurrentPageBooksSelected
            }
            onChange={
              handleSelectAllBooks
            }
            disabled={
              loading ||
              books.length === 0
            }
          />

        </th>


        {/* SERIAL NUMBER */}

        <th>
          #
        </th>


        {/* BOOK NUMBER */}

        <th>
          Book Number
        </th>


        {/* BOOK NAME */}

        <th>
          Book Name
        </th>


        {/* QUANTITY */}

        <th>
          Quantity
        </th>


        {/* AVAILABLE */}

        <th>
          Available
        </th>


        {/* STATUS */}

        <th>
          Status
        </th>


        {/* ACTIONS */}

        <th>
          Actions
        </th>

      </tr>

    </thead>


    {/* ===================================================
                         TABLE BODY
    =================================================== */}

    <tbody>

      {/* =================================================
                         LOADING
      ================================================= */}

      {loading ? (

        <tr>

          <td
            colSpan={8}
            className="library_bookcurd_no_data"
          >
            Loading books...
          </td>

        </tr>

      ) : books.length === 0 ? (

        /* ===============================================
                         EMPTY STATE
        =============================================== */

        <tr>

          <td
            colSpan={8}
            className="library_bookcurd_no_data"
          >
            No books found.
          </td>

        </tr>

      ) : (

        /* ===============================================
                         BOOK ROWS
        =============================================== */

        books.map((book, index) => (

          <tr
            key={book._id}
          >

            {/* =========================================
                         CHECKBOX
            ========================================= */}

            <td>

              <input
                type="checkbox"
                checked={
                  selectedBooks.includes(
                    book._id
                  )
                }
                onClick={(e) =>
                  e.stopPropagation()
                }
                onChange={() =>
                  handleBookSelection(
                    book._id
                  )
                }
              />

            </td>


            {/* =========================================
                         SERIAL NUMBER
            ========================================= */}

            <td>

              {(
                (
                  pagination.currentPage -
                  1
                ) *
                pagination.limit
              ) +
                index +
                1}

            </td>


            {/* =========================================
                         BOOK NUMBER
            ========================================= */}

            <td>

              <NavLink
                to={`/library/book/${book._id}`}
                className="library_bookcurd_book_link"
              >

                {book.bookNumber || "-"}

              </NavLink>

            </td>


            {/* =========================================
                         BOOK NAME
            ========================================= */}

            <td
              title={
                book.bookName || ""
              }
            >

              {book.bookName
                ? book.bookName.length > 10
                  ? `${book.bookName.slice(
                      0,
                      10
                    )}...`
                  : book.bookName
                : "-"}

            </td>


            {/* =========================================
                         QUANTITY
            ========================================= */}

            <td>

              {book.quantity ?? 0}

            </td>


            {/* =========================================
                         AVAILABLE
            ========================================= */}

            <td>

              {book.availableQuantity ?? 0}

            </td>


            {/* =========================================
                         STATUS
            ========================================= */}

            <td>

              <span
                className={
                  `library_bookcurd_status_badge ${
                    book.status
                      ?.toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      )
                  }`
                }
              >

                {book.status || "-"}

              </span>

            </td>


            {/* =========================================
                         ACTIONS
            ========================================= */}

            <td>

              <div className="library_bookcurd_action_wrapper">

                {/* =====================================
                              VIEW
                ===================================== */}

                <button
                  type="button"
                  className="library_bookcurd_action_btn"
                  onClick={(e) => {

                    e.stopPropagation();

                    openBookDetails(
                      book
                    );

                  }}
                  title="View Book Details"
                >

                  <EyeIcon
                    size={20}
                  />

                </button>


                {/* =====================================
                              EDIT
                ===================================== */}

                <button
                  type="button"
                  className="library_bookcurd_action_btn"
                  onClick={(e) => {

                    e.stopPropagation();

                    openEditBookModal(
                      book
                    );

                  }}
                  title="Edit Book"
                >

                  <PencilSimpleIcon
                    size={20}
                  />

                </button>


                {/* =====================================
                              DELETE
                ===================================== */}

                <button
                  type="button"
                  className="library_bookcurd_action_btn"
                  onClick={(e) => {

                    e.stopPropagation();

                    handleDeleteBook(
                      book._id
                    );

                  }}
                  title="Delete Book"
                >

                  <TrashIcon
                    size={20}
                  />

                </button>

              </div>

            </td>

          </tr>

        ))

      )}

    </tbody>

  </table>

</div>


      {/* =====================================================
                         PAGINATION
      ===================================================== */}

      <div
        className={
          "library_bookcurd_pagination_wrapper"
        }
      >

        <button
          type="button"
          className={
            "library_bookcurd_pagination_btn"
          }
          onClick={
            previousPage
          }
          disabled={
            !pagination.hasPreviousPage
          }
        >
          Previous
        </button>


        <div
          className={
            "library_bookcurd_pagination_info"
          }
        >

          <span>
            Page
          </span>

          <strong>
            {
              pagination.currentPage
            }
          </strong>

          <span>
            of
          </span>

          <strong>
            {
              pagination.totalPages
            }
          </strong>

        </div>


        <button
          type="button"
          className={
            "library_bookcurd_pagination_btn"
          }
          onClick={
            nextPage
          }
          disabled={
            !pagination.hasNextPage
          }
        >
          Next
        </button>

      </div>


      {/* =====================================================
                       CREATE / EDIT MODAL
      ===================================================== */}

      {showBookModal && (

        <div
          className={
            "library_bookcurd_modal_overlay"
          }
        >

          <div
            className={
              "library_bookcurd_modal"
            }
          >

            {/* MODAL HEADER */}

            <div
              className={
                "library_bookcurd_modal_header"
              }
            >

              <div>

                <h3>
                  {
                    editingBook
                      ? "Edit Book"
                      : "Add Book"
                  }
                </h3>

                <p>
                  {
                    editingBook
                      ? "Update the book information."
                      : "Add a new book to the library."
                  }
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeBookModal
                }
                disabled={
                  bookSubmitting
                }
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={(e) => {

                e.preventDefault();

                if (editingBook) {

                  handleUpdateBook();

                } else {

                  handleCreateBook();

                }

              }}
            >

              {/* LIBRARY */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Library *
                </label>

                <select
                  name="libraryId"
                  value={
                    bookForm.libraryId
                  }
                  onChange={
                    handleBookFormChange
                  }
                  disabled={
                    librariesLoading ||
                    bookSubmitting
                  }
                  required
                >

                  <option value="">
                    {
                      librariesLoading
                        ? "Loading libraries..."
                        : "Select Library"
                    }
                  </option>


                  {libraries.map(
                    (library) => (

                      <option
                        key={
                          library._id
                        }
                        value={
                          library._id
                        }
                      >
                        {
                          library.libraryName
                        }
                        {" "}
                        (
                        {
                          library.libraryCode
                        }
                        )
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* BOOK NUMBER */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Book Number *
                </label>

                <input
                  type="text"
                  name="bookNumber"
                  value={
                    bookForm.bookNumber
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter book number"
                  disabled={
                    bookSubmitting
                  }
                  required
                />

              </div>


              {/* BOOK NAME */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Book Name *
                </label>

                <input
                  type="text"
                  name="bookName"
                  value={
                    bookForm.bookName
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter book name"
                  disabled={
                    bookSubmitting
                  }
                  required
                />

              </div>


              {/* AUTHOR */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Author *
                </label>

                <input
                  type="text"
                  name="author"
                  value={
                    bookForm.author
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter author"
                  disabled={
                    bookSubmitting
                  }
                  required
                />

              </div>


              {/* PUBLISHER */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Publisher
                </label>

                <input
                  type="text"
                  name="publisher"
                  value={
                    bookForm.publisher
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter publisher"
                  disabled={
                    bookSubmitting
                  }
                />

              </div>


              {/* EDITION */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Edition
                </label>

                <input
                  type="text"
                  name="edition"
                  value={
                    bookForm.edition
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter edition"
                  disabled={
                    bookSubmitting
                  }
                />

              </div>


              {/* CATEGORY */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Category *
                </label>

                <input
                  type="text"
                  name="category"
                  value={
                    bookForm.category
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter category"
                  disabled={
                    bookSubmitting
                  }
                  required
                />

              </div>


              {/* LANGUAGE */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Language *
                </label>

                <input
                  type="text"
                  name="language"
                  value={
                    bookForm.language
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter language"
                  disabled={
                    bookSubmitting
                  }
                  required
                />

              </div>


              {/* QUANTITY */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Quantity *
                </label>

                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={
                    bookForm.quantity
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter quantity"
                  disabled={
                    bookSubmitting
                  }
                  required
                />

              </div>


              {/* PRICE */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  min="0"
                  value={
                    bookForm.price
                  }
                  onChange={
                    handleBookFormChange
                  }
                  placeholder="Enter price"
                  disabled={
                    bookSubmitting
                  }
                />

              </div>


              {/* STATUS */}

              <div
                className={
                  "library_bookcurd_form_group"
                }
              >

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={
                    bookForm.status
                  }
                  onChange={
                    handleBookFormChange
                  }
                  disabled={
                    bookSubmitting
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>


              {/* FORM ACTIONS */}

              <div
                className={
                  "library_bookcurd_modal_actions"
                }
              >

                <button
                  type="button"
                  className={
                    "library_bookcurd_secondary_btn"
                  }
                  onClick={
                    closeBookModal
                  }
                  disabled={
                    bookSubmitting
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className={
                    "library_bookcurd_primary_btn"
                  }
                  disabled={
                    bookSubmitting ||
                    libraries.length === 0
                  }
                >

                  {
                    bookSubmitting
                      ? "Saving..."
                      : editingBook
                        ? "Update Book"
                        : "Create Book"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


{/* =========================================================
                  BOOK DISTRIBUTION MODAL
========================================================= */}

{showDistributionModal && (

  <div className="library_book_distribution_overlay">

    <div className="library_book_distribution_modal">

      {/* =====================================================
                          HEADER
      ===================================================== */}

      <div className="library_book_distribution_header">

        <div>

          <h3>
            Book Distribution
          </h3>

          <p>
            Assign selected books to a student or faculty member.
          </p>

        </div>


        <button
          type="button"
          onClick={resetDistribution}
          disabled={
            distributionSubmitting
          }
        >
          ×
        </button>

      </div>


      {/* =====================================================
                            BODY
      ===================================================== */}

      <div className="library_book_distribution_body">


        {/* ===================================================
                         SELECTED BOOKS
        =================================================== */}

        <div className="library_book_distribution_section">

          <div className="library_book_distribution_section_header">

            <h4>
              Selected Books
            </h4>

            <span>
              {selectedBooks.length}
              {" "}
              selected
            </span>

          </div>


          <div className="library_book_distribution_books">

            {books
              .filter((book) =>
                selectedBooks.includes(
                  book._id
                )
              )
              .map((book) => (

                <div
                  key={book._id}
                  className="library_book_distribution_book"
                >

                  <div>

                    <strong>
                      {book.bookNumber}
                    </strong>

                    <p>
                      {book.bookName}
                    </p>

                  </div>


                  <span>
                    Available:
                    {" "}
                    {book.availableQuantity}
                  </span>

                </div>

              ))}

          </div>

        </div>


        {/* ===================================================
                        BORROWER TYPE
        =================================================== */}

        <div className="library_book_distribution_section">

          <h4>
            Borrower
          </h4>


          <div className="library_book_distribution_type">

            <button
              type="button"
              className={
                borrowerType === "Student"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleBorrowerTypeChange(
                  "Student"
                )
              }
            >
              Student
            </button>


            <button
              type="button"
              className={
                borrowerType === "Faculty"
                  ? "active"
                  : ""
              }
              onClick={() =>
                handleBorrowerTypeChange(
                  "Faculty"
                )
              }
            >
              Faculty
            </button>

          </div>


          {/* =================================================
                        BORROWER SEARCH
          ================================================= */}

          <div className="library_book_distribution_search">

            <input
              type="text"
              value={
                borrowerSearch
              }
              onChange={(e) =>
                setBorrowerSearch(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter"
                ) {

                  searchDistributionBorrowers();

                }

              }}
              placeholder={
                borrowerType === "Student"
                  ? "Search student by name or register number..."
                  : "Search faculty by name or employee ID..."
              }
            />


            <button
              type="button"
              onClick={
                searchDistributionBorrowers
              }
              disabled={
                borrowerSearching
              }
            >

              {borrowerSearching
                ? "Searching..."
                : "Search"}

            </button>

          </div>


          {/* =================================================
                       STUDENT RESULTS
          ================================================= */}

          {borrowerType === "Student" && (

            <div className="library_book_distribution_results">

              {borrowerResults.students.map(
                (student) => (

                  <button
                    type="button"
                    key={student._id}
                    className={
                      selectedBorrower?._id ===
                      student._id
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      handleSelectDistributionBorrower(
                        student
                      )
                    }
                  >

                    <strong>
                      {student.studentName}
                    </strong>

                    <span>
                      {student.registerNumber ||
                        student.applicationNumber ||
                        "-"}
                    </span>

                  </button>

                )
              )}

            </div>

          )}


          {/* =================================================
                       FACULTY RESULTS
          ================================================= */}

          {borrowerType === "Faculty" && (

            <div className="library_book_distribution_results">

              {borrowerResults.faculty.map(
                (faculty) => (

                  <button
                    type="button"
                    key={faculty._id}
                    className={
                      selectedBorrower?._id ===
                      faculty._id
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      handleSelectDistributionBorrower(
                        faculty
                      )
                    }
                  >

<strong>
  {faculty.fullName || "-"}
</strong>

<span>
  {faculty.employeeId ||
    faculty.email ||
    "-"}
</span>

                  </button>

                )
              )}

            </div>

          )}

        </div>


        {/* ===================================================
                    SELECTED BORROWER
        =================================================== */}

        {selectedBorrower && (

          <div className="library_book_distribution_selected_borrower">

            <h4>
              Selected {borrowerType}
            </h4>


            <strong>

              {borrowerType === "Student"
                ? selectedBorrower.studentName
                : selectedBorrower.name}

            </strong>


            <p>

              {borrowerType === "Student"
                ? selectedBorrower.registerNumber
                : selectedBorrower.employeeId ||
                  selectedBorrower.email}

            </p>

          </div>

        )}


        {/* ===================================================
                       ISSUE DETAILS
        =================================================== */}

        <div className="library_book_distribution_section">

          <h4>
            Issue Details
          </h4>


          <div className="library_book_distribution_form">


            <div>

              <label>
                Issue Date
              </label>

              <input
                type="date"
                value={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                disabled
              />

            </div>


            <div>

              <label>
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={
                  distributionForm.dueDate
                }
                onChange={
                  handleDistributionFormChange
                }
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
              />

            </div>


            <div>

              <label>
                Remarks
              </label>

              <textarea
                name="remarks"
                value={
                  distributionForm.remarks
                }
                onChange={
                  handleDistributionFormChange
                }
                placeholder="Optional remarks..."
              />

            </div>

          </div>

        </div>


        {/* ===================================================
                          PREVIEW
        =================================================== */}

        {distributionStep === 2 && (

          <div className="library_book_distribution_preview">

            <h4>
              Distribution Preview
            </h4>


            <div>

              <span>
                Borrower Type
              </span>

              <strong>
                {borrowerType}
              </strong>

            </div>


            <div>

              <span>
                Borrower
              </span>

              <strong>

{borrowerType === "Student"
  ? selectedBorrower?.studentName
  : selectedBorrower?.fullName}
              </strong>

            </div>


            <div>

              <span>
                Books
              </span>

              <strong>
                {selectedBooks.length}
              </strong>

            </div>


            <div>

              <span>
                Due Date
              </span>

              <strong>
                {distributionForm.dueDate ||
                  "No due date"}
              </strong>

            </div>


            <div>

              <span>
                Remarks
              </span>

              <strong>
                {distributionForm.remarks ||
                  "No remarks"}
              </strong>

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
                          FOOTER
      ===================================================== */}

      <div className="library_book_distribution_footer">

        <button
          type="button"
          onClick={resetDistribution}
          disabled={
            distributionSubmitting
          }
        >
          Cancel
        </button>


        {distributionStep === 1 ? (

          <button
            type="button"
            onClick={
              handleDistributionPreview
            }
          >
            Review Distribution
          </button>

        ) : (

          <>

            <button
              type="button"
              onClick={() =>
                setDistributionStep(1)
              }
              disabled={
                distributionSubmitting
              }
            >
              Back
            </button>


            <button
              type="button"
              onClick={
                handleConfirmDistribution
              }
              disabled={
                distributionSubmitting
              }
            >

              {distributionSubmitting
                ? "Distributing..."
                : "Confirm Distribution"}

            </button>

          </>

        )}

      </div>

    </div>

  </div>

)}



{/* =========================================================
                    BOOK DETAILS MODAL
========================================================= */}

{selectedBookDetails && (

  <div className="library_book_details_overlay">

    <div className="library_book_details_modal">

      {/* =====================================================
                            HEADER
      ===================================================== */}

      <div className="library_book_details_header">

        <div>

          <h3>
            Book Details
          </h3>

          <p>
            Complete information about this book.
          </p>

        </div>


        <button
          type="button"
          className="library_book_details_close"
          onClick={
            closeBookDetails
          }
        >
          ×
        </button>

      </div>


      {/* =====================================================
                            BODY
      ===================================================== */}

      <div className="library_book_details_body">

        {/* BOOK NUMBER */}

        <div className="library_book_details_item">

          <span>
            Book Number
          </span>

          <strong>
            {
              selectedBookDetails.bookNumber ||
              "-"
            }
          </strong>

        </div>


        {/* BOOK NAME */}

        <div className="library_book_details_item">

          <span>
            Book Name
          </span>

          <strong>
            {
              selectedBookDetails.bookName ||
              "-"
            }
          </strong>

        </div>


        {/* AUTHOR */}

        <div className="library_book_details_item">

          <span>
            Author
          </span>

          <strong>
            {
              selectedBookDetails.author ||
              "-"
            }
          </strong>

        </div>


        {/* PUBLISHER */}

        <div className="library_book_details_item">

          <span>
            Publisher
          </span>

          <strong>
            {
              selectedBookDetails.publisher ||
              "-"
            }
          </strong>

        </div>


        {/* EDITION */}

        <div className="library_book_details_item">

          <span>
            Edition
          </span>

          <strong>
            {
              selectedBookDetails.edition ||
              "-"
            }
          </strong>

        </div>


        {/* CATEGORY */}

        <div className="library_book_details_item">

          <span>
            Category
          </span>

          <strong>
            {
              selectedBookDetails.category ||
              "-"
            }
          </strong>

        </div>


        {/* LANGUAGE */}

        <div className="library_book_details_item">

          <span>
            Language
          </span>

          <strong>
            {
              selectedBookDetails.language ||
              "-"
            }
          </strong>

        </div>


        {/* QUANTITY */}

        <div className="library_book_details_item">

          <span>
            Quantity
          </span>

          <strong>
            {
              selectedBookDetails.quantity ??
              0
            }
          </strong>

        </div>


        {/* AVAILABLE */}

        <div className="library_book_details_item">

          <span>
            Available Quantity
          </span>

          <strong>
            {
              selectedBookDetails.availableQuantity ??
              0
            }
          </strong>

        </div>


        {/* STATUS */}

        <div className="library_book_details_item">

          <span>
            Status
          </span>

          <strong
            className={
              `library_book_details_status ${
                selectedBookDetails.status
                  ?.toLowerCase()
                  .replace(
                    /\s+/g,
                    "-"
                  )
              }`
            }
          >
            {
              selectedBookDetails.status ||
              "-"
            }
          </strong>

        </div>


        {/* LIBRARY */}

        <div className="library_book_details_item">

          <span>
            Library
          </span>

          <strong>

            {
              selectedBookDetails.libraryId
                ?.libraryName ||
              "-"
            }

          </strong>

        </div>

      </div>


      {/* =====================================================
                           FOOTER
      ===================================================== */}

      <div className="library_book_details_footer">

        <button
          type="button"
          className="library_book_details_close_btn"
          onClick={
            closeBookDetails
          }
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}
    </div>

  );

};


export default Bookcurd;