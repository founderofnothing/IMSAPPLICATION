import {
  CookieIcon,
  BowlFoodIcon,
} from "@phosphor-icons/react";

import "./AcademicTimetable.css"

const AcademicTimetable = ({
  mode,
  periodConfiguration = [],
  timetableData = [],
  subjects = [],
  attendanceStatus = [],
  getSelectedSubject = () => "",
  updateSubject = () => {},
  updatePeriodType = () => {},
  onCellClick = () => {},
}) => {
  // ==================== GET SUBJECT ====================

  const getSubject = (
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

    const period = day.periods.find(
      (item) =>
        item.periodNumber === periodNumber
    );

    if (!period) {
      return null;
    }

    return period.subjectId;
  };

  // ==================== GET ATTENDANCE STATUS ====================

  const getStatus = (
    dayOrder,
    periodNumber
  ) => {
    return attendanceStatus.find(
      (item) =>
        item.dayOrder === dayOrder &&
        item.periodNumber === periodNumber
    );
  };

  // ==================== RENDER PERIOD HEADER ====================

  const renderPeriodHeader = (period) => {
    return (
      <th key={period.periodNumber}>
        <div className="academic_period_header">
          <p>
            Period {period.periodNumber}
          </p>

          {mode === "timetable" ? (
            <select
              value={period.periodType}
              onChange={(e) =>
                updatePeriodType(
                  period.periodNumber,
                  e.target.value
                )
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
          ) : (
            <p className="academic_period_type">
              {period.periodType}
            </p>
          )}
        </div>
      </th>
    );
  };

  // ==================== RENDER TEACHING CELL ====================

  const renderTeachingCell = (
    day,
    period,
    subject,
    status
  ) => {
    if (mode === "timetable") {
      return (
        <select
          className="academic_subject_select"
          value={getSelectedSubject(
            day.dayOrder,
            period.periodNumber
          )}
          onChange={(e) =>
            updateSubject(
              day.dayOrder,
              period.periodNumber,
              e.target.value
            )
          }
        >
          <option value="">
            Select Subject
          </option>

          {subjects.map((subject) => (
            <option
              key={subject._id}
              value={subject._id}
            >
              {subject.subjectCode}
              {" - "}
              {subject.subjectName}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div
        className="academic_attendance_subject"
        onClick={() =>
          onCellClick(day, period)
        }
      >
        {subject ? (
          <>
            <strong>
              {subject.subjectCode}
            </strong>

            <p>
              {subject.subjectName}
            </p>

            <div className="academic_attendance_divider" />

            {status ? (
              <>
                <small className="academic_attendance_completed">
                  ✔ Completed
                </small>

                <small className="academic_attendance_faculty">
                  {status.facultyName}
                </small>
              </>
            ) : (
              <small className="academic_attendance_pending">
                Pending
              </small>
            )}
          </>
        ) : (
          <span className="academic_no_subject">
            No Subject Assigned
          </span>
        )}
      </div>
    );
  };

  // ==================== RENDER SPECIAL CELL ====================

  const renderSpecialCell = (periodType) => {
    if (periodType === "Break") {
      return (
        <div className="academic_special_cell academic_break_cell">
          <CookieIcon />

          <span>
            Break
          </span>
        </div>
      );
    }

    return (
      <div className="academic_special_cell academic_lunch_cell">
        <BowlFoodIcon />

        <span>
          Lunch
        </span>
      </div>
    );
  };

  // ==================== RENDER TABLE ====================

  return (
    <div className="academic_timetable_container">
      <table className="academic_timetable_table">
        <thead>
          <tr>
            <th className="academic_day_header">
              Day Order
            </th>

            {periodConfiguration.map(
              renderPeriodHeader
            )}
          </tr>
        </thead>

        <tbody>
          {timetableData.map((day) => (
            <tr key={day.dayOrder}>
              <td className="academic_day_cell">
                <strong>
                  Day {day.dayOrder}
                </strong>
              </td>

              {periodConfiguration.map(
                (period) => {
                  const subject =
                    getSubject(
                      day.dayOrder,
                      period.periodNumber
                    );

                  const status =
                    getStatus(
                      day.dayOrder,
                      period.periodNumber
                    );

                  return (
                    <td
                      key={
                        period.periodNumber
                      }
                      className="academic_timetable_cell"
                    >
                      {period.periodType ===
                      "Teaching"
                        ? renderTeachingCell(
                            day,
                            period,
                            subject,
                            status
                          )
                        : renderSpecialCell(
                            period.periodType
                          )}
                    </td>
                  );
                }
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AcademicTimetable;