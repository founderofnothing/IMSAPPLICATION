import { Outlet } from "react-router-dom";
import { useState } from "react";
import FacultyTopNavbar from "../navbar/topnavbar/FacultyTopNavbar";
import FacultySidebar from "../navbar/sidebar/FacultySidebar";
import "./facultylayout.css"
const FacultyLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="faculty_layout_container">

  {sidebarOpen && (
    <div
      className="faculty_sidebar_overlay"
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
    <FacultySidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="faculty_rhs_layout_wrapper">
    <FacultyTopNavbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="faculty_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default FacultyLayout;