<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import isMobile from 'is-mobile';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination as SwiperPagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const props = defineProps<{
  modelValue: boolean;
  images: string[];
  startIndex?: number;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const isMobileView = isMobile();
const isOpen = ref(props.modelValue);
const swiperRef = ref<any>(null);
const isBeginning = ref(true);
const isEnd = ref(false);

const onClosePreview = () => emit('update:modelValue', false);

const onSwiperInit = (sw: any) => {
  swiperRef.value = sw;
  isBeginning.value = sw.isBeginning;
  isEnd.value = sw.isEnd;
  if (typeof props.startIndex === 'number') sw.slideTo(props.startIndex, 0);
};

const onSlideChange = (sw: any) => {
  isBeginning.value = sw.isBeginning;
  isEnd.value = sw.isEnd;
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') onClosePreview();
  if (!isMobileView && swiperRef.value) {
    if (e.key === 'ArrowLeft') swiperRef.value.slidePrev();
    if (e.key === 'ArrowRight') swiperRef.value.slideNext();
  }
};

watch(
  () => props.modelValue,
  (v) => {
    isOpen.value = v;
    if (v && typeof props.startIndex === 'number') {
      setTimeout(() => swiperRef.value?.slideTo(props.startIndex!, 0), 0);
    }
  },
  { immediate: true }
);

watch(
  () => props.startIndex,
  (i) => {
    if (isOpen.value && typeof i === 'number') swiperRef.value?.slideTo(i, 0);
  }
);

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="image-preview"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="image-preview-backdrop"
        @click="onClosePreview"
      />
      <div
        class="image-preview-content"
        @click.stop
      >
        <button
          class="image-preview-close"
          @click="onClosePreview"
          aria-label="Zatvori"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            width="28"
            height="28"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <Swiper
          class="image-preview-swiper"
          :modules="[SwiperPagination, Keyboard]"
          :slides-per-view="1"
          :pagination="{ clickable: true }"
          :keyboard="{ enabled: true }"
          @swiper="onSwiperInit"
          @slideChange="onSlideChange"
        >
          <SwiperSlide
            v-for="(img, i) in images"
            :key="i"
          >
            <img
              class="image-preview-img"
              :src="img"
              alt="pregled slike"
              draggable="false"
            />
          </SwiperSlide>
        </Swiper>

        <button
          v-if="!isMobileView && images.length > 1"
          class="image-preview-arrow image-preview-arrow--prev"
          :class="{ 'is-disabled': isBeginning }"
          :disabled="isBeginning"
          @click="swiperRef?.slidePrev()"
          aria-label="Prethodna slika"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M15 18 9 12l6-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          v-if="!isMobileView && images.length > 1"
          class="image-preview-arrow image-preview-arrow--next"
          :class="{ 'is-disabled': isEnd }"
          :disabled="isEnd"
          @click="swiperRef?.slideNext()"
          aria-label="Sljedeća slika"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="m9 18 6-6-6-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </teleport>
</template>

<style scoped lang="scss">
.image-preview {
  position: fixed;
  inset: 0;
  z-index: 9999;

  &-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.94);
  }

  &-content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 2;

    @media (min-width: 768px) {
      padding: 32px;
    }
  }

  &-close {
    position: absolute;
    top: 20px;
    right: 20px;
    color: var(--text-color-white);
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    cursor: pointer;
    z-index: 4;

    &:hover {
      filter: brightness(0.95);
    }
  }

  &-swiper {
    width: 100%;
    height: 100%;
    display: grid;
    place-items: center;
    z-index: 2;
  }

  :deep(.swiper-slide) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-img {
    max-width: 100%;
    max-height: 86vh;
    object-fit: contain;
    display: block;

    @media (min-width: 768px) {
      max-width: 92vw;
      max-height: 92vh;
    }
  }

  :deep(.swiper-pagination) {
    position: absolute;
    bottom: 14px;
  }

  :deep(.swiper-pagination-bullet) {
    width: 8px;
    height: 8px;
    background: #ffffffcc;
    opacity: 0.85;
    margin: 0 4px !important;

    @media (min-width: 768px) {
      width: 12px;
      height: 12px;
      margin: 0 6px !important;
    }
  }

  :deep(.swiper-pagination-bullet-active) {
    background: var(--primary-color);
    opacity: 1;
  }

  &-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    width: 48px;
    height: 48px;
    border-radius: 999px;
    background: #ffffffe6;
    color: var(--text-color-black);
    display: grid;
    place-items: center;
    cursor: pointer;
    box-shadow: 0 6px 14px rgba(2, 8, 23, 0.15);
    z-index: 3;

    &:not(:disabled):hover {
      filter: brightness(0.95);
    }

    &.is-disabled,
    &:disabled {
      opacity: 0.4;
    }

    &--prev {
      left: 24px;
    }

    &--next {
      right: 24px;
    }
  }
}
</style>
