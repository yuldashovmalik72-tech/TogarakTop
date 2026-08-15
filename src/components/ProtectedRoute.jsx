import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "./Spinner.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Tekshirilmoqda..." />;
  if (!user) return <Navigate to="/kirish" state={{ from: location }} replace />;
  return children;
}
