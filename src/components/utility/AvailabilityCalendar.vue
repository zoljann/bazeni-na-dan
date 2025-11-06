<script setup lang="ts">
import { computed, ref } from 'vue';
import isMobile from 'is-mobile';

const props = defineProps<{
  busyDays?: string[];
  modelValue?: string[];
  mode?: 'view' | 'pick';
}>();

const emit = defineEmits<{
  'update:modelValue': [string[]];
}>();

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
const WEEKDAYS_SHORT = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];
const WEEKDAYS_LONG = [
  'Ponedjeljak',
  'Utorak',
  'Srijeda',
  'Četvrtak',
  'Petak',
  'Subota',
  'Nedjelja'
];

const isMobileView = isMobile();
const viewDate = ref(new Date());
const today = new Date();
today.setHours(0, 0, 0, 0);

const mode = computed(() => props.mode || 'view');
const busySet = computed(() => new Set(props.busyDays || []));
const pickedSet = computed(() => new Set((props.modelValue || []).slice()));

const rootClasses = computed(() => ({
  'availcal--mobile': isMobileView,
  'availcal--desktop': !isMobileView
}));
const weekdays = computed(() => (isMobileView ? WEEKDAYS_SHORT : WEEKDAYS_LONG));
const monthTitle = computed(() => {
  try {
    const parts = new Intl.DateTimeFormat('bs-BA', {
      month: 'long',
      year: 'numeric'
    }).formatToParts(viewDate.value);
    const mRaw = (parts.find((p) => p.type === 'month')?.value || '').toLowerCase();
    const y = parts.find((p) => p.type === 'year')?.value || String(viewDate.value.getFullYear());
    const looksBad = !mRaw || /^m?\d+$/i.test(mRaw) || /\d+[\/\-.]\d+/.test(`${mRaw} ${y}`);
    const month = looksBad ? BS_MONTHS[viewDate.value.getMonth()] : mRaw;
    return `${month} ${y}`;
  } catch {
    return `${BS_MONTHS[viewDate.value.getMonth()]} ${viewDate.value.getFullYear()}`;
  }
});

const toISO = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
};
const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const mondayIndex = (jsDay: number) => (jsDay + 6) % 7;

type Cell = { iso?: string; label?: number; classes: Record<string, boolean>; disabled?: boolean };

const cells = computed<Cell[]>(() => {
  const first = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1);
  const startOffset = mondayIndex(first.getDay());
  const total = daysInMonth(viewDate.value);

  const out: Cell[] = [];
  for (let i = 0; i < startOffset; i++)
    out.push({ classes: { 'availcal-cell': true, 'is-blank': true } });

  for (let d = 1; d <= total; d++) {
    const date = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), d);
    const iso = toISO(date);
    const isPast = date < today;

    if (mode.value === 'view') {
      const isBusy = busySet.value.has(iso);
      out.push({
        iso,
        label: d,
        disabled: true,
        classes: {
          'availcal-cell': true,
          'is-available': !isBusy,
          'is-disabled': isBusy
        }
      });
    } else {
      const isPicked = pickedSet.value.has(iso);
      out.push({
        iso,
        label: d,
        disabled: isPast,
        classes: {
          'availcal-cell': true,
          'is-blank': false,
          'is-disabled': isPast,
          'is-picked': isPicked,
          'is-pickable': !isPast
        }
      });
    }
  }

  while (out.length % 7 !== 0) out.push({ classes: { 'availcal-cell': true, 'is-blank': true } });
  return out;
});

const onPrevMonth = () => {
  const firstThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).getTime();
  const prev = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
  if (mode.value === 'pick' && prev.getTime() < firstThisMonth) return;
  viewDate.value = prev;
};
const onNextMonth = () => {
  const d = new Date(viewDate.value);
  d.setMonth(d.getMonth() + 1);
  viewDate.value = d;
};

const togglePick = (c: Cell) => {
  if (mode.value !== 'pick' || !c.iso || c.disabled) return;
  const next = new Set(pickedSet.value);
  if (next.has(c.iso)) next.delete(c.iso);
  else next.add(c.iso);
  emit('update:modelValue', Array.from(next).sort());
};
</script>

<template>
  <div
    class="availcal"
    :class="rootClasses"
  >
    <div class="availcal-caption">Kalendar dostupnosti</div>

    <div class="availcal-header">
      <button
        type="button"
        class="availcal-navbtn"
        @click="onPrevMonth"
        aria-label="Prethodni mjesec"
      >
        ‹
      </button>
      <div class="availcal-title">{{ monthTitle }}</div>
      <button
        type="button"
        class="availcal-navbtn"
        @click="onNextMonth"
        aria-label="Sljedeći mjesec"
      >
        ›
      </button>
    </div>

    <div class="availcal-week">
      <span
        v-for="(d, i) in weekdays"
        :key="i"
        class="availcal-weekday"
        >{{ d }}</span
      >
    </div>

    <div class="availcal-grid">
      <button
        v-for="(c, i) in cells"
        :key="i"
        type="button"
        :class="c.classes"
        :disabled="mode === 'view' || c.disabled"
        @click="togglePick(c)"
        aria-label="dan"
      >
        <span v-if="c.label">{{ c.label }}</span>
      </button>
    </div>

    <div
      v-if="mode === 'view'"
      class="availcal-legend"
    >
      <span class="availcal-legend-dot is-available"></span> Dostupno
      <span class="availcal-legend-sep">•</span>
      <span class="availcal-legend-dot is-disabled"></span> Nedostupno
    </div>

    <div
      v-else
      class="availcal-legend"
    >
      <span class="availcal-legend-dot is-picked"></span> Zauzeto
      <span class="availcal-legend-sep">•</span>
      <span class="availcal-legend-dot is-pickable"></span> Slobodno
    </div>
  </div>
</template>

<style scoped lang="scss">
.availcal {
  border-radius: 16px;
  background: #fff;
  padding: 12px;
  color: var(--text-color-black);
  display: grid;
  gap: 10px;

  &--desktop {
    padding: 14px;
    gap: 12px;
  }

  &-caption {
    font-size: 13px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  &-header {
    display: grid;
    grid-template-columns: 48px 1fr 48px;
    align-items: center;
  }

  &-title {
    text-align: center;
    font-weight: 800;

    .availcal--desktop & {
      font-size: 18px;
    }
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
    background: #fff;

    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }

    .availcal--desktop & {
      height: 46px;
      font-size: 24px;
    }
  }

  &-week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    font-weight: 700;
    color: #6b7280;
    text-align: center;
    gap: 6px;

    .availcal--desktop & {
      gap: 8px;
    }
  }

  &-weekday {
    font-size: 12px;

    .availcal--desktop & {
      font-size: 14px;
    }
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;

    .availcal--desktop & {
      gap: 8px;
    }
  }

  &-cell {
    height: 42px;
    border-radius: 12px;
    font-weight: 700;
    display: grid;
    place-items: center;
    border: 1px solid #e5e7eb;
    background: #fff;
    user-select: none;

    .availcal--desktop & {
      height: 48px;
      font-size: 16px;
    }

    &.is-blank {
      visibility: hidden;
    }

    &.is-disabled {
      color: #6b7280;
      opacity: 0.45;
      background: #fbfaf9;
    }

    &.is-available {
      background: #eafff1;
      color: var(--text-color-black);
    }

    &.is-pickable {
      cursor: pointer;
    }

    &.is-picked {
      background: var(--primary-color);
      color: #fff;
    }
  }

  &-legend {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #6b7280;
    font-weight: 700;

    .availcal--desktop & {
      font-size: 14px;
    }

    .availcal--mobile & {
      font-size: 12px;
    }
  }

  &-legend-dot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    display: inline-block;

    &.is-available {
      background: #0a7a33;
    }

    &.is-disabled {
      background: #9ca3af;
    }

    &.is-picked {
      background: var(--primary-color);
    }

    &.is-pickable {
      background: #f3f3f3;
    }
  }

  &-legend-sep {
    opacity: 0.6;
  }
}
</style>
