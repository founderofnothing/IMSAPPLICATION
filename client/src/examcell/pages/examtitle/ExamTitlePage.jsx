import { useEffect, useState } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./ExamTitlePage.css";

const ExamTitlePage = () => {
  // ==================== DATA ====================

  const [examTitles, setExamTitles] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  // ==================== FILTERS ====================

  const [search, setSearch] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");

  // ==================== PAGINATION ====================

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(10);

  // ==================== STATES ====================

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const [editingExamTitle, setEditingExamTitle] = useState(null);

  // ==================== FORM ====================

  const [formData, setFormData] = useState({
    institutionId: "",
    title: "",
  });

  // ==================== RECYCLE BIN ====================

  const [deletedExamTitles, setDeletedExamTitles] = useState([]);

  const [recycleLoading, setRecycleLoading] = useState(false);

  // =========================================================
  // FETCH INSTITUTIONS
  // =========================================================

  const fetchInstitutions = async () => {
    try {
      const response = await API.get("/institutions");

      setInstitutions(response.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch institutions."
      );
    }
  };

  // =========================================================
  // FETCH EXAM TITLES
  // =========================================================

  const fetchExamTitles = async () => {
    try {
      setLoading(true);

      let url = `/exams/exam-title?page=${currentPage}&limit=${limit}`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      if (selectedInstitution) {
        url += `&institutionId=${selectedInstitution}`;
      }

      const response = await API.get(url);

      setExamTitles(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalRecords(response.data.totalRecords || 0);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch exam titles."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH RECYCLE BIN
  // =========================================================

  const fetchRecycleBin = async () => {
    try {
      setRecycleLoading(true);

      // The current backend does not have a dedicated
      // recycle-bin GET endpoint.
      //
      // So this request intentionally uses the existing
      // exam-title endpoint with a temporary approach.
      //
      // This section can be connected to a dedicated
      // recycle-bin API when that backend route is added.

      setDeletedExamTitles([]);
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
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    setEditingExamTitle(null);

    setFormData({
      institutionId: "",
      title: "",
    });

    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = async (examTitleId) => {
    try {
      setSaving(true);

      const response = await API.get(
        `/exams/exam-title/${examTitleId}`
      );

      const examTitle = response.data.data;

      setEditingExamTitle(examTitle);

      setFormData({
        institutionId: examTitle.institutionId?._id || "",
        title: examTitle.title || "",
      });

      setShowModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch exam title."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // HANDLE FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================================================
  // SAVE EXAM TITLE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.institutionId) {
      toast.error("Please select an institution.");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter exam title.");
      return;
    }

    try {
      setSaving(true);

      if (editingExamTitle) {
        await API.put(
          `/exams/exam-title/${editingExamTitle._id}`,
          {
            title: formData.title.trim(),
          }
        );

        toast.success(
          "Exam title updated successfully."
        );
      } else {
        await API.post(
          "/exams/exam-title",
          {
            institutionId: formData.institutionId,
            title: formData.title.trim(),
          }
        );

        toast.success(
          "Exam title created successfully."
        );
      }

      setShowModal(false);

      setEditingExamTitle(null);

      setFormData({
        institutionId: "",
        title: "",
      });

      await fetchExamTitles();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to save exam title."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE EXAM TITLE
  // =========================================================

  const deleteExamTitle = async (examTitleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to move this exam title to the recycle bin?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/exams/exam-title/${examTitleId}`
      );

      toast.success(
        "Exam title moved to recycle bin successfully."
      );

      await fetchExamTitles();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to delete exam title."
      );
    }
  };

  // =========================================================
  // RESTORE EXAM TITLE
  // =========================================================

  const restoreExamTitle = async (examTitleId) => {
    try {
      await API.put(
        `/exams/exam-title/${examTitleId}/restore`
      );

      toast.success(
        "Exam title restored successfully."
      );

      await fetchRecycleBin();
      await fetchExamTitles();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to restore exam title."
      );
    }
  };

  // =========================================================
  // PERMANENT DELETE
  // =========================================================

  const permanentlyDeleteExamTitle = async (
    examTitleId
  ) => {
    const confirmed = window.confirm(
      "This will permanently delete the exam title. This action cannot be undone. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/exams/exam-title/${examTitleId}/permanent`
      );

      toast.success(
        "Exam title permanently deleted successfully."
      );

      await fetchRecycleBin();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to permanently delete exam title."
      );
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  // =========================================================
  // INSTITUTION FILTER
  // =========================================================

  const handleInstitutionFilter = (e) => {
    setSelectedInstitution(e.target.value);
    setCurrentPage(1);
  };

  // =========================================================
  // PAGE CHANGE
  // =========================================================

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchInstitutions();
  }, []);

  // =========================================================
  // FETCH EXAM TITLES
  // =========================================================

  useEffect(() => {
    fetchExamTitles();
  }, [
    currentPage,
    limit,
    search,
    selectedInstitution,
  ]);

  // =========================================================
  // RECYCLE BIN
  // =========================================================

  useEffect(() => {
    if (showRecycleBin) {
      fetchRecycleBin();
    }
  }, [showRecycleBin]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="exam-title-page">

      {/* ==================== HEADER ==================== */}

      <div className="page-header">

        <div>
          <h2>Exam Titles</h2>

          <p>
            Manage examination titles for institutions.
          </p>
        </div>

        <div>
          <button
            onClick={() =>
              setShowRecycleBin(!showRecycleBin)
            }
          >
            {showRecycleBin
              ? "Exam Titles"
              : "Recycle Bin"}
          </button>

          {!showRecycleBin && (
            <button onClick={openCreateModal}>
              Add Exam Title
            </button>
          )}
        </div>

      </div>

      {/* ==================== RECYCLE BIN ==================== */}

      {showRecycleBin ? (

        <div className="recycle-bin">

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Exam Title</th>
                  <th>Institution</th>
                  <th>Deleted Date</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {recycleLoading ? (

                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      Loading...
                    </td>
                  </tr>

                ) : deletedExamTitles.length === 0 ? (

                  <tr>
                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      Recycle Bin is empty
                    </td>
                  </tr>

                ) : (

                  deletedExamTitles.map(
                    (examTitle, index) => (

                      <tr key={examTitle._id}>

                        <td>{index + 1}</td>

                        <td>
                          {examTitle.title}
                        </td>

                        <td>
                          {examTitle.institutionId
                            ?.institutionName || "-"}
                        </td>

                        <td>
                          {examTitle.deletedAt
                            ? new Date(
                                examTitle.deletedAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>

                          <button
                            onClick={() =>
                              restoreExamTitle(
                                examTitle._id
                              )
                            }
                          >
                            Restore
                          </button>

                          <button
                            onClick={() =>
                              permanentlyDeleteExamTitle(
                                examTitle._id
                              )
                            }
                          >
                            Delete Permanently
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      ) : (

        <>

          {/* ==================== FILTERS ==================== */}

          <div className="filter-row">

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search exam title..."
            />

            <select
              value={selectedInstitution}
              onChange={handleInstitutionFilter}
            >

              <option value="">
                All Institutions
              </option>

              {institutions.map((institution) => (

                <option
                  key={institution._id}
                  value={institution._id}
                >
                  {institution.institutionName}
                </option>

              ))}

            </select>

          </div>

          {/* ==================== TABLE ==================== */}

          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>#</th>
                  <th>Exam Title</th>
                  <th>Institution</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      Loading...
                    </td>

                  </tr>

                ) : examTitles.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      style={{
                        textAlign: "center",
                      }}
                    >
                      No Exam Titles Found
                    </td>

                  </tr>

                ) : (

                  examTitles.map(
                    (examTitle, index) => (

                      <tr key={examTitle._id}>

                        <td>
                          {(currentPage - 1) *
                            limit +
                            index +
                            1}
                        </td>

                        <td>
                          {examTitle.title}
                        </td>

                        <td>
                          {examTitle.institutionId
                            ?.institutionName || "-"}
                        </td>

                        <td>
                          {examTitle.createdAt
                            ? new Date(
                                examTitle.createdAt
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td>

                          <button
                            onClick={() =>
                              openEditModal(
                                examTitle._id
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              deleteExamTitle(
                                examTitle._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* ==================== PAGINATION ==================== */}

          <div className="pagination">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                goToPage(currentPage - 1)
              }
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                goToPage(currentPage + 1)
              }
            >
              Next
            </button>

          </div>

          <div className="total-records">
            Total Records: {totalRecords}
          </div>

        </>

      )}

      {/* ==================== CREATE / EDIT MODAL ==================== */}

      {showModal && (

        <div
          className="exam-modal-overlay"
          onClick={() =>
            setShowModal(false)
          }
        >

          <div
            className="exam-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="exam-modal-header">

              <h2>
                {editingExamTitle
                  ? "Edit Exam Title"
                  : "Create Exam Title"}
              </h2>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                ✕
              </button>

            </div>

            <form
              className="exam-modal-body"
              onSubmit={handleSubmit}
            >

              {/* ==================== INSTITUTION ==================== */}

              <div>

                <label>
                  Institution
                </label>

                <select
                  name="institutionId"
                  value={formData.institutionId}
                  onChange={handleChange}
                  disabled={!!editingExamTitle}
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

              {/* ==================== EXAM TITLE ==================== */}

              <div>

                <label>
                  Exam Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter exam title"
                />

              </div>

              {/* ==================== FOOTER ==================== */}

              <div className="exam-modal-footer">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingExamTitle
                    ? "Update Exam Title"
                    : "Create Exam Title"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default ExamTitlePage;