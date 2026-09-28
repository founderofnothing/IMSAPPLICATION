import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./TimetablePage.css";

const DEFAULT_PERIODS = [
  { periodNumber: 1, periodType: "Teaching" },
  { periodNumber: 2, periodType: "Teaching" },
  { periodNumber: 3, periodType: "Teaching" },
  { periodNumber: 4, periodType: "Teaching" },
  { periodNumber: 5, periodType: "Teaching" },
  { periodNumber: 6, periodType: "Teaching" },
];

const createDays = (count = 5) =>
  Array.from({ length: count }, (_, index) => ({
    dayOrder: index + 1,
    periods: [],
  }));

const TimetablePage = () => {
  const { classId } = useParams();
  const location = useLocation();
  const classData = location.state?.classData;

  // =========================================================
  // DATA
  // =========================================================

  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [timetable, setTimetable] = useState(null);

  const [subjectLoading, setSubjectLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [timetableLoading, setTimetableLoading] = useState(true);

  // =========================================================
  // TIMETABLE STATE
  // =========================================================

  const [dayOrders, setDayOrders] = useState(5);

  const [periodConfiguration, setPeriodConfiguration] =
    useState(DEFAULT_PERIODS);

  const [timetableData, setTimetableData] =
    useState(createDays(5));

  const [hasTimetable, setHasTimetable] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showTimetableEditor, setShowTimetableEditor] =
    useState(false);

  // =========================================================
  // SUBJECT ASSIGNMENT
  // =========================================================

  const [showAssignPopup, setShowAssignPopup] =
    useState(false);

  const [selectedCell, setSelectedCell] = useState(null);

  const [assignForm, setAssignForm] = useState({
    subjectId: "",
    facultyId: "",
    room: "",
  });

  // =========================================================
  // PERIOD POPUP
  // =========================================================

  const [showPeriodPopup, setShowPeriodPopup] =
    useState(false);

  const [selectedPeriod, setSelectedPeriod] =
    useState(null);

  const [periodForm, setPeriodForm] = useState({
    periodNumber: null,
    periodType: "Teaching",
  });

  // =========================================================
  // CREATE POPUP
  // =========================================================

  const [showTimetablePopup, setShowTimetablePopup] =
    useState(false);

  // =========================================================
  // DAY NAME
  // =========================================================

  const getDayName = (dayOrder) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return days[dayOrder - 1];
  };

  // =========================================================
  // FETCH SUBJECTS
  // =========================================================

  const fetchSubjects = async () => {
    try {
      setSubjectLoading(true);

      const response = await API.get(
        `/subjects/${classId}/current-subjects`
      );

      const data = response.data.data;

      setCurrentSemester(data.currentSemester);
      setSubjects(data.subjects || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch subjects."
      );
    } finally {
      setSubjectLoading(false);
    }
  };

  // =========================================================
  // FETCH FACULTY
  // =========================================================

  const fetchFaculty = async () => {
    try {
      setFacultyLoading(true);

      const departmentId =
        classData?.department?._id ||
        classData?.department;

      const institutionId =
        classData?.institution?._id ||
        classData?.institution;

      const params = new URLSearchParams();

      params.append("page", "1");
      params.append("limit", "100");
      params.append("search", "");

      if (institutionId) {
        params.append("institution", institutionId);
      }

      if (departmentId) {
        params.append("department", departmentId);
      }

      const response = await API.get(
        `/users/assignable-staff?${params.toString()}`
      );

      const data = response.data;

      console.log(
  "FACULTY API RESPONSE:",
  response.data
);

console.log(
  "FACULTY LIST:",
  response.data.data
);

      setFaculty(
        data.data ||
          data.users ||
          []
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch faculty."
      );
    } finally {
      setFacultyLoading(false);
    }
  };

  // =========================================================
  // RESET BUILDER
  // =========================================================

  const resetBuilder = () => {
    setDayOrders(5);
    setPeriodConfiguration(
      DEFAULT_PERIODS.map((period) => ({
        ...period,
      }))
    );
    setTimetableData(createDays(5));
    setSelectedCell(null);
    setSelectedPeriod(null);
    setAssignForm({
      subjectId: "",
      facultyId: "",
      room: "",
    });
    setShowAssignPopup(false);
    setShowPeriodPopup(false);
  };

  // =========================================================
  // FETCH TIMETABLE
  // =========================================================

  const fetchTimetable = async () => {
    try {
      setTimetableLoading(true);

      const response = await API.get(
        `/timetable/class/${classId}`
      );

      const data = response.data.data;

      setTimetable(data);

      setPeriodConfiguration(
        data.periodConfiguration?.length
          ? data.periodConfiguration
          : DEFAULT_PERIODS
      );

      const formattedDays = (
        data.timetable || []
      ).map((day) => ({
        ...day,
        periods: (day.periods || []).map(
          (period) => ({
            ...period,
            subjectId:
              period.subjectId?._id ||
              period.subjectId ||
              "",
            facultyId:
              period.facultyId?._id ||
              period.facultyId ||
              "",
          })
        ),
      }));

      setTimetableData(formattedDays);

      setDayOrders(
        formattedDays.length || 1
      );

      setHasTimetable(true);
      setIsEditMode(true);

      // Important:
      // Do NOT automatically open the editor.
      setShowTimetableEditor(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setTimetable(null);
        setHasTimetable(false);
        setIsEditMode(false);
        setShowTimetableEditor(false);

        resetBuilder();

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch timetable."
      );
    } finally {
      setTimetableLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchSubjects();
    fetchFaculty();
    fetchTimetable();
  }, [classId]);

  // =========================================================
  // OPEN CREATE MODE
  // =========================================================

  const openCreateTimetable = () => {
    resetBuilder();

    setTimetable(null);
    setHasTimetable(false);
    setIsEditMode(false);

    setShowTimetablePopup(false);

    // Open builder.
    setShowTimetableEditor(true);
  };

  // =========================================================
  // OPEN EDIT MODE
  // =========================================================

  const openEditTimetable = () => {
    if (!hasTimetable) {
      return;
    }

    setIsEditMode(true);
    setShowTimetableEditor(true);
  };

  // =========================================================
  // CLOSE EDITOR
  // =========================================================

  const closeEditor = () => {
    setShowTimetableEditor(false);

    if (!hasTimetable) {
      resetBuilder();
    }
  };

  // =========================================================
  // ADD DAY
  // =========================================================

  const addDay = () => {
    if (dayOrders >= 6) {
      toast.warning(
        "Maximum 6 day orders are allowed."
      );
      return;
    }

    const newDay = dayOrders + 1;

    setDayOrders(newDay);

    setTimetableData((previous) => [
      ...previous,
      {
        dayOrder: newDay,
        periods: [],
      },
    ]);
  };

  // =========================================================
  // REMOVE DAY
  // =========================================================

  const removeDay = () => {
    if (dayOrders <= 1) {
      toast.warning(
        "At least one day order is required."
      );
      return;
    }

    setDayOrders((previous) =>
      previous - 1
    );

    setTimetableData((previous) =>
      previous.slice(0, -1)
    );
  };

  // =========================================================
  // ADD HOUR
  // =========================================================

  const addPeriod = () => {
    if (periodConfiguration.length >= 12) {
      toast.warning(
        "Maximum 12 hours are allowed."
      );
      return;
    }

    const newPeriodNumber =
      periodConfiguration.length + 1;

    setPeriodConfiguration((previous) => [
      ...previous,
      {
        periodNumber: newPeriodNumber,
        periodType: "Teaching",
      },
    ]);
  };

  // =========================================================
  // REMOVE HOUR
  // =========================================================

  const removePeriod = () => {
    if (periodConfiguration.length <= 1) {
      toast.warning(
        "At least one hour is required."
      );
      return;
    }

    const removedPeriod =
      periodConfiguration[
        periodConfiguration.length - 1
      ];

    setPeriodConfiguration((previous) =>
      previous.slice(0, -1)
    );

    setTimetableData((previous) =>
      previous.map((day) => ({
        ...day,
        periods: day.periods.filter(
          (period) =>
            period.periodNumber !==
            removedPeriod.periodNumber
        ),
      }))
    );
  };

  // =========================================================
  // GET PERIOD
  // =========================================================

  const getPeriod = (periodNumber) => {
    return periodConfiguration.find(
      (period) =>
        period.periodNumber ===
        periodNumber
    );
  };

  // =========================================================
  // GET CELL
  // =========================================================

  const getCell = (
    dayOrder,
    periodNumber
  ) => {
    const day = timetableData.find(
      (item) =>
        item.dayOrder === dayOrder
    );

    if (!day) {
      return null;
    }

    return (
      day.periods.find(
        (period) =>
          period.periodNumber ===
          periodNumber
      ) || null
    );
  };

  // =========================================================
  // UPDATE CELL
  // =========================================================

  const updateCell = (
    dayOrder,
    periodNumber,
    values
  ) => {
    setTimetableData((previous) =>
      previous.map((day) => {
        if (
          day.dayOrder !== dayOrder
        ) {
          return day;
        }

        const periods = [
          ...day.periods,
        ];

        const existingIndex =
          periods.findIndex(
            (period) =>
              period.periodNumber ===
              periodNumber
          );

        const existingPeriod =
          existingIndex >= 0
            ? periods[existingIndex]
            : {
                periodNumber,
              };

        const updatedPeriod = {
          ...existingPeriod,
          ...values,
          periodNumber,
        };

        if (existingIndex >= 0) {
          periods[existingIndex] =
            updatedPeriod;
        } else {
          periods.push(
            updatedPeriod
          );
        }

        return {
          ...day,
          periods,
        };
      })
    );
  };

  // =========================================================
  // UPDATE PERIOD TYPE
  // =========================================================

  const updatePeriodType = (
    periodNumber,
    periodType
  ) => {
    setPeriodConfiguration(
      (previous) =>
        previous.map((period) =>
          period.periodNumber ===
          periodNumber
            ? {
                ...period,
                periodType,
              }
            : period
        )
    );

    if (
      periodType === "Break" ||
      periodType === "Lunch"
    ) {
      setTimetableData((previous) =>
        previous.map((day) => ({
          ...day,
          periods:
            day.periods.filter(
              (period) =>
                period.periodNumber !==
                periodNumber
            ),
        }))
      );
    }
  };

  // =========================================================
  // OPEN ASSIGN POPUP
  // =========================================================

  const openAssignPopup = (
    dayOrder,
    periodNumber
  ) => {
    const period =
      getPeriod(periodNumber);

    if (
      !period ||
      period.periodType !==
        "Teaching"
    ) {
      return;
    }

    const cell = getCell(
      dayOrder,
      periodNumber
    );

    setSelectedCell({
      dayOrder,
      periodNumber,
    });

    setAssignForm({
      subjectId:
        cell?.subjectId || "",
      facultyId:
        cell?.facultyId || "",
      room:
        cell?.room || "",
    });

    setShowAssignPopup(true);
  };

  // =========================================================
  // SAVE CELL ASSIGNMENT
  // =========================================================

  const saveAssignment = () => {
    if (!selectedCell) {
      return;
    }

    if (!assignForm.subjectId) {
      toast.warning(
        "Please select a subject."
      );
      return;
    }

    if (!assignForm.facultyId) {
      toast.warning(
        "Please select a faculty."
      );
      return;
    }

    updateCell(
      selectedCell.dayOrder,
      selectedCell.periodNumber,
      {
        subjectId:
          assignForm.subjectId,
        facultyId:
          assignForm.facultyId,
        room:
          assignForm.room.trim(),
      }
    );

    setShowAssignPopup(false);
  };

  // =========================================================
  // OPEN PERIOD POPUP
  // =========================================================

  const handleEditPeriod = (period) => {
    setSelectedPeriod(period);

    setPeriodForm({
      periodNumber:
        period.periodNumber,
      periodType:
        period.periodType,
    });

    setShowPeriodPopup(true);
  };

  // =========================================================
  // SAVE PERIOD
  // =========================================================

  const handleSavePeriod = () => {
    updatePeriodType(
      periodForm.periodNumber,
      periodForm.periodType
    );

    setShowPeriodPopup(false);
  };

  // =========================================================
  // VALIDATE TIMETABLE
  // =========================================================

  const validateTimetable = () => {
    if (!showTimetableEditor) {
      return false;
    }

    if (
      !periodConfiguration.length
    ) {
      toast.warning(
        "Please add at least one hour."
      );
      return false;
    }

    if (!timetableData.length) {
      toast.warning(
        "Please add at least one day."
      );
      return false;
    }

    for (const day of timetableData) {
      for (
        const period of
          periodConfiguration
      ) {
        if (
          period.periodType !==
          "Teaching"
        ) {
          continue;
        }

        const cell = getCell(
          day.dayOrder,
          period.periodNumber
        );

        if (!cell?.subjectId) {
          toast.warning(
            `Please assign a subject for Day ${day.dayOrder} - Hour ${period.periodNumber}.`
          );
          return false;
        }

        if (!cell?.facultyId) {
          toast.warning(
            `Please assign a faculty for Day ${day.dayOrder} - Hour ${period.periodNumber}.`
          );
          return false;
        }
      }
    }

    return true;
  };

  // =========================================================
  // SAVE EXISTING TIMETABLE
  // =========================================================

  const updateTimetable = async () => {
    if (!validateTimetable()) {
      return;
    }

    if (!timetable?._id) {
      toast.error(
        "Timetable not found."
      );
      return;
    }

    const payload = {
      classId,
      periodConfiguration,
      timetable: timetableData,
    };

    try {
      await API.put(
        `/timetable/${timetable._id}`,
        payload
      );

      toast.success(
        "Timetable updated successfully."
      );

      await fetchTimetable();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update timetable."
      );
    }
  };

  // =========================================================
  // CREATE TIMETABLE
  // =========================================================

  const createTimetable = async () => {
    if (!validateTimetable()) {
      return;
    }

    const payload = {
      classId,
      periodConfiguration,
      timetable: timetableData,
    };

    try {
      await API.post(
        "/timetable",
        payload
      );

      toast.success(
        "Timetable created successfully."
      );

      await fetchTimetable();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to create timetable."
      );
    }
  };

  // =========================================================
  // SAVE TIMETABLE
  // =========================================================

  const saveTimetable = () => {
    if (isEditMode) {
      updateTimetable();
      return;
    }

    createTimetable();
  };

  // =========================================================
  // DELETE TIMETABLE
  // =========================================================

  const deleteTimetable = async () => {
    if (!timetable?._id) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this timetable?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/timetable/${timetable._id}`
      );

      toast.success(
        "Timetable deleted successfully."
      );

      setTimetable(null);
      setHasTimetable(false);
      setIsEditMode(false);
      setShowTimetableEditor(false);

      resetBuilder();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete timetable."
      );
    }
  };

  // =========================================================
  // SUBJECT LOOKUP
  // =========================================================

  const getSubject = (subjectId) => {
    return subjects.find(
      (subject) =>
        subject._id === subjectId
    );
  };

  // =========================================================
  // FACULTY LOOKUP
  // =========================================================

  const getFaculty = (facultyId) => {
    return faculty.find(
      (item) =>
        item._id === facultyId
    );
  };

  // =========================================================
  // HEADER
  // =========================================================

  const renderHeader = () => {
    return (
      <div className="hod_timetable_header">
        <div className="hod_timetable_header_left">
          <h2>Timetable Management</h2>

          <p>
            {classData?.programme?.programmeName}
            {" • "}
            Batch {classData?.batchId?.batchName}
            {" • "}
            Section {classData?.section || "—"}
            {" • "}
            Semester {currentSemester || "—"}
          </p>
        </div>

        <div className="hod_timetable_header_right">
          {hasTimetable ? (
            <>
              {!showTimetableEditor && (
                <button
                  className="hod_timetable_save_btn"
                  onClick={openEditTimetable}
                >
                  Open / Edit Timetable
                </button>
              )}

              {showTimetableEditor && (
                <button
                  className="hod_timetable_save_btn"
                  onClick={saveTimetable}
                >
                  Update Timetable
                </button>
              )}

              <button
                className="hod_timetable_delete_btn"
                onClick={deleteTimetable}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              className="hod_timetable_save_btn"
              onClick={openCreateTimetable}
            >
              Create Timetable
            </button>
          )}
        </div>
      </div>
    );
  };

  // =========================================================
  // BUILDER CONTROLS
  // =========================================================

  const renderBuilderControls = () => {
    return (
      <div className="hod_timetable_builder_controls">
        <div className="hod_builder_control_group">
          <span>Day Orders</span>

          <strong>
            {dayOrders} / 6
          </strong>

          <button onClick={addDay}>
            + Add Day
          </button>

          <button onClick={removeDay}>
            Remove Day
          </button>
        </div>

        <div className="hod_builder_control_group">
          <span>Hours</span>

          <strong>
            {periodConfiguration.length} / 12
          </strong>

          <button onClick={addPeriod}>
            + Add Hour
          </button>

          <button onClick={removePeriod}>
            Remove Hour
          </button>
        </div>
      </div>
    );
  };

  // =========================================================
  // PERIOD HEADER
  // =========================================================

const renderPeriodHeader = (period) => {
  return (
    <div
      key={period.periodNumber}
      className="hod_hour_header"
      onClick={() =>
        handleEditPeriod(period)
      }
    >
      <select
        value={period.periodType}
        onChange={(e) =>
          updatePeriodType(
            period.periodNumber,
            e.target.value
          )
        }
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <option value="Teaching">Teaching</option>
        <option value="Break">Break</option>
        <option value="Lunch">Lunch</option>
      </select>

      <div className="hod_hour_number">
        H{period.periodNumber}
      </div>
    </div>
  );
};

  // =========================================================
  // SPECIAL CELL
  // =========================================================

  const renderSpecialCell = (
    periodType
  ) => {
    return (
      <div
        className={
          periodType === "Lunch"
            ? "hod_special_cell hod_lunch_cell"
            : "hod_special_cell hod_break_cell"
        }
      >
        <strong>
          {periodType === "Lunch"
            ? "LUNCH"
            : "BREAK"}
        </strong>
      </div>
    );
  };

  // =========================================================
  // TEACHING CELL
  // =========================================================

  const renderTeachingCell = (
    dayOrder,
    periodNumber
  ) => {
    const cell = getCell(
      dayOrder,
      periodNumber
    );

    const subject = getSubject(
      cell?.subjectId
    );

    const teacher = getFaculty(
      cell?.facultyId
    );

    if (!cell?.subjectId) {
      return (
        <button
          className="hod_add_subject_btn"
          onClick={() =>
            openAssignPopup(
              dayOrder,
              periodNumber
            )
          }
        >
          +
        </button>
      );
    }

    return (
      <button
        className="hod_subject_chip"
        onClick={() =>
          openAssignPopup(
            dayOrder,
            periodNumber
          )
        }
      >
        <div className="hod_subject_chip_header">
          <strong>
            {subject?.subjectCode}
          </strong>

          <span>
            {subject?.subjectType}
          </span>
        </div>

        <p>
          {subject?.subjectName}
        </p>

        {teacher && (
          <small>
            {teacher.employeeId ||
              teacher.profile?.employeeId ||
              teacher.name ||
              teacher.userName ||
              teacher.fullName}
          </small>
        )}

        {cell?.room && (
          <small>
            Room {cell.room}
          </small>
        )}
      </button>
    );
  };

  // =========================================================
  // TIMETABLE GRID
  // =========================================================

  const renderTimetableGrid = () => {
    return (
      <div className="hod_timetable_wrapper">
        <div
  className="hod_timetable_grid"
  style={{
    "--timetable-period-count": periodConfiguration.length,
  }}
>
          <div className="hod_day_header">
            Day Order
          </div>

          {periodConfiguration.map(
            renderPeriodHeader
          )}

          {timetableData.map((day) => (
            <div
              className="hod_timetable_grid_row"
              key={day.dayOrder}
            >
              <div className="hod_day_cell">
                <strong>
                  Day {day.dayOrder}
                </strong>

                <span>
                  {getDayName(
                    day.dayOrder
                  )}
                </span>
              </div>

              {periodConfiguration.map(
                (period) => (
                  <div
                    className="hod_timetable_cell"
                    key={`${day.dayOrder}-${period.periodNumber}`}
                  >
                    {period.periodType ===
                    "Teaching"
                      ? renderTeachingCell(
                          day.dayOrder,
                          period.periodNumber
                        )
                      : renderSpecialCell(
                          period.periodType
                        )}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // =========================================================
  // ASSIGN POPUP
  // =========================================================

  const renderAssignPopup = () => {
    if (!showAssignPopup) {
      return null;
    }

    return (
      <div className="hod_assign_popup_overlay">
        <div className="hod_assign_popup_wrapper">
          <div className="hod_assign_popup_header">
            <div>
              <h2>
                Assign Teaching Hour
              </h2>

              <p>
                Select subject and faculty.
              </p>
            </div>

            <button
              onClick={() =>
                setShowAssignPopup(false)
              }
            >
              ✕
            </button>
          </div>

          <div className="hod_assign_popup_body">
            <div className="hod_assign_info_wrapper">
              <div className="hod_assign_info_card">
                <span>Day</span>

                <strong>
                  {getDayName(
                    selectedCell?.dayOrder
                  )}
                </strong>
              </div>

              <div className="hod_assign_info_card">
                <span>Hour</span>

                <strong>
                  H{selectedCell?.periodNumber}
                </strong>
              </div>
            </div>

            <div className="hod_assign_popup_field">
              <label>Subject</label>

              <select
                name="subjectId"
                value={
                  assignForm.subjectId
                }
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    subjectId:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  {subjectLoading
                    ? "Loading subjects..."
                    : "Select subject"}
                </option>

                {subjects.map(
                  (subject) => (
                    <option
                      key={subject._id}
                      value={subject._id}
                    >
                      {subject.subjectCode}
                      {" - "}
                      {subject.subjectName}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="hod_assign_popup_field">
              <label>Faculty</label>

              <select
                name="facultyId"
                value={
                  assignForm.facultyId
                }
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    facultyId:
                      e.target.value,
                  })
                }
              >
                <option value="">
                  {facultyLoading
                    ? "Loading faculty..."
                    : "Select faculty"}
                </option>

{faculty.map(
  (item) => (
    <option
      key={item.userId}
      value={item.userId}
    >
      {item.user?.fullName || "Faculty"}
    </option>
  )
)}
              </select>
            </div>

            <div className="hod_assign_popup_field">
              <label>Room</label>

              <input
                type="text"
                name="room"
                value={assignForm.room}
                placeholder="Enter room"
                onChange={(e) =>
                  setAssignForm({
                    ...assignForm,
                    room: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="hod_assign_popup_footer">
            <button
              className="hod_assign_cancel_btn"
              onClick={() =>
                setShowAssignPopup(false)
              }
            >
              Cancel
            </button>

            <button
              className="hod_assign_save_btn"
              onClick={saveAssignment}
            >
              Save Assignment
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // PERIOD POPUP
  // =========================================================

  const renderPeriodPopup = () => {
    if (!showPeriodPopup) {
      return null;
    }

    return (
      <div className="hod_period_popup_overlay">
        <div className="hod_period_popup_wrapper">
          <div className="hod_period_popup_header">
            <div>
              <h2>Configure Hour</h2>

              <p>
                Select the hour type.
              </p>
            </div>

            <button
              onClick={() =>
                setShowPeriodPopup(false)
              }
            >
              ✕
            </button>
          </div>

          <div className="hod_period_popup_body">
            <div className="hod_period_info_card">
              <span>Hour</span>

              <strong>
                H{periodForm.periodNumber}
              </strong>
            </div>

            <div className="hod_period_popup_field">
              <label>Hour Type</label>

              <select
                name="periodType"
                value={
                  periodForm.periodType
                }
                onChange={(e) =>
                  setPeriodForm({
                    ...periodForm,
                    periodType:
                      e.target.value,
                  })
                }
              >
                <option value="Teaching">
                  Teaching
                </option>

                <option value="Break">
                  Break
                </option>

                <option value="Lunch">
                  Lunch
                </option>
              </select>
            </div>
          </div>

          <div className="hod_period_popup_footer">
            <button
              className="hod_period_cancel_btn"
              onClick={() =>
                setShowPeriodPopup(false)
              }
            >
              Cancel
            </button>

            <button
              className="hod_period_save_btn"
              onClick={handleSavePeriod}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // CREATE INFO POPUP
  // =========================================================

  const renderCreatePopup = () => {
    if (!showTimetablePopup) {
      return null;
    }

    return (
      <div className="hod_timetable_popup_overlay">
        <div className="hod_timetable_popup_wrapper">
          <div className="hod_timetable_popup_header">
            <div>
              <h2>Create Timetable</h2>

              <p>
                Start creating the timetable
                for this class.
              </p>
            </div>

            <button
              onClick={() =>
                setShowTimetablePopup(false)
              }
            >
              ✕
            </button>
          </div>

          <div className="hod_timetable_popup_body">
            <div className="hod_timetable_popup_info">
              <p>
                You can configure the
                timetable after continuing.
              </p>

              <h3>
                {classData?.programme?.programmeName}
              </h3>

              <span>
                Batch {classData?.batchId?.batchName}
              </span>

              <span>
                Section {classData?.section || "—"}
              </span>

              <span>
                Semester {currentSemester || "—"}
              </span>
            </div>
          </div>

          <div className="hod_timetable_popup_footer">
            <button
              className="hod_timetable_popup_cancel_btn"
              onClick={() =>
                setShowTimetablePopup(false)
              }
            >
              Cancel
            </button>

            <button
              className="hod_timetable_popup_save_btn"
              onClick={openCreateTimetable}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  // =========================================================
  // EMPTY STATE
  // =========================================================

const renderEmptyState = () => {
  return (
    <div className="hod_empty_timetable">
      <div className="hod_empty_icon">
        📅
      </div>

      <h2>No Timetable Created</h2>

      <p>
        No timetable exists for this class yet.
      </p>
    </div>
  );
};
  // =========================================================
  // SUMMARY
  // =========================================================

const renderSummary = () => {
  if (showTimetableEditor) {
    return null;
  }

  return (
    <div className="hod_timetable_summary">
      <div className="hod_timetable_summary_card">
        <h2>Semester Timetable</h2>

        <p>
          {classData?.programme?.programmeName}
        </p>

        <span>
          Batch {classData?.batchId?.batchName}
        </span>

        <span>
          Section {classData?.section || "—"}
        </span>

        <span>
          Semester {currentSemester || "—"}
        </span>
      </div>
    </div>
  );
};

  // =========================================================
  // EDITOR
  // =========================================================

  const renderEditor = () => {
    if (!showTimetableEditor) {
      return null;
    }

    return (
      <div className="hod_timetable_editor">
        <div className="hod_timetable_editor_header">
          <div>
            <h2>
              {isEditMode
                ? "Update Timetable"
                : "Create Timetable"}
            </h2>

            <p>
              Configure day orders, hours,
              subjects and faculty.
            </p>
          </div>

          <button
            className="hod_timetable_cancel_edit_btn"
            onClick={closeEditor}
          >
            Close
          </button>
        </div>

        {renderBuilderControls()}
        {renderTimetableGrid()}

        <div className="hod_timetable_editor_footer">
          <button
            className="hod_timetable_cancel_edit_btn"
            onClick={closeEditor}
          >
            Cancel
          </button>

          <button
            className="hod_timetable_save_btn"
            onClick={saveTimetable}
          >
            {isEditMode
              ? "Update Timetable"
              : "Create Timetable"}
          </button>
        </div>
      </div>
    );
  };

  // =========================================================
  // MAIN RETURN
  // =========================================================

  return (
    <div className="timetable-page">
      {renderHeader()}

      {timetableLoading ? (
        <div className="hod_timetable_loading">
          Loading timetable...
        </div>
      ) : hasTimetable ? (
        <>
          {renderSummary()}
          {renderEditor()}
        </>
      ) : showTimetableEditor ? (
        renderEditor()
      ) : (
        renderEmptyState()
      )}

      {renderAssignPopup()}
      {renderPeriodPopup()}
      {renderCreatePopup()}
    </div>
  );
};

export default TimetablePage;