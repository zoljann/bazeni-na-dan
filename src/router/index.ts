import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "PoolsHomePage",
    component: () => import("../pages/PoolsHomePage.vue"),
  },
  {
    path: "/pretraga",
    name: "PoolsSearchPage",
    component: () => import("../pages/PoolsSearchPage.vue"),
  },
  {
    path: "/bazen",
    name: "PoolDetailsPage",
    component: () => import("../pages/PoolDetailsPage.vue"),
  },
  {
    path: "/sacuvani",
    name: "PoolsSavedPage",
    component: () => import("../pages/PoolsSavedPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
