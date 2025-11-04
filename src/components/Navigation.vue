<script setup lang="ts">
import isMobile from 'is-mobile';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  variant?: 'transparent' | 'solid';
}>();

const router = useRouter();
const scrolledNavigation = ref(false);
const isMobileView = isMobile();
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement>();

const navigationClasses = computed(() => ({
  'navigation-scrolled': scrolledNavigation.value || props.variant === 'solid',
  [`navigation--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const onScroll = () => (scrolledNavigation.value = window.scrollY > 10);
const closeDropdown = () => (isDropdownOpen.value = false);
const toggleDropdown = () => (isDropdownOpen.value = !isDropdownOpen.value);
const handleClickOutside = (event: MouseEvent) => {
  if (!dropdownRef.value) {
    return;
  }

  if (!dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
};
const goToFaqSection = async () => {
  const el = document.getElementById('faq');
  if (el) {
    el.scrollIntoView();
    closeDropdown();
    return;
  }
  await router.push({ name: 'PoolsHomePage', hash: '#faq' });
  requestAnimationFrame(() => {
    document.getElementById('faq')?.scrollIntoView();
    closeDropdown();
  });
};
const goHome = () => router.push({ name: 'PoolsHomePage' });
const goToSavedPools = () => router.push({ name: 'PoolsSavedPage' });
const goToLoginRegisterPage = () => router.push({ name: 'LoginRegisterPage' });

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
        @click="goHome"
      >
        <img
          class="navigation-left-logo"
          src="../assets/logo.png"
          alt="Bazeni na dan"
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
            Meni
          </button>

          <div
            class="navigation-right-dropdown"
            :class="{ 'is-open': isDropdownOpen }"
          >
            <button
              class="navigation-right-dropdown-signin-button"
              @click="goToLoginRegisterPage"
            >
              Prijava ili registracija
            </button>
            <span class="navigation-right-dropdown-divider"></span>
            <nav class="navigation-right-dropdown-links">
              <a
                class="navigation-right-dropdown-links-item"
                @click.prevent="closeDropdown"
              >
                Objavi svoj bazen
              </a>
              <a
                class="navigation-right-dropdown-links-item"
                @click.prevent="goToSavedPools"
              >
                Sačuvani bazeni
              </a>
              <a
                class="navigation-right-dropdown-links-item"
                @click.prevent="goToFaqSection"
              >
                Pomoć
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

      &-signin-button {
        border-radius: 14px;
        background: var(--primary-color);
        padding: 14px 12px;
        cursor: pointer;
      }

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

        &-signin-button {
          font-size: 16px;
        }

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
      gap: 12px;
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
          transition: 0.2s;
          background-color: var(--button-hover);
          color: var(--text-color-white);
          border: 1px solid var(--button-hover);
        }
      }

      &-dropdown {
        width: 400px;

        &-signin-button {
          font-size: 16px;
        }

        &-links {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
