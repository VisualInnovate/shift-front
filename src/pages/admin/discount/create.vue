<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import moment from 'moment';

// ──────────────────────────────────────────────────────────────
//  i18n / language helpers
// ──────────────────────────────────────────────────────────────
const currentLanguage = computed(() => localStorage.getItem('appLang') || 'en');
const labelField = computed(() => currentLanguage.value === 'en' ? 'name_en' : 'name_ar');
const isRTL = computed(() => currentLanguage.value === 'ar');

const router = useRouter();
const toast = useToast();
const { t } = useI18n();

// ──────────────────────────────────────────────────────────────
//  Form state
// ──────────────────────────────────────────────────────────────
const loading = ref(false);
const errors = ref({});

const discountData = ref({
  product_id: null,     // selected product
  variant_id: null,     // selected variant (optional)
  discount_type: 1,     // fixed amount
  discount_value: null,
  expires_at: null
});

// ──────────────────────────────────────────────────────────────
//  Products & Variants
// ──────────────────────────────────────────────────────────────
const products = ref([]);
const productSearch = ref('');
const productLoading = ref(false);

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === discountData.value.product_id);
});

const variants = computed(() => {
  if (!selectedProduct.value || !selectedProduct.value.has_variants) return [];
  return selectedProduct.value.variants || [];
});

const showVariantDropdown = computed(() => {
  return selectedProduct.value && selectedProduct.value.has_variants && variants.value.length > 0;
});

// Reset variant when product changes
watch(() => discountData.value.product_id, () => {
  discountData.value.variant_id = null;
});

/** Debounce helper */
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** Fetch products */
const fetchProducts = async () => {
  productLoading.value = true;
  try {
    const { data } = await axios.get('/api/discount/create/data', {
      params: {
        ...(productSearch.value ? { search: productSearch.value } : {})
      }
    });
    products.value = data.data.data ?? [];
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: t('error.productLoad'),
      life: 3000
    });
  } finally {
    productLoading.value = false;
  }
};

const debouncedFetch = debounce(fetchProducts, 300);

const onProductFilter = (event) => {
  productSearch.value = event.value ?? '';
  debouncedFetch();
};

onMounted(() => {
  fetchProducts();
});

watch(currentLanguage, () => {
  // Labels update automatically via computed labelField
});

/* -----------------------------------------------------------------
   Validation
   ----------------------------------------------------------------- */
class Validation {
  constructor(errorsRef, t) {
    this.errors = errorsRef;
    this.t = t;
  }

  required(value, fieldName) {
    if (value === null || value === undefined) {
      this.errors.value[fieldName] = this.t('validation.requiredFields', {
        field: this.t(`discount.${fieldName}`)
      });
      return false;
    }
    return true;
  }

  numericRange(value, fieldName, min) {
    if (value === null || value === undefined || isNaN(value)) {
      this.errors.value[fieldName] = this.t('validation.requiredFields', {
        field: this.t(`discount.${fieldName}`)
      });
      return false;
    }
    if (min !== undefined && value < min) {
      this.errors.value[fieldName] = this.t('validation.minValue', {
        field: this.t(`discount.${fieldName}`),
        min
      });
      return false;
    }
    return true;
  }

  isValid() {
    return Object.keys(this.errors.value).length === 0;
  }
}

/* -----------------------------------------------------------------
   Submit
   ----------------------------------------------------------------- */
const submitForm = async () => {
  errors.value = {};
  const validator = new Validation(errors, t);

  validator.required(discountData.value.product_id, 'select_product');

  // Variant is required if product has variants
  if (selectedProduct.value && selectedProduct.value.has_variants) {
    validator.required(discountData.value.variant_id, 'select_variant');
  }

  validator.numericRange(discountData.value.discount_value, 'discount_value', 0);
  validator.required(discountData.value.expires_at, 'expiration_date');

  if (!validator.isValid()) {
    const msg = Object.values(errors.value).join(', ');
    toast.add({ severity: 'error', summary: t('error'), detail: msg, life: 3000 });
    return;
  }

  loading.value = true;

  // Determine if we're discounting a variant or the whole product
  const isVariantSelected = discountData.value.variant_id !== null;
  const finalId = isVariantSelected ? discountData.value.variant_id : discountData.value.product_id;

  const payload = {
    type: isVariantSelected ? 'variant' : 'product',
    ids: [finalId],
    discount_type: discountData.value.discount_type,
    discount_value: discountData.value.discount_value,
    expires_at: moment(discountData.value.expires_at).format('YYYY-MM-DD')
  };

  try {
    await axios.post('/api/discount', payload);
    toast.add({
      severity: 'success',
      summary: t('success'),
      detail: t('discount.created_successfully'),
      life: 3000
    });
    router.push({ name: 'discount' });
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: err.response?.data?.message || t('error.createError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    v-can="'create discounts'"
    class="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
      {{ t('discount.create_new_discount') }}
    </h1>

    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Hidden fixed field -->
      <input type="hidden" v-model="discountData.discount_type" />

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Product Dropdown (Required) -->
        <div class="space-y-2">
          <label for="product_id" class="block text-sm font-medium text-gray-700">
            {{ t('discount.select_product') }} <span class="text-red-500">*</span>
          </label>

          <Dropdown
            id="product_id"
            v-model="discountData.product_id"
            :options="products"
            :optionLabel="labelField"
            optionValue="id"
            filter
            :filterPlaceholder="t('discount.searchProducts')"
            :placeholder="t('discount.searchProducts')"
            :loading="productLoading"
            class="w-full"
            :class="{ 'p-invalid': errors.select_product }"
            @filter="onProductFilter"
          />
          <small v-if="errors.select_product" class="p-error">
            {{ errors.select_product }}
          </small>
        </div>

        <!-- Variant Dropdown (Required if product has variants) -->
        <div v-if="showVariantDropdown" class="space-y-2">
          <label for="variant_id" class="block text-sm font-medium text-gray-700">
            {{ t('discount.select_variant') }} <span class="text-red-500">*</span>
          </label>

          <Dropdown
            id="variant_id"
            v-model="discountData.variant_id"
            :options="variants"
            optionLabel="sku"
            optionValue="id"
            :placeholder="t('discount.select_variant')"
            class="w-full"
            :class="{ 'p-invalid': errors.select_variant }"
          />
          <small v-if="errors.select_variant" class="p-error">
            {{ errors.select_variant }}
          </small>
        </div>

        <!-- Discount Value -->
        <div class="space-y-2">
          <label for="discount_value" class="block text-sm font-medium text-gray-700">
            {{ t('discount.discount_value') }} ({{ t('discount.fixed_amount') }})
            <span class="text-red-500">*</span>
          </label>

          <InputNumber
            id="discount_value"
            v-model="discountData.discount_value"
            mode="decimal"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            :min="0"
            :placeholder="t('discount.enter_discount_value')"
            class="w-full"
            :class="{ 'p-invalid': errors.discount_value }"
          />
          <small v-if="errors.discount_value" class="p-error">
            {{ errors.discount_value }}
          </small>
        </div>

        <!-- Expiration Date -->
        <div class="space-y-2">
          <label for="expires_at" class="block text-sm font-medium text-gray-700">
            {{ t('discount.expiration_date') }} <span class="text-red-500">*</span>
          </label>

          <Calendar
            id="expires_at"
            v-model="discountData.expires_at"
            :minDate="new Date()"
            dateFormat="yy-mm-dd"
            :placeholder="t('discount.select_expiration_date')"
            class="w-full"
            :class="{ 'p-invalid': errors.expiration_date }"
            showIcon
          />
          <small v-if="errors.expiration_date" class="p-error">
            {{ errors.expiration_date }}
          </small>
        </div>
      </div>

      <!-- Buttons -->
      <div class="pt-6 flex justify-center gap-6">
        <Button
          type="button"
          :label="t('discount.cancel')"
          icon="pi pi-times"
          @click="router.go(-1)"
          severity="secondary"
          :disabled="loading"
        />
        <Button
          type="submit"
          :label="t('discount.create_discount')"
          icon="pi pi-plus"
          :loading="loading"
          class="px-8"
        />
      </div>
    </form>

    <Toast />
  </div>
</template>

<style scoped>
[dir="rtl"] .gap-6 > * {
  margin-right: 1.5rem;
  margin-left: 0;
}

.p-invalid {
  @apply border-red-500 !important;
}

.p-error {
  @apply text-red-600 text-xs block mt-1;
}

.text-gray-400 {
  font-size: 0.875rem;
}
</style>
