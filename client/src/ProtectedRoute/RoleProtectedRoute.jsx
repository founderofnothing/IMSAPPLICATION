// src/protectedRoute/RoleProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Get user designation, fallback to role, convert to lowercase
  const userRole = (user.designation || user.role)?.trim().toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.trim().toLowerCase());

  if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
    console.warn(`Unauthorized access for role: "${userRole}"`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;