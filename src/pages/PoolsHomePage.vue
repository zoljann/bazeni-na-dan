<script setup lang="ts">
import { ref, computed } from 'vue';
import Navigation from '../components/Navigation.vue';
import isMobile from 'is-mobile';
import LocationDropdown from '../components/utility/LocationDropdown.vue';
import allCities from '../helpers/bih-cities.json';
import { faqData } from '../helpers/index';
import { useRouter } from 'vue-router';

const isMobileView = isMobile();
const router = useRouter();
const showLocationDropdown = ref(false);
const selectedCity = ref<string>('Sve lokacije');
const activeFaqTab = ref<'guests' | 'hosts'>('guests');
const openFaqIndex = ref<number | null>(null);
const howItWorksRef = ref<HTMLElement | null>(null);

const currentFaq = computed(() => faqData[activeFaqTab.value]);
const contentClasses = computed(() => ({
  [`content--${isMobileView ? 'mobile' : 'desktop'}`]: true
}));

const toggleFaq = (i: number) => {
  openFaqIndex.value = openFaqIndex.value === i ? null : i;
};
const onSelectCity = (city: string) => {
  selectedCity.value = city;
  router.push({ name: 'PoolsSearchPage', query: { grad: city } });
};
const showAllPools = () => {
  router.push({ name: 'PoolsSearchPage' });
};
const handleSearchPoolClick = () => {
  router.push({ name: 'PoolsSearchPage' });
};
const scrollToHowItWorks = () => {
  howItWorksRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
};
</script>

<template>
  <Navigation />

  <section
    class="content"
    :class="contentClasses"
  >
    <div class="content-middle">
      <h1 class="content-middle-title">Iznajmi privatne bazene na dan</h1>

      <div class="content-search">
        <button
          class="content-search-row"
          @click="showLocationDropdown = true"
        >
          <span class="content-search-label">📍 {{ selectedCity }}</span>
          <span class="content-search-dropdown-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
            >
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
          @allpools="showAllPools"
        />

        <button
          class="content-search-button"
          @click="handleSearchPoolClick()"
        >
          Pretraži bazene
        </button>
      </div>
    </div>

    <button
      type="button"
      class="content-works"
      @click="scrollToHowItWorks"
    >
      <span class="content-works-text">Kako rezervisati bazen</span>
      <svg
        class="content-works-arrow"
        xmlns="http://www.w3.org/2000/svg"
        width="11"
        height="7"
        fill="currentColor"
        viewBox="0 0 11 7"
      >
        <path
          fill-rule="evenodd"
          d="M.219 2.074 4.972 6.64c.292.28.764.28 1.056 0l4.753-4.566a.697.697 0 0 0 0-1.014.77.77 0 0 0-1.056 0L5.511 5.107h-.022L1.275 1.06a.77.77 0 0 0-1.056 0 .697.697 0 0 0 0 1.014"
          clip-rule="evenodd"
        ></path>
      </svg>
    </button>

    <div class="content-curly"></div>
  </section>
  <section
    class="content-after"
    :class="contentClasses"
    ref="howItWorksRef"
  >
    <div class="content-after-how-it-works">
      <h2 class="content-after-how-it-works-title">Kako rezervisati bazen</h2>

      <div class="content-after-how-it-works-grid">
        <div class="content-after-how-it-works-row">
          <div class="content-after-how-it-works-media"></div>
          <div class="content-after-how-it-works-body">
            <span class="content-after-how-it-works-badge">1</span>
            <h3 class="content-after-how-it-works-body-title">Pretraži bazene po gradu</h3>
            <p class="content-after-how-it-works-body-text">
              Odaberi grad koji te zanima, pretraži bazene po datumu i filterima, pregledaj slike,
              cijene i pravila kućnog reda dok ne nađeš bazen koji ti odgovara.
            </p>
          </div>
        </div>

        <div class="content-after-how-it-works-row">
          <div class="content-after-how-it-works-media"></div>
          <div class="content-after-how-it-works-body">
            <span class="content-after-how-it-works-badge">2</span>
            <h3 class="content-after-how-it-works-body-title">Otvori bazen i provjeri kalendar</h3>
            <p class="content-after-how-it-works-body-text">
              Otvori profil bazena koji ti se sviđa i na dnu stranice provjeri kalendar dostupnosti,
              ako ga bazen ima. Ako kalendara nema, termin i cijenu možeš provjeriti direktno s
              domaćinom, a uz to vidi šta je sve uključeno u cijenu (oprema, roštilj, parking..).
            </p>
          </div>
        </div>

        <div class="content-after-how-it-works-row">
          <div class="content-after-how-it-works-media"></div>
          <div class="content-after-how-it-works-body">
            <span class="content-after-how-it-works-badge">3</span>
            <h3 class="content-after-how-it-works-body-title">Nazovi domaćina i potvrdi termin</h3>
            <p class="content-after-how-it-works-body-text">
              Nazovi domaćina na broj naveden na profilu, provjeri slobodan termin, cijenu i ostale
              detalje, dogovorite se oko dolaska i uživaj u svom danu na bazenu. 🏊‍♂️
            </p>
          </div>
        </div>

        <button
          class="content-after-cta"
          @click="handleSearchPoolClick"
        >
          Pronađi bazene u blizini
        </button>
      </div>
    </div>

    <div
      class="content-after-faq"
      id="faq"
    >
      <h2 class="content-after-faq-title">Često postavljena pitanja</h2>

      <div class="content-after-faq-tabs">
        <button
          class="content-after-faq-tab"
          :class="{ 'is-active': activeFaqTab === 'guests' }"
          @click="
            activeFaqTab = 'guests';
            openFaqIndex = null;
          "
        >
          Gosti
        </button>
        <button
          class="content-after-faq-tab"
          :class="{ 'is-active': activeFaqTab === 'hosts' }"
          @click="
            activeFaqTab = 'hosts';
            openFaqIndex = null;
          "
        >
          Domaćini
        </button>
      </div>

      <ul class="content-after-faq-list">
        <li
          v-for="(item, i) in currentFaq"
          :key="i"
          class="content-after-faq-item"
        >
          <button
            class="content-after-faq-question"
            @click="toggleFaq(i)"
          >
            <span>{{ item.q }}</span>
            <span
              class="content-after-faq-plus"
              :class="{ 'is-open': openFaqIndex === i }"
            >
              <span class="content-after-faq-plus-bar content-after-faq-plus-h"></span>
              <span class="content-after-faq-plus-bar content-after-faq-plus-v"></span>
            </span>
          </button>
          <div
            class="content-after-faq-answer"
            :class="{ 'is-open': openFaqIndex === i }"
          >
            <p>{{ item.a }}</p>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.content {
  position: relative;
  min-height: 94vh;
  background: url('../assets/background.jpg');
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
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
      color: var(--text-color-white);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
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

    &-button {
      cursor: pointer;
      border-radius: 100px;
      height: 43px;
      font-weight: 800;
      background: var(--primary-color);
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

  &-works {
    position: absolute;
    width: 100%;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    color: var(--text-color-black);
    text-decoration: none;
    bottom: 20%;

    &-text {
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 4px;
      cursor: pointer;
    }

    &-arrow {
      display: block;
      margin: 6px auto 0;
    }
  }

  &-curly {
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 100%;
    height: 220px;
    pointer-events: none;
    overflow: hidden;

    background: linear-gradient(
      to bottom,
      rgba(92, 201, 255, 0) 0%,
      rgba(92, 201, 255, 0.2) 35%,
      rgba(92, 201, 255, 0.55) 65%,
      #5cc9ff 100%
    );
  }

  &-after {
    width: 100%;
    padding: 120px 18px 30px;
    background: linear-gradient(to bottom, #5cc9ff 0px, #5cc9ff 200px, #ffffff 600px, #ffffff 100%);

    &-how-it-works {
      max-width: 1200px;
      margin: 0 auto;
      color: var(--text-color-black);

      &-title {
        color: var(--text-color-white);
        margin-bottom: 10px;
        text-align: center;
        font-weight: 800;
      }

      &-grid {
        display: grid;
        gap: 16px;
      }

      &-row {
        display: grid;
        grid-template-areas:
          'media'
          'body';
        border-radius: 16px;
        box-shadow: 0 8px 22px rgba(2, 8, 23, 0.08);
        overflow: hidden;
        background: #fff;
      }

      &-media {
        grid-area: media;
        aspect-ratio: 16 / 10;
      }

      &-row:nth-child(1) .content-after-how-it-works-media {
        background: url('../assets/ghibli1.png') center / cover no-repeat;
      }

      &-row:nth-child(2) .content-after-how-it-works-media {
        background: url('../assets/ghibli2.png') center / cover no-repeat;
      }

      &-row:nth-child(3) .content-after-how-it-works-media {
        background: url('../assets/ghibli3.png') center / cover no-repeat;
      }

      &-body {
        grid-area: body;
        position: relative;
        padding: 16px;

        &-title {
          margin: 0 0 6px;
          font-weight: 800;
        }

        &-text {
          margin: 0;
          color: #6b7280;
        }
      }

      &-badge {
        position: absolute;
        top: -16px;
        left: 5px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--primary-color);
        color: var(--text-color-white);
        font-weight: 900;
        box-shadow: 0 6px 14px rgba(2, 8, 23, 0.18);
      }
    }

    &-cta {
      margin: 10px auto 0;
      border-radius: 9999px;
      color: var(--text-color-white);
      background: var(--primary-color);
      box-shadow: 0 6px 18px rgba(0, 178, 255, 0.35);
      cursor: pointer;
    }

    &-faq {
      max-width: 1200px;
      margin: 28px auto 0;
      border-radius: 18px;
      background: #f2fbfe;

      &-title {
        font-weight: 900;
        text-align: center;
        padding: 15px 0;
        color: var(--text-color-black);
      }

      &-tabs {
        display: flex;
        gap: 10px;
        justify-content: center;
      }

      &-tab {
        cursor: pointer;
        padding: 10px 50px;
        border-radius: 999px;
        background: #dcf2ff;
        color: var(--text-color-black);
        font-weight: 800;

        &.is-active {
          background: var(--primary-color);
          color: var(--text-color-white);
          box-shadow: 0 6px 18px rgba(0, 178, 255, 0.35);
        }
      }

      &-item {
        border-bottom: 1px solid #e1f6ff;

        &:last-child {
          border-bottom: 0;
        }
      }

      &-question {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 10px;
        text-align: left;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-color-black);
      }

      &-plus {
        position: relative;
        flex: 0 0 auto;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #dff3ff;
        display: grid;
        place-items: center;
        transition: transform 0.2s ease;

        &-bar {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          background: var(--text-color-black);
          border-radius: 2px;
        }

        &-h {
          width: 14px;
          height: 2px;
        }

        &-v {
          width: 2px;
          height: 14px;
          transition: opacity 0.2s ease;
        }

        &.is-open {
          .content-after-faq-plus-v {
            opacity: 0;
          }
        }
      }

      &-answer {
        max-height: 0;
        overflow: hidden;
        transition:
          max-height 0.3s ease,
          padding 0.3s ease;
        padding: 0 10px 0;

        &.is-open {
          max-height: fit-content;
          padding-bottom: 12px;
        }

        p {
          color: #6b7280;
        }
      }
    }
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

      &-curly {
        height: 80px;

        &-title {
          font-size: 1rem;
        }

        &-img {
          width: 130%;
        }
      }

      &-works-text {
        font-size: 18px;
      }

      &-after {
        &-how-it-works {
          &-title {
            font-size: 22px;
          }

          &-body-text {
            font-size: 14px;
          }
        }

        &-cta {
          height: 50px;
          width: 100%;
        }

        &-faq {
          &-tab {
            font-size: 15px;
          }

          &-question {
            font-size: 16px;
          }

          &-answer p {
            font-size: 14px;
          }
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
          font-size: 52px;
        }
      }

      &-search {
        max-width: 680px;

        &-row {
          &:hover {
            background-color: rgb(245, 245, 245);
            border-radius: 16px;
          }
        }

        &-button {
          &:hover {
            filter: brightness(0.95);
          }
        }
      }

      &-curly {
        height: 150px;

        &-title {
          font-size: 2rem;
        }

        &-img {
          position: static;
          transform: none;
          width: 100%;
          height: 150px;
          object-fit: fill;
        }
      }

      &-after {
        &-how-it-works {
          &-row {
            grid-template-areas: 'body media';
            grid-template-columns: 1.1fr 1fr;
            align-items: center;
          }

          &-media {
            aspect-ratio: 16 / 10;
            min-height: 220px;
            border-radius: 12px;
            margin: 12px 12px 12px 0;
          }

          &-body {
            padding: 22px 22px 22px 24px;
            display: grid;
            grid-template-columns: 40px 1fr;
            column-gap: 12px;
            align-items: start;

            &-title {
              grid-column: 2;
              margin: 0 0 8px;
              font-size: 20px;
              line-height: 1.25;
            }

            &-text {
              font-size: 16px;
            }
          }

          &-badge {
            position: static;
            grid-column: 1;
            grid-row: 1 / span 2;
            align-self: start;
            width: 36px;
            height: 36px;
          }

          &-title {
            margin-bottom: 22px;
            text-align: center;
          }
        }

        &-cta {
          height: 60px;
          width: 25%;

          &:hover {
            filter: brightness(0.95);
          }
        }

        &-faq {
          padding: 22px 22px;

          &-question {
            padding: 16px 12px;
          }

          &-answer p {
            font-size: 16px;
          }

          &-tab:not(.is-active):hover {
            filter: brightness(0.95);
          }

          &-plus:hover {
            filter: brightness(0.95);
          }
        }
      }
    }
  }
}
</style>
