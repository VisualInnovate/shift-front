<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useI18n } from 'vue-i18n'
import axios from 'axios'

// PrimeVue Components
import ProgressSpinner from 'primevue/progressspinner'
import Tag from 'primevue/tag'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const orderData = ref(null)
const loading = ref(true)

// Determine text direction based on language
const isRtl = computed(() => locale.value === 'ar')

const fetchOrderData = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/home/order/show/${route.params.id}`)
    if (res.data?.is_success && res.data?.data) {
      orderData.value = res.data.data
    }
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('order.loadError'), life: 5000 })
  } finally {
    loading.value = false
  }
}

const goBack = () => router.push({ name: 'orders' })
const printPage = () => window.print()

onMounted(() => {
  fetchOrderData()
})

// Helpers
const getProductName = (product) => locale.value === 'ar' ? product.name_ar : product.name_en

const getProductImage = (product) => {
  if (product.media?.length > 0) return product.media[0].url
  return product.key_default_image || '/images/no-image.png'
}

const getVariantDisplay = (variant) => {
  if (!variant?.attribute_values?.length) return null
  return variant.attribute_values.map(attr => {
    const value = locale.value === 'ar' ? attr.value_ar : attr.value_en
    const name = locale.value === 'ar' ? attr.attribute.name_ar : attr.attribute.name_en
    return `${name}: ${value}`
  }).join(' • ')
}

const formatCurrency = (value) => `${parseFloat(value || 0).toFixed(2)} ${t('currencyLabel')}`

const getStatusSeverity = (status) => {
  if (status === 1) return 'success'
  if (status === 0) return 'warning'
  return 'danger'
}
</script>

<template>
  <div :dir="isRtl ? 'rtl' : 'ltr'" class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">

    <div class="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">


      <button @click="printPage" class="bg-[#F3B913] hover:bg-[#F3B913] text-white p-3 rounded-full shadow-lg transition-transform active:scale-95">
        <i class="pi pi-print text-xl"></i>
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <p class="text-slate-400 mt-4 animate-pulse">{{ t('loading') }}...</p>
    </div>

    <div v-else-if="orderData" class="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none border border-slate-100">


      <div class="p-8 sm:p-12">
        <div class="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <div class="space-y-4">
            <img src="../../../assets/shiftlogo.png" alt="Logo" class="h-14 w-auto object-contain" />
            <div>
              <h1 class="text-4xl font-black text-slate-900 tracking-tight uppercase">{{ t('invoice') }}</h1>
              <p class="text-slate-500 font-mono text-sm mt-1 uppercase">{{ t('order.number') }}: {{ orderData.number }}</p>
            </div>
          </div>

          <div class="flex flex-col md:items-end gap-3">
            <div class="md:text-right">
              <p class="text-slate-900 font-semibold text-lg">{{ new Date().toLocaleDateString(locale) }}</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-y border-slate-50 py-8">
          <div>
            <p class="text-xl font-bold text-slate-900">{{ orderData.user?.name }}</p>
            <p class="text-[#F3B913] mt-1 flex items-center gap-2">
               <i class="pi pi-phone text-xs text-slate-400"></i>
               {{ orderData.user?.contact || t('noContact') }}
            </p>
          </div>
          <div class="md:text-right">
            <p class="text-slate-900 font-semibold">{{ t('order.id') }}: <span class="text-[#F3B913] font-mono">#{{ orderData.id }}</span></p>
            <p v-if="orderData.notes" class="text-slate-500 italic mt-2 text-sm max-w-xs md:ml-auto">
                <span class="text-slate-400 font-bold not-italic">"</span> {{ orderData.notes }} <span class="text-slate-400 font-bold not-italic">"</span>
            </p>
          </div>
        </div>

        <div class="overflow-x-auto mb-10">
          <table class="w-full text-left border-collapse" :class="{'text-right': isRtl}">
            <thead>
              <tr class="text-slate-400 text-xs uppercase tracking-wider">
                <th class="py-4 font-bold border-b-2 border-slate-100">{{ t('navigation.products') }}</th>
                <th class="py-4 px-4 font-bold text-center border-b-2 border-slate-100">{{ t('quantity') }}</th>
                <th class="py-4 font-bold text-right border-b-2 border-slate-100">{{ t('price') }}</th>
                <th class="py-4 font-bold text-right border-b-2 border-slate-100">{{ t('total') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="item in orderData.order_items" :key="item.id" class="group transition-colors hover:bg-slate-50/50">
                <td class="py-6">
                  <div class="flex items-center gap-4">
                    <img :src="getProductImage(item.product)" class="h-16 w-16 rounded-2xl object-cover shadow-sm group-hover:rotate-2 transition-transform" />
                    <div>
                      <p class="font-bold text-slate-900 leading-tight mb-1">{{ getProductName(item.product) }}</p>
                      <p class="text-xs text-indigo-500 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded-md">{{ getVariantDisplay(item.variant) }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-6 px-4 text-center font-bold text-slate-700">{{ item.quantity }}</td>
                <td class="py-6 text-right text-slate-500 font-medium">{{ formatCurrency(item.variant?.price || item.price) }}</td>
                <td class="py-6 text-right text-slate-900 font-black">{{ formatCurrency(item.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end pt-6">
          <div class="w-full sm:w-80 space-y-4">
            <div class="flex justify-between text-[#F3B913] font-medium">
              <span>{{ t('subTotal') }}</span>
              <span>{{ formatCurrency(orderData.sub_total_price) }}</span>
            </div>
            <div class="flex justify-between text-[#F3B913] font-medium">
              <span>{{ t('deliveryFee') }}</span>
              <span>{{ formatCurrency(orderData.delivery_fee) }}</span>
            </div>
            <div class="flex justify-between text-[#F3B913] font-medium">
              <span>{{ t('serviceFee') }}</span>
              <span>{{ formatCurrency(orderData.service_fee) }}</span>
            </div>
            <div v-if="parseFloat(orderData.tax_fee) > 0" class="flex justify-between text-[#F3B913] font-medium">
              <span>{{ t('tax') }}</span>
              <span>{{ formatCurrency(orderData.tax_fee) }}</span>
            </div>

            <div class="pt-4 border-t-2 border-slate-900/5 flex justify-between items-center bg-[#F3B913] text-white p-5 rounded-2xl shadow-xl shadow-indigo-100">
              <span class="text-sm font-extrabold uppercase tracking-widest">{{ t('total') }}</span>
              <span class="text-3xl font-black">{{ formatCurrency(orderData.total_price) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-20 text-center border-t border-slate-50 pt-10">
          <p class="text-slate-400 text-sm font-medium">{{ t('supportMessage') }}</p>
          <p class="text-[#F3B913] font-black text-xl mt-2 tracking-tight">{{ t('thankYou') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .print\:hidden {
    display: none !important;
  }
  .print\:shadow-none {
    box-shadow: none !important;
  }
  .print\:rounded-none {
    border-radius: 0 !important;
  }
  .print\:border-none {
    border: none !important;
  }
  body, .bg-slate-50 {
    background: white !important;
  }
  .py-10 {
    padding: 0 !important;
  }
}

/* RTL Support for table text align */
[dir="rtl"] .text-right {
  text-align: left !important;
}
[dir="rtl"] .text-left {
  text-align: right !important;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
