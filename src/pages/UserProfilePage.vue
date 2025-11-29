<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import isMobile from 'is-mobile';
import Navigation from '.././components/Navigation.vue';
import { useUserStore } from '.././stores/user';
import TitleBar from '../components/TitleBar.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const isMobileView = isMobile();
const showPwd = ref(false);
const pwd = ref({ currentPassword: '', newPassword: '' });
const pwdErrors = ref<{ currentPassword?: string; newPassword?: string }>({});
const avatarInputRef = ref<HTMLInputElement | null>(null);
const avatarRemoved = ref(false);
const isSavingProfile = ref(false);
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
  avatarPreview: '' as string
});
const errors = ref<{
  firstName?: string;
  lastName?: string;
  email?: string;
  mobileNumber?: string;
}>({});

const authClasses = computed(() => ({
  [`auth--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const nameOk = (v: string) => v.trim().length >= 2 && v.trim().length <= 40;
const passOk = (v: string) => v.length >= 6 && v.length <= 25;
const mobileOk = (v: string) => /^\d{9,15}$/.test(v);
const sanitizeMobile = (v: string) => v.replace(/\D/g, '').slice(0, 15);
const openAvatarPicker = () => avatarInputRef.value?.click();
const onAvatarChange = async (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (!f) return;

  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(f.type) || f.size > 5 * 1024 * 1024) return;

  const dataUrl = await fileToAvatarBase64(f);
  if (!dataUrl) return;

  form.value.avatarPreview = dataUrl;
  avatarRemoved.value = false;
};
function fileToAvatarBase64(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const maxSize = 400;

      let { width, height } = img;
      const ratio = Math.min(maxSize / width, maxSize / height, 1);
      width = width * ratio;
      height = height * ratio;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = 0.7;

      const dataUrl = canvas.toDataURL(mimeType, quality);

      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

const clearAvatar = () => {
  form.value.avatarPreview = '';
  avatarRemoved.value = true;

  if (avatarInputRef.value) {
    avatarInputRef.value.value = '';
  }
};
const fillFromStore = () => {
  const u = userStore.user!;
  form.value.firstName = u.firstName || '';
  form.value.lastName = u.lastName || '';
  form.value.email = u.email || '';
  form.value.mobileNumber = u.mobileNumber || '';
  form.value.avatarPreview = u.avatarUrl || '';
  avatarRemoved.value = false;
  errors.value = {};
  showPwd.value = false;
  pwd.value = { currentPassword: '', newPassword: '' };
  pwdErrors.value = {};
};
const submit = async () => {
  errors.value = {};
  pwdErrors.value = {};

  if (!nameOk(form.value.firstName))
    errors.value.firstName = 'Unesite ispravno ime (min 2, max 40 karaktera).';
  if (!nameOk(form.value.lastName))
    errors.value.lastName = 'Unesite ispravno prezime (min 2, max 40 karaktera).';
  if (!emailOk(form.value.email)) errors.value.email = 'Email nije ispravnog formata.';
  if (!mobileOk(form.value.mobileNumber))
    errors.value.mobileNumber = 'Broj telefona mora imati 9–15 cifara.';

  const wantsPwd =
    showPwd.value && (pwd.value.currentPassword.length > 0 || pwd.value.newPassword.length > 0);
  if (wantsPwd) {
    if (!passOk(pwd.value.currentPassword))
      pwdErrors.value.currentPassword = 'Lozinka mora imati 6–25 karaktera.';
    if (!passOk(pwd.value.newPassword))
      pwdErrors.value.newPassword = 'Lozinka mora imati 6–25 karaktera.';
  }

  if (Object.keys(errors.value).length || Object.keys(pwdErrors.value).length) return;

  const payload: {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    avatarBase64?: string;
    removeAvatar?: boolean;
    passwordChange?: { currentPassword: string; newPassword: string };
  } = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    mobileNumber: form.value.mobileNumber
  };

  if (avatarRemoved.value) {
    payload.removeAvatar = true;
  } else if (form.value.avatarPreview.startsWith('data:')) {
    payload.avatarBase64 = form.value.avatarPreview;
  }
  if (wantsPwd)
    payload.passwordChange = {
      currentPassword: pwd.value.currentPassword,
      newPassword: pwd.value.newPassword
    };

  if (isSavingProfile.value) return;
  isSavingProfile.value = true;
  try {
    await userStore.updateProfile(payload);
  } finally {
    isSavingProfile.value = false;
  }
};

onMounted(() => {
  if (userStore.isAuthenticated) fillFromStore();
});
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="auth"
    :class="authClasses"
  >
    <TitleBar title="Moj profil" />

    <div class="auth-card">
      <div class="auth-avatar">
        <div
          class="auth-avatar-ring"
          @click="openAvatarPicker"
          role="button"
          aria-label="Promijeni avatar"
          tabindex="0"
        >
          <img
            v-if="form.avatarPreview"
            :src="form.avatarPreview"
            alt="Avatar bazeni"
            class="auth-avatar-img"
          />
          <div
            v-else
            class="auth-avatar-placeholder"
          >
            👤
          </div>
          <button
            v-if="form.avatarPreview"
            type="button"
            class="auth-avatar-remove"
            @click.stop="clearAvatar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 3h6a1 1 0 0 1 1 1v2h3v2h-1v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8H5V6h3V4a1 1 0 0 1 1-1zm1 4v10h2V7h-2zm4 0v10h2V7h-2z"
                fill="currentColor"
              />
            </svg>
          </button>

          <div
            class="auth-avatar-edit"
            aria-hidden="true"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
                fill="currentColor"
              />
            </svg>
          </div>

          <input
            ref="avatarInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            @change="onAvatarChange"
          />
        </div>
      </div>

      <form
        class="auth-form"
        @submit.prevent="submit"
      >
        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.firstName }"
        >
          <label
            class="auth-label"
            for="firstName"
            >Ime</label
          >
          <input
            id="firstName"
            v-model.trim="form.firstName"
            class="auth-input"
            type="text"
            autocomplete="given-name"
          />
          <p
            v-if="errors.firstName"
            class="auth-error"
          >
            {{ errors.firstName }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.lastName }"
        >
          <label
            class="auth-label"
            for="lastName"
            >Prezime</label
          >
          <input
            id="lastName"
            v-model.trim="form.lastName"
            class="auth-input"
            type="text"
            autocomplete="family-name"
          />
          <p
            v-if="errors.lastName"
            class="auth-error"
          >
            {{ errors.lastName }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.email }"
        >
          <label
            class="auth-label"
            for="email"
            >Email</label
          >
          <input
            id="email"
            v-model.trim="form.email"
            class="auth-input"
            type="email"
            inputmode="email"
            autocomplete="email"
          />
          <p
            v-if="errors.email"
            class="auth-error"
          >
            {{ errors.email }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.mobileNumber }"
        >
          <label
            class="auth-label"
            for="mobileNumber"
            >Broj telefona</label
          >
          <input
            id="mobileNumber"
            :value="form.mobileNumber"
            @input="form.mobileNumber = sanitizeMobile(($event.target as HTMLInputElement).value)"
            class="auth-input"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
          />
          <p
            v-if="errors.mobileNumber"
            class="auth-error"
          >
            {{ errors.mobileNumber }}
          </p>
        </div>

        <button
          type="button"
          class="auth-password-toggle"
          @click="showPwd = !showPwd"
        >
          Promijeni lozinku
          <svg
            :class="{ 'is-open': showPwd }"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M7 10l5 5 5-5H7z"
              fill="currentColor"
            />
          </svg>
        </button>

        <div
          v-if="showPwd"
          class="auth-password"
        >
          <div
            class="auth-field"
            :class="{ 'has-error': !!pwdErrors.currentPassword }"
          >
            <label
              class="auth-label"
              for="currentPassword"
              >Trenutna lozinka</label
            >
            <input
              id="currentPassword"
              v-model="pwd.currentPassword"
              class="auth-input"
              autocomplete="current-password"
            />
            <p
              v-if="pwdErrors.currentPassword"
              class="auth-error"
            >
              {{ pwdErrors.currentPassword }}
            </p>
          </div>

          <div
            class="auth-field"
            :class="{ 'has-error': !!pwdErrors.newPassword }"
          >
            <label
              class="auth-label"
              for="newPassword"
              >Nova lozinka</label
            >
            <input
              id="newPassword"
              v-model="pwd.newPassword"
              class="auth-input"
              autocomplete="new-password"
            />
            <p
              v-if="pwdErrors.newPassword"
              class="auth-error"
            >
              {{ pwdErrors.newPassword }}
            </p>
          </div>
        </div>

        <button
          type="submit"
          class="auth-submit"
          :disabled="isSavingProfile"
        >
          <span v-if="isSavingProfile">Spremanje...</span>
          <span v-else>Sačuvaj promjene</span>
        </button>
        <button
          type="button"
          class="auth-secondary"
          @click="router.push({ name: 'PoolsPublishedPage' })"
        >
          Objavljeni bazeni
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
.auth {
  padding: 16px;

  &-header {
    margin: 0 auto 12px;
  }

  &-card {
    width: 100%;
    max-width: 1100px;
    border-radius: 16px;
    background: #fff;
    display: grid;
    gap: 14px;
    justify-self: center;
  }

  &-form {
    display: grid;
    gap: 12px;
  }

  &-field {
    display: grid;
    gap: 6px;
  }

  &-label {
    font-size: 13px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 800;
  }

  &-input {
    width: 100%;
    height: 46px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0 14px;
    color: var(--text-color-black);
    font-weight: 600;
    background: #fff;
  }

  &-error {
    color: #a31515;
    font-weight: 700;
    font-size: 13px;
  }

  .has-error .auth-input {
    border-color: #ffb3b3;
    background: #fff4f4;
  }

  &-submit {
    height: 48px;
    border-radius: 999px;
    background: var(--primary-color);
    color: var(--text-color-white);
    font-weight: 900;
    box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    cursor: pointer;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &-avatar {
    display: flex;
    justify-content: center;
  }

  &-avatar-ring {
    width: 110px;
    height: 110px;
    border-radius: 999px;
    position: relative;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    background: #f8fafc;
    cursor: pointer;

    input[type='file'] {
      display: none;
    }
  }

  &-avatar-remove {
    position: absolute;
    bottom: 10px;
    left: 10px;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #ffffffcc;
    color: red;
    display: grid;
    place-items: center;
    cursor: pointer;
    padding: 0;
  }

  &-avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &-avatar-placeholder {
    font-size: 40px;
    line-height: 1;
  }

  &-avatar-edit {
    position: absolute;
    right: 10px;
    bottom: 10px;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: #ffffffcc;
    border: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
    color: var(--text-color-black);
  }

  &-password-toggle {
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    width: max-content;
    background: #fbfdff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 12px;
    font-weight: 800;
    color: var(--text-color-black);
    cursor: pointer;
    width: 100%;

    svg {
      transition: transform 160ms ease;
    }

    svg.is-open {
      transform: rotate(180deg);
    }
  }

  &-password {
    display: grid;
    gap: 12px;
  }

  &-secondary {
    height: 48px;
    border-radius: 999px;
    border: 1px solid var(--primary-color);
    background: #f1f5f9;
    color: var(--text-color-black);
    font-weight: 900;
    cursor: pointer;
  }

  &--mobile {
    .auth {
      &-submit,
      &-secondary {
        width: 100%;
      }
    }
  }

  &--desktop {
    .auth {
      &-card {
        padding: 14px;
      }

      &-submit,
      &-secondary {
        width: 50%;
        justify-self: center;

        &:hover {
          filter: brightness(0.95);
        }
      }

      &-avatar-edit:hover,
      &-avatar-remove:hover {
        filter: brightness(0.95);
      }
    }
  }
}
</style>
