import React, {
  useEffect,
  useState,
} from "react";

import API from "../../../api/axios";
import IDCardStudentPreview from "../IDCardStudentPreview/IDCardStudentPreview";
const IDCardStudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [idCardData, setIdCardData] =
    useState(null);

  const [loadingIdCard, setLoadingIdCard] =
    useState(false);

  const fetchStudents = async (
    currentPage = page,
    currentSearch = search
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(
        "/students/hod/department",
        {
          params: {
            page: currentPage,
            limit: 10,
            search: currentSearch.trim(),
          },
        }
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
          "Failed to fetch students."
        );
      }

      setStudents(result.data || []);

      setPage(result.currentPage || 1);

      setTotalPages(
        result.totalPages || 1
      );

      setTotalRecords(
        result.totalRecords || 0
      );
    } catch (error) {
      console.error(
        "ID CARD STUDENT LIST ERROR:",
        error
      );

      setStudents([]);

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch students."
      );
    } finally {
      setLoading(false);
    }
  };

const handleViewIDCard = async (student) => {
  try {
    setSelectedStudent(student);
    setLoadingIdCard(true);
    setIdCardData(null);

    const response = await API.get(
      `/id-card/assignments/student/${student._id}/preview`
    );

    const result = response.data;

    if (!result?.success) {
      throw new Error(
        result?.message ||
        "Failed to fetch ID card data."
      );
    }

    console.log(
      "STUDENT ID CARD DATA:",
      result.data
    );

    setIdCardData(result.data);
  } catch (error) {
    console.error(
      "STUDENT ID CARD PREVIEW ERROR:",
      error
    );

    setIdCardData(null);

    setError(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load ID card."
    );
  } finally {
    setLoadingIdCard(false);
  }
};

  useEffect(() => {
    fetchStudents(1, "");
  }, []);

  const handleSearch = () => {
    setPage(1);

    fetchStudents(1, search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);

    fetchStudents(1, "");
  };

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      loading
    ) {
      return;
    }

    fetchStudents(
      nextPage,
      search
    );
  };

  return (
    <div className="id_card_student_list">
      <div className="id_card_student_list_header">
        <div>
          <h2>Student ID Cards</h2>

          <p>
            Review student details and
            generate ID cards.
          </p>
        </div>

        <div>
          <strong>{totalRecords}</strong>

          <span>Students</span>
        </div>
      </div>

      <div className="id_card_student_list_search">
        <input
          type="text"
          value={search}
          placeholder="Search student name, register number or email..."
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </button>

        {search && (
          <button
            type="button"
            onClick={handleClearSearch}
            disabled={loading}
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div className="id_card_student_list_error">
          {error}
        </div>
      )}

      <div className="id_card_student_table_wrapper">
        <table className="id_card_student_table">
          <thead>
            <tr>
              <th>#</th>
              <th>Student</th>
              <th>Register Number</th>
              <th>Programme</th>
              <th>Batch</th>
              <th>Class</th>
              <th>Gender</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">
                  Loading students...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="8">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map(
                (student, index) => (
                  <tr
                    key={student._id}
                  >
                    <td>
                      {(page - 1) * 10 +
                        index +
                        1}
                    </td>

                    <td>
                      <div className="id_card_student_profile">
                        <div className="id_card_student_avatar">
                          {student.studentName
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {
                              student.studentName
                            }
                          </strong>

                          <span>
                            {
                              student.studentEmail
                            }
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {
                        student.registerNumber
                      }
                    </td>

                    <td>
                      {
                        student.programmeId
                          ?.programmeName ||
                        "-"
                      }
                    </td>

                    <td>
                      {
                        student.batchId
                          ?.batchName ||
                        "-"
                      }
                    </td>

                    <td>
                      {student.classId
                        ? `Year ${
                            student.classId
                              .year ?? "-"
                          } ${
                            student.classId
                              .section
                              ? `- ${student.classId.section}`
                              : ""
                          }`
                        : "-"}
                    </td>

                    <td>
                      {student.gender || "-"}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleViewIDCard(
                            student
                          )
                        }
                      >
                        View ID Card
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="id_card_student_pagination">
          <button
            type="button"
            disabled={
              page <= 1 || loading
            }
            onClick={() =>
              handlePageChange(
                page - 1
              )
            }
          >
            Previous
          </button>

          <span>
            Page{" "}
            <strong>{page}</strong>{" "}
            of{" "}
            <strong>
              {totalPages}
            </strong>
          </span>

          <button
            type="button"
            disabled={
              page >= totalPages ||
              loading
            }
            onClick={() =>
              handlePageChange(
                page + 1
              )
            }
          >
            Next
          </button>
        </div>
      )}

      {selectedStudent && (
  <IDCardStudentPreview
    student={selectedStudent}
    idCardData={idCardData}
    loading={loadingIdCard}
    onClose={() => {
      setSelectedStudent(null);
      setIdCardData(null);
    }}
  />
)}
    </div>
  );
};

export default IDCardStudentList;