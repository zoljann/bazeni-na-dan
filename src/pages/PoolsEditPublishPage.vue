<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import isMobile from 'is-mobile';
import Navigation from '../components/Navigation.vue';
import { useUserStore } from '../stores/user';
import { notificationsStore } from '../stores/notifications';
import { usePoolsStore } from '../stores/pools';
import { createPool, getPoolById } from '../api';
import AvailabilityCalendar from '../components/utility/AvailabilityCalendar.vue';
import allCities from '../helpers/bih-cities.json';
import type { Pool } from 'src/types';
import TitleBar from '.././components/TitleBar.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const poolsStore = usePoolsStore();
const useNotificationsStore = notificationsStore();
const isMobileView = isMobile();
const imgInputRef = ref<HTMLInputElement | null>(null);
const showCityDropdown = ref(false);
const cityQuery = ref('');
const form = ref({
  title: '',
  city: '',
  capacity: '',
  pricePerDay: '',
  description: '',
  filters: { heated: false, petsAllowed: false },
  enableAvailability: false,
  busyDays: [] as string[],
  images: [] as string[]
});
const errors = ref<{
  title?: string;
  city?: string;
  capacity?: string;
  pricePerDay?: string;
  description?: string;
  images?: string;
}>({});

const filteredCities = computed(() => {
  const q = cityQuery.value.trim().toLowerCase();
  return q ? allCities.filter((c: string) => c.toLowerCase().includes(q)) : allCities;
});
const bazenId = computed(() => (route.query.bazenId ? String(route.query.bazenId) : ''));
const isEdit = computed(() => !!bazenId.value);
const pageTitle = computed(() => (isEdit.value ? 'Uredi bazen' : 'Objavi bazen'));
const pageClasses = computed(() => ({ [`auth--${isMobileView ? 'mobile' : 'desktop'}`]: true }));

const pickCity = (c: string) => {
  form.value.city = c;
  showCityDropdown.value = false;
};
const sanitizeInt = (v: string, maxLen = 6) => v.replace(/\D+/g, '').slice(0, maxLen);
const onImagesPicked = async (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files || []);
  if (!files.length) return;
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  const left = 7 - form.value.images.length;
  for (const f of files.slice(0, left)) {
    if (!allowed.includes(f.type) || f.size > 5 * 1024 * 1024) continue;
    const b64 = await fileToBase64(f);
    if (b64) form.value.images.push(b64);
  }
  (e.target as HTMLInputElement).value = '';
};
function fileToBase64(f: File) {
  return new Promise<string | null>((r) => {
    const reader = new FileReader();
    reader.onload = () => r(typeof reader.result === 'string' ? reader.result : null);
    reader.onerror = () => r(null);
    reader.readAsDataURL(f);
  });
}
const removeImage = (i: number) => form.value.images.splice(i, 1);
const validate = () => {
  errors.value = {};
  const t = form.value.title.trim();
  if (t.length < 3 || t.length > 40) errors.value.title = 'Naslov mora imati 3–40 znakova.';
  if (!form.value.city || !allCities.includes(form.value.city))
    errors.value.city = 'Odaberite grad iz liste.';
  const cap = Number(form.value.capacity);
  if (!cap || cap < 1 || cap > 100) errors.value.capacity = 'Unesite broj 1–100.';
  const price = form.value.pricePerDay ? Number(form.value.pricePerDay) : undefined;
  if (form.value.pricePerDay && (!price || price < 1 || price > 10000))
    errors.value.pricePerDay = 'Unesite broj 1–10000 ili ostavite prazno.';
  const d = form.value.description.trim();
  if (d && (d.length < 1 || d.length > 300)) errors.value.description = '1–300 znakova.';
  if (form.value.images.length < 1 || form.value.images.length > 7)
    errors.value.images = 'Dodajte minimalno 1 a maksimalno 7 slika.';
  return Object.keys(errors.value).length === 0;
};
const fillFromPool = (p: Pool) => {
  form.value.title = p.title || '';
  form.value.city = p.city || '';
  form.value.capacity = String(p.capacity || '');
  form.value.pricePerDay = p.pricePerDay !== undefined ? String(p.pricePerDay) : '';
  form.value.description = p.description || '';
  form.value.filters = { heated: !!p?.filters?.heated, petsAllowed: !!p?.filters?.petsAllowed };
  form.value.images = Array.isArray(p.images) ? p.images.slice(0, 7) : [];
  const loadedBusy = Array.isArray(p.busyDays) ? (p.busyDays as string[]) : [];
  form.value.enableAvailability = loadedBusy.length > 0;
  form.value.busyDays = loadedBusy;
};
const submit = async () => {
  if (!validate()) return;
  const payload = {
    user: userStore.user!,
    pool: {
      id: isEdit.value ? bazenId.value : undefined,
      title: form.value.title.trim(),
      city: form.value.city,
      capacity: Number(form.value.capacity),
      images: form.value.images.slice(0, 7),
      pricePerDay: form.value.pricePerDay ? Number(form.value.pricePerDay) : undefined,
      description: form.value.description.trim() || undefined,
      filters: { ...form.value.filters },
      busyDays: form.value.enableAvailability ? [...form.value.busyDays].sort() : undefined
    }
  };

  const res = await createPool(payload);
  if (res.state === 'error') {
    useNotificationsStore.addNotification(res.message || 'Objava nije uspjela.', 'error');
    return;
  }

  router.push({ name: 'PoolsPublishedPage' });
};
const ensureOwnership = (p: Pool) => {
  if (!userStore.user?.id || p.userId !== userStore.user?.id) {
    console.log(userStore.user);
    useNotificationsStore.addNotification('Nemate dozvolu za uređivanje ovog bazena.', 'error');
    router.replace({ name: 'PoolsHomePage' });
    return false;
  }
  return true;
};

onMounted(async () => {
  if (!isEdit.value) return;

  const stored = poolsStore.findPoolById(bazenId.value);
  if (stored) {
    if (!ensureOwnership(stored)) return;
    fillFromPool(stored);
    return;
  }

  const res = await getPoolById(bazenId.value);
  if (res.state === 'success') {
    if (!ensureOwnership(res.pool)) return;
    fillFromPool(res.pool);
    return;
  }

  useNotificationsStore.addNotification('Došlo je do greške.', 'error');
  router.replace({ name: 'PoolsHomePage' });
});
</script>

<template>
  <Navigation variant="solid" />

  <section
    class="auth"
    :class="pageClasses"
  >
    <TitleBar :title="pageTitle" />

    <div class="auth-card">
      <form
        class="auth-form"
        @submit.prevent="submit"
      >
        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.title }"
        >
          <label
            for="title"
            class="auth-label"
            >Naslov <span class="req">*</span></label
          >
          <input
            id="title"
            v-model.trim="form.title"
            class="auth-input"
            type="text"
            maxlength="40"
          />
          <p
            v-if="errors.title"
            class="auth-error"
          >
            {{ errors.title }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.city }"
        >
          <label class="auth-label">Grad <span class="req">*</span></label>
          <button
            type="button"
            class="auth-input citybtn"
            :class="{ 'is-open': showCityDropdown }"
            @click="showCityDropdown = !showCityDropdown"
          >
            <span class="citybtn-label">{{ form.city || 'Odaberite grad' }}</span>
            <svg
              width="18"
              height="18"
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
          </button>
          <div
            v-if="showCityDropdown"
            class="citydrop"
          >
            <input
              v-model="cityQuery"
              class="auth-input citydrop-search"
              type="text"
              maxlength="40"
              placeholder="Pretraga"
            />
            <div class="citydrop-list">
              <button
                v-for="c in filteredCities"
                :key="c"
                type="button"
                class="citydrop-item"
                :class="{ 'is-selected': c === form.city }"
                @click="pickCity(c)"
              >
                {{ c }}
              </button>
            </div>
          </div>
          <p
            v-if="errors.city"
            class="auth-error"
          >
            {{ errors.city }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.capacity }"
        >
          <label
            for="capacity"
            class="auth-label"
            >Maksimalni kapacitet gostiju <span class="req">*</span></label
          >
          <input
            id="capacity"
            :value="form.capacity"
            @input="form.capacity = sanitizeInt(($event.target as HTMLInputElement).value, 3)"
            class="auth-input"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="3"
          />
          <p
            v-if="errors.capacity"
            class="auth-error"
          >
            {{ errors.capacity }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.pricePerDay }"
        >
          <label
            for="price"
            class="auth-label"
            >Cijena po danu (opcionalno)</label
          >
          <input
            id="price"
            :value="form.pricePerDay"
            @input="form.pricePerDay = sanitizeInt(($event.target as HTMLInputElement).value, 5)"
            class="auth-input"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="5"
          />
          <p
            v-if="errors.pricePerDay"
            class="auth-error"
          >
            {{ errors.pricePerDay }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.description }"
        >
          <label
            for="desc"
            class="auth-label"
            >Opis</label
          >
          <textarea
            id="desc"
            v-model.trim="form.description"
            class="auth-input textarea"
            maxlength="300"
          />
          <p
            v-if="errors.description"
            class="auth-error"
          >
            {{ errors.description }}
          </p>
        </div>

        <div class="auth-field">
          <span class="auth-label">Opcije</span>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.petsAllowed"
            />
            <span class="optcheck-label">🐶 Dozvoljeni ljubimci</span>
          </label>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.heated"
            />
            <span class="optcheck-label">🔥 Grijani bazen</span>
          </label>
        </div>

        <div class="auth-field">
          <span class="auth-label">Kalendar dostupnosti</span>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.enableAvailability"
            />
            <span class="optcheck-label">🗓️ Kalendar dostupnosti</span>
          </label>

          <div
            v-if="form.enableAvailability"
            class="hint"
          >
            Označite zauzete datume, ili to možete uraditi kasnije.
          </div>

          <AvailabilityCalendar
            v-if="form.enableAvailability"
            v-model="form.busyDays"
            mode="pick"
          />
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.images }"
        >
          <div class="auth-labelrow">
            <label class="auth-label">Slike <span class="req">*</span></label>
            <span class="imgcount">{{ form.images.length }}/7</span>
          </div>

          <div class="imggrid">
            <div
              v-for="(img, i) in form.images"
              :key="i"
              class="imgtile"
            >
              <img
                :src="img"
                alt="slika"
              />
              <button
                type="button"
                class="imgtile-del"
                @click="removeImage(i)"
                aria-label="Ukloni"
              >
                ✕
              </button>
            </div>

            <button
              type="button"
              class="imgadd"
              @click="imgInputRef?.click()"
              :disabled="form.images.length >= 7"
            >
              <span class="imgadd-text">Dodaj sliku</span>
            </button>

            <input
              ref="imgInputRef"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              @change="onImagesPicked"
            />
          </div>

          <p
            v-if="errors.images"
            class="auth-error"
          >
            {{ errors.images }}
          </p>
        </div>

        <button
          type="submit"
          class="auth-submit"
        >
          {{ isEdit ? 'Sačuvaj promjene' : 'Objavi bazen' }}
        </button>
      </form>
    </div>

    <div
      v-if="showCityDropdown"
      class="drop-overlay"
      @click="showCityDropdown = false"
    ></div>
  </section>
</template>

<style scoped lang="scss">
.auth {
  padding: 16px;

  &-card {
    width: 100%;
    max-width: 800px;
    border-radius: 16px;
    justify-self: center;
  }

  &-form {
    display: grid;
    gap: 12px;
  }

  &-field {
    display: grid;
    gap: 6px;
    position: relative;
  }

  &-label {
    font-size: 13px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 800;
  }

  &-labelrow {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-input {
    width: 100%;
    height: 46px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0 14px;
    color: var(--text-color-black);
    font-weight: 600;
    background: #fff;
  }

  &-error {
    color: #a31515;
    font-weight: 700;
    font-size: 13px;
  }

  .has-error .auth-input {
    border-color: #ffb3b3;
    background: #fff4f4;
  }

  &-submit {
    height: 48px;
    border-radius: 999px;
    background: var(--primary-color);
    color: var(--text-color-white);
    font-weight: 900;
    border: 1px solid var(--primary-color);
    box-shadow: 0 6px 18px rgba(0, 178, 255, 0.18);
    cursor: pointer;
  }

  &--mobile {
    .auth {
      &-submit {
        width: 100%;
      }
    }
  }

  &--desktop {
    .auth {
      &-card {
        padding: 14px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 6px 20px rgba(2, 8, 23, 0.06);
      }

      &-submit {
        width: 50%;
        justify-self: center;
      }
    }
  }
}

.req {
  color: #a31515;
  font-weight: 900;
}

.textarea {
  min-height: 110px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.citybtn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
}

.citybtn.is-open {
  background: #fbfdff;
  border-color: #dbeafe;
}

.citydrop {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100%);
  z-index: 20;
  gap: 8px;

  &-search {
    height: 42px;
  }

  &-list {
    max-height: 240px;
    overflow: auto;
    border-radius: 12px;
    background: #fcfeff;
    padding: 6px;
    display: grid;
    box-shadow: 0 10px 24px rgba(2, 8, 23, 0.3);
  }

  &-item {
    height: 40px;
    border-radius: 10px;
    background: #fff;
    color: var(--text-color-black);
    font-weight: 600;
    text-align: left;
    padding: 0 10px;
    cursor: pointer;
  }

  &:hover {
    background: #f3f8ff;
    border-color: #dbeafe;
  }

  .is-selected {
    background: #eaf2ff;
    border-color: #bfdbfe;
  }
}

.drop-overlay {
  position: fixed;
  inset: 0;
  z-index: 19;
  background: transparent;
}

.optcheck {
  display: grid;
  grid-template-columns: 22px 1fr;
  align-items: center;
  gap: 10px;
  background: #fbfdff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  color: var(--text-color-black);
  cursor: pointer;
}

.optcheck input {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 1px solid #9ca3af;
  border-radius: 4px;
  position: relative;
}

.optcheck input:checked {
  border-color: var(--primary-color);
  background: var(--primary-color);
}

.optcheck input:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 0px;
  width: 6px;
  height: 12px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.optcheck-label {
  font-weight: 700;
}

.hint {
  color: #6b7280;
  font-weight: 700;
  font-size: 14px;
}

.imggrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}

.imggrid input[type='file'] {
  display: none;
}

.imgtile {
  position: relative;
  border-radius: 12px;
  height: 100px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &-del {
    position: absolute;
    right: 6px;
    top: 6px;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: #ffffffcc;
    color: var(--text-color-black);
    cursor: pointer;
  }
}

.imgcount {
  font-size: 13px;
  font-weight: 800;
  color: #6b7280;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f3f4f6;
}

.imgadd {
  height: 100px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: var(--text-color-black);

  &-text {
    font-weight: 700;
    font-size: 14px;
  }
}

.imgadd:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
