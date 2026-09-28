import { useEffect, useState } from "react";
import API ,{ SERVER_URL } from "../../../api/axios";
import { FadersHorizontalIcon ,GenderMaleIcon ,GenderFemaleIcon ,UserPlusIcon ,PencilSimpleLineIcon ,TrashSimpleIcon } from "@phosphor-icons/react";
import useEmblaCarousel from "embla-carousel-react";
import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import "./facultypage.css";

function Facultypage() {
const navigate =
  useNavigate();
  // ===============================
  // DESIGNATIONS
  // ===============================

const teachingDesignations = [
  "hod",
  "professor",
  "associate_professor",
  "assistant_professor",
  "lecturer",
];

const nonTeachingDesignations = [
  "lab_incharge",
  "office_assistant",
  "admission_officer",
];

  // ===============================
  // TABLE DATA
  // ===============================

  const [staff, setStaff] =
    useState([]);

  const [statistics, setStatistics] =
    useState({});

  const [pagination, setPagination] =
    useState({});

  const [institutions, setInstitutions] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);





    // Filter dropdowns
const [filterDepartments, setFilterDepartments] = useState([]);

// Form dropdowns
const [formDepartments, setFormDepartments] = useState([]);

  // ===============================
  // FILTERS
  // ===============================

  const [filters, setFilters] =
    useState({
      page: 1,
      limit: 10,

      search: "",

      institution: "",

      department: "",

      designation: "",

      gender: "",
    });

  // ===============================
  // MODAL
  // ===============================

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [mode, setMode] =
    useState("create");

  const [selectedUser, setSelectedUser] =
    useState(null);

  // ===============================
  // FORM
  // ===============================

  const [formData, setFormData] =
    useState({

      fullName: "",

      email: "",

      phone: "",

      password: "",

      role: "",

      institution: "",

      department: "",

      profile: {

        employeeId: "",

        designation: "",

        gender: "",

      },

    });


    const resetForm = () => {

  setFormData({

    fullName: "",

    email: "",

    phone: "",

    password: "",

    role: "",

    institution: "",

    department: "",

    profile: {

      employeeId: "",

      designation: "",

      gender: "",

    },

  });

  setProfileImage(null);

  setPreviewImage(null);

  setSelectedUser(null);

  setFormDepartments([]);

};


const [isMobile, setIsMobile] = useState(
  window.innerWidth <= 978
);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 978);
  };

  window.addEventListener(
    "resize",
    handleResize
  );

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );
}, []);


  // ===============================
// PROFILE IMAGE
// ===============================

const [profileImage, setProfileImage] =
  useState(null);

const [previewImage, setPreviewImage] =
  useState(null);


  // ===============================
  // CRUD
  // ===============================

  const openCreateModal =
    () => {

  resetForm();

setMode("create");

setIsModalOpen(true);

    };

const openEditModal = async (user) => {

  try {

    const token =
      localStorage.getItem("token");

    setMode("edit");

    setSelectedUser(user);

    const response =
      await API.get(
        `/users/${user.user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    const data =
      response.data.data;

    setFormData({

      fullName:
        data.fullName || "",

      email:
        data.email || "",

      phone:
        data.phone || "",

      password: "",

      role:
        data.role || "",

      institution:
        data.institution || "",

      department:
        data.department || "",

      profile: {

        employeeId:
          data.profile?.employeeId || "",

        designation:
          data.profile?.designation || "",

        gender:
          data.profile?.gender || "",

      },

    });

    setPreviewImage(
  data.profileImage || null
);

setProfileImage(null);

    setIsModalOpen(true);

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to fetch user."

    );

  }

};

const closeModal = () => {

  setIsModalOpen(false);

  resetForm();

  setMode("create");

};


const handleDelete = async (
  userId
) => {

  const confirmDelete =
    window.confirm(
      "Are you sure you want to move this user to the recycle bin?"
    );

  if (!confirmDelete)
    return;

  try {

    const token =
      localStorage.getItem(
        "token"
      );

    const response =
      await API.delete(

        `/users/${userId}`,

        {

          headers: {

            Authorization:
              `Bearer ${token}`,

          },

        }

      );

    toast.success(
      response.data.message
    );

    await fetchStaff();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to delete user."

    );

  }

};

const handleSubmit = async (e) => {

  e.preventDefault();

  try {

    setLoading(true);

    const token =
      localStorage.getItem("token");

    const submitData =
      new FormData();

    submitData.append(
      "fullName",
      formData.fullName
    );

    submitData.append(
      "email",
      formData.email
    );

    submitData.append(
      "phone",
      formData.phone
    );

    submitData.append(
      "password",
      formData.password
    );

    submitData.append(
      "role",
      formData.role
    );

    submitData.append(
      "institution",
      formData.institution
    );

    submitData.append(
      "department",
      formData.department
    );

    submitData.append(
      "profile",
      JSON.stringify(
        formData.profile
      )
    );

    if (profileImage) {

      submitData.append(
        "profileImage",
        profileImage
      );

    }

    const response =

      mode === "create"

        ? await API.post(

            "/users/create",

            submitData,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "multipart/form-data",

              },

            }

          )

        : await API.put(

            `/users/${selectedUser.user._id}`,

            submitData,

            {

              headers: {

                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "multipart/form-data",

              },

            }

          );

    toast.success(
      response.data.message
    );

    closeModal();

    await fetchStaff();

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to save user."

    );

  } finally {

    setLoading(false);

  }

};

const [loading, setLoading] =
  useState(false);
  




  // ===============================
  // FETCH FUNCTIONS
  // ===============================
const fetchInstitutions =
  async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response =
        await API.get(
          "/institutions",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setInstitutions(
        response.data.data
      );
 console.log(institutions);
    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Failed to fetch institutions."
      );

    }

  };

const fetchDepartments = async (
  institutionId
) => {

  try {

    const token =
      localStorage.getItem("token");

    const response =
      await API.get(
        `/institutions/${institutionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

 setFormDepartments(
  response.data.data.departments
);

  } catch (error) {

    toast.error(
      error.response?.data?.message ||
      "Failed to fetch departments."
    );

    setDepartments([]);

  }

};

// ===============================
// FETCH FILTER DEPARTMENTS
// ===============================

const fetchFilterDepartments = async (
  institutionId
) => {

  try {

    const token =
      localStorage.getItem("token");

    const response =
      await API.get(
        `/institutions/${institutionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    setFilterDepartments(
      response.data.data.departments
    );

  } catch (error) {

    setFilterDepartments([]);

  }

};

// ===============================
// FETCH STAFF
// ===============================

const fetchStaff = async () => {

  try {

    const token =
      localStorage.getItem("token");

    const response =
      await API.get(
        "/users/assignable-staff",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          params: filters,
        }
      );

    setStaff(response.data.data);
console.log(response.data.data)
    setStatistics(
      response.data.statistics
    );

    setPagination(
      response.data.pagination
    );

  } catch (error) {

    toast.error(

      error.response?.data?.message ||

      "Failed to fetch staff."

    );

  }

};


  // ===============================
  // FORM HANDLERS
  // ===============================
const handleChange = (e) => {

  const { name, value } = e.target;

  setFormData((prev) => {

    const updated = {

      ...prev,

      [name]: value,

    };

    if (name === "institution") {
      updated.department = "";
    }

 if (name === "role") {

  updated.profile = {
    ...prev.profile,
    designation: "",
  };

  // Clear organization fields when role changes
  updated.institution = "";
  updated.department = "";

}
    return updated;

  });

};



const handleProfileChange = (e) => {

  const { name, value } = e.target;

  setFormData((prev) => ({

    ...prev,

    profile: {

      ...prev.profile,

      [name]: value,

    },

  }));

};

// ===============================
// PROFILE IMAGE
// ===============================

const handleProfileImageChange = (
  e
) => {

  const file =
    e.target.files[0];

  if (!file) return;

  setProfileImage(file);

  setPreviewImage(
    URL.createObjectURL(file)
  );

};

  // ===============================
  // FILTER HANDLERS
  // ===============================
const handleFilterChange = (e) => {

  const { name, value } = e.target;

  setFilters((prev) => {

    const updated = {

      ...prev,

      page: 1,

      [name]: value,

    };

    if (name === "institution") {

      updated.department = "";

    }

    return updated;

  });

};

const goToPreviousPage = () => {

  if (filters.page === 1)
    return;

  setFilters((prev) => ({
    ...prev,
    page: prev.page - 1,
  }));

};

const goToNextPage = () => {

  if (
    filters.page >=
    pagination.totalPages
  )
    return;

  setFilters((prev) => ({
    ...prev,
    page: prev.page + 1,
  }));

};


const trimInstitutionName = (name) => {
  if (!name) return "-";

  return window.innerWidth <= 768
    ? name.split(" ").slice(3).join(" ")
    : name;
};
const getShortInstitutionName = (name) => {
  if (!name) return "-";

  return name
    .trim()
    .split(/\s+/)
    .slice(3)
    .join(" ");
};





const [emblaRef] = useEmblaCarousel({
  loop: true,
});
  // ===============================
  // USE EFFECT
  // ===============================

useEffect(() => {

  fetchInstitutions();

}, []);

useEffect(() => {

  fetchStaff();

}, [filters]);


useEffect(() => {

  if (formData.institution) {

    fetchDepartments(
      formData.institution
    );

  } else {

    setFilterDepartments([]);

  }

}, [formData.institution]);

useEffect(() => {

  if (filters.institution) {

    fetchFilterDepartments(
      filters.institution
    );

  } else {

    setFilterDepartments([]);

  }

}, [filters.institution]);
  // ===============================
  // JSX
  // ===============================

  return (

<div className="user_management_container">

    {/* Header */}

    <div className="user_management_header">
<div className="usermanagment_lhs_wrapper">

   <div>

            <h2 className="page_title">
                facultylist  page
            </h2>

           

        </div>

        <div
            className="create_user_btn"
            onClick={openCreateModal}
        >
          <UserPlusIcon className="user_crt_icon" />
            <h4 className="user_crt_title"> Create faculty</h4> 
        </div>


</div>
       
<div
  className="statistics_wrapper"
  ref={isMobile ? emblaRef : null}
>



      <div className="stat_cardone">

<div className="cardheader_wrapper">
        <h5 className="stc_card_title_field">Total faculty</h5>
<FadersHorizontalIcon  className="card_header_icons" />
</div>
<div className="card_body_wrapper">

<span className="stccard_sepration">_</span>

        <h2 className="stc_data_display">
          
            {statistics.totalStaff || 0}
        </h2>
</div>


</div>

<div className="stat_cardtwo">
<div className="cardheader_wrapper">
        <h5 className="stc_card_title_field">Teaching</h5>
<FadersHorizontalIcon  className="card_header_icons" />
  
</div>
<div className="card_body_wrapper">
<span className="stccard_sepration">_</span>


  <h2 className="stc_data_display">
            {statistics.teachingCount || 0}
        </h2>
</div>


      

</div>

<div className="stat_cardthree">
<div className="cardheader_wrapper">
        <h5 className="stc_card_title_field">Non Teaching</h5>

<FadersHorizontalIcon  className="card_header_icons" />

</div>
<div className="card_body_wrapper">
<span className="stccard_sepration">_</span>


 <h2 className="stc_data_display">
            {statistics.nonTeachingCount || 0}
        </h2>
</div>
       

</div>

<div className="stc_Card_four">

<div className="cardheader_wrapper">
  <h2 className="stc_card_title_field">male/female</h2>

<FadersHorizontalIcon  className="card_header_icons" />


</div>

  
  <div className="card_four_body">
<div className="gender_card_one">
  <GenderMaleIcon className="gender_Data_icons"  />
   <h2 className="stc_data_display">{statistics.maleCount || 0}</h2>
</div> 

<div className="gender_card_two">
  <GenderFemaleIcon className="gender_Data_icons" />

<h2 className="stc_data_display">{statistics.femaleCount || 0}</h2>
</div>
  </div>

</div> 


   

  

</div>


    </div>

{/* <NavLink to ="/hr/bin"className="bin">
 
 <h2> recyclebin</h2> 
</NavLink> */}


<div className="filter_section">
<input
className="serchbar_field"
  type="text"
  name="search"
  placeholder="  Search by Name, Email or Employee ID"

  value={filters.search}

  onChange={handleFilterChange}
/>


<select

  name="institution"

  value={filters.institution}

  onChange={handleFilterChange}
className="dropdown_filter"
>

<option value="">
All Institutions
</option>

{

institutions.map((item)=>(

<option
key={item._id}
value={item._id}
>

{item.institutionName}

</option>

))

}

</select>

<select

name="department"

value={filters.department}

onChange={handleFilterChange}
className="dropdown_filter"
>

<option value="">
All Departments
</option>

{

filterDepartments.map((item) => (

<option

key={item._id}

value={item._id}

>

{item.departmentName}

</option>

))

}

</select>

<select
  name="designation"
  value={filters.designation}
  onChange={handleFilterChange}
  className="dropdown_filter"
>
  <option value="">
    All Designations
  </option>

{
[
  ...teachingDesignations,
  ...nonTeachingDesignations,
].map((designation) => (

  <option
    key={designation}
    value={designation}
  >
    {designation
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())}
  </option>

))
}
</select>


<select

name="gender"

value={filters.gender}

onChange={handleFilterChange}
className="dropdown_filter"
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


<div >

  <table  className="table_container" >


{/* <div className="table_header_wrapper">
  
</div> */}
    <thead className="table_header">

 <tr >

       <th >

  <input
className="checkbox_hr"
type="checkbox"

onClick={(e)=>

e.stopPropagation()

}

/>

</th>

<th  className="table_header_field" > <h4 className="hr_table_title_one">sno</h4></th>

<th> <h4 className="hr_table_title_two">Employee ID</h4></th>

<th><h4 className="hr_table_title_three"> Profile</h4></th>

<th><h4 className="hr_table_title_four"> Name</h4></th>

<th> <h4 className="hr_table_title_five"> Institution</h4> </th>

<th>  <h4 className="hr_table_title_six"> Department</h4></th>

<th>  <h4 className="hr_table_title_seven">Designation</h4></th>

<th>  <h4 className="hr_table_title_eight"> Gender</h4></th>

<th>  <h4 className="hr_table_title_nine"> Faculty Type</h4></th>

<th>  <h4 className="hr_table_title_ten">Action</h4></th>

      </tr>

     

    </thead>

    <tbody className="table_body">
      {
  staff.length === 0 ? (

    <tr>

      <td
         colSpan="11"
  className="no_data"
      >
        No Staff Found
      </td>

    </tr>

  ) : (

   staff.map((item, index) => (

<tr

key={item._id}

className="clickable_row"

onClick={() =>

navigate(

`/hr/faculty/profile/${item.user._id}`

)

}

>

  <td><input className="checkbox_hr" type="checkbox"/></td>



<td>{
((pagination.currentPage - 1) * filters.limit)
+ index + 1
}

</td>

<td><h4 className="hr_table_data_one"> {item.employeeId}</h4></td>

<td>{item.user?.profileImage ? (

<img
className="pfp"
  src={`${SERVER_URL}${item.user.profileImage}`}
  alt={item.user.fullName}
/>

) : (

<div className="table_avatar">
<h4 className="hr_table_data_two">
  {

item.user?.fullName?.charAt(0)?.toUpperCase()

}
</h4>


</div>

)

}

</td>

<td> <h4 className="hr_table_data_three">{item.user.fullName}</h4></td>

<td>
  <h4
    className="hr_table_data_four"
    data-short={getShortInstitutionName(
      item.institution?.institutionName
    )}
  >
    {getShortInstitutionName(
      item.institution?.institutionName
    )}
  </h4>
</td>



<td> <h4 className="hr_table_data_five"> {item.department?.[0]?.departmentName?.[0] || "-"}</h4></td>

<td>
  <h4 className="hr_table_data_six">
{
item.designation
.replace(/_/g," ")
.replace(/\b\w/g,
c=>c.toUpperCase())
}
  </h4>


</td>

<td> <h4 className="hr_table_data_seven">{item.gender}</h4></td>

<td><h4 className="hr_table_data_eight">{item.facultyType}</h4></td>



<td>
<div className="action_cta_wrapper">

<div

onClick={(e)=>{

e.stopPropagation();

openEditModal(item);

}}

>

<PencilSimpleLineIcon  />

</div>

<div

onClick={(e)=>{

e.stopPropagation();

handleDelete(
item.user._id
);

}}

>

<TrashSimpleIcon />

</div>
</div>
</td>



</tr>

))

  )
}

    </tbody>

  </table>

  {
  isModalOpen && (

    <div
      className="drawer_overlay"
      onClick={closeModal}
    >

      <div
        className="user_drawer"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

    <div className="drawer_header">

  <h2>
    {
      mode === "create"
        ? "Create User"
        : "Update User"
    }
  </h2>

  <button onClick={closeModal}>
    ✕
  </button>

</div>

<form className="drawer_body"
 onSubmit={handleSubmit}>


  {/* ===============================
    PROFILE PICTURE
================================ */}

<div className="drawer_section">

  <div className="drawer_section_header">

    <span
      className="drawer_section_title"
    >

      Profile Picture

    </span>

    <div className="drawer_section_divider"></div>

  </div>

  <div className="profile_upload_wrapper">

    {

      previewImage ? (

        <img

          src={previewImage}

          alt="Profile"

          className="profile_preview"

        />

      ) : (

        <div
          className="profile_preview_empty"
        >

          {

            formData.fullName
              ?.charAt(0)
              ?.toUpperCase() ||

            "?"

          }

        </div>

      )

    }

    <input

      type="file"

      accept=".jpg,.jpeg,.png,.webp"

      onChange={
        handleProfileImageChange
      }

    />

    <small>

      JPG, PNG or WEBP

      (Maximum 2 MB)

    </small>

  </div>

</div>

  {/* ===============================
      BASIC INFORMATION
  =============================== */}

  <div className="drawer_section">

    <div className="drawer_section_header">

      <span className="drawer_section_title">
        Basic Information
      </span>

      <div className="drawer_section_divider"></div>

    </div>

    <div className="drawer_grid">


  <div className="form_group">

    <label className="form_label">
      Full Name
    </label>

    <input
      type="text"
      name="fullName"
      className="form_input"
      placeholder="Enter Full Name"
      value={formData.fullName}
      onChange={handleChange}
    />

  </div>

  <div className="form_group">

    <label className="form_label">
      Email
    </label>

    <input
      type="email"
      name="email"
      className="form_input"
      placeholder="Enter Email"
      value={formData.email}
      onChange={handleChange}
    />

  </div>

  <div className="form_group">

    <label className="form_label">
      Phone Number
    </label>

    <input
      type="text"
      name="phone"
      className="form_input"
      placeholder="Enter Phone Number"
      value={formData.phone}
      onChange={handleChange}
    />

  </div>

  <div className="form_group">

    <label className="form_label">
      Password
    </label>

    <input
      type="password"
      name="password"
      className="form_input"
      placeholder="Enter Password"
      value={formData.password}
      onChange={handleChange}
    />

  </div>


    </div>

  </div>



  {/* ===============================
      EMPLOYMENT
  =============================== */}

  <div className="drawer_section">

    <div className="drawer_section_header">

      <span className="drawer_section_title">
        Employment
      </span>

      <div className="drawer_section_divider"></div>

    </div>

    <div className="drawer_grid">

     <div className="form_group">

  <label className="form_label">
    Role
  </label>

  <select
    className="form_select"
    name="role"
    value={formData.role}
    onChange={handleChange}
  >

    <option value="">
      Select Role
    </option>

    <option value="teaching_faculty">
      Teaching Faculty
    </option>

    <option value="non_teaching_faculty">
      Non Teaching Faculty
    </option>

  </select>

</div>

      {/* Designation */}
<div className="form_group">

  <label className="form_label">
    Designation
  </label>

  <select
    className="form_select"
    name="designation"
    value={formData.profile.designation}
    onChange={handleProfileChange}
  >

    <option value="">
      Select Designation
    </option>

    {

      (
        formData.role === "teaching_faculty"
          ? teachingDesignations
          : formData.role === "non_teaching_faculty"
          ? nonTeachingDesignations
          : []
      ).map((designation) => (

        <option
          key={designation}
          value={designation}
        >

          {designation
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            )}

        </option>

      ))

    }

  </select>

</div>


      {/* Employee ID */}
<div className="form_group">

  <label className="form_label">
    Employee ID
  </label>

  <input
    className="form_input"
    type="text"
    name="employeeId"
    placeholder="Employee ID"
    value={formData.profile.employeeId}
    onChange={handleProfileChange}
  />

</div>


      {/* Gender */}

      <div className="form_group">

  <label className="form_label">
    Gender
  </label>

  <select
    className="form_select"
    name="gender"
    value={formData.profile.gender}
    onChange={handleProfileChange}
  >

    <option value="">
      Select Gender
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

  </div>



  {/* ===============================
      ORGANIZATION
  =============================== */}

  <div className="drawer_section">

    <div className="drawer_section_header">

      <span className="drawer_section_title">
        Organization
      </span>

      <div className="drawer_section_divider"></div>

    </div>


    <div className="drawer_grid">

  {/* Institution */}

  <div className="form_group">

    <label className="form_label">
      Institution
    </label>

    <select
      className="form_select"
      name="institution"
      value={formData.institution}
      onChange={handleChange}
    >

      <option value="">
        Select Institution
      </option>

      {

        institutions.map((item) => (

          <option
            key={item._id}
            value={item._id}
          >

            {item.institutionName}

          </option>

        ))

      }

    </select>

  </div>

  {/* Department */}

{/* Department */}

{formData.role === "teaching_faculty" && (

  <div className="form_group">

    <label className="form_label">
      Department
    </label>

    <select
      className="form_select"
      name="department"
      value={formData.department}
      onChange={handleChange}
    >

      <option value="">
        Select Department
      </option>

      {

  formDepartments.map((item) => (

          <option
            key={item._id}
            value={item._id}
          >

            {item.departmentName}

          </option>

        ))

      }

    </select>

  </div>

)}

</div>

 

  </div>



  {/* ===============================
      ACTION BUTTONS
  =============================== */}

  <div className="drawer_footer">

    <button
      type="button"
      className="cancel_btn"
      onClick={closeModal}
    >
      Cancel
    </button>

 <button
  type="submit"
  className="submit_btn"
  disabled={loading}
>

  {

loading

  ? mode === "create"

    ? "Creating..."

    : "Updating..."

  : mode === "create"

  ? "Create User"

  : "Update User"

  }

</button>

  </div>

</form>



      </div>

    </div>

  )
}


<div className="record_info">

Showing

{" "}

<strong>

{staff.length}

</strong>

of

{" "}

<strong>

{pagination.totalRecords || 0}

</strong>

Records

</div>


{/* pagination toogle */}
  <div className="pagination_wrapper">

  <button

    onClick={
      goToPreviousPage
    }

    disabled={
      filters.page === 1
    }

  >

    Previous

  </button>

  <span>

    Page

    {" "}

    {pagination.currentPage || 1}

    {" "}of{" "}

    {pagination.totalPages || 1}

  </span>

  <button

    onClick={
      goToNextPage
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

</div>

);

}

export default Facultypage;