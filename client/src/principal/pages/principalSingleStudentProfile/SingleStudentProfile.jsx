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
  UserIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  MapPinIcon,
  GraduationCapIcon,
  IdentificationCardIcon,
  BuildingsIcon,
  UsersThreeIcon,
  CalendarBlankIcon,
  ExamIcon,
  CurrencyCircleDollarIcon,
  ReceiptIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

import "./SingleStudentProfile.css";


const SingleStudentProfile = () => {

  /* =========================================================
                          ROUTER
  ========================================================= */

  const {
    studentId,
  } = useParams();

  const navigate =
    useNavigate();


  /* =========================================================
                          STUDENT
  ========================================================= */

  const [
    student,
    setStudent,
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


  /* =========================================================
                         FEES STATE
  ========================================================= */

  const [
    payments,
    setPayments,
  ] = useState([]);

  const [
    paymentSummary,
    setPaymentSummary,
  ] = useState({
    totalPayments: 0,
    totalPaid: 0,
  });

  const [
    paymentLoading,
    setPaymentLoading,
  ] = useState(false);


  /* =========================================================
                         EXAM STATE
  ========================================================= */

  const [
    examResults,
    setExamResults,
  ] = useState([]);

  const [
    examLoading,
    setExamLoading,
  ] = useState(false);


  /* =========================================================
                      ATTENDANCE STATE
  ========================================================= */

  const [
    attendanceData,
    setAttendanceData,
  ] = useState(null);

  const [
    attendanceLoading,
    setAttendanceLoading,
  ] = useState(false);


  /* =========================================================
                     HELPER FUNCTIONS
  ========================================================= */

  const getValue = (value) => {
    return value || "—";
  };


  const getInitials = (name) => {

    if (!name) {
      return "ST";
    }

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };


  const formatDate = (value) => {

    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
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


  const formatLabel = (value) => {

    if (!value) {
      return "—";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };


  /* =========================================================
                  FETCH STUDENT PROFILE
  ========================================================= */

  const fetchStudent = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          `/students/${studentId}`
        );

      console.log(
        "SINGLE STUDENT PROFILE RESPONSE:",
        response.data
      );

      setStudent(
        response.data?.data || null
      );

    } catch (error) {

      console.error(
        "Fetch student profile error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch student profile."
      );

      setStudent(null);

    } finally {

      setLoading(false);

    }
  };


  /* =========================================================
                  FETCH PAYMENT HISTORY
  ========================================================= */

  const fetchPaymentHistory = async () => {

    try {

      setPaymentLoading(true);

      const response =
        await API.get(
          `/fees-allocation/payment/student/${studentId}`
        );

      console.log(
        "STUDENT PAYMENT RESPONSE:",
        response.data
      );

      setPayments(
        response.data?.data || []
      );

      setPaymentSummary({
        totalPayments:
          response.data?.totalPayments || 0,

        totalPaid:
          response.data?.totalPaid || 0,
      });

    } catch (error) {

      /*
       * No payment history is a valid state.
       */

      if (
        error.response?.data?.message ===
        "No payment history found."
      ) {

        setPayments([]);

        setPaymentSummary({
          totalPayments: 0,
          totalPaid: 0,
        });

        return;
      }

      console.error(
        "Fetch payment history error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch payment history."
      );

    } finally {

      setPaymentLoading(false);

    }
  };


  /* =========================================================
                    FETCH EXAM RESULTS
  ========================================================= */

  const fetchExamResults = async () => {

    try {

      setExamLoading(true);

      const response =
        await API.get(
          `/exams/student-exam-result/${studentId}`
        );

      console.log(
        "STUDENT EXAM RESPONSE:",
        response.data
      );

      const result =
        response.data;

      if (!result?.success) {

        toast.error(
          result?.message ||
          "Failed to fetch exam results."
        );

        return;
      }

      setExamResults(
        result.data?.results || []
      );

    } catch (error) {

      console.error(
        "Fetch exam results error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch exam results."
      );

    } finally {

      setExamLoading(false);

    }
  };


  /* =========================================================
                  FETCH STUDENT ATTENDANCE
  ========================================================= */

  const fetchStudentAttendance = async () => {

    try {

      setAttendanceLoading(true);

      const response =
        await API.get(
          `/Attendance/student/${studentId}`
        );

      console.log(
        "STUDENT ATTENDANCE RESPONSE:",
        response.data
      );

      setAttendanceData(
        response.data?.data || null
      );

    } catch (error) {

      console.error(
        "Fetch student attendance error:",
        error.response?.data || error
      );

      setAttendanceData(null);

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch attendance details."
      );

    } finally {

      setAttendanceLoading(false);

    }
  };


  /* =========================================================
                     INITIAL PROFILE FETCH
  ========================================================= */

  useEffect(() => {

    if (!studentId) {

      toast.error(
        "Student information not found."
      );

      setLoading(false);

      return;
    }

    fetchStudent();

  }, [studentId]);


  /* =========================================================
                   ATTENDANCE TAB FETCH
  ========================================================= */

  useEffect(() => {

    if (
      activeSection === "attendance" &&
      studentId
    ) {

      fetchStudentAttendance();

    }

  }, [
    activeSection,
    studentId,
  ]);


  /* =========================================================
                     EXAM TAB FETCH
  ========================================================= */

  useEffect(() => {

    if (
      activeSection === "exam" &&
      studentId
    ) {

      fetchExamResults();

    }

  }, [
    activeSection,
    studentId,
  ]);


  /* =========================================================
                     FEES TAB FETCH
  ========================================================= */

  useEffect(() => {

    if (
      activeSection === "fees" &&
      studentId
    ) {

      fetchPaymentHistory();

    }

  }, [
    activeSection,
    studentId,
  ]);


  /* =========================================================
                         LOADING
  ========================================================= */

  if (loading) {

    return (
      <div className="single-student-profile-page-loading">

        <div className="single-student-profile-loading-card">

          <div className="single-student-profile-loading-spinner" />

          <span>
            Loading student profile...
          </span>

        </div>

      </div>
    );
  }


  /* =========================================================
                       STUDENT NOT FOUND
  ========================================================= */

  if (!student) {

    return (
      <div className="single-student-profile-page-empty">

        <div className="single-student-profile-empty-card">

          <UserIcon
            size={38}
            weight="regular"
          />

          <h3>
            Student not found
          </h3>

          <p>
            The requested student profile
            could not be loaded.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
          >
            <ArrowLeftIcon
              size={18}
              weight="bold"
            />

            <span>
              Back to Students
            </span>
          </button>

        </div>

      </div>
    );
  }


  /* =========================================================
                      STUDENT VARIABLES
  ========================================================= */

  const studentName =
    student.studentName ||
    "Student";

  const registerNumber =
    student.registerNumber ||
    "Register number unavailable";

  const departmentName =
    student.departmentId?.departmentName ||
    "Department not available";

  const programmeName =
    student.programmeId?.programmeName ||
    "Programme not available";

  const programmeCode =
    student.programmeId?.programmeCode ||
    "";

  const batchName =
    student.batchId?.batchName ||
    "Batch unavailable";

  const section =
    student.classId?.section ||
    "Section unavailable";


  /* =========================================================
                            RENDER
  ========================================================= */

  return (

    <div className="single-student-profile-page">


      {/* =====================================================
                            HEADER
      ===================================================== */}

      <div className="single-student-profile-header">

        <button
          type="button"
          className="single-student-profile-back"
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
            Student Profile
          </h1>

          <p>
            Student information and academic details
          </p>

        </div>

      </div>


      {/* =====================================================
                        MAIN CONTENT
      ===================================================== */}

      <div className="single-student-profile-layout">


        {/* ===================================================
                            LEFT SIDE
        =================================================== */}

        <aside className="single-student-profile-left">


          {/* =================================================
                            IDENTITY
          ================================================= */}

          <section className="single-student-profile-identity">

            {student.profilePhoto ? (

              <img
                src={student.profilePhoto}
                alt={studentName}
                className="single-student-profile-image"
              />

            ) : (

              <div className="single-student-profile-avatar">

                {getInitials(studentName)}

              </div>

            )}


            <h2>
              {studentName}
            </h2>


            <p className="single-student-profile-programme">

              {programmeName}

              {programmeCode && (
                <span>
                  {" "}
                  · {programmeCode}
                </span>
              )}

            </p>


            <p className="single-student-profile-department">

              {departmentName}

            </p>


            <span className="single-student-profile-register-id">

              {registerNumber}

            </span>

          </section>


          {/* =================================================
                       ACADEMIC INFORMATION
          ================================================= */}

          <section className="single-student-profile-section">

            <h3>
              Academic Information
            </h3>


            <div className="single-student-profile-info-grid">


              {/* BATCH */}

              <div className="single-student-profile-info-item">

                <span>
                  Batch
                </span>

                <strong>
                  {getValue(batchName)}
                </strong>

              </div>


              {/* CLASS */}

              <div className="single-student-profile-info-item">

                <span>
                  Class
                </span>

                <strong>
                  {getValue(section)}
                </strong>

              </div>


              {/* STUDENT TYPE */}

              <div className="single-student-profile-info-item">

                <span>
                  Student Type
                </span>

                <strong>
                  {formatLabel(
                    student.studentType
                  )}
                </strong>

              </div>


              {/* ADMISSION STATUS */}

              <div className="single-student-profile-info-item">

                <span>
                  Admission Status
                </span>

                <strong>
                  {formatLabel(
                    student.admissionStatus
                  )}
                </strong>

              </div>


              {/* PROGRAMME CODE */}

              <div className="single-student-profile-info-item">

                <span>
                  Programme Code
                </span>

                <strong>
                  {getValue(programmeCode)}
                </strong>

              </div>


              {/* APPLICATION NUMBER */}

              <div className="single-student-profile-info-item">

                <span>
                  Application Number
                </span>

                <strong>
                  {getValue(
                    student.applicationNumber
                  )}
                </strong>

              </div>

            </div>

          </section>


          {/* =================================================
                       PERSONAL INFORMATION
          ================================================= */}

          <section className="single-student-profile-section">

            <h3>
              Personal Information
            </h3>


            <div className="single-student-profile-detail-list">


              {/* DATE OF BIRTH */}

              <div className="single-student-profile-detail-item">

                <CalendarBlankIcon
                  size={18}
                  weight="regular"
                />

                <div>

                  <span>
                    Date of Birth
                  </span>

                  <strong>
                    {formatDate(
                      student.dateOfBirth
                    )}
                  </strong>

                </div>

              </div>


              {/* GENDER */}

              <div className="single-student-profile-detail-item">

                <UserIcon
                  size={18}
                  weight="regular"
                />

                <div>

                  <span>
                    Gender
                  </span>

                  <strong>
                    {formatLabel(
                      student.gender
                    )}
                  </strong>

                </div>

              </div>


              {/* BLOOD GROUP */}

              <div className="single-student-profile-detail-item">

                <IdentificationCardIcon
                  size={18}
                  weight="regular"
                />

                <div>

                  <span>
                    Blood Group
                  </span>

                  <strong>
                    {getValue(
                      student.bloodGroup
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
                         CONTACT INFORMATION
          ================================================= */}

          <section className="single-student-profile-section">

            <h3>
              Contact Information
            </h3>


            <div className="single-student-profile-detail-list">


              {/* EMAIL */}

              <div className="single-student-profile-detail-item">

                <EnvelopeSimpleIcon
                  size={18}
                  weight="regular"
                />

                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    {getValue(
                      student.studentEmail
                    )}
                  </strong>

                </div>

              </div>


              {/* MOBILE */}

              <div className="single-student-profile-detail-item">

                <PhoneIcon
                  size={18}
                  weight="regular"
                />

                <div>

                  <span>
                    Mobile Number
                  </span>

                  <strong>
                    {getValue(
                      student.studentMobile
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
                          INSTITUTION
          ================================================= */}

          <section className="single-student-profile-section">

            <h3>
              Institution
            </h3>


            <div className="single-student-profile-detail-list">


              <div className="single-student-profile-detail-item">

                <BuildingsIcon
                  size={18}
                  weight="regular"
                />

                <div>

                  <span>
                    Institution
                  </span>

                  <strong>
                    {getValue(
                      student.institutionId
                        ?.institutionName
                    )}
                  </strong>

                </div>

              </div>


              <div className="single-student-profile-detail-item">

                <GraduationCapIcon
                  size={18}
                  weight="regular"
                />

                <div>

                  <span>
                    Programme
                  </span>

                  <strong>
                    {getValue(
                      student.programmeId
                        ?.programmeName
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </section>

        </aside>


        {/* ===================================================
                            RIGHT SIDE
        =================================================== */}

        <main className="single-student-profile-right">


          {/* =================================================
                              TABS
          ================================================= */}

          <div className="single-student-profile-tabs">


            {/* ATTENDANCE */}

            <button
              type="button"
              className={
                `single-student-profile-tab ${
                  activeSection === "attendance"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActiveSection("attendance")
              }
            >

              <UsersThreeIcon
                size={18}
                weight={
                  activeSection === "attendance"
                    ? "fill"
                    : "regular"
                }
              />

              <span>
                Attendance
              </span>

            </button>


            {/* EXAM */}

            <button
              type="button"
              className={
                `single-student-profile-tab ${
                  activeSection === "exam"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActiveSection("exam")
              }
            >

              <ExamIcon
                size={18}
                weight={
                  activeSection === "exam"
                    ? "fill"
                    : "regular"
                }
              />

              <span>
                Exam Information
              </span>

            </button>


            {/* FEES */}

            <button
              type="button"
              className={
                `single-student-profile-tab ${
                  activeSection === "fees"
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setActiveSection("fees")
              }
            >

              <CurrencyCircleDollarIcon
                size={18}
                weight={
                  activeSection === "fees"
                    ? "fill"
                    : "regular"
                }
              />

              <span>
                Fees Details
              </span>

            </button>

          </div>


          {/* =================================================
                        WORKSPACE
          ================================================= */}

          <div className="single-student-profile-right-content">


            {/* =================================================
                          ATTENDANCE
            ================================================= */}

            {activeSection === "attendance" && (

              <div className="single-student-profile-workspace">


                {/* HEADER */}

                <div className="single-student-profile-workspace-header">

                  <div>

                    <span>
                      Academic
                    </span>

                    <h2>
                      Student Attendance
                    </h2>

                    <p>
                      Attendance performance and daily
                      hour-wise records.
                    </p>

                  </div>

                </div>


                {/* LOADING */}

                {attendanceLoading ? (

                  <div className="single-student-profile-data-loading">

                    Loading attendance details...

                  </div>

                ) : !attendanceData ? (

                  <div className="single-student-profile-no-data">

                    No attendance details found.

                  </div>

                ) : (

                  <>


                    {/* =========================================
                              ATTENDANCE SUMMARY
                    ========================================= */}

                    <div className="single-student-profile-attendance-summary">


                      <div className="single-student-profile-attendance-stat">

                        <span>
                          Total Hours
                        </span>

                        <strong>
                          {
                            attendanceData.summary
                              ?.totalHours || 0
                          }
                        </strong>

                      </div>


                      <div className="single-student-profile-attendance-stat">

                        <span>
                          Present
                        </span>

                        <strong>
                          {
                            attendanceData.summary
                              ?.present || 0
                          }
                        </strong>

                      </div>


                      <div className="single-student-profile-attendance-stat">

                        <span>
                          Absent
                        </span>

                        <strong>
                          {
                            attendanceData.summary
                              ?.absent || 0
                          }
                        </strong>

                      </div>


                      <div className="single-student-profile-attendance-stat dark">

                        <span>
                          Attendance
                        </span>

                        <strong>
                          {
                            attendanceData.summary
                              ?.percentage || 0
                          }%
                        </strong>

                      </div>

                    </div>


                    {/* =========================================
                            SUBJECT SUMMARY
                    ========================================= */}

                    <div className="single-student-profile-content-section">


                      <div className="single-student-profile-content-heading">

                        <div>

                          <span>
                            Subject Wise
                          </span>

                          <h3>
                            Attendance Summary
                          </h3>

                        </div>

                      </div>


                      {!attendanceData.subjects ||
                      attendanceData.subjects.length === 0 ? (

                        <div className="single-student-profile-no-data">

                          No subject attendance found.

                        </div>

                      ) : (

                        <div className="single-student-profile-table-wrapper">

                          <table className="single-student-profile-table">

                            <thead>

                              <tr>

                                <th>
                                  Subject
                                </th>

                                <th>
                                  Code
                                </th>

                                <th>
                                  Total
                                </th>

                                <th>
                                  Present
                                </th>

                                <th>
                                  Absent
                                </th>

                                <th>
                                  Percentage
                                </th>

                              </tr>

                            </thead>


                            <tbody>

                              {attendanceData.subjects.map(
                                (subject) => (

                                  <tr
                                    key={
                                      subject.subjectId
                                    }
                                  >

                                    <td>

                                      <strong>
                                        {getValue(
                                          subject.subjectName
                                        )}
                                      </strong>

                                    </td>

                                    <td>
                                      {getValue(
                                        subject.subjectCode
                                      )}
                                    </td>

                                    <td>
                                      {subject.total || 0}
                                    </td>

                                    <td className="single-student-profile-attendance-present">

                                      {subject.present || 0}

                                    </td>

                                    <td className="single-student-profile-attendance-absent">

                                      {subject.absent || 0}

                                    </td>

                                    <td>

                                      <strong>
                                        {
                                          subject.percentage || 0
                                        }%
                                      </strong>

                                    </td>

                                  </tr>

                                )
                              )}

                            </tbody>

                          </table>

                        </div>

                      )}

                    </div>


                    {/* =========================================
                          DAILY / HOUR ATTENDANCE
                    ========================================= */}

                    <div className="single-student-profile-content-section">


                      <div className="single-student-profile-content-heading">

                        <div>

                          <span>
                            Daily Record
                          </span>

                          <h3>
                            Day & Hour Attendance
                          </h3>

                        </div>

                      </div>


                      {!attendanceData.attendance ||
                      attendanceData.attendance.length === 0 ? (

                        <div className="single-student-profile-no-data">

                          No daily attendance records found.

                        </div>

                      ) : (

                        <div className="single-student-profile-attendance-days">

                          {attendanceData.attendance.map(
                            (day) => (

                              <div
                                className="single-student-profile-attendance-day"
                                key={day.date}
                              >


                                {/* DAY HEADER */}

                                <div className="single-student-profile-attendance-day-header">

                                  <div>

                                    <strong>
                                      {getValue(
                                        day.dayName
                                      )}
                                    </strong>

                                    <span>
                                      {formatDate(
                                        day.date
                                      )}
                                    </span>

                                  </div>

                                  <small>
                                    Day Order{" "}
                                    {
                                      day.dayOrder ??
                                      "—"
                                    }
                                  </small>

                                </div>


                                {/* PERIODS */}

                                <div className="single-student-profile-attendance-periods">

                                  {day.periods?.map(
                                    (period) => {

                                      const isPresent =
                                        period.status ===
                                        "present";

                                      return (

                                        <div
                                          className={
                                            `single-student-profile-attendance-period ${
                                              isPresent
                                                ? "present"
                                                : "absent"
                                            }`
                                          }
                                          key={
                                            `${day.date}-${period.periodNumber}`
                                          }
                                        >


                                          <div className="single-student-profile-attendance-period-number">

                                            Hour{" "}
                                            {
                                              period.periodNumber
                                            }

                                          </div>


                                          <div className="single-student-profile-attendance-period-subject">

                                            <strong>
                                              {getValue(
                                                period.subjectName
                                              )}
                                            </strong>

                                            <span>
                                              {getValue(
                                                period.subjectCode
                                              )}
                                            </span>

                                          </div>


                                          <div className="single-student-profile-attendance-period-status">

                                            {isPresent ? (

                                              <>
                                                <CheckCircleIcon
                                                  size={15}
                                                  weight="fill"
                                                />

                                                <span>
                                                  Present
                                                </span>
                                              </>

                                            ) : (

                                              <>
                                                <XCircleIcon
                                                  size={15}
                                                  weight="fill"
                                                />

                                                <span>
                                                  Absent
                                                </span>
                                              </>

                                            )}

                                          </div>

                                        </div>

                                      );
                                    }
                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                  </>

                )}

              </div>

            )}


            {/* =================================================
                              EXAMS
            ================================================= */}

            {activeSection === "exam" && (

              <div className="single-student-profile-workspace">


                {/* HEADER */}

                <div className="single-student-profile-workspace-header">

                  <div>

                    <span>
                      Academic
                    </span>

                    <h2>
                      Exam Information
                    </h2>

                    <p>
                      Published examination results
                      and subject-wise marks.
                    </p>

                  </div>

                </div>


                {/* LOADING */}

                {examLoading ? (

                  <div className="single-student-profile-data-loading">

                    Loading exam results...

                  </div>

                ) : examResults.length === 0 ? (

                  <div className="single-student-profile-no-data">

                    No published exam results found.

                  </div>

                ) : (

                  <div className="single-student-profile-exams">

                    {examResults.map(
                      (exam) => (

                        <div
                          className="single-student-profile-exam-card"
                          key={
                            exam.examSessionId
                          }
                        >


                          {/* EXAM HEADER */}

                          <div className="single-student-profile-exam-header">

                            <div>

                              <span>
                                Examination
                              </span>

                              <h3>
                                {
                                  exam.examTitle ||
                                  "Exam"
                                }
                              </h3>

                            </div>


                            {exam.publishedAt && (

                              <div className="single-student-profile-exam-date">

                                <CalendarBlankIcon
                                  size={16}
                                />

                                <span>
                                  Published
                                </span>

                                <strong>
                                  {formatDate(
                                    exam.publishedAt
                                  )}
                                </strong>

                              </div>

                            )}

                          </div>


                          {/* SUBJECT RESULTS */}

                          <div className="single-student-profile-table-wrapper">

                            <table className="single-student-profile-table">

                              <thead>

                                <tr>

                                  <th>
                                    #
                                  </th>

                                  <th>
                                    Subject
                                  </th>

                                  <th>
                                    Subject Code
                                  </th>

                                  <th>
                                    Conducted Mark
                                  </th>

                                  <th>
                                    Obtained Mark
                                  </th>

                                </tr>

                              </thead>


                              <tbody>

                                {(
                                  exam.subjects ||
                                  []
                                ).map(
                                  (
                                    subject,
                                    index
                                  ) => (

                                    <tr
                                      key={
                                        subject.examPaperId ||
                                        index
                                      }
                                    >

                                      <td>
                                        {index + 1}
                                      </td>

                                      <td>

                                        <strong>
                                          {
                                            subject.subjectName ||
                                            "—"
                                          }
                                        </strong>

                                      </td>

                                      <td>
                                        {
                                          subject.subjectCode ||
                                          "—"
                                        }
                                      </td>

                                      <td>
                                        {
                                          subject.conductedMark ??
                                          "—"
                                        }
                                      </td>

                                      <td>

                                        <strong>
                                          {
                                            subject.obtainedMark ??
                                            "—"
                                          }
                                        </strong>

                                      </td>

                                    </tr>

                                  )
                                )}

                              </tbody>

                            </table>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

            )}


            {/* =================================================
                              FEES
            ================================================= */}

            {activeSection === "fees" && (

              <div className="single-student-profile-workspace">


                {/* HEADER */}

                <div className="single-student-profile-workspace-header">

                  <div>

                    <span>
                      Finance
                    </span>

                    <h2>
                      Fees Details
                    </h2>

                    <p>
                      Payment history and fee
                      transaction information.
                    </p>

                  </div>

                </div>


                {/* SUMMARY */}

                <div className="single-student-profile-fees-summary">


                  <div className="single-student-profile-fees-stat">

                    <div className="single-student-profile-fees-stat-icon">

                      <ReceiptIcon
                        size={19}
                      />

                    </div>

                    <div>

                      <span>
                        Total Payments
                      </span>

                      <strong>
                        {
                          paymentSummary.totalPayments
                        }
                      </strong>

                    </div>

                  </div>


                  <div className="single-student-profile-fees-stat dark">

                    <div className="single-student-profile-fees-stat-icon">

                      <CurrencyCircleDollarIcon
                        size={19}
                      />

                    </div>

                    <div>

                      <span>
                        Total Paid
                      </span>

                      <strong>
                        ₹
                        {Number(
                          paymentSummary.totalPaid ||
                          0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* LOADING */}

                {paymentLoading ? (

                  <div className="single-student-profile-data-loading">

                    Loading payment history...

                  </div>

                ) : payments.length === 0 ? (

                  <div className="single-student-profile-no-data">

                    No payment history found.

                  </div>

                ) : (

                  <div className="single-student-profile-table-wrapper">

                    <table className="single-student-profile-table">

                      <thead>

                        <tr>

                          <th>
                            Receipt
                          </th>

                          <th>
                            Academic Year
                          </th>

                          <th>
                            Amount
                          </th>

                          <th>
                            Payment Mode
                          </th>

                          <th>
                            Received By
                          </th>

                          <th>
                            Paid At
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {payments.map(
                          (payment) => (

                            <tr
                              key={
                                payment.paymentId
                              }
                            >

                              <td>

                                <strong>
                                  {getValue(
                                    payment.receiptNumber
                                  )}
                                </strong>

                              </td>

                              <td>
                                {getValue(
                                  payment.academicYear
                                )}
                              </td>

                              <td className="single-student-profile-fee-amount">

                                ₹
                                {Number(
                                  payment.amount ||
                                  0
                                ).toLocaleString(
                                  "en-IN"
                                )}

                              </td>

                              <td>

                                <span className="single-student-profile-payment-mode">

                                  {getValue(
                                    payment.paymentMode
                                  )}

                                </span>

                              </td>

                              <td>
                                {getValue(
                                  payment.receivedBy
                                )}
                              </td>

                              <td>
                                {payment.paidAt
                                  ? formatDate(
                                      payment.paidAt
                                    )
                                  : "—"}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
};


export default SingleStudentProfile;