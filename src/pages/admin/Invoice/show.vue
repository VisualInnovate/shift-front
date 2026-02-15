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

          <div v-else-if="invoice" class="invoice-content" dir="auto">
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
                  <div class="flex justify-content-between mb-2 text-pink-500" v-if="invoice.coupon > 0">
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

  <div id="print-section" class="hidden">
    <div class="print-container" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
      <div class="header-grid">
        <div class="info-col">
          <h1 class="invoice-title">{{ t('invoice.invoice') }}</h1>
          <p><strong>{{ t('invoice.number') }}:</strong> {{ invoice?.number }}</p>
          <p><strong>{{ t('invoice.date') }}:</strong> {{ formatDate(invoice?.created_at) }}</p>
          <p><strong>{{ t('name') }}:</strong> {{ invoice?.user?.name }}</p>
        </div>
        <div class="qr-col">
          <div id="qr-code-print" class="qr-wrapper">
             <qrcode-vue :value="qrValue" :size="120" level="H" render-as="canvas" />
          </div>
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
            <td class="text-right">{{ formatCurrency(parseFloat(item.price) * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>


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

// UI Components
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

// الرابط الذي يفتح عند مسح الكود
const qrValue = computed(() => {
  return `${window.location.origin}/order-details/${invoice.value?.order.number}`
})

const fetchInvoice = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/invoice/${route.params.id}`)
    if (res.data?.is_success && res.data?.data) {
      invoice.value = res.data.data
    } else {
      throw new Error('No data')
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('invoice.loadError'), life: 3000 })
  } finally {
    loading.value = false
  }
}

const getProductName = (p) => lang === 'ar' ? p.name_ar : p.name_en
const formatCurrency = (v) => `${parseFloat(v || 0).toFixed(2)} ${t('currencyLabel')}`
const formatDate = (d) => d ? new Date(d).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') : ''

const printInvoice = () => {
  const qrCanvas = document.querySelector('#qr-code-print canvas')
  const qrImage = qrCanvas ? qrCanvas.toDataURL("image/png") : ''
  const printContent = document.getElementById('print-section').innerHTML
  const win = window.open('', '', 'height=800,width=1000')

  win.document.write(`
    <html>
      <head>
        <title>Invoice #${invoice.value?.number}</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 0; padding: 30px; }
          .print-container { width: 100%; max-width: 800px; margin: auto; }
          .header-grid { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
          .invoice-title { color: #2563eb; margin: 0; font-size: 28px; }
          .qr-wrapper img { border: 1px solid #eee; display: block; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .items-table th { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 10px; text-align: inherit; }
          .items-table td { border: 1px solid #e5e7eb; padding: 10px; }
          .summary-section { margin-top: 20px; display: flex; justify-content: flex-end; }
          .summary-box { width: 250px; border-top: 2px solid #2563eb; padding-top: 10px; }
          .summary-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; }
          [dir="rtl"] { direction: rtl; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
        </style>
      </head>
      <body>
        ${printContent}
        <script>
          const container = document.querySelector('.qr-wrapper');
          if (container) container.innerHTML = '<img src="${qrImage}" width="120" height="120" />';
        <\/script>
      </body>
    </html>
  `)
  win.document.close()
  setTimeout(() => { win.focus(); win.print(); win.close(); }, 500)
}

const goBack = () => router.back()
onMounted(fetchInvoice)
</script>

<style scoped>
/* حل مشكلة تمدد الـ QR Code */
.qr-container {
  display: inline-block;
  line-height: 0; /* يمنع المسافات الغريبة */
  width: fit-content;
}

.qr-code-canvas {
  display: block !important;
  max-width: 100%;
  height: 100px !important; /* يحافظ على التناسب */
}

.hidden { display: none; }

.invoice-info-item {
  font-size: 1.1rem;
  color: #4b5563;
}
</style>
