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
        v-if="showSearchResults && hasAnyResults"
        class="absolute top-12 mt-2  lg:w-[500px] w-[290px] bg-white rounded-xl shadow-2xl z-50 flex flex-col dropdown-fancy"
        style="max-height: 70vh;"
        @mousedown.prevent
      >
        <!-- Tabs -->
        <div class="flex items-center border-b border-gray-100 px-2 pt-2 gap-1 shrink-0">
          <button
            v-for="tab in availableTabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="text-xs font-medium px-3 py-1.5 rounded-t-md transition-colors"
            :class="activeTab === tab.key
              ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
              : 'text-gray-500 hover:text-gray-700'"
          >
            {{ tab.label }} <span class="text-gray-400">({{ tab.total }})</span>
          </button>
        </div>

        <!-- Scrollable results -->
        <div class="overflow-y-auto flex-grow">
          <!-- Products Section -->
          <template v-if="activeTab === 'all' || activeTab === 'products'">
            <div v-if="searchResults.products.data.length" class="py-1">
              <p v-if="activeTab === 'all'" class="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                {{ t('search.product') }}
              </p>
              <router-link
                v-for="result in searchResults.products.data"
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
                <div class="flex-grow min-w-0">
                  <span class="text-sm text-gray-700 font-medium block truncate">
                    <template v-for="(part, index) in highlightMatch(result)" :key="index">
                      <span v-if="part.isMatch" class="bg-yellow-200">{{ part.text }}</span>
                      <span v-else>{{ part.text }}</span>
                    </template>
                  </span>
                  <span class="text-xs text-gray-500 truncate block">{{ result.belongs_to ? (appLang == 'ar' ? result.belongs_to.name_ar : result?.belongs_to?.name_en) : '' }}</span>
                </div>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full shrink-0">{{ t('search.product') }}</span>
              </router-link>

              <!-- Load more / pagination -->
              <div class="px-4 py-2">
                <button
                  v-if="searchResults.products.next_page_url"
                  :disabled="loadingMore.products"
                  @click="loadMore('products')"
                  class="w-full text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50 py-1.5"
                >
                  {{ loadingMore.products ? t('search.loading') : t('search.load_more') }}
                  ({{ searchResults.products.data.length }} / {{ searchResults.products.total }})
                </button>
              </div>
            </div>
          </template>

          <!-- Categories Section -->
          <template v-if="activeTab === 'all' || activeTab === 'categories'">
            <div v-if="searchResults.categories.data.length" class="py-1 border-t border-gray-50">
              <p v-if="activeTab === 'all'" class="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                {{ t('search.category') }}
              </p>
              <router-link
                v-for="result in searchResults.categories.data"
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
                <div class="flex-grow min-w-0">
                  <span class="text-sm text-gray-700 font-medium block truncate">
                    <template v-for="(part, index) in highlightMatch(result)" :key="index">
                      <span v-if="part.isMatch" class="bg-yellow-200">{{ part.text }}</span>
                      <span v-else>{{ part.text }}</span>
                    </template>
                  </span>
                  <span class="text-xs text-gray-500 truncate block">{{ result.belongs_to ? (appLang === 'ar' ? result.belongs_to.name_ar : result.belongs_to.name_en) : '' }}</span>
                </div>
                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full shrink-0">{{ t('search.category') }}</span>
              </router-link>

              <div class="px-4 py-2">
                <button
                  v-if="searchResults.categories.next_page_url"
                  :disabled="loadingMore.categories"
                  @click="loadMore('categories')"
                  class="w-full text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50 py-1.5"
                >
                  {{ loadingMore.categories ? t('search.loading') : t('search.load_more') }}
                  ({{ searchResults.categories.data.length }} / {{ searchResults.categories.total }})
                </button>
              </div>
            </div>
          </template>

          <!-- Brands Section -->
          <template v-if="activeTab === 'all' || activeTab === 'brands'">
            <div v-if="searchResults.brands.data.length" class="py-1 border-t border-gray-50">
              <p v-if="activeTab === 'all'" class="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                {{ t('search.brand') }}
              </p>
              <router-link
                v-for="result in searchResults.brands.data"
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
                <span class="flex-grow text-sm text-gray-700 font-medium truncate">
                  <template v-for="(part, index) in highlightMatch(result)" :key="index">
                    <span v-if="part.isMatch" class="bg-yellow-200">{{ part.text }}</span>
                    <span v-else>{{ part.text }}</span>
                  </template>
                </span>
                <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full shrink-0">{{ t('search.brand') }}</span>
              </router-link>

              <div class="px-4 py-2">
                <button
                  v-if="searchResults.brands.next_page_url"
                  :disabled="loadingMore.brands"
                  @click="loadMore('brands')"
                  class="w-full text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50 py-1.5"
                >
                  {{ loadingMore.brands ? t('search.loading') : t('search.load_more') }}
                  ({{ searchResults.brands.data.length }} / {{ searchResults.brands.total }})
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const { t } = useI18n();
const searchQuery = ref('');
const activeTab = ref('all'); // 'all' | 'products' | 'categories' | 'brands'

const emptySection = () => ({
  data: [],
  current_page: 1,
  last_page: 1,
  next_page_url: null,
  total: 0
});

const searchResults = ref({
  products: emptySection(),
  categories: emptySection(),
  brands: emptySection()
});

const loadingMore = ref({
  products: false,
  categories: false,
  brands: false
});

const showSearchResults = ref(false);
let searchTimeout = null;

// Get current language (fallback to 'en')
const appLang = localStorage.getItem('appLang') || 'en';

// Computed property to display name based on language
const displayName = computed(() => {
  return (result) => (appLang === 'ar' ? result.name_ar : result.name_en) || 'Unnamed';
});

const hasAnyResults = computed(() =>
  searchResults.value.products.data.length ||
  searchResults.value.categories.data.length ||
  searchResults.value.brands.data.length
);

const availableTabs = computed(() => {
  const tabs = [
    { key: 'all', label: t('search.all'), total:
      searchResults.value.products.total +
      searchResults.value.categories.total +
      searchResults.value.brands.total }
  ];
  if (searchResults.value.products.total) {
    tabs.push({ key: 'products', label: t('search.product'), total: searchResults.value.products.total });
  }
  if (searchResults.value.categories.total) {
    tabs.push({ key: 'categories', label: t('search.category'), total: searchResults.value.categories.total });
  }
  if (searchResults.value.brands.total) {
    tabs.push({ key: 'brands', label: t('search.brand'), total: searchResults.value.brands.total });
  }
  return tabs;
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

const mapSection = (section) => {
  if (!section) return emptySection();
  return {
    data: section.data || [],
    current_page: section.current_page || 1,
    last_page: section.last_page || 1,
    next_page_url: section.next_page_url || null,
    total: section.total || 0
  };
};

const handleSearch = async () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async () => {
    const q = normalizeQuery(searchQuery.value);

    if (q.length < 1) {
      resetResults();
      showSearchResults.value = false;
      return;
    }

    try {
      const response = await axios.get(`api/home/search?query=${encodeURIComponent(searchQuery.value)}`);
      const data = response.data.data || {};

      searchResults.value = {
        products: mapSection(data.products),
        categories: mapSection(data.categories),
        brands: mapSection(data.brands)
      };

      activeTab.value = 'all';
      showSearchResults.value = !!hasAnyResults.value;
    } catch (error) {
      console.error('Error fetching search results:', error);
      resetResults();
      showSearchResults.value = false;
    }
  }, 300);
};

// Load next page for a given section (products | categories | brands) and append
const loadMore = async (type) => {
  const section = searchResults.value[type];
  if (!section.next_page_url || loadingMore.value[type]) return;

  loadingMore.value[type] = true;

  try {
    const nextPage = section.current_page + 1;
    const response = await axios.get(`api/home/search`, {
      params: {
        query: searchQuery.value,
        [`${type}_page`]: nextPage
      }
    });

    const newSection = mapSection(response.data.data?.[type]);

    // Append new data to existing data, keep pagination meta from new response
    searchResults.value[type] = {
      ...newSection,
      data: [...section.data, ...newSection.data]
    };
  } catch (error) {
    console.error(`Error loading more ${type}:`, error);
  } finally {
    loadingMore.value[type] = false;
  }
};

const resetResults = () => {
  searchResults.value = {
    products: emptySection(),
    categories: emptySection(),
    brands: emptySection()
  };
};

const showResults = () => {
  if (hasAnyResults.value) {
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
  resetResults();
  activeTab.value = 'all';
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
