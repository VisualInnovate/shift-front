<template>
  <div class="flex items-center bg-gray-100 rounded-lg h-9 mx-3 md:h-10 md:mx-2 relative">
    <i class="fa-solid fa-magnifying-glass text-gray-500 px-2.5 text-sm md:px-3 md:text-base"></i>
    <input
      v-model="searchQuery"
      class="flex-grow bg-transparent lg:w-[400px] text-sm placeholder-gray-400 focus:outline-none"
      type="text"
      :placeholder="t('search.placeholder')"
      @input="handleSearch"
      @focus="showResults"
      @blur="hideResultsWithDelay"
    />

    <transition name="dropdown-fancy">
      <div
        v-if="showSearchResults && (searchResults.products.length || searchResults.categories.length || searchResults.brands.length)"
        class="absolute top-12 mt-2 left-0 right-0 lg:w-[500px] w-[220px] bg-white rounded-xl shadow-2xl z-50 overflow-y-auto dropdown-fancy"
        style="max-height: 70vh;"
        @mousedown.prevent
      >
        <!-- Products Section -->
        <router-link
          v-for="result in searchResults.products"
          :key="'product-' + result.id"
          :to="{ name: 'Product-details', params: { id: result.id } }"
          target="_blank"
          rel="noopener noreferrer"
          @click="cleanUpState"
          class="flex items-center px-4 py-3 transition-all duration-300 cursor-pointer dropdown-item hover:bg-amber-50"
        >
          <div v-if="result.key_default_image || (result.media && result.media.length)" class="w-8 h-8 flex items-center justify-center overflow-hidden rounded-sm bg-gray-100 mx-2">
            <img
              :src="result.key_default_image || result.media[0].url"
              :alt="displayName(result)"
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <div v-else class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-sm mr-2">
            <i class="fa-solid fa-box text-gray-400"></i>
          </div>
          <div class="flex-grow">
            <span class="text-sm text-gray-700 font-medium block">
              <template v-for="(part, index) in highlightMatch(result)" :key="index">
                <span v-if="part.isMatch" class="bg-yellow-200">{{ part.text }}</span>
                <span v-else>{{ part.text }}</span>
              </template>
            </span>
            <span class="text-xs text-gray-500">{{ result.belongs_to ? (appLang == 'ar' ? result.belongs_to.name_ar : result?.belongs_to?.name_en) : '' }}</span>
          </div>
          <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{{ t('search.product') }}</span>
        </router-link>

        <!-- Categories Section -->
        <router-link
          v-for="result in searchResults.categories"
          :key="'category-' + result.id"
          :to="getCategoryLink(result)"
          @click="cleanUpState"
          class="flex items-center px-4 py-3 transition-all duration-300 cursor-pointer dropdown-item hover:bg-amber-50"
        >
          <div v-if="result.media && result.media.length" class="w-8 h-8 flex items-center justify-center overflow-hidden rounded-sm bg-gray-100 mx-2">
            <img
              :src="result.media[0].url"
              :alt="displayName(result)"
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <div v-else class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-sm mr-2">
            <i class="fa-solid fa-folder text-gray-400"></i>
          </div>
          <div class="flex-grow">
            <span class="text-sm text-gray-700 font-medium block">
              <template v-for="(part, index) in highlightMatch(result)" :key="index">
                <span v-if="part.isMatch" class="bg-yellow-200">{{ part.text }}</span>
                <span v-else>{{ part.text }}</span>
              </template>
            </span>
            <span class="text-xs text-gray-500">{{ result.belongs_to ? (appLang === 'ar' ? result.belongs_to.name_ar : result.belongs_to.name_en) : '' }}</span>
          </div>
          <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{{ t('search.category') }}</span>
        </router-link>

        <!-- Brands Section -->
        <router-link
          v-for="result in searchResults.brands"
          :key="'brand-' + result.id"
          :to="{ name: 'products-brand', params: { id: result.id } }"
          @click="cleanUpState"
          class="flex items-center px-4 py-3 transition-all duration-300 cursor-pointer dropdown-item hover:bg-amber-50"
        >
          <div v-if="result.media && result.media.length" class="w-8 h-8 flex items-center justify-center overflow-hidden rounded-sm bg-gray-100 mx-2">
            <img
              :src="result.media[0].url"
              :alt="displayName(result)"
              class="max-w-full max-h-full object-contain"
            />
          </div>
          <div v-else class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-sm mr-2">
            <i class="fa-solid fa-tag text-gray-400"></i>
          </div>
          <span class="flex-grow text-sm text-gray-700 font-medium">
            <template v-for="(part, index) in highlightMatch(result)" :key="index">
              <span v-if="part.isMatch" class="bg-yellow-200">{{ part.text }}</span>
              <span v-else>{{ part.text }}</span>
            </template>
          </span>
          <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{{ t('search.brand') }}</span>
        </router-link>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const { t } = useI18n();
const searchQuery = ref('');
const searchResults = ref({
  products: [],
  categories: [],
  brands: []
});
const showSearchResults = ref(false);
let searchTimeout = null;

// Get current language (fallback to 'en')
const appLang = localStorage.getItem('appLang') || 'en';

// Computed property to display name based on language
const displayName = computed(() => {
  return (result) => (appLang === 'ar' ? result.name_ar : result.name_en) || 'Unnamed';
});

// Function to highlight matched text
const highlightMatch = (result) => {
  const name = displayName.value(result);
  const query = searchQuery.value.trim();
  if (!query) return [{ text: name, isMatch: false }];

  const lowerName = name.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerName.indexOf(lowerQuery);

  if (index === -1) return [{ text: name, isMatch: false }];

  const before = name.slice(0, index);
  const match = name.slice(index, index + query.length);
  const after = name.slice(index + query.length);

  return [
    ...(before ? [{ text: before, isMatch: false }] : []),
    { text: match, isMatch: true },
    ...(after ? [{ text: after, isMatch: false }] : [])
  ];
};

const normalizeQuery = (q) =>
  q
    .trim()
    .replace(/\s+/g, " ");

const handleSearch = async () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    const q = normalizeQuery(searchQuery.value);

    if (q.length < 1) {
      searchResults.value = { products: [], categories: [], brands: [] };
      showSearchResults.value = false;
      return;
    }

    try {
      const response = await axios.get(`api/home/search?query=${encodeURIComponent(searchQuery.value)}`);
      searchResults.value = {
        products: response.data.data?.products || [],
        categories: response.data.data?.categories || [],
        brands: response.data.data?.brands || []
      };
      showSearchResults.value = !!(
        searchResults.value.products.length ||
        searchResults.value.categories.length ||
        searchResults.value.brands.length
      );
    } catch (error) {
      console.error('Error fetching search results:', error);
      searchResults.value = { products: [], categories: [], brands: [] };
      showSearchResults.value = false;
    }
  }, 300);
};

const showResults = () => {
  if (searchResults.value.products.length || searchResults.value.categories.length || searchResults.value.brands.length) {
    showSearchResults.value = true;
  }
};

const hideResultsWithDelay = () => {
  setTimeout(() => {
    showSearchResults.value = false;
  }, 200);
};

const getCategoryLink = (result) => {
  return result.has_subcategories
    ? { name: 'subcategory', params: { id: result.id } }
    : { name: 'produts_category', params: { id: result.id } };
};

const cleanUpState = () => {
  showSearchResults.value = false;
  searchQuery.value = '';
  searchResults.value = { products: [], categories: [], brands: [] };
};

onUnmounted(() => {
  clearTimeout(searchTimeout);
});
</script>

<style scoped>
.dropdown-fancy-enter-active,
.dropdown-fancy-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fancy-enter-from,
.dropdown-fancy-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-fancy-enter-to,
.dropdown-fancy-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dropdown-fancy {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(229, 231, 235, 0.8);
}

.dropdown-item {
  position: relative;
  overflow: hidden;
}

.dropdown-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.1), transparent);
  transition: left 0.5s;
}

.dropdown-item:hover::before {
  left: 100%;
}

input:focus + i {
  color: #E6AC31;
}
</style>
