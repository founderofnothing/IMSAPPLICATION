import { Outlet } from "react-router-dom";
import { useState } from "react";
// import FacultyTopNavbar from "../navbar/topnavbar/FacultyTopNavbar";
// import FacultySidebar from "../navbar/sidebar/FacultySidebar";
import OfficeSidebar from "../../component/navbar/officesidebar/OfficeSidebar"
import OfficeTopbar from "../../component/navbar/officetopbar/OfficeTopbar"
import "./OfficeLayout.css"
const OfficeLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="office_layout_container">

  {sidebarOpen && (
    <div
      className="office_sidebar_overlay"
      onClick={() =>
        setSidebarOpen(false)
      }
    />
  )}

  <div
    className={`lhs_layout_wrapper ${
      sidebarOpen ? "active" : ""
    }`}
  >
    <OfficeSidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="office_rhs_layout_wrapper">
    <OfficeTopbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="office_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default OfficeLayout;