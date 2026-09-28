import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import  "./officesidebar.css"
const OfficeSidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="office_sidenav_container">
      <div className="office_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="office_bf_logo_wrapper">
         <img className="office_bflogo" src={logo} alt="Logo" />
         <h1  className="office_bflogo_title">ims</h1>
      </div>
<div className="office_nav_menu_wrapper">
  <NavLink   to="/office_assistant"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "office_sidemenu_holder active"
      : "office_sidemenu_holder"
  } >
<div className="office_side_nav_icons">
  <UserListIcon   className="office_side_nav_icon" />
  </div>      
   <h1 className="office_sidenav_title"> office</h1>
</NavLink>







      <NavLink  to="/office_assistant/IDCardTemplates"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "office_sidemenu_holder active"
      : "office_sidemenu_holder"
  }>
      <div className="office_side_nav_icons">
  <TireIcon  className="office_side_nav_icon"  />
  </div>      
   <h1 className="office_sidenav_title">IDCardDesigner</h1>
      </NavLink>

      <NavLink  to="/office_assistant/BusInfo"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "office_sidemenu_holder active"
      : "office_sidemenu_holder"
  }>
<div className="office_side_nav_icons">
  <VanIcon   className="office_side_nav_icon" />
  </div>      
   <h1 className="office_sidenav_title">BusInfo</h1>
      </NavLink>

      <NavLink  to="/office_assistant/BusRoutePage"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "office_sidemenu_holder active"
      : "office_sidemenu_holder"
  }>
       <div className="office_side_nav_icons">
  <VanIcon  className="office_side_nav_icon"  />
  </div>      
   <h1 className="office_sidenav_title">route creation</h1>
      </NavLink>



          <NavLink  to="/office_assistant/studentbus"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "office_sidemenu_holder active"
      : "office_sidemenu_holder"
  }>
       <div className="office_side_nav_icons">
  <VanIcon  className="office_side_nav_icon"  />
  </div>      
   <h1 className="office_sidenav_title">AssignmentBus</h1>
      </NavLink>
</div>
    </div>

  );
};

export default OfficeSidebar;