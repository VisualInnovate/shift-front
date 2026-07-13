<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import { useI18n } from 'vue-i18n';
import Card from 'primevue/card';
import ProgressSpinner from 'primevue/progressspinner';
import MultiSelect from 'primevue/multiselect';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';

const route = useRoute();
const toast = useToast();
const { t } = useI18n();
const mediaData = ref([]);
const loading = ref(false);
const mediaSelections = ref({});
const appLanguage = ref(localStorage.getItem('appLang') || 'en');

const fetchMedia = async () => {
  loading.value = true;
  const id = route.params.id;

  if (!id) {
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: t('invalidParams'),
      life: 3000
    });
    loading.value = false;
    return;
  }

  try {
    const typeParam = route.params.type === '1' ? 'store' : 'category'; // Default to 'category' if not '1'
    const response = await axios.get(`/api/${typeParam}/${id}/media-links`);

    if (response.data.is_success) {
      // The schema maps directly to response.data.data according to your API payload
      mediaData.value = response.data.data || [];

      if (mediaData.value.length === 0) {
        toast.add({
          severity: 'warn',
          summary: t('warning'),
          detail: t('noMediaFound'),
          life: 3000
        });
      } else {
        mediaData.value.forEach(media => {
          // Extract existing links if available
          const existingIds = media.mediaLinks_data ? media.mediaLinks_data.map(item => item.id) : [];

          // Map existing links to MultiSelect options structure so they show up correctly on load
          const initialAvailable = media.mediaLinks_data ? media.mediaLinks_data.map(item => ({
            label: appLanguage.value === 'ar'
              ? (item.name_ar || item.name_en || `ID ${item.id}`)
              : (item.name_en || item.name_ar || `ID ${item.id}`),
            value: item.id
          })) : [];

          mediaSelections.value[media.media_id] = {
            selectedType: media.mediaLink_type?.toString() || route.params.type || '1',
            selectedIds: existingIds,
            availableIds: initialAvailable,
            searchQuery: ''
          };
        });
      }
    } else {
      throw new Error(response.data.message || t('mediaFetchError'));
    }
  } catch (error) {
    console.error('Error fetching media:', error);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: error.response?.data?.message || error.message || t('mediaFetchError'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const fetchAvailableIds = async (mediaId, typeValue) => {
  try {
    const endpoint = typeValue === '1' ? 'product' : 'category';
    const response = await axios.get(`/api/${endpoint}`, {
      params: {
        search: mediaSelections.value[mediaId].searchQuery || undefined
      }
    });

    let items = [];
    if (response.data.is_success) {
      // Dynamic fallback based on standard api list responses
      items = response.data.data?.data || response.data.data || [];

      const parsedItems = items.map(item => ({
        label: appLanguage.value === 'ar'
          ? (item.name_ar || item.name || `ID ${item.id}`)
          : (item.name_en || item.name || `ID ${item.id}`),
        value: item.id
      }));

      // Merge newly fetched search items with already selected items to ensure labels aren't lost
      const currentSelections = mediaSelections.value[mediaId].availableIds.filter(existing =>
        mediaSelections.value[mediaId].selectedIds.includes(existing.value)
      );

      // Filter out duplicates from freshly fetched items
      const uniqueNewItems = parsedItems.filter(newItem =>
        !currentSelections.some(existing => existing.value === newItem.value)
      );

      mediaSelections.value[mediaId].availableIds = [...currentSelections, ...uniqueNewItems];
    } else {
      throw new Error(response.data.message || t('idFetchError'));
    }
  } catch (error) {
    console.error('Error fetching IDs:', error);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: error.response?.data?.message || error.message || t('idFetchError'),
      life: 3000
    });
  }
};

const onIdFilter = (event, mediaId) => {
  mediaSelections.value[mediaId].searchQuery = event.value;
  fetchAvailableIds(mediaId, mediaSelections.value[mediaId].selectedType);
};

const submitMediaLink = async (mediaId) => {
  const selection = mediaSelections.value[mediaId];
  if (!selection.selectedType) {
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: t('selectType'),
      life: 3000
    });
    return;
  }

  try {
    const payload = {
      media_id: mediaId,
      type: parseInt(selection.selectedType),
      ids: selection.selectedIds
    };
    const response = await axios.post('/api/medialink', payload);
    if (response.data.is_success) {
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('mediaLinkCreated'),
        life: 3000
      });
      // Refresh options from database after submission
      await fetchMedia();
      for (const media of mediaData.value) {
        await fetchAvailableIds(media.media_id, mediaSelections.value[media.media_id]?.selectedType || '1');
      }
    } else {
      throw new Error(response.data.message || t('mediaLinkError'));
    }
  } catch (error) {
    console.error('Error creating media link:', error);
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: error.response?.data?.message || error.message || t('mediaLinkError'),
      life: 3000
    });
  }
};

const handleTypeChange = async (mediaId) => {
  mediaSelections.value[mediaId].selectedIds = [];
  mediaSelections.value[mediaId].availableIds = [];
  mediaSelections.value[mediaId].searchQuery = '';
  await fetchAvailableIds(mediaId, mediaSelections.value[mediaId].selectedType);
};

onMounted(async () => {
  await fetchMedia();
  for (const media of mediaData.value) {
    await fetchAvailableIds(media.media_id, mediaSelections.value[media.media_id]?.selectedType || '1');
  }
});

const typeOptions = [
  { label: t('product.mediaTitle'), value: '1' },
  { label: t('category.mediaTitle'), value: '2' }
];
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
      {{ route.params.type === '1' ? t('store.mediaTitle') : t('category.mediaTitle') }}
    </h1>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>

    <div v-else-if="mediaData.length === 0" class="text-center text-gray-600">
      {{ t('noMediaFound') }}
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <Card v-for="media in mediaData" :key="media.media_id" class="shadow-md hover:shadow-lg transition-shadow duration-300">
        <template #content>
          <div class="relative group">
            <img
              :src="media.media_url"
              :alt="media.media_name || `${route.params.type === '1' ? t('store.media') : t('category.media')} ${media.media_id}`"
              class="w-full h-[150px] object-contain rounded-lg"
            />
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 rounded-lg">
              <a
                :href="media.media_url"
                target="_blank"
                class="opacity-0 group-hover:opacity-100 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                :aria-label="t('viewMedia', { name: media.media_name || 'Media ' + media.media_id })"
              >
                <i class="pi pi-link text-sm"></i>
              </a>
            </div>
          </div>
          <p class="mt-2 text-center text-sm text-gray-600">{{ media.media_name || t('mediaItem') }}</p>

          <div class="mt-4" v-if="mediaSelections[media.media_id]">
            <label class="block text-sm font-medium text-gray-700 mb-2">{{ t('selectType') }}</label>
            <Dropdown
              v-model="mediaSelections[media.media_id].selectedType"
              :options="typeOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
              @change="handleTypeChange(media.media_id)"
            />
          </div>

          <div class="mt-4" v-if="mediaSelections[media.media_id]">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ mediaSelections[media.media_id].selectedType === '1' ? t('selectProducts') : t('selectCategories') }}
            </label>
            <MultiSelect
              v-model="mediaSelections[media.media_id].selectedIds"
              :options="mediaSelections[media.media_id].availableIds || []"
              optionLabel="label"
              optionValue="value"
              :placeholder="mediaSelections[media.media_id].selectedType === '1' ? t('selectProducts') : t('selectCategories')"
              class="w-full"
              :maxSelectedLabels="3"
              filter
              :filterPlaceholder="mediaSelections[media.media_id].selectedType === '1' ? t('searchProducts') : t('searchCategories')"
              @filter="onIdFilter($event, media.media_id)"
            />
          </div>

          <Button
            :label="t('linkMedia')"
            class="mt-4 w-full"
            severity="success"
            @click="submitMediaLink(media.media_id)"
          />
        </template>
      </Card>
    </div>

    <Toast />
  </div>
</template>

<style scoped>
.transition-all {
  transition-property: all;
}
.transition-shadow {
  transition-property: box-shadow;
}
.transition-colors {
  transition-property: background-color, border-color, color;
}
.duration-300 {
  transition-duration: 300ms;
}

.group:hover .group-hover\:bg-opacity-30 {
  background-color: rgba(0, 0, 0, 0.3);
}
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
