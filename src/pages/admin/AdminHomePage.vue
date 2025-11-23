<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import isMobile from 'is-mobile';
import Navigation from '@/components/Navigation.vue';
import TitleBar from '@/components/TitleBar.vue';
import { notificationsStore } from '@/stores/notifications';
import { updatePoolVisibilityAdmin } from '@/api';
import env from '@/utility/env';
import { storage } from '@/utility/localStorage';

const isMobileView = isMobile();
const notifications = notificationsStore();
const adminPassword = ref('');
const isAuthed = ref(false);
const loginError = ref('');
const visibilityPoolId = ref('');
const visibilityEnabled = ref(true);
const visibilityUntil = ref('');
const isSavingVisibility = ref(false);

const pageClasses = computed(() => ({
  [`admin--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

onMounted(() => {
  const saved = storage.getItem('BND_admin_secret');

  if (typeof saved === 'string' && env.adminSecret && saved === env.adminSecret) {
    adminPassword.value = saved;
    isAuthed.value = true;
  } else if (saved && env.adminSecret && saved !== env.adminSecret) {
    storage.removeItem('BND_admin_secret');
  }
});

const handleLogin = () => {
  loginError.value = '';

  const input = adminPassword.value.trim();
  if (!input) {
    loginError.value = 'Unesite admin lozinku.';
    return;
  }

  if (!env.adminSecret) {
    loginError.value = 'Admin lozinka nije konfigurirana (VITE_ADMIN_SECRET).';
    return;
  }

  if (input === env.adminSecret) {
    isAuthed.value = true;
    storage.setItem('BND_admin_secret', input);
  } else {
    loginError.value = 'Pogrešna lozinka.';
  }
};
const submitVisibility = async () => {
  if (!isAuthed.value) return;

  const id = visibilityPoolId.value.trim();
  if (!id) {
    notifications.addNotification('Unesite ID bazena.', 'error');
    return;
  }

  isSavingVisibility.value = true;

  try {
    const visibleUntilIso =
      visibilityEnabled.value && visibilityUntil.value
        ? new Date(`${visibilityUntil.value}T00:00:00`).toISOString()
        : null;

    const res = await updatePoolVisibilityAdmin(
      id,
      {
        isVisible: visibilityEnabled.value,
        visibleUntil: visibleUntilIso
      },
      adminPassword.value.trim()
    );

    if (res.state === 'error') {
      notifications.addNotification(res.message, 'error');
    } else {
      notifications.addNotification('Vidljivost bazena ažurirana.', 'success');
    }
  } catch {
    notifications.addNotification('Ažuriranje vidljivosti nije uspjelo.', 'error');
  } finally {
    isSavingVisibility.value = false;
  }
};
const openUsersAdmin = () => {
  console.log('open admin/users');
};
const openPoolsAdmin = () => {
  console.log('open admin/pools');
};
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="admin"
    :class="pageClasses"
  >
    <TitleBar title="Admin" />

    <div class="admin-shell">
      <div
        v-if="!isAuthed"
        class="admin-card"
      >
        <h2 class="admin-card-title">Prijava</h2>

        <form
          class="admin-form"
          @submit.prevent="handleLogin"
        >
          <div class="admin-field">
            <label
              for="admin-pass"
              class="admin-label"
            >
              Admin lozinka <span class="req">*</span>
            </label>

            <input
              id="admin-pass"
              v-model="adminPassword"
              class="admin-input"
              type="password"
              autocomplete="off"
            />

            <p
              v-if="loginError"
              class="admin-error"
            >
              {{ loginError }}
            </p>
          </div>

          <button
            type="submit"
            class="admin-button-primary"
          >
            Prijava
          </button>
        </form>
      </div>

      <div
        v-else
        class="admin-grid"
      >
        <div class="admin-card">
          <h2 class="admin-card-title">Vidljivost bazena</h2>

          <form
            class="admin-form"
            @submit.prevent="submitVisibility"
          >
            <div class="admin-field">
              <label
                for="pool-id"
                class="admin-label"
              >
                ID bazena <span class="req">*</span>
              </label>
              <input
                id="pool-id"
                v-model.trim="visibilityPoolId"
                class="admin-input"
                type="text"
                placeholder="npr. 665c1a2f7a2f0a3f9b6d1a11"
              />
            </div>

            <div class="admin-field">
              <label class="admin-check">
                <input
                  v-model="visibilityEnabled"
                  type="checkbox"
                />
                <span class="admin-check-label">
                  Uključi vidljivost (isključeno = sakriven bez obzira na datum)
                </span>
              </label>
            </div>

            <div class="admin-field">
              <label
                for="visible-until"
                class="admin-label"
              >
                Vidljivo do (opcionalno)
              </label>
              <input
                id="visible-until"
                v-model="visibilityUntil"
                class="admin-input"
                type="date"
                :disabled="!visibilityEnabled"
              />
              <p class="admin-hint">Prazno znači da bazen ostaje vidljiv bez roka isteka.</p>
            </div>

            <button
              type="submit"
              class="admin-button-primary"
              :disabled="isSavingVisibility"
            >
              <span v-if="isSavingVisibility">Spremanje...</span>
              <span v-else>Ažuriraj vidljivost</span>
            </button>
          </form>
        </div>

        <div class="admin-card admin-card-tools">
          <h2 class="admin-card-title">Liste</h2>

          <div class="admin-tools">
            <button
              type="button"
              class="admin-toolbtn"
              @click="openUsersAdmin"
            >
              Korisnici
            </button>

            <button
              type="button"
              class="admin-toolbtn"
              @click="openPoolsAdmin"
            >
              Bazeni
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.admin {
  width: 100%;
  padding: 16px;

  &-shell {
    max-width: 960px;
    margin: 0 auto;
  }

  &-grid {
    display: grid;
    gap: 14px;
  }

  &-card {
    border-radius: 16px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    box-shadow: 0 6px 20px rgba(2, 8, 23, 0.06);
    padding: 14px;
    display: grid;
    gap: 10px;
  }

  &-card-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--text-color-black);
    margin: 0 0 6px;
  }

  &-form {
    display: grid;
    gap: 10px;
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
    letter-spacing: 0.04em;
  }

  &-input {
    width: 100%;
    height: 46px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    padding: 0 14px;
    background: #ffffff;
    color: var(--text-color-black);
    font-weight: 600;

    &:disabled {
      background: #f9fafb;
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  &-error {
    color: #a31515;
    font-weight: 700;
    font-size: 13px;
  }

  &-hint {
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
  }

  &-button-primary {
    height: 46px;
    border-radius: 999px;
    border: 1px solid var(--primary-color);
    background: var(--primary-color);
    color: var(--text-color-white);
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    transition:
      opacity 120ms ease,
      box-shadow 120ms ease;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &-check {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    input {
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1px solid #9ca3af;
      position: relative;
    }

    input:checked {
      border-color: var(--primary-color);
      background: var(--primary-color);
    }

    input:checked::after {
      content: '';
      position: absolute;
      left: 4px;
      top: 0px;
      width: 6px;
      height: 12px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  &-check-label {
    font-weight: 700;
    color: var(--text-color-black);
    line-height: 1.3;
  }

  &-tools {
    display: grid;
    gap: 8px;
  }

  &-toolbtn {
    height: 42px;
    border-radius: 999px;
    padding: 0 16px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    color: #374151;
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    text-align: center;
    box-shadow: 0 4px 12px rgba(2, 8, 23, 0.06);
  }

  &--mobile {
    .admin {
      padding-top: 70px;

      &-card {
        margin-top: 8px;
      }

      &-button-primary {
        width: 100%;
      }
    }
  }

  &--desktop {
    .admin {
      padding-top: 92px;

      &-grid {
        grid-template-columns: 1.2fr 1fr;
        align-items: flex-start;
      }

      &-card {
        padding: 16px;
      }

      &-button-primary:hover,
      &-toolbtn:hover {
        filter: brightness(0.95);
      }

      &-input:not(:disabled):hover {
        background-color: rgb(253, 253, 253);
      }
    }
  }
}

.req {
  color: #a31515;
  font-weight: 900;
}
</style>
