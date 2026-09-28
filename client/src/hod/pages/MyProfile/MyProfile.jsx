import { useEffect, useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./MyProfile.css";

const MyProfile = () => {

  // =====================================================
  // STATE
  // =====================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const [profileImageFile, setProfileImageFile] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState(null);


  // =====================================================
  // FETCH MY PROFILE
  // =====================================================

  const fetchMyProfile = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          "/users/my-profile"
        );

        console.log(
  "MY PROFILE API RESPONSE:",
  response.data
);

console.log(
  "MY PROFILE DATA:",
  response.data?.data
);

      if (
        response.data?.success
      ) {

        const data =
          response.data.data;

        setProfile(data);

        setPreviewImage(
          data?.profileImage || null
        );

      }

    } catch (error) {

      console.error(
        "FETCH PROFILE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch profile."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {

    fetchMyProfile();

  }, []);


  // =====================================================
  // HANDLE BASIC FIELD
  // =====================================================

  const handleChange = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;

    setProfile(
      (prev) => ({
        ...prev,

        [name]: value,
      })
    );

  };


  // =====================================================
  // HANDLE FACULTY PROFILE FIELD
  // =====================================================

const handleProfileChange = (e) => {

  const {
    name,
    value,
  } = e.target;

  setProfile((prev) => ({
    ...prev,

    [name]: value,

  }));

};


  // =====================================================
  // HANDLE PROFILE IMAGE
  // =====================================================

  const handleProfileImageChange = (
    e
  ) => {

    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setProfileImageFile(
      file
    );

    const imageUrl =
      URL.createObjectURL(
        file
      );

    setPreviewImage(
      imageUrl
    );

  };


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {

    try {

      setSaving(true);

      const formData =
        new FormData();


      // =================================================
      // USER INFORMATION
      // =================================================

      formData.append(
        "fullName",
        profile.fullName || ""
      );

      formData.append(
        "email",
        profile.email || ""
      );

      formData.append(
        "phone",
        profile.phone || ""
      );


      // =================================================
      // FACULTY PROFILE
      // =================================================

      formData.append(

        "profile",

        JSON.stringify({

          fatherOrSpouseName:
            profile.fatherOrSpouseName,

          dateOfBirth:
            profile.dateOfBirth,

          gender:
            profile.gender,

          maritalStatus:
            profile.maritalStatus,

          nationality:
            profile.nationality,

          bloodGroup:
            profile.bloodGroup,

          communicationAddress:
            profile.communicationAddress,

          permanentAddress:
            profile.permanentAddress,

          emergencyContact:
            profile.emergencyContact,

          academicQualifications:
            profile.academicQualifications,

          phd:
            profile.phd,

          teachingExperience:
            profile.teachingExperience,

          totalTeachingExperience:
            profile.totalTeachingExperience,

          totalResearchExperience:
            profile.totalResearchExperience,

          publications:
            profile.publications,

          publicationSummary:
            profile.publicationSummary,

          books:
            profile.books,

          conferences:
            profile.conferences,

          projects:
            profile.projects,

          patents:
            profile.patents,

          consultancy:
            profile.consultancy,

          academicAchievements:
            profile.academicAchievements,

          professionalMemberships:
            profile.professionalMemberships,

          additionalResponsibilities:
            profile.additionalResponsibilities,

          subjectsTaught:
            profile.subjectsTaught,

          researchAreas:
            profile.researchAreas,

          technicalSkills:
            profile.technicalSkills,

          languagesKnown:
            profile.languagesKnown,

          references:
            profile.references,

          declarationAccepted:
            profile.declarationAccepted,

          documents:
            profile.documents,

        })

      );


      // =================================================
      // PROFILE IMAGE
      // =================================================

      if (
        profileImageFile
      ) {

        formData.append(
          "profileImage",
          profileImageFile
        );

      }


      // =================================================
      // API
      // =================================================

      const response =
        await API.put(

          "/users/my-profile",

          formData

        );


      if (
        response.data?.success
      ) {

        toast.success(
          response.data.message ||
          "Profile updated successfully."
        );


        // -----------------------------------------------
        // UPDATE LOCAL PROFILE
        // -----------------------------------------------

        setProfile(
          response.data.data
        );


        setPreviewImage(
          response.data.data
            ?.profileImage || null
        );


        setProfileImageFile(
          null
        );


        setEditMode(
          false
        );

      }

    } catch (error) {

      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to update profile."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {

    setEditMode(false);

    setProfileImageFile(
      null
    );

    fetchMyProfile();

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="my-profile-loading">

        Loading profile...

      </div>

    );

  }


  // =====================================================
  // EMPTY
  // =====================================================

  if (!profile) {

    return (

      <div className="my-profile-empty">

        Unable to load profile.

      </div>

    );

  }


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="my-profile-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="my-profile-header">

        <div>

          <span className="my-profile-eyebrow">
            MY PROFILE
          </span>

          <h1>
            Faculty Profile
          </h1>

          <p>
            View and update your professional
            information.
          </p>

        </div>


        <div className="my-profile-header-actions">

          {!editMode ? (

            <button
              type="button"
              className="my-profile-edit-btn"
              onClick={() =>
                setEditMode(true)
              }
            >
              Edit Profile
            </button>

          ) : (

            <>

              <button
                type="button"
                className="my-profile-cancel-btn"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="my-profile-save-btn"
                onClick={
                  handleSave
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </>

          )}

        </div>

      </div>


      {/* =================================================
          PROFILE CARD
      ================================================= */}

      <div className="my-profile-card">


        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <div className="my-profile-hero">

          <div className="my-profile-avatar-wrapper">

<img
  src={
    previewImage
      ? previewImage.startsWith("blob:")
        ? previewImage
        : `${SERVER_URL}${previewImage}`
      : "/default-profile.png"
  }
  alt={profile.fullName || "Faculty"}
/>


            {editMode && (

              <label
                className="my-profile-photo-edit"
              >

                Change Photo

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleProfileImageChange
                  }
                  hidden
                />

              </label>

            )}

          </div>


          <div className="my-profile-identity">

            <h2>
              {profile.fullName}
            </h2>

            <p>
              {profile.designation
                ?.replaceAll(
                  "_",
                  " "
                )
                .replace(
                  /\b\w/g,
                  (char) =>
                    char.toUpperCase()
                )}
            </p>

            <span>
              Employee ID:{" "}
              {profile.employeeId ||
                "N/A"}
            </span>

          </div>

        </div>


        {/* =================================================
            ORGANIZATION
        ================================================= */}

        <section className="my-profile-section">

          <div className="my-profile-section-heading">

            <h3>
              Organization
            </h3>

            <span>
              Managed by institution
            </span>

          </div>


          <div className="my-profile-grid">

            <ProfileField
              label="Institution"
              value={
                profile.institution
                  ?.institutionName
              }
            />

            <ProfileField
              label="Department"
              value={
                profile.department
                  ?.departmentName
              }
            />

            <ProfileField
              label="Designation"
              value={
                profile.designation
              }
            />

            <ProfileField
              label="Employee ID"
              value={
                profile.employeeId
              }
            />

          </div>

        </section>


        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <section className="my-profile-section">

          <div className="my-profile-section-heading">

            <h3>
              Basic Information
            </h3>

          </div>


          <div className="my-profile-grid">

            <EditableField
              label="Full Name"
              name="fullName"
              value={
                profile.fullName
              }
              editMode={
                editMode
              }
              onChange={
                handleChange
              }
            />

            <EditableField
              label="Email"
              name="email"
              value={
                profile.email
              }
              editMode={
                editMode
              }
              onChange={
                handleChange
              }
            />

            <EditableField
              label="Phone"
              name="phone"
              value={
                profile.phone
              }
              editMode={
                editMode
              }
              onChange={
                handleChange
              }
            />

            <ProfileField
              label="Status"
              value={
                profile.status
              }
            />

          </div>

        </section>


        {/* =================================================
            ACADEMIC INFORMATION
        ================================================= */}

        <section className="my-profile-section">

          <div className="my-profile-section-heading">

            <h3>
              Academic Information
            </h3>

            <span>
              Professional qualifications
            </span>

          </div>


          <div className="my-profile-grid">

            <EditableField
              label="Nationality"
              name="nationality"
              value={
                profile.nationality
              }
              editMode={
                editMode
              }
              onChange={
                handleProfileChange
              }
            />

            <EditableField
              label="Blood Group"
              name="bloodGroup"
              value={
                profile.bloodGroup
              }
              editMode={
                editMode
              }
              onChange={
                handleProfileChange
              }
            />

            <EditableField
              label="Date of Birth"
              name="dateOfBirth"
              value={
                profile.dateOfBirth
                  ? profile.dateOfBirth.slice(
                      0,
                      10
                    )
                  : ""
              }
              editMode={
                editMode
              }
              type="date"
              onChange={
                handleProfileChange
              }
            />

            <EditableField
              label="Marital Status"
              name="maritalStatus"
              value={
                profile.maritalStatus
              }
              editMode={
                editMode
              }
              onChange={
                handleProfileChange
              }
            />

          </div>

        </section>


        {/* =================================================
            PHD
        ================================================= */}

        <section className="my-profile-section">

          <div className="my-profile-section-heading">

            <h3>
              PhD
            </h3>

          </div>


          <div className="my-profile-grid">

            <ProfileField
              label="Thesis Title"
              value={
                profile.phd
                  ?.thesisTitle
              }
            />

            <ProfileField
              label="University"
              value={
                profile.phd
                  ?.university
              }
            />

            <ProfileField
              label="Award Date"
              value={
                profile.phd
                  ?.awardDate
                  ?.slice(0, 10)
              }
            />

          </div>

        </section>


      </div>

    </div>

  );

};


// =====================================================
// PROFILE FIELD
// =====================================================

const ProfileField = ({
  label,
  value,
}) => {

  return (

    <div className="my-profile-field">

      <span>
        {label}
      </span>

      <strong>
        {value || "Not provided"}
      </strong>

    </div>

  );

};


// =====================================================
// EDITABLE FIELD
// =====================================================

const EditableField = ({
  label,
  name,
  value,
  editMode,
  onChange,
  type = "text",
}) => {

  return (

    <div className="my-profile-field">

      <span>
        {label}
      </span>


      {editMode ? (

        <input
          type={type}
          name={name}
          value={
            value || ""
          }
          onChange={
            onChange
          }
        />

      ) : (

        <strong>
          {value || "Not provided"}
        </strong>

      )}

    </div>

  );

};


export default MyProfile;