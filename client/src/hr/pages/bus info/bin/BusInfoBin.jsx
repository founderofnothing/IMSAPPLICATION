import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../../api/axios";

const BusInfoBin = () => {

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
    vehicleType: "",
    fuelType: "",
    status: "",
  });

  /* ===============================
      FETCH DELETED BUS
  =============================== */

  const fetchDeletedBus = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "/transport/bus/recycle-bin",
        {
          params: filters,
        }
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
        "Failed to fetch deleted buses."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchDeletedBus();
  }, [filters]);

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


  /* ===============================
    RESTORE BUS
=============================== */

const handleRestore = async (id) => {

  const confirmRestore = window.confirm(
    "Restore this bus?"
  );

  if (!confirmRestore) return;

  try {

    await API.put(
      `/transport/bus/${id}/restore`
    );

    toast.success(
      "Bus restored successfully."
    );

    fetchDeletedBus();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to restore bus."
    );

  }

};


/* ===============================
    PERMANENT DELETE
=============================== */

const handlePermanentDelete = async (id) => {

  const confirmDelete = window.confirm(

    "This action cannot be undone.\n\nDelete this bus permanently?"

  );

  if (!confirmDelete) return;

  try {

    await API.delete(
      `/transport/bus/${id}/permanent`
    );

    toast.success(
      "Bus permanently deleted."
    );

    fetchDeletedBus();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to delete bus."

    );

  }

};

  return (

   <div className="bus_bin_container">

  {/* ===============================
      HEADER
  =============================== */}

  <div className="page_header">

    <h2>Bus Recycle Bin</h2>

  </div>

  {/* ===============================
      FILTERS
  =============================== */}

  <div className="filter_wrapper">

    <input
      type="text"
      name="search"
      placeholder="Search Bus / Registration / Bus Name"
      value={filters.search}
      onChange={handleFilterChange}
    />

    <select
      name="vehicleType"
      value={filters.vehicleType}
      onChange={handleFilterChange}
    >
      <option value="">Vehicle Type</option>
      <option>College Bus</option>
      <option>Mini Bus</option>
      <option>School Bus</option>
      <option>Van</option>
      <option>Other</option>
    </select>

    <select
      name="fuelType"
      value={filters.fuelType}
      onChange={handleFilterChange}
    >
      <option value="">Fuel Type</option>
      <option>Diesel</option>
      <option>Petrol</option>
      <option>CNG</option>
      <option>Electric</option>
    </select>

    <select
      name="status"
      value={filters.status}
      onChange={handleFilterChange}
    >
      <option value="">Status</option>
      <option>Active</option>
      <option>Inactive</option>
      <option>Maintenance</option>
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
          <th>Vehicle</th>
          <th>Fuel</th>
          <th>Status</th>
          <th>Deleted On</th>
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
                No Deleted Buses Found
              </td>
            </tr>

          )

          :

          buses.map((item,index)=>(

            <tr key={item._id}>

              <td>
                {((pagination.currentPage-1)*filters.limit)+index+1}
              </td>

              <td>{item.busNumber}</td>

              <td>{item.registrationNumber}</td>

              <td>{item.busName}</td>

              <td>{item.vehicleType}</td>

              <td>{item.fuelType}</td>

              <td>{item.status}</td>

              <td>
                {item.deletedAt
                  ? new Date(item.deletedAt).toLocaleDateString()
                  : "-"}
              </td>

              <td>

               <button
  onClick={() =>
    handleRestore(item._id)
  }
>
  Restore
</button>

            <button
  onClick={() =>
    handlePermanentDelete(item._id)
  }
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
      PAGINATION
  =============================== */}

  <div className="pagination_wrapper">

    <div className="record_info">

      Showing <strong>{buses.length}</strong> of <strong>{pagination.totalRecords}</strong> Records

    </div>

    <div>

      <button
        onClick={previousPage}
        disabled={filters.page===1}
      >
        Previous
      </button>

      <span>

        Page {pagination.currentPage} of {pagination.totalPages}

      </span>

      <button
        onClick={nextPage}
        disabled={
          filters.page===pagination.totalPages ||
          pagination.totalPages===0
        }
      >
        Next
      </button>

    </div>

  </div>

</div>

  );

};

export default BusInfoBin;