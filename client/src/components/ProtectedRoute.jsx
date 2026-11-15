import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "./ui/Logo";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg">
        <Logo showWordmark={false} size={40} className="animate-pulse-soft" />
        <p className="coord-label text-muted">Loading your session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
