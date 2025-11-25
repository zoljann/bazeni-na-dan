<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import Navigation from '@/components/Navigation.vue';
import TitleBar from '@/components/TitleBar.vue';
import AdminTable from '@/components/admin/AdminTable.vue';
import { notificationsStore } from '@/stores/notifications';
import { getAdminUsers } from '@/api';
import { storage } from '@/utility/localStorage';
import type { User } from 'src/types';

const router = useRouter();
const isMobileView = isMobile();
const notifications = notificationsStore();
const users = ref<User[]>([]);
const isLoading = ref(false);
const error = ref('');
const userColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Ime i prezime' },
  { key: 'email', label: 'Email' },
  { key: 'mobileNumber', label: 'Telefon' },
  { key: 'createdAt', label: 'Kreiran' },
  { key: 'updatedAt', label: 'Ažuriran' }
];

const pageClasses = computed(() => ({
  [`admin-users--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));
const tableRows = computed(() =>
  users.value.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email,
    mobileNumber: u.mobileNumber,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }))
);

const loadUsers = async (adminSecret: string) => {
  isLoading.value = true;
  error.value = '';

  const res = await getAdminUsers(adminSecret);

  if (res.state === 'success') {
    users.value = res.users;
  } else {
    notifications.addNotification('Neuspjelo učitavanje korisnika.', 'error');
  }

  isLoading.value = false;
};

onMounted(() => {
  const saved = storage.getItem('BND_admin_secret');

  if (typeof saved !== 'string') {
    router.push({ name: 'AdminHomePage' });
    return;
  }

  loadUsers(saved);
});
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="admin-users"
    :class="pageClasses"
  >
    <TitleBar title="Korisnici" />

    <div class="admin-users-shell">
      <p
        v-if="isLoading"
        class="admin-users-status"
      >
        Učitavanje korisnika...
      </p>

      <p
        v-else-if="error"
        class="admin-users-status admin-users-status--error"
      >
        {{ error }}
      </p>

      <AdminTable
        v-else
        :columns="userColumns"
        :rows="tableRows"
        empty-text="Nema korisnika."
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.admin-users {
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
    .admin-users {
      padding-top: 70px;
    }
  }

  &--desktop {
    .admin-users {
      padding-top: 92px;
    }
  }
}
</style>
