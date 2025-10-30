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
const selectedPoolId = computed(() => route.query.id as string);
const pool = ref<Pool>();

const poolDetailsClasses = computed(() => ({
  [`pool-details--${isMobileView ? "mobile" : "desktop"}`]: true,
}));

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

  <div class="pool-details" :class="poolDetailsClasses" v-if="pool"></div>
</template>

<style scoped lang="scss">
.pool-details {
}
</style>
