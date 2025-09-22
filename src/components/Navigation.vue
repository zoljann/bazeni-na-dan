<script setup lang="ts">
import isMobile from "is-mobile";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";

const scrolledNavigation = ref(false);
const isMobileView = isMobile();

const navigationClasses = computed(() => ({
  "navigation-scrolled": scrolledNavigation.value,
  [`navigation--${isMobileView ? "mobile" : "desktop"}`]: true,
}));

const onScroll = () => (scrolledNavigation.value = window.scrollY > 10);

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <header class="navigation" :class="navigationClasses">
    <div class="navigation-inner">
      <div class="navigation-left">
        <img
          class="navigation-left-logo"
          src="../assets/logo.png"
          alt="Bazeni na dan"
        />
      </div>
      <div class="navigation-right">
        <button v-if="!isMobileView" class="navigation-right-button">
          Objavi svoj bazen
        </button>
        <button class="navigation-right-button">
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
          Prijavi se
        </button>
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
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);

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
  }

  &--mobile {
    .navigation-inner {
      height: 64px;
      padding: 20px 16px;
    }

    .navigation-right-button {
      font-size: 16px;
    }

    .navigation-left-logo {
      height: 80px;
      width: 80px;
    }
  }

  &--desktop {
    .navigation-inner {
      height: 90px;
      padding: 30px 60px;
    }

    .navigation-right-button {
      font-size: 22px;

      &:hover {
        background-color: var(--button-hover);
        color: var(--text-color-white);
        border: 1px solid var(--button-hover);
      }
    }

    .navigation-left-logo {
      height: 100px;
      width: 100px;
    }
  }
}
</style>
