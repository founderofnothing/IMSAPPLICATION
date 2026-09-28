import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import "./FeeAllocation.css";

const FeeAllocation = () => {

  // ==================== STATE ====================

  const [feeStructures, setFeeStructures] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [assigningId, setAssigningId] =
    useState(null);

    // ==================== ASSIGNMENT MODAL ====================

const [selectedFeeStructure, setSelectedFeeStructure] =
  useState(null);

const [showAssignModal, setShowAssignModal] =
  useState(false);

  // ==================== RESET ALLOCATION STATE ====================

const [resetFeeStructure, setResetFeeStructure] =
  useState(null);

const [showResetModal, setShowResetModal] =
  useState(false);

const [resettingId, setResettingId] =
  useState(null);

  // ==================== INITIAL FETCH ====================

  // ==================== FETCH FEE STRUCTURES ====================

const fetchFeeStructures = async () => {
  try {
    setLoading(true);

    const response = await API.get(
      "/fees-allocation/structure"
    );

    setFeeStructures(
      response.data?.data || []
    );

  } catch (error) {

    setFeeStructures([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch fee structures."
    );

  } finally {
    setLoading(false);
  }
};

// ==================== OPEN ASSIGN MODAL ====================

const handleOpenAssignModal = (fee) => {

  setSelectedFeeStructure(fee);

  setShowAssignModal(true);
};


// ==================== CLOSE ASSIGN MODAL ====================

const handleCloseAssignModal = () => {

  setShowAssignModal(false);

  setSelectedFeeStructure(null);
};

// ==================== OPEN RESET MODAL ====================

const handleOpenResetModal = (fee) => {
  setResetFeeStructure(fee);
  setShowResetModal(true);
};


// ==================== CLOSE RESET MODAL ====================

const handleCloseResetModal = () => {
  setShowResetModal(false);
  setResetFeeStructure(null);
};
// ==================== ASSIGN FEES ====================

const handleAssignFees = async () => {

  if (!selectedFeeStructure?._id) {
    toast.error(
      "Fee structure not selected."
    );
    return;
  }

  try {

    setAssigningId(
      selectedFeeStructure._id
    );

    const response =
      await API.post(
        "/fees-allocation/allocation/assign",
        {
          feeStructureId:
            selectedFeeStructure._id,
        }
      );


    // ==================== SUCCESS ====================

    const result =
      response.data?.data;

    toast.success(
      response.data?.message ||
      "Fees assigned successfully."
    );


    // Useful while testing
    console.log(
      "FEE ALLOCATION RESULT:",
      result
    );


    // Close modal only after successful assignment
  handleCloseAssignModal();

await fetchFeeStructures();


  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to assign fees."
    );

  } finally {

    setAssigningId(null);

  }
};

// ==================== RESET FEE ALLOCATION ====================

const handleResetAllocation = async () => {

  if (!resetFeeStructure?._id) {
    toast.error(
      "Fee structure not selected."
    );
    return;
  }

  try {

    setResettingId(
      resetFeeStructure._id
    );

    const response =
      await API.delete(
        `/fees-allocation/allocation/reset/${resetFeeStructure._id}`
      );


    toast.success(
      response.data?.message ||
      "Fee allocation reset successfully."
    );


    // Close confirmation modal
    handleCloseResetModal();


    // Refresh structures so isAssigned becomes false
    await fetchFeeStructures();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to reset fee allocation."
    );

  } finally {

    setResettingId(null);

  }
};



useEffect(() => {
  fetchFeeStructures();
}, []);


  return (
    <div className="fee-allocation-page">

      {/* ==================== HEADER ==================== */}

      <div className="fee-allocation-header">

        <div>
          <h1>Fee Allocation</h1>

          <p>
            Assign fee structures to eligible students.
          </p>
        </div>

      </div>


      {/* ==================== CONTENT ==================== */}

     <div className="fee-allocation-content">

  {loading ? (

    <p>Loading fee structures...</p>

  ) : feeStructures.length === 0 ? (

    <p>No fee structures found.</p>

  ) : (

    <table className="fee-allocation-table">

      <thead>
        <tr>
          <th>#</th>
          <th>Institution</th>
          <th>Department</th>
          <th>Programme</th>
          <th>Batch</th>
          <th>Study Year</th>
          <th>Academic Year</th>
          <th>Total Fee</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        {feeStructures.map((fee, index) => (

          <tr key={fee._id}>

            <td>
              {index + 1}
            </td>

            <td>
              {fee.institutionId
                ?.institutionName || "-"}
            </td>

            <td>
              {fee.departmentId
                ?.departmentName || "-"}
            </td>

            <td>
              {fee.programmeId
                ?.programmeName || "-"}
            </td>

            <td>
              {fee.batchId
                ?.batchName || "-"}
            </td>

            <td>
              {fee.year
                ? `Year ${fee.year}`
                : "-"}
            </td>

            <td>
              {fee.academicYear || "-"}
            </td>

            <td>
              ₹{Number(
                fee.totalAmount || 0
              ).toLocaleString("en-IN")}
            </td>

<td>

  <div className="fee-allocation-actions">

    {/* ==================== ASSIGN ==================== */}

    <button
      type="button"
      className={`assign-fee-btn ${
        fee.isAssigned ? "assigned" : ""
      }`}
      disabled={fee.isAssigned}
      onClick={() =>
        handleOpenAssignModal(fee)
      }
    >
      {fee.isAssigned
        ? "Assigned"
        : "Assign Fees"}
    </button>


    {/* ==================== RESET ==================== */}

    {fee.isAssigned && (

      <button
        type="button"
        className="reset-fee-btn"
        onClick={() =>
          handleOpenResetModal(fee)
        }
      >
        Reset
      </button>

    )}

  </div>

</td>

          </tr>

        ))}

      </tbody>

    </table>

  )}

</div>

{/* ==================== ASSIGN FEE CONFIRMATION MODAL ==================== */}

{showAssignModal && selectedFeeStructure && (

  <div className="fee-assign-modal-overlay">

    <div className="fee-assign-modal">

      {/* HEADER */}

      <div className="fee-assign-modal-header">

        <div>
          <h2>Confirm Fee Allocation</h2>

          <p>
            Review the fee structure before assigning it
            to students.
          </p>
        </div>

       <button
  type="button"
  onClick={handleCloseAssignModal}
  disabled={
    assigningId ===
    selectedFeeStructure._id
  }
>
  ×
</button>

      </div>


      {/* ACADEMIC DETAILS */}

      <div className="fee-assign-details">

        <div>
          <span>Institution</span>

          <strong>
            {selectedFeeStructure
              .institutionId
              ?.institutionName || "-"}
          </strong>
        </div>


        <div>
          <span>Department</span>

          <strong>
            {selectedFeeStructure
              .departmentId
              ?.departmentName || "-"}
          </strong>
        </div>


        <div>
          <span>Programme</span>

          <strong>
            {selectedFeeStructure
              .programmeId
              ?.programmeName || "-"}
          </strong>
        </div>


        <div>
          <span>Batch</span>

          <strong>
            {selectedFeeStructure
              .batchId
              ?.batchName || "-"}
          </strong>
        </div>


        <div>
          <span>Study Year</span>

          <strong>
            {selectedFeeStructure.year
              ? `Year ${selectedFeeStructure.year}`
              : "-"}
          </strong>
        </div>


        <div>
          <span>Academic Year</span>

          <strong>
            {selectedFeeStructure
              .academicYear || "-"}
          </strong>
        </div>

      </div>


      {/* FEE ITEMS */}

      <div className="fee-assign-items">

        <h3>Fee Details</h3>

        <table>

          <thead>
            <tr>
              <th>Fee Item</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>

            {selectedFeeStructure
              .feeItems
              ?.map((item, index) => (

                <tr
                  key={
                    item._id ||
                    `${item.title}-${index}`
                  }
                >

                  <td>
                    {item.title}
                  </td>

                  <td>
                    ₹{Number(
                      item.amount || 0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </td>

                </tr>

              ))}

          </tbody>

        </table>

      </div>


      {/* TOTAL */}

      <div className="fee-assign-total">

        <span>
          Total Fee
        </span>

        <strong>
          ₹{Number(
            selectedFeeStructure
              .totalAmount || 0
          ).toLocaleString("en-IN")}
        </strong>

      </div>


      {/* WARNING */}

      <div className="fee-assign-warning">

        <p>
          This fee structure will be assigned to all
          eligible students in this programme and batch.
          Review the details carefully before continuing.
        </p>

      </div>


      {/* ACTIONS */}

   <div className="fee-assign-actions">

  <button
    type="button"
    onClick={handleCloseAssignModal}
    disabled={
      assigningId ===
      selectedFeeStructure._id
    }
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleAssignFees}
    disabled={
      assigningId ===
      selectedFeeStructure._id
    }
  >
    {assigningId ===
    selectedFeeStructure._id
      ? "Assigning..."
      : "Confirm & Assign"}
  </button>

</div>

    </div>

  </div>

)}

{/* ==================== RESET ALLOCATION MODAL ==================== */}

{showResetModal && resetFeeStructure && (

  <div className="fee-reset-modal-overlay">

    <div className="fee-reset-modal">

      {/* HEADER */}

      <div className="fee-reset-modal-header">

        <div>

          <h2>
            Reset Fee Allocation
          </h2>

          <p>
            Confirm that you want to remove this
            fee allocation from the students.
          </p>

        </div>

        <button
          type="button"
          onClick={handleCloseResetModal}
          disabled={
            resettingId ===
            resetFeeStructure._id
          }
        >
          ×
        </button>

      </div>


      {/* DETAILS */}

      <div className="fee-reset-details">

        <div>
          <span>Programme</span>

          <strong>
            {resetFeeStructure
              .programmeId
              ?.programmeName || "-"}
          </strong>
        </div>


        <div>
          <span>Batch</span>

          <strong>
            {resetFeeStructure
              .batchId
              ?.batchName || "-"}
          </strong>
        </div>


        <div>
          <span>Study Year</span>

          <strong>
            {resetFeeStructure.year
              ? `Year ${resetFeeStructure.year}`
              : "-"}
          </strong>
        </div>


        <div>
          <span>Academic Year</span>

          <strong>
            {resetFeeStructure
              .academicYear || "-"}
          </strong>
        </div>


        <div>
          <span>Total Fee</span>

          <strong>
            ₹{Number(
              resetFeeStructure
                .totalAmount || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

      </div>


      {/* WARNING */}

      <div className="fee-reset-warning">

        <strong>
          Warning
        </strong>

        <p>
          This will remove this fee structure
          from all students it was assigned to.
          The action will be blocked if any
          payment has already been recorded.
        </p>

      </div>


      {/* ACTIONS */}

      <div className="fee-reset-actions">

        <button
          type="button"
          onClick={handleCloseResetModal}
          disabled={
            resettingId ===
            resetFeeStructure._id
          }
        >
          Cancel
        </button>


        <button
          type="button"
          onClick={handleResetAllocation}
          disabled={
            resettingId ===
            resetFeeStructure._id
          }
        >
          {resettingId ===
          resetFeeStructure._id
            ? "Resetting..."
            : "Confirm Reset"}
        </button>

      </div>

    </div>

  </div>

)}

    </div>
  );
};

export default FeeAllocation;