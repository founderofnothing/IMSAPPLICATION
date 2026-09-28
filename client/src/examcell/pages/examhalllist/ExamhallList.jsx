import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./examhalllist.css"

const ExamhallList = () => {
  const navigate = useNavigate();

  const [examHalls, setExamHalls] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================== FETCH EXAM HALLS ====================

  const fetchExamHalls = async () => {
    try {
      setLoading(true);

      const response = await API.get("/examcell", {
        params: {
          page: 1,
          limit: 100,
          status: "active",
          search: "",
        },
      });

      setExamHalls(response.data?.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch exam halls."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== NAVIGATE TO DESK ARRANGEMENT ====================

  const handleDeskArrangement = (hallId) => {
    navigate(
      `/examcell/${hallId}/desk-arrangement`
    );
  };

  // ==================== INITIAL FETCH ====================

  useEffect(() => {
    fetchExamHalls();
  }, []);

  return (
    <div className="exam_hall_list">
      {loading ? (
        <p>Loading exam halls...</p>
      ) : (
        examHalls.map((hall) => (
          <div key={hall._id}>
            <h3>{hall.hallNumber}</h3>
            <p>{hall.hallName}</p>

            <button
              type="button"
              onClick={() =>
                handleDeskArrangement(hall._id)
              }
            >
              Desk Arrangement
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ExamhallList;