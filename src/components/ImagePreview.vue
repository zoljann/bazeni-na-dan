<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import isMobile from "is-mobile";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination as SwiperPagination, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const props = defineProps<{
  modelValue: boolean;
  images: string[];
  startIndex?: number;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
}>();

const isMobileView = isMobile();
const open = ref(props.modelValue);
const swRef = ref<any>(null);

watch(
  () => props.modelValue,
  (v) => {
    open.value = v;
    if (v && typeof props.startIndex === "number") {
      // jump to requested image after mount
      setTimeout(() => swRef.value?.slideTo(props.startIndex!, 0), 0);
    }
  },
  { immediate: true }
);

watch(
  () => props.startIndex,
  (i) => {
    if (open.value && typeof i === "number") swRef.value?.slideTo(i, 0);
  }
);

const onSwiper = (sw: any) => {
  swRef.value = sw;
  if (typeof props.startIndex === "number") sw.slideTo(props.startIndex, 0);
};

const close = () => emit("update:modelValue", false);

const goPrev = () => swRef.value?.slidePrev();
const goNext = () => swRef.value?.slideNext();

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") close();
  if (!isMobileView) {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  }
};
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => document.removeEventListener("keydown", onKey));
</script>

<template>
  <teleport to="body">
    <div v-if="open" class="imgprev" role="dialog" aria-modal="true">
      <div class="imgprev-backdrop" @click="close" />
      <div class="imgprev-content" @click.stop>
        <button class="imgprev-close" @click="close" aria-label="Zatvori">
          <!-- exact icon you provided -->
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
               stroke="currentColor" class="h-8 w-8">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Swiper
          class="imgprev-swiper"
          :modules="[SwiperPagination, Keyboard]"
          :slides-per-view="1"
          :pagination="{ clickable: true }"
          :keyboard="{ enabled: true }"
          @swiper="onSwiper"
        >
          <SwiperSlide v-for="(img, i) in images" :key="i">
            <img class="imgprev-img" :src="img" alt="pregled slike" />
          </SwiperSlide>
        </Swiper>

        <!-- desktop-only arrows -->
        <button
          v-if="!isMobileView && images.length > 1"
          class="imgprev-arrow imgprev-arrow--prev"
          @click="goPrev"
          aria-label="Prethodna slika"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 18 9 12l6-6" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          v-if="!isMobileView && images.length > 1"
          class="imgprev-arrow imgprev-arrow--next"
          @click="goNext"
          aria-label="Sljedeća slika"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-6-6-6" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.imgprev {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
.imgprev-backdrop {
  position: absolute;
  inset: 0;
  /* darker blackout */
  background: rgba(2, 8, 23, 0.92);
}
.imgprev-content {
  position: absolute;
  inset: 0;
  display: flex;               /* perfect centering */
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 2;
}
@media (min-width: 768px) {
  .imgprev-content { padding: 32px; }
}

/* close button */
.imgprev-close {
  position: absolute;
  top: 12px;
  right: 12px;
  border: 0;
  background: #ffffffe6;
  color: var(--text-color-black);
  width: 44px; height: 44px;
  border-radius: 999px;
  display: grid; place-items: center;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(2, 8, 23, 0.15);
  z-index: 4;
}

/* Swiper container centered */
.imgprev-swiper {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  z-index: 2;
}
/* center slides content */
:deep(.swiper-slide) {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* image sizing */
.imgprev-img {
  max-width: 100%;
  max-height: 85vh; /* mobile: full width feeling, keep ratio */
  object-fit: contain;
  display: block;
}
@media (min-width: 768px) {
  .imgprev-img {
    max-width: 90vw;   /* never reach edges */
    max-height: 90vh;  /* keep some breathing room */
  }
}

/* bigger pagination on desktop */
:deep(.swiper-pagination) {
  position: absolute;
  bottom: 14px;
}
:deep(.swiper-pagination-bullet) {
  width: 8px; height: 8px;
  background: #ffffffcc;
  opacity: 0.7;
  margin: 0 4px !important;
}
:deep(.swiper-pagination-bullet-active) {
  background: var(--primary-color);
  opacity: 1;
}
@media (min-width: 768px) {
  :deep(.swiper-pagination-bullet) {
    width: 12px; height: 12px;     /* larger dots on desktop */
    margin: 0 6px !important;
  }
}

/* desktop arrows */
.imgprev-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: 0;
  width: 48px; height: 48px;
  border-radius: 999px;
  background: #ffffffe6;
  color: var(--text-color-black);
  display: grid; place-items: center;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(2, 8, 23, 0.15);
  z-index: 3; /* above swiper */
}
.imgprev-arrow--prev { left: 24px; }
.imgprev-arrow--next { right: 24px; }
</style>
