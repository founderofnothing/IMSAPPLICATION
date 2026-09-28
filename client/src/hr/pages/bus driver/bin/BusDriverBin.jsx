import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API, { SERVER_URL } from "../../../../api/axios";
import { NavLink } from "react-router-dom";

const BusDriverBin = () => {

  /* ===============================
      STATES
  =============================== */

  const [drivers, setDrivers] = useState([]);
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
    bloodGroup: "",
    gender: "",
    status: "",
    licenceType: "",
  });

  /* ===============================
      FETCH DELETED DRIVERS
  =============================== */

  const fetchDeletedDrivers = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "/transport/bus-driver/recycle-bin",
        {
          params: filters,
        }
      );

      setDrivers(response.data.data);

      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalRecords: response.data.totalRecords,
      });

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch deleted drivers."
      );

    } finally {

      setLoading(false);

    }

  };

  /* ===============================
      USE EFFECT
  =============================== */

  useEffect(() => {

    fetchDeletedDrivers();

  }, [filters]);

  /* ===============================
      FILTERS
  =============================== */
const handleRestore = async (driverId) => {

  if (!window.confirm("Restore this driver?")) return;

  try {

    const response = await API.put(
      `/transport/bus-driver/${driverId}/restore`
    );

    toast.success(response.data.message);

    fetchDeletedDrivers();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to restore driver."
    );

  }

};

const handlePermanentDelete = async (driverId) => {

  const confirmDelete = window.confirm(
    "This action cannot be undone.\n\nPermanently delete this driver?"
  );

  if (!confirmDelete) return;

  try {

    const response = await API.delete(
      `/transport/bus-driver/${driverId}/permanent`
    );

    toast.success(response.data.message);

    fetchDeletedDrivers();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to permanently delete driver."
    );

  }

};





  const handleFilterChange = (e) => {

    setFilters(prev => ({
      ...prev,
      page: 1,
      [e.target.name]: e.target.value,
    }));

  };

  const goToNextPage = () => {

    if (filters.page < pagination.totalPages) {

      setFilters(prev => ({
        ...prev,
        page: prev.page + 1,
      }));

    }

  };

  const goToPreviousPage = () => {

    if (filters.page > 1) {

      setFilters(prev => ({
        ...prev,
        page: prev.page - 1,
      }));

    }

  };

  return (

    <div className="driver_bin_container">

      {/* Header */}

      <div className="page_header">

        <h2>Bus Driver Recycle Bin</h2>

      </div>

      <NavLink to="/hr/BusDriver">
  <h2>Bus Driver list</h2>
</NavLink>

      {/* Filters */}

      <div className="filter_wrapper">

        <input
          type="text"
          name="search"
          placeholder="Search Employee / Driver / Email"
          value={filters.search}
          onChange={handleFilterChange}
        />

        <select
          name="bloodGroup"
          value={filters.bloodGroup}
          onChange={handleFilterChange}
        >
          <option value="">Blood Group</option>
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
          <option value="">Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
        >
          <option value="">Status</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>On Leave</option>
          <option>Resigned</option>
        </select>

        <select
          name="licenceType"
          value={filters.licenceType}
          onChange={handleFilterChange}
        >
          <option value="">Licence</option>
          <option>LMV</option>
          <option>HMV</option>
          <option>Transport</option>
          <option>Heavy Vehicle</option>
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
              <th>Employee ID</th>
              <th>Profile</th>
              <th>Driver Name</th>
              <th>Mobile</th>
              <th>Licence</th>
              <th>Status</th>
              <th>Restore</th>
              <th>Delete</th>

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

              drivers.length === 0 ?

              (

                <tr>

                  <td colSpan="9" className="no_data">

                    No Deleted Drivers

                  </td>

                </tr>

              )

              :

              drivers.map((item,index)=>(

                <tr key={item._id}>

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

                    {item.licenceType}

                  </td>

                  <td>

                    {item.status}

                  </td>

                  <td>

             <button
  className="restore_btn"
  onClick={() => handleRestore(item._id)}
>
  Restore
</button>

                  </td>

                  <td>

                  <button
  className="delete_btn"
  onClick={() => handlePermanentDelete(item._id)}
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

      {/* ===============================
          RECORD INFO
      =============================== */}

      <div className="record_info">

        Showing

        <strong>

          {" "}

          {drivers.length}

          {" "}

        </strong>

        of

        <strong>

          {" "}

          {pagination.totalRecords}

          {" "}

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

          Page {pagination.currentPage} of {pagination.totalPages}

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

export default BusDriverBin;