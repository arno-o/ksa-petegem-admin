import { useEffect } from "react";
import { useNavigate } from "react-router";
import { UserAuth } from "~/context/AuthContext";

interface PageProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PageProps) {
  const { session } = UserAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/");
    }
  }, [session, navigate]);

  if (!session) return null; // or a loading spinner, etc.

  return <>{children}</>;
}