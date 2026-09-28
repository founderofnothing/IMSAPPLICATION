import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";

import API, {
  SERVER_URL,
} from "../../../../api/axios";


const FacultyBin = () => {

  /* ===============================
      STATES
  =============================== */

  const [users, setUsers] =
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

      type: "",

      gender: "",

    });

  /* ===============================
      API FUNCTIONS
  =============================== */
const fetchDeletedUsers = async () => {

  try {

    setLoading(true);

    const response =
      await API.get(
        "/users/recycle-bin",
        {
          params: filters,
        }
      );

    setUsers(
      response.data.data.users
    );

    setPagination({

      currentPage:
        response.data.data.currentPage,

      totalPages:
        response.data.data.totalPages,

      totalRecords:
        response.data.data.totalRecords,

    });

  } catch (error) {

    toast.error(
      error.response?.data?.message ||

      "Failed to fetch deleted users."
    );

  } finally {

    setLoading(false);

  }

};


  /* ===============================
      USE EFFECT
  =============================== */

useEffect(() => {

  fetchDeletedUsers();

}, [filters]);

  /* ===============================
      HANDLERS
  =============================== */
const handleRestore = async (
  userId
) => {

  const confirmRestore =
    window.confirm(
      "Restore this user?"
    );

  if (!confirmRestore)
    return;

  try {

    const response =
      await API.put(
        `/users/${userId}/restore`
      );

    toast.success(
      response.data.message
    );

    fetchDeletedUsers();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to restore user."

    );

  }

};

const handleFilterChange = (
  e
) => {

  setFilters((prev) => ({

    ...prev,

    page: 1,

    [e.target.name]:
      e.target.value,

  }));

};

const goToNextPage = () => {

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

const goToPreviousPage = () => {

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


return (

<div className="faculty_bin_container">
<NavLink to ="/hr"className="bin">
 
 <h2>faculty list</h2> 
</NavLink>
  {/* ===============================
      HEADER
  =============================== */}

  <div className="page_header">

    <h2>
      Faculty Recycle Bin
    </h2>

    <div className="header_filters">

      <input

        type="text"

        name="search"

        placeholder="Search Employee / Name"

        value={filters.search}

        onChange={handleFilterChange}

      />

      <select

        name="type"

        value={filters.type}

        onChange={handleFilterChange}

      >

        <option value="">

          All Faculty

        </option>

        <option value="teaching">

          Teaching

        </option>

        <option value="non_teaching">

          Non Teaching

        </option>

      </select>

      <select

        name="gender"

        value={filters.gender}

        onChange={handleFilterChange}

      >

        <option value="">

          All Gender

        </option>

        <option value="male">

          Male

        </option>

        <option value="female">

          Female

        </option>

        <option value="other">

          Other

        </option>

      </select>

    </div>

  </div>



{/* ===============================
      TABLE
=============================== */}

<div className="table_wrapper">

<table className="user_table">

<thead>

<tr>

<th>#</th>

<th>Employee ID</th>

<th>Profile</th>

<th>Name</th>

<th>Institution</th>

<th>Faculty Type</th>

<th>Gender</th>

<th>Restore</th>

</tr>

</thead>

<tbody>

{

users.length === 0 ? (

<tr>

<td
colSpan="8"
className="no_data"
>

No Deleted Users

</td>

</tr>

)

:

users.map((item,index)=>(

<tr key={item._id}>

<td>

{

((pagination.currentPage - 1)

* filters.limit)

+

index

+

1

}

</td>

<td>

{item.employeeId}

</td>

<td>

{

item.user?.profileImage ? (

<img

src={`${SERVER_URL}${item.user.profileImage}`}

alt={item.user.fullName}

className="table_profile"

/>

)

:

(

<div className="table_avatar">

{

item.user?.fullName

?.charAt(0)

?.toUpperCase()

||

"?"

}

</div>

)

}

</td>

<td>

{item.user?.fullName || "-"}

</td>

<td>

{

item.institution?.institutionName ||

"-"

}

</td>

<td>

{item.facultyType || "-"}

</td>

<td>

{

item.gender

?

item.gender.charAt(0).toUpperCase()

+

item.gender.slice(1)

:

"-"

}

</td>

<td>

<button

className="restore_btn"

onClick={() =>

handleRestore(

item.user._id

)

}

>

Restore

</button>

</td>

</tr>

))

}

</tbody>

</table>

</div>



{/* ===============================
      RECORD INFO
=============================== */}

<div className="record_info">

Showing

{" "}

<strong>

{users.length}

</strong>

of

{" "}

<strong>

{pagination.totalRecords}

</strong>

Records

</div>



{/* ===============================
      PAGINATION
=============================== */}

<div className="pagination_wrapper">

<button

onClick={

goToPreviousPage

}

disabled={

filters.page===1

}

>

Previous

</button>

<span>

Page

{" "}

{pagination.currentPage}

{" "}

of

{" "}

{pagination.totalPages}

</span>

<button

onClick={

goToNextPage

}

disabled={

filters.page===

pagination.totalPages

||

pagination.totalPages===0

}

>

Next

</button>

</div>

</div>

);

};

export default FacultyBin;