<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n';

const router = useRouter();
const toast = useToast();
const { t } = useI18n();
const form = ref();
const storeId = ref(router.currentRoute._value.params.id);
const loading = ref(false);

// Form Data
const storeData = ref({
  name_en: '',
  name_ar: '',
  is_default: false,
  has_market: false,
  min_amount_order: '',
  store_image: null,
  main_banner_image: null,
  sub_banner_image: null,
  slider_images_one: [],
  slider_images_two: [],
  slider_images_three: [],
  // existing_images now stores the URL AND the media ID for deletion tracking
  existing_images: {
    store_image: { url: null, id: null },
    main_banner_image: { url: null, id: null },
    sub_banner_image: { url: null, id: null },
    slider_images_one: [], // Array of { url, id }
    slider_images_two: [],
    slider_images_three: []
  }
});

// Image previews
const storeImagePreview = ref(null);
const mainBannerPreview = ref(null);
const subBannerPreview = ref(null);
const sliderOnePreviews = ref([]);
const sliderTwoPreviews = ref([]);
const sliderThreePreviews = ref([]);

// Drag states
const isDraggingStoreImage = ref(false);
const isDraggingMainBanner = ref(false);
const isDraggingSubBanner = ref(false);
const isDraggingSliderOne = ref(false);
const isDraggingSliderTwo = ref(false);
const isDraggingSliderThree = ref(false);

// Validation
const validateForm = () => {
  if (!storeData.value.name_en.trim()) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'English name is required', life: 3000 });
    return false;
  }
  if (!storeData.value.name_ar.trim()) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Arabic name is required', life: 3000 });
    return false;
  }
  if (storeData.value.min_amount_order === '' || storeData.value.min_amount_order === null || storeData.value.min_amount_order === undefined) {
    toast.add({ severity: 'error', summary: 'Validation Error', detail: 'Minimum order amount is required', life: 3000 });
    return false;
  }
  return true;
};

/**
 * 💣 API Call to Delete Media Item
 * @param {number} mediaId - The ID of the media item to delete.
 */
const deleteMedia = async (mediaId) => {
  if (!mediaId) return true; // Treat as successful if no ID is present



  loading.value = true;
  try {
    // Assuming the API uses DELETE method to the specified endpoint
    await axios.delete(`/api/dashboard/media/${mediaId}`);
    toast.add({
      severity: 'warn',
      summary: 'Image Deleted',
      detail: 'Existing image permanently removed from the server.',
      life: 3000
    });
    return true;
  } catch (error) {
    console.error("Error deleting media:", error);
    toast.add({
      severity: 'error',
      summary: "Deletion Error",
      detail: 'Failed to delete the existing image. Please try again.',
      life: 3000
    });
    // Return false to prevent local state update if deletion fails
    return false;
  } finally {
    loading.value = false;
  }
};


// Handle image uploads (logic remains the same)
const handleImageUpload = (file, type) => {
  if (file.size > 2 * 1024 * 1024) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Image size should be less than 2MB', life: 3000 });
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    switch (type) {
      case 'store':
        storeData.value.store_image = file;
        storeImagePreview.value = e.target.result;
        isDraggingStoreImage.value = false;
        // Reset existing data if a new file is uploaded
        storeData.value.existing_images.store_image = { url: null, id: null };
        break;
      case 'main_banner':
        storeData.value.main_banner_image = file;
        mainBannerPreview.value = e.target.result;
        isDraggingMainBanner.value = false;
        storeData.value.existing_images.main_banner_image = { url: null, id: null };
        break;
      case 'sub_banner':
        storeData.value.sub_banner_image = file;
        subBannerPreview.value = e.target.result;
        isDraggingSubBanner.value = false;
        storeData.value.existing_images.sub_banner_image = { url: null, id: null };
        break;
    }
  };
  reader.readAsDataURL(file);
};

const handleSliderUpload = (files, type) => {
  const newPreviews = [];
  const newFiles = [];

  const existingCount = type === 'slider_one'
    ? storeData.value.existing_images.slider_images_one.length
    : type === 'slider_two'
      ? storeData.value.existing_images.slider_images_two.length
      : storeData.value.existing_images.slider_images_three.length;

  const currentCount = type === 'slider_one'
    ? storeData.value.slider_images_one.length
    : type === 'slider_two'
      ? storeData.value.slider_images_two.length
      : storeData.value.slider_images_three.length;


  if (existingCount + currentCount + files.length > 10) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Maximum 10 images allowed for ${type === 'slider_one' ? 'Slider One' : type === 'slider_two' ? 'Slider Two' : 'Slider Three'}`,
      life: 3000
    });
    return;
  }

  Array.from(files).forEach(file => {
    if (file.size > 2 * 1024 * 1024) {
      toast.add({ severity: 'error', summary: 'Error', detail: `${file.name} exceeds 2MB limit`, life: 3000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      newPreviews.push(e.target.result);
      newFiles.push(file);

      if (newPreviews.length === files.length) {
        if (type === 'slider_one') {
          storeData.value.slider_images_one = [...storeData.value.slider_images_one, ...newFiles];
          sliderOnePreviews.value = [...sliderOnePreviews.value, ...newPreviews];
          isDraggingSliderOne.value = false;
        } else if (type === 'slider_two') {
          storeData.value.slider_images_two = [...storeData.value.slider_images_two, ...newFiles];
          sliderTwoPreviews.value = [...sliderTwoPreviews.value, ...newPreviews];
          isDraggingSliderTwo.value = false;
        } else if (type === 'slider_three') {
          storeData.value.slider_images_three = [...storeData.value.slider_images_three, ...newFiles];
          sliderThreePreviews.value = [...sliderThreePreviews.value, ...newPreviews];
          isDraggingSliderThree.value = false;
        }
      }
    };
    reader.readAsDataURL(file);
  });
};

const onImageUpload = (event, type) => {
  const file = event.target.files?.[0] || event.dataTransfer?.files?.[0];
  if (file && file.type.match('image.*')) {
    handleImageUpload(file, type);
  }
};

const onSliderUpload = (event, type) => {
  const files = event.target.files || event.dataTransfer?.files;
  if (files && files.length > 0) {
    handleSliderUpload(files, type);
  }
};

// Remove images
const removeImage = async (type) => {
  let mediaId = null;
  let existingMedia = null;

  switch (type) {
    case 'store':
      existingMedia = storeData.value.existing_images.store_image;
      mediaId = existingMedia.id;
      // If it's an existing image, attempt to delete it
      if (mediaId && await deleteMedia(mediaId) === false) return;

      storeData.value.store_image = null;
      storeImagePreview.value = null;
      storeData.value.existing_images.store_image = { url: null, id: null };
      break;
    case 'main_banner':
      existingMedia = storeData.value.existing_images.main_banner_image;
      mediaId = existingMedia.id;
      if (mediaId && await deleteMedia(mediaId) === false) return;

      storeData.value.main_banner_image = null;
      mainBannerPreview.value = null;
      storeData.value.existing_images.main_banner_image = { url: null, id: null };
      break;
    case 'sub_banner':
      existingMedia = storeData.value.existing_images.sub_banner_image;
      mediaId = existingMedia.id;
      if (mediaId && await deleteMedia(mediaId) === false) return;

      storeData.value.sub_banner_image = null;
      subBannerPreview.value = null;
      storeData.value.existing_images.sub_banner_image = { url: null, id: null };
      break;
  }
};

const removeSliderImage = async (index, type) => {
  if (type === 'slider_one') {
    // Logic for existing image (stored in existing_images array)
    if (index < storeData.value.existing_images.slider_images_one.length) {
      const existingMedia = storeData.value.existing_images.slider_images_one[index];
      if (existingMedia.id) {
        if (await deleteMedia(existingMedia.id) === false) return;
      }
      storeData.value.existing_images.slider_images_one.splice(index, 1);
    }
    // Logic for newly uploaded image (stored in file/preview arrays)
    else {
      const adjustedIndex = index - storeData.value.existing_images.slider_images_one.length;
      storeData.value.slider_images_one.splice(adjustedIndex, 1);
      sliderOnePreviews.value.splice(adjustedIndex, 1);
    }
  } else if (type === 'slider_two') {
    if (index < storeData.value.existing_images.slider_images_two.length) {
      const existingMedia = storeData.value.existing_images.slider_images_two[index];
      if (existingMedia.id) {
        if (await deleteMedia(existingMedia.id) === false) return;
      }
      storeData.value.existing_images.slider_images_two.splice(index, 1);
    } else {
      const adjustedIndex = index - storeData.value.existing_images.slider_images_two.length;
      storeData.value.slider_images_two.splice(adjustedIndex, 1);
      sliderTwoPreviews.value.splice(adjustedIndex, 1);
    }
  } else if (type === 'slider_three') {
    if (index < storeData.value.existing_images.slider_images_three.length) {
      const existingMedia = storeData.value.existing_images.slider_images_three[index];
      if (existingMedia.id) {
        if (await deleteMedia(existingMedia.id) === false) return;
      }
      storeData.value.existing_images.slider_images_three.splice(index, 1);
    } else {
      const adjustedIndex = index - storeData.value.existing_images.slider_images_three.length;
      storeData.value.slider_images_three.splice(adjustedIndex, 1);
      sliderThreePreviews.value.splice(adjustedIndex, 1);
    }
  }
};

// Fetch store data
const fetchStore = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`/api/store/${storeId.value}`);
    const data = response.data.data;

    storeData.value.name_ar = data.name_ar;
    storeData.value.name_en = data.name_en;
    storeData.value.is_default = data.is_default === 1;
    storeData.value.has_market = data.has_market === 1;
    storeData.value.min_amount_order = data.min_amount_order || '';

    // Process media - Now storing { url, id }
    data.media.forEach(media => {
      const mediaItem = { url: media.url, id: media.id };
      switch (media.name) {
        case 'store_image':
          storeData.value.existing_images.store_image = mediaItem;
          storeImagePreview.value = media.url;
          break;
        case 'main_banner_image':
          storeData.value.existing_images.main_banner_image = mediaItem;
          mainBannerPreview.value = media.url;
          break;
        case 'sub_banner_image':
          storeData.value.existing_images.sub_banner_image = mediaItem;
          subBannerPreview.value = media.url;
          break;
        case 'slider_images_one':
          storeData.value.existing_images.slider_images_one.push(mediaItem);
          break;
        case 'slider_images_two':
          storeData.value.existing_images.slider_images_two.push(mediaItem);
          break;
        case 'slider_images_three':
          storeData.value.existing_images.slider_images_three.push(mediaItem);
          break;
      }
    });

  } catch (error) {
    console.error("Error fetching store:", error);
    toast.add({
      severity: 'error',
      summary: "Error",
      detail: 'Failed to load store data',
      life: 3000
    });
    router.push({ name: 'stores' });
  } finally {
    loading.value = false;
  }
};

// Submit form
const submitForm = async () => {
  if (!validateForm()) return;

  loading.value = true;

  const formData = new FormData();
  formData.append('_method', 'post');
  formData.append('name_en', storeData.value.name_en || '');
  formData.append('name_ar', storeData.value.name_ar || '');
  formData.append('is_default', storeData.value.is_default ? '1' : '0');
  formData.append('has_market', storeData.value.has_market ? '1' : '0');
  const minAmountValue = (storeData.value.min_amount_order === '' || storeData.value.min_amount_order === null || storeData.value.min_amount_order === undefined)
    ? ''
    : String(storeData.value.min_amount_order);
  formData.append('min_amount_order', minAmountValue);

  // Handle image updates
  // Note: We no longer need to check for null on existing_images here,
  // because existing images are deleted immediately in removeImage().
  // If the user replaces an image, existing_images is reset to {url: null, id: null}
  // in handleImageUpload, and the old image's ID is NOT sent to the backend.

  // New image files are appended
  if (storeData.value.store_image) {
    formData.append('store_image', storeData.value.store_image);
  }
  if (storeData.value.main_banner_image) {
    formData.append('main_banner_image', storeData.value.main_banner_image);
  }
  if (storeData.value.sub_banner_image) {
    formData.append('sub_banner_image', storeData.value.sub_banner_image);
  }

  // Handle new slider images
  storeData.value.slider_images_one.forEach((file, index) => {
    formData.append(`slider_images_one[${index}]`, file);
  });
  storeData.value.slider_images_two.forEach((file, index) => {
    formData.append(`slider_images_two[${index}]`, file);
  });
  storeData.value.slider_images_three.forEach((file, index) => {
    formData.append(`slider_images_three[${index}]`, file);
  });

  // Add remaining existing slider images to keep (by their ID)
  // This is crucial: we send the IDs of the images we want to KEEP.
  storeData.value.existing_images.slider_images_one.forEach((item, index) => {
    formData.append(`keep_slider_one[${index}]`, item.id);
  });

  storeData.value.existing_images.slider_images_two.forEach((item, index) => {
    formData.append(`keep_slider_two[${index}]`, item.id);
  });

  storeData.value.existing_images.slider_images_three.forEach((item, index) => {
    formData.append(`keep_slider_three[${index}]`, item.id);
  });


  try {
    const response = await axios.post(`/api/store/${storeId.value}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    router.push({ name: 'stores' });
    toast.add({
      severity: 'success',
      summary: "Success",
      detail: 'Store updated successfully',
      life: 3000
    });
  } catch (error) {
    console.error("Error:", error);
    let errorMessage = error.response?.data?.message || 'An error occurred';
    if (error.response?.data?.errors) {
      errorMessage = Object.values(error.response.data.errors).join(' ');
    }
    toast.add({
      severity: 'error',
      summary: "Error",
      detail: errorMessage,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStore();
});
</script>

<template>
  <div class="max-w-5xl p-6 mx-auto bg-white shadow-lg rounded-xl">
    <h1 class="mb-8 text-3xl font-bold text-center text-gray-800">{{ t('store.updateTitle') }}</h1>

    <form ref="form" @submit.prevent="submitForm" class="space-y-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <label for="name_en" class="block text-sm font-medium text-gray-700">
            {{ t('store.nameEn') }} <span class="text-red-500">*</span>
          </label>
          <input
            id="name_en"
            v-model="storeData.name_en"
            type="text"
            :placeholder="t('store.enterNameEn')"
            class="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="space-y-2">
          <label for="name_ar" class="block text-sm font-medium text-gray-700">
            {{ t('store.nameAr') }} <span class="text-red-500">*</span>
          </label>
          <input
            id="name_ar"
            v-model="storeData.name_ar"
            type="text"
            :placeholder="t('store.enterNameAr')"
            dir="rtl"
            class="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div class="space-y-2">
          <label for="min_amount_order" class="block text-sm font-medium text-gray-700">
            {{ t('store.minAmountOrder') }} <span class="text-red-500">*</span>
          </label>
          <input
            id="min_amount_order"
            v-model="storeData.min_amount_order"
            type="number"
            min="0"
            step="0.01"
            :placeholder="t('store.enterMinAmountOrder')"
            class="w-full px-4 py-2 transition border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div class="space-y-4 md:col-span-2">
          <div class="flex items-center space-x-4">
            <label class="block text-sm font-medium text-gray-700">{{ t('store.isDefault') }}</label>
            <input type="checkbox" v-model="storeData.is_default" class="w-5 h-5 rounded" />
            <span class="text-sm text-gray-500">{{ t('store.markAsDefault') }}</span>
          </div>

          <div class="flex items-center space-x-4">
            <label class="block text-sm font-medium text-gray-700">{{ t('store.hasMarket') }}</label>
            <input type="checkbox" v-model="storeData.has_market" class="w-5 h-5 rounded" />
            <span class="text-sm text-gray-500">{{ t('store.enableMarketFeatures') }}</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('store.storeLogo') }}
          </label>
          <div class="flex justify-center">
            <label
              @dragover.prevent="isDraggingStoreImage = true"
              @dragleave="isDraggingStoreImage = false"
              @drop.prevent="onImageUpload($event, 'store')"
              :class="{'border-blue-500 bg-blue-50': isDraggingStoreImage, 'border-gray-300': !isDraggingStoreImage}"
              class="flex items-center justify-center w-full h-48 transition-colors duration-300 border-2 border-dashed cursor-pointer rounded-xl"
            >
              <input type="file" @change="onImageUpload($event, 'store')" accept="image/*" class="hidden">

              <div v-if="storeImagePreview" class="w-full h-full p-4">
                <div class="relative w-full h-full group">
                  <img
                    :src="storeImagePreview"
                    alt="Store Logo Preview"
                    class="object-contain w-full h-full transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                  >
                  <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                    <button
                      type="button"
                      @click.stop="removeImage('store')"
                      class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                    >
                      <i class="text-sm pi pi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="flex flex-col items-center justify-center p-4">
                <div class="p-3 mb-2 bg-blue-100 rounded-full">
                  <i class="text-xl text-blue-500 pi pi-image"></i>
                </div>
                <p class="text-sm text-center text-gray-600">
                  <span class="font-medium text-blue-500">{{ t('store.clickToUpload') }}</span> {{ t('store.orDragDrop') }}
                </p>
                <p class="text-xs text-gray-400">{{ t('store.imageFormat') }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('store.mainBanner') }}
          </label>
          <div class="flex justify-center">
            <label
              @dragover.prevent="isDraggingMainBanner = true"
              @dragleave="isDraggingMainBanner = false"
              @drop.prevent="onImageUpload($event, 'main_banner')"
              :class="{'border-blue-500 bg-blue-50': isDraggingMainBanner, 'border-gray-300': !isDraggingMainBanner}"
              class="flex items-center justify-center w-full h-48 transition-colors duration-300 border-2 border-dashed cursor-pointer rounded-xl"
            >
              <input type="file" @change="onImageUpload($event, 'main_banner')" accept="image/*" class="hidden">

              <div v-if="mainBannerPreview" class="w-full h-full p-4">
                <div class="relative w-full h-full group">
                  <img
                    :src="mainBannerPreview"
                    alt="Main Banner Preview"
                    class="object-contain w-full h-full transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                  >
                  <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                    <button
                      type="button"
                      @click.stop="removeImage('main_banner')"
                      class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                    >
                      <i class="text-sm pi pi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="flex flex-col items-center justify-center p-4">
                <div class="p-3 mb-2 bg-blue-100 rounded-full">
                  <i class="text-xl text-blue-500 pi pi-image"></i>
                </div>
                <p class="text-sm text-center text-gray-600">
                  <span class="font-medium text-blue-500">{{ t('store.clickToUpload') }}</span> {{ t('store.orDragDrop') }}
                </p>
                <p class="text-xs text-gray-400">{{ t('store.imageFormat') }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">{{ t('store.subBanner') }}</label>
          <div class="flex justify-center">
            <label
              @dragover.prevent="isDraggingSubBanner = true"
              @dragleave="isDraggingSubBanner = false"
              @drop.prevent="onImageUpload($event, 'sub_banner')"
              :class="{'border-blue-500 bg-blue-50': isDraggingSubBanner, 'border-gray-300': !isDraggingSubBanner}"
              class="flex items-center justify-center w-full h-48 max-w-2xl transition-colors duration-300 border-2 border-dashed cursor-pointer rounded-xl"
            >
              <input type="file" @change="onImageUpload($event, 'sub_banner')" accept="image/*" class="hidden">

              <div v-if="subBannerPreview" class="w-full h-full p-4">
                <div class="relative w-full h-full group">
                  <img
                    :src="subBannerPreview"
                    alt="Sub Banner Preview"
                    class="object-contain w-full h-full transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                  >
                  <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                    <button
                      type="button"
                      @click.stop="removeImage('sub_banner')"
                      class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                    >
                      <i class="text-sm pi pi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="flex flex-col items-center justify-center p-4">
                <div class="p-3 mb-2 bg-blue-100 rounded-full">
                  <i class="text-xl text-blue-500 pi pi-image"></i>
                </div>
                <p class="text-sm text-center text-gray-600">
                  <span class="font-medium text-blue-500">{{ t('store.clickToUpload') }}</span> {{ t('store.orDragDrop') }}
                </p>
                <p class="text-xs text-gray-400">{{ t('store.imageFormat') }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('store.sliderOne') }} <span class="text-gray-500">({{ t('store.maxImages') }})</span>
          </label>
          <div class="flex justify-center">
            <label
              @dragover.prevent="isDraggingSliderOne = true"
              @dragleave="isDraggingSliderOne = false"
              @drop.prevent="onSliderUpload($event, 'slider_one')"
              :class="{'border-blue-500 bg-blue-50': isDraggingSliderOne, 'border-gray-300': !isDraggingSliderOne}"
              class="w-full transition-colors duration-300 border-2 border-dashed cursor-pointer rounded-xl"
            >
              <input type="file" @change="onSliderUpload($event, 'slider_one')" accept="image/*" multiple class="hidden">

              <div v-if="sliderOnePreviews.length > 0 || storeData.existing_images.slider_images_one.length > 0" class="p-4">
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  <div v-for="(item, index) in storeData.existing_images.slider_images_one" :key="'existing-one-'+index" class="relative group">
                    <img
                      :src="item.url"
                      :alt="`Existing Slider One Image ${index + 1}`"
                      class="object-contain w-full h-32 transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                    >
                    <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                      <button
                        type="button"
                        @click.stop="removeSliderImage(index, 'slider_one')"
                        class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                      >
                        <i class="text-sm pi pi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div v-for="(preview, index) in sliderOnePreviews" :key="'new-one-'+index" class="relative group">
                    <img
                      :src="preview"
                      :alt="`New Slider One Image ${index + 1}`"
                      class="object-contain w-full h-32 transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                    >
                    <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                      <button
                        type="button"
                        @click.stop="removeSliderImage(storeData.existing_images.slider_images_one.length + index, 'slider_one')"
                        class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                      >
                        <i class="text-sm pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="mt-2 text-sm text-center text-gray-500">
                  {{ storeData.existing_images.slider_images_one.length + sliderOnePreviews.length }} {{ t('store.imagesUploaded') }}
                </p>
              </div>

              <div v-else class="flex flex-col items-center justify-center p-8">
                <div class="p-4 mb-4 bg-blue-100 rounded-full">
                  <i class="text-2xl text-blue-500 pi pi-images"></i>
                </div>
                <p class="mb-1 text-sm text-center text-gray-600">
                  <span class="font-medium text-blue-500">{{ t('store.clickToUpload') }}</span> {{ t('store.orDragDrop') }}
                </p>
                <p class="text-xs text-gray-400">{{ t('store.multipleImages') }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('store.sliderTwo') }} <span class="text-gray-500">({{ t('store.maxImages') }})</span>
          </label>
          <div class="flex justify-center">
            <label
              @dragover.prevent="isDraggingSliderTwo = true"
              @dragleave="isDraggingSliderTwo = false"
              @drop.prevent="onSliderUpload($event, 'slider_two')"
              :class="{'border-blue-500 bg-blue-50': isDraggingSliderTwo, 'border-gray-300': !isDraggingSliderTwo}"
              class="w-full transition-colors duration-300 border-2 border-dashed cursor-pointer rounded-xl"
            >
              <input type="file" @change="onSliderUpload($event, 'slider_two')" accept="image/*" multiple class="hidden">

              <div v-if="sliderTwoPreviews.length > 0 || storeData.existing_images.slider_images_two.length > 0" class="p-4">
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  <div v-for="(item, index) in storeData.existing_images.slider_images_two" :key="'existing-two-'+index" class="relative group">
                    <img
                      :src="item.url"
                      :alt="`Existing Slider Two Image ${index + 1}`"
                      class="object-contain w-full h-32 transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                    >
                    <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                      <button
                        type="button"
                        @click.stop="removeSliderImage(index, 'slider_two')"
                        class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                      >
                        <i class="text-sm pi pi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div v-for="(preview, index) in sliderTwoPreviews" :key="'new-two-'+index" class="relative group">
                    <img
                      :src="preview"
                      :alt="`New Slider Two Image ${index + 1}`"
                      class="object-contain w-full h-32 transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                    >
                    <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                      <button
                        type="button"
                        @click.stop="removeSliderImage(storeData.existing_images.slider_images_two.length + index, 'slider_two')"
                        class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                      >
                        <i class="text-sm pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="mt-2 text-sm text-center text-gray-500">
                  {{ storeData.existing_images.slider_images_two.length + sliderTwoPreviews.length }} {{ t('store.imagesUploaded') }}
                </p>
              </div>

              <div v-else class="flex flex-col items-center justify-center p-8">
                <div class="p-4 mb-4 bg-blue-100 rounded-full">
                  <i class="text-2xl text-blue-500 pi pi-images"></i>
                </div>
                <p class="mb-1 text-sm text-center text-gray-600">
                  <span class="font-medium text-blue-500">{{ t('store.clickToUpload') }}</span> {{ t('store.orDragDrop') }}
                </p>
                <p class="text-xs text-gray-400">{{ t('store.multipleImages') }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="space-y-2 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ t('store.sliderThree') }} <span class="text-gray-500">({{ t('store.maxImages') }})</span>
          </label>
          <div class="flex justify-center">
            <label
              @dragover.prevent="isDraggingSliderThree = true"
              @dragleave="isDraggingSliderThree = false"
              @drop.prevent="onSliderUpload($event, 'slider_three')"
              :class="{'border-blue-500 bg-blue-50': isDraggingSliderThree, 'border-gray-300': !isDraggingSliderThree}"
              class="w-full transition-colors duration-300 border-2 border-dashed cursor-pointer rounded-xl"
            >
              <input type="file" @change="onSliderUpload($event, 'slider_three')" accept="image/*" multiple class="hidden">

              <div v-if="sliderThreePreviews.length > 0 || storeData.existing_images.slider_images_three.length > 0" class="p-4">
                <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  <div v-for="(item, index) in storeData.existing_images.slider_images_three" :key="'existing-three-'+index" class="relative group">
                    <img
                      :src="item.url"
                      :alt="`Existing Slider Three Image ${index + 1}`"
                      class="object-contain w-full h-32 transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                    >
                    <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                      <button
                        type="button"
                        @click.stop="removeSliderImage(index, 'slider_three')"
                        class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                      >
                        <i class="text-sm pi pi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div v-for="(preview, index) in sliderThreePreviews" :key="'new-three-'+index" class="relative group">
                    <img
                      :src="preview"
                      :alt="`New Slider Three Image ${index + 1}`"
                      class="object-contain w-full h-32 transition-transform duration-300 rounded-lg shadow-md group-hover:scale-105"
                    >
                    <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-30">
                      <button
                        type="button"
                        @click.stop="removeSliderImage(storeData.existing_images.slider_images_three.length + index, 'slider_three')"
                        class="p-2 text-white transition bg-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600"
                      >
                        <i class="text-sm pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <p class="mt-2 text-sm text-center text-gray-500">
                  {{ storeData.existing_images.slider_images_three.length + sliderThreePreviews.length }} {{ t('store.imagesUploaded') }}
                </p>
              </div>

              <div v-else class="flex flex-col items-center justify-center p-8">
                <div class="p-4 mb-4 bg-blue-100 rounded-full">
                  <i class="text-2xl text-blue-500 pi pi-images"></i>
                </div>
                <p class="mb-1 text-sm text-center text-gray-600">
                  <span class="font-medium text-blue-500">{{ t('store.clickToUpload') }}</span> {{ t('store.orDragDrop') }}
                </p>
                <p class="text-xs text-gray-400">{{ t('store.multipleImages') }}</p>
              </div>
            </label>
          </div>
        </div>

        <div class="pt-4 md:col-span-2">
          <button
            type="submit"
            :disabled="loading"
            class="flex items-center justify-center w-full px-6 py-3 text-lg font-semibold text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i v-if="loading" class="mr-2 pi pi-spin pi-spinner"></i>
            {{ loading ? t('store.updating') : t('store.updateStore') }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
