import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../../api/axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import "./examHallAllocation.css";

const ExamHallAllocation = () => {
const { hallId } = useParams();


console.log(
  "PARAM HALL ID:",
  hallId,
  "length:",
  hallId?.length
);
  // =====================================================
  // HALL STATE
  // =====================================================

  const [hall, setHall] = useState(null);

  // =====================================================
  // DESK ARRANGEMENT STATE
  // =====================================================

  const [arrangement, setArrangement] = useState(null);
  const [columns, setColumns] = useState([]);

  // =====================================================
  // LOADING STATE
  // =====================================================

  const [loading, setLoading] = useState(false);
  const [arrangementLoading, setArrangementLoading] =
    useState(false);

  // =====================================================
  // ALLOCATION STATE
  // =====================================================

  const [selectedBench, setSelectedBench] = useState(null);
  const [showAllocationModal, setShowAllocationModal] =
    useState(false);

  const [selectedProgramme, setSelectedProgramme] =
    useState("");

  const [selectedBatch, setSelectedBatch] =
    useState("");

  const [selectedSubject, setSelectedSubject] =
    useState("");

  const [allocationMode, setAllocationMode] =
    useState("automatic");

    // =====================================================
// EXAM TITLE STATE
// =====================================================

const [examTitles, setExamTitles] = useState([]);
const [selectedExamTitle, setSelectedExamTitle] =
  useState("");

const [examTitleLoading, setExamTitleLoading] =
  useState(false);
  // =====================================================
  // PROGRAMME STATE
  // =====================================================

  const [programmes, setProgrammes] = useState([]);
  const [programmeLoading, setProgrammeLoading] =
    useState(false);

  // =====================================================
  // BATCH STATE
  // =====================================================

  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] =
    useState(false);

  // =====================================================
  // SUBJECT STATE
  // =====================================================

  const [subjects, setSubjects] = useState([]);
  const [subjectLoading, setSubjectLoading] =
    useState(false);

  const [programmeStructure, setProgrammeStructure] =
    useState(null);

    // =====================================================
// COLUMN ALLOCATION STATE
// =====================================================

const [selectedColumn, setSelectedColumn] = useState(null);

const [allocationTarget, setAllocationTarget] = useState(null);
// "column" | "bench"


// =====================================================
// STUDENT ALLOCATION PREVIEW
// =====================================================

const [availableStudents, setAvailableStudents] = useState([]);
const [allocationPreview, setAllocationPreview] = useState([]);

const [studentLoading, setStudentLoading] = useState(false);

const [allocationStep, setAllocationStep] = useState(1);

// =====================================================
// STUDENT RANGE SELECTION
// =====================================================

const [fromStudent, setFromStudent] = useState("");
const [toStudent, setToStudent] = useState("");

const [selectedRangeStudents, setSelectedRangeStudents] =
  useState([]);
// =====================================================
// SAVED ALLOCATIONS
// =====================================================

const [hallAllocations, setHallAllocations] = useState([]);
const [allocationSaving, setAllocationSaving] = useState(false);
const [allocationLoading, setAllocationLoading] = useState(false);

// =====================================================
// PDF PRINT STATE
// =====================================================

const [showPrintModal, setShowPrintModal] =
  useState(false);

const [printDate, setPrintDate] =
  useState("");

const [printStartTime, setPrintStartTime] =
  useState("");

const [printEndTime, setPrintEndTime] =
  useState("");

const [pdfGenerating, setPdfGenerating] =
  useState(false);

const [attendancePdfGenerating, setAttendancePdfGenerating] =
  useState(false);
  // =====================================================
  // FETCH EXAM HALL
  // =====================================================

  const fetchExamHall = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `/examcell/${hallId}`
      );

      setHall(response.data?.data || null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch exam hall."
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
// FETCH EXAM TITLES
// =====================================================

const fetchExamTitles = async () => {
  try {
    setExamTitleLoading(true);

    const response = await API.get(
      "/exams/exam-title",
      {
        params: {
          page: 1,
          limit: 100,
          search: "",
        },
      }
    );

    setExamTitles(
      response.data?.data || []
    );

  } catch (error) {

    console.error(
      "Fetch Exam Titles Error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to fetch exam titles."
    );

  } finally {
    setExamTitleLoading(false);
  }
};
  // =====================================================
  // FETCH DESK ARRANGEMENT
  // =====================================================

  const fetchDeskArrangement = async () => {
    try {
      setArrangementLoading(true);

      const response = await API.get(
        `/examcell/${hallId}/desk-arrangement`
      );

      const data = response.data?.data;

      setArrangement(data || null);
      setColumns(data?.columns || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setArrangement(null);
        setColumns([]);
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch desk arrangement."
      );
    } finally {
      setArrangementLoading(false);
    }
  };

  // =====================================================
  // FETCH PROGRAMMES
  // =====================================================

  const fetchProgrammes = async () => {
    try {
      setProgrammeLoading(true);

      const response = await API.get(
        "/programmes"
      );

      setProgrammes(
        response.data?.data || []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch programmes."
      );
    } finally {
      setProgrammeLoading(false);
    }
  };

  // =====================================================
  // FETCH BATCHES
  // =====================================================

  const fetchBatches = async () => {
    try {
      setBatchLoading(true);

      const response = await API.get(
        "/batch/getall"
      );

      setBatches(
        response.data?.data || []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch batches."
      );
    } finally {
      setBatchLoading(false);
    }
  };

  // =====================================================
  // FETCH PROGRAMME STRUCTURE
  // =====================================================

  const fetchProgrammeStructure = async (
    programmeId
  ) => {
    try {
      const response = await API.get(
        `/subjects/programme/${programmeId}`
      );

      return response.data?.data || null;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch programme structure."
      );

      return null;
    }
  };

  // =====================================================
  // FETCH CURRENT SEMESTER SUBJECTS
  // =====================================================

// =====================================================
// FETCH CURRENT SEMESTER SUBJECTS
// =====================================================

const fetchSubjects = async (
  programmeId,
  batchId
) => {
  try {
    setSubjectLoading(true);
    setSubjects([]);

    if (!programmeId || !batchId) {
      return;
    }

    const structure =
      await fetchProgrammeStructure(
        programmeId
      );

    if (!structure) {
      return;
    }

    setProgrammeStructure(structure);

    // =================================================
    // FIND ACTIVE SEMESTER FOR SELECTED BATCH
    // =================================================

    const activeSemester =
      structure.activeSemesters?.find(
        (semester) =>
          String(semester.batchId) ===
          String(batchId)
      );

    if (!activeSemester) {
      toast.error(
        "Current semester is not configured for the selected batch."
      );
      return;
    }

    const currentSemester =
      Number(
        activeSemester.semesterNumber
      );

    // =================================================
    // FIND STUDY YEAR FROM PROGRAMME STRUCTURE
    // =================================================

    const currentYear =
      structure.structure?.find(
        (year) =>
          year.semesters?.some(
            (semester) =>
              Number(
                semester.semesterNumber
              ) === currentSemester
          )
      );

    if (!currentYear) {
      toast.error(
        "Current semester structure was not found."
      );
      return;
    }

    const studyYear =
      Number(
        currentYear.studyYear
      );

    console.log(
      "PROGRAMME:",
      programmeId
    );

    console.log(
      "BATCH:",
      batchId
    );

    console.log(
      "CURRENT SEMESTER:",
      currentSemester
    );

    console.log(
      "STUDY YEAR:",
      studyYear
    );

    // =================================================
    // FETCH SUBJECTS
    // =================================================

    const response = await API.get(
      `/subjects/getsubject/programme/${programmeId}/study-year/${studyYear}/semester/${currentSemester}`
    );

    setSubjects(
      response.data?.data || []
    );

  } catch (error) {

    console.error(
      "Fetch Subjects Error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to fetch subjects."
    );

  } finally {

    setSubjectLoading(false);

  }
};


  // =====================================================
// GET ALLOCATION CAPACITY
// =====================================================

const getAllocationCapacity = () => {

  // Individual bench
  if (
    allocationTarget === "bench" &&
    selectedBench
  ) {
    return Number(
      selectedBench.capacity || 0
    );
  }

  // Entire column
  if (
    allocationTarget === "column" &&
    selectedColumn
  ) {
    return (
      selectedColumn.benches || []
    ).reduce(
      (total, bench) =>
        total +
        Number(bench.capacity || 0),
      0
    );
  }

  return 0;
};



// =====================================================
// BUILD AUTOMATIC ALLOCATION
// =====================================================

// =====================================================
// BUILD AUTOMATIC ALLOCATION
// =====================================================

const buildAutomaticAllocation = (
  students
) => {

  // ===================================================
  // INDIVIDUAL BENCH
  // ===================================================

  if (
    allocationTarget === "bench" &&
    selectedBench
  ) {

    const capacity =
      Number(
        selectedBench.capacity || 0
      );

    const selectedStudents =
      students.slice(
        0,
        capacity
      );

    return [
      {
        columnKey:
          selectedBench.columnKey,

        columnName:
          selectedBench.columnName,

        benchNumber:
          selectedBench.benchNumber,

        capacity,

        students:
          selectedStudents.map(
            (student, index) => ({
              ...student,

              seatNumber:
                index + 1,
            })
          ),
      },
    ];
  }


  // ===================================================
  // ENTIRE COLUMN
  // ===================================================

  if (
    allocationTarget === "column" &&
    selectedColumn
  ) {

    let studentIndex = 0;

    const result =
      selectedColumn.benches.map(
        (bench) => {

          const capacity =
            Number(
              bench.capacity || 0
            );

          const benchStudents =
            students.slice(
              studentIndex,
              studentIndex + capacity
            );

          studentIndex += capacity;

          return {

            columnKey:
              selectedColumn.columnKey,

            columnName:
              selectedColumn.columnName,

            benchNumber:
              bench.benchNumber,

            capacity,

            students:
              benchStudents.map(
                (student, index) => ({
                  ...student,

                  seatNumber:
                    index + 1,
                })
              ),
          };
        }
      );

    return result;
  }

  return [];
};

  // =====================================================
  // HANDLE PROGRAMME CHANGE
  // =====================================================

// =====================================================
// HANDLE PROGRAMME CHANGE
// =====================================================

const handleProgrammeChange = async (e) => {

  const programmeId =
    e.target.value;

  setSelectedProgramme(
    programmeId
  );

  setSelectedBatch("");
  setSelectedSubject("");

  setBatches([]);
  setSubjects([]);
  setProgrammeStructure(null);

  setFromStudent("");
  setToStudent("");
  setSelectedRangeStudents([]);
  setAvailableStudents([]);

  if (!programmeId) {
    return;
  }

  // Fetch batches only.
  // Subjects will be fetched after batch selection.
  await fetchBatches();
};


  // =====================================================
// OPEN COLUMN ALLOCATION
// =====================================================

const handleColumnAssignment = (column) => {
  if (!selectedExamTitle) {
  toast.error(
    "Please select an exam title first."
  );
  return;
}

  const benches = column.benches || [];

  const totalCapacity = benches.reduce(
    (total, bench) =>
      total + Number(bench.capacity || 0),
    0
  );

  const selected = {
    columnKey: column.columnKey,
    columnName: column.columnName,
    side: column.side,
    order: column.order,

    benches,

    totalCapacity,
  };

  setSelectedColumn(selected);

  setAllocationTarget("column");

  setSelectedBench(null);

  setSelectedProgramme("");
  setSelectedBatch("");
  setSelectedSubject("");
  setFromStudent("");
setToStudent("");

  setBatches([]);
  setSubjects([]);
  setProgrammeStructure(null);

  setAllocationMode("automatic");

  setShowAllocationModal(true);

  fetchProgrammes();
};


// =====================================================
// OPEN BENCH ALLOCATION
// =====================================================

const handleBenchClick = (column, bench) => {

  if (!selectedExamTitle) {
  toast.error(
    "Please select an exam title first."
  );
  return;
}

  const selected = {
    columnKey: column.columnKey,
    columnName: column.columnName,
    side: column.side,

    benchNumber: bench.benchNumber,
    capacity: Number(
      bench.capacity || 0
    ),

    order: bench.order,
  };

  setSelectedBench(selected);

  setSelectedColumn(null);

  setAllocationTarget("bench");

  setSelectedProgramme("");
  setSelectedBatch("");
  setSelectedSubject("");
  setFromStudent("");
setToStudent("");

  setBatches([]);
  setSubjects([]);
  setProgrammeStructure(null);

  setAllocationMode("automatic");

  setShowAllocationModal(true);

  fetchProgrammes();
};

  // =====================================================
  // CLOSE ALLOCATION MODAL
  // =====================================================

// =====================================================
// CLOSE ALLOCATION MODAL
// =====================================================

const closeAllocationModal = () => {

  setShowAllocationModal(false);

  setSelectedBench(null);
  setSelectedColumn(null);

  setAllocationTarget(null);

  setSelectedProgramme("");
  setSelectedBatch("");
  setSelectedSubject("");

  setBatches([]);
  setSubjects([]);
  setProgrammeStructure(null);

  setAllocationMode("automatic");

  setAvailableStudents([]);
  setAllocationPreview([]);

  setAllocationStep(1);
  setFromStudent("");
setToStudent("");
};



// =====================================================
// REMOVE ALLOCATED STUDENT FROM CELL
// =====================================================

const handleRemoveAllocatedStudent = async (allocationId) => {
  if (!allocationId) {
    toast.error("Allocation ID is missing.");
    return;
  }

  try {
    const response = await API.delete(
      `/exam-hall-student-allocation/${allocationId}`
    );

    // Remove immediately from UI
    setHallAllocations((previous) =>
      previous.filter(
        (allocation) =>
          allocation._id !== allocationId
      )
    );

    toast.success(
      response.data?.message ||
        "Student allocation removed successfully."
    );

  } catch (error) {
    console.error(
      "Remove Allocation Error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to remove student allocation."
    );
  }
};

// =====================================================
// GET ALLOCATED STUDENTS FOR BENCH
// =====================================================

const getBenchAllocations = (
  columnKey,
  benchNumber
) => {

  return hallAllocations
    .filter(
      (allocation) =>
        allocation.columnKey === columnKey &&
        Number(allocation.benchNumber) ===
          Number(benchNumber)
    )
    .sort(
      (a, b) =>
        Number(a.seatNumber) -
        Number(b.seatNumber)
    );
};
// =====================================================
// BACK TO CONFIGURATION
// =====================================================

const handleAllocationBack = () => {

  setAllocationStep(1);

  setAllocationPreview([]);
};



// =====================================================
// FETCH STUDENTS FOR ALLOCATION
// =====================================================

const fetchAllocationStudents = async (
  programmeId = selectedProgramme,
  batchId = selectedBatch
) => {
  try {
    setStudentLoading(true);

    const response = await API.get(
      "/exam-hall-student-pools/students",
      {
        params: {
          programmeId,
          batchId,
          page: 1,
          limit: 100,
        },
      }
    );

    const students =
      response.data?.data || [];

      console.log(
  "ALLOCATION STUDENTS:",
  students
);

console.log(
  "PROGRAMME:",
  programmeId
);

console.log(
  "BATCH:",
  batchId
);

    setAvailableStudents(students);

    setFromStudent("");
    setToStudent("");
    setSelectedRangeStudents([]);

    return students;

  } catch (error) {

    console.error(
      "Fetch Allocation Students Error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to fetch students."
    );

    return [];

  } finally {

    setStudentLoading(false);

  }
};


// =====================================================
// SELECT STUDENTS FROM RANGE
// =====================================================

const handleStudentRangeChange = (
  fromId,
  toId,
  students = availableStudents
) => {

  setFromStudent(fromId);
  setToStudent(toId);

  // Nothing selected yet
  if (!fromId || !toId) {
    setSelectedRangeStudents([]);
    return;
  }

  const fromIndex =
    students.findIndex(
      (student) =>
        (student._id || student.studentId) ===
        fromId
    );

  const toIndex =
    students.findIndex(
      (student) =>
        (student._id || student.studentId) ===
        toId
    );

  if (
    fromIndex === -1 ||
    toIndex === -1
  ) {
    setSelectedRangeStudents([]);
    return;
  }

  // Support both directions
  const start =
    Math.min(
      fromIndex,
      toIndex
    );

  const end =
    Math.max(
      fromIndex,
      toIndex
    );

  const selected =
    students.slice(
      start,
      end + 1
    );

  setSelectedRangeStudents(
    selected
  );
};


// =====================================================
// FETCH SAVED HALL ALLOCATIONS
// =====================================================

const fetchHallAllocations = async () => {

  if (!hallId || !selectedExamTitle) {
    return;
  }

  try {

    setAllocationLoading(true);

const response = await API.get(
  `/exam-hall-student-allocation/title/${selectedExamTitle}/hall/${hallId}`
);

    setHallAllocations(
      response.data?.data || []
    );

  } catch (error) {

    console.error(
      "Fetch Hall Allocations Error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to fetch hall allocations."
    );

  } finally {

    setAllocationLoading(false);

  }
};
  // =====================================================
  // CONTINUE ALLOCATION
  // =====================================================
// =====================================================
// GENERATE EXAM HALL PDF
// =====================================================

const generateExamHallPDF = () => {

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!selectedExamTitle) {
    toast.error("Please select an exam title.");
    return;
  }

  if (!printDate) {
    toast.error("Please select exam date.");
    return;
  }

  if (!printStartTime) {
    toast.error("Please enter exam start time.");
    return;
  }

  if (!printEndTime) {
    toast.error("Please enter exam end time.");
    return;
  }

  if (!columns.length) {
    toast.error(
      "No desk arrangement found for this hall."
    );
    return;
  }

  if (!hallAllocations.length) {
    toast.warning(
      "No students have been allocated to this hall."
    );
    return;
  }

  try {

    setPdfGenerating(true);

    // =================================================
    // SELECTED EXAM TITLE
    // =================================================

    const selectedExam =
      examTitles.find(
        (exam) =>
          exam._id === selectedExamTitle
      );

    const examTitle =
      selectedExam?.title ||
      "Examination";

    // =================================================
    // INSTITUTION NAME
    // =================================================

    const institutionName =
      selectedExam?.institutionId?.institutionName ||
      hall?.institutionId?.institutionName ||
      "Institution";

    // =================================================
    // PDF
    // =================================================

    const doc =
      new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    // =================================================
    // PAGE MARGINS
    // =================================================

    const marginLeft = 10;
    const marginRight = 10;
    const marginTop = 10;

    // =================================================
    // HEADER
    // =================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    doc.text(
      institutionName,
      pageWidth / 2,
      marginTop,
      {
        align: "center",
      }
    );

    doc.setFontSize(13);

    doc.text(
      "EXAM HALL SEATING ARRANGEMENT",
      pageWidth / 2,
      marginTop + 8,
      {
        align: "center",
      }
    );

    doc.setFontSize(11);

    doc.text(
      examTitle,
      pageWidth / 2,
      marginTop + 15,
      {
        align: "center",
      }
    );

    // =================================================
    // EXAM INFORMATION
    // =================================================

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const formattedDate =
      new Date(
        `${printDate}T00:00:00`
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

    doc.text(
      `Date: ${formattedDate}`,
      marginLeft,
      marginTop + 25
    );

    doc.text(
      `Time: ${printStartTime} - ${printEndTime}`,
      marginLeft + 55,
      marginTop + 25
    );

    doc.text(
      `Hall: ${hall?.hallNumber || ""} - ${
        hall?.hallName || ""
      }`,
      pageWidth - marginRight,
      marginTop + 25,
      {
        align: "right",
      }
    );

    // =================================================
    // LAYOUT POSITION
    // =================================================

    const layoutTop =
      marginTop + 34;

    const benchLabelWidth = 22;

    const availableWidth =
      pageWidth -
      marginLeft -
      marginRight -
      benchLabelWidth;

    // =================================================
    // COLUMN WIDTH
    // =================================================

    const columnWidth =
      availableWidth /
      columns.length;

    // =================================================
    // COLUMN HEADER
    // =================================================

    const columnHeaderHeight = 10;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(9);

    columns.forEach(
      (column, columnIndex) => {

        const x =
          marginLeft +
          benchLabelWidth +
          columnIndex *
            columnWidth;

        doc.rect(
          x,
          layoutTop,
          columnWidth,
          columnHeaderHeight
        );

        doc.text(
          column.columnKey,
          x +
            columnWidth / 2,
          layoutTop + 6.5,
          {
            align: "center",
          }
        );

      }
    );

    // =================================================
    // FIND MAXIMUM NUMBER OF BENCHES
    // =================================================

    const maxBenches =
      Math.max(
        ...columns.map(
          (column) =>
            column.benches?.length || 0
        )
      );

    // =================================================
    // BENCH ROW SETTINGS
    // =================================================

    const benchRowHeight = 18;

    const seatBoxPadding = 2;

    // =================================================
    // BENCH ROWS
    // =================================================

    for (
      let benchIndex = 0;
      benchIndex < maxBenches;
      benchIndex++
    ) {

      const rowY =
        layoutTop +
        columnHeaderHeight +
        benchIndex *
          benchRowHeight;

      // =================================================
      // CHECK PAGE SPACE
      // =================================================

      if (
        rowY +
          benchRowHeight >
        pageHeight - 10
      ) {

        doc.addPage(
          "landscape",
          "a4"
        );

        // New page starts with the same
        // seating arrangement header.

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(12);

        doc.text(
          `${institutionName} - ${examTitle}`,
          pageWidth / 2,
          10,
          {
            align: "center",
          }
        );

      }

      // =================================================
      // BENCH NUMBER
      // =================================================

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.text(
        `Bench ${
          benchIndex + 1
        }`,
        marginLeft +
          benchLabelWidth / 2,
        rowY + 10,
        {
          align: "center",
        }
      );

      // =================================================
      // EACH COLUMN
      // =================================================

      columns.forEach(
        (
          column,
          columnIndex
        ) => {

          const x =
            marginLeft +
            benchLabelWidth +
            columnIndex *
              columnWidth;

          // =============================================
          // OUTER BENCH
          // =============================================

          doc.rect(
            x,
            rowY,
            columnWidth,
            benchRowHeight
          );

          // =============================================
          // GET BENCH
          // =============================================

          const bench =
            column.benches?.[
              benchIndex
            ];

          if (!bench) {
            return;
          }

          // =============================================
          // GET STUDENTS
          // =============================================

          const students =
            getBenchAllocations(
              column.columnKey,
              bench.benchNumber
            );

          // =============================================
          // CAPACITY
          // =============================================

          const capacity =
            Number(
              bench.capacity || 0
            );

          // =============================================
          // STUDENT BOXES
          // =============================================

          if (capacity === 2) {

            const halfWidth =
              columnWidth / 2;

            // -------------------------------------------
            // VERTICAL DIVIDER
            // -------------------------------------------

            doc.line(
              x + halfWidth,
              rowY,
              x + halfWidth,
              rowY +
                benchRowHeight
            );

            // -------------------------------------------
            // LEFT STUDENT
            // -------------------------------------------

            const leftStudent =
              students.find(
                (student) =>
                  Number(
                    student.seatNumber
                  ) === 1
              );

            // -------------------------------------------
            // RIGHT STUDENT
            // -------------------------------------------

            const rightStudent =
              students.find(
                (student) =>
                  Number(
                    student.seatNumber
                  ) === 2
              );

            // -------------------------------------------
            // LEFT REGISTER NUMBER
            // -------------------------------------------

            if (leftStudent) {

              doc.setFont(
                "helvetica",
                "bold"
              );

              doc.setFontSize(7);

              doc.text(
                leftStudent.registerNumber ||
                  "",
                x +
                  halfWidth / 2,
                rowY +
                  benchRowHeight / 2 +
                  2,
                {
                  align: "center",
                }
              );

            }

            // -------------------------------------------
            // RIGHT REGISTER NUMBER
            // -------------------------------------------

            if (rightStudent) {

              doc.setFont(
                "helvetica",
                "bold"
              );

              doc.setFontSize(7);

              doc.text(
                rightStudent.registerNumber ||
                  "",
                x +
                  halfWidth +
                  halfWidth / 2,
                rowY +
                  benchRowHeight / 2 +
                  2,
                {
                  align: "center",
                }
              );

            }

          } else {

            // ===========================================
            // CAPACITY 1
            // ===========================================

            const student =
              students[0];

            if (student) {

              doc.setFont(
                "helvetica",
                "bold"
              );

              doc.setFontSize(7);

              doc.text(
                student.registerNumber ||
                  "",
                x +
                  columnWidth / 2,
                rowY +
                  benchRowHeight / 2 +
                  2,
                {
                  align: "center",
                }
              );

            }

          }

        }
      );
    }

    // =================================================
    // FOOTER
    // =================================================

    const footerY =
      pageHeight - 7;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7);

    doc.text(
      `Generated on ${new Date().toLocaleString(
        "en-IN"
      )}`,
      marginLeft,
      footerY
    );

    doc.text(
      "Exam Hall Seating Arrangement",
      pageWidth - marginRight,
      footerY,
      {
        align: "right",
      }
    );

    // =================================================
    // DOWNLOAD
    // =================================================

    const safeExamTitle =
      examTitle
        .replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    const safeHallNumber =
      hall?.hallNumber
        ?.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        ) ||
      "hall";

    doc.save(
      `${safeExamTitle}-${safeHallNumber}-seating-arrangement.pdf`
    );

    // =================================================
    // CLOSE MODAL
    // =================================================

    setShowPrintModal(false);

    toast.success(
      "Exam hall seating PDF downloaded successfully."
    );

  } catch (error) {

    console.error(
      "Generate Exam Hall PDF Error:",
      error
    );

    toast.error(
      "Failed to generate PDF."
    );

  } finally {

    setPdfGenerating(false);

  }
};


// =====================================================
// GENERATE ATTENDANCE SHEET PDF
// =====================================================
//
// Students are fetched from the saved hall allocations
// and returned department-wise by the backend.
//
// Format:
//
// Student Name | Register Number | Signature
//
// =====================================================

const generateAttendancePDF = async () => {

  // ===================================================
  // VALIDATION
  // ===================================================

  if (!selectedExamTitle) {
    toast.error("Please select an exam title.");
    return;
  }

  if (!printDate) {
    toast.error("Please select exam date.");
    return;
  }

  if (!printStartTime) {
    toast.error("Please enter exam start time.");
    return;
  }

  if (!printEndTime) {
    toast.error("Please enter exam end time.");
    return;
  }

  try {

    setAttendancePdfGenerating(true);

    // =================================================
    // FETCH DEPARTMENT-WISE ATTENDANCE DATA
    // =================================================

    const response = await API.get(
      `/exam-hall-student-allocation/title/${selectedExamTitle}/hall/${hallId}/attendance`
    );

    const attendanceData =
      response.data?.data;

    if (
      !attendanceData ||
      !attendanceData.departments?.length
    ) {
      toast.warning(
        "No students found for the attendance sheet."
      );
      return;
    }

    // =================================================
    // EXAM TITLE
    // =================================================

    const selectedExam =
      examTitles.find(
        (exam) =>
          exam._id === selectedExamTitle
      );

    const examTitle =
      selectedExam?.title ||
      "Examination";

    // =================================================
    // INSTITUTION
    // =================================================

    const institutionName =
      selectedExam?.institutionId?.institutionName ||
      hall?.institutionId?.institutionName ||
      "Institution";

    // =================================================
    // CREATE PDF
    // =================================================

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const marginLeft = 15;
    const marginRight = 15;

    let currentY = 15;

    // =================================================
    // HEADER FUNCTION
    // =================================================

    const drawHeader = () => {

      currentY = 15;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(15);

      doc.text(
        institutionName,
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      );

      currentY += 8;

      doc.setFontSize(12);

      doc.text(
        "EXAMINATION ATTENDANCE SHEET",
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      );

      currentY += 7;

      doc.setFontSize(10);

      doc.text(
        examTitle,
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      );

      currentY += 8;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(9);

      const formattedDate =
        new Date(
          `${printDate}T00:00:00`
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );

      doc.text(
        `Date: ${formattedDate}`,
        marginLeft,
        currentY
      );

      doc.text(
        `Time: ${printStartTime} - ${printEndTime}`,
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      );

      doc.text(
        `Hall: ${hall?.hallNumber || ""} - ${
          hall?.hallName || ""
        }`,
        pageWidth - marginRight,
        currentY,
        {
          align: "right",
        }
      );

      currentY += 8;
    };

    // =================================================
    // DRAW INITIAL HEADER
    // =================================================

    drawHeader();

    // =================================================
    // TABLE SETTINGS
    // =================================================

    const tableX = marginLeft;

    const tableWidth =
      pageWidth -
      marginLeft -
      marginRight;

    const numberWidth = 10;
    const nameWidth = 70;
    const registerWidth = 45;

    const signatureWidth =
      tableWidth -
      numberWidth -
      nameWidth -
      registerWidth;

    const rowHeight = 9;

    // =================================================
    // TABLE HEADER
    // =================================================

    const drawTableHeader = () => {

      const headerY =
        currentY;

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(8);

      doc.rect(
        tableX,
        headerY,
        numberWidth,
        rowHeight
      );

      doc.rect(
        tableX + numberWidth,
        headerY,
        nameWidth,
        rowHeight
      );

      doc.rect(
        tableX +
          numberWidth +
          nameWidth,
        headerY,
        registerWidth,
        rowHeight
      );

      doc.rect(
        tableX +
          numberWidth +
          nameWidth +
          registerWidth,
        headerY,
        signatureWidth,
        rowHeight
      );

      doc.text(
        "No.",
        tableX +
          numberWidth / 2,
        headerY + 6,
        {
          align: "center",
        }
      );

      doc.text(
        "Student Name",
        tableX +
          numberWidth +
          3,
        headerY + 6
      );

      doc.text(
        "Register Number",
        tableX +
          numberWidth +
          nameWidth +
          registerWidth / 2,
        headerY + 6,
        {
          align: "center",
        }
      );

      doc.text(
        "Signature",
        tableX +
          numberWidth +
          nameWidth +
          registerWidth +
          signatureWidth / 2,
        headerY + 6,
        {
          align: "center",
        }
      );

      currentY += rowHeight;
    };

    // =================================================
    // RENDER DEPARTMENTS
    // =================================================

    let serialNumber = 1;

    for (
      const department
      of attendanceData.departments
    ) {

      // ===============================================
      // DEPARTMENT HEADING
      // ===============================================

      if (
        currentY + 18 >
        pageHeight - 15
      ) {

        doc.addPage();

        drawHeader();

      }

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.text(
        `Department: ${department.departmentName}`,
        tableX,
        currentY
      );

      currentY += 6;

      // ===============================================
      // PROGRAMMES
      // ===============================================

      for (
        const programme
        of department.programmes
      ) {

        // =============================================
        // PROGRAMME HEADING
        // =============================================

        if (
          currentY + 18 >
          pageHeight - 15
        ) {

          doc.addPage();

          drawHeader();

        }

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setFontSize(9);

        doc.text(
          `Programme: ${programme.programmeName}${
            programme.programmeCode
              ? ` (${programme.programmeCode})`
              : ""
          }`,
          tableX,
          currentY
        );

        currentY += 5;

        // =============================================
        // TABLE HEADER
        // =============================================

        drawTableHeader();

        // =============================================
        // STUDENTS
        // =============================================

        for (
          const student
          of programme.students
        ) {

          // ===========================================
          // PAGE BREAK
          // ===========================================

          if (
            currentY + rowHeight >
            pageHeight - 15
          ) {

            doc.addPage();

            drawHeader();

            drawTableHeader();

          }

          // ===========================================
          // ROW
          // ===========================================

          doc.setFont(
            "helvetica",
            "normal"
          );

          doc.setFontSize(8);

          doc.rect(
            tableX,
            currentY,
            numberWidth,
            rowHeight
          );

          doc.rect(
            tableX + numberWidth,
            currentY,
            nameWidth,
            rowHeight
          );

          doc.rect(
            tableX +
              numberWidth +
              nameWidth,
            currentY,
            registerWidth,
            rowHeight
          );

          doc.rect(
            tableX +
              numberWidth +
              nameWidth +
              registerWidth,
            currentY,
            signatureWidth,
            rowHeight
          );

          // =========================================
          // SERIAL NUMBER
          // =========================================

          doc.text(
            String(serialNumber),
            tableX +
              numberWidth / 2,
            currentY + 6,
            {
              align: "center",
            }
          );

          // =========================================
          // STUDENT NAME
          // =========================================

          doc.text(
            student.studentName || "",
            tableX +
              numberWidth +
              3,
            currentY + 6
          );

          // =========================================
          // REGISTER NUMBER
          // =========================================

          doc.text(
            student.registerNumber || "",
            tableX +
              numberWidth +
              nameWidth +
              registerWidth / 2,
            currentY + 6,
            {
              align: "center",
            }
          );

          // Signature intentionally blank.

          serialNumber++;

          currentY += rowHeight;

        }

        currentY += 4;

      }

      currentY += 4;

    }

    // =================================================
    // FOOTER
    // =================================================

    const pageCount =
      doc.getNumberOfPages();

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {

      doc.setPage(page);

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(7);

      doc.text(
        `Generated on ${new Date().toLocaleString(
          "en-IN"
        )}`,
        marginLeft,
        pageHeight - 7
      );

      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - marginRight,
        pageHeight - 7,
        {
          align: "right",
        }
      );

    }

    // =================================================
    // DOWNLOAD
    // =================================================

    const safeExamTitle =
      examTitle
        .replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        );

    const safeHallNumber =
      hall?.hallNumber
        ?.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        ) ||
      "hall";

    doc.save(
      `${safeExamTitle}-${safeHallNumber}-attendance-sheet.pdf`
    );

    toast.success(
      "Attendance sheet PDF downloaded successfully."
    );

  } catch (error) {

    console.error(
      "Generate Attendance PDF Error:",
      error
    );

    console.error(
      "Backend Response:",
      error.response?.data
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to generate attendance PDF."
    );

  } finally {

    setAttendancePdfGenerating(false);

  }

};

// =====================================================
// CONTINUE ALLOCATION
// =====================================================
const handleContinueAllocation = async () => {

  // ===================================================
  // AUTOMATIC MODE
  // ===================================================

  if (allocationMode === "automatic") {

    // =================================================
    // COLUMN RANGE ALLOCATION
    // =================================================

    if (allocationTarget === "column") {

      if (!selectedExamTitle) {
        toast.error(
          "Please select an exam title."
        );
        return;
      }

      if (!selectedProgramme) {
        toast.error(
          "Please select a programme."
        );
        return;
      }

      if (!selectedBatch) {
        toast.error(
          "Please select a batch."
        );
        return;
      }

      if (!selectedSubject) {
        toast.error(
          "Please select a subject."
        );
        return;
      }

      if (!fromStudent || !toStudent) {
        toast.error(
          "Please select From Student and To Student."
        );
        return;
      }

      if (
        selectedRangeStudents.length === 0
      ) {
        toast.error(
          "No students found in the selected range."
        );
        return;
      }

      // ===============================================
      // BUILD COLUMN PREVIEW
      // ===============================================

      const preview =
        buildAutomaticAllocation(
          selectedRangeStudents
        );

      setAllocationPreview(
        preview
      );

      setAllocationStep(2);

      return;
    }

    // =================================================
    // BENCH AUTOMATIC ALLOCATION
    // =================================================

    const students =
      availableStudents.length > 0
        ? availableStudents
        : await fetchAllocationStudents();

    if (!students.length) {

      toast.warning(
        "No students found for the selected programme and batch."
      );

      return;
    }

    const capacity =
      getAllocationCapacity();

    if (capacity <= 0) {

      toast.error(
        "No valid seating capacity found."
      );

      return;
    }

    const preview =
      buildAutomaticAllocation(
        students
      );

    setAllocationPreview(
      preview
    );

    setAvailableStudents(
      students
    );

    setAllocationStep(2);

    return;
  }

  // ===================================================
  // MANUAL MODE
  // ===================================================

  const students =
    availableStudents.length > 0
      ? availableStudents
      : await fetchAllocationStudents();

  if (!students.length) {

    toast.warning(
      "No students found for the selected programme and batch."
    );

    return;
  }

  setAvailableStudents(
    students
  );

  setAllocationPreview([]);

  setAllocationStep(2);
};

// =====================================================
// REMOVE STUDENT FROM ALLOCATION PREVIEW
// =====================================================

const handleRemovePreviewStudent = (studentId) => {

  // Remove from available students
  const updatedStudents =
    availableStudents.filter(
      (student) =>
        (student._id || student.studentId) !==
        studentId
    );

  setAvailableStudents(updatedStudents);

  // Rebuild the automatic allocation
  if (
    allocationMode === "automatic"
  ) {

    const updatedPreview =
      buildAutomaticAllocation(
        updatedStudents
      );

    setAllocationPreview(
      updatedPreview
    );
  }
};

// =====================================================
// SAVE AUTOMATIC ALLOCATION
// =====================================================

const handleAutomaticAssign = async () => {

  if (
    allocationMode !== "automatic"
  ) {
    return;
  }

  if (
    !allocationPreview.length
  ) {
    toast.warning(
      "No students available for allocation."
    );
    return;
  }

  try {

    setAllocationSaving(true);

    // ================================================
    // BUILD API PAYLOAD
    // ================================================

    const allocations = [];

    allocationPreview.forEach(
      (bench) => {

        bench.students.forEach(
          (student) => {

            allocations.push({

             examTitleId: selectedExamTitle,

              hallId,

              columnKey:
                bench.columnKey,

              columnName:
                bench.columnName,

              benchNumber:
                bench.benchNumber,

              seatNumber:
                student.seatNumber,

              studentId:
                student._id ||
                student.studentId,

              programmeId:
                selectedProgramme,

              batchId:
                selectedBatch,

              subjectId:
                selectedSubject,

              assignmentMode:
                "automatic",
            });

          }
        );

      }
    );

    if (!allocations.length) {
      toast.warning(
        "No students selected for allocation."
      );
      return;
    }

    // ================================================
    // SAVE
    // ================================================

    const response =
      await API.post(
        "/exam-hall-student-allocation/bulk",
        {
          allocations,
        }
      );

    // ================================================
    // UPDATE UI
    // ================================================

    const savedAllocations =
      response.data?.data || [];

    setHallAllocations(
      (previous) => [
        ...previous,
        ...savedAllocations,
      ]
    );

    toast.success(
      response.data?.message ||
        "Students allocated successfully."
    );

    // ================================================
    // CLOSE MODAL
    // ================================================

    closeAllocationModal();

} catch (error) {

  console.error(
    "Automatic Allocation Error:",
    error
  );

  console.error(
    "Backend Response:",
    error.response?.data
  );

  toast.error(
    error.response?.data?.message ||
      "Failed to allocate students."
  );

} finally {

    setAllocationSaving(false);

  }
};

  // =====================================================
  // INITIAL FETCH
  // =====================================================

useEffect(() => {

  if (!hallId) return;

  fetchExamHall();
  fetchDeskArrangement();
  fetchExamTitles();

}, [hallId]); 


useEffect(() => {

  if (!hallId || !selectedExamTitle) {
    return;
  }

  fetchHallAllocations();

}, [hallId, selectedExamTitle]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="exam_hall_allocation_page">
        <p>
          Loading exam hall...
        </p>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="exam_hall_allocation_page">

      {/* =================================================
          HEADER
      ================================================= */}

<div className="exam_hall_allocation_header">

  <div>

    <h1>
      Exam Hall Allocation
    </h1>

    {hall && (
      <p>
        {hall.hallNumber} -{" "}
        {hall.hallName}
      </p>
    )}

  </div>

  <button
    type="button"
    className="exam_hall_allocation_print_btn"
    onClick={() => {

      if (!selectedExamTitle) {

        toast.error(
          "Please select an exam title first."
        );

        return;
      }

      if (!hallAllocations.length) {

        toast.warning(
          "No students have been allocated yet."
        );

        return;
      }

      setShowPrintModal(true);

    }}
    disabled={
      !selectedExamTitle ||
      allocationLoading
    }
  >
    Print Seating Arrangement
  </button>


  {/* =================================================
    PRINT SETTINGS MODAL
================================================= */}

{showPrintModal && (

  <div className="exam_hall_print_modal_overlay">

    <div className="exam_hall_print_modal">

      {/* =============================================
          HEADER
      ============================================= */}

      <div className="exam_hall_print_modal_header">

        <div>

          <h2>
            Print Seating Arrangement
          </h2>

          <p>
            Configure examination details
            before downloading the PDF.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            setShowPrintModal(false)
          }
        >
          ×
        </button>

      </div>


      {/* =============================================
          EXAM TITLE
      ============================================= */}

      <div className="exam_hall_print_field">

        <label>
          Exam Title
        </label>

        <input
          type="text"
          value={
            examTitles.find(
              (exam) =>
                exam._id ===
                selectedExamTitle
            )?.title || ""
          }
          disabled
        />

      </div>


      {/* =============================================
          INSTITUTION
      ============================================= */}

      <div className="exam_hall_print_field">

        <label>
          Institution
        </label>

        <input
          type="text"
          value={
            examTitles.find(
              (exam) =>
                exam._id ===
                selectedExamTitle
            )?.institutionId
              ?.institutionName ||
            hall?.institutionId
              ?.institutionName ||
            ""
          }
          disabled
          placeholder="Institution name"
        />

      </div>


      {/* =============================================
          HALL
      ============================================= */}

      <div className="exam_hall_print_field">

        <label>
          Exam Hall
        </label>

        <input
          type="text"
          value={
            hall
              ? `${hall.hallNumber} - ${hall.hallName}`
              : ""
          }
          disabled
        />

      </div>


      {/* =============================================
          DATE
      ============================================= */}

      <div className="exam_hall_print_field">

        <label>
          Exam Date
        </label>

        <input
          type="date"
          value={printDate}
          onChange={(e) =>
            setPrintDate(
              e.target.value
            )
          }
        />

      </div>


      {/* =============================================
          TIME
      ============================================= */}

      <div className="exam_hall_print_time_row">

        <div className="exam_hall_print_field">

          <label>
            Start Time
          </label>

          <input
            type="time"
            value={printStartTime}
            onChange={(e) =>
              setPrintStartTime(
                e.target.value
              )
            }
          />

        </div>


        <div className="exam_hall_print_field">

          <label>
            End Time
          </label>

          <input
            type="time"
            value={printEndTime}
            onChange={(e) =>
              setPrintEndTime(
                e.target.value
              )
            }
          />

        </div>

      </div>


      {/* =============================================
          ACTIONS
      ============================================= */}

{/* =============================================
    DOWNLOAD ACTIONS
============================================= */}

<div className="exam_hall_print_modal_actions">

  <button
    type="button"
    onClick={() =>
      setShowPrintModal(false)
    }
    disabled={
      pdfGenerating ||
      attendancePdfGenerating
    }
  >
    Cancel
  </button>


  {/* ===========================================
      SEATING ARRANGEMENT
  =========================================== */}

  <button
    type="button"
    onClick={
      generateExamHallPDF
    }
    disabled={
      pdfGenerating ||
      attendancePdfGenerating
    }
  >

    {pdfGenerating
      ? "Generating Seating PDF..."
      : "Download Seating Arrangement"}

  </button>


  {/* ===========================================
      ATTENDANCE SHEET
  =========================================== */}

  <button
    type="button"
    onClick={
      generateAttendancePDF
    }
    disabled={
      pdfGenerating ||
      attendancePdfGenerating
    }
  >

    {attendancePdfGenerating
      ? "Generating Attendance PDF..."
      : "Download Attendance Sheet"}

  </button>

</div>

    </div>

  </div>

)}

</div>


      {/* =================================================
    EXAM TITLE
================================================= */}

<div className="exam_hall_allocation_exam_title">

  <div>
    <label>
      Exam Title
    </label>

    <select
      value={selectedExamTitle}
      onChange={(e) =>
        setSelectedExamTitle(e.target.value)
      }
      disabled={examTitleLoading}
    >

      <option value="">
        {examTitleLoading
          ? "Loading exam titles..."
          : "Select Exam Title"}
      </option>

      {examTitles.map((examTitle) => (
        <option
          key={examTitle._id}
          value={examTitle._id}
        >
          {examTitle.title}
        </option>
      ))}

    </select>

  </div>

</div>

      {/* =================================================
          HALL INFORMATION
      ================================================= */}

      {hall && (
        <div className="exam_hall_allocation_info">

          <div>
            <span>
              Hall Number
            </span>

            <strong>
              {hall.hallNumber}
            </strong>
          </div>

          <div>
            <span>
              Hall Name
            </span>

            <strong>
              {hall.hallName}
            </strong>
          </div>

          <div>
            <span>
              Total Benches
            </span>

            <strong>
              {hall.totalBenches}
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {hall.status}
            </strong>
          </div>

        </div>
      )}

      {/* =================================================
          DESK ARRANGEMENT
      ================================================= */}

      {arrangementLoading ? (

        <div className="exam_hall_allocation_loading">
          Loading desk arrangement...
        </div>

      ) : !arrangement ? (

        <div className="exam_hall_allocation_empty">

          <p>
            No desk arrangement created
            for this hall.
          </p>

        </div>

      ) : (

        <div className="exam_hall_allocation_workspace">

          {/* =============================================
              DYNAMIC COLUMNS
          ============================================= */}

          {columns.map((column) => (

            <div
              key={column.columnKey}
              className={`exam_hall_allocation_column exam_hall_allocation_column_${column.side}`}
            >

              {/* =========================================
                  COLUMN HEADER
              ========================================= */}

<div className="exam_hall_allocation_column_header">

  <div>

    <strong>
      {column.columnKey}
    </strong>

    <span>
      {column.columnName}
    </span>

  </div>

  <div className="exam_hall_allocation_column_header_right">

    <small>
      {column.benches?.length || 0} Benches
    </small>

    <button
      type="button"
      className="exam_hall_allocation_column_assign_btn"
      onClick={() =>
        handleColumnAssignment(column)
      }
    >
      Assign Column
    </button>

  </div>

</div>

              {/* =========================================
                  BENCH LIST
              ========================================= */}

              <div className="exam_hall_allocation_bench_list">

{column.benches?.map((bench) => {

  // =====================================================
  // GET SAVED STUDENTS FOR THIS BENCH
  // =====================================================

  const benchStudents =
    getBenchAllocations(
      column.columnKey,
      bench.benchNumber
    );

  return (
    <div
   key={`${column.columnKey}-${bench.benchNumber}`}
  className="exam_hall_allocation_bench"
  onClick={() =>
    handleBenchClick(
      column,
      bench
    )
  }
    >

      {/* =================================================
          BENCH INFORMATION
      ================================================= */}

      <div>

        <strong>
          Bench{" "}
          {bench.benchNumber}
        </strong>

        <span>
          {column.columnKey}
        </span>

      </div>


      {/* =================================================
          CAPACITY
      ================================================= */}

      <span>
        Capacity:{" "}
        {bench.capacity}
      </span>


      {/* =================================================
          ALLOCATED STUDENTS
      ================================================= */}

{benchStudents.length > 0 && (

  <div className="exam_hall_allocated_students">

    {benchStudents.map(
      (allocation) => (

        <div
          key={allocation._id}
          className="exam_hall_allocated_student"
          onClick={(e) => e.stopPropagation()}
        >

          {/* SEAT NUMBER */}

          <span>
            {allocation.seatNumber}
          </span>


          {/* STUDENT DETAILS */}

          <div>

            <strong>
              {allocation.studentName}
            </strong>

            <small>
              {allocation.registerNumber}
            </small>

          </div>


          {/* REMOVE BUTTON */}

          <button
            type="button"
            className="exam_hall_allocated_student_remove"
            onClick={(e) => {
              e.stopPropagation();

              handleRemoveAllocatedStudent(
                allocation._id
              );
            }}
          >
            Remove
          </button>

        </div>

      )
    )}

  </div>

)}

    </div>
  );

})}
              </div>

            </div>

          ))}

        </div>

      )}

      {/* =================================================
          ALLOCATION MODAL
      ================================================= */}

{showAllocationModal &&
  (selectedBench || selectedColumn) && (
          <div className="exam_hall_allocation_modal_overlay">

<div className="exam_hall_allocation_modal">

  {/* =================================================
      MODAL HEADER
  ================================================= */}

  <div className="exam_hall_allocation_modal_header">

    <div>

      <h2>
        Assign Students
      </h2>

      {allocationTarget === "column" &&
        selectedColumn && (
          <p>
            {selectedColumn.columnKey}
            {" - "}
            {selectedColumn.columnName}
            {" • Total Capacity: "}
            {selectedColumn.totalCapacity}
          </p>
        )}

      {allocationTarget === "bench" &&
        selectedBench && (
          <p>
            {selectedBench.columnKey}
            {" - Bench "}
            {selectedBench.benchNumber}
            {" • Capacity: "}
            {selectedBench.capacity}
          </p>
        )}

    </div>

    <button
      type="button"
      onClick={closeAllocationModal}
    >
      ×
    </button>

  </div>


  {/* =================================================
      STEP 1
  ================================================= */}

  {allocationStep === 1 && (

    <>

      {/* PROGRAMME */}

      <div className="exam_hall_allocation_field">

        <label>
          Programme
        </label>

        <select
          value={selectedProgramme}
          onChange={
            handleProgrammeChange
          }
          disabled={programmeLoading}
        >

          <option value="">
            {programmeLoading
              ? "Loading programmes..."
              : "Select Programme"}
          </option>

          {programmes.map(
            (programme) => (

              <option
                key={programme._id}
                value={programme._id}
              >
                {programme.programmeName}

                {programme.programmeCode
                  ? ` (${programme.programmeCode})`
                  : ""}
              </option>

            )
          )}

        </select>

      </div>


      {/* BATCH */}

      <div className="exam_hall_allocation_field">

        <label>
          Batch
        </label>

        <select
          value={selectedBatch}
onChange={async (e) => {

  const batchId =
    e.target.value;

  setSelectedBatch(
    batchId
  );

  setSelectedSubject("");

  setSubjects([]);

  setFromStudent("");
  setToStudent("");
  setSelectedRangeStudents([]);
  setAvailableStudents([]);

  if (
    !batchId ||
    !selectedProgramme
  ) {
    return;
  }

  // ===============================================
  // FETCH SUBJECTS FOR THIS PROGRAMME + BATCH
  // ===============================================

  await fetchSubjects(
    selectedProgramme,
    batchId
  );

  // ===============================================
  // FETCH STUDENTS FOR THIS PROGRAMME + BATCH
  // ===============================================

  await fetchAllocationStudents(
    selectedProgramme,
    batchId
  );
}}
          disabled={
            !selectedProgramme ||
            batchLoading
          }
        >

          <option value="">

            {batchLoading
              ? "Loading batches..."
              : !selectedProgramme
              ? "Select programme first"
              : "Select Batch"}

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


      {/* SUBJECT */}

      <div className="exam_hall_allocation_field">

        <label>
          Subject
        </label>

        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(
              e.target.value
            )
          }
          disabled={
            !selectedProgramme ||
            subjectLoading
          }
        >

          <option value="">

            {subjectLoading
              ? "Loading subjects..."
              : !selectedProgramme
              ? "Select programme first"
              : subjects.length === 0
              ? "No subjects available"
              : "Select Subject"}

          </option>

          {subjects.map(
            (subject) => (

              <option
                key={subject._id}
                value={subject._id}
              >
                {subject.subjectName}

                {subject.subjectCode
                  ? ` (${subject.subjectCode})`
                  : ""}
              </option>

            )
          )}

        </select>

      </div>

{/* ASSIGNMENT MODE */}
{/* =================================================
    STUDENT RANGE
================================================= */}

<div className="exam_hall_allocation_field">

  <label>
    From Student
  </label>

  <select
    value={fromStudent}
    onChange={(e) =>
      handleStudentRangeChange(
        e.target.value,
        toStudent
      )
    }
    disabled={
      !selectedSubject ||
      studentLoading ||
      availableStudents.length === 0
    }
  >

    <option value="">
      Select starting student
    </option>

    {availableStudents.map(
      (student) => (

        <option
          key={
            student._id ||
            student.studentId
          }
          value={
            student._id ||
            student.studentId
          }
        >
          {student.registerNumber}
          {" - "}
          {student.studentName}
        </option>

      )
    )}

  </select>

</div>


<div className="exam_hall_allocation_field">

  <label>
    To Student
  </label>

  <select
    value={toStudent}
    onChange={(e) =>
      handleStudentRangeChange(
        fromStudent,
        e.target.value
      )
    }
    disabled={
      !fromStudent ||
      studentLoading ||
      availableStudents.length === 0
    }
  >

    <option value="">
      Select ending student
    </option>

    {availableStudents.map(
      (student) => (

        <option
          key={
            student._id ||
            student.studentId
          }
          value={
            student._id ||
            student.studentId
          }
        >
          {student.registerNumber}
          {" - "}
          {student.studentName}
        </option>

      )
    )}

  </select>

</div>


{/* =================================================
    SELECTED RANGE COUNT
================================================= */}

{selectedRangeStudents.length > 0 && (

  <div className="exam_hall_allocation_range_summary">

    Selected:{" "}
    <strong>
      {selectedRangeStudents.length}
    </strong>
    {" students"}

  </div>

)}

      <div className="exam_hall_allocation_mode">

        <label>
          Assignment Mode
        </label>

        <div>

          <label>

            <input
              type="radio"
              name="allocationMode"
              value="automatic"
              checked={
                allocationMode ===
                "automatic"
              }
              onChange={(e) =>
                setAllocationMode(
                  e.target.value
                )
              }
            />

            Automatic

          </label>


          <label>

            <input
              type="radio"
              name="allocationMode"
              value="manual"
              checked={
                allocationMode ===
                "manual"
              }
              onChange={(e) =>
                setAllocationMode(
                  e.target.value
                )
              }
            />

            Manual

          </label>

        </div>

      </div>


      {/* ACTIONS */}

      <div className="exam_hall_allocation_modal_actions">

        <button
          type="button"
          onClick={
            closeAllocationModal
          }
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={
            handleContinueAllocation
          }
          disabled={studentLoading}
        >

          {studentLoading
            ? "Loading Students..."
            : "Continue"}

        </button>

      </div>

    </>

  )}


  {/* =================================================
      STEP 2
  ================================================= */}

  {allocationStep === 2 && (

    <>

      <div className="allocation_preview_header">

        <div>

          <strong>
            {allocationMode ===
            "automatic"
              ? "Automatic Allocation Preview"
              : "Manual Student Selection"}
          </strong>

          <span>
            {availableStudents.length}
            {" students available"}
          </span>

        </div>

        <div>

          Capacity:{" "}
          {getAllocationCapacity()}

        </div>

      </div>


      {/* =============================================
          AUTOMATIC PREVIEW
      ============================================= */}
{allocationMode ===
  "automatic" && (

  <div className="allocation_preview_list">

    {allocationPreview.map(
      (bench) => (

        <div
          key={`${bench.columnKey}-${bench.benchNumber}`}
          className="allocation_preview_bench"
        >

          {/* =========================================
              PREVIEW BENCH HEADER
          ========================================= */}

          <div className="allocation_preview_bench_header">

            <strong>
              {bench.columnKey}
              {" - Bench "}
              {bench.benchNumber}
            </strong>

            <span>
              {bench.students.length}
              /
              {bench.capacity}
            </span>

          </div>


          {/* =========================================
              PREVIEW STUDENTS
          ========================================= */}

          <div className="allocation_preview_students">

            {bench.students.length === 0 ? (

              <p>
                No students available.
              </p>

            ) : (

bench.students.map(
  (student, index) => (

    <div
      key={
        student._id ||
        student.studentId ||
        index
      }
      className="allocation_preview_student"
    >

      {/* SEAT NUMBER */}

      <span>
        {student.seatNumber || index + 1}
      </span>


      {/* STUDENT DETAILS */}

      <div>

        <strong>
          {student.studentName}
        </strong>

        <small>
          {student.registerNumber}
        </small>

      </div>


      {/* REMOVE */}

      <button
        type="button"
        onClick={() =>
          handleRemovePreviewStudent(
            student._id ||
            student.studentId
          )
        }
      >
        Remove
      </button>

    </div>

  )
)

            )}

          </div>

        </div>

      )
    )}

  </div>

)}

      {/* =============================================
          MANUAL MODE
      ============================================= */}

      {allocationMode ===
        "manual" && (

        <div className="allocation_manual_students">

          <div className="allocation_manual_info">

            <span>
              Select students
            </span>

            <strong>
              0 /{" "}
              {getAllocationCapacity()}
            </strong>

          </div>


          {availableStudents.map(
            (student) => (

              <label
                key={
                  student._id ||
                  student.studentId
                }
                className="allocation_student_row"
              >

                <input
                  type="checkbox"
                />

                <div>

                  <strong>
                    {
                      student.studentName
                    }
                  </strong>

                  <small>
                    {
                      student.registerNumber
                    }
                  </small>

                </div>

              </label>

            )
          )}

        </div>

      )}


      {/* =============================================
          STEP 2 ACTIONS
      ============================================= */}

      <div className="exam_hall_allocation_modal_actions">

        <button
          type="button"
          onClick={
            handleAllocationBack
          }
        >
          Back
        </button>

<button
  type="button"
  onClick={handleAutomaticAssign}
  disabled={allocationSaving}
>
  {allocationSaving
    ? "Assigning..."
    : "Assign"}
</button>

      </div>

    </>

  )}

</div>

          </div>

        )}

    </div>
  );
};

export default ExamHallAllocation;