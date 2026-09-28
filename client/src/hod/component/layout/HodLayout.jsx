
import { Outlet } from "react-router-dom";
import { useState } from "react";


import Navbar from "../navbar/topbar/Navbar";
import Sidebar from "../navbar/sidebar/Sidebar";
import "./hodlayout.css"
const HodLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="hod_layout_container">

  {sidebarOpen && (
    <div
      className="hod_sidebar_overlay"
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
    <Sidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="hod_rhs_layout_wrapper">
    <Navbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="hod_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default HodLayout;