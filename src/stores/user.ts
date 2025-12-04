import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { User } from 'src/types';
import { notificationsStore } from './notifications';
import { forgotPassword, loginUser, registerUser, resetPassword, updateUser } from '../api';
import { storage } from '../utility/localStorage';
import { setAccessToken } from '../utility/token';

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
      useNotificationsStore.addNotification('Neispravni kredencijali.', 'error');
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
      if (res.message === 'Email') {
        useNotificationsStore.addNotification('Uneseni e-mail se već koristi.', 'error');
      } else {
        useNotificationsStore.addNotification('Registracija nije uspjela.', 'error');
      }

      return 'error' as const;
    }

    setUser(res.user);
    useNotificationsStore.addNotification('Uspješna registracija.', 'success');
    return 'success' as const;
  };

  const updateProfile = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    avatarBase64?: string;
    passwordChange?: { currentPassword: string; newPassword: string };
  }) => {
    if (!user.value) return 'error' as const;

    const res = await updateUser({ ...payload });
    if (res.state === 'error') {
      useNotificationsStore.addNotification('Ažuriranje nije uspjelo.', 'error');
      return 'error' as const;
    }

    setUser(res.user);
    useNotificationsStore.addNotification('Profil ažuriran.', 'success');
    return 'success' as const;
  };

  const requestForgotPassword = async (email: string) => {
    const res = await forgotPassword({ email });

    return res.state === 'success' ? ('success' as const) : ('error' as const);
  };

  const requestResetPassword = async (token: string, newPassword: string) => {
    const res = await resetPassword({ token, password: newPassword });

    return res.state === 'success' ? ('success' as const) : ('error' as const);
  };

  const incrementPublishedPoolsCount = () => {
    if (!user.value) return;
    user.value.publishedPoolsCount = (user.value.publishedPoolsCount ?? 0) + 1;
    storage.setItem(USER_STORAGE_KEY, user.value);
  };

  const decrementPublishedPoolsCount = () => {
    if (!user.value) return;
    const current = user.value.publishedPoolsCount ?? 0;
    user.value.publishedPoolsCount = Math.max(0, current - 1);
    storage.setItem(USER_STORAGE_KEY, user.value);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    useNotificationsStore.addNotification('Uspješna odjava', 'success');
  };

  return {
    user,
    isAuthenticated,
    login,
    register,
    updateProfile,
    requestForgotPassword,
    requestResetPassword,
    incrementPublishedPoolsCount,
    decrementPublishedPoolsCount,
    logout
  };
});
