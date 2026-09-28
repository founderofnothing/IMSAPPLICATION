import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API, { SERVER_URL } from "../../../../api/axios";

const BusDriverProfile = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDriver = async () => {

    try {

      const response = await API.get(
        `/transport/bus-driver/${id}`
      );

      setDriver(response.data.data);

    } catch (error) {

      toast.error(

        error.response?.data?.message ||

        "Failed to fetch driver."

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    fetchDriver();

  }, []);

  if (loading) {

    return <h2>Loading...</h2>;

  }

  if (!driver) {

    return <h2>No Driver Found</h2>;

  }

  return (

    <div className="driver_profile_container">
 <div className="profile_header">

    <button
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>

    <h2>

      Driver Profile

    </h2>

  </div>
<div className="profile_card">

  {

    driver.profileImage ?

    (

      <img

        src={`${SERVER_URL}${driver.profileImage}`}

        alt={driver.driverName}

        className="profile_image"

      />

    )

    :

    (

      <div className="profile_avatar">

        {

          driver.driverName

          ?.charAt(0)

          ?.toUpperCase()

        }

      </div>

    )

  }

  <h2>

    {driver.driverName}

  </h2>

  <p>

    {driver.employeeId}

  </p>

  <p>

    {driver.status}

  </p>

</div>
<div className="profile_grid">

  <div className="profile_item">
    <label>Mobile</label>
    <span>{driver.mobileNumber || "-"}</span>
  </div>

  <div className="profile_item">
    <label>Alternate Mobile</label>
    <span>{driver.alternateMobileNumber || "-"}</span>
  </div>

  <div className="profile_item">
    <label>Email</label>
    <span>{driver.email || "-"}</span>
  </div>

  <div className="profile_item">
    <label>Date of Birth</label>
    <span>
      {
        driver.dateOfBirth
          ?.substring(0,10)
          || "-"
      }
    </span>
  </div>

  <div className="profile_item">
    <label>Gender</label>
    <span>{driver.gender || "-"}</span>
  </div>

  <div className="profile_item">
    <label>Blood Group</label>
    <span>{driver.bloodGroup || "-"}</span>
  </div>

</div>

{/* ===============================
    LICENCE INFORMATION
================================ */}

<div className="profile_section">

  <h3>Licence Information</h3>

  <div className="profile_grid">

    <div className="profile_item">
      <label>Licence Number</label>
      <span>{driver.licenceNumber || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Licence Type</label>
      <span>{driver.licenceType || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Issue Date</label>
      <span>{driver.licenceIssueDate?.substring(0,10) || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Expiry Date</label>
      <span>{driver.licenceExpiryDate?.substring(0,10) || "-"}</span>
    </div>

  </div>

</div>

{/* ===============================
    EMPLOYMENT INFORMATION
================================ */}

<div className="profile_section">

  <h3>Employment Information</h3>

  <div className="profile_grid">

    <div className="profile_item">
      <label>Joining Date</label>
      <span>{driver.joiningDate?.substring(0,10) || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Experience</label>
      <span>{driver.experienceInYears || 0} Years</span>
    </div>

    <div className="profile_item">
      <label>Salary</label>
      <span>₹ {driver.salary || 0}</span>
    </div>

    <div className="profile_item">
      <label>Status</label>
      <span>{driver.status}</span>
    </div>

  </div>

</div>

{/* ===============================
    EMERGENCY CONTACT
================================ */}

<div className="profile_section">

  <h3>Emergency Contact</h3>

  <div className="profile_grid">

    <div className="profile_item">
      <label>Contact Name</label>
      <span>{driver.emergencyContactName || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Contact Number</label>
      <span>{driver.emergencyContactNumber || "-"}</span>
    </div>

  </div>

</div>

{/* ===============================
    COMMUNICATION ADDRESS
================================ */}

<div className="profile_section">

  <h3>Communication Address</h3>

  <div className="profile_grid">

    <div className="profile_item">
      <label>Address Line 1</label>
      <span>{driver.communicationAddress?.addressLine1 || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Address Line 2</label>
      <span>{driver.communicationAddress?.addressLine2 || "-"}</span>
    </div>

    <div className="profile_item">
      <label>City</label>
      <span>{driver.communicationAddress?.city || "-"}</span>
    </div>

    <div className="profile_item">
      <label>District</label>
      <span>{driver.communicationAddress?.district || "-"}</span>
    </div>

    <div className="profile_item">
      <label>State</label>
      <span>{driver.communicationAddress?.state || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Pincode</label>
      <span>{driver.communicationAddress?.pincode || "-"}</span>
    </div>

  </div>

</div>

{/* ===============================
    PERMANENT ADDRESS
================================ */}

<div className="profile_section">

  <h3>Permanent Address</h3>

  <div className="profile_grid">

    <div className="profile_item">
      <label>Address Line 1</label>
      <span>{driver.permanentAddress?.addressLine1 || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Address Line 2</label>
      <span>{driver.permanentAddress?.addressLine2 || "-"}</span>
    </div>

    <div className="profile_item">
      <label>City</label>
      <span>{driver.permanentAddress?.city || "-"}</span>
    </div>

    <div className="profile_item">
      <label>District</label>
      <span>{driver.permanentAddress?.district || "-"}</span>
    </div>

    <div className="profile_item">
      <label>State</label>
      <span>{driver.permanentAddress?.state || "-"}</span>
    </div>

    <div className="profile_item">
      <label>Pincode</label>
      <span>{driver.permanentAddress?.pincode || "-"}</span>
    </div>

  </div>

</div>

{/* ===============================
    REMARKS
================================ */}

<div className="profile_section">

  <h3>Remarks</h3>

  <div className="profile_item">
    <span>{driver.remarks || "No remarks available."}</span>
  </div>

</div>


    </div>

  );

};

export default BusDriverProfile;