<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import isMobile from "is-mobile";
import Navigation from "../components/Navigation.vue";
import PoolCard from "../components/pools/PoolCard.vue";
import { useFavorites } from "../composables/useFavorites";

const router = useRouter();
const isMobileView = isMobile();
const { favoritePools } = useFavorites();

const savedClasses = computed(() => ({
  [`saved--${isMobileView ? "mobile" : "desktop"}`]: true,
}));

const openPool = (id: string) => {
  router.push({ name: "PoolDetailsPage", query: { id } });
};
</script>

<template>
  <Navigation variant="solid" />

  <section class="saved" :class="savedClasses">
    <header class="saved-header">
      <div class="saved-titlebar">
        <button class="saved-titlebar-backbtn" @click="router.back()">
          <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <h1 class="saved-titlebar-title">Sačuvani bazeni</h1>
      </div>
    </header>

    <div class="saved-results">
      <div class="saved-results-grid">
        <PoolCard
          v-for="p in favoritePools"
          :key="p.id"
          :pool="p"
          @open-pool="openPool"
        />
      </div>

      <p v-if="favoritePools.length === 0" class="saved-results-empty">
        Još nema sačuvanih bazena.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.saved {
  width: 100%;
  padding: 16px;

  &-header {
    max-width: 1100px;
    margin: 0 auto 12px;
  }

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

  &--mobile {
    .saved {
      &-titlebar-title {
        font-size: 26px;
      }

      &-results-grid {
        grid-template-columns: 1fr;
      }
    }
  }

  &--desktop {
    .saved {
      padding-top: 92px;

      &-titlebar-title {
        font-size: 32px;
      }

      &-results-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}
</style>
