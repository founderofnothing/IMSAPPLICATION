import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./CashierTopnav.css"
const CashierTopnav =({
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
    <div className="cashier_user-top_navbar">
      <div className="cashier_user-details">
        <div className="cashier_navbar_lhs">
            <ListIcon
    className="cashier_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="cashier_user_info_wrapper">
                   <h3 className='cashier_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='cashier_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="cashier_rhs_nav_Sec">
           <div className="cashier_user_pfp">
          </div>
        <h3 className='cashier_user_name'>{user?.fullName}</h3>
<SignOutIcon className='cashier_logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default CashierTopnav