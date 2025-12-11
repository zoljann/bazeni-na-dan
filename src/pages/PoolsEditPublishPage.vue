<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSortable } from '@vueuse/integrations/useSortable';
import isMobile from 'is-mobile';
import Navigation from '../components/Navigation.vue';
import { useUserStore } from '../stores/user';
import { notificationsStore } from '../stores/notifications';
import { usePoolsStore } from '../stores/pools';
import { createPool, getPoolById, updatePool } from '../api';
import AvailabilityCalendar from '../components/utility/AvailabilityCalendar.vue';
import allCities from '../helpers/bih-cities.json';
import type { Pool } from 'src/types';
import TitleBar from '.././components/TitleBar.vue';
import ImagePreview from '../components/ImagePreview.vue';
import BaseLoader from '../components/utility/BaseLoader.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const poolsStore = usePoolsStore();
const notifications = notificationsStore();
const isMobileView = isMobile();
const imgInputRef = ref<HTMLInputElement>();
const showImagePreview = ref(false);
const previewStartIndex = ref(0);
const imgGridRef = ref<HTMLElement>();
const showCityDropdown = ref(false);
const cityQuery = ref('');
const isLoadingPool = ref(false);
const isSubmitting = ref(false);
const form = ref({
  title: '',
  city: '',
  capacity: '',
  pricePerDay: '',
  description: '',
  rulesDescription: '',
  checkIn: '',
  checkOut: '',
  filters: {
    petsAllowed: false,
    heated: false,
    partyAllowed: false,
    wiFi: false,
    bbq: false,
    parking: false,
    summerKitchen: false
  },
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
  rulesDescription?: string;
  checkIn?: string;
  checkOut?: string;
  images?: string;
}>({});
const fieldRefs = ref<Record<string, HTMLElement | null>>({
  title: null,
  city: null,
  capacity: null,
  pricePerDay: null,
  description: null,
  rulesDescription: null,
  checkIn: null,
  checkOut: null,
  images: null
});

const filteredCities = computed(() => {
  const q = cityQuery.value.trim().toLowerCase();
  return q ? allCities.filter((c: string) => c.toLowerCase().includes(q)) : allCities;
});
const imagesRef = computed({
  get: () => form.value.images,
  set: (v: string[]) => {
    form.value.images = v;
  }
});
const bazenId = computed(() => (route.query.bazenId ? String(route.query.bazenId) : ''));
const isEdit = computed(() => !!bazenId.value);
const pageTitle = computed(() => (isEdit.value ? 'Uredi bazen' : 'Objavi bazen'));
const pageClasses = computed(() => ({ [`auth--${isMobileView ? 'mobile' : 'desktop'}`]: true }));

const pickCity = (c: string) => {
  form.value.city = c;
  showCityDropdown.value = false;
};
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
  return new Promise<string | null>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(f);

    img.onload = () => {
      const maxWidth = 1600;
      const maxHeight = 1600;

      let { width, height } = img;

      const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
      width = width * ratio;
      height = height * ratio;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = f.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = 0.75;

      const dataUrl = canvas.toDataURL(mimeType, quality);

      URL.revokeObjectURL(url);
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}
const removeImage = (i: number) => form.value.images.splice(i, 1);
const openImagePreview = (index: number) => {
  previewStartIndex.value = index;
  showImagePreview.value = true;
};
const validate = () => {
  errors.value = {};
  const t = form.value.title.trim();
  if (t.length < 3 || t.length > 40) errors.value.title = 'Unesi ispravan naslov (3-40 karaktera).';
  if (!form.value.city || !allCities.includes(form.value.city))
    errors.value.city = 'Odaberite grad iz liste.';

  const rawCap = form.value.capacity.trim();
  if (!rawCap) {
    errors.value.capacity = 'Unesite maksimalni kapacitet gostiju.';
  } else if (!/^\d+$/.test(rawCap)) {
    errors.value.capacity = 'Dozvoljene su samo cifre.';
  } else {
    const cap = Number(rawCap);
    if (cap < 1 || cap > 100) {
      errors.value.capacity = 'Unesite maksimalni kapacitet gostiju od 1 do 100.';
    }
  }

  const rawPrice = form.value.pricePerDay.trim();
  if (rawPrice) {
    if (!/^\d+$/.test(rawPrice)) {
      errors.value.pricePerDay = 'Dozvoljene su samo cifre.';
    } else {
      const price = Number(rawPrice);
      if (price < 1 || price > 10000) {
        errors.value.pricePerDay = 'Unesite iznos 1 do 10000 ili ostavite prazno.';
      }
    }
  }

  const d = form.value.description.trim();
  if (!d || d.length > 800) {
    errors.value.description = 'Opis može biti od 1 do 800 karaktera.';
  }

  const rules = form.value.rulesDescription.trim();
  if (rules && rules.length > 650) {
    errors.value.rulesDescription = 'Pravila bazena mogu imati do 650 karaktera.';
  }

  const rawCheckIn = form.value.checkIn.trim();
  if (rawCheckIn) {
    if (!/^\d+$/.test(rawCheckIn)) {
      errors.value.checkIn = 'Dozvoljene su samo cifre.';
    } else {
      const ci = Number(rawCheckIn);
      if (ci < 1 || ci > 24) {
        errors.value.checkIn = 'Unesite sat od 1 do 24 ili ostavite prazno.';
      }
    }
  }

  const rawCheckOut = form.value.checkOut.trim();
  if (rawCheckOut) {
    if (!/^\d+$/.test(rawCheckOut)) {
      errors.value.checkOut = 'Dozvoljene su samo cifre.';
    } else {
      const co = Number(rawCheckOut);
      if (co < 1 || co > 24) {
        errors.value.checkOut = 'Unesite sat od 1 do 24 ili ostavite prazno.';
      }
    }
  }

  if (form.value.images.length < 1 || form.value.images.length > 7)
    errors.value.images = 'Dodajte minimalno 1 a maksimalno 7 slika.';

  const isValid = Object.keys(errors.value).length === 0;
  if (!isValid) focusFirstError();
  return isValid;
};
const fillFromPool = (p: Pool) => {
  form.value.title = p.title || '';
  form.value.city = p.city || '';
  form.value.capacity = String(p.capacity || '');
  form.value.pricePerDay = p.pricePerDay !== undefined ? String(p.pricePerDay) : '';
  form.value.description = p.description || '';
  form.value.rulesDescription = p.rulesDescription || '';
  form.value.checkIn = p.checkIn !== undefined && p.checkIn !== null ? String(p.checkIn) : '';
  form.value.checkOut = p.checkOut !== undefined && p.checkOut !== null ? String(p.checkOut) : '';
  form.value.filters = {
    heated: !!p?.filters?.heated,
    petsAllowed: !!p?.filters?.petsAllowed,
    partyAllowed: !!p?.filters?.partyAllowed,
    wiFi: !!p.filters?.wiFi,
    bbq: !!p.filters?.bbq,
    parking: !!p.filters?.parking,
    summerKitchen: !!p.filters?.summerKitchen
  };
  form.value.images = Array.isArray(p.images) ? p.images.slice(0, 7) : [];
  const loadedBusy = Array.isArray(p.busyDays) ? (p.busyDays as string[]) : [];
  form.value.enableAvailability = loadedBusy.length > 0;
  form.value.busyDays = loadedBusy;
};
const submit = async () => {
  if (!validate()) return;
  if (isSubmitting.value) return;
  const payload = {
    pool: {
      id: isEdit.value ? bazenId.value : undefined,
      title: form.value.title.trim(),
      city: form.value.city,
      capacity: Number(form.value.capacity),
      images: form.value.images.slice(0, 7),
      pricePerDay: form.value.pricePerDay ? Number(form.value.pricePerDay) : undefined,
      description: form.value.description.trim() || undefined,
      rulesDescription: form.value.rulesDescription.trim() || undefined,
      checkIn: form.value.checkIn ? Number(form.value.checkIn) : undefined,
      checkOut: form.value.checkOut ? Number(form.value.checkOut) : undefined,
      filters: { ...form.value.filters },
      busyDays: form.value.enableAvailability ? [...form.value.busyDays].sort() : undefined
    }
  };
  isSubmitting.value = true;
  try {
    const res = isEdit.value ? await updatePool(bazenId.value, payload) : await createPool(payload);

    if (res.state === 'error') {
      notifications.addNotification('Spremanje nije uspjelo.', 'error');
      return;
    }

    if (!isEdit.value) {
      userStore.incrementPublishedPoolsCount();
    }

    notifications.addNotification(
      isEdit.value ? 'Bazen ažuriran.' : 'Bazen je objavljen i vidljiv narednih mjesec dana.',
      'success'
    );
    router.push({ name: 'PoolsPublishedPage' });
  } catch {
    notifications.addNotification('Nešto je pošlo po krivu, pokušaj ponovo kasnije.', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
const ensureOwnership = (p: Pool) => {
  if (!userStore.user?.id || p.userId !== userStore.user?.id) {
    console.log(userStore.user);
    notifications.addNotification('Nemate dozvolu za uređivanje ovog bazena.', 'error');
    router.replace({ name: 'PoolsHomePage' });
    return false;
  }
  return true;
};
const setFieldRef = (name: string) => (el: any) => {
  fieldRefs.value[name] = el as HTMLElement | null;
};
const focusFirstError = () => {
  const firstKey = Object.keys(errors.value)[0];
  if (!firstKey) return;

  const el = fieldRefs.value[firstKey];
  if (!el) return;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const focusable = el.querySelector('input, textarea, button') as HTMLElement | null;
  (focusable ?? el).focus?.();
};

onMounted(async () => {
  if (!isEdit.value) {
    await nextTick();
    useSortable(imgGridRef, imagesRef, { animation: 150 });
    return;
  }

  isLoadingPool.value = true;
  try {
    const stored = poolsStore.findPoolById(bazenId.value);
    if (stored) {
      if (!ensureOwnership(stored)) return;
      fillFromPool(stored);
    } else {
      const res = await getPoolById(bazenId.value);
      if (res.state === 'success') {
        if (!ensureOwnership(res.pool)) return;
        fillFromPool(res.pool);
      } else {
        notifications.addNotification('Došlo je do greške.', 'error');
        router.replace({ name: 'PoolsHomePage' });
        return;
      }
    }
  } finally {
    isLoadingPool.value = false;
  }

  await nextTick();
  useSortable(imgGridRef, imagesRef, { animation: 150 });
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
      <BaseLoader
        v-if="isEdit && isLoadingPool"
        text="Učitavanje bazena.."
        :fullHeight="true"
      />

      <form
        v-else
        class="auth-form"
        @submit.prevent="submit"
        novalidate
      >
        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.title }"
          :ref="setFieldRef('title')"
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
          :ref="setFieldRef('city')"
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
          :ref="setFieldRef('capacity')"
        >
          <label
            for="capacity"
            class="auth-label"
            >Maksimalni kapacitet gostiju <span class="req">*</span></label
          >
          <input
            id="capacity"
            v-model="form.capacity"
            class="auth-input"
            inputmode="numeric"
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
          :ref="setFieldRef('pricePerDay')"
        >
          <label
            for="price"
            class="auth-label"
            >Cijena po danu (opcionalno)</label
          >
          <input
            id="price"
            v-model="form.pricePerDay"
            class="auth-input"
            inputmode="numeric"
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
          :ref="setFieldRef('description')"
        >
          <label
            for="desc"
            class="auth-label"
          >
            Opis <span class="req">*</span>
          </label>
          <textarea
            id="desc"
            v-model.trim="form.description"
            class="auth-input textarea"
            maxlength="800"
          />
          <p
            v-if="errors.description"
            class="auth-error"
          >
            {{ errors.description }}
          </p>
        </div>

        <div
          class="auth-field"
          :class="{ 'has-error': !!errors.rulesDescription }"
          :ref="setFieldRef('rulesDescription')"
        >
          <label
            for="rules"
            class="auth-label"
          >
            Pravila bazena (opcionalno)
          </label>
          <textarea
            id="rules"
            v-model.trim="form.rulesDescription"
            class="auth-input textarea"
            maxlength="650"
          />
          <p
            v-if="errors.rulesDescription"
            class="auth-error"
          >
            {{ errors.rulesDescription }}
          </p>
        </div>

        <div class="auth-field auth-field--row">
          <div
            class="auth-field-inner"
            :class="{ 'has-error': !!errors.checkIn }"
            :ref="setFieldRef('checkIn')"
          >
            <label
              for="checkin"
              class="auth-label"
            >
              Prijava u (opcionalno)
            </label>
            <select
              id="checkin"
              v-model="form.checkIn"
              class="auth-input"
            >
              <option value="">Odaberi</option>
              <option
                v-for="h in 24"
                :key="h"
                :value="String(h)"
              >
                {{ h }}:00
              </option>
            </select>
            <p
              v-if="errors.checkIn"
              class="auth-error"
            >
              {{ errors.checkIn }}
            </p>
          </div>

          <div
            class="auth-field-inner"
            :class="{ 'has-error': !!errors.checkOut }"
            :ref="setFieldRef('checkOut')"
          >
            <label
              for="checkout"
              class="auth-label"
            >
              Odjava u (opcionalno)
            </label>
            <select
              id="checkout"
              v-model="form.checkOut"
              class="auth-input"
            >
              <option value="">Odaberi</option>
              <option
                v-for="h in 24"
                :key="h"
                :value="String(h)"
              >
                {{ h }}:00
              </option>
            </select>
            <p
              v-if="errors.checkOut"
              class="auth-error"
            >
              {{ errors.checkOut }}
            </p>
          </div>
        </div>

        <div class="auth-field">
          <span class="auth-label">Odaberi mogućnosti</span>

          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.wiFi"
            />
            <span class="optcheck-label">📶 Wi-Fi dostupan</span>
          </label>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.bbq"
            />
            <span class="optcheck-label">🍖 Roštilj na raspolaganju</span>
          </label>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.partyAllowed"
            />
            <span class="optcheck-label">🎉 Dozvoljene zabave</span>
          </label>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.parking"
            />
            <span class="optcheck-label">🚗 Privatni parking</span>
          </label>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.summerKitchen"
            />
            <span class="optcheck-label">🍽️ Ljetna kuhinja uz bazen</span>
          </label>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.heated"
            />
            <span class="optcheck-label">🔥 Grijani bazen</span>
          </label>
          <label class="optcheck">
            <input
              type="checkbox"
              v-model="form.filters.petsAllowed"
            />
            <span class="optcheck-label">🐶 Dozvoljeni ljubimci</span>
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
            Označite zauzete datume, u svakom momentu ih možete uređivati
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
          :ref="setFieldRef('images')"
        >
          <div class="auth-labelrow">
            <label class="auth-label">Slike <span class="req">*</span></label>
            <span class="imgcount">{{ form.images.length }}/7</span>
          </div>

          <div class="hint">
            Povucite i pustite slike da promijenite raspored, prva slika je naslovna
          </div>

          <div
            class="imggrid"
            ref="imgGridRef"
          >
            <div
              v-for="(img, i) in form.images"
              :key="i"
              class="imgtile"
            >
              <img
                :src="img"
                alt="slika"
                @click="openImagePreview(i)"
              />
              <button
                type="button"
                class="imgtile-del"
                @click.stop="removeImage(i)"
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
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting">Spremanje...</span>
          <span v-else>
            {{ isEdit ? 'Sačuvaj promjene' : 'Objavi bazen' }}
          </span>
        </button>
      </form>
    </div>

    <div
      v-if="showCityDropdown"
      class="drop-overlay"
      @click="showCityDropdown = false"
    ></div>

    <ImagePreview
      v-model="showImagePreview"
      :images="form.images"
      :startIndex="previewStartIndex"
    />
  </section>
</template>

<style scoped lang="scss">
.auth {
  padding: 16px;

  &-card {
    width: 100%;
    max-width: 1100px;
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

  &-field--row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 10px;
  }

  &-field-inner {
    display: grid;
    gap: 6px;
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
    transition:
      opacity 120ms ease,
      box-shadow 120ms ease;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      pointer-events: none;
    }
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
      }

      &-submit {
        width: 50%;
        justify-self: center;

        &:hover {
          filter: brightness(0.95);
        }
      }

      &-input:hover {
        background-color: rgb(253, 253, 253);
      }
    }

    .citydrop-item:hover,
    .optcheck:hover,
    .imgadd:hover,
    .imgtile-del:hover {
      background-color: rgb(243, 243, 243);
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
  font-size: 13px;
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
  cursor: pointer;

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
