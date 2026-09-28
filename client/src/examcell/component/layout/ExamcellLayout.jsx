import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./ExamcellLayout.css"
import ExamcellSidenav from "../navbar/sidenav/ExamcellSidenav";
import ExamcellTopNavbar from "../navbar/ExamcellTopNavbar/ExamcellTopNavbar";


const ExamcellLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="examcell_layout_container">

  {sidebarOpen && (
    <div
      className="examcell_sidebar_overlay"
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
    <ExamcellSidenav
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="examcell_rhs_layout_wrapper">
    <ExamcellTopNavbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="examcell_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default ExamcellLayout;