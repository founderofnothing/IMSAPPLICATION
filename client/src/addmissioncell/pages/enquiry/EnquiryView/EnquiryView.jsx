import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../../../api/axios.js";
import "./EnquiryView.css"

const EnquiryView = () => {

  /* ==================================
            STATES
  ================================== */

  const { id } = useParams();

  const [loading, setLoading] =
    useState(false);

  const [enquiry, setEnquiry] =
    useState(null);


  /* ==================================
            FETCH ENQUIRY
  ================================== */

  const fetchEnquiry = async () => {

    try {

      setLoading(true);

      const response =
        await API.get(
          `/enquiry/${id}`
        );

      setEnquiry(
        response.data.data
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch enquiry."
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

    return date.split("T")[0];

  };


  /* ==================================
            LIFECYCLE
  ================================== */

  useEffect(() => {

    fetchEnquiry();

  }, []);


  /* ==================================
            LOADING
  ================================== */

  if (loading) {

    return (

      <div className="admissioncell_enquiery_pfp_loading">

        Loading...

      </div>

    );

  }


  /* ==================================
            NO DATA
  ================================== */

  if (!enquiry) {

    return (

      <div className="admissioncell_enquiery_pfp_no-data">

        No enquiry found.

      </div>

    );

  }


  /* ==================================
            PROFILE DATA
  ================================== */

  const studentName =
    enquiry.studentName || "Unknown Student";

  const studentInitial =
    studentName
      .charAt(0)
      .toUpperCase();


  /* ==================================
            UI
  ================================== */

  return (

    <div className="admissioncell_enquiery_pfp_profile-page">


      {/* ==================================
            PROFILE HEADER
      ================================== */}

      <div className="admissioncell_enquiery_pfp_profile-header">

        {/* COVER */}

        <div className="admissioncell_enquiery_pfp_profile-cover">
        </div>


        {/* PROFILE MAIN */}

        <div className="admissioncell_enquiery_pfp_profile-main">


          {/* PROFILE IMAGE */}

          <div className="admissioncell_enquiery_pfp_profile-image">

            <span>

              {studentInitial}

            </span>

          </div>


          {/* PROFILE INFO */}

          <div className="admissioncell_enquiery_pfp_profile-info">

            <h2>

              {studentName}

            </h2>

            <p>

              {enquiry.programmeId?.programmeName ||
                "Admission Enquiry"}

            </p>

            <span>

              {enquiry.departmentId?.departmentName ||
                "Department Not Available"}

            </span>

          </div>


          {/* ACTION */}

          <button
            className="admissioncell_enquiery_pfp_edit-profile-btn"
            type="button"
          >

            Enquiry Details

          </button>

        </div>

      </div>



      {/* ==================================
            PROFILE CONTENT
      ================================== */}

      <div className="admissioncell_enquiery_pfp_profile-content">


        {/* ==================================
              QUICK SUMMARY
        ================================== */}

        <section className="admissioncell_enquiery_pfp_profile-card">


          <div className="admissioncell_enquiery_pfp_summary-grid">


            <div className="admissioncell_enquiery_pfp_summary-item">

              <small>

                Status

              </small>

              <strong
                className="admissioncell_enquiery_pfp_status-value"
              >

                {enquiry.status || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_summary-item">

              <small>

                Programme

              </small>

              <strong>

                {enquiry.programmeId?.programmeName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_summary-item">

              <small>

                Department

              </small>

              <strong>

                {enquiry.departmentId?.departmentName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_summary-item">

              <small>

                Enquiry Source

              </small>

              <strong>

                {enquiry.enquirySource || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              BASIC INFORMATION
        ================================== */}

        <section className="admissioncell_enquiery_pfp_profile-card">


          <div className="admissioncell_enquiery_pfp_section-heading">

            <div>

              <h3>

                Basic Information

              </h3>

              <span>

                Personal details of the applicant

              </span>

            </div>

          </div>


          <div className="admissioncell_enquiery_pfp_info-grid">


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Full Name

              </small>

              <strong>

                {enquiry.studentName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Date of Birth

              </small>

              <strong>

                {formatDate(
                  enquiry.dateOfBirth
                )}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Gender

              </small>

              <strong>

                {enquiry.gender || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Student Mobile

              </small>

              <strong>

                {enquiry.studentMobile || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Student Email

              </small>

              <strong>

                {enquiry.studentEmail || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              ACADEMIC INFORMATION
        ================================== */}

        <section className="admissioncell_enquiery_pfp_profile-card">


          <div className="admissioncell_enquiery_pfp_section-heading">

            <div>

              <h3>

                Academic Information

              </h3>

              <span>

                Programme and institutional preference

              </span>

            </div>

          </div>


          <div className="admissioncell_enquiery_pfp_info-grid">


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Department

              </small>

              <strong>

                {enquiry.departmentId?.departmentName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Programme

              </small>

              <strong>

                {enquiry.programmeId?.programmeName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Enquiry Source

              </small>

              <strong>

                {enquiry.enquirySource || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              CONTACT INFORMATION
        ================================== */}

        <section className="admissioncell_enquiery_pfp_profile-card">


          <div className="admissioncell_enquiery_pfp_section-heading">

            <div>

              <h3>

                Contact Information

              </h3>

              <span>

                Student and parent contact details

              </span>

            </div>

          </div>


          <div className="admissioncell_enquiery_pfp_info-grid">


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Student Mobile

              </small>

              <strong>

                {enquiry.studentMobile || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Student Email

              </small>

              <strong>

                {enquiry.studentEmail || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Parent Name

              </small>

              <strong>

                {enquiry.parentName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Parent Mobile

              </small>

              <strong>

                {enquiry.parentMobile || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item admissioncell_enquiery_pfp_full-width">

              <small>

                Address

              </small>

              <strong>

                {enquiry.address || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              ENQUIRY INFORMATION
        ================================== */}

        <section className="admissioncell_enquiery_pfp_profile-card">


          <div className="admissioncell_enquiery_pfp_section-heading">

            <div>

              <h3>

                Enquiry Information

              </h3>

              <span>

                Enquiry status and follow-up details

              </span>

            </div>

          </div>


          <div className="admissioncell_enquiery_pfp_info-grid">


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Status

              </small>

              <strong
                className="admissioncell_enquiery_pfp_status-value"
              >

                {enquiry.status || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Source

              </small>

              <strong>

                {enquiry.enquirySource || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Follow Up Date

              </small>

              <strong>

                {formatDate(
                  enquiry.followUpDate
                )}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item admissioncell_enquiery_pfp_full-width">

              <small>

                Remarks

              </small>

              <strong>

                {enquiry.remarks || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              CONVERSION INFORMATION
        ================================== */}

        <section className="admissioncell_enquiery_pfp_profile-card">


          <div className="admissioncell_enquiery_pfp_section-heading">

            <div>

              <h3>

                Conversion Information

              </h3>

              <span>

                Admission conversion details

              </span>

            </div>

          </div>


          <div className="admissioncell_enquiery_pfp_info-grid">


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Converted By

              </small>

              <strong>

                {enquiry.convertedBy?.fullName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Converted At

              </small>

              <strong>

                {formatDate(
                  enquiry.convertedAt
                )}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Student ID

              </small>

              <strong>

                {enquiry.studentId || "-"}

              </strong>

            </div>


          </div>

        </section>



        {/* ==================================
              AUDIT INFORMATION
        ================================== */}

        <section className="admissioncell_enquiery_pfp_profile-card">


          <div className="admissioncell_enquiery_pfp_section-heading">

            <div>

              <h3>

                Audit Information

              </h3>

              <span>

                Record creation and modification details

              </span>

            </div>

          </div>


          <div className="admissioncell_enquiery_pfp_info-grid">


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Created By

              </small>

              <strong>

                {enquiry.createdBy?.fullName || "-"}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Created At

              </small>

              <strong>

                {formatDate(
                  enquiry.createdAt
                )}

              </strong>

            </div>


            <div className="admissioncell_enquiery_pfp_info-item">

              <small>

                Updated At

              </small>

              <strong>

                {formatDate(
                  enquiry.updatedAt
                )}

              </strong>

            </div>


          </div>

        </section>


      </div>

    </div>

  );

};

export default EnquiryView;