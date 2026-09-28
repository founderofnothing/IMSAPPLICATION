import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api/axios";
// import "./classallocation.css";
import {XIcon , FadersHorizontalIcon ,GenderMaleIcon ,GenderFemaleIcon ,PencilSimpleLineIcon ,TrashSimpleIcon } from "@phosphor-icons/react";

import "./classallocation.css"
const ClassAllocation = () => {
  // ==================== STATES ====================
const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
// ==================== CLASS DISTRIBUTION ====================

const [allocationMode, setAllocationMode] = useState("auto");
const [numberOfClasses, setNumberOfClasses] = useState(1);
const [classGroups, setClassGroups] = useState([]);
const [manualClasses, setManualClasses] = useState([]);
const [creatingClasses, setCreatingClasses] = useState(false);
const [existingClasses, setExistingClasses] = useState([]);
// ==================== CLASS STUDENT VIEW ====================

// const [selectedViewClass, setSelectedViewClass] = useState(null);
// const [classStudents, setClassStudents] = useState([]);
// const [loadingClassStudents, setLoadingClassStudents] = useState(false);
// ==================== EXISTING CLASS ASSIGNMENT ====================

const [selectedStudents, setSelectedStudents] = useState([]);
const [selectedClassId, setSelectedClassId] = useState("");
const [assigningStudents, setAssigningStudents] = useState(false);
const [updatingClassStatus, setUpdatingClassStatus] = useState("");
  const [filters, setFilters] = useState({
    departmentId: "",
    programmeId: "",
    batchId: "",
  });
const [showManualClassPopup, setShowManualClassPopup] = useState(false);

const [manualForm, setManualForm] = useState({
  section: "",
  studentCount: "",
});

const [showStudentPopup, setShowStudentPopup] = useState(false);

const [selectedClass, setSelectedClass] = useState(null);

const [teachingFaculty, setTeachingFaculty] =
  useState([]);

  // ==================== STUDENT TRANSFER ====================

const [showTransferPopup, setShowTransferPopup] =
  useState(false);

const [selectedTransferStudent, setSelectedTransferStudent] =
  useState(null);

const [transferDepartments, setTransferDepartments] =
  useState([]);

const [transferProgrammes, setTransferProgrammes] =
  useState([]);

const [transferBatches, setTransferBatches] =
  useState([]);

const [transferForm, setTransferForm] = useState({
  departmentId: "",
  programmeId: "",
  batchId: "",
});

const [transferringStudent, setTransferringStudent] =
  useState(false);

  // ==================== FETCH DEPARTMENTS ====================


;



  const fetchDepartments = async () => {
    try {
      const response = await API.get("/institutions/my-institution");
      setDepartments(response.data?.data?.departments || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch departments."
      );
    }
  };


  // ==================== FETCH PROGRAMMES ====================

  const fetchProgrammes = async (departmentId) => {
    if (!departmentId) {
      setProgrammes([]);
      return;
    }

    try {
      const response = await API.get(
        `/programmes/department/${departmentId}`
      );

      setProgrammes(response.data?.data || []);
    } catch (error) {
      setProgrammes([]);

      toast.error(
        error.response?.data?.message || "Failed to fetch programmes."
      );
    }
  };


  // ==================== FETCH BATCHES ====================

  const fetchBatches = async () => {
    try {
      const response = await API.get("/batch/getall");
      setBatches(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch batches."
      );
    }
  };


  // ==================== FETCH STUDENTS ====================

  const fetchStudents = async () => {
    if (!filters.programmeId || !filters.batchId) {
      toast.warning("Select programme and batch first.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.get("students/class-assignment", {
        params: {
          programmeId: filters.programmeId,
          batchId: filters.batchId,
          classAssigned: false,
        },
      });

      setStudents(response.data?.data || []);
      setClassGroups([]);
setNumberOfClasses(1);
    } catch (error) {
      setStudents([]);

      toast.error(
        error.response?.data?.message || "Failed to fetch students."
      );
    } finally {
      setLoading(false);
    }
  };

// ==================== FETCH EXISTING CLASSES ====================

// ==================== FETCH ALLOCATION CLASSES ====================

const fetchExistingClasses = async () => {
  if (
    !filters.departmentId ||
    !filters.programmeId ||
    !filters.batchId
  ) {
    setExistingClasses([]);
    return;
  }

  try {
    const response = await API.get(
      "/students/allocation",
      {
        params: {
          departmentId: filters.departmentId,
          programmeId: filters.programmeId,
          batchId: filters.batchId,
        },
      }
    );

    setExistingClasses(
      response.data?.data || []
    );

  } catch (error) {
    setExistingClasses([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch classes."
    );
  }
};



// ==================== FETCH TEACHING FACULTY ====================
const fetchTeachingFaculty = async () => {

  try {

    const response = await API.get(
      "/users/my-institution",
      {
        params: {
          page: 1,
          limit: 500,
          department: filters.departmentId,
        },
      }
    );

    setTeachingFaculty(
      response.data.data || []
    );

  } catch (error) {

    console.error(
      "Failed to fetch teaching faculty:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch teaching faculty."
    );

    setTeachingFaculty([]);

  }

};
// ==================== UPDATE CLASS STATUS ====================

const handleClassStatusChange = async (
  classId,
  newStatus
) => {
  const isActive = newStatus === "active";

  try {
    setUpdatingClassStatus(classId);

    const response = await API.put(
      `/classes/${classId}`,
      {
        isActive,
      }
    );

    toast.success(
      response.data?.message ||
      `Class ${isActive ? "activated" : "deactivated"} successfully.`
    );

    // Refresh class list
    await fetchExistingClasses();

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to update class status."
    );

  } finally {
    setUpdatingClassStatus("");
  }
};

// ==================== UPDATE CLASS INCHARGE ====================
const handleClassInchargeChange =
  async (classId, userId) => {

    try {

      await API.put(
        `/classes/${classId}/incharge`,
        {
          classIncharge:
            userId || null,
        }
      );

      toast.success(
        "Class incharge updated."
      );

      fetchExistingClasses();

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to update class incharge."
      );

    }

  };

  // ==================== STUDENT TRANSFER ====================

const openTransferPopup = (student) => {

  setSelectedTransferStudent(student);

  setTransferForm({
    departmentId: "",
    programmeId: "",
    batchId: "",
  });

  setTransferProgrammes([]);

  setShowTransferPopup(true);
};


// Fetch departments for transfer

const fetchTransferDepartments = async () => {

  try {

    const response = await API.get(
      "/institutions/my-institution"
    );

    setTransferDepartments(
      response.data?.data?.departments || []
    );

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch departments."
    );

  }

};


// Fetch programmes based on transfer department

const fetchTransferProgrammes = async (
  departmentId
) => {

  if (!departmentId) {

    setTransferProgrammes([]);

    return;

  }

  try {

    const response = await API.get(
      `/programmes/department/${departmentId}`
    );

    setTransferProgrammes(
      response.data?.data || []
    );

  } catch (error) {

    setTransferProgrammes([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch programmes."
    );

  }

};


// Transfer student

const handleStudentTransfer = async () => {

  if (!selectedTransferStudent?._id) {

    toast.warning(
      "Student information is missing."
    );

    return;

  }

  if (
    !transferForm.departmentId ||
    !transferForm.programmeId ||
    !transferForm.batchId
  ) {

    toast.warning(
      "Select department, programme and batch."
    );

    return;

  }

  try {

    setTransferringStudent(true);

    const response = await API.put(

      `/students/${selectedTransferStudent._id}/transfer`,

      {
        departmentId:
          transferForm.departmentId,

        programmeId:
          transferForm.programmeId,

        batchId:
          transferForm.batchId,

        classId: null,
      }

    );

    toast.success(
      response.data?.message ||
      "Student transferred successfully."
    );

    setShowTransferPopup(false);

    setSelectedTransferStudent(null);

    setTransferForm({
      departmentId: "",
      programmeId: "",
      batchId: "",
    });

    setTransferProgrammes([]);

    // Refresh current unassigned list
    await fetchStudents();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to transfer student."
    );

  } finally {

    setTransferringStudent(false);

  }

};

// ==================== DELETE CLASS ====================
const handleDeleteClass = async (
  classId
) => {

  const confirmed =
    window.confirm(
      "Are you sure you want to delete this class?"
    );

  if (!confirmed) return;

  try {

    const response =
      await API.delete(
        `/classes/${classId}`
      );

    toast.success(
      response.data?.message ||
      "Class deleted successfully."
    );

    await fetchExistingClasses();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to delete class."
    );

  }

};
// ==================== FETCH CLASS STUDENTS ====================

// const fetchClassStudents = async (classId) => {
//   if (!classId) return;

//   try {
//     setLoadingClassStudents(true);

//     const response = await API.get(
//       `/classes/${classId}`
//     );

//     setSelectedViewClass(
//       response.data?.data || null
//     );

//     setClassStudents(
//       response.data?.students || []
//     );

//   } catch (error) {
//     setSelectedViewClass(null);
//     setClassStudents([]);

//     toast.error(
//       error.response?.data?.message ||
//       "Failed to fetch class students."
//     );
//   } finally {
//     setLoadingClassStudents(false);
//   }
// };

// ==================== LOAD ALLOCATION DATA ====================
const loadAllocationData = async () => {

  if (
    !filters.departmentId ||
    !filters.programmeId ||
    !filters.batchId
  ) {

    toast.warning(
      "Select department, programme and batch first."
    );

    return;

  }

  setSelectedStudents([]);

  setSelectedClassId("");

  await fetchTeachingFaculty();

  await Promise.all([
    fetchStudents(),
    fetchExistingClasses(),
  ]);

};  


// ==================== STUDENT SELECTION ====================

const handleStudentSelect = (studentId) => {
  setSelectedStudents((prev) =>
    prev.includes(studentId)
      ? prev.filter((id) => id !== studentId)
      : [...prev, studentId]
  );
};

const handleSelectAllStudents = () => {
  if (selectedStudents.length === students.length) {
    setSelectedStudents([]);
    return;
  }

  setSelectedStudents(
    students.map((student) => student._id)
  );
};


const handleManualFormChange = (e) => {

  const { name, value } = e.target;

  setManualForm((prev) => ({

    ...prev,

    [name]: value,

  }));

};
// ==================== ASSIGN TO EXISTING CLASS ====================

const assignToExistingClass = async () => {
  if (!selectedClassId) {
    toast.warning("Select a class first.");
    return;
  }

  if (!selectedStudents.length) {
    toast.warning("Select at least one student.");
    return;
  }

  try {
    setAssigningStudents(true);

    const response = await API.patch(
      "/students/assign-class",
      {
        classId: selectedClassId,
        studentIds: selectedStudents,
      }
    );

    toast.success(
      response.data?.message ||
      "Students assigned successfully."
    );

    setSelectedStudents([]);
    setSelectedClassId("");

    await Promise.all([
      fetchStudents(),
      fetchExistingClasses(),
    ]);

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to assign students."
    );
  } finally {
    setAssigningStudents(false);
  }
};

// ==================== NEXT SECTION ====================

const getNextSection = (offset = 0) => {
  const usedSections = existingClasses
    .map((item) => item.section?.toUpperCase())
    .filter(Boolean);

  let sectionIndex = 0;
  let found = 0;

  while (true) {
    const section = String.fromCharCode(
      65 + sectionIndex
    );

    if (!usedSections.includes(section)) {
      if (found === offset) {
        return section;
      }

      found++;
    }

    sectionIndex++;
  }
};

  // ==================== AUTO DISTRIBUTION ====================

const generateAutoDistribution = () => {
  if (!students.length) {
    toast.warning("Fetch students first.");
    return;
  }

  const classCount = Number(numberOfClasses);

  if (!classCount || classCount < 1) {
    toast.warning("Enter a valid number of classes.");
    return;
  }

  if (classCount > students.length) {
    toast.warning("Classes cannot exceed available students.");
    return;
  }

  const baseSize = Math.floor(students.length / classCount);
  const remainder = students.length % classCount;

  let startIndex = 0;
  const groups = [];

  for (let i = 0; i < classCount; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    const groupStudents = students.slice(startIndex, startIndex + size);

groups.push({
  section: getNextSection(i),
  studentCount: groupStudents.length,
  students: groupStudents,
});

    startIndex += size;
  }

  setClassGroups(groups);
};

// ==================== MANUAL DISTRIBUTION ====================

const addManualClass = () => {
  if (manualClasses.length >= students.length) {
    toast.warning("Cannot create more classes than students.");
    return;
  }

const section = getNextSection(
  manualClasses.length
);

  setManualClasses((prev) => [
    ...prev,
    {
      section,
      studentCount: "",
    },
  ]);
};


const updateManualCount = (index, value) => {
  const count = value === "" ? "" : Math.max(0, Number(value));

  setManualClasses((prev) =>
    prev.map((item, i) =>
      i === index
        ? { ...item, studentCount: count }
        : item
    )
  );
};


const removeManualClass = (index) => {
  setManualClasses((prev) => {
    const remaining = prev.filter(
      (_, i) => i !== index
    );

    return remaining.map((item, i) => ({
      ...item,
      section: getNextSection(i),
    }));
  });

  setClassGroups([]);
};


// ==================== GENERATE MANUAL DISTRIBUTION ====================

const generateManualDistribution = () => {
  if (!manualClasses.length) {
    toast.warning("Add at least one class.");
    return;
  }

  if (manualClasses.some((item) => !Number(item.studentCount))) {
    toast.warning("Enter student count for every class.");
    return;
  }

  if (manualAllocated !== students.length) {
    toast.warning(
      manualAllocated > students.length
        ? "Allocated students exceed available students."
        : `Allocate the remaining ${manualRemaining} students.`
    );
    return;
  }

  let startIndex = 0;

  const groups = manualClasses.map((item) => {
    const count = Number(item.studentCount);
    const groupStudents = students.slice(
      startIndex,
      startIndex + count
    );

    startIndex += count;

    return {
      section: item.section,
      studentCount: groupStudents.length,
      students: groupStudents,
    };
  });

  setClassGroups(groups);
};

// ==================== CREATE CLASSES ====================

// const createClasses = async () => {
//   if (!classGroups.length) {
//     toast.warning("Generate class distribution first.");
//     return;
//   }

//   if (
//     !filters.departmentId ||
//     !filters.programmeId ||
//     !filters.batchId
//   ) {
//     toast.warning(
//       "Department, programme and batch are required."
//     );
//     return;
//   }

//   try {
//     setCreatingClasses(true);

//     const createdClasses = [];

//     for (const group of classGroups) {
//       const response = await API.post("/classes", {
//         department: filters.departmentId,
//         programme: filters.programmeId,
//         batchId: filters.batchId,
//         section: group.section,
//       });

//       createdClasses.push({
//         ...group,
//         classId: response.data.data._id,
//       });
//     }

//     setClassGroups(createdClasses);

//     toast.success("Classes created successfully.");

//   } catch (error) {
//     console.error(
//       "CREATE CLASS ERROR:",
//       error.response?.data || error
//     );

//     toast.error(
//       error.response?.data?.message ||
//       "Failed to create classes."
//     );
//   } finally {
//     setCreatingClasses(false);
//   }
// };


// ==================== CREATE + ASSIGN CLASSES ====================

const createClasses = async () => {
  if (!classGroups.length) {
    toast.warning("Generate class distribution first.");
    return;
  }

  if (
    !filters.departmentId ||
    !filters.programmeId ||
    !filters.batchId
  ) {
    toast.warning(
      "Department, programme and batch are required."
    );
    return;
  }

  try {
    setCreatingClasses(true);

    for (const group of classGroups) {

      // -------------------------
      // 1. CREATE CLASS
      // -------------------------

      const classResponse = await API.post(
        "/classes",
        {
          department: filters.departmentId,
          programme: filters.programmeId,
          batchId: filters.batchId,
          section: group.section,
        }
      );

      const classId =
        classResponse.data?.data?._id;

      if (!classId) {
        throw new Error(
          `Class ID missing for Section ${group.section}.`
        );
      }


      // -------------------------
      // 2. GET STUDENT IDS
      // -------------------------

      const studentIds =
        group.students.map(
          (student) => student._id
        );


      // -------------------------
      // 3. ASSIGN STUDENTS
      // -------------------------

      await API.patch(
        "/students/assign-class",
        {
          classId,
          studentIds,
        }
      );
    }


    // -------------------------
    // SUCCESS
    // -------------------------

    toast.success(
      "Classes created and students assigned successfully."
    );

   setClassGroups([]);
setManualClasses([]);
setNumberOfClasses(1);

console.log("STEP 1");
await fetchStudents();

console.log("STEP 2");
await fetchExistingClasses();

console.log("STEP 3");
await fetchTeachingFaculty();

console.log("STEP 4");

  } catch (error) {

    console.error(
      "CLASS ALLOCATION ERROR:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
      error.message ||
      "Failed to allocate classes."
    );

  } finally {
    setCreatingClasses(false);
  }
};
  // ==================== FILTER CHANGE ====================

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;

    setFilters({
      departmentId,
      programmeId: "",
      batchId: "",
    });

   setProgrammes([]);
setStudents([]);
setExistingClasses([]);
setClassGroups([]);
setManualClasses([]);
setNumberOfClasses(1);
    if (departmentId) {
      fetchProgrammes(departmentId);
    }
  };

  const handleProgrammeChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      programmeId: e.target.value,
      batchId: "",
    }));

    setStudents([]);
    setExistingClasses([]);
setClassGroups([]);
setManualClasses([]);
setNumberOfClasses(1);
  };

  const handleBatchChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      batchId: e.target.value,
    }));

    setStudents([]);
setExistingClasses([]);
setSelectedStudents([]);
setSelectedClassId("");
setClassGroups([]);
setManualClasses([]);
setNumberOfClasses(1);
  };


  // ==================== INITIAL FETCH ====================

  useEffect(() => {
    fetchDepartments();
    fetchBatches();
  }, []);

  useEffect(() => {
  console.log("TEST useEffect");
  fetchTeachingFaculty();
}, []);

useEffect(() => {

  if (showTransferPopup) {

    fetchTransferDepartments();

  }

}, [showTransferPopup]);


  const manualAllocated = manualClasses.reduce(
  (total, item) => total + (Number(item.studentCount) || 0),
  0
);

const manualRemaining = students.length - manualAllocated;

  // ==================== UI ====================

  return (
    <div className="class_allocation_page">

      {/* HEADER */}

{/* ===========================================================
                    PAGE HEADER
=========================================================== */}

<div className="classallocation_page_header">

  {/* ================= LEFT ================= */}

  <div className="classallocation_header_left">

    <h2 className="classallocation_page_title">

      Class Allocation

    </h2>

    <p className="classallocation_page_subtitle">

      Create classes and allocate students efficiently using
      automatic or manual distribution.

    </p>

  </div>

</div>


      {/* FILTERS */}

{/* ===========================================================
                    LOAD ALLOCATION
=========================================================== */}

<div className="classallocation_filter_wrapper">

  {/* Department */}

  <div className="classallocation_filter_field">

    <select
      className="classallocation_filter_select"
      value={filters.departmentId}
      onChange={handleDepartmentChange}
    >

      <option value="">
        Select Department
      </option>

      {

        departments.map((department) => (

          <option
            key={department._id}
            value={department._id}
          >

            {department.departmentName}

          </option>

        ))

      }

    </select>

  </div>

  {/* Programme */}

  <div className="classallocation_filter_field">

    <select
      className="classallocation_filter_select"
      value={filters.programmeId}
      onChange={handleProgrammeChange}
      disabled={!filters.departmentId}
    >

      <option value="">
        Select Programme
      </option>

      {

        programmes.map((programme) => (

          <option
            key={programme._id}
            value={programme._id}
          >

            {programme.programmeName}

          </option>

        ))

      }

    </select>

  </div>

  {/* Batch */}

  <div className="classallocation_filter_field">

    <select
      className="classallocation_filter_select"
      value={filters.batchId}
      onChange={handleBatchChange}
      disabled={!filters.programmeId}
    >

      <option value="">
        Select Batch
      </option>

      {

        batches.map((batch) => (

          <option
            key={batch._id}
            value={batch._id}
          >

            {batch.batchName}

          </option>

        ))

      }

    </select>

  </div>

  {/* Load Allocation */}

  <button
    type="button"
    className="classallocation_load_btn"
    onClick={loadAllocationData}
    disabled={
      !filters.departmentId ||
      !filters.programmeId ||
      !filters.batchId ||
      loading
    }
  >

    {

      loading

        ?

        "Loading..."

        :

        "Load Allocation"

    }

  </button>

</div>

      {/* STUDENT SUMMARY */}

     {/* ==================== ALLOCATION SUMMARY ==================== */}

{/* ===========================================================
                    STATISTICS CARDS
=========================================================== */}

<div className="classallocation_statistics_wrapper">

  {/* ================= UNASSIGNED ================= */}

  <div className="classallocation_statistics_card">

    <div className="classallocation_statistics_header">

      <h5 className="classallocation_statistics_title">

        Unassigned Students

      </h5>

      <FadersHorizontalIcon
        className="classallocation_statistics_icon"
      />

    </div>

    <div className="classallocation_statistics_body">

      <span className="classallocation_statistics_line">

        _

      </span>

      <h2 className="classallocation_statistics_value">

        {students.length}

      </h2>

    </div>

  </div>

  {/* ================= EXISTING CLASSES ================= */}

  <div className="classallocation_statistics_card">

    <div className="classallocation_statistics_header">

      <h5 className="classallocation_statistics_title">

        Existing Classes

      </h5>

      <FadersHorizontalIcon
        className="classallocation_statistics_icon"
      />

    </div>

    <div className="classallocation_statistics_body">

      <span className="classallocation_statistics_line">

        _

      </span>

      <h2 className="classallocation_statistics_value">

        {existingClasses.length}

      </h2>

    </div>

  </div>

  {/* ================= ASSIGNED ================= */}

  <div className="classallocation_statistics_card">

    <div className="classallocation_statistics_header">

      <h5 className="classallocation_statistics_title">

        Assigned Students

      </h5>

      <FadersHorizontalIcon
        className="classallocation_statistics_icon"
      />

    </div>

    <div className="classallocation_statistics_body">

      <span className="classallocation_statistics_line">

        _

      </span>

      <h2 className="classallocation_statistics_value">

        {

          existingClasses.reduce(

            (total, item) =>

              total + (item.studentCount || 0),

            0

          )

        }

      </h2>

    </div>

  </div>

</div>



{/* ==================== EXISTING CLASSES TABLE ==================== */}

{/* ===========================================================
                    EXISTING CLASSES
=========================================================== */}

<div className="classallocation_existing_wrapper">

  <div className="classallocation_existing_header">

    <div>

      <h3 className="classallocation_existing_title">

        Existing Classes

      </h3>

      <span className="classallocation_existing_subtitle">

        {existingClasses.length} Classes Available

      </span>

    </div>

  </div>

  <div className="classallocation_existing_table_wrapper">

    <table className="classallocation_existing_table">

      {/* ================= HEADER ================= */}

      <thead className="classallocation_existing_table_header">

        <tr>

          <th>
            <h4 className="classallocation_existing_heading">
              #
            </h4>
          </th>

          <th>
            <h4 className="classallocation_existing_heading">
              Section
            </h4>
          </th>

          <th>
            <h4 className="classallocation_existing_heading">
              Programme
            </h4>
          </th>

          <th>
            <h4 className="classallocation_existing_heading">
              Batch
            </h4>
          </th>

          <th>
            <h4 className="classallocation_existing_heading">
              Students
            </h4>
          </th>

          <th>
            <h4 className="classallocation_existing_heading">
              Status
            </h4>
          </th>

          <th>
            <h4 className="classallocation_existing_heading">
              Class Incharge
            </h4>
          </th>

          <th>
            <h4 className="classallocation_existing_heading">
              Action
            </h4>
          </th>

        </tr>

      </thead>

      {/* ================= BODY ================= */}

      <tbody className="classallocation_existing_table_body">

        {

          existingClasses.length > 0

            ?

            existingClasses.map((item, index) => (

              <tr
                key={item._id}
                className="classallocation_existing_row"
              >

                {/* S.NO */}

                <td>

                  <h4 className="classallocation_existing_data">

                    {index + 1}

                  </h4>

                </td>

                {/* SECTION */}

                <td>

                  <h4 className="classallocation_existing_data">

                    Section {item.section}

                  </h4>

                </td>

                {/* PROGRAMME */}

                <td>

                  <h4 className="classallocation_existing_data">

                    {item.programme?.programmeName || "-"}

                  </h4>

                </td>

                {/* BATCH */}

                <td>

                  <h4 className="classallocation_existing_data">

                    {item.batchId?.batchName || "-"}

                  </h4>

                </td>

                {/* STUDENTS */}

                <td>

                  <h4 className="classallocation_existing_data">

                    {item.studentCount ?? 0}

                  </h4>

                </td>

                {/* STATUS */}

                <td>

                  <select
                    className="classallocation_existing_status_select"
                    value={
                      item.isActive
                        ? "active"
                        : "inactive"
                    }
                    onChange={(e)=>
                      handleClassStatusChange(
                        item._id,
                        e.target.value
                      )
                    }
                    disabled={
                      updatingClassStatus === item._id
                    }
                  >

                    <option value="active">

                      Active

                    </option>

                    <option value="inactive">

                      Inactive

                    </option>

                  </select>

                </td>

                {/* CLASS INCHARGE */}

<td className="classallocation_existing_incharge_cell">

  <select
    className="classallocation_existing_incharge_select"
    value={item.classIncharge?._id || ""}
    onChange={(e) =>
      handleClassInchargeChange(
        item._id,
        e.target.value
      )
    }
  >

    <option value="">
      Select Class Incharge
    </option>

    {teachingFaculty.map((faculty) => (

      <option
        key={faculty.userId?._id}
        value={faculty.userId?._id}
      >
        {faculty.userId?.fullName}
        {" - "}
        {faculty.designation}
      </option>

    ))}

  </select>

</td>
                {/* ACTION */}

                <td>

                  <div className="classallocation_existing_action_wrapper">

                    <button
                      type="button"
                      className="classallocation_existing_manage_btn"
                      onClick={()=>

                        navigate(

                          `/admission-cell/class-management/${item._id}`

                        )

                      }
                    >

                      Manage

                    </button>

                    <button
                      type="button"
                      className="classallocation_existing_delete_btn"
                      onClick={()=>

                        handleDeleteClass(item._id)

                      }
                    >

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))

            :

            (

              <tr>

                <td
                  colSpan="8"
                  className="classallocation_existing_empty"
                >

                  No Existing Classes Found

                </td>

              </tr>

            )

        }

      </tbody>

    </table>

  </div>

</div>


      {/* MAIN WORKSPACE */}

      <div className="allocation_workspace">

        {/* STUDENT SIDE */}

       {/* ==================== UNASSIGNED STUDENTS TABLE ==================== */}

{/* ===========================================================
                    UNASSIGNED STUDENTS
=========================================================== */}

<div className="classallocation_student_wrapper">

  <div className="classallocation_student_header">

    <div>

      <h3 className="classallocation_student_title">

        Unassigned Students

      </h3>

      <span className="classallocation_student_subtitle">

        {students.length} Students

        {

          selectedStudents.length > 0 &&

          ` • ${selectedStudents.length} Selected`

        }

      </span>

    </div>

  </div>

  <div className="classallocation_student_table_wrapper">

    <table className="classallocation_student_table">

      {/* ================= HEADER ================= */}

      <thead className="classallocation_student_table_header">

        <tr>

          <th>

            <input
              type="checkbox"
              checked={
                students.length > 0 &&
                selectedStudents.length === students.length
              }
              onChange={handleSelectAllStudents}
            />

          </th>

          <th>

            <h4 className="classallocation_student_heading">

              #

            </h4>

          </th>

          <th>

            <h4 className="classallocation_student_heading">

              Student

            </h4>

          </th>

          <th>

            <h4 className="classallocation_student_heading">

              Register No

            </h4>

          </th>

          <th>

            <h4 className="classallocation_student_heading">

              Gender

            </h4>

          </th>

          <th>

            <h4 className="classallocation_student_heading">

              Programme

            </h4>

          </th>

          <th>

            <h4 className="classallocation_student_heading">

              Batch

            </h4>

          </th>

<th>
  <h4 className="classallocation_student_heading">
    Current Class
  </h4>
</th>

<th>
  <h4 className="classallocation_student_heading">
    Action
  </h4>
</th>

        </tr>

      </thead>

      {/* ================= BODY ================= */}

      <tbody className="classallocation_student_table_body">

        {

          loading ? (

            <tr>

              <td
                colSpan="8"
                className="classallocation_student_empty"
              >

                Loading Students...

              </td>

            </tr>

          ) : students.length > 0 ? (

            students.map((student, index) => (

              <tr
                key={student._id}
                className="classallocation_student_row"
              >

                {/* CHECKBOX */}

                <td>

                  <input
                    type="checkbox"
                    checked={
                      selectedStudents.includes(student._id)
                    }
                    onChange={()=>

                      handleStudentSelect(student._id)

                    }
                  />

                </td>

                {/* S.NO */}

                <td>

                  <h4 className="classallocation_student_data">

                    {index + 1}

                  </h4>

                </td>

                {/* STUDENT */}

                <td>

                  <h4 className="classallocation_student_data">

                    {student.studentName}

                  </h4>

                </td>

                {/* REGISTER */}

                <td>

                  <h4 className="classallocation_student_data">

                    {student.registerNumber || "-"}

                  </h4>

                </td>

                {/* GENDER */}

                <td>

                  <h4 className="classallocation_student_data">

                    {student.gender || "-"}

                  </h4>

                </td>

                {/* PROGRAMME */}

                <td>

                  <h4 className="classallocation_student_data">

                    {

                      student.programmeId?.programmeName || "-"

                    }

                  </h4>

                </td>

                {/* BATCH */}

                <td>

                  <h4 className="classallocation_student_data">

                    {

                      student.batchId?.batchName || "-"

                    }

                  </h4>

                </td>

                {/* CLASS */}

                <td>

                  <h4 className="classallocation_student_data">

                    {

                      student.classId?.section

                        ?

                        `Section ${student.classId.section}`

                        :

                        "Unassigned"

                    }

                  </h4>

                </td>

                {/* ACTION */}

<td>

  <button
    type="button"
    className="classallocation_student_transfer_btn"
    onClick={() =>
      openTransferPopup(student)
    }
  >
    Transfer
  </button>

</td>

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan="9"
                className="classallocation_student_empty"
              >

                {

                  filters.programmeId &&
                  filters.batchId

                    ?

                    "No Unassigned Students Found."

                    :

                    "Select Department, Programme and Batch, then click Load Allocation."

                }

              </td>

            </tr>

          )

        }

      </tbody>

    </table>

  </div>

</div>

        {/* CLASS CREATION SIDE - NEXT STEP */}

        <div className="class_creation_panel">

<div className="panel_header">

  <div>
    <h3>Unassigned Students</h3>

    <span>
      {students.length} students
      {selectedStudents.length > 0 &&
        ` • ${selectedStudents.length} selected`}
    </span>
  </div>


  {students.length > 0 && existingClasses.length > 0 && (
    <div className="classallocation_assignment_card">

  <div className="classallocation_assignment_header">

    <h3 className="classallocation_assignment_title">

      Assign To Existing Class

    </h3>

    <p className="classallocation_assignment_subtitle">

      Move the selected students into an existing class.

    </p>

  </div>

  <div className="classallocation_assignment_body">

    <select
      className="classallocation_assignment_select"
      value={selectedClassId}
      onChange={(e) =>
        setSelectedClassId(e.target.value)
      }
    >

      <option value="">

        Select Existing Class

      </option>

      {

        existingClasses.map((item) => (

          <option
            key={item._id}
            value={item._id}
          >

            Section {item.section}

            {" — "}

            {item.studentCount ?? 0} Students

            {!item.isActive && " — Inactive"}

          </option>

        ))

      }

    </select>

    <button
      type="button"
      className="classallocation_primary_btn"
      onClick={assignToExistingClass}
      disabled={
        !selectedClassId ||
        !selectedStudents.length ||
        assigningStudents
      }
    >

      {

        assigningStudents

          ?

          "Assigning..."

          :

          `Assign Selected (${selectedStudents.length})`

      }

    </button>

  </div>

</div>
  )}

</div>

  {students.length > 0 ? (
    <>
      {/* MODE */}

<div className="classallocation_mode_card">

  <div className="classallocation_mode_header">

    <h3 className="classallocation_mode_title">

      Allocation Mode

    </h3>

    <p className="classallocation_mode_subtitle">

      Choose how you want to distribute the selected students.

    </p>

  </div>

  <div className="classallocation_mode_body">

    <button
      type="button"
      className={
        allocationMode === "auto"
          ? "classallocation_mode_btn classallocation_mode_btn_active"
          : "classallocation_mode_btn"
      }
      onClick={() => setAllocationMode("auto")}
    >

      Auto Allocation

    </button>

    <button
      type="button"
      className={
        allocationMode === "manual"
          ? "classallocation_mode_btn classallocation_mode_btn_active"
          : "classallocation_mode_btn"
      }
      onClick={() => setAllocationMode("manual")}
    >

      Manual Allocation

    </button>

  </div>

</div>


      {/* AUTO */}

      {allocationMode === "auto" && (
  <div className="classallocation_distribution_card">

    <div className="classallocation_distribution_header">

        <h3 className="classallocation_distribution_title">

            Auto Distribution

        </h3>

        <p className="classallocation_distribution_subtitle">

            Automatically distribute students equally between classes.

        </p>

    </div>

    <div className="classallocation_distribution_body">

        <div className="classallocation_distribution_summary">

            <span>

                Available Students

            </span>

            <strong>

                {students.length}

            </strong>

        </div>

        <div className="classallocation_distribution_input">

            <label>

                Number Of Classes

            </label>

            <input
                type="number"
                min="1"
                max={students.length}
                value={numberOfClasses}
                onChange={(e) => {

                    setNumberOfClasses(e.target.value);

                    setClassGroups([]);

                }}
            />

        </div>

        <button
            type="button"
            className="classallocation_primary_btn"
            onClick={generateAutoDistribution}
        >

            Generate Distribution

        </button>

    </div>

</div>
      )}


      {/* GENERATED CLASSES */}

      {allocationMode === "auto" && classGroups.length > 0 && (
        <div className="generated_classes">

          {classGroups.map((group) => (
            <div className="generated_class" key={group.section}>

              <div>
                <strong>Section {group.section}</strong>
                <span>{group.studentCount} Students</span>
              </div>

              <div className="class_student_range">
                {group.students[0]?.studentName}
                {" — "}
                {group.students[group.students.length - 1]?.studentName}
              </div>

            </div>
          ))}

        </div>
      )}


      {/* MANUAL - NEXT STEP */}

{/* ==================== MANUAL DISTRIBUTION ==================== */}

{allocationMode === "manual" && (
<div className="classallocation_manual_card">

    <div className="classallocation_manual_header">

        <h3 className="classallocation_manual_title">

            Manual Distribution

        </h3>

        <p className="classallocation_manual_subtitle">

            Decide how many students should be placed in each section.

        </p>

    </div>

    {/* SUMMARY */}

    <div className="classallocation_manual_summary">

        <div className="classallocation_manual_summary_item">

            <span>Available</span>

            <strong>{students.length}</strong>

        </div>

        <div className="classallocation_manual_summary_item">

            <span>Allocated</span>

            <strong>{manualAllocated}</strong>

        </div>

        <div className="classallocation_manual_summary_item">

            <span>Remaining</span>

            <strong>{manualRemaining}</strong>

        </div>

    </div>

    {/* ADD CLASS */}

    <button
        type="button"
        className="classallocation_secondary_btn"
        onClick={() =>

            setShowManualClassPopup(true)

        }
    >

        + Add Class

    </button>

    {/* CLASS LIST */}

    <div className="classallocation_manual_classes">

        {

            manualClasses.map((item, index) => (

                <div
                    key={index}
                    className="classallocation_manual_class_card"
                >

                    <div className="classallocation_manual_class_left">

                        <h4>

                            Section {item.section}

                        </h4>

                    </div>

                    <div className="classallocation_manual_class_right">

                        <input
                            type="number"
                            min="0"
                            placeholder="Students"
                            value={item.studentCount}
                            onChange={(e)=>

                                updateManualCount(
                                    index,
                                    e.target.value
                                )

                            }
                        />

                        <button
                            type="button"
                            className="classallocation_remove_btn"
                            onClick={()=>

                                removeManualClass(index)

                            }
                        >

                            Remove

                        </button>

                    </div>

                </div>

            ))

        }

    </div>

    {/* ERROR */}

    {

        manualRemaining < 0 && (

            <p className="classallocation_allocation_error">

                You allocated{" "}

                {Math.abs(manualRemaining)}

                {" "}more students than available.

            </p>

        )

    }

    {/* GENERATE */}

    {

        manualClasses.length > 0 &&
        manualRemaining >= 0 && (

            <button
                type="button"
                className="classallocation_primary_btn"
                onClick={generateManualDistribution}
                disabled={manualRemaining !== 0}
            >

                Generate Distribution

            </button>

        )

    }

    {/* GENERATED RESULT */}

    {

        classGroups.length > 0 && (

            <div className="classallocation_generated_wrapper">

                {

                    classGroups.map((group) => (

                        <div
                            key={group.section}
                            className="classallocation_generated_card"
                        >

                            <div>

                                <strong>

                                    Section {group.section}

                                </strong>

                                <span>

                                    {group.studentCount} Students

                                </span>

                            </div>

                            <button
                                type="button"
                                className="classallocation_view_btn"
                                onClick={() => {

                                    setSelectedClass(group);

                                    setShowStudentPopup(true);

                                }}
                            >

                                View Students

                            </button>

                        </div>

                    ))

                }

            </div>

        )

    }

</div>
)}


{/* ==================== CREATE CLASSES ==================== */}

{/* ===========================================================
                    CREATE CLASSES
=========================================================== */}

{classGroups.length > 0 && (

  <div className="classallocation_create_card">

    <div className="classallocation_create_header">

      <h3 className="classallocation_create_title">

        Ready To Create Classes

      </h3>

      <p className="classallocation_create_subtitle">

        Review the generated distribution before creating the classes.

      </p>

    </div>

    <button
      type="button"
      className="classallocation_create_btn"
      onClick={createClasses}
      disabled={creatingClasses}
    >

      {

        creatingClasses

          ?

          "Creating Classes..."

          :

          "Create Classes"

      }

    </button>

  </div>

)}

    </>
  ) : (
    <div className="class_creation_empty">
      <p>Fetch students to begin class creation.</p>
    </div>
  )}

</div>

      </div>

      {showManualClassPopup && (

        <div
          className="classallocation_popup_overlay"
      onClick={() => {

        setShowManualClassPopup(false);

        setManualForm({
          section: "",
          studentCount: "",
        });

      }}
    >

      <div
        className="classallocation_form_wrapper"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <div className="classallocation_form_header">

          <h3 className="classallocation_form_title">

            Create Manual Class

          </h3>

          <XIcon
            className="classallocation_form_close_icon"
            onClick={() => {

              setShowManualClassPopup(false);

              setManualForm({
                section: "",
                studentCount: "",
              });

            }}
          />

        </div>

        <div className="classallocation_form_grid">

          <div className="classallocation_form_field">

            <label className="classallocation_form_label">

              Section

            </label>

<input 
  type="text" 
  name="section" 
  value={manualForm.section} 
  readOnly 
  onClick={() => { 

    setManualForm({ 

      section: getNextSection(manualClasses.length), 
      studentCount: "", 

    }); 

    setShowManualClassPopup(true); 

  }} 
/>

          </div>

          <div className="classallocation_form_field">

            <label className="classallocation_form_label">

              Student Count

            </label>

            <input
              type="number"
              name="studentCount"
              placeholder="Enter Student Count"
              value={manualForm.studentCount}
              onChange={handleManualFormChange}
            />

          </div>

          <div className="classallocation_form_full_width">

            <button
              type="button"
              onClick={() => {

                if (!manualForm.studentCount) {

                  toast.warning(
                    "Enter Student Count."
                  );

                  return;

                }

                setManualClasses((prev) => [

                  ...prev,

                  {

                    section: getNextSection(prev.length),

                    studentCount: Number(
                      manualForm.studentCount
                    ),

                  },

                ]);

                setManualForm({

                  section: "",

                  studentCount: "",

                });

                setShowManualClassPopup(false);

              }}
            >

              Create Class

            </button>

          </div>

        </div>

      </div>

    </div>

  )
}

{
  showStudentPopup &&

  selectedClass && (

    <div
      className="classallocation_popup_overlay"
      onClick={() => {

        setShowStudentPopup(false);

        setSelectedClass(null);

      }}
    >

      <div
        className="classallocation_student_popup"
        onClick={(e)=>
          e.stopPropagation()
        }
      >

        <div className="classallocation_form_header">

          <h3 className="classallocation_form_title">

            Section {selectedClass.section}

          </h3>

          <XIcon
            className="classallocation_form_close_icon"
            onClick={() => {

              setShowStudentPopup(false);

              setSelectedClass(null);

            }}
          />

        </div>

        <div className="classallocation_student_summary">

          <h4>

            Total Students :
            {selectedClass.studentCount}

          </h4>

        </div>

        <table className="classallocation_student_table">

          <thead>

            <tr>

              <th>S.No</th>

              <th>Student Name</th>

            </tr>

          </thead>

          <tbody>

            {

              selectedClass.students.map(

                (student,index)=>(

                  <tr
                    key={student._id}
                  >

                    <td>

                      {index+1}

                    </td>

                    <td>

                      {student.studentName}

                    </td>

                  </tr>

                )

              )

            }

          </tbody>

        </table>

      </div>

    </div>

  )
}


{/* ==================== STUDENT TRANSFER POPUP ==================== */}

{showTransferPopup &&
  selectedTransferStudent && (

    <div
      className="classallocation_popup_overlay"
      onClick={() => {

        if (!transferringStudent) {

          setShowTransferPopup(false);

          setSelectedTransferStudent(null);

        }

      }}
    >

      <div
        className="classallocation_transfer_popup"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="classallocation_form_header">

          <div>

            <h3 className="classallocation_form_title">
              Transfer Student
            </h3>

            <p className="classallocation_transfer_subtitle">
              Move this student to another department
              or programme.
            </p>

          </div>

          <XIcon
            className="classallocation_form_close_icon"
            onClick={() => {

              if (transferringStudent) return;

              setShowTransferPopup(false);

              setSelectedTransferStudent(null);

            }}
          />

        </div>


        {/* STUDENT BASIC INFORMATION */}

        <div className="classallocation_transfer_student">

          <div className="classallocation_transfer_avatar">

            {selectedTransferStudent.studentName
              ?.charAt(0)
              ?.toUpperCase()}

          </div>

          <div>

            <h4>
              {selectedTransferStudent.studentName}
            </h4>

            <span>
              {selectedTransferStudent.applicationNumber ||
                selectedTransferStudent.registerNumber ||
                "No Application Number"}
            </span>

          </div>

        </div>


        {/* CURRENT ACADEMIC INFORMATION */}

        <div className="classallocation_transfer_current">

          <div className="classallocation_transfer_section_title">
            Current Academic Details
          </div>

          <div className="classallocation_transfer_current_grid">

            <div>

              <span>
                Department
              </span>

              <strong>
                {
                  selectedTransferStudent.departmentId
                    ?.departmentName || "-"
                }
              </strong>

            </div>


            <div>

              <span>
                Programme
              </span>

              <strong>
                {
                  selectedTransferStudent.programmeId
                    ?.programmeName || "-"
                }
              </strong>

            </div>


            <div>

              <span>
                Batch
              </span>

              <strong>
                {
                  selectedTransferStudent.batchId
                    ?.batchName || "-"
                }
              </strong>

            </div>

          </div>

        </div>


        {/* TRANSFER TO */}

        <div className="classallocation_transfer_destination">

          <div className="classallocation_transfer_section_title">
            Transfer To
          </div>


          {/* DEPARTMENT */}

          <div className="classallocation_form_field">

            <label className="classallocation_form_label">
              Department
            </label>

            <select
              className="classallocation_transfer_select"
              value={
                transferForm.departmentId
              }
              onChange={(e) => {

                const departmentId =
                  e.target.value;

                setTransferForm({
                  departmentId,
                  programmeId: "",
                  batchId:
                    transferForm.batchId,
                });

                fetchTransferProgrammes(
                  departmentId
                );

              }}
            >

              <option value="">
                Select Department
              </option>

              {transferDepartments.map(
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


          {/* PROGRAMME */}

          <div className="classallocation_form_field">

            <label className="classallocation_form_label">
              Programme
            </label>

            <select
              className="classallocation_transfer_select"
              value={
                transferForm.programmeId
              }
              disabled={
                !transferForm.departmentId
              }
              onChange={(e) => {

                setTransferForm(
                  (prev) => ({
                    ...prev,
                    programmeId:
                      e.target.value,
                  })
                );

              }}
            >

              <option value="">
                Select Programme
              </option>

              {transferProgrammes.map(
                (programme) => (

                  <option
                    key={programme._id}
                    value={programme._id}
                  >
                    {programme.programmeName}
                  </option>

                )
              )}

            </select>

          </div>


          {/* BATCH */}

          <div className="classallocation_form_field">

            <label className="classallocation_form_label">
              Batch
            </label>

            <select
              className="classallocation_transfer_select"
              value={
                transferForm.batchId
              }
              onChange={(e) => {

                setTransferForm(
                  (prev) => ({
                    ...prev,
                    batchId:
                      e.target.value,
                  })
                );

              }}
            >

              <option value="">
                Select Batch
              </option>

            {batches.map(
                (batch) => (

                  <option
                    key={batch._id}
                    value={batch._id}
                  >
                    {batch.batchName}
                  </option>

                )
              )}

            </select>

          </div>

        </div>


        {/* FOOTER */}

        <div className="classallocation_transfer_footer">

          <button
            type="button"
            className="classallocation_transfer_cancel_btn"
            disabled={
              transferringStudent
            }
            onClick={() => {

              setShowTransferPopup(false);

              setSelectedTransferStudent(null);

            }}
          >
            Cancel
          </button>


          <button
            type="button"
            className="classallocation_transfer_submit_btn"
            disabled={
              transferringStudent ||
              !transferForm.departmentId ||
              !transferForm.programmeId ||
              !transferForm.batchId
            }
            onClick={
              handleStudentTransfer
            }
          >

            {transferringStudent
              ? "Transferring..."
              : "Transfer Student"}

          </button>

        </div>

      </div>

    </div>

)}
  
    </div>
  );
};

export default ClassAllocation;