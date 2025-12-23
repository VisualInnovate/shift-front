<template>
  <div class="mx-auto px-4 max-w-[1500px] pb-20">
    <div v-if="isLoading" class="flex flex-col justify-center items-center py-32">
      <svg class="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-4 text-gray-600 font-medium">{{ t('common.loading') || 'Loading...' }}</p>
    </div>

    <div v-else-if="error" class="text-center py-32 animate-fade-in">
      <div class="bg-red-50 inline-block p-8 rounded-2xl border border-red-100">
        <p class="text-xl font-semibold text-red-600 mb-6">{{ error }}</p>
        <button
          @click="fetchCustomTabs(route.params.id, 1)"
          class="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
        >
          {{ t('common.retry') || 'Retry' }}
        </button>
      </div>
    </div>

    <div v-else class="animate-fade-in">
      <div v-for="tab in customTabs" :key="tab.id" class="m-auto max-w-7xl">
        <h2 class="font-bold text-gray-800 lg:mt-12 mt-6 text-center text-2xl sm:text-3xl md:text-4xl mb-10">
          {{ title || (locale === 'ar' ? tab.name_ar : tab.name_en) || 'Category' }}
        </h2>

        <div
          v-if="tab.details && tab.details.length > 0"
          class="grid gap-x-6 gap-y-10"
          :class="
            tab.row_type === 1
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
          "
        >
          <div
            v-for="(detail, i) in tab.details"
            :key="i"
            class="group flex flex-col cursor-pointer"
            @click="navigateToDetail(detail.id)"
          >
            <div class="w-full overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 relative bg-white aspect-square border border-gray-100">
              <img
                :src="detail.media[0]?.url || '/placeholder.jpg'"
                :alt="locale === 'ar' ? detail.name_ar : detail.name_en"
                class="w-full h-full  transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                @error="(e) => e.target.src = '/placeholder.jpg'"
              />
              <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
            </div>

            <p class="mt-4 text-center px-2 text-gray-900 font-semibold text-base md:text-lg line-clamp-2 group-hover:text-indigo-600 transition-colors">
              {{ locale === 'ar' ? detail.name_ar : detail.name_en }}
            </p>
          </div>
        </div>

        <div v-else class="text-center py-20 bg-gray-50 rounded-3xl">
          <svg class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="mt-4 text-gray-500 text-lg">{{ t('common.no_data') || 'No items available in this section' }}</p>
        </div>

        <div v-if="totalRecords > perPageLimit" class="mt-10 flex justify-center">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useI18n } from 'vue-i18n'
import Paginator from 'primevue/paginator'

// --- Props ---
defineProps({
  title: { type: String, default: '' }
})

// --- Setup ---
const { t, locale: i18nLocale } = useI18n()
const locale = computed(() => i18nLocale.value)

const router = useRouter()
const route = useRoute()

// --- State ---
const customTabs = ref([])
const isLoading = ref(true)
const error = ref(null)
const totalRecords = ref(0)
const currentPage = ref(parseInt(route.query.page) || 1)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200)

// --- Responsiveness ---
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

const perPageLimit = computed(() => {
  return windowWidth.value < 768 ? 8 : 15
})

// --- Data Fetching ---
const fetchCustomTabs = async (id, page = 1) => {
  if (!id) return

  isLoading.value = true
  error.value = null

  try {
    const response = await axios.get(`/api/home/get-custom-tab-details/${id}`, {
      params: {
        limit: perPageLimit.value,
        page: page
      }
    })

    const apiData = response.data.data
    // Ensure we are drilling into the right level of the response
    const paginationSource = apiData.details || { data: [], total: 0, current_page: 1 }

    customTabs.value = [
      {
        id: id,
        name_ar: apiData.name_ar || t('home.customTabTitle', { number: id }),
        name_en: apiData.name_en || t('home.customTabTitle', { number: id }),
        type: apiData.type,
        row_type: apiData.type === 1 ? 1 : 2,
        details: (paginationSource.data || []).map((item) => ({
          id: item.id,
          name_ar: item.name_ar,
          name_en: item.name_en,
          has_subcategories: item.has_subcategories,
          media: item.media || []
        }))
      }
    ]

    totalRecords.value = paginationSource.total
    currentPage.value = paginationSource.current_page

    // Sync URL query
    router.replace({
      query: { ...route.query, page: page > 1 ? page : undefined }
    }).catch(() => {})

  } catch (err) {
    console.error('Fetch Error:', err)
    error.value = t('error.fetchFailed') || 'Failed to load custom content.'
  } finally {
    isLoading.value = false
  }
}

// --- Handlers ---
const onPageChange = (event) => {
  const newPage = event.page + 1
  currentPage.value = newPage
  fetchCustomTabs(route.params.id, newPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const navigateToDetail = (id) => {
  router.push({ name: 'products-brand', params: { id: id } })
}

// --- Lifecycle ---
onMounted(() => {
  window.addEventListener('resize', handleResize)
  fetchCustomTabs(route.params.id, currentPage.value)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// --- Watchers ---
watch(() => route.params.id, (newId) => {
  if (newId) {
    currentPage.value = 1
    fetchCustomTabs(newId, 1)
  }
})

watch(perPageLimit, () => {
  fetchCustomTabs(route.params.id, 1)
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
