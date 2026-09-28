import React, { useState } from "react";
import { toast } from "react-toastify";

import API from "../../../api/axios";
import "./BookbulkUploadandUpdate.css";


const BookbulkUploadandUpdate = ({
  onClose,
  onUploadSuccess,
}) => {

  /* ============================================================
                         MODAL STATE
  ============================================================ */

  const [showBulkUpload, setShowBulkUpload] =
    useState(false);

  const [showBulkUpdate, setShowBulkUpdate] =
    useState(false);


  /* ============================================================
                         FILE STATE
  ============================================================ */

  const [uploadFile, setUploadFile] =
    useState(null);

  const [updateFile, setUpdateFile] =
    useState(null);


  /* ============================================================
                         PROCESSING
  ============================================================ */

  const [uploading, setUploading] =
    useState(false);

  const [updating, setUpdating] =
    useState(false);


  /* ============================================================
                         RESULT STATE
  ============================================================ */

  const [uploadResult, setUploadResult] =
    useState(null);

  const [updateResult, setUpdateResult] =
    useState(null);


  /* ============================================================
                         OPEN / CLOSE MODALS
  ============================================================ */

  const openBulkUpload = () => {

    setShowBulkUpload(true);

  };


  const closeBulkUpload = () => {

    if (uploading) {
      return;
    }

    setShowBulkUpload(false);

  };


  const openBulkUpdate = () => {

    setShowBulkUpdate(true);

  };


  const closeBulkUpdate = () => {

    if (updating) {
      return;
    }

    setShowBulkUpdate(false);

  };


  /* ============================================================
                         FILE CHANGE
  ============================================================ */

  const handleUploadFileChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();


    if (
      extension !== "xlsx" &&
      extension !== "xls"
    ) {

      toast.error(
        "Please select an Excel file (.xlsx or .xls)."
      );

      event.target.value = "";

      setUploadFile(null);

      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      toast.error(
        "Excel file must be 10 MB or smaller."
      );

      event.target.value = "";

      setUploadFile(null);

      return;
    }


    setUploadFile(file);

    setUploadResult(null);

  };


  const handleUpdateFileChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();


    if (
      extension !== "xlsx" &&
      extension !== "xls"
    ) {

      toast.error(
        "Please select an Excel file (.xlsx or .xls)."
      );

      event.target.value = "";

      setUpdateFile(null);

      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      toast.error(
        "Excel file must be 10 MB or smaller."
      );

      event.target.value = "";

      setUpdateFile(null);

      return;
    }


    setUpdateFile(file);

    setUpdateResult(null);

  };


  /* ============================================================
                         REMOVE FILE
  ============================================================ */

  const removeUploadFile = () => {

    if (uploading) {
      return;
    }

    setUploadFile(null);

    setUploadResult(null);

    const input =
      document.getElementById(
        "book-bulk-upload-file"
      );

    if (input) {
      input.value = "";
    }

  };


  const removeUpdateFile = () => {

    if (updating) {
      return;
    }

    setUpdateFile(null);

    setUpdateResult(null);

    const input =
      document.getElementById(
        "book-bulk-update-file"
      );

    if (input) {
      input.value = "";
    }

  };


  /* ============================================================
                         BULK UPLOAD
  ============================================================ */

  const handleBulkUpload = async () => {

    if (!uploadFile) {

      toast.error(
        "Please select an Excel file."
      );

      return;
    }


    try {

      setUploading(true);

      setUploadResult(null);


      const formData =
        new FormData();

      formData.append(
        "file",
        uploadFile
      );


      const response =
        await API.post(
          "/book/bulk-upload",
          formData
        );


      setUploadResult(
        response.data
      );


      toast.success(
        response.data?.message ||
        "Books uploaded successfully."
      );


      if (onUploadSuccess) {

        onUploadSuccess(
          response.data
        );

      }

    } catch (error) {

      console.error(
        "BULK BOOK UPLOAD ERROR:",
        error.response?.data ||
        error
      );


      const backendError =
        error.response?.data ||
        null;


      setUploadResult(
        backendError || {
          success: false,
          message:
            "Book bulk upload failed.",
        }
      );


      toast.error(
        backendError?.message ||
        "Book bulk upload failed."
      );

    } finally {

      setUploading(false);

    }

  };


  /* ============================================================
                         BULK UPDATE
  ============================================================ */

  const handleBulkUpdate = async () => {

    if (!updateFile) {

      toast.error(
        "Please select an Excel file."
      );

      return;
    }


    try {

      setUpdating(true);

      setUpdateResult(null);


      const formData =
        new FormData();

      formData.append(
        "file",
        updateFile
      );


      const response =
        await API.post(
          "/book/bulk-update",
          formData
        );


      setUpdateResult(
        response.data
      );


      toast.success(
        response.data?.message ||
        "Books updated successfully."
      );


      if (onUploadSuccess) {

        onUploadSuccess(
          response.data
        );

      }

    } catch (error) {

      console.error(
        "BULK BOOK UPDATE ERROR:",
        error.response?.data ||
        error
      );


      const backendError =
        error.response?.data ||
        null;


      setUpdateResult(
        backendError || {
          success: false,
          message:
            "Book bulk update failed.",
        }
      );


      toast.error(
        backendError?.message ||
        "Book bulk update failed."
      );

    } finally {

      setUpdating(false);

    }

  };


  /* ============================================================
                       REQUIRED COLUMNS
  ============================================================ */

  const uploadHeaders = [
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


  const updateHeaders = [
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


  /* ============================================================
                         CLOSE ALL
  ============================================================ */

  const handleMainClose = () => {

    if (
      uploading ||
      updating
    ) {
      return;
    }

    if (onClose) {
      onClose();
    }

  };


  /* ============================================================
                           RENDER
  ============================================================ */

  return (

    <div className="book-bulk-page">


      {/* ========================================================
                           MAIN HEADER
      ======================================================== */}

      <div className="book-bulk-header">

        <div>

          <span className="book-bulk-eyebrow">
            LIBRARY MANAGEMENT
          </span>

          <h2>
            Book Import & Update
          </h2>

          <p>
            Import new books or update existing
            library records using Excel files.
          </p>

        </div>


        {onClose && (

          <button
            type="button"
            className="book-bulk-main-close"
            onClick={
              handleMainClose
            }
          >
            ×
          </button>

        )}

      </div>


      {/* ========================================================
                         ACTION CARDS
      ======================================================== */}

      <div className="book-bulk-action-grid">


        {/* ======================================================
                           BULK UPLOAD
        ====================================================== */}

        <button
          type="button"
          className="book-bulk-action-card"
          onClick={
            openBulkUpload
          }
        >

          <div className="book-bulk-action-icon">
            ↑
          </div>

          <div>

            <h3>
              Bulk Upload
            </h3>

            <p>
              Add multiple new books to the
              library using an Excel file.
            </p>

          </div>

          <span className="book-bulk-action-arrow">
            →
          </span>

        </button>


        {/* ======================================================
                           BULK UPDATE
        ====================================================== */}

        <button
          type="button"
          className="book-bulk-action-card"
          onClick={
            openBulkUpdate
          }
        >

          <div className="book-bulk-action-icon">
            ↻
          </div>

          <div>

            <h3>
              Bulk Update
            </h3>

            <p>
              Update existing book records
              using Library Code and Book Number.
            </p>

          </div>

          <span className="book-bulk-action-arrow">
            →
          </span>

        </button>

      </div>


      {/* ========================================================
                        BULK UPLOAD MODAL
      ======================================================== */}

      {showBulkUpload && (

        <div
          className="book-bulk-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeBulkUpload();

            }

          }}
        >

          <div
            className="book-bulk-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-bulk-upload-title"
          >


            {/* ==================================================
                              HEADER
            ================================================== */}

            <div className="book-bulk-modal-header">

              <div>

                <span>
                  LIBRARY MANAGEMENT
                </span>

                <h2 id="book-bulk-upload-title">
                  Bulk Upload Books
                </h2>

                <p>
                  Add multiple books using an
                  Excel file.
                </p>

              </div>


              <button
                type="button"
                className="book-bulk-modal-close"
                onClick={
                  closeBulkUpload
                }
                disabled={
                  uploading
                }
              >
                ×
              </button>

            </div>


            {/* ==================================================
                            MODAL BODY
            ================================================== */}

            <div className="book-bulk-modal-body">


              {/* =================================================
                             FILE SECTION
              ================================================= */}

              <div className="book-bulk-section">

                <div className="book-bulk-section-header">

                  <h3>
                    Upload Excel File
                  </h3>

                  <p>
                    Select the Excel file containing
                    the books you want to add.
                  </p>

                </div>


                <label
                  className="book-bulk-upload-box"
                >

                  <input
                    id="book-bulk-upload-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={
                      handleUploadFileChange
                    }
                    disabled={
                      uploading
                    }
                    hidden
                  />


                  <div className="book-bulk-upload-content">

                    <div className="book-bulk-upload-icon">
                      ↑
                    </div>

                    <h4>
                      Upload Book Excel
                    </h4>

                    <p>
                      Click here to choose
                      an Excel file
                    </p>

                    <span>
                      Supported: .xlsx & .xls
                    </span>


                    {uploadFile && (

                      <div className="book-bulk-selected-file">

                        <strong>
                          Selected File
                        </strong>

                        <p>
                          {
                            uploadFile.name
                          }
                        </p>


                        <button
                          type="button"
                          onClick={(event) => {

                            event.preventDefault();
                            event.stopPropagation();

                            removeUploadFile();

                          }}
                          disabled={
                            uploading
                          }
                        >
                          Remove
                        </button>

                      </div>

                    )}

                  </div>

                </label>

              </div>


              {/* =================================================
                         REQUIRED COLUMNS
              ================================================= */}

              <div className="book-bulk-section">

                <div className="book-bulk-section-header">

                  <h3>
                    Required Columns
                  </h3>

                  <p>
                    Your Excel file should contain
                    these column names.
                  </p>

                </div>


                <div className="book-bulk-header-list">

                  {uploadHeaders.map(
                    (header) => (

                      <span
                        key={header}
                      >
                        {header}
                      </span>

                    )
                  )}

                </div>

              </div>


              {/* =================================================
                            INFORMATION
              ================================================= */}

              <div className="book-bulk-information">

                <strong>
                  Import Information
                </strong>

                <p>
                  Each row will create a new book.
                  The library is identified using
                  the library code and belongs to
                  the authenticated institution.
                </p>

              </div>


              {/* =================================================
                              RESULT
              ================================================= */}

              {uploadResult && (

                <BookOperationResult
                  result={
                    uploadResult
                  }
                  mode="upload"
                />

              )}

            </div>


            {/* ==================================================
                              FOOTER
            ================================================== */}

            <div className="book-bulk-modal-footer">

              <button
                type="button"
                className="book-bulk-cancel-button"
                onClick={
                  closeBulkUpload
                }
                disabled={
                  uploading
                }
              >
                Close
              </button>


              <button
                type="button"
                className="book-bulk-primary-button"
                onClick={
                  handleBulkUpload
                }
                disabled={
                  !uploadFile ||
                  uploading
                }
              >

                {uploading
                  ? "Uploading Books..."
                  : "Upload Books"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* ========================================================
                        BULK UPDATE MODAL
      ======================================================== */}

      {showBulkUpdate && (

        <div
          className="book-bulk-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeBulkUpdate();

            }

          }}
        >

          <div
            className="book-bulk-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="book-bulk-update-title"
          >


            {/* ==================================================
                              HEADER
            ================================================== */}

            <div className="book-bulk-modal-header">

              <div>

                <span>
                  LIBRARY MANAGEMENT
                </span>

                <h2 id="book-bulk-update-title">
                  Bulk Update Books
                </h2>

                <p>
                  Update multiple existing books
                  using an Excel file.
                </p>

              </div>


              <button
                type="button"
                className="book-bulk-modal-close"
                onClick={
                  closeBulkUpdate
                }
                disabled={
                  updating
                }
              >
                ×
              </button>

            </div>


            {/* ==================================================
                            MODAL BODY
            ================================================== */}

            <div className="book-bulk-modal-body">


              {/* =================================================
                             FILE SECTION
              ================================================= */}

              <div className="book-bulk-section">

                <div className="book-bulk-section-header">

                  <h3>
                    Update Excel File
                  </h3>

                  <p>
                    Select the Excel file containing
                    the book records to update.
                  </p>

                </div>


                <label
                  className="book-bulk-upload-box"
                >

                  <input
                    id="book-bulk-update-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={
                      handleUpdateFileChange
                    }
                    disabled={
                      updating
                    }
                    hidden
                  />


                  <div className="book-bulk-upload-content">

                    <div className="book-bulk-upload-icon">
                      ↻
                    </div>

                    <h4>
                      Update Book Excel
                    </h4>

                    <p>
                      Click here to choose
                      an Excel file
                    </p>

                    <span>
                      Supported: .xlsx & .xls
                    </span>


                    {updateFile && (

                      <div className="book-bulk-selected-file">

                        <strong>
                          Selected File
                        </strong>

                        <p>
                          {
                            updateFile.name
                          }
                        </p>


                        <button
                          type="button"
                          onClick={(event) => {

                            event.preventDefault();
                            event.stopPropagation();

                            removeUpdateFile();

                          }}
                          disabled={
                            updating
                          }
                        >
                          Remove
                        </button>

                      </div>

                    )}

                  </div>

                </label>

              </div>


              {/* =================================================
                         REQUIRED COLUMNS
              ================================================= */}

              <div className="book-bulk-section">

                <div className="book-bulk-section-header">

                  <h3>
                    Required Columns
                  </h3>

                  <p>
                    Your Excel file should contain
                    these column names.
                  </p>

                </div>


                <div className="book-bulk-header-list">

                  {updateHeaders.map(
                    (header) => (

                      <span
                        key={header}
                      >
                        {header}
                      </span>

                    )
                  )}

                </div>

              </div>


              {/* =================================================
                            INFORMATION
              ================================================= */}

              <div className="book-bulk-information">

                <strong>
                  Update Information
                </strong>

                <p>
                  Each row identifies an existing
                  book using Library Code + Book
                  Number and updates the supplied
                  information.
                </p>

              </div>


              {/* =================================================
                              RESULT
              ================================================= */}

              {updateResult && (

                <BookOperationResult
                  result={
                    updateResult
                  }
                  mode="update"
                />

              )}

            </div>


            {/* ==================================================
                              FOOTER
            ================================================== */}

            <div className="book-bulk-modal-footer">

              <button
                type="button"
                className="book-bulk-cancel-button"
                onClick={
                  closeBulkUpdate
                }
                disabled={
                  updating
                }
              >
                Close
              </button>


              <button
                type="button"
                className="book-bulk-primary-button"
                onClick={
                  handleBulkUpdate
                }
                disabled={
                  !updateFile ||
                  updating
                }
              >

                {updating
                  ? "Updating Books..."
                  : "Update Books"}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};


/* ================================================================
                  OPERATION RESULT COMPONENT
================================================================ */

const BookOperationResult = ({
  result,
  mode,
}) => {

  if (!result) {
    return null;
  }


  return (

    <div className="book-upload-result">


      {/* =========================================================
                         RESULT HEADER
      ========================================================= */}

      <div className="book-upload-result-header">

        <span className="book-upload-result-eyebrow">
          OPERATION RESULT
        </span>

        <h3>

          {result.success

            ? mode === "upload"
              ? "Bulk Upload Result"
              : "Bulk Update Result"

            : mode === "upload"
              ? "Bulk Upload Failed"
              : "Bulk Update Failed"}

        </h3>


        <p>
          {
            result.message ||
            "Operation completed."
          }
        </p>

      </div>


      {/* =========================================================
                             SUMMARY
      ========================================================= */}

      <div className="book-upload-summary">


        <div className="book-upload-summary-card">

          <span>
            Total Rows
          </span>

          <strong>
            {
              result.totalRows ??
              0
            }
          </strong>

        </div>


        {mode === "upload" && (

          <div className="book-upload-summary-card">

            <span>
              Inserted
            </span>

            <strong>
              {
                result.insertedCount ??
                0
              }
            </strong>

          </div>

        )}


        {mode === "update" && (

          <>

            <div className="book-upload-summary-card">

              <span>
                Processed
              </span>

              <strong>
                {
                  result.processedCount ??
                  0
                }
              </strong>

            </div>


            <div className="book-upload-summary-card">

              <span>
                Modified
              </span>

              <strong>
                {
                  result.modifiedCount ??
                  0
                }
              </strong>

            </div>


            <div className="book-upload-summary-card">

              <span>
                Unchanged
              </span>

              <strong>
                {
                  result.unchangedCount ??
                  0
                }
              </strong>

            </div>

          </>

        )}


        <div className="book-upload-summary-card">

          <span>
            Rejected
          </span>

          <strong>
            {
              result.failedCount ??
              0
            }
          </strong>

        </div>


        <div className="book-upload-summary-card">

          <span>
            Warnings
          </span>

          <strong>
            {
              result.warningCount ??
              0
            }
          </strong>

        </div>

      </div>


      {/* =========================================================
                       HEADER WARNINGS
      ========================================================= */}

      {result.headerWarnings?.length > 0 && (

        <div className="book-upload-warning-section">

          <h4>
            Excel Header Warnings
          </h4>

          <p>
            Some Excel headers were not recognized
            exactly as expected.
          </p>


          {result.headerWarnings.map(
            (warning, index) => (

              <div
                key={index}
                className="book-warning-card"
              >

                <div className="book-warning-header">

                  <h5>
                    Header Warning
                  </h5>

                </div>


                <div className="book-warning-item">

                  <p>
                    {
                      typeof warning ===
                      "string"

                        ? warning

                        : warning.message ||
                          warning.reason ||
                          JSON.stringify(
                            warning
                          )
                    }
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      )}


      {/* =========================================================
                    IMPORTED WITH WARNINGS
      ========================================================= */}

      {result.importedWithWarnings?.length > 0 && (

        <div className="book-upload-warning-section">

          <h4>
            Books Imported With Warnings
          </h4>

          <p>
            These books were imported successfully,
            but some values require your attention.
          </p>


          {result.importedWithWarnings.map(
            (book, index) => (

              <div
                key={index}
                className="book-warning-card"
              >

                <div className="book-warning-header">

                  <h5>

                    Row {book.row}
                    {" • "}
                    {
                      book.bookName ||
                      "-"
                    }

                  </h5>


                  <span>

                    Book Number :
                    {" "}
                    {
                      book.bookNumber ||
                      "-"
                    }

                  </span>

                </div>


                {book.warnings?.map(
                  (
                    warning,
                    warningIndex
                  ) => (

                    <div
                      key={
                        warningIndex
                      }
                      className="book-warning-item"
                    >

                      <strong>
                        {
                          warning.field ||
                          "Warning"
                        }
                      </strong>


                      <p>
                        {
                          warning.reason
                        }
                      </p>


                      {
                        warning.receivedValue !==
                        undefined && (

                        <small>

                          Received :
                          {" "}
                          {String(
                            warning.receivedValue
                          )}

                          {
                            warning.expected !==
                            undefined && (
                            <>
                              {" "}
                              | Expected :
                              {" "}
                              {String(
                                warning.expected
                              )}
                            </>
                          )}

                        </small>

                      )}

                    </div>

                  )
                )}

              </div>

            )
          )}

        </div>

      )}


      {/* =========================================================
                         REJECTED BOOKS
      ========================================================= */}

      {result.failedBooks?.length > 0 && (

        <div className="book-upload-warning-section">

          <h4>
            Rejected Books
          </h4>

          <p>
            These book records could not be processed.
            Please review the errors below.
          </p>


          {result.failedBooks.map(
            (book, index) => (

              <div
                key={index}
                className="book-warning-card"
              >

                <div className="book-warning-header">

                  <h5>

                    Row {book.row}
                    {" • "}
                    {
                      book.bookName ||
                      "-"
                    }

                  </h5>


                  <span>

                    Book Number :
                    {" "}
                    {
                      book.bookNumber ||
                      "-"
                    }

                  </span>

                </div>


                {book.reason && (

                  <div className="book-warning-item">

                    <strong>
                      Reason
                    </strong>

                    <p>
                      {
                        book.reason
                      }
                    </p>

                  </div>

                )}


                {book.errors?.length > 0 && (

                  <div className="book-warning-item">

                    <strong>
                      Errors
                    </strong>


                    {book.errors.map(
                      (
                        errorItem,
                        errorIndex
                      ) => (

                        <p
                          key={
                            errorIndex
                          }
                        >
                          •{" "}
                          {
                            errorItem.reason ||
                            errorItem.message ||
                            String(
                              errorItem
                            )
                          }
                        </p>

                      )
                    )}

                  </div>

                )}


                {book.warnings?.length > 0 && (

                  <div className="book-warning-item">

                    <strong>
                      Warnings
                    </strong>


                    {book.warnings.map(
                      (
                        warning,
                        warningIndex
                      ) => (

                        <p
                          key={
                            warningIndex
                          }
                        >
                          •{" "}
                          {
                            warning.reason ||
                            warning.message ||
                            String(
                              warning
                            )
                          }
                        </p>

                      )
                    )}

                  </div>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>

  );

};


export default BookbulkUploadandUpdate;