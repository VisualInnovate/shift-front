<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

// ── DATA & STATE ────────────────────────────────────────────────
const orders       = ref([])
const loading      = ref(true)
const stats        = ref({})
const activeMobileTab = ref(2)
const searchQuery  = ref('')
const now          = ref(new Date())   // ← reactive clock

let clockInterval = null

// ── STATUS CONFIG ───────────────────────────────────────────────
const statusColumns = computed(() => [


  { value: 1, label: t('order.status1') || 'Assign Distributor', icon: 'pi-user-plus',    headerGradient: 'from-sky-400 to-sky-600',       cardBorder: 'border-l-sky-400',    badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',    countBadge: 'bg-sky-500/20 text-white', colBg: 'bg-sky-50/60',     colBorder: 'border-sky-100',   iconBg: 'bg-sky-100',    iconColor: 'text-sky-500',    emptyIcon: 'pi-user-plus'  },
  { value: 2, label: t('order.status2') || 'Processed',          icon: 'pi-cog',          headerGradient: 'from-violet-400 to-violet-600', cardBorder: 'border-l-violet-400', badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200', countBadge: 'bg-violet-500/20 text-white', colBg: 'bg-violet-50/60', colBorder: 'border-violet-100', iconBg: 'bg-violet-100', iconColor: 'text-violet-500', emptyIcon: 'pi-cog'       },
  { value: 3, label: t('order.status3') || 'Assign Driver',      icon: 'pi-car',          headerGradient: 'from-orange-400 to-orange-600', cardBorder: 'border-l-orange-400', badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200', countBadge: 'bg-orange-500/20 text-white', colBg: 'bg-orange-50/60', colBorder: 'border-orange-100', iconBg: 'bg-orange-100', iconColor: 'text-orange-500', emptyIcon: 'pi-car'       },
  { value: 4, label: t('order.status4') || 'Delivering',         icon: 'pi-truck',        headerGradient: 'from-amber-400 to-amber-600',   cardBorder: 'border-l-amber-400',  badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',  countBadge: 'bg-amber-500/20 text-white',  colBg: 'bg-amber-50/60',   colBorder: 'border-amber-100',  iconBg: 'bg-amber-100',  iconColor: 'text-amber-500',  emptyIcon: 'pi-truck'     },
  { value: 5, label: t('order.status5') || 'Delivered',          icon: 'pi-box',          headerGradient: 'from-teal-400 to-teal-600',     cardBorder: 'border-l-teal-400',   badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',     countBadge: 'bg-teal-500/20 text-white',   colBg: 'bg-teal-50/60',    colBorder: 'border-teal-100',   iconBg: 'bg-teal-100',   iconColor: 'text-teal-500',   emptyIcon: 'pi-box'       },
  { value: 6, label: t('order.status6') || 'Completed',          icon: 'pi-check-circle', headerGradient: 'from-emerald-400 to-emerald-600', cardBorder: 'border-l-emerald-400', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', countBadge: 'bg-emerald-500/20 text-white', colBg: 'bg-emerald-50/60', colBorder: 'border-emerald-100', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-500', emptyIcon: 'pi-check-circle' },
])

// ── NORMALIZE ───────────────────────────────────────────────────
const normalizeOrder = (raw) => ({
  id:           raw.id,
  number:       raw.number,
  status:       raw.status,
  client:       raw.user?.name || '—',
  distributor:  raw.market?.name_en || raw.store?.name_en || '—',
  scheduled_at: raw.created_at
    ? new Date(raw.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—',
  total_price:  raw.total_price ? parseFloat(raw.total_price).toFixed(2) : '—',
  // ← store processing_at for the timer
  processing_at: raw.procedures?.processing_at ?? null,
  ready_at:      raw.procedures?.ready_at      ?? null,
  _raw: raw,
})

// ── TIMER HELPERS ───────────────────────────────────────────────
/**
 * Returns elapsed minutes since processing_at, or null.
 * Uses reactive `now` so it updates every minute.
 */
const getElapsedMinutes = (processingAt) => {
  if (!processingAt) return null
  return (now.value - new Date(processingAt)) / 1000 / 60
}

const formatElapsed = (minutes) => {
  const m = Math.floor(minutes)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return `${h}h ${rem}m`
}

/**
 * For a given order, return timer state:
 *  null       → no processing_at or already ready
 *  { overdue: false, elapsed, remaining, label } → still within 25 min
 *  { overdue: true,  elapsed, overdueBy, label } → exceeded 25 min
 */
const getTimerState = (order) => {
  if (!order.processing_at || order.ready_at) return null
  const elapsed = getElapsedMinutes(order.processing_at)
  if (elapsed === null) return null

  if (elapsed > 25) {
    return {
      overdue:   true,
      elapsed,
      overdueBy: elapsed - 25,
      label:     ` ${formatElapsed(elapsed - 25)}`,
    }
  }

  return {
    overdue:   false,
    elapsed,
    remaining: 25 - elapsed,
    label:     `${formatElapsed(elapsed)} / 25m`,
  }
}

// ── GROUPED ORDERS ───────────────────────────────────────────────
const groupedOrders = computed(() => {
  const map = {}
  statusColumns.value.forEach(s => { map[s.value] = [] })
  const q = searchQuery.value.toLowerCase()
  orders.value.forEach(order => {
    if (map[order.status] !== undefined) {
      if (!q ||
          order.client.toLowerCase().includes(q) ||
          order.number.toLowerCase().includes(q) ||
          order.distributor.toLowerCase().includes(q)
      ) {
        map[order.status].push(order)
      }
    }
  })
  return map
})

const totalVisible = computed(() =>
  statusColumns.value.reduce((sum, col) => sum + (groupedOrders.value[col.value]?.length ?? 0), 0)
)

// ── DRAG & DROP ─────────────────────────────────────────────────
const draggedOrder   = ref(null)
const dragOverColumn = ref(null)

const onCardDragStart = (event, order) => {
  draggedOrder.value = order
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', String(order.id))
}
const onCardDragEnd = () => {
  draggedOrder.value   = null
  dragOverColumn.value = null
}
const onColumnDragOver  = (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }
const onColumnDragEnter = (colValue) => { dragOverColumn.value = colValue }
const onColumnDragLeave = (colValue) => { if (dragOverColumn.value === colValue) dragOverColumn.value = null }

const updateOrderStatus = async (order, targetStatus) => {
  if (!order || order.status === targetStatus) return
  const previousStatus = order.status
  order.status = targetStatus
  try {
    await axios.post(`/api/order/change-status/${order.id}`, null, { params: { status: targetStatus } })
    toast.add({ severity: 'success', summary: t('success'), detail: t('order.statusUpdated') || 'Order status updated', life: 3200 })
  } catch (err) {
    order.status = previousStatus
    toast.add({ severity: 'error', summary: t('error'), detail: err.response?.data?.message || 'Failed to update', life: 4400 })
  }
}

const onColumnDrop = async (event, targetStatus) => {
  event.preventDefault()
  dragOverColumn.value = null
  if (!draggedOrder.value) return
  await updateOrderStatus(draggedOrder.value, targetStatus)
}

// ── API ─────────────────────────────────────────────────────────
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/order', { params: { page: 1, limit: 999 } })
    const raw = res.data?.data?.data ?? res.data?.data ?? []
    orders.value = Array.isArray(raw) ? raw.map(normalizeOrder) : []
    stats.value  = res.data?.stats ?? {}
  } catch (err) {
    toast.add({ severity: 'error', summary: t('error'), detail: err.response?.data?.message || 'Failed to load orders', life: 4400 })
  } finally {
    loading.value = false
  }
}

const viewDetails = (id) => router.push({ name: 'order-show', params: { id } })

onMounted(() => {
  fetchOrders()
  // Update `now` every 60 seconds → timers re-compute automatically
  clockInterval = setInterval(() => { now.value = new Date() }, 60_000)
})

onUnmounted(() => {
  clearInterval(clockInterval)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <Toast />

    <!-- ── Top Bar ──────────────────────────────────────────────── -->
    <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-sm">
      <div class="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200">
            <i class="pi pi-th-large text-white text-sm"></i>
          </div>
          <h1 class="text-base font-bold text-gray-900 dark:text-white leading-tight">
            {{ t('order.management') || 'Order Management' }}
          </h1>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search orders…"
              class="pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 w-44 sm:w-56"
            />
          </div>
          <button
            @click="fetchOrders"
            class="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors"
            :class="{ 'animate-spin': loading }"
            title="Refresh"
          >
            <i class="pi pi-refresh text-xs"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-screen-2xl mx-auto px-4 sm:px-8 py-5">

      <!-- ── Stats Strip ─────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-list text-gray-500 text-sm"></i>
          </div>
          <div>
            <div class="text-xl font-black text-gray-900 dark:text-white leading-none">{{ stats.total_orders ?? orders.length }}</div>
            <div class="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">{{ t('order.totalOrders') || 'Total Orders' }}</div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-spinner text-amber-500 text-sm"></i>
          </div>
          <div>
            <div class="text-xl font-black text-amber-500 leading-none">{{ stats.total_in_progress ?? 0 }}</div>
            <div class="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">{{ t('order.inProgress') || 'In Progress' }}</div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-check-circle text-emerald-500 text-sm"></i>
          </div>
          <div>
            <div class="text-xl font-black text-emerald-500 leading-none">{{ stats.total_completed ?? 0 }}</div>
            <div class="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">{{ t('order.completed') || 'Completed' }}</div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center flex-shrink-0">
            <i class="pi pi-eye text-sky-500 text-sm"></i>
          </div>
          <div>
            <div class="text-xl font-black text-sky-500 leading-none">{{ totalVisible }}</div>
            <div class="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mt-0.5">{{ t('order.visible') || 'Visible' }}</div>
          </div>
        </div>
      </div>

      <!-- ── Loading ────────────────────────────────────────── -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-72 gap-4">
        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
            <i class="pi pi-box text-white text-xl"></i>
          </div>
          <div class="absolute -inset-1 rounded-3xl border-2 border-orange-300/50 animate-ping"></div>
        </div>
        <p class="text-xs font-semibold text-gray-400 tracking-wide">Loading orders…</p>
      </div>

      <div v-else>
        <!-- ── Mobile Tab Navigation ───────────────────────── -->
        <div class="lg:hidden flex overflow-x-auto gap-2 pb-3 mb-4 no-scrollbar">
          <button
            v-for="col in statusColumns"
            :key="col.value"
            @click="activeMobileTab = col.value"
            :class="[
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 border',
              activeMobileTab === col.value
                ? 'bg-orange-500 text-white border-transparent shadow-md'
                : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800'
            ]"
          >
            <i :class="['pi text-[10px]', col.icon]"></i>
            {{ col.label }}
            <span :class="[
              'text-[10px] font-black px-1.5 py-0.5 rounded-full',
              activeMobileTab === col.value ? 'bg-white/25 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            ]">{{ groupedOrders[col.value]?.length ?? 0 }}</span>
          </button>
        </div>

        <!-- ── Kanban Board ────────────────────────────────── -->
        <div class="overflow-x-auto pb-4">
          <div class="flex flex-col lg:flex-row gap-4 items-start lg:min-w-max">
            <div
              v-for="col in statusColumns"
              :key="col.value"
              :class="[
                'flex-col w-full lg:w-72 xl:w-80 flex-shrink-0',
                activeMobileTab === col.value ? 'flex' : 'hidden lg:flex'
              ]"
            >
              <!-- Column Header -->
              <div :class="['bg-gradient-to-r rounded-xl px-3.5 py-3 flex items-center justify-between text-white mb-3 shadow-sm', col.headerGradient]">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <i :class="['pi text-xs', col.icon]"></i>
                  </div>
                  <span class="font-bold text-[13px] tracking-tight">{{ col.label }}</span>
                </div>
                <span :class="['text-[11px] font-black px-2 py-0.5 rounded-lg', col.countBadge]">
                  {{ groupedOrders[col.value]?.length ?? 0 }}
                </span>
              </div>

              <!-- Column Body -->
              <div :class="[
                  'rounded-xl border p-2 min-h-32 flex flex-col gap-2 transition-colors duration-200',
                  col.colBg, col.colBorder,
                  dragOverColumn === col.value ? 'ring-2 ring-orange-400/60 bg-orange-50/40 dark:bg-orange-900/20' : ''
                ]"
                @dragover.prevent="onColumnDragOver"
                @dragenter.prevent="onColumnDragEnter(col.value)"
                @dragleave="onColumnDragLeave(col.value)"
                @drop.prevent="onColumnDrop($event, col.value)"
              >
                <!-- Empty State -->
                <div
                  v-if="!groupedOrders[col.value]?.length"
                  class="flex flex-col items-center justify-center py-10 gap-3 opacity-60"
                >
                  <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <i :class="['pi text-base text-gray-300 dark:text-gray-600', col.emptyIcon]"></i>
                  </div>
                  <p class="text-[11px] font-semibold text-gray-400">
                    {{ t('common.noData') || 'No orders here' }}
                  </p>
                </div>

                <!-- Order Cards -->
                <div
                  v-for="order in groupedOrders[col.value]"
                  :key="order.id"
                  draggable="true"
                  :class="[
                    'bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 border-l-[3px] p-3.5 shadow-sm cursor-pointer',
                    'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200',
                    col.cardBorder,
                    draggedOrder?.id === order.id ? 'opacity-70' : ''
                  ]"
                  @dragstart="(e) => onCardDragStart(e, order)"
                  @dragend="onCardDragEnd"
                  @click="viewDetails(order.id)"
                >
                  <!-- Top Row -->
                  <div class="flex items-start justify-between gap-2 mb-3">
                    <div class="min-w-0">
                      <p class="text-[13px] font-black text-gray-900 dark:text-white leading-tight truncate">
                        #{{ order.number.split('-')[0].toUpperCase() }}
                      </p>
                      <p class="text-[10px] text-gray-400 font-medium mt-0.5">ID {{ order.id }}</p>
                    </div>
                    <span :class="['text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0', col.badge]">
                      {{ col.label }}
                    </span>
                  </div>

                  <!-- Client -->
                  <div class="flex items-center gap-2 mb-1.5">
                    <div :class="['w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0', col.iconBg]">
                      <i :class="['pi pi-user text-[10px]', col.iconColor]"></i>
                    </div>
                    <span class="text-[12px] font-semibold text-gray-800 dark:text-gray-200 truncate">{{ order.client }}</span>
                  </div>

                  <!-- Distributor -->
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <i class="pi pi-building text-[10px] text-gray-400"></i>
                    </div>
                    <span class="text-[11px] text-gray-400 truncate font-medium">{{ order.distributor }}</span>
                  </div>

                  <!-- ── TIMER BADGE ────────────────────────────────── -->
                  <template v-if="getTimerState(order) !== null && [2].includes(order.status)  ">
                    <div
                      :class="[
                        'flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg mb-2',
                        getTimerState(order).overdue
                          ? 'bg-red-50 text-red-700 ring-1 ring-red-200'
                          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      ]"
                    >
                      <i
                        :class="[
                          'pi text-[11px]',
                          getTimerState(order).overdue
                            ? 'pi-exclamation-circle animate-pulse'
                            : 'pi-clock'
                        ]"
                      ></i>
                      <span>{{ t('order.overdueBy') }} {{ getTimerState(order).label }}</span>

                      <!-- progress bar only when NOT overdue -->
                      <div
                        v-if="!getTimerState(order).overdue"
                        class="flex-1 bg-blue-200 rounded-full h-1 overflow-hidden ml-1"
                      >
                        <div
                          class="h-full bg-blue-500 rounded-full transition-all duration-1000"
                          :style="{ width: Math.min((getTimerState(order).elapsed / 25) * 100, 100) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </template>
                  <!-- ────────────────────────────────────────────────── -->

                  <!-- Footer -->
                  <div class="pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div class="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold">
                      <i class="pi pi-calendar text-[10px]"></i>
                      <span>{{ order.scheduled_at }}</span>
                    </div>
                    <span class="text-[13px] font-black text-gray-900 dark:text-white">
                      {{ order.total_price }}{{ $t('currencyLabel') }}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
