<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import Navigation from '../../components/Navigation.vue';
import { useUserStore } from '../../stores/user';
import TitleBar from '../../components/TitleBar.vue';

const router = useRouter();
const route = useRoute();
const nextRoute = (route.query.next as string) || 'PoolsHomePage';
const userStore = useUserStore();
const isMobileView = isMobile();
const mode = ref('register');
const showRegPassword = ref(false);
const showLoginPassword = ref(false);
const reg = ref({
  firstName: '',
  lastName: '',
  email: '',
  mobileNumber: '',
  password: ''
});
const loginPayload = ref({
  email: '',
  password: ''
});
const regErrors = ref<{ [k in keyof typeof reg.value]?: string }>({});
const loginErrors = ref<{ email?: string; password?: string }>({});

const authClasses = computed(() => ({
  [`auth--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const nameOk = (v: string) => v.trim().length >= 2 && v.trim().length <= 40;
const passOk = (v: string) => v.length >= 6 && v.length <= 25;
const mobileOk = (v: string) => /^\d{9,15}$/.test(v);
const sanitizeMobile = (v: string) => v.replace(/\D/g, '').slice(0, 15);

const submitRegister = async () => {
  regErrors.value = {};
  if (!nameOk(reg.value.firstName))
    regErrors.value.firstName = 'Unesite ispravno ime (min 2, max 40 karaktera).';
  if (!nameOk(reg.value.lastName))
    regErrors.value.lastName = 'Unesite ispravno prezime (min 2, max 40 karaktera).';
  if (!emailOk(reg.value.email)) regErrors.value.email = 'Email nije ispravnog formata.';
  if (!mobileOk(reg.value.mobileNumber))
    regErrors.value.mobileNumber = 'Broj telefona mora imati 9–15 cifara.';
  if (!passOk(reg.value.password)) regErrors.value.password = 'Lozinka mora imati 6–25 karaktera.';
  if (Object.keys(regErrors.value).length) return;

  const res = await userStore.register({ ...reg.value });
  if (res === 'success') router.push({ name: nextRoute });
};

const submitLogin = async () => {
  loginErrors.value = {};
  if (!emailOk(loginPayload.value.email)) loginErrors.value.email = 'Email nije ispravnog formata.';
  if (!passOk(loginPayload.value.password))
    loginErrors.value.password = 'Lozinka mora imati 6–25 karaktera.';
  if (Object.keys(loginErrors.value).length) return;

  const res = await userStore.login(loginPayload.value.email, loginPayload.value.password);
  if (res === 'success') router.push({ name: nextRoute });
};
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="auth"
    :class="authClasses"
  >
    <TitleBar :title="mode === 'register' ? 'Registracija' : 'Prijava'" />
    <div class="auth-card">
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ 'is-active': mode === 'register' }"
          @click="mode = 'register'"
        >
          Registracija
        </button>
        <button
          class="auth-tab"
          :class="{ 'is-active': mode === 'login' }"
          @click="mode = 'login'"
        >
          Prijava
        </button>
      </div>

      <form
        v-if="mode === 'register'"
        class="auth-form"
        @submit.prevent="submitRegister"
      >
        <div
          class="auth-field"
          :class="{ 'has-error': !!regErrors.firstName }"
        >
          <label
            class="auth-label"
            for="firstName"
            >Ime</label
          >
          <input
            id="firstName"
            v-model.trim="reg.firstName"
            class="auth-input"
            type="text"
            autocomplete="given-name"
            maxlength="40"
          />
          <p
            v-if="regErrors.firstName"
            class="auth-error"
          >
            {{ regErrors.firstName }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!regErrors.lastName }"
        >
          <label
            class="auth-label"
            for="lastName"
            >Prezime</label
          >
          <input
            id="lastName"
            v-model.trim="reg.lastName"
            class="auth-input"
            type="text"
            autocomplete="family-name"
            maxlength="40"
          />
          <p
            v-if="regErrors.lastName"
            class="auth-error"
          >
            {{ regErrors.lastName }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!regErrors.email }"
        >
          <label
            class="auth-label"
            for="regEmail"
            >Email</label
          >
          <input
            id="regEmail"
            v-model.trim="reg.email"
            class="auth-input"
            type="email"
            inputmode="email"
            autocomplete="email"
            maxlength="60"
          />
          <p
            v-if="regErrors.email"
            class="auth-error"
          >
            {{ regErrors.email }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!regErrors.mobileNumber }"
        >
          <label
            class="auth-label"
            for="mobileNumber"
            >Broj telefona</label
          >
          <input
            id="mobileNumber"
            :value="reg.mobileNumber"
            @input="reg.mobileNumber = sanitizeMobile(($event.target as HTMLInputElement).value)"
            class="auth-input"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="15"
          />
          <p
            v-if="regErrors.mobileNumber"
            class="auth-error"
          >
            {{ regErrors.mobileNumber }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!regErrors.password }"
        >
          <label
            class="auth-label"
            for="regPassword"
            >Lozinka</label
          >
          <div class="auth-inputwrap">
            <input
              id="regPassword"
              v-model="reg.password"
              class="auth-input"
              :type="showRegPassword ? 'text' : 'password'"
              autocomplete="new-password"
              maxlength="25"
            />
            <button
              type="button"
              class="auth-eye"
              @click="showRegPassword = !showRegPassword"
              aria-label="Prikaži/sačuvaj lozinku"
            >
              <svg
                v-if="!showRegPassword"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <svg
                v-else
                width="22"
                height="22"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.9 20.9 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.9 20.9 0 0 1-3.41 4.3M1 1l22 22"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </button>
          </div>
          <p
            v-if="regErrors.password"
            class="auth-error"
          >
            {{ regErrors.password }}
          </p>
        </div>

        <button
          type="submit"
          class="auth-submit"
        >
          Registruj se
        </button>
      </form>

      <form
        v-else
        class="auth-form"
        @submit.prevent="submitLogin"
      >
        <div
          class="auth-field"
          :class="{ 'has-error': !!loginErrors.email }"
        >
          <label
            class="auth-label"
            for="loginEmail"
            >Email</label
          >
          <input
            id="loginEmail"
            v-model.trim="loginPayload.email"
            class="auth-input"
            type="email"
            inputmode="email"
            autocomplete="email"
            maxlength="60"
          />
          <p
            v-if="loginErrors.email"
            class="auth-error"
          >
            {{ loginErrors.email }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!loginErrors.password }"
        >
          <label
            class="auth-label"
            for="loginPassword"
            >Lozinka</label
          >
          <div class="auth-inputwrap">
            <input
              id="loginPassword"
              v-model="loginPayload.password"
              class="auth-input"
              :type="showLoginPassword ? 'text' : 'password'"
              autocomplete="current-password"
              maxlength="25"
            />
            <button
              type="button"
              class="auth-eye"
              @click="showLoginPassword = !showLoginPassword"
              aria-label="Prikaži/sačuvaj lozinku"
            >
              <svg
                v-if="!showLoginPassword"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
              <svg
                v-else
                width="22"
                height="22"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.9 20.9 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a20.9 20.9 0 0 1-3.41 4.3M1 1l22 22"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </button>
          </div>
          <p
            v-if="loginErrors.password"
            class="auth-error"
          >
            {{ loginErrors.password }}
          </p>
        </div>

        <button
          type="submit"
          class="auth-submit"
        >
          Prijavi se
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
.auth {
  padding: 16px;

  &-card {
    width: 100%;
    max-width: 1100px;
    border-radius: 16px;
    background: #fff;
    display: grid;
    gap: 14px;
    justify-self: center;
  }

  &-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  &-tab {
    height: 44px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #fbfdff;
    font-weight: 800;
    color: var(--text-color-black);
    cursor: pointer;
  }

  &-tab.is-active {
    background: var(--primary-color);
    color: var(--text-color-white);
    border-color: var(--primary-color);
    box-shadow: 0 6px 14px rgba(0, 178, 255, 0.22);
  }

  &-form {
    display: grid;
    gap: 12px;
  }

  &-label {
    font-size: 13px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 800;
  }

  &-inputwrap {
    position: relative;
  }

  &-input {
    width: 100%;
    height: 46px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0 46px 0 14px;
    color: var(--text-color-black);
    font-weight: 600;
    background: #fff;
  }

  &-eye {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 34px;
    height: 34px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    color: var(--text-color-black);
    cursor: pointer;
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
    border: 1px solid var(--primary-color);
    box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    cursor: pointer;
  }

  &--mobile {
    .auth-submit {
      width: 100%;
    }
  }

  &--desktop {
    .auth-card {
      padding: 14px;
    }

    .auth-submit {
      width: 50%;
      justify-self: center;
    }
  }
}
</style>
