import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./StudentFeeDetails.css";

const StudentFeeDetails = () => {

  // ==================== ROUTER ====================

  const navigate = useNavigate();

  const { studentId } =
    useParams();

  const [searchParams] =
    useSearchParams();

  const academicYear =
    searchParams.get("academicYear") || "";


  // ==================== STATE ====================

  const [studentFee, setStudentFee] =
    useState(null);

  const [loading, setLoading] =
    useState(false);


    const [paymentHistory, setPaymentHistory] = useState(null);

const [paymentHistoryLoading, setPaymentHistoryLoading] =
  useState(false);

  // ==================== FETCH STUDENT FEE ====================

  const fetchStudentFeeDetails = async () => {

    if (!studentId) {
      toast.error(
        "Student ID not found."
      );
      return;
    }

    if (!academicYear) {
      toast.error(
        "Academic year not found."
      );
      return;
    }

    try {

      setLoading(true);

      const response =
        await API.get(
          `/fees-allocation/allocation/student/${studentId}`,
          {
            params: {
              academicYear,
            },
          }
        );

      setStudentFee(
        response.data?.data || null
      );

    } catch (error) {

      setStudentFee(null);

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch student fee details."
      );

    } finally {

      setLoading(false);

    }
  };

  // ==================== FETCH PAYMENT HISTORY ====================

const fetchPaymentHistory = async () => {
  if (!studentId || !academicYear) {
    return;
  }

  try {
    setPaymentHistoryLoading(true);

    const response = await API.get(
      `/fees-allocation/payment/student/${studentId}`,
      {
        params: {
          academicYear,
        },
      }
    );

    setPaymentHistory(
      response.data || null
    );

  } catch (error) {
    setPaymentHistory(null);

    console.log(
      "Payment history:",
      error.response?.data?.message ||
        "Failed to fetch payment history."
    );

  } finally {
    setPaymentHistoryLoading(false);
  }
};

  // ==================== INITIAL FETCH ====================

useEffect(() => {

  fetchStudentFeeDetails();
  fetchPaymentHistory();

}, [studentId, academicYear]);


  // ==================== LOADING ====================

  if (loading) {
    return (
      <div className="student-fee-details-page">
        <p>
          Loading student fee details...
        </p>
      </div>
    );
  }


  // ==================== NOT FOUND ====================

  if (!studentFee) {
    return (
      <div className="student-fee-details-page">

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
        >
          Back
        </button>

        <p>
          Student fee details not found.
        </p>

      </div>
    );
  }


  return (

    <div className="student-fee-details-page">

      {/* ==================== HEADER ==================== */}

      <div className="student-fee-details-header">

        <div>

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
          >
            Back
          </button>

          <h1>
            Student Fee Details
          </h1>

          <p>
            View fee allocation and payment
            information for this student.
          </p>

        </div>

      </div>


      {/* ==================== STUDENT DETAILS ==================== */}

      <div className="student-fee-profile">

        <div>
          <span>
            Register Number
          </span>

          <strong>
            {studentFee.registerNumber || "-"}
          </strong>
        </div>


        <div>
          <span>
            Student Name
          </span>

          <strong>
            {studentFee.studentName || "-"}
          </strong>
        </div>


        <div>
          <span>
            Email
          </span>

          <strong>
            {studentFee.studentEmail || "-"}
          </strong>
        </div>


        <div>
          <span>
            Academic Year
          </span>

          <strong>
            {studentFee.academicYear || "-"}
          </strong>
        </div>


        <div>
          <span>
            Status
          </span>

          <strong>
            {studentFee.status || "-"}
          </strong>
        </div>

      </div>


      {/* ==================== FEE SUMMARY ==================== */}

      <div className="student-fee-summary">

        <div className="student-fee-stat">

          <span>
            Total Fee
          </span>

          <strong>
            ₹{Number(
              studentFee.totalAmount || 0
            ).toLocaleString("en-IN")}
          </strong>

        </div>


        <div className="student-fee-stat">

          <span>
            Paid
          </span>

          <strong>
            ₹{Number(
              studentFee.paidAmount || 0
            ).toLocaleString("en-IN")}
          </strong>

        </div>


        <div className="student-fee-stat">

          <span>
            Pending
          </span>

          <strong>
            ₹{Number(
              studentFee.pendingAmount || 0
            ).toLocaleString("en-IN")}
          </strong>

        </div>

      </div>


      {/* ==================== FEE ITEMS ==================== */}

      {/* <div className="student-fee-items">

        <h2>
          Fee Details
        </h2>


        {studentFee.feeItems?.length > 0 ? (

          <table className="student-fee-items-table">

            <thead>

              <tr>
                <th>#</th>
                <th>Fee Item</th>
                <th>Amount</th>
              </tr>

            </thead>


            <tbody>

              {studentFee.feeItems.map(
                (item, index) => (

                  <tr
                    key={
                      item._id ||
                      `${item.title}-${index}`
                    }
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {item.title || "-"}
                    </td>

                    <td>
                      ₹{Number(
                        item.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        ) : (

          <p>
            No fee items found.
          </p>

        )}

      </div> */}

      {/* ==================== PAYMENT HISTORY ==================== */}

<div className="student-payment-history">

  <div className="student-payment-history-header">

    <div>
      <h2>
        Payment History
      </h2>

      <p>
        Previous payments made against this fee allocation.
      </p>
    </div>

    <span className="student-payment-count">
      {paymentHistory?.totalPayments || 0} Payments
    </span>

  </div>


  {paymentHistoryLoading ? (

    <p>
      Loading payment history...
    </p>

  ) : paymentHistory?.data?.length > 0 ? (

    <table className="student-payment-history-table">

      <thead>

        <tr>
          <th>#</th>
          <th>Receipt Number</th>
          <th>Date</th>
          <th>Amount</th>
          <th>Payment Mode</th>
          <th>Received By</th>
        </tr>

      </thead>

      <tbody>

        {paymentHistory.data.map(
          (payment, index) => (

            <tr key={payment.paymentId}>

              <td>
                {index + 1}
              </td>

              <td>
                {payment.receiptNumber || "-"}
              </td>

              <td>
                {payment.paidAt
                  ? new Date(
                      payment.paidAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "-"}
              </td>

              <td>
                ₹{Number(
                  payment.amount || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </td>

              <td>
                {payment.paymentMode || "-"}
              </td>

              <td>
                {payment.receivedBy || "-"}
              </td>

            </tr>

          )
        )}

      </tbody>

    </table>

  ) : (

    <p>
      No payment history found.
    </p>

  )}

</div>

    </div>

  );
};

export default StudentFeeDetails;