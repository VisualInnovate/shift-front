<template>
  <div class="min-h-screen bg-slate-50/50 p-4 md:p-8 font-tajawal antialiased text-slate-800">
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

     <aside class="w-full md:w-64 bg-white rounded-xl shadow-md p-6 h-fit">

        <ul class="space-y-2">

          <li @click="router.push({ name: 'profile' })"

              class="p-3 rounded-lg flex items-center gap-4 text-gray-500 hover:bg-gray-50 cursor-pointer"

              role="button" :aria-label="t('profile.account')">

            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path fill-rule="evenodd" clip-rule="evenodd"

                d="M5.55556 4.44444C5.55556 3.2657 6.02381 2.13524 6.8573 1.30175C7.6908 0.468252 8.82126 0 10 0C11.1787 0 12.3092 0.468252 13.1427 1.30175C13.9762 2.13524 14.4444 3.2657 14.4444 4.44444C14.4444 5.62318 13.9762 6.75365 13.1427 7.58714C12.3092 8.42064 11.1787 8.88889 10 8.88889C8.82126 8.88889 7.6908 8.42064 6.8573 7.58714C6.02381 6.75365 5.55556 5.62318 5.55556 4.44444ZM5.55556 11.1111C4.08213 11.1111 2.66905 11.6964 1.62718 12.7383C0.585316 13.7802 0 15.1932 0 16.6667C0 17.5507 0.35119 18.3986 0.976311 19.0237C1.60143 19.6488 2.44928 20 3.33333 20H16.6667C17.5507 20 18.3986 19.6488 19.0237 19.0237C19.6488 18.3986 20 17.5507 20 16.6667C20 15.1932 19.4147 13.7802 18.3728 12.7383C17.3309 11.6964 15.9179 11.1111 14.4444 11.1111H5.55556Z"

                fill="#807575"/>

            </svg>

            <span>{{ t('profile.account') }}</span>

          </li>



          <li class="p-3 rounded-lg flex items-center gap-4 bg-yellow-100 text-yellow-700 font-medium cursor-default"

              role="button" aria-current="page">

            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path fill-rule="evenodd" clip-rule="evenodd"

                d="M0.837143 0.689412C-8.51495e-08 1.37882 0 2.48706 0 4.70588V15.2941C0 17.5129 -8.51495e-08 18.6212 0.837143 19.3106C1.67429 20 3.02 20 5.71429 20H14.2857C16.98 20 18.3257 20 19.1629 19.3106C20 18.6212 20 17.5129 20 15.2941V4.70588C20 2.48706 20 1.37882 19.1629 0.689412C18.3257 -7.01231e-08 16.98 0 14.2857 0H5.71429C3.02 0 1.67429 -7.01231e-08 0.837143 0.689412ZM5.71429 4.70588C5.33541 4.70588 4.97204 4.82983 4.70413 5.05046C4.43622 5.27109 4.28571 5.57033 4.28571 5.88235C4.28571 6.19437 4.43622 6.49361 4.70413 6.71424C4.97204 6.93487 5.33541 7.05882 5.71429 7.05882H14.2857C14.6646 7.05882 15.028 6.93487 15.2959 6.71424C15.5638 6.49361 15.7143 6.19437 15.7143 5.88235C15.7143 5.57033 15.5638 5.27109 15.2959 5.05046C15.028 4.82983 14.6646 4.70588 14.2857 4.70588H5.71429ZM5.71429 9.41177C5.33541 9.41177 4.97204 9.53571 4.70413 9.75635C4.43622 9.97698 4.28571 10.2762 4.28571 10.5882C4.28571 10.9003 4.43622 11.1995 4.70413 11.4201C4.97204 11.6408 5.33541 11.7647 5.71429 11.7647H14.2857C14.6646 11.7647 15.028 11.6408 15.2959 11.4201C15.5638 11.1995 15.7143 10.9003 15.7143 10.5882C15.7143 10.2762 15.5638 9.97698 15.2959 9.75635C15.028 9.53571 14.6646 9.41177 14.2857 9.41177H5.71429ZM5.71429 14.1176C5.33541 14.1176 4.97204 14.2416 4.70413 14.4622C4.43622 14.6829 4.28571 14.9821 4.28571 15.2941C4.28571 15.6061 4.43622 15.9054 4.70413 16.126C4.97204 16.3466 5.33541 16.4706 5.71429 16.4706H11.4286C11.8075 16.4706 12.1708 16.3466 12.4387 16.126C12.7066 15.9054 12.8571 15.6061 12.8571 15.2941C12.8571 14.9821 12.7066 14.6829 12.4387 14.4622C12.1708 14.2416 11.8075 14.1176 11.4286 14.1176H5.71429Z"

                fill="#F9C006"/>

            </svg>

            <span>{{ t('profile.orders') }}</span>

          </li>



          <li @click="router.push({ name: 'addres' })"

              class="p-3 rounded-lg flex items-center gap-4 text-gray-500 hover:bg-gray-50 cursor-pointer"

              role="button" :aria-label="t('profile.addresses')">

            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path d="M9 0C6.61392 0.00245748 4.32637 0.831051 2.63915 2.30402C0.951939 3.77699 0.0028245 5.77405 9.57508e-06 7.85714C-0.00284824 9.55945 0.634084 11.2156 1.8131 12.5714C1.8131 12.5714 2.05855 12.8536 2.09864 12.8943L9 20L15.9046 12.8907C15.9406 12.8529 16.1869 12.5714 16.1869 12.5714L16.1877 12.5693C17.3661 11.214 18.0028 9.55866 18 7.85714C17.9972 5.77405 17.0481 3.77699 15.3608 2.30402C13.6736 0.831051 11.3861 0.00245748 9 0ZM9 10.7143C8.35272 10.7143 7.71997 10.5467 7.18177 10.2328C6.64358 9.91882 6.2241 9.4726 5.9764 8.95052C5.72869 8.42845 5.66388 7.85397 5.79016 7.29974C5.91644 6.74551 6.22814 6.23642 6.68583 5.83684C7.14353 5.43726 7.72668 5.16514 8.36152 5.0549C8.99637 4.94466 9.6544 5.00124 10.2524 5.21749C10.8504 5.43374 11.3616 5.79994 11.7212 6.2698C12.0808 6.73965 12.2727 7.29205 12.2727 7.85714C12.2716 8.61461 11.9265 9.34079 11.313 9.8764C10.6994 10.412 9.86765 10.7133 9 10.7143Z"

                fill="#807575"/>

            </svg>

            <span>{{ t('profile.addresses') }}</span>

          </li>



          <li @click="logout"

              class="p-3 rounded-lg flex items-center gap-4 text-red-500 hover:bg-gray-50 cursor-pointer"

              role="button" :aria-label="t('profile.logout')">

            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">

              <path d="M0 20V0H9V2.22222H2V17.7778H9V20H0ZM13 15.5556L11.625 13.9444L14.175 11.1111H6V8.88889H14.175L11.625 6.05556L13 4.44444L18 10L13 15.5556Z"

                fill="#FF1212"/>

            </svg>

            <span>{{ t('profile.logout') }}</span>

          </li>

        </ul>

      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 md:p-8">

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col justify-center items-center py-20 gap-4">
          <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="4" animationDuration="1s" class="text-amber-500" />
          <span class="text-slate-400 font-medium text-sm tracking-wide animate-pulse">{{ t('loading') }}</span>
        </div>

        <!-- Error State -->
        <div v-if="error" class="text-center py-16 max-w-sm mx-auto">
          <div class="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <p class="text-slate-600 font-medium">{{ error }}</p>
          <button @click="fetchOrders()" class="mt-5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md shadow-amber-500/10 transition-all text-sm">
            {{ t('orders.retry') }}
          </button>
        </div>

        <!-- Empty Orders State -->
        <div v-if="!loading && !error && orders.length === 0" class="text-center py-20 max-w-sm mx-auto">
          <div class="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v6a2 2 0 012-2m14-8V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-1">{{ t('orders.noOrders') }}</h3>
          <p class="text-sm text-slate-400">{{ t('orders.emptySubtitle') }}</p>
        </div>

        <!-- Orders Workspace Area -->
        <div v-if="orders.length > 0" class="space-y-6">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-100 gap-4">
            <div>
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('orders.title') }}</h1>
              <p class="text-sm text-slate-400">{{ t('orders.subtitle') }}</p>
            </div>
            <div class="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {{ t('orders.totalCount') }}: {{ orders.length }}
            </div>
          </div>

          <div class="space-y-4">
            <div v-for="order in orders" :key="order.id"
                 class="border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

              <!-- Container Card Bar Header -->
              <div @click="toggleDetails(order.id)"
                   class="p-5 md:p-6 bg-white hover:bg-slate-50/70 transition cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6 select-none">

                <div class="flex items-center gap-4 w-full md:w-auto">
                  <!-- Overlapping Product Preview Group Stack -->
                  <div class="flex items-center -space-x-4 rtl:space-x-reverse flex-shrink-0">
                    <div v-for="(item, index) in order.order_items.slice(0, 3)" :key="index"
                         class="w-14 h-14 rounded-xl border-4 border-white overflow-hidden bg-slate-50 shadow-sm flex-shrink-0">
                      <img :src="getProductImage(item.product)" :alt="getProductName(item.product)"
                           class="w-full h-full object-contain" />
                    </div>
                    <div v-if="order.order_items.length > 3"
                         class="w-14 h-14 rounded-xl bg-slate-900 border-4 border-white text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0">
                      +{{ order.order_items.length - 3 }}
                    </div>
                  </div>

                  <div class="text-left rtl:text-right">
                    <h3 class="text-base font-bold text-slate-900">
                      {{ t('orders.orderNumber') }} #{{ order.id }}
                    </h3>
                    <p class="text-xs font-medium text-slate-400 mt-0.5">
                      {{ formatDate(order.created_at) }} <span class="mx-1.5 text-slate-200">•</span> {{ order.order_items.length }} {{ t('orders.items') }}
                    </p>
                  </div>
                </div>

                <!-- Right Metadata Status Badge Wrapper -->
                <div class="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t border-slate-50 md:border-none gap-2">
                  <span :class="getStatusBadgeClass(order.status)" class="text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 transition">
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ getStatusLabel(order.status) }}
                  </span>

                  <p class="text-lg font-black text-slate-900">
                    {{ order.total_price }} <span class="text-sm font-semibold text-slate-400">{{ t('currencyLabel') }}</span>
                  </p>
                </div>

                <!-- Arrow Indicator Icon -->
                <div class="hidden md:block text-slate-400">
                  <svg :class="{ 'rotate-180 text-amber-500': expandedOrders.includes(order.id) }"
                       class="w-5 h-5 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <!-- Fancy Expanded Drawer Sheet Details -->
              <transition name="fade">
                <div v-if="expandedOrders.includes(order.id)" class="border-t border-slate-100 bg-slate-50/40 p-5 md:p-6 space-y-6">

                  <!-- Products Rows List -->
                  <div class="space-y-3">
                    <h4 class="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">{{ t('orders.orderDetails') }}</h4>

                    <div v-for="item in order.order_items" :key="item.id"
                         class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-slate-200 transition duration-200">

                      <div class="flex items-center gap-4">
                        <div class="w-16 h-16 rounded-xl border border-slate-100 p-1 bg-white overflow-hidden flex-shrink-0">
                          <img :src="getProductImage(item.product)" :alt="getProductName(item.product)"
                               class="w-full h-full object-contain" />
                        </div>
                        <div>
                          <h5 class="font-bold text-slate-800 text-sm line-clamp-1">{{ getProductName(item.product) }}</h5>
                          <p v-if="item.product?.sku" class="text-xs font-mono text-slate-400 mt-0.5">{{ t('orders.sku') }}: {{ item.product.sku }}</p>
                        </div>
                      </div>

                      <div class="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-none pt-3 sm:pt-0 border-slate-50">
                        <div class="text-left sm:text-right">
                          <p class="text-xs text-slate-400 font-medium">{{ t('orders.unitCost') }}</p>
                          <p class="text-sm font-semibold text-slate-700">{{ item.price }} {{ t('currencyLabel') }}</p>
                        </div>
                        <div class="text-center">
                          <p class="text-xs text-slate-400 font-medium">{{ t('orders.quantity') }}</p>
                          <p class="text-sm font-bold text-slate-800">×{{ item.quantity }}</p>
                        </div>
                        <div class="text-right">
                          <p class="text-xs text-slate-400 font-medium">{{ t('orders.subtotal') }}</p>
                          <p class="text-sm font-black text-amber-600">
                            {{ (item.quantity * parseFloat(item.price)).toFixed(2) }} {{ t('currencyLabel') }}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                  <!-- Segment Grid Splitter for Notes & Billing Breakdown -->
                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">

                    <div class="lg:col-span-7 space-y-4">
                      <!-- Structured Memo Notes Card Box -->
                      <div v-if="order.notes" class="p-4 bg-amber-50/50 border border-amber-100/70 rounded-xl">
                        <h4 class="font-bold text-xs text-amber-800 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>
                          {{ t('orders.notes') }}
                        </h4>
                        <p class="text-xs leading-relaxed text-slate-600 italic">" {{ order.notes }} "</p>
                      </div>
                    </div>

                    <!-- Financial Summary Frame Section -->
                    <div class="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-3">
                      <h4 class="font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-50 pb-2 mb-1">
                        {{ t('orders.paymentSummary') }}
                      </h4>

                      <div class="space-y-2 text-xs font-medium text-slate-500">
                        <div class="flex justify-between">
                          <span>{{ t('orders.subtotalCost') }}</span>
                          <span class="text-slate-800 font-semibold">{{ order.sub_total_price }} {{ t('currencyLabel') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>{{ t('orders.taxationFee') }}</span>
                          <span class="text-slate-800 font-semibold">+ {{ order.tax_fee }} {{ t('currencyLabel') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>{{ t('orders.serviceSurcharge') }}</span>
                          <span class="text-slate-800 font-semibold">+ {{ order.service_fee }} {{ t('currencyLabel') }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>{{ t('orders.shippingLogistics') }}</span>
                          <span class="text-slate-800 font-semibold">+ {{ order.delivery_fee }} {{ t('currencyLabel') }}</span>
                        </div>

                        <div v-if="parseFloat(order.coupon) > 0" class="flex justify-between text-emerald-600 font-bold bg-emerald-50/50 p-1 px-2 rounded-lg">
                          <span>{{ t('orders.couponApplied') }}</span>
                          <span>- {{ order.coupon }} {{ t('currencyLabel') }}</span>
                        </div>

                        <div v-if="parseFloat(order.total_discounts_fees) > 0" class="flex justify-between text-red-500 font-bold">
                          <span>{{ t('orders.markdownFees') }}</span>
                          <span>- {{ order.total_discounts_fees }} {{ t('currencyLabel') }}</span>
                        </div>

                        <div class="flex justify-between font-black text-sm text-slate-900 pt-3 border-t border-slate-100 mt-2">
                          <span class="text-base text-slate-800">{{ t('orders.grandTotal') }}</span>
                          <span class="text-lg text-amber-600">{{ order.total_price }} {{ t('currencyLabel') }}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Interactive Pagination Element Bar -->
        <div v-if="pagination.last_page > 1" class="mt-12 flex justify-center items-center gap-2 flex-wrap">
          <button @click="fetchOrders(pagination.current_page - 1)"
                  :disabled="pagination.current_page === 1"
                  class="p-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 active:scale-95 transition-all">
            {{ t('orders.previous') }}
          </button>

          <button v-for="link in pagination.links" :key="link.label"
                  @click="link.url && fetchOrders(getPageNumber(link.url))"
                  :class="{
                    'bg-slate-900 text-white shadow-md shadow-slate-900/10': link.active,
                    'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100': !link.active && link.url,
                    'text-slate-300 pointer-events-none': !link.url
                  }"
                  class="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all"
                  :disabled="!link.url">
            <span v-html="link.label"></span>
          </button>

          <button @click="fetchOrders(pagination.current_page + 1)"
                  :disabled="pagination.current_page === pagination.last_page"
                  class="p-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 active:scale-95 transition-all">
            {{ t('orders.next') }}
          </button>
        </div>
      </main>
    </div>
    <Toast />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import { useAuthStore } from '../../../../../stores/WebAuth'
import moment from 'moment'

const router = useRouter()
const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()

// Data states
const orders = ref([])
const loading = ref(true)
const error = ref(null)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  links: []
})
const expandedOrders = ref([])

// Map order states dynamically linked entirely to language localized JSON files
const ordersStatus = [
  { value: 1, label: 'order.pending', color: 'info' },
  { value: 2, label: 'order.processing', color: 'warning' },
  { value: 3, label: 'order.ready', color: 'success' },
  { value: 4, label: 'order.shipped', color: 'primary' },
  { value: 5, label: 'order.delivered', color: 'success' },
  { value: 6, label: 'order.cancelled', color: 'danger' },
]

const getStatusConfig = (statusValue) => {
  return ordersStatus.find(status => status.value === statusValue) || { label: 'orders.statusUnknown', color: 'default' }
}

const getStatusLabel = (statusValue) => {
  return t(getStatusConfig(statusValue).label)
}

const getStatusBadgeClass = (statusValue) => {
  const config = getStatusConfig(statusValue)
  switch (config.color) {
    case 'info':
      return 'bg-blue-50 text-blue-600 border border-blue-100'
    case 'warning':
      return 'bg-amber-50 text-amber-600 border border-amber-100'
    case 'success':
      return 'bg-emerald-50 text-emerald-600 border border-emerald-100'
    case 'primary':
      return 'bg-indigo-50 text-indigo-600 border border-indigo-100'
    case 'danger':
      return 'bg-rose-50 text-rose-600 border border-rose-100'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const toggleDetails = (orderId) => {
  const index = expandedOrders.value.indexOf(orderId)
  if (index > -1) {
    expandedOrders.value.splice(index, 1)
  } else {
    expandedOrders.value.push(orderId)
  }
}

const formatDate = (dateString) => {
  return moment(dateString).format('DD MMMM YYYY • hh:mm A')
}

const getProductName = (product) => {
  return localStorage.getItem('appLang') === 'ar' ? (product.name_ar || product.name_en) : (product.name_en || product.name_ar)
}

const getProductImage = (product) => {
  return product.media?.[0]?.url || product.key_default_image || 'https://placehold.co/80x80/f8fafc/94a3b8?text=No+Image'
}

const getPageNumber = (url) => {
  if (!url) return null
  try {
    return new URL(url).searchParams.get('page')
  } catch {
    return null
  }
}

const fetchOrders = async (page = 1) => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(`/api/profile/orders?page=${page}&limit=4`)
    orders.value = res.data.data.data
    pagination.value = {
      current_page: res.data.data.current_page,
      last_page: res.data.data.last_page,
      links: res.data.data.links
    }
  } catch (err) {
    error.value = err.response?.status === 404
      ? t('orders.noOrdersAvailable')
      : t('orders.loadError')
    toast.add({ severity: 'error', summary: t('error'), detail: error.value, life: 5000 })
  } finally {
    loading.value = false
  }
}

const logout = async () => {
  try {
    await axios.post('/api/logout')
    authStore.handleLogout()
    toast.add({ severity: 'success', summary: t('success'), detail: t('profile.logoutSuccess'), life: 3000 })
    router.push({ name: 'login' })
  } catch {
    toast.add({ severity: 'error', summary: t('error'), detail: t('profile.logoutError'), life: 3000 })
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  max-height: 2500px;
  transform: translateY(0);
}
</style>
