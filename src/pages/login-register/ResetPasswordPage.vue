<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import Navigation from '../../components/Navigation.vue';
import TitleBar from '../../components/TitleBar.vue';
import { useUserStore } from '../../stores/user';
import { notificationsStore } from '@/stores/notifications';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const notifications = notificationsStore();
const isMobileView = isMobile();

const password = ref('');
const confirmPassword = ref('');
const errors = ref<{ password?: string; confirmPassword?: string }>({});

const token = computed(() => String(route.query.token ?? ''));

const authClasses = computed(() => ({
  [`auth--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const passOk = (v: string) => v.length >= 6 && v.length <= 25;

const submitReset = async () => {
  errors.value = {};

  if (!token.value) {
    notifications.addNotification('Link za reset lozinke nije ispravan ili je istekao.', 'error');
    return;
  }

  if (!passOk(password.value)) {
    errors.value.password = 'Lozinka mora imati 6–25 karaktera.';
  }

  if (confirmPassword.value !== password.value) {
    errors.value.confirmPassword = 'Lozinke se ne podudaraju.';
  }

  if (Object.keys(errors.value).length) return;

  const res = await userStore.requestResetPassword(token.value, password.value);

  if (res === 'success') {
    notifications.addNotification(
      'Lozinka je uspješno promijenjena. Možete se prijaviti.',
      'success',
      8000
    );
    password.value = '';
    confirmPassword.value = '';
    router.replace({ name: 'LoginRegisterPage' });
  } else {
    notifications.addNotification('Neuspješan pokušaj reseta lozinke.', 'error');
  }
};
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="auth"
    :class="authClasses"
  >
    <TitleBar title="Reset lozinke" />

    <div class="auth-card">
      <p class="auth-helper">
        Unesite novu lozinku za svoj Bazeni na dan nalog. Nakon uspješnog reseta moći ćete se
        prijaviti sa novom lozinkom.
      </p>

      <form
        class="auth-form"
        @submit.prevent="submitReset"
      >
        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.password }"
        >
          <label
            class="auth-label"
            for="newPassword"
            >Nova lozinka</label
          >
          <input
            id="newPassword"
            v-model="password"
            class="auth-input"
            type="password"
            autocomplete="new-password"
          />
          <p
            v-if="errors.password"
            class="auth-error"
          >
            {{ errors.password }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.confirmPassword }"
        >
          <label
            class="auth-label"
            for="confirmPassword"
            >Potvrda lozinke</label
          >
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            class="auth-input"
            type="password"
            autocomplete="new-password"
          />
          <p
            v-if="errors.confirmPassword"
            class="auth-error"
          >
            {{ errors.confirmPassword }}
          </p>
        </div>

        <button
          type="submit"
          class="auth-submit"
        >
          Sačuvaj novu lozinku
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
    padding: 14px;
  }

  &-helper {
    font-size: 14px;
    color: #6b7280;
    max-width: 460px;
  }

  &-form {
    display: grid;
    gap: 12px;
    max-width: 460px;
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
    border: 1px solid var(--primary-color);
    box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    cursor: pointer;
    width: 100%;
  }

  &--desktop {
    .auth-submit {
      width: 50%;
      justify-self: flex-start;
    }
  }
}
</style>
