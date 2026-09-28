// import React from 'react'

// const ExamcellSidenav = () => {
//   return (
//     <div>ExamcellSidenav</div>
//   )
// }

// export default ExamcellSidenav


import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import "./ExamcellSidenav.css"
const ExamcellSidenav = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="examcell_sidenav_container">
      <div className="examcell_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="examcell_bf_logo_wrapper">
         <img className="examcell_bflogo" src={logo} alt="Logo" />
         <h1  className="examcell_bflogo_title">ims</h1>
      </div>
<div className="examcell_nav_menu_wrapper">
  <NavLink   to="/examcell/examtitle"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "examcell_sidemenu_holder active"
      : "examcell_sidemenu_holder"
  } >
<div className="examcell_side_nav_icons">
  <UserListIcon   className="examcell_side_nav_icon" />
  </div>      
   <h1 className="examcell_sidenav_title"> examtitle</h1>
</NavLink>







      <NavLink  to="/examcell/ExamHallPage"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "examcell_sidemenu_holder active"
      : "examcell_sidemenu_holder"
  }>
      <div className="examcell_side_nav_icons">
  <TireIcon  className="examcell_side_nav_icon"  />
  </div>      
   <h1 className="examcell_sidenav_title">exam hall</h1>
      </NavLink>

      <NavLink  to="/examcell/ExamhallList"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "examcell_sidemenu_holder active"
      : "examcell_sidemenu_holder"
  }>
<div className="examcell_side_nav_icons">
  <VanIcon   className="examcell_side_nav_icon" />
  </div>      
   <h1 className="examcell_sidenav_title">ExamhallList</h1>
      </NavLink>

      <NavLink  to="/examcell/examSessionId/HallList"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "examcell_sidemenu_holder active"
      : "examcell_sidemenu_holder"
  }>
       <div className="examcell_side_nav_icons">
  <VanIcon  className="examcell_side_nav_icon"  />
  </div>      
   <h1 className="examcell_sidenav_title">bench Allocation</h1>
      </NavLink>

      <NavLink  to="/examcell/master-timetables"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "examcell_sidemenu_holder active"
      : "examcell_sidemenu_holder"
  }>
       <div className="examcell_side_nav_icons">
  <VanIcon  className="examcell_side_nav_icon"  />
  </div>      
   <h1 className="examcell_sidenav_title">master-timetables</h1>
      </NavLink>





</div>
    </div>

  );
};

export default ExamcellSidenav;