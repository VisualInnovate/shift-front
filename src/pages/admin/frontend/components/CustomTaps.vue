<template>
  <div class="mx-auto px-4 max-w-[1500px]">
    <!-- Custom Tabs -->
    <div v-for="tab in customTabs" :key="tab.id" class="mb-12">
      <div class="flex items-center justify-between">
        <h2
          class="font-bold font-sans text-gray-800 mt-4 text-lg sm:text-xl md:text-2xl lg:text-3xl"
        >
          {{ locale === 'ar' ? tab.name_ar : tab.name_en }}
        </h2>
      </div>

      <!-- Swiper -->
      <swiper
        :modules="[Autoplay, Grid]"
        :slides-per-view="tab.row_type === 1 ? 4 : 2"
        :grid="tab.row_type === 2 ? { rows: 2, fill: 'row' } : undefined"
        :space-between="tab.row_type === 1 ? 8 : 16"
        :loop="true"
        :autoplay="{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }"
        :speed="30000"
        :grab-cursor="true"
        :allow-touch-move="true"
        class="mt-6 pb-8"
        :breakpoints="getBreakpoints(tab.row_type)"
      >
        <swiper-slide
          v-for="(detail, i) in tab.details"
          :key="detail.id || i"
          class="group flex flex-col items-start rounded-lg shadow-lg transition-all duration-300 hover:-translate-y-2 h-auto"
        >
          <router-link
            :to="linkToDetail(detail.type, detail.id, locale === 'ar' ? detail.name_ar : detail.name_en)"
            class="block w-full"
          >
            <div class="w-full aspect-[3.3/4] overflow-hidden rounded-xl shadow-sm relative bg-gray-50">
              <img
                :src="detail.media?.[0]?.url || '/placeholder.jpg'"
                :alt="locale === 'ar' ? detail.name_ar : detail.name_en"
                class="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 pointer-events-none"></div>
            </div>

            <p class="font-sans mt-4 mb-2 text-center mx-3 text-gray-800 font-medium text-sm sm:text-base md:text-lg line-clamp-2">
              {{ locale === 'ar' ? detail.name_ar : detail.name_en }}
            </p>
          </router-link>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Grid } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/grid'
import axios from 'axios'

const locale = ref(localStorage.getItem('appLang') || 'ar')
const customTabs = ref([])
const router = useRouter()
const route = useRoute()
const storeId = ref(localStorage.getItem('defaultStoreId') || null)

// Responsive breakpoints based on row_type
const getBreakpoints = (rowType) => {
  const isGrid = rowType === 2
  return {
    320: {
      slidesPerView: 2,
      spaceBetween: 8,
      grid: isGrid ? { rows: 2 } : undefined
    },
    640: {
      slidesPerView: 2,
      spaceBetween: 12,
      grid: isGrid ? { rows: 2 } : undefined
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 16,
      grid: isGrid ? { rows: 2 } : undefined
    },
    1024: {
      slidesPerView: isGrid ? 5 : 5,
      spaceBetween: 20,
      grid: isGrid ? { rows: 2 } : undefined
    },
    1280: {
      slidesPerView: isGrid ? 6 : 6,
      spaceBetween: 24,
      grid: isGrid ? { rows: 2 } : undefined
    }
  }
}

// Generate correct route based on detail.type ("1", "2", "3")
const linkToDetail = (type, id, name) => {
  if (!id) return '#'

  const routeMap = {
    '1': 'customtap-category',
    '2': 'customtap-products',
    '3': 'customtap-brand'
  }

  const routeName = routeMap[type]

  if (!routeName) {
    console.warn('Unknown detail type:', type)
    return '#'
  }

  return {
    name: routeName,
    params: { id },
    query: { title: name || 'Item' }
  }
}

// Fetch custom tabs
const fetchCustomTabs = async () => {
  const id = route.params.id || storeId.value
  if (!id) {
    console.error('No store/category ID available')
    return
  }

  axios
    .get(`/api/home/get-custom-tab/${id}`)
    .then((response) => {
      // API returns: response.data.data.data → array of tabs
      const tabsData = response.data?.data?.data || []
      customTabs.value = tabsData.map(tab => ({
        ...tab,
        details: tab.details || []
      }))
    })
    .catch((error) => {
      console.error('Error fetching custom tabs:', error)
      customTabs.value = []
    })
}

// Watch route changes (e.g., when navigating between stores/categories)
watch(
  () => [route.name, route.params.id],
  () => {
    fetchCustomTabs()
  },
  { immediate: true }
)

// Initial load
onMounted(() => {
  fetchCustomTabs()
})
</script>

<style scoped>
.swiper {
  @apply w-full overflow-hidden;
}

.swiper-slide {
  @apply h-auto flex flex-col;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Custom scrollbar (optional) */
::-webkit-scrollbar {
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded-full;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}
</style>
