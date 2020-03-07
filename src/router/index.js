import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Timer from "../views/Timer.vue";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Timer
    },
    {
        path: "/timer",
        name: "Timer",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import("../views/Timer.vue")
    }
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes
});

export default router;
