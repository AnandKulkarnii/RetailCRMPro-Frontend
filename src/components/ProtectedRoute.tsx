import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ element, ...rest }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token is found, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  return element;
}

export default ProtectedRoute;
