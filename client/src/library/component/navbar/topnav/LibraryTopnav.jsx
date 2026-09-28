

import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";
import "./LibraryTopnav.css"
// import "./ExamcellTopNavbar.css"
const LibraryTopnav =({
  setSidebarOpen,
}) => {
 const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const handleLogout = () => {
    localStorage.clear();

    navigate("/");
  };

  return (
    <div className="library_user-top_navbar">
      <div className="library_user-details">
        <div className="library_navbar_lhs">
            <ListIcon
    className="library_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="library_user_info_wrapper">
                   <h3 className='library_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='library_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="library_rhs_nav_Sec">
           <div className="library_user_pfp">
          </div>
        <h3 className='library_user_name'>{user?.fullName}</h3>
<SignOutIcon className='library_logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default LibraryTopnav