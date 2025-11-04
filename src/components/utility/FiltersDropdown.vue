<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import isMobile from 'is-mobile';

type PoolFilters = { petsAllowed: boolean; heated: boolean };
const DEFAULT_FILTERS: PoolFilters = { petsAllowed: false, heated: false };

const props = defineProps<{
  modelValue: boolean;
  filters: PoolFilters;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:filters': [value: PoolFilters];
  open: [];
  close: [];
}>();

const isMobileView = isMobile();
const panelRef = ref<HTMLElement>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
});

const local = ref<PoolFilters>({ ...DEFAULT_FILTERS });

function syncFromProps() {
  local.value = { ...DEFAULT_FILTERS, ...props.filters };
}

function close() {
  if (!isOpen.value) return;
  isOpen.value = false;
  emit('close');
}

onClickOutside(
  panelRef,
  () => {
    if (!isMobileView) close();
  },
  { ignore: ['.search-controls-iconbtn'] }
);

watch(isOpen, async (open) => {
  if (open) {
    syncFromProps();
    await nextTick();
    panelRef.value?.focus();
    emit('open');
  }
});

function onClear() {
  local.value = { ...DEFAULT_FILTERS };
  emit('update:filters', { ...local.value });
  close();
}

function onApply() {
  emit('update:filters', { ...local.value });
  close();
}

const hasSelected = computed(() => local.value.petsAllowed || local.value.heated);

const classes = computed(() => ({
  [`filters--${isMobileView ? 'mobile' : 'desktop'}`]: true,
  'filters-open': isOpen.value
}));
</script>

<template>
  <div
    class="filters-backdrop"
    :class="{ 'filters-backdrop-open': isOpen && isMobileView }"
    @click="close"
  />

  <div
    v-if="isOpen"
    ref="panelRef"
    class="filters"
    :class="classes"
    @click.stop
    tabindex="-1"
  >
    <div class="filters-handle" />

    <div class="filters-header">
      <div class="filters-title">Filteri</div>
    </div>

    <div class="filters-content">
      <div class="filters-section">
        <ul class="filters-list">
          <li class="filters-list-item">
            <label class="filters-check">
              <span class="filters-check-label">Dozvoljeni kućni ljubimci</span>
              <input
                type="checkbox"
                v-model="local.petsAllowed"
              />
              <span
                class="filters-check-box"
                aria-hidden="true"
              ></span>
            </label>
          </li>
          <li class="filters-list-item">
            <label class="filters-check">
              <span class="filters-check-label">Grijani bazen</span>
              <input
                type="checkbox"
                v-model="local.heated"
              />
              <span
                class="filters-check-box"
                aria-hidden="true"
              ></span>
            </label>
          </li>
        </ul>
      </div>
    </div>

    <div class="filters-footer">
      <button
        v-if="hasSelected"
        class="filters-clear"
        @click="onClear"
      >
        Očisti
      </button>
      <button
        class="filters-apply"
        @click="onApply"
      >
        Prikaži oglase
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.filters-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 8, 23, 0);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.18s ease,
    background 0.18s ease;
  z-index: 98;

  &-open {
    background: rgba(2, 8, 23, 0.4);
    opacity: 1;
    pointer-events: auto;
  }
}

.filters {
  background: #fff;
  color: var(--text-color-black);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition:
    transform 0.22s ease,
    opacity 0.18s ease;
  z-index: 99;
  box-shadow:
    0 10px 24px rgba(2, 8, 23, 0.1),
    0 0 0 1px rgba(2, 8, 23, 0.04);

  &-handle {
    width: 44px;
    height: 5px;
    border-radius: 100px;
    background: #e5e7eb;
    margin: 10px auto 6px;
  }

  &-header {
    padding: 8px 12px 6px;
  }

  &-title {
    font-weight: 800;
    text-align: center;
  }

  &-content {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: 70vh;
    overflow-y: auto;
  }

  &-section-title {
    font-size: 12px;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: #6b7280;
    font-weight: 700;
    margin: 6px 6px 8px;
  }

  &-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &-list-item {
    margin: 0 0 6px 0;
  }

  &-check {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid transparent;
    cursor: pointer;
    user-select: none;

    &-label {
      flex: 1;
      line-height: 1;
      font-weight: 600;
    }

    input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    &-box {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #d1d5db;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition:
        background 0.12s ease,
        border-color 0.12s ease,
        color 0.12s ease;
      color: transparent;
    }

    input:checked + .filters-check-box {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: #fff;
    }
    input:checked + .filters-check-box::before {
      content: '✓';
      line-height: 1;
    }
  }

  &-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px;
    border-top: 1px solid #eef0f3;
    background: #fff;
  }

  &-clear {
    background: transparent;
    border: none;
    color: #374151;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 6px;

    &:hover {
      text-decoration: underline;
    }
  }

  &-apply {
    cursor: pointer;
    border-radius: 9999px;
    padding: 10px 16px;
    font-weight: 600;
    color: #374151;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 10px rgba(2, 8, 23, 0.05);
    transition:
      background 0.12s ease,
      border-color 0.12s ease,
      box-shadow 0.12s ease;

    &:hover {
      background: #e7edf5;
      border-color: #d1d5db;
    }
  }

  &--mobile {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateY(110%);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 75vh;
    touch-action: none;

    &.filters-open {
      transform: translateY(0%);
    }
  }

  &--desktop {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: 360px;
    max-width: calc(100% - 32px);
    opacity: 0;
    transform: translateY(6px);
    pointer-events: none;

    &.filters-open {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .filters-handle {
      display: none;
    }

    .filters-check:hover {
      background: #f7f8fa;
      border-color: #eef0f3;
    }
  }
}
</style>
