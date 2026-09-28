import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./examhallpage.css"

const ExamHallPage = () => {
  // ==================== DATA ====================

  const [examHalls, setExamHalls] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================== PAGINATION ====================

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ==================== FILTERS ====================

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // ==================== MODAL ====================

  const [showModal, setShowModal] = useState(false);
  const [editingHallId, setEditingHallId] = useState(null);

  // ==================== FORM ====================

  const [formData, setFormData] = useState({
    hallNumber: "",
    hallName: "",
    totalBenches: "",
    status: "active",
  });

  // ==================== FETCH EXAM HALLS ====================

  const fetchExamHalls = async (currentPage = page) => {
    try {
      setLoading(true);

      const response = await API.get("/examcell", {
        params: {
          page: currentPage,
          limit,
          status,
          search: search.trim(),
        },
      });

      setExamHalls(response.data?.data || []);

      setPagination(
        response.data?.pagination || {
          currentPage,
          itemsPerPage: limit,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      setExamHalls([]);

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch exam halls."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== CREATE EXAM HALL ====================


  // ==================== DELETE EXAM HALL ====================

const deleteExamHall = async (hallId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this exam hall?"
  );

  if (!confirmed) return;

  try {
    setLoading(true);

    const response = await API.delete(
      `/examcell/${hallId}`
    );

    toast.success(
      response.data?.message ||
      "Exam hall deleted successfully."
    );

    await fetchExamHalls(page);
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to delete exam hall."
    );
  } finally {
    setLoading(false);
  }
};


  const createExamHall = async () => {
    try {
      setLoading(true);

      const response = await API.post("/examcell", {
        hallNumber: formData.hallNumber.trim(),
        hallName: formData.hallName.trim(),
        totalBenches: Number(formData.totalBenches),
        status: formData.status,
      });

      toast.success(
        response.data?.message ||
        "Exam hall created successfully."
      );

      closeModal();
      setPage(1);
      await fetchExamHalls(1);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to create exam hall."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==================== UPDATE EXAM HALL ====================

const updateExamHall = async () => {
  try {
    setLoading(true);

    const response = await API.put(
      `/examcell/${editingHallId}`,
      {
        hallNumber: formData.hallNumber.trim(),
        hallName: formData.hallName.trim(),
        totalBenches: Number(formData.totalBenches),
        status: formData.status,
      }
    );

    toast.success(
      response.data?.message ||
      "Exam hall updated successfully."
    );

    closeModal();
    await fetchExamHalls(page);
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to update exam hall."
    );
  } finally {
    setLoading(false);
  }
};
  // ==================== FORM SUBMIT ====================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hallNumber.trim()) {
      toast.error("Hall number is required.");
      return;
    }

    if (!formData.hallName.trim()) {
      toast.error("Hall name is required.");
      return;
    }

    if (
      !formData.totalBenches ||
      Number(formData.totalBenches) < 1
    ) {
      toast.error("Total benches must be at least 1.");
      return;
    }

if (editingHallId) {
  await updateExamHall();
  return;
}

await createExamHall();
  };

  // ==================== SEARCH ====================

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ==================== STATUS ====================

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  // ==================== FORM CHANGE ====================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================== OPEN CREATE ====================

  const openCreateModal = () => {
    setEditingHallId(null);

    setFormData({
      hallNumber: "",
      hallName: "",
      totalBenches: "",
      status: "active",
    });

    setShowModal(true);
  };

  // ==================== OPEN EDIT ====================

  const openEditModal = (hall) => {
    setEditingHallId(hall._id);

    setFormData({
      hallNumber: hall.hallNumber || "",
      hallName: hall.hallName || "",
      totalBenches: hall.totalBenches || "",
      status: hall.status || "active",
    });

    setShowModal(true);
  };

  // ==================== CLOSE MODAL ====================

  const closeModal = () => {
    setShowModal(false);
    setEditingHallId(null);
  };

  // ==================== DELETE ====================

const handleDelete = async (hallId) => {
  await deleteExamHall(hallId);
};

  // ==================== PAGINATION ====================

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  // ==================== INITIAL FETCH ====================

  useEffect(() => {
    fetchExamHalls(page);
  }, [page, status]);

  // ==================== SEARCH FETCH ====================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExamHalls(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ==================== RENDER ====================

  return (
    <div className="exam_hall_page">
      {/* ==================== HEADER ==================== */}

      <div className="exam_hall_header">
        <div className="exam_hall_header_content">
          <h1>Exam Halls</h1>

          <p>
            Manage examination halls and their seating capacity.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="exam_hall_create_btn"
        >
          + Create Hall
        </button>
      </div>

      {/* ==================== FILTERS ==================== */}

      <div className="exam_hall_filters">
        <div className="exam_hall_search">
          <input
            type="text"
            placeholder="Search hall number or hall name..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="exam_hall_status_filter">
          <select
            value={status}
            onChange={handleStatusChange}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* ==================== TABLE ==================== */}

      <div className="exam_hall_table_wrapper">
        <table className="exam_hall_table">
          <thead>
            <tr>
              <th>#</th>
              <th>Hall Number</th>
              <th>Hall Name</th>
              <th>Total Benches</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="exam_hall_loading"
                >
                  Loading exam halls...
                </td>
              </tr>
            ) : examHalls.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="exam_hall_empty"
                >
                  No exam halls found.
                </td>
              </tr>
            ) : (
              examHalls.map((hall, index) => (
                <tr key={hall._id}>
                  <td>
                    {(page - 1) * limit + index + 1}
                  </td>

                  <td>{hall.hallNumber}</td>

                  <td>{hall.hallName}</td>

                  <td>{hall.totalBenches}</td>

                  <td>
                    <span
                      className={`exam_hall_status exam_hall_status_${hall.status}`}
                    >
                      {hall.status}
                    </span>
                  </td>

                  <td>
                    <div className="exam_hall_actions">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(hall)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(hall._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ==================== PAGINATION ==================== */}

      <div className="exam_hall_pagination">
        <div className="exam_hall_pagination_info">
          Showing {examHalls.length} of{" "}
          {pagination.totalItems} halls
        </div>

        <div className="exam_hall_pagination_controls">
          <button
            type="button"
            disabled={!pagination.hasPreviousPage}
            onClick={handlePreviousPage}
          >
            Previous
          </button>

          <span>
            Page {pagination.currentPage} of{" "}
            {pagination.totalPages || 1}
          </span>

          <button
            type="button"
            disabled={!pagination.hasNextPage}
            onClick={handleNextPage}
          >
            Next
          </button>
        </div>
      </div>

      {/* ==================== CREATE / EDIT MODAL ==================== */}

      {showModal && (
        <div className="exam_hall_modal_overlay">
          <div className="exam_hall_modal">
            <div className="exam_hall_modal_header">
              <div>
                <h2>
                  {editingHallId
                    ? "Update Exam Hall"
                    : "Create Exam Hall"}
                </h2>

                <p>
                  {editingHallId
                    ? "Update the exam hall details."
                    : "Add a new examination hall."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form
              className="exam_hall_form"
              onSubmit={handleSubmit}
            >
              <div className="exam_hall_form_group">
                <label>Hall Number</label>

                <input
                  type="text"
                  name="hallNumber"
                  value={formData.hallNumber}
                  onChange={handleFormChange}
                  placeholder="e.g. A-1012"
                  required
                />
              </div>

              <div className="exam_hall_form_group">
                <label>Hall Name</label>

                <input
                  type="text"
                  name="hallName"
                  value={formData.hallName}
                  onChange={handleFormChange}
                  placeholder="e.g. Main Block Hall"
                  required
                />
              </div>

              <div className="exam_hall_form_group">
                <label>Total Benches</label>

                <input
                  type="number"
                  name="totalBenches"
                  value={formData.totalBenches}
                  onChange={handleFormChange}
                  min="1"
                  placeholder="e.g. 10"
                  required
                />
              </div>

              <div className="exam_hall_form_group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="exam_hall_form_actions">
                <button
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingHallId
                    ? "Update Hall"
                    : "Create Hall"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamHallPage;