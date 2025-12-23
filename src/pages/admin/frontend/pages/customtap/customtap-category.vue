<template>
  <div class="mx-auto px-4 max-w-[1500px]">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-xl font-semibold text-red-600 mb-4">{{ error }}</p>
      <button
        @click="fetchCustomTabs(route.params.id, 1)"
        class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
      >
        {{ t('common.retry') || 'Retry' }}
      </button>
    </div>

    <!-- Main Content -->
    <div v-else v-for="tab in customTabs" :key="tab.id" class="m-auto max-w-7xl">
      <h2 class="font-bold font-sans text-gray-600 lg:mt-8 mt-4 text-center text-lg sm:text-xl md:text-2xl lg:text-3xl">
        {{ title || (locale === 'ar' ? tab.name_ar : tab.name_en) || 'Category' }}
      </h2>

      <div
        class="mt-8 grid gap-x-4 gap-y-10"
        :class="
          tab.row_type === 1
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
        "
      >
        <div
          v-for="(detail, i) in tab.details"
          :key="i"
          class="group flex flex-col items-center cursor-pointer transition-all duration-300 hover:-translate-y-2"
          @click="navigateToDetail(detail.has_subcategories, detail.id, locale === 'ar' ? detail.name_ar : detail.name_en)"
          :aria-label="locale === 'ar' ? detail.name_ar : detail.name_en"
        >
          <div class="w-full overflow-hidden rounded-xl shadow-md relative bg-gray-50 aspect-square">
            <img
              :src="detail.media[0]?.url || '/placeholder.jpg'"
              :alt="locale === 'ar' ? detail.name_ar : detail.name_en"
              class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </div>

          <p class="mt-4 mb-2 text-center px-2 text-gray-800 font-medium text-sm sm:text-base md:text-lg line-clamp-2">
            {{ locale === 'ar' ? detail.name_ar : detail.name_en }}
          </p>
        </div>
      </div>

      <!-- PrimeVue Pagination -->
      <div v-if="totalRecords > perPageLimit" class="mt-12 flex justify-center">
        <Paginator
          :rows="perPageLimit"
          :totalRecords="totalRecords"
          :first="(currentPage - 1) * perPageLimit"
          @page="onPageChange"
          template="PrevPageLink PageLinks NextPageLink"
          class="custom-paginator"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import Paginator from 'primevue/paginator'

defineProps({
  title: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const locale = ref(localStorage.getItem('appLang') || 'ar')
const router = useRouter()
const route = useRoute()

const customTabs = ref([])
const isLoading = ref(true)
const error = ref(null)
const currentPage = ref(1)
const totalRecords = ref(0)
const isMobile = ref(false)

// Responsive per-page limit
const checkScreenSize = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 768
  }
}

const perPageLimit = computed(() => {
  return isMobile.value ? 10 : 20  // Adjusted for better UX (was 8/15 → now 10/20)
})

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  fetchCustomTabs(route.params.id, currentPage.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

// Fetch Data
const fetchCustomTabs = async (id, page = 1) => {
  if (!id) {
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const response = await axios.get(`/api/home/get-custom-tab-details/${id}`, {
      params: {
        limit: perPageLimit.value,
        page
      }
    })

    const apiData = response.data.data

    customTabs.value = [
      {
        id: id,
        name_ar: apiData.name_ar || 'قسم مخصص',
        name_en: apiData.name_en || 'Custom Section',
        type: apiData.type,
        row_type: apiData.type === 1 ? 1 : 2,
        details: (apiData.details.data || []).map(item => ({
          id: item.id,
          name_ar: item.name_ar,
          name_en: item.name_en,
          has_subcategories: item.has_subcategories,
          media: item.media || []
        }))
      }
    ]

    // Pagination data
    const paginate = apiData.details
    currentPage.value = paginate.current_page
    totalRecords.value = paginate.total

    // Update URL without triggering navigation loop
    if (route.query.page !== String(currentPage.value)) {
      router.replace({
        query: { ...route.query, page: currentPage.value > 1 ? currentPage.value : undefined }
      }).catch(() => {})
    }
  } catch (err) {
    console.error('Error fetching custom tabs:', err)
    error.value = t('error.fetchFailed') || 'Failed to load content.'
  } finally {
    isLoading.value = false
  }
}

// Navigation
const navigateToDetail = (hasSubcategories, id, name) => {
  const routeName = hasSubcategories ? 'subcategory' : 'produts_category'
  router.push({
    name: routeName,
    params: { id },
    query: { name: encodeURIComponent(name) } // optional: pass name for SEO/breadcrumb
  })
}

// Pagination Handler
const onPageChange = (event) => {
  const newPage = event.page + 1
  currentPage.value = newPage
  fetchCustomTabs(route.params.id, newPage)
}

// Watchers
watch(() => route.params.id, (newId) => {
  if (newId) {
    currentPage.value = 1
    fetchCustomTabs(newId, 1)
  }
})

watch(perPageLimit, () => {
  currentPage.value = 1
  fetchCustomTabs(route.params.id, 1)
})

watch(() => route.query.page, (newPage) => {
  const pageNum = parseInt(newPage) || 1
  if (pageNum !== currentPage.value) {
    currentPage.value = pageNum
    fetchCustomTabs(route.params.id, pageNum)
  }
})
</script>


<style scoped>
/* Custom animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.animate-progress {
  animation: progress 2s ease-in-out infinite;
}

/* PrimeVue Paginator custom styles */
.custom-paginator {
  margin-top: 2rem;
  padding-bottom: 0.5rem;
}

.custom-paginator :deep(.p-paginator) {
  @apply flex items-center justify-center gap-1 bg-transparent;
}

.custom-paginator :deep(.p-paginator-page),
.custom-paginator :deep(.p-paginator-next),
.custom-paginator :deep(.p-paginator-prev),
.custom-paginator :deep(.p-paginator-first),
.custom-paginator :deep(.p-paginator-last) {
  @apply min-w-[2.5rem] h-10 rounded-md border border-gray-300 bg-white text-gray-400 transition-colors hover:bg-gray-100;
}

.custom-paginator :deep(.p-paginator-page.p-highlight) {
  @apply bg-indigo-600 text-white border-yellow-100;
}

.custom-paginator :deep(.p-paginator-prev),
.custom-paginator :deep(.p-paginator-next),
.custom-paginator :deep(.p-paginator-first),
.custom-paginator :deep(.p-paginator-last) {
  @apply flex items-center justify-center;
}

/* Product card hover effect */
.group:hover {
  transform: translateY(-0.5rem);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Image container */
.h-60 {
  height: 15rem;
}

/* Line clamp for product names */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom range slider styles */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 5px;
  outline: none;
  transition: background 0.3s;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: #4f46e5;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #4f46e5;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}

input[type="range"]:focus::-moz-range-thumb {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .xs\:text-lg {
    font-size: 1.125rem;
    line-height: 1.75rem;
  }
  .h-60 {
    height: 10rem;
  }
}

@media (max-width: 768px) {
  .sm\:text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}

@media (max-width: 1024px) {
  .md\:text-2xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
  .lg\:text-3xl {
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}
</style>
