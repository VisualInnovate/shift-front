<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import moment from 'moment';

// ──────────────────────────────────────────────────────────────
// i18n & Helpers
// ──────────────────────────────────────────────────────────────
const currentLanguage = computed(() => localStorage.getItem('appLang') || 'en');
const labelField = computed(() => currentLanguage.value === 'en' ? 'name_en' : 'name_ar');
const isRTL = computed(() => currentLanguage.value === 'ar');

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const isEdit = computed(() => !!route.params.id);

// ──────────────────────────────────────────────────────────────
// Form State
// ──────────────────────────────────────────────────────────────
const loading = ref(false);
const errors = ref({});

const discountData = ref({
  type: 'product',            // will be 'product' or 'variant' (determined dynamically)
  product_id: null,           // selected product
  variant_id: null,           // selected variant (if applicable)
  discount_type: 1,           // 1 = fixed amount
  discount_value: null,
  expires_at: null
});

// ──────────────────────────────────────────────────────────────
// Products & Variants
// ──────────────────────────────────────────────────────────────
const products = ref([]);
const productSearch = ref('');
const productLoading = ref(false);

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === discountData.value.product_id);
});

const variants = computed(() => {
  return selectedProduct.value?.variants || [];
});

// Watch variants and auto-select first variant if available
watch(variants, (newVariants) => {
  if (newVariants.length > 0 && !discountData.value.variant_id) {
    discountData.value.variant_id = newVariants[0].id;
  } else if (newVariants.length === 0) {
    discountData.value.variant_id = null;
  }
});

const showVariantDropdown = computed(() => {
  return selectedProduct.value && selectedProduct.value.has_variants === true;
});

// Product label with price handling null
const productLabel = (p) => {
  const name = p[labelField.value];
  const price = p.base_price ? p.base_price : 'N/A';
  return `${name} - ${price}`;
};

// Variant label with price handling null
const variantLabel = (v) => {
  const price = v.price ? v.price : 'N/A';
  return `${v.sku} - ${price}`;
};

// Reset variant when product changes
watch(() => discountData.value.product_id, () => {
  discountData.value.variant_id = null;
});

// ──────────────────────────────────────────────────────────────
// Fetch Products (with search)
// ──────────────────────────────────────────────────────────────
const fetchProducts = async () => {
  productLoading.value = true;
  try {
    const { data } = await axios.get('/api/discount/create/data', {
      params: {
        search: productSearch.value || undefined,
        per_page: 100  // Load all products to handle edit mode selection
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

let debounceTimer;

const onProductFilter = (event) => {
  console.log('Product filter event:', event);
  productSearch.value = event.value ?? '';
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchProducts, 300);
};

// ──────────────────────────────────────────────────────────────
// Load Existing Discount (Edit Mode)
// ──────────────────────────────────────────────────────────────
const loadDiscount = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get(`/api/discount/${route.params.id}`);
    const d = data.data;

    // Reset form
    discountData.value = {
      type: d.type, // 'product' or 'variant'
      product_id: null,
      variant_id: null,
      discount_type: d.discount_type,
      discount_value: parseFloat(d.discount_value),
      expires_at: d.expires_at ? new Date(d.expires_at) : null
    };

    if (d.type === 'product' && d.products.length > 0) {
      discountData.value.product_id = d.products[0].id;
    } else if (d.type === 'variant' && d.variants.length > 0) {
      const variant = d.variants[0];
      discountData.value.product_id = variant.product_id;
      discountData.value.variant_id = variant.id;
    }

    // Load all products so the selected one appears
    await fetchProducts();
    console.log( d.type );
    // If still not found, try searching by name
    if ( d.type === 'product' && d.products.length > 0) {
      productSearch.value = d.products[0][labelField.value];
      await fetchProducts();
    } else if ( d.type === 'variant' && d.variants.length > 0) {
      productSearch.value = d.variants[0].product[labelField.value];
      await fetchProducts();
    }

  } catch (error) {
    console.error('Error loading discount:', error);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: error.response?.data?.message || t('error.loadError'),
      life: 3000
    });
    router.push({ name: 'discount' });
  } finally {
    loading.value = false;
  }
};

// ──────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────
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

  numericRange(value, fieldName, min, max = null) {
    if (value === null || isNaN(value)) {
      this.errors.value[fieldName] = this.t('validation.requiredFields', {
        field: this.t(`discount.${fieldName}`)
      });
      return false;
    }
    if (min !== null && value < min) {
      this.errors.value[fieldName] = this.t('validation.minValue', { field: this.t(`discount.${fieldName}`), min });
      return false;
    }
    if (max !== null && value > max) {
      this.errors.value[fieldName] = this.t('validation.maxValue', { field: this.t(`discount.${fieldName}`), max });
      return false;
    }
    return true;
  }

  isValid() {
    return Object.keys(this.errors.value).length === 0;
  }
}

// ──────────────────────────────────────────────────────────────
// Submit (Create / Update)
// ──────────────────────────────────────────────────────────────
const submitForm = async () => {
  errors.value = {};
  const validator = new Validation(errors, t);

  validator.required(discountData.value.product_id, 'select_product');
  validator.required(discountData.value.discount_type, 'discount_method');
  validator.numericRange(discountData.value.discount_value, 'discount_value', 0);
  validator.required(discountData.value.expires_at, 'expiration_date');

  if (!validator.isValid()) {
    const msg = Object.values(errors.value).join(', ');
    toast.add({ severity: 'error', summary: t('error'), detail: msg, life: 3000 });
    return;
  }

  loading.value = true;

  // Determine final type and ID
  const applyToVariant = discountData.value.variant_id !== null;
  const finalType = applyToVariant ? 'variant' : 'product';
  const finalId = applyToVariant ? discountData.value.variant_id : discountData.value.product_id;

  const payload = {
    type: finalType,
    ids: [finalId],
    discount_type: discountData.value.discount_type,
    discount_value: discountData.value.discount_value,
    expires_at: moment(discountData.value.expires_at).format('YYYY-MM-DD')
  };

  try {
    if (isEdit.value) {
      await axios.put(`/api/discount/${route.params.id}`, payload);
      toast.add({ severity: 'success', summary: t('success'), detail: t('discount.updated_successfully'), life: 3000 });
    } else {
      await axios.post('/api/discount', payload);
      toast.add({ severity: 'success', summary: t('success'), detail: t('discount.created_successfully'), life: 3000 });
    }
    router.push({ name: 'discount' });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: err.response?.data?.message || t('error.saveError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

// ──────────────────────────────────────────────────────────────
// Lifecycle
// ──────────────────────────────────────────────────────────────
onMounted(async () => {
  await fetchProducts();
  if (isEdit.value) {
    await loadDiscount();
  }
});
</script>

<template>
  <div
    v-can="'create discounts'"
    class="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg"
    :dir="isRTL ? 'rtl' : 'ltr'"
  >
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
      {{ isEdit ? t('discount.edit_discount') : t('discount.create_new_discount') }}
    </h1>

    <form @submit.prevent="submitForm" class="space-y-8">


      <!-- Product Selection -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ t('discount.select_product') }} <span class="text-red-500">*</span>
        </label>
        <Dropdown
          v-model="discountData.product_id"
          :options="products"
          :optionLabel="productLabel"
          optionValue="id"
          filter
          :filterPlaceholder="t('discount.searchProducts')"
          :placeholder="t('discount.select_product')"
          :loading="productLoading"
          class="w-full"
          :class="{ 'p-invalid': errors.select_product }"
          @filter="onProductFilter"
        />
        <small v-if="errors.select_product" class="p-error">{{ errors.select_product }}</small>
      </div>

      <!-- Variant Selection (if product has variants) -->
      <div v-if="showVariantDropdown" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          {{ t('discount.select_variant') }} <span class="text-gray-500">(اختياري)</span>
        </label>
        {{ discountData.variant_id }}
        <Dropdown
          v-model="discountData.variant_id"
          :options="variants"
          :optionLabel="variantLabel"
          optionValue="id"
          :placeholder="t('discount.apply_to_whole_product')"
          class="w-full"
          clearable
        />
        <small class="text-xs text-gray-600">
          {{ t('discount.variant_hint') || 'اتركه فارغاً لتطبيق الخصم على المنتج بأكمله (جميع المتغيرات)' }}
        </small>
      </div>

      <!-- Discount Value & Expiration Date -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('discount.discount_value') }}
            <span v-if="discountData.discount_type === 1">({{ t('discount.fixed_amount') }})</span>
            <span v-else>(%)</span>
            <span class="text-red-500">*</span>
          </label>
          <InputNumber
            v-model="discountData.discount_value"
            mode="decimal"
            :minFractionDigits="2"
            :maxFractionDigits="2"
            :min="0"
            :max="discountData.discount_type === 2 ? 100 : null"
            :placeholder="t('discount.enter_discount_value')"
            class="w-full"
            :class="{ 'p-invalid': errors.discount_value }"
          />
          <small v-if="errors.discount_value" class="p-error">{{ errors.discount_value }}</small>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('discount.expiration_date') }} <span class="text-red-500">*</span>
          </label>
          <Calendar
            v-model="discountData.expires_at"
            :minDate="new Date()"
            dateFormat="yy-mm-dd"
            :placeholder="t('discount.select_expiration_date')"
            class="w-full"
            showIcon
            :class="{ 'p-invalid': errors.expiration_date }"
          />
          <small v-if="errors.expiration_date" class="p-error">{{ errors.expiration_date }}</small>
        </div>
      </div>

      <!-- Submit Buttons -->
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
          :label="isEdit ? t('discount.update_discount') : t('discount.create_discount')"
          icon="pi pi-check"
          :loading="loading"
        />
      </div>
    </form>

    <Toast />
  </div>
</template>

<style scoped>
.p-invalid {
  @apply border-red-500 !important;
}

.p-error {
  @apply text-red-600 text-xs block mt-1;
}

[dir="rtl"] .gap-6 > * {
  margin-left: 1.5rem;
  margin-right: 0;
}
</style>
