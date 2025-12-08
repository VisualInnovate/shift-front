<template>
  <div class="mx-auto mt-16 max-w-[1500px] px-4 sm:px-6 lg:px-8 pb-20">
    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
      <svg class="animate-spin h-12 w-12 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="mt-4 text-gray-600">{{ t('common.loading') }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-32">
      <p class="text-xl font-semibold text-red-600 mb-6">{{ error }}</p>
      <button @click="fetchProducts(currentPage)" class="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition">
        {{ t('products.retry') }}
      </button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <h2 class="text-center text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-10">
        {{ title || t('products.allProducts') }}
      </h2>

      <!-- Products Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5 lg:gap-8">
        <div
          v-for="pro in products"
          :key="pro.id"
          class="group cursor-pointer"
          @click="router.push({ name: 'Product-details', params: { id: pro.id } })"
        >
          <div class="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-full">

            <!-- Image Container -->
            <div class="relative aspect-square overflow-hidden bg-gray-50">
              <!-- Best Seller Badge -->
              <div v-if="pro.is_best_seller"
                class="absolute top-3 left-3 z-10 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Best Seller
              </div>

              <!-- Product Image -->
              <img
                :src="pro.img"
                :alt="pro.name"
                class="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
                @error="(e) => e.target.src = defaultProductImage"
              />

              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

              <!-- Wishlist Button -->
              <button
                v-if="authStore.authenticatedweb"
                @click.stop="toggleFavorite(pro)"
                class="absolute top-3 right-3 z-20 p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                :class="{ 'text-red-500': pro.is_wished }"
                aria-label="Wishlist"
              >
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            </div>

            <!-- Card Body -->
            <div class="p-4 flex flex-col flex-grow">
              <h3 class="font-semibold text-gray-900 text-base line-clamp-2 leading-tight mb-2">
                {{ truncate(pro.name, 50) }}
              </h3>

              <p v-if="pro.sub_name" class="text-gray-600 text-sm line-clamp-2 mb-3">
                {{ pro.sub_name }}
              </p>

              <!-- Rating -->
              <div class="flex items-center gap-1 mb-3">
                <span class="text-yellow-500 font-bold text-sm">{{ pro.total_rating || '0.0' }}</span>
                <svg class="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27l6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73-1.64 7.03z"/>
                </svg>
                <span class="text-gray-500 text-xs">({{ pro.total_reviews || 0 }})</span>
              </div>

              <!-- Price & Cart -->
              <div class="mt-auto flex items-center justify-between">
                <div class="flex items-baseline gap-2">
                  <span class="text-2xl font-bold text-gray-900">
                    {{ $t('currencyLabel') }} {{ formatPrice(pro.final_price) }}
                  </span>
                  <span v-if="pro.total_discounts_value > 0"
                    class="text-base line-through text-blue-600 opacity-80 ml-2">
                    {{ $t('currencyLabel') }} {{ formatPrice(pro.base_price) }}
                  </span>
                </div>

                <!-- Add to Cart -->
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
              <div v-if="pro.is_free_shipping" class="flex items-center mt-3 text-[#0b3baa] text-xs font-medium">
                <i class="pi pi-truck mr-1"></i>
                {{ $t("products.Free_Delivery") }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="mt-16 flex justify-center">
        <nav class="inline-flex gap-2" aria-label="Pagination">
          <button
            v-for="(link, i) in pagination.links"
            :key="i"
            @click="link.url && goToPage(getPageFromUrl(link.url))"
            :disabled="!link.url"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition',
              link.active
                ? 'bg-indigo-600 text-white'
                : link.url
                ? 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            ]"
          >
            <span v-html="link.label"></span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useAuthStore } from '../../../../../stores/WebAuth'
const { t, locale } = useI18n();

const storedLanguage = localStorage.getItem('appLang') || 'en';
locale.value = storedLanguage;
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

defineProps({
  title: { type: String, default: '' }
})

const defaultProductImage = '/placeholder.jpg' // or import your default image

// State
const isLoading = ref(true)
const error = ref(null)
const products = ref([])
const currentPage = ref(1)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  links: []
})

// Responsive limit
const perPage = computed(() => window.innerWidth < 768 ? 10 : 20)

const fetchProducts = async (page = 1) => {
  isLoading.value = true
  error.value = null
  try {
    const res = await axios.get(`/api/home/get-custom-tab-details/${route.params.id}`, {
      params: { page, limit: perPage.value }
    })

    const data = res.data.data?.details || []

    products.value = data.data.map(p => ({
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

    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      links: data.links || []
    }
    currentPage.value = data.current_page
  } catch (err) {
    error.value = t('products.errorLoading') || 'Failed to load products'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const getPageFromUrl = (url) => {
  if (!url) return null
  const match = url.match(/page=(\d+)/)
  return match ? Number(match[1]) : 1
}

const goToPage = (page) => {
  if (page && page !== currentPage.value) {
    currentPage.value = page
    fetchProducts(page)
  }
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

// Lifecycle
onMounted(() => {
  fetchProducts(currentPage.value)

  const handleResize = () => {
    if (window.innerWidth < 768 && perPage.value !== 10 || window.innerWidth >= 768 && perPage.value !== 20) {
      currentPage.value = 1
      fetchProducts(1)
    }
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
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Card lift on hover */
.group:hover {
  transform: translateY(-8px);
}
</style>
