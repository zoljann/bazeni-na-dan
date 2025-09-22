<script setup lang="ts">
import { computed } from "vue";
import Navigation from "../components/Navigation.vue";
import isMobile from "is-mobile";

const isMobileView = isMobile();

const contentClasses = computed(() => ({
  [`content--${isMobileView ? "mobile" : "desktop"}`]: true,
}));
</script>

<template>
  <Navigation />

  <section class="content" :class="contentClasses">
    <div class="content-middle">
      <h1 class="content-middle-title">Iznajmi privatni bazen, na dan</h1>

      <div class="content-search">
        <div class="content-search-row">
          <svg
            class="content-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
              fill="currentColor"
            />
          </svg>
          <span class="content-search-label">Trenutna lokacija</span>
        </div>
        <button class="content-search-button">Pretraži bazene</button>
      </div>
    </div>

    <div class="content-overlay">
      <h2>Prva platforma u BiH za dnevni najam privatnih bazena</h2>
      <p>
        Jednostavno pronađi bazen u svom gradu, kontaktiraj vlasnika i uživaj —
        bez komplikacija i nepotrebnog dopisivanja. Filtriraj po lokaciji,
        cijeni i pravilima (muzika, roštilj, parking…).
      </p>
    </div>
  </section>

  <section class="page-section">
    <h3>Kako funkcioniše?</h3>
    <p>
      Pretraži bazene po gradu, pronađi detalje i dostupnost, pa rezerviši
      direktno telefonom ili putem poruke vlasniku. Vlasnici uređuju kalendar
      zauzetosti i ističu svoj bazen kroz premium pakete.
    </p>
  </section>
</template>

<style scoped lang="scss">
.content {
  position: relative;
  min-height: 95vh;
  background: url("../assets/background.png") center / cover no-repeat fixed;
  display: grid;
  place-items: center;

  &-middle {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    &-title {
      line-height: 120%;
      font-weight: 900;
      margin: 0 0 16px;
      width: 90%;
    }
  }

  &-search {
    background: #ffffff;
    border-radius: 25px;
    box-shadow: 0 10px 30px rgba(2, 8, 23, 0.08);
    padding: 10px;
    display: grid;
    gap: 12px;
    width: 100%;

    &-row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      color: var(--text-color-black);
      font-weight: 500;
    }

    &-button {
      border-radius: 100px;
      height: 43px;
      font-weight: 800;
      background: var(--primary-color);
    }
  }

  &-overlay {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    background-color: var(--primary-color);
  }

  &--mobile {
    margin-top: -64px;

    .content {
      &-middle {
        width: 90%;

        &-title {
          font-size: 28px;
        }
      }
    }
  }

  &--desktop {
    margin-top: -90px;

    .content {
      &-middle {
        width: 70%;

        &-title {
          font-size: 56px;
        }
      }

      &-search {
        max-width: 680px;
      }
    }
  }
}
</style>
