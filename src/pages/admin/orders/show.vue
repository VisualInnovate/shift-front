<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

// PrimeVue Components
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import Divider from 'primevue/divider'
import Dialog from 'primevue/dialog'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const orderData = ref(null)
const loading = ref(true)
const isGeneratingInvoice = ref(false)
const displayConfirmationModal = ref(false)

const lang = localStorage.getItem('appLang') || 'en'

// ─── Computed Logic ───────────────────────────────────────────────────────────

const isProcessingOverdue = computed(() => {
  const proc = orderData.value?.procedures
  if (!proc?.processing_at || proc?.ready_at) return false
  const processingTime = new Date(proc.processing_at)
  const now = new Date()
  const diffMinutes = (now - processingTime) / 1000 / 60
  return diffMinutes > 25
})

const procedureSteps = computed(() => {
  const proc = orderData.value?.procedures
  if (!proc) return []

  const steps = [
    { key: 'pending_at',    labelKey: 'order.proc.pending',    icon: 'pi pi-clock' },
    { key: 'processing_at', labelKey: 'order.proc.processing', icon: 'pi pi-spin pi-spinner' },
    { key: 'ready_at',      labelKey: 'order.proc.ready',      icon: 'pi pi-check-circle' },
    { key: 'shipped_at',    labelKey: 'order.proc.shipped',    icon: 'pi pi-send' },
    { key: 'delivered_at',  labelKey: 'order.proc.delivered',  icon: 'pi pi-home' },
  ]

  if (proc.cancelled_at) {
    steps.push({ key: 'cancelled_at', labelKey: 'order.proc.cancelled', icon: 'pi pi-times-circle' })
  }

  return steps.map(step => ({
    ...step,
    timestamp: proc[step.key],
    done: !!proc[step.key],
  }))
})

const sortedOrderItems = computed(() => {
  if (!orderData.value?.order_items) return []
  return [...orderData.value.order_items].sort((a, b) =>
    (a.product?.category_id || 0) - (b.product?.category_id || 0)
  )
})

// ─── Actions ──────────────────────────────────────────────────────────────────

const fetchOrderData = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/order/${route.params.id}`)
    if (res.data?.is_success && res.data?.data) {
      orderData.value = res.data.data
    } else {
      throw new Error('No data')
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('order.loadError'), life: 5000 })
  } finally {
    loading.value = false
  }
}

const openGenerateInvoiceModal = () => {
  if (!orderData.value) return
  displayConfirmationModal.value = true
}

const confirmAndGenerateInvoice = async () => {
  displayConfirmationModal.value = false
  isGeneratingInvoice.value = true
  try {
    // Map all item IDs from orderData instead of using a selection ref
    const allItemIds = orderData.value.order_items.map(i => i.id)

    const res = await axios.post('/api/invoice', {
      order_id: orderData.value.id,
      items: allItemIds
    })

    await fetchOrderData()
    toast.add({ severity: 'success', summary: t('success'), detail: t('order.invoiceSuccess') })
    if (res.data?.invoice_url) window.open(res.data.invoice_url, '_blank')
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('order.invoiceError') })
  } finally {
    isGeneratingInvoice.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v) => `${parseFloat(v || 0).toFixed(2)} ${t('currencyLabel')}`
const getProductName = (p) => lang === 'ar' ? p.name_ar : p.name_en
const getProductImage = (p) => p.media?.[0]?.url || p.key_default_image || '/images/no-image.png'
const formatDate = (d) => d ? new Date(d).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US') : '—'

onMounted(fetchOrderData)
</script>

<template>
  <div
    class="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900"
    :dir="lang === 'ar' ? 'rtl' : 'ltr'"
  >
    <Toast />

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-[60vh]">
      <ProgressSpinner strokeWidth="3" fill="transparent" animationDuration=".5s" />
      <p class="mt-4 text-[#0b3baa] font-bold tracking-wider animate-pulse">{{ t('loading') }}</p>
    </div>

    <div v-else-if="orderData" class="max-w-6xl mx-auto space-y-6">

      <!-- Header Section -->
      <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#0b3baa]/10 rounded-2xl flex items-center justify-center text-[#0b3baa]">
             <i class="pi pi-shopping-bag text-xl"></i>
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-black text-slate-800">
              {{ t('order.details') }} <span class="text-[#0b3baa]">#{{ orderData.id }}</span>
            </h1>
            <div class="flex items-center justify-center gap-4">
              <p class="text-slate-400 text-sm font-medium">{{ formatDate(orderData.created_at) }}</p>
              <p class="text-slate-400 text-sm font-medium">otp: {{ orderData.otp || '—' }}</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            icon="pi pi-chevron-left"
            outlined
            class="!rounded-xl !p-3 hover:!bg-slate-100"
            @click="router.back()"
          />
          <Button
            :label="t('order.generateInvoice')"
            icon="pi pi-file-pdf"
            :disabled="orderData.has_invoice "
            class="!bg-[#0b3baa] !border-none !rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all"
            :loading="isGeneratingInvoice"
            @click="openGenerateInvoiceModal"
          />
        </div>
      </header>

      <!-- Alert: Overdue -->
      <transition name="fade">
        <div
          v-if="isProcessingOverdue"
          class="flex items-center gap-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl p-4"
        >
          <div class="shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center animate-bounce">
            <i class="pi pi-bolt text-lg"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-red-900 leading-none">{{ t('order.proc.overdueTitle') }}</p>
            <p class="text-xs mt-1 text-red-600 opacity-80">{{ t('order.proc.overdueDesc') }}</p>
          </div>
        </div>
      </transition>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- Left Column: Details -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Info Card: Customer & Store -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i class="pi pi-user text-[#0b3baa]"></i> {{ t('order.customerInfo') }}
              </h3>
              <div class="flex justify-between items-center mb-3">
                <span class="text-slate-500 text-sm">{{ t('order.name') }}</span>
                <span class="font-bold text-slate-800">{{ orderData.user?.name }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500 text-sm">{{ t('order.phone') }}</span>
                <span class="font-bold text-slate-800 dir-ltr">{{ orderData.user?.phone }}</span>
              </div>
            </div>
            <Divider />
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <i class="pi pi-shop text-[#0b3baa]"></i> {{ t('order.storeInfo') }}
              </h3>
              <div class="flex justify-between items-center mb-3">
                <span class="text-slate-500 text-sm">{{ t('order.storeName') }}</span>
                <span class="font-bold text-slate-800">{{ lang === 'ar' ? orderData.store?.name_ar : orderData.store?.name_en }}</span>
              </div>
              <div class="flex justify-between items-center">
                 <span class="text-slate-500 text-sm">{{ t('order.storeStatus') }}</span>
                 <Tag
                  :value="orderData.store?.is_busy ? t('order.busy') : t('order.available')"
                  :severity="orderData.store?.is_busy ? 'danger' : 'success'"
                  rounded
                 />
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-200 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-[#0b3baa] opacity-20 rounded-full"></div>
            <h3 class="text-xs font-bold text-[#F3B913] uppercase tracking-widest mb-6">{{ t('order.financialSummary') }}</h3>
            <div class="space-y-4 relative z-10">
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.subtotal') }}</span>
                <span class="text-white">{{ formatCurrency(orderData.sub_total_price) }}</span>
              </div>
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.fees') }}</span>
                <span class="text-white">{{ formatCurrency(parseFloat(orderData.tax_fee) + parseFloat(orderData.service_fee)) }}</span>
              </div>
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.delivery') }}</span>
                <span class="text-white">{{ formatCurrency(orderData.delivery_fee) }}</span>
              </div>
              <Divider class="!border-slate-700" />
              <div class="flex justify-between items-end">
                <span class="text-[#F3B913] font-bold">{{ t('order.total') }}</span>
                <span class="text-3xl font-black text-white">{{ formatCurrency(orderData.total_price) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-8 space-y-6">
          <!-- Procedures -->
          <section class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-2 border-b border-slate-100 bg-slate-50/50">
              <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i class="pi pi-list-check text-[#0b3baa]"></i>
                {{ t('order.procedures') }}
              </h3>
            </div>
            <div class="p-6">
              <div class="flex flex-col gap-0">
                <div v-for="(step, index) in procedureSteps" :key="step.key" class="flex gap-4 group">
                  <div class="flex flex-col items-center">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm transition-all duration-300 text-sm"
                      :class="[
                        step.done && step.key !== 'cancelled_at'
                          ? 'bg-[#0b3baa] text-white ring-4 ring-[#0b3baa]/20'
                          : step.key === 'cancelled_at' && step.done
                            ? 'bg-red-500 text-white ring-4 ring-red-200'
                            : 'bg-slate-100 text-slate-400 ring-4 ring-transparent'
                      ]"
                    >
                      <i :class="step.done ? step.icon : 'pi pi-minus'" class="text-xs"></i>
                    </div>
                    <div
                      v-if="index < procedureSteps.length - 1"
                      class="w-0.5 flex-1 min-h-[1rem] mt-1 rounded-full transition-all duration-300"
                      :class="step.done ? 'bg-[#0b3baa]/30' : 'bg-slate-200'"
                    ></div>
                  </div>
                  <div class="flex-1 pb-2 group-last:pb-0">
                    <div
                      class="rounded-xl p-2 border transition-all duration-200"
                      :class="[
                        step.done && step.key !== 'cancelled_at'
                          ? 'bg-[#0b3baa]/5 border-[#0b3baa]/20'
                          : step.key === 'cancelled_at' && step.done
                            ? 'bg-red-50 border-red-200'
                            : 'bg-slate-50 border-slate-100'
                      ]"
                    >
                      <div class="flex items-center justify-between flex-wrap gap-2">
                        <p class="text-sm font-bold" :class="[step.done && step.key !== 'cancelled_at' ? 'text-[#0b3baa]' : step.key === 'cancelled_at' && step.done ? 'text-red-600' : 'text-slate-400']">
                          {{ t(step.labelKey) }}
                        </p>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="[step.done && step.key !== 'cancelled_at' ? 'bg-[#0b3baa] text-white' : step.key === 'cancelled_at' && step.done ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-400']">
                          {{ step.done ? t('order.proc.done') : t('order.proc.notYet') }}
                        </span>
                      </div>
                      <div v-if="step.timestamp" class="mt-2 flex items-center gap-2 flex-wrap">
                        <span class="flex items-center gap-1 text-xs text-slate-500">
                          <i class="pi pi-calendar text-xs"></i>
                          {{ formatDate(step.timestamp) }}
                        </span>
                        <span v-if="step.key === 'processing_at' && isProcessingOverdue" class="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-amber-300">
                          <i class="pi pi-exclamation-circle text-xs"></i>
                          +25 {{ t('order.proc.minutes') }}
                        </span>
                      </div>
                      <p v-else class="mt-1 text-xs text-slate-400 italic">{{ t('order.proc.waiting') }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Items Table -->
          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <i class="pi pi-box text-[#0b3baa]"></i>
                {{ t('order.items') }}
                <Tag :value="orderData.order_items?.length" rounded class="!bg-slate-200 !text-slate-600 !text-[10px]" />
              </h3>
            </div>

            <DataTable
              :value="sortedOrderItems"
              dataKey="id"
              class="p-datatable-custom"
              responsiveLayout="scroll"
              :rowHover="true"
            >
              <!-- Selection column removed -->
              <Column :header="t('order.product')" class="pl-6">
                <template #body="{ data }">
                  <div class="flex items-center gap-4 py-2">
                    <img :src="getProductImage(data.product)" class="w-12 h-12 rounded-xl object-cover ring-4 ring-slate-50" />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-800 text-sm leading-tight">{{ getProductName(data.product) }}</span>
                      <span class="text-[10px] text-slate-400 mt-1 uppercase font-medium">SKU: {{ data.product?.code || 'N/A' }}</span>
                    </div>
                  </div>
                </template>
              </Column>
              <Column :header="t('order.qty')" class="text-center">
                <template #body="{ data }">
                  <span class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-[#0b3baa]">x{{ data.quantity }}</span>
                </template>
              </Column>
              <Column :header="t('order.price')" headerClass="text-end">
                <template #body="{ data }">
                  <span class="font-bold text-slate-800">{{ formatCurrency(data.price) }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Dialog
      v-model:visible="displayConfirmationModal"
      modal
      header=" "
      :style="{ width: '28rem' }"
      class="invoice-dialog"
    >
      <div class="text-center px-4 pb-4">
        <div class="w-20 h-20 bg-blue-50 text-[#0b3baa] rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="pi pi-file-export text-4xl"></i>
        </div>
        <h4 class="text-2xl font-black text-slate-800 mb-2">{{ t('order.confirmInvoice') }}</h4>
        <p class="text-slate-500 text-sm leading-relaxed">
          {{ t('order.invoiceNotice') }}
          <span class="text-[#0b3baa] font-bold">({{ orderData.order_items.length }} {{ t('order.items') }})</span>
        </p>
      </div>
      <template #footer>
        <div class="flex gap-3 justify-center w-full pb-4">
          <Button :label="t('cancel')" class="p-button-text !text-slate-400 !rounded-xl" @click="displayConfirmationModal = false" />
          <Button :label="t('confirm')" class="!bg-[#0b3baa] !border-none !rounded-xl px-8" @click="confirmAndGenerateInvoice" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #64748b;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1rem;
  border: none;
}
:deep(.p-datatable-tbody > tr) {
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}
:deep(.p-datatable-tbody > tr:hover) {
  background: #f1f5f9 !important;
}
:deep(.p-tag) {
  font-size: 10px;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
