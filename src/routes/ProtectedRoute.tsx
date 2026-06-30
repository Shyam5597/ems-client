import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentUser = localStorage.getItem("currentUser");

  const isAuthenticated = !!token && isLoggedIn && !!currentUser;

  if (!isAuthenticated) {
    // Clean up any partial/stale auth data so nothing leaks through
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    return <Navigate to="/login" replace />;
  }

  return children;
}