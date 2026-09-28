import React, {
  useCallback,
  useLayoutEffect,
  useState,
  useRef,
} from "react";

import API from "../../../api/axios";
import { toast } from "react-toastify";
import gsap from "gsap";

import "./PrincipalProfile.css";


// ==========================================================
// SERVER URL
// ==========================================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL;

const SERVER_URL =
  API_BASE_URL.replace(
    /\/api\/?$/,
    ""
  );


// ==========================================================
// PRINCIPAL PROFILE
// ==========================================================

const PrincipalProfile = () => {

  // ========================================================
  // STATE
  // ========================================================

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [editMode, setEditMode] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [profileImageFile, setProfileImageFile] =
    useState(null);

  const [previewImage, setPreviewImage] =
    useState(null);


  // ========================================================
  // REFS
  // ========================================================

  const pageRef =
    useRef(null);

  const animationPlayedRef =
    useRef(false);


  // ========================================================
  // FETCH PROFILE
  // ========================================================

  const fetchProfile = useCallback(
    async () => {

      try {

        setLoading(true);

        const response =
          await API.get(
            "/users/my-profile"
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
          "FETCH PRINCIPAL PROFILE ERROR:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to fetch profile."
        );

      } finally {

        setLoading(false);

      }

    },
    []
  );


  // ========================================================
  // INITIAL FETCH
  // ========================================================

  React.useEffect(() => {

    fetchProfile();

  }, [fetchProfile]);


  // ========================================================
  // PROFILE IMAGE
  // ========================================================

  const getProfileImage = () => {

    if (!previewImage) {

      return "/default-profile.png";

    }

    if (
      previewImage.startsWith(
        "blob:"
      )
    ) {

      return previewImage;

    }

    if (
      previewImage.startsWith(
        "http://"
      ) ||
      previewImage.startsWith(
        "https://"
      )
    ) {

      return previewImage;

    }

    return `${SERVER_URL}${previewImage}`;

  };


  // ========================================================
  // DESIGNATION
  // ========================================================

  const formatDesignation = (
    designation
  ) => {

    if (!designation) {

      return "Principal";

    }

    return designation
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      );

  };


  // ========================================================
  // DATE FORMAT
  // ========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {

      return "Not provided";

    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {

      return "Not provided";

    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ========================================================
  // HANDLE BASIC FIELD
  // ========================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setProfile(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  // ========================================================
  // HANDLE FACULTY FIELD
  // ========================================================

  const handleFacultyChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;

    setProfile(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  // ========================================================
  // PROFILE IMAGE CHANGE
  // ========================================================

  const handleProfileImageChange = (
    event
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) {

      return;

    }

    setProfileImageFile(file);

    const imageUrl =
      URL.createObjectURL(file);

    setPreviewImage(imageUrl);

  };


  // ========================================================
  // SAVE PROFILE
  // ========================================================

  const handleSave = async () => {

    if (!profile) {

      return;

    }

    try {

      setSaving(true);

      const formData =
        new FormData();


      // ----------------------------------------------------
      // USER
      // ----------------------------------------------------

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


      // ----------------------------------------------------
      // PRINCIPAL / FACULTY PROFILE
      // ----------------------------------------------------

      formData.append(
        "profile",
        JSON.stringify({

          employeeId:
            profile.employeeId,

          designation:
            profile.designation,

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


      // ----------------------------------------------------
      // IMAGE
      // ----------------------------------------------------

      if (
        profileImageFile
      ) {

        formData.append(
          "profileImage",
          profileImageFile
        );

      }


      // ----------------------------------------------------
      // API
      // ----------------------------------------------------

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

        const updatedProfile =
          response.data.data;

        setProfile(
          updatedProfile
        );

        setPreviewImage(
          updatedProfile?.profileImage ||
          null
        );

        setProfileImageFile(
          null
        );

        setEditMode(false);

      }

    } catch (error) {

      console.error(
        "UPDATE PRINCIPAL PROFILE ERROR:",
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


  // ========================================================
  // CANCEL
  // ========================================================

  const handleCancel = () => {

    setEditMode(false);

    setProfileImageFile(null);

    fetchProfile();

  };


  // ========================================================
  // INITIAL PAGE ANIMATION
  // ========================================================

  useLayoutEffect(() => {

    if (
      loading ||
      !profile ||
      animationPlayedRef.current
    ) {

      return;

    }

    const ctx =
      gsap.context(() => {

        gsap.set(
          ".principal-profile-hero",
          {
            autoAlpha: 0,
            y: 24,
          }
        );

        gsap.set(
          ".principal-profile-section",
          {
            autoAlpha: 0,
            y: 22,
            scale: 0.99,
          }
        );

        gsap.set(
          ".principal-profile-stat",
          {
            autoAlpha: 0,
            y: 18,
            scale: 0.98,
          }
        );


        const tl =
          gsap.timeline({
            defaults: {
              ease: "power3.out",
            },
          });


        // --------------------------------------------------
        // HERO
        // --------------------------------------------------

        tl.to(
          ".principal-profile-hero",
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
          }
        );


        // --------------------------------------------------
        // STATS
        // --------------------------------------------------

        tl.to(
          ".principal-profile-stat",
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.42,
            stagger: 0.07,
          },
          "-=0.28"
        );


        // --------------------------------------------------
        // SECTIONS
        // --------------------------------------------------

        tl.to(
          ".principal-profile-section",
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.07,
          },
          "-=0.18"
        );

      }, pageRef);

    animationPlayedRef.current = true;

    return () => {

      ctx.revert();

    };

  }, [
    loading,
    profile,
  ]);


  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {

    return (

      <div className="principal-profile-loading">

        <div className="principal-profile-loading-inner">

          <div className="principal-profile-loading-avatar" />

          <div className="principal-profile-loading-lines">

            <span />
            <span />
            <span />

          </div>

        </div>

      </div>

    );

  }


  // ========================================================
  // EMPTY
  // ========================================================

  if (!profile) {

    return (

      <div className="principal-profile-empty">

        <h3>
          Unable to load profile
        </h3>

        <p>
          Please try again later.
        </p>

      </div>

    );

  }


  const qualifications =
    profile.academicQualifications ||
    [];

  const experience =
    profile.teachingExperience ||
    [];

  const publications =
    profile.publications ||
    [];

  const books =
    profile.books ||
    [];

  const conferences =
    profile.conferences ||
    [];

  const projects =
    profile.projects ||
    [];

  const patents =
    profile.patents ||
    [];

  const achievements =
    profile.academicAchievements ||
    [];

  const memberships =
    profile.professionalMemberships ||
    [];

  const responsibilities =
    profile.additionalResponsibilities ||
    [];

  const subjects =
    profile.subjectsTaught ||
    [];

  const researchAreas =
    profile.researchAreas ||
    [];

  const skills =
    profile.technicalSkills ||
    [];

  const languages =
    profile.languagesKnown ||
    [];

  const references =
    profile.references ||
    [];


  // ========================================================
  // RENDER
  // ========================================================

  return (

    <div
      ref={pageRef}
      className="principal-profile-page"
    >

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="principal-profile-page-header">

        <div>

          <span className="principal-profile-eyebrow">
            PRINCIPAL PROFILE
          </span>

          <h1>
            Profile
          </h1>

          <p>
            Professional and institutional
            information.
          </p>

        </div>


        <div className="principal-profile-header-actions">

          {!editMode ? (

            <button
              type="button"
              className="principal-profile-edit-button"
              onClick={() =>
                setEditMode(true)
              }
            >
              <span>✎</span>
              Edit Profile
            </button>

          ) : (

            <div className="principal-profile-edit-actions">

              <button
                type="button"
                className="principal-profile-cancel-button"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="principal-profile-save-button"
                onClick={
                  handleSave
                }
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          )}

        </div>

      </div>


      {/* ==================================================
          PROFILE HERO
      ================================================== */}

      <section className="principal-profile-hero">

        <div className="principal-profile-hero-main">

          {/* PHOTO */}

          <div className="principal-profile-photo-wrapper">

            <img
              src={getProfileImage()}
              alt={
                profile.fullName ||
                "Principal"
              }
              className="principal-profile-photo"
            />

            {editMode && (

              <label className="principal-profile-photo-change">

                Change Photo

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={
                    handleProfileImageChange
                  }
                />

              </label>

            )}

          </div>


          {/* IDENTITY */}

          <div className="principal-profile-identity">

            <div className="principal-profile-name-row">

              <h2>
                {profile.fullName ||
                  "Principal"}
              </h2>

              <span className="principal-profile-status">

                <i />

                {profile.status ||
                  "active"}

              </span>

            </div>

            <p className="principal-profile-designation">

              {formatDesignation(
                profile.designation
              )}

            </p>

            <div className="principal-profile-meta">

              <span>
                Employee ID ·{" "}
                {profile.employeeId ||
                  "Not provided"}
              </span>

              <span>
                {profile.institution
                  ?.institutionName ||
                  "Institution"}
              </span>

            </div>

          </div>

        </div>


        {/* HERO RIGHT */}

        <div className="principal-profile-hero-side">

          <span>
            LAST LOGIN
          </span>

          <strong>
            {formatDate(
              profile.lastLogin
            )}
          </strong>

        </div>

      </section>


      {/* ==================================================
          PROFILE STATS
      ================================================== */}

      <div className="principal-profile-stats">

        <ProfileStat
          value={
            profile.publicationSummary
              ?.totalPublications || 0
          }
          label="Publications"
        />

        <ProfileStat
          value={
            profile.publicationSummary
              ?.hIndex || 0
          }
          label="H-Index"
        />

        <ProfileStat
          value={
            profile.publicationSummary
              ?.totalCitations || 0
          }
          label="Citations"
        />

        <ProfileStat
          value={
            profile.totalTeachingExperience
              ?.years || 0
          }
          suffix=" yrs"
          label="Teaching Experience"
        />

        <ProfileStat
          value={
            profile.totalResearchExperience
              ?.years || 0
          }
          suffix=" yrs"
          label="Research Experience"
        />

      </div>


      {/* ==================================================
          ORGANIZATION
      ================================================== */}

      <ProfileSection
        title="Organization"
        subtitle="Institutional information"
      >

        <div className="principal-profile-grid">

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
                ?.departmentName ||
              "Institution Administration"
            }
          />

          <ProfileField
            label="Designation"
            value={
              formatDesignation(
                profile.designation
              )
            }
          />

          <ProfileField
            label="Employee ID"
            value={
              profile.employeeId
            }
          />

          <ProfileField
            label="Account Status"
            value={
              profile.status
            }
          />

          <ProfileField
            label="Joined"
            value={
              formatDate(
                profile.createdAt
              )
            }
          />

        </div>

      </ProfileSection>


      {/* ==================================================
          CONTACT
      ================================================== */}

      <ProfileSection
        title="Contact Information"
        subtitle="Primary communication details"
      >

        <div className="principal-profile-grid">

          <EditableProfileField
            label="Full Name"
            name="fullName"
            value={
              profile.fullName
            }
            editMode={editMode}
            onChange={
              handleChange
            }
          />

          <EditableProfileField
            label="Email"
            name="email"
            value={
              profile.email
            }
            editMode={editMode}
            onChange={
              handleChange
            }
          />

          <EditableProfileField
            label="Phone"
            name="phone"
            value={
              profile.phone
            }
            editMode={editMode}
            onChange={
              handleChange
            }
          />

          <ProfileField
            label="Role"
            value="Principal"
          />

        </div>

      </ProfileSection>


      {/* ==================================================
          PERSONAL INFORMATION
      ================================================== */}

      <ProfileSection
        title="Personal Information"
        subtitle="Basic personal details"
      >

        <div className="principal-profile-grid">

          <EditableProfileField
            label="Father / Spouse Name"
            name="fatherOrSpouseName"
            value={
              profile.fatherOrSpouseName
            }
            editMode={editMode}
            onChange={
              handleFacultyChange
            }
          />

          <EditableProfileField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={
              profile.dateOfBirth
                ? profile.dateOfBirth.slice(
                    0,
                    10
                  )
                : ""
            }
            editMode={editMode}
            onChange={
              handleFacultyChange
            }
          />

          <ProfileField
            label="Gender"
            value={
              profile.gender
            }
          />

          <ProfileField
            label="Marital Status"
            value={
              profile.maritalStatus
            }
          />

          <ProfileField
            label="Nationality"
            value={
              profile.nationality
            }
          />

          <ProfileField
            label="Blood Group"
            value={
              profile.bloodGroup
            }
          />

        </div>

      </ProfileSection>


      {/* ==================================================
          COMMUNICATION ADDRESS
      ================================================== */}

      <ProfileSection
        title="Addresses"
        subtitle="Communication and permanent address"
      >

        <div className="principal-profile-address-grid">

          <AddressCard
            title="Communication Address"
            address={
              profile.communicationAddress
            }
          />

          <AddressCard
            title="Permanent Address"
            address={
              profile.permanentAddress
            }
          />

        </div>

      </ProfileSection>


      {/* ==================================================
          ACADEMIC QUALIFICATIONS
      ================================================== */}

      <ProfileSection
        title="Academic Qualifications"
        subtitle="Educational background"
      >

        {qualifications.length === 0 ? (

          <EmptyInline
            text="No academic qualifications added."
          />

        ) : (

          <div className="principal-profile-table-wrapper">

            <table className="principal-profile-table">

              <thead>

                <tr>

                  <th>
                    Degree
                  </th>

                  <th>
                    Specialization
                  </th>

                  <th>
                    University
                  </th>

                  <th>
                    Year
                  </th>

                  <th>
                    Score
                  </th>

                  <th>
                    Class
                  </th>

                </tr>

              </thead>

              <tbody>

                {qualifications.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={index}
                    >

                      <td>
                        <strong>
                          {item.degree ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        {item.specialization ||
                          "-"}
                      </td>

                      <td>
                        {item.university ||
                          "-"}
                      </td>

                      <td>
                        {item.yearOfPassing ||
                          "-"}
                      </td>

                      <td>
                        {item.percentageOrCGPA ||
                          "-"}
                      </td>

                      <td>
                        {item.classDivision ||
                          "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </ProfileSection>


      {/* ==================================================
          PHD
      ================================================== */}

      <ProfileSection
        title="Doctoral Qualification"
        subtitle="PhD information"
      >

        <div className="principal-profile-grid">

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
              formatDate(
                profile.phd
                  ?.awardDate
              )
            }
          />

        </div>

      </ProfileSection>


      {/* ==================================================
          EXPERIENCE
      ================================================== */}

      <ProfileSection
        title="Teaching Experience"
        subtitle="Professional teaching history"
      >

        {experience.length === 0 ? (

          <EmptyInline
            text="No teaching experience added."
          />

        ) : (

          <div className="principal-profile-experience-list">

            {experience.map(
              (
                item,
                index
              ) => (

                <div
                  className="principal-profile-experience"
                  key={index}
                >

                  <div className="principal-profile-experience-index">

                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}

                  </div>

                  <div className="principal-profile-experience-main">

                    <h4>
                      {item.designation ||
                        "-"}
                    </h4>

                    <p>
                      {item.institutionName ||
                        "-"}
                    </p>

                    <span>
                      {formatDate(
                        item.fromDate
                      )}
                      {" — "}
                      {item.toDate
                        ? formatDate(
                            item.toDate
                          )
                        : "Present"}
                    </span>

                  </div>

                  <div className="principal-profile-experience-side">

                    <strong>
                      {item.totalYears ||
                        0}
                    </strong>

                    <span>
                      years
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </ProfileSection>


      {/* ==================================================
          RESEARCH
      ================================================== */}

      <ProfileSection
        title="Research & Publications"
        subtitle="Research profile and academic output"
      >

        <div className="principal-profile-research-summary">

          <ResearchMetric
            value={
              profile.publicationSummary
                ?.totalPublications || 0
            }
            label="Publications"
          />

          <ResearchMetric
            value={
              profile.publicationSummary
                ?.hIndex || 0
            }
            label="H-Index"
          />

          <ResearchMetric
            value={
              profile.publicationSummary
                ?.totalCitations || 0
            }
            label="Citations"
          />

        </div>


        {publications.length > 0 && (

          <div className="principal-profile-table-wrapper">

            <table className="principal-profile-table">

              <thead>

                <tr>

                  <th>
                    Paper
                  </th>

                  <th>
                    Journal
                  </th>

                  <th>
                    ISSN
                  </th>

                  <th>
                    Year
                  </th>

                  <th>
                    Author
                  </th>

                </tr>

              </thead>

              <tbody>

                {publications.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={index}
                    >

                      <td>
                        <strong>
                          {item.paperTitle ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        {item.journalName ||
                          "-"}
                      </td>

                      <td>
                        {item.issn ||
                          "-"}
                      </td>

                      <td>
                        {item.year ||
                          "-"}
                      </td>

                      <td>
                        {item.authorType
                          ?.replaceAll(
                            "_",
                            " "
                          ) ||
                          "-"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </ProfileSection>


      {/* ==================================================
          BOOKS
      ================================================== */}

      <ProfileSection
        title="Books"
        subtitle="Published books and academic works"
      >

        <SimpleList
          items={books}
          emptyText="No books added."
          renderItem={(item) => (
            <>
              <strong>
                {item.title ||
                  "-"}
              </strong>

              <span>
                {item.publisher ||
                  "Publisher not provided"}
                {" · "}
                {item.year ||
                  "-"}
              </span>
            </>
          )}
        />

      </ProfileSection>


      {/* ==================================================
          CONFERENCES
      ================================================== */}

      <ProfileSection
        title="Conferences"
        subtitle="Conference participation and papers"
      >

        <SimpleList
          items={conferences}
          emptyText="No conferences added."
          renderItem={(item) => (
            <>
              <strong>
                {item.paperTitle ||
                  "-"}
              </strong>

              <span>
                {item.conferenceName ||
                  "-"}
                {" · "}
                {item.year ||
                  "-"}
              </span>
            </>
          )}
        />

      </ProfileSection>


      {/* ==================================================
          PROJECTS
      ================================================== */}

      <ProfileSection
        title="Projects"
        subtitle="Research and funded projects"
      >

        <SimpleList
          items={projects}
          emptyText="No projects added."
          renderItem={(item) => (
            <>
              <strong>
                {item.title ||
                  "-"}
              </strong>

              <span>
                {item.fundingAgency ||
                  "Funding agency not provided"}
                {" · "}
                {item.role ||
                  "Role not provided"}
              </span>
            </>
          )}
        />

      </ProfileSection>


      {/* ==================================================
          PATENTS
      ================================================== */}

      <ProfileSection
        title="Patents"
        subtitle="Filed and granted patents"
      >

        <SimpleList
          items={patents}
          emptyText="No patents added."
          renderItem={(item) => (
            <>
              <strong>
                {item.title ||
                  "-"}
              </strong>

              <span>
                {item.patentNumber ||
                  "-"}
                {" · "}
                {item.status ||
                  "-"}
              </span>
            </>
          )}
        />

      </ProfileSection>


      {/* ==================================================
          ACHIEVEMENTS
      ================================================== */}

      <ProfileSection
        title="Academic Achievements"
        subtitle="Recognitions and accomplishments"
      >

        <TagList
          items={
            achievements
          }
          emptyText="No academic achievements added."
        />

      </ProfileSection>


      {/* ==================================================
          MEMBERSHIPS
      ================================================== */}

      <ProfileSection
        title="Professional Memberships"
        subtitle="Academic and professional associations"
      >

        <TagList
          items={
            memberships
          }
          emptyText="No professional memberships added."
        />

      </ProfileSection>


      {/* ==================================================
          RESPONSIBILITIES
      ================================================== */}

      <ProfileSection
        title="Additional Responsibilities"
        subtitle="Institutional and administrative responsibilities"
      >

        <TagList
          items={
            responsibilities
          }
          emptyText="No additional responsibilities added."
        />

      </ProfileSection>


      {/* ==================================================
          TEACHING & RESEARCH
      ================================================== */}

      <ProfileSection
        title="Academic Interests"
        subtitle="Teaching, research and technical expertise"
      >

        <div className="principal-profile-interest-grid">

          <TagGroup
            title="Subjects Taught"
            items={subjects}
          />

          <TagGroup
            title="Research Areas"
            items={researchAreas}
          />

          <TagGroup
            title="Technical Skills"
            items={skills}
          />

          <TagGroup
            title="Languages"
            items={languages}
          />

        </div>

      </ProfileSection>


      {/* ==================================================
          EMERGENCY CONTACT
      ================================================== */}

      <ProfileSection
        title="Emergency Contact"
        subtitle="Emergency contact information"
      >

        <div className="principal-profile-grid">

          <ProfileField
            label="Name"
            value={
              profile.emergencyContact
                ?.name
            }
          />

          <ProfileField
            label="Phone"
            value={
              profile.emergencyContact
                ?.phone
            }
          />

        </div>

      </ProfileSection>


      {/* ==================================================
          REFERENCES
      ================================================== */}

      <ProfileSection
        title="References"
        subtitle="Professional references"
      >

        <div className="principal-profile-reference-grid">

          {references.length === 0 ? (

            <EmptyInline
              text="No references added."
            />

          ) : (

            references.map(
              (
                item,
                index
              ) => (

                <div
                  className="principal-profile-reference"
                  key={index}
                >

                  <h4>
                    {item.name ||
                      "-"}
                  </h4>

                  <p>
                    {item.designation ||
                      "-"}
                  </p>

                  <span>
                    {item.institution ||
                      "-"}
                  </span>

                  <small>
                    {item.email ||
                      "-"}
                  </small>

                  <small>
                    {item.mobile ||
                      "-"}
                  </small>

                </div>

              )
            )

          )}

        </div>

      </ProfileSection>


      {/* ==================================================
          DECLARATION
      ================================================== */}

      <section className="principal-profile-declaration">

        <div>

          <span>
            PROFILE DECLARATION
          </span>

          <h3>
            Professional information verified
          </h3>

          <p>
            The profile declaration has been
            {profile.declarationAccepted
              ? " accepted."
              : " not accepted yet."}
          </p>

        </div>

        <div
          className={
            profile.declarationAccepted
              ? "principal-profile-declaration-status accepted"
              : "principal-profile-declaration-status"
          }
        >
          {profile.declarationAccepted
            ? "Verified"
            : "Pending"}
        </div>

      </section>

    </div>

  );

};


// ==========================================================
// PROFILE SECTION
// ==========================================================

const ProfileSection = ({
  title,
  subtitle,
  children,
}) => {

  return (

    <section className="principal-profile-section">

      <div className="principal-profile-section-header">

        <div>

          <h3>
            {title}
          </h3>

          {subtitle && (

            <p>
              {subtitle}
            </p>

          )}

        </div>

      </div>

      <div className="principal-profile-section-body">

        {children}

      </div>

    </section>

  );

};


// ==========================================================
// PROFILE STAT
// ==========================================================

const ProfileStat = ({
  value,
  label,
  suffix = "",
}) => {

  return (

    <div className="principal-profile-stat">

      <strong>
        {value}
        {suffix}
      </strong>

      <span>
        {label}
      </span>

    </div>

  );

};


// ==========================================================
// PROFILE FIELD
// ==========================================================

const ProfileField = ({
  label,
  value,
}) => {

  return (

    <div className="principal-profile-field">

      <span>
        {label}
      </span>

      <strong>
        {value || "Not provided"}
      </strong>

    </div>

  );

};


// ==========================================================
// EDITABLE FIELD
// ==========================================================

const EditableProfileField = ({
  label,
  name,
  value,
  editMode,
  onChange,
  type = "text",
}) => {

  return (

    <div className="principal-profile-field">

      <span>
        {label}
      </span>

      {editMode ? (

        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
        />

      ) : (

        <strong>
          {value || "Not provided"}
        </strong>

      )}

    </div>

  );

};


// ==========================================================
// ADDRESS CARD
// ==========================================================

const AddressCard = ({
  title,
  address,
}) => {

  if (!address) {

    return (

      <div className="principal-profile-address-card">

        <h4>
          {title}
        </h4>

        <p>
          Not provided
        </p>

      </div>

    );

  }

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.district,
    address.state,
    address.pincode,
  ].filter(Boolean);

  return (

    <div className="principal-profile-address-card">

      <span>
        {title}
      </span>

      <p>
        {parts.length > 0
          ? parts.join(", ")
          : "Not provided"}
      </p>

    </div>

  );

};


// ==========================================================
// RESEARCH METRIC
// ==========================================================

const ResearchMetric = ({
  value,
  label,
}) => {

  return (

    <div className="principal-profile-research-metric">

      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>

    </div>

  );

};


// ==========================================================
// SIMPLE LIST
// ==========================================================

const SimpleList = ({
  items,
  renderItem,
  emptyText,
}) => {

  if (
    !items ||
    items.length === 0
  ) {

    return (

      <EmptyInline
        text={emptyText}
      />

    );

  }

  return (

    <div className="principal-profile-simple-list">

      {items.map(
        (
          item,
          index
        ) => (

          <div
            className="principal-profile-simple-item"
            key={index}
          >

            <div className="principal-profile-simple-number">

              {String(
                index + 1
              ).padStart(
                2,
                "0"
              )}

            </div>

            <div className="principal-profile-simple-content">

              {renderItem(item)}

            </div>

          </div>

        )
      )}

    </div>

  );

};


// ==========================================================
// TAG LIST
// ==========================================================

const TagList = ({
  items,
  emptyText,
}) => {

  if (
    !items ||
    items.length === 0
  ) {

    return (

      <EmptyInline
        text={emptyText}
      />

    );

  }

  return (

    <div className="principal-profile-tags">

      {items.map(
        (
          item,
          index
        ) => (

          <span
            key={index}
          >
            {typeof item === "string"
              ? item
              : item?.name || "-"}
          </span>

        )
      )}

    </div>

  );

};


// ==========================================================
// TAG GROUP
// ==========================================================

const TagGroup = ({
  title,
  items,
}) => {

  return (

    <div className="principal-profile-tag-group">

      <h4>
        {title}
      </h4>

      <TagList
        items={items}
        emptyText="Not provided"
      />

    </div>

  );

};


// ==========================================================
// EMPTY
// ==========================================================

const EmptyInline = ({
  text,
}) => {

  return (

    <div className="principal-profile-empty-inline">

      {text}

    </div>

  );

};


export default PrincipalProfile;