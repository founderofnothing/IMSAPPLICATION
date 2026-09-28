import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { toast } from "react-toastify";

import API from "../../../api/axios";

import {
  ArrowLeftIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react";

import "./SingleFacultyProfile.css";


const SingleFacultyProfile = () => {

  /* =========================================================
                         ROUTER
  ========================================================= */

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  /* =========================================================
                         FACULTY
  ========================================================= */

  const [
    faculty,
    setFaculty,
  ] = useState(null);


  /* =========================================================
                         LOADING
  ========================================================= */

  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =========================================================
                         ACTIVE SECTION
  ========================================================= */

  const [
    activeSection,
    setActiveSection,
  ] = useState("attendance");


const [facultyTimetable, setFacultyTimetable] = useState(null);
const [timetableLoading, setTimetableLoading] = useState(false);

const [facultyAttendance, setFacultyAttendance] = useState(null);
const [attendanceLoading, setAttendanceLoading] = useState(false);
const [facultyId, setFacultyId] = useState(null);
  /* =========================================================
                   FETCH FACULTY PROFILE
  ========================================================= */

/* =========================================================
                 FETCH FACULTY PROFILE
========================================================= */

const fetchFacultyProfile = async () => {
  try {
    setLoading(true);

    const response = await API.get(`/users/${id}`);

    console.log(
      "FACULTY PROFILE RESPONSE:",
      response.data
    );

    const profileData = response.data?.data || null;

    // TeachingFaculty document ID
    const actualFacultyId =
      profileData?.profile?._id || null;

    console.log(
      "ACTUAL FACULTY ID:",
      actualFacultyId
    );

    if (!actualFacultyId) {
      console.error(
        "Faculty ID not found in profile response."
      );
      toast.error(
        "Faculty profile information is incomplete."
      );
      setFaculty(null);
      return null;
    }

    // Store complete user/profile response
    setFaculty(profileData);

    // Store TeachingFaculty ID
    setFacultyId(actualFacultyId);

    return actualFacultyId;

  } catch (error) {
    console.error(
      "Fetch faculty profile error:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch faculty profile."
    );

    setFaculty(null);
    setFacultyId(null);

    return null;

  } finally {
    setLoading(false);
  }
};


    /* =========================================================
              FETCH FACULTY ATTENDANCE
========================================================= */

/* =========================================================
              FETCH FACULTY ATTENDANCE
========================================================= */

const fetchFacultyAttendance = async () => {
  try {
    setAttendanceLoading(true);

    if (!facultyId) {
      console.error(
        "Faculty ID not available for attendance."
      );
      setFacultyAttendance(null);
      return;
    }

    console.log(
      "FETCHING ATTENDANCE FOR FACULTY ID:",
      facultyId
    );

    const response = await API.get(
      `/faculty-attendance/faculty/${facultyId}`
    );

    console.log(
      "FACULTY ATTENDANCE RESPONSE:",
      response.data
    );

    setFacultyAttendance(
      response.data || null
    );

  } catch (error) {
    console.error(
      "Fetch faculty attendance error:",
      error.response?.data || error
    );

    setFacultyAttendance(null);

  } finally {
    setAttendanceLoading(false);
  }
};

    /* =========================================================
              FETCH FACULTY TIMETABLE
========================================================= */

const fetchFacultyTimetable = async () => {
  try {
    setTimetableLoading(true);

    if (!facultyId) {
      console.error(
        "Faculty ID not available for timetable."
      );

      setFacultyTimetable(null);
      return;
    }

    console.log(
      "FETCHING TIMETABLE FOR FACULTY ID:",
      facultyId
    );

    const response = await API.get(
      `/timetable/faculty/${facultyId}`
    );

    console.log(
      "FACULTY TIMETABLE RESPONSE:",
      response.data
    );

    const timetableData =
      response.data?.data;

    setFacultyTimetable(
      timetableData?.timetable || null
    );

  } catch (error) {
    console.error(
      "Fetch faculty timetable error:",
      error
    );

    console.error(
      "Timetable error response:",
      error.response?.data
    );

    console.error(
      "Timetable error status:",
      error.response?.status
    );

    setFacultyTimetable(null);

  } finally {
    setTimetableLoading(false);
  }
};

  /* =========================================================
                         INITIAL LOAD
  ========================================================= */

/* =========================================================
                       INITIAL LOAD
========================================================= */

useEffect(() => {
  if (!id) {
    toast.error(
      "Faculty information not found."
    );

    setLoading(false);
    return;
  }

  fetchFacultyProfile();
}, [id]);

useEffect(() => {
  if (!facultyId) return;

  console.log(
    "FACULTY ID READY:",
    facultyId
  );

  fetchFacultyAttendance();
  fetchFacultyTimetable();
}, [facultyId]);

  /* =========================================================
                         HELPERS
  ========================================================= */

  const formatLabel =
    (value) => {

      if (!value) {
        return "-";
      }

      if (typeof value !== "string") {
        return "-";
      }

      return value
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        );

    };


  const formatDate =
    (value) => {

      if (!value) {
        return "-";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }

      return date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    };


  /* =========================================================
                         FORMAT ADDRESS
  ========================================================= */

  const formatAddress =
    (address) => {

      if (!address) {
        return "-";
      }


      /*
       * If backend ever returns an address
       * as a simple string.
       */

      if (
        typeof address === "string"
      ) {

        return address;

      }


      /*
       * Current API returns address
       * as an object.
       */

      if (
        typeof address === "object"
      ) {

        return [
          address.addressLine1,
          address.addressLine2,
          address.city,
          address.district,
          address.state,
          address.pincode,
        ]
          .filter(Boolean)
          .join(", ");

      }


      return "-";

    };


  /* =========================================================
                         GET INITIALS
  ========================================================= */

  const getInitials =
    (name) => {

      if (!name) {
        return "F";
      }

      return name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map(
          (part) =>
            part.charAt(0)
              .toUpperCase()
        )
        .join("");

    };

    /* =========================================================
                    TIMETABLE HELPERS
========================================================= */

const timetableDays = [
  {
    order: 1,
    name: "Monday",
  },
  {
    order: 2,
    name: "Tuesday",
  },
  {
    order: 3,
    name: "Wednesday",
  },
  {
    order: 4,
    name: "Thursday",
  },
  {
    order: 5,
    name: "Friday",
  },
  {
    order: 6,
    name: "Saturday",
  },
];


const getTeachingPeriods = () => {

  if (!facultyTimetable) {
    return 0;
  }

  return timetableDays.reduce(
    (total, day) => {

      const periods =
        facultyTimetable[day.name] || [];

      return (
        total +
        periods.filter(
          (period) =>
            period.type === "Teaching"
        ).length
      );

    },
    0
  );

};

/* =========================================================
                  ATTENDANCE HELPERS
========================================================= */

const getAttendanceRecord = (date) => {
  if (!facultyAttendance?.attendance) {
    return null;
  }

  const targetDate = new Date(date);

  return facultyAttendance.attendance.find(
    (record) => {
      const recordDate = new Date(record.date);

      return (
        recordDate.getFullYear() ===
          targetDate.getFullYear() &&
        recordDate.getMonth() ===
          targetDate.getMonth() &&
        recordDate.getDate() ===
          targetDate.getDate()
      );
    }
  );
};


const getAttendanceMonth = () => {
  if (
    !facultyAttendance?.attendance?.length
  ) {
    return new Date();
  }

  return new Date(
    facultyAttendance.attendance[
      facultyAttendance.attendance.length - 1
    ].date
  );
};


const getAttendanceCalendar = () => {
  const selectedDate =
    getAttendanceMonth();

  const year =
    selectedDate.getFullYear();

  const month =
    selectedDate.getMonth();

  const firstDay =
    new Date(year, month, 1);

  const lastDay =
    new Date(year, month + 1, 0);

  const startDay =
    firstDay.getDay();

  const totalDays =
    lastDay.getDate();

  const days = [];

  // Previous month empty slots
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Current month
  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {
    days.push(
      new Date(year, month, day)
    );
  }

  return {
    year,
    month,
    days,
  };
};


const getAttendanceMonthLabel = () => {
  const {
    year,
    month,
  } = getAttendanceCalendar();

  return new Date(
    year,
    month,
    1
  ).toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
};


  /* =========================================================
                         LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="single-faculty-profile-page">

        <div className="single-faculty-profile-loading">

          Loading faculty profile...

        </div>

      </div>

    );

  }


  /* =========================================================
                          EMPTY
  ========================================================= */

  if (!faculty) {

    return (

      <div className="single-faculty-profile-page">

        <div className="single-faculty-profile-empty">

          <h2>
            Faculty profile not found
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
          >
            Go Back
          </button>

        </div>

      </div>

    );

  }


  /* =========================================================
                       PROFILE DATA
  ========================================================= */

  const profile =
    faculty.profile || {};


  /* =========================================================
                         RENDER
  ========================================================= */

  return (

    <div className="single-faculty-profile-page">


      {/* =====================================================
                            PAGE HEADER
      ===================================================== */}

      <div className="single-faculty-profile-header">

        <button
          type="button"
          className="single-faculty-profile-back"
          onClick={() =>
            navigate(-1)
          }
        >

          <ArrowLeftIcon
            size={20}
            weight="bold"
          />

          <span>
            Back
          </span>

        </button>


        <div>

          <h1>
            Faculty Profile
          </h1>

          <p>
            Faculty information and academic details
          </p>

        </div>

      </div>


      {/* =====================================================
                         MAIN CONTENT
      ===================================================== */}

      <div className="single-faculty-profile-layout">


        {/* ===================================================
                              LEFT SIDE
        =================================================== */}

        <aside className="single-faculty-profile-left">


          {/* =================================================
                           IDENTITY
          ================================================= */}

          <section className="single-faculty-profile-identity">

            {faculty.profileImage ? (

              <img
                src={faculty.profileImage}
                alt={
                  faculty.fullName ||
                  "Faculty"
                }
                className="single-faculty-profile-image"
              />

            ) : (

              <div className="single-faculty-profile-avatar">

                {getInitials(
                  faculty.fullName
                )}

              </div>

            )}


            <h2>
              {faculty.fullName ||
                "-"}
            </h2>


            <p className="single-faculty-profile-designation">

              {formatLabel(
                profile.designation
              )}

            </p>


            <p className="single-faculty-profile-department">

              {faculty.department?.departmentName ||
                profile.department?.departmentName ||
                "Department not available"}

            </p>


            <span className="single-faculty-profile-employee-id">

              {profile.employeeId ||
                "Employee ID not available"}

            </span>

          </section>


          {/* =================================================
                        PERSONAL INFORMATION
          ================================================= */}

          <section className="single-faculty-profile-section">

            <h3>
              Personal Information
            </h3>


            <div className="single-faculty-profile-info-grid">


              {/* GENDER */}

              <div className="single-faculty-profile-info-item">

                <span>
                  Gender
                </span>

                <strong>
                  {formatLabel(
                    profile.gender
                  )}
                </strong>

              </div>


              {/* DATE OF BIRTH */}

              <div className="single-faculty-profile-info-item">

                <span>
                  Date of Birth
                </span>

                <strong>
                  {formatDate(
                    profile.dateOfBirth
                  )}
                </strong>

              </div>


              {/* NATIONALITY */}

              <div className="single-faculty-profile-info-item">

                <span>
                  Nationality
                </span>

                <strong>
                  {profile.nationality ||
                    "-"}
                </strong>

              </div>


              {/* BLOOD GROUP */}

              <div className="single-faculty-profile-info-item">

                <span>
                  Blood Group
                </span>

                <strong>
                  {profile.bloodGroup ||
                    "-"}
                </strong>

              </div>


              {/* MARITAL STATUS */}

              <div className="single-faculty-profile-info-item">

                <span>
                  Marital Status
                </span>

                <strong>
                  {formatLabel(
                    profile.maritalStatus
                  )}
                </strong>

              </div>


              {/* FATHER / SPOUSE */}

              <div className="single-faculty-profile-info-item">

                <span>
                  Father / Spouse
                </span>

                <strong>
                  {profile.fatherOrSpouseName ||
                    "-"}
                </strong>

              </div>


            </div>

          </section>


          {/* =================================================
                         CONTACT INFORMATION
          ================================================= */}

          <section className="single-faculty-profile-section">

            <h3>
              Contact Information
            </h3>


            {/* EMAIL */}

            <div className="single-faculty-profile-contact-item">

              <EnvelopeSimpleIcon
                size={19}
                weight="regular"
              />

              <div>

                <span>
                  Email
                </span>

                <strong>
                  {faculty.email ||
                    "-"}
                </strong>

              </div>

            </div>


            {/* PHONE */}

            <div className="single-faculty-profile-contact-item">

              <PhoneIcon
                size={19}
                weight="regular"
              />

              <div>

                <span>
                  Phone
                </span>

                <strong>
                  {faculty.phone ||
                    "-"}
                </strong>

              </div>

            </div>


            {/* EMERGENCY CONTACT */}

            <div className="single-faculty-profile-contact-item">

              <UserIcon
                size={19}
                weight="regular"
              />

              <div>

                <span>
                  Emergency Contact
                </span>

                <strong>
                  {profile.emergencyContact
                    ?.phone ||
                    profile.emergencyContact
                      ?.contactNumber ||
                    "-"}
                </strong>

              </div>

            </div>


          </section>


          {/* =================================================
                             ADDRESS
          ================================================= */}

          <section className="single-faculty-profile-section">

            <h3>
              Address
            </h3>


            {/* COMMUNICATION ADDRESS */}

            <div className="single-faculty-profile-address">

              <MapPinIcon
                size={19}
                weight="regular"
              />

              <div>

                <span>
                  Communication Address
                </span>

                <p>
                  {formatAddress(
                    profile.communicationAddress
                  )}
                </p>

              </div>

            </div>


            {/* PERMANENT ADDRESS */}

            <div className="single-faculty-profile-address">

              <MapPinIcon
                size={19}
                weight="regular"
              />

              <div>

                <span>
                  Permanent Address
                </span>

                <p>
                  {formatAddress(
                    profile.permanentAddress
                  )}
                </p>

              </div>

            </div>


          </section>


          {/* =================================================
                    ACADEMIC QUALIFICATIONS
          ================================================= */}

          <section className="single-faculty-profile-section">

            <h3>
              Academic Qualifications
            </h3>


            {Array.isArray(
              profile.academicQualifications
            ) &&
            profile.academicQualifications.length >
              0 ? (

              <div className="single-faculty-profile-qualification-list">

                {profile.academicQualifications.map(
                  (qualification, index) => (

                    <div
                      key={index}
                      className="single-faculty-profile-qualification"
                    >

                      <GraduationCapIcon
                        size={20}
                        weight="regular"
                      />

                      <div>

                        <strong>
                          {
                            qualification.degree ||
                            qualification.qualification ||
                            qualification.name ||
                            "-"
                          }
                        </strong>

                        <span>
                          {
                            qualification.institutionName ||
                            qualification.institution ||
                            qualification.university ||
                            "-"
                          }
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="single-faculty-profile-no-data">

                No academic qualifications available.

              </p>

            )}

          </section>


          {/* =================================================
                       TEACHING EXPERIENCE
          ================================================= */}

          <section className="single-faculty-profile-section">

            <h3>
              Teaching Experience
            </h3>


            {/* EXPERIENCE SUMMARY */}

            <div className="single-faculty-profile-experience-summary">

              <BriefcaseIcon
                size={20}
                weight="regular"
              />

              <div>

                <strong>

                  {
                    profile.totalTeachingExperience?.years ??
                    0
                  }{" "}

                  Years{" "}

                  {
                    profile.totalTeachingExperience?.months ??
                    0
                  }{" "}

                  Months

                </strong>

                <span>
                  Total teaching experience
                </span>

              </div>

            </div>


            {/* EXPERIENCE LIST */}

            {Array.isArray(
              profile.teachingExperience
            ) &&
            profile.teachingExperience.length >
              0 && (

              <div className="single-faculty-profile-experience-list">

                {profile.teachingExperience.map(
                  (experience, index) => (

                    <div
                      key={index}
                      className="single-faculty-profile-experience"
                    >

                      <div>

                        <strong>
                          {
                            experience.institutionName ||
                            "-"
                          }
                        </strong>

                        <span>
                          {formatLabel(
                            experience.designation
                          )}
                        </span>

                      </div>


                      <div>

                        <span>

                          {formatDate(
                            experience.fromDate
                          )}

                          {" "}—{" "}

                          {formatDate(
                            experience.toDate
                          )}

                        </span>


                        <small>

                          Level:{" "}

                          {
                            experience.level ||
                            "-"
                          }

                        </small>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </section>


        </aside>


        {/* ===================================================
                             RIGHT SIDE
        =================================================== */}

        <main className="single-faculty-profile-right">


          {/* =================================================
                          SECTION NAVIGATION
          ================================================= */}

          <div className="single-faculty-profile-tabs">


            {/* ATTENDANCE */}

            <button
              type="button"
              className={
                activeSection === "attendance"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection(
                  "attendance"
                )
              }
            >

              Attendance

            </button>


            {/* ASSIGNED HOURS */}

            <button
              type="button"
              className={
                activeSection === "hours"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection(
                  "hours"
                )
              }
            >

              Assigned Hours

            </button>


            {/* APPRAISAL */}

            <button
              type="button"
              className={
                activeSection === "appraisal"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveSection(
                  "appraisal"
                )
              }
            >

              Appraisal

            </button>


          </div>


          {/* =================================================
                         RIGHT CONTENT
          ================================================= */}

          <div className="single-faculty-profile-right-content">


            {/* =================================================
                           ATTENDANCE
            ================================================= */}

{/* =================================================
                    ATTENDANCE
================================================= */}

{activeSection === "attendance" && (

  <section className="single-faculty-profile-workspace">

    {/* =====================================================
                          HEADER
    ===================================================== */}

    <div className="single-faculty-profile-workspace-header">

      <div>

        <h2>
          Attendance
        </h2>

        <p>
          Faculty attendance overview
        </p>

      </div>

      <CalendarBlankIcon
        size={24}
        weight="regular"
      />

    </div>


    {/* =====================================================
                          LOADING
    ===================================================== */}

    {attendanceLoading ? (

      <div className="single-faculty-profile-placeholder">

        Loading attendance...

      </div>

    ) : facultyAttendance ? (

      <>

        {/* =================================================
                         SUMMARY
        ================================================= */}

        <div className="single-faculty-profile-attendance-summary">

          <div className="single-faculty-profile-attendance-stat">

            <span>
              Total Days
            </span>

            <strong>
              {facultyAttendance.totalRecords ?? 0}
            </strong>

          </div>


          <div className="single-faculty-profile-attendance-stat">

            <span>
              Present
            </span>

            <strong>
              {
                facultyAttendance.attendance?.filter(
                  (record) =>
                    record.status === "present"
                ).length ?? 0
              }
            </strong>

          </div>


          <div className="single-faculty-profile-attendance-stat">

            <span>
              Absent
            </span>

            <strong>
              {
                facultyAttendance.attendance?.filter(
                  (record) =>
                    record.status === "absent"
                ).length ?? 0
              }
            </strong>

          </div>


          <div className="single-faculty-profile-attendance-stat">

            <span>
              Attendance
            </span>

            <strong>
              {
                facultyAttendance.totalRecords
                  ? `${Math.round(
                      (
                        facultyAttendance.attendance.filter(
                          (record) =>
                            record.status ===
                            "present"
                        ).length /
                        facultyAttendance.totalRecords
                      ) * 100
                    )}%`
                  : "0%"
              }
            </strong>

          </div>

        </div>


        {/* =================================================
                     MONTH HEADER
        ================================================= */}

        <div className="single-faculty-profile-attendance-month-header">

          <div>

            <h3>
              {getAttendanceMonthLabel()}
            </h3>

            <p>
              Daily attendance
            </p>

          </div>


          <div className="single-faculty-profile-attendance-legend">

            <div>

              <span className="present" />

              <span>
                Present
              </span>

            </div>


            <div>

              <span className="absent" />

              <span>
                Absent
              </span>

            </div>


            <div>

              <span className="no-record" />

              <span>
                No Record
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
                    ATTENDANCE HEATMAP
        ================================================= */}

        <div className="single-faculty-profile-attendance-heatmap">

          {/* WEEK DAYS */}

          <div className="single-faculty-profile-attendance-weekdays">

            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (

              <div
                key={day}
                className="single-faculty-profile-attendance-weekday"
              >
                {day}
              </div>

            ))}

          </div>


          {/* DATE GRID */}

          <div className="single-faculty-profile-attendance-grid">

            {getAttendanceCalendar().days.map(
              (date, index) => {

                if (!date) {

                  return (
                    <div
                      key={`empty-${index}`}
                      className="single-faculty-profile-attendance-day empty"
                    />
                  );

                }


                const record =
                  getAttendanceRecord(date);


                const status =
                  record?.status ||
                  "no-record";


                return (

                  <div
                    key={date.toISOString()}
                    className={`single-faculty-profile-attendance-day ${status}`}
                  >

                    <span className="single-faculty-profile-attendance-date">
                      {date.getDate()}
                    </span>


                    <span className="single-faculty-profile-attendance-day-status">

                      {status === "present"
                        ? "P"
                        : status === "absent"
                        ? "A"
                        : "—"}

                    </span>

                  </div>

                );

              }
            )}

          </div>

        </div>


        {/* =================================================
                    ATTENDANCE RECORDS
        ================================================= */}

        <div className="single-faculty-profile-attendance-recent">

          <div className="single-faculty-profile-attendance-recent-header">

            <h3>
              Attendance Records
            </h3>

            <span>
              {facultyAttendance.totalRecords ?? 0} records
            </span>

          </div>


          <div className="single-faculty-profile-attendance-record-list">

            {facultyAttendance.attendance?.map(
              (record) => (

                <div
                  key={record._id}
                  className="single-faculty-profile-attendance-record"
                >

                  <div>

                    <strong>
                      {formatDate(record.date)}
                    </strong>

                    <span>
                      {record.source ===
                      "excel_upload"
                        ? "Excel Upload"
                        : "Manual"}
                    </span>

                  </div>


                  <span
                    className={`single-faculty-profile-attendance-status ${
                      record.status
                    }`}
                  >
                    {formatLabel(
                      record.status
                    )}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      </>

    ) : (

      <div className="single-faculty-profile-placeholder">

        No attendance information available.

      </div>

    )}

  </section>

)}


            {/* =================================================
                         ASSIGNED HOURS
            ================================================= */}

{/* =================================================
                  ASSIGNED HOURS
================================================= */}

{activeSection === "hours" && (

  <section className="single-faculty-profile-workspace">

    {/* =====================================================
                        HEADER
    ===================================================== */}

    <div className="single-faculty-profile-workspace-header">

      <div>

        <h2>
          Assigned Class Hours
        </h2>

        <p>
          Weekly teaching timetable
        </p>

      </div>

      <BriefcaseIcon
        size={24}
        weight="regular"
      />

    </div>


    {/* =====================================================
                        LOADING
    ===================================================== */}

    {timetableLoading ? (

      <div className="single-faculty-profile-placeholder">

        Loading timetable...

      </div>

    ) : facultyTimetable ? (

      <>

        {/* =================================================
                      WEEKLY SUMMARY
        ================================================= */}

        <div className="single-faculty-profile-hours-summary">

          <div>

            <span>
              Weekly Assigned Periods
            </span>

            <strong>
              {getTeachingPeriods()}
            </strong>

          </div>


          <div>

            <span>
              Working Days
            </span>

            <strong>
              {
                timetableDays.filter(
                  (day) =>
                    (
                      facultyTimetable[
                        day.name
                      ] || []
                    ).some(
                      (period) =>
                        period.type ===
                        "Teaching"
                    )
                ).length
              }
            </strong>

          </div>

        </div>


        {/* =================================================
                    WEEKLY HEATMAP
        ================================================= */}

        <div className="single-faculty-profile-timetable">

          {/* =================================================
                       TOP PERIOD HEADER
          ================================================= */}

          <div className="single-faculty-profile-timetable-header">

            {/* DAY LABEL */}

            <div className="single-faculty-profile-timetable-period-label">

              Day

            </div>


            {/* PERIODS */}

            {Array.from(
              {
                length: Math.max(
                  ...timetableDays.map(
                    (day) =>
                      (
                        facultyTimetable[
                          day.name
                        ] || []
                      ).length
                  ),
                  0
                ),
              }
            ).map(
              (_, periodIndex) => {

                const periodNumber =
                  periodIndex + 1;

                return (

                  <div
                    key={periodNumber}
                    className="single-faculty-profile-timetable-period-header"
                  >

                    <span>
                      {periodNumber}
                    </span>

                    <small>
                      Hour
                    </small>

                  </div>

                );

              }
            )}

          </div>


          {/* =================================================
                       DAY ROWS
          ================================================= */}

          {timetableDays.map(
            (day) => {

              const periods =
                facultyTimetable[
                  day.name
                ] || [];


              const totalPeriods =
                Math.max(
                  ...timetableDays.map(
                    (item) =>
                      (
                        facultyTimetable[
                          item.name
                        ] || []
                      ).length
                  ),
                  0
                );


              return (

                <div
                  key={day.name}
                  className="single-faculty-profile-timetable-row"
                >

                  {/* =================================================
                              DAY LABEL
                  ================================================= */}

                  <div className="single-faculty-profile-timetable-day-label">

                    <span>
                      {day.order}
                    </span>

                    <strong>
                      {day.name}
                    </strong>

                  </div>


                  {/* =================================================
                              PERIOD CELLS
                  ================================================= */}

                  {Array.from(
                    {
                      length:
                        totalPeriods,
                    }
                  ).map(
                    (_, periodIndex) => {

                      const periodNumber =
                        periodIndex + 1;


                      const period =
                        periods.find(
                          (item) =>
                            item.periodNumber ===
                            periodNumber
                        );


                      {/* EMPTY */}

                      if (!period) {

                        return (

                          <div
                            key={
                              periodNumber
                            }
                            className="single-faculty-profile-timetable-cell empty"
                          >

                            —

                          </div>

                        );

                      }


                      {/* ===============================
                              TEACHING
                      =============================== */}

                      if (
                        period.type ===
                        "Teaching"
                      ) {

                        return (

                          <div
                            key={
                              periodNumber
                            }
                            className="single-faculty-profile-timetable-cell teaching"
                          >

                            <div className="single-faculty-profile-timetable-subject">

                              {period.subject
                                ?.subjectName ||
                                "Subject"}

                            </div>


                            {period.subject
                              ?.subjectCode && (

                              <div className="single-faculty-profile-timetable-subject-code">

                                {
                                  period.subject
                                    .subjectCode
                                }

                              </div>

                            )}


                            <div className="single-faculty-profile-timetable-class">

                              {period.class
                                ?.programme
                                ?.programmeCode ||
                                period.class
                                  ?.programme
                                  ?.programmeName ||
                                "Class"}

                              {period.class
                                ?.section
                                ? ` - ${period.class.section}`
                                : ""}

                            </div>


                            {period.class
                              ?.batchId
                              ?.batchName && (

                              <div className="single-faculty-profile-timetable-batch">

                                {
                                  period.class
                                    .batchId
                                    .batchName
                                }

                              </div>

                            )}

                          </div>

                        );

                      }


                      {/* ===============================
                                BREAK
                      =============================== */}

                      if (
                        period.type ===
                        "Break"
                      ) {

                        return (

                          <div
                            key={
                              periodNumber
                            }
                            className="single-faculty-profile-timetable-cell break"
                          >

                            Break

                          </div>

                        );

                      }


                      {/* ===============================
                                LUNCH
                      =============================== */}

                      if (
                        period.type ===
                        "Lunch"
                      ) {

                        return (

                          <div
                            key={
                              periodNumber
                            }
                            className="single-faculty-profile-timetable-cell lunch"
                          >

                            Lunch

                          </div>

                        );

                      }


                      {/* ===============================
                                  FREE
                      =============================== */}

                      return (

                        <div
                          key={
                            periodNumber
                          }
                          className="single-faculty-profile-timetable-cell free"
                        >

                          Free

                        </div>

                      );

                    }
                  )}

                </div>

              );

            }
          )}

        </div>

      </>

    ) : (

      <div className="single-faculty-profile-placeholder">

        No timetable information available.

      </div>

    )}

  </section>

)}


            {/* =================================================
                            APPRAISAL
            ================================================= */}

            {activeSection === "appraisal" && (

              <section className="single-faculty-profile-workspace">


                <div className="single-faculty-profile-workspace-header">

                  <div>

                    <h2>
                      Appraisal
                    </h2>

                    <p>
                      Faculty appraisal information
                    </p>

                  </div>


                </div>


                <div className="single-faculty-profile-placeholder">

                  Appraisal section will be added later.

                </div>


              </section>

            )}


          </div>


        </main>


      </div>


    </div>

  );

};


export default SingleFacultyProfile;