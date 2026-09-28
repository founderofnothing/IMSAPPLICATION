import React, { useEffect, useState } from "react";
import API from "../../../../api/axios";
import { toast } from "react-toastify";
// import "./feeStructureBin.css";

const FeeStructureBin = () => {

  // ==================== STATE ====================

  const [deletedFeeStructures, setDeletedFeeStructures] =
    useState([]);

  const [loading, setLoading] =
    useState(false);


  // ==================== INITIAL FETCH ====================



  // ==================== FETCH DELETED FEE STRUCTURES ====================

const fetchDeletedFeeStructures = async () => {
  try {
    setLoading(true);

    const response = await API.get(
      "/fees-allocation/structure/bin"
    );

    setDeletedFeeStructures(
      response.data?.data || []
    );

  } catch (error) {

    setDeletedFeeStructures([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch deleted fee structures."
    );

  } finally {
    setLoading(false);
  }
};

// ==================== RESTORE FEE STRUCTURE ====================

const handleRestore = async (feeStructureId) => {

  const confirmed = window.confirm(
    "Are you sure you want to restore this fee structure?"
  );

  if (!confirmed) {
    return;
  }

  try {

    const response = await API.put(
      `/fees-allocation/structure/restore/${feeStructureId}`
    );

    toast.success(
      response.data?.message ||
      "Fee structure restored successfully."
    );

    // Refresh recycle bin
    await fetchDeletedFeeStructures();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to restore fee structure."
    );

  }
};

// ==================== PERMANENT DELETE FEE STRUCTURE ====================

const handlePermanentDelete = async (feeStructureId) => {

  const confirmed = window.confirm(
    "This will permanently delete the fee structure. This action cannot be undone. Continue?"
  );

  if (!confirmed) {
    return;
  }

  try {

    const response = await API.delete(
      `/fees-allocation/structure/permanent/${feeStructureId}`
    );

    toast.success(
      response.data?.message ||
      "Fee structure permanently deleted."
    );

    // Refresh recycle bin
    await fetchDeletedFeeStructures();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to permanently delete fee structure."
    );

  }
};




useEffect(() => {
  fetchDeletedFeeStructures();
}, []);


  return (
    <div className="fee-structure-bin-page">

      {/* ==================== HEADER ==================== */}

      <div className="fee-structure-bin-header">

        <div>
          <h1>Fee Structure Recycle Bin</h1>

          <p>
            Restore or permanently delete fee structures.
          </p>
        </div>

      </div>


      {/* ==================== CONTENT ==================== */}

     <div className="fee-structure-bin-content">

  {loading ? (

    <p>Loading deleted fee structures...</p>

  ) : deletedFeeStructures.length === 0 ? (

    <p>Recycle bin is empty.</p>

  ) : (

    <table>

      <thead>
        <tr>
          <th>#</th>
          <th>Institution</th>
          <th>Department</th>
          <th>Programme</th>
          <th>Batch</th>
          <th>Study Year</th>
          <th>Academic Year</th>
          <th>Total Amount</th>
          <th>Deleted At</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        {deletedFeeStructures.map(
          (fee, index) => (

            <tr key={fee._id}>

              <td>{index + 1}</td>

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
                {fee.year || "-"}
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
                {fee.deletedAt
                  ? new Date(
                      fee.deletedAt
                    ).toLocaleString("en-IN")
                  : "-"}
              </td>

              <td>

  <button
    type="button"
    onClick={() =>
      handleRestore(fee._id)
    }
  >
    Restore
  </button>


  <button
    type="button"
    onClick={() =>
      handlePermanentDelete(fee._id)
    }
  >
    Delete Permanently
  </button>

</td>

            </tr>

          )
        )}

      </tbody>

    </table>

  )}

</div>

    </div>
  );
};

export default FeeStructureBin;