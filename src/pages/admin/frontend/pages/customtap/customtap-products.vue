<template>
  <div class="mx-auto mt-16 max-w-[1500px] px-4 sm:px-6 lg:px-8 pb-20">
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
      <svg class="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-4 text-gray-600">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="text-center py-32">
      <p class="text-xl font-semibold text-red-600 mb-6">{{ error }}</p>
      <button @click="fetchProducts(1)" class="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition">
        {{ t('products.retry') }}
      </button>
    </div>

    <div v-else>
      <h2 class="text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-10">
        {{ title || t('products.allProducts') }}
      </h2>

      <div v-if="products.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5 lg:gap-8">
        <div
          v-for="pro in products"
          :key="pro.id"
          class="group cursor-pointer"
          @click="router.push({ name: 'Product-details', params: { id: pro.id } })"
        >
          <div class="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full">

            <div class="relative aspect-square overflow-hidden bg-gray-50">
              <div v-if="pro.is_best_seller"
                class="absolute top-3 left-3 z-10 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Best Seller
              </div>

              <img
                :src="pro.img"
                :alt="pro.name"
                class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                @error="(e) => e.target.src = defaultProductImage"
              />

              <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <button
                v-if="authStore.authenticatedweb"
                @click.stop="toggleFavorite(pro)"
                class="absolute top-3 right-3 z-20 p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                :class="{ 'text-red-500': pro.is_wished }"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>

            <div class="p-4 flex flex-col flex-grow">
              <h3 class="font-semibold text-gray-900 text-base line-clamp-2 leading-tight mb-2">
                {{ truncate(pro.name, 50) }}
              </h3>

              <p v-if="pro.sub_name" class="text-gray-600 text-sm line-clamp-2 mb-3">
                {{ pro.sub_name }}
              </p>

              <div class="flex items-center gap-1 mb-3">
                <span class="text-yellow-500 font-bold text-sm">{{ pro.total_rating || '0.0' }}</span>
                <svg class="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73-1.64 7.03z"/>
                </svg>
                <span class="text-gray-500 text-xs">({{ pro.total_reviews || 0 }})</span>
              </div>

              <div class="mt-auto flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-xl font-bold text-gray-900">
                    {{ $t('currencyLabel') }} {{ formatPrice(pro.final_price) }}
                  </span>
                  <span v-if="pro.total_discounts_value > 0"
                    class="text-sm line-through text-red-500 opacity-80">
                    {{ $t('currencyLabel') }} {{ formatPrice(pro.base_price) }}
                  </span>
                </div>

                <button
                  @click.stop="addToCart(pro)"
                  :disabled="pro.is_stock === 0"
                  class="p-3 rounded-full transition-all duration-300 shadow-md"
                  :class="[
                    pro.in_cart
                      ? 'bg-[#0b3baa] text-white'
                      : pro.is_stock === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#A6853B] text-white hover:bg-[#8f702c]'
                  ]"
                >
                  <svg v-if="pro.in_cart" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0 .984.984 0 0 0 0 1.4l4.2 4.2c.39.39 1.01.39 1.4 0l8.4-8.4a.984.984 0 0 0 0-1.4.984.984 0 0 0-1.4 0L9 16.2z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.708.707 1.708H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </button>
              </div>
              <!-- Free Shipping -->
              <div v-if="pro.is_free_shipping" class="flex items-center text-[#0b3baa] text-xs font-medium mt-2">
                <span class="pi pi-truck mr-2"></span>
                {{ t('products.Free_Delivery') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalProducts > perPage" class="mt-10 flex justify-center">
        <Paginator
          :rows="perPage"
          :totalRecords="totalProducts"
          :first="(currentPage - 1) * perPage"
          @page="onPageChange($event)"
          template="PrevPageLink PageLinks NextPageLink"
          class="custom-paginator"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import Paginator from 'primevue/paginator' // Import PrimeVue Paginator
import { useAuthStore } from '../../../../../stores/WebAuth'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

defineProps({
  title: { type: String, default: '' }
})

const defaultProductImage = '/placeholder.jpg'

// State
const isLoading = ref(true)
const error = ref(null)
const products = ref([])
const currentPage = ref(1)
const totalProducts = ref(0) // Added for Paginator

// Responsive limit logic
const perPage = computed(() => (window.innerWidth < 768 ? 10 : 20))

const fetchProducts = async (page = 1) => {
  isLoading.value = true
  error.value = null
  try {
    const res = await axios.get(`/api/home/get-custom-tab-details/${route.params.id}`, {
      params: {
        page,
        limit: perPage.value
      }
    })

    const apiResponse = res.data.data?.details || { data: [], total: 0 }

    products.value = apiResponse.data.map(p => ({
      id: p.id,
      name: locale.value === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar),
      sub_name: locale.value === 'ar' ? (p.sub_name_ar || p.sub_name_en) : (p.sub_name_en || p.sub_name_ar),
      base_price: parseFloat(p.base_price),
      final_price: p.total_discounts_value > 0
        ? parseFloat(p.base_price) - parseFloat(p.total_discounts_value)
        : parseFloat(p.base_price),
      total_discounts_value: parseFloat(p.total_discounts_value || 0),
      img: p.media?.find(m => m.name === 'product_main_image')?.url || p.key_default_image || defaultProductImage,
      total_rating: p.total_rating || 0,
      total_reviews: p.total_reviews || 0,
      is_wished: p.is_wished || false,
      in_cart: p.in_cart || false,
      is_stock: p.is_stock,
      is_free_shipping: p.is_free_shipping || false,
      is_best_seller: p.is_best_seller || false,
    }))

    totalProducts.value = apiResponse.total // Map API total to ref
    currentPage.value = apiResponse.current_page
  } catch (err) {
    error.value = t('products.errorLoading') || 'Failed to load products'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

// Paginator change handler
const onPageChange = (event) => {
  const newPage = event.page + 1 // PrimeVue is 0-indexed
  currentPage.value = newPage
  fetchProducts(newPage)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const addToCart = async (product) => {
  if (!authStore.authenticatedweb) return router.push({ name: 'AuthLogin' })
  if (product.is_stock === 0) return
  try {
    await axios.post('/api/cart/add', { product_id: product.id, quantity: 1 })
    product.in_cart = true
  } catch (err) {
    alert(t('cart.error'))
  }
}

const toggleFavorite = async (product) => {
  if (!authStore.authenticatedweb) return router.push({ name: 'AuthLogin' })
  const wasWished = product.is_wished
  try {
    if (wasWished) {
      await axios.delete(`/api/wishlists/${product.id}`)
    } else {
      await axios.post('/api/wishlists', { product_id: product.id })
    }
    product.is_wished = !wasWished
  } catch (err) {
    product.is_wished = wasWished
  }
}

const formatPrice = (price) => {
  const num = Number(price)
  return num % 1 === 0 ? num.toString() : num.toFixed(2)
}

const truncate = (str, n) => str?.length > n ? str.substr(0, n - 1) + '...' : str

onMounted(() => {
  fetchProducts(1)
  const handleResize = () => {
    // Optional: Refresh if perPage changes significantly
  }
  window.addEventListener('resize', handleResize)
  onUnmounted(() => window.removeEventListener('resize', handleResize))
})

watch(() => route.params.id, () => {
  currentPage.value = 1
  fetchProducts(1)
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
