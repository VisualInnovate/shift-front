<script setup>
  import { onBeforeMount, onMounted, ref, watch } from 'vue'
  import { useToast } from 'primevue/usetoast'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { FilterMatchMode } from 'primevue/api'
  import axios from 'axios'
  import DataTable from 'primevue/datatable'
  import Column from 'primevue/column'
  import Button from 'primevue/button'
  import InputText from 'primevue/inputtext'
  import Toolbar from 'primevue/toolbar'
  import Toast from 'primevue/toast'
  import ProgressSpinner from 'primevue/progressspinner'
  import Dropdown from 'primevue/dropdown'
  import Calendar from 'primevue/calendar'

  const { t } = useI18n()
  const toast = useToast()
  const router = useRouter()

  const loading = ref(true)
  const users = ref([])
  const filters = ref({})
  const searchQuery = ref('')
  const start_date = ref(null)
  const end_date = ref(null)
  const exportLoading = ref(false)

  const currentPage = ref(1)
  const totalRecords = ref(0)
  const rowsPerPage = ref(10)
  const totalPages = ref(0)
  const from = ref(0)
  const to = ref(0)
  const links = ref([])

  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
  }

  const formatDateParam = (date) => {
    if (!date) return undefined
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const fetchData = async () => {
    loading.value = true

    try {
      const response = await axios.get('/api/user/with-carts', {
        params: {
          page: currentPage.value,
          limit: rowsPerPage.value,
          search: searchQuery.value || undefined,
          start_date: start_date.value ? formatDateParam(start_date.value) : undefined,
          end_date: end_date.value ? formatDateParam(end_date.value) : undefined,
        },
      })
      const paginator = response.data?.data || {}

      users.value = paginator.data || []
      totalRecords.value = paginator.total || 0
      totalPages.value = paginator.last_page || 0
      from.value = paginator.from || 0
      to.value = paginator.to || 0
      links.value = paginator.links || []
    } catch (error) {
      users.value = []
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('cart.cartLoadError'),
        life: 3000,
      })
      console.error('Error fetching users with carts:', error)
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      fetchData()
    }
  }

  const changeRowsPerPage = (event) => {
    rowsPerPage.value = event.value || event.target?.value
    currentPage.value = 1
    fetchData()
  }

  const viewClientCart = (id) => {
    router.push({ name: 'client-cart-show', params: { id } })
  }

  const exportUsersWithCarts = async () => {
    exportLoading.value = true
    try {
      const response = await axios.get('/api/export/users-with-carts', {
        params: {
          search: searchQuery.value || undefined,
          start_date: start_date.value ? formatDateParam(start_date.value) : undefined,
          end_date: end_date.value ? formatDateParam(end_date.value) : undefined,
        },
        responseType: 'blob',
      })

      const contentDisposition = response.headers['content-disposition']
      let filename = `users_with_carts_export_${new Date().toISOString().slice(0, 10)}.xlsx`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";]+)"?/)
        if (match && match[1]) filename = match[1]
      }

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('user.exportSuccess') || 'Export downloaded successfully',
        life: 3000,
      })
    } catch (error) {
      console.error('Error exporting users with carts:', error)
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('cart.exportError') || t('user.exportError') || 'Failed to export data',
        life: 3000,
      })
    } finally {
      exportLoading.value = false
    }
  }

  watch([searchQuery, start_date, end_date], () => {
    currentPage.value = 1
    fetchData()
  })

  onBeforeMount(initFilters)
  onMounted(fetchData)
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card p-4 shadow-2 border-round">
        <Toolbar class="mb-4">
          <template #start>
            <h2 class="text-2xl font-bold">{{ t('navigation.clientCart') }}</h2>
          </template>

          <template #end>
            <div class="flex flex-wrap gap-2 align-items-center justify-content-end">
              <Calendar
                v-model="start_date"
                :placeholder="t('cart.filterStartDate')"
                dateFormat="yy-mm-dd"
                showClear
                class="p-inputtext-sm"
                style="width: 170px"
              />
              <Calendar
                v-model="end_date"
                :placeholder="t('cart.filterEndDate')"
                dateFormat="yy-mm-dd"
                showClear
                class="p-inputtext-sm"
                style="width: 170px"
              />
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" :placeholder="t('user.search')" />
              </span>
              <Button
                :label="t('cart.export')"
                icon="pi pi-upload"
                class="p-export"
                :loading="exportLoading"
                v-can="'export users'"
                @click="exportUsersWithCarts"
              />
            </div>
          </template>
        </Toolbar>

        <Toast />

        <div class="card shadow-1 surface-0">
          <DataTable
            :value="users"
            :loading="loading"
            data-key="id"
            :paginator="false"
            :rows="rowsPerPage"
            :filters="filters"
            :total-records="totalRecords"
            responsive-layout="scroll"
            stripedRows
            showGridlines
            class="p-datatable-sm client-cart-table"
            v-can="'list orders'"
          >
            <Column field="id" :header="t('order.id')" :sortable="true">
              <template #body="slotProps">#{{ slotProps.data.id }}</template>
            </Column>

            <Column field="name" :header="t('user.name')" :sortable="true">
              <template #body="slotProps">{{ slotProps.data.name || '-' }}</template>
            </Column>

            <Column field="last_cart_updated_at" :header="t('user.last_cart_updated_at')" :sortable="true">
              <template #body="slotProps">{{ slotProps.data.last_cart_updated_at || '-' }}</template>
            </Column>

            <Column field="phone" :header="t('user.phone')" :sortable="true">
              <template #body="slotProps">{{ slotProps.data.phone || '-' }}</template>
            </Column>

            <Column :header="t('actions')" header-style="min-width: 8rem">
              <template #body="slotProps">
                <Button
                  v-can="'show orders'"
                  icon="pi pi-eye"
                  class="p-detail"
                  v-tooltip.top="t('order.view')"
                  @click="viewClientCart(slotProps.data.id)"
                />
              </template>
            </Column>

            <template #empty>
              <div class="text-center py-4">
                <i class="pi pi-exclamation-circle text-2xl mb-2" />
                <p class="text-xl">{{ t('cart.emptyCart') }}</p>
              </div>
            </template>

            <template #loading>
              <div class="flex justify-content-center align-items-center py-4">
                <ProgressSpinner style="width: 50px; height: 50px" stroke-width="4" />
              </div>
            </template>
          </DataTable>

          <div class="p-paginator p-component p-unselectable-text p-paginator-bottom">
            <div class="p-paginator-left-content">
              <span class="p-paginator-current">
                {{ t('show') }} {{ from }} {{ t('to') }} {{ to }} {{ t('from') }} {{ totalRecords }}
              </span>
            </div>
            <div class="p-paginator-right-content flex align-items-center gap-3">
              <button
                class="p-paginator-first p-paginator-element p-link"
                :disabled="currentPage === 1"
                @click="goToPage(1)"
              >
                <span class="p-paginator-icon pi pi-angle-double-left" />
              </button>
              <button
                class="p-paginator-prev p-paginator-element p-link"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                <span class="p-paginator-icon pi pi-angle-left" />
              </button>

              <template v-for="(link, index) in links" :key="index">
                <button
                  v-if="link.label && !isNaN(parseInt(link.label))"
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
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
              >
                <span class="p-paginator-icon pi pi-angle-right" />
              </button>
              <button
                class="p-paginator-last p-paginator-element p-link"
                :disabled="currentPage === totalPages"
                @click="goToPage(totalPages)"
              >
                <span class="p-paginator-icon pi pi-angle-double-right" />
              </button>

              <Dropdown
                v-model="rowsPerPage"
                :options="[5, 10, 20, 30, 50]"
                class="ml-3"
                style="width: 80px"
                @change="changeRowsPerPage"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.client-cart-table :deep(.p-datatable-tbody > tr) {
  height: 56px;
}

.client-cart-table :deep(.p-datatable-tbody > tr > td) {
  vertical-align: middle;
  font-size: 1.05rem;
}

.client-cart-table :deep(.p-datatable-thead > tr > th) {
  font-size: 1.05rem;
}
</style>
