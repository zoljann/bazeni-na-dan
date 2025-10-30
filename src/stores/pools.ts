import { ref } from "vue";
import { defineStore } from "pinia";
import type { Pool } from "src/types";

const usePoolsStore = defineStore("poolsStore", () => {
  const pools = ref<Pool[]>([]);

  const findPoolById = (id: string) => {
    return pools.value.find((pool) => pool.id === id);
  };

  return { pools, findPoolById };
});

export { usePoolsStore };
