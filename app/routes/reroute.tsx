import { useEffect } from "react";
import { useNavigate } from "react-router";
import { UserAuth } from "~/context/AuthContext";

export default function Reroute() {
    const { session, loading } = UserAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && session) {
            navigate("/berichten", { viewTransition: true });
        } else if (!session) {
            navigate("/login", { viewTransition: true });
        }
    }, [loading, session, navigate]);

    return;
}