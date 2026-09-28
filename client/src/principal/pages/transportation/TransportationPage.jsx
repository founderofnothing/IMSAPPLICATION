import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
} from "react";

import API from "../../../api/axios";
import { toast } from "react-toastify";
import gsap from "gsap";

import busBgimg from "../../../assets/bus.png";
import "./TransportationPage.css";

const TransportationPage = () => {
  // ==========================================================
  // REFS FOR GSAP ANIMATIONS
  // ==========================================================
  const containerRef = useRef(null);
  const busRef = useRef(null);

  // ==========================================================
  // BUS LIST
  // ==========================================================
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState("");

  // ==========================================================
  // SELECTED BUS DATA
  // ==========================================================
  const [busData, setBusData] = useState(null);

  // ==========================================================
  // LOADING
  // ==========================================================
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [loadingBus, setLoadingBus] = useState(false);


  // ==========================================================
  // DRIVER POPUP
  // ==========================================================
  const [showDriverDetails, setShowDriverDetails] = useState(false);
// ==========================================================
// STUDENT LIST POPUP
// ==========================================================
const [showStudents, setShowStudents] = useState(false);
  // ==========================================================
  // FETCH BUS LIST
  // ==========================================================
  const fetchBuses = useCallback(async () => {
    try {
      setLoadingBuses(true);
      const response = await API.get("/transport/principal/buses");
      const result = response.data;

      if (!result.success) {
        toast.error(result.message || "Failed to fetch buses.");
        return;
      }

      const busList = result.data || [];
      setBuses(busList);

      if (busList.length > 0) {
        setSelectedBus(busList[0]._id);
      } else {
        setSelectedBus("");
        setBusData(null);
      }
    } catch (error) {
      console.error("FETCH BUSES ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch buses."
      );
    } finally {
      setLoadingBuses(false);
    }
  }, []);

  // ==========================================================
  // FETCH SELECTED BUS DETAILS
  // ==========================================================
  const fetchBusDetails = useCallback(async (busId) => {
    if (!busId) return;

    try {
      setLoadingBus(true);
      const response = await API.get(
        `/transport/principal/bus/${busId}`
      );
      const result = response.data;

      if (!result.success) {
        toast.error(
          result.message || "Failed to fetch bus details."
        );
        return;
      }

      setBusData(result.data || null);
    } catch (error) {
      console.error("FETCH BUS DETAILS ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch bus details."
      );
      setBusData(null);
    } finally {
      setLoadingBus(false);
    }
  }, []);

  // ==========================================================
  // INITIAL BUS FETCH
  // ==========================================================
  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  // ==========================================================
  // FETCH WHEN BUS CHANGES
  // ==========================================================
  useEffect(() => {
    if (!selectedBus) return;
    fetchBusDetails(selectedBus);
  }, [selectedBus, fetchBusDetails]);







// ==========================================================
// GSAP — PREMIUM INITIAL TRANSPORTATION ENTRANCE
// ==========================================================

useLayoutEffect(() => {
  if (loadingBus || !busData) return;

  const ctx = gsap.context(() => {
    // ------------------------------------------------------
    // SET INITIAL STATES BEFORE PAINT
    // ------------------------------------------------------

    gsap.set(busRef.current, {
      x: "100vw",
      autoAlpha: 0,
      force3D: true,
    });

    gsap.set(".transportation-page-header", {
      y: 18,
      autoAlpha: 0,
    });

    gsap.set(".transportation-card", {
      y: 18,
      autoAlpha: 0,
      scale: 0.985,
    });

    // ------------------------------------------------------
    // ENTRANCE TIMELINE
    // ------------------------------------------------------

    const tl = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    // ------------------------------------------------------
    // BUS — RIGHT → CURRENT POSITION
    // ------------------------------------------------------

    tl.to(busRef.current, {
      x: 0,
      autoAlpha: 1,
      duration: 1.15,
      ease: "power3.out",
    })

      // ----------------------------------------------------
      // HEADER
      // ----------------------------------------------------

      .to(
        ".transportation-page-header",
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.42,
          ease: "power2.out",
        },
        "-=0.72"
      )

      // ----------------------------------------------------
      // CARDS — FAST ONE BY ONE
      // ----------------------------------------------------

      .to(
        ".transportation-card",
        {
          y: 0,
          autoAlpha: 1,
          scale: 1,
          duration: 0.38,
          ease: "power2.out",
          stagger: 0.07,
        },
        "-=0.12"
      );
  }, containerRef);

  return () => ctx.revert();
}, [busData, loadingBus]);










  // ==========================================================
  // BUS CHANGE
  // ==========================================================
  const handleBusChange = (event) => {
    setSelectedBus(event.target.value);
  };

  // ==========================================================
  // FORMAT DISTANCE
  // ==========================================================
  const formatDistance = (distance) => {
    if (distance === undefined || distance === null) {
      return "-";
    }
    return `${distance} km`;
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const driver = busData?.driver;
  const bus = busData?.bus;
  const occupancy = busData?.occupancy;
  const routes = busData?.routes || [];
  const students = busData?.students || [];
  const primaryRoute = routes.length > 0 ? routes[0] : null;
  const stops = primaryRoute?.stops || [];
  const totalStudents = occupancy?.occupiedSeats || 0;

return (
 <div
  ref={containerRef}
  className="principal-transportation-page"
>

    {/* =====================================================
        BUS IMAGE
    ====================================================== */}

<div
  className="transportation-bus-image"
  ref={busRef}
>
  <img
    src={busBgimg}
    alt="Bus"
    className="transportation-bus-img"
  />
</div>


    {/* =====================================================
        VEHICLE IDENTITY + BUS SELECTOR
    ====================================================== */}

    <div className="transportation-page-header">

      {/* -------------------------------------------------
          VEHICLE IDENTITY
      -------------------------------------------------- */}

      <div className="transportation-vehicle-identity">

        <p className="transportation-vehicle-year">
          Year {bus?.manufacturingYear || "-"}
        </p>

        <h1 className="transportation-vehicle-name">
          {bus?.manufacturer ||
            bus?.busName ||
            "BUS"}
        </h1>

        <p className="transportation-vehicle-model">
          Model {bus?.model || "-"}
        </p>

      </div>


      {/* -------------------------------------------------
          BUS SELECTOR
      -------------------------------------------------- */}

      <div className="transportation-bus-selector">

        <label>
          Select Bus
        </label>

        <select
          value={selectedBus}
          onChange={handleBusChange}
          disabled={
            loadingBuses ||
            buses.length === 0
          }
        >

          {loadingBuses ? (

            <option>
              Loading buses...
            </option>

          ) : buses.length === 0 ? (

            <option>
              No buses available
            </option>

          ) : (

            buses.map((item) => (

              <option
                key={item._id}
                value={item._id}
              >
                {item.busName} · {item.busNumber}
              </option>

            ))

          )}

        </select>

      </div>

    </div>


    {/* =====================================================
        LOADING
    ====================================================== */}

    {loadingBus ? (

      <div className="transportation-loading">

        <span>
          Loading bus information...
        </span>

      </div>

    ) : !busData ? (

      /* ===================================================
         EMPTY STATE
      ==================================================== */

      <div className="transportation-empty">

        <h3>
          No transportation data
        </h3>

        <p>
          Select a bus to view its
          transportation information.
        </p>

      </div>

    ) : (

      /* ===================================================
         MAIN TRANSPORTATION CONTENT
      ==================================================== */

      <>

        {/* =================================================
            CARD 1 — SEAT CAPACITY
        ================================================== */}

<div
  className="transportation-card transportation-capacity-card"
  onClick={() => setShowStudents(true)}
>

          <div className="transportation-card-heading">

            <span>
              SEAT CAPACITY
            </span>

<button
  type="button"
  className="transportation-card-expand"
  aria-label="View students inside bus"
  onClick={(event) => {
    event.stopPropagation();
    setShowStudents(true);
  }}
>
  ↗
</button>

          </div>


          <div className="transportation-capacity-values">

            {/* OCCUPIED */}

            <div className="transportation-capacity-value transportation-capacity-value-primary">

              <strong>
                {occupancy?.occupiedSeats || 0}
              </strong>

              <span>
                Total
              </span>

            </div>


            {/* TOTAL */}

            <div className="transportation-capacity-value">

              <strong>
                {occupancy?.totalSeats || 0}
              </strong>

              <span>
                Total
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            CARD 2 — BUS INFORMATION
        ================================================== */}

        <div className="transportation-card transportation-bus-info-card">

          {/* -------------------------------------------------
              BUS HEADER
          -------------------------------------------------- */}

          <div className="transportation-bus-info-header">

            <div className="transportation-bus-info-title">

              <h2>
                {bus?.busName || "BUS"}
              </h2>

              <p>
                {bus?.busNumber || "-"}
              </p>

            </div>


            <span className="transportation-bus-status">
              {bus?.status || "-"}
            </span>

          </div>


          {/* -------------------------------------------------
              BUS INFORMATION GRID
          -------------------------------------------------- */}

          <div className="transportation-bus-info-grid">

            {/* ROUTE NAME */}

            <div className="transportation-info-item">

              <div className="transportation-info-icon">
                ↪
              </div>

              <div className="transportation-info-content">

                <span>
                  Route Name
                </span>

                <strong>
                  {primaryRoute?.routeName ||
                    "-"}
                </strong>

              </div>

            </div>


            {/* TOTAL STOP */}

            <div className="transportation-info-item">

              <div className="transportation-info-icon">
                ⊘
              </div>

              <div className="transportation-info-content">

                <span>
                  Total Stop
                </span>

                <strong>
                  {primaryRoute?.stopCount ||
                    stops.length ||
                    0}
                </strong>

              </div>

            </div>


            {/* TOTAL STUDENT */}

            <div className="transportation-info-item">

              <div className="transportation-info-icon">
                ♧
              </div>

              <div className="transportation-info-content">

                <span>
                  Total Student
                </span>

                <strong>
                  {totalStudents}
                </strong>

              </div>

            </div>


            {/* DISTANCE */}

            <div className="transportation-info-item">

              <div className="transportation-info-icon">
                ◴
              </div>

              <div className="transportation-info-content">

                <span>
                  Distance
                </span>

                <strong>
                  {formatDistance(
                    primaryRoute?.totalDistance
                  )}
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            CARD 3 — STOPS & TIMING
        ================================================== */}

        <div className="transportation-card transportation-stops-card">

          {/* -------------------------------------------------
              STOPS HEADER
          -------------------------------------------------- */}

          <div className="transportation-stops-header">

            <div className="transportation-stops-header-name">

              <span>
                ◉
              </span>

              <strong>
                Stop Name
              </strong>

            </div>


            <div className="transportation-stops-header-time">

              <span>
                ◷
              </span>

              <strong>
                Timing
              </strong>

            </div>

          </div>


          {/* -------------------------------------------------
              STOPS LIST
          -------------------------------------------------- */}

          <div className="transportation-stops-list">

            {stops.length === 0 ? (

              <div className="transportation-no-stops">

                No stops configured.

              </div>

            ) : (

              [...stops]
                .sort(
                  (a, b) =>
                    (a.order || 0) -
                    (b.order || 0)
                )
                .map((stop, index) => (

                  <div
                    className="transportation-stop-row"
                    key={`${stop.stopName}-${index}`}
                  >

                    {/* STOP NAME */}

                    <span className="transportation-stop-name">
                      {stop.stopName || "-"}
                    </span>


                    {/* DASH */}

                    <span className="transportation-stop-dash">
                      -
                    </span>


                    {/* TIME */}

                    <span className="transportation-stop-time">
                      {stop.arrivalTime || "--"}
                    </span>

                  </div>

                ))

            )}

          </div>

        </div>


        {/* =================================================
            CARD 4 — DRIVER
        ================================================== */}

        <div
          className="transportation-card transportation-driver-card"
          onClick={() => {

            if (driver) {
              setShowDriverDetails(true);
            }

          }}
        >

          {!driver ? (

            /* ------------------------------------------------
               NO DRIVER
            ------------------------------------------------- */

            <div className="transportation-no-driver">

              <p>
                No driver assigned.
              </p>

            </div>

          ) : (

            /* ------------------------------------------------
               DRIVER CONTENT
            ------------------------------------------------- */

            <>

              {/* DRIVER COVER */}

              <div className="transportation-driver-cover">

                <div className="transportation-driver-cover-placeholder" />

              </div>


              {/* DRIVER AVATAR */}

              <div className="transportation-driver-avatar">

                {driver.profileImage ? (

                  <img
                    src={driver.profileImage}
                    alt={driver.driverName}
                  />

                ) : (

                  <span>
                    {driver.driverName
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </span>

                )}

              </div>


              {/* DRIVER INFORMATION */}

              <div className="transportation-driver-details">

                <p>
                  DRIVER INFO
                </p>

                <h3>
                  {driver.driverName || "-"}
                </h3>

              </div>

            </>

          )}

        </div>


        {/* =================================================
            DRIVER DETAILS MODAL
        ================================================== */}

        {showDriverDetails && driver && (

          <div
            className="principal-transportation-modal-overlay"
            onClick={() =>
              setShowDriverDetails(false)
            }
          >

            <div
              className="principal-transportation-driver-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* ------------------------------------------------
                  MODAL HEADER
              ------------------------------------------------- */}

              <div className="principal-transportation-modal-header">

                <div>

                  <p>
                    Transportation
                  </p>

                  <h2>
                    Driver Details
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setShowDriverDetails(false)
                  }
                  aria-label="Close driver details"
                >
                  ×
                </button>

              </div>


              {/* ------------------------------------------------
                  MODAL CONTENT
              ------------------------------------------------- */}

              <div className="principal-transportation-driver-modal-content">

                {/* DRIVER PROFILE */}

                <div className="principal-transportation-driver-modal-profile">

                  <div className="principal-transportation-driver-modal-image">

                    {driver.profileImage ? (

                      <img
                        src={driver.profileImage}
                        alt={driver.driverName}
                      />

                    ) : (

                      <span>
                        {driver.driverName
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>

                    )}

                  </div>


                  <div>

                    <h3>
                      {driver.driverName}
                    </h3>

                    <p>
                      Employee ID ·{" "}
                      {driver.employeeId || "-"}
                    </p>

                  </div>

                </div>


                {/* DRIVER DETAILS */}

                <div className="principal-transportation-driver-details-grid">

                  {/* MOBILE */}

                  <div>

                    <span>
                      Mobile
                    </span>

                    <strong>
                      {driver.mobileNumber || "-"}
                    </strong>

                  </div>


                  {/* ALTERNATE MOBILE */}

                  <div>

                    <span>
                      Alternate Mobile
                    </span>

                    <strong>
                      {driver.alternateMobileNumber ||
                        "-"}
                    </strong>

                  </div>


                  {/* EMAIL */}

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {driver.email || "-"}
                    </strong>

                  </div>


                  {/* LICENCE NUMBER */}

                  <div>

                    <span>
                      Licence Number
                    </span>

                    <strong>
                      {driver.licenceNumber || "-"}
                    </strong>

                  </div>


                  {/* LICENCE TYPE */}

                  <div>

                    <span>
                      Licence Type
                    </span>

                    <strong>
                      {driver.licenceType || "-"}
                    </strong>

                  </div>


                  {/* LICENCE EXPIRY */}

                  <div>

                    <span>
                      Licence Expiry
                    </span>

                    <strong>
                      {formatDate(
                        driver.licenceExpiryDate
                      )}
                    </strong>

                  </div>


                  {/* EXPERIENCE */}

                  <div>

                    <span>
                      Experience
                    </span>

                    <strong>
                      {driver.experienceInYears ??
                        0}{" "}
                      years
                    </strong>

                  </div>


                  {/* JOINING DATE */}

                  <div>

                    <span>
                      Joining Date
                    </span>

                    <strong>
                      {formatDate(
                        driver.joiningDate
                      )}
                    </strong>

                  </div>


                  {/* STATUS */}

                  <div>

                    <span>
                      Status
                    </span>

                    <strong>
                      {driver.status || "-"}
                    </strong>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* =================================================
    STUDENT LIST MODAL
================================================== */}

{showStudents && (

  <div
    className="principal-transportation-modal-overlay"
    onClick={() => setShowStudents(false)}
  >

    <div
      className="principal-transportation-students-modal"
      onClick={(event) => event.stopPropagation()}
    >

      {/* -------------------------------------------------
          MODAL HEADER
      -------------------------------------------------- */}

      <div className="principal-transportation-modal-header">

        <div>

          <p>
            Transportation
          </p>

          <h2>
            Students Inside Bus
          </h2>

        </div>


        <button
          type="button"
          onClick={() => setShowStudents(false)}
          aria-label="Close student list"
        >
          ×
        </button>

      </div>


      {/* -------------------------------------------------
          BUS SUMMARY
      -------------------------------------------------- */}

      <div className="principal-transportation-students-summary">

        <div>
          <span>
            Bus
          </span>

          <strong>
            {bus?.busNumber || "-"}
          </strong>
        </div>


        <div>
          <span>
            Occupied
          </span>

          <strong>
            {students.length}
          </strong>
        </div>


        <div>
          <span>
            Capacity
          </span>

          <strong>
            {occupancy?.totalSeats || 0}
          </strong>
        </div>


        <div>
          <span>
            Available
          </span>

          <strong>
            {occupancy?.availableSeats || 0}
          </strong>
        </div>

      </div>


      {/* -------------------------------------------------
          STUDENT LIST
      -------------------------------------------------- */}

      <div className="principal-transportation-students-list">

        {students.length === 0 ? (

          <div className="principal-transportation-no-students">

            <div className="principal-transportation-no-students-icon">
              —
            </div>

            <h3>
              No students assigned
            </h3>

            <p>
              There are currently no active students
              assigned to this bus.
            </p>

          </div>

        ) : (

          students.map((student, index) => (

            <div
              className="principal-transportation-student-row"
              key={
                student.id ||
                student.transportId ||
                index
              }
            >

              {/* -------------------------------------------------
                  STUDENT PHOTO
              -------------------------------------------------- */}

              <div className="principal-transportation-student-avatar">

                {student.profilePhoto ? (

                  <img
                    src={student.profilePhoto}
                    alt={student.studentName}
                  />

                ) : (

                  <span>
                    {student.studentName
                      ?.charAt(0)
                      ?.toUpperCase() || "S"}
                  </span>

                )}

              </div>


              {/* -------------------------------------------------
                  STUDENT INFORMATION
              -------------------------------------------------- */}

              <div className="principal-transportation-student-info">

                <h3>
                  {student.studentName || "-"}
                </h3>

                <p>
                  {student.registerNumber || "No register number"}
                </p>

              </div>


              {/* -------------------------------------------------
                  ACADEMIC INFORMATION
              -------------------------------------------------- */}

              <div className="principal-transportation-student-academic">

                <span>
                  Department
                </span>

                <strong>
                  {student.department || "-"}
                </strong>

              </div>


              <div className="principal-transportation-student-academic">

                <span>
                  Class
                </span>

                <strong>
                  {student.class || "-"}
                </strong>

              </div>


              {/* -------------------------------------------------
                  PICKUP
              -------------------------------------------------- */}

              <div className="principal-transportation-student-stop">

                <span>
                  Pickup
                </span>

                <strong>
                  {student.pickupStop || "-"}
                </strong>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  </div>

)}

      </>

    )}

  </div>
);
};

export default TransportationPage;