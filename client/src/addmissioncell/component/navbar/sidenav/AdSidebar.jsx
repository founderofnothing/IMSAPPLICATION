import { NavLink } from "react-router-dom";
import {   XIcon, ClockUserIcon  ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import "./Sidebar.css"
const AdSidebar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="addcell_sidenav_container">
      <div className="addcell_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="addcell_bf_logo_wrapper">
         <img className="addcell_bflogo" src={logo} alt="Logo" />
         <h1  className="addcell_bflogo_title">ims</h1>
      </div>
<div className="addcell_nav_menu_wrapper">
  <NavLink   to="/admission-cell/batch"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "addcell_sidemenu_holder active"
      : "addcell_sidemenu_holder"
  } >
<div className="addcell_side_nav_icons">
  <ClockUserIcon    className="addcell_side_nav_icon" />
  </div>      
   <h1 className="addcell_sidenav_title"> batch</h1>
</NavLink>







      <NavLink  to="/admission-cell/Enquiry"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "addcell_sidemenu_holder active"
      : "addcell_sidemenu_holder"
  }>
      <div className="addcell_addcell_side_nav_icons">
  <TireIcon  className="addcell_side_nav_icon"  />
  </div>      
   <h1 className="addcell_sidenav_title">enquiry</h1>
      </NavLink>

      <NavLink  to="/admission-cell/Convertion"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "addcell_sidemenu_holder active"
      : "addcell_sidemenu_holder"
  }>
<div className="addcell_side_nav_icons">
  <VanIcon   className="addcell_side_nav_icon" />
  </div>      
   <h1 className="addcell_sidenav_title">Convertion</h1>
      </NavLink>

      <NavLink  to="/admission-cell/classAllocation"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "addcell_sidemenu_holder active"
      : "addcell_sidemenu_holder"
  }>
       <div className="addcell_side_nav_icons">
  <VanIcon  className="addcell_side_nav_icon"  />
  </div>      
   <h1 className="addcell_sidenav_title">classAllocation</h1>
      </NavLink>



          <NavLink  to="/admission-cell/createstudent"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "addcell_sidemenu_holder active"
      : "addcell_sidemenu_holder"
  }>
       <div className="addcell_side_nav_icons">
  <VanIcon  className="addcell_side_nav_icon"  />
  </div>      
   <h1 className="addcell_sidenav_title">createstudent</h1>
      </NavLink>
</div>
    </div>

  );
};

export default AdSidebar;