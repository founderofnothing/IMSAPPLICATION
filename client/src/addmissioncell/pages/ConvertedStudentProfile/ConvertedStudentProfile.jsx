import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../api/axios";

import "./ConvertedStudentProfile.css"

const ConvertedStudentProfile = () => {

  /* ==================================
            STATES
  ================================== */

  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [student, setStudent] =
    useState(null);


  /* ==================================
            FETCH STUDENT
  ================================== */

  const fetchStudent = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          `/students/${id}`
        );

      setStudent(
        response.data.data
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch student."
      );

    } finally {

      setLoading(false);

    }

  };


  /* ==================================
            DATE FORMATTER
  ================================== */

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date)
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

  };


  /* ==================================
            LIFECYCLE
  ================================== */

  useEffect(() => {

    if (id) {
      fetchStudent();
    }

  }, [id]);


  /* ==================================
            LOADING
  ================================== */

  if (loading) {

    return (

      <div className="admissioncell_std_pfp_converted_loading">

        Loading student profile...

      </div>

    );

  }


  /* ==================================
            NO DATA
  ================================== */

  if (!student) {

    return (

      <div className="admissioncell_std_pfp_converted_no-data">

        Student not found.

      </div>

    );

  }


  /* ==================================
            PROFILE DATA
  ================================== */

  const studentName =
    student.studentName ||
    "Unknown Student";


  const studentInitial =
    studentName
      .charAt(0)
      .toUpperCase();


  /* ==================================
            UI
  ================================== */

  return (

    <div className="admissioncell_std_pfp_converted_profile-page">


      {/* ==================================
            PROFILE HEADER
      ================================== */}

      <div className="admissioncell_std_pfp_converted_profile-header">


        {/* COVER */}

        <div className="admissioncell_std_pfp_converted_profile-cover">
        </div>


        {/* PROFILE MAIN */}

        <div className="admissioncell_std_pfp_converted_profile-main">


          {/* PROFILE IMAGE */}

          <div className="admissioncell_std_pfp_converted_profile-image">

            {student.profilePhoto ? (

              <img
                src={student.profilePhoto}
                alt={studentName}
              />

            ) : (

              <span>

                {studentInitial}

              </span>

            )}

          </div>


          {/* PROFILE INFO */}

          <div className="admissioncell_std_pfp_converted_profile-info">

            <h2>

              {studentName}

            </h2>

            <p>

              {student.programmeId?.programmeName ||
                "Student"}

            </p>

            <span>

              {student.applicationNumber ||
                "Application number unavailable"}

            </span>

          </div>


          {/* BACK BUTTON */}

          <button
            className="admissioncell_std_pfp_converted_edit-profile-btn"
            type="button"
            onClick={() =>
              navigate(
                "/admission-cell/Convertion"
              )
            }
          >

            Back to Students

          </button>


        </div>

      </div>



      {/* ==================================
            PROFILE CONTENT
      ================================== */}

      <div className="admissioncell_std_pfp_converted_profile-content">


        {/* ==================================
              QUICK SUMMARY
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_summary-grid">


            <div className="admissioncell_std_pfp_converted_summary-item">

              <small>

                Application No.

              </small>

              <strong>

                {student.applicationNumber || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_summary-item">

              <small>

                Register Number

              </small>

              <strong>

                {student.registerNumber || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_summary-item">

              <small>

                Department

              </small>

              <strong>

                {student.departmentId?.departmentName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_summary-item">

              <small>

                Admission Status

              </small>

              <strong
                className="admissioncell_std_pfp_converted_status-value"
              >

                {student.admissionStatus || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              BASIC INFORMATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Basic Information

              </h3>

              <span>

                Personal details of the student

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Full Name

              </small>

              <strong>

                {student.studentName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Date of Birth

              </small>

              <strong>

                {formatDate(
                  student.dateOfBirth
                )}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Gender

              </small>

              <strong>

                {student.gender || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Blood Group

              </small>

              <strong>

                {student.bloodGroup || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Student Type

              </small>

              <strong>

                {student.studentType || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Academic Year

              </small>

              <strong>

                {student.academicYear || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              ACADEMIC INFORMATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Academic Information

              </h3>

              <span>

                Current academic assignment

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Institution

              </small>

              <strong>

                {student.institutionId?.institutionName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Department

              </small>

              <strong>

                {student.departmentId?.departmentName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Programme

              </small>

              <strong>

                {student.programmeId?.programmeName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Programme Code

              </small>

              <strong>

                {student.programmeId?.programmeCode || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Programme Type

              </small>

              <strong>

                {student.programmeId?.programmeType || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Duration

              </small>

              <strong>

                {student.programmeId?.duration
                  ? `${student.programmeId.duration} Years`
                  : "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Batch

              </small>

              <strong>

                {student.batchId?.batchName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Class

              </small>

              <strong>

                {student.classId
                  ? `${student.classId.year || ""} ${
                      student.classId.section
                        ? `- ${student.classId.section}`
                        : ""
                    }`.trim() || "-"
                  : "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              CONTACT INFORMATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Contact Information

              </h3>

              <span>

                Student and parent contact details

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Student Mobile

              </small>

              <strong>

                {student.studentMobile || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Student Email

              </small>

              <strong>

                {student.studentEmail || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Parent Mobile

              </small>

              <strong>

                {student.parentMobile || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Guardian Name

              </small>

              <strong>

                {student.fatherGuardianName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Guardian Relationship

              </small>

              <strong>

                {student.guardianRelationship || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              ADDRESS INFORMATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Address Information

              </h3>

              <span>

                Communication and permanent address

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item admissioncell_std_pfp_converted_full-width">

              <small>

                Communication Address

              </small>

              <strong>

                {[
                  student.communicationAddress?.addressLine1,
                  student.communicationAddress?.addressLine2,
                  student.communicationAddress?.city,
                  student.communicationAddress?.district,
                  student.communicationAddress?.state,
                  student.communicationAddress?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item admissioncell_std_pfp_converted_full-width">

              <small>

                Permanent Address

              </small>

              <strong>

                {[
                  student.permanentAddress?.addressLine1,
                  student.permanentAddress?.addressLine2,
                  student.permanentAddress?.city,
                  student.permanentAddress?.district,
                  student.permanentAddress?.state,
                  student.permanentAddress?.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              PARENT INFORMATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Parent Information

              </h3>

              <span>

                Parent and guardian information

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Father / Guardian

              </small>

              <strong>

                {student.fatherGuardianName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Guardian Relationship

              </small>

              <strong>

                {student.guardianRelationship || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Mother Name

              </small>

              <strong>

                {student.motherName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Father Occupation

              </small>

              <strong>

                {student.fatherOccupation || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Mother Occupation

              </small>

              <strong>

                {student.motherOccupation || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              PREVIOUS EDUCATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Previous Education

              </h3>

              <span>

                Previous academic qualification details

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                HSC School

              </small>

              <strong>

                {student.hscSchoolName || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Last School Place

              </small>

              <strong>

                {student.lastSchoolPlace || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                HSC Exam Month

              </small>

              <strong>

                {student.hscExamMonth || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                HSC Exam Year

              </small>

              <strong>

                {student.hscExamYear || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Medium of Instruction

              </small>

              <strong>

                {student.mediumOfInstruction || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                HSC Total Mark

              </small>

              <strong>

                {student.hscTotalMark || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              FACILITIES
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Facilities

              </h3>

              <span>

                Student facility requirements

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Hostel

              </small>

              <strong>

                {student.hostelRequired
                  ? "Required"
                  : "Not Required"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Transport

              </small>

              <strong>

                {student.transportRequired
                  ? "Required"
                  : "Not Required"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Scholarship

              </small>

              <strong>

                {student.scholarshipHolder
                  ? "Yes"
                  : "No"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Special Category

              </small>

              <strong>

                {student.specialCategory?.length
                  ? student.specialCategory.join(", ")
                  : "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              ADMISSION INFORMATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Admission Information

              </h3>

              <span>

                Current admission status

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Admission Status

              </small>

              <strong
                className="admissioncell_std_pfp_converted_status-value"
              >

                {student.admissionStatus || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Application Number

              </small>

              <strong>

                {student.applicationNumber || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Register Number

              </small>

              <strong>

                {student.registerNumber || "-"}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Student Type

              </small>

              <strong>

                {student.studentType || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              RECORD INFORMATION
        ================================== */}

        <section className="admissioncell_std_pfp_converted_profile-card">


          <div className="admissioncell_std_pfp_converted_section-heading">

            <div>

              <h3>

                Record Information

              </h3>

              <span>

                Student record timestamps

              </span>

            </div>

          </div>


          <div className="admissioncell_std_pfp_converted_info-grid">


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Created At

              </small>

              <strong>

                {formatDate(
                  student.createdAt
                )}

              </strong>

            </div>


            <div className="admissioncell_std_pfp_converted_info-item">

              <small>

                Updated At

              </small>

              <strong>

                {formatDate(
                  student.updatedAt
                )}

              </strong>

            </div>


          </div>

        </section>


      </div>

    </div>

  );

};

export default ConvertedStudentProfile;