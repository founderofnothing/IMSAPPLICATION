import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./AccTopNavbar.css"
const AccTopNavbar =({
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
    <div className="accountant_user-top_navbar">
      <div className="accountant_user-details">
        <div className="accountant_navbar_lhs">
            <ListIcon
    className="accountant_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="accountant_user_info_wrapper">
                   <h3 className='accountant_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='accountant_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="accountant_rhs_nav_Sec">
           <div className="accountant_user_pfp">
          </div>
        <h3 className='accountant_user_name'>{user?.fullName}</h3>
<SignOutIcon className='accountant_logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default AccTopNavbar