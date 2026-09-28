import React, { useEffect, useState } from "react";
import API from "../../../api/axios";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import "./feeStructure.css"
// import "./feeStructure.css";
const FeeStructure = () => {
    // ==================== DROPDOWN DATA ====================

const [institutions, setInstitutions] = useState([]);
const [departments, setDepartments] = useState([]);
const [programmes, setProgrammes] = useState([]);
const [batches, setBatches] = useState([]);


// ==================== SELECTED VALUES ====================

const [selectedInstitution, setSelectedInstitution] = useState("");
const [selectedDepartment, setSelectedDepartment] = useState("");


// ==================== FORM DATA ====================

const [formData, setFormData] = useState({
  programmeId: "",
  batchId: "",
  year: "",
  academicYear: "",

  feeItems: [
    {
      title: "",
      amount: "",
    },
  ],
});


// ==================== FETCH INSTITUTIONS ====================

const fetchInstitutions = async () => {
  try {
    const response = await API.get(
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

// ==================== FORM STATE ====================

const [loading, setLoading] = useState(false);

// ==================== FEE STRUCTURES ====================

const [feeStructures, setFeeStructures] = useState([]);
const [fetchLoading, setFetchLoading] = useState(false);
// ==================== EDIT STATE ====================

const [editingFeeId, setEditingFeeId] = useState(null);


// ==================== FETCH DEPARTMENTS ====================

const fetchDepartments = async (institutionId) => {
  if (!institutionId) {
    setDepartments([]);
    return;
  }

  try {
    const response = await API.get(
      `/institutions/${institutionId}`
    );

    setDepartments(
      response.data?.data?.departments || []
    );
console.log("FULL RESPONSE:", response.data);
console.log("DATA:", response.data?.data);

  } catch (error) {

    setDepartments([]);
    toast.error(
      error.response?.data?.message ||
      "Failed to fetch departments."
    );
  }
};

// ==================== FETCH PROGRAMMES ====================

const fetchProgrammes = async (departmentId) => {
  if (!departmentId) {
    setProgrammes([]);
    return;
  }

  try {
    const response = await API.get(
      `/programmes/department/${departmentId}`
    );

    setProgrammes(
      response.data?.data || []
    );

  } catch (error) {

    setProgrammes([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch programmes."
    );
  }
};

// ==================== FETCH BATCHES ====================

// ==================== FETCH BATCHES ====================

const fetchBatches = async (institutionId) => {
  if (!institutionId) {
    setBatches([]);
    return;
  }

  try {
    const response = await API.get(
      `/batch/institution/${institutionId}`
    );

    setBatches(
      response.data?.data || []
    );

  } catch (error) {

    setBatches([]);

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch batches."
    );
  }
};


// ==================== FETCH FEE STRUCTURES ====================

const fetchFeeStructures = async () => {
  try {
    setFetchLoading(true);

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
    setFetchLoading(false);
  }
};
// ==================== DEPARTMENT CHANGE ====================

const handleDepartmentChange = (e) => {
  const departmentId = e.target.value;

  setSelectedDepartment(departmentId);

  // Reset programme when department changes
  setProgrammes([]);

  setFormData((prev) => ({
    ...prev,
    programmeId: "",
  }));

  if (departmentId) {
    fetchProgrammes(departmentId);
  }
};

// ==================== FEE ITEM CHANGE ====================

const handleFeeItemChange = (index, field, value) => {
  setFormData((prev) => {
    const updatedFeeItems = [...prev.feeItems];

    updatedFeeItems[index] = {
      ...updatedFeeItems[index],
      [field]: value,
    };

    return {
      ...prev,
      feeItems: updatedFeeItems,
    };
  });
};

// ==================== ADD FEE ITEM ====================

const handleAddFeeItem = () => {
  setFormData((prev) => ({
    ...prev,

    feeItems: [
      ...prev.feeItems,
      {
        title: "",
        amount: "",
      },
    ],
  }));
};


// ==================== REMOVE FEE ITEM ====================

const handleRemoveFeeItem = (index) => {
  setFormData((prev) => ({
    ...prev,

    feeItems: prev.feeItems.filter(
      (_, itemIndex) => itemIndex !== index
    ),
  }));
};

// ==================== CALCULATE TOTAL ====================

const totalAmount = formData.feeItems.reduce(
  (sum, item) => {
    const amount = Number(item.amount) || 0;
    return sum + amount;
  },
  0
);

// ==================== START EDIT ====================

const handleEdit = (fee) => {
  setEditingFeeId(fee._id);

  setSelectedInstitution(
    fee.institutionId?._id || ""
  );

  setSelectedDepartment(
    fee.departmentId?._id || ""
  );

  setFormData({
    programmeId:
      fee.programmeId?._id || "",

    batchId:
      fee.batchId?._id || "",

    year:
      fee.year?.toString() || "",

    academicYear:
      fee.academicYear || "",

    feeItems:
      fee.feeItems?.map((item) => ({
        title: item.title || "",
        amount: item.amount ?? "",
      })) || [
        {
          title: "",
          amount: "",
        },
      ],
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};



// ==================== DELETE FEE STRUCTURE ====================

const handleDelete = async (feeStructureId) => {

  const confirmed = window.confirm(
    "Are you sure you want to delete this fee structure?"
  );

  if (!confirmed) {
    return;
  }

  try {

    const response = await API.delete(
      `/fees-allocation/structure/${feeStructureId}`
    );

    toast.success(
      response.data?.message ||
      "Fee structure deleted successfully."
    );

    // If currently editing the deleted structure
    if (editingFeeId === feeStructureId) {
      setEditingFeeId(null);
    }

    // Refresh active fee structures
    await fetchFeeStructures();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to delete fee structure."
    );

  }
};
// ==================== CREATE FEE STRUCTURE ====================

const handleSubmit = async (e) => {
  e.preventDefault();

  // ==================== VALIDATION ====================

  if (!selectedInstitution) {
    toast.error("Please select an institution.");
    return;
  }

  if (!selectedDepartment) {
    toast.error("Please select a department.");
    return;
  }

  if (!formData.programmeId) {
    toast.error("Please select a programme.");
    return;
  }

  if (!formData.batchId) {
    toast.error("Please select a batch.");
    return;
  }

  if (!formData.year) {
    toast.error("Please select a study year.");
    return;
  }

  if (!formData.academicYear.trim()) {
    toast.error("Please enter the academic year.");
    return;
  }

  const invalidFeeItem = formData.feeItems.some(
    (item) =>
      !item.title.trim() ||
      item.amount === "" ||
      Number(item.amount) < 0
  );

  if (invalidFeeItem) {
    toast.error(
      "Please enter a valid title and amount for every fee item."
    );
    return;
  }

  // ==================== PAYLOAD ====================

  const payload = {
    programmeId: formData.programmeId,

    batchId: formData.batchId,

    year: Number(formData.year),

    academicYear:
      formData.academicYear.trim(),

    feeItems: formData.feeItems.map(
      (item) => ({
        title: item.title.trim(),
        amount: Number(item.amount),
      })
    ),
  };

  try {
    setLoading(true);

    const response = await API.post(
      "/fees-allocation/structure",
      payload
    );

    toast.success(
      response.data?.message ||
      "Fee structure created successfully."
    );
    await fetchFeeStructures();

    console.log(
      "CREATED FEE STRUCTURE:",
      response.data
    );

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to create fee structure."
    );

  } finally {
    setLoading(false);
  }
};



// ==================== UPDATE FEE STRUCTURE ====================

const handleUpdate = async (e) => {
  e.preventDefault();

  if (!editingFeeId) {
    return;
  }

  if (
    !formData.programmeId ||
    !formData.batchId ||
    !formData.year ||
    !formData.academicYear.trim()
  ) {
    toast.error(
      "Please complete all required fields."
    );
    return;
  }

  const invalidFeeItem =
    formData.feeItems.some(
      (item) =>
        !item.title.trim() ||
        item.amount === "" ||
        Number(item.amount) < 0
    );

  if (invalidFeeItem) {
    toast.error(
      "Please enter valid fee items."
    );
    return;
  }

  const payload = {
    programmeId:
      formData.programmeId,

    batchId:
      formData.batchId,

    year:
      Number(formData.year),

    academicYear:
      formData.academicYear.trim(),

    feeItems:
      formData.feeItems.map((item) => ({
        title: item.title.trim(),
        amount: Number(item.amount),
      })),
  };

  try {
    setLoading(true);

    const response = await API.put(
      `/fees-allocation/structure/${editingFeeId}`,
      payload
    );

    toast.success(
      response.data?.message ||
      "Fee structure updated successfully."
    );

    await fetchFeeStructures();

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to update fee structure."
    );

  } finally {
    setLoading(false);
  }
};

// ==================== INSTITUTION CHANGE ====================

const handleInstitutionChange = (e) => {
  const institutionId = e.target.value;

  // Set selected institution
  setSelectedInstitution(institutionId);

  // Reset previous selections
  setSelectedDepartment("");

  // Clear data belonging to previous institution
  setDepartments([]);
  setProgrammes([]);
  setBatches([]);

  // Reset programme and batch in form
  setFormData((prev) => ({
    ...prev,
    programmeId: "",
    batchId: "",
  }));

  // Fetch data for newly selected institution
  if (institutionId) {
    fetchDepartments(institutionId);
    fetchBatches(institutionId);
  }
};
// ==================== INITIAL FETCH ====================

useEffect(() => {
  fetchInstitutions();
  fetchFeeStructures();
}, []);
return (
  <div className="fee-structure-page">

    {/* ==================== HEADER ==================== */}

    <div className="fee-structure-header">
      <div>
        <h1>Fee Structure</h1>
        <p>Create and manage fee structures.</p>
      </div>
    </div>

<NavLink to="/accountant/FeeStructure/bin"  className="recyclebin_wraapper">
  <h3>recycle bin</h3>
</NavLink>

    {/* ==================== CONTENT ==================== */}

  

<form
  className="fee-structure-content"
  onSubmit={
    editingFeeId
      ? handleUpdate
      : handleSubmit
  }
>

      {/* ==================== INSTITUTION ==================== */}

      <div className="form-group">
        <label>Institution</label>

        <select
          value={selectedInstitution}
          onChange={handleInstitutionChange}
        >
          <option value="">
            Select Institution
          </option>

          {institutions.map((institution) => (
            <option
              key={institution._id}
              value={institution._id}
            >
              {institution.institutionName}
            </option>
          ))}
        </select>
      </div>


      {/* ==================== DEPARTMENT ==================== */}

      <div className="form-group">
        <label>Department</label>

        <select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          disabled={!selectedInstitution}
        >
          <option value="">
            Select Department
          </option>

          {departments.map((department) => (
            <option
              key={department._id}
              value={department._id}
            >
              {department.departmentName}
            </option>
          ))}
        </select>
      </div>


      {/* ==================== PROGRAMME ==================== */}

      <div className="form-group">
        <label>Programme</label>

        <select
          value={formData.programmeId}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              programmeId: e.target.value,
            }))
          }
          disabled={!selectedDepartment}
        >
          <option value="">
            Select Programme
          </option>

          {programmes.map((programme) => (
            <option
              key={programme._id}
              value={programme._id}
            >
              {programme.programmeName}
              {programme.programmeCode
                ? ` (${programme.programmeCode})`
                : ""}
            </option>
          ))}
        </select>
      </div>


      {/* ==================== BATCH ==================== */}

      <div className="form-group">
        <label>Batch</label>

        <select
          value={formData.batchId}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              batchId: e.target.value,
            }))
          }
          disabled={!formData.programmeId}
        >
          <option value="">
            Select Batch
          </option>

          {batches.map((batch) => (
            <option
              key={batch._id}
              value={batch._id}
            >
              {batch.batchName}
            </option>
          ))}
        </select>
      </div>


      {/* ==================== STUDY YEAR ==================== */}

      <div className="form-group">
        <label>Study Year</label>

        <select
          value={formData.year}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              year: e.target.value,
            }))
          }
          disabled={!formData.programmeId}
        >
          <option value="">
            Select Study Year
          </option>

          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
          <option value="5">5th Year</option>
          <option value="6">6th Year</option>
        </select>
      </div>


      {/* ==================== ACADEMIC YEAR ==================== */}

      <div className="form-group">
        <label>Academic Year</label>

        <input
          type="text"
          placeholder="Example: 2026-2027"
          value={formData.academicYear}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              academicYear: e.target.value,
            }))
          }
        />
      </div>


      {/* ==================== FEE ITEMS ==================== */}

<div className="fee-items-section">

  <div className="fee-items-header">
    <h3>Fee Items</h3>

    <button
      type="button"
      onClick={handleAddFeeItem}
    >
      + Add Fee
    </button>
  </div>


 {formData.feeItems.map((item, index) => (
  <div
    className="fee-item-row"
    key={index}
  >
    <div className="form-group">
      <label>Fee Title</label>

      <input
        type="text"
        placeholder="Example: Tuition Fee"
        value={item.title}
        onChange={(e) =>
          handleFeeItemChange(
            index,
            "title",
            e.target.value
          )
        }
      />
    </div>

    <div className="form-group">
      <label>Amount</label>

      <input
        type="number"
        min="0"
        placeholder="0"
        value={item.amount}
        onChange={(e) =>
          handleFeeItemChange(
            index,
            "amount",
            e.target.value
          )
        }
      />
    </div>

    {formData.feeItems.length > 1 && (
      <button
        type="button"
        onClick={() =>
          handleRemoveFeeItem(index)
        }
      >
        Remove
      </button>
    )}
  </div>
))}

<div className="fee-total">
  <span>Total Amount</span>

  <strong>
    ₹{totalAmount.toLocaleString("en-IN")}
  </strong>
</div>

</div>
{/* ==================== SUBMIT ==================== */}

<div className="fee-structure-actions">
  <button
    type="submit"
    disabled={loading}
  >
  {loading
  ? editingFeeId
    ? "Updating..."
    : "Creating..."
  : editingFeeId
    ? "Update Fee Structure"
    : "Create Fee Structure"}
  </button>
</div>

    </form>

    {/* ==================== FEE STRUCTURE LIST ==================== */}

<div className="fee-structure-list">

  <div className="fee-structure-list-header">
    <h2>Fee Structures</h2>
  </div>

  {fetchLoading ? (
    <p>Loading fee structures...</p>
  ) : feeStructures.length === 0 ? (
    <p>No fee structures found.</p>
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
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {feeStructures.map((fee, index) => (
          <tr key={fee._id}>
            <td>{index + 1}</td>

            <td>
              {fee.institutionId?.institutionName || "-"}
            </td>

            <td>
              {fee.departmentId?.departmentName || "-"}
            </td>

            <td>
              {fee.programmeId?.programmeName || "-"}
            </td>

            <td>
              {fee.batchId?.batchName || "-"}
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
<td>
  <button
    type="button"
    onClick={() => handleEdit(fee)}
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => handleDelete(fee._id)}
  >
    Delete
  </button>
</td>
              -
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}

</div>
  </div>
);
};

export default FeeStructure;