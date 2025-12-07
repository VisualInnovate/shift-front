<template>
  <div class="product-page max-w-7xl mx-auto p-4 lg:p-8">
    <!-- Loading & Error -->
    <div v-if="isLoading" class="text-center py-20">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="mt-4 text-gray-600">{{ t('loading') }}</p>
    </div>
    <div v-if="error" class="text-red-500 text-center py-10 text-lg">{{ error }}</div>

    <!-- Product Content -->
    <div v-else>
      <header class="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
        <!-- Image Gallery -->
        <div class="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row items-center gap-4">
          <div class="flex lg:flex-col flex-row items-center justify-center lg:justify-start gap-3 w-full lg:w-1/4 order-2 lg:order-1">
            <img
              v-for="img in displayedImages"
              :key="img.url"
              :src="img.url"
              :alt="t('product.thumbnailAlt')"
              class="h-20 w-20 object-contain rounded-lg cursor-pointer border-2 transition-all duration-200 hover:border-blue-500"
              :class="{ 'border-blue-500 opacity-100': currentImg === img.url, 'border-gray-300 opacity-70': currentImg !== img.url }"
              @click="changeImg(img.url)"
            />
          </div>
          <div class="w-full lg:w-3/4 order-1 lg:order-2">
            <div class="relative w-full aspect-square shadow-xl rounded-2xl overflow-hidden bg-gray-50">
              <!-- Badges -->
              <div v-if="selectedVariant?.is_best_seller || pro.is_best_seller"
                class="absolute top-4 left-4 z-10 bg-black text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg">
                Best Seller
              </div>
              <div v-if="selectedVariant?.is_free_shipping || pro.is_free_shipping"
                class="absolute top-4 right-4 z-10 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <i class="pi pi-truck"></i>
                {{ t('products.Free_Delivery') }}
              </div>
              <img
                :src="currentImg || selectedVariant?.image || pro.key_default_image"
                :alt="locale === 'en' ? pro.name_en : pro.name_ar"
                class="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="w-full lg:w-1/2">
          <div class="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <!-- Store / Category / Brand -->
            <section class="flex flex-wrap gap-3 mb-6">
              <span v-if="pro.store_id" @click="selectStore(pro.store)" class="sub-tiles cursor-pointer">
                {{ locale === 'en' ? pro.store?.name_en : pro.store?.name_ar || t('store.default') }}
              </span>
              <span v-if="pro.category" @click="goCatgory(pro.category)" class="sub-tiles cursor-pointer">
                {{ locale === 'en' ? pro.category.name_en : pro.category.name_ar }}
              </span>
              <span v-if="pro.brand_id" @click="goBrand(pro.brand)" class="sub-tiles cursor-pointer">
                {{ locale === 'en' ? pro.brand?.name_en : pro.brand?.name_ar || t('brand.default') }}
              </span>
            </section>

            <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-3 leading-tight">
              {{ locale === 'en' ? pro.name_en : pro.name_ar }}
            </h1>
            <h2 v-if="pro.sub_name_en || pro.sub_name_ar" class="text-xl text-gray-600 mb-6">
              {{ locale === 'en' ? pro.sub_name_en : pro.sub_name_ar }}
            </h2>

            <!-- Rating -->
            <div class="flex items-center gap-3 mb-6">
              <Rating :modelValue="averageRating" :readonly="true" :cancel="false" class="text-lg" />
              <span class="text-gray-600">({{ reviews.length }} {{ reviews.length === 1 ? t('reviews.singular') : t('reviews.plural') }})</span>
            </div>

            <hr class="bg-gradient-to-r from-transparent via-[#A17D1C] to-transparent h-0.5 my-8" />

            <!-- Variant Selectors -->
            <div v-if="hasVariants" class="space-y-6 mb-8">
              <div v-for="(options, attrName) in variantAttributes" :key="attrName">
                <label class="block text-lg font-semibold text-gray-700 mb-3 capitalize">
                  {{ t('product.select') }} {{ attrName }}
                </label>
                <div class="flex flex-wrap gap-3">
                  <button
                    v-for="opt in options"
                    :key="opt.id"
                    @click="selectVariantOption(attrName, opt)"
                    class="px-6 py-3 rounded-xl border-2 font-medium transition-all"
                    :class="{
                      'bg-[#A6853B] text-white border-[#A6853B]': isOptionSelected(attrName, opt),
                      'border-gray-300 hover:border-gray-400 bg-white': !isOptionSelected(attrName, opt)
                    }"
                  >
                    {{ locale === 'en' ? opt.value_en : opt.value_ar }}
                  </button>
                </div>
              </div>

              <!-- Stock Status -->
              <p v-if="selectedVariant && selectedVariant.quantity <= 0" class="text-red-600 font-bold">
                {{ t('product.outOfStock') }}
              </p>
              <p v-else-if="selectedVariant" class="text-green-600 font-medium">
                {{ t('product.inStock') }} ({{ selectedVariant.quantity }} {{ t('product.available') }})
              </p>
            </div>

            <!-- Price -->
            <div class="mb-8">
              <div class="flex items-baseline gap-4 flex-wrap">
                <span class="text-4xl font-bold text-gray-900">
                  {{ formatPrice(currentPrice) }} {{ $t("currencyLabel") }}
                </span>
                <span v-if="hasDiscount" class="text-2xl font-bold text-[#0b3baa] line-through opacity-80">
                  {{ formatPrice(originalPrice) }} {{ $t("currencyLabel") }}
                </span>
                <span v-if="hasDiscount" class="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                  -{{ discountPercentage }}%
                </span>
              </div>
            </div>

            <!-- Quantity (only if in cart) -->
            <div v-if="pro.in_cart" class="flex items-center gap-6 mb-8">
              <label class="font-bold text-gray-700 text-lg">{{ t('product.quantity') }}:</label>
              <div class="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden select-none">
                <button @click="updateQuantity('minus')" :disabled="quantity <= 1 || isUpdatingQuantity || isOutOfStock"
                  class="px-5 py-3 text-2xl font-bold hover:bg-gray-100 disabled:opacity-50 transition">−</button>
                <span class="px-8 py-3 font-semibold text-lg border-x-2 border-gray-300 min-w-20 text-center">
                  {{ quantity }}
                </span>
                <button @click="updateQuantity('plus')" :disabled="isUpdatingQuantity || isOutOfStock"
                  class="px-5 py-3 text-2xl font-bold hover:bg-gray-100 disabled:opacity-50 transition">+</button>
              </div>
            </div>

            <!-- Add to Cart -->
            <button
              @click="handleCartAction"
              :disabled="isAddingToCart || isOutOfStock || (hasVariants && !selectedVariant)"
              class="w-full py-5 text-xl font-bold rounded-2xl text-white transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
              :class="{
                'bg-[#A6853B] hover:bg-[#8f702c]': !pro.in_cart && !isOutOfStock,
                'bg-[#0b3baa] hover:bg-[#093080]': pro.in_cart,
                'bg-gray-400 cursor-not-allowed': isOutOfStock || (hasVariants && !selectedVariant)
              }"
            >
              <svg v-if="pro.in_cart" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0 .984.984 0 0 0 0 1.4l4.2 4.2c.39.39 1.01.39 1.4 0l8.4-8.4a.984.984 0 0 0 0-1.4.984.984 0 0 0-1.4 0L9 16.2z"/>
              </svg>
              <span v-if="pro.in_cart">{{ t('product.inCart') }}</span>
              <span v-else-if="isOutOfStock || (hasVariants && !selectedVariant)">{{ t('product.selectVariant') }}</span>
              <span v-else>{{ isAddingToCart ? t('product.adding') + '...' : t('product.addToCart') }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Description -->
      <section class="bg-[#E6AC312B] px-8 py-10 rounded-2xl mt-12">
        <p class="text-gray-700 leading-relaxed text-base">
          {{ showFullDescription ? fullDescription : truncatedDescription }}
        </p>
        <button v-if="isDescriptionLong" @click="toggleDescription"
          class="mt-4 text-[#E39F30] font-bold text-sm hover:underline">
          {{ showFullDescription ? t('product.readLess') : t('product.readMore') }}
        </button>
      </section>

      <!-- Reviews & Offers (unchanged) -->
      <section class="mt-12 p-8 bg-white rounded-2xl shadow-xl">
        <!-- Reviews section same as before -->
        <!-- ... (keep your existing reviews code) -->
      </section>

      <section class="mt-12">
        <ProductOffers />
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import Rating from 'primevue/rating'
import ProgressSpinner from 'primevue/progressspinner'
import ProductOffers from '../../components/ProductOffers.vue'
import { useAuthStore } from '../../../../../stores/WebAuth'
import { useToast } from 'primevue/usetoast'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

/* ───── STATE ───── */
const pro = ref({})
const rawVariants = ref([])
const variantAttributes = ref({}) // { weight: [...], color: [...] }
const selectedOptions = ref({})     // { weight: {id: 29, ...}, color: ... }
const selectedVariant = ref(null)   // final matched variant
const imgs = ref([])
const currentImg = ref('')
const quantity = ref(1)
const isLoading = ref(true)
const error = ref(null)
const isAddingToCart = ref(false)
const isUpdatingQuantity = ref(false)
const reviews = ref([])
const showFullDescription = ref(false)

/* ───── COMPUTED ───── */
const hasVariants = computed(() => pro.value.has_variants === true)
const displayedImages = computed(() => {
  const variantImg = selectedVariant.value?.image ? [{ url: selectedVariant.value.image }] : []
  return [...variantImg, ...(imgs.value || [])]
})

const currentPrice = computed(() => selectedVariant.value?.price_after_discount || pro.value.base_price_after_discount || pro.value.base_price)
const originalPrice = computed(() => selectedVariant.value?.price || pro.value.base_price)
const hasDiscount = computed(() => parseFloat(originalPrice.value) > parseFloat(currentPrice.value))
const discountPercentage = computed(() => {
  const orig = parseFloat(originalPrice.value)
  const curr = parseFloat(currentPrice.value)
  return orig > curr ? Math.round(((orig - curr) / orig) * 100) : 0
})
const isOutOfStock = computed(() => !selectedVariant.value || selectedVariant.value.quantity <= 0)

const fullDescription = computed(() =>
  locale.value === 'en' ? pro.value.description_en || t('product.noDescription') : pro.value.description_ar || t('product.noDescription')
)
const isDescriptionLong = computed(() => fullDescription.value.length > 300)
const truncatedDescription = computed(() => isDescriptionLong.value ? fullDescription.value.slice(0, 300) + '...' : fullDescription.value)

const averageRating = computed(() => reviews.value.length ? (reviews.value.reduce((a, r) => a + r.rate, 0) / reviews.value.length) : 0)

/* ───── METHODS ───── */
const changeImg = (url) => (currentImg.value = url)
const toggleDescription = () => (showFullDescription.value = !showFullDescription.value)
const formatPrice = (v) => parseFloat(v || 0).toFixed(2)
const formatDate = (d) => new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })

// Variant Logic
const selectVariantOption = (attrName, option) => {
  selectedOptions.value[attrName] = option
  matchVariant()
}

const isOptionSelected = (attrName, option) => {
  return selectedOptions.value[attrName]?.id === option.id
}

const matchVariant = () => {
  if (!hasVariants.value) return
  const keys = Object.keys(selectedOptions.value)
  if (keys.length !== Object.keys(variantAttributes.value).length) {
    selectedVariant.value = null
    return
  }

  const matched = rawVariants.value.find(v => {
    return keys.every(key => {
      const selected = selectedOptions.value[key]
      return v.attributes[key] && v.attributes[key].id === selected.id
    })
  })

  selectedVariant.value = matched || null
  if (matched?.image) currentImg.value = matched.image
}

// Cart
const addToCart = async () => {
  if (!authStore.authenticatedweb) return router.push({ name: 'authlog' })
  if (isOutOfStock.value || isAddingToCart.value) return

  const variantId = hasVariants.value ? selectedVariant.value?.variant_id : null
  if (hasVariants.value && !variantId) return

  isAddingToCart.value = true
  try {
    await axios.post('/api/cart/add', {
      product_id: pro.value.id,
      variant_id: variantId,
      quantity: 1
    })
    pro.value.in_cart = true
    quantity.value = 1
    toast.add({ severity: 'success', detail: t('cart.added'), life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', detail: e.response?.data?.message || t('cart.error'), life: 3000 })
  } finally {
    isAddingToCart.value = false
  }
}

const updateQuantity = async (action) => {
  // ... same as before
}

const handleCartAction = () => {
  if (pro.value.in_cart || isOutOfStock.value) return
  if (hasVariants.value && !selectedVariant.value) {
    toast.add({ severity: 'warn', detail: t('product.selectVariant'), life: 3000 })
    return
  }
  addToCart()
}

// Navigation
const goCatgory = (cat) => { /* ... */ }
const goBrand = (brand) => { /* ... */ }
const selectStore = (store) => { /* ... */ }

/* ───── FETCH DATA ───── */
const fetchProductData = async () => {
  isLoading.value = true
  error.value = null
  try {
    const { data } = await axios.get(`/api/home/product-details/${route.params.id}`)
    if (data.is_success) {
      const p = data.data.product
      pro.value = {
        ...p,
        in_cart: !!p.in_cart,
        isOutOfStock: p.is_stock === 0
      }

      // Images
      imgs.value = p.media || []
      currentImg.value = p.key_default_image || imgs.value[0]?.url || ''

      // Reviews
      reviews.value = p.reviews || []
      quantity.value = p.in_cart ? (p.quantity || 1) : 1

      // Variants
      if (p.has_variants && data.data.variants_details) {
        const attrs = data.data.variants_details.attributes || {}
        variantAttributes.value = attrs

        // Build full variant list with attributes object
        rawVariants.value = (data.data.variants_details.combinations || []).map(comb => {
          const attributes = {}
          Object.keys(attrs).forEach(attrName => {
            const found = attrs[attrName].find(opt => 
              comb[attrName] === opt.value_en || comb[attrName] === opt.value_ar || 
              comb.attribute_values?.[attrName] === opt.id
            )
            if (found) attributes[attrName] = found
          })
          return {
            variant_id: comb.variant_id,
            price: comb.price,
            price_after_discount: comb.price_after_discount || comb.price,
            quantity: comb.quantity ?? 999,
            image: comb.image,
            sku: comb.sku,
            attributes
          }
        })

        // Auto-select first options
        Object.keys(attrs).forEach(attr => {
          selectedOptions.value[attr] = attrs[attr][0]
        })
        matchVariant()
      }
    } else {
      error.value = t('product.notFound')
    }
  } catch (e) {
    error.value = e.response?.data?.message || t('product.loadError')
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, () => {
  fetchProductData()
  window.scrollTo(0, 0)
})

onMounted(() => {
  fetchProductData()
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.sub-tiles {
  @apply bg-[#E6AC312B] px-5 py-3 rounded-xl font-medium text-sm text-gray-700 hover:bg-[#d89c284d] transition;
}
</style>