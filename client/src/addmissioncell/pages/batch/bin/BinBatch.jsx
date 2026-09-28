import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../../../api/axios.js";
import { NavLink } from "react-router-dom";

const BinBatch = () => {

  /* ===============================
      STATES
  =============================== */

  const [batches, setBatches] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [pagination, setPagination] =
    useState({

      currentPage: 1,

      totalPages: 1,

      totalRecords: 0,

    });

  const [filters, setFilters] =
    useState({

      page: 1,

      limit: 10,

      search: "",

      status: "",

    });

  /* ===============================
      FETCH DELETED BATCHES
  =============================== */

  const fetchDeletedBatches =
    async () => {

      try {

        setLoading(true);

        const response =
          await API.get(
            "/batch/deleted/recycle-bin",
            {
              params:
                filters,
            }
          );

        setBatches(
          response.data.data
        );

        setPagination({

          currentPage:
            response.data.currentPage,

          totalPages:
            response.data.totalPages,

          totalRecords:
            response.data.totalRecords,

        });

      } catch (error) {

        toast.error(

          error.response
            ?.data
            ?.message ||

          "Failed to fetch deleted batches."

        );

      } finally {

        setLoading(false);

      }

    };

  useEffect(() => {

    fetchDeletedBatches();

  }, [filters]);

  /* ===============================
      FILTERS
  =============================== */

  const handleFilterChange =
    (e) => {

      setFilters((prev) => ({

        ...prev,

        page: 1,

        [e.target.name]:
          e.target.value,

      }));

    };

  /* ===============================
      PAGINATION
  =============================== */

  const nextPage = () => {

    if (
      filters.page <
      pagination.totalPages
    ) {

      setFilters((prev) => ({

        ...prev,

        page:
          prev.page + 1,

      }));

    }

  };

  const previousPage = () => {

    if (
      filters.page > 1
    ) {

      setFilters((prev) => ({

        ...prev,

        page:
          prev.page - 1,

      }));

    }

  };

  /* ===============================
      RESTORE BATCH
  =============================== */

  const handleRestore =
    async (batchId) => {

      const confirmRestore =
        window.confirm(
          "Restore this batch?"
        );

      if (
        !confirmRestore
      ) return;

      try {

        await API.put(
          `/batch/recycle/${batchId}/restore`
        );

        toast.success(
          "Batch restored successfully."
        );

        fetchDeletedBatches();

      } catch (error) {

        toast.error(

          error.response
            ?.data
            ?.message ||

          "Failed to restore batch."

        );

      }

    };

  return (

    <div className="batch_container">

      {/* HEADER */}
<NavLink to="/admission-cell/batch">
    <h3>batch</h3>
</NavLink>
      <div className="page_header">

        <h2>

          Batch Recycle Bin

        </h2>

      </div>

      {/* FILTERS */}

      <div className="filter_wrapper">

        <input
          type="text"
          name="search"
          placeholder="Search Batch"
          value={
            filters.search
          }
          onChange={
            handleFilterChange
          }
        />

        <select
          name="status"
          value={
            filters.status
          }
          onChange={
            handleFilterChange
          }
        >

          <option value="">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Completed">
            Completed
          </option>

        </select>

      </div>

      {/* TABLE */}

      <div className="table_wrapper">

        <table className="user_table">

          <thead>

            <tr>

              <th>#</th>

              <th>Batch Name</th>

              <th>Academic Period</th>

              <th>Current Year</th>

              <th>Status</th>

              <th>Deleted At</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>

            {

              loading ?

              (

                <tr>

                  <td
                    colSpan="7"
                    className="no_data"
                  >

                    Loading...

                  </td>

                </tr>

              )

              :

              batches.length === 0 ?

              (

                <tr>

                  <td
                    colSpan="7"
                    className="no_data"
                  >

                    No Deleted Batches Found

                  </td>

                </tr>

              )

              :

              batches.map(
                (
                  item,
                  index
                ) => (

                  <tr
                    key={item._id}
                  >

                    <td>

                      {
                        (
                          (
                            pagination.currentPage -
                            1
                          ) *
                          filters.limit
                        ) +
                        index +
                        1
                      }

                    </td>

                    <td>

                      {item.batchName}

                    </td>

                    <td>

                      {
                        item.admissionYear
                      }

                      {" - "}

                      {
                        item.graduationYear
                      }

                    </td>

                    <td>

                      {
                        item.currentYear
                      } Year

                    </td>

                    <td>

                      {
                        item.status
                      }

                    </td>

                    <td>

                      {
                        new Date(
                          item.deletedAt
                        ).toLocaleDateString()
                      }

                    </td>

                    <td>

                      <button
                        onClick={() =>
                          handleRestore(
                            item._id
                          )
                        }
                      >

                        Restore

                      </button>

                    </td>

                  </tr>

                )
              )

            }

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="pagination_wrapper">

        <button
          onClick={
            previousPage
          }
          disabled={
            filters.page === 1
          }
        >

          Previous

        </button>

        <span>

          Page

          {
            pagination.currentPage
          }

          of

          {
            pagination.totalPages
          }

        </span>

        <button
          onClick={
            nextPage
          }
          disabled={
            filters.page ===
              pagination.totalPages ||
            pagination.totalPages === 0
          }
        >

          Next

        </button>

      </div>

    </div>

  );

};

export default BinBatch;