


import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../api/axios";
import { useNavigate } from "react-router-dom";

import {
  FadersHorizontalIcon,
  GenderMaleIcon,
  GenderFemaleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

import "./mydepartmentfaculty.css";



const MyDepartmentFaculty = () => {

      const navigate = useNavigate();

      const API_BASE_URL = import.meta.env.VITE_API_URL;

const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getProfileImageUrl = (image) => {
  if (!image) return null;

  // Already a complete URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Backend path: /uploads/profile/...
  return `${SERVER_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

  /* =========================================================
     FACULTY LIST
  ========================================================= */

  const [faculties, setFaculties] = useState([]);


  /* =========================================================
     LOADING
  ========================================================= */

  const [loading, setLoading] = useState(false);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const [statistics, setStatistics] = useState({
    totalFaculty: 0,
    maleFaculty: 0,
    femaleFaculty: 0,
  });


  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const [designationOptions, setDesignationOptions] =
    useState([]);


  /* =========================================================
     PAGINATION
  ========================================================= */

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
  });


  /* =========================================================
     FILTERS
  ========================================================= */

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    gender: "",
    designation: "",
  });


  /* =========================================================
     FETCH FACULTY
  ========================================================= */

const fetchFaculty = async () => {
  try {
    setLoading(true);

    const response = await API.get(
      "/users/my-department",
      {
        params: filters,
      }
    );

    setFaculties(
      response.data.data || []
    );

    setStatistics({
      totalFaculty:
        response.data.totalFaculty || 0,

      maleFaculty:
        response.data.maleFaculty || 0,

      femaleFaculty:
        response.data.femaleFaculty || 0,
    });

    setDesignationOptions(
      response.data.designationOptions || []
    );

    setPagination({
      currentPage:
        response.data.currentPage || 1,

      totalPages:
        response.data.totalPages || 1,

      totalRecords:
        response.data.totalRecords || 0,

      limit:
        response.data.limit || 10,
    });

  } catch (error) {

    console.error(
      "Fetch department faculty error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch faculty."
    );

  } finally {
    setLoading(false);
  }
};


  /* =========================================================
     FETCH WHEN FILTER CHANGES
  ========================================================= */

  useEffect(() => {

    fetchFaculty();

  }, [filters]);


  /* =========================================================
     FILTER CHANGE
  ========================================================= */

  const handleFilterChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFilters((prev) => ({

      ...prev,

      page: 1,

      [name]: value,

    }));

  };


  /* =========================================================
     NEXT PAGE
  ========================================================= */

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


  /* =========================================================
     PREVIOUS PAGE
  ========================================================= */

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


  /* =========================================================
     JSX
  ========================================================= */

  return (

    <div className="hod_department_faculty_container">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="hod_department_faculty_header">

        <div>

          <h2 className="hod_department_faculty_title">
            Department Faculty
          </h2>

          <p className="hod_department_faculty_subtitle">
            Manage and view teaching faculty in your department.
          </p>

        </div>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="hod_department_faculty_statistics">


        {/* TOTAL */}

        <div className="hod_faculty_stat_card">

          <div className="hod_faculty_stat_header">

            <h5>
              Total Faculty
            </h5>

            <UsersThreeIcon />

          </div>

          <div className="hod_faculty_stat_body">

            <span>
              _
            </span>

            <h2>
              {statistics.totalFaculty}
            </h2>

          </div>

        </div>


        {/* MALE */}

        <div className="hod_faculty_stat_card">

          <div className="hod_faculty_stat_header">

            <h5>
              Male Faculty
            </h5>

            <GenderMaleIcon />

          </div>

          <div className="hod_faculty_stat_body">

            <span>
              _
            </span>

            <h2>
              {statistics.maleFaculty}
            </h2>

          </div>

        </div>


        {/* FEMALE */}

        <div className="hod_faculty_stat_card">

          <div className="hod_faculty_stat_header">

            <h5>
              Female Faculty
            </h5>

            <GenderFemaleIcon />

          </div>

          <div className="hod_faculty_stat_body">

            <span>
              _
            </span>

            <h2>
              {statistics.femaleFaculty}
            </h2>

          </div>

        </div>


      </div>


      {/* =====================================================
          FILTER SECTION
      ===================================================== */}

      <div className="hod_department_faculty_filter_section">


        {/* SEARCH */}

        <input
          className="hod_faculty_search_field"
          type="text"
          name="search"
          placeholder="Search name, employee ID or email..."
          value={filters.search}
          onChange={handleFilterChange}
        />


        {/* DESIGNATION */}

        <select
          className="hod_faculty_dropdown_filter"
          name="designation"
          value={filters.designation}
          onChange={handleFilterChange}
        >

          <option value="">
            All Designations
          </option>

          {designationOptions.map(
            (designation) => (

              <option
                key={designation}
                value={designation}
              >
                {designation}
              </option>

            )
          )}

        </select>


        {/* GENDER */}

        <select
          className="hod_faculty_dropdown_filter"
          name="gender"
          value={filters.gender}
          onChange={handleFilterChange}
        >

          <option value="">
            All Gender
          </option>

          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>

        </select>


      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="hod_department_faculty_table_wrapper">

        <table className="hod_department_faculty_table">

          <thead>

            <tr>

              <th>
                S.No
              </th>

              <th>
                Employee ID
              </th>

              <th>
                Faculty
              </th>

              <th>
                Email
              </th>

              <th>
                Designation
              </th>

              <th>
                Gender
              </th>

              <th>
                Blood Group
              </th>

            </tr>

          </thead>


          <tbody>


            {/* LOADING */}

            {loading ? (

              <tr>

                <td
                  colSpan="7"
                  className="hod_faculty_no_data"
                >
                  Loading faculty...
                </td>

              </tr>

            ) : faculties.length === 0 ? (

              /* NO DATA */

              <tr>

                <td
                  colSpan="7"
                  className="hod_faculty_no_data"
                >
                  No faculty found.
                </td>

              </tr>

            ) : (

              /* FACULTY */

              faculties.map(
                (faculty, index) => (

<tr
  key={faculty._id}
  className="hod_department_faculty_row"
  onClick={() =>
    navigate(
      `/hod/department-faculty/${faculty.userId._id}`
    )
  }
>

                    {/* S.NO */}

                    <td>

                      {
                        (
                          (
                            pagination.currentPage -
                            1
                          ) *
                          pagination.limit
                        ) +
                        index +
                        1
                      }

                    </td>


                    {/* EMPLOYEE ID */}

                    <td>

                      <span className="hod_faculty_employee_id">

                        {faculty.employeeId}

                      </span>

                    </td>


                    {/* PROFILE */}

                    <td>

                      <div className="hod_faculty_profile_wrapper">


<img
  src={getProfileImageUrl(
    faculty.userId?.profileImage
  )}
  alt={
    faculty.userId?.fullName || "Faculty"
  }
  onError={(e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.style.display = "none";
  }}
/>


                        <div className="hod_faculty_profile_info">

                          <h4>

                            {
                              faculty.userId?.fullName ||
                              "N/A"
                            }

                          </h4>

                          <span>
                            Teaching Faculty
                          </span>

                        </div>


                      </div>

                    </td>


                    {/* EMAIL */}

                    <td>

                      {
                        faculty.userId?.email ||
                        "N/A"
                      }

                    </td>


                    {/* DESIGNATION */}

                    <td>

                      {
                        faculty.designation ||
                        "N/A"
                      }

                    </td>


                    {/* GENDER */}

                    <td>

                      {
                        faculty.gender ||
                        "N/A"
                      }

                    </td>


                    {/* BLOOD GROUP */}

                    <td>

                      {
                        faculty.bloodGroup ||
                        "N/A"
                      }

                    </td>


                  </tr>

                )
              )

            )}

          </tbody>

        </table>

      </div>


      {/* =====================================================
          PAGINATION
      ===================================================== */}

      <div className="hod_department_faculty_pagination">


        <button
          onClick={previousPage}
          disabled={
            filters.page <= 1
          }
        >
          Previous
        </button>


        <span>

          Page{" "}

          {pagination.currentPage}

          {" "}of{" "}

          {pagination.totalPages}

        </span>


        <button
          onClick={nextPage}
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


export default MyDepartmentFaculty;