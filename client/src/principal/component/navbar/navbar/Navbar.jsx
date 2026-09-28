import React from 'react'
import { NavLink } from 'react-router-dom'
import "./navbar.css"

const Navbar = () => {
  return (
    <div className='principal_navbar'>

<div className="principal_top_navbar_wrapper">
  


    <NavLink className="menusection"  to="/principal">

   <h1 className="principal_sidenav_title">home</h1>
      </NavLink>

          <NavLink className="menusection"  to="/principal/Facultypage">

   <h1 className="principal_sidenav_title">faculty</h1>
      </NavLink>

          <NavLink className="menusection"  to="/principal/StudentPage">

   <h1 className="principal_sidenav_title">student </h1>
      </NavLink>

          <NavLink className="menusection"  to="/principal/FinancePage">

   <h1 className="principal_sidenav_title">finance</h1>
      </NavLink>


             <NavLink className="menusection"  to="/principal/DepartmentPage">

   <h1 className="principal_sidenav_title">department</h1>
      </NavLink>

             <NavLink className="menusection"  to="/principal/PrincipalProgrammePage">

   <h1 className="principal_sidenav_title">programme</h1>
      </NavLink>


          {/* <NavLink className="menusection"  to="/principal/ExamResultPage">

   <h1 className="principal_sidenav_title">exam result </h1>
      </NavLink> */}

          <NavLink className="menusection"  to="/principal/transportation">

   <h1 className="principal_sidenav_title">transportation</h1>
      </NavLink>

</div>


    </div>
  )
}

export default Navbar