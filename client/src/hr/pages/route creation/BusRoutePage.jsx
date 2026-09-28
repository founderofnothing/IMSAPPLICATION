import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api/axios";
import "./busroutepage.css"
const BusRoutePage = () => {

  const navigate = useNavigate();

  /* ===============================
      STATES
  =============================== */

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statistics, setStatistics] = useState({
  totalRoutes: 0,
  activeRoutes: 0,
  assignedBuses: 0,
});

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  /* ===============================
    CREATE / UPDATE ROUTE
=============================== */

const [showForm, setShowForm] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [selectedId, setSelectedId] = useState(null);

const [buses, setBuses] = useState([]);

const [formData, setFormData] = useState({
  routeName: "",
  routeCode: "",
  assignedBuses: [],
  stops: [
    {
      stopName: "",
      arrivalTime: "",
      order: 1,
    },
  ],
  totalDistance: "",
  estimatedTravelTime: "",
  status: "Active",
  remarks: "",
});

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    busId: "",
  });

  /* ===============================
      FETCH ROUTES
  =============================== */

  const fetchRoutes = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        "/transport/bus-route",
        {
          params: filters,
        }
      );
      setStatistics(
  response.data.statistics
);

      setRoutes(response.data.data);

      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalRecords: response.data.totalRecords,
      });

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch routes."

      );

    } finally {

      setLoading(false);

    }

  };

/* ===============================
    FETCH BUSES
=============================== */

const fetchBuses = async () => {

  try {

    const response = await API.get(
      "/transport/bus",
      {
        params: {
          limit: 1000,
        },
      }
    );

    setBuses(response.data.data);

  } catch (error) {

    toast.error(
      "Failed to load buses."
    );

  }

};





useEffect(() => {
  fetchRoutes();
}, [filters]);

useEffect(() => {
  fetchBuses();
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


  /* ===============================
    FORM HANDLERS
=============================== */

const handleInputChange = (e) => {

  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));

};

const resetForm = () => {

  setFormData({
    routeName: "",
    routeCode: "",
    assignedBuses: [],
    stops: [
      {
        stopName: "",
        arrivalTime: "",
        order: 1,
      },
    ],
    totalDistance: "",
    estimatedTravelTime: "",
    status: "Active",
    remarks: "",
  });

  setIsEdit(false);
  setSelectedId(null);

};

/* ===============================
    SUBMIT ROUTE
=============================== */

const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    if (isEdit) {

      await API.put(
        `/transport/bus-route/${selectedId}`,
        formData
      );

      toast.success(
        "Route updated successfully."
      );

    } else {

      await API.post(
        "/transport/bus-route",
        formData
      );

      toast.success(
        "Route created successfully."
      );

    }

    setShowForm(false);

    resetForm();

    fetchRoutes();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to save route."
    );

  }

};

/* ===============================
    DELETE ROUTE
=============================== */

const handleDelete = async (routeId) => {

  const confirmDelete = window.confirm(
    "Move this route to recycle bin?"
  );

  if (!confirmDelete) return;

  try {

    await API.delete(
      `/transport/bus-route/${routeId}`
    );

    toast.success(
      "Route moved to recycle bin."
    );

    fetchRoutes();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to delete route."

    );

  }

};

/* ===============================
    UPDATE ROUTE
=============================== */

const handleUpdate = (route) => {

  setFormData({

    routeName:
      route.routeName,

    routeCode:
      route.routeCode,

    assignedBuses:
      route.assignedBuses.map(
        bus =>
          bus._id || bus
      ),

    stops:
      route.stops?.length
        ? route.stops
        : [
            {
              stopName: "",
              arrivalTime: "",
              order: 1,
            },
          ],

    totalDistance:
      route.totalDistance,

    estimatedTravelTime:
      route.estimatedTravelTime,

    status:
      route.status,

    remarks:
      route.remarks || "",

  });

  setSelectedId(route._id);

  setIsEdit(true);

  setShowForm(true);

};

  return (

   <div className="route_container">

       <NavLink to="/hr/BusRoutePage/bin">
  <h2>Bus route Bin</h2>
</NavLink>

  {/* ===============================
      HEADER
  =============================== */}

  <div className="page_header">

    <h2>Bus Routes</h2>

<button
  className="primary_btn"
  onClick={() => {
    resetForm();
    setShowForm(true);
  }}
>
  + Add Route
</button>

  </div>

<div className="stats_wrapper">

  <div className="stat_card">
    <h3>{statistics.totalRoutes}</h3>
    <p>Total Routes</p>
  </div>

  <div className="stat_card">
    <h3>{statistics.activeRoutes}</h3>
    <p>Active Routes</p>
  </div>

  <div className="stat_card">
    <h3>{statistics.assignedBuses}</h3>
    <p>Assigned Buses</p>
  </div>

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
      <option value="">All Status</option>
      <option>Active</option>
      <option>Inactive</option>
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

          routes.length === 0 ?

          (

            <tr>

              <td
                colSpan="9"
                className="no_data"
              >
                No Routes Found
              </td>

            </tr>

          )

          :

          routes.map((item,index)=>(

            <tr
              key={item._id}
              className="clickable_row"
              onClick={() =>
                navigate(
                  `/hr/BusRoute/profile/${item._id}`
                )
              }
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
  onClick={(e) => {

    e.stopPropagation();

    handleUpdate(item);

  }}
>
  Edit
</button>

              <button
  onClick={(e)=>{

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

<div className="modal_overlay"  >

<form
className="form_container"
onSubmit={handleSubmit}
>

<h2>

{isEdit ? "Update Route" : "Create Route"}

</h2>

<div className="form_grid">

<div>

<label>Route Name</label>

<input
type="text"
name="routeName"
value={formData.routeName}
onChange={handleInputChange}
required
/>

</div>

<div>

<label>Route Code</label>

<input
type="text"
name="routeCode"
value={formData.routeCode}
onChange={handleInputChange}
required
/>

</div>

<div className="full_width">

<label>Assign Bus</label>

<select
multiple
name="assignedBuses"
value={formData.assignedBuses}
onChange={(e)=>{

const values =
Array.from(
e.target.selectedOptions,
option=>option.value
);

setFormData(prev=>({

...prev,

assignedBuses:values,

}));

}}
>

{

buses.map(bus=>(

<option
key={bus._id}
value={bus._id}
>

{bus.busNumber}

</option>

))

}

</select>

<small>

Hold CTRL to select multiple buses.

</small>

</div>

<div className="full_width">

<label>Route Stops</label>

{

formData.stops.map((stop,index)=>(

<div
key={index}
className="stop_row"
>

<input
type="text"
placeholder="Stop Name"
value={stop.stopName}
onChange={(e)=>{

const updatedStops=[
...formData.stops
];

updatedStops[index].stopName=
e.target.value;

setFormData(prev=>({

...prev,

stops:updatedStops,

}));

}}
/>

<input
type="text"
placeholder="Arrival Time"
value={stop.arrivalTime}
onChange={(e)=>{

const updatedStops=[
...formData.stops
];

updatedStops[index].arrivalTime=
e.target.value;

setFormData(prev=>({

...prev,

stops:updatedStops,

}));

}}
/>

<button
type="button"
onClick={()=>{

if(
formData.stops.length===1
) return;

setFormData(prev=>({

...prev,

stops:
prev.stops
.filter((_,i)=>i!==index)
.map((item,i)=>({

...item,

order:i+1,

})),

}));

}}
>

Remove

</button>

</div>

))

}

<button
type="button"
onClick={()=>{

setFormData(prev=>({

...prev,

stops:[

...prev.stops,

{

stopName:"",

arrivalTime:"",

order:
prev.stops.length+1,

},

],

}));

}}
>

+ Add Stop

</button>

</div>

<div>

<label>Total Distance (KM)</label>

<input
type="number"
name="totalDistance"
value={formData.totalDistance}
onChange={handleInputChange}
/>

</div>

<div>

<label>Estimated Travel Time (Minutes)</label>

<input
type="number"
name="estimatedTravelTime"
value={formData.estimatedTravelTime}
onChange={handleInputChange}
/>

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
onClick={()=>{

setShowForm(false);

resetForm();

}}
>

Cancel

</button>

<button type="submit">

{isEdit ? "Update Route" : "Create Route"}

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

export default BusRoutePage;