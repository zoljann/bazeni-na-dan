import axios, { AxiosError } from 'axios';
import env from '../utility/env';
import type { Pool, User } from 'src/types';
import { getAccessToken, setAccessToken } from '../utility/token';

const api = axios.create({
  baseURL: env.apiUrl
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    const code = err?.response?.data?.code;
    const hadAuth = !!err?.config?.headers?.Authorization;

    if (
      status === 401 &&
      hadAuth &&
      (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID' || code === 'AUTH_REQUIRED')
    ) {
      setAccessToken(null);
      // optional: route to /login or show toast here
    }
    return Promise.reject(err);
  }
);

function handleApiError(e: unknown): ApiError {
  const error = (e instanceof AxiosError && e?.response?.data) || e;
  const httpCode = e instanceof AxiosError && e.response?.status;

  return {
    state: 'error',
    message:
      (error?.code === 'ERR_NETWORK' && 'Network error') ||
      (httpCode && httpCode >= 400 && httpCode < 600 && 'Server error') ||
      error?.details ||
      error?.message
  };
}

interface ApiError {
  state: 'error';
  message: string;
}

type AuthSuccess = { state: 'success'; user: User };
type UpdateUserSuccess = { state: 'success'; user: User };
type AvailablePoolsSuccess = { state: 'success'; pools: Pool[] };
type PoolByIdSuccess = { state: 'success'; pool: Pool };
type CreatePoolSuccess = { state: 'success'; pool: Pool };
type DeletePoolSuccess = { state: 'success' };

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthSuccess | ApiError> {
  try {
    const { data } = await api.post('/auth/login', payload);
    setAccessToken(data.accessToken);

    return { state: 'success', user: data.user as User };
  } catch (e) {
    return handleApiError(e);
  }
}

export async function registerUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
}): Promise<AuthSuccess | ApiError> {
  try {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.accessToken);

    return { state: 'success', user: data.user as User };
  } catch (e) {
    return handleApiError(e);
  }
}

type UpdateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  avatarBase64?: string; // map to avatarUrl if provided (data URL or direct URL)
  passwordChange?: { currentPassword: string; newPassword: string };
};

export async function updateUser(
  payload: UpdateUserPayload
): Promise<UpdateUserSuccess | ApiError> {
  try {
    const body: any = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      mobileNumber: payload.mobileNumber
    };
    if (payload.avatarBase64) body.avatarUrl = payload.avatarBase64; // backend expects avatarUrl
    if (payload.passwordChange) body.passwordChange = payload.passwordChange;

    const { data } = await api.put('/user', body);

    return { state: 'success', user: data.user as User };
  } catch (e) {
    return handleApiError(e);
  }
}

// ===== POOLS =====

export async function getAvailablePools(
  userId?: string
): Promise<AvailablePoolsSuccess | ApiError> {
  try {
    const { data } = await api.get('/pools', {
      params: userId ? { userId } : undefined
    });

    return { state: 'success', pools: data.pools as Pool[] };
  } catch (e) {
    return handleApiError(e);
  }
}

export async function getPoolById(id: string): Promise<PoolByIdSuccess | ApiError> {
  try {
    const { data } = await api.get('/pool', { params: { id } });

    return { state: 'success', pool: data.pool as Pool };
  } catch (e) {
    return handleApiError(e);
  }
}

type CreatePoolPayload = {
  pool: {
    title: string;
    city: string;
    capacity: number;
    images: string[];
    pricePerDay?: number;
    description?: string;
    filters?: { heated: boolean; petsAllowed: boolean };
    busyDays?: string[];
  };
};

export async function createPool(
  payload: CreatePoolPayload
): Promise<CreatePoolSuccess | ApiError> {
  try {
    const { data } = await api.post('/pools', payload);

    return { state: 'success', pool: data.pool as Pool };
  } catch (e) {
    return handleApiError(e);
  }
}

export async function deletePool(id: string): Promise<DeletePoolSuccess | ApiError> {
  try {
    await api.delete(`/pools/${id}`);

    return { state: 'success' };
  } catch (e) {
    return handleApiError(e);
  }
}

export async function updatePool(
  id: string,
  payload: CreatePoolPayload
): Promise<CreatePoolSuccess | ApiError> {
  try {
    const { data } = await api.put(`/pools/${id}`, payload);

    return { state: 'success', pool: data.pool as Pool };
  } catch (e) {
    return handleApiError(e);
  }
}
