import {
  useEffect,
  useState,
  useRef
} from "react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api/axios";
import { FadersHorizontalIcon ,GenderMaleIcon ,GenderFemaleIcon ,PencilSimpleLineIcon ,TrashSimpleIcon,XIcon } from "@phosphor-icons/react";

import "./enquiry.css"
const Enquiry = () => {

  /* ==================================
            STATES
  ================================== */
const navigate =
  useNavigate();
  const [enquiries, setEnquiries] =
    useState([]);

  const [loading, setLoading] =
    useState(false);


      /* ==================================
        BULK ENQUIRY UPLOAD
  ================================== */

  const bulkFileInputRef = useRef(null);

  const [bulkFile, setBulkFile] =
    useState(null);

  const [bulkUploading, setBulkUploading] =
    useState(false);

  const [bulkResult, setBulkResult] =
    useState(null);

  const [showBulkUpload, setShowBulkUpload] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

  const [departments, setDepartments] =
    useState([]);

  const [programmes, setProgrammes] =
    useState([]);

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
    });

  const [filters, setFilters] =
    useState({
      page: 1,
      limit: 10,
      search: "",
      status: "",
        enquirySource: "",
      departmentId: "",
      programmeId: "",
      enquirySource: "",
    });

  const [formData, setFormData] =
    useState({

      departmentId: "",
      programmeId: "",

      studentName: "",

      dateOfBirth: "",

      gender: "",

      studentMobile: "",

      studentEmail: "",

      parentName: "",

      parentMobile: "",

          status: "New",

      address: "",

      enquirySource:
        "Walk-In",

      followUpDate: "",

      remarks: "",

    });

    const [enquiryStats, setEnquiryStats] = useState({
  totalEnquiries: 0,
  weeklyEnquiries: 0,
  totalConversions: 0,
});

    const [showConvertForm, setShowConvertForm] =
  useState(false);

const [selectedEnquiryId, setSelectedEnquiryId] =
  useState(null);

const [batches, setBatches] =
  useState([]);

const [conversionData, setConversionData] =
  useState({

    batchId: "",

    fatherGuardianName: "",

    religion: "",

    communityCategory: "",

  });

  /* ==================================
            FETCH PLACEHOLDERS
  ================================== */
// const fetchEnquiries = async () => {
//   try {
//     setLoading(true);

//     const response = await API.get(
//       "/enquiry",
//       {
//         params: filters,
//       }
//     );

//     setEnquiries(
//       response.data.data
//     );

//    setPagination({

//   currentPage:
//     response.data.page,

//   totalPages:
//     response.data.totalPages,

//   totalRecords:
//     response.data.count,

// });

//   } catch (error) {

//     toast.error(
//       error.response?.data?.message ||
//       "Failed to fetch enquiries."
//     );

//   } finally {

//     setLoading(false);

//   }
// };


const fetchEnquiries = async () => {
  try {
    setLoading(true);

    const response = await API.get(
      "/enquiry/my-institution",
      {
        params: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search,
          status: filters.status,
          enquirySource:
  filters.enquirySource,
          departmentId: filters.departmentId,
          programmeId: filters.programmeId,
        },
      }
    );

    setEnquiries(response.data.data || []);

    setEnquiryStats(
  response.data.stats || {
    totalEnquiries: 0,
    weeklyEnquiries: 0,
    totalConversions: 0,
  }
);


    setPagination({
      currentPage: response.data.page,
      totalPages: response.data.totalPages,
      totalRecords: response.data.count,
    });

  } catch (error) {
    console.error(
      "Fetch enquiries error:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch enquiries."
    );

  } finally {
    setLoading(false);
  }
};


/* ==================================
      BULK ENQUIRY UPLOAD
================================== */

const handleBulkFileChange = (e) => {

  const file = e.target.files?.[0];

  if (!file) {
    return;
  }

  const allowedExtensions = [
    ".xlsx",
    ".xls",
    ".csv",
  ];

  const fileName =
    file.name.toLowerCase();

  const isValidFile =
    allowedExtensions.some(
      (extension) =>
        fileName.endsWith(extension)
    );

  if (!isValidFile) {

    toast.error(
      "Please select a valid Excel file (.xlsx, .xls or .csv)."
    );

    e.target.value = "";

    return;
  }

  setBulkFile(file);

  setBulkResult(null);

};


/* ==================================
      BULK UPLOAD SUBMIT
================================== */

const handleBulkUpload = async () => {

  if (!bulkFile) {

    toast.error(
      "Please select an Excel file first."
    );

    return;
  }

  try {

    setBulkUploading(true);

    const formData =
      new FormData();

    formData.append(
      "file",
      bulkFile
    );

    const response =
      await API.post(
        "/enquiry/bulk-upload",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    const result =
      response.data;

    setBulkResult(result);

    if (
      result.insertedCount > 0
    ) {

      toast.success(
        `${result.insertedCount} enquiries imported successfully.`
      );

    }

    if (
      result.failedCount > 0
    ) {

      toast.warning(
        `${result.failedCount} rows could not be imported.`
      );

    }

    /*
     * Refresh the enquiry table
     */
    await fetchEnquiries();

  } catch (error) {

    console.error(
      "Bulk enquiry upload error:",
      error.response?.data ||
      error
    );

    toast.error(

      error.response?.data?.message ||

      "Failed to upload enquiries."

    );

    /*
     * Backend validation errors
     * such as missing headers
     * should also be shown.
     */
    setBulkResult(
      error.response?.data || null
    );

  } finally {

    setBulkUploading(false);

  }

};


/* ==================================
      CLOSE BULK UPLOAD
================================== */

const closeBulkUpload = () => {

  setBulkFile(null);

  setBulkResult(null);

  setShowBulkUpload(false);

  if (
    bulkFileInputRef.current
  ) {

    bulkFileInputRef.current.value =
      "";

  }

};

const fetchDepartments =
  async () => {

    try {

      const response =
        await API.get(
          "/institutions/my-institution"
        );

      setDepartments(
        response.data.data.departments
      );

    } catch (error) {

      toast.error(
        "Failed to fetch departments."
      );

    }

};

const fetchBatches = async () => {

  try {

    const response =
      await API.get(
        "/batch/getall"
      );

    setBatches(
      response.data.data
    );

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch batches."
    );

  }

};

const fetchProgrammes = async (
  departmentId
) => {

  try {

    const response =
      await API.get(
        `/programmes/department/${departmentId}`
      );

    setProgrammes(
      response.data.data
    );


  } catch (error) {

    toast.error(
      "Failed to fetch programmes."
    );

  }

};

  useEffect(() => {

    fetchEnquiries();

    fetchDepartments();

  }, [filters]);

  /* ==================================
            INPUT HANDLERS
  ================================== */

const handleInputChange = async (e) => {

  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "departmentId") {

    setFormData((prev) => ({
      ...prev,
      departmentId: value,
      programmeId: "",
    }));

    await fetchProgrammes(value);

  }

};
const handleConversionChange = (
  e
) => {

  const { name, value } =
    e.target;

  setConversionData((prev) => ({

    ...prev,

    [name]: value,

  }));

};
  const handleFilterChange =
    (e) => {

      setFilters((prev) => ({
        ...prev,
        page: 1,
        [e.target.name]:
          e.target.value,
      }));

    };

  /* ==================================
            PAGINATION
  ================================== */

  const nextPage = () => {

    if (
      filters.page <
      pagination.totalPages
    ) {

      setFilters((prev) => ({
        ...prev,
        page:
          prev.page + 1,
      }));

    }

  };

  const previousPage = () => {

    if (
      filters.page > 1
    ) {

      setFilters((prev) => ({
        ...prev,
        page:
          prev.page - 1,
      }));

    }

  };

  /* ==================================
            RESET FORM
  ================================== */

  const resetForm = () => {

    setFormData({

      departmentId: "",
      programmeId: "",

      studentName: "",

      dateOfBirth: "",

      gender: "",

      studentMobile: "",

      studentEmail: "",

      parentName: "",

      parentMobile: "",

      address: "",

      enquirySource:"Walk-In",

        status: "New",

      followUpDate: "",

      remarks: "",

    });

    setEditingId(
      null
    );

    setShowForm(
      false
    );

  };

  /* ==================================
            CRUD PLACEHOLDERS
  ================================== */

const handleCreate = async () => {

  // Validate Required Fields

  if (
    !formData.departmentId ||
    !formData.programmeId ||
    !formData.studentName ||
    !formData.studentMobile
  ) {

    toast.error(
      "Please fill all required fields."
    );

    return;

  }

  try {

    await API.post(
      "/enquiry",
      formData
    );

    toast.success(
      "Enquiry created successfully."
    );

    fetchEnquiries();

    resetForm();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to create enquiry."

    );

  }

};

// edit function 

const handleEdit = async (
  enquiry
) => {

  setEditingId(
    enquiry._id
  );

  setFormData({

    departmentId:
      enquiry.departmentId._id,

    programmeId:
      enquiry.programmeId._id,

    studentName:
      enquiry.studentName,

    dateOfBirth:
      enquiry.dateOfBirth
        ?.split("T")[0],

    gender:
      enquiry.gender,

    studentMobile:
      enquiry.studentMobile,

    studentEmail:
      enquiry.studentEmail,

    parentName:
      enquiry.parentName,

    parentMobile:
      enquiry.parentMobile,

    address:
      enquiry.address,

    enquirySource:
      enquiry.enquirySource,

      status:
  enquiry.status,

    followUpDate:
      enquiry.followUpDate
        ?.split("T")[0],

    remarks:
      enquiry.remarks,

  });

  await fetchProgrammes(
    enquiry.departmentId._id
  );

  setShowForm(true);

};


const handleUpdate = async () => {

  if (
    !formData.departmentId ||
    !formData.programmeId ||
    !formData.studentName ||
    !formData.studentMobile
  ) {

    toast.error(
      "Please fill all required fields."
    );

    return;

  }

  try {

    await API.put(

      `/enquiry/${editingId}`,

      formData

    );

    toast.success(
      "Enquiry updated successfully."
    );

    fetchEnquiries();

    resetForm();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to update enquiry."

    );

  }

};

const handleDelete = async (
  id
) => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

  if (!confirmDelete) {
    return;
  }

  try {

    await API.delete(
      `/enquiry/${id}`
    );

    toast.success(
      "Enquiry deleted successfully."
    );

    fetchEnquiries();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to delete enquiry."

    );

  }

};
const handleConvert =
  async (id) => {

    setSelectedEnquiryId(
      id
    );

    setShowConvertForm(
      true
    );

    fetchBatches();

};



const submitConversion =
  async () => {

    if (

      !conversionData.batchId ||

      !conversionData.fatherGuardianName ||

      !conversionData.religion ||

      !conversionData.communityCategory

    ) {

      toast.error(
        "Please fill all required fields."
      );

      return;

    }

    try {

      await API.patch(

        `/enquiry/convert/${selectedEnquiryId}`,

        conversionData

      );

      toast.success(
        "Enquiry converted successfully."
      );

    fetchEnquiries();

setConversionData({

  batchId: "",

  fatherGuardianName: "",

  religion: "",

  communityCategory: "",

});

setSelectedEnquiryId(null);

setShowConvertForm(false);

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to convert enquiry."

      );

    }

};

  return (

    <div className="addmissioncell_enquiry_container">

      {/* HEADER */}
{/* ===========================================================
                        PAGE HEADER
=========================================================== */}

<NavLink to="/admission-cell/enquiry/bin">

  <h4>
    Enquiry Bin
  </h4>

</NavLink>

<div className="addmissioncell_enquiry_page_header">

  {/* ================= LEFT ================= */}

  <div className="addmissioncell_enquiry_header_left">

    <h2 className="addmissioncell_enquiry_page_title">

      Enquiry Management

    </h2>

    <p className="addmissioncell_enquiry_page_subtitle">

      Manage student enquiries, follow-ups and admission conversions.

    </p>


    <div className="enquiry_cta_wrapper">


    <button
      className="addmissioncell_enquiry_create_btn"
      onClick={() => {

        if (showForm) {

          resetForm();

        } else {

          setShowForm(true);

        }

      }}
    >

      {

        showForm

          ?

          "Close Form"

          :

          "Add Enquiry"

      }

    </button>

<button
  className="addmissioncell_enquiry_create_btn"
  onClick={() => {

    setShowBulkUpload(true);

    setBulkResult(null);

    setBulkFile(null);

  }}
>
  Bulk Enquiry
</button>

    </div>


  </div>

  {/* ================= RIGHT ================= */}

  <div className="addmissioncell_enquiry_statistics_wrapper">

    {/* TOTAL */}

    <div className="addmissioncell_enquiry_statistics_card">

      <div className="addmissioncell_enquiry_statistics_header">

        <h5 className="addmissioncell_enquiry_statistics_title">

          Total Enquiries

        </h5>

        <FadersHorizontalIcon className="addmissioncell_enquiry_statistics_icon" />

      </div>

      <div className="addmissioncell_enquiry_statistics_body">

        <span className="addmissioncell_enquiry_statistics_line">

          _

        </span>

        <h2 className="addmissioncell_enquiry_statistics_value">

          {enquiryStats.totalEnquiries || 0}

        </h2>

      </div>

    </div>

    {/* WEEK */}

    <div className="addmissioncell_enquiry_statistics_card">

      <div className="addmissioncell_enquiry_statistics_header">

        <h5 className="addmissioncell_enquiry_statistics_title">

          This Week

        </h5>

        <FadersHorizontalIcon className="addmissioncell_enquiry_statistics_icon" />

      </div>

      <div className="addmissioncell_enquiry_statistics_body">

        <span className="addmissioncell_enquiry_statistics_line">

          _

        </span>

        <h2 className="addmissioncell_enquiry_statistics_value">

          {enquiryStats.weeklyEnquiries || 0}

        </h2>

      </div>

    </div>

    {/* CONVERTED */}

    <div className="addmissioncell_enquiry_statistics_card">

      <div className="addmissioncell_enquiry_statistics_header">

        <h5 className="addmissioncell_enquiry_statistics_title">

          Converted

        </h5>

        <FadersHorizontalIcon className="addmissioncell_enquiry_statistics_icon" />

      </div>

      <div className="addmissioncell_enquiry_statistics_body">

        <span className="addmissioncell_enquiry_statistics_line">

          _

        </span>

        <h2 className="addmissioncell_enquiry_statistics_value">

          {enquiryStats.totalConversions || 0}

        </h2>

      </div>

    </div>

  </div>

</div>

      {/*enquiry FORM */}

{
  showForm && (

<div
  className="addmissioncell_enquiry_popup_overlay"
  onClick={() => {

    setShowForm(false);

    resetForm();

  }}
>

  <div
    className="addmissioncell_enquiry_form_wrapper"
    onClick={(e)=>
      e.stopPropagation()
    }
  >

    <div className="addmissioncell_enquiryform_header">

  <h3 className="addmissioncell_enquiryform_title">

    {
      editingId
        ? "Update Enquiry"
        : "Create Enquiry"
    }

  </h3>

  <XIcon
    className="addmissioncell_enquiry_form_close_icon"
    onClick={() => {

      setShowForm(false);

      resetForm();

    }}
  />

</div>

<div className="addmissioncell_enquiry_form_grid">

  {/* Department */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Department

    </label>

    <select
      name="departmentId"
      value={formData.departmentId}
      onChange={handleInputChange}
    >

      <option value="">
        Select Department
      </option>

      {

        departments.map((department) => (

          <option
            key={department._id}
            value={department._id}
          >

            {department.departmentName}

          </option>

        ))

      }

    </select>

  </div>

  {/* Programme */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Programme

    </label>

    <select
      name="programmeId"
      value={formData.programmeId}
      onChange={handleInputChange}
    >

      <option value="">
        Select Programme
      </option>

      {

        programmes.map((programme) => (

          <option
            key={programme._id}
            value={programme._id}
          >

            {programme.programmeName}

          </option>

        ))

      }

    </select>

  </div>

  {/* Student Name */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Student Name

    </label>

    <input
      type="text"
      name="studentName"
      value={formData.studentName}
      onChange={handleInputChange}
    />

  </div>

  {/* Date of Birth */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Date of Birth

    </label>

    <input
      type="date"
      name="dateOfBirth"
      value={formData.dateOfBirth}
      onChange={handleInputChange}
    />

  </div>

  {/* Gender */}


  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Gender

    </label>

    <select
      name="gender"
      value={formData.gender}
      onChange={handleInputChange}
    >

      <option value="">
        Select Gender
      </option>

      <option value="Male">
        Male
      </option>

      <option value="Female">
        Female
      </option>

      <option value="Other">
        Other
      </option>

    </select>

  </div>


      {/* Student Mobile */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Student Mobile

    </label>

    <input
      type="text"
      name="studentMobile"
      value={formData.studentMobile}
      onChange={handleInputChange}
    />

  </div>

  {/* Student Email */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Student Email

    </label>

    <input
      type="email"
      name="studentEmail"
      value={formData.studentEmail}
      onChange={handleInputChange}
    />

  </div>

  {/* Parent Name */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Parent Name

    </label>

    <input
      type="text"
      name="parentName"
      value={formData.parentName}
      onChange={handleInputChange}
    />

  </div>

  {/* Parent Mobile */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Parent Mobile

    </label>

    <input
      type="text"
      name="parentMobile"
      value={formData.parentMobile}
      onChange={handleInputChange}
    />

  </div>

  {/* Enquiry Source */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Enquiry Source

    </label>

    <select
      name="enquirySource"
      value={formData.enquirySource}
      onChange={handleInputChange}
    >

      <option value="Walk-In">
        Walk-In
      </option>

      <option value="Phone">
        Phone
      </option>

      <option value="Website">
        Website
      </option>

      <option value="Social Media">
        Social Media
      </option>

      <option value="Reference">
        Reference
      </option>

      <option value="Other">
        Other
      </option>

    </select>

  </div>

  {/* Status */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Status

    </label>

    <select
      name="status"
      value={formData.status}
      onChange={handleInputChange}
    >

      <option value="New">
        New
      </option>

      <option value="Interested">
        Interested
      </option>

      <option value="Follow Up">
        Follow Up
      </option>

      <option value="Converted">
        Converted
      </option>

      <option value="Rejected">
        Rejected
      </option>

    </select>

  </div>

  {/* Follow Up Date */}

  <div className="addmissioncell_enquiry_form_field">

    <label className="addmissioncell_enquiry_form_label">

      Follow Up Date

    </label>

    <input
      type="date"
      name="followUpDate"
      value={formData.followUpDate}
      onChange={handleInputChange}
    />

  </div>

    {/* Address */}

  <div className="addmissioncell_enquiry_form_field addmissioncell_enquiry_full_width">

    <label className="addmissioncell_enquiry_form_label">

      Address

    </label>

    <textarea
      name="address"
      value={formData.address}
      onChange={handleInputChange}
    />

  </div>

  {/* Remarks */}

  <div className="addmissioncell_enquiry_form_field addmissioncell_enquiry_full_width">

    <label className="addmissioncell_enquiry_form_label">

      Remarks

    </label>

    <textarea
      name="remarks"
      value={formData.remarks}
      onChange={handleInputChange}
    />

  </div>

  {/* Submit Button */}

<div className="addmissioncell_enquiry_form_field addmissioncell_enquiry_full_width">

  <button
    onClick={
      editingId
        ? handleUpdate
        : handleCreate
    }
  >

    {
      editingId
        ? "Update Enquiry"
        : "Create Enquiry"
    }

  </button>

</div>

</div> 

</div> 
</div>

  )
}


{/* =========================================================
    BULK ENQUIRY UPLOAD POPUP
========================================================= */}

{showBulkUpload && (

  <div
    className="enquiry-bulk-overlay"
    onClick={closeBulkUpload}
  >

    <div
      className="enquiry-bulk-popup"
      onClick={(e) => e.stopPropagation()}
    >

      {/* ================= HEADER ================= */}

      <div className="enquiry-bulk-header">

        <div>

          <h3 className="enquiry-bulk-title">
            Bulk Enquiry Upload
          </h3>

          <p className="enquiry-bulk-subtitle">
            Import multiple student enquiries using an Excel file.
          </p>

        </div>

        <button
          type="button"
          className="enquiry-bulk-close"
          onClick={closeBulkUpload}
        >
          <XIcon size={20} />
        </button>

      </div>


      {/* ================= BODY ================= */}

      <div className="enquiry-bulk-body">

        <div className="enquiry-bulk-content">


          {/* ================= UPLOAD SECTION ================= */}

          <div className="enquiry-bulk-section">

            <div className="enquiry-bulk-section-heading">

              <h4>
                Upload Excel File
              </h4>

              <p>
                Select the Excel file containing the enquiry records.
              </p>

            </div>


            {/* FILE INPUT */}

            <label
              className="enquiry-bulk-upload-box"
            >

              <input
                ref={bulkFileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleBulkFileChange}
                disabled={bulkUploading}
              />

              <div className="enquiry-bulk-upload-icon">
                📄
              </div>

              <h5>
                Upload Enquiry Excel
              </h5>

              <p>
                Click here to choose an Excel file
              </p>

              <span>
                Supported: .xlsx &nbsp; .xls &nbsp; .csv
              </span>

            </label>


            {/* SELECTED FILE */}

            {bulkFile && (

              <div className="enquiry-bulk-selected-file">

                <div>

                  <span>
                    Selected File
                  </span>

                  <strong>
                    {bulkFile.name}
                  </strong>

                </div>

                <button
                  type="button"
                  onClick={() => {

                    setBulkFile(null);

                    if (
                      bulkFileInputRef.current
                    ) {

                      bulkFileInputRef.current.value =
                        "";

                    }

                  }}
                >
                  Remove
                </button>

              </div>

            )}

          </div>


          {/* ================= UPLOAD ACTION ================= */}

          <div className="enquiry-bulk-action">

            <button
              type="button"
              className="enquiry-bulk-upload-button"
              onClick={handleBulkUpload}
              disabled={
                !bulkFile ||
                bulkUploading
              }
            >

              {bulkUploading
                ? "Uploading Enquiries..."
                : "Upload Enquiries"
              }

            </button>

          </div>


          {/* =================================================
              IMPORT RESULT
          ================================================= */}

          {bulkResult && (

            <div className="enquiry-bulk-result">


              {/* RESULT HEADER */}

              <div className="enquiry-bulk-result-header">

                <div>

                  <h4>
                    {bulkResult.success
                      ? "Bulk Upload Completed"
                      : "Bulk Upload Failed"
                    }
                  </h4>

                  <p>
                    {bulkResult.message}
                  </p>

                </div>

              </div>


              {/* ================= SUMMARY ================= */}

              <div className="enquiry-bulk-summary">


                <div className="enquiry-bulk-summary-card">

                  <span>
                    Total Rows
                  </span>

                  <strong>
                    {bulkResult.totalRows ?? 0}
                  </strong>

                </div>


                <div className="enquiry-bulk-summary-card">

                  <span>
                    Imported
                  </span>

                  <strong>
                    {bulkResult.insertedCount ?? 0}
                  </strong>

                </div>


                <div className="enquiry-bulk-summary-card">

                  <span>
                    Failed
                  </span>

                  <strong className="enquiry-bulk-count-error">
                    {bulkResult.failedCount ?? 0}
                  </strong>

                </div>


                <div className="enquiry-bulk-summary-card">

                  <span>
                    Warnings
                  </span>

                  <strong className="enquiry-bulk-count-warning">
                    {bulkResult.warningCount ?? 0}
                  </strong>

                </div>

              </div>


              {/* =================================================
                  FAILED ENQUIRIES
              ================================================= */}

              {bulkResult.failedEnquiries?.length > 0 && (

                <div className="enquiry-bulk-error-section">

                  <div className="enquiry-bulk-error-heading">

                    <div>

                      <h4>
                        Rejected Enquiries
                      </h4>

                      <p>
                        These rows could not be imported.
                        Please correct the errors and upload again.
                      </p>

                    </div>

                    <span>
                      {bulkResult.failedEnquiries.length}
                    </span>

                  </div>


                  <div className="enquiry-bulk-error-list">

                    {bulkResult.failedEnquiries.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="enquiry-bulk-error-card"
                        >

                          {/* ERROR CARD HEADER */}

                          <div className="enquiry-bulk-error-card-header">

                            <div>

                              <strong>
                                Row {item.row}
                              </strong>

                              <span>
                                {item.studentName}
                              </span>

                            </div>

                            <small>
                              {item.studentMobile || "-"}
                            </small>

                          </div>


                          {/* ERRORS */}

                          <div className="enquiry-bulk-error-card-body">

                            {item.errors?.map(
                              (error, errorIndex) => (

                                <div
                                  key={errorIndex}
                                  className="enquiry-bulk-error-item"
                                >

                                  <strong>
                                    {error.field}
                                  </strong>

                                  <p>
                                    {error.reason}
                                  </p>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* =================================================
                  IMPORTED WITH WARNINGS
              ================================================= */}

              {bulkResult.importedWithWarnings?.length > 0 && (

                <div className="enquiry-bulk-warning-section">

                  <div className="enquiry-bulk-warning-heading">

                    <div>

                      <h4>
                        Imported With Warnings
                      </h4>

                      <p>
                        These enquiries were imported successfully,
                        but some values require your attention.
                      </p>

                    </div>

                    <span>
                      {bulkResult.importedWithWarnings.length}
                    </span>

                  </div>


                  <div className="enquiry-bulk-warning-list">

                    {bulkResult.importedWithWarnings.map(
                      (item, index) => (

                        <div
                          key={index}
                          className="enquiry-bulk-warning-card"
                        >

                          <div className="enquiry-bulk-warning-card-header">

                            <div>

                              <strong>
                                Row {item.row}
                              </strong>

                              <span>
                                {item.studentName}
                              </span>

                            </div>

                            <small>
                              {item.studentMobile || "-"}
                            </small>

                          </div>


                          <div className="enquiry-bulk-warning-card-body">

                            {item.warnings?.map(
                              (warning, warningIndex) => (

                                <div
                                  key={warningIndex}
                                  className="enquiry-bulk-warning-item"
                                >

                                  <strong>
                                    {warning.field}
                                  </strong>

                                  <p>
                                    {warning.reason}
                                  </p>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* =================================================
                  HEADER WARNINGS
              ================================================= */}

              {bulkResult.headerWarnings?.length > 0 && (

                <div className="enquiry-bulk-header-warning-section">

                  <h4>
                    Excel Header Warnings
                  </h4>

                  {bulkResult.headerWarnings.map(
                    (warning, index) => (

                      <div
                        key={index}
                        className="enquiry-bulk-header-warning"
                      >

                        <strong>
                          {warning.receivedHeader}
                        </strong>

                        <p>
                          {warning.reason}
                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </div>

  </div>

)}


{
  showConvertForm && (

    <div
      className="addmissioncell_popup_overlay"
      onClick={() => {

        setShowConvertForm(false);

      }}
    >

      <div
        className="addmissioncell_form_wrapper"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="form_header">

          <h3 className="form_title">

            Convert Enquiry

          </h3>

          <XIcon
            className="form_close_icon"
            onClick={() => {

              setShowConvertForm(false);

            }}
          />

        </div>

        <select
          name="batchId"
          value={conversionData.batchId}
          onChange={handleConversionChange}
        >

          <option value="">
            Select Batch
          </option>

          {

            batches.map((batch) => (

              <option
                key={batch._id}
                value={batch._id}
              >

                {batch.batchName}

              </option>

            ))

          }

        </select>

        <input
          type="text"
          name="fatherGuardianName"
          placeholder="Father / Guardian Name"
          value={conversionData.fatherGuardianName}
          onChange={handleConversionChange}
        />

        <select
          name="religion"
          value={conversionData.religion}
          onChange={handleConversionChange}
        >

          <option value="">
            Select Religion
          </option>

          <option value="Hindu">
            Hindu
          </option>

          <option value="Muslim">
            Muslim
          </option>

          <option value="Christian">
            Christian
          </option>

          <option value="Sikh">
            Sikh
          </option>

          <option value="Buddhist">
            Buddhist
          </option>

          <option value="Jain">
            Jain
          </option>

          <option value="Parsi">
            Parsi
          </option>

          <option value="Other">
            Other
          </option>

        </select>

        <select
          name="communityCategory"
          value={conversionData.communityCategory}
          onChange={handleConversionChange}
        >

          <option value="">
            Select Community
          </option>

          <option value="OC">
            OC
          </option>

          <option value="BC">
            BC
          </option>

          <option value="MBC">
            MBC
          </option>

          <option value="BCM">
            BCM
          </option>

          <option value="DNC">
            DNC
          </option>

          <option value="SC">
            SC
          </option>

          <option value="SCA">
            SCA
          </option>

          <option value="ST">
            ST
          </option>

          <option value="Other">
            Other
          </option>

        </select>

        <button
          onClick={submitConversion}
        >

          Convert Student

        </button>

      </div>

    </div>

  )
}




      {/* FILTERS */}

{/* ===========================================================
                        FILTER SECTION
=========================================================== */}

<div className="addmissioncell_enquiry_filter_wrapper">

  {/* SEARCH */}

  <div className="addmissioncell_enquiry_filter_field">

    <input
      className="addmissioncell_enquiry_search_input"
      type="text"
      name="search"
      placeholder="Search Student Name / Mobile..."
      value={filters.search}
      onChange={handleFilterChange}
    />

  </div>

  {/* STATUS */}

  <div className="addmissioncell_enquiry_filter_field">

    <select
      className="addmissioncell_enquiry_filter_select"
      name="status"
      value={filters.status}
      onChange={handleFilterChange}
    >

      <option value="">
        All Status
      </option>

      <option value="New">
        New
      </option>

      <option value="Interested">
        Interested
      </option>

      <option value="Follow Up">
        Follow Up
      </option>

      <option value="Converted">
        Converted
      </option>

      <option value="Rejected">
        Rejected
      </option>

    </select>

  </div>

  {/* SOURCE */}

  <div className="addmissioncell_enquiry_filter_field">

    <select
      className="addmissioncell_enquiry_filter_select"
      name="enquirySource"
      value={filters.enquirySource}
      onChange={handleFilterChange}
    >

      <option value="">
        All Sources
      </option>

      <option value="Walk-In">
        Walk-In
      </option>

      <option value="Phone">
        Phone
      </option>

      <option value="Website">
        Website
      </option>

      <option value="Social Media">
        Social Media
      </option>

      <option value="Reference">
        Reference
      </option>

      <option value="Other">
        Other
      </option>

    </select>

  </div>

  {/* DEPARTMENT */}

  <div className="addmissioncell_enquiry_filter_field">

    <select
      className="addmissioncell_enquiry_filter_select"
      name="departmentId"
      value={filters.departmentId}
      onChange={(e) => {

        handleFilterChange(e);

        setFilters((prev) => ({

          ...prev,

          page: 1,

          departmentId: e.target.value,

          programmeId: "",

        }));

        if (e.target.value) {

          fetchProgrammes(e.target.value);

        } else {

          setProgrammes([]);

        }

      }}
    >

      <option value="">
        All Departments
      </option>

      {

        departments.map((department) => (

          <option
            key={department._id}
            value={department._id}
          >

            {department.departmentName}

          </option>

        ))

      }

    </select>

  </div>

  {/* PROGRAMME */}

  <div className="addmissioncell_enquiry_filter_field">

    <select
      className="addmissioncell_enquiry_filter_select"
      name="programmeId"
      value={filters.programmeId}
      onChange={handleFilterChange}
      disabled={!filters.departmentId}
    >

      <option value="">
        All Programmes
      </option>

      {

        programmes.map((programme) => (

          <option
            key={programme._id}
            value={programme._id}
          >

            {programme.programmeName}

          </option>

        ))

      }

    </select>

  </div>

</div>

      {/* TABLE */}

{/* ===========================================================
                        TABLE SECTION
=========================================================== */}

<div className="addmissioncell_enquiry_table_wrapper">

  <table className="addmissioncell_enquiry_table">

    {/* ================= TABLE HEADER ================= */}

    <thead className="addmissioncell_enquiry_table_header">

      <tr>

        <th>

          <h4 className="addmissioncell_enquiry_table_heading">
            #
          </h4>

        </th>

        <th>

          <h4 className="addmissioncell_enquiry_table_heading">
            Student
          </h4>

        </th>

        <th>

          <h4 className="addmissioncell_enquiry_table_heading">
            Mobile
          </h4>

        </th>

        <th>

          <h4 className="addmissioncell_enquiry_table_heading">
            Programme
          </h4>

        </th>

        <th>

          <h4 className="addmissioncell_enquiry_table_heading">
            Source
          </h4>

        </th>

        <th>

          <h4 className="addmissioncell_enquiry_table_heading">
            Status
          </h4>

        </th>

        <th>

          <h4 className="addmissioncell_enquiry_table_heading">
            Actions
          </h4>

        </th>

      </tr>

    </thead>

    {/* ================= TABLE BODY ================= */}

    <tbody className="addmissioncell_enquiry_table_body">

      {

        loading ? (

          <tr>

            <td
              colSpan="7"
              className="addmissioncell_enquiry_no_data"
            >

              Loading...

            </td>

          </tr>

        ) : enquiries.length === 0 ? (

          <tr>

            <td
              colSpan="7"
              className="addmissioncell_enquiry_no_data"
            >

              No Enquiries Found

            </td>

          </tr>

        ) : (

          enquiries.map((enquiry, index) => (

            <tr

              key={enquiry._id}

              className="addmissioncell_enquiry_table_row"

              onClick={() =>

                navigate(

                  `/admission-cell/enquiry/${enquiry._id}`

                )

              }

            >

              {/* S.NO */}

              <td>

                <h4 className="addmissioncell_enquiry_table_data">

                  {

                    ((pagination.currentPage - 1) * filters.limit) +

                    index +

                    1

                  }

                </h4>

              </td>

              {/* STUDENT */}

              <td>

                <h4 className="addmissioncell_enquiry_table_data">

                  {enquiry.studentName}

                </h4>

              </td>

              {/* MOBILE */}

              <td>

                <h4 className="addmissioncell_enquiry_table_data">

                  {enquiry.studentMobile}

                </h4>

              </td>

              {/* PROGRAMME */}

              <td>

                <h4 className="addmissioncell_enquiry_table_data">

                  {enquiry.programmeId?.programmeName}

                </h4>

              </td>

              {/* SOURCE */}

              <td>

                <h4 className="addmissioncell_enquiry_table_data">

                  {enquiry.enquirySource}

                </h4>

              </td>

              {/* STATUS */}

              <td>

                <span

                  className={`addmissioncell_enquiry_status_badge ${

                    enquiry.status

                      .toLowerCase()

                      .replace(/\s+/g, "-")

                  }`}

                >

                  {enquiry.status}

                </span>

              </td>

              {/* ACTIONS */}

              <td>

                <div className="addmissioncell_enquiry_action_wrapper">

                  <button

                    className="addmissioncell_enquiry_action_btn"

                    disabled={

                      enquiry.status === "Converted"

                    }

                    onClick={(e) => {

                      e.stopPropagation();

                      if (

                        enquiry.status === "Converted"

                      ) return;

                      handleEdit(enquiry);

                    }}

                  >

                    Edit

                  </button>

                  <button

                    className="addmissioncell_enquiry_action_btn"

                    disabled={

                      enquiry.status === "Converted"

                    }

                    onClick={(e) => {

                      e.stopPropagation();

                      if (

                        enquiry.status === "Converted"

                      ) return;

                      handleDelete(enquiry._id);

                    }}

                  >

                    Delete

                  </button>

                  <button

                    className="addmissioncell_enquiry_action_btn"

                    disabled={

                      enquiry.status === "Converted"

                    }

                    onClick={(e) => {

                      e.stopPropagation();

                      if (

                        enquiry.status === "Converted"

                      ) return;

                      handleConvert(enquiry._id);

                    }}

                  >

                    Convert

                  </button>

                </div>

              </td>

            </tr>

          ))

        )

      }

    </tbody>

  </table>

</div>

      {/* PAGINATION */}
{/* ===========================================================
                        PAGINATION
=========================================================== */}

<div className="addmissioncell_enquiry_pagination_wrapper">

  <button
    className="addmissioncell_enquiry_pagination_btn"
    onClick={previousPage}
    disabled={pagination.currentPage === 1}
  >

    Previous

  </button>

  <div className="addmissioncell_enquiry_pagination_info">

    <span>

      Page

    </span>

    <strong>

      {pagination.currentPage}

    </strong>

    <span>

      of

    </span>

    <strong>

      {pagination.totalPages}

    </strong>

  </div>

  <button
    className="addmissioncell_enquiry_pagination_btn"
    onClick={nextPage}
    disabled={
      pagination.currentPage ===
      pagination.totalPages
    }
  >

    Next

  </button>

</div>

    </div>

  );

};

export default Enquiry;