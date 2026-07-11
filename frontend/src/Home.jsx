// Home.jsx — Smart redirect based on login state
// If user is logged in (data in localStorage), go to their dashboard.
// Otherwise, go to the login page.

import { Navigate } from "react-router-dom";

const ROLE_DASHBOARDS = {
  faculty:     "/faculty/dashboard",
  coordinator: "/coordinator/dashboard",
  bos:         "/bos/dashboard",
  dean:        "/dean/dashboard",
  admin:       "/admin/dashboard",
};

export default function Home() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    // corrupted data — treat as not logged in
  }

  // Not logged in → Login page
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → role-based dashboard
  const dashboard = ROLE_DASHBOARDS[user.role.toLowerCase()] || "/login";
  return <Navigate to={dashboard} replace />;
}