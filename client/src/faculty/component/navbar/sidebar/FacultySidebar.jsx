import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import "./facultysidebar.css"
const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="faculty_sidenav_container">
      <div className="faculty_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="faculty_bf_logo_wrapper">
         <img className="faculty_bflogo" src={logo} alt="Logo" />
         <h1  className="faculty_bflogo_title">ims</h1>
      </div>
<div className="faculty_nav_menu_wrapper">
  <NavLink   to="/hr"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "faculty_sidemenu_holder active"
      : "faculty_sidemenu_holder"
  } >
<div className="faculty_side_nav_icons">
  <UserListIcon   className="faculty_side_nav_icon" />
  </div>      
   <h1 className="faculty_sidenav_title"> faculty</h1>
</NavLink>







      <NavLink  to="/hr/BusDriver"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "faculty_sidemenu_holder active"
      : "faculty_sidemenu_holder"
  }>
      <div className="faculty_side_nav_icons">
  <TireIcon  className="faculty_side_nav_icon"  />
  </div>      
   <h1 className="faculty_sidenav_title">BusDriver</h1>
      </NavLink>

      <NavLink  to="/hr/BusInfo"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "faculty_sidemenu_holder active"
      : "faculty_sidemenu_holder"
  }>
<div className="faculty_side_nav_icons">
  <VanIcon   className="faculty_side_nav_icon" />
  </div>      
   <h1 className="faculty_sidenav_title">BusInfo</h1>
      </NavLink>

      <NavLink  to="/hr/BusRoutePage"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "faculty_sidemenu_holder active"
      : "faculty_sidemenu_holder"
  }>
       <div className="faculty_side_nav_icons">
  <VanIcon  className="faculty_side_nav_icon"  />
  </div>      
   <h1 className="faculty_sidenav_title">route creation</h1>
      </NavLink>



          <NavLink  to="/hr/studentbus"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "faculty_sidemenu_holder active"
      : "faculty_sidemenu_holder"
  }>
       <div className="faculty_side_nav_icons">
  <VanIcon  className="faculty_side_nav_icon"  />
  </div>      
   <h1 className="faculty_sidenav_title">AssignmentBus</h1>
      </NavLink>
</div>
    </div>

  );
};

export default Sidebar;