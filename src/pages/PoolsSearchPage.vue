<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import isMobile from 'is-mobile';
import Navigation from '../components/Navigation.vue';
import PoolCard from '../components/pools/PoolCard.vue';
import { getAvailablePools } from '../api';
import { notificationsStore } from '../stores/notifications';
import { useRoute, useRouter } from 'vue-router';
import DayPicker from '../components/utility/DayPicker.vue';
import LocationDropdown from '../components/utility/LocationDropdown.vue';
import allCities from '../helpers/bih-cities.json';
import FiltersDropdown from '../components/utility/FiltersDropdown.vue';
import { usePoolsStore } from '../stores/pools';

const isMobileView = isMobile();
const useNotificationsStore = notificationsStore();
const poolsStore = usePoolsStore();
const route = useRoute();
const router = useRouter();
const showDayPicker = ref(false);
const selectedDate = ref<string | null>(null);
const showLocationDropdown = ref(false);
const selectedCity = ref<string>('Sve lokacije');
const showFilters = ref(false);
const filters = ref({ petsAllowed: false, heated: false });

const filteredPools = computed(() => {
  const iso = selectedDate.value ? selectedDate.value.slice(0, 10) : null;
  const city = selectedCity.value?.toLowerCase();

  return poolsStore.pools?.filter(
    (p) =>
      (city === 'sve lokacije' || !city || p.city.toLowerCase() === city) &&
      (!iso || p.availableDays?.includes(iso)) &&
      (!filters.value.petsAllowed || !!p.filters?.petsAllowed) &&
      (!filters.value.heated || !!p.filters?.heated)
  );
});
const displayDate = computed(() => {
  if (!selectedDate.value) return null;
  const d = new Date(selectedDate.value);
  if (isNaN(d.getTime())) return null;

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  const thisYear = new Date().getFullYear();

  return d.getFullYear() === thisYear ? `${dd}.${mm}.` : `${dd}.${mm}.'${yy}`;
});
const selectedFiltersLabel = computed(() => {
  const list: string[] = [];
  if (filters.value.petsAllowed) list.push('dozvoljeni ljubimci');
  if (filters.value.heated) list.push('grijani bazen');
  return list.join(', ');
});

const resultsText = computed(() => {
  const n = filteredPools.value?.length ?? 0;
  const base =
    n === 1 ? '1 pronađen bazen' : `${n} ${n >= 2 && n <= 4 ? 'pronađena' : 'pronađenih'} bazena`;

  const parts = [base];
  if (displayDate.value)
    parts.push(
      `na datum ${displayDate.value}(bazeni koji nemaju raspored dostupnih dana neće biti prikazani)`
    );
  if (filtersCount.value) parts.push(`sa filterima: ${selectedFiltersLabel.value}`);

  return parts.join(', ');
});

const filtersCount = computed(() => Object.values(filters.value).filter(Boolean).length);

const searchClasses = computed(() => ({
  [`search--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const onSelectDate = (iso: string | null) => {
  selectedDate.value = iso;
};
const onSelectCity = (city: string) => {
  selectedCity.value = city;
  router.replace({ query: { ...route.query, city } });
  showLocationDropdown.value = false;
};
const showAllPools = () => {
  selectedCity.value = 'Sve lokacije';
  const q = { ...route.query };
  delete q.city;
  router.replace({ query: q });
};
const toggleDayPicker = () => {
  showDayPicker.value = !showDayPicker.value;
  if (showDayPicker.value) showFilters.value = false;
};
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
  if (showFilters.value) showDayPicker.value = false;
};
const openPool = (id: string) => {
  router.push({ name: 'PoolDetailsPage', query: { id } });
};

onMounted(async () => {
  const res = await getAvailablePools();
  if (res.state === 'success') {
    poolsStore.pools = res.pools;
  } else {
    useNotificationsStore.addNotification(
      'Nešto je pošlo po krivu, pokušajte malo kasnije',
      'error'
    );
  }
});

watch(
  () => route.query.city,
  (city) => {
    selectedCity.value = (city as string) || 'Sve lokacije';
  },
  { immediate: true }
);
watch(showDayPicker, (v) => {
  if (v) showFilters.value = false;
});
watch(showFilters, (v) => {
  if (v) showDayPicker.value = false;
});
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="search"
    :class="searchClasses"
  >
    <div class="search-controls">
      <div class="search-locwrap">
        <button
          class="search-controls-location"
          @click="showLocationDropdown = true"
        >
          <span class="search-controls-location-label">📍 {{ selectedCity }}</span>
          <span class="search-controls-location-caret">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M7 10l5 5 5-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>

        <LocationDropdown
          v-model="showLocationDropdown"
          :allCities="allCities"
          @select="onSelectCity"
          @allpools="showAllPools"
        />
        <div
          v-if="filteredPools?.length ?? 0 > 0"
          class="search-info"
        >
          {{ resultsText }}
        </div>
      </div>

      <div class="search-controls-tool">
        <button
          class="search-controls-iconbtn"
          @click.stop="toggleDayPicker"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
          >
            <path
              d="M7 2v3M17 2v3M3.5 9.5h17M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
            />
          </svg>
          <span
            v-if="displayDate"
            class="search-controls-iconbtn-badge"
          >
            {{ displayDate }}
          </span>
        </button>
        <span class="search-controls-tool-label">Datum</span>
      </div>

      <div class="search-controls-tool">
        <button
          class="search-controls-iconbtn"
          @click.stop="toggleFilters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="24"
            fill="current"
            viewBox="0 0 22 24"
          >
            <mask
              id="filters_svg__a"
              width="22"
              height="24"
              x="0"
              y="0.182"
              fill="current"
              maskUnits="userSpaceOnUse"
            >
              <path
                fill="#fff"
                d="M0 .182h22v24H0z"
              ></path>
              <path
                fill-rule="evenodd"
                d="M17.366 7.45a2.635 2.635 0 0 1-2.532-1.908h.077a2.6 2.6 0 0 1-.09-1h-.075a2.634 2.634 0 0 1 5.24 0h-.075a2.6 2.6 0 0 1-.09 1h.077a2.635 2.635 0 0 1-2.532 1.907m0-6.268a3.634 3.634 0 0 0-3.623 3.36H.652v1h13.153a3.635 3.635 0 0 0 7.122 0H21v-1h-.01a3.634 3.634 0 0 0-3.624-3.36M.652 12.81h.072a3.635 3.635 0 0 0 7.122 0H21v-1H7.908a3.634 3.634 0 0 0-7.247 0h-.01v1m3.633-3.36a2.634 2.634 0 0 0-2.62 2.36h.094a2.6 2.6 0 0 0 .09 1h-.096a2.635 2.635 0 0 0 5.064 0h-.096a2.5 2.5 0 0 0 .091-1h.092a2.634 2.634 0 0 0-2.62-2.36m5.16 10.628H.652v-1h8.73a3.634 3.634 0 0 1 7.248 0H21v1h-4.433a3.635 3.635 0 0 1-7.122 0m.942-1a2.634 2.634 0 0 1 5.239 0h-.063a2.6 2.6 0 0 1-.09 1h.065a2.635 2.635 0 0 1-5.064 0h.065a2.6 2.6 0 0 1-.09-1z"
                clip-rule="evenodd"
              ></path>
            </mask>
            <path
              fill-rule="evenodd"
              d="M17.366 7.45a2.635 2.635 0 0 1-2.532-1.908h.077a2.6 2.6 0 0 1-.09-1h-.075a2.634 2.634 0 0 1 5.24 0h-.075a2.6 2.6 0 0 1-.09 1h.077a2.635 2.635 0 0 1-2.532 1.907m0-6.268a3.634 3.634 0 0 0-3.623 3.36H.652v1h13.153a3.635 3.635 0 0 0 7.122 0H21v-1h-.01a3.634 3.634 0 0 0-3.624-3.36M.652 12.81h.072a3.635 3.635 0 0 0 7.122 0H21v-1H7.908a3.634 3.634 0 0 0-7.247 0h-.01v1m3.633-3.36a2.634 2.634 0 0 0-2.62 2.36h.094a2.6 2.6 0 0 0 .09 1h-.096a2.635 2.635 0 0 0 5.064 0h-.096a2.5 2.5 0 0 0 .091-1h.092a2.634 2.634 0 0 0-2.62-2.36m5.16 10.628H.652v-1h8.73a3.634 3.634 0 0 1 7.248 0H21v1h-4.433a3.635 3.635 0 0 1-7.122 0m.942-1a2.634 2.634 0 0 1 5.239 0h-.063a2.6 2.6 0 0 1-.09 1h.065a2.635 2.635 0 0 1-5.064 0h.065a2.6 2.6 0 0 1-.09-1z"
              clip-rule="evenodd"
            ></path>
            <path
              d="m14.834 5.542-.192.055-.073-.255h.265zm.077 0 .192-.057.076.257h-.268zm-.09-1v-.2h.222l-.023.221zm-.075 0v.2h-.221l.022-.22zm5.24 0 .198-.02.023.22h-.222zm-.075 0-.199.021-.023-.22h.222zm-.09 1v.2h-.268l.076-.257zm.077 0v-.2h.265l-.073.255zm-6.155-1 .199.015-.014.185h-.186zm-13.091 0h-.2v-.2h.2zm0 1v.2h-.2v-.2zm13.153 0v-.2h.164l.032.16zm7.122 0-.196-.04.032-.16h.164zm.073 0h.2v.2H21zm0-1v-.2h.2v.2zm-.01 0v.2h-.186l-.014-.185zM.723 12.81v-.2h.163l.033.16zm-.072 0v.2h-.2v-.2zm7.194 0-.196-.04.032-.16h.164zm13.154 0h.2v.2H21zm0-1v-.2h.2v.2zm-13.092 0v.2h-.185l-.014-.185zm-7.247 0 .2.015-.014.185H.661zm-.01 0h-.2v-.2h.2zm0 .229h.2v.001zm0 .045-.2.001v-.002zm0 .045.2-.001zm1.014-.319v.2h-.221l.022-.22zm.094 0v-.2h.223l-.024.222zm.09 1 .193-.057.076.257H1.85zm-.096 0-.192.055-.074-.255h.266zm5.064 0v-.2h.265l-.073.255zm-.096 0v.2h-.268l.077-.257zm.091-1-.199.022-.023-.222h.222zm.092 0 .2-.02.022.22h-.222zM.652 20.077v.2h-.2v-.2zm8.793 0v-.2h.164l.032.16zm-8.793-1h-.2v-.2h.2zm8.73 0 .2.014-.014.185h-.185zm7.248 0v.2h-.186l-.014-.186zm4.37 0v-.2h.2v.2zm0 1h.2v.2H21zm-4.433 0-.196-.04.033-.16h.163zm-6.18-1v.2h-.222l.023-.221zm5.239 0 .199-.021.022.22h-.221zm-.063 0-.2.02-.023-.22h.223zm-.09 1v.2h-.268l.076-.257zm.065 0v-.2h.265l-.073.255zm-5.064 0-.192.055-.073-.256h.265zm.065 0 .192-.057.076.256h-.268zm-.09-1v-.2h.223l-.024.22zm4.577-13.59a2.435 2.435 0 0 0 2.34 1.762v.4a2.835 2.835 0 0 1-2.724-2.052zm-.115.255h-.077v-.4h.077zm.095-.927q.001.35.097.67l-.384.114a2.8 2.8 0 0 1-.113-.784zm.014-.252a2 2 0 0 0-.014.252h-.4q0-.149.016-.294zm-.274-.22h.075v.4h-.075zm2.62-1.96a2.434 2.434 0 0 0-2.42 2.18l-.399-.041a2.834 2.834 0 0 1 2.819-2.54zm2.42 2.18a2.434 2.434 0 0 0-2.42-2.18v-.4a2.834 2.834 0 0 1 2.818 2.539zm.125-.22h.074v.4h-.074zm-.186.472q0-.128-.013-.252l.398-.042q.015.146.015.294zm-.096.67a2.4 2.4 0 0 0 .096-.67h.4q-.001.41-.112.784zm.269.257h-.077v-.4h.077zM17.366 7.25c1.11 0 2.048-.744 2.34-1.762l.384.11a2.835 2.835 0 0 1-2.724 2.052zm-3.823-2.722A3.834 3.834 0 0 1 17.366.982v.4c-1.81 0-3.292 1.4-3.424 3.175zM.652 4.342h13.09v.4H.652zm-.2 1.2v-1h.4v1zm13.353.2H.652v-.4h13.153zm3.561 2.907a3.835 3.835 0 0 1-3.757-3.067l.392-.08a3.435 3.435 0 0 0 3.365 2.747zm3.757-3.067a3.835 3.835 0 0 1-3.757 3.067v-.4c1.66 0 3.047-1.18 3.365-2.747zm-.123.16h-.073v-.4H21zm.2-.926v.726h-.4v-.726zm0-.274v.274h-.4v-.274zm-.21-.2H21v.4h-.01zM17.365.982a3.834 3.834 0 0 1 3.823 3.545l-.4.03a3.434 3.434 0 0 0-3.423-3.175zM.724 13.01H.652v-.4h.072zm3.56 2.907A3.835 3.835 0 0 1 .529 12.85l.392-.08a3.435 3.435 0 0 0 3.365 2.747zm3.758-3.067a3.835 3.835 0 0 1-3.757 3.067v-.4A3.435 3.435 0 0 0 7.65 12.77zM21 13.01H7.846v-.4H21zm.2-1.2v1h-.4v-1zm-13.292-.2H21v.4H7.908zM4.285 8.25a3.834 3.834 0 0 1 3.823 3.545l-.4.03A3.434 3.434 0 0 0 4.286 8.65zM.462 11.794A3.834 3.834 0 0 1 4.285 8.25v.4c-1.81 0-3.292 1.4-3.424 3.175zm.19-.185h.01v.4h-.01zm-.2.429v-.229h.4v.229zm0 .044v-.045l.4.002v.045zm0 .047v-.045l.4-.002v.045zm0 .68v-.681h.4v.681zm1.014-1.02a2.834 2.834 0 0 1 2.819-2.54v.4a2.434 2.434 0 0 0-2.42 2.18zm.293.22h-.094v-.4h.094zm-.214.074q0-.15.015-.295l.398.043a2 2 0 0 0-.013.252zm.113.783a2.7 2.7 0 0 1-.113-.783h.4q.001.35.097.67zm.095-.257h.097v.4h-.097zm2.532 2.307a2.835 2.835 0 0 1-2.724-2.052l.384-.11a2.435 2.435 0 0 0 2.34 1.762zm2.724-2.052a2.835 2.835 0 0 1-2.724 2.052v-.4c1.11 0 2.048-.744 2.34-1.762zm-.288-.255h.096v.4h-.096zm.306-.526q-.001.41-.114.783l-.383-.114q.096-.319.097-.67zm-.016-.295q.015.145.016.295h-.4q0-.128-.014-.252zm-.107.221h-.092v-.4h.092zm-2.62-2.76a2.834 2.834 0 0 1 2.82 2.54l-.399.04a2.434 2.434 0 0 0-2.42-2.18zM.653 19.877h8.793v.4H.652zm.2-.8v1h-.4v-1zm8.53.2H.653v-.4h8.73zm3.624-3.36c-1.81 0-3.292 1.399-3.424 3.174l-.399-.03a3.834 3.834 0 0 1 3.823-3.545zm3.424 3.174a3.434 3.434 0 0 0-3.424-3.175v-.4a3.834 3.834 0 0 1 3.823 3.546zm4.57.185h-4.37v-.4H21zm-.2.8v-1h.4v1zm-4.233-.2H21v.4h-4.433zm-3.56 2.907a3.435 3.435 0 0 0 3.364-2.746l.392.08a3.835 3.835 0 0 1-3.757 3.066zM9.64 20.037a3.435 3.435 0 0 0 3.365 2.746v.4a3.835 3.835 0 0 1-3.757-3.067zm3.365-3.12a2.434 2.434 0 0 0-2.42 2.18l-.398-.041a2.834 2.834 0 0 1 2.818-2.54zm2.42 2.18a2.434 2.434 0 0 0-2.42-2.18v-.4a2.834 2.834 0 0 1 2.819 2.539zm.136-.22h.064v.4h-.063zm-.185.473q0-.129-.013-.253l.397-.042a3 3 0 0 1 .016.294zm-.096.67q.095-.32.096-.67h.4q-.002.408-.113.783zm.257.256h-.066v-.4h.066zm-2.532 1.507c1.111 0 2.048-.744 2.34-1.762l.384.11a2.835 2.835 0 0 1-2.724 2.052zm-2.34-1.762a2.435 2.435 0 0 0 2.34 1.762v.4a2.835 2.835 0 0 1-2.724-2.051zm-.127.255h-.065v-.4h.065zm.096-.927q.002.352.096.671l-.384.113a2.8 2.8 0 0 1-.112-.784zm.013-.252a2 2 0 0 0-.013.252h-.4q0-.148.016-.294zm-.261-.22h.062v.4h-.062z"
              mask="url(#filters_svg__a)"
            ></path>
          </svg>
          <span
            v-if="filtersCount"
            class="search-controls-iconbtn-badge"
          >
            {{ filtersCount }}
          </span>
        </button>
        <span class="search-controls-tool-label">Filteri</span>
      </div>

      <DayPicker
        v-model="showDayPicker"
        :selected="selectedDate || undefined"
        @select="onSelectDate"
      />

      <FiltersDropdown
        v-model="showFilters"
        v-model:filters="filters"
      />
    </div>

    <div class="search-results">
      <div class="search-results-grid">
        <PoolCard
          v-for="p in filteredPools"
          :key="p.id"
          :pool="p"
          @open-pool="openPool"
        />
      </div>

      <p
        v-if="filteredPools?.length === 0"
        class="search-results-empty"
      >
        Nema rezultata.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.search {
  width: 100%;
  padding: 16px;

  &-controls {
    position: relative;
    max-width: 1100px;
    margin: 0 auto 16px;
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 10px;

    &-location {
      width: 100%;
      height: 44px;
      box-sizing: border-box;
      border-radius: 12px;
      padding: 0 14px;
      box-shadow: 0 6px 20px rgba(2, 8, 23, 0.06);
      color: var(--text-color-black);
      font-weight: 600;
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      cursor: pointer;

      &:hover {
        background-color: rgba(0, 0, 0, 0.041);
      }

      &-label {
        flex: 1;
        text-align: left;
      }

      &-caret {
        display: inline-flex;
      }
    }

    &-iconbtn {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      color: var(--text-color-black);
      display: grid;
      place-items: center;
      box-shadow: 0 6px 20px rgba(2, 8, 23, 0.06);
      cursor: pointer;
      border: 1px solid #e5e7eb;

      &:hover {
        background-color: rgba(0, 0, 0, 0.041);
      }

      &-badge {
        position: absolute;
        bottom: -6px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
        padding: 3px 8px;
        border-radius: 999px;
        background: var(--primary-color);
        color: var(--text-color-white);
        pointer-events: none;
        white-space: nowrap;
      }
    }

    &-tool {
      display: grid;
      justify-items: center;
      gap: 4px;

      &-label {
        text-transform: uppercase;
        color: #6b7280;
        font-weight: 700;
      }
    }

    .search-locwrap {
      position: relative;
    }
  }

  &-results {
    max-width: 1100px;
    margin: 0 auto;

    &-grid {
      display: grid;
      gap: 14px;
    }

    &-empty {
      margin: 14px 0 0;
      color: #6b7280;
      text-align: center;
      font-weight: 600;
    }
  }

  &-info {
    margin-top: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    color: #6b7280;
    font-weight: 700;
    line-height: 1;
  }

  &--mobile {
    .search {
      &-controls {
        &-tool-label {
          font-size: 12px;
        }
      }

      &-results-grid {
        grid-template-columns: 1fr;
      }

      &-info {
        font-size: 12px;
      }
    }
  }

  &--desktop {
    .search {
      &-controls {
        margin-bottom: 20px;

        &-location {
          height: 54px;
        }

        &-iconbtn {
          width: 54px;
          height: 54px;
        }

        &-iconbtn svg {
          width: 22px;
          height: 22px;
        }

        &-iconbtn-badge {
          bottom: -8px;
          font-size: 14px;
          padding: 4px 10px;
        }

        &-tool-label {
          font-size: 14px;
        }
      }

      &-results-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      &-info {
        font-size: 15px;
      }
    }
  }
}

:deep(.location-dropdown--desktop) {
  top: calc(100% + 4px);
}
</style>
