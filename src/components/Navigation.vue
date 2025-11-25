<script setup lang="ts">
import isMobile from 'is-mobile';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { notificationsStore } from '@/stores/notifications';

const props = defineProps<{
  variant?: 'transparent' | 'solid';
}>();

const router = useRouter();
const userStore = useUserStore();
const useNotificationsStore = notificationsStore();
const scrolledNavigation = ref(false);
const isMobileView = isMobile();
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const menuLabel = computed(() => (userStore.isAuthenticated ? userStore.user?.firstName : 'Meni'));
const navigationClasses = computed(() => ({
  'navigation-scrolled': scrolledNavigation.value || props.variant === 'solid',
  [`navigation--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const onScroll = () => (scrolledNavigation.value = window.scrollY > 10);
const closeDropdown = () => (isDropdownOpen.value = false);
const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);
const handleClickOutside = (event: MouseEvent) => {
  if (!dropdownRef.value) return;
  if (!dropdownRef.value.contains(event.target as Node)) closeDropdown();
};
const goToFaqSection = async () => {
  closeDropdown();
  await router.push({ name: 'PoolsHomePage', hash: '#faq' });
};
const logout = () => {
  userStore.logout();
  closeDropdown();
  router.push({ name: 'PoolsHomePage' });
};
const goToRoute = (route: string) => {
  router.push({ name: route });
  closeDropdown();
};

const goToPoolsPublishedPage = () => {
  if (!userStore.isAuthenticated) {
    useNotificationsStore.addNotification('Prijavite se da biste objavili bazen', 'error');
    closeDropdown();
    router.push({ name: 'LoginRegisterPage', query: { next: 'PoolsPublishedPage' } });
    return;
  }

  router.push({ name: 'PoolsPublishedPage' });
  closeDropdown();
};

onMounted(() => {
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <header
    class="navigation"
    :class="navigationClasses"
  >
    <div class="navigation-inner">
      <div
        class="navigation-left"
        @click="goToRoute('PoolsHomePage')"
      >
        <img
          class="navigation-left-logo"
          src="../assets/logo.png"
          alt="Bazeni na dan BiH"
        />
        <h3
          v-if="!isMobileView && props.variant === 'solid'"
          class="navigation-left-title"
        >
          Bazeni na dan
        </h3>
      </div>

      <div class="navigation-right">
        <button
          v-if="!isMobileView"
          class="navigation-right-button"
          @click="goToPoolsPublishedPage"
        >
          Objavi svoj bazen
        </button>

        <div
          class="navigation-right-container"
          ref="dropdownRef"
          @click.stop
        >
          <button
            class="navigation-right-button"
            @click="toggleDropdown"
          >
            <svg
              class="icon"
              width="20"
              height="15"
              viewBox="0 0 20 15"
              aria-hidden="true"
            >
              <path
                d="M1.31 15h17.38c.723 0 1.31-.568 1.31-1.268s-.587-1.268-1.31-1.268H1.31c-.724 0-1.31.568-1.31 1.268S.586 15 1.31 15M1.31 8.768h17.38C19.413 8.768 20 8.2 20 7.5s-.587-1.268-1.31-1.268H1.31C.585 6.232 0 6.8 0 7.5s.586 1.268 1.31 1.268M20 1.268c0 .7-.587 1.268-1.31 1.268H1.31C.585 2.536 0 1.968 0 1.268S.586 0 1.31 0h17.38C19.413 0 20 .568 20 1.268"
                fill="currentColor"
              />
            </svg>
            <span class="navigation-right-button-label">{{ menuLabel }}</span>
          </button>

          <div
            class="navigation-right-dropdown"
            :class="{ 'is-open': isDropdownOpen }"
          >
            <nav class="navigation-right-dropdown-links">
              <a
                class="navigation-right-dropdown-links-item navigation-right-dropdown-links-item-important"
                @click.prevent="
                  goToRoute(userStore.isAuthenticated ? 'UserProfilePage' : 'LoginRegisterPage')
                "
              >
                <span v-if="!userStore.isAuthenticated">Prijava ili registracija</span>
                <span v-else>Moj profil</span>
              </a>

              <a
                class="navigation-right-dropdown-links-item"
                @click.prevent="goToPoolsPublishedPage"
              >
                {{ userStore.isAuthenticated ? 'Objavljeni bazeni' : 'Objavi svoj bazen' }}
              </a>
              <a
                class="navigation-right-dropdown-links-item"
                @click.prevent="goToRoute('PoolsSavedPage')"
              >
                Sačuvani bazeni
              </a>
              <a
                class="navigation-right-dropdown-links-item"
                @click.prevent="goToFaqSection"
              >
                Pomoć
              </a>
              <a
                v-if="userStore.isAuthenticated"
                class="navigation-right-dropdown-links-item logout"
                @click.prevent="logout"
              >
                Odjava
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.navigation {
  position: sticky;
  top: 0;
  z-index: 99;
  background: transparent;
  transition:
    background 160ms ease,
    box-shadow 160ms ease;

  &-scrolled {
    background: #ffffff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);

    .navigation-right-button {
      border: 1px solid rgba(0, 0, 0, 0.12);
      color: rgb(98, 106, 117);
    }
  }

  &-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-right {
    display: flex;
    gap: 8px;

    &-container {
      position: relative;
      display: flex;
      justify-content: flex-end;
      max-width: 200px;
    }

    &-button {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      border-radius: 100px;
      border: 1px solid #ffffff;
      padding: 12px 16px;
      font-weight: 700;
      transition: filter 120ms ease;
      color: var(--text-color-white);
      overflow: hidden;

      .icon {
        flex: 0 0 auto;
      }

      &-label {
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    &-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      background: #ffffff;
      box-shadow: 0 14px 40px rgba(2, 8, 23, 0.12);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      z-index: 99;
      opacity: 0;
      transform: translateY(-6px);
      visibility: hidden;
      pointer-events: none;
      transition:
        opacity 300ms ease,
        transform 300ms ease,
        visibility 0s linear 300ms;
      transform-origin: top right;

      &-divider {
        height: 1px;
        background: rgba(0, 0, 0, 0.08);
      }

      &-links {
        display: flex;
        flex-direction: column;
        gap: 8px;
        cursor: pointer;

        &-item {
          display: block;
          text-decoration: none;
          color: var(--text-color-black);
          font-weight: 500;
          padding: 10px 12px;

          &-important {
            color: var(--primary-color);
            font-weight: 800;
          }
        }

        &-item.logout {
          color: #e11d48;
          font-weight: 700;
        }
      }
    }

    &-dropdown.is-open {
      opacity: 1;
      transform: translateY(0);
      visibility: visible;
      pointer-events: auto;
      transition:
        opacity 300ms ease,
        transform 300ms ease,
        visibility 0s;
    }
  }

  &--mobile {
    .navigation-inner {
      height: 64px;
      padding: 20px 16px;
    }

    .navigation-left-logo {
      height: 80px;
      width: 100px;
    }

    .navigation-right {
      width: 100%;
      justify-content: flex-end;

      &-button {
        font-size: 16px;
      }

      &-dropdown {
        position: fixed;
        top: 65px;
        left: 5%;
        right: 5%;
        transform: none;

        &-links {
          font-size: 14px;
        }
      }
    }
  }

  &--desktop {
    .navigation-inner {
      height: 90px;
      padding: 30px 60px;
    }

    .navigation-left {
      display: flex;
      align-items: center;
      cursor: pointer;

      &-logo {
        height: 100px;
        width: 100px;
      }

      &-title {
        font-size: 22px;
        font-weight: 700;
        color: rgb(74, 81, 90);
      }
    }

    .navigation-right {
      &-button {
        font-size: 18px;

        &:hover {
          filter: brightness(0.85);
        }
      }

      &-dropdown {
        width: 400px;

        &-links {
          font-size: 16px;

          &-item {
            &:hover {
              color: rgb(99, 99, 99);
            }
          }
        }
      }
    }
  }
}
</style>
