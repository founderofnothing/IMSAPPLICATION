import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api/axios";

const BusInfo = () => {

  const navigate = useNavigate();

  /* ===============================
      STATES
  =============================== */

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });


  /* ===============================
    CREATE BUS
=============================== */

const [showForm, setShowForm] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [selectedId, setSelectedId] = useState(null);

const [drivers, setDrivers] = useState([]);

const [formData, setFormData] = useState({
  busNumber: "",
  registrationNumber: "",
  busName: "",
  vehicleType: "College Bus",
  totalSeats: "",
  manufacturer: "",
  model: "",
  manufacturingYear: "",
  chassisNumber: "",
  fuelType: "Diesel",
  insuranceExpiryDate: "",
  fitnessCertificateExpiryDate: "",
  permitExpiryDate: "",
  pollutionCertificateExpiryDate: "",
  driverId: "",
  status: "Active",
  remarks: "",
});
  /* ===============================
      FETCH BUS
  =============================== */

  const fetchBus = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "/transport/bus",
        { params: filters }
      );

      setBuses(response.data.data);

      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalRecords: response.data.totalRecords,
      });

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch buses."
      );

    } finally {

      setLoading(false);

    }

  };

/* ===============================
    FETCH DRIVERS
=============================== */

const fetchDrivers = async () => {

  try {

    const response = await API.get(
      "/transport/bus-driver",
      {
        params: {
          status: "Active",
          limit: 1000,
        },
      }
    );

    setDrivers(response.data.data);

  } catch (error) {

    toast.error(
      "Failed to load drivers."
    );

  }

};




useEffect(() => {
  fetchBus();
}, [filters]);

useEffect(() => {
  fetchDrivers();
}, []);



  /* ===============================
      HANDLERS
  =============================== */

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      page: 1,
      [e.target.name]: e.target.value,
    }));
  };

  const nextPage = () => {
    if (filters.page < pagination.totalPages) {
      setFilters(prev => ({
        ...prev,
        page: prev.page + 1,
      }));
    }
  };

  const previousPage = () => {
    if (filters.page > 1) {
      setFilters(prev => ({
        ...prev,
        page: prev.page - 1,
      }));
    }
  };


  const handleInputChange = (e) => {

  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));

};

const resetForm = () => {

  setFormData({
    busNumber: "",
    registrationNumber: "",
    busName: "",
    vehicleType: "College Bus",
    totalSeats: "",
    manufacturer: "",
    model: "",
    manufacturingYear: "",
    chassisNumber: "",
    fuelType: "Diesel",
    insuranceExpiryDate: "",
    fitnessCertificateExpiryDate: "",
    permitExpiryDate: "",
    pollutionCertificateExpiryDate: "",
    driverId: "",
    status: "Active",
    remarks: "",
  });

  setSelectedId(null);
  setIsEdit(false);

};


/* ===============================
    EDIT BUS
=============================== */

const handleEdit = (bus) => {

  setFormData({

    busNumber: bus.busNumber || "",

    registrationNumber: bus.registrationNumber || "",

    busName: bus.busName || "",

    vehicleType: bus.vehicleType || "College Bus",

    totalSeats: bus.totalSeats || "",

    manufacturer: bus.manufacturer || "",

    model: bus.model || "",

    manufacturingYear: bus.manufacturingYear || "",

    chassisNumber: bus.chassisNumber || "",

    fuelType: bus.fuelType || "Diesel",

    insuranceExpiryDate:
      bus.insuranceExpiryDate
        ? bus.insuranceExpiryDate.split("T")[0]
        : "",

    fitnessCertificateExpiryDate:
      bus.fitnessCertificateExpiryDate
        ? bus.fitnessCertificateExpiryDate.split("T")[0]
        : "",

    permitExpiryDate:
      bus.permitExpiryDate
        ? bus.permitExpiryDate.split("T")[0]
        : "",

    pollutionCertificateExpiryDate:
      bus.pollutionCertificateExpiryDate
        ? bus.pollutionCertificateExpiryDate.split("T")[0]
        : "",

    driverId:
      bus.driverId?._id || "",

    status:
      bus.status || "Active",

    remarks:
      bus.remarks || "",

  });

  setSelectedId(bus._id);

  setIsEdit(true);

  setShowForm(true);

};

/* ===============================
    CREATE BUS
=============================== */

const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    if (isEdit) {

      await API.put(
        `/transport/bus/${selectedId}`,
        formData
      );

      toast.success(
        "Bus updated successfully."
      );

    } else {

      await API.post(
        "/transport/bus",
        formData
      );

      toast.success(
        "Bus created successfully."
      );

    }

    setShowForm(false);

    resetForm();

    fetchBus();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to save bus."
    );

  }

};

/* ===============================
    DELETE BUS
=============================== */

const handleDelete = async (id) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to move this bus to the recycle bin?"
  );

  if (!confirmDelete) return;

  try {

    await API.delete(
      `/transport/bus/${id}`
    );

    toast.success(
      "Bus moved to recycle bin successfully."
    );

    fetchBus();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to delete bus."
    );

  }

};

  return (

  <div className="bus_container">
    <div className="bin">
      <NavLink to="/hr/BusInfo/bin">
bin
      </NavLink>
    </div>

  {/* ===============================
      HEADER
  =============================== */}

  <div className="page_header">
    <h2>Bus Management</h2>

  <button
  className="primary_btn"
  onClick={() => {
    resetForm();
    setShowForm(true);
  }}
>
  + Add Bus
</button>
  </div>

  {/* ===============================
      FILTERS
  =============================== */}

  <div className="filter_wrapper">

    <input
      type="text"
      name="search"
      placeholder="Search Bus / Registration / Chassis / Route"
      value={filters.search}
      onChange={handleFilterChange}
    />

    <select
      name="status"
      value={filters.status}
      onChange={handleFilterChange}
    >
      <option value="">All Status</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
      <option value="Maintenance">Maintenance</option>
    </select>

  </div>

  {/* ===============================
      TABLE
  =============================== */}

  <div className="table_wrapper">

    <table className="user_table">

      <thead>

        <tr>
          <th>#</th>
          <th>Bus No</th>
          <th>Registration</th>
          <th>Bus Name</th>
          <th>Driver</th>
          <th>Route</th>
          <th>Seats</th>
          <th>Status</th>
          <th>Action</th>
        </tr>

      </thead>

      <tbody>

        {

          loading ?

          (

            <tr>
              <td colSpan="9" className="no_data">
                Loading...
              </td>
            </tr>

          )

          :

          buses.length === 0 ?

          (

            <tr>
              <td colSpan="9" className="no_data">
                No Bus Records Found
              </td>
            </tr>

          )

          :

          buses.map((item, index) => (

            <tr
              key={item._id}
              className="clickable_row"
              onClick={() =>
                navigate(`/hr/BusInfo/profile/${item._id}`)
              }
            >

              <td>
                {((pagination.currentPage - 1) * filters.limit) + index + 1}
              </td>

              <td>{item.busNumber}</td>

              <td>{item.registrationNumber}</td>

              <td>{item.busName}</td>

           <td>{item.driverId?.driverName || "-"}</td>

              <td>
                {item.route?.routeName || "-"}
              </td>

              <td>{item.totalSeats}</td>

              <td>{item.status}</td>

              <td>

             <button
  onClick={(e) => {
    e.stopPropagation();
    handleEdit(item);
  }}
>
  Edit
</button>

             <button
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(item._id);
  }}
>
  Delete
</button>

              </td>

            </tr>

          ))

        }

      </tbody>

    </table>

  </div>




  {
showForm && (

<div className="modal_overlay">

<form
className="form_container"
onSubmit={handleSubmit}
>

<h2>

{isEdit ? "Update Bus" : "Create Bus"}

</h2>

<div className="form_grid">

<div>

<label>Bus Number</label>

<input
type="text"
name="busNumber"
value={formData.busNumber}
onChange={handleInputChange}
required
/>

</div>

<div>

<label>Registration Number</label>

<input
type="text"
name="registrationNumber"
value={formData.registrationNumber}
onChange={handleInputChange}
required
/>

</div>

<div>

<label>Bus Name</label>

<input
type="text"
name="busName"
value={formData.busName}
onChange={handleInputChange}
required
/>

</div>

<div>

<label>Vehicle Type</label>

<select
name="vehicleType"
value={formData.vehicleType}
onChange={handleInputChange}
>

<option>College Bus</option>
<option>Mini Bus</option>
<option>School Bus</option>
<option>Van</option>
<option>Other</option>

</select>

</div>

<div>

<label>Total Seats</label>

<input
type="number"
name="totalSeats"
value={formData.totalSeats}
onChange={handleInputChange}
required
/>

</div>

<div>

<label>Manufacturer</label>

<input
type="text"
name="manufacturer"
value={formData.manufacturer}
onChange={handleInputChange}
/>

</div>

<div>

<label>Model</label>

<input
type="text"
name="model"
value={formData.model}
onChange={handleInputChange}
/>

</div>

<div>

<label>Manufacturing Year</label>

<input
type="number"
name="manufacturingYear"
value={formData.manufacturingYear}
onChange={handleInputChange}
/>

</div>
<div>

  <label>Chassis Number</label>

  <input
    type="text"
    name="chassisNumber"
    value={formData.chassisNumber}
    onChange={handleInputChange}
  />

</div>

<div>

  <label>Fuel Type</label>

  <select
    name="fuelType"
    value={formData.fuelType}
    onChange={handleInputChange}
  >
    <option>Diesel</option>
    <option>Petrol</option>
    <option>CNG</option>
    <option>Electric</option>
  </select>

</div>

<div>

  <label>Insurance Expiry</label>

  <input
    type="date"
    name="insuranceExpiryDate"
    value={formData.insuranceExpiryDate}
    onChange={handleInputChange}
  />

</div>

<div>

  <label>Fitness Certificate Expiry</label>

  <input
    type="date"
    name="fitnessCertificateExpiryDate"
    value={formData.fitnessCertificateExpiryDate}
    onChange={handleInputChange}
  />

</div>

<div>

  <label>Permit Expiry</label>

  <input
    type="date"
    name="permitExpiryDate"
    value={formData.permitExpiryDate}
    onChange={handleInputChange}
  />

</div>

<div>

  <label>Pollution Certificate Expiry</label>

  <input
    type="date"
    name="pollutionCertificateExpiryDate"
    value={formData.pollutionCertificateExpiryDate}
    onChange={handleInputChange}
  />

</div>

<div>

  <label>Assign Driver</label>

  <select
    name="driverId"
    value={formData.driverId}
    onChange={handleInputChange}
  >

    <option value="">
      Select Driver
    </option>

    {

      drivers.map(driver => (

        <option
          key={driver._id}
          value={driver._id}
        >

          {driver.employeeId} - {driver.driverName}

        </option>

      ))

    }

  </select>

</div>

<div>

  <label>Status</label>

  <select
    name="status"
    value={formData.status}
    onChange={handleInputChange}
  >
    <option>Active</option>
    <option>Inactive</option>
    <option>Maintenance</option>
  </select>

</div>

<div className="full_width">

  <label>Remarks</label>

  <textarea
    rows="4"
    name="remarks"
    value={formData.remarks}
    onChange={handleInputChange}
  />

</div>

</div>

<div className="form_actions">

  <button
    type="button"
    onClick={() => {
      setShowForm(false);
      resetForm();
    }}
  >
    Cancel
  </button>

  <button type="submit">

    {isEdit ? "Update Bus" : "Create Bus"}

  </button>

</div>

</form>

</div>

)
}

  {/* ===============================
      PAGINATION
  =============================== */}

  <div className="pagination_wrapper">

    <div className="record_info">
      Showing <strong>{buses.length}</strong> of <strong>{pagination.totalRecords}</strong> Records
    </div>

    <div>

      <button
        onClick={previousPage}
        disabled={filters.page === 1}
      >
        Previous
      </button>

      <span>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>

      <button
        onClick={nextPage}
        disabled={
          filters.page === pagination.totalPages ||
          pagination.totalPages === 0
        }
      >
        Next
      </button>

    </div>

  </div>

</div>

  );

};

export default BusInfo;