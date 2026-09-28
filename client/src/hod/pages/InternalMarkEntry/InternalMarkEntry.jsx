import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../api/axios";

import {
  ArrowLeftIcon,
  FloppyDiskIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  ExamIcon,
  UsersThreeIcon,
  BookOpenIcon,
} from "@phosphor-icons/react";

import "./InternalMarkEntry.css";


const InternalMarkEntry = () => {

  // =========================================================
  // CLASS
  // =========================================================

  const [myClass, setMyClass] =
    useState(null);


  // =========================================================
  // ACADEMIC CONTEXT
  // =========================================================

  const [context, setContext] =
    useState(null);


  const [subjects, setSubjects] =
    useState([]);


  const [students, setStudents] =
    useState([]);


  // =========================================================
  // EXAM
  // =========================================================

  const [examTitles, setExamTitles] =
    useState([]);


  const [selectedExamTitle, setSelectedExamTitle] =
    useState("");


  // =========================================================
  // INTERNAL MARK SHEET
  // =========================================================

  const [internalMarkId, setInternalMarkId] =
    useState(null);


  const [markSheetStatus, setMarkSheetStatus] =
    useState("DRAFT");


  // =========================================================
  // MARKS
  // =========================================================

  const [marks, setMarks] =
    useState([]);


  // =========================================================
  // LOADING STATES
  // =========================================================

  const [loadingClass, setLoadingClass] =
    useState(true);


  const [loadingContext, setLoadingContext] =
    useState(false);


  const [loadingMarkSheet, setLoadingMarkSheet] =
    useState(false);


  const [saving, setSaving] =
    useState(false);


  const [completing, setCompleting] =
    useState(false);


  // =========================================================
  // FETCH MY CLASS
  // =========================================================

  const fetchMyClass = async () => {

    try {

      setLoadingClass(true);

      const response =
        await API.get(
          "/internal-marks/my-class"
        );


      const classData =
        response.data.data;


      setMyClass(classData);


    } catch (error) {

      console.error(
        "Fetch my class error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to fetch your class."
      );


      setMyClass(null);


    } finally {

      setLoadingClass(false);

    }

  };


  // =========================================================
  // FETCH CLASS CONTEXT
  // =========================================================

  const fetchClassContext = async (
    classId
  ) => {

    if (!classId) return;


    try {

      setLoadingContext(true);


      const response =
        await API.get(
          `/internal-marks/classes/${classId}/context`
        );


      const data =
        response.data.data;


      setContext(data);


      setSubjects(
        data.subjects || []
      );


      setStudents(
        data.students || []
      );


    } catch (error) {

      console.error(
        "Fetch class context error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to fetch class academic context."
      );


      setContext(null);

      setSubjects([]);

      setStudents([]);


    } finally {

      setLoadingContext(false);

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

    setExamTitles(
      response.data.data || []
    );

  } catch (error) {
    console.error(
      "Fetch exam titles error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch exam titles."
    );
  }
};


  // =========================================================
  // INITIAL LOAD
  // =========================================================

useEffect(() => {
  fetchMyClass();
}, []);

  // =========================================================
  // LOAD CLASS CONTEXT
  // =========================================================

useEffect(() => {

  if (!myClass?._id) {
    return;
  }

  fetchClassContext(
    myClass._id
  );

  fetchExamTitles();

}, [myClass]);


  // =========================================================
  // CREATE EMPTY MARK STRUCTURE
  // =========================================================

  const createEmptyMarks = (
    studentList,
    subjectList
  ) => {

    return studentList.map(
      (student) => ({

        studentId:
          student._id,

        subjects:
          subjectList.map(
            (subject) => ({

              subjectId:
                subject._id,

              mark: null,

              status:
                "NOT_ENTERED",

            })
          ),

      })
    );

  };


  // =========================================================
  // INITIALIZE MARKS
  // =========================================================

  useEffect(() => {

    if (
      students.length &&
      subjects.length
    ) {

      setMarks(
        createEmptyMarks(
          students,
          subjects
        )
      );

    }

  }, [
    students,
    subjects,
  ]);


  // =========================================================
  // UPDATE MARK
  // =========================================================

  const handleMarkChange = (
    studentId,
    subjectId,
    value
  ) => {

    setMarks(
      (previous) =>
        previous.map(
          (student) => {

            if (
              student.studentId !==
              studentId
            ) {
              return student;
            }


            return {

              ...student,

              subjects:
                student.subjects.map(
                  (subject) => {

                    if (
                      subject.subjectId !==
                      subjectId
                    ) {
                      return subject;
                    }


                    return {

                      ...subject,

                      mark:
                        value === ""
                          ? null
                          : Number(value),

                      status:
                        value === ""
                          ? "NOT_ENTERED"
                          : "PRESENT",

                    };

                  }
                ),

            };

          }
        )
    );

  };


  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = (
    studentId,
    subjectId,
    status
  ) => {

    setMarks(
      (previous) =>
        previous.map(
          (student) => {

            if (
              student.studentId !==
              studentId
            ) {
              return student;
            }


            return {

              ...student,

              subjects:
                student.subjects.map(
                  (subject) => {

                    if (
                      subject.subjectId !==
                      subjectId
                    ) {
                      return subject;
                    }


                    return {

                      ...subject,

                      status,

                      mark:
                        status === "ABSENT"
                          ? null
                          : subject.mark,

                    };

                  }
                ),

            };

          }
        )
    );

  };


  // =========================================================
  // CREATE INTERNAL MARK SHEET
  // =========================================================

  const handleCreate = async () => {

    if (!selectedExamTitle) {

      toast.error(
        "Please select an exam title."
      );

      return;

    }


    try {

      setSaving(true);


      const response =
        await API.post(
          "/internal-marks",
          {

            classId:
              myClass._id,

            examTitleId:
              selectedExamTitle,

            marks,

          }
        );


      const data =
        response.data.data;


      setInternalMarkId(
        data._id
      );


      setMarkSheetStatus(
        data.status
      );


      toast.success(
        response.data.message ||
        "Internal mark sheet created successfully."
      );


    } catch (error) {

      console.error(
        "Create internal mark error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to create internal mark sheet."
      );


    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // UPDATE INTERNAL MARK SHEET
  // =========================================================

  const handleUpdate = async () => {

    if (!internalMarkId) return;


    try {

      setSaving(true);


      const response =
        await API.put(
          `/internal-marks/${internalMarkId}`,
          {
            marks,
          }
        );


      const data =
        response.data.data;


      setMarkSheetStatus(
        data.status
      );


      toast.success(
        response.data.message ||
        "Internal marks updated successfully."
      );


    } catch (error) {

      console.error(
        "Update internal marks error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to update internal marks."
      );


    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {

    if (markSheetStatus === "COMPLETED") {

      toast.warning(
        "Completed mark sheets cannot be edited."
      );

      return;

    }


    if (internalMarkId) {

      await handleUpdate();

    } else {

      await handleCreate();

    }

  };


  // =========================================================
  // COMPLETE MARK SHEET
  // =========================================================

  const handleComplete = async () => {

    if (!internalMarkId) {

      toast.error(
        "Please save the mark sheet first."
      );

      return;

    }


    try {

      setCompleting(true);


      const response =
        await API.patch(
          `/internal-marks/${internalMarkId}/complete`
        );


      const data =
        response.data.data;


      setMarkSheetStatus(
        data.status
      );


      toast.success(
        response.data.message ||
        "Internal mark sheet completed successfully."
      );


    } catch (error) {

      console.error(
        "Complete internal mark error:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Unable to complete mark sheet."
      );


    } finally {

      setCompleting(false);

    }

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loadingClass) {

    return (

      <div className="internal-mark-page">

        <div className="internal-mark-loading">

          Loading your class...

        </div>

      </div>

    );

  }


  // =========================================================
  // NO CLASS
  // =========================================================

  if (!myClass) {

    return (

      <div className="internal-mark-page">

        <div className="internal-mark-empty">

          <WarningCircleIcon
            size={42}
          />

          <h3>
            No Class Assigned
          </h3>

          <p>
            You are not currently assigned
            as a class incharge.
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="internal-mark-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="internal-mark-header">

        <div>

          <span className="internal-mark-eyebrow">
            INTERNAL EXAMINATION
          </span>

          <h1>
            Internal Mark Entry
          </h1>

          <p>
            Enter and manage internal examination
            marks for your class.
          </p>

        </div>


        <div className="internal-mark-header-actions">

          <button
            type="button"
            className="internal-mark-save-btn"
            onClick={handleSave}
            disabled={
              saving ||
              markSheetStatus === "COMPLETED"
            }
          >

            <FloppyDiskIcon
              size={17}
            />

            {saving
              ? "Saving..."
              : "Save Draft"}

          </button>


          <button
            type="button"
            className="internal-mark-complete-btn"
            onClick={handleComplete}
            disabled={
              completing ||
              !internalMarkId ||
              markSheetStatus === "COMPLETED"
            }
          >

            <CheckCircleIcon
              size={17}
            />

            {completing
              ? "Completing..."
              : "Complete"}

          </button>

        </div>

      </div>


      {/* ===================================================
          CLASS INFORMATION
      =================================================== */}

      <section className="internal-mark-card">


        <div className="internal-mark-section-header">

          <div className="internal-mark-section-icon">

            <UsersThreeIcon />

          </div>

          <div>

            <h2>
              Class Information
            </h2>

            <p>
              Academic context for this internal examination.
            </p>

          </div>

        </div>


        <div className="internal-mark-info-grid">


          <div className="internal-mark-info-item">

            <span>
              Programme
            </span>

            <strong>
              {context?.programme?.programmeName ||
                myClass.programme?.programmeName ||
                "—"}
            </strong>

          </div>


          <div className="internal-mark-info-item">

            <span>
              Batch
            </span>

            <strong>
              {context?.batch?.batchName ||
                myClass.batchId?.batchName ||
                "—"}
            </strong>

          </div>


          <div className="internal-mark-info-item">

            <span>
              Study Year
            </span>

            <strong>
              {context?.studyYear
                ? `Year ${context.studyYear}`
                : "—"}
            </strong>

          </div>


          <div className="internal-mark-info-item">

            <span>
              Semester
            </span>

            <strong>
              {context?.currentSemester
                ? `Semester ${context.currentSemester}`
                : "—"}
            </strong>

          </div>


          <div className="internal-mark-info-item">

            <span>
              Students
            </span>

            <strong>
              {students.length}
            </strong>

          </div>


          <div className="internal-mark-info-item">

            <span>
              Subjects
            </span>

            <strong>
              {subjects.length}
            </strong>

          </div>

        </div>

      </section>


      {/* ===================================================
          EXAM SELECTION
      =================================================== */}

      <section className="internal-mark-card">

        <div className="internal-mark-section-header">

          <div className="internal-mark-section-icon">

            <ExamIcon />

          </div>

          <div>

            <h2>
              Examination
            </h2>

            <p>
              Select the internal examination for this mark sheet.
            </p>

          </div>

        </div>


        <div className="internal-mark-form-group">

          <label>
            Exam Title
          </label>

          <select
            value={selectedExamTitle}
            onChange={(event) =>
              setSelectedExamTitle(
                event.target.value
              )
            }
            disabled={
              !!internalMarkId ||
              markSheetStatus === "COMPLETED"
            }
          >

            <option value="">
              Select Exam Title
            </option>

            {examTitles.map(
              (exam) => (

                <option
                  key={exam._id}
                  value={exam._id}
                >
                  {exam.title}
                </option>

              )
            )}

          </select>

        </div>

      </section>


      {/* ===================================================
          MARK ENTRY
      =================================================== */}

      <section className="internal-mark-card">


        <div className="internal-mark-section-header">

          <div className="internal-mark-section-icon">

            <BookOpenIcon />

          </div>

          <div>

            <h2>
              Internal Marks
            </h2>

            <p>
              Enter marks or mark students as absent.
            </p>

          </div>

        </div>


        {loadingContext ? (

          <div className="internal-mark-loading-small">

            Loading students and subjects...

          </div>

        ) : (

          <div className="internal-mark-table-wrapper">

            <table className="internal-mark-table">

              <thead>

                <tr>

                  <th>
                    #
                  </th>

                  <th>
                    Register Number
                  </th>

                  <th>
                    Student
                  </th>


                  {subjects.map(
                    (subject) => (

                      <th
                        key={subject._id}
                      >

                        <div>

                          <strong>
                            {subject.subjectCode}
                          </strong>

                          <span>
                            {subject.subjectName}
                          </span>

                          <small>
                            Max {subject.subjectScore}
                          </small>

                        </div>

                      </th>

                    )
                  )}

                </tr>

              </thead>


              <tbody>

                {students.map(
                  (student, studentIndex) => {

                    const studentMarks =
                      marks.find(
                        (item) =>
                          item.studentId ===
                          student._id
                      );


                    return (

                      <tr
                        key={student._id}
                      >

                        <td>
                          {studentIndex + 1}
                        </td>

                        <td>
                          {student.registerNumber ||
                            "—"}
                        </td>

                        <td>

                          <div className="internal-mark-student">

                            <strong>
                              {student.studentName}
                            </strong>

                            <span>
                              {student.applicationNumber}
                            </span>

                          </div>

                        </td>


                        {subjects.map(
                          (subject) => {

                            const subjectMark =
                              studentMarks?.subjects?.find(
                                (item) =>
                                  item.subjectId ===
                                  subject._id
                              );


                            return (

                              <td
                                key={subject._id}
                              >

                                <div className="internal-mark-input-cell">

                                  <input
                                    type="number"
                                    min="0"
                                    max={
                                      subject.subjectScore
                                    }
                                    value={
                                      subjectMark?.mark ??
                                      ""
                                    }
                                    disabled={
                                      markSheetStatus ===
                                      "COMPLETED" ||
                                      subjectMark?.status ===
                                      "ABSENT"
                                    }
                                    onChange={(event) =>
                                      handleMarkChange(
                                        student._id,
                                        subject._id,
                                        event.target.value
                                      )
                                    }
                                  />


                                  <select
                                    value={
                                      subjectMark?.status ||
                                      "NOT_ENTERED"
                                    }
                                    disabled={
                                      markSheetStatus ===
                                      "COMPLETED"
                                    }
                                    onChange={(event) =>
                                      handleStatusChange(
                                        student._id,
                                        subject._id,
                                        event.target.value
                                      )
                                    }
                                  >

                                    <option value="NOT_ENTERED">
                                      —
                                    </option>

                                    <option value="PRESENT">
                                      P
                                    </option>

                                    <option value="ABSENT">
                                      A
                                    </option>

                                  </select>

                                </div>

                              </td>

                            );

                          }
                        )}

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


    </div>

  );

};


export default InternalMarkEntry;