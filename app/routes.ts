import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/reroute.tsx"),
    
    route("/berichten", "routes/dashboard/posts.tsx"),
    route("/activiteiten", "routes/dashboard/events.tsx"),
    route("/groepen", "routes/dashboard/groups.tsx"),
    route("/instellingen", "routes/dashboard/settings.tsx"),
    
    route("/leiding/actief", "routes/dashboard/users/active.tsx"),
    route("/leiding/inactief", "routes/dashboard/users/inactive.tsx"),
    route("/leiding/actief/edit/:leidingId", "routes/dashboard/users/edit.tsx"),
    
    route("/berichten/edit/:postId", "routes/dashboard/posts/edit.tsx"),
    route("/berichten/preview/:postId", "routes/dashboard/posts/preview.tsx"),

    route("/login", "routes/auth/login.tsx"),
    route("/register", "routes/auth/register.tsx"),

    route("*", "routes/404.tsx"),

] satisfies RouteConfig;