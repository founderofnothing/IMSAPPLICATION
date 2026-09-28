import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./departmentpage.css";

const DepartmentPage = () => {

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  const [departments, setDepartments] =
    useState([]);

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  // =========================================================
  // DEPARTMENT OVERVIEW
  // =========================================================

  const [departmentData, setDepartmentData] =
    useState(null);

  // =========================================================
  // LOADING
  // =========================================================

  const [loadingDepartments, setLoadingDepartments] =
    useState(false);

  const [loadingOverview, setLoadingOverview] =
    useState(false);

  const [crudLoading, setCrudLoading] =
    useState(false);

  const [recycleLoading, setRecycleLoading] =
    useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  // =========================================================
  // CRUD MODALS
  // =========================================================

  const [showDepartmentModal, setShowDepartmentModal] =
    useState(false);

  const [showRecycleModal, setShowRecycleModal] =
    useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState(null);

  // =========================================================
  // DEPARTMENT FORM
  // =========================================================

  const [departmentForm, setDepartmentForm] =
    useState({
      departmentName: "",
      institution: "",
      hod: "",
    });

  // =========================================================
  // RECYCLE BIN
  // =========================================================

  const [deletedDepartments, setDeletedDepartments] =
    useState([]);

  // =========================================================
  // FETCH DEPARTMENTS
  // =========================================================

  const fetchDepartments = async (
    preferredDepartmentId = null
  ) => {

    try {

      setLoadingDepartments(true);

      const response =
        await API.get("/departments");

      const departmentList =
        response.data.data || [];

      setDepartments(departmentList);

      if (departmentList.length === 0) {

        setSelectedDepartment("");
        setDepartmentData(null);

        return;
      }

      /*
       * Preserve the currently selected department
       * whenever it still exists.
       *
       * Otherwise use the preferred department
       * or fall back to the first department.
       */

      const currentStillExists =
        selectedDepartment &&
        departmentList.some(
          (item) =>
            item._id === selectedDepartment
        );

      const preferredStillExists =
        preferredDepartmentId &&
        departmentList.some(
          (item) =>
            item._id === preferredDepartmentId
        );

      let departmentId = null;

      if (preferredStillExists) {

        departmentId =
          preferredDepartmentId;

      } else if (currentStillExists) {

        departmentId =
          selectedDepartment;

      } else {

        departmentId =
          departmentList[0]._id;
      }

      setSelectedDepartment(
        departmentId
      );

      await fetchDepartmentOverview(
        departmentId
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch departments."
      );

    } finally {

      setLoadingDepartments(false);

    }

  };

  // =========================================================
  // FETCH DEPARTMENT OVERVIEW
  // =========================================================

  const fetchDepartmentOverview =
    async (departmentId) => {

      if (!departmentId) {

        setDepartmentData(null);

        return;

      }

      try {

        setLoadingOverview(true);

        const response =
          await API.get(
            `/departments/${departmentId}/overview`
          );

        setDepartmentData(
          response.data.data || null
        );

      } catch (error) {

        setDepartmentData(null);

        toast.error(
          error.response?.data?.message ||
          "Failed to fetch department overview."
        );

      } finally {

        setLoadingOverview(false);

      }

    };

  // =========================================================
  // FETCH DELETED DEPARTMENTS
  // =========================================================

  const fetchDeletedDepartments =
    async () => {

      try {

        setRecycleLoading(true);

        const response =
          await API.get(
            "/departments/deleted"
          );

        setDeletedDepartments(
          response.data.data || []
        );

      } catch (error) {

        toast.error(
          error.response?.data?.message ||
          "Failed to fetch recycle bin."
        );

      } finally {

        setRecycleLoading(false);

      }

    };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    fetchDepartments();

  }, []);

  // =========================================================
  // DEPARTMENT CHANGE
  // =========================================================

  const handleDepartmentChange =
    (event) => {

      const departmentId =
        event.target.value;

      setSelectedDepartment(
        departmentId
      );

      fetchDepartmentOverview(
        departmentId
      );

    };

  // =========================================================
  // UNIQUE INSTITUTIONS
  // =========================================================
  /*
   * The Department API already populates institution.
   *
   * We use those populated institutions for the
   * create/edit dropdown instead of introducing
   * another API dependency here.
   */

  const institutions = useMemo(() => {

    const institutionMap =
      new Map();

    departments.forEach(
      (item) => {

        const institution =
          item.institution;

        if (
          institution?._id
        ) {

          institutionMap.set(
            institution._id,
            institution
          );

        }

      }
    );

    return Array.from(
      institutionMap.values()
    );

  }, [departments]);

  // =========================================================
  // AVAILABLE HODs
  // =========================================================
  /*
   * For the currently selected department,
   * the overview already provides faculty users.
   *
   * We use those users as HOD candidates.
   *
   * HOD is optional in the backend.
   */

  const availableHods = useMemo(() => {

    const facultyList =
      departmentData?.faculty?.faculties ||
      [];

    const hodMap =
      new Map();

    facultyList.forEach(
      (facultyItem) => {

        const user =
          facultyItem?.user;

        if (
          user?._id
        ) {

          hodMap.set(
            user._id,
            user
          );

        }

      }
    );

    return Array.from(
      hodMap.values()
    );

  }, [departmentData]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleDepartmentFormChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;

      setDepartmentForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

    };

  // =========================================================
  // RESET FORM
  // =========================================================

  const resetDepartmentForm =
    () => {

      setDepartmentForm({
        departmentName: "",
        institution: "",
        hod: "",
      });

      setEditingDepartment(null);

    };

  // =========================================================
  // OPEN CREATE
  // =========================================================

  const openCreateDepartment =
    () => {

      resetDepartmentForm();

      /*
       * If there is at least one known institution,
       * preselect the first one.
       */

      if (
        institutions.length > 0
      ) {

        setDepartmentForm(
          (previous) => ({
            ...previous,
            institution:
              institutions[0]._id,
          })
        );

      }

      setEditingDepartment(null);

      setShowDepartmentModal(true);

    };

  // =========================================================
  // OPEN EDIT
  // =========================================================

  const openEditDepartment =
    () => {

      if (!selectedDepartment) {

        toast.warning(
          "Please select a department first."
        );

        return;

      }

      const selected =
        departments.find(
          (item) =>
            item._id === selectedDepartment
        );

      if (!selected) {

        toast.error(
          "Department details could not be found."
        );

        return;

      }

      setEditingDepartment(
        selected
      );

      setDepartmentForm({
        departmentName:
          selected.departmentName ||
          "",

        institution:
          selected.institution?._id ||
          selected.institution ||
          "",

        hod:
          selected.hod?._id ||
          selected.hod ||
          "",
      });

      setShowDepartmentModal(true);

    };

  // =========================================================
  // CLOSE DEPARTMENT MODAL
  // =========================================================

  const closeDepartmentModal =
    () => {

      if (crudLoading) {
        return;
      }

      setShowDepartmentModal(false);

      resetDepartmentForm();

    };

  // =========================================================
  // CREATE / UPDATE DEPARTMENT
  // =========================================================

  const handleDepartmentSubmit =
    async (event) => {

      event.preventDefault();

      const departmentName =
        departmentForm.departmentName.trim();

      const institution =
        departmentForm.institution;

      const hod =
        departmentForm.hod;

      // -------------------------------------------------------
      // VALIDATION
      // -------------------------------------------------------

      if (!departmentName) {

        toast.error(
          "Department name is required."
        );

        return;

      }

      if (!institution) {

        toast.error(
          "Institution is required."
        );

        return;

      }

      try {

        setCrudLoading(true);

        const payload = {
          departmentName,
          institution,
          hod: hod || null,
        };

        // =====================================================
        // CREATE
        // =====================================================

        if (!editingDepartment) {

          const response =
            await API.post(
              "/departments",
              payload
            );

          const createdDepartment =
            response.data.data;

          toast.success(
            response.data.message ||
            "Department created successfully."
          );

          setShowDepartmentModal(
            false
          );

          resetDepartmentForm();

          /*
           * Refresh list and automatically
           * select the newly created department.
           */

          await fetchDepartments(
            createdDepartment?._id
          );

          return;

        }

        // =====================================================
        // UPDATE
        // =====================================================

        const response =
          await API.put(
            `/departments/${editingDepartment._id}`,
            payload
          );

        toast.success(
          response.data.message ||
          "Department updated successfully."
        );

        setShowDepartmentModal(
          false
        );

        resetDepartmentForm();

        /*
         * Keep the edited department selected.
         */

        await fetchDepartments(
          editingDepartment._id
        );

      } catch (error) {

        console.error(
          "Department save error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          (
            editingDepartment
              ? "Failed to update department."
              : "Failed to create department."
          )
        );

      } finally {

        setCrudLoading(false);

      }

    };

  // =========================================================
  // SOFT DELETE
  // =========================================================

  const handleDeleteDepartment =
    async () => {

      if (!selectedDepartment) {

        toast.warning(
          "Please select a department first."
        );

        return;

      }

      const selected =
        departments.find(
          (item) =>
            item._id === selectedDepartment
        );

      if (!selected) {
        return;
      }

      const confirmed =
        window.confirm(
          `Move "${selected.departmentName}" to the recycle bin?`
        );

      if (!confirmed) {
        return;
      }

      try {

        setCrudLoading(true);

        await API.delete(
          `/departments/${selectedDepartment}`
        );

        toast.success(
          "Department moved to recycle bin."
        );

        /*
         * Clear current data while the
         * active department list refreshes.
         */

        setDepartmentData(null);

        await fetchDepartments();

      } catch (error) {

        console.error(
          "Delete department error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to delete department."
        );

      } finally {

        setCrudLoading(false);

      }

    };

  // =========================================================
  // OPEN RECYCLE BIN
  // =========================================================

  const openRecycleBin =
    async () => {

      setShowRecycleModal(true);

      await fetchDeletedDepartments();

    };

  // =========================================================
  // CLOSE RECYCLE BIN
  // =========================================================

  const closeRecycleBin =
    () => {

      if (recycleLoading) {
        return;
      }

      setShowRecycleModal(false);

    };

  // =========================================================
  // RESTORE DEPARTMENT
  // =========================================================

  const handleRestoreDepartment =
    async (departmentId) => {

      const confirmed =
        window.confirm(
          "Restore this department?"
        );

      if (!confirmed) {
        return;
      }

      try {

        setActionLoadingId(
          departmentId
        );

        const response =
          await API.patch(
            `/departments/restore/${departmentId}`
          );

        toast.success(
          response.data.message ||
          "Department restored successfully."
        );

        /*
         * Remove it immediately from
         * recycle bin UI.
         */

        setDeletedDepartments(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !== departmentId
            )
        );

        /*
         * Refresh active departments and
         * automatically select restored one.
         */

        await fetchDepartments(
          departmentId
        );

      } catch (error) {

        console.error(
          "Restore department error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to restore department."
        );

      } finally {

        setActionLoadingId(null);

      }

    };

  // =========================================================
  // PERMANENT DELETE
  // =========================================================

  const handlePermanentDeleteDepartment =
    async (departmentId) => {

      const confirmed =
        window.confirm(
          "This will permanently delete the department. This action cannot be undone. Continue?"
        );

      if (!confirmed) {
        return;
      }

      try {

        setActionLoadingId(
          departmentId
        );

        const response =
          await API.delete(
            `/departments/permanent-delete/${departmentId}`
          );

        toast.success(
          response.data.message ||
          "Department permanently deleted."
        );

        /*
         * Remove immediately from recycle bin.
         */

        setDeletedDepartments(
          (previous) =>
            previous.filter(
              (item) =>
                item._id !== departmentId
            )
        );

      } catch (error) {

        console.error(
          "Permanent delete department error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to permanently delete department."
        );

      } finally {

        setActionLoadingId(null);

      }

    };

  // =========================================================
  // HELPERS
  // =========================================================

  const statistics =
    departmentData?.statistics || {};

  const department =
    departmentData?.department || {};

  const faculty =
    departmentData?.faculty || {};

  const students =
    departmentData?.students || {};

  const programmes =
    departmentData?.programmes || [];

  const classes =
    departmentData?.classes || [];

  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="department-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="department-page-header">

        <div>

          <span className="department-eyebrow">
            ACADEMIC MANAGEMENT
          </span>

          <h1>
            Department Overview
          </h1>

          <p>
            Select a department to view its
            academic statistics and structure.
          </p>

        </div>

        {/* ===================================================
            HEADER ACTION AREA
        =================================================== */}

        <div className="department-header-actions">

          {/* DEPARTMENT SELECT */}

          <div className="department-selector">

            <label>
              Department
            </label>

            <select
              value={selectedDepartment}
              onChange={
                handleDepartmentChange
              }
              disabled={
                loadingDepartments ||
                crudLoading
              }
            >

              <option value="">
                Select Department
              </option>

              {departments.map(
                (departmentItem) => (

                  <option
                    key={
                      departmentItem._id
                    }
                    value={
                      departmentItem._id
                    }
                  >

                    {
                      departmentItem.departmentName
                    }

                  </option>

                )
              )}

            </select>

          </div>

          {/* =================================================
              CRUD ACTIONS
          ================================================= */}

          <div className="department-crud-actions">

            <button
              type="button"
              className="department-action-btn department-action-recycle"
              onClick={
                openRecycleBin
              }
              disabled={crudLoading}
            >
              <span>
                ↻
              </span>

              Recycle
            </button>

            <button
              type="button"
              className="department-action-btn department-action-add"
              onClick={
                openCreateDepartment
              }
              disabled={crudLoading}
            >
              <span>
                +
              </span>

              Add Department
            </button>

          </div>

        </div>

      </div>


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!selectedDepartment && (

        <div className="department-empty-state">

          <div className="department-empty-icon">
            D
          </div>

          <h2>
            Select a Department
          </h2>

          <p>
            Choose a department from the dropdown
            to view its academic overview.
          </p>

        </div>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {selectedDepartment &&
        loadingOverview && (

          <div className="department-loading">

            <div className="department-spinner" />

            <p>
              Loading department overview...
            </p>

          </div>

        )}


      {/* =====================================================
          DEPARTMENT CONTENT
      ===================================================== */}

      {selectedDepartment &&
        !loadingOverview &&
        departmentData && (

          <>

            {/* =================================================
                DEPARTMENT IDENTITY
            ================================================= */}

            <section className="department-identity-card">

              <div className="department-identity-main">

                <div className="department-avatar">

                  {department.departmentName
                    ?.charAt(0)
                    ?.toUpperCase() || "D"}

                </div>

                <div>

                  <span>
                    DEPARTMENT
                  </span>

                  <h2>
                    {department.departmentName}
                  </h2>

                  <p>
                    {
                      department.institution
                        ?.institutionName ||
                      "Institution"
                    }
                  </p>

                </div>

              </div>


              <div className="department-identity-meta">

                <div>

                  <span>
                    HOD
                  </span>

                  <strong>
                    {
                      department.hod
                        ?.fullName ||
                      "Not Assigned"
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    PROGRAMMES
                  </span>

                  <strong>
                    {
                      statistics.totalProgrammes ||
                      0
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    CLASSES
                  </span>

                  <strong>
                    {
                      statistics.totalClasses ||
                      0
                    }
                  </strong>

                </div>

              </div>


              {/* =================================================
                  IDENTITY ACTIONS
              ================================================= */}

              <div className="department-identity-actions">

                <button
                  type="button"
                  onClick={
                    openEditDepartment
                  }
                  disabled={crudLoading}
                  title="Edit department"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={
                    handleDeleteDepartment
                  }
                  disabled={crudLoading}
                  title="Move department to recycle bin"
                >
                  Delete
                </button>

              </div>

            </section>


            {/* =================================================
                MAIN STATISTICS
            ================================================= */}

            <section className="department-stat-grid">

              {/* TOTAL STUDENTS */}

              <div className="department-stat-card">

                <div className="department-stat-top">

                  <span>
                    TOTAL STUDENTS
                  </span>

                  <div className="department-stat-icon">
                    ST
                  </div>

                </div>

                <strong>
                  {
                    statistics.totalStudents ||
                    0
                  }
                </strong>

                <p>
                  Students currently in department
                </p>

              </div>


              {/* TOTAL FACULTY */}

              <div className="department-stat-card">

                <div className="department-stat-top">

                  <span>
                    FACULTY
                  </span>

                  <div className="department-stat-icon">
                    FC
                  </div>

                </div>

                <strong>
                  {
                    statistics.totalFaculty ||
                    0
                  }
                </strong>

                <p>
                  Teaching faculty members
                </p>

              </div>


              {/* PROGRAMMES */}

              <div className="department-stat-card">

                <div className="department-stat-top">

                  <span>
                    PROGRAMMES
                  </span>

                  <div className="department-stat-icon">
                    PR
                  </div>

                </div>

                <strong>
                  {
                    statistics.totalProgrammes ||
                    0
                  }
                </strong>

                <p>
                  Academic programmes
                </p>

              </div>


              {/* CLASSES */}

              <div className="department-stat-card">

                <div className="department-stat-top">

                  <span>
                    CLASSES
                  </span>

                  <div className="department-stat-icon">
                    CL
                  </div>

                </div>

                <strong>
                  {
                    statistics.totalClasses ||
                    0
                  }
                </strong>

                <p>
                  Active department classes
                </p>

              </div>

            </section>


            {/* =================================================
                STUDENT / FACULTY BREAKDOWN
            ================================================= */}

            <section className="department-breakdown-grid">

              {/* STUDENT BREAKDOWN */}

              <div className="department-panel">

                <div className="department-panel-header">

                  <div>

                    <span>
                      STUDENT DISTRIBUTION
                    </span>

                    <h3>
                      Student Statistics
                    </h3>

                  </div>

                </div>


                <div className="department-breakdown-items">

                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Total Students
                      </span>

                      <small>
                        All students
                      </small>

                    </div>

                    <strong>
                      {
                        students.totalStudents ||
                        statistics.totalStudents ||
                        0
                      }
                    </strong>

                  </div>


                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Male
                      </span>

                      <small>
                        Male students
                      </small>

                    </div>

                    <strong>
                      {
                        students.maleStudents ||
                        statistics.maleStudents ||
                        0
                      }
                    </strong>

                  </div>


                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Female
                      </span>

                      <small>
                        Female students
                      </small>

                    </div>

                    <strong>
                      {
                        students.femaleStudents ||
                        statistics.femaleStudents ||
                        0
                      }
                    </strong>

                  </div>


                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Other
                      </span>

                      <small>
                        Other students
                      </small>

                    </div>

                    <strong>
                      {
                        students.otherStudents ||
                        statistics.otherStudents ||
                        0
                      }
                    </strong>

                  </div>

                </div>

              </div>


              {/* FACULTY BREAKDOWN */}

              <div className="department-panel">

                <div className="department-panel-header">

                  <div>

                    <span>
                      FACULTY DISTRIBUTION
                    </span>

                    <h3>
                      Faculty Statistics
                    </h3>

                  </div>

                </div>


                <div className="department-breakdown-items">

                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Total Faculty
                      </span>

                      <small>
                        Teaching faculty
                      </small>

                    </div>

                    <strong>
                      {
                        faculty.totalFaculty ||
                        statistics.totalFaculty ||
                        0
                      }
                    </strong>

                  </div>


                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Male
                      </span>

                      <small>
                        Male faculty
                      </small>

                    </div>

                    <strong>
                      {
                        faculty.maleFaculty ||
                        statistics.maleFaculty ||
                        0
                      }
                    </strong>

                  </div>


                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Female
                      </span>

                      <small>
                        Female faculty
                      </small>

                    </div>

                    <strong>
                      {
                        faculty.femaleFaculty ||
                        statistics.femaleFaculty ||
                        0
                      }
                    </strong>

                  </div>


                  <div className="department-breakdown-item">

                    <div>

                      <span>
                        Other
                      </span>

                      <small>
                        Other faculty
                      </small>

                    </div>

                    <strong>
                      {
                        faculty.otherFaculty ||
                        statistics.otherFaculty ||
                        0
                      }
                    </strong>

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                PROGRAMMES
            ================================================= */}

            <section className="department-panel">

              <div className="department-panel-header">

                <div>

                  <span>
                    ACADEMIC STRUCTURE
                  </span>

                  <h3>
                    Programmes
                  </h3>

                </div>

                <strong className="department-panel-count">
                  {programmes.length}
                </strong>

              </div>


              <div className="department-programme-grid">

                {programmes.length === 0 ? (

                  <div className="department-no-data">
                    No programmes found.
                  </div>

                ) : (

                  programmes.map(
                    (programme) => (

                      <div
                        className="department-programme-card"
                        key={programme._id}
                      >

                        <div>

                          <span className="department-programme-type">
                            {
                              programme.programmeType ||
                              "PROGRAMME"
                            }
                          </span>

                          <h4>
                            {
                              programme.programmeName
                            }
                          </h4>

                          <p>
                            {
                              programme.programmeCode ||
                              "No code"
                            }
                          </p>

                        </div>


                        <div className="department-programme-count">

                          <strong>
                            {
                              programme.studentCount ||
                              0
                            }
                          </strong>

                          <span>
                            Students
                          </span>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </section>


            {/* =================================================
                CLASSES
            ================================================= */}

            <section className="department-panel">

              <div className="department-panel-header">

                <div>

                  <span>
                    ACADEMIC STRUCTURE
                  </span>

                  <h3>
                    Classes
                  </h3>

                </div>

                <strong className="department-panel-count">
                  {classes.length}
                </strong>

              </div>


              <div className="department-class-grid">

                {classes.length === 0 ? (

                  <div className="department-no-data">
                    No classes found.
                  </div>

                ) : (

                  classes.map(
                    (classItem) => (

                      <div
                        className="department-class-card"
                        key={classItem._id}
                      >

                        <div className="department-class-info">

                          <span>
                            CLASS
                          </span>

                          <h4>
                            {
                              classItem.className ||
                              classItem.section ||
                              "Class"
                            }
                          </h4>

                          <p>
                            {
                              classItem.programme
                                ?.programmeName ||
                              "Programme"
                            }
                          </p>

                        </div>


                        <div className="department-class-count">

                          <strong>
                            {
                              classItem.studentCount ||
                              0
                            }
                          </strong>

                          <span>
                            Students
                          </span>

                        </div>

                      </div>

                    )
                  )

                )}

              </div>

            </section>

          </>

        )}


      {/* =======================================================
          ADD / EDIT DEPARTMENT MODAL
      ======================================================= */}

      {showDepartmentModal && (

        <div
          className="department-modal-overlay"
          onMouseDown={
            (event) => {

              if (
                event.target ===
                event.currentTarget
              ) {

                closeDepartmentModal();

              }

            }
          }
        >

          <div className="department-modal">

            {/* MODAL HEADER */}

            <div className="department-modal-header">

              <div>

                <span>
                  {
                    editingDepartment
                      ? "DEPARTMENT MANAGEMENT"
                      : "ACADEMIC MANAGEMENT"
                  }
                </span>

                <h2>
                  {
                    editingDepartment
                      ? "Edit Department"
                      : "Add Department"
                  }
                </h2>

                <p>
                  {
                    editingDepartment
                      ? "Update the department information."
                      : "Create a new academic department."
                  }
                </p>

              </div>

              <button
                type="button"
                className="department-modal-close"
                onClick={
                  closeDepartmentModal
                }
                disabled={crudLoading}
              >
                ×
              </button>

            </div>


            {/* FORM */}

            <form
              className="department-modal-form"
              onSubmit={
                handleDepartmentSubmit
              }
            >

              {/* DEPARTMENT NAME */}

              <div className="department-form-field">

                <label>
                  Department Name
                </label>

                <input
                  type="text"
                  name="departmentName"
                  value={
                    departmentForm.departmentName
                  }
                  onChange={
                    handleDepartmentFormChange
                  }
                  placeholder="e.g. Computer Science"
                  autoFocus
                  disabled={crudLoading}
                />

              </div>


              {/* INSTITUTION */}

              <div className="department-form-field">

                <label>
                  Institution
                </label>

                <select
                  name="institution"
                  value={
                    departmentForm.institution
                  }
                  onChange={
                    handleDepartmentFormChange
                  }
                  disabled={
                    crudLoading ||
                    institutions.length === 0
                  }
                >

                  <option value="">
                    Select institution
                  </option>

                  {institutions.map(
                    (institution) => (

                      <option
                        key={
                          institution._id
                        }
                        value={
                          institution._id
                        }
                      >

                        {
                          institution.institutionName
                        }

                        {
                          institution.institutionCode
                            ? ` (${institution.institutionCode})`
                            : ""
                        }

                      </option>

                    )
                  )}

                </select>

                {institutions.length === 0 && (

                  <small>
                    No institution data is currently available.
                  </small>

                )}

              </div>


              {/* HOD */}

              <div className="department-form-field">

                <label>
                  Head of Department
                  <span>
                    Optional
                  </span>
                </label>

                <select
                  name="hod"
                  value={
                    departmentForm.hod
                  }
                  onChange={
                    handleDepartmentFormChange
                  }
                  disabled={
                    crudLoading
                  }
                >

                  <option value="">
                    Not Assigned
                  </option>

                  {availableHods.map(
                    (hod) => (

                      <option
                        key={
                          hod._id
                        }
                        value={
                          hod._id
                        }
                      >

                        {
                          hod.fullName
                        }

                        {
                          hod.email
                            ? ` — ${hod.email}`
                            : ""
                        }

                      </option>

                    )
                  )}

                </select>

              </div>


              {/* FORM ACTIONS */}

              <div className="department-modal-actions">

                <button
                  type="button"
                  className="department-modal-cancel"
                  onClick={
                    closeDepartmentModal
                  }
                  disabled={crudLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="department-modal-submit"
                  disabled={
                    crudLoading ||
                    !departmentForm.departmentName.trim() ||
                    !departmentForm.institution
                  }
                >

                  {crudLoading ? (

                    <>
                      <span className="department-button-spinner" />

                      {
                        editingDepartment
                          ? "Updating..."
                          : "Creating..."
                      }

                    </>

                  ) : (

                    editingDepartment
                      ? "Save Changes"
                      : "Create Department"

                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =======================================================
          RECYCLE BIN MODAL
      ======================================================= */}

      {showRecycleModal && (

        <div
          className="department-modal-overlay"
          onMouseDown={
            (event) => {

              if (
                event.target ===
                event.currentTarget
              ) {

                closeRecycleBin();

              }

            }
          }
        >

          <div className="department-recycle-modal">

            {/* HEADER */}

            <div className="department-modal-header">

              <div>

                <span>
                  DEPARTMENT MANAGEMENT
                </span>

                <h2>
                  Recycle Bin
                </h2>

                <p>
                  Restore departments or permanently remove them.
                </p>

              </div>

              <button
                type="button"
                className="department-modal-close"
                onClick={
                  closeRecycleBin
                }
                disabled={recycleLoading}
              >
                ×
              </button>

            </div>


            {/* CONTENT */}

            {recycleLoading ? (

              <div className="department-recycle-loading">

                <div className="department-spinner" />

                <p>
                  Loading deleted departments...
                </p>

              </div>

            ) : deletedDepartments.length === 0 ? (

              <div className="department-recycle-empty">

                <div className="department-recycle-empty-icon">
                  ↻
                </div>

                <h3>
                  Recycle bin is empty
                </h3>

                <p>
                  Deleted departments will appear here.
                </p>

              </div>

            ) : (

              <div className="department-recycle-list">

                {deletedDepartments.map(
                  (deletedDepartment) => {

                    const isProcessing =
                      actionLoadingId ===
                      deletedDepartment._id;

                    return (

                      <div
                        className="department-recycle-item"
                        key={
                          deletedDepartment._id
                        }
                      >

                        <div className="department-recycle-info">

                          <div className="department-recycle-avatar">

                            {
                              deletedDepartment.departmentName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                              "D"
                            }

                          </div>

                          <div>

                            <strong>
                              {
                                deletedDepartment.departmentName
                              }
                            </strong>

                            <span>
                              {
                                deletedDepartment
                                  .institution
                                  ?.institutionName ||
                                "Institution"
                              }
                            </span>

                            {deletedDepartment.deletedAt && (

                              <small>
                                Deleted{" "}
                                {
                                  new Date(
                                    deletedDepartment.deletedAt
                                  ).toLocaleDateString()
                                }
                              </small>

                            )}

                          </div>

                        </div>


                        <div className="department-recycle-actions">

                          <button
                            type="button"
                            className="department-restore-btn"
                            onClick={() =>
                              handleRestoreDepartment(
                                deletedDepartment._id
                              )
                            }
                            disabled={
                              isProcessing
                            }
                          >
                            {
                              isProcessing
                                ? "..."
                                : "Restore"
                            }
                          </button>

                          <button
                            type="button"
                            className="department-permanent-delete-btn"
                            onClick={() =>
                              handlePermanentDeleteDepartment(
                                deletedDepartment._id
                              )
                            }
                            disabled={
                              isProcessing
                            }
                          >
                            {
                              isProcessing
                                ? "..."
                                : "Delete Forever"
                            }
                          </button>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>

  );

};

export default DepartmentPage;