<script setup lang="ts">
import isMobile from 'is-mobile';

defineProps<{
  open: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}>();

const emit = defineEmits<{
  'update:open': [boolean];
  confirm: [];
  cancel: [];
}>();

const isMobileView = isMobile();

const rootClasses = {
  [`confirmpopup--${isMobileView ? 'mobile' : 'desktop'}`]: true
};

const close = (v = false) => emit('update:open', v);
const onCancel = () => {
  emit('cancel');
  close(false);
};
const onConfirm = () => {
  emit('confirm');
  close(false);
};
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="confirmpopup"
      :class="rootClasses"
      aria-hidden="true"
    >
      <div
        class="confirmpopup-overlay"
        @click="onCancel"
      ></div>

      <div
        class="confirmpopup-card"
        role="dialog"
        aria-modal="true"
        :aria-label="title || 'Potvrda'"
      >
        <h3 class="confirmpopup-title">{{ title || 'Potvrdi radnju' }}</h3>

        <p
          v-if="message"
          class="confirmpopup-text"
        >
          {{ message }}
        </p>

        <div class="confirmpopup-actions">
          <button
            type="button"
            class="confirmpopup-btn confirmpopup-btn--ghost"
            @click="onCancel"
          >
            {{ cancelLabel || 'Odustani' }}
          </button>

          <button
            type="button"
            class="confirmpopup-btn confirmpopup-btn--danger"
            @click="onConfirm"
          >
            {{ confirmLabel || 'Obriši' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.confirmpopup {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;

  &-overlay {
    position: absolute;
    inset: 0;
    background: rgba(2, 8, 23, 0.55);
    backdrop-filter: blur(1px);
  }

  &-card {
    position: relative;
    width: 100%;
    max-width: 420px;
    margin: 16px;
    border-radius: 16px;
    background: #fff;
    color: var(--text-color-black);
    box-shadow: 0 16px 40px rgba(2, 8, 23, 0.25);
    padding: 16px;
    display: grid;
    gap: 12px;
  }

  &-title {
    font-weight: 900;
    font-size: 18px;
    line-height: 1.2;
  }

  &-text {
    color: #6b7280;
    font-weight: 600;
    font-size: 14px;
  }

  &-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 4px;
  }

  &-btn {
    height: 42px;
    border-radius: 12px;
    font-weight: 800;
    padding: 0 14px;
    cursor: pointer;
    border: 1px solid transparent;
    box-shadow: 0 6px 14px rgba(2, 8, 23, 0.06);
    background: #f4f9ff;
    color: var(--text-color-black);

    &:hover {
      filter: brightness(0.97);
    }

    &--ghost {
      background: #fff;
      border-color: #e5e7eb;
    }

    &--danger {
      background: #fdeded;
      border-color: #ffe2e2;
      color: #b91c1c;
    }
  }

  &--mobile {
    .confirmpopup-card {
      width: 90%;
      max-width: none;
      margin: 16px auto;
    }
  }
}
</style>
