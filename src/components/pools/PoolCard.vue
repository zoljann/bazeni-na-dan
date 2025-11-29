<script setup lang="ts">
import { computed, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import isMobile from 'is-mobile';
import type { Pool } from 'src/types';
import { useFavorites } from '../../composables/useFavorites';
import env from '../../utility/env';
import ConfirmPopup from '../utility/ConfirmPopup.vue';

const props = defineProps<{
  pool: Pool;
  actions?: boolean;
}>();

const emit = defineEmits<{
  openPool: [id: string];
  deleteRequested: [id: string];
}>();

const isMobileView = isMobile();
const { isPoolFavorite, toggleFavoritePool } = useFavorites();
const swiperRef = ref<any>(null);
const isBeginning = ref(true);
const isEnd = ref(props.pool.images.length <= 1);
const showVisibilityInfo = ref(false);

const priceLabel = computed(() =>
  props.pool.pricePerDay ? `${props.pool.pricePerDay}KM/dan` : ''
);
const poolCardClasses = computed(() => ({
  [`pool-card--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));
const isPoolAddedToFavorites = computed(() => isPoolFavorite(props.pool));
const isPoolAvailableTomorrow = computed(() => {
  const busy = props.pool.busyDays;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  const iso = d.toISOString().slice(0, 10);
  return Array.isArray(busy) && !busy.includes(iso);
});

const openVisibilityInfo = () => (showVisibilityInfo.value = true);
const onPoolClick = () => emit('openPool', props.pool.id);
const onSwiperInit = (sw: any) => {
  swiperRef.value = sw;
  isBeginning.value = sw.isBeginning;
  isEnd.value = sw.isEnd;
};
const onSlideChange = (sw: any) => {
  isBeginning.value = sw.isBeginning;
  isEnd.value = sw.isEnd;
};
const goPrev = () => swiperRef.value?.slidePrev();
const goNext = () => swiperRef.value?.slideNext();
const onLikeClick = () => toggleFavoritePool(props.pool);
</script>

<template>
  <article
    class="pool-card"
    :class="poolCardClasses"
    @click="onPoolClick"
    itemscope
    itemtype="https://schema.org/LocalBusiness"
  >
    <div class="pool-card-media">
      <Swiper
        class="pool-card-media-swiper"
        :modules="[Navigation]"
        :slides-per-view="1"
        @swiper="onSwiperInit"
        @slideChange="onSlideChange"
      >
        <SwiperSlide
          v-for="(img, i) in pool.images"
          :key="i"
        >
          <img
            class="pool-card-media-img"
            :src="img"
            :alt="`Iznajmi bazen na dan u ${pool.city} – ${pool.title}`"
            loading="lazy"
            decoding="async"
            itemprop="image"
          />
        </SwiperSlide>
      </Swiper>

      <button
        class="pool-card-media-arrow pool-card-media-arrow--prev"
        :class="{ 'is-disabled': isBeginning }"
        :disabled="isBeginning"
        @click.stop="goPrev"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M15 18 9 12l6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button
        class="pool-card-media-arrow pool-card-media-arrow--next"
        :class="{ 'is-disabled': isEnd }"
        :disabled="isEnd"
        @click.stop="goNext"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="m9 18 6-6-6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>

      <button
        class="pool-card-like"
        :class="{ 'pool-card-like-active': isPoolAddedToFavorites }"
        @click.stop="onLikeClick"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.35l8.84-8.96a5.5 5.5 0 0 0 0-7.78Z"
            :fill="isPoolAddedToFavorites ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <span
        v-if="priceLabel"
        class="pool-card-media-price"
      >
        {{ priceLabel }}
      </span>
    </div>

    <div class="pool-card-body">
      <h3
        class="pool-card-body-title"
        itemprop="name"
      >
        {{ pool.title }}
      </h3>
      <div class="pool-card-body-meta">
        <span class="pool-card-body-meta-item">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 22s7-7.6 7-12a7 7 0 0 0-14 0c0 4.4 7 12 7 12z"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <circle
              cx="12"
              cy="10"
              r="3"
              fill="currentColor"
            />
          </svg>
          <span
            class="pool-card-body-meta-text"
            itemprop="address"
            >{{ pool.city }}</span
          >
        </span>
        <span class="pool-card-body-meta-item">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9v-1a7 7 0 0 0-14 0v1"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          do {{ pool.capacity }} gostiju
        </span>
      </div>
      <div
        v-if="isPoolAvailableTomorrow"
        class="pool-card-body-quick"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M12 8v4l3 2"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Dostupno već od sutra
      </div>
    </div>
    <div
      v-if="actions"
      class="pool-card-actions"
      @click.stop
    >
      <button
        type="button"
        class="pool-card-actions-edit"
        @click="emit('openPool', pool.id)"
      >
        Uredi bazen
      </button>

      <button
        type="button"
        class="pool-card-actions-delete"
        @click="emit('deleteRequested', pool.id)"
        aria-label="Obriši bazen"
        title="Obriši bazen"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M3 6h18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M10 11v6M14 11v6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
    <div
      v-if="actions && !pool.isVisible"
      class="pool-card-visibility-hint"
      @click.stop
    >
      Ovaj bazen trenutno <strong>nije vidljiv</strong>.
      <button
        type="button"
        class="pool-card-visibility-link"
        @click="openVisibilityInfo"
      >
        Kliknite ovdje
      </button>
      za više informacija.
    </div>

    <ConfirmPopup
      :open="showVisibilityInfo"
      title="Vidljivost bazena"
      :message="`**Vaš bazen trenutno NIJE javno vidljiv.**

      Da bi postao vidljiv, potrebno je kontaktirati administratora(viber, whatsapp, poziv..) na **${env.adminMobileNumber}** i dogovoriti detalje.

      **Cijena paketa:** 100KM/mjesec (promo za prvih 5 bazena **50KM**/mjesec).

      Objavom na našoj platformi **garantujemo** više pregleda, upita i rezervacija — imaćete **više popunjenih termina** i manje praznih dana.`"
      :rich="true"
      cancel-label="Zatvori"
      @confirm="showVisibilityInfo = false"
      @cancel="showVisibilityInfo = false"
      @update:open="(v) => (showVisibilityInfo = v)"
    />
  </article>
</template>

<style scoped lang="scss">
.pool-card {
  display: grid;
  grid-template-rows: auto 1fr;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(2, 8, 23, 0.08);
  cursor: pointer;

  &-media {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;

    &-swiper {
      height: 100%;
      width: 100%;
      position: relative;
      z-index: 0;
    }

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.35), transparent 55%);
      z-index: 1;
    }

    &-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      background: #ffffffcc;
      color: var(--text-color-black);
      display: grid;
      place-items: center;
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(2, 8, 23, 0.15);

      &--prev {
        left: 8px;
      }

      &--next {
        right: 8px;
      }

      &.is-disabled {
        opacity: 0.4;
      }
    }

    &-price {
      position: absolute;
      left: 10px;
      bottom: 10px;
      border-radius: 8px;
      padding: 6px 10px;
      background: var(--primary-color);
      color: var(--text-color-white);
      font-weight: 800;
      box-shadow: 0 6px 14px rgba(0, 178, 255, 0.35);
      z-index: 3;
    }
  }

  &-like {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    background: #ffffffb7;
    color: var(--text-color-black);
    display: grid;
    place-items: center;
    z-index: 3;
    cursor: pointer;

    &-active {
      color: rgb(156, 0, 0);
      background: #ffffffdc;
    }
  }

  &-body {
    align-content: center;
    padding: 12px;
    color: var(--text-color-black);
    display: grid;
    gap: 6px;

    &-title {
      font-weight: 800;
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.25;
    }

    &-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      color: #6b7280;
      font-weight: 600;
      row-gap: 0px;

      &-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      &-text {
        white-space: nowrap;
      }
    }

    &-quick {
      color: var(--primary-color);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  &-actions {
    display: flex;
    gap: 10px;
    padding: 10px 12px 12px;
    border-top: 1px solid #eef2f7;

    &-edit {
      flex: 1;
      border-radius: 12px;
      background: var(--primary-color);
      color: var(--text-color-white);
      font-weight: 800;
      box-shadow: 0 6px 14px rgba(2, 8, 23, 0.06);
      cursor: pointer;
    }

    &-delete {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      cursor: pointer;
      border: 1px solid #ffe2e2;
      background: #fdeded;
      color: #b91c1c;
      box-shadow: 0 6px 14px rgba(185, 28, 28, 0.08);
    }
  }

  &-editbtn {
    padding: 10px 12px;
    border-radius: 12px;
    background: #f4f9ff;
    color: var(--text-color-black);
    font-weight: 800;
    border: 1px solid #e5e7eb;
    box-shadow: 0 6px 14px rgba(2, 8, 23, 0.06);
    cursor: pointer;
  }

  &-visibility-hint {
    padding: 8px 10px;
    border-radius: 12px;
    color: #6b7280;
    font-weight: 700;
    font-size: 14px;
  }

  &-visibility-link {
    padding: 0;
    color: red;
    font-weight: 800;
    text-decoration: underline;
    cursor: pointer;
  }

  &--mobile {
    .pool-card-body-quick {
      font-size: 14px;
    }
  }

  &--desktop {
    .pool-card-body-quick {
      font-size: 16px;
    }

    .pool-card-actions-edit:hover,
    .pool-card-actions-delete:hover,
    .pool-card-media-arrow:not([disabled]):hover,
    .pool-card-like:hover {
      filter: brightness(0.95);
    }
  }
}
</style>
