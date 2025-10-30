<!-- pages/PoolDetailsPage.vue -->
<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Pool } from "src/types";
import { usePoolsStore } from "../stores/pools";
import { getPoolById } from "../api";

const route = useRoute();
const router = useRouter();
const poolsStore = usePoolsStore();
const id = computed(() => route.query.id as string | undefined);
const loading = ref(true);
const error = ref<string | null>(null);
const pool = ref<Pool | null>(null);

onMounted(async () => {
  if (!id.value) {
    return;
  }

  const cached = poolsStore.findPoolById(id.value);
  if (cached) {
    pool.value = cached;
    loading.value = false;
  } else {
    const res = await getPoolById(id.value);
    if (res.state === "success") {
      pool.value = res.pool;
    } else {
      error.value = res.message || "Greška pri učitavanju bazena.";
    }
    loading.value = false;
  }
});

function goBack() {
  router.back();
}
</script>

<template>
  <section class="pool-details">
    <button class="pool-details-back" @click="goBack">← Nazad</button>

    <div v-if="loading" class="pool-details-state">Učitavanje…</div>
    <div v-else-if="error" class="pool-details-state error">{{ error }}</div>

    <div v-else-if="pool" class="pool-details-content">
      <div class="pool-details-media">
        <img
          v-for="(img, i) in pool.images"
          :key="i"
          :src="img"
          :alt="`Slika bazena ${pool.title}`"
        />
      </div>

      <h1 class="pool-details-title">{{ pool.title }}</h1>
      <div class="pool-details-meta">
        <span>📍 {{ pool.city }}</span>
        <span>👥 do {{ pool.capacity }} gostiju</span>
        <span v-if="pool.pricePerDay">💸 {{ pool.pricePerDay }} KM/dan</span>
      </div>

      <div class="pool-details-tags" v-if="pool.filters">
        <span v-if="pool.filters.heated">Grijani</span>
        <span v-if="pool.filters.petsAllowed">Ljubimci dozvoljeni</span>
      </div>

      <div class="pool-details-availability" v-if="pool.availableDays?.length">
        <h3>Dostupni datumi</h3>
        <ul>
          <li v-for="d in pool.availableDays" :key="d">{{ d }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pool-details {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}
.pool-details-back {
  margin-bottom: 12px;
}
.pool-details-state {
  color: #6b7280;
  font-weight: 600;
}
.pool-details-state.error {
  color: #b91c1c;
}
.pool-details-media {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.pool-details-media img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
}
.pool-details-title {
  font-weight: 800;
  margin: 6px 0;
}
.pool-details-meta {
  display: flex;
  gap: 14px;
  color: #374151;
  font-weight: 600;
  flex-wrap: wrap;
}
.pool-details-tags {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}
.pool-details-tags span {
  background: #eef0f3;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  color: #374151;
}
</style>
