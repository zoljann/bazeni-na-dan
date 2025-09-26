<script setup lang="ts">
import { ref, computed } from "vue";
import Navigation from "../components/Navigation.vue";
import isMobile from "is-mobile";
import LocationDropdown from "../components/utility/LocationDropdown.vue";
import allCities from "../helpers/bih-cities.json";

const isMobileView = isMobile();
const showLocationDropdown = ref(false);
const selectedCity = ref<string>("Odaberite lokaciju");

const contentClasses = computed(() => ({
  [`content--${isMobileView ? "mobile" : "desktop"}`]: true,
}));

const onSelectCity = (city: string) => {
  selectedCity.value = city;
  console.log("Odabrani grad:", city);
};
const onNearby = () => {
  selectedCity.value = "Moja lokacija";
  //ovdje ces zatrazti pristup lokaciji i iz nje izvuc grad, to istrazit dodatno
};
const handleSearchPoolClick = () => {
  console.log(
    "Otvorit search page tamo i zatrazit lokaciju ako ne dozvoli sve prikazat"
  );
};
</script>

<template>
  <Navigation />

  <section class="content" :class="contentClasses">
    <div class="content-middle">
      <h1 class="content-middle-title">Iznajmi privatne bazene, na dan</h1>

      <div class="content-search">
        <button class="content-search-row" @click="showLocationDropdown = true">
          <span class="content-search-label">📍 {{ selectedCity }}</span>
          <span class="content-search-dropdown-icon">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                d="M7 10l5 5 5-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>

        <LocationDropdown
          v-model="showLocationDropdown"
          :allCities="allCities"
          @select="onSelectCity"
          @nearby="onNearby"
        />

        <button class="content-search-button" @click="handleSearchPoolClick()">
          Pretraži bazene
        </button>
      </div>
    </div>

    <div class="content-overlay">
      <h2>Prva platforma u BiH za dnevni najam privatnih bazena</h2>
      <p>
        Jednostavno pronađi bazen u svom gradu, kontaktiraj vlasnika i uživaj —
        bez komplikacija…
      </p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.content {
  position: relative;
  min-height: 95vh;
  background: url("../assets/background.jpg") center / cover no-repeat fixed;
  background-color: red;
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
    position: relative;
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
      cursor: pointer;
    }

    &-row:hover {
      background: #e9ecf1;
      opacity: 1;
      border-radius: 20px;
    }

    &-button {
      cursor: pointer;
      border-radius: 100px;
      height: 43px;
      font-weight: 800;
      background: var(--primary-color);

      &:hover {
        background: #119ec9;
      }
    }

    &-dropdown-icon {
      margin-left: auto;
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
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
          font-size: 27px;
        }
      }
    }
  }

  &--desktop {
    margin-top: -90px;
    font-size: 125%;

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
