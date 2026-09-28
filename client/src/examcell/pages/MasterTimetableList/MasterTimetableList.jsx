import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  PlusIcon,
  EyeIcon,
  TrashSimpleIcon,
  CalendarBlankIcon,
  ClockIcon,
  GraduationCapIcon,
  CalendarCheckIcon,
} from "@phosphor-icons/react";

import { toast } from "react-toastify";

import API from "../../../api/axios";
import "./mastertimetablelist.css";


// =========================================================
// MASTER TIMETABLE LIST
// =========================================================

const MasterTimetableList = () => {

  const navigate = useNavigate();


  // =======================================================
  // STATE
  // =======================================================

  const [timetables, setTimetables] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);


  // =======================================================
  // FETCH MASTER TIMETABLES
  // =======================================================

  const fetchMasterTimetables =
    async () => {

      try {

        setLoading(true);

        const response =
          await API.get(
            "/master-timetables"
          );

        setTimetables(
          response.data?.data || []
        );

      } catch (error) {

        console.error(
          "Failed to fetch master timetables:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to load master timetables."
        );

      } finally {

        setLoading(false);

      }
    };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    fetchMasterTimetables();

  }, []);


  // =======================================================
  // CREATE NEW TIMETABLE
  // =======================================================

const handleAddTimetable = () => {

  navigate(
    "/examcell/master-timetables/create"
  );

};


  // =======================================================
  // VIEW TIMETABLE
  // =======================================================

const handleViewTimetable = (
  timetableId
) => {

  if (!timetableId) {
    return;
  }

  navigate(
    `/examcell/master-timetables/${timetableId}`
  );

};


  // =======================================================
  // DELETE TIMETABLE
  // =======================================================

  const handleDeleteTimetable =
    async (
      timetableId
    ) => {

      if (!timetableId) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this master timetable?"
        );

      if (!confirmed) {
        return;
      }

      try {

        setDeletingId(
          timetableId
        );

        await API.delete(
          `/master-timetables/${timetableId}`
        );

        setTimetables(
          (prev) =>
            prev.filter(
              (item) =>
                item._id !==
                timetableId
            )
        );

        toast.success(
          "Master timetable deleted successfully."
        );

      } catch (error) {

        console.error(
          "Failed to delete timetable:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to delete master timetable."
        );

      } finally {

        setDeletingId(null);

      }
    };


  // =======================================================
  // FORMAT DATE
  // =======================================================

  const formatDate = (
    value
  ) => {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =======================================================
  // EXAM TITLE
  // =======================================================

  const getExamTitle = (
    timetable
  ) => {

    return (
      timetable?.examTitleId
        ?.examTitle ||
      timetable?.examTitleId
        ?.title ||
      "Examination"
    );

  };


  // =======================================================
  // COUNT SESSIONS
  // =======================================================

  const getSessionCount = (
    timetable
  ) => {

    return (
      timetable?.dates ||
      []
    ).reduce(
      (
        total,
        date
      ) =>
        total +
        (
          date?.sessions
            ?.length || 0
        ),
      0
    );

  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <div className="mastertimetable_list_page">

        <div className="mastertimetable_list_header">

          <div>
            <h1>
              Master Timetable
            </h1>

            <p>
              Manage examination timetables
              for your institution.
            </p>
          </div>

        </div>


        <div className="mastertimetable_list_loading">

          <div className="mastertimetable_loading_spinner" />

          <p>
            Loading master timetables...
          </p>

        </div>

      </div>

    );

  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div className="mastertimetable_list_page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="mastertimetable_list_header">

        <div className="mastertimetable_list_header_content">

          <span className="mastertimetable_list_eyebrow">
            EXAMINATION MANAGEMENT
          </span>

          <h1>
            Master Timetable
          </h1>

          <p>
            Create, view and manage
            examination timetables.
          </p>

        </div>


        <button
          type="button"
          className="mastertimetable_list_add_btn"
          onClick={
            handleAddTimetable
          }
        >

          <PlusIcon
            size={18}
            weight="bold"
          />

          Add Master Timetable

        </button>

      </div>


      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {timetables.length === 0 ? (

        <div className="mastertimetable_list_empty">

          <div className="mastertimetable_list_empty_icon">

            <CalendarBlankIcon
              size={30}
              weight="regular"
            />

          </div>

          <h2>
            No Master Timetables
          </h2>

          <p>
            No examination timetable has
            been created yet. Create your
            first master timetable to get
            started.
          </p>

          <button
            type="button"
            className="mastertimetable_list_empty_btn"
            onClick={
              handleAddTimetable
            }
          >

            <PlusIcon
              size={17}
              weight="bold"
            />

            Create Master Timetable

          </button>

        </div>

      ) : (

        /* =================================================
           TIMETABLE LIST
        ================================================= */

        <div className="mastertimetable_list_container">


          {/* LIST HEADER */}

          <div className="mastertimetable_list_container_header">

            <div>

              <h2>
                Saved Timetables
              </h2>

              <span>
                {timetables.length}{" "}
                timetable
                {timetables.length !== 1
                  ? "s"
                  : ""}{" "}
                available
              </span>

            </div>

          </div>


          {/* CARDS */}

          <div className="mastertimetable_cards">

            {timetables.map(
              (
                timetable
              ) => {

                const sessionCount =
                  getSessionCount(
                    timetable
                  );

                return (

                  <div
                    key={
                      timetable._id
                    }
                    className="mastertimetable_card"
                  >


                    {/* CARD TOP */}

                    <div className="mastertimetable_card_top">

                      <div className="mastertimetable_card_title">

                        <span className="mastertimetable_card_eyebrow">
                          MASTER EXAMINATION TIMETABLE
                        </span>

                        <h3>
                          {
                            getExamTitle(
                              timetable
                            )
                          }
                        </h3>

                      </div>


                      <span
                        className={`mastertimetable_semester_badge ${
                          timetable.semesterType ===
                          "Even"
                            ? "mastertimetable_semester_even"
                            : ""
                        }`}
                      >

                        {
                          timetable.semesterType ||
                          "-"
                        }

                      </span>

                    </div>


                    {/* CARD INFORMATION */}

                    <div className="mastertimetable_card_information">


                      <div className="mastertimetable_card_info_item">

                        <div className="mastertimetable_card_info_icon">

                          <GraduationCapIcon
                            size={17}
                            weight="regular"
                          />

                        </div>

                        <div>

                          <span>
                            Academic Year
                          </span>

                          <strong>
                            {
                              timetable.academicYear ||
                              "-"
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="mastertimetable_card_info_item">

                        <div className="mastertimetable_card_info_icon">

                          <CalendarCheckIcon
                            size={17}
                            weight="regular"
                          />

                        </div>

                        <div>

                          <span>
                            Examination Days
                          </span>

                          <strong>
                            {
                              timetable
                                ?.dates
                                ?.length ||
                              0
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="mastertimetable_card_info_item">

                        <div className="mastertimetable_card_info_icon">

                          <ClockIcon
                            size={17}
                            weight="regular"
                          />

                        </div>

                        <div>

                          <span>
                            Sessions
                          </span>

                          <strong>
                            {
                              sessionCount
                            }
                          </strong>

                        </div>

                      </div>


                      <div className="mastertimetable_card_info_item">

                        <div className="mastertimetable_card_info_icon">

                          <CalendarBlankIcon
                            size={17}
                            weight="regular"
                          />

                        </div>

                        <div>

                          <span>
                            Created
                          </span>

                          <strong>
                            {
                              formatDate(
                                timetable.createdAt
                              )
                            }
                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* CARD FOOTER */}

                    <div className="mastertimetable_card_footer">


                      <span className="mastertimetable_card_id">

                        ID:{" "}
                        {String(
                          timetable._id
                        ).slice(
                          -8
                        )}

                      </span>


                      <div className="mastertimetable_card_actions">

                        {/* VIEW */}

<button
  type="button"
  title="View timetable"
onClick={() =>
  handleViewTimetable(
    timetable._id
  )
}
>
  <EyeIcon size={18} />
</button>


                        {/* DELETE */}

                        <button
                          type="button"
                          className="mastertimetable_delete_btn"
                          onClick={() =>
                            handleDeleteTimetable(
                              timetable._id
                            )
                          }
                          disabled={
                            deletingId ===
                            timetable._id
                          }
                          title="Delete timetable"
                        >

                          <TrashSimpleIcon
                            size={17}
                            weight="regular"
                          />

                          {
                            deletingId ===
                            timetable._id
                              ? "Deleting..."
                              : "Delete"
                          }

                        </button>

                      </div>

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </div>

      )}

    </div>

  );

};


export default MasterTimetableList;