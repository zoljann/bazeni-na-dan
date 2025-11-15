import { nextTick } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, saved) {
    if (saved) return saved;
    if (to.hash) return { el: to.hash };
    return { left: 0, top: 0 };
  },
  routes: [
    {
      path: '/',
      name: 'PoolsHomePage',
      component: () => import('../pages/PoolsHomePage.vue')
    },
    {
      path: '/pretraga',
      name: 'PoolsSearchPage',
      component: () => import('../pages/PoolsSearchPage.vue')
    },
    {
      path: '/bazen',
      name: 'PoolDetailsPage',
      component: () => import('../pages/PoolDetailsPage.vue')
    },
    {
      path: '/sacuvani',
      name: 'PoolsSavedPage',
      component: () => import('../pages/PoolsSavedPage.vue')
    },
    {
      path: '/objavi-bazen',
      name: 'PoolsEditPublishPage',
      component: () => import('../pages/PoolsEditPublishPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/objavljeni-bazeni',
      name: 'PoolsPublishedPage',
      component: () => import('../pages/PoolsPublishedPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/prijava',
      name: 'LoginRegisterPage',
      component: () => import('../pages/login-register/LoginRegisterPage.vue'),
      meta: { guestOnly: true }
    },
    {
      path: '/profil',
      name: 'UserProfilePage',
      component: () => import('../pages/UserProfilePage.vue'),
      meta: { requiresAuth: true }
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'PoolsHomePage' } }
  ]
});

router.afterEach(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  });
});

export default router;
