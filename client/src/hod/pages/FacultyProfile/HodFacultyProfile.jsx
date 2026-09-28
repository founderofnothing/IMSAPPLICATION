    import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api/axios";

import {
  ArrowLeftIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  GraduationCapIcon,
  BookOpenTextIcon,
  FlaskIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

import "./HodFacultyProfile.css";


const HodFacultyProfile = () => {

  const { id } = useParams();

const navigate = useNavigate();

const API_BASE_URL = import.meta.env.VITE_API_URL;

const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const getProfileImageUrl = (image) => {
  if (!image) return "/default-profile.png";

  // Already an absolute URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  // Backend stores /uploads/...
  return `${SERVER_URL}${image}`;
};

  // =========================================================
  // STATE
  // =========================================================

  const [faculty, setFaculty] = useState(null);

  const [loading, setLoading] = useState(true);

const [showTimetable, setShowTimetable] = useState(false);
const [facultyTimetable, setFacultyTimetable] = useState(null);
const [timetableLoading, setTimetableLoading] = useState(false);
  // =========================================================
  // FETCH FACULTY
  // =========================================================

  const fetchFacultyProfile = async () => {

    try {

      setLoading(true);

      const response = await API.get(
        `/users/${id}`
      );

      setFaculty(
        response.data.data
      );

    } catch (error) {

      console.error(
        "Fetch faculty profile error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch faculty profile."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
// FETCH FACULTY TIMETABLE
// =========================================================

const fetchFacultyTimetable = async () => {

  try {

    setTimetableLoading(true);

    const response = await API.get(
      `/timetable/faculty/${id}`
    );

    setFacultyTimetable(
      response.data.data
    );

    setShowTimetable(true);

  } catch (error) {

    console.error(
      "Fetch faculty timetable error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch faculty timetable."
    );

  } finally {

    setTimetableLoading(false);

  }

};

  // =========================================================
  // FETCH ON ID CHANGE
  // =========================================================

  useEffect(() => {

    if (id) {
      fetchFacultyProfile();
    }

  }, [id]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="hod_faculty_profile_page">

        <div className="hod_faculty_profile_loading">

          Loading faculty profile...

        </div>

      </div>

    );

  }


  // =========================================================
  // NO DATA
  // =========================================================

  if (!faculty) {

    return (

      <div className="hod_faculty_profile_page">

        <div className="hod_faculty_profile_empty">

          <h3>
            Faculty profile not found
          </h3>

          <button
            onClick={() =>
              navigate(
                "/hod/department-faculty"
              )
            }
          >
            Back to Faculty
          </button>

        </div>

      </div>

    );

  }


  const profile = faculty.profile || {};


  // =========================================================
  // HELPERS
  // =========================================================

  const formatText = (value) => {

    if (!value) {
      return "Not provided";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );

  };


  const formatDate = (value) => {

    if (!value) {
      return "Not provided";
    }

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="hod_faculty_profile_page">


      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="hod_faculty_profile_topbar">

        <button
          className="hod_faculty_back_button"
          onClick={() =>
            navigate(
              "/hod/department-faculty"
            )
          }
        >

          <ArrowLeftIcon />

          <span>
            Back to Faculty
          </span>

        </button>

      </div>


      {/* =====================================================
          PROFILE HEADER
      ===================================================== */}

      <section className="hod_faculty_profile_header">


        <div className="hod_faculty_profile_header_left">


          <div className="hod_faculty_profile_avatar">

{faculty.profileImage ? (

  <img
    src={getProfileImageUrl(faculty.profileImage)}
    alt={faculty.fullName}
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/default-profile.png";
    }}
  />

) : (

  <div className="hod_faculty_profile_avatar_fallback">

    {faculty.fullName
      ?.charAt(0)
      ?.toUpperCase()}

  </div>

)}

          </div>


          <div className="hod_faculty_profile_identity">

            <h1>
              {faculty.fullName}
            </h1>

            <p>
              {formatText(profile.designation)}
            </p>

            <span>
              Employee ID: {profile.employeeId || "N/A"}
            </span>

          </div>


        </div>


<div className="hod_faculty_profile_status">

  <span>
    Teaching Faculty
  </span>

  <button
    type="button"
    className="hod_faculty_view_timetable_btn"
    onClick={fetchFacultyTimetable}
    disabled={timetableLoading}
  >
    {timetableLoading
      ? "Loading..."
      : "View Work Timetable"}
  </button>

</div>


      </section>


      {/* =====================================================
          CONTACT INFORMATION
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <UsersThreeIcon />

          </div>

          <div>

            <h2>
              Contact Information
            </h2>

            <p>
              Basic contact and personal information
            </p>

          </div>

        </div>


        <div className="hod_faculty_info_grid">


          <div className="hod_faculty_info_item">

            <span>Email</span>

            <strong>
              {faculty.email || "Not provided"}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>Phone</span>

            <strong>
              {faculty.phone || "Not provided"}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>Gender</span>

            <strong>
              {formatText(profile.gender)}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>Date of Birth</span>

            <strong>
              {formatDate(profile.dateOfBirth)}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>Marital Status</span>

            <strong>
              {formatText(profile.maritalStatus)}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>Blood Group</span>

            <strong>
              {profile.bloodGroup || "Not provided"}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          ORGANIZATION
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <BriefcaseIcon />

          </div>

          <div>

            <h2>
              Employment & Organization
            </h2>

            <p>
              Faculty employment information
            </p>

          </div>

        </div>


        <div className="hod_faculty_info_grid">


          <div className="hod_faculty_info_item">

            <span>
              Employee ID
            </span>

            <strong>
              {profile.employeeId || "Not provided"}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>
              Designation
            </span>

            <strong>
              {formatText(profile.designation)}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>
              Faculty Type
            </span>

            <strong>
              Teaching Faculty
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>
              Role
            </span>

            <strong>
              {formatText(faculty.role)}
            </strong>

          </div>

        </div>

      </section>


      {/* =====================================================
          ACADEMIC QUALIFICATIONS
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <GraduationCapIcon />

          </div>

          <div>

            <h2>
              Academic Qualifications
            </h2>

            <p>
              Educational background
            </p>

          </div>

        </div>


        {profile.academicQualifications?.length ? (

          <div className="hod_faculty_qualification_list">

            {profile.academicQualifications.map(
              (qualification, index) => (

                <div
                  className="hod_faculty_qualification_item"
                  key={index}
                >

                  <div>

                    <h3>
                      {qualification.degree}
                    </h3>

                    <p>
                      {qualification.specialization}
                    </p>

                  </div>

                  <div>

                    <span>
                      University
                    </span>

                    <strong>
                      {qualification.university}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Year
                    </span>

                    <strong>
                      {qualification.yearOfPassing}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Percentage / CGPA
                    </span>

                    <strong>
                      {qualification.percentageOrCGPA}
                    </strong>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="hod_faculty_no_information">
            No academic qualifications available.
          </div>

        )}

      </section>


      {/* =====================================================
          PHD
      ===================================================== */}

      {profile.phd && (
        <section className="hod_faculty_profile_card">

          <div className="hod_faculty_profile_section_heading">

            <div className="hod_faculty_section_icon">

              <BookOpenTextIcon />

            </div>

            <div>

              <h2>
                PhD
              </h2>

              <p>
                Doctoral qualification
              </p>

            </div>

          </div>


          <div className="hod_faculty_info_grid">

            <div className="hod_faculty_info_item">

              <span>
                Thesis Title
              </span>

              <strong>
                {profile.phd.thesisTitle || "Not provided"}
              </strong>

            </div>

            <div className="hod_faculty_info_item">

              <span>
                University
              </span>

              <strong>
                {profile.phd.university || "Not provided"}
              </strong>

            </div>

            <div className="hod_faculty_info_item">

              <span>
                Award Date
              </span>

              <strong>
                {formatDate(profile.phd.awardDate)}
              </strong>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          EXPERIENCE
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <BriefcaseIcon />

          </div>

          <div>

            <h2>
              Teaching Experience
            </h2>

            <p>
              Professional teaching experience
            </p>

          </div>

        </div>


        <div className="hod_faculty_experience_summary">

          <div>

            <span>
              Teaching Experience
            </span>

            <strong>

              {profile.totalTeachingExperience?.years || 0}
              {" "}Years{" "}

              {profile.totalTeachingExperience?.months || 0}
              {" "}Months

            </strong>

          </div>


          <div>

            <span>
              Research Experience
            </span>

            <strong>

              {profile.totalResearchExperience?.years || 0}
              {" "}Years{" "}

              {profile.totalResearchExperience?.months || 0}
              {" "}Months

            </strong>

          </div>

        </div>


        {profile.teachingExperience?.length ? (

          <div className="hod_faculty_experience_list">

            {profile.teachingExperience.map(
              (experience, index) => (

                <div
                  className="hod_faculty_experience_item"
                  key={index}
                >

                  <div>

                    <h3>
                      {experience.institutionName}
                    </h3>

                    <p>
                      {experience.designation}
                    </p>

                  </div>

                  <div>

                    <span>
                      From
                    </span>

                    <strong>
                      {formatDate(experience.fromDate)}
                    </strong>

                  </div>

                  <div>

                    <span>
                      To
                    </span>

                    <strong>
                      {experience.toDate
                        ? formatDate(experience.toDate)
                        : "Present"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Level
                    </span>

                    <strong>
                      {experience.level || "UG"}
                    </strong>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="hod_faculty_no_information">
            No teaching experience available.
          </div>

        )}

      </section>


      {/* =====================================================
          RESEARCH
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <FlaskIcon />

          </div>

          <div>

            <h2>
              Research & Publications
            </h2>

            <p>
              Research profile and academic contributions
            </p>

          </div>

        </div>


        <div className="hod_faculty_research_stats">

          <div>

            <span>
              Publications
            </span>

            <strong>
              {profile.publicationSummary?.totalPublications || 0}
            </strong>

          </div>


          <div>

            <span>
              H-Index
            </span>

            <strong>
              {profile.publicationSummary?.hIndex || 0}
            </strong>

          </div>


          <div>

            <span>
              Citations
            </span>

            <strong>
              {profile.publicationSummary?.totalCitations || 0}
            </strong>

          </div>

        </div>


        {profile.researchAreas?.length > 0 && (

          <div className="hod_faculty_tag_section">

            <span>
              Research Areas
            </span>

            <div>

              {profile.researchAreas.map(
                (area, index) => (

                  <span
                    className="hod_faculty_tag"
                    key={index}
                  >
                    {area}
                  </span>

                )
              )}

            </div>

          </div>

        )}

      </section>


      {/* =====================================================
          SUBJECTS & SKILLS
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <BookOpenTextIcon />

          </div>

          <div>

            <h2>
              Teaching & Skills
            </h2>

            <p>
              Subjects, skills and languages
            </p>

          </div>

        </div>


        <div className="hod_faculty_tag_section">

          <span>
            Subjects Taught
          </span>

          <div>

            {profile.subjectsTaught?.length ? (

              profile.subjectsTaught.map(
                (subject, index) => (

                  <span
                    className="hod_faculty_tag"
                    key={index}
                  >
                    {subject}
                  </span>

                )
              )

            ) : (

              <small>
                No subjects provided
              </small>

            )}

          </div>

        </div>


        <div className="hod_faculty_tag_section">

          <span>
            Technical Skills
          </span>

          <div>

            {profile.technicalSkills?.length ? (

              profile.technicalSkills.map(
                (skill, index) => (

                  <span
                    className="hod_faculty_tag"
                    key={index}
                  >
                    {skill}
                  </span>

                )
              )

            ) : (

              <small>
                No technical skills provided
              </small>

            )}

          </div>

        </div>


        <div className="hod_faculty_tag_section">

          <span>
            Languages Known
          </span>

          <div>

            {profile.languagesKnown?.length ? (

              profile.languagesKnown.map(
                (language, index) => (

                  <span
                    className="hod_faculty_tag"
                    key={index}
                  >
                    {language}
                  </span>

                )
              )

            ) : (

              <small>
                No languages provided
              </small>

            )}

          </div>

        </div>

      </section>


      {/* =====================================================
          ADDRESS
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <MapPinIcon />

          </div>

          <div>

            <h2>
              Address
            </h2>

            <p>
              Communication and permanent address
            </p>

          </div>

        </div>


        <div className="hod_faculty_address_grid">


          <div className="hod_faculty_address_item">

            <span>
              Communication Address
            </span>

            <p>

              {profile.communicationAddress?.addressLine1}
              <br />

              {profile.communicationAddress?.addressLine2 &&
                <>
                  {profile.communicationAddress.addressLine2}
                  <br />
                </>
              }

              {profile.communicationAddress?.city}
              {" "}

              {profile.communicationAddress?.district}
              <br />

              {profile.communicationAddress?.state}
              {" - "}

              {profile.communicationAddress?.pincode}

            </p>

          </div>


          <div className="hod_faculty_address_item">

            <span>
              Permanent Address
            </span>

            <p>

              {profile.permanentAddress?.addressLine1}
              <br />

              {profile.permanentAddress?.addressLine2 &&
                <>
                  {profile.permanentAddress.addressLine2}
                  <br />
                </>
              }

              {profile.permanentAddress?.city}
              {" "}

              {profile.permanentAddress?.district}
              <br />

              {profile.permanentAddress?.state}
              {" - "}

              {profile.permanentAddress?.pincode}

            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          EMERGENCY CONTACT
      ===================================================== */}

      <section className="hod_faculty_profile_card">

        <div className="hod_faculty_profile_section_heading">

          <div className="hod_faculty_section_icon">

            <PhoneIcon />

          </div>

          <div>

            <h2>
              Emergency Contact
            </h2>

            <p>
              Emergency contact information
            </p>

          </div>

        </div>


        <div className="hod_faculty_info_grid">

          <div className="hod_faculty_info_item">

            <span>
              Name
            </span>

            <strong>
              {profile.emergencyContact?.name ||
                "Not provided"}
            </strong>

          </div>


          <div className="hod_faculty_info_item">

            <span>
              Phone
            </span>

            <strong>
              {profile.emergencyContact?.phone ||
                "Not provided"}
            </strong>

          </div>

        </div>

      </section>


{/* =====================================================
    FACULTY WORK TIMETABLE
===================================================== */}
{/* =====================================================
    FACULTY WORK TIMETABLE MODAL
===================================================== */}

{showTimetable && facultyTimetable && (

  <div
    className="ims_modal_overlay"
    onMouseDown={(e) => {

      if (
        e.target === e.currentTarget
      ) {
        setShowTimetable(false);
      }

    }}
  >

    <div className="ims_modal">

      {/* =================================================
          MODAL HEADER
      ================================================= */}

      <div className="ims_modal_header">

        <div className="ims_modal_header_content">

          <span className="ims_modal_eyebrow">
            FACULTY WORK SCHEDULE
          </span>

          <h2>
            Work Timetable
          </h2>

          <p>
            Weekly teaching schedule and working hours
            for this faculty member.
          </p>

        </div>


        <button
          type="button"
          className="ims_modal_close"
          onClick={() =>
            setShowTimetable(false)
          }
          aria-label="Close timetable"
        >
          ×
        </button>

      </div>


      {/* =================================================
          MODAL BODY
      ================================================= */}

      <div className="ims_modal_body">


        {/* ===============================================
            FACULTY PROFILE
        =============================================== */}

        <div className="ims_timetable_faculty">

          <div className="ims_timetable_avatar">

{faculty.profileImage ? (

  <img
    src={getProfileImageUrl(faculty.profileImage)}
    alt={faculty.fullName}
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = "/default-profile.png";
    }}
  />

) : (

  faculty.fullName
    ?.charAt(0)
    ?.toUpperCase()

)}

          </div>


          <div className="ims_timetable_faculty_info">

            <h3>
              {faculty.fullName}
            </h3>

            <p>
              {formatText(
                profile.designation
              )}
            </p>

            <span>
              Employee ID:{" "}
              {profile.employeeId || "N/A"}
            </span>

          </div>

        </div>


        {/* ===============================================
            WEEKLY TIMETABLE
        =============================================== */}

        <div className="ims_timetable_heading">

          <div>

            <span>
              WEEKLY SCHEDULE
            </span>

            <h3>
              Faculty Working Hours
            </h3>

          </div>

          <div className="ims_timetable_count">

            {Object.values(
              facultyTimetable.timetable || {}
            ).reduce(
              (total, periods) =>
                total + periods.filter(
                  (period) =>
                    period.type === "Teaching"
                ).length,
              0
            )}

            <span>
              Teaching Hours
            </span>

          </div>

        </div>


        {/* ===============================================
            DAYS
        =============================================== */}

        <div className="ims_timetable_days">

          {Object.entries(
            facultyTimetable.timetable || {}
          ).map(
            ([day, periods]) => (

              <div
                className="ims_timetable_day"
                key={day}
              >

                {/* DAY HEADER */}

                <div className="ims_timetable_day_header">

                  <strong>
                    {day}
                  </strong>

                  <span>
                    {periods.filter(
                      (period) =>
                        period.type === "Teaching"
                    ).length}{" "}

                    Teaching
                  </span>

                </div>


                {/* PERIODS */}

                <div className="ims_timetable_periods">

                  {periods.length === 0 ? (

                    <div className="ims_timetable_empty">

                      No timetable configured.

                    </div>

                  ) : (

                    periods.map(
                      (period, index) => (

                        <div
                          className={`ims_timetable_period ${
                            period.type === "Teaching"
                              ? "is-teaching"
                              : period.type === "Break"
                              ? "is-break"
                              : period.type === "Lunch"
                              ? "is-lunch"
                              : "is-free"
                          }`}
                          key={`${day}-${period.periodNumber}-${index}`}
                        >

                          {/* PERIOD NUMBER */}

                          <div className="ims_timetable_period_number">

                            <span>
                              HOUR
                            </span>

                            <strong>
                              {period.periodNumber}
                            </strong>

                          </div>


                          {/* TEACHING */}

                          {period.type === "Teaching" ? (

                            <div className="ims_timetable_teaching_content">

                              <div className="ims_timetable_subject">

                                <span>
                                  SUBJECT
                                </span>

                                <strong>
                                  {period.subject?.subjectName ||
                                    "Subject"}
                                </strong>

                                {period.subject?.subjectCode && (

                                  <small>
                                    {period.subject.subjectCode}
                                  </small>

                                )}

                              </div>


                              <div className="ims_timetable_class">

                                <span>
                                  CLASS
                                </span>

                                <strong>

                                  {period.class?.programme?.programmeName ||
                                    "Class"}

                                </strong>

                                {period.class?.section && (

                                  <small>
                                    Section{" "}
                                    {period.class.section}
                                  </small>

                                )}

                              </div>


                              <div className="ims_timetable_semester">

                                Semester{" "}
                                {period.currentSemester || "—"}

                              </div>

                            </div>

                          ) : (

                            /* BREAK / LUNCH / FREE */

                            <div className="ims_timetable_special">

                              <span
                                className="ims_timetable_special_badge"
                              >
                                {period.type}
                              </span>

                              {period.type === "Free" && (

                                <small>
                                  No teaching assigned
                                </small>

                              )}

                            </div>

                          )}

                        </div>

                      )
                    )

                  )}

                </div>

              </div>

            )
          )}

        </div>

      </div>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="ims_modal_footer">

        <button
          type="button"
          className="ims_modal_secondary_btn"
          onClick={() =>
            setShowTimetable(false)
          }
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}

    </div>

  );

};


export default HodFacultyProfile;