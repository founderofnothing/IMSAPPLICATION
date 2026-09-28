import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../api/axios";
import "./studentcreate.css";

const StudentCreate = () => {
  // =========================================================
  // PAGE MODE
  // =========================================================

  const [activeMode, setActiveMode] = useState("bulk-create");

  // =========================================================
  // DROPDOWN DATA
  // =========================================================

  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);

  // =========================================================
  // BULK CREATE FORM
  // =========================================================

  const [bulkForm, setBulkForm] = useState({
    departmentId: "",
    programmeId: "",
    batchId: "",
    section: "",
  });

  const [bulkFile, setBulkFile] = useState(null);

  // =========================================================
  // LOADING
  // =========================================================

  const [uploading, setUploading] = useState(false);
// =========================================================
// BULK UPLOAD ERROR
// =========================================================

const [bulkUploadResponse, setBulkUploadResponse] =
  useState(null);
  // =========================================================
// BULK UPDATE
// =========================================================

const [updateFile, setUpdateFile] =
  useState(null);

const [updating, setUpdating] =
  useState(false);

const [updateResult, setUpdateResult] =
  useState(null);


  const [showBulkUpload, setShowBulkUpload] =
  useState(false);

const [showBulkUpdate, setShowBulkUpdate] =
  useState(false);

  // =========================================================
// POPUP HANDLERS
// =========================================================

const openBulkUpload = () => {
  setShowBulkUpload(true);
};

const closeBulkUpload = () => {
  setShowBulkUpload(false);
};

const openBulkUpdate = () => {
  setShowBulkUpdate(true);
};

const closeBulkUpdate = () => {
  setShowBulkUpdate(false);
};
  // =========================================================
  // FETCH DEPARTMENTS
  // =========================================================

  const fetchDepartments = async () => {
    try {
      const response = await API.get(
        "/institutions/my-institution"
      );

      setDepartments(
        response.data?.data?.departments || []
      );
    } catch (error) {
      setDepartments([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch departments."
      );
    }
  };

  // =========================================================
  // FETCH PROGRAMMES
  // =========================================================

  const fetchProgrammes = async (departmentId) => {
    if (!departmentId) {
      setProgrammes([]);
      return;
    }

    try {
      const response = await API.get(
        `/programmes/department/${departmentId}`
      );

      setProgrammes(response.data?.data || []);
    } catch (error) {
      setProgrammes([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch programmes."
      );
    }
  };

  // =========================================================
  // FETCH BATCHES
  // =========================================================

  const fetchBatches = async () => {
    try {
      const response = await API.get(
        "/batch/getall"
      );

      setBatches(response.data?.data || []);
    } catch (error) {
      setBatches([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch batches."
      );
    }
  };

  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {
    fetchDepartments();
    fetchBatches();
  }, []);

  // =========================================================
  // DEPARTMENT CHANGE
  // =========================================================

  const handleDepartmentChange = async (event) => {
    const departmentId = event.target.value;

    setBulkForm((previous) => ({
      ...previous,

      departmentId,

      // Reset programme whenever department changes
      programmeId: "",
    }));

    await fetchProgrammes(departmentId);
  };

  // =========================================================
  // NORMAL INPUT CHANGE
  // =========================================================

  const handleBulkInputChange = (event) => {
    const { name, value } = event.target;

    setBulkForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // FILE CHANGE
  // =========================================================
// =========================================================
// BULK UPDATE FILE CHANGE
// =========================================================

const handleUpdateFileChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    setUpdateFile(null);
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

  // Same 10 MB limit as Multer
  if (file.size > 10 * 1024 * 1024) {
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

  const handleBulkFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setBulkFile(null);
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
      setBulkFile(null);

      return;
    }

    // Backend Multer limit = 10 MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        "Excel file must be 10 MB or smaller."
      );

      event.target.value = "";
      setBulkFile(null);

      return;
    }

setBulkFile(file);

// Clear previous upload errors
setBulkUploadResponse(null);
  };

  // =========================================================
// BULK STUDENT UPDATE
// =========================================================

const handleBulkUpdate = async (event) => {
  event.preventDefault();

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

    // Must match upload.single("file")
    formData.append(
      "file",
      updateFile
    );

    const response =
      await API.post(
        "/students/bulk-update",
        formData
      );

    console.log(
      "BULK UPDATE RESULT:",
      response.data
    );

//     setBulkUploadResponse(
//   response.data
// );

console.log(
  "STATE AFTER SET:",
  response.data
);

    setUpdateResult(
      response.data
    );

    toast.success(
      response.data?.message ||
        "Students updated successfully."
    );
    // setBulkUploadResponse(null);

    setUpdateFile(null);

    const fileInput =
      document.getElementById(
        "bulk-update-file"
      );

    if (fileInput) {
      fileInput.value = "";
    }

  } catch (error) {
    console.error(
      "BULK STUDENT UPDATE ERROR:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Student bulk update failed."
    );

  } finally {
    setUpdating(false);
  }
};

  // =========================================================
  // BULK UPLOAD
  // =========================================================

  const handleBulkUpload = async (event) => {
    event.preventDefault();

    if (!bulkForm.departmentId) {
      toast.error("Please select a department.");
      return;
    }

    if (!bulkForm.programmeId) {
      toast.error("Please select a programme.");
      return;
    }

    if (!bulkForm.batchId) {
      toast.error("Please select a batch.");
      return;
    }

    if (!bulkFile) {
      toast.error("Please select an Excel file.");
      return;
    }

    try {
    setUploading(true);
setBulkUploadResponse(null);

      const formData = new FormData();

      formData.append(
        "departmentId",
        bulkForm.departmentId
      );

      formData.append(
        "programmeId",
        bulkForm.programmeId
      );

      formData.append(
        "batchId",
        bulkForm.batchId
      );

      // Section is optional
      if (bulkForm.section.trim()) {
        formData.append(
          "section",
          bulkForm.section.trim().toUpperCase()
        );
      }

      // Must match upload.single("file")
      formData.append(
        "file",
        bulkFile
      );

      const response = await API.post(
        "/students/bulk-upload",
        formData
      );

    // Save the complete backend response
setBulkUploadResponse(
  response.data
);

toast.success(
  response.data?.message ||
    "Students uploaded successfully."
);

console.log(
  "BULK UPLOAD RESULT:",
  response.data
);

      // Reset after successful upload
      setBulkForm({
        departmentId: "",
        programmeId: "",
        batchId: "",
        section: "",
      });

      setProgrammes([]);
      setBulkFile(null);

      const fileInput =
        document.getElementById(
          "bulk-student-file"
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
  console.error(
    "BULK STUDENT UPLOAD ERROR:",
    error
  );

  const backendError =
    error.response?.data || null;

  setBulkUploadResponse(
    backendError || {
      message:
        "Student bulk upload failed.",
    }
  );

  toast.error(
    backendError?.message ||
      "Student bulk upload failed."
  );
} finally {
      setUploading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================
useEffect(() => {
  console.log("activeMode:", activeMode);
}, [activeMode]);

useEffect(() => {
  console.log("bulkUploadResponse:", bulkUploadResponse);
}, [bulkUploadResponse]);
  return (
    <div className="student-create-page">

      <div className="student-create-header">
        <div>
          <h1>Student Entry</h1>

          <p>
            Create, import and update student
            records.
          </p>
        </div>
      </div>

      {/* =================================================== */}
      {/* TABS */}
      {/* =================================================== */}

      <div className="student-create-tabs">

        {/* <button
          type="button"
          className={
            activeMode === "single"
              ? "student-create-tab active"
              : "student-create-tab"
          }
          onClick={() =>
            setActiveMode("single")
          }
        >
          Add Student
        </button> */}

        <button
          type="button"
          className={
            activeMode === "bulk-create"
              ? "student-create-tab active"
              : "student-create-tab"
          }
        onClick={openBulkUpload}
        >
          Bulk Upload
        </button>

        <button
          type="button"
          className={
            activeMode === "bulk-update"
              ? "student-create-tab active"
              : "student-create-tab"
          }
         onClick={openBulkUpdate}
        >
          Bulk Update
        </button>

      </div>

      <div className="student-create-content">

        {/* ================================================= */}
        {/* SINGLE CREATE */}
        {/* ================================================= */}

        {activeMode === "single" && (
          <div className="student-create-section">
            <h2>Add Student</h2>

            <p>
              Single student creation will
              be added after the bulk actions.
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* BULK CREATE */}
        {/* ================================================= */}

        {activeMode === "bulk-create" && (
          <div className="student-create-section">

          <div className="student-entry-header">

  <h2 className="student-entry-title">
    Bulk Student Upload
  </h2>

  <p className="student-entry-description">
    Select the academic details and upload the
    student Excel sheet.
  </p>

</div>


            {/* ========================================= */}
{/* BULK UPLOAD ERROR */}
{/* ========================================= */}

{/* ========================================= */}
{/* BULK UPLOAD RESULT */}
{/* ========================================= */}

{bulkUploadResponse && (
  <div className="student-upload-result">

    <div className="student-upload-result-header">

      <h3>
        {bulkUploadResponse.success
          ? "Bulk Upload Result"
          : "Bulk Upload Failed"}
      </h3>

      <p>
        {bulkUploadResponse.message}
      </p>

    </div>



<div className="student-upload-summary">

      <div className="student-upload-summary-card">
        <span>Total Rows</span>

        <strong>
          {bulkUploadResponse.totalRows ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Inserted</span>

        <strong>
          {bulkUploadResponse.insertedCount ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Rejected</span>

        <strong>
          {bulkUploadResponse.failedCount ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Warnings</span>

        <strong>
          {bulkUploadResponse.warningCount ?? 0}
        </strong>
      </div>

    </div>

    {/* ========================================= */}
{/* IMPORTED WITH WARNINGS */}
{/* ========================================= */}

{bulkUploadResponse.importedWithWarnings?.length > 0 && (

  <div className="student-upload-warning-section">

    <h4>
      Students Imported With Warnings
    </h4>

    <p>
      These students were successfully imported,
      but some values require your attention.
    </p>

    {bulkUploadResponse.importedWithWarnings.map(
      (student, index) => (

        <div
          key={index}
          className="student-warning-card"
        >

          <div className="student-warning-header">

            <h5>
              Row {student.row} • {student.studentName}
            </h5>

            <span>
              Register No :
              {" "}
              {student.registerNumber}
            </span>

          </div>

          {student.warnings.map(
            (warning, warningIndex) => (

              <div
                key={warningIndex}
                className="student-warning-item"
              >

                <strong>
                  {warning.field}
                </strong>

                <p>
                  {warning.reason}
                </p>

                <small>
                  Received :
                  {" "}
                  {String(
                    warning.receivedValue
                  )}

                  {warning.expected !==
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

              </div>

            )
          )}

        </div>

      )
    )}

  </div>

)}

  </div>
)}

          </div>
        )}

        {/* ================================================= */}
        {/* BULK UPDATE */}
        {/* ================================================= */}

      {activeMode === "bulk-update" && (
  <div className="student-create-section">

    <div className="student-section-heading">
      <h2>
        Bulk Student Update
      </h2>

      <p>
        Upload an Excel file to update
        existing student records.
      </p>
    </div>

    <form
      onSubmit={handleBulkUpdate}
      className="student-bulk-form"
    >

      <div className="student-form-group student-file-group">

        <label htmlFor="bulk-update-file">
          Student Excel File
        </label>

        <input
          id="bulk-update-file"
          type="file"
          accept=".xlsx,.xls"
          onChange={
            handleUpdateFileChange
          }
          disabled={updating}
        />

        {updateFile && (
          <p className="selected-file-name">
            Selected: {updateFile.name}
          </p>
        )}

      </div>

      <div className="student-form-actions">

        <button
          type="submit"
          disabled={
            updating ||
            !updateFile
          }
          className="student-upload-button"
        >
          {updating
            ? "Updating..."
            : "Update Students"}
        </button>

      </div>

    </form>


{/* ========================================= */}
{/* BULK UPDATE RESULT */}
{/* ========================================= */}

{updateResult && (

  <div className="student-upload-result">

    <div className="student-upload-result-header">

      <h3>
        {updateResult.success
          ? "Bulk Update Result"
          : "Bulk Update Failed"}
      </h3>

      <p>
        {updateResult.message}
      </p>

    </div>

    <div className="student-upload-summary">

      <div className="student-upload-summary-card">
        <span>Total Rows</span>

        <strong>
          {updateResult.totalRows ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Processed</span>

        <strong>
          {updateResult.processedCount ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Modified</span>

        <strong>
          {updateResult.modifiedCount ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Unchanged</span>

        <strong>
          {updateResult.unchangedCount ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Rejected</span>

        <strong>
          {updateResult.failedCount ?? 0}
        </strong>
      </div>

      <div className="student-upload-summary-card">
        <span>Warnings</span>

        <strong>
          {updateResult.warningCount ?? 0}
        </strong>
      </div>

    </div>

  </div>

  

)}
{/* ========================================= */}
{/* REJECTED STUDENTS */}
{/* ========================================= */}

 {updateResult?.failedStudents?.length > 0 && (

  <div className="student-upload-warning-section">

    <h4>
      Rejected Students
    </h4>

    <p>
      These student records could not be updated.
      Please review the errors below.
    </p>

    {updateResult.failedStudents.map(
      (student, index) => (

        <div
          key={index}
          className="student-warning-card"
        >

          <div className="student-warning-header">

            <h5>
              Row {student.row} • {student.studentName}
            </h5>

            <span>
              Application No :
              {" "}
              {student.applicationNumber || "-"}
            </span>

          </div>

          <div className="student-warning-item">

            <strong>
              Reason
            </strong>

            <p>
              {student.reason}
            </p>

          </div>

          {student.errors?.length > 0 && (

            <div className="student-warning-item">

              <strong>
                Errors
              </strong>

              {student.errors.map(
                (error, errorIndex) => (

                  <p key={errorIndex}>
                    • {error.reason}
                  </p>

                )
              )}

            </div>

          )}

          {student.warnings?.length > 0 && (

            <div className="student-warning-item">

              <strong>
                Warnings
              </strong>

              {student.warnings.map(
                (warning, warningIndex) => (

                  <p key={warningIndex}>
                    • {warning.reason}
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
)}

      </div>


      {/* ================================================= */}
{/* BULK UPLOAD POPUP */}
{/* ================================================= */}

{showBulkUpload && (

<div
  className="student-popup-overlay"
  onClick={closeBulkUpload}
>
  <div
    className="student-popup-body"
    onClick={(event) => event.stopPropagation()}
  >





    <div className="student-entry-card">


      <div className="student-popup-header">

  <div>

    <h2 className="student-popup-title">
      Bulk Student Upload
    </h2>

 

  </div>

  <button
    type="button"
    className="student-popup-close"
    onClick={closeBulkUpload}
  >
    ✕
  </button>

</div>

  <form
  onSubmit={handleBulkUpload}
  className="student-bulk-form"
>

  {/* ========================================= */}
  {/* ACADEMIC DETAILS */}
  {/* ========================================= */}

  <div className="student-entry-section">

    <div className="student-entry-section-header">

      <h3>
        Academic Details
      </h3>

      <p>
        Select the academic information for
        this student import.
      </p>

    </div>

    <div className="student-entry-grid">

      {/* Department */}

      <div className="student-form-group">

        <label htmlFor="departmentId">
          Department
        </label>

        <select
          id="departmentId"
          name="departmentId"
          value={bulkForm.departmentId}
          onChange={handleDepartmentChange}
          disabled={uploading}
        >

          <option value="">
            Select Department
          </option>

          {departments.map((department) => (

            <option
              key={department._id}
              value={department._id}
            >
              {department.departmentName}
            </option>

          ))}

        </select>

      </div>

      {/* Programme */}

      <div className="student-form-group">

        <label htmlFor="programmeId">
          Programme
        </label>

        <select
          id="programmeId"
          name="programmeId"
          value={bulkForm.programmeId}
          onChange={handleBulkInputChange}
          disabled={
            !bulkForm.departmentId ||
            uploading
          }
        >

          <option value="">
            Select Programme
          </option>

          {programmes.map((programme) => (

            <option
              key={programme._id}
              value={programme._id}
            >
              {programme.programmeName}
              {programme.programmeCode
                ? ` (${programme.programmeCode})`
                : ""}
            </option>

          ))}

        </select>

      </div>

      {/* Batch */}

      <div className="student-form-group">

        <label htmlFor="batchId">
          Batch
        </label>

        <select
          id="batchId"
          name="batchId"
          value={bulkForm.batchId}
          onChange={handleBulkInputChange}
          disabled={uploading}
        >

          <option value="">
            Select Batch
          </option>

          {batches.map((batch) => (

            <option
              key={batch._id}
              value={batch._id}
            >
              {batch.batchName}
            </option>

          ))}

        </select>

      </div>

      {/* Section */}

      <div className="student-form-group">

        <label htmlFor="section">
          Section
          <span> (Optional)</span>
        </label>

        <input
          id="section"
          name="section"
          type="text"
          placeholder="Example : A"
          value={bulkForm.section}
          onChange={handleBulkInputChange}
          disabled={uploading}
          maxLength={10}
        />

      </div>

    </div>

  </div>

    {/* ========================================= */}
  {/* UPLOAD EXCEL FILE */}
  {/* ========================================= */}

  <div className="student-entry-section">

    <div className="student-entry-section-header">

      <h3>
        Upload Excel File
      </h3>

      <p>
        Select the Excel file that contains the
        student records to be imported.
      </p>

    </div>

    <div className="student-entry-gridtwo">

<div className="student-form-group student-file-group">

  <label className="student-upload-box">

    <input
      id="bulk-student-file"
      type="file"
      accept=".xlsx,.xls"
      onChange={handleBulkFileChange}
      disabled={uploading}
      hidden
    />

    <div className="student-upload-content">

      <div className="student-upload-icon">
        📄
      </div>

      <h4>
        Upload Student Excel
      </h4>

      <p>
        Click here to choose an Excel file
      </p>

      <span>
        Supported :
        .xlsx &nbsp; .xls
      </span>

      {bulkFile && (

        <div className="student-selected-file">

          <strong>
            Selected File
          </strong>

          <p>
            {bulkFile.name}
          </p>

        </div>

      )}

    </div>

  </label>

</div>

    </div>

  </div>

    {/* ========================================= */}
  {/* FORM ACTION */}
  {/* ========================================= */}

  <div className="student-entry-actions">

    <button
      type="submit"
      disabled={uploading}
      className="student-upload-button"
    >

      {uploading
        ? "Uploading Students..."
        : "Upload Students"}

    </button>

  </div>

</form>

    </div>


</div>

  </div>

)}


{/* ================================================= */}
{/* BULK UPDATE POPUP */}
{/* ================================================= */}

{showBulkUpdate && (

  <div
    className="student-popup-overlay"
    onClick={closeBulkUpdate}
  >

    <div
      className="student-popup-wrapper"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <div className="student-popup-bodytwo">

        <div className="student-entry-card">

          <div className="student-popup-header">

            <div>

              <h2 className="student-popup-title">
                Bulk Student Update
              </h2>

            </div>

            <button
              type="button"
              className="student-popup-close"
              onClick={closeBulkUpdate}
            >
              ✕
            </button>

          </div>

<form
  onSubmit={handleBulkUpdate}
  className="student-bulk-form"
>

  {/* ========================================= */}
  {/* UPDATE EXCEL FILE */}
  {/* ========================================= */}

  <div className="student-entry-section">

    <div className="student-entry-section-header">

      <h3>
        Update Excel File
      </h3>

      <p>
        Select the Excel file containing the
        student records to be updated.
      </p>

    </div>

    <div className="student-entry-gridtwo">

      <div className="student-form-group student-file-group">

        <label className="student-upload-box">

          <input
            id="bulk-update-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleUpdateFileChange}
            disabled={updating}
            hidden
          />

          <div className="student-upload-content">

            <div className="student-upload-icon">
              📄
            </div>

            <h4>
              Update Student Excel
            </h4>

            <p>
              Click here to choose an Excel file
            </p>

            <span>
              Supported :
              .xlsx &nbsp; .xls
            </span>

            {updateFile && (

              <div className="student-selected-file">

                <strong>
                  Selected File
                </strong>

                <p>
                  {updateFile.name}
                </p>

              </div>

            )}

          </div>

        </label>

      </div>

    </div>

  </div>

  {/* ========================================= */}
  {/* FORM ACTION */}
  {/* ========================================= */}

  <div className="student-entry-actions">

    <button
      type="submit"
      disabled={
        updating ||
        !updateFile
      }
      className="student-upload-button"
    >

      {updating
        ? "Updating Students..."
        : "Update Students"}

    </button>

  </div>

</form>

        </div>

      </div>

    </div>

  </div>

)}

    </div>
  );
};

export default StudentCreate;