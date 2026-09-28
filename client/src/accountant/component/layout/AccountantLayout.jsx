import { Outlet } from "react-router-dom";
import { useState } from "react";



import "./AccountantLayout.css"
import AccSidenavbar from "../Navbar/sidenav/AccSidenavbar";
import AccTopNavbar from "../Navbar/topnavbar/AccTopNavbar";
const AccountantLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="accountant_layout_container">

  {sidebarOpen && (
    <div
      className="accountant_sidebar_overlay"
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
    <AccSidenavbar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="accountant_rhs_layout_wrapper">
    <AccTopNavbar
      setSidebarOpen={setSidebarOpen}
    />

    <main className="accountant_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default AccountantLayout;