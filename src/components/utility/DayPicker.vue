<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import isMobile from 'is-mobile';
import { ymdLocal } from '../../utility/helpers';

const props = defineProps<{
  modelValue: boolean;
  selected?: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'select', iso: string | null): void;
}>();

const isMobileView = isMobile();
const panelRef = ref<HTMLElement>();
const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
});
const todayIso = ymdLocal(new Date());
const viewDate = ref(new Date());

function monthLabel(d: Date) {
  try {
    const s = new Intl.DateTimeFormat('bs-BA', {
      month: 'long',
      year: 'numeric'
    }).format(d);
    if (/M\d+|\d+[\/\-.]\d+/.test(s)) throw new Error('bad locale');
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch {
    const BS_MONTHS = [
      'Januar',
      'Februar',
      'Mart',
      'April',
      'Maj',
      'Juni',
      'Juli',
      'August',
      'Septembar',
      'Oktobar',
      'Novembar',
      'Decembar'
    ];
    return `${BS_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
}

function toISO(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return ymdLocal(copy);
}
function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function mondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

const grid = computed(() => {
  const first = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
  const startOffset = mondayIndex(first.getDay());
  const total = daysInMonth(viewDate.value);
  const cells: Array<{
    iso?: string;
    label?: number;
    isPast?: boolean;
    isSelected?: boolean;
  }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({});
  for (let d = 1; d <= total; d++) {
    const date = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), d);
    const iso = toISO(date);
    cells.push({
      iso,
      label: d,
      isPast: iso < todayIso,
      isSelected: props.selected === iso
    });
  }
  while (cells.length % 7 !== 0) cells.push({});
  return cells;
});

function prevMonth() {
  const d = new Date(viewDate.value);
  d.setMonth(d.getMonth() - 1);
  viewDate.value = d;
}
function nextMonth() {
  const d = new Date(viewDate.value);
  d.setMonth(d.getMonth() + 1);
  viewDate.value = d;
}
function selectDay(iso?: string, isPast?: boolean) {
  if (!iso || isPast) return;
  emit('select', iso);
  open.value = false;
}
function clearDate() {
  viewDate.value = new Date();
  emit('select', null);
  open.value = false;
}

function close() {
  open.value = false;
}
function handleClickOutside(e: MouseEvent) {
  if (!open.value || !panelRef.value) return;
  if (!panelRef.value.contains(e.target as Node)) close();
}
onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
  <div
    v-if="open"
    class="daypicker"
    :class="{
      'daypicker--mobile': isMobileView,
      'daypicker--desktop': !isMobileView
    }"
  >
    <div
      v-if="isMobileView"
      class="daypicker-backdrop"
      @click.stop="close"
    ></div>

    <div
      class="daypicker-panel"
      ref="panelRef"
      @click.stop
    >
      <div class="daypicker-header">
        <button
          class="daypicker-navbtn"
          @click="prevMonth"
          aria-label="Prethodni mjesec"
        >
          ‹
        </button>
        <div class="daypicker-title">{{ monthLabel(viewDate) }}</div>
        <button
          class="daypicker-navbtn"
          @click="nextMonth"
          aria-label="Sljedeći mjesec"
        >
          ›
        </button>
      </div>

      <div class="daypicker-week">
        <span class="daypicker-weekday">Pon</span>
        <span class="daypicker-weekday">Uto</span>
        <span class="daypicker-weekday">Sri</span>
        <span class="daypicker-weekday">Čet</span>
        <span class="daypicker-weekday">Pet</span>
        <span class="daypicker-weekday">Sub</span>
        <span class="daypicker-weekday">Ned</span>
      </div>

      <div class="daypicker-grid">
        <button
          v-for="(c, i) in grid"
          :key="i"
          class="daypicker-cell"
          :class="{
            'is-blank': !c.iso,
            'is-disabled': c.isPast && c.iso,
            'is-selected': c.isSelected
          }"
          :disabled="!c.iso || c.isPast"
          @click="selectDay(c.iso, c.isPast)"
        >
          <span v-if="c.label">{{ c.label }}</span>
        </button>
      </div>

      <div class="daypicker-footer">
        <button
          class="daypicker-clear"
          @click="clearDate"
        >
          Ukloni datum
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.daypicker {
  &--desktop {
    position: absolute;
    top: calc(100% + 10px);
    right: 68px;
    z-index: 100;

    .daypicker-cell:not(.is-blank):not(.is-disabled):not(.is-selected):hover,
    .daypicker-navbtn:hover {
      background-color: rgb(243, 243, 243);
    }

    .daypicker-clear:hover {
      background-color: rgb(236, 236, 236);
    }
  }
  &--mobile {
    position: fixed;
    inset: 0;
    z-index: 120;
    touch-action: none;
  }
  &-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(2, 8, 23, 0.28);
  }
  &-panel {
    background: #ffffff;
    border-radius: 20px;
    box-shadow: 0 14px 40px rgba(2, 8, 23, 0.12);
    width: 340px;
    padding: 12px;
    display: grid;
    gap: 10px;

    .daypicker--mobile & {
      position: absolute;
      left: 50%;
      top: 20%;
      transform: translateX(-50%);
      width: 92%;
      max-width: 440px;
    }

    .daypicker--desktop & {
      width: 360px;
      padding: 14px;
      gap: 12px;
    }
  }

  &-header {
    display: grid;
    grid-template-columns: 48px 1fr 48px;
    align-items: center;
  }

  &-navbtn {
    border-radius: 14px;
    height: 44px;
    font-size: 22px;
    display: grid;
    place-items: center;
    cursor: pointer;
    color: var(--text-color-black);
    border: 1px solid #e5e7eb;

    .daypicker--desktop & {
      height: 46px;
      font-size: 24px;
    }
  }

  &-title {
    text-align: center;
    font-weight: 800;
    color: var(--text-color-black);
    text-transform: none;
    .daypicker--desktop & {
      font-size: 18px;
    }
  }

  &-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    font-weight: 700;
    color: #6b7280;
    text-align: center;
    gap: 6px;

    .daypicker--desktop & {
      gap: 8px;
    }
  }

  &-weekday {
    font-size: 12px;
    .daypicker--desktop & {
      font-size: 14px;
    }
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;

    .daypicker--desktop & {
      gap: 8px;
    }
  }

  &-cell {
    height: 42px;
    border-radius: 12px;
    color: var(--text-color-black);
    font-weight: 700;
    display: grid;
    place-items: center;
    cursor: pointer;
    border: 1px solid #e5e7eb;
    background: #fff;
    transition:
      background 0.12s ease,
      border-color 0.12s ease;

    .daypicker--desktop & {
      height: 48px;
      font-size: 16px;
    }

    &.is-blank {
      visibility: hidden;
    }
    &.is-disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    &.is-selected {
      background: var(--primary-color);
      color: var(--text-color-white);
      border-color: var(--primary-color);
      box-shadow: 0 6px 14px rgba(0, 178, 255, 0.35);
    }
  }

  &-footer {
    display: flex;
    justify-content: flex-end;
  }

  &-clear {
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
  }
}
</style>
