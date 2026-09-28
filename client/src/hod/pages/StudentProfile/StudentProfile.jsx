import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import API from "../../../api/axios";

import { toast } from "react-toastify";

import {
  X,
  User,
  CurrencyCircleDollar,
  Exam,
  IdentificationCard,
  GraduationCap,
  Buildings,
  UsersThree,
  ReceiptIcon
} from "@phosphor-icons/react";

import "./StudentProfile.css";


const StudentProfile = () => {

  // =====================================================
  // URL PARAMETER
  // =====================================================

  const {
    studentId,
  } = useParams();

  const navigate =
    useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [student, setStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [activeTab, setActiveTab] =
    useState("profile");


  // =====================================================
  // PAYMENT STATE
  // =====================================================

  const [payments, setPayments] =
    useState([]);

const [paymentSummary, setPaymentSummary] =
  useState({
    totalPayments: 0,
    totalPaid: 0,
    pendingAmount: 0,
  });

  const [paymentLoading, setPaymentLoading] =
    useState(false);

      const [examResults, setExamResults] =
    useState([]);

  const [examLoading, setExamLoading] =
    useState(false);


    // =====================================================
// ATTENDANCE STATE
// =====================================================

const [attendanceData, setAttendanceData] =
  useState(null);

const [attendanceLoading, setAttendanceLoading] =
  useState(false);


  // =====================================================
  // FETCH STUDENT PROFILE
  // =====================================================

  const fetchStudent = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          `/students/${studentId}`
        );

      setStudent(
        response.data.data
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch student profile."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FETCH PAYMENT HISTORY
  // =====================================================

  const fetchPaymentHistory = async () => {

    try {

      setPaymentLoading(true);

      const response =
        await API.get(
          `/fees-allocation/payment/student/${studentId}`
        );

const paymentData =
  response.data.data || [];

setPayments(paymentData);

const firstAllocation =
  paymentData[0]?.allocation;

setPaymentSummary({

  totalPayments:
    response.data.totalPayments || 0,

  totalPaid:
    response.data.totalPaid || 0,

  pendingAmount:
    firstAllocation?.pendingAmount || 0,

});

    } catch (error) {

      // No payment history is not really a page error.

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

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch payment history."
      );

    } finally {

      setPaymentLoading(false);

    }

  };


    // =====================================================
  // FETCH EXAM RESULTS
  // =====================================================

// =====================================================
// FETCH EXAM RESULTS
// =====================================================

const fetchExamResults = async () => {

  try {

    setExamLoading(true);

    const response =
      await API.get(
        `/exams/student-exam-result/${studentId}`
      );

    const result =
      response.data;

    if (!result.success) {

      toast.error(
        result.message ||
        "Failed to fetch exam results."
      );

      return;

    }

    // =================================================
    // STORE EXAM RESULTS
    // =================================================

    setExamResults(
      result.data?.results || []
    );

  } catch (error) {

    console.error(
      "FETCH EXAM RESULTS ERROR:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch exam results."
    );

  } finally {

    setExamLoading(false);

  }

};


  // =====================================================
// FETCH STUDENT ATTENDANCE
// =====================================================

const fetchStudentAttendance = async () => {

  try {

    setAttendanceLoading(true);

    const response =
      await API.get(
        `/Attendance/student/${studentId}`
      );

    setAttendanceData(
      response.data.data
    );

  } catch (error) {

    setAttendanceData(null);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch attendance details."
    );

  } finally {

    setAttendanceLoading(false);

  }

};

  // =====================================================
  // INITIAL PROFILE FETCH
  // =====================================================

  useEffect(() => {

    if (!studentId) {
      return;
    }

    fetchStudent();

  }, [studentId]);


  // =====================================================
  // LOAD FEES WHEN TAB IS OPENED
  // =====================================================

  useEffect(() => {

    if (
      activeTab === "fees" &&
      studentId
    ) {

      fetchPaymentHistory();

    }

  }, [
    activeTab,
    studentId,
  ]);

    // =====================================================
  // LOAD EXAM RESULTS WHEN TAB IS OPENED
  // =====================================================

  useEffect(() => {

    if (
      activeTab === "exam" &&
      studentId
    ) {

      fetchExamResults();

    }

  }, [
    activeTab,
    studentId,
  ]);

  // =====================================================
// LOAD ATTENDANCE WHEN TAB IS OPENED
// =====================================================

useEffect(() => {

  if (
    activeTab === "attendance" &&
    studentId
  ) {

    fetchStudentAttendance();

  }

}, [
  activeTab,
  studentId,
]);


  // =====================================================
  // CLOSE PROFILE
  // =====================================================

  const handleClose = () => {

    navigate(
      "/hod/DepartmentStudents"
    );

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="student-profile-page-loading">

        <div className="student-profile-loading-card">

          Loading student profile...

        </div>

      </div>

    );

  }


  // =====================================================
  // STUDENT NOT FOUND
  // =====================================================

  if (!student) {

    return (

      <div className="student-profile-page-empty">

        <div>

          <h3>
            Student not found
          </h3>

          <button
            onClick={handleClose}
          >
            Back to Students
          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // HELPER
  // =====================================================

  const getValue = (
    value
  ) => {

    return value ||
      "—";

  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="student-profile-overlay">

      <div className="student-profile-wrapper">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="student-profile-header">

          <button
            className="student-profile-close"
            onClick={handleClose}
            title="Close"
          >

            <X size={18} />

          </button>


          <div className="student-profile-header-info">


            {/* ================= AVATAR ================= */}

{/* ================= AVATAR ================= */}

<div className="student-profile-avatar">

  {student.profilePhoto ? (

    <img
      src={student.profilePhoto}
      alt={student.studentName}
    />

  ) : (

    <User size={48} />

  )}

</div>


            {/* ================= NAME ================= */}

            <div>

              <span className="student-profile-eyebrow">

                Student Profile

              </span>

              <h2>

                {getValue(
                  student.studentName
                )}

              </h2>

              <p>

                Register No :

                {" "}

                <strong>

                  {getValue(
                    student.registerNumber
                  )}

                </strong>

              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            TABS
        ================================================= */}

        <div className="student-profile-tabs">


          <button
            className={
              `student-profile-tab ${
                activeTab === "profile"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setActiveTab("profile")
            }
          >

            <IdentificationCard size={17} />

            Profile

          </button>


          <button
            className={
              `student-profile-tab ${
                activeTab === "fees"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setActiveTab("fees")
            }
          >

            <CurrencyCircleDollar size={17} />

            Fees Details

          </button>


          <button
            className={
              `student-profile-tab ${
                activeTab === "exam"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setActiveTab("exam")
            }
          >

            <Exam size={17} />

            Exam Details

          </button>


          <button
            className={
              `student-profile-tab ${
                activeTab === "attendance"
                  ? "active"
                  : ""
              }`
            }
            onClick={() =>
              setActiveTab("attendance")
            }
          >

            <GraduationCap size={17} />

            Attendance

          </button>

        </div>


        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="student-profile-content">


          {/* =================================================
              PROFILE
          ================================================= */}

          {activeTab === "profile" && (

            <div className="student-profile-section">


              <div className="student-profile-section-heading">

                <div>

                  <span>
                    Personal Information
                  </span>

                  <h3>
                    Student Information
                  </h3>

                </div>

              </div>


 <div className="student-profile-info-grid">

  {/* STUDENT NAME */}

  <div className="student-profile-info-item">

    <label>
      Student Name
    </label>

    <p>
      {getValue(student.studentName)}
    </p>

  </div>


  {/* REGISTER NUMBER */}

  <div className="student-profile-info-item">

    <label>
      Register Number
    </label>

    <p>
      {getValue(student.registerNumber)}
    </p>

  </div>


  {/* APPLICATION NUMBER */}

  <div className="student-profile-info-item">

    <label>
      Application Number
    </label>

    <p>
      {getValue(student.applicationNumber)}
    </p>

  </div>


  {/* EMAIL */}

  <div className="student-profile-info-item">

    <label>
      Email
    </label>

    <p>
      {getValue(student.studentEmail)}
    </p>

  </div>


  {/* MOBILE */}

  <div className="student-profile-info-item">

    <label>
      Mobile Number
    </label>

    <p>
      {getValue(student.studentMobile)}
    </p>

  </div>


  {/* DATE OF BIRTH */}

  <div className="student-profile-info-item">

    <label>
      Date of Birth
    </label>

    <p>

      {student.dateOfBirth
        ? new Date(
            student.dateOfBirth
          ).toLocaleDateString("en-IN")
        : "—"}

    </p>

  </div>


  {/* GENDER */}

  <div className="student-profile-info-item">

    <label>
      Gender
    </label>

    <p>
      {getValue(student.gender)}
    </p>

  </div>


  {/* BLOOD GROUP */}

  <div className="student-profile-info-item">

    <label>
      Blood Group
    </label>

    <p>
      {getValue(student.bloodGroup)}
    </p>

  </div>


  {/* STUDENT TYPE */}

  <div className="student-profile-info-item">

    <label>
      Student Type
    </label>

    <p>
      {getValue(student.studentType)}
    </p>

  </div>


  {/* ADMISSION STATUS */}

  <div className="student-profile-info-item">

    <label>
      Admission Status
    </label>

    <p>
      {getValue(student.admissionStatus)}
    </p>

  </div>


  {/* INSTITUTION */}

  <div className="student-profile-info-item">

    <label>
      Institution
    </label>

    <p>
      {getValue(
        student.institutionId?.institutionName
      )}
    </p>

  </div>


  {/* DEPARTMENT */}

  <div className="student-profile-info-item">

    <label>
      Department
    </label>

    <p>
      {getValue(
        student.departmentId?.departmentName
      )}
    </p>

  </div>


  {/* PROGRAMME */}

  <div className="student-profile-info-item">

    <label>
      Programme
    </label>

    <p>
      {getValue(
        student.programmeId?.programmeName
      )}
    </p>

  </div>


  {/* PROGRAMME CODE */}

  <div className="student-profile-info-item">

    <label>
      Programme Code
    </label>

    <p>
      {getValue(
        student.programmeId?.programmeCode
      )}
    </p>

  </div>


  {/* BATCH */}

  <div className="student-profile-info-item">

    <label>
      Batch
    </label>

    <p>
      {getValue(
        student.batchId?.batchName
      )}
    </p>

  </div>


  {/* CLASS */}

  <div className="student-profile-info-item">

    <label>
      Class
    </label>

    <p>

      {getValue(
        student.classId?.section
      )}

    </p>

  </div>

</div>

            </div>

          )}


          {/* =================================================
              FEES
          ================================================= */}

          {activeTab === "fees" && (

            <div className="student-profile-section">


              <div className="student-profile-section-heading">

                <div>

                  <span>
                    Finance
                  </span>

                  <h3>
                    Fee Payment History
                  </h3>

                </div>

              </div>


              {/* ================= SUMMARY ================= */}

              <div className="student-fees-summary">


                <div className="student-fees-summary-card">

                  <div className="student-fees-summary-icon">

                    <ReceiptIcon size={19} />

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

                


                <div className="student-fees-summary-card dark">

                  <div className="student-fees-summary-icon">

                    <CurrencyCircleDollar size={19} />

                  </div>

                  <div>

                    <span>
                      Total Paid
                    </span>

                    <strong>
                      ₹
                      {
                        Number(
                          paymentSummary.totalPaid || 0
                        ).toLocaleString("en-IN")
                      }
                    </strong>

                  </div>

                </div>

                <div className="student-fees-summary-card">

  <div className="student-fees-summary-icon">
    <CurrencyCircleDollar size={19} />
  </div>

  <div>

    <span>
      Pending Fees
    </span>

    <strong>
      ₹
      {Number(
        paymentSummary.pendingAmount || 0
      ).toLocaleString("en-IN")}
    </strong>

  </div>

</div>

              </div>


              {/* ================= LOADING ================= */}

              {paymentLoading ? (

                <div className="student-profile-empty">

                  Loading payment history...

                </div>

              ) : payments.length === 0 ? (

                <div className="student-profile-empty">

                  No payment history found.

                </div>

              ) : (

                <div className="student-fees-table-wrapper">

                  <table className="student-fees-table">

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
                                {
                                  getValue(
                                    payment.receiptNumber
                                  )
                                }
                              </strong>

                            </td>

                            <td>
                              {
                                getValue(
                                  payment.academicYear
                                )
                              }
                            </td>

                            <td className="student-fees-amount">

                              ₹
                              {
                                Number(
                                  payment.amount || 0
                                ).toLocaleString(
                                  "en-IN"
                                )
                              }

                            </td>

                            <td>

                              <span className="student-payment-mode">

                                {
                                  getValue(
                                    payment.paymentMode
                                  )
                                }

                              </span>

                            </td>

                            <td>

                              {
                                getValue(
                                  payment.receivedBy
                                )
                              }

                            </td>

                            <td>

                              {
                                payment.paidAt
                                  ? new Date(
                                      payment.paidAt
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "—"
                              }

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


          {/* =================================================
              EXAM
          ================================================= */}

          {/* =================================================
              EXAM
          ================================================= */}

          {activeTab === "exam" && (

            <div className="student-profile-section">


              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="student-profile-section-heading">

                <div>

                  <span>
                    Academic
                  </span>

                  <h3>
                    Exam Results
                  </h3>

                </div>

              </div>


              {/* =================================================
                  LOADING
              ================================================= */}

              {examLoading ? (

                <div className="student-profile-empty">

                  Loading exam results...

                </div>

              ) : examResults.length === 0 ? (

                <div className="student-profile-empty">

                  No published exam results found.

                </div>

              ) : (

                <div className="student-exam-results">


                  {/* =================================================
                      EXAM LIST
                  ================================================= */}

                  {examResults.map(
                    (exam) => (

                      <div
                        className="student-exam-card"
                        key={
                          exam.examSessionId
                        }
                      >


                        {/* =============================================
                            EXAM HEADER
                        ============================================== */}

                        <div className="student-exam-card-header">

                          <div>

                            <span>
                              Examination
                            </span>

                            <h4>

                              {
                                exam.examTitle ||
                                "Exam"
                              }

                            </h4>

                          </div>


                          {exam.publishedAt && (

                            <div className="student-exam-date">

                              Published :

                              {" "}

                              {
                                new Date(
                                  exam.publishedAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              }

                            </div>

                          )}

                        </div>


                        {/* =============================================
                            SUBJECT RESULTS
                        ============================================== */}

                        <div className="student-exam-table-wrapper">

                          <table className="student-exam-table">

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
                                      subject.examPaperId
                                    }
                                  >

                                    <td>
                                      {
                                        index + 1
                                      }
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
              ATTENDANCE
          ================================================= */}

{/* =================================================
    ATTENDANCE
================================================= */}

{activeTab === "attendance" && (

  <div className="student-profile-section">

    {/* ================= HEADER ================= */}

    <div className="student-profile-section-heading">

      <div>

        <span>
          Academic
        </span>

        <h3>
          Attendance
        </h3>

      </div>

    </div>


    {/* ================= LOADING ================= */}

    {attendanceLoading ? (

      <div className="student-profile-empty">

        Loading attendance details...

      </div>

    ) : !attendanceData ? (

      <div className="student-profile-empty">

        No attendance details found.

      </div>

    ) : (

      <>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="student-attendance-summary">


          {/* TOTAL HOURS */}

          <div className="student-attendance-summary-card">

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


          {/* PRESENT */}

          <div className="student-attendance-summary-card">

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


          {/* ABSENT */}

          <div className="student-attendance-summary-card">

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


          {/* PERCENTAGE */}

          <div className="student-attendance-summary-card dark">

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


        {/* =================================================
            SUBJECT SUMMARY
        ================================================= */}

        <div className="student-attendance-subject-section">

          <div className="student-profile-section-heading">

            <div>

              <span>
                Subject Wise
              </span>

              <h3>
                Attendance Summary
              </h3>

            </div>

          </div>


          {attendanceData.subjects?.length === 0 ? (

            <div className="student-profile-empty">

              No subject attendance found.

            </div>

          ) : (

            <div className="student-attendance-subject-table-wrapper">

              <table className="student-attendance-table">

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
                            {
                              getValue(
                                subject.subjectName
                              )
                            }
                          </strong>

                        </td>

                        <td>

                          {
                            getValue(
                              subject.subjectCode
                            )
                          }

                        </td>

                        <td>
                          {
                            subject.total || 0
                          }
                        </td>

                        <td className="attendance-present">

                          {
                            subject.present || 0
                          }

                        </td>

                        <td className="attendance-absent">

                          {
                            subject.absent || 0
                          }

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


        {/* =================================================
            DAY / HOUR ATTENDANCE
        ================================================= */}

        <div className="student-attendance-day-section">

          <div className="student-profile-section-heading">

            <div>

              <span>
                Daily Record
              </span>

              <h3>
                Day & Hour Attendance
              </h3>

            </div>

          </div>


          {attendanceData.attendance?.length === 0 ? (

            <div className="student-profile-empty">

              No daily attendance records found.

            </div>

          ) : (

            <div className="student-attendance-day-list">

              {attendanceData.attendance.map(
                (day) => (

                  <div
                    className="student-attendance-day-card"
                    key={
                      day.date
                    }
                  >

                    {/* ================= DAY HEADER ================= */}

                    <div className="student-attendance-day-header">

                      <div>

                        <strong>
                          {
                            day.dayName
                          }
                        </strong>

                        <span>
                          {
                            new Date(
                              day.date
                            ).toLocaleDateString(
                              "en-IN",
                              {
                                day:
                                  "2-digit",

                                month:
                                  "short",

                                year:
                                  "numeric",
                              }
                            )
                          }
                        </span>

                      </div>

                      <small>

                        Day Order{" "}

                        {
                          day.dayOrder
                        }

                      </small>

                    </div>


                    {/* ================= PERIODS ================= */}

                    <div className="student-attendance-period-grid">

                      {day.periods?.map(
                        (period) => (

                          <div
                            className={
                              `student-attendance-period ${
                                period.status ===
                                "present"
                                  ? "present"
                                  : "absent"
                              }`
                            }
                            key={
                              `${day.date}-${period.periodNumber}`
                            }
                          >

                            <div className="student-attendance-period-number">

                              Hour{" "}

                              {
                                period.periodNumber
                              }

                            </div>


                            <div className="student-attendance-period-subject">

                              <strong>

                                {
                                  getValue(
                                    period.subjectName
                                  )
                                }

                              </strong>

                              <span>

                                {
                                  getValue(
                                    period.subjectCode
                                  )
                                }

                              </span>

                            </div>


                            <div className="student-attendance-period-status">

                              {
                                period.status ===
                                "present"
                                  ? "Present"
                                  : "Absent"
                              }

                            </div>

                          </div>

                        )
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

        </div>

      </div>

    </div>

  );

};


export default StudentProfile;