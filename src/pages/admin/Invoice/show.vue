<template>
  <div class="grid">
    <div class="col-12">
      <Toast />
      <Card class="shadow-4">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <div>
              <h2 class="m-0">{{ t('invoice.details') }} #{{ invoice?.number }}</h2>
            </div>
            <div class="flex gap-2">
              <Button
                :label="t('print')"
                icon="pi pi-print"
                class="p-button-success"
                @click="printInvoice"
              />
              <Button
                :label="t('back')"
                icon="pi pi-arrow-left"
                class="p-button-secondary"
                @click="goBack"
              />
            </div>
          </div>
        </template>

        <template #content>
          <div v-if="loading" class="flex justify-content-center py-8">
            <ProgressSpinner />
          </div>

          <div v-else-if="invoice" class="invoice-content" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
            <div class="grid mb-5">
              <div class="col-12 md:col-6">
                <h3 class="text-primary mb-3">{{ t('invoice.invoice') }}</h3>
                <div class="invoice-info-item mb-2">
                  <strong>{{ t('invoice.number') }}:</strong> {{ invoice.number }}
                </div>
                <div class="invoice-info-item mb-2">
                  <strong>{{ t('invoice.date') }}:</strong> {{ formatDate(invoice.created_at) }}
                </div>
                <div class="invoice-info-item mb-2">
                  <strong>{{ t('name') }}:</strong> {{ invoice.user?.name || '-' }}
                </div>
              </div>

              <div class="col-12 md:col-6">
                <div class="flex flex-column md:flex-row md:justify-content-between gap-4">
                  <div v-if="invoice.address" class="flex-grow-1">
                    <div class="invoice-info-item mb-2">
                      <strong>{{ t('invoice.deliveryAddress') || 'Delivery Address' }}:</strong>
                      {{ formatAddress(invoice.address) }}
                    </div>
                    <Button
                      v-if="hasCoordinates"
                      icon="pi pi-map-marker"
                      :label="t('viewOnMap') || 'View on Google Maps'"
                      class="p-button-info p-button-outlined mt-2"
                      @click="openGoogleMaps"
                    />
                    <span v-else class="text-500 text-sm block mt-2">
                      {{ t('noLocationAvailable') || '(No coordinates available)' }}
                    </span>
                  </div>

                  <!-- QR Code – smaller size, only on screen -->
                  <div class="flex-shrink-0 text-center">
                    <div class="p-3 surface-100 border-round">
                      <qrcode-vue :value="qrValue" :size="80" level="H" render-as="canvas" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            <h4 class="mb-3">{{ t('invoice.items') }}</h4>
            <DataTable :value="invoice.items" responsiveLayout="scroll" class="p-datatable-sm">
              <Column header="#" headerStyle="width: 3rem">
                <template #body="slotProps">
                  {{ slotProps.index + 1 }}
                </template>
              </Column>

              <Column :header="t('navigation.products')">
                <template #body="slotProps">
                  <div class="flex flex-column">
                    <span class="font-medium">{{ getProductName(slotProps.data.product) }}</span>
                    <small class="text-500">
                      {{ lang === 'ar' ? slotProps.data.product.sub_name_ar : slotProps.data.product.sub_name_en }}
                    </small>
                  </div>
                </template>
              </Column>

              <Column field="quantity" :header="t('quantity')" class="text-center" style="width: 100px" />

              <Column :header="t('price')">
                <template #body="slotProps">
                  {{ formatCurrency(slotProps.data.price) }}
                </template>
              </Column>

              <Column :header="t('product.code')">
                <template #body="slotProps">
                  {{ slotProps.data.product?.code }}
                </template>
              </Column>

              <Column :header="t('total')">
                <template #body="slotProps">
                  <span class="font-bold">{{ formatCurrency(parseFloat(slotProps.data.price) * slotProps.data.quantity) }}</span>
                </template>
              </Column>
            </DataTable>

            <Divider />

            <div class="grid">
              <div class="col-12 md:col-7"></div>
              <div class="col-12 md:col-5">
                <div class="surface-50 border-round p-4">
                  <div class="flex justify-content-between mb-2">
                    <span>{{ t('invoice.subTotal') }}</span>
                    <span class="font-medium">{{ formatCurrency(invoice.sub_total_price) }}</span>
                  </div>
                  <div class="flex justify-content-between mb-2">
                    <span>{{ t('invoice.tax') }}</span>
                    <span class="font-medium">{{ formatCurrency(invoice.tax_fee) }}</span>
                  </div>
                  <div class="flex justify-content-between mb-2" v-if="parseFloat(invoice.service_fee) > 0">
                    <span>{{ t('serviceFee') || 'Service Fee' }}</span>
                    <span class="font-medium">{{ formatCurrency(invoice.service_fee) }}</span>
                  </div>
                  <div class="flex justify-content-between mb-2" v-if="parseFloat(invoice.delivery_fee) > 0">
                    <span>{{ t('deliveryFee') || 'Delivery Fee' }}</span>
                    <span class="font-medium">{{ formatCurrency(invoice.delivery_fee) }}</span>
                  </div>
                  <div class="flex justify-content-between mb-2 text-pink-500" v-if="parseFloat(invoice.coupon) > 0">
                    <span>{{ t('invoice.coupon') }}</span>
                    <span>-{{ formatCurrency(invoice.coupon) }}</span>
                  </div>

                  <Divider />

                  <div class="flex justify-content-between text-xl font-bold">
                    <span>{{ t('invoice.total') }}</span>
                    <span class="text-primary">{{ formatCurrency(invoice.total_price) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center mt-6 text-500">
              <p>{{ t('invoice.thankYou') }}</p>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <i class="pi pi-exclamation-circle text-5xl text-400 mb-3"></i>
            <p class="text-xl text-600">{{ t('invoice.notFound') }}</p>
          </div>
        </template>
      </Card>
    </div>
  </div>

  <!-- PRINT VERSION – WITH QR CODE -->
  <div id="print-section" class="hidden">
    <div class="print-container" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
      <div class="header-grid">
        <div class="info-col">
          <h1 class="invoice-title">{{ t('invoice.invoice') }}</h1>
          <p><strong>{{ t('invoice.number') }}:</strong> {{ invoice?.number }}</p>
          <p><strong>{{ t('invoice.date') }}:</strong> {{ formatDate(invoice?.created_at) }}</p>
          <p><strong>{{ t('name') }}:</strong> {{ invoice?.user?.name || '-' }}</p>

          <div v-if="invoice?.address">
            <p><strong>{{ t('invoice.deliveryAddress') || 'Delivery Address' }}:</strong></p>
            <p class="mb-1">{{ formatAddress(invoice.address) }}</p>
            <p v-if="hasCoordinates" class="text-sm text-500">
              Lat: {{ invoice.address.lat }} • Long: {{ invoice.address.long }}
            </p>
          </div>
        </div>

        <!-- QR code column in print – small size -->
        <div class="qr-col" v-if="qrValue">

          <qrcode-vue :value="qrValue" :size="90" level="H" render-as="canvas" />
        </div>
      </div>


      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t('navigation.products') }}</th>
            <th class="text-center">{{ t('quantity') }}</th>
            <th class="text-center">{{ t('product.code') }}</th>
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
            <td class="text-right font-bold">{{ formatCurrency(parseFloat(item.price) * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-box">
          <div class="summary-row">
            <span>{{ t('invoice.subTotal') }}</span>
            <span>{{ formatCurrency(invoice?.sub_total_price) }}</span>
          </div>
          <div class="summary-row" v-if="parseFloat(invoice?.tax_fee) > 0">
            <span>{{ t('invoice.tax') }}</span>
            <span>{{ formatCurrency(invoice?.tax_fee) }}</span>
          </div>
          <div class="summary-row" v-if="parseFloat(invoice?.service_fee) > 0">
            <span>{{ t('serviceFee') || 'Service Fee' }}</span>
            <span>{{ formatCurrency(invoice?.service_fee) }}</span>
          </div>
          <div class="summary-row" v-if="parseFloat(invoice?.delivery_fee) > 0">
            <span>{{ t('deliveryFee') || 'Delivery Fee' }}</span>
            <span>{{ formatCurrency(invoice?.delivery_fee) }}</span>
          </div>
          <div class="summary-row text-pink-600" v-if="parseFloat(invoice?.coupon) > 0">
            <span>{{ t('invoice.coupon') }}</span>
            <span>-{{ formatCurrency(invoice?.coupon) }}</span>
          </div>
          <hr class="my-3" />
          <div class="summary-row text-xl">
            <strong>{{ t('invoice.total') }}</strong>
            <strong class="text-primary">{{ formatCurrency(invoice?.total_price) }}</strong>
          </div>
        </div>
      </div>

      <div class="text-center mt-5 text-600">
        <p>{{ t('invoice.thankYou') }}</p>
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

import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Divider from 'primevue/divider'
import ProgressSpinner from 'primevue/progressspinner'
import Toast from 'primevue/toast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const invoice = ref(null)
const loading = ref(true)
const lang = localStorage.getItem('appLang') || 'en'

const qrValue = computed(() => {
  if (!invoice.value?.order?.number) return ''
  return `${window.location.origin}/order-details/${invoice.value.order.number}`
})

const hasCoordinates = computed(() => {
  return invoice.value?.address?.lat && invoice.value?.address?.long
})

const googleMapsLink = computed(() => {
  if (!hasCoordinates.value) return '#'
  const lat = invoice.value.address.lat
  const lng = invoice.value.address.long
  return `https://www.google.com/maps?q=${lat},${lng}`
})

const fetchInvoice = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/invoice/${route.params.id}`)
    if (res.data?.is_success && res.data?.data) {
      invoice.value = res.data.data
    } else {
      throw new Error('No invoice data')
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('invoice.loadError'), life: 4000 })
  } finally {
    loading.value = false
  }
}

const getProductName = (p) => lang === 'ar' ? (p?.name_ar || p?.name_en || '-') : (p?.name_en || p?.name_ar || '-')

const formatCurrency = (v) => `${parseFloat(v || 0).toFixed(2)} ${t('currencyLabel') || 'EGP'}`

const formatDate = (d) => d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
}) : '-'

const formatAddress = (addr) => {
  if (!addr) return '-'
  const parts = [
    addr.address_line_1,
    addr.address_line_2,
    addr.city,
    addr.governorate,
    addr.country
  ].filter(Boolean)
  return parts.join(' — ')
}

const openGoogleMaps = () => {
  if (hasCoordinates.value) {
    window.open(googleMapsLink.value, '_blank', 'noopener,noreferrer')
  }
}

const printInvoice = () => {
  // Grab the canvas from the print section's qrcode-vue component
  const printSection = document.getElementById('print-section')
  const canvas = printSection.querySelector('canvas')
  const qrDataUrl = canvas ? canvas.toDataURL('image/png') : null

  let printContent = printSection.innerHTML

  // Replace the canvas element with an <img> so it renders in the print window
  if (qrDataUrl) {
    printContent = printContent.replace(
      /<canvas[^>]*><\/canvas>/,
      `<img src="${qrDataUrl}" width="90" height="90" style="display:block;" />`
    )
  }

  const win = window.open('', '', 'height=900,width=1100')
  win.document.write(`
    <html>
      <head>
        <title>Invoice #${invoice.value?.number || '—'}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 40px 30px; direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; }
          .print-container { max-width: 850px; margin: 0 auto; }
          .header-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
          .info-col { flex: 1; }
          .qr-col { display: flex; flex-direction: column; align-items: center; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; }
          .invoice-title { color: #1e40af; margin: 0 0 12px; font-size: 32px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0 40px; }
          .items-table th, .items-table td { border: 1px solid #d1d5db; padding: 10px 12px; }
          .items-table th { background: #f3f4f6; font-weight: 600; }
          .summary-section { display: flex; justify-content: flex-end; }
          .summary-box { width: 320px; padding: 16px; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc; }
          .summary-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 1.05rem; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
    </html>
  `)
  win.document.close()

  setTimeout(() => {
    win.focus()
    win.print()
    // win.close()   // uncomment if you want auto-close after print dialog
  }, 600)
}

const goBack = () => router.back()

onMounted(fetchInvoice)
</script>

<style scoped>
.hidden { display: none; }

.invoice-info-item {
  font-size: 1.05rem;
  color: #4b5563;
  line-height: 1.5;
}
</style>
