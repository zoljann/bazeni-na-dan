import { ref } from "vue";
import type { Pool } from "src/types";
import { storage } from "../utility/localStorage";

const FAVORITES_STORAGE_KEY = "BND_favorites";

const load = () => {
  const stored = storage.getItem(FAVORITES_STORAGE_KEY);
  return Array.isArray(stored) ? (stored as Pool[]) : [];
};

const favoritePools = ref<Pool[]>(load());

const isPoolFavorite = (pool: Pool) =>
  favoritePools.value.some((p) => p.id === pool.id);

const toggleFavoritePool = (pool: Pool) => {
  const wasFav = isPoolFavorite(pool);
  favoritePools.value = wasFav
    ? favoritePools.value.filter((p) => p.id !== pool.id)
    : [...favoritePools.value, pool];

  storage.setItem(FAVORITES_STORAGE_KEY, favoritePools.value);
};

export function useFavorites() {
  return { favoritePools, isPoolFavorite, toggleFavoritePool };
}
