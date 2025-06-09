import { useEffect } from "react";
import { useNavigate } from "react-router";
import { UserAuth } from "~/context/AuthContext";

interface PageProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PageProps) {
  const { session, loading } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) {
      navigate("/");
    }
  }, [loading, session, navigate]);

  if (loading) return null; // or a loading spinner

  if (!session) return null;

  return <>{children}</>;
}