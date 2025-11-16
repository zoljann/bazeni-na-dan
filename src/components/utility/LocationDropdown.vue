<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import isMobile from 'is-mobile';

const props = defineProps<{
  modelValue: boolean;
  allCities?: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  select: [city: string];
  allpools: [];
  open: [];
  close: [];
}>();

const isMobileView = isMobile();
const dropdownRef = ref<HTMLElement>();
const searchTerm = ref('');
const popularCities = ['Mostar', 'Sarajevo', 'Banja Luka', 'Tuzla', 'Zenica'];

const isShowingDefaults = computed(() => searchTerm.value.trim().length === 0);
const isDropdownOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/gi, 'd');
const matchedCities = computed(() => {
  const q = norm(searchTerm.value.trim().toLowerCase());
  if (!q || !props.allCities?.length) return [];
  return props.allCities.filter((c) => norm(c.toLowerCase()).includes(q)).slice(0, 100);
});
const dropdownClasses = computed(() => ({
  [`location-dropdown--${isMobileView ? 'mobile' : 'desktop'}`]: true,
  'location-dropdown-open': isDropdownOpen.value
}));

const closeDropdown = () => {
  if (!isDropdownOpen.value) return;
  isDropdownOpen.value = false;
  emit('close');
};

const handleAllPoolsClick = () => {
  emit('allpools');
  closeDropdown();
};

const handleCitySelect = (city: string) => {
  emit('select', city);
  closeDropdown();
};

onClickOutside(dropdownRef, () => closeDropdown());

watch(isDropdownOpen, async (open) => {
  if (open) {
    document.documentElement.style.overflow = 'hidden';
    await nextTick();
    dropdownRef.value?.querySelector<HTMLInputElement>('.location-dropdown-input')?.focus();
    emit('open');
  } else {
    document.documentElement.style.overflow = '';
    searchTerm.value = '';
  }
});
</script>

<template>
  <div
    class="location-dropdown-backdrop"
    :class="{
      'location-dropdown-backdrop-open': isDropdownOpen && isMobileView
    }"
    @click="closeDropdown"
  />

  <div
    v-show="isDropdownOpen"
    ref="dropdownRef"
    class="location-dropdown"
    :class="dropdownClasses"
    @click.stop
  >
    <div class="location-dropdown-handle" />
    <button
      class="location-dropdown-close"
      type="button"
      aria-label="Zatvori"
      @click="closeDropdown"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        width="28"
        height="28"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    <div class="location-dropdown-header">
      <input
        class="location-dropdown-input"
        type="text"
        v-model="searchTerm"
        placeholder="Unesite naziv grada"
      />
    </div>

    <div class="location-dropdown-content">
      <template v-if="isShowingDefaults">
        <button
          class="location-dropdown-item location-dropdown-item--allpools"
          @click="handleAllPoolsClick"
        >
          <i class="location-dropdown-item-icon">🌊</i>
          <span class="location-dropdown-item-label">Sve lokacije</span>
        </button>

        <div class="location-dropdown-section">
          <div class="location-dropdown-section-title">Popularne lokacije</div>
          <ul class="location-dropdown-list">
            <li
              v-for="city in popularCities"
              :key="city"
              class="location-dropdown-list-item"
            >
              <button
                class="location-dropdown-item"
                @click="handleCitySelect(city)"
              >
                <span class="location-dropdown-item-label">{{ city }}</span>
              </button>
            </li>
          </ul>
        </div>
      </template>

      <template v-else>
        <div
          v-if="matchedCities.length === 0"
          class="location-dropdown-empty"
        >
          Nema rezultata za “{{ searchTerm }}”.
        </div>
        <ul
          v-else
          class="location-dropdown-list"
        >
          <li
            v-for="city in matchedCities"
            :key="city"
            class="location-dropdown-list-item"
          >
            <button
              class="location-dropdown-item"
              @click="handleCitySelect(city)"
            >
              <span class="location-dropdown-item-label">{{ city }}</span>
            </button>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.location-dropdown-backdrop {
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
    touch-action: none;
  }
}

.location-dropdown {
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

  &-handle {
    width: 44px;
    height: 5px;
    border-radius: 100px;
    background: #e5e7eb;
    margin: 10px auto 6px;
  }

  &-header {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 12px 14px;
  }

  &-input {
    width: 100%;
    height: 40px;
    border-radius: 10px;
    border: 1px solid #e7e8ec;
    padding: 0 12px;
    outline: none;
    font-weight: 500;

    &:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(32, 124, 255, 0.12);
    }
  }

  &-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10px 8px 16px;
  }

  &-close {
    position: absolute;
    top: 15px;
    left: 15px;
    display: grid;
    place-items: center;
    cursor: pointer;
    z-index: 4;
    color: var(--text-color-black);
  }

  &-section {
    &-title {
      font-size: 12px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 700;
      margin: 8px 6px;
    }
  }

  &-list {
    list-style: none;
    margin: 0;
    padding: 0;

    &-item {
      margin: 0;
      padding: 0;
    }
  }

  &-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    text-align: left;

    &--allpools {
      font-weight: 600;
    }

    &-icon {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &-label {
      line-height: 1;
    }
  }

  &-empty {
    padding: 16px;
    color: #6b7280;
  }

  &--mobile {
    position: fixed;
    inset: 0;
    height: 100dvh;
    max-height: none;
    border-radius: 0;
    transform: translateY(-110%);
    will-change: transform;
    contain: layout paint style;
    display: flex;
    flex-direction: column;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);

    &.location-dropdown-open {
      transform: translateY(0%);
    }

    .location-dropdown-header {
      padding-top: 55px;
    }

    .location-dropdown-handle {
      display: none;
    }
  }

  &--desktop {
    position: absolute;
    top: calc(50%);
    right: 0;
    width: 100%;
    height: 300px;
    opacity: 0;
    transform: translateY(-6px);
    border: 1px solid #e5e7eb;
    box-shadow:
      0 10px 24px rgba(2, 8, 23, 0.1),
      0 0 0 1px rgba(2, 8, 23, 0.04);

    &.location-dropdown-open {
      opacity: 1;
      transform: translateY(0);
    }

    .location-dropdown-handle {
      display: none;
    }
  }
}
</style>
