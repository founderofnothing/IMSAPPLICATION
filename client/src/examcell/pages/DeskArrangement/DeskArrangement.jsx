


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./DeskArrangement.css"

const DeskArrangement = () => {
  const { hallId } = useParams();

  const [hall, setHall] = useState(null);
  const [arrangement, setArrangement] = useState(null);
  const [columns, setColumns] = useState([]);
  const [totalColumns, setTotalColumns] = useState(2);

  const [loading, setLoading] = useState(false);
  const [arrangementLoading, setArrangementLoading] = useState(false);

  // =====================================================
  // GENERATE COLUMN DEFINITIONS
  // =====================================================

  const getColumnDefinitions = (count) => {
    const total = Number(count);
    const definitions = [];

    if (total === 2) {
      return [
        {
          columnKey: "LC1",
          columnName: "Left Column 1",
          side: "left",
          order: 1,
        },
        {
          columnKey: "RC1",
          columnName: "Right Column 1",
          side: "right",
          order: 2,
        },
      ];
    }

    if (total % 2 !== 0) {
      const sideCount = Math.floor(total / 2);

      for (let i = 1; i <= sideCount; i++) {
        definitions.push({
          columnKey: `LC${i}`,
          columnName: `Left Column ${i}`,
          side: "left",
          order: i,
        });
      }

      definitions.push({
        columnKey: "M",
        columnName: "Middle",
        side: "middle",
        order: sideCount + 1,
      });

      for (let i = sideCount; i >= 1; i--) {
        definitions.push({
          columnKey: `RC${i}`,
          columnName: `Right Column ${i}`,
          side: "right",
          order: total - i + 1,
        });
      }

      return definitions;
    }

    const sideCount = total / 2;

    for (let i = 1; i <= sideCount; i++) {
      definitions.push({
        columnKey: `LC${i}`,
        columnName: `Left Column ${i}`,
        side: "left",
        order: i,
      });
    }

    for (let i = sideCount; i >= 1; i--) {
      definitions.push({
        columnKey: `RC${i}`,
        columnName: `Right Column ${i}`,
        side: "right",
        order: total - i + 1,
      });
    }

    return definitions;
  };

  // =====================================================
  // GENERATE COLUMNS
  // =====================================================

  const generateColumns = (columnCount, totalBenches) => {
    const definitions =
      getColumnDefinitions(columnCount);

    const generatedColumns = definitions.map(
      (column) => ({
        ...column,
        benches: Array.from(
          { length: totalBenches },
          (_, index) => ({
            benchNumber: index + 1,
            capacity: 2,
            order: index + 1,
          })
        ),
      })
    );

    setColumns(generatedColumns);
  };

  // =====================================================
  // FETCH EXAM HALL
  // =====================================================

  const fetchExamHall = async () => {
    try {
      setLoading(true);

      const response = await API.get(
        `/examcell/${hallId}`
      );

      setHall(response.data?.data || null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch exam hall."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH DESK ARRANGEMENT
  // =====================================================

  const fetchDeskArrangement = async () => {
    try {
      setArrangementLoading(true);

      const response = await API.get(
        `/examcell/${hallId}/desk-arrangement`
      );

      const data = response.data?.data;

      setArrangement(data || null);
      setTotalColumns(data?.totalColumns || 2);
      setColumns(data?.columns || []);
    } catch (error) {
      if (error.response?.status === 404) {
        setArrangement(null);
        setColumns([]);
        setTotalColumns(2);
        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch desk arrangement."
      );
    } finally {
      setArrangementLoading(false);
    }
  };

  // =====================================================
  // CREATE DESK ARRANGEMENT
  // =====================================================

  const createDeskArrangement = async () => {
    if (!hall) {
      toast.error(
        "Exam hall information is missing."
      );
      return;
    }

    if (columns.length !== totalColumns) {
      toast.error(
        "Column configuration is incomplete."
      );
      return;
    }

    try {
      setArrangementLoading(true);

      const response = await API.post(
        `/examcell/${hallId}/desk-arrangement`,
        {
          totalColumns,
          columns: columns.map((column) => ({
            columnKey: column.columnKey,
            columnName: column.columnName,
            side: column.side,
            order: column.order,
            benches: column.benches.map(
              (bench) => ({
                benchNumber:
                  bench.benchNumber,
                capacity: Number(
                  bench.capacity
                ),
                order: bench.order,
              })
            ),
          })),
        }
      );

      toast.success(
        response.data?.message ||
          "Desk arrangement created successfully."
      );

      await fetchDeskArrangement();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create desk arrangement."
      );
    } finally {
      setArrangementLoading(false);
    }
  };

  // =====================================================
  // UPDATE DESK ARRANGEMENT
  // =====================================================

  const updateDeskArrangement = async () => {
    if (!hall || !arrangement) {
      toast.error(
        "Desk arrangement is not available."
      );
      return;
    }

    try {
      setArrangementLoading(true);

      const response = await API.put(
        `/examcell/${hallId}/desk-arrangement`,
        {
          totalColumns,
          columns: columns.map((column) => ({
            columnKey: column.columnKey,
            columnName: column.columnName,
            side: column.side,
            order: column.order,
            benches: column.benches.map(
              (bench) => ({
                benchNumber:
                  bench.benchNumber,
                capacity: Number(
                  bench.capacity
                ),
                order: bench.order,
              })
            ),
          })),
        }
      );

      toast.success(
        response.data?.message ||
          "Desk arrangement updated successfully."
      );

      await fetchDeskArrangement();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update desk arrangement."
      );
    } finally {
      setArrangementLoading(false);
    }
  };

  // =====================================================
  // DELETE DESK ARRANGEMENT
  // =====================================================

  const deleteDeskArrangement = async () => {
    if (!arrangement) {
      toast.error(
        "No desk arrangement found."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this desk arrangement?"
    );

    if (!confirmed) return;

    try {
      setArrangementLoading(true);

      const response = await API.delete(
        `/examcell/${hallId}/desk-arrangement`
      );

      toast.success(
        response.data?.message ||
          "Desk arrangement deleted successfully."
      );

      setArrangement(null);
      setTotalColumns(2);

      if (hall) {
        generateColumns(
          2,
          hall.totalBenches
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete desk arrangement."
      );
    } finally {
      setArrangementLoading(false);
    }
  };

  // =====================================================
  // CHANGE NUMBER OF COLUMNS
  // =====================================================

  const handleColumnCountChange = (
    value
  ) => {
    const count = Number(value);

    if (count < 2) return;

    setTotalColumns(count);

    if (hall) {
      generateColumns(
        count,
        hall.totalBenches
      );
    }
  };

  // =====================================================
  // UPDATE BENCH CAPACITY
  // =====================================================

  const handleCapacityChange = (
    columnIndex,
    benchIndex,
    value
  ) => {
    const capacity = Number(value);

    setColumns((prev) =>
      prev.map((column, cIndex) => {
        if (cIndex !== columnIndex) {
          return column;
        }

        return {
          ...column,
          benches: column.benches.map(
            (bench, bIndex) =>
              bIndex === benchIndex
                ? {
                    ...bench,
                    capacity,
                  }
                : bench
          ),
        };
      })
    );
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    if (!hallId) return;

    fetchExamHall();
    fetchDeskArrangement();
  }, [hallId]);

  // =====================================================
  // GENERATE NEW ARRANGEMENT
  // =====================================================

  useEffect(() => {
    if (
      hall &&
      !arrangement &&
      !arrangementLoading &&
      columns.length === 0
    ) {
      generateColumns(
        totalColumns,
        hall.totalBenches
      );
    }
  }, [
    hall,
    arrangement,
    arrangementLoading,
  ]);

  // =====================================================
  // CALCULATE TOTAL CAPACITY
  // =====================================================

  const totalStudentCapacity =
    columns.reduce(
      (columnTotal, column) =>
        columnTotal +
        column.benches.reduce(
          (benchTotal, bench) =>
            benchTotal +
            Number(
              bench.capacity || 0
            ),
          0
        ),
      0
    );

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="desk_arrangement_page">
        <p>Loading exam hall...</p>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="desk_arrangement_page">

      {/* ==================== HEADER ==================== */}

      <div className="desk_arrangement_header">
        <div>
          <h1>Desk Arrangement</h1>

          {hall && (
            <p>
              {hall.hallNumber} -{" "}
              {hall.hallName}
            </p>
          )}
        </div>
      </div>

      {/* ==================== HALL INFORMATION ==================== */}

      {hall && (
        <div className="desk_arrangement_hall_info">
          <div>
            <span>Hall Number</span>
            <strong>
              {hall.hallNumber}
            </strong>
          </div>

          <div>
            <span>Hall Name</span>
            <strong>
              {hall.hallName}
            </strong>
          </div>

          <div>
            <span>Total Benches</span>
            <strong>
              {hall.totalBenches}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              {hall.status}
            </strong>
          </div>
        </div>
      )}

      {/* ==================== COLUMN CONFIGURATION ==================== */}

      {!arrangement && (
        <div className="desk_arrangement_column_config">
          <div>
            <span>
              Number of Columns
            </span>

            <p>
              Choose how many bench columns
              this hall will use.
            </p>
          </div>

          <div className="desk_arrangement_column_controls">
            <button
              type="button"
              onClick={() =>
                handleColumnCountChange(
                  totalColumns - 1
                )
              }
              disabled={
                totalColumns <= 2 ||
                arrangementLoading
              }
            >
              −
            </button>

            <strong>
              {totalColumns}
            </strong>

            <button
              type="button"
              onClick={() =>
                handleColumnCountChange(
                  totalColumns + 1
                )
              }
              disabled={arrangementLoading}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* ==================== ARRANGEMENT WORKSPACE ==================== */}

      {arrangementLoading ? (
        <div className="desk_arrangement_loading">
          Loading desk arrangement...
        </div>
      ) : (
        <div className="desk_arrangement_workspace">

          {columns.map(
            (column, columnIndex) => (
              <div
                key={column.columnKey}
                className={`desk_arrangement_column desk_arrangement_column_${column.side}`}
              >

                {/* COLUMN HEADER */}

                <div className="desk_arrangement_column_header">
                  <div>
                    <strong>
                      {column.columnKey}
                    </strong>

                    <span>
                      {column.columnName}
                    </span>
                  </div>

                  <small>
                    {column.benches.length} Benches
                  </small>
                </div>

                {/* BENCHES */}

                <div className="desk_arrangement_bench_list">

                  {column.benches.map(
                    (bench, benchIndex) => (
                      <div
                        key={`${column.columnKey}-${bench.benchNumber}`}
                        className="desk_arrangement_item"
                      >

                        <div>
                          <strong>
                            Bench{" "}
                            {
                              bench.benchNumber
                            }
                          </strong>

                          <span>
                            {column.columnKey}
                          </span>
                        </div>

                        <select
                          value={
                            bench.capacity
                          }
                          onChange={(e) =>
                            handleCapacityChange(
                              columnIndex,
                              benchIndex,
                              e.target.value
                            )
                          }
                        >
                          <option value="1">
                            1 Student
                          </option>

                          <option value="2">
                            2 Students
                          </option>

                          <option value="3">
                            3 Students
                          </option>
                        </select>

                      </div>
                    )
                  )}

                </div>
              </div>
            )
          )}

        </div>
      )}

      {/* ==================== SUMMARY ==================== */}

      {!arrangementLoading && (
        <div className="desk_arrangement_summary">

          <div>
            <span>
              Total Columns
            </span>

            <strong>
              {columns.length}
            </strong>
          </div>

          <div>
            <span>
              Benches / Column
            </span>

            <strong>
              {hall?.totalBenches || 0}
            </strong>
          </div>

          <div>
            <span>
              Total Benches
            </span>

            <strong>
              {columns.length *
                (hall?.totalBenches || 0)}
            </strong>
          </div>

          <div>
            <span>
              Total Student Capacity
            </span>

            <strong>
              {totalStudentCapacity}
            </strong>
          </div>

        </div>
      )}

      {/* ==================== ACTIONS ==================== */}

      {!arrangementLoading &&
        columns.length >= 2 && (
          <div className="desk_arrangement_actions">

            <button
              type="button"
              onClick={
                arrangement
                  ? updateDeskArrangement
                  : createDeskArrangement
              }
              disabled={
                arrangementLoading
              }
            >
              {arrangementLoading
                ? arrangement
                  ? "Updating..."
                  : "Saving..."
                : arrangement
                ? "Update Arrangement"
                : "Save Arrangement"}
            </button>

            {arrangement && (
              <button
                type="button"
                onClick={
                  deleteDeskArrangement
                }
                disabled={
                  arrangementLoading
                }
              >
                Delete Arrangement
              </button>
            )}

          </div>
        )}

    </div>
  );
};

export default DeskArrangement;