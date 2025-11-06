import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './styles/index.scss';
import { useUserStore } from './stores/user';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);

const userStore = useUserStore(pinia);
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return { name: 'LoginRegisterPage', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && userStore.isAuthenticated) {
    return { name: 'PoolsHomePage' };
  }

  return true;
});

app.mount('#app');
