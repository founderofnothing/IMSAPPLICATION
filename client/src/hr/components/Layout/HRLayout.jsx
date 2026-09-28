// src/hr/layouts/HRLayout.jsx

import { Outlet } from "react-router-dom";
import { useState } from "react";

import HRSidebar from "../Navbar/HRSidebar";
import HRNavbar from "../Navbar/HRNavbar";
import "./hrlayout.css"
const HRLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="hr_layout_container">

  {sidebarOpen && (
    <div
      className="sidebar_overlay"
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
    <HRSidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="rhs_layout_wrapper">
    <HRNavbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default HRLayout;