import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./Cashierlayout.css"

import CashierSidenav from "../navbar/sidenav/CashierSidenav";
import CashierTopnav from "../navbar/topnavbar/CashierTopnav";
const Cashierlayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="Cashier_layout_container">

  {sidebarOpen && (
    <div
      className="Cashier_sidebar_overlay"
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
    <CashierSidenav
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="Cashier_rhs_layout_wrapper">
    <CashierTopnav
      setSidebarOpen={setSidebarOpen}
    />

    <main className="Cashier_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default Cashierlayout;