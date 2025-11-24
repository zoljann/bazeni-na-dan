<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import Navigation from '@/components/Navigation.vue';
import TitleBar from '@/components/TitleBar.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { notificationsStore } from '@/stores/notifications';
import { getAdminPools } from '@/api';
import { storage } from '@/utility/localStorage';
import type { Pool } from 'src/types';

const router = useRouter();
const isMobileView = isMobile();
const notifications = notificationsStore();
const pools = ref<Pool[]>([]);
const isLoading = ref(false);
const error = ref('');
const poolColumns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Naziv' },
  { key: 'city', label: 'Grad' },
  { key: 'userId', label: 'Vlasnik (id)' },
  { key: 'capacity', label: 'Kapacitet' },
  { key: 'pricePerDay', label: 'Cijena' },
  { key: 'isVisible', label: 'Vidljiv' },
  { key: 'visibleUntil', label: 'Vidljivo do' },
  { key: 'createdAt', label: 'Kreiran' },
  { key: 'updatedAt', label: 'Ažuriran' }
];

const pageClasses = computed(() => ({
  [`admin-pools--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));
const tableRows = computed(() =>
  pools.value.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    userId: p.userId,
    capacity: p.capacity,
    pricePerDay: p.pricePerDay ? `${p.pricePerDay} KM` : '-',
    isVisible: p.isVisible ? 'Da' : 'Ne',
    visibleUntil: p.visibleUntil || '-',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  }))
);

const loadPools = async (adminSecret: string) => {
  isLoading.value = true;
  error.value = '';

  const res = await getAdminPools(adminSecret);

  if (res.state === 'success') {
    pools.value = res.pools;
  } else {
    notifications.addNotification('Neuspjelo učitavanje bazena.', 'error');
  }

  isLoading.value = false;
};

onMounted(() => {
  const saved = storage.getItem('BND_admin_secret');

  if (typeof saved !== 'string') {
    router.push({ name: 'AdminHomePage' });
    return;
  }

  loadPools(saved);
});
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="admin-pools"
    :class="pageClasses"
  >
    <TitleBar title="Bazeni" />

    <div class="admin-pools-shell">
      <p
        v-if="isLoading"
        class="admin-pools-status"
      >
        Učitavanje bazena...
      </p>

      <p
        v-else-if="error"
        class="admin-pools-status admin-pools-status--error"
      >
        {{ error }}
      </p>

      <AdminTable
        v-else
        :columns="poolColumns"
        :rows="tableRows"
        empty-text="Nema bazena."
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.admin-pools {
  width: 100%;
  padding: 16px;

  &-shell {
    max-width: 1100px;
    margin: 0 auto;
  }

  &-status {
    margin-top: 10px;
    font-weight: 600;
    color: #6b7280;

    &--error {
      color: #a31515;
    }
  }

  &--mobile {
    .admin-pools {
      padding-top: 70px;
    }
  }

  &--desktop {
    .admin-pools {
      padding-top: 92px;
    }
  }
}
</style>
