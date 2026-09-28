import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import "./Sidebar.css"
const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="hod_sidenav_container">
      <div className="hod_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="hod_bf_logo_wrapper">
         <img className="hod_bflogo" src={logo} alt="Logo" />
         <h1  className="hod_bflogo_title">ims</h1>
      </div>
<div className="hod_nav_menu_wrapper">
  <NavLink   to="/hod/AcademicSession"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  } >
<div className="hod_side_nav_icons">
  <UserListIcon   className="hod_side_nav_icon" />
  </div>      
   <h1 className="hod_sidenav_title">AcademicSession</h1>
</NavLink>







      <NavLink  to="/hod/SubjectPage"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
      <div className="hod_side_nav_icons">
  <TireIcon  className="hod_side_nav_icon"  />
  </div>      
   <h1 className="hod_sidenav_title">syllabus</h1>
      </NavLink>

      <NavLink  to="/hod/TimetableClassPage"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
<div className="hod_side_nav_icons">
  <VanIcon   className="hod_side_nav_icon" />
  </div>      
   <h1 className="hod_sidenav_title">time table</h1>
      </NavLink>

  



          <NavLink  to="/hod/AttendancePage"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
       <div className="hod_side_nav_icons">
  <VanIcon  className="hod_side_nav_icon"  />
  </div>      
   <h1 className="hod_sidenav_title">Attendance</h1>
      </NavLink>

          <NavLink  to="/hod/ExamResultPage"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
       <div className="hod_side_nav_icons">
  <VanIcon  className="hod_side_nav_icon"  />
  </div>      
   <h1 className="hod_sidenav_title">ExamResult</h1>
      </NavLink>


                <NavLink  to="/hod/DepartmentStudents"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
       <div className="hod_side_nav_icons">
  <VanIcon  className="hod_side_nav_icon"  />
  </div>      
   <h1 className="hod_sidenav_title">Studentslist</h1>
      </NavLink>



                <NavLink  to="/hod/MyDepartmentFaculty"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
       <div className="hod_side_nav_icons">
  <VanIcon  className="hod_side_nav_icon"  />
  </div>      
   <h1 className="hod_sidenav_title">faculties</h1>
      </NavLink>


                      <NavLink  to="/hod/myclass"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
       <div className="hod_side_nav_icons">
  <VanIcon  className="hod_side_nav_icon"  />
  </div>      
   <h1 className="hod_sidenav_title">my class</h1>
      </NavLink>


                            <NavLink  to="/hod/InternalMarkEntry "     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "hod_sidemenu_holder active"
      : "hod_sidemenu_holder"
  }>
       <div className="hod_side_nav_icons">
  <VanIcon  className="hod_side_nav_icon"  />
  </div>      
   <h1 className="hod_sidenav_title">internal</h1>
      </NavLink>



{/* */}
      

      
      

</div>
    </div>

  );
};

export default Sidebar;