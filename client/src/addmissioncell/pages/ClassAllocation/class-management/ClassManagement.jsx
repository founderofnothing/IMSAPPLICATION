import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../../api/axios";
import "./ClassManagement.css";

const ClassManagement = () => {

  // =========================================================
  // ROUTER
  // =========================================================

  const { classId } = useParams();
  const navigate = useNavigate();


  // =========================================================
  // CLASS STATES
  // =========================================================

  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);

  const [selectedStudents, setSelectedStudents] =
    useState([]);


  // =========================================================
  // CLASS ACTION STATES
  // =========================================================

  const [availableClasses, setAvailableClasses] =
    useState([]);

  const [targetClassId, setTargetClassId] =
    useState("");

  const [newSection, setNewSection] =
    useState("");

  const [mergeTargetClassId, setMergeTargetClassId] =
    useState("");


  const [loading, setLoading] =
    useState(true);

  const [movingStudents, setMovingStudents] =
    useState(false);

  const [splittingClass, setSplittingClass] =
    useState(false);

  const [mergingClass, setMergingClass] =
    useState(false);

  const [unassigningStudents, setUnassigningStudents] =
    useState(false);


  // =========================================================
  // STUDENT FORM STATES
  // =========================================================

  const [studentMode, setStudentMode] =
    useState("create");

  const [editingStudentId, setEditingStudentId] =
    useState(null);

  const [showStudentForm, setShowStudentForm] =
    useState(false);

  const [studentFormStep, setStudentFormStep] =
    useState(1);


  const [studentForm, setStudentForm] = useState({

    departmentId: "",
    programmeId: "",
    batchId: "",

    studentType: "UG",
    academicYear: "",

    registerNumber: "",

    studentName: "",

    gender: "",

    dateOfBirth: "",

    religion: "",
    communityCategory: "",

    fatherGuardianName: "",

    parentMobile: "",
    studentMobile: "",
    studentEmail: "",

    admissionStatus: "Applied",

    communicationAddress: {
      addressLine1: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },

    permanentAddress: {
      addressLine1: "",
      city: "",
      district: "",
      state: "",
      pincode: "",
    },

    sameAddress: true,

  });


  // =========================================================
  // RESET STUDENT FORM
  // =========================================================

  const resetStudentForm = () => {

    setStudentForm({

      departmentId: "",
      programmeId: "",
      batchId: "",

      studentType: "UG",

      academicYear: "",

      registerNumber: "",

      studentName: "",

      gender: "",

      dateOfBirth: "",

      religion: "",
      communityCategory: "",

      fatherGuardianName: "",

      parentMobile: "",
      studentMobile: "",
      studentEmail: "",

      admissionStatus: "Applied",

      communicationAddress: {
        addressLine1: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
      },

      permanentAddress: {
        addressLine1: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
      },

      sameAddress: true,

    });

    setStudentFormStep(1);

  };


  // =========================================================
  // NEXT STUDENT STEP
  // =========================================================

  const nextStudentStep = () => {

    if (studentMode === "update") {

      if (studentFormStep < 4) {

        setStudentFormStep(
          (prev) => prev + 1
        );

      }

      return;

    }


    // STEP 1

    if (studentFormStep === 1) {

      if (
        !studentForm.studentName ||
        !studentForm.gender ||
        !studentForm.dateOfBirth ||
        !studentForm.religion ||
        !studentForm.communityCategory ||
        !studentForm.fatherGuardianName ||
        !studentForm.parentMobile
      ) {

        toast.warning(
          "Please complete all required personal information."
        );

        return;

      }

    }


    // STEP 2

    if (studentFormStep === 2) {

      if (
        !studentForm.studentType ||
        !studentForm.academicYear ||
        !studentForm.admissionStatus
      ) {

        toast.warning(
          "Please complete the academic information."
        );

        return;

      }

    }


    // STEP 3

    if (studentFormStep === 3) {

      if (
        !studentForm.communicationAddress.addressLine1 ||
        !studentForm.communicationAddress.city ||
        !studentForm.communicationAddress.district ||
        !studentForm.communicationAddress.state ||
        !studentForm.communicationAddress.pincode
      ) {

        toast.warning(
          "Please complete the communication address."
        );

        return;

      }

    }


    if (studentFormStep < 4) {

      setStudentFormStep(
        (prev) => prev + 1
      );

    }

  };


  // =========================================================
  // PREVIOUS STEP
  // =========================================================

  const previousStudentStep = () => {

    if (studentFormStep > 1) {

      setStudentFormStep(
        (prev) => prev - 1
      );

    }

  };


  // =========================================================
  // STUDENT FORM CHANGE
  // =========================================================

  const handleStudentFormChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setStudentForm((prev) => ({

      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    }));

  };


  // =========================================================
  // ADDRESS CHANGE
  // =========================================================

  const handleStudentAddressChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setStudentForm((prev) => ({

      ...prev,

      communicationAddress: {

        ...prev.communicationAddress,

        [name]: value,

      },

    }));

  };


  // =========================================================
  // CREATE STUDENT
  // =========================================================

  const handleCreateStudent = async () => {

    try {

      const payload = {

        ...studentForm,

        departmentId:
          classData.department._id,

        programmeId:
          classData.programme._id,

        batchId:
          classData.batchId._id,

        classId:
          classData._id,

      };


      if (studentForm.sameAddress) {

        payload.permanentAddress = {

          ...payload.communicationAddress,

        };

      }


      const response = await API.post(
        "/students/create",
        payload
      );


      toast.success(
        response.data.message
      );


      await fetchClass();


      resetStudentForm();

      setShowStudentForm(false);


    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to create student."
      );

    }

  };


  // =========================================================
  // UPDATE STUDENT
  // =========================================================

  const handleUpdateStudent = async () => {

    try {

      const payload = {

        ...studentForm,

        departmentId:
          classData.department._id,

        programmeId:
          classData.programme._id,

        batchId:
          classData.batchId._id,

        classId:
          classData._id,

      };


      if (studentForm.sameAddress) {

        payload.permanentAddress = {

          ...payload.communicationAddress,

        };

      }


      const response = await API.put(

        `/students/${editingStudentId}`,

        payload

      );


      toast.success(
        response.data.message
      );


      await fetchClass();


      resetStudentForm();

      setEditingStudentId(null);

      setStudentMode("create");

      setShowStudentForm(false);


    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to update student."

      );

    }

  };


  // =========================================================
  // EDIT STUDENT
  // =========================================================

  const handleEditStudent = async (student) => {

    try {

      const response =
        await API.get(
          `/students/${student._id}`
        );


      const data =
        response.data.data;


      setStudentMode("update");

      setEditingStudentId(
        data._id
      );


      setStudentForm({

        ...data,

        dateOfBirth:
          data.dateOfBirth
            ? data.dateOfBirth
                .split("T")[0]
            : "",


        communicationAddress: {

          addressLine1:
            data.communicationAddress
              ?.addressLine1 || "",

          addressLine2:
            data.communicationAddress
              ?.addressLine2 || "",

          city:
            data.communicationAddress
              ?.city || "",

          district:
            data.communicationAddress
              ?.district || "",

          state:
            data.communicationAddress
              ?.state || "",

          pincode:
            data.communicationAddress
              ?.pincode || "",

        },


        permanentAddress: {

          addressLine1:
            data.permanentAddress
              ?.addressLine1 || "",

          addressLine2:
            data.permanentAddress
              ?.addressLine2 || "",

          city:
            data.permanentAddress
              ?.city || "",

          district:
            data.permanentAddress
              ?.district || "",

          state:
            data.permanentAddress
              ?.state || "",

          pincode:
            data.permanentAddress
              ?.pincode || "",

        },


        sameAddress: true,

      });


      setStudentFormStep(1);

      setShowStudentForm(true);


    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch student."
      );

    }

  };


  // =========================================================
  // FETCH CLASS
  // =========================================================

  const fetchClass = async () => {

    if (!classId) {

      setLoading(false);

      return;

    }


    try {

      setLoading(true);


      const response = await API.get(
        `/classes/${classId}`
      );


      setClassData(
        response.data?.data || null
      );


      setStudents(
        response.data?.students || []
      );


    } catch (error) {

      console.error(
        "Fetch class error:",
        error.response?.data || error
      );


      setClassData(null);

      setStudents([]);


      toast.error(
        error.response?.data?.message ||
        "Failed to fetch class."
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // FETCH AVAILABLE CLASSES
  // =========================================================

  const fetchAvailableClasses = async () => {

    if (!classData) return;


    try {

      const response = await API.get(
        "/classes/my-institution"
      );


      const allClasses =
        response.data?.data || [];


      const compatibleClasses =
        allClasses.filter((item) => {

          const sameDepartment =
            item.department?._id ===
            classData.department?._id;


          const sameProgramme =
            item.programme?._id ===
            classData.programme?._id;


          const sameBatch =
            item.batchId?._id ===
            classData.batchId?._id;


          const notCurrentClass =
            item._id !== classId;


          return (
            sameDepartment &&
            sameProgramme &&
            sameBatch &&
            notCurrentClass
          );

        });


      setAvailableClasses(
        compatibleClasses
      );


    } catch (error) {

      console.error(
        "Fetch target classes error:",
        error.response?.data || error
      );


      setAvailableClasses([]);


      toast.error(
        error.response?.data?.message ||
        "Failed to fetch available classes."
      );

    }

  };


  // =========================================================
  // SELECT STUDENT
  // =========================================================

  const handleStudentSelect = (studentId) => {

    setSelectedStudents((prev) =>

      prev.includes(studentId)

        ? prev.filter(
            (id) => id !== studentId
          )

        : [
            ...prev,
            studentId,
          ]

    );

  };


  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = () => {

    if (
      students.length > 0 &&
      selectedStudents.length ===
        students.length
    ) {

      setSelectedStudents([]);

      return;

    }


    setSelectedStudents(
      students.map(
        (student) => student._id
      )
    );

  };


  // =========================================================
  // MOVE STUDENTS
  // =========================================================

  const moveStudents = async () => {

    if (!selectedStudents.length) {

      toast.warning(
        "Select at least one student."
      );

      return;

    }


    if (!targetClassId) {

      toast.warning(
        "Select a target class."
      );

      return;

    }


    try {

      setMovingStudents(true);


      const response = await API.patch(
        "/students/move-students",
        {
          sourceClassId: classId,
          targetClassId,
          studentIds: selectedStudents,
        }
      );


      toast.success(
        response.data?.message ||
        "Students moved successfully."
      );


      setSelectedStudents([]);

      setTargetClassId("");


      await fetchClass();


    } catch (error) {

      console.error(
        "Move students error:",
        error.response?.data || error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to move students."
      );


    } finally {

      setMovingStudents(false);

    }

  };


  // =========================================================
  // SPLIT CLASS
  // =========================================================

  const splitClass = async () => {

    if (!selectedStudents.length) {

      toast.warning(
        "Select students to split."
      );

      return;

    }


    if (!newSection.trim()) {

      toast.warning(
        "Enter the new section."
      );

      return;

    }


    if (
      selectedStudents.length >=
      students.length
    ) {

      toast.warning(
        "At least one student must remain in the current class."
      );

      return;

    }


    try {

      setSplittingClass(true);


      const response = await API.patch(
        "/students/split-class",
        {
          sourceClassId: classId,

          newSection:
            newSection
              .trim()
              .toUpperCase(),

          studentIds:
            selectedStudents,

        }
      );


      toast.success(
        response.data?.message ||
        "Class split successfully."
      );


      setSelectedStudents([]);

      setNewSection("");

      setTargetClassId("");


      await fetchClass();

      await fetchAvailableClasses();


    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to split class."
      );


    } finally {

      setSplittingClass(false);

    }

  };


  // =========================================================
  // MERGE CLASS
  // =========================================================

  const mergeClass = async () => {

    if (!mergeTargetClassId) {

      toast.warning(
        "Select a class to merge into."
      );

      return;

    }


    if (
      mergeTargetClassId === classId
    ) {

      toast.warning(
        "Cannot merge a class into itself."
      );

      return;

    }


    try {

      setMergingClass(true);


      const response = await API.patch(
        "/students/merge-class",
        {
          sourceClassId: classId,
          targetClassId:
            mergeTargetClassId,
        }
      );


      toast.success(
        response.data?.message ||
        "Class merged successfully."
      );


      setSelectedStudents([]);

      setMergeTargetClassId("");


      navigate(-1);


    } catch (error) {

      console.error(
        "Merge class error:",
        error.response?.data || error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to merge class."
      );


    } finally {

      setMergingClass(false);

    }

  };


  // =========================================================
  // UNASSIGN STUDENTS
  // =========================================================

  const unassignStudents = async () => {

    if (!selectedStudents.length) {

      toast.warning(
        "Select at least one student."
      );

      return;

    }


    try {

      setUnassigningStudents(true);


      const response = await API.patch(
        "/students/unassign-class",
        {
          classId,
          studentIds:
            selectedStudents,
        }
      );


      toast.success(
        response.data?.message ||
        "Students removed from class successfully."
      );


      setSelectedStudents([]);


      await fetchClass();


    } catch (error) {

      console.error(
        "UNASSIGN STUDENTS ERROR:",
        error.response?.data || error
      );


      toast.error(
        error.response?.data?.message ||
        "Failed to remove students from class."
      );


    } finally {

      setUnassigningStudents(false);

    }

  };


  // =========================================================
  // INITIAL FETCH
  // =========================================================

  useEffect(() => {

    setSelectedStudents([]);

    setTargetClassId("");

    fetchClass();

  }, [classId]);


  // =========================================================
  // FETCH COMPATIBLE CLASSES
  // =========================================================

  useEffect(() => {

    if (classData) {

      fetchAvailableClasses();

    }

  }, [classData]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="class_management_page">

        <div className="class_management_state">

          <p>
            Loading class...
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // CLASS NOT FOUND
  // =========================================================

  if (!classData) {

    return (

      <div className="class_management_page">

        <div className="class_management_state">

          <p>
            Class not found.
          </p>


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


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="class_management_page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="class_management_header">

        <div className="class_management_header_info">

          <button
            type="button"
            className="class_management_back"
            onClick={() =>
              navigate(-1)
            }
          >
            ← Back
          </button>


          <div className="class_management_heading">

            <span className="class_management_eyebrow">
              Class Management
            </span>

            <h2>
              Section {classData.section}
            </h2>

            <p>
              Manage students and class allocation.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="student-create-button"
          onClick={() => {

            resetStudentForm();

            setStudentMode("create");

            setEditingStudentId(null);

            setStudentFormStep(1);

            setShowStudentForm(true);

          }}
        >
          + Create Student
        </button>

      </header>


      {/* =====================================================
          CLASS SUMMARY
      ===================================================== */}

      <section className="class_management_summary">

        <div className="class_summary_item">

          <span>
            Department
          </span>

          <strong>
            {classData.department
              ?.departmentName || "-"}
          </strong>

        </div>


        <div className="class_summary_item">

          <span>
            Programme
          </span>

          <strong>
            {classData.programme
              ?.programmeName || "-"}
          </strong>

        </div>


        <div className="class_summary_item">

          <span>
            Batch
          </span>

          <strong>
            {classData.batchId
              ?.batchName || "-"}
          </strong>

        </div>


        <div className="class_summary_item">

          <span>
            Section
          </span>

          <strong>
            {classData.section || "-"}
          </strong>

        </div>


        <div className="class_summary_item class_summary_total">

          <span>
            Total Students
          </span>

          <strong>
            {students.length}
          </strong>

        </div>

      </section>


      {/* =====================================================
          MANAGEMENT ACTIONS
      ===================================================== */}

      <section className="class_management_actions">


        {/* SELECTED STUDENT INFO */}

        <div className="selected_student_count">

          <strong>
            {selectedStudents.length}
          </strong>

          <span>
            students selected
          </span>

        </div>


        {/* REMOVE */}

        <button
          type="button"
          className="class_action_danger"
          onClick={unassignStudents}
          disabled={
            !selectedStudents.length ||
            unassigningStudents ||
            movingStudents ||
            splittingClass ||
            mergingClass
          }
        >
          {unassigningStudents
            ? "Removing..."
            : `Remove from Class (${selectedStudents.length})`}
        </button>


        {/* MOVE */}

        <div className="move_students_action">

          <select
            value={targetClassId}
            onChange={(e) =>
              setTargetClassId(
                e.target.value
              )
            }
            disabled={
              !selectedStudents.length ||
              movingStudents
            }
          >

            <option value="">
              Move to class...
            </option>


            {availableClasses.map(
              (item) => (

                <option
                  key={item._id}
                  value={item._id}
                >
                  Section {item.section}
                  {" — "}
                  {item.studentCount ?? 0}
                  {" Students"}
                </option>

              )
            )}

          </select>


          <button
            type="button"
            onClick={moveStudents}
            disabled={
              !selectedStudents.length ||
              !targetClassId ||
              movingStudents
            }
          >
            {movingStudents
              ? "Moving..."
              : `Move Selected (${selectedStudents.length})`}
          </button>

        </div>


        {/* SPLIT */}

        <div className="split_class_action">

          <input
            type="text"
            value={newSection}
            placeholder="New section e.g. C"
            maxLength={10}
            onChange={(e) =>
              setNewSection(
                e.target.value.toUpperCase()
              )
            }
            disabled={
              !selectedStudents.length ||
              splittingClass
            }
          />


          <button
            type="button"
            onClick={splitClass}
            disabled={
              !selectedStudents.length ||
              !newSection.trim() ||
              selectedStudents.length >=
                students.length ||
              splittingClass
            }
          >
            {splittingClass
              ? "Splitting..."
              : `Split Selected (${selectedStudents.length})`}
          </button>

        </div>


        {/* MERGE */}

        <div className="merge_class_action">

          <div className="merge_class_information">

            <strong>
              Merge Class
            </strong>

            <span>
              Merge all {students.length} students
              from Section {classData.section}
              into another section.
            </span>

          </div>


          <select
            value={mergeTargetClassId}
            onChange={(e) =>
              setMergeTargetClassId(
                e.target.value
              )
            }
            disabled={
              mergingClass ||
              availableClasses.length === 0
            }
          >

            <option value="">
              Merge into class...
            </option>


            {availableClasses.map(
              (item) => (

                <option
                  key={item._id}
                  value={item._id}
                >
                  Section {item.section}
                  {" — "}
                  {item.studentCount ?? 0}
                  {" Students"}
                </option>

              )
            )}

          </select>


          <button
            type="button"
            onClick={mergeClass}
            disabled={
              !mergeTargetClassId ||
              mergingClass
            }
          >
            {mergingClass
              ? "Merging..."
              : `Merge Section ${classData.section}`}
          </button>

        </div>

      </section>


      {/* =====================================================
          STUDENTS
      ===================================================== */}

      <section className="class_students_section">


        <div className="panel_header">

          <div>

            <span className="panel_header_label">
              Class roster
            </span>

            <h3>
              Students
            </h3>

            <span>
              {students.length} students
            </span>

          </div>

        </div>


        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="table_wrapper">

          <table className="allocation_table">

            <thead>

              <tr>

                <th>

                  <input
                    type="checkbox"
                    checked={
                      students.length > 0 &&
                      selectedStudents.length ===
                        students.length
                    }
                    onChange={
                      handleSelectAll
                    }
                  />

                </th>

                <th>
                  #
                </th>

                <th>
                  Student Name
                </th>

                <th>
                  Register No.
                </th>

                <th>
                  Gender
                </th>

                <th>
                  Mobile
                </th>

                <th>
                  Email
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {students.length > 0 ? (

                students.map(
                  (student, index) => (

                    <tr
                      key={student._id}
                    >

                      <td>

                        <input
                          type="checkbox"
                          checked={
                            selectedStudents.includes(
                              student._id
                            )
                          }
                          onChange={() =>
                            handleStudentSelect(
                              student._id
                            )
                          }
                        />

                      </td>


                      <td>
                        {index + 1}
                      </td>


<td>

  <div className="student_table_identity">

    <button
      type="button"
      className="student-name-button"
onClick={() =>
  navigate(`/admission-cell/student/${student._id}`)
}
    >
      {student.studentName}
    </button>

  </div>

</td>


                      <td>
                        {student.registerNumber ||
                          "-"}
                      </td>


                      <td>
                        {student.gender ||
                          "-"}
                      </td>


                      <td>
                        {student.studentMobile ||
                          "-"}
                      </td>


                      <td>
                        {student.studentEmail ||
                          "-"}
                      </td>


                      <td>

                        <button
                          type="button"
                          className="student-edit-btn"
                          onClick={() =>
                            handleEditStudent(
                              student
                            )
                          }
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="table_empty"
                  >

                    <div className="table_empty_content">

                      <strong>
                        No students assigned
                      </strong>

                      <span>
                        There are currently no students
                        assigned to this class.
                      </span>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* =====================================================
          STUDENT FORM POPUP
      ===================================================== */}

      {showStudentForm && (

        <div
          className="student-popup-overlay"
          onClick={() => {

            resetStudentForm();

            setStudentMode("create");

            setEditingStudentId(null);

            setShowStudentForm(false);

          }}
        >

          <div
            className="student-popup-wrapper"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* =================================================
                POPUP HEADER
            ================================================= */}

            <div className="student-popup-header">

              <div>

                <span className="student-popup-eyebrow">
                  Student Management
                </span>

                <h2 className="student-popup-title">

                  {studentMode === "create"
                    ? "Create Student"
                    : "Update Student"}

                </h2>


                <p className="student-popup-subtitle">
                  Complete the required student
                  information.
                </p>

              </div>


              <button
                type="button"
                className="student-popup-close"
                onClick={() => {

                  resetStudentForm();

                  setStudentMode("create");

                  setEditingStudentId(null);

                  setShowStudentForm(false);

                }}
              >
                ✕
              </button>

            </div>


            {/* =================================================
                POPUP BODY
            ================================================= */}

            <div className="student-popup-body">


              {/* STEP NAVIGATION */}

              <div className="student-step-navigation">


                <div
                  className={`student-step-card ${
                    studentFormStep === 1
                      ? "active"
                      : ""
                  }`}
                >

                  <div className="student-step-number">
                    1
                  </div>

                  <div>

                    <h4 className="student-step-card_field">
                      Personal
                    </h4>

                    <span className="student-step-card_fielddata">
                      Basic student details
                    </span>

                  </div>

                </div>


                <div
                  className={`student-step-card ${
                    studentFormStep === 2
                      ? "active"
                      : ""
                  }`}
                >

                  <div className="student-step-number">
                    2
                  </div>

                  <div>

                    <h4 className="student-step-card_field">
                      Academic
                    </h4>

                    <span className="student-step-card_fielddata">
                      Course information
                    </span>

                  </div>

                </div>


                <div
                  className={`student-step-card ${
                    studentFormStep === 3
                      ? "active"
                      : ""
                  }`}
                >

                  <div className="student-step-number">
                    3
                  </div>

                  <div>

                    <h4 className="student-step-card_field">
                      Address
                    </h4>

                    <span className="student-step-card_fielddata">
                      Contact details
                    </span>

                  </div>

                </div>


                <div
                  className={`student-step-card ${
                    studentFormStep === 4
                      ? "active"
                      : ""
                  }`}
                >

                  <div className="student-step-number">
                    4
                  </div>

                  <div>

                    <h4 className="student-step-card_field">
                      Review
                    </h4>

                    <span className="student-step-card_fielddata">
                      Final confirmation
                    </span>

                  </div>

                </div>

              </div>


              {/* =================================================
                  STEP CONTENT
              ================================================= */}

              <div className="student-step-content">


                {/* =================================================
                    STEP 1
                ================================================= */}

                {studentFormStep === 1 && (

                  <div className="student-entry-section">

                    <div className="student-entry-section-header">

                      <h3>
                        Personal Information
                      </h3>

                      <p>
                        Enter the student's basic
                        personal details.
                      </p>

                    </div>


                    <div className="student-entry-grid">


                      <div className="student-form-group">

                        <label>
                          Student Name
                        </label>

                        <input
                          type="text"
                          name="studentName"
                          value={
                            studentForm.studentName
                          }
                          onChange={
                            handleStudentFormChange
                          }
                          placeholder="Enter student name"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Student Type
                        </label>

<input
  type="text"
  value={studentForm.studentType}
  readOnly
/>

                      </div>


                      <div className="student-form-group">

                        <label>
                          Gender
                        </label>

                        <select
                          name="gender"
                          value={
                            studentForm.gender
                          }
                          onChange={
                            handleStudentFormChange
                          }
                        >

                          <option value="">
                            Select Gender
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


                      <div className="student-form-group">

                        <label>
                          Date of Birth
                        </label>

                        <input
                          type="date"
                          name="dateOfBirth"
                          value={
                            studentForm.dateOfBirth
                          }
                          onChange={
                            handleStudentFormChange
                          }
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Religion
                        </label>

                        <select
                          name="religion"
                          value={
                            studentForm.religion
                          }
                          onChange={
                            handleStudentFormChange
                          }
                        >

                          <option value="">
                            Select Religion
                          </option>

                          <option value="Hindu">
                            Hindu
                          </option>

                          <option value="Muslim">
                            Muslim
                          </option>

                          <option value="Christian">
                            Christian
                          </option>

                          <option value="Other">
                            Other
                          </option>

                        </select>

                      </div>


                      <div className="student-form-group">

                        <label>
                          Community
                        </label>

                        <select
                          name="communityCategory"
                          value={
                            studentForm.communityCategory
                          }
                          onChange={
                            handleStudentFormChange
                          }
                        >

                          <option value="">
                            Select Community
                          </option>

                          <option value="OC">
                            OC
                          </option>

                          <option value="BC">
                            BC
                          </option>

                          <option value="MBC">
                            MBC
                          </option>

                          <option value="BCM">
                            BCM
                          </option>

                          <option value="DNC">
                            DNC
                          </option>

                          <option value="SC">
                            SC
                          </option>

                          <option value="SCA">
                            SCA
                          </option>

                          <option value="ST">
                            ST
                          </option>

                          <option value="Other">
                            Other
                          </option>

                        </select>

                      </div>


                      <div className="student-form-group">

                        <label>
                          Father / Guardian Name
                        </label>

                        <input
                          type="text"
                          name="fatherGuardianName"
                          value={
                            studentForm.fatherGuardianName
                          }
                          onChange={
                            handleStudentFormChange
                          }
                          placeholder="Enter parent / guardian name"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Parent Mobile
                        </label>

                        <input
                          type="text"
                          name="parentMobile"
                          value={
                            studentForm.parentMobile
                          }
                          onChange={
                            handleStudentFormChange
                          }
                          placeholder="Enter parent mobile number"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Student Mobile
                        </label>

                        <input
                          type="text"
                          name="studentMobile"
                          value={
                            studentForm.studentMobile
                          }
                          onChange={
                            handleStudentFormChange
                          }
                          placeholder="Enter student mobile number"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Student Email
                        </label>

                        <input
                          type="email"
                          name="studentEmail"
                          value={
                            studentForm.studentEmail
                          }
                          onChange={
                            handleStudentFormChange
                          }
                          placeholder="Enter student email"
                        />

                      </div>

                    </div>

                  </div>

                )}


                {/* =================================================
                    STEP 2
                ================================================= */}

                {studentFormStep === 2 && (

                  <div className="student-entry-section">

                    <div className="student-entry-section-header">

                      <h3>
                        Academic Information
                      </h3>

                      <p>
                        Verify the class details and
                        complete the academic information.
                      </p>

                    </div>


                    <div className="student-entry-grid">


                      <div className="student-form-group">

                        <label>
                          Department
                        </label>

                        <input
                          type="text"
                          value={
                            classData?.department
                              ?.departmentName || ""
                          }
                          readOnly
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Programme
                        </label>

                        <input
                          type="text"
                          value={
                            classData?.programme
                              ?.programmeName || ""
                          }
                          readOnly
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Batch
                        </label>

                        <input
                          type="text"
                          value={
                            classData?.batchId
                              ?.batchName || ""
                          }
                          readOnly
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Section
                        </label>

                        <input
                          type="text"
                          value={
                            classData?.section || ""
                          }
                          readOnly
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Student Type
                        </label>

<input
  type="text"
  value={studentForm.studentType}
  readOnly
/>

                      </div>


                      <div className="student-form-group">

                        <label>
                          Academic Year
                        </label>

<input
  type="text"
  value={studentForm.academicYear}
  readOnly
/>

                      </div>


                      <div className="student-form-group">

                        <label>
                          Register Number
                        </label>

                        <input
                          type="text"
                          name="registerNumber"
                          value={
                            studentForm.registerNumber
                          }
                          onChange={
                            handleStudentFormChange
                          }
                          placeholder="Enter register number"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Admission Status
                        </label>

                        <select
                          name="admissionStatus"
                          value={
                            studentForm.admissionStatus
                          }
                          onChange={
                            handleStudentFormChange
                          }
                        >

                          <option value="Applied">
                            Applied
                          </option>

                          <option value="Selected">
                            Selected
                          </option>

                          <option value="Admitted">
                            Admitted
                          </option>

                          <option value="Discontinued">
                            Discontinued
                          </option>

                        </select>

                      </div>

                    </div>

                  </div>

                )}


                {/* =================================================
                    STEP 3
                ================================================= */}

                {studentFormStep === 3 && (

                  <div className="student-entry-section">

                    <div className="student-entry-section-header">

                      <h3>
                        Address Information
                      </h3>

                      <p>
                        Enter the student's communication
                        address.
                      </p>

                    </div>


                    <div className="student-entry-grid">


                      <div className="student-form-group student-full-width">

                        <label>
                          Address Line
                        </label>

                        <input
                          type="text"
                          name="addressLine1"
                          value={
                            studentForm
                              .communicationAddress
                              .addressLine1
                          }
                          onChange={
                            handleStudentAddressChange
                          }
                          placeholder="Enter address"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          City
                        </label>

                        <input
                          type="text"
                          name="city"
                          value={
                            studentForm
                              .communicationAddress
                              .city
                          }
                          onChange={
                            handleStudentAddressChange
                          }
                          placeholder="Enter city"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          District
                        </label>

                        <input
                          type="text"
                          name="district"
                          value={
                            studentForm
                              .communicationAddress
                              .district
                          }
                          onChange={
                            handleStudentAddressChange
                          }
                          placeholder="Enter district"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          State
                        </label>

                        <input
                          type="text"
                          name="state"
                          value={
                            studentForm
                              .communicationAddress
                              .state
                          }
                          onChange={
                            handleStudentAddressChange
                          }
                          placeholder="Enter state"
                        />

                      </div>


                      <div className="student-form-group">

                        <label>
                          Pincode
                        </label>

                        <input
                          type="text"
                          name="pincode"
                          value={
                            studentForm
                              .communicationAddress
                              .pincode
                          }
                          onChange={
                            handleStudentAddressChange
                          }
                          placeholder="Enter pincode"
                        />

                      </div>


                      <div className="student-form-group student-full-width">

                        <label className="student-checkbox-label">

                          <input
                            type="checkbox"
                            name="sameAddress"
                            checked={
                              studentForm.sameAddress
                            }
                            onChange={
                              handleStudentFormChange
                            }
                          />

                          <span>
                            Permanent address is same
                            as communication address
                          </span>

                        </label>

                      </div>

                    </div>

                  </div>

                )}


                {/* =================================================
                    STEP 4
                ================================================= */}

                {studentFormStep === 4 && (

                  <div className="student-entry-section">

                    <div className="student-entry-section-header">

                      <h3>
                        Review Student Information
                      </h3>

                      <p>
                        Verify all information before
                        creating the student.
                      </p>

                    </div>


                    <div className="student-review-grid">


                      <div className="student-review-item">

                        <span>
                          Student Name
                        </span>

                        <strong>
                          {studentForm.studentName || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Student Type
                        </span>

                        <strong>
                          {studentForm.studentType || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Gender
                        </span>

                        <strong>
                          {studentForm.gender || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Department
                        </span>

                        <strong>
                          {classData?.department
                            ?.departmentName || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Programme
                        </span>

                        <strong>
                          {classData?.programme
                            ?.programmeName || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Batch
                        </span>

                        <strong>
                          {classData?.batchId
                            ?.batchName || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Section
                        </span>

                        <strong>
                          {classData?.section || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Academic Year
                        </span>

                        <strong>
                          {studentForm.academicYear || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Register Number
                        </span>

                        <strong>
                          {studentForm.registerNumber || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Father / Guardian
                        </span>

                        <strong>
                          {studentForm.fatherGuardianName || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Parent Mobile
                        </span>

                        <strong>
                          {studentForm.parentMobile || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Student Mobile
                        </span>

                        <strong>
                          {studentForm.studentMobile || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Student Email
                        </span>

                        <strong>
                          {studentForm.studentEmail || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item">

                        <span>
                          Admission Status
                        </span>

                        <strong>
                          {studentForm.admissionStatus || "-"}
                        </strong>

                      </div>


                      <div className="student-review-item student-full-width">

                        <span>
                          Communication Address
                        </span>

                        <strong>

                          {[
                            studentForm
                              .communicationAddress
                              .addressLine1,

                            studentForm
                              .communicationAddress
                              .city,

                            studentForm
                              .communicationAddress
                              .district,

                            studentForm
                              .communicationAddress
                              .state,

                            studentForm
                              .communicationAddress
                              .pincode,

                          ]
                            .filter(Boolean)
                            .join(", ") || "-"}

                        </strong>

                      </div>

                    </div>

                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                POPUP FOOTER
            ================================================= */}

            <div className="student-popup-footer">


              <button
                type="button"
                className="student-footer-button student-footer-cancel"
                onClick={() => {

                  resetStudentForm();

                  setStudentMode("create");

                  setEditingStudentId(null);

                  setShowStudentForm(false);

                }}
              >
                Cancel
              </button>


              <div className="student-footer-actions">


                {studentFormStep > 1 && (

                  <button
                    type="button"
                    className="student-footer-button student-footer-secondary"
                    onClick={
                      previousStudentStep
                    }
                  >
                    ← Previous
                  </button>

                )}


                {studentFormStep < 4 ? (

                  <button
                    type="button"
                    className="student-footer-button student-footer-primary"
                    onClick={
                      nextStudentStep
                    }
                  >
                    Next →
                  </button>

                ) : (

                  <button
                    type="button"
                    className="student-footer-button student-footer-primary"
                    onClick={
                      studentMode === "create"
                        ? handleCreateStudent
                        : handleUpdateStudent
                    }
                  >

                    {studentMode === "create"
                      ? "Create Student"
                      : "Update Student"}

                  </button>

                )}

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default ClassManagement;