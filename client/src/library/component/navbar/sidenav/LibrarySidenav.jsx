import { NavLink } from "react-router-dom";
import {   XIcon, UserListIcon ,TireIcon ,VanIcon ,PathIcon  } from "@phosphor-icons/react";
import logo from "../../../../assets/browserleaf_logo.svg"
import "./LibrarySidenav.css"
const LibrarySidenav = ({
  sidebarOpen,
  setSidebarOpen,
}) => {

  const closeSidebar = () => {
  setSidebarOpen(false);
};
  return (


    
    <div className="library_sidenav_container">
      <div className="library_mobile_close">

  <XIcon
    size={28}
    onClick={() =>
      setSidebarOpen(false)
    }
  />

</div>
      <div className="library_bf_logo_wrapper">
         <img className="library_bflogo" src={logo} alt="Logo" />
         <h1  className="library_bflogo_title">ims</h1>
      </div>
<div className="library_nav_menu_wrapper">
  <NavLink   to="/library/booklist"  end    onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "library_sidemenu_holder active"
      : "library_sidemenu_holder"
  } >
<div className="library_side_nav_icons">
  <UserListIcon   className="library_side_nav_icon" />
  </div>      
   <h1 className="library_sidenav_title"> book curd</h1>
</NavLink>







      <NavLink  to="/library/LibraryStudent"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "library_sidemenu_holder active"
      : "library_sidemenu_holder"
  }>
      <div className="library_side_nav_icons">
  <TireIcon  className="library_side_nav_icon"  />
  </div>      
   <h1 className="library_sidenav_title">student</h1>
      </NavLink>

      <NavLink  to="/library/LibraryFaculty"    onClick={closeSidebar}   className={({ isActive }) =>
    isActive
      ? "library_sidemenu_holder active"
      : "library_sidemenu_holder"
  }>
<div className="library_side_nav_icons">
  <VanIcon   className="library_side_nav_icon" />
  </div>      
   <h1 className="library_sidenav_title">faculty</h1>
      </NavLink>

      <NavLink  to="/library/BookbulkUploadandUpdate"     onClick={closeSidebar}  className={({ isActive }) =>
    isActive
      ? "library_sidemenu_holder active"
      : "library_sidemenu_holder"
  }>
       <div className="library_side_nav_icons">
  <VanIcon  className="library_side_nav_icon"  />
  </div>      
   <h1 className="library_sidenav_title">bulkupload</h1>
      </NavLink>




</div>
    </div>

  );
};

export default LibrarySidenav;