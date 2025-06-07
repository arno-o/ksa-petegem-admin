import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [

    layout("./layouts/ResponsiveLayout.tsx", [
        index("routes/home.tsx"),
        route("/leiding", "routes/leiding.tsx"),
        route("/groepen", "routes/groepen.tsx"),
        route("/werkgroepen", "routes/werkgroepen.tsx"),
        route("/posts", "routes/posts.tsx")
    ])

] satisfies RouteConfig;
