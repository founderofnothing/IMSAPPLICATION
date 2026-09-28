import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./ClassFeeDetails.css";

const ClassFeeDetails = () => {
const navigate = useNavigate();
  // ==================== DROPDOWN DATA ====================

  const [institutions, setInstitutions] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [classes, setClasses] =
    useState([]);


  // ==================== SELECTED VALUES ====================

  const [selectedInstitution, setSelectedInstitution] =
    useState("");

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [academicYear, setAcademicYear] =
    useState("");


  // ==================== FEE DATA ====================

  const [feeData, setFeeData] =
    useState([]);

  const [stats, setStats] =
    useState(null);


  // ==================== PAGINATION ====================

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      totalPages: 1,
      totalRecords: 0,
      limit: 10,
    });


  // ==================== LOADING ====================

  const [loading, setLoading] =
    useState(false);


  // ==================== FUNCTIONS ====================

  // fetchInstitutions()
// ==================== FETCH INSTITUTIONS ====================

const fetchInstitutions = async () => {
  try {
    const response = await API.get(
      "/institutions"
    );

    setInstitutions(
      response.data?.data || []
    );

  } catch (error) {

    setInstitutions([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch institutions."
    );
  }
};
  // handleInstitutionChange()
// ==================== INSTITUTION CHANGE ====================

const handleInstitutionChange = async (e) => {

  const institutionId =
    e.target.value;

  setSelectedInstitution(
    institutionId
  );

  // Clear dependent selections
  setSelectedDepartment("");
  setSelectedClass("");

  setDepartments([]);
  setClasses([]);

  // Clear previous fee results
  setFeeData([]);
  setStats(null);

  if (institutionId) {
    await fetchDepartments(
      institutionId
    );
  }
};
  // fetchDepartments()
// ==================== FETCH DEPARTMENTS ====================

const fetchDepartments = async (institutionId) => {
  if (!institutionId) {
    setDepartments([]);
    return;
  }

  try {
    const response = await API.get(
      `/institutions/${institutionId}`
    );

    setDepartments(
      response.data?.data?.departments || []
    );

  } catch (error) {

    setDepartments([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch departments."
    );
  }
};
  // handleDepartmentChange()
// ==================== DEPARTMENT CHANGE ====================

const handleDepartmentChange = async (e) => {

  const departmentId =
    e.target.value;

  setSelectedDepartment(
    departmentId
  );

  // Clear dependent selection
  setSelectedClass("");

  setClasses([]);

  // Clear previous fee results
  setFeeData([]);
  setStats(null);

  if (departmentId) {
    await fetchClasses(
      departmentId
    );
  }
};
  // fetchClasses()
const fetchClasses = async (departmentId) => {

  if (!departmentId) {
    setClasses([]);
    return;
  }

  try {

    const response = await API.get(
      `/classes/department/${departmentId}`
    );

    console.log(
      "CLASS RESPONSE:",
      response.data
    );

    setClasses(
      response.data?.data?.classes || []
    );

  } catch (error) {

    setClasses([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch classes."
    );

  }
};


// ==================== FETCH CLASS FEE DETAILS ====================

const fetchClassFeeDetails = async (
  classId,
  page = 1
) => {

  if (!classId) {
    setFeeData([]);
    setStats(null);
    return;
  }

  if (!academicYear.trim()) {
    toast.error(
      "Please enter academic year."
    );
    return;
  }

  try {

    setLoading(true);

    const response = await API.get(
      `/fees-allocation/allocation/class/${classId}`,
      {
        params: {
          academicYear:
            academicYear.trim(),

          page,

          limit:
            pagination.limit,
        },
      }
    );


    // ==================== STUDENTS ====================

    setFeeData(
      response.data?.data || []
    );


    // ==================== STATISTICS ====================

    setStats(
      response.data?.stats || null
    );


    // ==================== PAGINATION ====================

    setPagination(
      response.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        limit: 10,
      }
    );

  } catch (error) {

    setFeeData([]);
    setStats(null);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch class fee details."
    );

  } finally {

    setLoading(false);

  }
};
  // handleClassChange()

  // fetchClassFeeDetails()


  // ==================== OPEN STUDENT FEE DETAILS ====================

const handleStudentClick = (studentId) => {

  if (!studentId) {
    toast.error(
      "Student ID not found."
    );
    return;
  }

  navigate(
    `/accountant/student-fees/${studentId}?academicYear=${encodeURIComponent(
      academicYear.trim()
    )}`
  );
};
  // ==================== INITIAL FETCH ====================

useEffect(() => {
  fetchInstitutions();
}, []);

  return (

    <div className="class-fee-details-page">

      {/* ==================== HEADER ==================== */}

      <div className="class-fee-details-header">

        <div>

          <h1>
            Class Fee Details
          </h1>

          <p>
            View student fee allocation and payment
            details class by class.
          </p>

        </div>

      </div>


      {/* ==================== FILTERS ==================== */}

      <div className="class-fee-filters">

        {/* Institution */}
<div className="form-group">

  <label>
    Institution
  </label>

  <select
    value={selectedInstitution}
   onChange={handleInstitutionChange}
  >

    <option value="">
      Select Institution
    </option>

    {institutions.map(
      (institution) => (

        <option
          key={institution._id}
          value={institution._id}
        >
          {institution.institutionName}
        </option>

      )
    )}

  </select>

</div>
        {/* Department */}
<div className="form-group">

  <label>
    Department
  </label>

  <select
    value={selectedDepartment}
    onChange={handleDepartmentChange}
    disabled={!selectedInstitution}
  >

    <option value="">
      Select Department
    </option>

    {departments.map(
      (department) => (

        <option
          key={department._id}
          value={department._id}
        >
          {department.departmentName}
        </option>

      )
    )}

  </select>

</div>
        {/* Class */}
<div className="form-group">

  <label>
    Class
  </label>

  <select
    value={selectedClass}
    onChange={(e) => {

      setSelectedClass(
        e.target.value
      );

      setFeeData([]);
      setStats(null);

    }}
    disabled={!selectedDepartment}
  >

    <option value="">
      Select Class
    </option>

    {classes.map(
      (classItem) => (

        <option
          key={classItem._id}
          value={classItem._id}
        >
        {classItem.programme?.programmeName || "Programme"}
{" - "}
{classItem.batchId?.batchName || "Batch"}
{classItem.section
  ? ` - Section ${classItem.section}`
  : ""}
        </option>

      )
    )}

  </select>

</div>
        {/* Academic Year */}
<div className="form-group">

  <label>
    Academic Year
  </label>

  <input
    type="text"
    placeholder="Example: 2024-2027"
    value={academicYear}
    onChange={(e) => {

      setAcademicYear(
        e.target.value
      );

      setFeeData([]);
      setStats(null);

    }}
    disabled={!selectedClass}
  />

</div>


<button
  type="button"
  onClick={() =>
    fetchClassFeeDetails(
      selectedClass,
      1
    )
  }
  disabled={
    !selectedClass ||
    !academicYear.trim() ||
    loading
  }
>
  {loading
    ? "Loading..."
    : "View Fees"}
</button>
      </div>


      {/* ==================== SUMMARY ==================== */}

      <div className="class-fee-summary">

      {stats && (

  <>
    <div className="class-fee-stat">

      <span>
        Total Students
      </span>

      <strong>
        {stats.totalStudents || 0}
      </strong>

    </div>


    <div className="class-fee-stat">

      <span>
        Total Fees
      </span>

      <strong>
        ₹{Number(
          stats.totalFees || 0
        ).toLocaleString("en-IN")}
      </strong>

    </div>


    <div className="class-fee-stat">

      <span>
        Total Paid
      </span>

      <strong>
        ₹{Number(
          stats.totalPaid || 0
        ).toLocaleString("en-IN")}
      </strong>

    </div>


    <div className="class-fee-stat">

      <span>
        Total Pending
      </span>

      <strong>
        ₹{Number(
          stats.totalPending || 0
        ).toLocaleString("en-IN")}
      </strong>

    </div>
  </>

)}

      </div>


      {/* ==================== STUDENTS ==================== */}

     <div className="class-fee-content">

  {loading ? (

    <p>
      Loading fee details...
    </p>

  ) : feeData.length === 0 ? (

    stats && (
      <p>
        No fee records found.
      </p>
    )

  ) : (

    <table className="class-fee-table">

      <thead>

        <tr>
          <th>#</th>
          <th>Register Number</th>
          <th>Student Name</th>
          <th>Paid</th>
          <th>Pending</th>
          <th>Status</th>
        </tr>

      </thead>


      <tbody>

        {feeData.map(
          (student, index) => (

       <tr
  key={student.allocationId}
  onClick={() =>
    handleStudentClick(
      student.studentId
    )
  }
  className="student-fee-row"
>

              <td>
                {(
                  pagination.currentPage - 1
                ) *
                  pagination.limit +
                  index +
                  1}
              </td>


              <td>
                {student.registerNumber ||
                  "-"}
              </td>


              <td>
                {student.studentName ||
                  "-"}
              </td>


              <td>
                ₹{Number(
                  student.paidAmount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </td>


              <td>
                ₹{Number(
                  student.pendingAmount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </td>


              <td>
                <span
                  className={`fee-status ${
                    student.status === "Paid"
                      ? "paid"
                      : student.status ===
                        "Partially Paid"
                      ? "partial"
                      : "pending"
                  }`}
                >
                  {student.status}
                </span>
              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  )}

</div>

    </div>

  );
};

export default ClassFeeDetails;