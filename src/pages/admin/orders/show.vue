<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

// PrimeVue Components
import Card from 'primevue/card'
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
const selectedItems = ref([])

const lang = localStorage.getItem('appLang') || 'en'

/**
 * Sort items by Category ID
 */
const sortedOrderItems = computed(() => {
  if (!orderData.value?.order_items) return []
  return [...orderData.value.order_items].sort((a, b) => {
    return (a.product?.category_id || 0) - (b.product?.category_id || 0)
  })
})

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
  if (!orderData.value || selectedItems.value.length === 0) {
     toast.add({ severity: 'warn', summary: t('attention'), detail: t('order.selectFirst'), life: 3000 })
     return
  }
  displayConfirmationModal.value = true
}

const confirmAndGenerateInvoice = async () => {
  displayConfirmationModal.value = false
  isGeneratingInvoice.value = true
  try {
    const res = await axios.post('/api/invoice', {
      order_id: orderData.value.id,
      items: selectedItems.value.map(i => i.id)
    })
    fetchOrderData()
    toast.add({ severity: 'success', summary: t('success'), detail: t('order.invoiceSuccess') })
    if (res.data?.invoice_url) window.open(res.data.invoice_url, '_blank')
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('order.invoiceError') })
  } finally {
    isGeneratingInvoice.value = false
  }
}

const formatCurrency = (v) => `${parseFloat(v).toFixed(2)} ${t('currencyLabel')}`
const getProductName = (p) => lang === 'ar' ? p.name_ar : p.name_en
const getProductImage = (p) => (p.media?.[0]?.url) || p.key_default_image || '/images/no-image.png'

onMounted(fetchOrderData);
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
    <Toast />

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-64">
      <ProgressSpinner strokeWidth="4" />
      <p class="mt-4 text-[#0b3baa] font-bold animate-pulse">{{ t('loading') }}...</p>
    </div>

    <div v-else-if="orderData" class="max-w-7xl mx-auto space-y-6">

      <!-- Top Header Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#0b3baa]">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-slate-800">
            {{ t('order.details') }} <span class="text-[#0b3baa]">#{{ orderData.id }}</span>
          </h1>
          <p class="text-slate-500 text-sm mt-1 font-medium">{{ new Date(orderData.created_at).toLocaleString() }}</p>
        </div>
        <div class="flex gap-3">
          <Button
            icon="pi pi-arrow-left"
            @click="router.back()"
          />
          <Button
            :label="t('order.generateInvoice')"
            icon="pi pi-file-export"
            @click="openGenerateInvoiceModal"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left: Order Info & Totals -->
        <div class="lg:col-span-1 space-y-6">
          <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-[#0b3baa]">
              <i class="pi pi-user"></i> {{ t('order.customerInfo') }}
            </h3>
            <div class="space-y-4">
              <div class="flex justify-between border-b pb-2 border-slate-50">
                <span class="text-slate-500">{{ t('order.name') }}</span>
                <span class="font-bold text-slate-800">{{ orderData.user?.name }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-slate-500">{{ t('order.status') }}</span>
                <Tag :style="{ background: orderData.status === 0 ? '#F3B913' : '#0b3baa', color: '#fff' }"
                     :value="orderData.status === 0 ? t('order.pending') : t('order.completed')"
                     class="!rounded-lg px-3" />
              </div>
            </div>
          </section>

          <section class="bg-[#0b3baa] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <!-- Decorative Gold Accent -->
            <div class="absolute top-0 right-0 w-16 h-16 bg-[#F3B913] opacity-10 rounded-full -mr-8 -mt-8"></div>

            <h3 class="text-lg font-bold mb-4 text-[#F3B913] uppercase tracking-widest text-sm">{{ t('order.financialSummary') }}</h3>
            <div class="space-y-3">
              <div class="flex justify-between opacity-80">
                <span>{{ t('order.subtotal') }}</span>
                <span>{{ formatCurrency(orderData.sub_total_price) }}</span>
              </div>
              <div class="flex justify-between opacity-80">
                <span>{{ t('order.fees') }}</span>
                <span>{{ formatCurrency(parseFloat(orderData.tax_fee) + parseFloat(orderData.service_fee)) }}</span>
              </div>
              <Divider class="!my-2 opacity-20" />
              <div class="flex justify-between items-center pt-2">
                <span class="text-xl font-medium text-[#F3B913]">{{ t('order.total') }}</span>
                <span class="text-3xl font-black text-white">{{ formatCurrency(orderData.total_price) }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Right: Items Table -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 class="text-lg font-bold text-slate-800">
                {{ t('order.items') }} <span class="text-slate-400 font-normal ml-2">({{ orderData.order_items?.length }})</span>
              </h3>
              <span v-if="selectedItems.length" class="text-xs font-bold bg-[#F3B913]/20 text-[#0b3baa] px-4 py-1.5 rounded-full ring-1 ring-[#F3B913]">
                {{ selectedItems.length }} {{ t('selected') }}
              </span>
            </div>

            <DataTable
              :value="sortedOrderItems"
              v-model:selection="selectedItems"
              dataKey="id"
              class="p-datatable-sm fancy-table"
              responsiveLayout="scroll"
              :rowHover="true"
            >
              <Column selectionMode="multiple" headerStyle="width: 3rem; background: transparent;" class="pl-4"></Column>

              <Column :header="t('order.product')" class="py-4">
                <template #body="{ data }">
                  <div class="flex items-center gap-4">
                    <img :src="getProductImage(data.product)" class="w-14 h-14 rounded-xl object-cover shadow-sm ring-2 ring-slate-100" />
                    <div>
                      <div class="font-bold text-slate-800 hover:text-[#0b3baa] transition-colors cursor-default">
                        {{ getProductName(data.product) }}
                      </div>
                      <div class="flex gap-2 mt-1">
                         <span class="text-base font-bold text-[#0b3baa] bg-[#0b3baa]/5 px-2 py-0.5 rounded">
                           CAT: {{ data.product?.category_id }}
                         </span>
                         <span class="text-base  font-bold text-slate-400 uppercase tracking-tighter">
                           CODE: {{ data.product?.code }}
                         </span>
                      </div>
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="quantity" :header="t('order.qty')" class="text-center">
                <template #body="{ data }">
                  <span class="bg-slate-100 px-3 py-1 rounded-lg font-black text-[#0b3baa] text-sm">x{{ data.quantity }}</span>
                </template>
              </Column>

              <Column :header="t('order.price')">
                <template #body="{ data }">
                  <span class="font-bold text-slate-900">{{ formatCurrency(data.price) }}</span>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </div>
    </div>

    <!-- Fancy Confirmation Modal -->
    <Dialog v-model:visible="displayConfirmationModal" modal :header="t('order.confirmInvoice')" :style="{ width: '30rem' }" class="fancy-dialog">
      <div class="text-center p-4">
        <div class="w-20 h-20 bg-[#F3B913]/20 text-[#F3B913] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          <i class="pi pi-question-circle"></i>
        </div>
        <h4 class="text-xl font-bold text-[#0b3baa] mb-2">{{ t('order.areYouSure') }}</h4>
        <p class="text-slate-600 leading-relaxed">
          {{ t('order.invoiceNotice') }} <strong class="text-[#0b3baa]">{{ selectedItems.length }}</strong> {{ t('order.items') }}.
        </p>
      </div>
      <template #footer>
        <div class="flex justify-center gap-3 w-full pb-6">
          <Button :label="t('cancel')" class="p-button-text !text-slate-400 !rounded-xl" @click="displayConfirmationModal = false" />
          <Button :label="t('confirm')" class="!bg-[#0b3baa] !border-[#0b3baa] !rounded-xl px-10 shadow-lg" @click="confirmAndGenerateInvoice" />
        </div>
      </template>
    </Dialog>
  </div>
</template>
