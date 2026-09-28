// import React from 'react'

// const ExamcellTopNavbar = () => {
//   return (
//     <div>ExamcellTopNavbar</div>
//   )
// }

// export default ExamcellTopNavbar

import React from 'react'
import { useNavigate } from "react-router-dom";
import { SignOutIcon , ListIcon, } from "@phosphor-icons/react";

import "./ExamcellTopNavbar.css"
const ExamcellTopNavbar =({
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
    <div className="examcell_user-top_navbar">
      <div className="examcell_user-details">
        <div className="examcell_navbar_lhs">
            <ListIcon
    className="examcell_menu_icon"
    onClick={() =>
      setSidebarOpen(prev => !prev)
    }
  />
       
              <div className="examcell_user_info_wrapper">
                   <h3 className='examcell_topbar_user_dashboard_field'>{user?.designation} dashboard</h3>
                   <h3 className='examcell_user_name'>{user?.fullName}</h3>
              </div>
        </div>




  <div className="examcell_rhs_nav_Sec">
           <div className="examcell_user_pfp">
          </div>
        <h3 className='examcell_user_name'>{user?.fullName}</h3>
<SignOutIcon className='examcell_logout_btn' onClick={handleLogout}  />
      </div>

     
      </div>

    

      {/* <button onClick={handleLogout}> */}
        
      {/* </button> */}
    </div>
  );
}

export default ExamcellTopNavbar