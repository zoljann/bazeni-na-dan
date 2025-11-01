<!-- PoolDetailsPage.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import isMobile from "is-mobile";
import type { Pool } from "src/types";
import { getPoolById } from "../api";
import { notificationsStore } from "../stores/notifications";
import { usePoolsStore } from "../stores/pools";
import Navigation from "../components/Navigation.vue";

const route = useRoute();
const router = useRouter();
const isMobileView = isMobile();
const useNotificationsStore = notificationsStore();
const poolsStore = usePoolsStore();

const pool = ref<Pool>();
const selectedPoolId = computed(() => route.query.id as string);
const contactPhone = "062614300";

const hasHeated = computed(() => !!pool.value?.filters?.heated);
const hasPets = computed(() => !!pool.value?.filters?.petsAllowed);
const poolDetailsClasses = computed(() => ({
  [`pool-details--${isMobileView ? "mobile" : "desktop"}`]: true,
}));

const onContact = () => (window.location.href = `tel:${contactPhone}`);

onMounted(async () => {
  const storedPool = poolsStore.findPoolById(selectedPoolId.value);
  if (storedPool) {
    pool.value = storedPool;
    return;
  }
  const res = await getPoolById(selectedPoolId.value);
  if (res.state === "success") {
    pool.value = res.pool;
  } else {
    useNotificationsStore.addNotification("Odabrani bazen ne postoji", "error");
    router.replace({ name: "PoolsSearchPage" });
  }
});
</script>

<template>
  <Navigation variant="solid" />
  <section v-if="pool" class="pool-details" :class="poolDetailsClasses">
    <header>
      <div class="pool-details-titlebar">
        <button class="pool-details-titlebar-backbtn" @click="router.back()">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
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

      <div class="pool-details-media">
        <div class="pool-details-media-imgwrapper">
          <img
            :src="pool.images[0]"
            alt="Slika bazena"
            class="pool-details-media-img"
          />
        </div>
      </div>

      <div class="pool-details-summarybar">
        <div class="pool-details-card pool-details-host">
          <div class="pool-details-host-avatar"></div>
          <div class="pool-details-host-info">
            <span class="pool-details-smalllabel">Domaćin</span>
            <span class="pool-details-host-name">Ime i prezime</span>
            <a class="pool-details-host-phone" :href="`tel:${contactPhone}`"
              >📞 {{ contactPhone }}</a
            >
          </div>
        </div>

        <div class="pool-details-card pool-details-price">
          <span class="pool-details-smalllabel">Cijena</span>
          <div class="pool-details-price-row">
            <span class="pool-details-price-amount">{{
              pool.pricePerDay
            }}</span>
            <span class="pool-details-price-unit">KM / dan</span>
          </div>
        </div>

        <button
          type="button"
          class="pool-details-card pool-details-cta"
          @click="onContact"
        >
          Kontaktiraj domaćina
        </button>
      </div>
    </header>

    <div class="pool-details-body">
      <section class="pool-details-card pool-details-about">
        <h2 class="pool-details-section-title">O bazenu</h2>
        <p class="pool-details-text">
          {{ pool.description }}
        </p>
      </section>

      <section class="pool-details-card pool-details-featureswrap">
        <h2 class="pool-details-section-title">Mogućnosti</h2>
        <ul class="pool-details-features">
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasHeated, 'is-off': !hasHeated }"
              >🔥</span
            >
            <span class="pool-details-feature-text">{{
              hasHeated ? "Grijani bazen" : "Bez grijanja"
            }}</span>
          </li>
          <li class="pool-details-feature">
            <span
              class="pool-details-feature-icon"
              :class="{ 'is-on': hasPets, 'is-off': !hasPets }"
              >🐶</span
            >
            <span class="pool-details-feature-text">{{
              hasPets ? "Dozvoljeni ljubimci" : "Ljubimci nisu dozvoljeni"
            }}</span>
          </li>
          <li v-if="pool.capacity" class="pool-details-feature">
            <span class="pool-details-feature-icon is-on">👥</span>
            <span class="pool-details-feature-text"
              >{{ pool.capacity }} osoba</span
            >
          </li>
        </ul>
      </section>
    </div>

    <div class="pool-details-calendar"></div>
  </section>
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

  &-media {
    margin-top: 12px;

    &-imgwrapper {
      border-radius: 8px;
      overflow: hidden;
      height: 260px;
    }

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
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
    gap: 10px;
    border-color: #d7ecff;

    &-avatar {
      width: 44px;
      height: 44px;
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
    &-row {
      display: flex;
      gap: 8px;
      margin-top: 6px;
      padding: 4px 8px;
      border-radius: 10px;
      background: rgba(2, 60, 99, 0.06);
    }

    &-amount {
      font-weight: 900;
      color: #023c63;
      line-height: 1;
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
    text-align: center;
    cursor: pointer;
    grid-column: 1 / -1;
  }

  &-calendar {
    margin-top: 12px;
    min-height: 220px;
    border-radius: 12px;
    background: #f8fcff;
    border: 1px dashed rgba(2, 60, 99, 0.12);
  }

  &-body {
    margin: 12px 0 20px;
    display: grid;
    gap: 14px;
  }

  &-section-title {
    font-weight: 800;
    margin-bottom: 6px;
    color: var(--text-color-black);
  }

  &-text {
    color: #4b5563;
  }

  &-features {
    list-style: none;
    padding: 0;
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
  }

  &-feature-icon {
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

  &-feature-text {
    font-weight: 700;
    color: #0f172a;
  }

  &--mobile {
    .pool-details {
      &-titlebar-title {
        font-size: 27px;
      }
      &-media-imgwrapper {
        height: 260px;
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
      &-host-phone {
        font-size: 17px;
      }
    }
  }

  &--desktop {
    .pool-details {
      padding-top: 92px;
      &-titlebar-title {
        font-size: 32px;
      }
      &-media-imgwrapper {
        height: 420px;
      }
      &-summarybar {
        grid-template-columns: 1fr 1fr;
      }
      &-cta {
        display: none;
      }
      &-body {
        grid-template-columns: 1fr 1fr;
      }
      &-price-amount {
        font-size: 20px;
      }
      &-price-unit {
        font-size: 15px;
      }
      &-host-phone {
        font-size: 18px;
      }
    }
  }
}
</style>
