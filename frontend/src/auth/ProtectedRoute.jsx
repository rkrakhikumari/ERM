import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const accessToken = localStorage.getItem("access_token");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  try {
    const { exp } = jwtDecode(accessToken);
    if (Date.now() >= exp * 1000) {
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
