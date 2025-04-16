import user from "./pages/UserList.vue";
import userAddModal from "./components/AddUserModal.vue";
import project from "./pages/ProjectPage.vue"
import projects from "./pages/ProjectList.vue";
import projectDetails from "./pages/ProjectDetails.vue"
import projectForUser from "./pages/ProjectsForUser.vue"
import specialization from "./pages/SpecializationList.vue";
import login from "./pages/LoginPage.vue";
import home from "./pages/HomePage.vue";
import conversation from "./pages/ConversationsPage.vue";
import Error from "./pages/ErrorPage.vue";
import {createRouter, createWebHistory} from "vue-router"

const routes = [
    {path: '/project/:projectId', component: project, name: 'ProjectPage', props: true, meta: { title: 'Проект', requiresAuth: true }},
    {path: '/projects', component: projects, meta: { title: 'Все проекты', requiresAuth: true }},
    {path: '/projects/:id', component: projectDetails, name: 'ProjectDetails', props: true, meta: { title: 'Пользователи на проекте', requiresAuth: true }},
    {path: '/projectsForUser', component: projectForUser, meta: { title: 'Мои проекты', requiresAuth: true }},
    {path: "/users", component: user, meta: { title: 'Список пользователей', requiresAuth: true}},
    {path: "/userAddModal", component: userAddModal, meta: { title: 'Добавление пользователя', requiresAuth: true}},
    {path: '/specializations', component: specialization, meta: { title: 'Специализации', requiresAuth: true }},
    {path: "/login", component: login, meta: { title: 'Авторизация'}},
    {path: "/home", name: 'home', component: home, meta: { title: 'Новостная страница', requiresAuth: true }},
    {path: '/task/:taskId', component: conversation, name: 'TaskChatPage', props: true, meta: { title: 'Чат с ботом', requiresAuth: true }},
    {path: "/error", component: Error, meta: { title: 'Возникла ошибка' }},
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
    const isAdmin = localStorage.getItem("role") === "Administrator";
    if (to.matched.some((route) => route.meta.requiresAdmin)) {
        if (!isAdmin) {
            next("/error");
            return;
        }
    }

    if (to.meta.title) {
        document.title = to.meta.title;
    } else {
        document.title = "Future Task";
    }

    next();
});

export default router;