import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import "./HallList.css"
import API from "../../../../api/axios";
import { toast } from "react-toastify";

const HallList = () => {
  const navigate = useNavigate();

  const { examSessionId } = useParams();

  console.log(
    "HallList examSessionId:",
    examSessionId
  );
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

  // ==================== NAVIGATE TO HALL ALLOCATION ====================

const handleHallAllocation = (hallId) => {
  if (!examSessionId) {
    toast.error("Exam session is missing.");
    return;
  }

  if (!hallId) {
    toast.error("Exam hall is missing.");
    return;
  }

  navigate(
    `/examcell/${examSessionId}/hall/${hallId}/allocation`
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
                handleHallAllocation(hall._id)
              }
            >
              Student Allocation
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default HallList;