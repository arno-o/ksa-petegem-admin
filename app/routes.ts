import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    
    route("/berichten", "routes/dashboard/posts.tsx"),
    route("/activiteiten", "routes/dashboard/events.tsx"),
    route("/leiding", "routes/dashboard/users.tsx"),
    route("/groepen", "routes/dashboard/groups.tsx"),

    route("/leiding/edit/:leidingId", "routes/dashboard/edit-user.tsx"),
    route("/berichten/:postId", "routes/dashboard/edit-post.tsx"),

    route("/login", "routes/auth/login.tsx"),
    route("/register", "routes/auth/register.tsx"),

] satisfies RouteConfig;