<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import type { Pool } from 'src/types';
import { getPoolById } from '../api';
import { notificationsStore } from '../stores/notifications';
import { usePoolsStore } from '../stores/pools';
import { useFavorites } from '../composables/useFavorites';
import Navigation from '../components/Navigation.vue';
import ImagePreview from '../components/ImagePreview.vue';
import AvailabilityCalendar from '../components/utility/AvailabilityCalendar.vue';

const route = useRoute();
const router = useRouter();
const isMobileView = isMobile();
const useNotificationsStore = notificationsStore();
const { isPoolFavorite, toggleFavoritePool } = useFavorites();
const poolsStore = usePoolsStore();
const swiperRef = ref<any>(null);
const isBeginning = ref(true);
const isEnd = ref(false);
const isPreviewOpen = ref(false);
const previewIndex = ref(0);
const pool = ref<Pool>();
const contactPhone = '062614300';

const selectedPoolId = computed(() => route.query.id as string);
const isPoolAddedToFavorites = computed(() => isPoolFavorite(pool.value!));
const hasHeated = computed(() => !!pool.value?.filters?.heated);
const hasPets = computed(() => !!pool.value?.filters?.petsAllowed);
const poolDetailsClasses = computed(() => ({
  [`pool-details--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const onContact = () => (window.location.href = `tel:${contactPhone}`);
const openPreview = (index: number) => {
  previewIndex.value = index;
  isPreviewOpen.value = true;
};
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

onMounted(async () => {
  const storedPool = poolsStore.findPoolById(selectedPoolId.value);
  if (storedPool) {
    pool.value = storedPool;
    return;
  }

  const res = await getPoolById(selectedPoolId.value);
  if (res.state === 'success') {
    pool.value = res.pool;
  } else {
    useNotificationsStore.addNotification('Odabrani bazen ne postoji', 'error');
    router.replace({ name: 'PoolsSearchPage' });
  }
});
</script>

<template>
  <Navigation variant="solid" />
  <section
    v-if="pool"
    class="pool-details"
    :class="poolDetailsClasses"
  >
    <header>
      <div class="pool-details-titlebar">
        <button
          class="pool-details-titlebar-backbtn"
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
        <h1 class="pool-details-titlebar-title">{{ pool.title }}</h1>
      </div>

      <p class="pool-details-meta">
        📍 {{ pool.city }}
        <span class="pool-details-meta-dot">•</span>
        <span>Kapacitet do {{ pool.capacity }} osoba</span>
      </p>

      <button
        class="pool-details-favbtn"
        :class="{ 'is-active': isPoolAddedToFavorites }"
        @click="toggleFavoritePool(pool)"
        title="Dodaj u favorite"
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

      <div class="pool-details-media">
        <div class="pool-details-media-imgwrapper">
          <Swiper
            class="pool-details-media-swiper"
            :modules="[SwiperNavigation]"
            :slides-per-view="1"
            @swiper="onSwiperInit"
            @slideChange="onSlideChange"
          >
            <SwiperSlide
              v-for="(img, i) in pool.images"
              :key="i"
            >
              <img
                class="pool-details-media-img"
                :src="img"
                alt="bazen slike"
                @click="openPreview(i)"
              />
            </SwiperSlide>
          </Swiper>

          <button
            class="pool-details-media-arrow pool-details-media-arrow--prev"
            :class="{ 'is-disabled': isBeginning }"
            :disabled="isBeginning"
            @click.stop="goPrev"
            aria-label="Prethodna slika"
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
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <button
            class="pool-details-media-arrow pool-details-media-arrow--next"
            :class="{ 'is-disabled': isEnd }"
            :disabled="isEnd"
            @click.stop="goNext"
            aria-label="Sljedeća slika"
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
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="pool-details-summarybar">
        <div class="pool-details-card pool-details-host">
          <div class="pool-details-host-avatar"></div>
          <div class="pool-details-host-info">
            <span class="pool-details-smalllabel">Domaćin</span>
            <span class="pool-details-host-name">Ime i prezime</span>
          </div>
          <a
            v-if="!isMobileView"
            class="pool-details-host-phone"
            >📞 {{ contactPhone }}</a
          >
        </div>

        <div class="pool-details-card pool-details-price">
          <span class="pool-details-smalllabel">Cijena</span>

          <div
            v-if="pool.pricePerDay !== undefined"
            class="pool-details-price-row"
          >
            <span class="pool-details-price-amount">{{ pool.pricePerDay }}</span>
            <span class="pool-details-price-unit">KM / dan</span>
          </div>

          <div
            v-else
            class="pool-details-price-row"
          >
            <span class="pool-details-price-unit">Po dogovoru sa domaćinom</span>
          </div>
        </div>

        <button
          v-if="isMobileView"
          type="button"
          class="pool-details-card pool-details-cta"
          @click="onContact"
        >
          Kontaktiraj domaćina na
          <span class="pool-details-cta-number">{{ contactPhone }}</span>
        </button>
      </div>
    </header>

    <div class="pool-details-body">
      <section
        v-if="pool.description !== undefined"
        class="pool-details-card pool-details-about"
      >
        <h2 class="pool-details-section-title">O bazenu</h2>
        <p class="pool-details-text">
          {{ pool.description }}
        </p>
      </section>

      <section class="pool-details-card pool-details-featureswrap">
        <h2 class="pool-details-section-title">Mogućnosti</h2>
        <ul class="pool-details-features">
          <li class="pool-details-feature">
            <span class="pool-details-feature-icon is-on">👥</span>
            <span class="pool-details-feature-text">do {{ pool.capacity }} osoba</span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasHeated, 'is-off': !hasHeated }"
              >🔥</span
            >
            <span class="pool-details-feature-text">{{
              hasHeated ? 'Grijani bazen' : 'Bez grijanja'
            }}</span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasPets, 'is-off': !hasPets }"
              >🐶</span
            >
            <span class="pool-details-feature-text">{{
              hasPets ? 'Dozvoljeni ljubimci' : 'Ljubimci nisu dozvoljeni'
            }}</span>
          </li>
        </ul>
      </section>
    </div>

    <div class="pool-details-calendar">
      <AvailabilityCalendar
        v-if="pool.availableDays !== undefined"
        :available-days="pool.availableDays || []"
      />
      <p
        v-else
        class="pool-details-text"
      >
        Domaćin nije uključio kalendar dostupnosti. Kontaktirajte ga za više informacija na
        {{ contactPhone }}
      </p>
    </div>
  </section>

  <ImagePreview
    v-if="pool?.images"
    v-model="isPreviewOpen"
    :images="pool.images"
    :start-index="previewIndex"
  />
</template>

<style scoped lang="scss">
.pool-details {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;

  &-titlebar {
    display: flex;
    align-items: center;
    gap: 12px;

    &-backbtn {
      padding: 0;
      display: inline-flex;
      cursor: pointer;
      color: var(--text-color-black);
      background: transparent;
      border: 0;
    }

    &-title {
      line-height: 1.1;
      color: var(--text-color-black);
    }
  }

  &-meta {
    margin-top: 8px;
    color: #6b7280;
    display: flex;
    gap: 6px;

    &-dot {
      opacity: 0.4;
    }
  }

  > header {
    position: relative;
  }

  &-favbtn {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    color: var(--text-color-black);
    display: grid;
    place-items: center;
    box-shadow: 0 6px 20px rgba(2, 8, 23, 0.06);
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 0, 0, 0.041);
    }

    &.is-active svg path {
      color: rgb(156, 0, 0);
    }
  }

  &-media {
    margin-top: 12px;
    cursor: pointer;

    &-imgwrapper {
      position: relative;
    }

    &-swiper {
      height: 100%;
      width: 100%;
      position: relative;
    }

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &-arrow {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      border-radius: 999px;
      background: #ffffffcc;
      color: var(--text-color-black);
      display: grid;
      place-items: center;
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(2, 8, 23, 0.15);

      &:hover {
        filter: brightness(0.95);
      }

      &--prev {
        left: 8px;
      }
      &--next {
        right: 8px;
      }

      &.is-disabled,
      &:disabled {
        opacity: 0.4;
      }
    }
  }

  &-about {
    max-height: 350px;
    display: grid;

    .pool-details-text {
      overflow: auto;
    }
  }

  &-card {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(2, 8, 23, 0.06);
    padding: 12px;
  }

  &-summarybar {
    margin-top: 12px;
    display: grid;
    gap: 10px;
  }

  &-smalllabel {
    font-size: 13px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  &-host {
    display: flex;
    align-items: center;
    border-color: #d7ecff;

    &-avatar {
      border-radius: 50%;
      border: 2px solid #cfe8ff;
      box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    }

    &-info {
      display: grid;
    }

    &-name {
      font-weight: 900;
      color: var(--text-color-black);
      line-height: 1.1;
    }

    &-phone {
      display: inline-block;
      margin-top: 2px;
      padding: 8px 12px;
      border-radius: 999px;
      background: #023c63;
      color: var(--text-color-white);
      font-weight: 900;
      text-decoration: none;
    }
  }

  &-price {
    display: flex;
    align-items: left;
    justify-content: center;
    flex-direction: column;

    &-row {
      display: flex;
      gap: 8px;
    }

    &-amount {
      font-weight: 900;
      line-height: 1;
      color: #023c63;
    }

    &-unit {
      font-weight: 800;
      color: #0f172a;
      opacity: 0.8;
    }
  }

  &-cta {
    color: var(--text-color-white);
    background: var(--primary-color);
    font-weight: 800;

    &-number {
      text-decoration: underline;
      font-weight: 900;
    }
  }

  &-calendar {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 6px 20px rgba(2, 8, 23, 0.06);
    padding: 12px;
  }

  &-body {
    margin: 12px 0 20px;
    display: grid;
    gap: 14px;
  }

  &-section-title {
    font-weight: 800;
    color: var(--text-color-black);
  }

  &-text {
    color: #4b5563;
  }

  &-featureswrap {
    max-height: 350px;
    display: grid;

    .pool-details-features {
      overflow: auto;
    }
  }

  &-features {
    margin: 6px 0 0;
    display: grid;
    gap: 10px;
  }

  &-feature {
    display: grid;
    grid-template-columns: 34px 1fr;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #fbfdff;

    &-icon {
      width: 34px;
      height: 34px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      font-size: 16px;
      font-weight: 900;

      &.is-on {
        background: #eafff1;
        color: #0a7a33;
        border: 1px solid #c3f2d5;
      }
      &.is-off {
        background: #fff4f4;
        color: #a31515;
        border: 1px solid #ffdcdc;
      }
    }

    &-text {
      font-weight: 700;
      color: var(--text-color-black);
    }
  }

  &--mobile {
    .pool-details {
      &-titlebar-title {
        font-size: 26px;
      }

      &-meta {
        font-size: 14px;
      }

      &-media {
        &-imgwrapper {
          height: 260px;
        }

        &-arrow {
          width: 36px;
          height: 36px;
        }
      }

      &-favbtn {
        top: 5px;
        width: 40px;
        height: 40px;
      }

      &-summarybar {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }

      &-cta {
        grid-column: 1 / -1;
      }

      &-body {
        grid-template-columns: 1fr;
      }

      &-price-amount {
        font-size: 18px;
      }

      &-price-unit {
        font-size: 14px;
      }

      &-host {
        gap: 10px;

        &-avatar {
          width: 44px;
          height: 44px;
        }
      }
    }
  }

  &--desktop {
    .pool-details {
      padding-top: 92px;

      &-media {
        &-imgwrapper {
          height: 420px;
        }

        &-arrow {
          width: 50px;
          height: 50px;
        }
      }

      &-summarybar {
        grid-template-columns: 1fr 1fr;
      }

      &-favbtn {
        top: 10px;
        width: 50px;
        height: 50px;
      }

      &-body {
        grid-template-columns: 1fr 1fr;
      }

      &-featureswrap {
        grid-template-rows: auto 1fr;
      }

      &-features {
        grid-auto-rows: max-content;
      }

      &-price {
        &-amount {
          font-size: 25px;
        }
      }

      &-host {
        gap: 15px;

        &-avatar {
          width: 80px;
          height: 80px;
        }

        &-phone {
          margin-left: auto;
          font-size: 18px;
        }

        &-name {
          font-size: 18px;
        }
      }

      &-price-unit {
        font-size: 16px;
      }
    }
  }
}
</style>
