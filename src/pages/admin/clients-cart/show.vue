<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const toast = useToast()
const { t, locale } = useI18n()

const loading = ref(true)
const products = ref([])
const currentPage = ref(1)
const totalRecords = ref(0)
const totalPages = ref(0)
const links = ref([])
const nextPageUrl = ref(null)
const prevPageUrl = ref(null)

const productName = (item) => {
  const product = item.product || {}
  return locale.value === 'ar' ? product.name_ar || product.name_en : product.name_en || product.name_ar
}

const storeName = (item) => {
  const store = item.product?.store || {}
  return locale.value === 'ar' ? store.name_ar || store.name_en : store.name_en || store.name_ar
}

const productImage = (item) => item.product?.media?.[0]?.url || item.product?.key_default_image

const fetchProducts = async () => {
  loading.value = true

  try {
    const response = await axios.get(`/api/user/${route.params.id}/cart-products`, {
      params: { page: currentPage.value },
    })
    const paginator = response.data?.data || {}

    products.value = paginator.data || []
    currentPage.value = paginator.current_page || 1
    totalRecords.value = paginator.total || 0
    totalPages.value = paginator.last_page || 0
    links.value = paginator.links || []
    nextPageUrl.value = paginator.next_page_url
    prevPageUrl.value = paginator.prev_page_url
  } catch (error) {
    products.value = []
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: t('cart.cartLoadError'),
      life: 3000,
    })
    console.error('Error fetching client cart products:', error)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    fetchProducts()
  }
}

const hideBrokenImage = (event) => {
  event.target.style.display = 'none'
}

onMounted(fetchProducts)
</script>

<template>
  <div class="client-cart-page">
    <Toast />

    <section class="cart-hero">
      <div class="cart-hero__icon"><i class="pi pi-shopping-cart" /></div>
      <div>
        <p class="cart-hero__eyebrow">{{ t('navigation.clientCart') }}</p>
        <h1>{{ t('cart.orderSummary') }}</h1>
        <p>{{ totalRecords }} {{ t('order.items') }}</p>
      </div>
    </section>

    <div v-if="loading" class="cart-state">
      <ProgressSpinner style="width: 52px; height: 52px" stroke-width="4" />
    </div>

    <div v-else-if="!products.length" class="cart-state cart-state--empty">
      <i class="pi pi-shopping-cart text-4xl" />
      <h2>{{ t('cart.emptyCart') }}</h2>
    </div>

    <section v-else class="product-grid">
      <article v-for="item in products" :key="item.id" class="product-card">
        <div class="product-card__image-wrap">
          <img
            v-if="productImage(item)"
            :src="productImage(item)"
            :alt="productName(item)"
            class="product-card__image"
            @error="hideBrokenImage"
          />
          <i class="pi pi-image product-card__placeholder" />
          <span class="product-card__quantity">× {{ item.quantity }}</span>
        </div>

        <div class="product-card__content">
          <p class="product-card__store"><i class="pi pi-shop" /> {{ storeName(item) || '-' }}</p>
          <h2>{{ productName(item) || '-' }}</h2>

        </div>
      </article>
    </section>

    <nav v-if="totalPages > 1 && !loading" class="cart-pagination" :aria-label="t('show')">
      <button :disabled="!prevPageUrl" @click="goToPage(currentPage - 1)">
        <i class="pi pi-angle-right" />
      </button>

      <template v-for="(link, index) in links" :key="index">
        <button
          v-if="link.label && !isNaN(parseInt(link.label))"
          :class="{ active: link.active }"
          @click="goToPage(parseInt(link.label))"
        >
          {{ link.label }}
        </button>
        <span v-else-if="link.label === '...'">...</span>
      </template>

      <button :disabled="!nextPageUrl" @click="goToPage(currentPage + 1)">
        <i class="pi pi-angle-left" />
      </button>
    </nav>
  </div>
</template>

<style scoped>
.client-cart-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 1.5rem;
}

.cart-hero {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.75rem;
  padding: 1.35rem 1.5rem;
  color: #fff;
  background: linear-gradient(135deg, #0b3baa, #245fd3);
  border-radius: 18px;
  box-shadow: 0 12px 30px rgba(11, 59, 170, 0.18);
}

.cart-hero__icon {
  display: grid;
  width: 52px;
  height: 52px;
  font-size: 1.35rem;
  place-items: center;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 14px;
}

.cart-hero__eyebrow,
.cart-hero h1,
.cart-hero p {
  margin: 0;
}

.cart-hero__eyebrow {
  margin-bottom: 0.2rem;
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.8;
}

.cart-hero h1 {
  font-size: 1.5rem;
}

.cart-hero h1 + p {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  opacity: 0.86;
}

.cart-state {
  display: flex;
  min-height: 320px;
  align-items: center;
  justify-content: center;
}

.cart-state--empty {
  flex-direction: column;
  gap: 1rem;
  color: var(--text-color-secondary, #64748b);
}

.cart-state--empty h2 {
  margin: 0;
  font-size: 1.15rem;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  gap: 1.25rem;
}

.product-card {
  overflow: hidden;
  background: var(--surface-card, #fff);
  border: 1px solid var(--surface-border, #e2e8f0);
  border-radius: 16px;
  box-shadow: 0 5px 16px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  box-shadow: 0 12px 25px rgba(15, 23, 42, 0.11);
  transform: translateY(-3px);
}

.product-card__image-wrap {
  position: relative;
  display: grid;
  height: 190px;
  overflow: hidden;
  place-items: center;
  background: #f8fafc;
}

.product-card__image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.product-card__placeholder {
  position: absolute;
  color: #94a3b8;
  font-size: 2.5rem;
}

.product-card__quantity {
  position: absolute;
  z-index: 2;
  top: 0.75rem;
  inset-inline-end: 0.75rem;
  padding: 0.3rem 0.65rem;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  background: #0b3baa;
  border-radius: 999px;
}

.product-card__content {
  padding: 1rem;
}

.product-card__store {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  margin: 0 0 0.55rem;
  color: #64748b;
  font-size: 0.82rem;
}

.product-card__store i {
  color: #d7a648;
}

.product-card h2 {
  display: -webkit-box;
  min-height: 3rem;
  margin: 0 0 1rem;
  overflow: hidden;
  color: var(--text-color, #1e293b);
  font-size: 1rem;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__pricing {
  display: flex;
  justify-content: space-between;
  padding-top: 0.85rem;
  border-top: 1px solid var(--surface-border, #e2e8f0);
}

.product-card__pricing div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.product-card__pricing span {
  color: #64748b;
  font-size: 0.75rem;
}

.product-card__pricing strong {
  color: var(--text-color, #1e293b);
  font-size: 0.9rem;
}

.product-card__pricing .product-card__total {
  color: #0b3baa;
}

.cart-pagination {
  display: flex;
  gap: 0.45rem;
  justify-content: center;
  margin-top: 2rem;
}

.cart-pagination button {
  display: grid;
  min-width: 38px;
  height: 38px;
  padding: 0 0.65rem;
  cursor: pointer;
  color: #475569;
  font-weight: 600;
  place-items: center;
  background: var(--surface-card, #fff);
  border: 1px solid var(--surface-border, #e2e8f0);
  border-radius: 9px;
}

.cart-pagination button.active {
  color: #fff;
  background: #0b3baa;
  border-color: #0b3baa;
}

.cart-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 576px) {
  .client-cart-page {
    padding: 1rem;
  }

  .cart-hero {
    padding: 1.1rem;
  }

  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
