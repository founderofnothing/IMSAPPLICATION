import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../assets/browserleaf_logo.svg";
import"./hrsidebar.css";
const HRSidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="sidenav_container">
      <div className="mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="bf_logo_wrapper">
         <img className="bflogo" src={logo} alt="Logo" />
         <h1  className="bflogo_title">ims</h1>
      </div>
<div className="nav_menu_wrapper">
  <NavLink   to="/hr"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "sidemenu_holder active"
      : "sidemenu_holder"
  } >
<div className="side_nav_icons">
  <UserListIcon   className="side_nav_icon" />
  </div>      
   <h1 className="sidenav_title"> faculty</h1>
</NavLink>







      <NavLink  to="/hr/BusDriver"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "sidemenu_holder active"
      : "sidemenu_holder"
  }>
      <div className="side_nav_icons">
  <TireIcon  className="side_nav_icon"  />
  </div>      
   <h1 className="sidenav_title">BusDriver</h1>
      </NavLink>

      <NavLink  to="/hr/BusInfo"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "sidemenu_holder active"
      : "sidemenu_holder"
  }>
<div className="side_nav_icons">
  <VanIcon   className="side_nav_icon" />
  </div>      
   <h1 className="sidenav_title">BusInfo</h1>
      </NavLink>

      <NavLink  to="/hr/BusRoutePage"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "sidemenu_holder active"
      : "sidemenu_holder"
  }>
       <div className="side_nav_icons">
  <VanIcon  className="side_nav_icon"  />
  </div>      
   <h1 className="sidenav_title">route creation</h1>
      </NavLink>



          <NavLink  to="/hr/studentbus"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "sidemenu_holder active"
      : "sidemenu_holder"
  }>
       <div className="side_nav_icons">
  <VanIcon  className="side_nav_icon"  />
  </div>      
   <h1 className="sidenav_title">AssignmentBus</h1>
      </NavLink>
</div>
    </div>

  );
};

export default HRSidebar;