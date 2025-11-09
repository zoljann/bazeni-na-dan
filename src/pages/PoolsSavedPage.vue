<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import Navigation from '../components/Navigation.vue';
import PoolCard from '../components/pools/PoolCard.vue';
import { useFavorites } from '../composables/useFavorites';
import TitleBar from '.././components/TitleBar.vue';

const router = useRouter();
const isMobileView = isMobile();
const { favoritePools } = useFavorites();

const savedClasses = computed(() => ({
  [`saved--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const openPool = (id: string) => {
  router.push({ name: 'PoolDetailsPage', query: { id } });
};
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="saved"
    :class="savedClasses"
  >
    <TitleBar title="Sačuvani bazeni" />

    <div class="saved-results">
      <div class="saved-results-grid">
        <PoolCard
          v-for="p in favoritePools"
          :key="p.id"
          :pool="p"
          @open-pool="openPool"
        />
      </div>

      <p
        v-if="favoritePools.length === 0"
        class="saved-results-empty"
      >
        Još nema sačuvanih bazena.
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.saved {
  width: 100%;
  padding: 16px;

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
      &-results-grid {
        grid-template-columns: 1fr;
      }
    }
  }

  &--desktop {
    .saved {
      padding-top: 92px;

      &-results-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  }
}
</style>
