<script setup>
  import { useToast } from 'primevue/usetoast'
  import { FilterMatchMode } from 'primevue/api'
  import { computed, ref, onMounted, onBeforeMount, watch } from 'vue'
  import axios from 'axios'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import Toolbar from 'primevue/toolbar'
  import Toast from 'primevue/toast'
  import Dialog from 'primevue/dialog'
  import ProgressSpinner from 'primevue/progressspinner'
  import Dropdown from 'primevue/dropdown'
  import Tag from 'primevue/tag'

  const router = useRouter()
  const toast = useToast()
  const { t } = useI18n()
  const loading = ref(true)
  const delete_id = ref('')
  const store = ref({})
  const stores = ref(null)
  const storeDialog = ref(false)
  const deleteDialog = ref(false)
  const deleteStoresDialog = ref(false)
  const selectedStores = ref(null)
  const dt = ref(null)
  const filters = ref({})
  const searchQuery = ref('')
  const closeStoreLoading = ref({})
  const timeslotDialog = ref(false)
  const selectedTimeslotStore = ref(null)
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
  const storeTimeableType = 'App\\Models\\Store'

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
      selectedTimeslotStore.value &&
        timeslotForm.value.day !== null &&
        timeslotForm.value.day !== undefined &&
        startTime &&
        endTime &&
        startTime < endTime &&
        availableDayOptions.value.length,
    )
  })

  const isStoreBusy = (value) => value === true || value === 1 || value === '1'
  const toBusyValue = (value) => (isStoreBusy(value) ? 1 : 0)

  async function toggleCloseStore(storeItem, value) {
    const storeId = storeItem.id
    const previousValue = isStoreBusy(storeItem.is_busy)
    const nextValue = Boolean(value)

    if (closeStoreLoading.value[storeId]) return

    closeStoreLoading.value[storeId] = true
    storeItem.is_busy = nextValue ? 1 : 0

    try {
      const response = await axios.get(`/api/store/is_busy/${storeId}`)
      const updatedValue = response.data?.data?.is_busy ?? response.data?.is_busy

      if (updatedValue !== undefined && updatedValue !== null) {
        storeItem.is_busy = toBusyValue(updatedValue)
      }
    } catch (err) {
      storeItem.is_busy = previousValue ? 1 : 0
      toast.add({ severity: 'error', summary: t('error'), detail: t('store.closeError'), life: 3000 })
    } finally {
      closeStoreLoading.value[storeId] = false
    }
  }

  const getDayLabel = (day) => {
    const dayOption = weekDayOptions.find((option) => option.value === String(day))
    return dayOption ? t(dayOption.labelKey) : day
  }

  const getStoreDisplayName = (storeItem) => {
    if (!storeItem) return ''

    const appLang = localStorage.getItem('appLang') || 'en'

    return appLang === 'ar'
      ? storeItem.name_ar || storeItem.name_en || `#${storeItem.id}`
      : storeItem.name_en || storeItem.name_ar || `#${storeItem.id}`
  }

  const formatTimeForApi = (time) => {
    if (!time) return ''

    return time.length === 5 ? `${time}:00` : time
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

  const fetchTimeslots = async () => {
    if (!selectedTimeslotStore.value) return

    timeslotLoading.value = true

    try {
      const storeId = Number(selectedTimeslotStore.value.id)
      const allTimeslots = []
      let page = 1
      let lastPage = 1

      do {
        const response = await axios.get('/api/timeslot', {
          params: {
            page,
            limit: 100,
            per_page: 100,
            timeable_id: storeId,
            timeable_type: storeTimeableType,
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
        .filter((timeslot) => Number(timeslot.timeable_id) === storeId)
        .filter((timeslot) => String(timeslot.timeable_type || '').toLowerCase().includes('store'))
        .sort((first, second) => Number(first.day) - Number(second.day))

      resetTimeslotForm()
    } catch (error) {
      toast.add({ severity: 'error', summary: t('error'), detail: t('store.timeslotLoadError'), life: 3000 })
    } finally {
      timeslotLoading.value = false
    }
  }

  const openTimeslotDialog = async (storeItem) => {
    selectedTimeslotStore.value = storeItem
    timeslots.value = []
    resetTimeslotForm()
    timeslotDialog.value = true
    await fetchTimeslots()
  }

  const createTimeslot = async () => {
    if (!isTimeslotFormValid.value) {
      toast.add({ severity: 'warn', summary: t('warning'), detail: t('store.timeslotValidationError'), life: 3000 })
      return
    }

    const duplicateDay = timeslots.value.some((timeslot) => String(timeslot.day) === String(timeslotForm.value.day))
    if (duplicateDay) {
      toast.add({ severity: 'warn', summary: t('warning'), detail: t('store.timeslotDuplicateError'), life: 3000 })
      return
    }

    timeslotSaving.value = true

    try {
      await axios.post('/api/timeslot', {
        timeable_type: storeTimeableType,
        timeable_id: selectedTimeslotStore.value.id,
        day: timeslotForm.value.day,
        start_time: formatTimeForApi(timeslotForm.value.start_time),
        end_time: formatTimeForApi(timeslotForm.value.end_time),
      })

      toast.add({ severity: 'success', summary: t('success'), detail: t('store.timeslotCreatedSuccess'), life: 3000 })
      await fetchTimeslots()
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: error.response?.data?.message || t('store.timeslotCreateError'),
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
      toast.add({ severity: 'success', summary: t('success'), detail: t('store.timeslotDeletedSuccess'), life: 3000 })
    } catch (error) {
      toast.add({ severity: 'error', summary: t('error'), detail: t('store.timeslotDeleteError'), life: 3000 })
    } finally {
      deletingTimeslotId.value = null
    }
  }

  // Export stores
  const exportStores = () => {
    axios
      .get('/api/export/store', {
        responseType: 'blob', // Important for handling file downloads
      })
      .then((response) => {
        // Create a blob from the response
        const blob = new Blob([response.data], { type: 'text/xlsx' })
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob)
        // Create a temporary link element
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'stores_export.xlsx') // Set the file name
        document.body.appendChild(link)
        link.click()
        // Clean up
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast.add({
          severity: 'success',
          summary: t('success'),
          detail: t('store.exportSuccess'),
          life: 3000,
        })
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('store.exportError'),
          life: 3000,
        })
        console.error('Error exporting stores:', error)
      })
  }

  const delet = (id) => {
    delete_id.value = id
    deleteStoresDialog.value = true
  }
  const goToShippingSettings = (storeId) => {
    router.push({ name: 'store-shipping-settings', params: { id: storeId } })
  }
  const deleteSelectedStore = () => {
    axios
      .delete(`/api/store/${delete_id.value}`)
      .then(() => {
        fetchData()
        deleteStoresDialog.value = false
        toast.add({ severity: 'success', summary: t('success'), detail: t('store.deletedSuccess'), life: 3000 })
      })
      .catch(() => {
        toast.add({ severity: 'error', summary: t('error'), detail: t('store.deleteError'), life: 3000 })
      })
  }

  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
  }

  onBeforeMount(() => {
    initFilters()
  })
  const goToMediaLinks = (id) => {
    router.push({ name: 'media-links', params: { id: id, type: 1 } })
  }
  const fetchData = () => {
    loading.value = true
    axios
      .get('/api/store', {
        params: {
          page: currentPage.value,
          limit: rowsPerPage.value,
          search: searchQuery.value,
        },
      })
      .then((res) => {
        loading.value = false
        stores.value = res.data.data.data
        totalRecords.value = res.data.data.total
        totalPages.value = res.data.data.last_page
        firstPageUrl.value = res.data.data.first_page_url
        lastPageUrl.value = res.data.data.last_page_url
        nextPageUrl.value = res.data.data.next_page_url
        prevPageUrl.value = res.data.data.prev_page_url
        from.value = res.data.data.from
        to.value = res.data.data.to
        links.value = res.data.data.links
      })
      .catch((error) => {
        loading.value = false
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('store.loadError'),
          life: 3000,
        })
        console.error('Error fetching data:', error)
      })
  }

  watch(searchQuery, (newVal) => {
    currentPage.value = 1
    fetchData()
  })

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchData()
    }
  }

  const changeRowsPerPage = (rows) => {
    rowsPerPage.value = rows.value
    currentPage.value = 1
    fetchData()
  }

  onMounted(() => {
    fetchData()
  })

  const openNew = () => {
    router.push({ name: 'store-create' })
  }

  const confirmEdit = (id) => {
    router.push({ name: 'store-edit', params: { id: id } })
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card p-4 shadow-2 border-round">
        <Toolbar class="mb-4">
          <template #start>
            <h2 class="text-2xl font-bold">{{ t('store.managementTitle') }}</h2>
          </template>

          <template #end>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" :placeholder="t('store.search')" />
              </span>
              <Button
                :label="t('store.export')"
                icon="pi pi-upload"
                class="p-export"
                v-can="'list stores'"
                @click="exportStores"
              />
              <Button
                v-can="'create stores'"
                :label="t('store.new')"
                icon="pi pi-plus"
                class="p-button-success"
                @click="openNew"
              />
            </div>
          </template>
        </Toolbar>

        <Toast />

        <div class="card shadow-1 surface-0">
          <DataTable
            ref="dt"
            :value="stores"
            :loading="loading"
            data-key="id"
            :paginator="false"
            :rows="rowsPerPage"
            :filters="filters"
            :totalRecords="totalRecords"
            responsive-layout="scroll"
            stripedRows
            showGridlines
            class="p-datatable-sm"
            v-can="'list stores'"
          >
            <Column selection-mode="multiple" header-style="width: 3rem"></Column>

            <Column field="name_en" :header="t('store.nameEn')" :sortable="true">
              <template #body="slotProps">
                {{ slotProps.data.name_en }}
              </template>
            </Column>

            <Column field="name_ar" :header="t('store.nameAr')" :sortable="true">
              <template #body="slotProps">
                {{ slotProps.data.name_ar }}
              </template>
            </Column>

            <Column field="is_default" :header="t('store.isDefault')" :sortable="true">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.is_default ? t('store.yes') : t('store.no')"
                  :severity="slotProps.data.is_default ? 'success' : 'info'"
                />
              </template>
            </Column>

            <Column field="has_market" :header="t('store.hasMarket')" :sortable="true">
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.has_market ? t('store.yes') : t('store.no')"
                  :severity="slotProps.data.has_market ? 'success' : 'info'"
                />
              </template>
            </Column>

            <Column field="is_busy" :header="t('store.closeStore')" :sortable="true">
              <template #body="slotProps">
                <div class="flex justify-content-center align-items-center">
                  <InputSwitch
                    :model-value="isStoreBusy(slotProps.data.is_busy)"
                    :disabled="closeStoreLoading[slotProps.data.id]"
                    @update:model-value="(value) => toggleCloseStore(slotProps.data, value)"
                  />
                  <ProgressSpinner
                    v-if="closeStoreLoading[slotProps.data.id]"
                    style="width:20px;height:20px"
                    class="ml-2"
                    strokeWidth="5"
                  />
                </div>
              </template>
            </Column>

            <Column :header="t('actions')" headerStyle="width: 18rem">
              <template #body="slotProps">
                <Button
                  v-can="'edit stores'"
                  icon="pi pi-pencil"
                  class="p-detail"
                  @click="confirmEdit(slotProps.data.id)"
                  v-tooltip.top="t('edit')"
                />
                <Button
                  v-can="'delete stores'"
                  icon="pi pi-trash"
                  class="p-delete mx-2"
                  @click="delet(slotProps.data.id)"
                  v-tooltip.top="t('delete')"
                />
                <Button
                  v-can="'edit inventory'"
                  icon="pi pi-images"
                  class="p-detail"
                  @click="goToMediaLinks(slotProps.data.id)"
                />
                <Button
                  v-can="'edit stores'"
                  icon="pi pi-clock"
                  class="mx-1 p-detail"
                  @click="openTimeslotDialog(slotProps.data)"
                  v-tooltip.top="t('store.timeslots')"
                />
                <Button
                  icon="pi pi-truck"
                  class="mx-1 p-detail"
                  @click="goToShippingSettings(slotProps.data.id)"
                  v-tooltip.top="t('store.shippingSettings')"
                />
              </template>
            </Column>

            <template #empty>
              <div class="text-center py-4">
                <i class="pi pi-exclamation-circle text-2xl mb-2" />
                <p class="text-xl">{{ t('store.noData') }}</p>
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
              <span class="p-paginator-current"
                >{{ t('show') }} {{ from }} {{ t('to') }} {{ to }} {{ t('from') }} {{ totalRecords }}</span
              >
            </div>
            <div class="p-paginator-right-content">
              <button
                class="p-paginator-first p-paginator-element p-link"
                :disabled="currentPage === 1"
                @click="goToPage(1)"
              >
                <span class="p-paginator-icon pi pi-angle-double-left"></span>
              </button>
              <button
                class="p-paginator-prev p-paginator-element p-link"
                :disabled="!prevPageUrl"
                @click="goToPage(currentPage - 1)"
              >
                <span class="p-paginator-icon pi pi-angle-left"></span>
              </button>

              <template v-for="(link, index) in links" :key="index">
                <button
                  v-if="link.label && !isNaN(link.label)"
                  class="p-paginator-page p-paginator-element p-link"
                  :class="{ 'p-highlight': link.active }"
                  @click="goToPage(parseInt(link.label))"
                >
                  {{ link.label }}
                </button>
                <span v-else-if="link.label === '...'" class="p-paginator-dots">...</span>
              </template>

              <button
                class="p-paginator-next p-paginator-element p-link"
                :disabled="!nextPageUrl"
                @click="goToPage(currentPage + 1)"
              >
                <span class="p-paginator-icon pi pi-angle-right"></span>
              </button>
              <button
                class="p-paginator-last p-paginator-element p-link"
                :disabled="currentPage === totalPages"
                @click="goToPage(totalPages)"
              >
                <span class="p-paginator-icon pi pi-angle-double-right"></span>
              </button>

              <Dropdown
                filter
                v-model="rowsPerPage"
                :options="[5, 10, 20, 30]"
                optionLabel=""
                @change="changeRowsPerPage"
                class="ml-2"
                style="width: 80px"
              />
            </div>
          </div>
        </div>

        <Dialog
          v-model:visible="deleteStoresDialog"
          :style="{ width: '450px' }"
          :header="t('store.deleteConfirmTitle')"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
            <span>{{ t('store.deleteConfirmMessage') }}</span>
          </div>
          <template #footer>
            <Button :label="t('no')" icon="pi pi-times" class="p-button-text" @click="deleteStoresDialog = false" />
            <Button
              :variant="outline"
              :label="t('yes')"
              icon="pi pi-check"
              class="p-button-text p-button-danger"
              @click="deleteSelectedStore"
            />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="timeslotDialog"
          :style="{ width: '760px', maxWidth: '95vw' }"
          :header="`${t('store.timeslots')} - ${getStoreDisplayName(selectedTimeslotStore)}`"
          :modal="true"
        >
          <div v-if="timeslotLoading" class="flex justify-content-center align-items-center py-5">
            <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="4" />
          </div>

          <template v-else>
            <div class="timeslot-form grid align-items-end gap-4">
              <div class="col-12 md:col-4">
                <label class="block mb-2 font-medium">{{ t('store.day') }}</label>
                <Dropdown
                  v-model="timeslotForm.day"
                  :options="availableDayOptions"
                  optionLabel="label"
                  optionValue="value"
                  :placeholder="t('store.selectDay')"
                  class="w-full"
                  :disabled="!availableDayOptions.length || timeslotSaving"
                />
              </div>

              <div class="col-12 md:col-3">
                <label class="block mb-2 font-medium">{{ t('store.startTime') }}</label>
                <InputText v-model="timeslotForm.start_time" type="time" class="w-full" :disabled="timeslotSaving" />
              </div>

              <div class="col-12 md:col-3">
                <label class="block mb-2 font-medium">{{ t('store.endTime') }}</label>
                <InputText v-model="timeslotForm.end_time" type="time" class="w-full" :disabled="timeslotSaving" />
              </div>

              <div class="col-12 md:col-2">
                <Button
                  :label="t('store.addTimeslot')"
                  icon="pi pi-plus"
                  class="w-full p-button-success"
                  :loading="timeslotSaving"
                  :disabled="!isTimeslotFormValid || timeslotSaving"
                  @click="createTimeslot"
                />
              </div>
            </div>

            <p v-if="!availableDayOptions.length" class="text-sm text-color-secondary mt-2">
              {{ t('store.allDaysAdded') }}
            </p>

            <DataTable
              :value="timeslots"
              data-key="id"
              responsive-layout="scroll"
              stripedRows
              showGridlines
              class="p-datatable-sm mt-4"
            >
              <Column field="day" :header="t('store.day')">
                <template #body="slotProps">
                  {{ getDayLabel(slotProps.data.day) }}
                </template>
              </Column>

              <Column field="start_time" :header="t('store.startTime')">
                <template #body="slotProps">
                  {{ formatTimeForDisplay(slotProps.data.start_time) }}
                </template>
              </Column>

              <Column field="end_time" :header="t('store.endTime')">
                <template #body="slotProps">
                  {{ formatTimeForDisplay(slotProps.data.end_time) }}
                </template>
              </Column>

              <Column :header="t('actions')" headerStyle="width: 7rem">
                <template #body="slotProps">
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-danger"
                    :loading="deletingTimeslotId === slotProps.data.id"
                    @click="deleteTimeslot(slotProps.data)"
                    v-tooltip.top="t('delete')"
                  />
                </template>
              </Column>

              <template #empty>
                <div class="text-center py-4">
                  <p class="text-xl">{{ t('store.noTimeslots') }}</p>
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

<style scoped lang="scss">
  /* Custom styles for better table display */
  :deep(.p-datatable) {
    font-size: 0.9rem;
  }

  :deep(.p-datatable .p-datatable-thead > tr > th) {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;
  }

  :deep(.p-datatable .p-datatable-tbody > tr) {
    transition: background-color 0.2s;
  }

  :deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: var(--hoverColor);
  }

  /* Responsive adjustments */
  @media screen and (max-width: 960px) {
    :deep(.p-datatable) {
      overflow-x: auto;
      display: block;
    }
  }
</style>
