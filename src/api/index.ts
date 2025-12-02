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
    }
    return Promise.reject(err);
  }
);

function handleApiError(e: unknown): ApiError {
  const error = (e instanceof AxiosError && e?.response?.data) || e;

  return {
    state: 'error',
    message: error?.details || error?.message
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
  avatarBase64?: string;
  removeAvatar?: boolean;
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

    if (payload.removeAvatar) {
      body.avatarUrl = null;
    } else if (payload.avatarBase64 && isDataUrl(payload.avatarBase64)) {
      const uploadRes = await uploadSingleImage(payload.avatarBase64, '/avatars');

      if ((uploadRes as ApiError).state === 'error') {
        return uploadRes as ApiError;
      }

      body.avatarUrl = uploadRes as string;
    }

    if (payload.passwordChange) {
      body.passwordChange = payload.passwordChange;
    }

    const { data } = await api.put('/user', body);

    return { state: 'success', user: data.user as User };
  } catch (e) {
    return handleApiError(e);
  }
}

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
    filters?: {
      heated: boolean;
      petsAllowed: boolean;
      partyAllowed: boolean;
      wiFi: boolean;
      bbq: boolean;
      parking: boolean;
      summerKitchen: boolean;
    };
    busyDays?: string[];
  };
};

export async function createPool(
  payload: CreatePoolPayload
): Promise<CreatePoolSuccess | ApiError> {
  try {
    const rawImages = payload.pool.images || [];
    const base64Images = rawImages.filter((img) => isDataUrl(img));

    let imagesToSend: string[] = rawImages;

    if (base64Images.length) {
      const uploadRes = await uploadMultipleImages(base64Images, '/pools');

      if ((uploadRes as ApiError).state === 'error') {
        return uploadRes as ApiError;
      }

      const uploadedUrls = uploadRes as string[];
      let idx = 0;

      imagesToSend = rawImages.map((img) => (isDataUrl(img) ? uploadedUrls[idx++]! : img));
    }

    const body = {
      pool: {
        ...payload.pool,
        images: imagesToSend
      }
    };

    const { data } = await api.post('/pools', body);

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
    const rawImages = payload.pool.images || [];
    const base64Images = rawImages.filter((img) => isDataUrl(img));

    let imagesToSend: string[] = rawImages;

    if (base64Images.length) {
      const uploadRes = await uploadMultipleImages(base64Images, '/pools');

      if ((uploadRes as ApiError).state === 'error') {
        return uploadRes as ApiError;
      }

      const uploadedUrls = uploadRes as string[];
      let idx = 0;

      imagesToSend = rawImages.map((img) => (isDataUrl(img) ? uploadedUrls[idx++]! : img));
    }

    const body = {
      pool: {
        ...payload.pool,
        images: imagesToSend
      }
    };

    const { data } = await api.put(`/pools/${id}`, body);

    return { state: 'success', pool: data.pool as Pool };
  } catch (e) {
    return handleApiError(e);
  }
}

type UpdatePoolVisibilityAdminSuccess = { state: 'success'; pool: Pool };

export async function updatePoolVisibilityAdmin(
  id: string,
  payload: { isVisible: boolean; visibleUntil: string | null },
  adminSecret: string
): Promise<UpdatePoolVisibilityAdminSuccess | ApiError> {
  try {
    const { data } = await api.put(`/pools/${id}/visibility`, payload, {
      headers: {
        'x-admin-secret': adminSecret
      }
    });

    return { state: 'success', pool: data.pool as Pool };
  } catch (e) {
    return handleApiError(e);
  }
}

type AdminPoolsSuccess = { state: 'success'; pools: Pool[] };

export async function getAdminPools(adminSecret: string): Promise<AdminPoolsSuccess | ApiError> {
  try {
    const { data } = await api.get('/admin/pools', {
      headers: {
        'x-admin-secret': adminSecret
      }
    });

    return { state: 'success', pools: data.pools as Pool[] };
  } catch (e) {
    return handleApiError(e);
  }
}

type AdminUsersSuccess = { state: 'success'; users: User[] };

export async function getAdminUsers(adminSecret: string): Promise<AdminUsersSuccess | ApiError> {
  try {
    const { data } = await api.get('/admin/users', {
      headers: {
        'x-admin-secret': adminSecret
      }
    });

    return { state: 'success', users: data.users as User[] };
  } catch (e) {
    return handleApiError(e);
  }
}

function isDataUrl(value: string): boolean {
  return typeof value === 'string' && value.startsWith('data:');
}

async function uploadSingleImage(fileBase64: string, folder?: string): Promise<string | ApiError> {
  try {
    const { data } = await api.post('/upload/image', {
      file: fileBase64,
      folder
    });

    return data.url as string;
  } catch (e) {
    return handleApiError(e);
  }
}

async function uploadMultipleImages(
  filesBase64: string[],
  folder?: string
): Promise<string[] | ApiError> {
  try {
    const { data } = await api.post('/upload/images', {
      files: filesBase64,
      folder
    });

    return data.urls as string[];
  } catch (e) {
    return handleApiError(e);
  }
}
