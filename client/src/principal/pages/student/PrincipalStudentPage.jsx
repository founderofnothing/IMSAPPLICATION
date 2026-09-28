import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import gsap from "gsap";
import { useNavigate } from "react-router-dom";

import API from "../../../api/axios";
import { toast } from "react-toastify";

import "./principalstudentpage.css";


const PrincipalStudentPage = () => {

  const navigate = useNavigate();

  const pageAnimationRef = useRef(null);
  // ==========================================================
  // STUDENTS
  // ==========================================================

  const [students, setStudents] = useState([]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    ugStudents: 0,
    pgStudents: 0,
    maleStudents: 0,
    femaleStudents: 0,
  });


  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalRecords, setTotalRecords] =
    useState(0);

  const [limit] = useState(10);


  // ==========================================================
  // FILTERS
  // ==========================================================

  const [search, setSearch] =
    useState("");

  const [department, setDepartment] =
    useState("");

  const [gender, setGender] =
    useState("");


  // ==========================================================
  // LOADING
  // ==========================================================
const [loading, setLoading] =
  useState(false);

const [initialLoading, setInitialLoading] =
  useState(true);


  // ==========================================================
// GSAP — INITIAL PAGE ENTRANCE
// ==========================================================

useLayoutEffect(() => {

  if (initialLoading) return;

  const ctx = gsap.context(() => {

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });


    // ======================================================
    // INITIAL STATES
    // ======================================================

    gsap.set(".principal-student-overview", {
      autoAlpha: 0,
      y: 24,
    });

    gsap.set(
      ".principal-student-statistics > *",
      {
        autoAlpha: 0,
        y: 20,
        scale: 0.99,
      }
    );

    gsap.set(
      ".principal-student-filter-bar",
      {
        autoAlpha: 0,
        y: 16,
      }
    );

    gsap.set(
      ".principal-student-table-section",
      {
        autoAlpha: 0,
        y: 22,
        scale: 0.99,
      }
    );

    gsap.set(
      ".principal-student-program-cards > *",
      {
        autoAlpha: 0,
        y: 22,
        scale: 0.98,
      }
    );


    // ======================================================
    // PAGE HEADER
    // ======================================================

    tl.to(
      ".principal-student-overview",
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
      }
    );


    // ======================================================
    // STATISTICS
    // ======================================================

    tl.to(
      ".principal-student-statistics > *",
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
      },
      "-=0.42"
    );


    // ======================================================
    // FILTER BAR
    // ======================================================

    tl.to(
      ".principal-student-filter-bar",
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
      },
      "-=0.28"
    );


    // ======================================================
    // TABLE
    // ======================================================

    tl.to(
      ".principal-student-table-section",
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
      },
      "-=0.22"
    );


    // ======================================================
    // UG / PG CARDS
    // ======================================================

    tl.to(
      ".principal-student-program-cards > *",
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.1,
      },
      "-=0.45"
    );

  }, pageAnimationRef);


  return () => {
    ctx.revert();
  };

}, [initialLoading]);
  // ==========================================================
  // FETCH STUDENTS
  // ==========================================================

  const fetchStudents = useCallback(
    async () => {

      try {

        setLoading(true);


        const params = new URLSearchParams({

          page: currentPage,

          limit,

          ...(search && {
            search,
          }),

          ...(department && {
            department,
          }),

          ...(gender && {
            gender,
          }),

        });


        const response =
          await API.get(
            `/students/principal/institution?${params.toString()}`
          );


        const result =
          response.data;


        if (!result.success) {

          toast.error(
            result.message ||
            "Failed to fetch students."
          );

          return;

        }


        // ====================================================
        // STUDENTS
        // ====================================================

        setStudents(
          result.data || []
        );


        // ====================================================
        // STATISTICS
        // ====================================================

        setStatistics(
          result.statistics || {
            totalStudents: 0,
            ugStudents: 0,
            pgStudents: 0,
            maleStudents: 0,
            femaleStudents: 0,
          }
        );


        // ====================================================
        // PAGINATION
        // ====================================================

        setCurrentPage(
          result.pagination?.currentPage || 1
        );

        setTotalPages(
          result.pagination?.totalPages || 1
        );

        setTotalRecords(
          result.pagination?.totalRecords || 0
        );


      } catch (error) {

        console.error(
          "FETCH STUDENTS ERROR:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to fetch students."
        );

      } finally {

  setLoading(false);

  setInitialLoading(false);

}

    },
    [
      currentPage,
      limit,
      search,
      department,
      gender,
    ]
  );


  // ==========================================================
  // FETCH
  // ==========================================================

  useEffect(() => {

    fetchStudents();

  }, [fetchStudents]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearchChange = (e) => {

    setSearch(
      e.target.value
    );

    setCurrentPage(1);

  };


  // ==========================================================
  // DEPARTMENT FILTER
  // ==========================================================

  const handleDepartmentChange = (e) => {

    setDepartment(
      e.target.value
    );

    setCurrentPage(1);

  };


  // ==========================================================
  // GENDER FILTER
  // ==========================================================

  const handleGenderChange = (e) => {

    setGender(
      e.target.value
    );

    setCurrentPage(1);

  };


  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {

    setSearch("");

    setDepartment("");

    setGender("");

    setCurrentPage(1);

  };


  // ==========================================================
  // PAGE CHANGE
  // ==========================================================

  const handlePageChange = (page) => {

    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

  };


  // ==========================================================
  // CALCULATE AGE
  // ==========================================================

  const calculateAge = (dateOfBirth) => {

    if (!dateOfBirth) {
      return "-";
    }


    const birthDate =
      new Date(dateOfBirth);

    const today =
      new Date();


    let age =
      today.getFullYear() -
      birthDate.getFullYear();


    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();


    if (
      monthDifference < 0 ||
      (
        monthDifference === 0 &&
        today.getDate() <
          birthDate.getDate()
      )
    ) {

      age--;

    }


    return age;

  };


return (
    <div
    ref={pageAnimationRef}
    className="principal-student-page"
  >

    {/* =====================================================
        PAGE HEADER / TITLE + TOP STATISTICS
    ====================================================== */}

    <section className="principal-student-overview">

      {/* ===================================================
          TITLE
      ==================================================== */}

      <div className="principal-student-title-wrapper">

        <h1 className="principal-student-title">
          Institution
          <br />
          Student Stats
        </h1>

      </div>


      {/* ===================================================
          TOP 3 STATISTICS
      ==================================================== */}

      <div className="principal-student-statistics">

        {/* TOTAL STUDENTS */}

        <div className="principal-student-stat-card total">

          <span className="principal-student-stat-label">
            Total Students
          </span>

          <strong className="principal-student-stat-value">
            {statistics.totalStudents}
          </strong>

        </div>


        {/* MALE STUDENTS */}

        <div className="principal-student-stat-card">

          <span className="principal-student-stat-label">
            Male Students
          </span>

          <strong className="principal-student-stat-value">
            {statistics.maleStudents}
          </strong>

        </div>


        {/* FEMALE STUDENTS */}

        <div className="principal-student-stat-card">

          <span className="principal-student-stat-label">
            Female Students
          </span>

          <strong className="principal-student-stat-value">
            {statistics.femaleStudents}
          </strong>

        </div>

      </div>

    </section>


    {/* =====================================================
        STUDENT CONTENT
    ====================================================== */}

    <section className="principal-student-content">


      {/* ===================================================
          FILTER BAR
      ==================================================== */}

      <div className="principal-student-filter-bar">


        {/* SEARCH */}

        <div className="principal-student-search">

          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Name, Register No, Email ID"
          />

          <span className="principal-student-search-icon">
            ⌕
          </span>

        </div>


        {/* DEPARTMENT */}

        <div className="principal-student-filter">

          <select
            value={department}
            onChange={handleDepartmentChange}
          >

            <option value="">
              Department
            </option>

          </select>

        </div>


        {/* GENDER */}

        <div className="principal-student-filter">

          <select
            value={gender}
            onChange={handleGenderChange}
          >

            <option value="">
              Gender
            </option>

            <option value="Male">
              Male
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Other">
              Other
            </option>

          </select>

        </div>


        {/* COURSE / PROGRAM */}

        <button
          type="button"
          className="principal-student-filter course-filter"
        >
          Course
        </button>


        {/* CLEAR */}

        <button
          type="button"
          onClick={clearFilters}
          className="principal-student-clear-btn"
        >
          Clear
        </button>

      </div>


      {/* ===================================================
          MAIN GRID
      ==================================================== */}

      <div className="principal-student-main-grid">


        {/* =================================================
            LEFT — STUDENT TABLE
        ================================================== */}
{/* =================================================
    LEFT — STUDENT TABLE
================================================== */}

<div className="principal-student-table-section">

  {/* =================================================
      TABLE HEADER
  ================================================== */}

  <div className="principal-student-table-header">

    <div>

      <h2>
        Student List
      </h2>

      <span>
        {totalRecords} students found
      </span>

    </div>

  </div>


  {/* =================================================
      TABLE
  ================================================== */}

  {loading ? (

    <div className="principal-student-loading">
      Loading students...
    </div>

  ) : students.length === 0 ? (

    <div className="principal-student-empty">
      No students found.
    </div>

  ) : (

    <div className="principal-student-table-wrapper">

      {/* =================================================
          TABLE SCROLL
      ================================================== */}

      <div className="principal-student-table-scroll">

        <table className="principal-student-table">

          {/* =================================================
              TABLE HEADER
          ================================================== */}

          <thead className="principal-student-table-head">

            <tr className="principal-student-table-head-row">

              <th className="principal-student-table-head-cell serial">
                S.No
              </th>

              <th className="principal-student-table-head-cell register">
                Register No
              </th>

              <th className="principal-student-table-head-cell name">
                Name
              </th>

              <th className="principal-student-table-head-cell age">
                Age
              </th>

              <th className="principal-student-table-head-cell email">
                Mail ID
              </th>

              <th className="principal-student-table-head-cell gender">
                Gender
              </th>

              <th className="principal-student-table-head-cell department">
                Department
              </th>

            </tr>

          </thead>


          {/* =================================================
              TABLE BODY
          ================================================== */}

          <tbody>

            {students.map(
              (student, index) => (

<tr
  className="principal_student_data_table_row"
  key={
    student._id ||
    student.registerNumber ||
    index
  }
  onClick={() =>
navigate(`/principal/StudentPage/${student._id}`)
  }
>

                  {/* =================================================
                      S.NO
                  ================================================== */}

                  <td>

                    <span className="student_table_body_field">

                      {
                        (currentPage - 1) *
                          limit +
                        index +
                        1
                      }

                    </span>

                  </td>


                  {/* =================================================
                      REGISTER NUMBER
                  ================================================== */}

                  <td>

                    <span className="student_table_body_field">

                      {
                        student.registerNumber ||
                        "-"
                      }

                    </span>

                  </td>


                  {/* =================================================
                      NAME
                  ================================================== */}

                  <td>

                    <div className="principal-student-name">

                      {student.profileImage ? (

                        <img
                          src={student.profileImage}
                          alt={
                            student.studentName ||
                            "Student"
                          }
                        />

                      ) : (

                        <div className="principal-student-avatar">

                          {
                            student.studentName
                              ?.charAt(0)
                              ?.toUpperCase() ||
                            "S"
                          }

                        </div>

                      )}

                      <span className="student_table_body_field">

                        {
                          student.studentName ||
                          "-"
                        }

                      </span>

                    </div>

                  </td>


                  {/* =================================================
                      AGE
                  ================================================== */}

                  <td>

                    <span className="student_table_body_field">

                      {
                        calculateAge(
                          student.dateOfBirth
                        )
                      }

                    </span>

                  </td>


                  {/* =================================================
                      EMAIL
                  ================================================== */}

                  <td>

                    <span className="student_table_body_field">

                      {
                        student.studentEmail ||
                        "-"
                      }

                    </span>

                  </td>


                  {/* =================================================
                      GENDER
                  ================================================== */}

                  <td>

                    <span
                      className={
                        `principal-student-gender ${
                          student.gender
                            ?.toLowerCase()
                            .replaceAll(
                              " ",
                              "-"
                            ) ||
                          ""
                        }`
                      }
                    >

                      {
                        student.gender ||
                        "-"
                      }

                    </span>

                  </td>


                  {/* =================================================
                      DEPARTMENT
                  ================================================== */}

                  <td>

                    <span className="student_table_body_field">

                      {
                        student.departmentId
                          ?.departmentName ||
                        "-"
                      }

                    </span>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      {/* =================================================
          PAGINATION
      ================================================== */}

      {totalPages > 1 && (

        <div className="principal-student-pagination">

          <button
            className="prv_btn_student"
            type="button"
            disabled={
              currentPage === 1
            }
            onClick={() =>
              handlePageChange(
                currentPage - 1
              )
            }
          >
            ‹‹ Previous
          </button>


          <span>
            {currentPage}
          </span>


          <button
            className="nxt_btn_student"
            type="button"
            disabled={
              currentPage ===
              totalPages
            }
            onClick={() =>
              handlePageChange(
                currentPage + 1
              )
            }
          >
            Next ››
          </button>

        </div>

      )}

    </div>

  )}

</div>


        {/* =================================================
            RIGHT — UG / PG CARDS
        ================================================== */}

        <aside className="principal-student-program-cards">


          {/* =================================================
              UG STUDENT CARD
          ================================================== */}

          <div className="principal-student-program-card">


            {/* CARD TOP */}

            <div className="principal-student-program-card-top">

              <div className="principal-student-program-icon">
              </div>

              <h3>
                Ug Student
              </h3>

              <button
                type="button"
                className="principal-student-program-menu"
              >
                ⋯
              </button>

            </div>


            {/* CARD CONTENT */}

            <div className="principal-student-program-card-content">

              <span>
                Total UG
                <br />
                Students
              </span>

              <strong>
                {statistics.ugStudents}
              </strong>

            </div>


            {/* CARD ACTION */}

            <button
              type="button"
              className="principal-student-program-action"
            >
              <span>
                ⇥
              </span>
            </button>

          </div>


          {/* =================================================
              PG STUDENT CARD
          ================================================== */}

          <div className="principal-student-program-card">


            {/* CARD TOP */}

            <div className="principal-student-program-card-top">

              <div className="principal-student-program-icon">
              </div>

              <h3>
                Pg Student
              </h3>

              <button
                type="button"
                className="principal-student-program-menu"
              >
                ⋯
              </button>

            </div>


            {/* CARD CONTENT */}

            <div className="principal-student-program-card-content">

              <span>
                Total PG
                <br />
                Students
              </span>

              <strong>
                {statistics.pgStudents}
              </strong>

            </div>


            {/* CARD ACTION */}

            <button
              type="button"
              className="principal-student-program-action"
            >
              <span>
                ⇥
              </span>
            </button>

          </div>


        </aside>

      </div>

    </section>

  </div>
);

};


export default PrincipalStudentPage;