import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../../api/axios";

const BusRouteBin = () => {

  const [routes, setRoutes] = useState([]);

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
      FETCH DELETED ROUTES
  =============================== */

  const fetchDeletedRoutes = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "/transport/bus-route/recycle-bin",
        {
          params: filters,
        }
      );

      setRoutes(
        response.data.data
      );

      setPagination({

        currentPage:
          response.data.currentPage,

        totalPages:
          response.data.totalPages,

        totalRecords:
          response.data.totalRecords,

      });

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch deleted routes."

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchDeletedRoutes();

  }, [filters]);

  /* ===============================
      FILTERS
  =============================== */

  const handleFilterChange = (e) => {

    setFilters(prev => ({

      ...prev,

      page: 1,

      [e.target.name]:
        e.target.value,

    }));

  };

  const nextPage = () => {

    if (
      filters.page <
      pagination.totalPages
    ) {

      setFilters(prev => ({

        ...prev,

        page: prev.page + 1,

      }));

    }

  };

  const previousPage = () => {

    if (
      filters.page > 1
    ) {

      setFilters(prev => ({

        ...prev,

        page: prev.page - 1,

      }));

    }

  };

  /* ===============================
    RESTORE ROUTE
=============================== */

const handleRestore = async (routeId) => {

  const confirmRestore = window.confirm(
    "Restore this bus route?"
  );

  if (!confirmRestore) return;

  try {

    await API.put(
      `/transport/bus-route/${routeId}/restore`
    );

    toast.success(
      "Bus route restored successfully."
    );

    fetchDeletedRoutes();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to restore route."

    );

  }

};

/* ===============================
    DELETE PERMANENTLY
=============================== */

const handlePermanentDelete = async (routeId) => {

  const confirmDelete = window.confirm(
    "Permanently delete this route? This action cannot be undone."
  );

  if (!confirmDelete) return;

  try {

    await API.delete(
      `/transport/bus-route/${routeId}/permanent`
    );

    toast.success(
      "Bus route permanently deleted."
    );

    fetchDeletedRoutes();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to delete route."

    );

  }

};

  return (

 <div className="route_container">

  {/* ===============================
      HEADER
  =============================== */}

  <div className="page_header">

    <h2>

      Bus Route Recycle Bin

    </h2>

  </div>

  {/* ===============================
      FILTERS
  =============================== */}

  <div className="filter_wrapper">

    <input
      type="text"
      name="search"
      placeholder="Search Route Name / Route Code"
      value={filters.search}
      onChange={handleFilterChange}
    />

    <select
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

      <option value="Inactive">

        Inactive

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

          <th>#</th>

          <th>Route Name</th>

          <th>Route Code</th>

          <th>Assigned Bus</th>

          <th>Total Stops</th>

          <th>Distance</th>

          <th>Travel Time</th>

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
      colSpan="9"
      className="no_data"
      >

      Loading...

      </td>

      </tr>

      )

      :

      routes.length===0 ?

      (

      <tr>

      <td
      colSpan="9"
      className="no_data"
      >

      No Deleted Routes Found

      </td>

      </tr>

      )

      :

      routes.map((item,index)=>(

      <tr
      key={item._id}
      >

      <td>

      {((pagination.currentPage-1)*filters.limit)+index+1}

      </td>

      <td>

      {item.routeName}

      </td>

      <td>

      {item.routeCode}

      </td>

      <td>

      {item.assignedBusCount}

      </td>

      <td>

      {item.totalStops}

      </td>

      <td>

      {item.totalDistance} KM

      </td>

      <td>

      {item.estimatedTravelTime} Min

      </td>

      <td>

      {item.status}

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

      Showing

      <strong>

        {routes.length}

      </strong>

      of

      <strong>

        {pagination.totalRecords}

      </strong>

      Records

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

export default BusRouteBin;