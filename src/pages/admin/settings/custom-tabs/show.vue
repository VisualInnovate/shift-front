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

        <div class="field-group">
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
            :disabled="!newDetail.type"
            :class="{ 'p-invalid': showAddValidationErrors && (!newDetail.ids || newDetail.ids.length === 0) }"
          />
   
        </div>

        <div class="field-group lg:col-span-2">
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

    <div class="card-fancy mb-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b pb-3 border-blue-100 flex items-center">
        <i class="pi pi-list mr-3 text-blue-500"></i>
        {{ $t('custom_tabs.details') }}
      </h2>

      <div v-if="tabDetails?.details?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="detail in tabDetails.details"
          :key="detail.id"
          class="detail-card"
        >
          <div v-if="detail.media?.length" class="h-40 overflow-hidden">
            <img
              :src="detail.media[0].url"
              :alt="detail.name_en"
              class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
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
            <label class="input-label">
              {{ $t('custom_tabs.name_en') }} <span class="text-red-500">*</span>
            </label>
            <InputText
              v-model="editingDetail.name_en"
              :placeholder="$t('custom_tabs.enter_name_en')"
              class="w-full"
              :class="{ 'p-invalid': showEditValidationErrors && !editingDetail.name_en }"
            />
            <small v-if="showEditValidationErrors && !editingDetail.name_en" class="p-error">
              {{ $t('custom_tabs.name_en_required') }}
            </small>
          </div>

          <div class="field-group">
            <label class="input-label">
              {{ $t('custom_tabs.name_ar') }} <span class="text-red-500">*</span>
            </label>
            <InputText
              v-model="editingDetail.name_ar"
              :placeholder="$t('custom_tabs.enter_name_ar')"
              class="w-full"
              :class="{ 'p-invalid': showEditValidationErrors && !editingDetail.name_ar }"
            />
            <small v-if="showEditValidationErrors && !editingDetail.name_ar" class="p-error">
              {{ $t('custom_tabs.name_ar_required') }}
            </small>
          </div>

          <div class="field-group">
            <label class="input-label">
              {{ $t('custom_tabs.type') }}
            </label>
            <Dropdown
              v-model="editingDetail.type"
              :options="detailTypeOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full bg-gray-100 cursor-not-allowed"
              disabled
            />
            <small class="text-xs text-orange-500">
              {{ $t('custom_tabs.type_cannot_change') }}
            </small>
          </div>

          <div class="field-group">
            <label class="input-label">
              {{ currentSelectLabel(editingDetail.type) }} <span class="text-red-500">*</span>
            </label>
            <MultiSelect
              v-model="editingDetail.ids"
              :options="editAvailableItems"
              :optionLabel="multiSelectLabel"
              optionValue="id"
              :placeholder="currentSelectPlaceholder(editingDetail.type)"
              :filterPlaceholder="$t('custom_tabs.search') + ' ' + currentSelectLabel(editingDetail.type).toLowerCase()"
              :loading="editLoadingItems"
              filter
              @filter="(e) => onItemFilter('edit', e)"
              class="w-full"
              :class="{ 'p-invalid': showEditValidationErrors && (!editingDetail.ids || editingDetail.ids.length === 0) }"
            />
            <small v-if="showEditValidationErrors && (!editingDetail.ids || editingDetail.ids.length === 0)" class="p-error">
              {{ $t('custom_tabs.items_required') }}
            </small>
          </div>

          <div class="field-group lg:col-span-2">
            <label class="input-label">
              {{ $t('custom_tabs.image') }} ({{ $t('custom_tabs.optional_reupload') }})
            </label>
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
            <small class="text-xs text-gray-500 mt-1">
              {{ $t('custom_tabs.leave_empty_to_keep') }}
            </small>
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

// PrimeVue and Vue Hooks
const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirm = useConfirm();
const { t, locale } = useI18n();

// State
const tabDetails = ref(null);

// Add Form State
const availableItems = ref([]);
const loadingItems = ref(false);
const addingDetail = ref(false);
const showAddValidationErrors = ref(false);
const newDetail = ref({
  custom_tab_id: route.params.id,
  name_en: '',
  name_ar: '',
  type: null, // 1 = category, 2 = product, 3 = brand
  ids: [],
  image: null,
});

// Edit Form State
const showEditDialog = ref(false);
const editingDetail = ref(null);
const editAvailableItems = ref([]);
const editLoadingItems = ref(false);
const updatingDetail = ref(false);
const showEditValidationErrors = ref(false);

const itemSearchQuery = ref({ new: '', edit: '' });

const appLanguage = computed(() => locale.value);

// Computed Properties
const labelField = computed(() => (appLanguage.value === 'en' ? 'name_en' : 'name_ar'));
const multiSelectLabel = computed(() => labelField.value);

const belongsToLabel = computed(() => {
  const map = {
    store: t('custom_tabs.store'),
    category: t('custom_tabs.category'),
    market: t('custom_tabs.market'),
  };
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
  const typeStr = String(type);
  const map = {
    '1': t('custom_tabs.category'),
    '2': t('custom_tabs.product'),
    '3': t('custom_tabs.brand'),
  };
  return map[typeStr] || t('custom_tabs.unknown');
};

const isAddFormValid = computed(() => {
  return (
    newDetail.value.name_en.trim() &&
    newDetail.value.name_ar.trim() &&
    newDetail.value.type &&
    newDetail.value.image
  );
});

const isEditFormValid = computed(() => {
  if (!editingDetail.value) return false;
  return (
    editingDetail.value.name_en.trim() &&
    editingDetail.value.name_ar.trim() &&
    editingDetail.value.type &&
    editingDetail.value.ids.length > 0
  );
});

const getImagePreview = (file) => URL.createObjectURL(file);

/**
 * Helper to merge new items with selected items, ensuring selected items remain in the list.
 * @param {Array<Object>} newItems - Newly fetched items.
 * @param {Array<Object>} existingItems - Current options list (if fetching is partial).
 * @param {Array<number>} selectedIds - IDs of items currently selected.
 */
const getUniqueItems = (newItems, existingItems, selectedIds) => {
    // Collect selected items from the existing list that are not in the new list
    const selectedItemsNotInNew = existingItems.filter(item =>
        selectedIds.includes(item.id) &&
        !newItems.some(newItem => newItem.id === item.id)
    );

    // Merge new items and the selected items that were previously loaded.
    const mergedItems = [...newItems, ...selectedItemsNotInNew];

    // Ensure uniqueness based on ID (though the logic above should handle most cases)
    const uniqueMap = new Map();
    for (const item of mergedItems) {
        if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
        }
    }
    return Array.from(uniqueMap.values());
};


// API Calls - Consolidated Item Fetching
const fetchItemsByType = async (type, query, formType) => {
  const itemType = type ? String(type) : null;
  if (!itemType) {
    if (formType === 'new') availableItems.value = [];
    if (formType === 'edit') editAvailableItems.value = [];
    return;
  }

  const itemsRef = formType === 'new' ? availableItems : editAvailableItems;
  const loadingRef = formType === 'new' ? loadingItems : editLoadingItems;
  const selectedIds = formType === 'new' ? newDetail.value.ids : (editingDetail.value?.ids || []);


  loadingRef.value = true;

  const endpoints = {
    '1': '/api/category',
    '2': '/api/product',
    '3': '/api/brand',
  };

  try {
    const { data } = await axios.get(endpoints[itemType], {
      params: {
        search: query || undefined,
        per_page: 50,
        // Optional: Include selected IDs in the search parameters to force API to return them
        // ids: selectedIds.join(',')
      },
    });

    const fetchedItems = data.data?.data || data.data || [];

    // --- FIX IMPLEMENTATION START ---
    // Merge fetched items with currently selected items to prevent 'null' labels.
    itemsRef.value = getUniqueItems(fetchedItems, itemsRef.value, selectedIds);
    // --- FIX IMPLEMENTATION END ---

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
  } else if (formType === 'edit' && editingDetail.value) {
    itemSearchQuery.value.edit = e.value;
    debouncedFetchItemsEdit();
  }
};

const fetchDetails = () => {
  axios.get(`/api/custom-tabs/${route.params.id}`)
    .then(({ data }) => {
      if (data.is_success && data.data) {
        data.data.details = data.data.details.map(detail => ({
            ...detail,
            type: Number(detail.type),
            ids: detail.ids || [],
        }));
        tabDetails.value = data.data;
      } else {
        throw new Error(data.message || t('custom_tabs.details_load_failed'));
      }
    })
    .catch((err) => {
      console.error("Error fetching details:", err);
      toast.add({ severity: 'error', summary: t('error'), detail: t('custom_tabs.details_load_failed'), life: 3000 });
    });
};

// Watchers
watch(() => newDetail.value.type, (newType) => {
  newDetail.value.ids = [];
  availableItems.value = [];
  itemSearchQuery.value.new = '';
  if (newType) {
    fetchItemsByType(newType, '', 'new');
  }
});

// Actions
const onImageSelect = (type, event) => {
  const file = event.files[0];
  if (!file) return;

  if (type === 'new') {
    newDetail.value.image = file;
  } else if (type === 'edit' && editingDetail.value) {
    editingDetail.value.newImage = file;
  }
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

  newDetail.value.ids.forEach((id, i) => {
    formData.append(`ids[${i}]`, id);
  });

  try {
    await axios.post('/api/custom-tab-details', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toast.add({ severity: 'success', summary: t('success'), detail: t('custom_tabs.detail_added'), life: 3000 });
    resetNewForm();
    await fetchDetails();
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: err.response?.data?.message || t('custom_tabs.add_failed'),
      life: 5000,
    });
  } finally {
    addingDetail.value = false;
  }
};

const confirmDeleteDetail = (id) => {
    confirm.require({
        message: t('custom_tabs.confirm_delete_message'),
        header: t('custom_tabs.confirm_delete'),
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: () => {
            deleteDetail(id);
        },
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

const openEditDialog = async (detail) => {
  // Deep clone and map fields for editing
  editingDetail.value = {
    ...detail,
    ids: detail.ids || [], // Use the 'ids' field from the API response
    newImage: null, // Placeholder for new image file object
  };

  // Fetch items for the edit dialog. The fix ensures selected items are included.
  await fetchItemsByType(editingDetail.value.type, '', 'edit');

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

  if (editingDetail.value.newImage) {
    formData.append('image', editingDetail.value.newImage);
  }

  editingDetail.value.ids.forEach((id, i) => {
    formData.append(`ids[${i}]`, id);
  });

  try {
    await axios.post(`/api/custom-tab-details/${editingDetail.value.id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    toast.add({ severity: 'success', summary: t('success'), detail: t('custom_tabs.detail_updated'), life: 3000 });
    showEditDialog.value = false;
    resetEditForm();
    await fetchDetails();
  } catch (err) {
    console.error(err);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: err.response?.data?.message || t('custom_tabs.update_failed'),
      life: 5000,
    });
  } finally {
    updatingDetail.value = false;
  }
};

const resetNewForm = () => {
  newDetail.value = {
    custom_tab_id: route.params.id,
    name_en: '',
    name_ar: '',
    type: null,
    ids: [],
    image: null,
  };
  showAddValidationErrors.value = false;
  availableItems.value = [];
  itemSearchQuery.value.new = '';
};

const resetEditForm = () => {
    editingDetail.value = null;
    showEditValidationErrors.value = false;
    editAvailableItems.value = [];
    itemSearchQuery.value.edit = '';
}

// Lifecycle
onMounted(() => {
  fetchDetails();
});

// Styles
</script>

<style>
/* Fancy Card Styles */
.card-fancy {
  @apply bg-white p-6 lg:p-8 rounded-2xl shadow-xl transition-all duration-500 transform hover:shadow-2xl hover:scale-[1.005];
}

/* Field Group Styles */
.field-group {
  @apply space-y-2;
}

/* Input Label Styles */
.input-label {
  @apply block text-sm font-semibold text-gray-700;
}

/* Primary Button Styles */
.button-primary {
  @apply bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02];
}

/* Detail Card Styles */
.detail-card {
  @apply border border-gray-100 rounded-xl bg-white shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1;
}

/* Error Styles */
.p-error {
  @apply text-red-600 text-sm block mt-1 font-medium;
}

/* RTL Specific Styles (using the helper class) */
.rtl .input-label {
    @apply text-right;
}
.rtl .p-placeholder, .rtl .p-inputtext {
    text-align: right;
}
</style>
