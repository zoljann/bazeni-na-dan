import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "PoolsHomePage",
    component: () => import("../pages/PoolsHomePage.vue"),
  },
  {
    path: "/search",
    name: "PoolsSearchPage",
    component: () => import("../pages/PoolsSearchPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
