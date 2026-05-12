<<<<<<< Updated upstream
<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
    <Toast />
    <ConfirmDialog />

    <!-- ── HEADER SECTION ── -->
    <div class="max-w-7xl mx-auto mb-6">
      <div
        class="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#0b3baa]"
      >
        <div class="flex items-center gap-4">
          <div class="bg-slate-100 p-3 rounded-xl">
            <i class="pi pi-box text-2xl text-[#0b3baa]"></i>
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-800 uppercase">
              {{ t('order.management') }}
            </h1>
            <p class="text-slate-500 text-sm mt-1 font-medium">
              {{ t('show') }} {{ pagination.from }} - {{ pagination.to }} {{ t('from') }} {{ pagination.total }}
              {{ t('navigation.orders') }}
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
      <span class="text-xs text-gray-400">{{ $t('order.dragAndDrop') }}</span>
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

          <!-- Drag & Drop container — VueDraggable wraps the cards -->
          <VueDraggable
            v-model="groupedOrders[col.status]"
            :animation="200"
            group="orders"
            ghostClass="kanban-ghost"
            chosenClass="kanban-chosen"
            dragClass="kanban-drag"
            :touchStartThreshold="3"
            :move="canMoveOrder"
            :data-status="col.status"
            class="kanban-column space-y-4 min-h-[300px] pb-10 rounded-2xl transition-all"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <!-- Empty placeholder (kept inside the draggable so cards can be dropped on empty columns) -->
            <div
              v-if="!groupedOrders[col.status]?.length"
              class="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center opacity-60 pointer-events-none"
            >
              <i class="pi pi-inbox text-slate-300 text-3xl mb-2"></i>
              <p class="text-slate-400 text-[10px] font-black uppercase">{{ t('order.noData') }}</p>
            </div>

            <div
              v-for="order in groupedOrders[col.status]"
              :key="order.id"
              class="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden"
              @click="handleCardClick(order)"
            >
              <!-- Gold Hover Accent -->
              <div
                class="absolute top-0 inset-x-0 h-1 bg-[#F3B913] scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
              ></div>

              <div class="flex justify-between items-start mb-4">
                <div class="max-w-[70%]">
                  <p class="text-xs font-bold text-[#0b3baa] truncate">#{{ order.id }}</p>
                </div>
                <div
                  class="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:bg-[#0b3baa] group-hover:text-white transition-colors"
                >
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
                    <p class="text-xs font-black text-slate-700 truncate">
                      {{ lang === 'ar' ? order.store?.name_ar : order.store?.name_en }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <i class="pi pi-user text-slate-500 text-xs"></i>
                  </div>
                  <div class="overflow-hidden">
                    <p class="text-[10px] text-slate-400 font-bold uppercase leading-none">
                      {{ t('invoice.customer') }}
                    </p>
                    <p class="text-xs font-bold text-slate-600 truncate">{{ order.user?.name }}</p>
                  </div>
                </div>
              </div>

              <Divider class="!my-4 opacity-50" />

              <div class="flex justify-between items-center">
                <div class="flex items-center gap-1.5 text-slate-400">
                  <i class="pi pi-calendar text-[10px]"></i>
                  <span class="text-[10px] font-black uppercase tracking-tighter">{{
                    formatDate(order.created_at)
                  }}</span>
                </div>
                <span class="text-sm font-black text-slate-900"
                  >{{ order.total_price }}
                  <small class="text-[10px] text-slate-400">{{ $t('currencyLabel') }}</small></span
                >
              </div>
            </div>
          </VueDraggable>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useToast } from 'primevue/usetoast'
  import { useConfirm } from 'primevue/useconfirm'
  import { useI18n } from 'vue-i18n'
  import axios from 'axios'
  import { VueDraggable } from 'vue-draggable-plus'

  // PrimeVue Components
  import Button from 'primevue/button'
  import Divider from 'primevue/divider'
  import ProgressSpinner from 'primevue/progressspinner'
  import Toast from 'primevue/toast'
  import ConfirmDialog from 'primevue/confirmdialog'

  const { t } = useI18n()
  const router = useRouter()
  const toast = useToast()
  const confirm = useConfirm()

  let refreshInterval = null
  const orders = ref([])
  const loading = ref(true)
  const lang = localStorage.getItem('appLang') || 'en'

  // Drag flags — pause auto-refresh and suppress click after drop
  const isDragging = ref(false)
  const wasDragging = ref(false)

  const pagination = ref({
    current_page: 1,
    total: 0,
    per_page: 10,
    from: 0,
    to: 0,
  })

  const columns = [
    { status: 1, label: t('order.pending'), hex: '#3B82F6' },
    { status: 2, label: t('order.processing'), hex: '#F59E0B' },
    { status: 3, label: t('order.ready'), hex: '#10B981' },
    { status: 4, label: t('order.shipped'), hex: '#6366F1' },
    { status: 5, label: t('order.delivered'), hex: '#22C55E' },
  ]

  // Reactive (not computed) so vue-draggable-plus can two-way bind on each column
  const groupedOrders = ref({})

  // Build groupedOrders from the flat orders list — called after every fetch
  const groupOrders = () => {
    const groups = {}
    columns.forEach((c) => {
      groups[c.status] = []
    })
    orders.value.forEach((order) => {
      if (groups[order.status]) {
        groups[order.status].push(order)
      }
    })
    groupedOrders.value = groups
=======
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()

// ── DATA & STATE ────────────────────────────────────────────────
const orders = ref([])
const loading = ref(true)
const stats = ref({})
const activeMobileTab = ref(2) // Defaults to the first status value (2)

// ── STATUS CONFIG ───────────────────────────────────────────────
const statusColumns = computed(() => [
  {
    value: 2,
    label: t('order.statusAssignDistributor'),
    icon: 'pi-user-plus',
    headerBg: 'bg-sky-500',
    cardBg: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-200 dark:border-sky-800',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    dot: 'bg-sky-400',
    emptyIcon: 'pi-user-plus',
  },
  {
    value: 3,
    label: t('order.statusProcessed'),
    icon: 'pi-cog',
    headerBg: 'bg-violet-500',
    cardBg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    dot: 'bg-violet-400',
    emptyIcon: 'pi-cog',
  },
  {
    value: 4,
    label: t('order.statusAssignDriver'),
    icon: 'pi-car',
    headerBg: 'bg-orange-500',
    cardBg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    dot: 'bg-orange-400',
    emptyIcon: 'pi-car',
  },
  {
    value: 5,
    label: t('order.statusDelivering'),
    icon: 'pi-truck',
    headerBg: 'bg-amber-500',
    cardBg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-400',
    emptyIcon: 'pi-truck',
  },
  {
    value: 6,
    label: t('order.statusDelivered'),
    icon: 'pi-box',
    headerBg: 'bg-teal-500',
    cardBg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-200 dark:border-teal-800',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    dot: 'bg-teal-400',
    emptyIcon: 'pi-box',
  },
  {
    value: 7,
    label: t('order.statusCompleted'),
    icon: 'pi-check-circle',
    headerBg: 'bg-green-500',
    cardBg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    dot: 'bg-green-400',
    emptyIcon: 'pi-check-circle',
  },
])

const groupedOrders = computed(() => {
  const map = {}
  statusColumns.value.forEach(s => { map[s.value] = [] })
  orders.value.forEach(order => {
    if (map[order.status] !== undefined) {
      map[order.status].push(order)
    }
  })
  return map
})

const totalVisible = computed(() =>
  statusColumns.value.reduce((sum, col) => sum + (groupedOrders.value[col.value]?.length ?? 0), 0)
)

// ── API ─────────────────────────────────────────────────────────
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/order', { params: { page: 1, limit: 999 } })
    orders.value = res.data.data ?? []
    stats.value = res.data.stats ?? {}
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: err.response?.data?.message || 'Failed to load orders',
      life: 4400,
    })
  } finally {
    loading.value = false
>>>>>>> Stashed changes
  }

<<<<<<< Updated upstream
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
          to: apiResponse.to,
        }
        groupOrders()
      }
    } catch (error) {
      console.error('Fetch Error:', error)
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
      year: 'numeric',
    })
  }

  const viewDetails = (id) => {
    router.push({ name: 'order-show', params: { id } })
  }

  // Suppress click immediately after a drag finishes
  const handleCardClick = (order) => {
    if (wasDragging.value) {
      wasDragging.value = false
      return
    }
    viewDetails(order.id)
  }

  // ── Drag & Drop logic ────────────────────────────────────────────────────────

  // Block invalid moves: backwards transitions and any move out of Delivered
  const canMoveOrder = (evt) => {
    const draggedOrder = evt.draggedContext?.element
    const targetStatus = Number(evt.to?.dataset?.status)

    if (!draggedOrder || !targetStatus) return false
    if (draggedOrder.status === 5) return false // Delivered is terminal
    if (targetStatus < draggedOrder.status) return false // No backwards moves
    return true
  }

  const onDragStart = () => {
    isDragging.value = true
    wasDragging.value = true
  }

  // Push the change to the server. On failure, rollback locally and show error.
  const persistStatusChange = async (order, oldStatus, newStatus) => {
    try {
      await axios.post(`/api/order/change-status/${order.id}`, null, {
        params: { status: newStatus },
      })
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('order.changeStatusSuccess'),
        life: 3000,
      })
    } catch (err) {
      console.error('Status change failed:', err)
      order.status = oldStatus
      groupOrders()
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('order.statusChangeError'),
        life: 5000,
      })
    }
  }

  const onDragEnd = (evt) => {
    isDragging.value = false
    setTimeout(() => {
      wasDragging.value = false
    }, 50)

    const fromStatus = Number(evt.from?.dataset?.status)
    const toStatus = Number(evt.to?.dataset?.status)
    if (!fromStatus || !toStatus) return

    // Same column reorder → no API call
    if (fromStatus === toStatus) return

    // Locate the order at its new position in the DESTINATION column
    let order = groupedOrders.value[toStatus]
    if (order.length == 1) {
      order = order[0]
    } else {
      order = order[evt.newIndex]
    }
    if (!order || !order.id) return

    const oldStatus = fromStatus
    const newStatus = toStatus
    // Optimistic update — the array move already happened via v-model
    order.status = newStatus

    confirm.require({
      message: t('order.changeStatusConfirmMsg'),
      header: t('order.changeStatusTitle'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: t('yes'),
      rejectLabel: t('no'),
      accept: () => {
        persistStatusChange(order, oldStatus, newStatus)
      },
      reject: () => {
        // User cancelled — rollback the optimistic move
        order.status = oldStatus
        groupOrders()
      },
    })
  }

  onMounted(() => {
    fetchOrders()
    // Auto refresh every 10 seconds — skipped while the user is dragging
    refreshInterval = setInterval(() => {
      if (!isDragging.value) {
        fetchOrders(pagination.value.current_page)
      }
    }, 10000)
  })

  onUnmounted(() => {
    if (refreshInterval) clearInterval(refreshInterval)
  })
</script>

<style scoped>
  /* Drag visual states — picked up by vue-draggable-plus via the *Class props */
  .kanban-ghost {
    opacity: 0.4;
  }
  .kanban-chosen {
    transform: scale(1.02);
  }
  .kanban-drag {
    opacity: 0.8;
  }

  /* Highlight the column receiving a dragged card */
  .kanban-column.sortable-drag-over,
  .kanban-column:has(.kanban-ghost) {
    background-color: rgba(11, 59, 170, 0.04);
    outline: 2px dashed rgba(11, 59, 170, 0.35);
    outline-offset: -4px;
  }
=======
const viewDetails = (id) => {
  router.push({ name: 'order-details', params: { id } })
}

onMounted(() => fetchOrders())
</script>

<template>
  <div class="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <Toast />

    <!-- ── Header & Stats ──────────────────────────────────────── -->
    <div class="mb-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          {{ t('order.management') || 'إدارة الطلبات' }}
        </h1>
        <p class="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
          {{ t('order.kanbanSubtitle') || 'عرض الطلبات مقسمة حسب الحالة' }}
        </p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-3">
        <div class="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div class="text-lg font-black text-gray-800 dark:text-gray-100">{{ stats.total_orders ?? 0 }}</div>
          <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{{ t('order.totalOrders') || 'إجمالي' }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div class="text-lg font-black text-amber-500">{{ stats.total_in_progress ?? 0 }}</div>
          <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{{ t('order.inProgress') || 'قيد التنفيذ' }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div class="text-lg font-black text-green-500">{{ stats.total_completed ?? 0 }}</div>
          <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{{ t('order.completed') || 'مكتمل' }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl px-3 py-2 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div class="text-lg font-black text-sky-500">{{ totalVisible }}</div>
          <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{{ t('order.visible') || 'مرئي' }}</div>
        </div>
      </div>
    </div>

    <!-- ── Loading ────────────────────────────────────────────── -->
    <div v-if="loading" class="flex flex-col justify-center items-center h-64 gap-3">
      <div class="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center animate-bounce">
        <i class="pi pi-box text-orange-400 text-xl"></i>
      </div>
      <p class="text-xs text-gray-400 font-medium">{{ t('common.loading') || 'جاري التحميل...' }}</p>
    </div>

    <div v-else>
      <!-- ── Mobile Tab Navigation (Visible only on small screens) ── -->
      <div class="lg:hidden flex overflow-x-auto gap-2 pb-4 mb-2 no-scrollbar">
        <button
          v-for="col in statusColumns"
          :key="col.value"
          @click="activeMobileTab = col.value"
          :class="[
            'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border',
            activeMobileTab === col.value
              ? col.headerBg + ' text-white border-transparent shadow-md'
              : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
          ]"
        >
          {{ col.label }} ({{ groupedOrders[col.value]?.length ?? 0 }})
        </button>
      </div>

      <!-- ── Kanban Board Wrapper ────────────────────────────────── -->
      <div class="overflow-x-auto lg:overflow-visible pb-6">
        <!--
          On Mobile: Show only the active column
          On Desktop: Show all columns in a flex row
        -->
        <div class="flex flex-col lg:flex-row gap-5 items-start">

          <div
            v-for="col in statusColumns"
            :key="col.value"
            v-show="activeMobileTab === col.value || $viewport?.width >= 1024"
            class="flex flex-col gap-4 w-full lg:w-80 flex-shrink-0"
            :class="{'hidden lg:flex': activeMobileTab !== col.value}"
          >
            <!-- Column Header -->
            <div :class="['rounded-2xl px-4 py-3.5 flex items-center justify-between text-white shadow-lg sticky top-0 z-10', col.headerBg]">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <i :class="['pi text-sm', col.icon]"></i>
                </div>
                <span class="font-bold text-sm tracking-tight">{{ col.label }}</span>
              </div>
              <span class="bg-black/10 text-white text-xs font-black px-2.5 py-1 rounded-lg backdrop-blur-md">
                {{ groupedOrders[col.value]?.length ?? 0 }}
              </span>
            </div>

            <!-- Empty State -->
            <div
              v-if="!groupedOrders[col.value]?.length"
              :class="['rounded-3xl border-2 border-dashed p-10 text-center flex flex-col items-center gap-3 transition-colors', col.border, 'bg-gray-50/50 dark:bg-gray-800/20']"
            >
              <i :class="['pi text-4xl opacity-20', col.emptyIcon]"></i>
              <p class="text-xs text-gray-400 font-semibold italic">
                {{ t('common.noData') || 'لا توجد طلبات' }}
              </p>
            </div>

            <!-- Order Cards -->
            <div class="flex flex-col gap-3">
              <div
                v-for="order in groupedOrders[col.value]"
                :key="order.id"
                :class="[
                  'rounded-2xl border p-4 shadow-sm active:scale-95 lg:hover:scale-[1.02] lg:hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800',
                  col.border
                ]"
                @click="viewDetails(order.id)"
              >
                <!-- Dynamic accent background (subtle) -->
                <div :class="['absolute inset-0 opacity-[0.03] pointer-events-none', col.headerBg]"></div>

                <div :class="['absolute top-0 left-0 w-1 h-full', col.headerBg]"></div>

                <div class="flex justify-between items-start mb-4 relative">
                  <div>
                    <span class="font-black text-gray-800 dark:text-gray-100 text-base block leading-tight">
                      {{ order.number }}
                    </span>
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {{ order.id }}</span>
                  </div>
                  <span :class="['text-[10px] font-black px-2 py-1 rounded-md uppercase', col.badge]">
                    {{ col.label }}
                  </span>
                </div>

                <div class="space-y-2 mb-4 relative">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <i class="pi pi-user text-[10px] text-gray-500"></i>
                    </div>
                    <span class="text-sm text-gray-700 dark:text-gray-300 font-bold truncate">
                      {{ order.client || '—' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <i class="pi pi-building text-[10px] text-gray-500"></i>
                    </div>
                    <span class="text-xs text-gray-400 dark:text-gray-500 truncate font-medium">
                      {{ order.distributor || '—' }}
                    </span>
                  </div>
                </div>

                <div class="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center relative">
                  <div class="flex items-center gap-1.5 text-[11px] text-gray-400 font-bold">
                    <i class="pi pi-calendar-clock text-xs"></i>
                    <span>{{ order.scheduled_at || '—' }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-sm font-black text-gray-900 dark:text-white">
                      {{ order.total_price }}
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
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
>>>>>>> Stashed changes
</style>
