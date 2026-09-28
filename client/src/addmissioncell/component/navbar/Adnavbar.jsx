import React from 'react'
import { NavLink, useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./adnavbar.css"
const Adnavbar =({
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
    <div className="addcell_user-top_navbar">
      <div className="addcell_user-details">
        <div className="addcell_navbar_lhs">
            <ListIcon
    className="addcell_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="addcell_user_info_wrapper">
                   <h3 className='addcell_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='addcell_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <NavLink to="profile" className="addcell_rhs_nav_Sec"  onClick={handleLogout} >
        <h3 className='addcell_user_name'>{user?.fullName}</h3>

           <NavLink  className="addcell_user_pfp">

          </NavLink>

<SignOutIcon className='addcell_logout_btn' />
      </NavLink>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default Adnavbar