<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10" :dir="$t('dir')">
    <Toast position="top-right" />
    <ConfirmDialog></ConfirmDialog>

    <div v-if="tabDetails" class="card-fancy mb-8">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 class="text-3xl font-extrabold text-blue-800 flex items-center mb-4 md:mb-0">
          <i class="pi pi-table mr-3 text-4xl"></i>
          {{ tabDetails[labelField] }}
        </h1>
        <div class="text-lg text-gray-600 space-y-1" :class="{ 'text-right': $t('dir') === 'rtl' }">
          <p>
            <strong class="text-blue-600">{{ belongsToLabel }}:</strong> {{ belongsToName }}
          </p>
        </div>
      </div>
    </div>

    <div class="card-fancy mb-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 border-blue-100 flex items-center">
        <i class="pi pi-plus-circle mr-3 text-blue-500"></i>
        {{ $t('custom_tabs.add_new_detail') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="field-group">
          <label class="input-label">
            {{ $t('custom_tabs.name_en') }} <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="newDetail.name_en"
            :placeholder="$t('custom_tabs.enter_name_en')"
            class="w-full"
            :class="{ 'p-invalid': showAddValidationErrors && !newDetail.name_en }"
          />
          <small v-if="showAddValidationErrors && !newDetail.name_en" class="p-error">
            {{ $t('custom_tabs.name_en_required') }}
          </small>
        </div>

        <div class="field-group">
          <label class="input-label">
            {{ $t('custom_tabs.name_ar') }} <span class="text-red-500">*</span>
          </label>
          <InputText
            v-model="newDetail.name_ar"
            :placeholder="$t('custom_tabs.enter_name_ar')"
            class="w-full"
            :class="{ 'p-invalid': showAddValidationErrors && !newDetail.name_ar }"
          />
          <small v-if="showAddValidationErrors && !newDetail.name_ar" class="p-error">
            {{ $t('custom_tabs.name_ar_required') }}
          </small>
        </div>

        <div class="field-group">
          <label class="input-label">
            {{ $t('custom_tabs.type') }} <span class="text-red-500">*</span>
          </label>
          <Dropdown
            v-model="newDetail.type"
            :options="detailTypeOptions"
            optionLabel="label"
            optionValue="value"
            :placeholder="$t('custom_tabs.select_type')"
            class="w-full"
            :class="{ 'p-invalid': showAddValidationErrors && !newDetail.type }"
          />
          <small v-if="showAddValidationErrors && !newDetail.type" class="p-error">
            {{ $t('custom_tabs.type_required') }}
          </small>
        </div>

        <!-- Store/Market Selector (only for Categories) -->
        <div v-if="newDetail.type === 1" class="field-group">
          <label class="input-label">
            {{ $t('custom_tabs.select_store_market') }} <span class="text-red-500">*</span>
          </label>
          <Dropdown
            v-model="newDetail.model_id"
            :options="modelOptions"
            :optionLabel="modelOptionLabel"
            optionValue="id"
            :placeholder="$t('custom_tabs.select_store_or_market')"
            :loading="loadingModels"
            class="w-full"
            :class="{ 'p-invalid': showAddValidationErrors && !newDetail.model_id }"
            @change="fetchCategoriesForModel('new')"
          />
          <small v-if="showAddValidationErrors && !newDetail.model_id" class="p-error">
            {{ $t('custom_tabs.store_market_required') }}
          </small>
        </div>

        <!-- Items MultiSelect -->
        <div class="field-group" :class="{ 'lg:col-span-2': newDetail.type !== 1 }">
          <label class="input-label">
            {{ currentSelectLabel(newDetail.type) }} <span class="text-red-500">*</span>
          </label>
          <MultiSelect
            v-model="newDetail.ids"
            :options="availableItems"
            :optionLabel="multiSelectLabel"
            optionValue="id"
            :placeholder="currentSelectPlaceholder(newDetail.type)"
            :filterPlaceholder="$t('custom_tabs.search') + ' ' + currentSelectLabel(newDetail.type).toLowerCase()"
            :loading="loadingItems"
            filter
            @filter="(e) => onItemFilter('new', e)"
            class="w-full"
            :disabled="!newDetail.type || (newDetail.type === 1 && !newDetail.model_id)"
            :class="{ 'p-invalid': showAddValidationErrors && (!newDetail.ids || newDetail.ids.length === 0) }"
          />
          <small v-if="showAddValidationErrors && (!newDetail.ids || newDetail.ids.length === 0)" class="p-error">
            {{ $t('custom_tabs.items_required') }}
          </small>
        </div>

        <div class="field-group lg:col-span-3">
          <label class="input-label">
            {{ $t('custom_tabs.image') }} <span class="text-red-500">*</span>
          </label>
          <div class="flex items-center space-x-4">
            <FileUpload
              mode="basic"
              accept="image/*"
              :maxFileSize="2000000"
              @select="onImageSelect('new', $event)"
              @remove="newDetail.image = null"
              :chooseLabel="$t('custom_tabs.select_image')"
              class="p-button-sm p-button-rounded"
            />
          </div>
          <small v-if="showAddValidationErrors && !newDetail.image" class="p-error">
            {{ $t('custom_tabs.image_required') }}
          </small>
        </div>
      </div>

      <Button
        :label="$t('custom_tabs.add_detail')"
        icon="pi pi-plus"
        class="mt-8 px-6 py-3 button-primary"
        @click="addDetail"
        :loading="addingDetail"
      />
    </div>

    <!-- Details List -->
    <div class="card-fancy mb-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 border-blue-100 flex items-center">
        <i class="pi pi-list mr-3 text-blue-500"></i>
        {{ $t('custom_tabs.details') }}
      </h2>

      <div v-if="tabDetails?.details?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="detail in tabDetails.details" :key="detail.id" class="detail-card">
          <div v-if="detail.media?.length" class="h-40 overflow-hidden">
            <img :src="detail.media[0].url" :alt="detail.name_en" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
          </div>
          <div class="p-5">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <p class="font-bold text-lg text-gray-900 truncate">{{ detail.name_en }}</p>
                <p class="text-sm text-gray-600 mb-2" :dir="$t('dir') === 'rtl' ? 'rtl' : 'ltr'">{{ detail.name_ar }}</p>
                <p class="text-xs font-medium text-blue-600 bg-blue-50/50 inline-block px-2 py-1 rounded-full">
                  {{ getTypeLabel(detail.type) }} • {{ detail.ids?.length || 0 }} items
                </p>
              </div>
            </div>
            <div class="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <Button icon="pi pi-pencil" class="p-button-rounded p-button-sm p-button-info" @click="openEditDialog(detail)" />
              <Button icon="pi pi-trash" severity="danger" class="p-button-rounded p-button-sm p-button-danger" @click="confirmDeleteDetail(detail.id)" />
            </div>
          </div>
        </div>
      </div>

      <p v-else class="text-center text-gray-500 py-12 text-lg italic border-2 border-dashed border-gray-300 rounded-xl m-4">
        <i class="pi pi-info-circle text-2xl mb-2 block"></i>
        {{ $t('custom_tabs.no_details') }}
      </p>
    </div>

    <!-- Edit Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      :header="$t('custom_tabs.edit_detail')"
      :modal="true"
      class="w-full max-w-5xl"
      :class="{ 'rtl': $t('dir') === 'rtl' }"
      @hide="resetEditForm"
    >
      <div v-if="editingDetail" class="p-fluid">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="field-group">
            <label class="input-label">{{ $t('custom_tabs.name_en') }} <span class="text-red-500">*</span></label>
            <InputText v-model="editingDetail.name_en" class="w-full" :class="{ 'p-invalid': showEditValidationErrors && !editingDetail.name_en }" />
          </div>

          <div class="field-group">
            <label class="input-label">{{ $t('custom_tabs.name_ar') }} <span class="text-red-500">*</span></label>
            <InputText v-model="editingDetail.name_ar" class="w-full" :class="{ 'p-invalid': showEditValidationErrors && !editingDetail.name_ar }" />
          </div>

          <div class="field-group">
            <label class="input-label">{{ $t('custom_tabs.type') }}</label>
            <Dropdown v-model="editingDetail.type" :options="detailTypeOptions" optionLabel="label" optionValue="value" class="w-full bg-gray-100 cursor-not-allowed" disabled />
          </div>

          <div v-if="editingDetail.type === 1" class="field-group">
            <label class="input-label">{{ $t('custom_tabs.select_store_market') }} <span class="text-red-500">*</span></label>
            <Dropdown
              v-model="editingDetail.model_id"
              :options="editModelOptions"
              :optionLabel="modelOptionLabel"
              optionValue="id"
              :placeholder="$t('custom_tabs.select_store_or_market')"
              :loading="editLoadingModels"
              class="w-full"
              @change="fetchCategoriesForModel('edit')"
            />
          </div>

          <div class="field-group" :class="{ 'lg:col-span-2': editingDetail.type !== 1 }">
            <label class="input-label">{{ currentSelectLabel(editingDetail.type) }} <span class="text-red-500">*</span></label>
            <MultiSelect
              v-model="editingDetail.ids"
              :options="editAvailableItems"
              :optionLabel="multiSelectLabel"
              optionValue="id"
              :placeholder="currentSelectPlaceholder(editingDetail.type)"
              :loading="editLoadingItems"
              filter
              @filter="(e) => onItemFilter('edit', e)"
              class="w-full"
              :disabled="editingDetail.type === 1 && !editingDetail.model_id"
            />
          </div>

          <div class="field-group lg:col-span-3">
            <label class="input-label">{{ $t('custom_tabs.image') }} ({{ $t('custom_tabs.optional_reupload') }})</label>
            <div class="flex items-center space-x-4">
              <FileUpload
                mode="basic"
                accept="image/*"
                :maxFileSize="2000000"
                @select="onImageSelect('edit', $event)"
                @remove="editingDetail.newImage = null"
                :chooseLabel="editingDetail.newImage ? $t('custom_tabs.change_image') : $t('custom_tabs.select_new_image')"
                class="p-button-sm p-button-rounded p-button-secondary"
              />
            </div>
            <small class="text-xs text-gray-500 mt-1">{{ $t('custom_tabs.leave_empty_to_keep') }}</small>
          </div>
        </div>
      </div>

      <template #footer>
        <Button :label="$t('custom_tabs.cancel')" icon="pi pi-times" class="p-button-text" @click="showEditDialog = false" />
        <Button :label="$t('custom_tabs.save')" icon="pi pi-check" class="button-primary" @click="updateDetail" :loading="updatingDetail" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { debounce } from 'lodash';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();
const { t, locale } = useI18n();

const tabDetails = ref(null);

// Add Form
const newDetail = ref({
  custom_tab_id: route.params.id,
  name_en: '',
  name_ar: '',
  type: null,
  model_id: null,
  ids: [],
  image: null,
});
const availableItems = ref([]);
const modelOptions = ref([]);
const loadingItems = ref(false);
const loadingModels = ref(false);
const addingDetail = ref(false);
const showAddValidationErrors = ref(false);

// Edit Form
const showEditDialog = ref(false);
const editingDetail = ref(null);
const editAvailableItems = ref([]);
const editModelOptions = ref([]);
const editLoadingItems = ref(false);
const editLoadingModels = ref(false);
const updatingDetail = ref(false);
const showEditValidationErrors = ref(false);

const itemSearchQuery = ref({ new: '', edit: '' });

const appLanguage = computed(() => locale.value);
const labelField = computed(() => (appLanguage.value === 'en' ? 'name_en' : 'name_ar'));
const multiSelectLabel = computed(() => labelField.value);

// Dynamic label for Store/Market dropdown
const modelOptionLabel = computed(() => (item) => {
  const name = item[labelField.value] || item.name_en;
  const typeLabel = item.type === 'store' ? t('custom_tabs.store') : t('custom_tabs.market');
  return `${name} (${typeLabel})`;
});

const belongsToLabel = computed(() => {
  const map = { store: t('custom_tabs.store'), category: t('custom_tabs.category'), market: t('custom_tabs.market') };
  return map[tabDetails.value?.belongs_to] || t('custom_tabs.unknown');
});

const belongsToName = computed(() => {
  const entity = tabDetails.value?.model;
  return entity ? entity[labelField.value] || entity.name || '' : '';
});

const detailTypeOptions = [
  { label: t('custom_tabs.categories'), value: 1 },
  { label: t('custom_tabs.products'), value: 2 },
  { label: t('brands'), value: 3 },
];

const currentSelectLabel = (type) => {
  if (!type) return t('custom_tabs.select_items');
  const map = {
    1: t('custom_tabs.select_categories'),
    2: t('custom_tabs.select_products'),
    3: t('custom_tabs.select_brands'),
  };
  return map[type];
};

const currentSelectPlaceholder = (type) => currentSelectLabel(type);

const getTypeLabel = (type) => {
  const map = {
    '1': t('custom_tabs.category'),
    '2': t('custom_tabs.product'),
    '3': t('custom_tabs.brand'),
  };
  return map[String(type)] || t('custom_tabs.unknown');
};

const isAddFormValid = computed(() => {
  const base = newDetail.value.name_en.trim() && newDetail.value.name_ar.trim() && newDetail.value.type && newDetail.value.image && newDetail.value.ids.length > 0;
  return newDetail.value.type === 1 ? base && newDetail.value.model_id : base;
});

const isEditFormValid = computed(() => {
  if (!editingDetail.value) return false;
  const base = editingDetail.value.name_en.trim() && editingDetail.value.name_ar.trim() && editingDetail.value.ids.length > 0;
  return editingDetail.value.type === 1 ? base && editingDetail.value.model_id : base;
});

// Fetch Stores & Markets
const fetchModels = async (formType = 'new') => {
  const loadingRef = formType === 'new' ? loadingModels : editLoadingModels;
  const optionsRef = formType === 'new' ? modelOptions : editModelOptions;

  loadingRef.value = true;
  try {
    const { data } = await axios.get('/api/custom-tab-details/get/markets-stores');
    if (data.is_success) {
      optionsRef.value = data.data.map(item => ({
        ...item,
        // Ensure fallback
        name_en: item.name_en || '',
        name_ar: item.name_ar || '',
      }));
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('custom_tabs.models_load_failed'), life: 3000 });
    optionsRef.value = [];
  } finally {
    loadingRef.value = false;
  }
};

// Fetch categories for selected model
const fetchCategoriesForModel = async (formType) => {
  const detail = formType === 'new' ? newDetail.value : editingDetail.value;
  const itemsRef = formType === 'new' ? availableItems : editAvailableItems;
  const loadingRef = formType === 'new' ? loadingItems : editLoadingItems;

  if (!detail.model_id || detail.type !== 1) {
    itemsRef.value = [];
    return;
  }

  loadingRef.value = true;
  try {
    const model = (formType === 'new' ? modelOptions : editModelOptions).value.find(m => m.id === detail.model_id);
    if (!model) throw new Error('Model not found');

    const typeSlug = model.type; // API expects 'store' or 'market' directly

    const { data } = await axios.get(`/api/custom-tab-details/get/model-categories/${typeSlug}/${detail.model_id}`);
    itemsRef.value = data.data || [];
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('custom_tabs.categories_load_failed'), life: 3000 });
    itemsRef.value = [];
  } finally {
    loadingRef.value = false;
  }
};

// Fetch products or brands
const fetchItemsByType = async (type, query, formType) => {
  if (type === 1) return;

  const itemsRef = formType === 'new' ? availableItems : editAvailableItems;
  const loadingRef = formType === 'new' ? loadingItems : editLoadingItems;

  const endpoints = { '2': '/api/product', '3': '/api/brand' };

  loadingRef.value = true;
  try {
    const { data } = await axios.get(endpoints[type], {
      params: { search: query || undefined, per_page: 50 },
    });
    itemsRef.value = data.data?.data || data.data || [];
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('custom_tabs.items_load_failed'), life: 3000 });
  } finally {
    loadingRef.value = false;
  }
};

const debouncedFetchItemsNew = debounce(() => fetchItemsByType(newDetail.value.type, itemSearchQuery.value.new, 'new'), 400);
const debouncedFetchItemsEdit = debounce(() => fetchItemsByType(editingDetail.value?.type, itemSearchQuery.value.edit, 'edit'), 400);

const onItemFilter = (formType, e) => {
  if (formType === 'new') {
    itemSearchQuery.value.new = e.value;
    debouncedFetchItemsNew();
  } else if (formType === 'edit') {
    itemSearchQuery.value.edit = e.value;
    debouncedFetchItemsEdit();
  }
};

// Watch type change
watch(() => newDetail.value.type, (newType) => {
  newDetail.value.ids = [];
  newDetail.value.model_id = null;
  availableItems.value = [];
  itemSearchQuery.value.new = '';

  if (newType === 1) {
    fetchModels('new');
  } else if (newType) {
    fetchItemsByType(newType, '', 'new');
  }
});

const fetchDetails = async () => {
  try {
    const { data } = await axios.get(`/api/custom-tabs/${route.params.id}`);
    if (data.is_success && data.data) {
      data.data.details = data.data.details.map(d => ({
        ...d,
        type: Number(d.type),
        ids: d.ids || [],
      }));
      tabDetails.value = data.data;
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('custom_tabs.details_load_failed'), life: 3000 });
  }
};

const onImageSelect = (type, event) => {
  const file = event.files[0];
  if (!file) return;
  if (type === 'new') newDetail.value.image = file;
  else editingDetail.value.newImage = file;
};

const addDetail = async () => {
  showAddValidationErrors.value = true;
  if (!isAddFormValid.value) {
    toast.add({ severity: 'warn', summary: t('validation'), detail: t('custom_tabs.fill_all_fields'), life: 4000 });
    return;
  }

  addingDetail.value = true;
  const formData = new FormData();
  formData.append('custom_tab_id', newDetail.value.custom_tab_id);
  formData.append('name_en', newDetail.value.name_en);
  formData.append('name_ar', newDetail.value.name_ar);
  formData.append('type', newDetail.value.type);
  formData.append('image', newDetail.value.image);
  if (newDetail.value.type === 1) formData.append('model_id', newDetail.value.model_id);
  newDetail.value.ids.forEach((id, i) => formData.append(`ids[${i}]`, id));

  try {
    await axios.post('/api/custom-tab-details', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.add({ severity: 'success', summary: t('success'), detail: t('custom_tabs.detail_added'), life: 3000 });
    resetNewForm();
    await fetchDetails();
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: err.response?.data?.message || t('custom_tabs.add_failed'), life: 5000 });
  } finally {
    addingDetail.value = false;
  }
};

const openEditDialog = async (detail) => {
  editingDetail.value = {
    ...detail,
    ids: detail.ids || [],
    model_id: detail.model_id || null,
    newImage: null,
  };

  if (detail.type === 1) {
    await fetchModels('edit');
    if (editingDetail.value.model_id) {
      await fetchCategoriesForModel('edit');
    }
  } else {
    await fetchItemsByType(detail.type, '', 'edit');
  }

  showEditDialog.value = true;
};

const updateDetail = async () => {
  showEditValidationErrors.value = true;
  if (!isEditFormValid.value) {
    toast.add({ severity: 'warn', summary: t('validation'), detail: t('custom_tabs.fill_all_fields'), life: 4000 });
    return;
  }

  updatingDetail.value = true;
  const formData = new FormData();
  formData.append('_method', 'PUT');
  formData.append('name_en', editingDetail.value.name_en);
  formData.append('name_ar', editingDetail.value.name_ar);
  formData.append('type', editingDetail.value.type);
  formData.append('custom_tab_id', newDetail.value.custom_tab_id);
  if (editingDetail.value.newImage) formData.append('image', editingDetail.value.newImage);
  if (editingDetail.value.type === 1) formData.append('model_id', editingDetail.value.model_id);
  editingDetail.value.ids.forEach((id, i) => formData.append(`ids[${i}]`, id));

  try {
    await axios.post(`/api/custom-tab-details/${editingDetail.value.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.add({ severity: 'success', summary: t('success'), detail: t('custom_tabs.detail_updated'), life: 3000 });
    showEditDialog.value = false;
    resetEditForm();
    await fetchDetails();
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: err.response?.data?.message || t('custom_tabs.update_failed'), life: 5000 });
  } finally {
    updatingDetail.value = false;
  }
};

const confirmDeleteDetail = (id) => {
  confirm.require({
    message: t('custom_tabs.confirm_delete_message'),
    header: t('custom_tabs.confirm_delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteDetail(id),
  });
};

const deleteDetail = async (id) => {
  try {
    await axios.delete(`/api/custom-tab-details/${id}`);
    toast.add({ severity: 'success', summary: t('success'), detail: t('custom_tabs.detail_deleted'), life: 3000 });
    await fetchDetails();
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: err.response?.data?.message || t('custom_tabs.delete_failed'), life: 5000 });
  }
};

const resetNewForm = () => {
  newDetail.value = {
    custom_tab_id: route.params.id,
    name_en: '', name_ar: '', type: null, model_id: null, ids: [], image: null,
  };
  availableItems.value = [];
  modelOptions.value = [];
  showAddValidationErrors.value = false;
};

const resetEditForm = () => {
  editingDetail.value = null;
  editAvailableItems.value = [];
  editModelOptions.value = [];
  showEditValidationErrors.value = false;
};

onMounted(() => {
  fetchDetails();
});
</script>

<style scoped>
.card-fancy {
  @apply bg-white p-6 lg:p-8 rounded-2xl shadow-xl transition-all duration-500 transform hover:shadow-2xl hover:scale-[1.005];
}
.field-group { @apply space-y-2; }
.input-label { @apply block text-sm font-semibold text-gray-700; }
.button-primary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02];
}
.detail-card {
  @apply border border-gray-100 rounded-xl bg-white shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1;
}
.p-error { @apply text-red-600 text-sm block mt-1 font-medium; }
.rtl .input-label { @apply text-right; }
.rtl .p-placeholder, .rtl .p-inputtext { text-align: right; }
</style>
