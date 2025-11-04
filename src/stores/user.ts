import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { User } from 'src/types';
import { notificationsStore } from './notifications';
import { loginUser, registerUser } from '../api';
import { storage } from '../utility/localStorage';

const USER_STORAGE_KEY = 'BND_user';

const loadUserFromLS = () => {
  const rawUser = storage.getItem(USER_STORAGE_KEY);

  return rawUser && typeof rawUser === 'object' ? (rawUser as User) : null;
};

export const useUserStore = defineStore('userStore', () => {
  const useNotificationsStore = notificationsStore();

  const user = ref<User | null>(loadUserFromLS());
  const isAuthenticated = computed(() => !!user.value);

  const setUser = (u: User | null) => {
    user.value = u;

    if (u) storage.setItem(USER_STORAGE_KEY, u);
    else storage.removeItem(USER_STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    const res = await loginUser({ email, password });
    if (res.state === 'error') {
      useNotificationsStore.addNotification(res.message || 'Neispravni kredencijali.', 'error');
      return 'error' as const;
    }

    setUser(res.user);
    useNotificationsStore.addNotification('Uspješna prijava.', 'success');
    return 'success' as const;
  };

  const register = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    password: string;
  }) => {
    const res = await registerUser(payload);
    if (res.state === 'error') {
      useNotificationsStore.addNotification(res.message || 'Registracija nije uspjela.', 'error');
      return 'error' as const;
    }

    setUser(res.user);
    useNotificationsStore.addNotification('Uspješna registracija.', 'success');
    return 'success' as const;
  };

  const logout = () => {
    setUser(null);
    useNotificationsStore.addNotification('Uspješna odjava', 'success');
  };

  return { user, isAuthenticated, login, register, logout };
});
