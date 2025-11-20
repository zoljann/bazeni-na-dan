<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text?: string;
  fullHeight?: boolean;
}>();

const loaderClasses = computed(() => ({
  'base-loader--full': !!props.fullHeight
}));
</script>

<template>
  <div
    class="base-loader"
    :class="loaderClasses"
  >
    <div class="base-loader-spinner" />
    <p
      v-if="text"
      class="base-loader-text"
    >
      {{ text }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.base-loader {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 12px;
  text-align: center;

  &--full {
    min-height: 400px;
  }

  &-spinner {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 3px solid #e5e7eb;
    border-top-color: var(--primary-color);
    animation: base-loader-spin 0.8s linear infinite;
  }

  &-text {
    font-size: 14px;
    font-weight: 700;
    color: #6b7280;
    max-width: 260px;
    line-height: 1.5;
  }
}

@keyframes base-loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
