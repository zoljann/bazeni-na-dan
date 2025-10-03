<script setup lang="ts">
import { computed } from "vue";
import isMobile from "is-mobile";
import type { Pool } from "src/types";

const props = defineProps<{
  pool: Pool;
}>();

const isMobileView = isMobile();

const priceLabel = computed(() =>
  props.pool.pricePerDay ? `${props.pool.pricePerDay}KM/dan` : ""
);
const poolCardClasses = computed(() => ({
  [`pool-card--${isMobileView ? "mobile" : "desktop"}`]: true,
}));

const onLikeClick = () => console.log("add to favorites", props.pool.id);
</script>
<template>
  <div class="pool-card" :class="poolCardClasses">
    <div class="pool-card-media">
      <img class="pool-card-media" :src="pool.images[0]" alt="bazen slike" />
      <button class="pool-card-like" @click.stop="onLikeClick">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.35l8.84-8.96a5.5 5.5 0 0 0 0-7.78Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <span v-if="priceLabel" class="pool-card-media-price">
        {{ priceLabel }}
      </span>
    </div>

    <div class="pool-card-body">
      <h3 class="pool-card-body-title">{{ pool.title }}</h3>
      <div class="pool-card-body-meta">
        <span class="pool-card-body-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              d="M12 22s7-7.6 7-12a7 7 0 0 0-14 0c0 4.4 7 12 7 12z"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
            />
            <circle cx="12" cy="10" r="3" fill="currentColor" />
          </svg>
          <span class="pool-card-body-meta-text">{{ pool.city }}</span>
        </span>
        <span class="pool-card-body-meta-item">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm7 9v-1a7 7 0 0 0-14 0v1"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          do {{ pool.capacity }} gostiju
        </span>
      </div>
      <div class="pool-card-body-quick">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
          />
          <path
            d="M12 8v4l3 2"
            stroke="currentColor"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Dostupno već od sutra
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pool-card {
  display: grid;
  grid-template-rows: auto 1fr;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 22px rgba(2, 8, 23, 0.08);
  cursor: pointer;

  &-media {
    position: relative;
    aspect-ratio: 16 / 10;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.35),
        transparent 55%
      );
    }

    &-price {
      position: absolute;
      left: 10px;
      bottom: 10px;
      border-radius: 8px;
      padding: 6px 10px;
      background: var(--primary-color);
      color: var(--text-color-white);
      font-weight: 800;
      box-shadow: 0 6px 14px rgba(0, 178, 255, 0.35);
    }
  }

  &-like {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    background: #ffffffb7;
    color: var(--text-color-black);
    display: grid;
    place-items: center;
    z-index: 1;
    cursor: pointer;

    &:hover {
      filter: brightness(0.95);
    }
  }

  &-body {
    align-content: center;
    padding: 12px;
    color: var(--text-color-black);
    display: grid;
    gap: 6px;

    &-title {
      font-weight: 800;
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.25;
    }

    &-meta {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      color: #6b7280;
      font-weight: 600;
      row-gap: 0px;

      &-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }

      &-text {
        white-space: nowrap;
      }
    }

    &-quick {
      color: var(--primary-color);
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  &--mobile {
    .pool-card-body-quick {
      font-size: 14px;
    }
  }

  &--desktop {
    .pool-card-body-quick {
      font-size: 16px;
    }
  }
}
</style>
