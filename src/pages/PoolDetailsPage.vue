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
import TitleBar from '.././components/TitleBar.vue';

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

const selectedPoolId = computed(() => route.query.id as string);
const isPoolAddedToFavorites = computed(() => isPoolFavorite(pool.value!));
const hasHeated = computed(() => !!pool.value?.filters?.heated);
const hasPets = computed(() => !!pool.value?.filters?.petsAllowed);
const hasPartyAllowed = computed(() => !!pool.value?.filters?.partyAllowed);
const hasWifi = computed(() => !!pool.value?.filters?.wiFi);
const hasBbq = computed(() => !!pool.value?.filters?.bbq);
const hasParking = computed(() => !!pool.value?.filters?.parking);
const hasSummerKitchen = computed(() => !!pool.value?.filters?.summerKitchen);
const poolDetailsClasses = computed(() => ({
  [`pool-details--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const onContact = () => {
  if (isMobileView) window.location.href = `tel:${pool.value?.owner?.mobileNumber}`;
};
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
const buildPoolDescription = (p: Pool): string => {
  const city = p.city || 'Bosni i Hercegovini';
  const base =
    (p.description && p.description.trim()) ||
    `Privatni bazen za dnevni najam u ${city} za do ${p.capacity} gostiju. Iznajmi bazen na dan i uživaj sa društvom ili porodicom.`;

  const normalized = base.replace(/\s+/g, ' ');
  return normalized.length > 155 ? normalized.slice(0, 152) + '...' : normalized;
};

const updateSeoPool = (p: Pool) => {
  const city = p.city || 'Bosni i Hercegovini';
  const baseUrl = 'https://bazeni-na-dan.com';
  const pageUrl = baseUrl + route.fullPath;
  const desc = buildPoolDescription(p);

  document.title = `${p.title} – bazen na dan ${city}`;

  let descTag = document.querySelector("meta[name='description']");
  if (!descTag) {
    descTag = document.createElement('meta');
    descTag.setAttribute('name', 'description');
    document.head.appendChild(descTag);
  }
  descTag.setAttribute('content', desc);

  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', pageUrl);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: p.title,
    description: desc,
    url: pageUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressCountry: 'Bosnia and Herzegovina'
    },
    telephone: p.owner?.mobileNumber || undefined,
    priceRange: p.pricePerDay ? `${p.pricePerDay} BAM` : undefined
  };

  let schemaScript = document.querySelector('#pool-schema') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'pool-schema';
    document.head.appendChild(schemaScript);
  }
  schemaScript.text = JSON.stringify(schema);
};

onMounted(async () => {
  const storedPool = poolsStore.findPoolById(selectedPoolId.value);
  if (storedPool) {
    pool.value = storedPool;
    updateSeoPool(storedPool);
  }

  const res = await getPoolById(selectedPoolId.value);
  if (res.state === 'success') {
    pool.value = res.pool;
    updateSeoPool(res.pool);
  } else if (!storedPool) {
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
      <TitleBar :title="pool.title" />

      <p class="pool-details-meta">
        📍 {{ pool.city }}
        <span class="pool-details-meta-dot">•</span>
        <span>Pregledi: {{ pool.views }}</span>
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
                :alt="`Privatni bazen na dan u ${pool.city} – ${pool.title}`"
                decoding="async"
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
          <div class="pool-details-host-avatar">
            <img
              :src="
                pool.owner?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/9187/9187604.png'
              "
              alt="avatar bazeni na dan"
              class="pool-details-host-avatar-img"
            />
          </div>
          <div
            class="pool-details-host-info"
            @click="onContact"
          >
            <span class="pool-details-smalllabel">Domaćin</span>
            <span class="pool-details-host-name">{{ pool.owner?.name || 'Domaćin' }}</span>
          </div>
          <a
            v-if="!isMobileView"
            class="pool-details-host-phone"
          >
            📞 {{ pool.owner?.mobileNumber }}
          </a>
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
          <span class="pool-details-cta-number">{{ pool.owner?.mobileNumber }}</span>
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

          <template v-if="pool.checkIn || pool.checkOut">
            <br />
            <br />
            <strong class="pool-details-timerules-inline">
              <span class="pool-details-timerules-icon">⏰</span>

              <span v-if="pool.checkIn"> Dolazak od {{ pool.checkIn }}h </span>

              <span
                v-if="pool.checkIn && pool.checkOut"
                class="pool-details-timerules-separator"
                >,
              </span>

              <span v-if="pool.checkOut"> odlazak do {{ pool.checkOut }}h </span>
            </strong>
          </template>
        </p>
      </section>

      <div class="pool-details-card pool-details-calendar">
        <AvailabilityCalendar
          v-if="Array.isArray(pool.busyDays)"
          :busy-days="pool.busyDays"
        />
        <p
          v-else
          class="pool-details-text"
        >
          Domaćin nije uključio kalendar dostupnosti. Kontaktirajte ga za više informacija na
          {{ pool.owner?.mobileNumber }}
        </p>
      </div>

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
              :class="{ 'is-on': hasWifi, 'is-off': !hasWifi }"
            >
              📶
            </span>
            <span class="pool-details-feature-text">
              {{ hasWifi ? 'Wi-Fi dostupan' : 'Wi-Fi nije dostupan' }}
            </span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasBbq, 'is-off': !hasBbq }"
            >
              🍖
            </span>
            <span class="pool-details-feature-text">
              {{ hasBbq ? 'Roštilj na raspolaganju' : 'Nema roštilja' }}
            </span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasPartyAllowed, 'is-off': !hasPartyAllowed }"
            >
              🎉
            </span>
            <span class="pool-details-feature-text">
              {{ hasPartyAllowed ? 'Dozvoljene zabave' : 'Zabave nisu dozvoljene' }}
            </span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasParking, 'is-off': !hasParking }"
            >
              🚗
            </span>
            <span class="pool-details-feature-text">
              {{ hasParking ? 'Privatni parking uz objekat' : 'Nema privatnog parkinga' }}
            </span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasSummerKitchen, 'is-off': !hasSummerKitchen }"
            >
              🍽️
            </span>
            <span class="pool-details-feature-text">
              {{ hasSummerKitchen ? 'Ljetna kuhinja uz bazen' : 'Nema ljetne kuhinje' }}
            </span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasHeated, 'is-off': !hasHeated }"
            >
              🔥
            </span>
            <span class="pool-details-feature-text">
              {{ hasHeated ? 'Grijani bazen' : 'Nije grijani bazen' }}
            </span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasPets, 'is-off': !hasPets }"
            >
              🐶
            </span>
            <span class="pool-details-feature-text">
              {{ hasPets ? 'Ljubimci dozvoljeni' : 'Ljubimci nisu dozvoljeni' }}
            </span>
          </li>
        </ul>
      </section>

      <section
        v-if="pool.rulesDescription"
        class="pool-details-card pool-details-timerules"
      >
        <h2 class="pool-details-section-title">Pravila bazena</h2>
        <p class="pool-details-text pool-details-timerules-text">
          {{ pool.rulesDescription }}
        </p>
      </section>
    </div>

    <section class="pool-details-aboutsite">
      <h2 class="pool-details-aboutsite-title">Bazeni na dan ukratko</h2>
      <p class="pool-details-aboutsite-text">
        bazeni-na-dan.com je lokalna platforma za pretragu i iznajmljivanje privatnih bazena na dan
        širom Bosne i Hercegovine. Na jednom mjestu okupljamo bazene iz različitih gradova, sa
        preglednim cijenama, pravilima korištenja i mogućnostima (Wi-Fi, roštilj, grijani bazen,
        parking..).
      </p>
      <p class="pool-details-aboutsite-text">
        Kao gost lako pronađeš privatni bazen za dnevni najam u
        {{ pool.city || 'svom gradu' }} ili nekom drugom gradu u BiH za druženje, rođendan ili
        proslavu i direktno kontaktiraš domaćina – bez provizija i skrivenih troškova. Ako imaš
        vlastiti bazen, možeš ga oglasiti na stranici i doći do više upita tokom cijele sezone.
      </p>
    </section>
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

  &-meta {
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

    &-avatar {
      border-radius: 50%;
      overflow: hidden;
    }

    &-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      border-radius: inherit;
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

  &-timerules-inline {
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    background: #e0f2fe;
    border: 1px solid #bfdbfe;
    color: #023c63;
    font-weight: 800;
  }

  &-timerules-separator {
    opacity: 0.6;
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
    text-align: justify;
  }

  &-featureswrap {
    display: grid;
    grid-template-rows: auto 1fr;
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

  &-aboutsite {
    margin: 16px 0 24px;
    padding-top: 14px;
    border-top: 1px solid #e5e7eb;

    &-title {
      font-size: 13px;
      font-weight: 800;
      color: #4b5563;
      margin: 0 0 6px;
    }

    &-text {
      font-size: 12px;
      color: #6b7280;
      text-align: justify;
    }

    &-text + &-text {
      margin-top: 4px;
    }
  }

  &--mobile {
    .pool-details {
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

      &-features {
        overflow: visible;
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

          &:not(.is-disabled):not(:disabled):hover {
            filter: brightness(0.95);
          }
        }
      }

      &-summarybar {
        grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
      }

      &-favbtn {
        top: 10px;
        width: 50px;
        height: 50px;

        &:hover {
          background-color: rgb(243, 243, 243);
        }
      }

      &-body {
        grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
        grid-template-rows: auto auto;
        grid-template-areas:
          'about   features'
          'calendar timerules';
        column-gap: 18px;
        row-gap: 18px;
        align-items: stretch;
      }

      &-aboutsite {
        margin-top: 20px;

        &-title {
          font-size: 14px;
        }

        &-text {
          font-size: 13px;
        }
      }

      &-about {
        grid-area: about;
        max-height: 370px;
      }

      &-calendar {
        grid-area: calendar;
      }

      &-featureswrap {
        grid-area: features;
        max-height: 370px;
      }

      &-features {
        grid-auto-rows: max-content;
        overflow: auto;
      }

      &-timerules {
        grid-area: timerules;
        display: flex;
        flex-direction: column;
      }

      &-timerules-text {
        overflow: auto;
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

.pool-details :deep(.auth-header) {
  position: relative;
  left: calc(50% - 50vw) !important;
  padding-left: 16px;
}

.pool-details--desktop :deep(.auth-header) {
  padding-left: 23px;
}
</style>
