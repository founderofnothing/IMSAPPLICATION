import React, {
  useEffect,
  useState,
} from "react";

import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./AcademicSession.css";

const AcademicSession = () => {

  // ==================== STATE ====================

  const [programmes, setProgrammes] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ==================== PROGRAMME STRUCTURE ====================

  const [selectedProgramme, setSelectedProgramme] =
    useState(null);

  const [programmeStructure, setProgrammeStructure] =
    useState(null);

  const [showSessionModal, setShowSessionModal] =
    useState(false);

  const [structureLoading, setStructureLoading] =
    useState(false);

  // ==================== BATCH STATE ====================

  const [programmeBatches, setProgrammeBatches] =
    useState([]);

  const [batchLoading, setBatchLoading] =
    useState(false);

  const [savingBatchId, setSavingBatchId] =
    useState(null);

  // ==================== SEMESTER STATE ====================

  const [selectedSemesters, setSelectedSemesters] =
    useState({});


  // ==================== FETCH PROGRAMMES ====================

  const fetchProgrammes = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          "/programmes/my-department"
        );

      setProgrammes(
        response.data.data || []
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch programmes."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================== GET SEMESTERS FOR YEAR ====================

  const getSemestersForYear = (
    studyYear
  ) => {

    const year =
      Number(studyYear);

    if (
      !year ||
      year <= 0
    ) {
      return [];
    }

    const firstSemester =
      ((year - 1) * 2) + 1;

    return [
      firstSemester,
      firstSemester + 1,
    ];

  };


  // ==================== FETCH PROGRAMME STRUCTURE ====================

  const fetchProgrammeStructure = async (
    programme
  ) => {

    try {

      setStructureLoading(true);

      setSelectedProgramme(
        programme
      );

      // =========================
      // FETCH STRUCTURE
      // =========================

      const structureResponse =
        await API.get(
          `/subjects/programme/${programme._id}`
        );

      const structure =
        structureResponse.data.data;

      setProgrammeStructure(
        structure
      );


      // =========================
      // FETCH BATCHES
      // =========================

      await fetchProgrammeBatches(
        programme._id,
        structure
      );

      setShowSessionModal(
        true
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch programme structure."
      );

    } finally {

      setStructureLoading(false);

    }

  };


  // ==================== FETCH PROGRAMME BATCHES ====================

  const fetchProgrammeBatches = async (
    programmeId,
    structure
  ) => {

    try {

      setBatchLoading(true);

      const response =
        await API.get(
          `/subjects/programme/${programmeId}/batches`
        );

      const batches =
        response.data.data || [];

      setProgrammeBatches(
        batches
      );


      // =========================
      // SET CURRENT SEMESTER
      // FOR EACH BATCH
      // =========================

      const semesterState = {};

      batches.forEach(
        (batch) => {

          const activeSemester =
            structure?.activeSemesters?.find(
              (item) =>
                item.batchId?.toString() ===
                batch._id?.toString()
            );

          semesterState[
            batch._id
          ] =
            activeSemester
              ? String(
                  activeSemester.semesterNumber
                )
              : "";

        }
      );

      setSelectedSemesters(
        semesterState
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch programme batches."
      );

      setProgrammeBatches([]);

    } finally {

      setBatchLoading(false);

    }

  };


  // ==================== CHANGE SEMESTER ====================

  const handleSemesterChange = (
    batchId,
    semesterNumber
  ) => {

    setSelectedSemesters(
      (previous) => ({
        ...previous,

        [batchId]:
          semesterNumber,
      })
    );

  };


  // ==================== SAVE BATCH SEMESTER ====================

  const saveBatchSemester = async (
    batch
  ) => {

    const selectedSemester =
      selectedSemesters[
        batch._id
      ];

    if (!selectedSemester) {

      toast.error(
        `Please select a semester for ${batch.batchName}.`
      );

      return;

    }

    try {

      setSavingBatchId(
        batch._id
      );

      await API.patch(

        `/subjects/${selectedProgramme._id}/batch/${batch._id}/current-semester`,

        {
          semesterNumber:
            Number(
              selectedSemester
            ),
        }

      );

      toast.success(
        `${batch.batchName} semester updated successfully.`
      );

      // =========================
      // UPDATE LOCAL STRUCTURE
      // =========================

      setProgrammeStructure(
        (previous) => {

          if (!previous) {
            return previous;
          }

          const existingIndex =
            previous.activeSemesters?.findIndex(
              (item) =>
                item.batchId?.toString() ===
                batch._id?.toString()
            );

          const updatedActiveSemesters =
            [
              ...(previous.activeSemesters || []),
            ];

          const newEntry = {
            batchId:
              batch._id,
            semesterNumber:
              Number(
                selectedSemester
              ),
          };

          if (
            existingIndex !== undefined &&
            existingIndex >= 0
          ) {

            updatedActiveSemesters[
              existingIndex
            ] =
              newEntry;

          } else {

            updatedActiveSemesters.push(
              newEntry
            );

          }

          return {
            ...previous,

            activeSemesters:
              updatedActiveSemesters,

          };

        }
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to update current semester."
      );

    } finally {

      setSavingBatchId(
        null
      );

    }

  };


  // ==================== INITIAL LOAD ====================

  useEffect(() => {

    fetchProgrammes();

  }, []);


  // ==================== UI ====================

  return (

    <div className="academic-session-page">

      {/* ==================== HEADER ==================== */}

      <div className="page-header">

        <h2>
          Academic Session
        </h2>

        <p>
          Select a programme to
          manage the current semester
          for each active batch.
        </p>

      </div>


      {/* ==================== PROGRAMME LIST ==================== */}

      <div className="programme-list">

        {

          loading ?

          (

            <h4>
              Loading Programmes...
            </h4>

          )

          :

          programmes.length === 0 ?

          (

            <h4>
              No programmes found.
            </h4>

          )

          :

          (

            programmes.map(
              (programme) => (

                <div
                  key={programme._id}
                  className="programme-card"
                  onClick={() =>
                    fetchProgrammeStructure(
                      programme
                    )
                  }
                >

                  <h3>
                    {programme.programmeName}
                  </h3>

                  <p>
                    Code :
                    {" "}
                    {programme.programmeCode}
                  </p>

                  <p>
                    Type :
                    {" "}
                    {programme.programmeType}
                  </p>

                  <p>
                    Duration :
                    {" "}
                    {programme.duration}
                    {" "}
                    Years
                  </p>

                </div>

              )
            )

          )

        }

      </div>


      {/* ==================== SESSION MODAL ==================== */}

      {
        showSessionModal && (

          <div className="academic-session-popup-overlay">

            <div className="academic-session-popup-wrapper">


              {/* ================= HEADER ================= */}

              <div className="academic-session-popup-header">

                <div>

                  <h2 className="academic-session-popup-title">
                    Academic Session
                  </h2>

                  <p className="academic-session-popup-subtitle">
                    Manage the current semester for each batch.
                  </p>

                </div>

                <button
                  className="academic-session-popup-close"
                  onClick={() =>
                    setShowSessionModal(
                      false
                    )
                  }
                >
                  ✕
                </button>

              </div>


              {/* ================= BODY ================= */}

              <div className="academic-session-popup-body">

                {

                  structureLoading ||

                  batchLoading ?

                  (

                    <h3>
                      Loading Programme...
                    </h3>

                  )

                  :

                  (

                    <>

                      {/* ================= PROGRAMME INFO ================= */}

                      <div className="academic-session-programme-card">

                        <div className="academic-session-info">

                          <label>
                            Programme
                          </label>

                          <h3>
                            {
                              selectedProgramme?.programmeName
                            }
                          </h3>

                        </div>


                        <div className="academic-session-grid">

                          <div className="academic-session-field">

                            <label>
                              Programme Code
                            </label>

                            <input
                              readOnly
                              value={
                                selectedProgramme?.programmeCode ||
                                ""
                              }
                            />

                          </div>


                          <div className="academic-session-field">

                            <label>
                              Programme Type
                            </label>

                            <input
                              readOnly
                              value={
                                selectedProgramme?.programmeType ||
                                ""
                              }
                            />

                          </div>


                          <div className="academic-session-field">

                            <label>
                              Duration
                            </label>

                            <input
                              readOnly
                              value={
                                `${selectedProgramme?.duration || ""} Years`
                              }
                            />

                          </div>

                        </div>

                      </div>


                      {/* ================= BATCH LIST ================= */}

                      <div className="academic-session-batch-section">

                        <div className="academic-session-section-heading">

                          <h3>
                            Programme Batches
                          </h3>

                          <p>
                            Select the semester currently running for each batch.
                          </p>

                        </div>


                        {

                          programmeBatches.length === 0 ?

                          (

                            <div className="academic-session-empty">

                              <p>
                                No active batches found for this programme.
                              </p>

                            </div>

                          )

                          :

                          (

                            <div className="academic-session-batch-list">

                              {

                                programmeBatches.map(
                                  (batch) => {

                                    const semesterOptions =
                                      getSemestersForYear(
                                        batch.currentYear
                                      );

                                    const selectedSemester =
                                      selectedSemesters[
                                        batch._id
                                      ] || "";

                                    const isSaving =
                                      savingBatchId ===
                                      batch._id;

                                    return (

                                      <div
                                        key={batch._id}
                                        className="academic-session-batch-card"
                                      >

                                        {/* ================= BATCH INFO ================= */}

                                        <div className="academic-session-batch-info">

                                          <span>
                                            Batch
                                          </span>

                                          <h4>
                                            {
                                              batch.batchName
                                            }
                                          </h4>

                                        </div>


                                        {/* ================= CURRENT YEAR ================= */}

                                        <div className="academic-session-batch-year">

                                          <span>
                                            Current Study Year
                                          </span>

                                          <strong>
                                            Year{" "}
                                            {
                                              batch.currentYear
                                            }
                                          </strong>

                                        </div>


                                        {/* ================= SEMESTER ================= */}

                                        <div className="academic-session-batch-semester">

                                          <label>
                                            Current Semester
                                          </label>

                                          <select
                                            value={
                                              selectedSemester
                                            }
                                            onChange={(e) =>
                                              handleSemesterChange(
                                                batch._id,
                                                e.target.value
                                              )
                                            }
                                          >

                                            <option value="">
                                              Select Semester
                                            </option>

                                            {

                                              semesterOptions.map(
                                                (semester) => (

                                                  <option
                                                    key={
                                                      semester
                                                    }
                                                    value={
                                                      semester
                                                    }
                                                  >

                                                    Semester{" "}
                                                    {
                                                      semester
                                                    }

                                                  </option>

                                                )
                                              )

                                            }

                                          </select>

                                        </div>


                                        {/* ================= SAVE ================= */}

                                        <div className="academic-session-batch-action">

                                          <button
                                            type="button"
                                            onClick={() =>
                                              saveBatchSemester(
                                                batch
                                              )
                                            }
                                            disabled={
                                              isSaving ||
                                              !selectedSemester
                                            }
                                          >

                                            {
                                              isSaving
                                                ? "Saving..."
                                                : "Save"
                                            }

                                          </button>

                                        </div>

                                      </div>

                                    );

                                  }
                                )

                              }

                            </div>

                          )

                        }

                      </div>

                    </>

                  )

                }

              </div>


              {/* ================= FOOTER ================= */}

              <div className="academic-session-popup-footer">

                <button
                  className="academic-session-cancel-btn"
                  onClick={() =>
                    setShowSessionModal(
                      false
                    )
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

};

export default AcademicSession;