<script setup>
  import { ref, onMounted, computed, watch, nextTick } from 'vue'
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
  import InputText from 'primevue/inputtext'

  const { t, locale } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const toast = useToast()

  const orderData = ref(null)
  const loading = ref(true)
  const isGeneratingInvoice = ref(false)
  const displayConfirmationModal = ref(false)
  const openSwitchPopUp = ref(false)
  const productsDate = ref([])
  const productsLoading = ref(false)
  const searchQuery = ref('')
  const itemToSwitch = ref(null)
  const selectedSubstitutes = ref([])
  const productVariantDialog = ref(false)
  const pendingVariantProduct = ref(null)
  const variantOptions = ref([])
  const variantLoading = ref(false)
  const isSavingSubstitutes = ref(false)
  const isSavingOrderChanges = ref(false)

  const selectedItems = ref([])
  const lang = localStorage.getItem('appLang') || 'en'

  // Map Container Ref
  const mapContainer = ref(null)

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
      { key: 'pending_at', labelKey: 'order.proc.pending', icon: 'pi pi-clock' },
      { key: 'processing_at', labelKey: 'order.proc.processing', icon: 'pi pi-spin pi-spinner' },
      { key: 'ready_at', labelKey: 'order.proc.ready', icon: 'pi pi-check-circle' },
      { key: 'shipped_at', labelKey: 'order.proc.shipped', icon: 'pi pi-send' },
      { key: 'delivered_at', labelKey: 'order.proc.delivered', icon: 'pi pi-home' },
    ]

    if (proc.cancelled_at) {
      steps.push({ key: 'cancelled_at', labelKey: 'order.proc.cancelled', icon: 'pi pi-times-circle' })
    }

    return steps.map((step) => ({
      ...step,
      timestamp: proc[step.key],
      done: !!proc[step.key],
    }))
  })

  const sortedOrderItems = computed(() => {
    if (!orderData.value?.order_items) return []
    return [...orderData.value.order_items].sort(
      (a, b) => (a.product?.category_id || 0) - (b.product?.category_id || 0),
    )
  })

  const isNotAllSelected = computed(() => {
    const totalItemsCount = orderData.value?.order_items?.length || 0
    const selectedCount = selectedItems.value.length
    return selectedCount < totalItemsCount
  })

  const has_substitutes = computed(() => {
    return orderData.value?.has_substitutes
  })

  const paymentMethod = computed(() => {
    const paymentType = orderData.value?.payment_type
    const paymentTypeId = typeof paymentType === 'object' ? paymentType?.id : paymentType

    const paymentMethods = {
      1: 'cashOnDelivery',
      2: 'cliq',
      3: 'creditCard',
    }

    const methodKey = paymentMethods[paymentTypeId]
    return methodKey ? t(`order.paymentMethods.${methodKey}`) : null
  })

  const getProcedureStepClasses = (step) => {
    if (step.done && step.key !== 'cancelled_at') {
      return {
        'bg-[#0b3baa]': true,
        'text-white': true,
        'ring-4': true,
        'ring-[#0b3baa]/20': true,
      }
    }

    if (step.key === 'cancelled_at' && step.done) {
      return {
        'bg-red-500': true,
        'text-white': true,
        'ring-4': true,
        'ring-red-200': true,
      }
    }

    return {
      'bg-slate-100': true,
      'text-slate-400': true,
      'ring-4': true,
      'ring-transparent': true,
    }
  }

  // Extract coordinates safely
  const addressCoords = computed(() => {
    const addr = orderData.value?.address
    if (!addr?.lat || !addr?.long) return null
    return {
      lat: parseFloat(addr.lat),
      lng: parseFloat(addr.long),
    }
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

  const fetchProductsForSwitch = async () => {
    productsLoading.value = true
    try {
      const response = await axios.get('/api/product', {
        params: {
          page: 1,
          limit: 10,
          search: searchQuery.value || undefined,
        },
      })

      productsDate.value = response?.data?.data?.data ?? []
    } catch (error) {
      productsDate.value = []
      toast.add({ severity: 'error', summary: t('error'), detail: t('order.switchError'), life: 5000 })
    } finally {
      productsLoading.value = false
    }
  }

  const switchItem = async (item) => {
    try {
      if (!item) return
      itemToSwitch.value = item
      selectedSubstitutes.value = []
      searchQuery.value = ''
      await fetchProductsForSwitch()
      openSwitchPopUp.value = true
    } catch (error) {
      toast.add({ severity: 'error', summary: t('error'), detail: t('order.switchError'), life: 5000 })
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
      const allItemIds = orderData.value.order_items.map((i) => i.id)

      const res = await axios.post('/api/invoice', {
        order_id: orderData.value.id,
        items: allItemIds,
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

  const openGoogleMaps = () => {
    if (!addressCoords.value) return
    const { lat, lng } = addressCoords.value
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  const formatCurrency = (v) => `${parseFloat(v || 0).toFixed(2)} ${t('currencyLabel')}`
  const getProductName = (p) => (lang === 'ar' ? p.name_ar : p.name_en)
  const getProductNameVariant = (v) => (lang === 'ar' ? v.value_ar : v.value_en)
  const getProductImage = (p) => p.media?.[0]?.url || p.key_default_image || '/images/no-image.png'
  const formatDate = (d) => (d ? new Date(d).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US') : '—')
  const getProductDisplayName = (product) => {
    if (!product) return ''
    return lang === 'ar' ? product.name_ar || product.name_en : product.name_en || product.name_ar
  }

  const buildVariantLabel = (variant) => {
    if (!variant?.attribute_values?.length) return 'Default variant'

    const labels = variant.attribute_values
      .map((attribute) => {
        const value = lang === 'ar' ? attribute.value_ar : attribute.value_en
        const name = lang === 'ar' ? attribute.attribute?.name_ar : attribute.attribute?.name_en
        return value ? (name ? `${name}: ${value}` : value) : null
      })
      .filter(Boolean)

    return labels.length ? labels.join(' • ') : 'Default variant'
  }

  const isProductSelected = (productId) =>
    selectedSubstitutes.value.some((item) => Number(item.product_id) === Number(productId))

  const removeSelectedSubstitute = (productId) => {
    selectedSubstitutes.value = selectedSubstitutes.value.filter(
      (item) => Number(item.product_id) !== Number(productId),
    )
  }

  const addSelectedSubstitute = (product, variant = null) => {
    const alreadySelected = selectedSubstitutes.value.find((item) => Number(item.product_id) === Number(product.id))
    if (alreadySelected) {
      alreadySelected.variant_id = variant?.id ?? null
      alreadySelected.variant = variant ?? null
      return
    }

    selectedSubstitutes.value.push({
      product_id: product.id,
      variant_id: variant?.id ?? null,
      product,
      variant,
    })
  }

  const toggleProductSelection = async (product) => {
    if (!product) return

    if (isProductSelected(product.id)) {
      removeSelectedSubstitute(product.id)
      return
    }

    if (product.has_variants) {
      pendingVariantProduct.value = product
      variantLoading.value = true
      productVariantDialog.value = true

      try {
        const response = await axios.get(`/api/product/${product.id}`)
        variantOptions.value = response?.data?.data?.variants ?? []
      } catch (error) {
        productVariantDialog.value = false
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('order.switchError'),
          life: 5000,
        })
      } finally {
        variantLoading.value = false
      }
      return
    }

    addSelectedSubstitute(product, null)
  }

  const chooseVariantForProduct = (variant) => {
    if (!pendingVariantProduct.value) return
    addSelectedSubstitute(pendingVariantProduct.value, variant)
    pendingVariantProduct.value = null
    variantOptions.value = []
    productVariantDialog.value = false
  }

  const saveSubstitutes = async () => {
    if (!itemToSwitch.value || !selectedSubstitutes.value.length) return

    const orderId = route.params.id
    const itemId = itemToSwitch.value.id
    isSavingSubstitutes.value = true

    try {
      await axios.post(`/api/order/${orderId}/item/${itemId}/flag-unavailable`, {
        note: '',
        substitutes: selectedSubstitutes.value.map((substitute) => ({
          product_id: substitute.product_id,
          variant_id: substitute.variant_id ?? null,
        })),
      })

      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('order.switchSuccess') || 'Changes saved successfully',
        life: 4000,
      })

      openSwitchPopUp.value = false
      selectedSubstitutes.value = []
      productVariantDialog.value = false
      pendingVariantProduct.value = null
      variantOptions.value = []
      searchQuery.value = ''
      await fetchProductsForSwitch()
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('order.switchError') || 'Unable to save substitutions',
        life: 5000,
      })
    } finally {
      isSavingSubstitutes.value = false
    }
  }

  const saveOrderChanges = async () => {
    if (!route.params.id) return

    isSavingOrderChanges.value = true

    try {
      await axios.post(`/api/order/${route.params.id}/finish-picking`)
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('order.switchSuccess') || 'Order changes saved successfully',
        life: 4000,
      })
      await fetchOrderData()
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('order.switchError') || 'Unable to save order changes',
        life: 5000,
      })
    } finally {
      isSavingOrderChanges.value = false
    }
  }

  onMounted(fetchOrderData)
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900" :dir="lang === 'ar' ? 'rtl' : 'ltr'">
    <Toast />

    <div v-if="loading" class="flex flex-col items-center justify-center h-[60vh]">
      <ProgressSpinner strokeWidth="3" fill="transparent" animationDuration=".5s" />
      <p class="mt-4 text-[#0b3baa] font-bold tracking-wider animate-pulse">{{ t('loading') }}</p>
    </div>

    <div v-else-if="orderData" class="max-w-6xl mx-auto space-y-6">
      <!-- Header -->
      <header
        class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-200"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-[#0b3baa]/10 rounded-2xl flex items-center justify-center text-[#0b3baa]">
            <i class="pi pi-shopping-bag text-xl"></i>
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-black text-slate-800">
              {{ t('order.details') }} <span class="text-[#0b3baa]">#{{ orderData.id }}</span>
            </h1>
            <div class="flex items-center gap-4">
              <p class="text-slate-400 text-sm font-medium">{{ formatDate(orderData.created_at) }}</p>
              <p class="text-slate-400 text-sm font-medium">OTP: {{ orderData.otp || '—' }}</p>
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
            :disabled="orderData.has_invoice"
            class="!bg-[#0b3baa] !border-none !rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all"
            :loading="isGeneratingInvoice"
            @click="openGenerateInvoiceModal"
          />
        </div>
      </header>

      <!-- Warnings & Alerts -->
      <transition name="fade">
        <div
          v-if="isNotAllSelected"
          class="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 shadow-sm"
        >
          <i class="pi pi-exclamation-triangle text-xl text-amber-500 animate-pulse"></i>
          <div class="text-sm font-medium">
            {{
              lang === 'ar'
                ? 'تنبيه: لم تقم بتحديد جميع المنتجات في هذا الطلب بعد.'
                : 'Please note: You have not selected all items in this order.'
            }}
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div
          v-if="has_substitutes"
          class="flex items-center gap-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-3 py-2.5 shadow-sm"
        >
          <div class="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
            <i class="pi pi-check-circle text-sm"></i>
          </div>
          <div class="text-xs font-medium leading-relaxed">
            {{ lang === 'ar' ? 'تم وضع بدائل لمنتجات هذا الطلب.' : 'Substitutes have been assigned for this order.' }}
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div
          v-if="isProcessingOverdue"
          class="flex items-center gap-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl p-4"
        >
          <div
            class="shrink-0 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center animate-bounce"
          >
            <i class="pi pi-bolt text-lg"></i>
          </div>
          <div class="flex-1">
            <p class="font-bold text-red-900 leading-none">{{ t('order.proc.overdueTitle') }}</p>
            <p class="text-xs mt-1 text-red-600 opacity-80">{{ t('order.proc.overdueDesc') }}</p>
          </div>
        </div>
      </transition>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column: Order Metadata & Address Map -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Customer & Store Info Card -->
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
                <span class="font-bold text-slate-800">{{
                  lang === 'ar' ? orderData.store?.name_ar : orderData.store?.name_en
                }}</span>
              </div>

              <div v-if="orderData.owner" class="flex justify-between items-center mb-3">
                <span class="text-slate-500 text-sm">{{ t('order.owner') || 'Owner' }}</span>
                <span class="font-bold text-slate-800">{{
                  lang === 'ar' ? orderData.owner.ar : orderData.owner.en
                }}</span>
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

          <!-- Address Map Card -->
          <div v-if="orderData.address" class="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i class="pi pi-map-marker text-[#0b3baa]"></i>
                {{ lang === 'ar' ? 'عنوان التوصيل' : 'Delivery Address' }}
              </h3>
              <Button
                v-if="addressCoords"
                icon="pi pi-external-link"
                text
                rounded
                size="small"
                class="!text-[#0b3baa] !p-1"
                v-tooltip.top="lang === 'ar' ? 'فتح في خرائط جوجل' : 'Open in Google Maps'"
                @click="openGoogleMaps"
              />
            </div>

            <!-- Address Text Info -->
            <div class="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
              <p class="font-bold text-slate-800">
                {{ orderData.address.address_line_1 }}
                <span v-if="orderData.address.address_line_2">, {{ orderData.address.address_line_2 }}</span>
              </p>
              <p class="text-slate-500">
                {{ orderData.address.city
                }}<span v-if="orderData.address.governorate">, {{ orderData.address.governorate }}</span>
              </p>
            </div>

            <!-- Embedded Interactive Map Frame -->
            <div
              v-if="addressCoords"
              class="relative w-full h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-inner group"
            >
              <iframe
                width="100%"
                height="100%"
                frameborder="0"
                scrolling="no"
                marginheight="0"
                marginwidth="0"
                :src="`https://maps.google.com/maps?q=${addressCoords.lat},${addressCoords.lng}&hl=${lang}&z=15&output=embed`"
                class="w-full h-full rounded-2xl filter contrast-[1.05]"
              ></iframe>
              <button
                @click="openGoogleMaps"
                class="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <i class="pi pi-[#0b3baa] pi-directions text-xs text-[#0b3baa]"></i>
                {{ lang === 'ar' ? 'الاتجاهات' : 'Get Directions' }}
              </button>
            </div>
          </div>

          <!-- Customer Notes Card -->
          <div v-if="orderData.notes" class="bg-amber-50/60 rounded-3xl p-6 border border-amber-200/70 shadow-sm">
            <h3 class="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
              <i class="pi pi-comment text-amber-600"></i>
              {{ t('order.notes') || (lang === 'ar' ? 'ملاحظات العميل' : 'Customer Notes') }}
            </h3>
            <p
              class="text-sm text-slate-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-amber-100 whitespace-pre-line"
            >
              {{ orderData.notes }}
            </p>
          </div>

          <!-- Financial Summary -->
          <div class="bg-slate-900 text-white rounded-3xl p-6 shadow-xl shadow-slate-200 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-[#0b3baa] opacity-20 rounded-full"></div>
            <h3 class="text-xs font-bold text-[#F3B913] uppercase tracking-widest mb-6">
              {{ t('order.financialSummary') }}
            </h3>
            <div class="space-y-4 relative z-10">
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.subtotal') }}</span>
                <span class="text-white">{{ formatCurrency(orderData.sub_total_price) }}</span>
              </div>
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.fees') }}</span>
                <span class="text-white">{{
                  formatCurrency(parseFloat(orderData.tax_fee) + parseFloat(orderData.service_fee))
                }}</span>
              </div>
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.delivery') }}</span>
                <span class="text-white">{{ formatCurrency(orderData.delivery_fee) }}</span>
              </div>
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.coupon') }}</span>
                <span class="text-white">{{ formatCurrency(orderData.coupon) }}</span>
              </div>
              <div class="flex justify-between text-slate-400 text-sm">
                <span>{{ t('order.totalDiscounts') }}</span>
                <span class="text-white">{{ formatCurrency(orderData.total_discounts_fees) }}</span>
              </div>
              <Divider class="!border-slate-700" />
              <div class="flex justify-between items-end">
                <span class="text-[#F3B913] font-bold">{{ t('order.total') }}</span>
                <span class="text-3xl font-black text-white">{{ formatCurrency(orderData.total_price) }}</span>
              </div>
              <div
                v-if="paymentMethod"
                class="flex items-center justify-between gap-3 rounded-2xl border border-[#F3B913]/30 bg-white/10 px-4 py-3"
              >
                <span class="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <i class="pi pi-credit-card text-[#F3B913]"></i>
                  {{ t('order.paymentMethod') }}
                </span>
                <span class="rounded-full bg-[#F3B913] px-3 py-1 text-xs font-black text-slate-900">
                  {{ paymentMethod }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Timeline & Items Table -->
        <div class="lg:col-span-8 space-y-6">
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
                      :class="getProcedureStepClasses(step)"
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
                          : 'bg-slate-50 border-slate-100',
                      ]"
                    >
                      <div class="flex items-center justify-between flex-wrap gap-2">
                        <p
                          class="text-sm font-bold"
                          :class="[
                            step.done && step.key !== 'cancelled_at'
                              ? 'text-[#0b3baa]'
                              : step.key === 'cancelled_at' && step.done
                              ? 'text-red-600'
                              : 'text-slate-400',
                          ]"
                        >
                          {{ t(step.labelKey) }}
                        </p>
                        <span
                          class="text-xs font-bold px-2.5 py-1 rounded-full"
                          :class="[
                            step.done && step.key !== 'cancelled_at'
                              ? 'bg-[#0b3baa] text-white'
                              : step.key === 'cancelled_at' && step.done
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-200 text-slate-400',
                          ]"
                        >
                          {{ step.done ? t('order.proc.done') : t('order.proc.notYet') }}
                        </span>
                      </div>
                      <div v-if="step.timestamp" class="mt-2 flex items-center gap-2 flex-wrap">
                        <span class="flex items-center gap-1 text-xs text-slate-500">
                          <i class="pi pi-calendar text-xs"></i>
                          {{ formatDate(step.timestamp) }}
                        </span>
                        <span
                          v-if="step.key === 'processing_at' && isProcessingOverdue"
                          class="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full ring-1 ring-amber-300"
                        >
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

          <div class="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <i class="pi pi-box text-[#0b3baa]"></i>
                {{ t('order.items') }}
                <Tag
                  :value="orderData.order_items?.length"
                  rounded
                  class="!bg-slate-200 !text-slate-600 !text-[10px]"
                />
              </h3>
            </div>

            <DataTable
              v-model:selection="selectedItems"
              :value="sortedOrderItems"
              dataKey="id"
              class="p-datatable-custom"
              responsiveLayout="scroll"
              :rowHover="true"
            >
              <Column :header="t('order.product')">
                <template #body="{ data }">
                  <div class="flex items-center gap-4 py-2">
                    <img
                      :src="getProductImage(data.product)"
                      class="w-12 h-12 rounded-xl object-cover ring-4 ring-slate-50"
                    />
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-800 text-sm leading-tight">{{
                        getProductName(data.product)
                      }}</span>
                      <span v-if="data.variant_id" class="text-slate-800 text-xs leading-tight"
                        >{{ $t('order.weight') }} : {{ getProductNameVariant(data.variant.attribute_values[0]) }}</span
                      >
                      <span class="text-[10px] text-slate-400 mt-1 uppercase font-medium"
                        >SKU: {{ data.product?.code || 'N/A' }}</span
                      >
                    </div>
                  </div>
                </template>
              </Column>
              <Column :header="t('order.switch')" class="text-center">
                <template #body="{ data }">
                  <span
                    class="switch-trigger"
                    :class="{ 'switch-trigger-loading': productsLoading && itemToSwitch?.id === data.id }"
                    @click="switchItem(data)"
                  >
                    <i class="pi pi-sync"></i>
                  </span>
                </template>
              </Column>
              <Column :header="t('order.qty')" class="text-center">
                <template #body="{ data }">
                  <span class="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-[#0b3baa]"
                    >x{{ data.quantity }}</span
                  >
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

      <div class="flex justify-end pt-2">
        <Button
          :label="isSavingOrderChanges ? t('order.savingChanges') : t('order.saveChanges')"
          class="!bg-[#0b3baa] !border-none !rounded-xl px-6 py-3 shadow-md hover:shadow-lg transition-all"
          :loading="isSavingOrderChanges"
          :disabled="isSavingOrderChanges"
          @click="saveOrderChanges"
        />
      </div>
    </div>

    <!-- Confirmation Modal -->
    <Dialog
      v-model:visible="openSwitchPopUp"
      modal
      :header="t('order.switchItems')"
      :style="{ width: '42rem', maxWidth: '92vw' }"
      class="product-switch-dialog"
      :closable="true"
      :draggable="false"
    >
      <div class="product-switch-wrapper">
        <div class="product-search-box">
          <div class="product-search-header">
            <div class="product-search-icon">
              <i class="pi pi-search"></i>
            </div>
            <div>
              <p class="product-search-title">{{ t('order.search') }}</p>
              <p class="product-search-subtitle">{{ t('order.switchItems') }}</p>
            </div>
          </div>

          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              class="product-search-input"
              :placeholder="t('order.search')"
              @input="fetchProductsForSwitch"
            />
          </span>
        </div>

        <div v-if="itemToSwitch" class="switch-item-summary">
          <div class="switch-item-image">
            <img
              :src="
                itemToSwitch.product?.media?.[0]?.url ||
                itemToSwitch.product?.key_default_image ||
                '/images/no-image.png'
              "
              alt="item"
            />
          </div>
          <div class="switch-item-info">
            <span class="switch-item-label">Current item</span>
            <p class="switch-item-name">
              {{ lang === 'ar' ? itemToSwitch.product?.name_ar : itemToSwitch.product?.name_en }}
            </p>
          </div>
        </div>

        <div v-if="selectedSubstitutes.length" class="selected-substitutes">
          <div class="selected-substitutes-header">
            <span>Selected</span>
            <small>{{ selectedSubstitutes.length }}</small>
          </div>
          <div class="selected-substitutes-list">
            <div
              v-for="substitute in selectedSubstitutes"
              :key="substitute.product_id"
              class="selected-substitute-item"
            >
              <span>{{ getProductDisplayName(substitute.product) }}</span>
              <button type="button" class="remove-substitute" @click="removeSelectedSubstitute(substitute.product_id)">
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="product-list-panel">
          <DataTable
            :value="productsDate"
            :rows="5"
            :loading="productsLoading"
            :emptyMessage="t('noResults') || 'No results found'"
            class="product-switch-table"
            responsiveLayout="scroll"
            scrollable
            scrollHeight="320px"
          >
            <Column header="" style="width: 2.8rem">
              <template #body="{ data }">
                <button
                  type="button"
                  class="product-select-toggle"
                  :class="{ selected: isProductSelected(data.id) }"
                  @click.stop="toggleProductSelection(data)"
                >
                  <i v-if="isProductSelected(data.id)" class="pi pi-check"></i>
                </button>
              </template>
            </Column>

            <Column :field="'name_' + locale" header="Name" class="product-name-col">
              <template #body="{ data }">
                <div class="product-cell product-row-clickable" @click="toggleProductSelection(data)">
                  <div class="product-meta">
                    <p class="product-name">{{ data['name_' + locale] }}</p>
                    <span class="product-code">SKU: {{ data.code || 'N/A' }}</span>
                  </div>
                </div>
              </template>
            </Column>
            <Column field="base_price" header="Price" headerClass="text-right" class="product-price-col">
              <template #body="{ data }">
                <span class="product-price product-row-clickable" @click="toggleProductSelection(data)">
                  {{ formatCurrency(data.base_price) }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            :label="t('cancel')"
            class="p-button-text !text-slate-400 !rounded-xl"
            @click="openSwitchPopUp = false"
          />
          <Button
            :label="isSavingSubstitutes ? 'Saving...' : t('save')"
            class="!bg-[#0b3baa] !border-none !rounded-xl px-6"
            :loading="isSavingSubstitutes"
            :disabled="!selectedSubstitutes.length || isSavingSubstitutes"
            @click="saveSubstitutes"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="productVariantDialog"
      modal
      :style="{ width: '25rem', maxWidth: '90vw' }"
      class="variant-dialog"
      :closable="true"
      :draggable="false"
    >
      <div v-if="pendingVariantProduct" class="variant-dialog-content">
        <div class="variant-title-row">
          <div class="variant-product-meta">
            <span class="variant-label">Choose variant</span>
            <p>{{ getProductDisplayName(pendingVariantProduct) }}</p>
          </div>
        </div>

        <div v-if="variantLoading" class="variant-loading-box">
          <ProgressSpinner strokeWidth="3" style="width: 2rem; height: 2rem" />
          <span>Loading variants...</span>
        </div>

        <div v-else-if="variantOptions.length" class="variant-options">
          <button
            v-for="variant in variantOptions"
            :key="variant.id"
            type="button"
            class="variant-option"
            @click="chooseVariantForProduct(variant)"
          >
            <div class="variant-option-text">
              <span>{{ buildVariantLabel(variant) }}</span>
            </div>
            <strong>{{ formatCurrency(variant.price) }}</strong>
          </button>
        </div>

        <div v-else class="variant-empty">
          <p>No variants available.</p>
          <Button
            label="Use default"
            class="!bg-[#0b3baa] !border-none !rounded-xl px-4"
            @click="chooseVariantForProduct(null)"
          />
        </div>
      </div>
    </Dialog>

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
          <Button
            :label="t('cancel')"
            class="p-button-text !text-slate-400 !rounded-xl"
            @click="displayConfirmationModal = false"
          />
          <Button
            :label="t('confirm')"
            class="!bg-[#0b3baa] !border-none !rounded-xl px-8"
            @click="confirmAndGenerateInvoice"
          />
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

  .variant-dialog :deep(.p-dialog) {
    border-radius: 1.2rem;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
  }

  .variant-dialog :deep(.p-dialog-header) {
    border: none;
    background: transparent;
    padding: 0.75rem 1rem 0;
    justify-content: flex-end;
  }

  .variant-dialog :deep(.p-dialog-header-close) {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 999px;
    color: #334155;
    background: transparent;
    border: none;
    font-size: 1.7rem;
    line-height: 1;
  }

  .variant-dialog :deep(.p-dialog-content) {
    padding: 0 1.1rem 1.1rem !important;
    background: #ffffff;
    border-radius: 1.2rem;
  }

  .variant-dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 18rem;
  }

  .variant-title-row {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-top: 0.2rem;
  }

  .variant-product-meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    width: 100%;
  }

  .variant-label {
    display: inline-block;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 700;
  }

  .variant-product-meta p {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.4;
    text-align: center;
    word-break: break-word;
  }

  .variant-loading-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    min-height: 8rem;
    color: #475569;
    font-weight: 600;
  }

  .variant-options {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    margin-top: 0.2rem;
  }

  .variant-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    padding: 0.8rem 0.9rem;
    border: 1px solid #dfe7f3;
    border-radius: 0.85rem;
    background: #fff;
    color: #0f172a;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: right;
  }

  .variant-option:hover {
    border-color: #93c5fd;
    background: #f8fbff;
    box-shadow: 0 8px 18px rgba(11, 59, 170, 0.04);
  }

  .variant-option-text {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    text-align: right;
    color: #0f172a;
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.5;
  }

  .variant-option strong {
    color: #0b3baa;
    font-size: 1rem;
    font-weight: 800;
    white-space: nowrap;
  }

  .variant-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    min-height: 8rem;
    text-align: center;
    color: #475569;
  }

  .variant-empty p {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .product-switch-dialog :deep(.p-dialog-header) {
    background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
    border-bottom: 1px solid #e2e8f0;
    padding: 1.25rem 1.5rem 1rem;
  }

  .product-switch-dialog :deep(.p-dialog-header-title) {
    color: #0f172a;
    font-size: 1.1rem;
    font-weight: 800;
  }

  .product-switch-dialog :deep(.p-dialog-content) {
    padding: 0 !important;
    background: #f8fafc;
    overflow: hidden;
  }

  .product-switch-dialog :deep(.p-dialog) {
    overflow: hidden;
  }

  .product-switch-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  }

  .product-search-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    padding: 0.85rem 0.9rem;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.03);
  }

  .product-search-header {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.65rem;
  }

  .product-search-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 0.8rem;
    background: linear-gradient(135deg, rgba(11, 59, 170, 0.12), rgba(11, 59, 170, 0.04));
    color: #0b3baa;
    font-size: 0.9rem;
  }

  .product-search-title {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 800;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .product-search-subtitle {
    margin: 0.15rem 0 0;
    font-size: 0.72rem;
    color: #64748b;
  }

  .product-search-input {
    width: 100%;
    border-radius: 0.9rem !important;
    border: 1px solid #dbe3ee !important;
    background: #f8fafc !important;
    padding: 0.9rem 1rem 0.9rem 2.8rem !important;
    font-size: 0.95rem;
    box-shadow: none !important;
    transition: all 0.2s ease;
  }

  .product-search-input:focus {
    border-color: #0b3baa !important;
    box-shadow: 0 0 0 3px rgba(11, 59, 170, 0.08) !important;
    background: #ffffff !important;
  }

  .switch-item-summary {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.7rem 0.8rem;
    border: 1px solid #dbeafe;
    background: linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%);
    border-radius: 0.9rem;
    margin-bottom: 0.15rem;
    width: fit-content;
    max-width: 100%;
  }

  .selected-substitutes {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 0.9rem;
    padding: 0.65rem 0.7rem;
  }

  .selected-substitutes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.72rem;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .selected-substitutes-header small {
    color: #0b3baa;
    font-weight: 800;
  }

  .selected-substitutes-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .selected-substitute-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 0.3rem 0.55rem 0.3rem 0.35rem;
    max-width: 100%;
  }

  .selected-substitute-item img {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    object-fit: cover;
  }

  .selected-substitute-item span {
    font-size: 0.72rem;
    color: #0f172a;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 11rem;
  }

  .remove-substitute {
    border: none;
    background: transparent;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0.1rem 0.2rem;
  }

  .switch-item-image {
    width: 2.7rem;
    height: 2.7rem;
    border-radius: 0.8rem;
    overflow: hidden;
    border: 1px solid #bfdbfe;
    background: #fff;
    flex-shrink: 0;
  }

  .switch-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .switch-item-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }

  .switch-item-label {
    color: #64748b;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .switch-item-name {
    margin: 0;
    color: #0f172a;
    font-size: 0.9rem;
    font-weight: 800;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .product-list-panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    overflow: hidden;
    height: 17rem;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.03);
  }

  .product-switch-table {
    height: 100%;
  }

  .product-switch-table :deep(.p-datatable-wrapper) {
    height: 100%;
    overflow: hidden;
    background: #fff;
  }

  .product-switch-table :deep(.p-datatable-thead > tr > th) {
    background: #f8fafc;
    color: #475569;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .product-switch-table :deep(.p-datatable-tbody > tr) {
    transition: background 0.2s ease;
  }

  .product-switch-table :deep(.p-datatable-tbody > tr:hover) {
    background: #f8fafc;
  }

  .product-switch-table :deep(.p-datatable-tbody > tr > td) {
    border-bottom: 1px solid #eef2f7;
    padding: 0.8rem 1rem;
    vertical-align: middle;
  }

  .product-row-clickable {
    width: 100%;
    min-height: 100%;
    cursor: pointer;
    border-radius: 0.7rem;
    transition: background 0.15s ease;
  }

  .product-row-clickable:hover {
    background: rgba(148, 163, 184, 0.05);
  }

  .product-select-toggle {
    width: 2rem;
    height: 2rem;
    border-radius: 0.7rem;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #0b3baa;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    box-shadow: none;
  }

  .product-select-toggle:hover {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  .product-select-toggle.selected {
    background: #0b3baa;
    border-color: #0b3baa;
    color: #fff;
    box-shadow: 0 8px 16px rgba(11, 59, 170, 0.2);
  }

  .product-select-toggle:focus-visible {
    outline: 2px solid rgba(11, 59, 170, 0.35);
    outline-offset: 2px;
  }

  .switch-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.7rem;
    background: #f1f5f9;
    color: #0b3baa;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .switch-trigger:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  }

  .switch-trigger-loading {
    background: #e0ecff;
    pointer-events: none;
  }

  .switch-trigger-loading i {
    animation: spin-switch 0.8s linear infinite;
  }

  @keyframes spin-switch {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .product-cell {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .product-thumb {
    width: 2.7rem;
    height: 2.7rem;
    border-radius: 0.8rem;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    flex-shrink: 0;
  }

  .product-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-meta {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
  }

  .product-name {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.4;
  }

  .product-code {
    color: #64748b;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .product-price {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    font-weight: 800;
    color: #0b3baa;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
