<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import isMobile from 'is-mobile';

defineProps<{
  title: string;
}>();

const emit = defineEmits<{ back: [] }>();

const router = useRouter();
const isMobileView = isMobile({ tablet: false });

const headerClasses = computed(() => ({
  [`auth-header--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));
</script>

<template>
  <header
    class="auth-header"
    :class="headerClasses"
  >
    <div class="auth-titlebar">
      <button
        class="auth-titlebar-backbtn"
        @click="router.back()"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M15 18l-6-6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
      <h1 class="auth-titlebar-title">{{ title }}</h1>
    </div>
  </header>
</template>

<style scoped lang="scss">
.auth-header {
  margin: 0 auto 12px;
}

.auth-titlebar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.auth-titlebar-backbtn {
  flex: 0 0 auto;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  color: var(--text-color-black);
  cursor: pointer;
  padding: 0;
  transition:
    background 120ms ease,
    transform 80ms ease;

  &:hover {
    background: rgba(2, 8, 23, 0.06);
  }
}

.auth-titlebar-title {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  color: var(--text-color-black);
  line-height: 1.25;
  font-size: 32px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.auth-header--mobile .auth-titlebar-title {
  font-size: 26px;
}

.auth-header--desktop .auth-titlebar-backbtn {
  width: 44px;
  height: 44px;
}
</style>
