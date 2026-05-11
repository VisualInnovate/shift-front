<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
    <Toast />

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-64">
      <ProgressSpinner strokeWidth="4" />
      <p class="mt-4 text-[#0b3baa] font-bold animate-pulse">{{ t('loading') }}...</p>
    </div>

    <div v-else-if="invoice" class="max-w-7xl mx-auto space-y-6">

      <!-- Top Header Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border-t-4 border-[#0b3baa]">
        <div class="flex items-center gap-4">
          <div class="bg-[#0b3baa]/10 p-3 rounded-xl text-[#0b3baa]">
            <i class="pi pi-file-pdf text-2xl"></i>
          </div>
          <div>
            <h1 class="text-2xl font-black tracking-tight text-slate-800">
              {{ t('invoice.details') }} <span class="text-[#0b3baa]">#{{ invoice.number }}</span>
            </h1>
            <p class="text-slate-500 text-sm mt-1 font-medium">{{ formatDate(invoice.created_at) }}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <Button
            icon="pi pi-arrow-left"
            @click="goBack"
          />
          <Button
            :label="t('print')"
            icon="pi pi-print"
            @click="printInvoice"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Left: Customer & Address Sidebar -->
        <div class="lg:col-span-1 space-y-6">

          <!-- Info Section -->
          <section class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 class="text-lg font-bold mb-4 flex items-center gap-2 text-[#0b3baa]">
              <i class="pi pi-info-circle"></i> {{ t('invoice.invoice') }}
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500">{{ t('name') }}</span>
                <span class="font-bold">{{ invoice.user?.name || '-' }}</span>
              </div>
              <div class="flex justify-between border-b border-slate-50 pb-2">
                <span class="text-slate-500">{{ t('invoice.orderNumber') }}</span>
                <span class="font-bold text-[#0b3baa]">#{{ invoice.order?.id || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">{{ t('invoice.customerNumber') }}</span>
                <span class="font-bold">{{ invoice.user?.phone || '-' }}</span>
              </div>
            </div>

            <Divider v-if="invoice.address" />

            <div v-if="invoice.address">
              <h4 class="text-sm font-bold text-slate-400 uppercase mb-2">{{ t('invoice.deliveryAddress') }}</h4>
              <p class="text-sm leading-relaxed text-slate-600 mb-3">{{ formatAddress(invoice.address) }}</p>
              <Button v-if="hasCoordinates" icon="pi pi-map-marker"
                :label="t('viewOnMap')" class="w-full"
                @click="openGoogleMaps" />
            </div>
          </section>

          <!-- Totals Card -->
          <section class="bg-[#0b3baa] text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
             <!-- QR Overlay -->
             <div class="absolute -right-4 -bottom-4 opacity-10 bg-white p-2 rounded-xl rotate-12">
               <qrcode-vue :value="qrValue" :size="100" level="H" />
             </div>

            <h3 class="text-lg font-bold mb-4 text-[#F3B913] uppercase tracking-widest text-sm">{{ t('invoice.summary') }}</h3>
            <div class="space-y-3 relative z-10">
              <div class="flex justify-between opacity-80">
                <span>{{ t('invoice.subTotal') }}</span>
                <span>{{ formatCurrency(invoice.sub_total_price) }}</span>
              </div>
              <div class="flex justify-between opacity-80" v-if="parseFloat(invoice.tax_fee) > 0">
                <span>{{ t('invoice.tax') }}</span>
                <span>{{ formatCurrency(invoice.tax_fee) }}</span>
              </div>
                <div  class="flex justify-between opacity-80" >
                <span>{{ t('order.fees') }}</span>
                <span class="text-white">{{ formatCurrency(parseFloat(invoice.tax_fee) + parseFloat(invoice.service_fee)) }}</span>
              </div>

              <div class="flex justify-between text-[#F3B913] italic" v-if="parseFloat(invoice.coupon) > 0">
                <span>{{ t('invoice.coupon') }}</span>
                <span>-{{ formatCurrency(invoice.coupon) }}</span>
              </div>

              <Divider class="!my-2 opacity-20" />

              <div class="flex justify-between items-center pt-2">
                <span class="text-xl font-medium text-[#F3B913]">{{ t('invoice.total') }}</span>
                <span class="text-3xl font-black text-white">{{ formatCurrency(invoice.total_price) }}</span>
              </div>
            </div>
          </section>

          <!-- On-screen QR for Scan -->
          <div class="flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-100">
             <qrcode-vue :value="qrValue" :size="120" level="H" class="mb-2" />
             <p class="text-[10px] text-slate-400 uppercase tracking-widest">Scan to view order</p>
          </div>
        </div>

        <!-- Right: Invoice Items Table -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 class="text-lg font-bold text-slate-800">
                {{ t('invoice.items') }} <span class="text-slate-400 font-normal ml-2">({{ invoice.items?.length }})</span>
              </h3>
            </div>

            <DataTable :value="invoice.items" responsiveLayout="scroll" class="p-datatable-sm fancy-table">
              <Column header="#" headerStyle="width: 3rem" class="pl-4">
                <template #body="slotProps">
                  <span class="text-slate-400 font-medium">{{ slotProps.index + 1 }}</span>
                </template>
              </Column>

              <Column :header="t('navigation.products')">
                <template #body="slotProps">
                  <div class="flex flex-column py-1">
                    <span class="font-bold text-slate-800">{{ getProductName(slotProps.data.product) }}</span>
                    <div class="flex items-center gap-2">
                      <Tag :value="slotProps.data.product?.code" severity="secondary" class="!text-[10px] !bg-slate-100 !text-slate-500" />
                      <span class="text-xs text-slate-400">
                        {{ lang === 'ar' ? slotProps.data.product.sub_name_ar : slotProps.data.product.sub_name_en }}
                      </span>
                    </div>
                  </div>
                </template>
              </Column>

              <Column field="quantity" :header="t('quantity')" class="text-center">
                <template #body="slotProps">
                  <span class="bg-slate-100 px-3 py-1 rounded-lg font-black text-[#0b3baa] text-sm">x{{ slotProps.data.quantity }}</span>
                </template>
              </Column>



              <Column :header="t('total')" class="text-right pr-6">
                <template #body="slotProps">
                  <span class="font-black text-slate-900">
                    {{ formatCurrency( slotProps.data.price) }}
                  </span>
                </template>
              </Column>
            </DataTable>

            <div class="p-8 text-center bg-slate-50 border-t border-slate-100">
              <p class="text-[#0b3baa] font-bold italic">{{ t('invoice.thankYou') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 404 / Error State -->
    <div v-else class="text-center py-20 bg-white rounded-3xl shadow-sm max-w-xl mx-auto mt-10 border border-slate-100">
      <div class="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
        <i class="pi pi-search"></i>
      </div>
      <p class="text-2xl font-bold text-slate-800">{{ t('invoice.notFound') }}</p>
      <Button :label="t('common.back')" icon="pi pi-arrow-left" class="p-button-text !text-[#0b3baa] mt-4" @click="goBack" />
    </div>
  </div>

  <!-- HIDDEN PRINT TEMPLATE -->
  <div id="print-section" class="hidden">
    <div class="print-container" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
      <div class="header-grid">
        <div class="info-col">
          <h1 class="invoice-title" style="color: #0b3baa;">{{ t('invoice.invoice') }}</h1>
          <p><strong>{{ t('invoice.number') }}:</strong> {{ invoice?.number }}</p>
          <p><strong>{{ t('invoice.date') }}:</strong> {{ formatDate(invoice?.created_at) }}</p>
          <p><strong>{{ t('name') }}:</strong> {{ invoice?.user?.name || '-' }}</p>
          <p><strong>{{ t('invoice.orderNumber') }}:</strong> #{{ invoice?.order?.id || '-' }}</p>
          <p v-if="invoice?.address"><strong>{{ t('invoice.deliveryAddress') }}:</strong> {{ formatAddress(invoice.address) }}</p>
        </div>
        <div class="qr-col">
          <qrcode-vue :value="qrValue" :size="90" level="H" />
        </div>
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t('navigation.products') }}</th>
            <th>{{ t('quantity') }}</th>
            <th>{{ t('product.code') }}</th>
            <th class="text-right">{{ t('price') }}</th>
            <th class="text-right">{{ t('total') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in invoice?.items" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ getProductName(item.product) }}</td>
            <td class="text-center">{{ item.quantity }}</td>
            <td class="text-center">{{ item.product?.code }}</td>
            <td class="text-right">{{ formatCurrency(item.price) }}</td>
            <td class="text-right"><strong>{{ formatCurrency(parseFloat(item.price) * item.quantity) }}</strong></td>
          </tr>
        </tbody>
      </table>
      <div class="summary-section">
        <div class="summary-box">
          <div class="summary-row"><span>{{ t('invoice.subTotal') }}</span> <span>{{ formatCurrency(invoice?.sub_total_price) }}</span></div>
          <div class="summary-row" v-if="parseFloat(invoice?.tax_fee) > 0"><span>{{ t('invoice.tax') }}</span> <span>{{ formatCurrency(invoice?.tax_fee) }}</span></div>
          <div class="summary-row text-xl" style="color:#0b3baa; border-top:1px solid #ddd; padding-top:10px;">
            <strong>{{ t('invoice.total') }}</strong> <strong>{{ formatCurrency(invoice?.total_price) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import QrcodeVue from 'qrcode.vue'

// Components
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const invoice = ref(null)
const loading = ref(true)
const lang = localStorage.getItem('appLang') || 'en'

const qrValue = computed(() => {
  if (!invoice.value?.order?.id) return ''
  return `${window.location.origin}/order-details/${invoice.value.order.id}`
})

const hasCoordinates = computed(() => invoice.value?.address?.lat && invoice.value?.address?.long)
const googleMapsLink = computed(() => `https://www.google.com/maps?q=${invoice.value.address.lat},${invoice.value.address.long}`)

const fetchInvoice = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/invoice/${route.params.id}`)
    if (res.data?.is_success) invoice.value = res.data.data
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('invoice.loadError'), life: 4000 })
  } finally {
    loading.value = false
  }
}

const getProductName = (p) => lang === 'ar' ? (p?.name_ar || p?.name_en || '-') : (p?.name_en || p?.name_ar || '-')
const formatCurrency = (v) => `${parseFloat(v || 0).toFixed(2)} ${t('currencyLabel') || 'د.أ'}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'

const formatAddress = (addr) => {
  if (!addr) return '-'
  return [addr.address_line_1, addr.city, addr.governorate].filter(Boolean).join(' — ')
}

const openGoogleMaps = () => window.open(googleMapsLink.value, '_blank')
const goBack = () => router.back()

const printInvoice = () => {
  const printSection = document.getElementById('print-section')
  const canvas = printSection.querySelector('canvas')
  const qrDataUrl = canvas ? canvas.toDataURL('image/png') : null
  let printContent = printSection.innerHTML

  if (qrDataUrl) {
    printContent = printContent.replace(/<canvas[^>]*><\/canvas>/, `<img src="${qrDataUrl}" width="90" height="90" />`)
  }

  const win = window.open('', '', 'height=900,width=1100')
  win.document.write(`
    <html>
      <head>
        <style>
          body { font-family: sans-serif; margin: 40px; direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; }
          .header-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 10px; }
          .summary-section { display: flex; justify-content: flex-end; margin-top: 30px; }
          .summary-box { width: 300px; padding: 15px; border: 1px solid #ddd; background: #fafafa; }
          .summary-row { display: flex; justify-content: space-between; margin: 5px 0; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print(); }, 500)
}

onMounted(fetchInvoice)
</script>

