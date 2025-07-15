import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/reroute.tsx"),
    
    route("/berichten", "routes/dashboard/posts.tsx"),
    route("/activiteiten", "routes/dashboard/events.tsx"),
    route("/leiding", "routes/dashboard/users.tsx"),
    route("/groepen", "routes/dashboard/groups.tsx"),

    route("/leiding/edit/:leidingId", "routes/dashboard/users/edit.tsx"),
    
    route("/berichten/edit/:postId", "routes/dashboard/posts/edit.tsx"),
    route("/berichten/preview/:postId", "routes/dashboard/posts/preview.tsx"),

    route("/login", "routes/auth/login.tsx"),
    route("/register", "routes/auth/register.tsx"),

    route("*", "routes/404.tsx"),

] satisfies RouteConfig;