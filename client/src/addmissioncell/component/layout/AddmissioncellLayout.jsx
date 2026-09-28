// src/hr/layouts/HRLayout.jsx

import { Outlet } from "react-router-dom";
import { useState } from "react";


import Adnavbar from "../navbar/Adnavbar";
import AdSidebar from "../navbar/sidenav/AdSidebar";
import "./addmissioncellayout.css"
const AddmissioncellLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="addcell_layout_container">

  {sidebarOpen && (
    <div
      className="addcell_sidebar_overlay"
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
    <AdSidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="addcell_rhs_layout_wrapper">
    <Adnavbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="addcell_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default AddmissioncellLayout;