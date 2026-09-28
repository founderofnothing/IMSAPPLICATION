import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
// import API from "";
import API from "../../../api/axios";

import {
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  ArrowClockwise,
  TrashSimple,
  Eye,
  X,
  GraduationCap,
  Users,
  BookOpen,
  Funnel,
  CaretDown,
  ArrowUUpLeft,
  Warning,
} from "@phosphor-icons/react";

import "./PrincipalProgrammePage.css";

const PROGRAMME_TYPES = [
  "UG",
  "PG",
  "Diploma",
  "Certificate",
  "Other",
];

const EMPTY_FORM = {
  programmeName: "",
  programmeCode: "",
  programmeType: "UG",
  department: "",
  duration: "",
};

const PrincipalProgrammePage = () => {
  const [programmes, setProgrammes] = useState([]);
  const [deletedProgrammes, setDeletedProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingProgramme, setEditingProgramme] = useState(null);
  const [selectedProgramme, setSelectedProgramme] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  // ============================================================
  // FETCH PROGRAMMES
  // ============================================================

  const fetchProgrammes = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        "/programmes/principal/institution"
      );

      setProgrammes(response.data?.data || []);
    } catch (error) {
      console.error(
        "FETCH PROGRAMMES ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load programmes."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH DEPARTMENTS
  // ============================================================

  const fetchDepartments = async () => {
    try {
      /*
       * Change "/departments" only if your existing
       * Department API uses a different endpoint.
       */
      const response = await API.get("/departments");

      setDepartments(response.data?.data || []);
    } catch (error) {
      console.error(
        "FETCH DEPARTMENTS ERROR:",
        error
      );

      toast.error(
        "Unable to load departments."
      );
    }
  };

  // ============================================================
  // FETCH DELETED PROGRAMMES
  // ============================================================

  const fetchDeletedProgrammes = async () => {
    try {
      setDeletedLoading(true);

      const response = await API.get(
        "/programmes/deleted"
      );

      setDeletedProgrammes(
        response.data?.data || []
      );
    } catch (error) {
      console.error(
        "FETCH DELETED PROGRAMMES ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load recycle bin."
      );
    } finally {
      setDeletedLoading(false);
    }
  };

  useEffect(() => {
    fetchProgrammes();
    fetchDepartments();
  }, []);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const totalStudents = programmes.reduce(
      (sum, programme) =>
        sum + Number(programme.studentCount || 0),
      0
    );

    const ugCount = programmes.filter(
      (programme) =>
        programme.programmeType === "UG"
    ).length;

    const pgCount = programmes.filter(
      (programme) =>
        programme.programmeType === "PG"
    ).length;

    return {
      total: programmes.length,
      totalStudents,
      ugCount,
      pgCount,
    };
  }, [programmes]);

  // ============================================================
  // FILTER PROGRAMMES
  // ============================================================

  const filteredProgrammes = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return programmes.filter((programme) => {
      const matchesSearch =
        !searchValue ||
        programme.programmeName
          ?.toLowerCase()
          .includes(searchValue) ||
        programme.programmeCode
          ?.toLowerCase()
          .includes(searchValue) ||
        programme.department?.departmentName
          ?.toLowerCase()
          .includes(searchValue);

      const matchesDepartment =
        departmentFilter === "all" ||
        programme.department?._id ===
          departmentFilter;

      const matchesType =
        typeFilter === "all" ||
        programme.programmeType ===
          typeFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesType
      );
    });
  }, [
    programmes,
    search,
    departmentFilter,
    typeFilter,
  ]);

  // ============================================================
  // OPEN CREATE
  // ============================================================

  const handleAddProgramme = () => {
    setEditingProgramme(null);

    setForm({
      ...EMPTY_FORM,
    });

    setShowFormModal(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const handleEditProgramme = (programme) => {
    setEditingProgramme(programme);

    setForm({
      programmeName:
        programme.programmeName || "",
      programmeCode:
        programme.programmeCode || "",
      programmeType:
        programme.programmeType || "UG",
      department:
        programme.department?._id ||
        programme.department ||
        "",
      duration:
        programme.duration ?? "",
    });

    setShowFormModal(true);
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleFormChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.programmeName.trim() ||
      !form.programmeCode.trim() ||
      !form.programmeType ||
      !form.department ||
      !form.duration
    ) {
      toast.error(
        "Please fill all required fields."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        programmeName:
          form.programmeName.trim(),

        programmeCode:
          form.programmeCode
            .trim()
            .toUpperCase(),

        programmeType:
          form.programmeType,

        department:
          form.department,

        duration:
          Number(form.duration),
      };

      if (editingProgramme) {
        await API.put(
          `/programmes/${editingProgramme._id}`,
          payload
        );

        toast.success(
          "Programme updated successfully."
        );
      } else {
        await API.post(
          "/programmes",
          payload
        );

        toast.success(
          "Programme created successfully."
        );
      }

      setShowFormModal(false);
      setEditingProgramme(null);
      setForm({
        ...EMPTY_FORM,
      });

      await fetchProgrammes();
    } catch (error) {
      console.error(
        "SAVE PROGRAMME ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to save programme."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // SOFT DELETE
  // ============================================================

  const handleDeleteProgramme = (
    programme
  ) => {
    setDeleteTarget({
      type: "soft",
      programme,
    });

    setShowDeleteModal(true);
  };

  // ============================================================
  // CONFIRM SOFT DELETE
  // ============================================================

  const confirmSoftDelete = async () => {
    if (!deleteTarget?.programme) {
      return;
    }

    try {
      setSaving(true);

      await API.delete(
        `/programmes/${deleteTarget.programme._id}`
      );

      toast.success(
        "Programme moved to recycle bin."
      );

      setShowDeleteModal(false);
      setDeleteTarget(null);

      await fetchProgrammes();
    } catch (error) {
      console.error(
        "DELETE PROGRAMME ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to delete programme."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // RECYCLE BIN
  // ============================================================

  const openRecycleBin = async () => {
    setShowRecycleBin(true);
    await fetchDeletedProgrammes();
  };

  // ============================================================
  // RESTORE
  // ============================================================

  const handleRestoreProgramme = async (
    programmeId
  ) => {
    try {
      setSaving(true);

      await API.patch(
        `/programmes/restore/${programmeId}`
      );

      toast.success(
        "Programme restored successfully."
      );

      await fetchDeletedProgrammes();
      await fetchProgrammes();
    } catch (error) {
      console.error(
        "RESTORE PROGRAMME ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to restore programme."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // PERMANENT DELETE
  // ============================================================

  const handlePermanentDelete = (
    programme
  ) => {
    setDeleteTarget({
      type: "permanent",
      programme,
    });

    setShowDeleteModal(true);
  };

  const confirmPermanentDelete =
    async () => {
      if (!deleteTarget?.programme) {
        return;
      }

      try {
        setSaving(true);

        await API.delete(
          `/programmes/permanent-delete/${deleteTarget.programme._id}`
        );

        toast.success(
          "Programme permanently deleted."
        );

        setShowDeleteModal(false);
        setDeleteTarget(null);

        await fetchDeletedProgrammes();
      } catch (error) {
        console.error(
          "PERMANENT DELETE ERROR:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Unable to permanently delete programme."
        );
      } finally {
        setSaving(false);
      }
    };

  // ============================================================
  // VIEW DETAILS
  // ============================================================

  const handleViewDetails = async (
    programme
  ) => {
    try {
      const response = await API.get(
        `/programmes/${programme._id}/details`
      );

      setSelectedProgramme(
        response.data?.data || programme
      );

      setShowDetailsModal(true);
    } catch (error) {
      console.error(
        "PROGRAMME DETAILS ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load programme details."
      );
    }
  };

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {
    setSearch("");
    setDepartmentFilter("all");
    setTypeFilter("all");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="principal-programme-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="principal-programme-header">

        <div className="principal-programme-heading">

          <div className="principal-programme-eyebrow">
            ACADEMIC MANAGEMENT
          </div>

          <h1>Programmes</h1>

          <p>
            Manage academic programmes,
            departments and student strength.
          </p>

        </div>

        <div className="principal-programme-header-actions">

          <button
            type="button"
            className="principal-programme-recycle-btn"
            onClick={openRecycleBin}
          >
            <TrashSimple
              size={18}
              weight="regular"
            />

            <span>Recycle Bin</span>
          </button>

          <button
            type="button"
            className="principal-programme-add-btn"
            onClick={handleAddProgramme}
          >
            <Plus
              size={19}
              weight="bold"
            />

            <span>Add Programme</span>
          </button>

        </div>

      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="principal-programme-stat-grid">

        <div className="principal-programme-stat-card">

          <div className="principal-programme-stat-icon">
            <BookOpen
              size={21}
              weight="regular"
            />
          </div>

          <div>
            <span>Total Programmes</span>
            <strong>
              {statistics.total
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>

        </div>

        <div className="principal-programme-stat-card principal-programme-stat-card-dark">

          <div className="principal-programme-stat-icon">
            <Users
              size={21}
              weight="regular"
            />
          </div>

          <div>
            <span>Total Students</span>
            <strong>
              {statistics.totalStudents}
            </strong>
          </div>

        </div>

        <div className="principal-programme-stat-card">

          <div className="principal-programme-stat-icon">
            <GraduationCap
              size={21}
              weight="regular"
            />
          </div>

          <div>
            <span>UG Programmes</span>
            <strong>
              {statistics.ugCount
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>

        </div>

        <div className="principal-programme-stat-card">

          <div className="principal-programme-stat-icon">
            <GraduationCap
              size={21}
              weight="regular"
            />
          </div>

          <div>
            <span>PG Programmes</span>
            <strong>
              {statistics.pgCount
                .toString()
                .padStart(2, "0")}
            </strong>
          </div>

        </div>

      </div>

      {/* ======================================================
          WORKSPACE
      ====================================================== */}

      <div className="principal-programme-workspace">

        <div className="principal-programme-workspace-top">

          <div>
            <h2>Programme Directory</h2>

            <p>
              {filteredProgrammes.length}{" "}
              programmes shown
            </p>
          </div>

          <button
            type="button"
            className="principal-programme-refresh-btn"
            onClick={fetchProgrammes}
            disabled={loading}
          >
            <ArrowClockwise
              size={18}
              weight="regular"
              className={
                loading
                  ? "programme-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="principal-programme-filters">

          <div className="principal-programme-search">

            <MagnifyingGlass
              size={19}
              weight="regular"
            />

            <input
              type="text"
              placeholder="Search programme, code or department..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                <X size={15} />
              </button>
            )}

          </div>

          <div className="principal-programme-select">

            <Funnel
              size={17}
              weight="regular"
            />

            <select
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Departments
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

            <CaretDown size={14} />

          </div>

          <div className="principal-programme-select">

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Types
              </option>

              {PROGRAMME_TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

            <CaretDown size={14} />

          </div>

          {(search ||
            departmentFilter !==
              "all" ||
            typeFilter !== "all") && (
            <button
              type="button"
              className="principal-programme-clear-filter"
              onClick={resetFilters}
            >
              Clear
            </button>
          )}

        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="principal-programme-table-wrap">

          {loading ? (
            <div className="principal-programme-loading">
              <div className="principal-programme-loader" />
              <span>
                Loading programmes...
              </span>
            </div>
          ) : filteredProgrammes.length ===
            0 ? (
            <div className="principal-programme-empty">

              <div className="principal-programme-empty-icon">
                <BookOpen
                  size={27}
                  weight="regular"
                />
              </div>

              <h3>
                No programmes found
              </h3>

              <p>
                Try changing your filters
                or create a new programme.
              </p>

              <button
                type="button"
                onClick={handleAddProgramme}
              >
                <Plus size={17} />
                Add Programme
              </button>

            </div>
          ) : (
            <table className="principal-programme-table">

              <thead>
                <tr>
                  <th>PROGRAMME</th>
                  <th>CODE</th>
                  <th>DEPARTMENT</th>
                  <th>TYPE</th>
                  <th>DURATION</th>
                  <th>STUDENTS</th>
                  <th className="programme-action-head">
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>

                {filteredProgrammes.map(
                  (programme) => (
                    <tr
                      key={programme._id}
                    >

                      <td>
                        <div className="programme-name-cell">

                          <div className="programme-avatar">
                            {programme.programmeName
                              ?.charAt(0)
                              ?.toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {
                                programme.programmeName
                              }
                            </strong>

                            <span>
                              {
                                programme.programmeCode
                              }
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="programme-code">
                          {
                            programme.programmeCode
                          }
                        </span>
                      </td>

                      <td>
                        <span className="programme-department">
                          {
                            programme.department
                              ?.departmentName ||
                              "—"
                          }
                        </span>
                      </td>

                      <td>
                        <span
                          className={`programme-type programme-type-${programme.programmeType?.toLowerCase()}`}
                        >
                          {
                            programme.programmeType
                          }
                        </span>
                      </td>

                      <td>
                        <span className="programme-duration">
                          {
                            programme.duration
                          }{" "}
                          Years
                        </span>
                      </td>

                      <td>
                        <div className="programme-student-count">

                          <Users
                            size={16}
                            weight="regular"
                          />

                          <strong>
                            {
                              programme.studentCount ||
                              0
                            }
                          </strong>

                        </div>
                      </td>

                      <td>
                        <div className="programme-row-actions">

                          <button
                            type="button"
                            title="View"
                            className="programme-action-view"
                            onClick={() =>
                              handleViewDetails(
                                programme
                              )
                            }
                          >
                            <Eye
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            title="Edit"
                            className="programme-action-edit"
                            onClick={() =>
                              handleEditProgramme(
                                programme
                              )
                            }
                          >
                            <PencilSimple
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            className="programme-action-delete"
                            onClick={() =>
                              handleDeleteProgramme(
                                programme
                              )
                            }
                          >
                            <Trash
                              size={17}
                            />
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showFormModal && (
        <div
          className="principal-programme-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowFormModal(false);
            }
          }}
        >

          <div className="principal-programme-modal">

            <div className="principal-programme-modal-header">

              <div>
                <span>
                  {editingProgramme
                    ? "PROGRAMME MANAGEMENT"
                    : "NEW PROGRAMME"}
                </span>

                <h3>
                  {editingProgramme
                    ? "Edit Programme"
                    : "Add Programme"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowFormModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="principal-programme-form"
            >

              <div className="programme-form-field programme-form-field-full">

                <label>
                  Programme Name
                </label>

                <input
                  type="text"
                  name="programmeName"
                  placeholder="e.g. B.Com Computer Applications"
                  value={form.programmeName}
                  onChange={handleFormChange}
                  autoComplete="off"
                />

              </div>

              <div className="programme-form-field">

                <label>
                  Programme Code
                </label>

                <input
                  type="text"
                  name="programmeCode"
                  placeholder="e.g. BCOMCA"
                  value={form.programmeCode}
                  onChange={handleFormChange}
                  autoComplete="off"
                />

              </div>

              <div className="programme-form-field">

                <label>
                  Programme Type
                </label>

                <select
                  name="programmeType"
                  value={form.programmeType}
                  onChange={handleFormChange}
                >
                  {PROGRAMME_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    )
                  )}
                </select>

              </div>

              <div className="programme-form-field">

                <label>
                  Department
                </label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleFormChange}
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
                        {
                          department.departmentName
                        }
                      </option>
                    )
                  )}

                </select>

              </div>

              <div className="programme-form-field">

                <label>
                  Duration
                </label>

                <div className="programme-duration-input">

                  <input
                    type="number"
                    name="duration"
                    min="1"
                    max="10"
                    placeholder="3"
                    value={form.duration}
                    onChange={handleFormChange}
                  />

                  <span>Years</span>

                </div>

              </div>

              <div className="principal-programme-form-actions">

                <button
                  type="button"
                  className="programme-form-cancel"
                  onClick={() =>
                    setShowFormModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="programme-form-submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="programme-button-loader" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingProgramme ? (
                        <PencilSimple
                          size={17}
                        />
                      ) : (
                        <Plus size={18} />
                      )}

                      {editingProgramme
                        ? "Update Programme"
                        : "Create Programme"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {showDetailsModal &&
        selectedProgramme && (
          <div
            className="principal-programme-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setShowDetailsModal(false);
              }
            }}
          >

            <div className="principal-programme-details-modal">

              <div className="principal-programme-modal-header">

                <div>
                  <span>
                    PROGRAMME DETAILS
                  </span>

                  <h3>
                    {
                      selectedProgramme.programmeName
                    }
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetailsModal(
                      false
                    )
                  }
                >
                  <X size={20} />
                </button>

              </div>

              <div className="programme-details-content">

                <div className="programme-details-hero">

                  <div className="programme-details-avatar">
                    {selectedProgramme.programmeName
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <div>
                    <h4>
                      {
                        selectedProgramme.programmeName
                      }
                    </h4>

                    <span>
                      {
                        selectedProgramme.programmeCode
                      }
                    </span>
                  </div>

                </div>

                <div className="programme-details-grid">

                  <div>
                    <span>Department</span>
                    <strong>
                      {
                        selectedProgramme
                          .department
                          ?.departmentName ||
                          "—"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Programme Type</span>
                    <strong>
                      {
                        selectedProgramme.programmeType
                      }
                    </strong>
                  </div>

                  <div>
                    <span>Duration</span>
                    <strong>
                      {
                        selectedProgramme.duration
                      }{" "}
                      Years
                    </strong>
                  </div>

                  <div className="programme-detail-student-box">
                    <span>
                      Students
                    </span>

                    <strong>
                      {
                        selectedProgramme
                          .statistics
                          ?.studentCount ??
                          selectedProgramme.studentCount ??
                          0
                      }
                    </strong>
                  </div>

                </div>

              </div>

              <div className="programme-details-footer">

                <button
                  type="button"
                  onClick={() =>
                    setShowDetailsModal(
                      false
                    )
                  }
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(
                      false
                    );

                    handleEditProgramme(
                      selectedProgramme
                    );
                  }}
                >
                  <PencilSimple
                    size={17}
                  />
                  Edit Programme
                </button>

              </div>

            </div>

          </div>
        )}

      {/* ======================================================
          RECYCLE BIN
      ====================================================== */}

      {showRecycleBin && (
        <div
          className="principal-programme-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowRecycleBin(false);
            }
          }}
        >

          <div className="principal-programme-recycle-modal">

            <div className="principal-programme-modal-header">

              <div>
                <span>
                  PROGRAMME MANAGEMENT
                </span>

                <h3>
                  Recycle Bin
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowRecycleBin(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            <div className="programme-recycle-content">

              {deletedLoading ? (
                <div className="principal-programme-loading">
                  <div className="principal-programme-loader" />
                  <span>
                    Loading recycle bin...
                  </span>
                </div>
              ) : deletedProgrammes.length ===
                0 ? (
                <div className="programme-recycle-empty">

                  <TrashSimple
                    size={28}
                    weight="regular"
                  />

                  <h4>
                    Recycle bin is empty
                  </h4>

                  <p>
                    Deleted programmes will
                    appear here.
                  </p>

                </div>
              ) : (
                <div className="programme-recycle-list">

                  {deletedProgrammes.map(
                    (programme) => (
                      <div
                        className="programme-recycle-item"
                        key={
                          programme._id
                        }
                      >

                        <div>

                          <strong>
                            {
                              programme.programmeName
                            }
                          </strong>

                          <span>
                            {
                              programme.programmeCode
                            }{" "}
                            ·{" "}
                            {
                              programme
                                .department
                                ?.departmentName ||
                                "—"
                            }
                          </span>

                        </div>

                        <div className="programme-recycle-actions">

                          <button
                            type="button"
                            onClick={() =>
                              handleRestoreProgramme(
                                programme._id
                              )
                            }
                            disabled={saving}
                          >
                            <ArrowUUpLeft
                              size={17}
                            />

                            Restore
                          </button>

                          <button
                            type="button"
                            className="programme-permanent-delete"
                            onClick={() =>
                              handlePermanentDelete(
                                programme
                              )
                            }
                            disabled={saving}
                          >
                            <Trash
                              size={16}
                            />
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {showDeleteModal &&
        deleteTarget && (
          <div className="principal-programme-confirm-overlay">

            <div className="principal-programme-confirm-modal">

              <div className="programme-confirm-icon">
                <Warning
                  size={27}
                  weight="regular"
                />
              </div>

              <h3>
                {deleteTarget.type ===
                "permanent"
                  ? "Permanently delete programme?"
                  : "Move programme to recycle bin?"}
              </h3>

              <p>
                <strong>
                  {
                    deleteTarget.programme
                      ?.programmeName
                  }
                </strong>{" "}
                will be{" "}
                {deleteTarget.type ===
                "permanent"
                  ? "permanently removed from the database."
                  : "moved to the recycle bin and can be restored later."}
              </p>

              <div className="programme-confirm-actions">

                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(
                      false
                    );

                    setDeleteTarget(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    deleteTarget.type ===
                    "permanent"
                      ? "programme-confirm-danger"
                      : "programme-confirm-delete"
                  }
                  onClick={
                    deleteTarget.type ===
                    "permanent"
                      ? confirmPermanentDelete
                      : confirmSoftDelete
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Processing..."
                    : deleteTarget.type ===
                      "permanent"
                    ? "Delete Permanently"
                    : "Move to Recycle Bin"}
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default PrincipalProgrammePage;