import { useEffect } from "react";
import { useNavigate } from "react-router";
import { UserAuth } from "~/context/AuthContext";

interface PageProps {
  children: React.ReactNode;
  permissionLvl?: number;
}

export default function PrivateRoute({ children, permissionLvl = 1 }: PageProps) {
  const { session, loading, permission } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/login");
    }
  }, [loading, session, navigate]);

  if (loading) return null; // or a loading spinner
  if (!session) return null;

  // Check if user has sufficient permission level
  if (permission < permissionLvl) {
    return <div>You don't have permission to access this page.</div>;
  }

  return <>{children}</>;
}