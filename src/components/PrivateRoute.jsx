// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useUser } from "../context/useUser";
import React from "react";

function PrivateRoute({ children, allowedRoles }) {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const { user } = useUser();

    // ⏳ User lädt noch → nichts entscheiden
  if (token && !user) {
    return null; // oder Spinner
  }


 

  // Falls kein Token vorhanden → Weiterleitung zur Login-Seite
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Falls Rollen gefordert sind, aber der User keine davon hat → Weiterleitung
 if (
      allowedRoles &&
      user?.roles &&
      !allowedRoles.some(
        (role) =>
          user.roles.includes(role) ||
          user.roles.includes(`ROLE_${role}`)
      )
    ) {
      return <Navigate to="/unauthorized" replace />;
    }
return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default PrivateRoute;
