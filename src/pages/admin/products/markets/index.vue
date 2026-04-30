<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toolbar from 'primevue/toolbar'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'
import Dropdown from 'primevue/dropdown'
import FileUpload from 'primevue/fileupload'
import InputNumber from 'primevue/inputnumber'

const router = useRouter()
const toast = useToast()
const { t } = useI18n()

// State variables
const loading = ref(true)
const markets = ref([])
const deleteDialog = ref(false)
const deleteId = ref(null)
const dt = ref(null)
const filters = ref({})
const searchQuery = ref('')
const selectedMarkets = ref(null)
const importDialog = ref(false)
const selectedFile = ref(null)
const importLoading = ref(false)
const service_feeDialog = ref(false)
const selectedMarketId = ref(null)
const service_fee = ref(0)
const service_final_price = ref(0)
const closeMarketLoading = ref({})
const timeslotDialog = ref(false)
const selectedTimeslotMarket = ref(null)
const timeslots = ref([])
const timeslotLoading = ref(false)
const timeslotSaving = ref(false)
const deletingTimeslotId = ref(null)
const timeslotForm = ref({
  day: '0',
  start_time: '08:00',
  end_time: '12:00',
})

// Pagination variables
const currentPage = ref(1)
const totalRecords = ref(0)
const rowsPerPage = ref(10)
const totalPages = ref(0)
const firstPageUrl = ref('')
const lastPageUrl = ref('')
const nextPageUrl = ref('')
const prevPageUrl = ref('')
const from = ref(0)
const to = ref(0)
const links = ref([])
const marketTimeableType = 'App\\Models\\Category'
const weekDayOptions = [
  { value: '0', labelKey: 'store.days.sunday' },
  { value: '1', labelKey: 'store.days.monday' },
  { value: '2', labelKey: 'store.days.tuesday' },
  { value: '3', labelKey: 'store.days.wednesday' },
  { value: '4', labelKey: 'store.days.thursday' },
  { value: '5', labelKey: 'store.days.friday' },
  { value: '6', labelKey: 'store.days.saturday' },
]

const availableDayOptions = computed(() => {
  const usedDays = new Set(timeslots.value.map((slot) => String(slot.day)))

  return weekDayOptions
    .filter((day) => !usedDays.has(day.value))
    .map((day) => ({
      label: t(day.labelKey),
      value: day.value,
    }))
})

const isTimeslotFormValid = computed(() => {
  const startTime = timeslotForm.value.start_time
  const endTime = timeslotForm.value.end_time

  return Boolean(
    selectedTimeslotMarket.value &&
      timeslotForm.value.day !== null &&
      timeslotForm.value.day !== undefined &&
      startTime &&
      endTime &&
      startTime < endTime &&
      availableDayOptions.value.length,
  )
})

const isMarketBusy = (value) => value === true || value === 1 || value === '1'
const toBusyValue = (value) => (isMarketBusy(value) ? 1 : 0)

// Example data for import template
const exampleData = ref([
  {
    id: 'شفت 7',
    arabic_name: 'Shift7',
    english_name: 'الأحذية',
    Top_Parent: 'shift7',
  },
])
const goToShippingSettings = (storeId) => {
  router.push({ name: 'market-shipping-settings', params: { id: storeId } })
}
// Fetch markets data
const fetchData = () => {
  loading.value = true
  axios.get('/api/market', {
    params: {
      page: currentPage.value,
      limit: rowsPerPage.value,
      search: searchQuery.value || undefined
    }
  })
    .then((response) => {
      markets.value = response.data.data.data
      totalRecords.value = response.data.data.total
      totalPages.value = response.data.data.last_page
      firstPageUrl.value = response.data.data.first_page_url
      lastPageUrl.value = response.data.data.last_page_url
      nextPageUrl.value = response.data.data.next_page_url
      prevPageUrl.value = response.data.data.prev_page_url
      from.value = response.data.data.from
      to.value = response.data.data.to
      links.value = response.data.data.links
      currentPage.value = response.data.data.current_page
      loading.value = false
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('market.loadError'),
        life: 3000
      })
      loading.value = false
      console.error('Error fetching markets:', error)
    })
}

// Watch for pagination and search changes
watch([searchQuery, rowsPerPage], () => {
  currentPage.value = 1
  fetchData()
})

// Handle page navigation
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchData()
  }
}

// Handle rows per page change
const changeRowsPerPage = (event) => {
  rowsPerPage.value = event.value
  currentPage.value = 1
  fetchData()
}

// Delete market
const confirmDelete = (id) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteMarket = () => {
  axios.delete(`/api/market/${deleteId.value}`)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('market.deleteSuccess'),
        life: 3000
      })
      fetchData()
      deleteDialog.value = false
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('market.deleteError'),
        life: 3000
      })
      console.error('Error deleting market:', error)
    })
}

// Export markets
const exportMarkets = () => {
  axios.get('/api/export/market', {
    responseType: 'blob'
  })
    .then((response) => {
      const blob = new Blob([response.data], { type: 'text/xlsx' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'markets_export.xlsx')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('market.exportError'),
        life: 3000
      })
      console.error('Error exporting markets:', error)
    })
}

// Download example CSV
const downloadExample = () => {
  const csvContent = 'id,Arabic Name,English Name,Top Parent / Store\n' +
    exampleData.value.map(row =>
      `"${row.id}","${row.arabic_name}","${row.english_name}","${row.Top_Parent}",`
    ).join('\n')
  const blob = new Blob([csvContent], { type: 'text/xlsx;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'market_import_example.xlsx')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}

// Import markets
const openImportDialog = () => {
  importDialog.value = true
  selectedFile.value = null
}

const onFileSelect = (event) => {
  selectedFile.value = event.files[0]
}

const importMarkets = () => {
  if (!selectedFile.value) {
    toast.add({
      severity: 'warn',
      summary: t('warning'),
      detail: t('market.importNoFile'),
      life: 3000
    })
    return
  }

  importLoading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  axios.post('/api/import/markets', formData)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('market.importSuccess'),
        life: 3000
      })
      fetchData()
      importDialog.value = false
      selectedFile.value = null
      // Reset FileUpload
      const fileUpload = document.querySelector('.p-fileupload input[type="file"]')
      if (fileUpload) fileUpload.value = ''
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('market.importError'),
        life: 3000
      })
      console.error('Error importing markets:', error)
    })
    .finally(() => {
      importLoading.value = false
    })
}

// Service fee functions
const openservice_feeDialog = (data) => {
  selectedMarketId.value = data.id
  service_fee.value = data.service_fee // Reset or fetch current if needed
  service_final_price.value = data.service_final_price || 0
  service_feeDialog.value = true
}

const addservice_fee = () => {
  axios.post(`/api/market/service/fee/${selectedMarketId.value}`, {
    service_fee: service_fee.value,
    service_final_price: service_final_price.value
  })
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('market.serviceFeeSuccess'),
        life: 3000
      })
      service_feeDialog.value = false
      fetchData() // Optional refresh
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('market.service_feeError'),
        life: 3000
      })
      console.error('Error adding service fee:', error)
    })
}

const toggleCloseMarket = async (market, value) => {
  const marketId = market.id
  const previousValue = isMarketBusy(market.is_busy)
  const nextValue = Boolean(value)

  if (closeMarketLoading.value[marketId]) return

  closeMarketLoading.value[marketId] = true
  market.is_busy = nextValue ? 1 : 0

  try {
    const response = await axios.get(`/api/market/is_busy/${marketId}`)
    const updatedValue = response.data?.data?.is_busy ?? response.data?.is_busy

    if (updatedValue !== undefined && updatedValue !== null) {
      market.is_busy = toBusyValue(updatedValue)
    }
  } catch (error) {
    market.is_busy = previousValue ? 1 : 0
    toast.add({ severity: 'error', summary: t('error'), detail: t('market.closeError'), life: 3000 })
  } finally {
    closeMarketLoading.value[marketId] = false
  }
}

const getDayLabel = (day) => {
  const dayOption = weekDayOptions.find((option) => option.value === String(day))
  return dayOption ? t(dayOption.labelKey) : day
}

const getMarketDisplayName = (market) => {
  if (!market) return ''

  const appLang = localStorage.getItem('appLang') || 'en'

  return appLang === 'ar'
    ? market.name_ar || market.name_en || `#${market.id}`
    : market.name_en || market.name_ar || `#${market.id}`
}

const formatTimeForApi = (time) => {
  if (!time) return ''

  return String(time).slice(0, 5)
}

const formatTimeForDisplay = (time) => {
  if (!time) return ''

  return String(time).slice(0, 5)
}

const resetTimeslotForm = () => {
  timeslotForm.value = {
    day: availableDayOptions.value[0]?.value || '0',
    start_time: '08:00',
    end_time: '12:00',
  }
}

const isCurrentMarketTimeslot = (timeslot, marketId) => {
  const type = String(timeslot.timeable_type || '').toLowerCase()

  return Number(timeslot.timeable_id) === marketId && (!type || type.includes('category'))
}

const fetchTimeslots = async () => {
  if (!selectedTimeslotMarket.value) return

  timeslotLoading.value = true

  try {
    const marketId = Number(selectedTimeslotMarket.value.id)
    const allTimeslots = []
    let page = 1
    let lastPage = 1

    do {
      const response = await axios.get('/api/timeslot', {
        params: {
          page,
          limit: 100,
          per_page: 100,
          timeable_id: marketId,
          timeable_type: marketTimeableType,
        },
      })

      const responseData = response.data?.data
      const pageTimeslots = Array.isArray(responseData?.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : []

      allTimeslots.push(...pageTimeslots)
      lastPage = Number(responseData?.last_page || page)
      page += 1
    } while (page <= lastPage && page <= 50)

    timeslots.value = allTimeslots
      .filter((timeslot) => isCurrentMarketTimeslot(timeslot, marketId))
      .sort((first, second) => Number(first.day) - Number(second.day))

    resetTimeslotForm()
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('market.timeslotLoadError'), life: 3000 })
  } finally {
    timeslotLoading.value = false
  }
}

const openTimeslotDialog = async (market) => {
  selectedTimeslotMarket.value = market
  timeslots.value = []
  resetTimeslotForm()
  timeslotDialog.value = true
  await fetchTimeslots()
}

const createTimeslot = async () => {
  if (!isTimeslotFormValid.value) {
    toast.add({ severity: 'warn', summary: t('warning'), detail: t('market.timeslotValidationError'), life: 3000 })
    return
  }

  const duplicateDay = timeslots.value.some((timeslot) => String(timeslot.day) === String(timeslotForm.value.day))
  if (duplicateDay) {
    toast.add({ severity: 'warn', summary: t('warning'), detail: t('market.timeslotDuplicateError'), life: 3000 })
    return
  }

  timeslotSaving.value = true

  try {
    await axios.post('/api/timeslot', {
      timeable_type: marketTimeableType,
      timeable_id: selectedTimeslotMarket.value.id,
      start_time: formatTimeForApi(timeslotForm.value.start_time),
      end_time: formatTimeForApi(timeslotForm.value.end_time),
      day: timeslotForm.value.day,
    })

    toast.add({ severity: 'success', summary: t('success'), detail: t('market.timeslotCreatedSuccess'), life: 3000 })
    await fetchTimeslots()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('error'),
      detail: error.response?.data?.message || t('market.timeslotCreateError'),
      life: 3000,
    })
  } finally {
    timeslotSaving.value = false
  }
}

const deleteTimeslot = async (timeslot) => {
  deletingTimeslotId.value = timeslot.id

  try {
    await axios.delete(`/api/timeslot/${timeslot.id}`)
    timeslots.value = timeslots.value.filter((item) => item.id !== timeslot.id)
    resetTimeslotForm()
    toast.add({ severity: 'success', summary: t('success'), detail: t('market.timeslotDeletedSuccess'), life: 3000 })
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('market.timeslotDeleteError'), life: 3000 })
  } finally {
    deletingTimeslotId.value = null
  }
}

// Navigation functions
const createNewMarket = () => {
  router.push({ name: 'market-create' })
}

const editMarket = (id) => {
  router.push({ name: 'market-update', params: { id } })
}

// Lifecycle hooks
onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card p-4 shadow-2 border-round">
        <Toolbar class="mb-4">
          <template #start>
            <h2 class="text-2xl font-bold">{{ t('market.managementTitle') }}</h2>
          </template>
          <template #end>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" :placeholder="t('market.search')" />
              </span>
              <Button :label="t('market.import')" icon="pi pi-download" class="exite" @click="openImportDialog"
                aria-label="Import markets" />
              <Button :label="t('market.export')" icon="pi pi-upload" class="exite" @click="exportMarkets"
                aria-label="Export markets" />
              <Button :label="t('market.new')" icon="pi pi-plus" class="p-button-success" @click="createNewMarket"
                aria-label="Create new market" />
            </div>
          </template>
        </Toolbar>

        <Toast />

        <div class="card shadow-1 surface-0">
          <DataTable ref="dt" :value="markets" :loading="loading" data-key="id" :paginator="false" :rows="rowsPerPage"
            :filters="filters" :totalRecords="totalRecords" responsive-layout="scroll" stripedRows showGridlines
            class="p-datatable-sm">
            <Column selection-mode="multiple" header-style="width: 3rem"></Column>
            <Column field="id" :header="t('id')" :sortable="true" header-style="width:5%; min-width:5rem;">
              <template #body="slotProps">
                {{ slotProps.data.id }}
              </template>
            </Column>
            <Column field="name_en" :header="t('market.nameEn')" :sortable="true"
              header-style="width:14%; min-width:10rem;">
              <template #body="slotProps">
                {{ slotProps.data.name_en }}
              </template>
            </Column>
            <Column field="name_ar" :header="t('market.nameAr')" :sortable="true"
              header-style="width:14%; min-width:10rem;">
              <template #body="slotProps">
                {{ slotProps.data.name_ar }}
              </template>
            </Column>
            <Column field="parent.name_en" :header="t('market.parent')" :sortable="true"
              header-style="width:14%; min-width:10rem;">
              <template #body="slotProps">
                {{ slotProps.data.parent?.name_en || t('market.noParent') }}
              </template>
            </Column>
            <Column field="store.name_en" :header="t('market.store')" :sortable="true"
              header-style="width:14%; min-width:10rem;">
              <template #body="slotProps">
                {{ slotProps.data.store?.name_en || t('market.noStore') }}
              </template>
            </Column>
            <Column field="store.service_fee" :header="t('market.serviceFee')" :sortable="true"
              header-style="width:14%; min-width:10rem;">
              <template #body="slotProps">
                {{ slotProps.data?.service_fee || 0 }} {{ $t("currencyLabel") }}
              </template>
            </Column>
            <Column field="is_busy" :header="t('market.closeStore')" :sortable="true"
              header-style="width:10%; min-width:8rem;">
              <template #body="slotProps">
                <div class="flex justify-content-center align-items-center">
                  <InputSwitch
                    :model-value="isMarketBusy(slotProps.data.is_busy)"
                    :disabled="closeMarketLoading[slotProps.data.id]"
                    @update:model-value="(value) => toggleCloseMarket(slotProps.data, value)"
                  />
                  <ProgressSpinner
                    v-if="closeMarketLoading[slotProps.data.id]"
                    style="width:20px;height:20px"
                    class="ml-2"
                    strokeWidth="5"
                  />
                </div>
              </template>
            </Column>
            <Column :header="t('actions')" header-style="width:9rem;">
              <template #body="slotProps">
                <div class="grid grid-cols-2 gap-1 w-fit mx-auto">

                  <Button unstyled icon="pi pi-money-bill" @click="openservice_feeDialog(slotProps.data)"
                    v-tooltip.top="t('market.addServiceFee')" aria-label="Add service fee" class="inline-flex items-center justify-center w-8 h-8 rounded-lg
               text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600
               dark:hover:bg-emerald-950/40
               transition-all duration-150 hover:scale-110 cursor-pointer" />

                  <Button unstyled icon="pi pi-trash" @click="confirmDelete(slotProps.data.id)"
                    v-tooltip.top="t('delete')" aria-label="Delete market" class="inline-flex items-center justify-center w-8 h-8 rounded-lg
               text-red-500 hover:bg-red-50 hover:text-red-600
               dark:hover:bg-red-950/40
               transition-all duration-150 hover:scale-110 cursor-pointer" />

                  <Button unstyled icon="pi pi-pencil" @click="editMarket(slotProps.data.id)" v-tooltip.top="t('edit')"
                    aria-label="Edit market" class="inline-flex items-center justify-center w-8 h-8 rounded-lg
               text-amber-500 hover:bg-amber-50 hover:text-amber-600
               dark:hover:bg-amber-950/40
               transition-all duration-150 hover:scale-110 cursor-pointer" />

                  <Button unstyled icon="pi pi-truck" @click="goToShippingSettings(slotProps.data.id)"
                    v-tooltip.top="t('store.shippingSettings')" aria-label="Shipping settings" class="inline-flex items-center justify-center w-8 h-8 rounded-lg
               text-blue-500 hover:bg-blue-50 hover:text-blue-600
               dark:hover:bg-blue-950/40
               transition-all duration-150 hover:scale-110 cursor-pointer" />

                  <Button unstyled icon="pi pi-clock" @click="openTimeslotDialog(slotProps.data)"
                    v-tooltip.top="t('market.timeslots')" aria-label="Market time slots" class="inline-flex items-center justify-center w-8 h-8 rounded-lg
               text-cyan-500 hover:bg-cyan-50 hover:text-cyan-600
               dark:hover:bg-cyan-950/40
               transition-all duration-150 hover:scale-110 cursor-pointer" />

                </div>
              </template>
            </Column>
            <template #empty>
              <div class="text-center py-4">
                <i class="pi pi-exclamation-circle text-2xl mb-2" />
                <p class="text-xl">{{ t('market.noData') }}</p>
              </div>
            </template>
            <template #loading>
              <div class="flex justify-content-center align-items-center py-4">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
              </div>
            </template>
          </DataTable>

          <!-- Custom Pagination -->
          <div class="p-paginator p-component p-unselectable-text p-paginator-bottom">
            <div class="p-paginator-left-content">
              <span class="p-paginator-current">{{ t('show') }} {{ from }} {{ t('to') }} {{ to }} {{ t('from') }} {{
                totalRecords }}</span>
            </div>
            <div class="p-paginator-right-content">
              <button class="p-paginator-first p-paginator-element p-link" :disabled="currentPage === 1"
                @click="goToPage(1)" aria-label="First page">
                <span class="p-paginator-icon pi pi-angle-double-left"></span>
              </button>
              <button class="p-paginator-prev p-paginator-element p-link" :disabled="!prevPageUrl"
                @click="goToPage(currentPage - 1)" aria-label="Previous page">
                <span class="p-paginator-icon pi pi-angle-left"></span>
              </button>
              <template v-for="(link, index) in links" :key="index">
                <button v-if="link.label && !isNaN(parseInt(link.label))"
                  class="p-paginator-page p-paginator-element p-link" :class="{ 'p-highlight': link.active }"
                  @click="goToPage(parseInt(link.label))" :aria-label="`Page ${link.label}`">
                  {{ link.label }}
                </button>
                <span v-else-if="link.label === '...'" class="p-paginator-dots">...</span>
              </template>
              <button class="p-paginator-next p-paginator-element p-link" :disabled="!nextPageUrl"
                @click="goToPage(currentPage + 1)" aria-label="Next page">
                <span class="p-paginator-icon pi pi-angle-right"></span>
              </button>
              <button class="p-paginator-last p-paginator-element p-link" :disabled="currentPage === totalPages"
                @click="goToPage(totalPages)" aria-label="Last page">
                <span class="p-paginator-icon pi pi-angle-double-right"></span>
              </button>
              <Dropdown v-model="rowsPerPage" :options="[5, 10, 20, 30]" @change="changeRowsPerPage" class="ml-2"
                style="width: 80px" aria-label="Rows per page" />
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" :header="t('market.deleteConfirmTitle')"
          :modal="true">
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
            <span>{{ t('market.deleteConfirmMessage') }}</span>
          </div>
          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false"
              aria-label="Cancel delete" />
            <Button :label="t('yes')" icon="pi pi-check" class="p-button-text p-button-danger" @click="deleteMarket"
              aria-label="Confirm delete" />
          </template>
        </Dialog>

        <!-- Import Dialog -->
        <Dialog v-model:visible="importDialog" :style="{ width: '500px' }" :header="t('market.importInstructions')"
          :modal="true">
          <div class="flex flex-column gap-3">
            <div>
              <Button :label="t('market.downloadExample')" icon="pi pi-download" class="p-button-outlined"
                @click="downloadExample" aria-label="Download example CSV" />
            </div>

            <FileUpload mode="basic" name="file" accept=".xlsx,.xls,.csv" :maxFileSize="10000000"
              :chooseLabel="t('market.chooseFile')" @select="onFileSelect" :auto="false" :disabled="importLoading"
              class="mb-3" />
            <div v-if="selectedFile" class="mt-2">
              <p class="font-semibold">{{ t('selectedFile') }}: {{ selectedFile.name }}</p>
            </div>
          </div>
          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="importDialog = false"
              aria-label="Cancel import" />
            <Button :label="t('market.import')" icon="pi pi-check" class="p-button-success" @click="importMarkets"
              :disabled="!selectedFile" :loading="importLoading" aria-label="Import markets" />
          </template>
        </Dialog>

        <!-- Service Fee Dialog -->
        <Dialog v-model:visible="service_feeDialog" :style="{ width: '450px' }" :header="t('market.addServiceFee')"
          :modal="true">
          <div class="gap-3">
            <p for="service_fee" class="my-1">{{ t('market.serviceFee') }}</p>
            <InputNumber class="w-full" id="service_fee" v-model="service_fee" :min="0" :step="0.01" mode="decimal"
              :minFractionDigits="0" :maxFractionDigits="2" />
            <p for="service_final_price" class="my-3 mt-4">{{ t('market.serviceFinalPrice') }}</p>
            <InputNumber class="w-full" id="service_final_price" v-model="service_final_price" :min="0" :step="0.01"
              mode="decimal" :minFractionDigits="0" :maxFractionDigits="2" />
          </div>
          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="service_feeDialog = false"
              aria-label="Cancel" />
            <Button :label="t('save')" icon="pi pi-check" class="p-button-success" @click="addservice_fee"
              aria-label="Save service fee" />
          </template>
        </Dialog>

        <!-- Timeslot Dialog -->
        <Dialog v-model:visible="timeslotDialog" :style="{ width: '760px', maxWidth: '95vw' }"
          :header="`${t('market.timeslots')} - ${getMarketDisplayName(selectedTimeslotMarket)}`" :modal="true">
          <div v-if="timeslotLoading" class="flex justify-content-center align-items-center py-5">
            <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="4" />
          </div>

          <template v-else>
            <div class="timeslot-form grid align-items-end gap-4">
              <div class="col-12 md:col-4">
                <label class="block mb-2 font-medium">{{ t('market.day') }}</label>
                <Dropdown v-model="timeslotForm.day" :options="availableDayOptions" optionLabel="label"
                  optionValue="value" :placeholder="t('market.selectDay')" class="w-full"
                  :disabled="!availableDayOptions.length || timeslotSaving" />
              </div>

              <div class="col-12 md:col-3">
                <label class="block mb-2 font-medium">{{ t('market.startTime') }}</label>
                <InputText v-model="timeslotForm.start_time" type="time" class="w-full" :disabled="timeslotSaving" />
              </div>

              <div class="col-12 md:col-3">
                <label class="block mb-2 font-medium">{{ t('market.endTime') }}</label>
                <InputText v-model="timeslotForm.end_time" type="time" class="w-full" :disabled="timeslotSaving" />
              </div>

              <div class="col-12 md:col-2">
                <Button :label="t('market.addTimeslot')" icon="pi pi-plus" class="w-full p-button-success"
                  :loading="timeslotSaving" :disabled="!isTimeslotFormValid || timeslotSaving"
                  @click="createTimeslot" />
              </div>
            </div>

            <p v-if="!availableDayOptions.length" class="text-sm text-color-secondary mt-2">
              {{ t('market.allDaysAdded') }}
            </p>

            <DataTable :value="timeslots" data-key="id" responsive-layout="scroll" stripedRows showGridlines
              class="p-datatable-sm mt-4">
              <Column field="day" :header="t('market.day')">
                <template #body="slotProps">
                  {{ getDayLabel(slotProps.data.day) }}
                </template>
              </Column>

              <Column field="start_time" :header="t('market.startTime')">
                <template #body="slotProps">
                  {{ formatTimeForDisplay(slotProps.data.start_time) }}
                </template>
              </Column>

              <Column field="end_time" :header="t('market.endTime')">
                <template #body="slotProps">
                  {{ formatTimeForDisplay(slotProps.data.end_time) }}
                </template>
              </Column>

              <Column :header="t('actions')" headerStyle="width: 7rem">
                <template #body="slotProps">
                  <Button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                    :loading="deletingTimeslotId === slotProps.data.id" @click="deleteTimeslot(slotProps.data)"
                    v-tooltip.top="t('delete')" />
                </template>
              </Column>

              <template #empty>
                <div class="text-center py-4">
                  <p class="text-xl">{{ t('market.noTimeslots') }}</p>
                </div>
              </template>
            </DataTable>
          </template>

          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="timeslotDialog = false" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-fileupload-choose) {
  width: 100%;
}

.p-button.p-fileupload-choose .p-icon {
  visibility: hidden !important;
}
</style>
