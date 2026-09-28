import {
  useEffect,
  useState,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import API, {
  SERVER_URL,
} from "../../../api/axios";

const BusDriver = () => {

  const navigate =
    useNavigate();

  /* ===============================
      STATES
  =============================== */

  const [drivers, setDrivers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [statistics,
    setStatistics] =
    useState({

      totalDrivers: 0,

      activeDrivers: 0,

      inactiveDrivers: 0,

      onLeaveDrivers: 0,

      resignedDrivers: 0,

    });

  const [pagination,
    setPagination] =
    useState({

      currentPage: 1,

      totalPages: 1,

      totalRecords: 0,

    });

  const [filters,
    setFilters] =
    useState({

      page: 1,

      limit: 10,

      search: "",

      bloodGroup: "",

      gender: "",

      status: "",

      licenceType: "",

    });


    /* ===============================
   CREATE STATES
=============================== */

const initialFormData = {
  employeeId: "",
  driverName: "",
  profileImage: "",
  mobileNumber: "",
  alternateMobileNumber: "",
  email: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  licenceNumber: "",
  licenceIssueDate: "",
  licenceExpiryDate: "",
  licenceType: "",
  joiningDate: "",
  experienceInYears: "",
  salary: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  status: "Active",
  remarks: "",

  communicationAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
  },

  permanentAddress: {
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
  },
};

const [isModalOpen, setIsModalOpen] = useState(false);
const [mode, setMode] = useState("create");
const [selectedDriver, setSelectedDriver] = useState(null);

const [formData, setFormData] = useState(initialFormData);

const [profileImage, setProfileImage] = useState(null);
const [previewImage, setPreviewImage] = useState(null);
  /* ===============================
      API
  =============================== */

  const fetchDrivers =
    async () => {

      try {

        setLoading(true);

        const response =
          await API.get(
            "/transport/bus-driver",
            {
              params: filters,
            }
          );

        setDrivers(
          response.data.data
        );

        setStatistics(
          response.data.statistics
        );

        setPagination(
          response.data.pagination
        );

      } catch (error) {

        toast.error(

          error.response?.data?.message ||

          "Failed to fetch drivers."

        );

      } finally {

        setLoading(false);

      }

    };

const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    setLoading(true);

    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {

      if (
        key === "communicationAddress" ||
        key === "permanentAddress"
      ) {

        submitData.append(key, JSON.stringify(value));

      } else {

        submitData.append(key, value);

      }

    });

    if (profileImage) {
      submitData.append("profileImage", profileImage);
    }

 const response =
  mode === "create"

    ? await API.post(
        "/transport/bus-driver",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

    : await API.put(
        `/transport/bus-driver/${selectedDriver._id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

    toast.success(response.data.message);

    closeModal();
    fetchDrivers();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to create driver."
    );

  } finally {

    setLoading(false);

  }

};


  /* ===============================
      USE EFFECT
  =============================== */

  useEffect(() => {

    fetchDrivers();

  }, [filters]);

  /* ===============================
      HANDLERS
  =============================== */
const handleChange = ({ target: { name, value } }) => {
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleAddressChange = (type, { target: { name, value } }) => {
  setFormData((prev) => ({
    ...prev,
    [type]: {
      ...prev[type],
      [name]: value,
    },
  }));
};

const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  setProfileImage(file);
  setPreviewImage(URL.createObjectURL(file));
};

const resetForm = () => {

  setFormData(initialFormData);

  setProfileImage(null);

  setPreviewImage(null);

  setSelectedDriver(null);

  setMode("create");

};

const openCreateModal = () => {
  resetForm();
  setMode("create");
  setIsModalOpen(true);
};

const closeModal = () => {
  setIsModalOpen(false);
  resetForm();
};


const openEditModal = async (driver) => {

  try {

    setMode("edit");
    setSelectedDriver(driver);

    const response = await API.get(
      `/transport/bus-driver/${driver._id}`
    );

    const data = response.data.data;

    setFormData({

      employeeId: data.employeeId || "",
      driverName: data.driverName || "",

      mobileNumber: data.mobileNumber || "",
      alternateMobileNumber: data.alternateMobileNumber || "",

      email: data.email || "",

      dateOfBirth:
        data.dateOfBirth?.substring(0,10) || "",

      gender: data.gender || "",

      bloodGroup: data.bloodGroup || "",

      licenceNumber: data.licenceNumber || "",

      licenceIssueDate:
        data.licenceIssueDate?.substring(0,10) || "",

      licenceExpiryDate:
        data.licenceExpiryDate?.substring(0,10) || "",

      licenceType: data.licenceType || "",

      joiningDate:
        data.joiningDate?.substring(0,10) || "",

      experienceInYears:
        data.experienceInYears || "",

      salary: data.salary || "",

      emergencyContactName:
        data.emergencyContactName || "",

      emergencyContactNumber:
        data.emergencyContactNumber || "",

      status: data.status || "Active",

      remarks: data.remarks || "",

      communicationAddress:
        data.communicationAddress || {
          addressLine1:"",
          addressLine2:"",
          city:"",
          district:"",
          state:"",
          pincode:"",
        },

      permanentAddress:
        data.permanentAddress || {
          addressLine1:"",
          addressLine2:"",
          city:"",
          district:"",
          state:"",
          pincode:"",
        },

    });

    setPreviewImage(
      data.profileImage || null
    );

    setProfileImage(null);

    setIsModalOpen(true);

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to fetch driver."

    );

  }

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

  const goToNextPage =
    () => {

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

const handleDelete = async (driverId) => {

  const confirmDelete = window.confirm(
    "Move this driver to the recycle bin?"
  );

  if (!confirmDelete) return;

  try {

    const response = await API.delete(
      `/transport/bus-driver/${driverId}`
    );

    toast.success(response.data.message);

    fetchDrivers();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to delete driver."
    );

  }

};



  const goToPreviousPage =
    () => {

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




  return (
   <div className="driver_container">

      {/* ===============================
          HEADER
      =============================== */}

   <NavLink to="/hr/BusDriver/bin">
  <h2>Bus Driver Bin</h2>
</NavLink>

      <div className="page_header">

        <h2>

          Bus Drivers

        </h2>

     <button onClick={openCreateModal}>
  + Add Driver
</button>

      </div>

      {/* ===============================
          STATISTICS
      =============================== */}

      <div className="stats_wrapper">

        <div className="stat_card">

          <h3>

            {statistics.totalDrivers}

          </h3>

          <p>

            Total Drivers

          </p>

        </div>

        <div className="stat_card">

          <h3>

            {statistics.activeDrivers}

          </h3>

          <p>

            Active

          </p>

        </div>

        <div className="stat_card">

          <h3>

            {statistics.inactiveDrivers}

          </h3>

          <p>

            Inactive

          </p>

        </div>

        <div className="stat_card">

          <h3>

            {statistics.onLeaveDrivers}

          </h3>

          <p>

            On Leave

          </p>

        </div>

        <div className="stat_card">

          <h3>

            {statistics.resignedDrivers}

          </h3>

          <p>

            Resigned

          </p>

        </div>

      </div>

      {/* ===============================
          FILTERS
      =============================== */}

      <div className="filter_wrapper">

        <input

          type="text"

          name="search"

          placeholder="Search Employee ID / Driver / Email"

          value={filters.search}

          onChange={handleFilterChange}

        />

        <select

          name="bloodGroup"

          value={filters.bloodGroup}

          onChange={handleFilterChange}

        >

          <option value="">

            Blood Group

          </option>

          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>AB+</option>
          <option>AB-</option>
          <option>O+</option>
          <option>O-</option>

        </select>

        <select

          name="gender"

          value={filters.gender}

          onChange={handleFilterChange}

        >

          <option value="">

            Gender

          </option>

          <option>

            Male

          </option>

          <option>

            Female

          </option>

          <option>

            Other

          </option>

        </select>

        <select

          name="status"

          value={filters.status}

          onChange={handleFilterChange}

        >

          <option value="">

            Status

          </option>

          <option>

            Active

          </option>

          <option>

            Inactive

          </option>

          <option>

            On Leave

          </option>

          <option>

            Resigned

          </option>

        </select>

        <select

          name="licenceType"

          value={filters.licenceType}

          onChange={handleFilterChange}

        >

          <option value="">

            Licence Type

          </option>

          <option>

            LMV

          </option>

          <option>

            HMV

          </option>

          <option>

            Transport

          </option>

          <option>

            Heavy Vehicle

          </option>

        </select>

      </div>

      {/* ===============================
          TABLE
      =============================== */}

      <div className="table_wrapper">
 <table className="user_table">

  <thead>

    <tr>

      <th>

        <input type="checkbox" />

      </th>

      <th>#</th>

      <th>Employee ID</th>

      <th>Profile</th>

      <th>Driver Name</th>

      <th>Mobile</th>

      <th>Licence No</th>

      <th>Licence Type</th>

      <th>Gender</th>

      <th>Status</th>

      <th>Action</th>

    </tr>

  </thead>

  <tbody>

    {

      loading ?

      (

        <tr>

          <td
            colSpan="11"
            className="no_data"
          >

            Loading...

          </td>

        </tr>

      )

      :

      drivers.length===0 ?

      (

        <tr>

          <td
            colSpan="11"
            className="no_data"
          >

            No Drivers Found

          </td>

        </tr>

      )

      :

      drivers.map((item,index)=>(

        <tr

          key={item._id}

          className="clickable_row"

          onClick={()=>{

            navigate(

              `/hr/BusDriver/profile/${item._id}`

            );

          }}

        >

          <td>

            <input

              type="checkbox"

              onClick={(e)=>

                e.stopPropagation()

              }

            />

          </td>

          <td>

            {

              ((pagination.currentPage-1)

              *filters.limit)

              +

              index

              +

              1

            }

          </td>

          <td>

            {item.employeeId}

          </td>

          <td>

            {

              item.profileImage ?

              (

                <img

                  src={`${SERVER_URL}${item.profileImage}`}

                  alt={item.driverName}

                  className="table_profile"

                />

              )

              :

              (

                <div className="table_avatar">

                  {

                    item.driverName

                    ?.charAt(0)

                    ?.toUpperCase()

                  }

                </div>

              )

            }

          </td>

          <td>

            {item.driverName}

          </td>

          <td>

            {item.mobileNumber}

          </td>

          <td>

            {item.licenceNumber}

          </td>

          <td>

            {item.licenceType}

          </td>

          <td>

            {item.gender}

          </td>

          <td>

            {item.status}

          </td>

          <td>

         <button
  onClick={(e) => {
    e.stopPropagation();
    openEditModal(item);
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

{isModalOpen && (
  <div className="drawer_overlay" onClick={closeModal}>
    <div className="user_drawer" onClick={(e) => e.stopPropagation()}>

      <div className="drawer_header">
<h2>
  {mode === "create"
    ? "Create Bus Driver"
    : "Update Bus Driver"}
</h2>
        <button onClick={closeModal}>✕</button>
      </div>

      <form className="drawer_body" onSubmit={handleSubmit}>

        {/* ===============================
            BASIC INFORMATION
        =============================== */}

        <div className="drawer_section">

          <div className="drawer_section_header">
            <span className="drawer_section_title">
              Basic Information
            </span>
            <div className="drawer_section_divider"></div>
          </div>

          <div className="drawer_grid">

            <div className="form_group full_width">

              <label className="form_label">
                Profile Image
              </label>

              <div className="profile_upload">

                {previewImage ? (

                  <img
                    src={previewImage}
                    alt="Preview"
                    className="profile_preview"
                  />

                ) : (

                  <div className="profile_placeholder">
                    {formData.driverName?.charAt(0)?.toUpperCase() || "D"}
                  </div>

                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

              </div>

            </div>

            <div className="form_group">
              <label className="form_label">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                className="form_input"
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={handleChange}
              />
            </div>

            <div className="form_group">
              <label className="form_label">Driver Name</label>
              <input
                type="text"
                name="driverName"
                className="form_input"
                placeholder="Driver Name"
                value={formData.driverName}
                onChange={handleChange}
              />
            </div>

            <div className="form_group">
              <label className="form_label">Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                className="form_input"
                placeholder="Mobile Number"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form_group">
              <label className="form_label">Alternate Mobile</label>
              <input
                type="text"
                name="alternateMobileNumber"
                className="form_input"
                placeholder="Alternate Mobile"
                value={formData.alternateMobileNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form_group">
              <label className="form_label">Email</label>
              <input
                type="email"
                name="email"
                className="form_input"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

                   </div>

        </div>

{/* ===============================
    PERSONAL INFORMATION
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">
    <span className="drawer_section_title">
      Personal Information
    </span>
    <div className="drawer_section_divider"></div>
  </div>

  <div className="drawer_grid">

    <div className="form_group">
      <label className="form_label">Date of Birth</label>
      <input
        type="date"
        name="dateOfBirth"
        className="form_input"
        value={formData.dateOfBirth}
        onChange={handleChange}
      />
    </div>

    <div className="form_group">
      <label className="form_label">Gender</label>
      <select
        name="gender"
        className="form_input"
        value={formData.gender}
        onChange={handleChange}
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
    </div>

    <div className="form_group">
      <label className="form_label">Blood Group</label>
      <select
        name="bloodGroup"
        className="form_input"
        value={formData.bloodGroup}
        onChange={handleChange}
      >
        <option value="">Select Blood Group</option>
        <option>A+</option>
        <option>A-</option>
        <option>B+</option>
        <option>B-</option>
        <option>AB+</option>
        <option>AB-</option>
        <option>O+</option>
        <option>O-</option>
      </select>
    </div>

  </div>

</div>

{/* ===============================
    LICENCE INFORMATION
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">
    <span className="drawer_section_title">
      Licence Information
    </span>
    <div className="drawer_section_divider"></div>
  </div>

  <div className="drawer_grid">

    <div className="form_group">
      <label className="form_label">Licence Number</label>
      <input
        type="text"
        name="licenceNumber"
        className="form_input"
        placeholder="Licence Number"
        value={formData.licenceNumber}
        onChange={handleChange}
      />
    </div>

    <div className="form_group">
      <label className="form_label">Licence Type</label>
      <select
        name="licenceType"
        className="form_input"
        value={formData.licenceType}
        onChange={handleChange}
      >
        <option value="">Select Licence Type</option>
        <option>LMV</option>
        <option>HMV</option>
        <option>Transport</option>
        <option>Heavy Vehicle</option>
      </select>
    </div>

    <div className="form_group">
      <label className="form_label">Issue Date</label>
      <input
        type="date"
        name="licenceIssueDate"
        className="form_input"
        value={formData.licenceIssueDate}
        onChange={handleChange}
      />
    </div>

    <div className="form_group">
      <label className="form_label">Expiry Date</label>
      <input
        type="date"
        name="licenceExpiryDate"
        className="form_input"
        value={formData.licenceExpiryDate}
        onChange={handleChange}
      />
    </div>

  </div>

</div>



{/* ===============================
    EMPLOYMENT INFORMATION
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">
    <span className="drawer_section_title">
      Employment Information
    </span>
    <div className="drawer_section_divider"></div>
  </div>

  <div className="drawer_grid">

    <div className="form_group">
      <label className="form_label">Joining Date</label>
      <input
        type="date"
        name="joiningDate"
        className="form_input"
        value={formData.joiningDate}
        onChange={handleChange}
      />
    </div>

    <div className="form_group">
      <label className="form_label">Experience (Years)</label>
      <input
        type="number"
        name="experienceInYears"
        className="form_input"
        value={formData.experienceInYears}
        onChange={handleChange}
      />
    </div>

    <div className="form_group">
      <label className="form_label">Salary</label>
      <input
        type="number"
        name="salary"
        className="form_input"
        value={formData.salary}
        onChange={handleChange}
      />
    </div>

    <div className="form_group">
      <label className="form_label">Status</label>
      <select
        name="status"
        className="form_input"
        value={formData.status}
        onChange={handleChange}
      >
        <option>Active</option>
        <option>Inactive</option>
        <option>On Leave</option>
        <option>Resigned</option>
      </select>
    </div>

  </div>

</div>

{/* ===============================
    EMERGENCY CONTACT
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">
    <span className="drawer_section_title">
      Emergency Contact
    </span>
    <div className="drawer_section_divider"></div>
  </div>

  <div className="drawer_grid">

    <div className="form_group">
      <label className="form_label">Contact Name</label>
      <input
        type="text"
        name="emergencyContactName"
        className="form_input"
        value={formData.emergencyContactName}
        onChange={handleChange}
      />
    </div>

    <div className="form_group">
      <label className="form_label">Contact Number</label>
      <input
        type="text"
        name="emergencyContactNumber"
        className="form_input"
        value={formData.emergencyContactNumber}
        onChange={handleChange}
      />
    </div>

  </div>

</div>

{/* ===============================
    COMMUNICATION ADDRESS
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">
    <span className="drawer_section_title">
      Communication Address
    </span>
    <div className="drawer_section_divider"></div>
  </div>

  <div className="drawer_grid">

    <input
      className="form_input"
      placeholder="Address Line 1"
      name="addressLine1"
      value={formData.communicationAddress.addressLine1}
      onChange={(e)=>handleAddressChange("communicationAddress",e)}
    />

    <input
      className="form_input"
      placeholder="Address Line 2"
      name="addressLine2"
      value={formData.communicationAddress.addressLine2}
      onChange={(e)=>handleAddressChange("communicationAddress",e)}
    />

    <input
      className="form_input"
      placeholder="City"
      name="city"
      value={formData.communicationAddress.city}
      onChange={(e)=>handleAddressChange("communicationAddress",e)}
    />

    <input
      className="form_input"
      placeholder="District"
      name="district"
      value={formData.communicationAddress.district}
      onChange={(e)=>handleAddressChange("communicationAddress",e)}
    />

    <input
      className="form_input"
      placeholder="State"
      name="state"
      value={formData.communicationAddress.state}
      onChange={(e)=>handleAddressChange("communicationAddress",e)}
    />

    <input
      className="form_input"
      placeholder="Pincode"
      name="pincode"
      value={formData.communicationAddress.pincode}
      onChange={(e)=>handleAddressChange("communicationAddress",e)}
    />

  </div>

</div>

{/* ===============================
    PERMANENT ADDRESS
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">
    <span className="drawer_section_title">
      Permanent Address
    </span>
    <div className="drawer_section_divider"></div>
  </div>

  <div className="drawer_grid">

    <input
      className="form_input"
      placeholder="Address Line 1"
      name="addressLine1"
      value={formData.permanentAddress.addressLine1}
      onChange={(e)=>handleAddressChange("permanentAddress",e)}
    />

    <input
      className="form_input"
      placeholder="Address Line 2"
      name="addressLine2"
      value={formData.permanentAddress.addressLine2}
      onChange={(e)=>handleAddressChange("permanentAddress",e)}
    />

    <input
      className="form_input"
      placeholder="City"
      name="city"
      value={formData.permanentAddress.city}
      onChange={(e)=>handleAddressChange("permanentAddress",e)}
    />

    <input
      className="form_input"
      placeholder="District"
      name="district"
      value={formData.permanentAddress.district}
      onChange={(e)=>handleAddressChange("permanentAddress",e)}
    />

    <input
      className="form_input"
      placeholder="State"
      name="state"
      value={formData.permanentAddress.state}
      onChange={(e)=>handleAddressChange("permanentAddress",e)}
    />

    <input
      className="form_input"
      placeholder="Pincode"
      name="pincode"
      value={formData.permanentAddress.pincode}
      onChange={(e)=>handleAddressChange("permanentAddress",e)}
    />

  </div>

</div>

{/* ===============================
    REMARKS
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">
    <span className="drawer_section_title">
      Remarks
    </span>
    <div className="drawer_section_divider"></div>
  </div>

  <textarea
    className="form_textarea"
    rows="4"
    name="remarks"
    value={formData.remarks}
    onChange={handleChange}
    placeholder="Remarks..."
  />

</div>

<div className="drawer_footer">

  <button
    type="button"
    className="secondary_btn"
    onClick={closeModal}
  >
    Cancel
  </button>

  <button
    type="submit"
    className="primary_btn"
  >
    Create Driver
  </button>

</div>

</form>

</div>

</div>

)}



{/* ===============================
      RECORD INFO
=============================== */}

<div className="record_info">

Showing

{" "}

<strong>

{drivers.length}

</strong>

of

{" "}

<strong>

{pagination.totalRecords}

</strong>

Records

</div>

{/* ===============================
      PAGINATION
=============================== */}

<div className="pagination_wrapper">

<button

onClick={goToPreviousPage}

disabled={filters.page===1}

>

Previous

</button>

<span>

Page

{" "}

{pagination.currentPage}

{" "}

of

{" "}

{pagination.totalPages}

</span>

<button

onClick={goToNextPage}

disabled={

filters.page===pagination.totalPages ||

pagination.totalPages===0

}

>

Next

</button>

</div>

</div>

);

};

export default BusDriver