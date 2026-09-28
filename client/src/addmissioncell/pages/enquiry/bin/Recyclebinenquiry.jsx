import {
  useEffect,
  useState,
} from "react";

import { toast } from "react-toastify";
import API from "../../../../api/axios";
import { NavLink } from "react-router-dom";

// import "./recyclebinenquiry.css";


const Recyclebinenquiry = () => {

  /* ==================================
              STATES
  ================================== */

  const [enquiries, setEnquiries] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

const [filters, setFilters] = useState({
  search: "",
  gender: "",
  departmentId: "",
});

const [departments, setDepartments] = useState([]);
  /* ==================================
        FETCH DELETED ENQUIRIES
  ================================== */

 const fetchDeletedEnquiries = async () => {

  try {

    setLoading(true);

    const response = await API.get(
      "/enquiry/deleted",
      {
        params: {
          search: filters.search,
          gender: filters.gender,
          departmentId:
            filters.departmentId,
        },
      }
    );

    setEnquiries(
      response.data.data || []
    );

  } catch (error) {

    console.error(
      "Fetch deleted enquiries error:",
      error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch deleted enquiries."
    );

  } finally {

    setLoading(false);

  }

};

const fetchDepartments = async () => {

  try {

    const response = await API.get(
      "/institutions/my-institution"
    );

    setDepartments(
      response.data.data.departments || []
    );

  } catch (error) {

    console.error(
      "Fetch departments error:",
      error
    );

    toast.error(
      "Failed to fetch departments."
    );

  }

};


  /* ==================================
            RESTORE ENQUIRY
  ================================== */

  const handleRestore =
    async (id) => {

      const confirmRestore =
        window.confirm(
          "Are you sure you want to restore this enquiry?"
        );

      if (!confirmRestore) {
        return;
      }

      try {

        setActionLoadingId(id);

        await API.patch(
          `/enquiry/restore/${id}`
        );

        toast.success(
          "Enquiry restored successfully."
        );

        // Remove restored enquiry
        // immediately from recycle bin UI
        setEnquiries((prev) =>
          prev.filter(
            (enquiry) =>
              enquiry._id !== id
          )
        );

      } catch (error) {

        console.error(
          "Restore enquiry error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to restore enquiry."
        );

      } finally {

        setActionLoadingId(null);

      }

    };


  /* ==================================
       PERMANENT DELETE ENQUIRY
  ================================== */

  const handlePermanentDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "This will permanently delete the enquiry. This action cannot be undone. Continue?"
        );

      if (!confirmDelete) {
        return;
      }

      try {

        setActionLoadingId(id);

        await API.delete(
          `/enquiry/permanent-delete/${id}`
        );

        toast.success(
          "Enquiry permanently deleted."
        );

        // Remove deleted enquiry
        // immediately from UI
        setEnquiries((prev) =>
          prev.filter(
            (enquiry) =>
              enquiry._id !== id
          )
        );

      } catch (error) {

        console.error(
          "Permanent delete error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
          "Failed to permanently delete enquiry."
        );

      } finally {

        setActionLoadingId(null);

      }

    };


  /* ==================================
              INITIAL FETCH
  ================================== */

  const handleFilterChange = (e) => {

  const { name, value } = e.target;

  setFilters((prev) => ({
    ...prev,
    [name]: value,

    ...(name === "departmentId"
      ? { programmeId: "" }
      : {}),
  }));

};

useEffect(() => {

  fetchDepartments();

}, []);


useEffect(() => {

  fetchDeletedEnquiries();

}, [filters]);

const availableProgrammes = [
  ...new Map(
    enquiries
      .filter(
        (item) =>
          item.programmeId &&
          (
            !filters.departmentId ||
            item.departmentId?._id ===
              filters.departmentId
          )
      )
      .map((item) => [
        item.programmeId._id,
        item.programmeId,
      ])
  ).values(),
];
const filteredEnquiries =
  enquiries.filter((enquiry) => {

    const search =
      filters.search
        .trim()
        .toLowerCase();

    const matchesSearch =
      !search ||
      enquiry.studentName
        ?.toLowerCase()
        .includes(search) ||
      enquiry.studentMobile
        ?.toLowerCase()
        .includes(search);

    const matchesDepartment =
      !filters.departmentId ||
      enquiry.departmentId?._id ===
        filters.departmentId;

    const matchesProgramme =
      !filters.programmeId ||
      enquiry.programmeId?._id ===
        filters.programmeId;

    return (
      matchesSearch &&
      matchesDepartment &&
      matchesProgramme
    );

  });
  /* ==================================
                 UI
  ================================== */

  return (

    <div className="recycle_enquiry_container">

      {/* HEADER */}

      
      <NavLink to="/admission-cell/Enquiry">
      <h4>enquiry </h4>
      </NavLink>
<div className="recycle_filter_wrapper">

  <input
    type="text"
    name="search"
    placeholder="Search Student"
    value={filters.search}
    onChange={handleFilterChange}
  />

  <select
    name="departmentId"
    value={filters.departmentId}
    onChange={handleFilterChange}
  >
    <option value="">
      All Departments
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

  <select
    name="programmeId"
    value={filters.programmeId}
    onChange={handleFilterChange}
    disabled={!filters.departmentId}
  >
    <option value="">
      All Programmes
    </option>

    {availableProgrammes.map((programme) => (

      <option
        key={programme._id}
        value={programme._id}
      >
        {programme.programmeName}
      </option>

    ))}

  </select>

</div>
      <div className="recycle_enquiry_header">

        <div>

          <h2>
            Enquiry Recycle Bin
          </h2>

          <p>
            Deleted enquiries can be restored
            or permanently removed.
          </p>

        </div>

        <div className="deleted_count">

          Deleted Enquiries:{" "}

          <strong>
            {enquiries.length}
          </strong>

        </div>

      </div>


      {/* TABLE */}

      <div className="recycle_table_wrapper">

        <table className="user_table">

          <thead>

            <tr>

              <th>#</th>

              <th>Student</th>

              <th>Mobile</th>

              <th>Department</th>

              <th>Programme</th>

              <th>Institution</th>

              <th>Deleted At</th>

              <th>Action</th>

            </tr>

          </thead>


          <tbody>

            {loading ? (

              <tr>

                <td colSpan="8">
                  Loading deleted enquiries...
                </td>

              </tr>

            ) : enquiries.length > 0 ? (

              enquiries.map(
                (enquiry, index) => {

                  const isActionLoading =
                    actionLoadingId ===
                    enquiry._id;

                  return (

                    <tr key={enquiry._id}>

                      <td>
                        {index + 1}
                      </td>


                      <td>
                        {enquiry.studentName || "-"}
                      </td>


                      <td>
                        {enquiry.studentMobile || "-"}
                      </td>


                      <td>
                        {
                          enquiry.departmentId
                            ?.departmentName ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          enquiry.programmeId
                            ?.programmeName ||
                          "-"
                        }
                      </td>


                      <td>
                        {
                          enquiry.institutionId
                            ?.institutionName ||
                          "-"
                        }
                      </td>


                      <td>

                        {
                          enquiry.deletedAt
                            ? new Date(
                                enquiry.deletedAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"
                        }

                      </td>


                      <td className="recycle_actions">

                        <button
                          type="button"
                          disabled={
                            isActionLoading
                          }
                          onClick={() =>
                            handleRestore(
                              enquiry._id
                            )
                          }
                        >

                          {
                            isActionLoading
                              ? "Processing..."
                              : "Restore"
                          }

                        </button>


                        <button
                          type="button"
                          disabled={
                            isActionLoading
                          }
                          onClick={() =>
                            handlePermanentDelete(
                              enquiry._id
                            )
                          }
                        >

                          {
                            isActionLoading
                              ? "Processing..."
                              : "Delete Permanently"
                          }

                        </button>

                      </td>

                    </tr>

                  );

                }
              )

            ) : (

              <tr>

                <td colSpan="8">
                  No deleted enquiries found.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

};


export default Recyclebinenquiry;