import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./navbar.css"
const Navbar =({
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
    <div className="hod_user-top_navbar">
      <div className="hod_user-details">
        <div className="hod_navbar_lhs">
            <ListIcon
    className="hod_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="hod_user_info_wrapper">
                   <h3 className='hod_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='hod_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="hod_rhs_nav_Sec">
           <div className="hod_user_pfp">
          </div>
        <h3 className='hod_user_name'>{user?.fullName}</h3>
<SignOutIcon className='hod_logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default Navbar