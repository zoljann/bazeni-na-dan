<script setup lang="ts">
import isMobile from 'is-mobile';
import { computed } from 'vue';
import { notificationsStore } from '../../stores/notifications';

const isMobileView = isMobile();
const useNotificationsStore = notificationsStore();

const classes = computed(() => ({
  [`notifications--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));
</script>

<template>
  <div
    class="notifications"
    :class="classes"
  >
    <div
      v-for="(n, i) in useNotificationsStore.notifications"
      :key="i"
      class="notifications-item"
      :class="{
        'is-success': n.type === 'success',
        'is-error': n.type === 'error'
      }"
    >
      <span
        class="notifications-item-icon"
        aria-hidden="true"
      >
        <svg
          v-if="n.type === 'success'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path
            d="M20 7 9 18l-5-5"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 9v4m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <span class="notifications-item-text">
        {{ Array.isArray(n.text) ? n.text.join(' ') : n.text }}
      </span>

      <button
        class="notifications-item-close"
        @click="useNotificationsStore.removeNotification(i)"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
        >
          <path
            d="M18 6 6 18M6 6l12 12"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notifications {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 16px;
  z-index: 1001;
  display: grid;
  gap: 8px;

  &-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 12px 12px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(2, 8, 23, 0.16);

    &.is-success {
      background: #10b981;
    }

    &.is-error {
      background: #ef4444;
    }

    &-text {
      font-weight: 700;
      line-height: 1.25;
    }

    &-close {
      width: 30px;
      height: 30px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.15);
      display: grid;
      place-items: center;
      cursor: pointer;

      &:hover {
        filter: brightness(0.95);
      }
    }
  }

  &--mobile {
    width: 90vw;
  }

  &--desktop {
    width: 450px;

    .notifications-item {
      font-size: 16px;
      padding: 18px 18px;
    }
  }
}
</style>
