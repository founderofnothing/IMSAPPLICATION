import { useEffect, useState } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";

import "./ExamResultPage.css"

const ExamResultPage = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [examTitles, setExamTitles] = useState([]);
  const [examPapers, setExamPapers] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExamTitle, setSelectedExamTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [studentData, setStudentData] = useState(null);

  const [conductedMark, setConductedMark] = useState("");
  const [students, setStudents] = useState([]);

  // =========================================================
  // FETCH DEPARTMENTS
  // =========================================================

  const fetchDepartments = async () => {
    try {
      const response = await API.get("/departments");

      setDepartments(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch departments."
      );
    }
  };

  // =========================================================
  // FETCH CLASSES
  // =========================================================

  const fetchClasses = async (departmentId) => {
    if (!departmentId) {
      setClasses([]);
      return;
    }

    try {
      const response = await API.get(
        `/classes/department/${departmentId}`
      );

      setClasses(response.data.data.classes || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch classes."
      );
    }
  };

  // =========================================================
  // FETCH EXAM TITLES
  // =========================================================

  const fetchExamTitles = async () => {
    try {
      const response = await API.get(
        "/exams/exam-title"
      );

      setExamTitles(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch exam titles."
      );
    }
  };

  // =========================================================
  // FETCH EXAM PAPERS
  // =========================================================

const fetchExamPapers = async () => {

  if (!selectedClass || !selectedExamTitle) {

    setExamPapers([]);

    return;

  }

  try {

    setLoading(true);

    const response =
      await API.get(
        `/exams/exam-paper?classId=${selectedClass}&examTitleId=${selectedExamTitle}`
      );

    setExamPapers(
      response.data.data?.papers || []
    );

  } catch (error) {

    setExamPapers([]);

    toast.error(
      error.response?.data?.message ||
        "Failed to fetch exam papers."
    );

  } finally {

    setLoading(false);

  }

};

  // =========================================================
  // SAVE / UPDATE STUDENT MARKS
  // =========================================================

  const saveMarks = async () => {
    // -------------------------------------------------------
    // VALIDATE CONDUCTED MARK
    // -------------------------------------------------------

    if (!conductedMark) {
      toast.error("Please enter conducted mark.");
      return;
    }

    // -------------------------------------------------------
    // VALIDATE STUDENT MARKS
    // -------------------------------------------------------

    for (const student of students) {
      if (
        student.obtainedMark != null &&
        Number(student.obtainedMark) >
          Number(conductedMark)
      ) {
        toast.error(
          `${student.studentName} mark exceeds conducted mark.`
        );

        return;
      }
    }

    try {
      setSaving(true);

      // -----------------------------------------------------
      // REQUEST PAYLOAD
      // -----------------------------------------------------

      const payload = {
        examPaperId: selectedPaper.examPaperId,

        conductedMark: Number(conductedMark),

        marks: students.map((student) => ({
          studentId: student.studentId,
          obtainedMark: student.obtainedMark,
        })),
      };

      // -----------------------------------------------------
      // SAVE / UPDATE
      // -----------------------------------------------------

      if (selectedPaper.completed) {
        await API.put(
          "/exams/student-exam-mark",
          payload
        );

        toast.success(
          "Marks updated successfully."
        );
      } else {
        await API.post(
          "/exams/student-exam-mark",
          payload
        );

        toast.success(
          "Marks saved successfully."
        );
      }

      // -----------------------------------------------------
      // REFRESH
      // -----------------------------------------------------

      await fetchExamPapers();

      // -----------------------------------------------------
      // RESET MODAL
      // -----------------------------------------------------

      setShowModal(false);
      setSelectedPaper(null);
      setStudentData(null);
      setStudents([]);
      setConductedMark("");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to save marks."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // OPEN EXAM PAPER
  // =========================================================

  const openPaper = async (paper) => {
    setSelectedPaper(paper);

    try {
      const response = await API.get(
        `/exams/student-exam-mark/${paper.examPaperId}`
      );

      setStudentData(response.data.data);

      setStudents(
        response.data.data.students
      );

      setConductedMark(
        response.data.data.exam.conductedMark ?? ""
      );

      setShowModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch marks."
      );
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchDepartments();
    fetchExamTitles();
  }, []);

  // =========================================================
  // FETCH CLASSES WHEN DEPARTMENT CHANGES
  // =========================================================

  useEffect(() => {
    if (selectedDepartment) {
      fetchClasses(selectedDepartment);
    } else {
      setClasses([]);
    }

    setSelectedClass("");
  }, [selectedDepartment]);

  // =========================================================
  // FETCH PAPERS WHEN CLASS / EXAM CHANGES
  // =========================================================

  useEffect(() => {
    fetchExamPapers();
  }, [
    selectedClass,
    selectedExamTitle,
  ]);

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setSelectedPaper(null);
    setStudentData(null);
    setStudents([]);
    setConductedMark("");
  };

  // =========================================================
  // UPDATE STUDENT MARK
  // =========================================================

  const handleStudentMarkChange = (
    index,
    value
  ) => {
    const updatedStudents = [...students];

    updatedStudents[index] = {
      ...updatedStudents[index],

      obtainedMark:
        value === ""
          ? null
          : Number(value),
    };

    setStudents(updatedStudents);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="exam-result-page">

      {/* =====================================================
          FILTER SECTION
      ===================================================== */}

      <div className="filter-row">

        <select
          className="exam-filter-select"
          value={selectedDepartment}
          onChange={(e) =>
            setSelectedDepartment(e.target.value)
          }
        >
          <option value="">
            Select Department
          </option>

          {departments.map((department) => (
            <option
              key={department._id}
              value={department._id}
            >
              {department.departmentName}
            </option>
          ))}
        </select>

        <select
          className="exam-filter-select"
          value={selectedClass}
          onChange={(e) =>
            setSelectedClass(e.target.value)
          }
        >
          <option value="">
            Select Class
          </option>

          {classes.map((item) => (
            <option
              key={item._id}
              value={item._id}
            >
              {item.programme?.programmeName}{" "}
              {item.section || ""}
            </option>
          ))}
        </select>

        <select
          className="exam-filter-select"
          value={selectedExamTitle}
          onChange={(e) =>
            setSelectedExamTitle(e.target.value)
          }
        >
          <option value="">
            Select Exam Title
          </option>

          {examTitles.map((exam) => (
            <option
              key={exam._id}
              value={exam._id}
            >
              {exam.title}
            </option>
          ))}
        </select>

      </div>

      {/* =====================================================
          EXAM PAPER TABLE
      ===================================================== */}

      <div className="table-container">

        <table className="exam-paper-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Subject Code</th>
              <th>Subject</th>
              <th>Conducted Mark</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  className="table-message"
                  colSpan="6"
                >
                  Loading...
                </td>
              </tr>
            ) : examPapers.length === 0 ? (
              <tr>
                <td
                  className="table-message"
                  colSpan="6"
                >
                  No Exam Papers Found
                </td>
              </tr>
            ) : (
              examPapers.map(
                (paper, index) => (
                  <tr
                    key={paper.examPaperId}
                  >
                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {paper.subjectCode}
                    </td>

                    <td>
                      {paper.subjectName}
                    </td>

                    <td>
                      {paper.conductedMark ?? "-"}
                    </td>

                    <td>
                      <span
                        className={`exam-status ${
                          paper.completed
                            ? "exam-status-completed"
                            : "exam-status-pending"
                        }`}
                      >
                        {paper.completed
                          ? "Completed"
                          : "Pending"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="exam-paper-action"
                        onClick={() =>
                          openPaper(paper)
                        }
                      >
                        {paper.completed
                          ? "Edit"
                          : "Enter"}
                      </button>
                    </td>
                  </tr>
                )
              )
            )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          MARK ENTRY MODAL
      ===================================================== */}

      {showModal && studentData && (
        <div
          className="exam-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="exam-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="exam-modal-header">

              <div className="exam-modal-title">
                <h2>
                  Exam Mark Entry
                </h2>

                <p>
                  Enter student marks for this subject
                </p>
              </div>

              <button
                type="button"
                className="exam-modal-close"
                aria-label="Close mark entry"
                onClick={closeModal}
              >
                ✕
              </button>

            </div>

            {/* =================================================
                MODAL BODY
            ================================================= */}

            <div className="exam-modal-body">

              {/* ===============================================
                  EXAM INFORMATION
              =============================================== */}

              <div className="exam-info">

                <div className="exam-info-item">
                  <span className="exam-info-label">
                    Exam
                  </span>

                  <strong className="exam-info-value">
                    {studentData.exam.examTitle}
                  </strong>
                </div>

                <div className="exam-info-item">
                  <span className="exam-info-label">
                    Subject
                  </span>

                  <strong className="exam-info-value">
                    {studentData.exam.subject}
                  </strong>
                </div>

                <div className="exam-info-item">
                  <span className="exam-info-label">
                    Subject Code
                  </span>

                  <strong className="exam-info-value">
                    {studentData.exam.subjectCode}
                  </strong>
                </div>

                <div className="exam-info-item exam-conducted-mark">

                  <label
                    htmlFor="conductedMark"
                    className="exam-info-label"
                  >
                    Conducted Mark
                  </label>

                  <input
                    id="conductedMark"
                    className="conducted-mark-input"
                    type="number"
                    min="1"
                    value={conductedMark}
                    disabled={
                      selectedPaper?.completed
                    }
                    onChange={(e) =>
                      setConductedMark(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* ===============================================
                  STUDENT MARK TABLE
              =============================================== */}

              <div className="student-mark-table-wrapper">

                <table className="student-mark-table">

                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Register No</th>
                      <th>Student Name</th>
                      <th>Mark</th>
                    </tr>
                  </thead>

                  <tbody>

                    {students.length === 0 ? (
                      <tr>
                        <td
                          className="table-message"
                          colSpan="4"
                        >
                          No students found.
                        </td>
                      </tr>
                    ) : (
                      students.map(
                        (student, index) => (
                          <tr
                            key={student.studentId}
                          >

                            <td>
                              {index + 1}
                            </td>

                            <td className="student-register-number">
                              {student.registerNumber}
                            </td>

                            <td className="student-name">
                              {student.studentName}
                            </td>

                            <td className="student-mark-cell">

                              <input
                                className="student-mark-input"
                                type="number"
                                min="0"
                                max={
                                  conductedMark ||
                                  undefined
                                }
                                value={
                                  student.obtainedMark ??
                                  ""
                                }
                                placeholder="Mark"
                                onChange={(e) =>
                                  handleStudentMarkChange(
                                    index,
                                    e.target.value
                                  )
                                }
                              />

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="exam-modal-footer">

              <button
                type="button"
                className="exam-modal-cancel"
                disabled={saving}
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="exam-modal-save"
                disabled={saving}
                onClick={saveMarks}
              >
                {saving
                  ? "Saving..."
                  : selectedPaper?.completed
                    ? "Update Marks"
                    : "Save Marks"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ExamResultPage;