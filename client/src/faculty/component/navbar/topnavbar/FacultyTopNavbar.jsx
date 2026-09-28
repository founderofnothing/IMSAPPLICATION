import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./facultytopnavbar.css"
const FacultyTopNavbar =({
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
    <div className="faculty_user-top_navbar">
      <div className="faculty_user-details">
        <div className="faculty_navbar_lhs">
            <ListIcon
    className="faculty_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="faculty_user_info_wrapper">
                   <h3 className='faculty_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='faculty_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="faculty_rhs_nav_Sec">
           <div className="faculty_user_pfp">
          </div>
        <h3 className='faculty_user_name'>{user?.fullName}</h3>
<SignOutIcon className='faculty_logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default FacultyTopNavbar