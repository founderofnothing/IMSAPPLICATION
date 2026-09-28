// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import API from "../../../api/axios";

// const StudentAssignmentBus = () => {

//   /* ===============================
//       STATES
//   =============================== */

//   const [students, setStudents] =
//     useState([]);

//   const [routes, setRoutes] =
//     useState([]);

//   const [buses, setBuses] =
//     useState([]);

//   const [stops, setStops] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(false);

//   const [selectedStudents, setSelectedStudents] =
//     useState([]);

//   const [pagination, setPagination] =
//     useState({

//       currentPage: 1,

//       totalPages: 1,

//       totalRecords: 0,

//     });

//   const [filters, setFilters] =
//     useState({

//       page: 1,

//       limit: 10,

//       search: "",

//       institutionId: "",

//       classId: "",

//     });

//   const [formData, setFormData] =
//     useState({

//       routeId: "",

//       busId: "",

//       pickupStop: "",

//       dropStop: "",

//       remarks: "",

//     });

//   /* ===============================
//       FETCH FUNCTIONS
//   =============================== */
// /* ===============================
//     FETCH STUDENTS
// =============================== */

// const fetchStudents = async () => {

//   try {

//     setLoading(true);

//     const response =
//       await API.get(

//         "/students/student-transport/student-assignment",

//         {
//           params: filters,
//         }

//       );

//     setStudents(
//       response.data.data
//     );

//     setPagination({

//       currentPage:
//         response.data.currentPage,

//       totalPages:
//         response.data.totalPages,

//       totalRecords:
//         response.data.totalRecords,

//     });

//   } catch (error) {

//     toast.error(

//       error.response?.data?.message ||

//       "Failed to fetch students."

//     );

//   } finally {

//     setLoading(false);

//   }

// };

// /* ===============================
//     FETCH ROUTES
// =============================== */

// const fetchRoutes = async () => {

//   try {

//     const response =
//       await API.get(
//         "/transport/bus-route"
//       );

//     setRoutes(
//       response.data.data
//     );

//   } catch (error) {

//     toast.error(

//       error.response?.data?.message ||

//       "Failed to fetch routes."

//     );

//   }

// };
// /* ===============================
//     FETCH SINGLE ROUTE
// =============================== */

// const fetchRoute = async (
//   routeId
// ) => {

//   if (!routeId) {

//     setBuses([]);

//     setStops([]);

//     return;

//   }

//   try {

//     const response =
//       await API.get(
//         `/transport/bus-route/${routeId}`
//       );

//     setBuses(
//       response.data.data.assignedBuses
//     );

//     setStops(
//       response.data.data.stops
//     );

//   } catch (error) {

//     toast.error(

//       error.response?.data?.message ||

//       "Failed to fetch route."

//     );

//   }

// };

//   /* ===============================
//       HANDLERS
//   =============================== */
// const handleInputChange = (
//   e
// ) => {

//   const {
//     name,
//     value,
//   } = e.target;

//   setFormData(prev => ({

//     ...prev,

//     [name]: value,

//   }));

//   if (name === "routeId") {

//     fetchRoute(value);

//     setFormData(prev => ({

//       ...prev,

//       routeId: value,

//       busId: "",

//       pickupStop: "",

//       dropStop: "",

//     }));

//   }

// };


// /* ===============================
//     SELECT STUDENTS
// =============================== */

// const handleStudentSelect = (
//   studentId
// ) => {

//   setSelectedStudents(prev => {

//     if (
//       prev.includes(studentId)
//     ) {

//       return prev.filter(
//         id => id !== studentId
//       );

//     }

//     return [
//       ...prev,
//       studentId,
//     ];

//   });

// };

// /* ===============================
//     SELECT ALL
// =============================== */

// const handleSelectAll = (
//   e
// ) => {

//   if (e.target.checked) {

//     const availableStudents =
//       students

//         .filter(
//           student =>
//             !student.assigned
//         )

//         .map(
//           student =>
//             student._id
//         );

//     setSelectedStudents(
//       availableStudents
//     );

//   } else {

//     setSelectedStudents([]);

//   }

// };


// /* ===============================
//     BULK ASSIGN STUDENTS
// =============================== */

// const handleAssignStudents = async () => {

//   if (selectedStudents.length === 0) {

//     return toast.warning(
//       "Please select at least one student."
//     );

//   }

//   if (
//     !formData.routeId ||
//     !formData.busId ||
//     !formData.pickupStop ||
//     !formData.dropStop
//   ) {

//     return toast.warning(
//       "Please complete all transport details."
//     );

//   }

//   try {

//     await API.post(
//       "/transport/student-transport/bulk",
//       {

//         studentIds:
//           selectedStudents,

//         routeId:
//           formData.routeId,

//         busId:
//           formData.busId,

//         pickupStop:
//           formData.pickupStop,

//         dropStop:
//           formData.dropStop,

//         remarks:
//           formData.remarks,

//       }
//     );

//     toast.success(
//       "Students assigned successfully."
//     );

//     // Clear Selected Students
//     setSelectedStudents([]);

//     // Reset Form
//     setFormData({

//       routeId: "",

//       busId: "",

//       pickupStop: "",

//       dropStop: "",

//       remarks: "",

//     });

//     // Clear Route Data
//     setBuses([]);

//     setStops([]);

//     // Refresh Student List
//     fetchStudents();

//   } catch (error) {

//     toast.error(

//       error.response?.data?.message ||

//       "Failed to assign students."

//     );

//   }

// };
//   /* ===============================
//       USE EFFECT
//   =============================== */

// useEffect(() => {

//   fetchStudents();

// }, [filters]);

// useEffect(() => {

//   fetchRoutes();

// }, []);

//   return (

//    <div className="student_assignment_container">

//   {/* ===============================
//       HEADER
//   =============================== */}

//   <div className="page_header">

//     <h2>
//       Student Transport Assignment
//     </h2>

//   </div>

//   {/* ===============================
//       SEARCH
//   =============================== */}

//   <div className="filter_wrapper">

//     <input
//       type="text"
//       name="search"
//       placeholder="Search Student"
//       value={filters.search}
//       onChange={(e)=>
//         setFilters(prev=>({

//           ...prev,

//           page:1,

//           search:e.target.value,

//         }))
//       }
//     />

//   </div>

//   {/* ===============================
//       ASSIGNMENT FORM
//   =============================== */}

//   <div className="form_grid">

//     <div>

//       <label>

//         Route

//       </label>

//       <select
//         name="routeId"
//         value={formData.routeId}
//         onChange={handleInputChange}
//       >

//         <option value="">
//           Select Route
//         </option>

//         {

//           routes.map(route=>(

//             <option
//               key={route._id}
//               value={route._id}
//             >

//               {route.routeName}

//             </option>

//           ))

//         }

//       </select>

//     </div>

//     <div>

//       <label>

//         Bus

//       </label>

//       <select
//         name="busId"
//         value={formData.busId}
//         onChange={handleInputChange}
//       >

//         <option value="">
//           Select Bus
//         </option>

//         {

//           buses.map(bus=>(

//             <option
//               key={bus._id}
//               value={bus._id}
//             >

//               {bus.busNumber}

//             </option>

//           ))

//         }

//       </select>

//     </div>

//     <div>

//       <label>

//         Pickup Stop

//       </label>

//       <select
//         name="pickupStop"
//         value={formData.pickupStop}
//         onChange={handleInputChange}
//       >

//         <option value="">
//           Select Pickup
//         </option>

//         {

//           stops.map((stop,index)=>(

//             <option
//               key={index}
//               value={stop.stopName}
//             >

//               {stop.stopName}

//             </option>

//           ))

//         }

//       </select>

//     </div>

//     <div>

//       <label>

//         Drop Stop

//       </label>

//       <select
//         name="dropStop"
//         value={formData.dropStop}
//         onChange={handleInputChange}
//       >

//         <option value="">
//           Select Drop
//         </option>

//         {

//           stops.map((stop,index)=>(

//             <option
//               key={index}
//               value={stop.stopName}
//             >

//               {stop.stopName}

//             </option>

//           ))

//         }

//       </select>

//     </div>

//     <div className="full_width">

//       <label>

//         Remarks

//       </label>

//       <textarea
//         rows="3"
//         name="remarks"
//         value={formData.remarks}
//         onChange={handleInputChange}
//       />

//     </div>

//   </div>

//   {/* ===============================
//       STUDENT TABLE
//   =============================== */}

//   <div className="table_wrapper">

//     <table className="user_table">

//       <thead>

//         <tr>

//           <th>

//             <input
//               type="checkbox"
//               onChange={
//                 handleSelectAll
//               }
//             />

//           </th>

//           <th>Reg No</th>

//           <th>Name</th>

//           <th>Institution</th>

//           <th>Class</th>

//           <th>Bus</th>

//           <th>Route</th>

//         </tr>

//       </thead>

//       <tbody>

//         {

//           loading ?

//           (

//             <tr>

//               <td
//                 colSpan="7"
//                 className="no_data"
//               >

//                 Loading...

//               </td>

//             </tr>

//           )

//           :

//           students.length===0 ?

//           (

//             <tr>

//               <td
//                 colSpan="7"
//                 className="no_data"
//               >

//                 No Students Found

//               </td>

//             </tr>

//           )

//           :

//           students.map(student=>(

//             <tr
//               key={student._id}
//             >

//               <td>

//                 <input
//                   type="checkbox"
//                   disabled={
//                     student.assigned
//                   }
//                   checked={
//                     selectedStudents.includes(
//                       student._id
//                     )
//                   }
//                   onChange={()=>handleStudentSelect(
//                     student._id
//                   )}
//                 />

//               </td>

//               <td>
//                 {student.registerNumber}
//               </td>

//               <td>
//                 {student.studentName}
//               </td>

//               <td>
//                 {
//                   student
//                   .institutionId
//                   ?.institutionName
//                 }
//               </td>

//               <td>

//                 {student.classId?.year}

//                 {" - "}

//                 {student.classId?.section}

//               </td>

//               <td>

//                 {
//                   student.assignedBus
//                   ?.busNumber ||

//                   "-"

//                 }

//               </td>

//               <td>

//                 {
//                   student.assignedRoute
//                   ?.routeName ||

//                   "-"

//                 }

//               </td>

//             </tr>

//           ))

//         }

//       </tbody>

//     </table>


//     {/* ===============================
//     ACTIONS
// =============================== */}

// <div className="form_actions">

//   <button
//     className="primary_btn"
//     onClick={handleAssignStudents}
//     disabled={

//       selectedStudents.length === 0 ||

//       !formData.routeId ||

//       !formData.busId ||

//       !formData.pickupStop ||

//       !formData.dropStop

//     }
//   >

//     Assign Selected Students

//     {selectedStudents.length > 0 &&
//       ` (${selectedStudents.length})`}

//   </button>

// </div>

//   </div>

// </div>

//   );

// };

// export default StudentAssignmentBus;



import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../api/axios";

const StudentAssignmentBus = () => {
  /* =========================================================
     STATES
  ========================================================= */

  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [stops, setStops] = useState([]);

  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [selectedStudents, setSelectedStudents] = useState([]);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    institutionId: "",
    classId: "",
  });

  const [formData, setFormData] = useState({
    routeId: "",
    busId: "",
    pickupStop: "",
    dropStop: "",
    remarks: "",
  });

  /* =========================================================
     HELPER
     IMPORTANT:
     Do NOT directly use student.assigned as disabled value.
     API may return "false", "0", null, undefined, etc.
  ========================================================= */

  const isStudentAssigned = (student) => {
    if (!student) return false;

    /*
      Case 1:
      Backend returns a real boolean.
    */
    if (typeof student.assigned === "boolean") {
      return student.assigned;
    }

    /*
      Case 2:
      Backend returns string values.
      "false" must NOT disable checkbox.
    */
    if (typeof student.assigned === "string") {
      const value = student.assigned.trim().toLowerCase();

      if (
        value === "" ||
        value === "false" ||
        value === "0" ||
        value === "null" ||
        value === "undefined" ||
        value === "no"
      ) {
        return false;
      }

      if (
        value === "true" ||
        value === "1" ||
        value === "yes"
      ) {
        return true;
      }
    }

    /*
      Case 3:
      Some APIs don't return an `assigned` boolean
      but return assignedBus / assignedRoute.
    */
    if (
      student.assignedBus &&
      typeof student.assignedBus === "object"
    ) {
      return true;
    }

    if (
      student.assignedRoute &&
      typeof student.assignedRoute === "object"
    ) {
      return true;
    }

    /*
      If assigned is an object, it generally means
      the student already has a transport assignment.
    */
    if (
      student.assigned &&
      typeof student.assigned === "object"
    ) {
      return true;
    }

    return false;
  };

  /* =========================================================
     FETCH STUDENTS
  ========================================================= */

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        "/students/student-transport/student-assignment",
        {
          params: filters,
        }
      );

      const responseStudents =
        response?.data?.data || [];

      setStudents(
        Array.isArray(responseStudents)
          ? responseStudents
          : []
      );

      setPagination({
        currentPage:
          response?.data?.currentPage ||
          filters.page ||
          1,

        totalPages:
          response?.data?.totalPages || 1,

        totalRecords:
          response?.data?.totalRecords ||
          responseStudents.length ||
          0,
      });

      /*
        Remove selections that no longer exist
        or became assigned after refresh.
      */
      setSelectedStudents((previousSelected) => {
        const availableIds = new Set(
          responseStudents
            .filter(
              (student) => !isStudentAssigned(student)
            )
            .map((student) => String(student._id))
        );

        return previousSelected.filter((id) =>
          availableIds.has(String(id))
        );
      });
    } catch (error) {
      console.error(
        "FETCH STUDENTS ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch students."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH ROUTES
  ========================================================= */

  const fetchRoutes = async () => {
    try {
      const response = await API.get(
        "/transport/bus-route"
      );

      const routeData =
        response?.data?.data || [];

      setRoutes(
        Array.isArray(routeData)
          ? routeData
          : []
      );
    } catch (error) {
      console.error(
        "FETCH ROUTES ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch routes."
      );
    }
  };

  /* =========================================================
     FETCH SINGLE ROUTE
  ========================================================= */

  const fetchRoute = async (routeId) => {
    if (!routeId) {
      setBuses([]);
      setStops([]);
      return;
    }

    try {
      const response = await API.get(
        `/transport/bus-route/${routeId}`
      );

      const routeData =
        response?.data?.data || {};

      setBuses(
        Array.isArray(routeData.assignedBuses)
          ? routeData.assignedBuses
          : []
      );

      setStops(
        Array.isArray(routeData.stops)
          ? routeData.stops
          : []
      );
    } catch (error) {
      console.error(
        "FETCH ROUTE ERROR:",
        error
      );

      setBuses([]);
      setStops([]);

      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch route."
      );
    }
  };

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleInputChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    /*
      Route changed.
      Clear bus + stops because they belong
      to the selected route.
    */
    if (name === "routeId") {
      setFormData((previous) => ({
        ...previous,
        routeId: value,
        busId: "",
        pickupStop: "",
        dropStop: "",
      }));

      fetchRoute(value);

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     SELECT / UNSELECT STUDENT
  ========================================================= */

  const handleStudentSelect = (studentId) => {
    const normalizedId = String(studentId);

    setSelectedStudents((previous) => {
      const alreadySelected = previous.some(
        (id) => String(id) === normalizedId
      );

      if (alreadySelected) {
        return previous.filter(
          (id) =>
            String(id) !== normalizedId
        );
      }

      return [
        ...previous,
        normalizedId,
      ];
    });
  };

  /* =========================================================
     SELECT ALL AVAILABLE STUDENTS
  ========================================================= */

  const handleSelectAll = (e) => {
    const checked = e.target.checked;

    if (!checked) {
      setSelectedStudents([]);
      return;
    }

    const availableStudentIds = students
      .filter(
        (student) =>
          !isStudentAssigned(student)
      )
      .map((student) =>
        String(student._id)
      );

    setSelectedStudents(
      availableStudentIds
    );
  };

  /* =========================================================
     CHECK IF ALL AVAILABLE STUDENTS ARE SELECTED
  ========================================================= */

  const availableStudents = students.filter(
    (student) =>
      !isStudentAssigned(student)
  );

  const allAvailableSelected =
    availableStudents.length > 0 &&
    availableStudents.every((student) =>
      selectedStudents.some(
        (id) =>
          String(id) ===
          String(student._id)
      )
    );

  /* =========================================================
     BULK ASSIGN STUDENTS
  ========================================================= */

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.warning(
        "Please select at least one student."
      );

      return;
    }

    if (!formData.routeId) {
      toast.warning(
        "Please select a route."
      );

      return;
    }

    if (!formData.busId) {
      toast.warning(
        "Please select a bus."
      );

      return;
    }

    if (!formData.pickupStop) {
      toast.warning(
        "Please select a pickup stop."
      );

      return;
    }

    if (!formData.dropStop) {
      toast.warning(
        "Please select a drop stop."
      );

      return;
    }

    try {
      setAssigning(true);

      const payload = {
        studentIds: selectedStudents.map(
          (id) => String(id)
        ),

        routeId: String(
          formData.routeId
        ),

        busId: String(
          formData.busId
        ),

        pickupStop:
          formData.pickupStop,

        dropStop:
          formData.dropStop,

        remarks:
          formData.remarks,
      };

      console.log(
        "ASSIGN STUDENTS PAYLOAD:",
        payload
      );

      await API.post(
        "/transport/student-transport/bulk",
        payload
      );

      toast.success(
        "Students assigned successfully."
      );

      /* -----------------------------------------
         RESET SELECTED STUDENTS
      ----------------------------------------- */

      setSelectedStudents([]);

      /* -----------------------------------------
         RESET FORM
      ----------------------------------------- */

      setFormData({
        routeId: "",
        busId: "",
        pickupStop: "",
        dropStop: "",
        remarks: "",
      });

      /* -----------------------------------------
         CLEAR ROUTE DATA
      ----------------------------------------- */

      setBuses([]);
      setStops([]);

      /* -----------------------------------------
         REFRESH STUDENTS
      ----------------------------------------- */

      await fetchStudents();
    } catch (error) {
      console.error(
        "ASSIGN STUDENTS ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to assign students."
      );
    } finally {
      setAssigning(false);
    }
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.currentPage
    ) {
      return;
    }

    setSelectedStudents([]);

    setFilters((previous) => ({
      ...previous,
      page,
    }));
  };

  /* =========================================================
     EFFECTS
  ========================================================= */

  useEffect(() => {
    fetchStudents();
  }, [
    filters.page,
    filters.limit,
    filters.search,
    filters.institutionId,
    filters.classId,
  ]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="student_assignment_container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="page_header">

        <div>
          <h2>
            Student Transport Assignment
          </h2>

          <p>
            Select students and assign them
            to a route and bus.
          </p>
        </div>

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="filter_wrapper">

        <input
          type="text"
          name="search"
          placeholder="Search Student"
          value={filters.search}
          onChange={(e) =>
            setFilters((previous) => ({
              ...previous,
              page: 1,
              search: e.target.value,
            }))
          }
        />

      </div>

      {/* =====================================================
          ASSIGNMENT FORM
      ===================================================== */}

      <div className="form_grid">

        {/* ===================================================
            ROUTE
        =================================================== */}

        <div>

          <label>
            Route
          </label>

          <select
            name="routeId"
            value={formData.routeId}
            onChange={handleInputChange}
          >

            <option value="">
              Select Route
            </option>

            {routes.map((route) => (
              <option
                key={route._id}
                value={route._id}
              >
                {route.routeName}
              </option>
            ))}

          </select>

        </div>

        {/* ===================================================
            BUS
        =================================================== */}

        <div>

          <label>
            Bus
          </label>

          <select
            name="busId"
            value={formData.busId}
            onChange={handleInputChange}
            disabled={!formData.routeId}
          >

            <option value="">
              Select Bus
            </option>

            {buses.map((bus) => (
              <option
                key={bus._id}
                value={bus._id}
              >
                {bus.busNumber}
              </option>
            ))}

          </select>

        </div>

        {/* ===================================================
            PICKUP STOP
        =================================================== */}

        <div>

          <label>
            Pickup Stop
          </label>

          <select
            name="pickupStop"
            value={formData.pickupStop}
            onChange={handleInputChange}
            disabled={!formData.routeId}
          >

            <option value="">
              Select Pickup
            </option>

            {stops.map((stop, index) => (
              <option
                key={
                  stop._id ||
                  `${stop.stopName}-${index}`
                }
                value={stop.stopName}
              >
                {stop.stopName}
              </option>
            ))}

          </select>

        </div>

        {/* ===================================================
            DROP STOP
        =================================================== */}

        <div>

          <label>
            Drop Stop
          </label>

          <select
            name="dropStop"
            value={formData.dropStop}
            onChange={handleInputChange}
            disabled={!formData.routeId}
          >

            <option value="">
              Select Drop
            </option>

            {stops.map((stop, index) => (
              <option
                key={
                  stop._id ||
                  `${stop.stopName}-${index}`
                }
                value={stop.stopName}
              >
                {stop.stopName}
              </option>
            ))}

          </select>

        </div>

        {/* ===================================================
            REMARKS
        =================================================== */}

        <div className="full_width">

          <label>
            Remarks
          </label>

          <textarea
            rows="3"
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            placeholder="Optional remarks..."
          />

        </div>

      </div>

      {/* =====================================================
          SELECTION SUMMARY
      ===================================================== */}

      <div className="selection_summary">

        <span>
          Available Students:
          <strong>
            {availableStudents.length}
          </strong>
        </span>

        <span>
          Selected:
          <strong>
            {selectedStudents.length}
          </strong>
        </span>

      </div>

      {/* =====================================================
          STUDENT TABLE
      ===================================================== */}

      <div className="table_wrapper">

        <table className="user_table">

          <thead>

            <tr>

              <th>

                <input
                  type="checkbox"
                  checked={
                    allAvailableSelected
                  }
                  disabled={
                    availableStudents.length === 0
                  }
                  onChange={
                    handleSelectAll
                  }
                />

              </th>

              <th>
                Reg No
              </th>

              <th>
                Name
              </th>

              <th>
                Institution
              </th>

              <th>
                Class
              </th>

              <th>
                Bus
              </th>

              <th>
                Route
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan="7"
                  className="no_data"
                >
                  Loading...
                </td>

              </tr>

            ) : students.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  className="no_data"
                >
                  No Students Found
                </td>

              </tr>

            ) : (

              students.map((student) => {

                /*
                  IMPORTANT:
                  Determine assignment safely.
                */
                const assigned =
                  isStudentAssigned(
                    student
                  );

                const studentId =
                  String(student._id);

                const isSelected =
                  selectedStudents.some(
                    (id) =>
                      String(id) ===
                      studentId
                  );

                return (

                  <tr
                    key={student._id}
                    className={
                      assigned
                        ? "student_row assigned_student"
                        : isSelected
                        ? "student_row selected_student"
                        : "student_row"
                    }
                  >

                    {/* =======================================
                        CHECKBOX
                    ======================================= */}

                    <td>

                      <input
                        type="checkbox"

                        /*
                          ONLY disable when genuinely assigned.
                        */
                        disabled={assigned}

                        checked={
                          assigned
                            ? false
                            : isSelected
                        }

                        onChange={() =>
                          handleStudentSelect(
                            studentId
                          )
                        }

                      />

                    </td>

                    {/* =======================================
                        REGISTER NUMBER
                    ======================================= */}

                    <td>
                      {student.registerNumber ||
                        "-"}
                    </td>

                    {/* =======================================
                        STUDENT NAME
                    ======================================= */}

                    <td>
                      {student.studentName ||
                        student.name ||
                        "-"}
                    </td>

                    {/* =======================================
                        INSTITUTION
                    ======================================= */}

                    <td>
                      {
                        student
                          .institutionId
                          ?.institutionName
                      }

                      {!student
                        .institutionId
                        ?.institutionName &&
                        "-"}
                    </td>

                    {/* =======================================
                        CLASS
                    ======================================= */}

                    <td>

                      {student.classId?.year ||
                        "-"}

                      {student.classId?.year &&
                        student.classId?.section &&
                        " - "}

                      {student.classId?.section ||
                        ""}

                    </td>

                    {/* =======================================
                        BUS
                    ======================================= */}

                    <td>

                      {student.assignedBus
                        ?.busNumber ||
                        "-"}

                    </td>

                    {/* =======================================
                        ROUTE
                    ======================================= */}

                    <td>

                      {student.assignedRoute
                        ?.routeName ||
                        "-"}

                    </td>

                  </tr>

                );
              })

            )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {pagination.totalPages > 1 && (

        <div className="pagination_wrapper">

          <button
            type="button"
            disabled={
              pagination.currentPage <= 1
            }
            onClick={() =>
              handlePageChange(
                pagination.currentPage - 1
              )
            }
          >
            Previous
          </button>

          <span>
            Page{" "}
            <strong>
              {pagination.currentPage}
            </strong>{" "}
            of{" "}
            <strong>
              {pagination.totalPages}
            </strong>
          </span>

          <button
            type="button"
            disabled={
              pagination.currentPage >=
              pagination.totalPages
            }
            onClick={() =>
              handlePageChange(
                pagination.currentPage + 1
              )
            }
          >
            Next
          </button>

        </div>

      )}

      {/* =====================================================
          ACTIONS
      ===================================================== */}

      <div className="form_actions">

        <button
          type="button"
          className="primary_btn"
          onClick={
            handleAssignStudents
          }

          disabled={
            assigning ||
            selectedStudents.length === 0 ||
            !formData.routeId ||
            !formData.busId ||
            !formData.pickupStop ||
            !formData.dropStop
          }
        >

          {assigning
            ? "Assigning..."
            : "Assign Selected Students"}

          {!assigning &&
            selectedStudents.length > 0 &&
            ` (${selectedStudents.length})`}

        </button>

      </div>

    </div>
  );
};

export default StudentAssignmentBus;

