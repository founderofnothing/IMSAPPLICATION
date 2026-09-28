import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import API from "../../../api/axios.js";

import { toast } from "react-toastify";

import "./DepartmentStudents.css";

import {
  FadersHorizontalIcon,
  GenderMaleIcon,
  GenderFemaleIcon,
} from "@phosphor-icons/react";

// import "./DepartmentStudents.css";


const DepartmentStudents = () => {

    const navigate = useNavigate();

  // =====================================================
  // STUDENTS
  // =====================================================

  const [students, setStudents] =
    useState([]);


  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // PAGINATION
  // =====================================================

  const [pagination, setPagination] =
    useState({

      currentPage: 1,

      totalPages: 1,

      totalRecords: 0,

    });


  // =====================================================
  // FILTERS
  // =====================================================

  const [filters, setFilters] =
    useState({

      page: 1,

      limit: 10,

      search: "",

      batchId: "",

      classId: "",

    });


  // =====================================================
  // BATCHES
  // =====================================================

  const [batches, setBatches] =
    useState([]);


  // =====================================================
  // CLASSES
  // =====================================================

  const [classes, setClasses] =
    useState([]);


  // =====================================================
  // STATISTICS
  // =====================================================

  const [statistics, setStatistics] =
    useState({

      totalStudents: 0,

      ugStudents: 0,

      pgStudents: 0,

      maleStudents: 0,

      femaleStudents: 0,

      otherStudents: 0,

    });


  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  const fetchStudents = async () => {

    try {

      setLoading(true);


const response = await API.get(
  "/students/hod/department",
  {
    params: filters,
  }
);


      // =================================================
      // STUDENTS
      // =================================================

      setStudents(
        response.data.data?.students || []
      );


      // =================================================
      // PAGINATION
      // =================================================

      setPagination({

        currentPage:
          response.data.data?.currentPage || 1,

        totalPages:
          response.data.data?.totalPages || 1,

        totalRecords:
          response.data.data?.totalRecords || 0,

      });


      // =================================================
      // STATISTICS
      // =================================================

      setStatistics({

        totalStudents:
          response.data.data?.totalStudents || 0,

        ugStudents:
          response.data.data?.ugStudents || 0,

        pgStudents:
          response.data.data?.pgStudents || 0,

        maleStudents:
          response.data.data?.maleStudents || 0,

        femaleStudents:
          response.data.data?.femaleStudents || 0,

        otherStudents:
          response.data.data?.otherStudents || 0,

      });


    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch students."

      );

      setStudents([]);

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FETCH BATCHES
  // =====================================================

  const fetchBatches = async () => {

    try {

      const response =
        await API.get(
          "/batch/getall",
          {
            params: {
              page: 1,
              limit: 100,
            },
          }
        );


      setBatches(
        response.data.data || []
      );

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch batches."

      );

    }

  };


  // =====================================================
  // FETCH CLASSES
  // =====================================================

//   const fetchClasses = async () => {

//     try {

//       const response =
//         await API.get(
//           "/classes/my-department"
//         );


//       setClasses(
//         response.data.data || []
//       );

//     } catch (error) {

//       toast.error(

//         error.response?.data?.message ||

//         "Failed to fetch classes."

//       );

//     }

//   };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchBatches();

    // fetchClasses();

  }, []);


  // =====================================================
  // FETCH STUDENTS WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {

    fetchStudents();

  }, [

    filters.page,

    filters.limit,

    filters.search,

    filters.batchId,

    filters.classId,

  ]);


  // =====================================================
  // FILTER CHANGE
  // =====================================================

  const handleFilterChange =
    (e) => {

      const {
        name,
        value,
      } = e.target;


      setFilters(
        (prev) => ({

          ...prev,

          page: 1,

          [name]:
            value,

        })
      );

    };


  // =====================================================
  // NEXT PAGE
  // =====================================================

  const nextPage = () => {

    if (
      filters.page <
      pagination.totalPages
    ) {

      setFilters(
        (prev) => ({

          ...prev,

          page:
            prev.page + 1,

        })
      );

    }

  };


  // =====================================================
  // PREVIOUS PAGE
  // =====================================================

  const previousPage = () => {

    if (
      filters.page > 1
    ) {

      setFilters(
        (prev) => ({

          ...prev,

          page:
            prev.page - 1,

        })
      );

    }

  };


  // =====================================================
  // JSX
  // =====================================================

  return (

    <div className="department-students-container">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="department-students-header">

        <div>

          <h2>
            Students
          </h2>

          <p>
            Students belonging to your department.
          </p>

        </div>

      </div>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="department-students-statistics">


        {/* TOTAL */}

        <div className="student-stat-card">

          <div className="student-stat-header">

            <h5>
              Total Students
            </h5>

            <FadersHorizontalIcon />

          </div>

          <h2>
            {
              statistics.totalStudents
            }
          </h2>

        </div>


        {/* UG */}

        <div className="student-stat-card">

          <div className="student-stat-header">

            <h5>
              UG Students
            </h5>

            <FadersHorizontalIcon />

          </div>

          <h2>
            {
              statistics.ugStudents
            }
          </h2>

        </div>


        {/* PG */}

        <div className="student-stat-card">

          <div className="student-stat-header">

            <h5>
              PG Students
            </h5>

            <FadersHorizontalIcon />

          </div>

          <h2>
            {
              statistics.pgStudents
            }
          </h2>

        </div>


        {/* MALE */}

        <div className="student-stat-card">

          <div className="student-stat-header">

            <h5>
              Male Students
            </h5>

            <GenderMaleIcon />

          </div>

          <h2>
            {
              statistics.maleStudents
            }
          </h2>

        </div>


        {/* FEMALE */}

        <div className="student-stat-card">

          <div className="student-stat-header">

            <h5>
              Female Students
            </h5>

            <GenderFemaleIcon />

          </div>

          <h2>
            {
              statistics.femaleStudents
            }
          </h2>

        </div>

      </div>


      {/* =================================================
          FILTER SECTION
      ================================================= */}

      <div className="department-students-filter-section">


        {/* SEARCH */}

        <input

          className="department-students-search"

          type="text"

          name="search"

          placeholder="Search student"

          value={
            filters.search
          }

          onChange={
            handleFilterChange
          }

        />


        {/* BATCH */}

        <select

          className="department-students-filter"

          name="batchId"

          value={
            filters.batchId
          }

          onChange={
            handleFilterChange
          }

        >

          <option value="">
            All Batches
          </option>


          {
            batches.map(
              (batch) => (

                <option
                  key={
                    batch._id
                  }
                  value={
                    batch._id
                  }
                >

                  {
                    batch.batchName
                  }

                </option>

              )
            )
          }

        </select>


        {/* CLASS */}

        {/* <select

          className="department-students-filter"

          name="classId"

          value={
            filters.classId
          }

          onChange={
            handleFilterChange
          }

        >

          <option value="">
            All Classes
          </option>


          {
            classes.map(
              (classItem) => (

                <option
                  key={
                    classItem._id
                  }
                  value={
                    classItem._id
                  }
                >

                  {
                    classItem.programme?.programmeCode ||
                    classItem.section ||
                    classItem._id
                  }

                </option>

              )
            )
          }

        </select> */}

      </div>


      {/* =================================================
          TABLE
      ================================================= */}

      <div className="department-students-table-wrapper">

        <table className="department-students-table">

          <thead>

            <tr>

              <th>
                S.No
              </th>

              <th>
                Register No
              </th>

              <th>
                Student Name
              </th>

              <th>
                Gender
              </th>

              <th>
                Email
              </th>

              <th>
                Programme
              </th>

              <th>
                Batch
              </th>

              <th>
                Class
              </th>

            </tr>

          </thead>


          <tbody>

            {
              loading ? (

                <tr>

                  <td
                    colSpan="8"
                  >

                    Loading students...

                  </td>

                </tr>

              ) : students.length === 0 ? (

                <tr>

                  <td
                    colSpan="8"
                  >

                    No students found.

                  </td>

                </tr>

              ) : (

                students.map(
                  (
                    student,
                    index
                  ) => (

<tr
  key={student._id}

  onClick={() =>
navigate(
  `/hod/students/profile/${student._id}`
)
  }

  className="department-students-row"
>

                      <td>

                        {
                          (
                            (
                              pagination.currentPage -
                              1
                            ) *
                            filters.limit
                          ) +
                          index +
                          1
                        }

                      </td>


                      <td>

                        {
                          student.registerNumber ||
                          "N/A"
                        }

                      </td>


                      <td>

                        {
                          student.studentName
                        }

                      </td>


                      <td>

                        {
                          student.gender
                        }

                      </td>


                      <td>

                        {
                          student.studentEmail ||
                          "N/A"
                        }

                      </td>


                      <td>

                        {
                          student.programmeId?.programmeName ||
                          "N/A"
                        }

                      </td>


                      <td>

                        {
                          student.batchId?.batchName ||
                          "N/A"
                        }

                      </td>


                      <td>

                        {
                          student.classId?.section ||
                          "N/A"
                        }

                      </td>

                    </tr>

                  )
                )

              )
            }

          </tbody>

        </table>

      </div>


      {/* =================================================
          PAGINATION
      ================================================= */}

      <div className="department-students-pagination">

        <button
          onClick={
            previousPage
          }

          disabled={
            filters.page === 1
          }

        >

          Previous

        </button>


        <span>

          Page{" "}

          {
            pagination.currentPage
          }

          {" "}of{" "}

          {
            pagination.totalPages
          }

        </span>


        <button
          onClick={
            nextPage
          }

          disabled={
            filters.page >=
            pagination.totalPages
          }

        >

          Next

        </button>

      </div>

    </div>

  );

};


export default DepartmentStudents;