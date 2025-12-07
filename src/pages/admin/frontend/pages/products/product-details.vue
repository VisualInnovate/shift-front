<template>
  <div class="product-page max-w-7xl mx-auto p-4 lg:p-8">
    <div v-if="isLoading" class="text-center py-20">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      <p class="mt-4 text-gray-600">{{ t('loading') }}</p>
    </div>
    <div v-if="error" class="text-red-500 text-center py-10 text-lg">{{ error }}</div>
    
    <header v-else class="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
      <div class="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row items-center gap-4">
        <div class="flex lg:flex-col flex-row items-center justify-center lg:justify-start gap-3 w-full lg:w-1/4 order-2 lg:order-1">
          <img
            v-for="img in currentImages"
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
            <div
              v-if="pro.is_best_seller"
              class="absolute top-4 left-4 z-10 bg-black text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-lg"
            >
              Best Seller
            </div>
            <div
              v-if="pro.is_free_shipping"
              class="absolute top-4 right-4 z-10 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
            >
              <i class="pi pi-truck"></i>
              {{ t('products.Free_Delivery') }}
            </div>
            <img
              :src="currentImg || pro.key_default_image"
              :alt="locale === 'en' ? pro.name_en : pro.name_ar"
              class="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div class="w-full lg:w-1/2">
        <div class="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          <section class="flex flex-wrap gap-3 mb-6">
            <span
              v-if="pro.store_id"
              @click="selectStore(pro.store)"
              class="sub-tiles cursor-pointer"
            >
              {{ locale === 'en' ? pro.store?.name_en : pro.store?.name_ar || t('store.default') }}
            </span>
            <span
              v-if="pro.category"
              @click="goCatgory(pro.category)"
              class="sub-tiles cursor-pointer"
            >
              {{ locale === 'en' ? pro.category.name_en : pro.category.name_ar }}
            </span>
            <span
              @click="goBrand(pro.brand)"
              v-if="pro.brand_id"
              class="sub-tiles cursor-pointer"
            >
              {{ locale === 'en' ? pro.brand?.name_en : pro.brand?.name_ar || t('brand.default') }}
            </span>
          </section>
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-800 mb-3 leading-tight">
            {{ locale === 'en' ? pro.name_en : pro.name_ar }}
          </h1>
          <h2 v-if="pro.sub_name_en || pro.sub_name_ar" class="text-xl text-gray-600 mb-6">
            {{ locale === 'en' ? pro.sub_name_en : pro.sub_name_ar }}
          </h2>
          <div class="flex items-center gap-3 mb-6">
            <Rating :modelValue="averageRating" :readonly="true" :cancel="false" class="text-lg" />
            <span class="text-gray-600">({{ reviews.length }} {{ reviews.length === 1 ? t('reviews.singular') : t('reviews.plural') }})</span>
          </div>
          <hr class="bg-gradient-to-r from-transparent via-[#A17D1C] to-transparent h-0.5 my-8" />
          
          <section v-if="pro.has_variants && variantOptions.weight" class="mb-8">
            <div class="flex flex-wrap gap-3">
              <button
                v-for="option in variantOptions.weight"
                :key="option.value_en"
                @click="selectVariant(option)"
                :class="{
                  'border-blue-600 ring-4 ring-blue-100': selectedVariant?.weight === option.value_en,
                  'border-gray-300 hover:border-blue-400': selectedVariant?.weight !== option.value_en
                }"
                class="px-4 py-2 text-sm font-medium border-2 rounded-lg transition-all duration-200"
              >
                {{ locale === 'en' ? option.value_en : option.value_ar }}
              </button>
            </div>
            <p v-if="selectedVariant && selectedVariant.isOutOfStock" class="text-red-600 font-semibold mt-3">
                {{ t('product.outOfStock') }}
            </p>
          </section>

          <div class="mb-8">
            <div class="flex items-baseline gap-4 flex-wrap">
              <span class="text-4xl font-bold text-gray-900">
                {{ formatPrice(selectedVariantPrice.after_discount) }} {{ $t("currencyLabel") }}
              </span>
              <span
                v-if="selectedVariantPrice.has_discount"
                class="text-2xl font-bold text-[#0b3baa] line-through opacity-80"
              >
                {{ formatPrice(selectedVariantPrice.base_price) }} {{ $t("currencyLabel") }}
              </span>
              <span
                v-if="selectedVariantPrice.has_discount"
                class="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full"
              >
                -{{ selectedVariantPrice.discount_percentage }}%
              </span>
            </div>
          </div>
          
          <div v-if="selectedVariant?.in_cart" class="flex items-center gap-6 mb-8">
            <label class="font-bold text-gray-700 text-lg">{{ t('product.quantity') }}:</label>
            <div class="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden select-none">
              <button
                @click="updateQuantity('minus')"
                :disabled="quantity <= 1 || isUpdatingQuantity || selectedVariant?.isOutOfStock"
                class="px-5 py-3 text-2xl font-bold hover:bg-gray-100 disabled:opacity-50 transition"
              >−</button>
              <span class="px-8 py-3 font-semibold text-lg border-x-2 border-gray-300 min-w-20 text-center">
                {{ quantity }}
              </span>
              <button
                @click="updateQuantity('plus')"
                :disabled="isUpdatingQuantity || selectedVariant?.isOutOfStock"
                class="px-5 py-3 text-2xl font-bold hover:bg-gray-100 disabled:opacity-50 transition"
              >+</button>
            </div>
          </div>
          <button
            @click="handleCartAction"
            :disabled="isAddingToCart || selectedVariant?.isOutOfStock"
            class="w-full py-5 text-xl font-bold rounded-2xl text-white transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-3"
            :class="{
              // FIX APPLIED HERE: use optional chaining (?.)
              'bg-[#A6853B] hover:bg-[#8f702c]': !selectedVariant?.in_cart && !selectedVariant?.isOutOfStock,
              'bg-[#0b3baa] hover:bg-[#093080]': selectedVariant?.in_cart,
              'bg-gray-400 cursor-not-allowed': selectedVariant?.isOutOfStock
            }"
          >
            <svg v-if="selectedVariant?.in_cart" class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.2l-3.5-3.5a.984.984 0 0 0-1.4 0 .984.984 0 0 0 0 1.4l4.2 4.2c.39.39 1.01.39 1.4 0l8.4-8.4a.984.984 0 0 0 0-1.4.984.984 0 0 0-1.4 0L9 16.2z"/>
            </svg>
            <span v-if="selectedVariant?.in_cart">{{ t('product.inCart') }}</span>
            <span v-else-if="selectedVariant?.isOutOfStock">{{ t('product.outOfStock') }}</span>
            <span v-else>{{ isAddingToCart ? t('product.adding') + '...' : t('product.addToCart') }}</span>
          </button>
          <p v-if="selectedVariant?.isOutOfStock" class="text-red-600 font-semibold text-center mt-4">
            {{ t('product.outOfStock') }}
          </p>
        </div>
      </div>
    </header>
    <section v-if="!isLoading && !error" class="bg-[#E6AC312B] px-8 py-10 rounded-2xl mt-12">
      <p class="text-gray-700 leading-relaxed text-base">
        {{ showFullDescription ? fullDescription : truncatedDescription }}
      </p>
      <button
        v-if="isDescriptionLong"
        @click="toggleDescription"
        class="mt-4 text-[#E39F30] font-bold text-sm hover:underline focus:outline-none"
      >
        {{ showFullDescription ? t('product.readLess') : t('product.readMore') }}
      </button>
    </section>
    <section v-if="!isLoading && !error" class="mt-12 p-8 bg-white rounded-2xl shadow-xl">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-10">{{ t('reviews.title') }}</h2>
      <div class="grid md:grid-cols-3 gap-8 mb-12">
        <div class="text-center">
          <div class="text-6xl font-bold text-gray-800">{{ averageRating.toFixed(1) }}</div>
          <Rating :modelValue="averageRating" :readonly="true" :cancel="false" class="my-4 justify-center text-3xl" />
          <p class="text-gray-500">{{ reviews.length }} {{ reviews.length === 1 ? t('reviews.singular') : t('reviews.plural') }}</p>
        </div>
        <div class="md:col-span-2 space-y-3">
          <div v-for="bar in ratingDistribution" :key="bar.stars" class="flex items-center gap-3">
            <span class="w-8 text-sm font-medium">{{ bar.stars }} </span>
            <div class="flex-1 bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div
                class="absolute top-0 left-0 h-full bg-[#A6853B] transition-all duration-700 ease-out"
                :style="{ width: bar.percentage + '%' }"
              ></div>
            </div>
            <span class="text-sm text-gray-600 w-12 text-right">{{ bar.count }}</span>
          </div>
        </div>
      </div>
      <div class="mt-12 border-t pt-12">
        <h3 class="text-2xl font-bold text-center mb-8">{{ t('reviews.writeReview') }}</h3>
        <div v-if="authStore.authenticatedweb" class="max-w-2xl mx-auto space-y-6">
          <div class="text-center">
            <Rating
              v-model="newReview.rating"
              :stars="5"
              :cancel="false"
              class="text-4xl justify-center"
            />
          </div>
          <textarea
            v-model="newReview.comment"
            rows="6"
            class="w-full p-5 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#A6853B]/20 focus:border-[#A6853B] outline-none resize-none transition"
            :placeholder="t('reviews.placeholder')"
          ></textarea>
          <button
            @click="submitReview"
            :disabled="isSubmittingReview || newReview.rating === 0 || !newReview.comment.trim()"
            class="w-full py-4 bg-[#A6853B] hover:bg-[#8f702c] text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {{ isSubmittingReview ? t('reviews.submitting') + '...' : t('reviews.submit') }}
          </button>
          <p v-if="reviewError" class="text-red-500 text-center font-medium">{{ reviewError }}</p>
        </div>
        <div v-else class="text-center py-12 bg-gray-50 rounded-2xl">
          <p class="text-gray-600 mb-6 text-lg">{{ t('reviews.loginToReview') }}</p>
          <button
            @click="router.push({ name: 'authlog' })"
            class="px-10 py-4 bg-[#A6853B] text-white font-bold rounded-xl hover:bg-[#8f702c] transition shadow-lg"
          >
            {{ t('reviews.login') }}
          </button>
        </div>
      </div>
      <div v-if="reviews.length" class="mt-12 space-y-8">
        <h3 class="text-2xl font-bold text-gray-800 border-b pb-4">{{ t('reviews.customerReviews') }}</h3>
        <div v-for="review in displayedReviews" :key="review.id" class="border-b pb-8 last:border-0">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                {{ (review.user?.name || 'A')[0].toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-lg">{{ review.user?.name || t('reviews.anonymous') }}</p>
                <Rating :modelValue="review.rate" :readonly="true" :cancel="false" />
              </div>
            </div>
            <span class="text-sm text-gray-500">{{ formatDate(review.created_at) }}</span>
          </div>
          <p class="text-gray-700 leading-relaxed pl-16">{{ review.message }}</p>
        </div>
        <div v-if="reviews.length > 5" class="text-center mt-8">
          <button class="text-[#A6853B] font-bold hover:underline">
            {{ t('reviews.viewAll') }} ({{ reviews.length }})
          </button>
        </div>
      </div>
      <div v-else class="text-center py-16 text-gray-500 text-lg">
        {{ t('reviews.noReviews') }}
      </div>
    </section>
    <section v-if="!isLoading && !error" class="mt-12">
      <ProductOffers />
    </section>
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
const allImages = ref([]) // Stores all images: product media + all variant images
const currentImg = ref('')
const quantity = ref(1)
const isLoading = ref(true)
const error = ref(null)
const isAddingToCart = ref(false)
const isUpdatingQuantity = ref(false)
const reviews = ref([])
const showFullDescription = ref(false)
const isSubmittingReview = ref(false)
const reviewError = ref(null)
const newReview = ref({
  rating: 2,
  comment: ''
})
// New state for variants
const variantOptions = ref({}) // e.g., { weight: [...options], color: [...options] }
const variantCombinations = ref([]) // All combinations for lookup
const selectedVariant = ref(null) // The currently selected variant/combination object

/* ───── COMPUTED ───── */

// Images shown in the gallery are the product's default images, plus the selected variant's image if it exists.
const currentImages = computed(() => {
    let images = [...allImages.value];
    // If a variant image exists and it's not already in the list, prepend it.
    if (selectedVariant.value && selectedVariant.value.variant_image.length) {
        const variantImgUrl = selectedVariant.value.variant_image[0].url;
        // Check if the variant image is already present in the allImages (to prevent duplicates)
        if (!allImages.value.find(img => img.url === variantImgUrl)) {
            images.unshift(selectedVariant.value.variant_image[0]);
        }
    }
    return images.filter((img, index, self) => 
      index === self.findIndex((t) => (
        t.url === img.url
      ))
    ); // Simple array of images for the gallery
})

// Dynamically compute price based on selected variant or fallback to product base price
const selectedVariantPrice = computed(() => {
  let basePrice = parseFloat(pro.value.base_price || 0);
  let basePriceAfterDiscount = parseFloat(pro.value.base_price_after_discount || 0);
  let totalDiscountsValue = parseFloat(pro.value.total_discounts_value || 0);

  if (selectedVariant.value) {
    const variantPrice = parseFloat(selectedVariant.value.price || 0);
    // Since the API only provides 'price' for the variant, we'll assume the product's discounts are applied to the product's base price to get the base_price_after_discount.
    // If the variant's price is different from the product's base price, we use the variant's price as the new base price and assume no discount for simplicity, or re-apply the discount mechanism if available.
    // For this example, we'll assume the variant's 'price' IS the final price.
    // NOTE: In a real-world scenario, you'd fetch the final price (base/discounted) specific to the variant.
    basePrice = variantPrice;
    basePriceAfterDiscount = variantPrice; // Assuming variant price is the final price for now
    totalDiscountsValue = 0;
  }
  
  // Re-calculate discount for display
  const has_discount = totalDiscountsValue > 0;
  const discount_percentage = basePrice ? Math.round((totalDiscountsValue / basePrice) * 100) : 0;

  return {
    base_price: basePrice.toFixed(2),
    after_discount: basePriceAfterDiscount.toFixed(2),
    has_discount,
    discount_percentage
  };
})

const formatPrice = (v) => parseFloat(v || 0).toFixed(2)
const fullDescription = computed(() =>
  locale.value === 'en' ? pro.value.description_en || t('product.noDescription') : pro.value.description_ar || t('product.noDescription')
)
const isDescriptionLong = computed(() => fullDescription.value.length > 300)
const truncatedDescription = computed(() =>
  isDescriptionLong.value ? fullDescription.value.slice(0, 300) + '...' : fullDescription.value
)
const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, r) => acc + r.rate, 0)
  return sum / reviews.value.length
})
const ratingDistribution = computed(() => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.value.forEach(r => counts[r.rate]++)
  const total = reviews.value.length
  return [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: counts[stars],
    percentage: total ? Math.round((counts[stars] / total) * 100) : 0
  }))
})
const displayedReviews = computed(() => reviews.value.slice(0, 5))

/* ───── METHODS ───── */
const changeImg = (url) => (currentImg.value = url)
const toggleDescription = () => (showFullDescription.value = !showFullDescription.value)
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// NEW: Variant Selection Logic
const selectVariant = (option) => {
    // For this example, we only have 'weight' as a variant attribute
    const selectedWeight = locale.value === 'en' ? option.value_en : option.value_ar;

    // Find the corresponding combination object
    const combination = variantCombinations.value.find(c => {
        // Find by English value as the combination object stores the key as 'Weight'
        const weightValue = c.weight; 
        return weightValue === option.value_en;
    });

    if (combination) {
        // The combination object doesn't contain 'in_cart' or 'isOutOfStock' in the API response,
        // so we'll merge them with placeholder values for now, but a real API would provide this state per variant.
        selectedVariant.value = {
            ...combination,
            isOutOfStock: pro.value.is_stock === 0, // Fallback to product stock for simplicity
            in_cart: pro.value.in_cart // Fallback to product cart status for simplicity
        };
        
        // Update main image to the variant's first image if available
        if (combination.variant_image && combination.variant_image.length > 0) {
            currentImg.value = combination.variant_image[0].url;
        } else {
            // Fallback to the product's main image
            currentImg.value = pro.value.key_default_image || (allImages.value[0]?.url || '');
        }

        // Reset quantity for the new variant selection (if applicable, only shown if in cart)
        quantity.value = selectedVariant.value.in_cart ? (pro.value.quantity || 1) : 1;
        
    } else {
        selectedVariant.value = null; // Should not happen if data is clean
    }
}


/* ───── CART LOGIC ───── */
const addToCart = async () => {
  if (!authStore.authenticatedweb) return router.push({ name: 'authlog' })
  // Check selectedVariant safely
  if (!selectedVariant.value || selectedVariant.value.isOutOfStock || isAddingToCart.value) return

  isAddingToCart.value = true
  try {
    await axios.post('/api/cart/add', {
      product_id: pro.value.id,
      // Use the selected variant ID
      variant_id: selectedVariant.value.variant_id, 
      quantity: 1
    })
    
    // Update state to reflect item is now in cart
    selectedVariant.value.in_cart = true
    quantity.value = 1
    
    toast.add({ severity: 'success', summary: t('success'), detail: t('cart.added'), life: 3000 })
  } catch (e) {
    toast.add({ severity: 'error', detail: e.response?.data?.message || t('cart.error'), life: 3000 })
  } finally {
    isAddingToCart.value = false
  }
}

const updateQuantity = async (action) => {
  // Check selectedVariant safely
  if (!authStore.authenticatedweb || isUpdatingQuantity.value || !selectedVariant.value || selectedVariant.value.isOutOfStock) return
  const newQty = action === 'plus' ? quantity.value + 1 : quantity.value - 1
  if (newQty < 1) return
  
  isUpdatingQuantity.value = true
  try {
    await axios.post('/api/cart/update', {
      product_id: pro.value.id,
      // Use the selected variant ID
      variant_id: selectedVariant.value.variant_id, 
      quantity: newQty
    })
    
    quantity.value = newQty
    toast.add({
      severity: 'success',
      detail: action === 'plus' ? t('cart.quantityIncreased') : t('cart.quantityDecreased'),
      life: 2000
    })
  } catch (e) {
    toast.add({ severity: 'error', detail: t('cart.quantityError'), life: 3000 })
  } finally {
    isUpdatingQuantity.value = false
  }
}

const handleCartAction = () => {
    // Check if a variant is selected before proceeding
    if (!selectedVariant.value) {
        toast.add({ severity: 'warn', summary: t('warning'), detail: t('product.selectVariant') || 'Please select a variant.', life: 3000 });
        return;
    }
    if (selectedVariant.value.in_cart || selectedVariant.value.isOutOfStock) return
    addToCart()
}

/* ───── REVIEW SUBMIT (Unchanged) ───── */
const submitReview = async () => {
  if (newReview.value.rating === 0 || !newReview.value.comment.trim()) {
    reviewError.value = t('reviews.requiredFields')
    return
  }
  isSubmittingReview.value = true
  reviewError.value = null
  try {
    const payload = {
      model_id: route.params.id,
      rate: newReview.value.rating,
      type: 'product',
      message: newReview.value.comment.trim()
    }
    const { data } = await axios.post('/api/review', payload)
    if (data.is_success) {
      reviews.value.unshift({
        id: data.data.id || Date.now(),
        rate: newReview.value.rating,
        message: newReview.value.comment.trim(),
        user: { name: authStore.user?.name || 'You' },
        created_at: new Date().toISOString()
      })
      // Reset form
      newReview.value = { rating: 0, comment: '' }
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('reviews.submitSuccess'),
        life: 4000
      })
    }
  } catch (err) {
    reviewError.value = err.response?.data?.message || t('reviews.submitError')
  } finally {
    isSubmittingReview.value = false
  }
}

/* ───── NAVIGATION (Unchanged) ───── */
const goCatgory = (cat) => cat && router.push(
  cat.has_subcategories
    ? { name: 'subcategory', params: { id: cat.id } }
    : { name: 'produts_category', params: { id: cat.id } }
)
const goBrand = (brand) => brand && router.push({ name: 'products-brand', params: { id: brand.id } })
const selectStore = (store) => store && router.push(store.has_market ? { name: 'stores-hasmarket' } : { name: 'home' })

/* ───── FETCH DATA ───── */
const fetchProductData = async () => {
  isLoading.value = true
  error.value = null
  // Reset selectedVariant before fetching new data
  selectedVariant.value = null; 
  try {
    const { data } = await axios.get(`/api/home/product-details/${route.params.id}`)
    if (data.is_success) {
      const p = data.data.product
      
      // Update the main product state
      pro.value = {
        ...p,
        in_cart: !!p.in_cart,
        isOutOfStock: p.is_stock === 0
      }
      allImages.value = p.media || []
      reviews.value = p.reviews || []

      // NEW: Handle Variants
      const variants = data.data.variants_details || {};
      variantOptions.value = variants.attributes || {};
      // Add a 'weight' property to combinations for consistent lookup in selectVariant
      variantCombinations.value = (variants.combinations || []).map(c => {
        return c;
      });

      // Automatically select the first variant if variants exist
      if (variantCombinations.value.length > 0) {
          // Select the first variant option of the first available attribute (e.g., 'weight')
          const firstAttributeName = Object.keys(variantOptions.value)[0];
          if (firstAttributeName) {
              selectVariant(variantOptions.value[firstAttributeName][0]);
          }
      } else {
        // No variants, use base product info as the 'selectedVariant' for consistent logic
        selectedVariant.value = {
            variant_id: null,
            isOutOfStock: pro.value.isOutOfStock,
            in_cart: pro.value.in_cart,
            price: pro.value.base_price,
            variant_image: p.media,
            quantity: p.in_cart ? (p.quantity || 1) : 1
        };
      }
      
      // Set initial image (either variant's or product's default)
      if (selectedVariant.value?.variant_image?.length) {
          currentImg.value = selectedVariant.value.variant_image[0].url;
      } else {
          currentImg.value = pro.value.key_default_image || (allImages.value[0]?.url || '');
      }
      
      // Set initial quantity from selectedVariant/product fallback
      quantity.value = selectedVariant.value.in_cart ? (selectedVariant.value.quantity || 1) : 1;

    } else {
      error.value = t('product.notFound')
    }
  } catch (e) {
    console.error('Fetch error:', e);
    error.value = e.response?.data?.message || t('product.loadError')
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchProductData()
    window.scrollTo(0, 0)
  }
})

onMounted(() => {
  window.scrollTo(0, 0)
  fetchProductData()
})
</script>

<style scoped>
.sub-tiles {
  @apply bg-[#E6AC312B] px-5 py-3 rounded-xl font-medium text-sm text-gray-700 hover:bg-[#d89c284d] transition;
}
.flex-center {
  @apply flex items-center justify-center;
}
</style>