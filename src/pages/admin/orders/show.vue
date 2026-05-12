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
  }
}

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
</style>
