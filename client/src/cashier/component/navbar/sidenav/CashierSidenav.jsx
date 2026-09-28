import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import "./CashierSidenav.css"
const CashierSidenav = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="cashier_sidenav_container">
      <div className="cashier_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="cashier_bf_logo_wrapper">
         <img className="cashier_bflogo" src={logo} alt="Logo" />
         <h1  className="cashier_bflogo_title">ims</h1>
      </div>
<div className="cashier_nav_menu_wrapper">
  <NavLink   to="/hr"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "cashier_sidemenu_holder active"
      : "cashier_sidemenu_holder"
  } >
<div className="cashier_side_nav_icons">
  <UserListIcon   className="cashier_side_nav_icon" />
  </div>      
   <h1 className="cashier_sidenav_title"> faculty</h1>
</NavLink>







      <NavLink  to="/hr/BusDriver"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "cashier_sidemenu_holder active"
      : "cashier_sidemenu_holder"
  }>
      <div className="cashier_side_nav_icons">
  <TireIcon  className="cashier_side_nav_icon"  />
  </div>      
   <h1 className="cashier_sidenav_title">BusDriver</h1>
      </NavLink>

      <NavLink  to="/hr/BusInfo"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "cashier_sidemenu_holder active"
      : "cashier_sidemenu_holder"
  }>
<div className="cashier_side_nav_icons">
  <VanIcon   className="cashier_side_nav_icon" />
  </div>      
   <h1 className="cashier_sidenav_title">BusInfo</h1>
      </NavLink>

      <NavLink  to="/hr/BusRoutePage"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "cashier_sidemenu_holder active"
      : "cashier_sidemenu_holder"
  }>
       <div className="cashier_side_nav_icons">
  <VanIcon  className="cashier_side_nav_icon"  />
  </div>      
   <h1 className="cashier_sidenav_title">route creation</h1>
      </NavLink>



          <NavLink  to="/hr/studentbus"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "cashier_sidemenu_holder active"
      : "cashier_sidemenu_holder"
  }>
       <div className="cashier_side_nav_icons">
  <VanIcon  className="cashier_side_nav_icon"  />
  </div>      
   <h1 className="cashier_sidenav_title">AssignmentBus</h1>
      </NavLink>
</div>
    </div>

  );
};

export default CashierSidenav;