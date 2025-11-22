<template>
  <article class="pool-card pool-card--skeleton">
    <div class="pool-card-media">
      <div class="skeleton-base skeleton-thumb" />

      <div class="skeleton-base skeleton-circle skeleton-arrow skeleton-arrow--left" />
      <div class="skeleton-base skeleton-circle skeleton-arrow skeleton-arrow--right" />
      <div class="skeleton-base skeleton-circle skeleton-like" />
      <div class="skeleton-base skeleton-pill skeleton-price" />
    </div>

    <div class="pool-card-body">
      <div class="skeleton-base skeleton-line skeleton-line--title" />

      <div class="pool-card-body-meta">
        <div class="skeleton-base skeleton-line skeleton-line--meta" />
        <div class="skeleton-base skeleton-line skeleton-line--meta" />
      </div>

      <div class="skeleton-base skeleton-pill skeleton-pill--quick" />
    </div>

    <div class="pool-card-actions">
      <div class="skeleton-base skeleton-pill skeleton-pill--primary" />
      <div class="skeleton-base skeleton-circle skeleton-circle--small" />
    </div>
  </article>
</template>

<style scoped lang="scss">
.pool-card {
  &--skeleton {
    display: grid;
    grid-template-rows: auto 1fr auto;
    border-radius: 16px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    overflow: hidden;
    box-shadow: 0 8px 22px rgba(2, 8, 23, 0.08);
  }

  &-media {
    position: relative;
    aspect-ratio: 16 / 10;
    overflow: hidden;
    background: #e5e7eb;
  }

  &-body {
    padding: 12px;
    display: grid;
    gap: 6px;
  }

  &-body-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &-actions {
    display: flex;
    gap: 10px;
    padding: 10px 12px 12px;
    border-top: 1px solid #eef2f7;
    align-items: center;
  }
}

.skeleton-base {
  position: relative;
  overflow: hidden;
  background: #f3f4f6;
}

.skeleton-base::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.7) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: translateX(-100%);
  animation: skeleton-shimmer 1.3s infinite;
}

.skeleton-thumb {
  position: absolute;
  inset: 0;
}

.skeleton-circle {
  border-radius: 999px;
}

.skeleton-like {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 36px;
  height: 36px;
}

.skeleton-arrow {
  position: absolute;
  top: 50%;
  width: 36px;
  height: 36px;
  transform: translateY(-50%);
  box-shadow: 0 6px 14px rgba(2, 8, 23, 0.08);

  &--left {
    left: 8px;
  }

  &--right {
    right: 8px;
  }
}

.skeleton-line {
  height: 12px;
  border-radius: 999px;

  &--title {
    width: 75%;
    height: 16px;
    margin-bottom: 2px;
  }

  &--meta {
    width: 48%;
  }
}

.skeleton-pill {
  height: 18px;
  border-radius: 999px;
}

.skeleton-price {
  position: absolute;
  left: 10px;
  bottom: 10px;
  width: 38%;
  max-width: 140px;
}

.skeleton-pill--quick {
  width: 55%;
  height: 14px;
  margin-top: 2px;
}

.skeleton-pill--primary {
  flex: 1;
  height: 44px;
}

.skeleton-circle--small {
  width: 44px;
  height: 44px;
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
