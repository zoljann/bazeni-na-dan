<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import { useUserStore } from '../stores/user';
import Navigation from '../components/Navigation.vue';
import PoolCard from '../components/pools/PoolCard.vue';
import type { Pool } from 'src/types';
import { deletePool, getAvailablePools } from '../api/index';
import TitleBar from '.././components/TitleBar.vue';
import { notificationsStore } from '../stores/notifications';
import ConfirmPopup from '../components/utility/ConfirmPopup.vue';
import PoolCardSkeleton from '../components/pools/PoolCardSkeleton.vue';

const router = useRouter();
const isMobileView = isMobile();
const userStore = useUserStore();
const notifications = notificationsStore();
const pools = ref<Pool[]>([]);
const showDeleteFor = ref<string | null>(null);
const isLoadingPools = ref(true);

const publishedClasses = computed(() => ({
  [`published--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const editPool = (id: string) => {
  router.push({ name: 'PoolsEditPublishPage', query: { bazenId: id } });
};
const createNewPool = () => {
  router.push({ name: 'PoolsEditPublishPage' });
};
const onDeleteRequested = (id: string) => (showDeleteFor.value = id);
const confirmDelete = async () => {
  const id = showDeleteFor.value!;
  try {
    pools.value = pools.value.filter((p) => p.id !== id);
    await deletePool(id);
    userStore.decrementPublishedPoolsCount();
    notifications.addNotification('Bazen je obrisan.', 'success');
  } catch {
    notifications.addNotification('Brisanje nije uspjelo.', 'error');
  } finally {
    showDeleteFor.value = null;
  }
};

onMounted(async () => {
  isLoadingPools.value = true;
  try {
    const res = await getAvailablePools(userStore.user?.id);

    if (res.state === 'success') {
      pools.value = res.pools;
    } else {
      notifications.addNotification('Nešto je pošlo po krivu, pokušajte malo kasnije', 'error');
    }
  } finally {
    isLoadingPools.value = false;
  }
});
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="published"
    :class="publishedClasses"
  >
    <TitleBar title="Objavljeni bazeni" />
    <div
      v-if="isLoadingPools"
      class="published-results"
    >
      <div class="published-results-grid">
        <PoolCardSkeleton
          v-for="i in 3"
          :key="i"
        />
      </div>
    </div>

    <div
      v-else-if="pools.length === 0"
      class="published-results"
    >
      <div
        v-if="isMobileView"
        class="published-addbtnwrap"
      >
        <button
          type="button"
          class="published-addbtn"
          @click="createNewPool"
          aria-label="Dodaj novi bazen"
        >
          Dodaj novi bazen
        </button>
        <div class="published-addhint">
          Dodajte slike, lokaciju i kratak opis bazena — objavite za par minuta.
        </div>
      </div>
      <div
        v-else
        class="published-results-grid"
      >
        <div class="published-addcard">
          <div class="published-addcard-media">
            <div
              class="published-addcard-plus"
              @click="createNewPool"
            >
              +
            </div>
          </div>
          <div class="published-addcard-body">
            <div class="published-addcard-title">Dodaj novi bazen</div>
            <div class="published-addcard-sub">Dodajte slike, lokaciju i opis u par koraka.</div>
            <button
              type="button"
              class="published-addbtn"
              @click="createNewPool"
              aria-label="Dodaj novi bazen"
            >
              Dodaj novi bazen
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="published-results"
    >
      <div
        v-if="isMobileView"
        class="published-addbtnwrap"
      >
        <button
          type="button"
          class="published-addbtn"
          @click="createNewPool"
          aria-label="Dodaj novi bazen"
        >
          Dodaj novi bazen
        </button>
      </div>

      <div class="published-results-grid">
        <div
          v-if="!isMobileView"
          class="published-addcard"
        >
          <div class="published-addcard-media">
            <div
              class="published-addcard-plus"
              @click="createNewPool"
            >
              +
            </div>
          </div>
          <div class="published-addcard-body">
            <div class="published-addcard-title">Dodaj novi bazen</div>
            <div class="published-addcard-sub">Dodajte slike, lokaciju i opis u par koraka.</div>
            <button
              type="button"
              class="published-addbtn"
              @click="createNewPool"
              aria-label="Dodaj novi bazen"
            >
              Dodaj novi bazen
            </button>
          </div>
        </div>

        <PoolCard
          v-for="p in pools"
          :key="p.id"
          :pool="p"
          :actions="true"
          @open-pool="editPool"
          @delete-requested="onDeleteRequested"
        />

        <ConfirmPopup
          :open="!!showDeleteFor"
          title="Brisanje bazena"
          :message="`Želite li obrisati ovaj bazen?`"
          confirm-label="Obriši"
          cancel-label="Odustani"
          @confirm="confirmDelete"
          @cancel="showDeleteFor = null"
          @update:open="(val: boolean) => (showDeleteFor = val ? showDeleteFor : null)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.published {
  width: 100%;
  padding: 16px;

  &-addbtn {
    height: 42px;
    border-radius: 12px;
    background: var(--primary-color);
    color: var(--text-color-white);
    font-weight: 700;
    border: 1px solid var(--primary-color);
    box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    cursor: pointer;
    padding: 0 14px;
  }

  &-addhint {
    margin-top: 8px;
    color: #6b7280;
    font-weight: 700;
    text-align: center;
  }

  &-addbtnwrap {
    max-width: 1100px;
    margin: 0 auto 12px;
    display: grid;
  }

  &-results {
    max-width: 1100px;
    margin: 0 auto;

    &-grid {
      display: grid;
      gap: 14px;
    }
  }

  &-addcard {
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 8px 22px rgba(2, 8, 23, 0.08);
    overflow: hidden;
    background: #fff;
    display: grid;
    grid-template-rows: auto 1fr;
  }

  &-addcard-media {
    position: relative;
    aspect-ratio: 16 / 10;
    background: #fbfdff;
    border-bottom: 1px solid #e5e7eb;
    display: grid;
    place-items: center;
  }

  &-addcard-plus {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 32px;
    font-weight: 900;
    color: var(--text-color-white);
    background: var(--primary-color);
    box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    cursor: pointer;
  }

  &-addcard-body {
    padding: 12px;
    display: grid;
    gap: 8px;
    justify-items: center;
    text-align: center;
  }

  &-addcard-title {
    font-weight: 800;
    color: var(--text-color-black);
  }

  &-addcard-sub {
    color: #6b7280;
    font-weight: 700;
  }

  &--mobile {
    .published {
      &-results-grid {
        grid-template-columns: 1fr;
      }

      &-addbtn {
        width: 100%;
      }
    }
  }

  &--desktop {
    .published {
      padding-top: 92px;

      &-results-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      &-addbtn {
        width: 100%;

        &:hover {
          filter: brightness(0.95);
        }
      }

      &-addcard {
        height: 390px;

        &-plus:hover {
          filter: brightness(0.95);
        }
      }
    }
  }
}
</style>
