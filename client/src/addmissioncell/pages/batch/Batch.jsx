import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../api/axios.js";
import { NavLink } from "react-router-dom";
import { FadersHorizontalIcon ,GenderMaleIcon ,GenderFemaleIcon ,UserPlusIcon ,PencilSimpleLineIcon ,TrashSimpleIcon,XIcon } from "@phosphor-icons/react";

import "./batch.css"
const Batch = () => {

  /* ===============================
      STATES
  =============================== */

  const [batches, setBatches] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [showForm, setShowForm] =
    useState(false);

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
  });

const [formData, setFormData] =
  useState({
    batchName: "",
    admissionYear: "",
    graduationYear: "",
    currentYear: 1,
    status: "Active",
    remarks: "",
  });

    const [statistics, setStatistics] =
  useState({
    totalBatches: 0,
    activeBatches: 0,
    completedBatches: 0,
  });

  /* ===============================
      FETCH BATCHES
  =============================== */

 const fetchBatches = async () => {
  try {
    setLoading(true);

    const response = await API.get(
      "/batch/getall",
      {
        params: filters,
      }
    );
    setStatistics(
  response.data.statistics
);

    setBatches(
      response.data.data
    );

    setPagination(
      response.data.pagination
    );
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
        "Failed to fetch batches."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {

    fetchBatches();

  }, [filters]);

  /* ===============================
      FILTERS
  =============================== */

  const handleFilterChange =
    (e) => {

      setFilters((prev) => ({

        ...prev,

        page: 1,

        [e.target.name]:
          e.target.value,

      }));

    };

  /* ===============================
      FORM INPUTS
  =============================== */

  const handleInputChange =
    (e) => {

      setFormData((prev) => ({

        ...prev,

        [e.target.name]:
          e.target.value,

      }));

    };

  /* ===============================
      PAGINATION
  =============================== */

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

  /* ===============================
      CRUD PLACEHOLDERS
  =============================== */
const resetForm = () => {

setFormData({
  batchName: "",
  admissionYear: "",
  graduationYear: "",
  currentYear: 1,
  remarks: "",
});

  setEditingId(null);

  setShowForm(false);

};



const handleCreate = async () => {

  try {

    await API.post(
      "/batch/create",
      formData
    );

    toast.success(
      "Batch created successfully."
    );

    resetForm();

    fetchBatches();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to create batch."
    );

  }

};


const handleEdit = (batch) => {

  setEditingId(
    batch._id
  );

setFormData({

  batchName: batch.batchName,

  admissionYear: batch.admissionYear,

  graduationYear: batch.graduationYear,

  currentYear: batch.currentYear,

  status: batch.status,

  remarks: batch.remarks || "",

});

  setShowForm(
    true
  );

};
const handleUpdate =
  async () => {

    try {

      await API.put(

        `/batch/update/${editingId}`,

        formData

      );

      toast.success(
        "Batch updated successfully."
      );

      resetForm();

      fetchBatches();

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to update batch."

      );

    }

};

const handleDelete = async (id) => {

  const confirmDelete =
    window.confirm(
      "Move this batch to the recycle bin?"
    );

  if (!confirmDelete) {
    return;
  }

  try {

    await API.delete(
      `/batch/delete/${id}`
    );

    toast.success(
      "Batch moved to recycle bin successfully."
    );

    fetchBatches();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to delete batch."
    );

  }

};

  /* ===============================
      JSX
  =============================== */

  return (

    <div className="addmissioncell_batch_container">

      {/* HEADER */}
<NavLink to="/admission-cell/batchbin">
    <h3>batch bin</h3>
</NavLink>
      <div className="addmissioncell_page_header">


<div className="addmissioncell_lhs_wrapper">
<h2 className="addmissioncell_page_title">
Batch Management
</h2>



<div
  className="create_user_btn"
  onClick={() =>
    setShowForm(!showForm)
  }
>
  {/* <UserPlusIcon className="user_crt_icon" /> */}

  <h4 className="user_crt_title">
    {
      showForm
        ? "Close"
        : "Add Batch"
    }
  </h4>

</div>

</div>


       


<div className="addmissioncell_statistics_wrapper">

  {/* Total Batch */}

  <div className="addmissioncell_stat_cardone">

    <div className="addmissioncell_cardheader_wrapper">

      <h5 className="addmissioncell_stc_card_title_field">
        Total Batches
      </h5>

      <FadersHorizontalIcon className="addmissioncell_card_header_icons" />

    </div>

    <div className="addmissioncell_card_body_wrapper">

      <span className="addmissioncell_stccard_sepration">
        _
      </span>

      <h2 className="addmissioncell_stc_data_display">
        {statistics.totalBatches || 0}
      </h2>

    </div>

  </div>

  {/* Active Batch */}

  <div className="addmissioncell_stat_cardtwo">

    <div className="addmissioncell_cardheader_wrapper">

      <h5 className="addmissioncell_stc_card_title_field">
        Active Batches
      </h5>

      <FadersHorizontalIcon className="addmissioncell_card_header_icons" />

    </div>

    <div className="addmissioncell_card_body_wrapper">

      <span className="addmissioncell_stccard_sepration">
        _
      </span>

      <h2 className="addmissioncell_stc_data_display">
        {statistics.activeBatches || 0}
      </h2>

    </div>

  </div>

  {/* Completed Batch */}

  <div className="addmissioncell_stat_cardthree">

    <div className="addmissioncell_cardheader_wrapper">

      <h5 className="addmissioncell_stc_card_title_field">
        Completed Batches
      </h5>

      <FadersHorizontalIcon className="addmissioncell_card_header_icons" />

    </div>

    <div className="addmissioncell_card_body_wrapper">

      <span className="addmissioncell_stccard_sepration">
        _
      </span>

      <h2 className="addmissioncell_stc_data_display">
        {statistics.completedBatches || 0}
      </h2>

    </div>

  </div>

</div>
      </div>

      {/* FORM */}

{
  showForm && (

    <div
      className="addmissioncell_popup_overlay"
      onClick={() => {

        setShowForm(false);

        resetForm();

      }}
    >

      <div
        className="addmissioncell_form_wrapper"
        onClick={(e)=>
          e.stopPropagation()
        }
      >

      <div className="form_header">

        <h3 className="form_title">
          {
            editingId
              ? "Update Batch"
              : "Create Batch"
          }
        </h3>

        <XIcon
          className="form_close_icon"
          onClick={() => {

            setShowForm(false);

            resetForm();

          }}
        />

      </div>

      <input
        type="text"
        name="batchName"
        placeholder="Batch Name"
        value={formData.batchName}
        onChange={handleInputChange}
      />

      <input
        type="number"
        name="admissionYear"
        placeholder="Admission Year"
        value={formData.admissionYear}
        onChange={handleInputChange}
      />

      <input
        type="number"
        name="graduationYear"
        placeholder="Graduation Year"
        value={formData.graduationYear}
        onChange={handleInputChange}
      />

      <select
        name="currentYear"
        value={formData.currentYear}
        onChange={handleInputChange}
      >

        <option value={1}>
          1st Year
        </option>

        <option value={2}>
          2nd Year
        </option>

        <option value={3}>
          3rd Year
        </option>

        <option value={4}>
          4th Year
        </option>

      </select>

      <select
        name="status"
        value={formData.status}
        onChange={handleInputChange}
      >

        <option value="Active">
          Active
        </option>

        <option value="Completed">
          Completed
        </option>

      </select>

      <textarea
        name="remarks"
        placeholder="Remarks"
        value={formData.remarks}
        onChange={handleInputChange}
      />

      <button
        onClick={
          editingId
            ? handleUpdate
            : handleCreate
        }
      >
        {
          editingId
            ? "Update Batch"
            : "Create Batch"
        }
      </button>

      </div>

    </div>

  )
}













      {/* FILTERS */}

<div className="filter_section">

  <input
    className="serchbar_field"
    type="text"
    name="search"
    placeholder="Search Batch"
    value={filters.search}
    onChange={handleFilterChange}
  />

  <select
    className="dropdown_filter"
    name="currentYear"
    value={filters.currentYear}
    onChange={handleFilterChange}
  >

    <option value="">
      All Years
    </option>

    <option value="1">
      1st Year
    </option>

    <option value="2">
      2nd Year
    </option>

    <option value="3">
      3rd Year
    </option>

    <option value="4">
      4th Year
    </option>

  </select>

  <select
    className="dropdown_filter"
    name="status"
    value={filters.status}
    onChange={handleFilterChange}
  >

    <option value="">
      All Status
    </option>

    <option value="Active">
      Active
    </option>

    <option value="Completed">
      Completed
    </option>

  </select>

</div>

      {/* TABLE */}

      <div className="addmissioncell_table_wrapper">



<table className="table_container">

  <thead className="table_header">

    <tr>

      <th><h4 className="hr_table_title_one">S.No</h4></th>

      <th><h4 className="hr_table_title_two">Batch Name</h4></th>

      <th><h4 className="hr_table_title_three">Academic Period</h4></th>

      <th><h4 className="hr_table_title_four">Current Year</h4></th>

      <th><h4 className="hr_table_title_five">Status</h4></th>

      <th><h4 className="hr_table_title_six">Remarks</h4></th>

      <th><h4 className="hr_table_title_seven">Action</h4></th>

    </tr>

  </thead>

  <tbody className="table_body">

    {
      loading ? (

        <tr>

          <td
            colSpan="7"
            className="no_data"
          >
            Loading...
          </td>

        </tr>

      ) : batches.length === 0 ? (

        <tr>

          <td
            colSpan="7"
            className="no_data"
          >
            No Batches Found
          </td>

        </tr>

      ) : (

        batches.map((item,index)=>(

          <tr
            key={item._id}
            className="clickable_row"
          >

            <td>
              {
                ((pagination.currentPage - 1) * filters.limit) +
                index +
                1
              }
            </td>

            <td>
              <h4 className="hr_table_data_one">
                {item.batchName}
              </h4>
            </td>

            <td>
              <h4 className="hr_table_data_two">
                {item.admissionYear} - {item.graduationYear}
              </h4>
            </td>

            <td>
              <h4 className="hr_table_data_three">
                {item.currentYear} Year
              </h4>
            </td>

            <td>
              <h4 className="hr_table_data_four">
                {item.status}
              </h4>
            </td>

            <td>
              <h4 className="hr_table_data_five">
                {item.remarks || "N/A"}
              </h4>
            </td>

            <td>

              <div className="action_cta_wrapper">

                <div
                  onClick={()=>
                    handleEdit(item)
                  }
                >
                  <PencilSimpleLineIcon />
                </div>

                <div
                  onClick={()=>
                    handleDelete(item._id)
                  }
                >
                  <TrashSimpleIcon />
                </div>

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

      <div className="addmissioncell_pagination_wrapper">

        <button
          onClick={
            previousPage
          }
        >

          Previous

        </button>

        <span>

          Page
          {
            pagination.currentPage
          }

          of

          {
            pagination.totalPages
          }

        </span>

        <button
          onClick={
            nextPage
          }
        >

          Next

        </button>

      </div>

    </div>

  );

};

export default Batch;