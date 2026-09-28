import { useEffect, useState } from "react";
import API, { SERVER_URL } from "../../../api/axios";

// import "./addmissioncellprofile.css";

function AddmissioncellProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response =
        await API.get(
          "/users/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setUser(response.data.data);

      console.log(
        response.data.data
      );
    } catch (error) {
      console.error(
        error.response?.data?.message ||
          error.message
      );
    }
  };

  if (!user) {
    return (
      <div className="profile_loading">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="profile_container">
      <div className="profile_card">
        {/* Profile Header */}

        <div className="profile_header">
          {user.profileImage ? (
            <img
              src={`${SERVER_URL}${user.profileImage}`}
              alt={user.fullName}
              className="profile_image"
            />
          ) : (
            <div className="profile_avatar">
              {user.fullName
                ?.charAt(0)
                ?.toUpperCase()}
            </div>
          )}

          <div>
            <h2 className="profile_name">
              {user.fullName}
            </h2>

            <p className="profile_role">
              {user.profile?.designation
                ?.replace(/_/g, " ")
                ?.replace(
                  /\b\w/g,
                  (char) =>
                    char.toUpperCase()
                )}
            </p>
          </div>
        </div>

        {/* Profile Details */}

        <div className="profile_details">

          <div className="profile_item">
            <h4>Employee ID</h4>
            <p>
              {user.profile
                ?.employeeId || "-"}
            </p>
          </div>

          <div className="profile_item">
            <h4>Email</h4>
            <p>{user.email}</p>
          </div>

          <div className="profile_item">
            <h4>Phone</h4>
            <p>{user.phone}</p>
          </div>

          <div className="profile_item">
            <h4>Role</h4>
            <p>
              {user.role
                ?.replace(/_/g, " ")
                ?.replace(
                  /\b\w/g,
                  (char) =>
                    char.toUpperCase()
                )}
            </p>
          </div>

          <div className="profile_item">
            <h4>Gender</h4>
            <p>
              {user.profile?.gender ||
                "-"}
            </p>
          </div>

          <div className="profile_item">
            <h4>Institution</h4>
            <p>
              {user.institution
                ?.institutionName ||
                "-"}
            </p>
          </div>

          <div className="profile_item">
            <h4>Department</h4>
            <p>
              {user.department
                ?.departmentName ||
                "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddmissioncellProfile;