
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


    
    <div className="principal_sidenav_container">
      <div className="principal_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="principal_bf_logo_wrapper">
         <img className="principal_bflogo" src={logo} alt="Logo" />
         <h1  className="principal_bflogo_title">ims</h1>
      </div>
<div className="principal_nav_menu_wrapper">
  <NavLink   to="/hr"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "principal_sidemenu_holder active"
      : "principal_sidemenu_holder"
  } >
<div className="principal_side_nav_icons">
  <UserListIcon   className="principal_side_nav_icon" />
  </div>      
   <h1 className="principal_sidenav_title"> faculty</h1>
</NavLink>







      <NavLink  to="/hr/BusDriver"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "principal_sidemenu_holder active"
      : "principal_sidemenu_holder"
  }>
      <div className="principal_side_nav_icons">
  <TireIcon  className="principal_side_nav_icon"  />
  </div>      
   <h1 className="principal_sidenav_title">BusDriver</h1>
      </NavLink>

      <NavLink  to="/hr/BusInfo"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "principal_sidemenu_holder active"
      : "principal_sidemenu_holder"
  }>
<div className="principal_side_nav_icons">
  <VanIcon   className="principal_side_nav_icon" />
  </div>      
   <h1 className="principal_sidenav_title">BusInfo</h1>
      </NavLink>

      <NavLink  to="/hr/BusRoutePage"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "principal_sidemenu_holder active"
      : "principal_sidemenu_holder"
  }>
       <div className="principal_side_nav_icons">
  <VanIcon  className="principal_side_nav_icon"  />
  </div>      
   <h1 className="principal_sidenav_title">route creation</h1>
      </NavLink>



          <NavLink  to="/hr/studentbus"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "principal_sidemenu_holder active"
      : "principal_sidemenu_holder"
  }>
       <div className="principal_side_nav_icons">
  <VanIcon  className="principal_side_nav_icon"  />
  </div>      
   <h1 className="principal_sidenav_title">AssignmentBus</h1>
      </NavLink>
</div>
    </div>

  );
};

export default Sidebar;