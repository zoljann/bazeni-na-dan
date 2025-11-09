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
  gap: 12px;
}

.auth-titlebar-backbtn {
  padding: 0;
  display: inline-flex;
  cursor: pointer;
  color: var(--text-color-black);
}

.auth-titlebar-title {
  color: var(--text-color-black);
  line-height: 1.1rem;
  font-size: 32px;
}

.auth-header--mobile .auth-titlebar-title {
  font-size: 26px;
}
</style>
