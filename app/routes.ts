import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

    index("routes/auth/login.tsx"),
    
    route("/berichten", "routes/dashboard/posts.tsx"),
    route("/activiteiten", "routes/dashboard/calendar.tsx"),
    route("/leiding", "routes/dashboard/users.tsx"),
    route("/groepen", "routes/dashboard/groups.tsx"),

    route("/register", "routes/auth/register.tsx"),

] satisfies RouteConfig;