<script setup>
import { ref, onMounted } from 'vue'
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

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const orderData = ref(null)
const loading = ref(true)
const isGeneratingInvoice = ref(false)
const displayConfirmationModal = ref(false)

const lang = localStorage.getItem('appLang') || 'en'

/**
 * Fetch order details
 */
const fetchOrderData = async () => {
  loading.value = true
  try {
    const res = await axios.get(`/api/order/${route.params.id}`)

    if (res.data?.is_success && res.data?.data) {
      orderData.value = res.data.data
    } else {
      throw new Error(res.data?.message || 'No data received')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: t('order.loadError'),
      life: 5000
    })
    console.error('Error fetching order:', error)
    orderData.value = null
  } finally {
    loading.value = false
  }
}

/**
 * Open confirmation dialog before generating invoice
 */
const openGenerateInvoiceModal = () => {
  if (!orderData.value) return

  displayConfirmationModal.value = true
}

/**
 * Generate invoice after user confirmation
 */
const confirmAndGenerateInvoice = async () => {
  if (!orderData.value?.id) return

  displayConfirmationModal.value = false
  isGeneratingInvoice.value = true

  try {
    const res = await axios.post('/api/invoice', { order_id: orderData.value.id })
    fetchOrderData() // Refresh order data
    toast.add({
      severity: 'success',
      summary: t('success'),
      detail: t('order.invoiceSuccess'),
      life: 5000
    })

    if (res.data?.invoice_url) {
      window.open(res.data.invoice_url, '_blank')
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: error.response?.data?.message || t('order.invoiceError'),
      life: 5000
    })
    console.error('Invoice generation failed:', error)
  } finally {
    isGeneratingInvoice.value = false
  }
}

const goBack = () => {
  router.push({ name: 'orders' })
}

onMounted(() => {
  fetchOrderData()
})

// Helpers
const getProductName = (product) => {
  return lang === 'ar' ? product.name_ar : product.name_en
}

const getProductImage = (product) => {
  if (product.media && product.media.length > 0 && product.media[0]?.url) {
    return product.media[0].url
  }
  return product.key_default_image || '/images/no-image.png'
}

const getVariantDisplay = (variant) => {
  if (!variant || !variant.attribute_values?.length) return null

  return variant.attribute_values
    .map(attr => {
      const value = lang === 'ar' ? attr.value_ar : attr.value_en
      const attrName = lang === 'ar' ? attr.attribute.name_ar : attr.attribute.name_en
      return `${attrName}: ${value}`
    })
    .join(' • ')
}

const formatCurrency = (value) => {
  return `${parseFloat(value).toFixed(2)} ${t('currencyLabel')}`
}
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card p-4 shadow-2 border-round">

        <Toast />

        <div v-if="loading" class="flex justify-content-center align-items-center py-8">
          <ProgressSpinner style="width: 60px; height: 60px" strokeWidth="5" />
        </div>

        <div v-else-if="orderData">
          <div class="flex justify-content-between align-items-center mb-5">

            <Button
              :label="t('order.generateInvoice')"
              icon="pi pi-file-pdf"
              @click="openGenerateInvoiceModal"
              :loading="isGeneratingInvoice"
              :disabled="orderData.has_invoice"
              class="p-button-success"
            />
          </div>

          <Card class="mb-5">
            <template #content>
              <div class="grid">
                <div class="col-12 lg:col-6">
                  <div class="space-y-3 mb-5">
                    <p><strong>{{ t('order.name') }}:</strong> {{ orderData.user?.name }}</p>
                    <p v-if="orderData.notes">
                      <strong>{{ t('order.notes') }}:</strong>
                      <span class="text-600">{{ orderData.notes }}</span>
                    </p>
                  </div>

                  <Divider class="my-4" />

                  <h4 class="text-lg font-semibold mb-3 text-primary">
                    {{ t('order.financialSummary') }}
                  </h4>
                  <div class="space-y-3">
                    <p><strong>{{ t('order.subTotalPrice') }}:</strong> {{ formatCurrency(orderData.sub_total_price) }}</p>
                    <p><strong>{{ t('order.taxFee') }}:</strong> {{ formatCurrency(orderData.tax_fee) }}</p>
                    <p><strong>{{ t('order.serviceFee') }}:</strong> {{ formatCurrency(orderData.service_fee) }}</p>
                    <p><strong>{{ t('order.deliveryFee') }}:</strong> {{ formatCurrency(orderData.delivery_fee) }}</p>
                    <p v-if="parseFloat(orderData.coupon) > 0">
                      <strong>{{ t('order.coupon') }}:</strong>
                      <span class="text-red-600">-{{ formatCurrency(orderData.coupon) }}</span>
                    </p>
                    <Divider class="my-4" />
                    <p class="text-xl font-bold text-primary">
                      {{ t('order.totalPrice') }}:
                      <span class="text-2xl">{{ formatCurrency(orderData.total_price) }}</span>
                    </p>
                  </div>
                </div>

                <div class="col-12 lg:col-6">
                  <div class="space-y-3">
                    <p class="flex align-items-center gap-2">
                      <strong class="mb-2">{{ t('order.status') }}:</strong>
                      <Tag
                        :value="orderData.status === 0 ? t('order.pending') : t('order.completed')"
                        :severity="orderData.status === 0 ? 'warning' : 'success'"
                        rounded
                      />
                    </p>


                  </div>
                </div>
              </div>
            </template>
          </Card>

          <Card>
            <template #title>
              <h3 class="text-xl font-bold">
                {{ t('order.items') }} ({{ orderData.order_items?.length || 0 }})
              </h3>
            </template>

            <template #content>
              <DataTable
                :value="orderData.order_items"
                responsiveLayout="scroll"
                stripedRows
                showGridlines
                class="p-datatable-sm"
              >
                <Column :header="t('order.itemId')" style="width: 6%">
                  <template #body="{ data }">{{ data.id }}</template>
                </Column>

                <Column :header="t('order.productName')" style="width: 40%">
                  <template #body="{ data }">
                    <div class="font-medium">
                      {{ getProductName(data.product) }}
                    </div>
                    <div
                      v-if="data.variant"
                      class="text-sm text-600 mt-1"
                    >
                      {{ getVariantDisplay(data.variant) }}
                    </div>
                  </template>
                </Column>

                <Column field="quantity" :header="t('order.quantity')" style="width: 8%">
                  <template #body="{ data }">
                    <span class="font-semibold">{{ data.quantity }}</span>
                  </template>
                </Column>

                <Column :header="t('order.unitPrice')" style="width: 12%">
                  <template #body="{ data }">
                    {{ formatCurrency((parseFloat(data.price) / data.quantity).toFixed(2)) }}
                  </template>
                </Column>

                <Column :header="t('order.total')" style="width: 12%">
                  <template #body="{ data }">
                    <strong>{{ formatCurrency(parseFloat(data.price)) }}</strong>
                  </template>
                </Column>

                <Column :header="t('order.image')" style="width: 22%">
                  <template #body="{ data }">
                    <img
                      :src="getProductImage(data.product)"
                      alt="Product"
                      class="product-image shadow-2 border-round"
                      @error="(e) => e.target.src = '/images/no-image.png'"
                    />
                  </template>
                </Column>

                <template #empty>
                  <div class="text-center py-6 text-600">
                    <i class="pi pi-shopping-cart text-4xl mb-3 opacity-30" />
                    <p class="text-lg font-medium">{{ t('order.noItems') }}</p>
                  </div>
                </template>
              </DataTable>
            </template>
          </Card>
        </div>

        <div v-else class="text-center py-8">
          <i class="pi pi-exclamation-triangle text-6xl text-red-500 mb-4 opacity-70" />
          <p class="text-xl font-medium text-700">{{ t('order.notFound') }}</p>
          <Button
            :label="t('common.back')"
            icon="pi pi-arrow-left"
            @click="goBack"
            class="mt-4 p-button-outlined"
          />
        </div>

        <!-- Confirmation Dialog -->
        <Dialog
          v-if="orderData"
          v-model:visible="displayConfirmationModal"
          :header="t('order.invoiceConfirmationTitle')"
          :modal="true"
          :style="{ width: '50vw' }"
        >
          <div class="p-fluid">
            <p class="mb-4 text-lg">
              {{ t('order.invoiceConfirmationMessage') }}
            </p>

            <div class="p-3 bg-gray-100 border-round">
              <h4 class="text-base font-semibold mb-3">
                {{ t('order.orderSummaryBrief') }}
              </h4>

              <div class="flex justify-content-between mb-2">
                <span class="font-medium">{{ t('order.itemsCount') }}:</span>
                <span>{{ orderData.order_items?.length || 0 }}</span>
              </div>
              <Divider class="my-2" />
              <div class="flex justify-content-between text-xl font-bold text-primary">
                <span>{{ t('order.totalPrice') }}:</span>
                <span>{{ formatCurrency(orderData.total_price) }}</span>
              </div>
            </div>

            <p class="mt-4 text-sm text-red-500">
              {{ t('order.invoiceGenerationWarning') }}
            </p>
          </div>

          <template #footer>
            <Button
              :label="t('common.cancel')"
              icon="pi pi-times"
              @click="displayConfirmationModal = false"
              class="p-button-text p-button-secondary"
            />
            <Button
              :label="t('order.confirmGenerate')"
              icon="pi pi-check"
              @click="confirmAndGenerateInvoice"
              class="p-button-success"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid var(--surface-300);
}

.space-y-3 > * + * {
  margin-top: 0.75rem;
}
</style>
