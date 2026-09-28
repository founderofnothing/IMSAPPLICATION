

import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import "./AccSidenavbar.css"
const AccSidenavbar = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="accountant_sidenav_container">
      <div className="accountant_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="accountant_bf_logo_wrapper">
         <img className="accountant_bflogo" src={logo} alt="Logo" />
         <h1  className="accountant_bflogo_title">ims</h1>
      </div>
<div className="accountant_nav_menu_wrapper">








      <NavLink  to="/accountant/FeeStructure"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "accountant_sidemenu_holder active"
      : "accountant_sidemenu_holder"
  }>
      <div className="accountant_side_nav_icons">
  <TireIcon  className="accountant_side_nav_icon"  />
  </div>      
   <h1 className="accountant_sidenav_title">FeeStructure</h1>
      </NavLink>

      <NavLink  to="/accountant/FeeAllocation"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "accountant_sidemenu_holder active"
      : "accountant_sidemenu_holder"
  }>
<div className="accountant_side_nav_icons">
  <VanIcon   className="accountant_side_nav_icon" />
  </div>      
   <h1 className="accountant_sidenav_title">FeeAllocation</h1>
      </NavLink>

      <NavLink  to="/accountant/ClassFeeDetails"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "accountant_sidemenu_holder active"
      : "accountant_sidemenu_holder"
  }>
       <div className="accountant_side_nav_icons">
  <VanIcon  className="accountant_side_nav_icon"  />
  </div>      
   <h1 className="accountant_sidenav_title">ClassFeeDetails</h1>
      </NavLink>



          <NavLink  to="/accountant/PaymentCollection"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "accountant_sidemenu_holder active"
      : "accountant_sidemenu_holder"
  }>
       <div className="accountant_side_nav_icons">
  <VanIcon  className="accountant_side_nav_icon"  />
  </div>      
   <h1 className="accountant_sidenav_title">counter</h1>
      </NavLink>
</div>
    </div>

  );
};

export default AccSidenavbar;