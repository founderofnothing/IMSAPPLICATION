import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../../api/axios";

const BusInfoProfile = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
      FETCH BUS
  =============================== */

  const fetchBus = async () => {

    try {

      const response = await API.get(
        `/transport/bus/${id}`
      );

      setBus(response.data.data);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch bus."
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    fetchBus();
  }, []);

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!bus) {
    return <h2>Bus not found.</h2>;
  }

  return (

   <div className="bus_profile_container">

  <div className="page_header">

    <button
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>

    <h2>
      Bus Information
    </h2>

  </div>

  {/* ===============================
      BUS INFORMATION
  =============================== */}

  <div className="profile_card">

    <h3>Basic Information</h3>

    <div className="profile_grid">

      <div>
        <label>Bus Number</label>
        <p>{bus.busNumber}</p>
      </div>

      <div>
        <label>Registration Number</label>
        <p>{bus.registrationNumber}</p>
      </div>

      <div>
        <label>Bus Name</label>
        <p>{bus.busName}</p>
      </div>

      <div>
        <label>Vehicle Type</label>
        <p>{bus.vehicleType}</p>
      </div>

      <div>
        <label>Total Seats</label>
        <p>{bus.totalSeats}</p>
      </div>

      <div>
        <label>Manufacturer</label>
        <p>{bus.manufacturer || "-"}</p>
      </div>

      <div>
        <label>Model</label>
        <p>{bus.model || "-"}</p>
      </div>

      <div>
        <label>Manufacturing Year</label>
        <p>{bus.manufacturingYear || "-"}</p>
      </div>

      <div>
        <label>Fuel Type</label>
        <p>{bus.fuelType}</p>
      </div>

      <div>
        <label>Status</label>
        <p>{bus.status}</p>
      </div>

    </div>

  </div>

  {/* ===============================
      DRIVER INFORMATION
  =============================== */}

  <div className="profile_card">

    <h3>Assigned Driver</h3>

    <div className="profile_grid">

      <div>
        <label>Employee ID</label>
        <p>{bus.driverId?.employeeId || "-"}</p>
      </div>

      <div>
        <label>Driver Name</label>
        <p>{bus.driverId?.driverName || "-"}</p>
      </div>

      <div>
        <label>Mobile Number</label>
        <p>{bus.driverId?.mobileNumber || "-"}</p>
      </div>

    </div>

  </div>

  {/* ===============================
      ROUTE INFORMATION
  =============================== */}

  <div className="profile_card">

    <h3>Route Information</h3>

    <div className="profile_grid">

      <div>
        <label>Route Name</label>
        <p>{bus.route?.routeName || "-"}</p>
      </div>

      <div>
        <label>Route Code</label>
        <p>{bus.route?.routeCode || "-"}</p>
      </div>

      <div>
        <label>Total Distance</label>
        <p>
          {bus.route
            ? `${bus.route.totalDistance} KM`
            : "-"}
        </p>
      </div>

      <div>
        <label>Travel Time</label>
        <p>
          {bus.route
            ? `${bus.route.estimatedTravelTime} Minutes`
            : "-"}
        </p>
      </div>

      <div>
        <label>Route Status</label>
        <p>{bus.route?.status || "-"}</p>
      </div>

    </div>

  </div>

  {/* ===============================
      DOCUMENTS
  =============================== */}

  <div className="profile_card">

    <h3>Document Expiry</h3>

    <div className="profile_grid">

      <div>
        <label>Insurance</label>
        <p>
          {bus.insuranceExpiryDate
            ? new Date(bus.insuranceExpiryDate).toLocaleDateString()
            : "-"}
        </p>
      </div>

      <div>
        <label>Fitness Certificate</label>
        <p>
          {bus.fitnessCertificateExpiryDate
            ? new Date(bus.fitnessCertificateExpiryDate).toLocaleDateString()
            : "-"}
        </p>
      </div>

      <div>
        <label>Permit</label>
        <p>
          {bus.permitExpiryDate
            ? new Date(bus.permitExpiryDate).toLocaleDateString()
            : "-"}
        </p>
      </div>

      <div>
        <label>Pollution Certificate</label>
        <p>
          {bus.pollutionCertificateExpiryDate
            ? new Date(bus.pollutionCertificateExpiryDate).toLocaleDateString()
            : "-"}
        </p>
      </div>

    </div>

  </div>

  {/* ===============================
      REMARKS
  =============================== */}

  <div className="profile_card">

    <h3>Remarks</h3>

    <p>

      {bus.remarks || "No remarks available."}

    </p>

  </div>

</div>

  );

};

export default BusInfoProfile;