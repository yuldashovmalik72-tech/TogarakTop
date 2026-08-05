import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "./Spinner.jsx";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner label="Tekshirilmoqda..." />;
  if (!user) return <Navigate to="/kirish" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/" replace />;
  return children;
}
