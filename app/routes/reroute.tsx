import FullScreenLoader from "~/components/allround/full-screen-loader";
import { Navigate } from "react-router";
import { UserAuth } from "~/context/AuthContext";

export default function Reroute() {
    const { session, loading } = UserAuth();

    if (loading) return <FullScreenLoader />;

    return session ? (
        <Navigate to="/berichten" replace />
    ) : (
        <Navigate to="/login" replace />
    );
}