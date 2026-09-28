import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./OfficeTopbar.css"
const OfficeTopbar =({
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
    <div className="office_user-top_navbar">
      <div className="office_user-details">
        <div className="office_navbar_lhs">
            <ListIcon
    className="office_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="office_user_info_wrapper">
                   <h3 className='office_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='office_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="office_rhs_nav_Sec">
           <div className="office_user_pfp">
          </div>
        <h3 className='office_user_name'>{user?.fullName}</h3>
<SignOutIcon className='office_logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default OfficeTopbar