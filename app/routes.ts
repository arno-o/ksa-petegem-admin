import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [

    index("routes/dashboard/home.tsx"),

    route("/activiteiten", "routes/dashboard/calendar.tsx"),
    route("/berichten", "routes/dashboard/news.tsx"),
    route("/leiding", "routes/dashboard/users.tsx"),
    route("/groepen", "routes/dashboard/groups.tsx"),

    route("/login", "routes/auth/login.tsx"),
    route("/register", "routes/auth/register.tsx"),

] satisfies RouteConfig;
