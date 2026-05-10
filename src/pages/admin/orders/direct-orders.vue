<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
    <Toast />

    <!-- ── HEADER SECTION ── -->
    <div class="max-w-7xl mx-auto mb-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#0b3baa]">
        <div class="flex items-center gap-4">
          <div class="bg-slate-100 p-3 rounded-xl">
            <i class="pi pi-box text-2xl text-[#0b3baa]"></i>
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-800 uppercase">
              {{ t('order.management') }}
            </h1>
            <p class="text-slate-500 text-sm mt-1 font-medium">
              {{ t('show') }} {{ pagination.from }} - {{ pagination.to }} {{ t('from') }} {{ pagination.total }} {{ t('navigation.orders') }}
            </p>
          </div>
        </div>
        <Button
          icon="pi pi-refresh"
          :loading="loading"
          class="!rounded-xl"
          @click="fetchOrders(pagination.current_page)"
        />
      </div>
    </div>

    <!-- ── LOADING STATE ── -->
    <div v-if="loading && !orders.length" class="flex flex-col items-center justify-center h-64">
      <ProgressSpinner strokeWidth="4" />
      <p class="mt-4 text-[#0b3baa] font-bold animate-pulse">{{ t('loading') }}...</p>
    </div>

    <!-- ── KANBAN COLUMNS ── -->
    <template v-else>
      <div class="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">

        <div v-for="col in columns" :key="col.status" class="flex flex-col gap-4">
          <!-- Column Header -->
          <div class="flex items-center justify-between px-2">
            <div class="flex items-center gap-2">
              <!-- Inline style used to guarantee color works regardless of Tailwind Purge -->
              <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: col.hex }"></span>
              <h2 class="font-black text-slate-700 uppercase tracking-wider text-xs">{{ col.label }}</h2>
            </div>
            <span
              class="text-white px-3 py-0.5 rounded-full text-xs font-black shadow-sm"
              :style="{ backgroundColor: col.hex }"
            >
              {{ groupedOrders[col.status]?.length || 0 }}
            </span>
          </div>

          <!-- Orders Container -->
          <div class="space-y-4 min-h-[300px] pb-10">
            <div v-if="!groupedOrders[col.status]?.length" class="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center opacity-60">
              <i class="pi pi-inbox text-slate-300 text-3xl mb-2"></i>
              <p class="text-slate-400 text-[10px] font-black uppercase">{{ t('order.noData') }}</p>
            </div>

            <div
              v-for="order in groupedOrders[col.status]"
              :key="order.id"
              class="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden"
              @click="viewDetails(order.id)"
            >
              <!-- Gold Hover Accent -->
              <div class="absolute top-0 inset-x-0 h-1 bg-[#F3B913] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>

              <div class="flex justify-between items-start mb-4">
                <div class="max-w-[70%]">
                  <p class="text-xs font-bold text-[#0b3baa] truncate">#{{ order.id }}</p>
                </div>
                <div class="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:bg-[#0b3baa] group-hover:text-white transition-colors">
                  <i class="pi pi-eye text-xs"></i>
                </div>
              </div>

              <!-- Store & User Info -->
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <i class="pi pi-shopping-cart text-slate-500 text-xs"></i>
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] text-slate-400 font-bold uppercase leading-none">{{ t('store.default') }}</p>
                    <p class="text-xs font-black text-slate-700 truncate">{{ lang === 'ar' ? order.store?.name_ar : order.store?.name_en }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <i class="pi pi-user text-slate-500 text-xs"></i>
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] text-slate-400 font-bold uppercase leading-none">{{ t('invoice.customer') }}</p>
                    <p class="text-xs font-bold text-slate-600 truncate">{{ order.user?.name }}</p>
                  </div>
                </div>
              </div>

              <Divider class="!my-4 opacity-50" />

              <div class="flex justify-between items-center">
                <div class="flex items-center gap-1.5 text-slate-400">
                  <i class="pi pi-calendar text-[10px]"></i>
                  <span class="text-[10px] font-black uppercase tracking-tighter">{{ formatDate(order.created_at) }}</span>
                </div>
                <span class="text-sm font-black text-slate-900">{{ order.total_price }} <small class="text-[10px] text-slate-400">{{$t('currencyLabel')}}</small></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

// PrimeVue Components
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

let refreshInterval = null
const orders = ref([])
const loading = ref(true)
const lang = localStorage.getItem('appLang') || 'en'

const pagination = ref({
  current_page: 1,
  total: 0,
  per_page: 10,
  from: 0,
  to: 0
})

/**
 * FIXED: Added HEX codes because dynamic Tailwind classes often fail if not whitelisted.
 * Added all 5 statuses from your API.
 */
const columns = [
  { status: 5, label: t('order.delivered'), hex: '#22C55E' },
  { status: 1, label: t('order.pending'), hex: '#3B82F6' },
  { status: 2, label: t('order.processing'), hex: '#F59E0B' },
  { status: 3, label: t('order.ready'), hex: '#10B981' },
  { status: 4, label: t('order.shipped'), hex: '#6366F1' },
]

/**
 * FIXED: Dynamically build the keys based on available columns
 */
const groupedOrders = computed(() => {
  // Initialize groups for every column defined above
  const groups = {}
  columns.forEach(col => {
    groups[col.status] = []
  })

  // Distribute orders
  orders.value.forEach(order => {
    if (groups[order.status]) {
      groups[order.status].push(order)
    }
  })
  return groups
})

const fetchOrders = async (page = 1) => {
  // Only show full loader on first fetch
  if (orders.value.length === 0) loading.value = true

  try {
    const res = await axios.get(`/api/order?page=${page}`)
    if (res.data?.is_success) {
      const apiResponse = res.data.data
      orders.value = apiResponse.data
      pagination.value = {
        current_page: apiResponse.current_page,
        total: apiResponse.total,
        per_page: apiResponse.per_page,
        from: apiResponse.from,
        to: apiResponse.to
      }
    }
  } catch (error) {
    console.error("Fetch Error:", error)
    toast.add({ severity: 'error', summary: t('error'), detail: t('order.loadError'), life: 3000 })
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const viewDetails = (id) => {
  router.push({ name: 'order-show', params: { id } })
}

onMounted(() => {
  fetchOrders()
  // Auto refresh every 10 seconds
  refreshInterval = setInterval(() => {
    fetchOrders(pagination.value.current_page)
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>
