import column from './pages/ColumnList.vue'
import user from "./pages/UserList.vue";
import task from "./pages/TaskList.vue";
import project from "./pages/ProjectList.vue";
import specialization from "./pages/SpecializationList.vue";
import login from "./pages/LoginPage.vue";
import home from "./pages/HomePage.vue";
import Error from "./pages/ErrorPage.vue";
import {createRouter, createWebHistory} from "vue-router"

const routes = [
    {path: '/tasks', component: task, meta: { requiresAuth: true }},
    {path: '/columns', component: column, meta: { requiresAuth: true }},
    {path: '/projects', component: project, meta: { requiresAuth: true }},
    {path: "/users", component: user, meta: { requiresAuth: true}},
    {path: '/specializations', component: specialization, meta: { requiresAuth: true }},
    {path: "/login", component: login},
    {path: "/home", name: 'home', component: home},
    {path: "/error", component: Error, meta: { requiresAuth: true }},
]

const router = createRouter({
    history: createWebHistory(),
    linkActiveClass: 'active',
    routes
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem("token");
    if (to.matched.some((route) => route.meta.requiresAuth)) {
        if (!isAuthenticated) {
            next("/login");
            return;
        }
    }
    const isAdmin = localStorage.getItem("role") === "ADMIN";
    if (to.matched.some((route) => route.meta.requiresAdmin)) {
        if (!isAdmin) {
            next("/error");
            return;
        }
    }
    next();
});

export default router;