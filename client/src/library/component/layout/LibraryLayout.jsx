


import { Outlet } from "react-router-dom";
import { useState } from "react";
import "./libraryLayout.css"
import LibrarySidenav from "../navbar/sidenav/LibrarySidenav";
import LibraryTopnav from "../navbar/topnav/LibraryTopnav";




const LibraryLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  return (
  <div className="library_layout_container">

  {sidebarOpen && (
    <div
      className="library_sidebar_overlay"
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
    <LibrarySidenav
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />
  </div>

  <div className="library_rhs_layout_wrapper">
    <LibraryTopnav
      setSidebarOpen={setSidebarOpen}
    />

    <main className="library_outlet_container">
      <Outlet />
    </main>
  </div>

</div>
  );
};

export default LibraryLayout;

