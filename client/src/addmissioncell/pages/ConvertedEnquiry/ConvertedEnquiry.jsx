import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../../../api/axios";
import "./convertedenquiry.css";


const ConvertedEnquiry = () => {
  const navigate = useNavigate();
  // ==================== STATES ====================

  const [enquiries, setEnquiries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    totalConversions: 0,
    weeklyConversions: 0,
    totalEnquiries: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    departmentId: "",
    programmeId: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
  });


  // ==================== FETCH DEPARTMENTS ====================

  const fetchDepartments = async () => {
    try {
      const response = await API.get("/institutions/my-institution");

      setDepartments(response.data?.data?.departments || []);
    } catch (error) {
      console.error("Fetch departments error:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch departments."
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

      setProgrammes(response.data?.data || []);
    } catch (error) {
      console.error("Fetch programmes error:", error);

      setProgrammes([]);

      toast.error(
        error.response?.data?.message || "Failed to fetch programmes."
      );
    }
  };


  // ==================== FETCH CONVERTED STUDENTS ====================

  const fetchConvertedEnquiries = async () => {
    try {
      setLoading(true);

      const response = await API.get("/enquiry/converted", {
        params: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search,
          departmentId: filters.departmentId,
          programmeId: filters.programmeId,
        },
      });

      setEnquiries(response.data?.data || []);

      setStats(
        response.data?.stats || {
          totalConversions: 0,
          weeklyConversions: 0,
          totalEnquiries: 0,
        }
      );

      setPagination({
        currentPage: response.data?.page || 1,
        totalPages: response.data?.totalPages || 1,
        totalRecords: response.data?.count || 0,
      });
    } catch (error) {
      console.error("Fetch converted enquiries error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch converted students."
      );
    } finally {
      setLoading(false);
    }
  };


  // ==================== FILTER CHANGE ====================

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    if (name === "departmentId") {
      setFilters((prev) => ({
        ...prev,
        page: 1,
        departmentId: value,
        programmeId: "",
      }));

      setProgrammes([]);

      if (value) fetchProgrammes(value);

      return;
    }

    setFilters((prev) => ({
      ...prev,
      page: 1,
      [name]: value,
    }));
  };


  // ==================== CLEAR FILTERS ====================

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      departmentId: "",
      programmeId: "",
    });

    setProgrammes([]);
  };


  // ==================== PAGINATION ====================

  const previousPage = () => {
    if (filters.page <= 1) return;

    setFilters((prev) => ({
      ...prev,
      page: prev.page - 1,
    }));
  };

  const nextPage = () => {
    if (filters.page >= pagination.totalPages) return;

    setFilters((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };


  // ==================== EFFECTS ====================

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchConvertedEnquiries();
  }, [filters]);


  // ==================== CONVERSION RATE ====================

  const conversionRate =
    stats.totalEnquiries > 0
      ? ((stats.totalConversions / stats.totalEnquiries) * 100).toFixed(1)
      : "0.0";


  // ==================== UI ====================

  return (
    <div className="converted_enquiry_container">

      {/* HEADER */}

{/* ===========================================================
                    PAGE HEADER
=========================================================== */}

<div className="addmissioncell_converted_page_header">

  {/* ================= LEFT ================= */}

  <div className="addmissioncell_converted_header_left">

    <h2 className="addmissioncell_converted_page_title">

      Converted Students

    </h2>

    <p className="addmissioncell_converted_page_subtitle">

      View and manage enquiries successfully converted into students.

    </p>

  </div>

  {/* ================= RIGHT ================= */}

  <div className="addmissioncell_converted_statistics_wrapper">

    {/* TOTAL CONVERSIONS */}

    <div className="addmissioncell_converted_statistics_card">

      <div className="addmissioncell_converted_statistics_header">

        <h5 className="addmissioncell_converted_statistics_title">

          Total Conversions

        </h5>

      </div>

      <div className="addmissioncell_converted_statistics_body">

        <span className="addmissioncell_converted_statistics_line">

          _

        </span>

        <h2 className="addmissioncell_converted_statistics_value">

          {stats.totalConversions}

        </h2>

      </div>

    </div>

    {/* WEEKLY */}

    <div className="addmissioncell_converted_statistics_card">

      <div className="addmissioncell_converted_statistics_header">

        <h5 className="addmissioncell_converted_statistics_title">

          This Week

        </h5>

      </div>

      <div className="addmissioncell_converted_statistics_body">

        <span className="addmissioncell_converted_statistics_line">

          _

        </span>

        <h2 className="addmissioncell_converted_statistics_value">

          {stats.weeklyConversions}

        </h2>

      </div>

    </div>

    {/* CONVERSION RATE */}

    <div className="addmissioncell_converted_statistics_card">

      <div className="addmissioncell_converted_statistics_header">

        <h5 className="addmissioncell_converted_statistics_title">

          Conversions / Total Enquiries

        </h5>

      </div>

      <div className="addmissioncell_converted_statistics_body">

        <span className="addmissioncell_converted_statistics_line">

          _

        </span>

        <h2 className="addmissioncell_converted_statistics_value">

          {stats.totalConversions} / {stats.totalEnquiries}

        </h2>

        <p className="addmissioncell_converted_statistics_rate">

          {conversionRate}% Conversion Rate

        </p>

      </div>

    </div>

  </div>

</div>


      {/* FILTERS */}

{/* ===========================================================
                    FILTER SECTION
=========================================================== */}

<div className="addmissioncell_converted_filter_wrapper">

  {/* SEARCH */}

  <div className="addmissioncell_converted_filter_field">

    <input
      className="addmissioncell_converted_search_input"
      type="text"
      name="search"
      placeholder="Search Student..."
      value={filters.search}
      onChange={handleFilterChange}
    />

  </div>

  {/* DEPARTMENT */}

  <div className="addmissioncell_converted_filter_field">

    <select
      className="addmissioncell_converted_filter_select"
      name="departmentId"
      value={filters.departmentId}
      onChange={handleFilterChange}
    >

      <option value="">

        All Departments

      </option>

      {

        departments.map((department)=>(

          <option
            key={department._id}
            value={department._id}
          >

            {department.departmentName}

          </option>

        ))

      }

    </select>

  </div>

  {/* PROGRAMME */}

  <div className="addmissioncell_converted_filter_field">

    <select
      className="addmissioncell_converted_filter_select"
      name="programmeId"
      value={filters.programmeId}
      onChange={handleFilterChange}
      disabled={!filters.departmentId}
    >

      <option value="">

        All Programmes

      </option>

      {

        programmes.map((programme)=>(

          <option
            key={programme._id}
            value={programme._id}
          >

            {programme.programmeName}

          </option>

        ))

      }

    </select>

  </div>

  {/* CLEAR */}

  <button
    className="addmissioncell_converted_clear_filter_btn"
    type="button"
    onClick={clearFilters}
  >

    Clear Filters

  </button>

</div>


      {/* TABLE */}

{/* ===========================================================
                        TABLE SECTION
=========================================================== */}

<div className="addmissioncell_converted_table_wrapper">

  <table className="addmissioncell_converted_table">

    {/* ================= TABLE HEADER ================= */}

    <thead className="addmissioncell_converted_table_header">

      <tr>

        <th>
          <h4 className="addmissioncell_converted_table_heading">
            #
          </h4>
        </th>

        <th>
          <h4 className="addmissioncell_converted_table_heading">
            Student
          </h4>
        </th>

        <th>
          <h4 className="addmissioncell_converted_table_heading">
            Mobile
          </h4>
        </th>

        <th>
          <h4 className="addmissioncell_converted_table_heading">
            Department
          </h4>
        </th>

        <th>
          <h4 className="addmissioncell_converted_table_heading">
            Programme
          </h4>
        </th>

        <th>
          <h4 className="addmissioncell_converted_table_heading">
            Converted By
          </h4>
        </th>

        <th>
          <h4 className="addmissioncell_converted_table_heading">
            Converted Date
          </h4>
        </th>

      </tr>

    </thead>

    {/* ================= TABLE BODY ================= */}

    <tbody className="addmissioncell_converted_table_body">

      {

        loading ? (

          <tr>

            <td
              colSpan="7"
              className="addmissioncell_converted_no_data"
            >

              Loading converted students...

            </td>

          </tr>

        ) : enquiries.length > 0 ? (

          enquiries.map((enquiry, index) => (

<tr
  key={enquiry._id}
  className="addmissioncell_converted_table_row"
  onClick={() =>
    navigate(
      `/admission-cell/Convertion/${enquiry.studentId}`
    )
  }
>   

              {/* S.NO */}

              <td>

                <h4 className="addmissioncell_converted_table_data">

                  {

                    ((pagination.currentPage - 1) * filters.limit) +

                    index +

                    1

                  }

                </h4>

              </td>

              {/* STUDENT */}

              <td>

                <h4 className="addmissioncell_converted_table_data">

                  {enquiry.studentName || "-"}

                </h4>

              </td>

              {/* MOBILE */}

              <td>

                <h4 className="addmissioncell_converted_table_data">

                  {enquiry.studentMobile || "-"}

                </h4>

              </td>

              {/* DEPARTMENT */}

              <td>

                <h4 className="addmissioncell_converted_table_data">

                  {enquiry.departmentId?.departmentName || "-"}

                </h4>

              </td>

              {/* PROGRAMME */}

              <td>

                <h4 className="addmissioncell_converted_table_data">

                  {enquiry.programmeId?.programmeName || "-"}

                </h4>

              </td>

              {/* CONVERTED BY */}

              <td>

                <h4 className="addmissioncell_converted_table_data">

                  {enquiry.convertedBy?.fullName || "-"}

                </h4>

              </td>

              {/* CONVERTED DATE */}

              <td>

                <h4 className="addmissioncell_converted_table_data">

                  {

                    enquiry.convertedAt

                      ?

                      new Date(

                        enquiry.convertedAt

                      ).toLocaleDateString("en-IN")

                      :

                      "-"

                  }

                </h4>

              </td>

            </tr>

          ))

        ) : (

          <tr>

            <td
              colSpan="7"
              className="addmissioncell_converted_no_data"
            >

              No Converted Students Found

            </td>

          </tr>

        )

      }

    </tbody>

  </table>

</div>


      {/* PAGINATION */}

{/* ===========================================================
                    PAGINATION
=========================================================== */}

<div className="addmissioncell_converted_pagination_wrapper">

  <button
    className="addmissioncell_converted_pagination_btn"
    type="button"
    onClick={previousPage}
    disabled={
      pagination.currentPage <= 1 ||
      loading
    }
  >

    Previous

  </button>

  <div className="addmissioncell_converted_pagination_info">

    <span>

      Page

    </span>

    <strong>

      {pagination.currentPage}

    </strong>

    <span>

      of

    </span>

    <strong>

      {pagination.totalPages}

    </strong>

  </div>

  <button
    className="addmissioncell_converted_pagination_btn"
    type="button"
    onClick={nextPage}
    disabled={
      pagination.currentPage >=
        pagination.totalPages ||
      loading
    }
  >

    Next

  </button>

</div>

    </div>
  );
};

export default ConvertedEnquiry;