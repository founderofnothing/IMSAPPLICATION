

// src/hr/layouts/HRLayout.jsx

import { Outlet } from "react-router-dom";
import { useState } from "react";


import Navbar from "../navbar/navbar/Navbar";
// import Sidebar from "../navbar/sidebar/Sidebar";
import "./layout.css"
const Layout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="principal_layout_container">

  {sidebarOpen && (
    <div
      className="principal_sidebar_overlay"
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
    {/* <Sidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    /> */}
  </div>

  <div className="principal_rhs_layout_container">
    <Navbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="principal_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default Layout;