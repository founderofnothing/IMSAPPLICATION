import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import gsap from "gsap";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import API from "../../../api/axios";

import {  ArrowClockwiseIcon ,DotsThreeVerticalIcon ,ArrowFatLineRightIcon ,DotsThreeIcon} from "@phosphor-icons/react";


import "./PrincipalFacultyPage.css";


const PrincipalFacultyPage = () => {

  const navigate = useNavigate();

  const pageAnimationRef = useRef(null);
  /* =========================================================
                        STATISTICS
  ========================================================= */

  const [statistics, setStatistics] = useState({
    totalFaculty: 0,
    teachingCount: 0,
    nonTeachingCount: 0,
    maleCount: 0,
    femaleCount: 0,
  });


  /* =========================================================
                          FACULTY
  ========================================================= */

  const [faculties, setFaculties] =
    useState([]);


    const [facultyModalOpen, setFacultyModalOpen] =
  useState(false);

const [facultyModalType, setFacultyModalType] =
  useState("");

const [levelFaculties, setLevelFaculties] =
  useState([]);

const [levelFacultyLoading, setLevelFacultyLoading] =
  useState(false);


      const [search, setSearch] = useState("");

const [facultyType, setFacultyType] =
  useState("");

const [designation, setDesignation] =
  useState("");

const [gender, setGender] =
  useState("");

  /* =========================================================
                        PAGINATION
  ========================================================= */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalRecords, setTotalRecords] =
    useState(0);

  const limit = 10;




  /* =========================================================
                         LOADING
  ========================================================= */

  

const [initialLoading, setInitialLoading] =
  useState(true);

const [filterLoading, setFilterLoading] =
  useState(false);


  /* =========================================================
                     GSAP PAGE LOAD
========================================================= */

useLayoutEffect(() => {

  if (initialLoading) return;

  const ctx = gsap.context(() => {

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });


    /* =====================================================
                       INITIAL STATE
    ===================================================== */

    gsap.set(".faculty_page_top_wrapper", {
      autoAlpha: 0,
      y: 24,
    });

    gsap.set(".principal-faculty-statistics > *", {
      autoAlpha: 0,
      y: 20,
    });

    gsap.set(".principal-faculty-filter-bar", {
      autoAlpha: 0,
      y: 16,
    });

    gsap.set(".principal-faculty-table-wrapper", {
      autoAlpha: 0,
      y: 22,
      scale: 0.99,
    });

    gsap.set(".faculty_count_static_wrapper > *", {
      autoAlpha: 0,
      y: 22,
      scale: 0.99,
    });


    /* =====================================================
                          HERO
    ===================================================== */

    tl.to(
      ".faculty_page_top_wrapper",
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.75,
      }
    );


    /* =====================================================
                        STATISTICS
    ===================================================== */

    tl.to(
      ".principal-faculty-statistics > *",
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
      },
      "-=0.42"
    );


    /* =====================================================
                         FILTER BAR
    ===================================================== */

    tl.to(
      ".principal-faculty-filter-bar",
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
      },
      "-=0.28"
    );


    /* =====================================================
                         MAIN CONTENT
    ===================================================== */

    tl.to(
      ".principal-faculty-table-wrapper",
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
      },
      "-=0.25"
    );


    /* =====================================================
                         UG / PG CARDS
    ===================================================== */

    tl.to(
      ".faculty_count_static_wrapper > *",
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


  /* =========================================================
                    GET INSTITUTION ID
  ========================================================= */

const getInstitutionId = () => {
  return sessionStorage.getItem("institution");
};


  /* =========================================================
                      FETCH FACULTY
  ========================================================= */

const fetchFaculty = async (
  page = 1,
  filterValues = {},
  isInitialLoad = false
) => {

  try {

    if (isInitialLoad) {
      setInitialLoading(true);
    } else {
      setFilterLoading(true);
    }

    const institutionId =
      sessionStorage.getItem("institution");

    if (!institutionId) {

      toast.error(
        "Institution information not found."
      );

      return;
    }

    const response =
      await API.get(
        "/users/faculty",
        {
          params: {

            page,

            limit,

            institution:
              institutionId,

            search:
              filterValues.search ??
              search,

            type:
              filterValues.type ??
              facultyType,

            designation:
              filterValues.designation ??
              designation,

            gender:
              filterValues.gender ??
              gender,

          },
        }
      );

    const responseData =
      response.data;


    setStatistics(
      responseData?.statistics || {
        totalFaculty: 0,
        teachingCount: 0,
        nonTeachingCount: 0,
        maleCount: 0,
        femaleCount: 0,
        ugFacultyCount: 0,
        pgFacultyCount: 0,
        bothLevelFacultyCount: 0,
      }
    );


    setFaculties(
      responseData?.data || []
    );


    setCurrentPage(
      responseData?.pagination
        ?.currentPage || page
    );


    setTotalPages(
      responseData?.pagination
        ?.totalPages || 1
    );


    setTotalRecords(
      responseData?.pagination
        ?.totalRecords || 0
    );


  } catch (error) {

    console.error(
      "Fetch faculty error:",
      error.response?.data ||
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch faculty."
    );

  } finally {

    setInitialLoading(false);
    setFilterLoading(false);

  }

};



/* =========================================================
              FETCH UG / PG TEACHING FACULTY
========================================================= */

/* =========================================================
              FETCH UG / PG TEACHING FACULTY
========================================================= */

const fetchLevelFaculty = async (level) => {

  try {

    setLevelFacultyLoading(true);

    setLevelFaculties([]);

    const endpoint =
      level === "UG"
        ? "/users/faculty/teaching/ug"
        : "/users/faculty/teaching/pg";

    const response =
      await API.get(
        endpoint,
        {
          params: {
            page: 1,
            limit: 100,
          },
        }
      );

    console.log(
      `${level} FACULTY RESPONSE:`,
      response.data
    );

    setLevelFaculties(
      response.data?.data || []
    );

  } catch (error) {

    console.error(
      `Fetch ${level} faculty error:`,
      error.response?.data ||
      error
    );

    toast.error(
      error.response?.data?.message ||
      `Failed to fetch ${level} teaching faculty.`
    );

  } finally {

    setLevelFacultyLoading(false);

  }

};


/* =========================================================
                 OPEN UG / PG FACULTY MODAL
========================================================= */

const handleLevelFacultyClick = (level) => {

  setFacultyModalType(level);

  setFacultyModalOpen(true);

  fetchLevelFaculty(level);

};
  /* =========================================================
                      INITIAL LOAD
  ========================================================= */
useEffect(() => {

  fetchFaculty(
    1,
    {},
    true
  );

}, []);






  /* =========================================================
                    PAGE CHANGE
  ========================================================= */

  const handlePageChange = (
    page
  ) => {

    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }


    fetchFaculty(page);

  };


  /* =========================================================
                       LOADING
  ========================================================= */

/* =========================================================
                     INITIAL LOADING
========================================================= */

if (initialLoading) {

  return (

    <div className="principal-faculty-page">

      <div className="principal-faculty-loading">

        Loading faculty information...

      </div>

    </div>

  );

}


  /* =========================================================
                         RENDER
  ========================================================= */

  return (

    <div
    ref={pageAnimationRef}
    className="principal-faculty-page"
  >


      {/* =====================================================
                         PAGE HEADER
      ===================================================== */}

      <div className="principal-faculty-header">

        <div>

       


          <div className="faculty_page_top_wrapper">


<div className="lhs_static_page">

   <h1 className="principalstc_bar-title">
         Institution Faculty Stats
          </h1>


        {/* TOTAL FACULTY */}


                <div className="principal-faculty-stat-card_stc">

          <span className="card_listerhead_one">
            Total Faculty 
          </span>

          <div className="circle_div_total_faculty">
   <strong className="circle_div_total_faculty_data">
            {statistics.totalFaculty}
          </strong>
          </div>
       

        </div>

</div>



      



      <div className="principal-faculty-statistics">



  


        {/* TEACHING FACULTY */}

        <div className="principal-faculty-stat-card">

          <span className="card_listerhead_two">
            Teaching Faculty #
          </span>

          <strong className="card_listerhead_two_data">
            {statistics.teachingCount}
          </strong>

        </div>


        {/* NON TEACHING */}

        <div className="principal-faculty-stat-card">

          <span className="card_listerhead_three">
            Non-Teaching Faculty #
          </span>

          <strong className="card_listerhead_three_data">
            {statistics.nonTeachingCount}
          </strong>

        </div>

            <div className="principal-faculty-stat-card">

          <span className="card_listerhead_four">
           male/female
          </span>

          <div className="static_card_four">


                      <strong className="card_listerhead_four_data">
            {statistics.maleCount}
          </strong>
<strong className="card_listerhead_four_sepration">/</strong>

            <strong className="card_listerhead_four_data">
            {statistics.femaleCount}
          </strong>

          </div>



        </div>



      </div>
          </div>

   



        </div>

      </div>


      {/* =====================================================
                         STATISTICS
      ===================================================== */}




      {/* =====================================================
                         FACULTY TABLE
      ===================================================== */}

<div className="principal-faculty-section">


  {/* =====================================================
                     SECTION HEADER
  ===================================================== */}

  {/* <div className="principal-faculty-section-header">

    <div>

      <h2>
        Faculty List
      </h2>

      <p>
        {totalRecords} faculty members found.
      </p>

    </div>

  </div> */}


  {/* =====================================================
                       FILTER BAR
  ===================================================== */}

  <div className="principal-faculty-filter-bar">


    {/* SEARCH */}

    <div className="principal-faculty-search">
<input
className="principal_faculty_search_bar"
  type="text"
  value={search}
 placeholder="Search by name, employee ID, or email ID..."
  onChange={(e) =>
    setSearch(e.target.value)
  }
  onKeyDown={(e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      setCurrentPage(1);

      fetchFaculty(1, {
        search:
          e.currentTarget.value,
      });

    }

  }}
/>

    </div>


    {/* FACULTY TYPE */}

    <div className="principal-faculty-filter">

<select
className="filter_dropdown_wrapper"
  value={facultyType}
  onChange={(e) => {

    const value =
      e.target.value;

    setFacultyType(value);
    setCurrentPage(1);

    fetchFaculty(1, {
      type: value,
    });

  }}
>
  <option value="">
    All Faculty
  </option>

  <option value="teaching">
    Teaching
  </option>

  <option value="non_teaching">
    Non Teaching
  </option>
</select>
    </div>


    {/* DESIGNATION */}

    <div className="principal-faculty-filter">

<select
className="filter_dropdown_wrapper_hlg"

  value={designation}
  onChange={(e) => {

    const value =
      e.target.value;

    setDesignation(value);
    setCurrentPage(1);

    fetchFaculty(1, {
      designation: value,
    });

  }}
>
  <option value="">
    All Designations
  </option>

  <option value="principal">
    Principal
  </option>

  <option value="hod">
    HOD
  </option>

  <option value="professor">
    Professor
  </option>

  <option value="associate_professor">
    Associate Professor
  </option>

  <option value="assistant_professor">
    Assistant Professor
  </option>

  <option value="lecturer">
    Lecturer
  </option>

  <option value="lab_incharge">
    Lab Incharge
  </option>

  <option value="office_assistant">
    Office Assistant
  </option>

  <option value="admission_officer">
    Admission Officer
  </option>
</select>

    </div>


    {/* GENDER */}

    <div className="principal-faculty-filter">

<select
className="filter_dropdown_wrapper"

  value={gender}
  onChange={(e) => {

    const value =
      e.target.value;

    setGender(value);
    setCurrentPage(1);

    fetchFaculty(1, {
      gender: value,
    });

  }}
>
  <option value="">
    All Gender
  </option>

  <option value="male">
    Male
  </option>

  <option value="female">
    Female
  </option>

  <option value="other">
    Other
  </option>
</select>

    </div>


    {/* SEARCH BUTTON */}

{/* <button
  type="button"
  className="principal-faculty-search-btn"
  onClick={() => {

    setCurrentPage(1);

    fetchFaculty(1, {
      search,
    });

  }}
>
  Search
</button> */}


    {/* RESET */}

<div
  type="button"
  className="principal-faculty-reset-btn"
  onClick={() => {

    setSearch("");
    setFacultyType("");
    setDesignation("");
    setGender("");

    setCurrentPage(1);

    fetchFaculty(1, {
      search: "",
      type: "",
      designation: "",
      gender: "",
    });

  }}
>
  <ArrowClockwiseIcon  className="reset_icon"  weight="bold" />
</div>

  </div>


  {/* =====================================================
                       TABLE
  ===================================================== */}

<div className="principal_table_stc_wrapper">


  {faculties.length === 0 ? (

  <div className="principal-faculty-empty">
    No faculty members found.
  </div>

) : (

  <div className="principal-faculty-table-wrapper">

    {/* =====================================================
                         TABLE SCROLL AREA
    ===================================================== */}

    <div className="principal-faculty-table-scroll">

      <table className="principal-faculty-table">

        {/* =================================================
                           TABLE HEAD
        ================================================= */}

        <thead className="table_header_wrapper">

          <tr>

            <th className="header_wrappper_cell">
              <h1 className="table_header_field">
                S.No
              </h1>
            </th>

            <th>
              <h1 className="table_header_field">
                Emp ID
              </h1>
            </th>

            <th>
              <h1 className="table_header_field">
                Name
              </h1>
            </th>

            <th>
              <h1 className="table_header_field">
                Mail ID
              </h1>
            </th>

            <th>
              <h1 className="table_header_field">
                Designation
              </h1>
            </th>

            <th>
              <h1 className="table_header_field">
                Gender
              </h1>
            </th>

          </tr>

        </thead>


        {/* =================================================
                           TABLE BODY
        ================================================= */}

        <tbody>

{faculties.map((faculty, index) => (

  <tr
    className="principal_data_table_row"
    key={
      faculty.userId ||
      faculty.facultyId
    }
    onClick={() => {
      navigate(`/principal/faculty/${faculty.userId}`);
    }}
  >

              {/* =========================
                         S.NO
              ========================= */}

              <td>

                <h1 className="table_body_field">

                  {
                    (currentPage - 1) *
                      limit +
                    index +
                    1
                  }

                </h1>

              </td>


              {/* =========================
                       EMPLOYEE ID
              ========================= */}

              <td>

                <h1 className="table_body_field">

                  {
                    faculty.employeeId ||
                    "-"
                  }

                </h1>

              </td>


              {/* =========================
                           NAME
              ========================= */}

              <td>

                <div className="principal-faculty-name">

                  {faculty.user?.profileImage ? (

                    <img
                      src={
                        faculty.user.profileImage
                      }
                      alt={
                        faculty.user?.fullName ||
                        "Faculty"
                      }
                    />

                  ) : (

                    <div className="principal-faculty-avatar">

                      {
                        faculty.user?.fullName
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "F"
                      }

                    </div>

                  )}

                  <span className="table_body_field">

                    {
                      faculty.user?.fullName ||
                      "-"
                    }

                  </span>

                </div>

              </td>


              {/* =========================
                           MAIL
              ========================= */}

              <td>

                <h1 className="table_body_field">

                  {
                    faculty.user?.email ||
                    "-"
                  }

                </h1>

              </td>


              {/* =========================
                       DESIGNATION
              ========================= */}

              <td>

                <span className="table_body_field">

                  {
                    faculty.designation
                      ?.replaceAll(
                        "_",
                        " "
                      ) ||
                    "-"
                  }

                </span>

              </td>


              {/* =========================
                          GENDER
              ========================= */}

              <td>

                <h1 className="table_body_field">

                  <span
                    className={
                      `principal-faculty-gender ${
                        faculty.gender ||
                        ""
                      }`
                    }
                  >

                    {
                      faculty.gender ||
                      "-"
                    }

                  </span>

                </h1>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>


    {/* =====================================================
                         PAGINATION
    ===================================================== */}

    {totalPages > 1 && (

      <div className="principal-faculty-pagination">

        {/* PREVIOUS */}

        <button
          className="prv_btn_facilty"
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
          Previous
        </button>


        {/* PAGE INFORMATION */}

        <span>

          Page{" "}

          <strong>
            {currentPage}
          </strong>

          {" "}of{" "}

          <strong>
            {totalPages}
          </strong>

        </span>


        {/* NEXT */}

        <button
          className="nxt_btn_facilty"
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
          Next
        </button>

      </div>

    )}

  </div>

)}



<div className="faculty_count_static_wrapper">

  {/* UG FACULTY */}

<div
  className="principal-faculty-stat-card_Sec"
  onClick={() =>
    handleLevelFacultyClick("UG")
  }
>

  <div className="faculty_lister_stc_card_hdr">



      <span className="prince_card_listerhead_two">
    UG Faculty #
  </span>

  <DotsThreeIcon size={32} />

  </div>


<div className="faculty_stc_container_wrapper">
  <div className="faculty_lister_stc_card_bdy">
  <h4 className="faculty_lister_stc_card_bdy_dis">total  teaching faculty </h4>

    <strong className="prince_card_listerhead_two_data">
    {statistics.ugFacultyCount}
  </strong>
</div>




<div className="faculty_toggle_wrapper">
  <div className="faculty_toggle_icon_holder">
    <ArrowFatLineRightIcon size={22} />
  </div>
</div>

</div>




</div>





<div
  className="principal-faculty-stat-card_Sec"
  onClick={() =>
    handleLevelFacultyClick("PG")
  }
>

  <div className="faculty_lister_stc_card_hdr">



      <span className="prince_card_listerhead_two">
    PG Faculty #
  </span>

  <DotsThreeIcon size={32} />

  </div>


<div className="faculty_stc_container_wrapper">
  <div className="faculty_lister_stc_card_bdy">
  <h4 className="faculty_lister_stc_card_bdy_dis">total  teaching faculty </h4>

    <strong className="prince_card_listerhead_two_data">
     {statistics.pgFacultyCount}
  </strong>
</div>




<div className="faculty_toggle_wrapper">
  <div className="faculty_toggle_icon_holder">
    <ArrowFatLineRightIcon size={22} />
  </div>
</div>

</div>




</div>


{/* PG FACULTY */}

{/* <div className="principal-faculty-stat-card">

  <span className="prince_card_listerhead_three">
    PG Faculty #
  </span>

  <strong className="prince_card_listerhead_three_data">
    {statistics.pgFacultyCount}
  </strong>

</div> */}

</div>


</div>






</div>



    {/* =====================================================
                       FACULTY LEVEL MODAL
    ===================================================== */}

    {facultyModalOpen && (

      <div
        className="faculty-level-modal-overlay"
        onClick={() => {
          setFacultyModalOpen(false);
          setFacultyModalType("");
          setLevelFaculties([]);
        }}
      >

        <div
          className="faculty-level-modal"
          onClick={(e) => e.stopPropagation()}
        >

          {/* =================================================
                              MODAL HEADER
          ================================================= */}

          <div className="faculty-level-modal-header">

            <div className="faculty-level-modal-title-wrapper">

              <h2>
                {facultyModalType} Faculty
              </h2>

              <p>
                Teaching faculty currently handling{" "}
                {facultyModalType} programs
              </p>

            </div>


            <div className="faculty-level-modal-header-right">

              <span className="faculty-level-modal-count">

                {levelFaculties.length} Faculty

              </span>


              <button
                type="button"
                className="faculty-level-modal-close"
                onClick={() => {
                  setFacultyModalOpen(false);
                  setFacultyModalType("");
                  setLevelFaculties([]);
                }}
              >
                ×
              </button>

            </div>

          </div>


          {/* =================================================
                              MODAL SEARCH
          ================================================= */}

          <div className="faculty-level-modal-toolbar">

            <input
              type="text"
              className="faculty-level-modal-search"
              placeholder="Search faculty..."
            />

          </div>


          {/* =================================================
                              TABLE
          ================================================= */}

          <div className="faculty-level-modal-table-wrapper">

            {levelFacultyLoading ? (

              <div className="faculty-level-modal-loading">

                Loading {facultyModalType} faculty...

              </div>

            ) : levelFaculties.length === 0 ? (

              <div className="faculty-level-modal-empty">

                No {facultyModalType} teaching faculty found.

              </div>

            ) : (

              <table className="faculty-level-modal-table">

                <thead>

                  <tr>

                    <th>
                      Photo
                    </th>

                    <th>
                      Emp ID
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Mail ID
                    </th>

                    <th>
                      Gender
                    </th>

                    <th>
                      Designation
                    </th>

                    <th>
                      Department
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {levelFaculties.map((faculty) => (

                    <tr
                      key={
                        faculty.userId ||
                        faculty.facultyId
                      }

                      className="faculty-level-modal-row"

                      onClick={() => {
                        console.log(
                          "Selected faculty:",
                          faculty.userId
                        );
                      }}
                    >

                      {/* =========================
                                  PHOTO
                      ========================= */}

                      <td>

                        {faculty.user?.profileImage ? (

                          <img
                            src={
                              faculty.user.profileImage
                            }
                            alt={
                              faculty.user?.fullName ||
                              "Faculty"
                            }
                            className="faculty-level-modal-profile"
                          />

                        ) : (

                          <div className="faculty-level-modal-avatar">

                            {
                              faculty.user?.fullName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                              "F"
                            }

                          </div>

                        )}

                      </td>


                      {/* =========================
                                EMPLOYEE ID
                      ========================= */}

                      <td>

                        <span className="faculty-level-modal-cell">

                          {faculty.employeeId || "-"}

                        </span>

                      </td>


                      {/* =========================
                                  NAME
                      ========================= */}

                      <td>

                        <span className="faculty-level-modal-name">

                          {faculty.user?.fullName || "-"}

                        </span>

                      </td>


                      {/* =========================
                                  EMAIL
                      ========================= */}

                      <td>

                        <span className="faculty-level-modal-cell">

                          {faculty.user?.email || "-"}

                        </span>

                      </td>


                      {/* =========================
                                  GENDER
                      ========================= */}

                      <td>

                        <span className="faculty-level-modal-cell">

                          {faculty.gender || "-"}

                        </span>

                      </td>


                      {/* =========================
                                DESIGNATION
                      ========================= */}

                      <td>

                        <span className="faculty-level-modal-designation">

                          {faculty.designation
                            ?.replaceAll("_", " ") ||
                            "-"}

                        </span>

                      </td>


                      {/* =========================
                                  DEPARTMENT
                      ========================= */}

                      <td>

                        <span className="faculty-level-modal-cell">

                          {
                            faculty.department
                              ?.departmentName ||
                            "-"
                          }

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            )}

          </div>


          {/* =================================================
                              MODAL FOOTER
          ================================================= */}

          <div className="faculty-level-modal-footer">

            <span>
              Showing {levelFaculties.length}{" "}
              {facultyModalType} faculty
            </span>

            <button
              type="button"
              className="faculty-level-modal-cancel"
              onClick={() => {
                setFacultyModalOpen(false);
                setFacultyModalType("");
                setLevelFaculties([]);
              }}
            >
              Close
            </button>

          </div>

        </div>

      </div>

    )}

    </div>

  );

};


export default PrincipalFacultyPage;