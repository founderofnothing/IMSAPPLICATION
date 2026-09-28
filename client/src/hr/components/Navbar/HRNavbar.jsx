import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./hrnavbar.css"
const HRNavbar =({
  setSidebarOpen,
}) => {
 const navigate = useNavigate();

const user = JSON.parse(
  sessionStorage.getItem("user")
);
const handleLogout = () => {
  sessionStorage.clear();

  navigate("/");
};

  return (
    <div className="user-top_navbar">
      <div className="user-details">
        <div className="navbar_lhs">
            <ListIcon
    className="menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="user_info_wrapper">
                   <h3 className='topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="rhs_nav_Sec">
           <div className="user_pfp">
          </div>
        <h3 className='user_name'>{user?.fullName}</h3>
<SignOutIcon className='logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default HRNavbar