import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import { toast } from "react-toastify";
// import "./TimetableClassPage.css";

import "./TimetableClassPage.css"

const TimetableClassPage = () => {

  // ==================== NAVIGATION ====================

  const navigate =
    useNavigate();

  // ==================== STATE ====================

  const [classes, setClasses] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ==================== FETCH CLASSES ====================

  const fetchClasses =
    async () => {

      try {

        setLoading(true);

        const response =
          await API.get(

            "/classes/my-classes"

          );

        setClasses(

          response.data.data || []

        );

      } catch (error) {

        toast.error(

          error.response?.data?.message ||

          "Failed to fetch classes."

        );

      } finally {

        setLoading(false);

      }

    };

  // ==================== OPEN TIMETABLE ====================

  const openTimetable =
    (classItem) => {

      navigate(

        `/hod/timetable/${classItem._id}`,

        {

          state: {

            classData:
              classItem,

          },

        }

      );

    };

  // ==================== INITIAL LOAD ====================

  useEffect(() => {

    fetchClasses();

  }, []);

  // ==================== UI ====================

  return (

    <div className="timetable-class-page">

      {/* ==================== HEADER ==================== */}

      <div className="page-header">

        <h2>

          Timetable Management

        </h2>

        <p>

          Select a class to create or manage its timetable.

        </p>

      </div>

      {/* ==================== CLASS LIST ==================== */}

      <div className="class-list">

        {

          loading ?

          (

            <h4>

              Loading Classes...

            </h4>

          )

          :

          classes.length === 0 ?

          (

            <h4>

              No classes found.

            </h4>

          )

          :

          (

            classes.map(

              (item) => (

                <div

                  key={item._id}

                  className="class-card"

                  onClick={() =>

                    openTimetable(

                      item

                    )

                  }

                >

                  <h3>

                    {

                      item.programme

                        ?.programmeName

                    }

                  </h3>

                  <p>

                    Code :

                    {" "}

                    {

                      item.programme

                        ?.programmeCode

                    }

                  </p>

                  <p>

                    Batch :

                    {" "}

                    {

                      item.batchId

                        ?.batchName

                    }

                  </p>

                  <p>

                    Current Year :

                    {" "}

                    {

                      item.batchId

                        ?.currentYear

                    }

                  </p>

                  <p>

                    Section :

                    {" "}

                    {

                      item.section ||

                      "-"

                    }

                  </p>

                </div>

              )

            )

          )

        }

      </div>

    </div>

  );

};

export default TimetableClassPage;