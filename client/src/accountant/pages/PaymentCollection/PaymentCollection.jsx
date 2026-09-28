import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";
// import "./PaymentCollection.css";

import "./PaymentCollection.css"

const PaymentCollection = () => {

  // ==================== DROPDOWN DATA ====================

  const [institutions, setInstitutions] =
    useState([]);


  // ==================== SEARCH ====================

  const [selectedInstitution, setSelectedInstitution] =
    useState("");

  const [registerNumber, setRegisterNumber] =
    useState("");

  const [academicYear, setAcademicYear] =
    useState("");


  // ==================== STUDENT ====================

  const [studentFee, setStudentFee] =
    useState(null);


  // ==================== PAYMENT ====================

  const [paymentData, setPaymentData] =
    useState({

      amount: "",

      paymentMode: "Cash",

      remarks: "",

    });


  // ==================== LOADING ====================

  const [loading, setLoading] =
    useState(false);

  const [paymentLoading, setPaymentLoading] =
    useState(false);

    // ==================== RECEIPT ====================

const [showReceiptModal, setShowReceiptModal] =
  useState(false);

const [receiptData, setReceiptData] =
  useState(null);

  // fetchInstitutions()
// ==================== FETCH INSTITUTIONS ====================

const fetchInstitutions = async () => {

  try {

    const response =
      await API.get(
        "/institutions"
      );

    setInstitutions(
      response.data?.data || []
    );

  } catch (error) {

    setInstitutions([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch institutions."
    );

  }

};  
  // handleSearchStudent()
// ==================== FIND STUDENT ====================

const handleSearchStudent = async () => {

  if (!selectedInstitution) {
    toast.error(
      "Please select an institution."
    );
    return;
  }

  if (!registerNumber.trim()) {
    toast.error(
      "Please enter a register number."
    );
    return;
  }

  if (!academicYear.trim()) {
    toast.error(
      "Please enter an academic year."
    );
    return;
  }

  try {

    setLoading(true);

    const response =
      await API.get(
        "/fees-allocation/payment/search",
        {
          params: {

            institutionId:
              selectedInstitution,

            registerNumber,

            academicYear,

          },
        }
      );

    setStudentFee(
      response.data?.data || null
    );
    console.log(setStudentFee)

  } catch (error) {

    setStudentFee(null);

    toast.error(
      error.response?.data?.message ||
      "Student not found."
    );

  } finally {

    setLoading(false);

  }

};
  // handleCollectPayment()
  const handleCollectPayment = async () => {

  if (!studentFee) {
    toast.error(
      "Please search a student first."
    );
    return;
  }

  if (
    !paymentData.amount ||
    Number(paymentData.amount) <= 0
  ) {
    toast.error(
      "Enter a valid payment amount."
    );
    return;
  }

  if (
    Number(paymentData.amount) >
    studentFee.pendingAmount
  ) {
    toast.error(
      "Payment cannot exceed pending amount."
    );
    return;
  }

  try {

    setPaymentLoading(true);

    const response =
      await API.post(
        "/fees-allocation/payment",
        {

          studentFeeAllocationId:
            studentFee.studentFeeAllocationId,

          amount:
            Number(
              paymentData.amount
            ),

          paymentMode:
            paymentData.paymentMode,

          remarks:
            paymentData.remarks,

        }
      );

  toast.success(
  response.data?.message
);

// Store receipt data
setReceiptData(
  response.data?.data
);

// Open receipt modal
setShowReceiptModal(true);

// Refresh student details
await handleSearchStudent();

// Clear payment form
setPaymentData({

  amount: "",

  paymentMode: "Cash",

  remarks: "",

});

    // Refresh student details
    handleSearchStudent();

    // Clear payment form
    setPaymentData({

      amount: "",

      paymentMode: "Cash",

      remarks: "",

    });

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Payment failed."
    );

  } finally {

    setPaymentLoading(false);

  }

};
// ==================== COLLECT PAYMENT ====================
useEffect(() => {

  fetchInstitutions();

}, []);

  return (

    <div className="payment-page">

  {/* ==================== HEADER ==================== */}

  <div className="payment-header">

    <div>

      <h1>
        Payment Collection
      </h1>

      <p>
        Search a student and collect fee payments.
      </p>

    </div>

  </div>


  {/* ==================== SEARCH SECTION ==================== */}

  <div className="payment-search-card">

    <div className="form-group">

      <label>
        Institution
      </label>

      <select
        value={selectedInstitution}
        onChange={(e) =>
          setSelectedInstitution(
            e.target.value
          )
        }
      >

        <option value="">
          Select Institution
        </option>

        {institutions.map(
          (institution) => (

            <option
              key={
                institution._id
              }
              value={
                institution._id
              }
            >
              {
                institution.institutionName
              }
            </option>

          )
        )}

      </select>

    </div>


    <div className="form-group">

      <label>
        Register Number
      </label>

      <input
        type="text"
        placeholder="Enter Register Number"
        value={registerNumber}
        onChange={(e) =>
          setRegisterNumber(
            e.target.value
          )
        }
      />

    </div>


    <div className="form-group">

      <label>
        Academic Year
      </label>

      <input
        type="text"
        placeholder="Example : 2024-2027"
        value={academicYear}
        onChange={(e) =>
          setAcademicYear(
            e.target.value
          )
        }
      />

    </div>


    <div className="form-group">

      <button
        type="button"
        onClick={
          handleSearchStudent
        }
        disabled={loading}
      >

        {loading
          ? "Searching..."
          : "Find Student"}

      </button>

    </div>

  </div>

  {/* ==================== STUDENT INFORMATION ==================== */}

{studentFee && (

  <div className="student-payment-card">

    {/* LEFT SIDE */}

    <div className="student-payment-profile">

      <img
        src={
          studentFee.profilePhoto
            ? `http://localhost:3000/${studentFee.profilePhoto}`
            : "/default-profile.png"
        }
        alt={
          studentFee.studentName
        }
      />

    </div>


    {/* RIGHT SIDE */}

    <div className="student-payment-details">

      <div className="student-payment-row">

        <label>
          Student Name
        </label>

        <span>
          {studentFee.studentName}
        </span>

      </div>


      <div className="student-payment-row">

        <label>
          Register Number
        </label>

        <span>
          {studentFee.registerNumber}
        </span>

      </div>
      <div className="student-payment-row">

  <label>
    Department
  </label>

  <span>
    {studentFee.department?.departmentName || "-"}
  </span>

</div>


      <div className="student-payment-row">

        <label>
          Programme
        </label>

        <span>
          {studentFee.programme
            ?.programmeName || "-"}
        </span>

      </div>


      <div className="student-payment-row">

        <label>
          Batch
        </label>

        <span>
          {studentFee.batch
            ?.batchName || "-"}
        </span>

      </div>


      <div className="student-payment-row">

        <label>
          Study Year
        </label>

        <span>
          Year {studentFee.studyYear}
        </span>

      </div>


      <div className="student-payment-row">

        <label>
          Academic Year
        </label>

        <span>
          {studentFee.academicYear}
        </span>

      </div>


      <div className="student-payment-row">

        <label>
          Status
        </label>

        <span>
          {studentFee.status}
        </span>

      </div>

    </div>

  </div>

)}

{/* ==================== FEE SUMMARY ==================== */}

{studentFee && (

<div className="fee-summary-card">

  <div className="fee-summary-box">

    <h4>Total Fee</h4>

    <h2>
      ₹{Number(
        studentFee.totalAmount
      ).toLocaleString("en-IN")}
    </h2>

  </div>


  <div className="fee-summary-box">

    <h4>Paid</h4>

    <h2>
      ₹{Number(
        studentFee.paidAmount
      ).toLocaleString("en-IN")}
    </h2>

  </div>


  <div className="fee-summary-box">

    <h4>Pending</h4>

    <h2>
      ₹{Number(
        studentFee.pendingAmount
      ).toLocaleString("en-IN")}
    </h2>

  </div>


  <div className="fee-summary-box">

    <h4>Status</h4>

    <h2>
      {studentFee.status}
    </h2>

  </div>

</div>

)}

{/* ==================== FEE BREAKDOWN ==================== */}

{studentFee && (

<div className="fee-breakdown-card">

<h2>
Fee Breakdown
</h2>

<table>

<thead>

<tr>

<th>#</th>

<th>Fee Item</th>

<th>Total</th>

<th>Paid</th>

<th>Pending</th>

</tr>

</thead>

<tbody>

{studentFee.feeItems?.map(
(item,index)=>(

<tr key={index}>

<td>
{index+1}
</td>

<td>
{item.title}
</td>

<td>
₹{Number(
item.totalAmount
).toLocaleString("en-IN")}
</td>

<td>
₹{Number(
item.paidAmount
).toLocaleString("en-IN")}
</td>

<td>
₹{Number(
item.pendingAmount
).toLocaleString("en-IN")}
</td>

</tr>

)
)}

</tbody>

</table>

</div>

)}

{/* ==================== PAYMENT FORM ==================== */}

{studentFee && (

<div className="payment-form-card">

  <h2>
    Collect Payment
  </h2>

  <div className="payment-form-grid">

    {/* Payment Amount */}

    <div className="form-group">

      <label>
        Payment Amount
      </label>

      <input
        type="number"
        min="1"
        max={studentFee.pendingAmount}
        placeholder="Enter Amount"
        value={paymentData.amount}
        onChange={(e) =>
          setPaymentData({
            ...paymentData,
            amount: e.target.value,
          })
        }
      />

    </div>


    {/* Payment Method */}

    <div className="form-group">

      <label>
        Payment Method
      </label>

      <select
        value={paymentData.paymentMode}
        onChange={(e) =>
          setPaymentData({
            ...paymentData,
            paymentMode: e.target.value,
          })
        }
      >

        <option value="Cash">
          Cash
        </option>

        <option value="UPI">
          UPI
        </option>

        <option value="Card">
          Card
        </option>

        <option value="Bank Transfer">
          Bank Transfer
        </option>

        <option value="Cheque">
          Cheque
        </option>

      </select>

    </div>


    {/* Remarks */}

    <div className="form-group payment-remarks">

      <label>
        Remarks
      </label>

      <textarea
        rows={3}
        placeholder="Optional remarks..."
        value={paymentData.remarks}
        onChange={(e) =>
          setPaymentData({
            ...paymentData,
            remarks: e.target.value,
          })
        }
      />

    </div>

  </div>


  {/* BUTTON */}

  <div className="payment-action">

    <button
      type="button"
      onClick={handleCollectPayment}
      disabled={
        paymentLoading ||
        studentFee.pendingAmount === 0
      }
    >

      {studentFee.pendingAmount === 0
        ? "Fully Paid"
        : paymentLoading
        ? "Collecting..."
        : "Collect Payment"}

    </button>

  </div>

</div>

)}

{/* ==================== RECEIPT MODAL ==================== */}

{showReceiptModal && receiptData && (

<div className="receipt-modal-overlay">

<div className="receipt-modal">

<h2>
Payment Successful
</h2>

<div className="receipt-details">

<div>

<strong>
Receipt No
</strong>

<span>
{receiptData.receiptNumber}
</span>

</div>

<div>

<strong>
Student
</strong>

<span>
{receiptData.studentName}
</span>

</div>

<div>

<strong>
Register Number
</strong>

<span>
{receiptData.registerNumber}
</span>

</div>

<div>

<strong>
Academic Year
</strong>

<span>
{receiptData.academicYear}
</span>

</div>

<div>

<strong>
Amount Paid
</strong>

<span>
₹{Number(
receiptData.amountPaid
).toLocaleString("en-IN")}
</span>

</div>

<div>

<strong>
Pending Amount
</strong>

<span>
₹{Number(
receiptData.pendingAmount
).toLocaleString("en-IN")}
</span>

</div>

<div>

<strong>
Payment Method
</strong>

<span>
{receiptData.paymentMode}
</span>

</div>

<div>

<strong>
Paid At
</strong>

<span>
{new Date(
receiptData.paidAt
).toLocaleString()}
</span>

</div>

</div>


<div className="receipt-actions">

<button
type="button"
onClick={() =>
window.print()
}
>

Print Receipt

</button>


<button
type="button"
onClick={() => {

setShowReceiptModal(false);

setReceiptData(null);

}}
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

export default PaymentCollection;