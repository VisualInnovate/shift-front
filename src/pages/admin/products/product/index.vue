<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import Column from 'primevue/column'
import Toolbar from 'primevue/toolbar'
import Toast from 'primevue/toast'
import FileUpload from 'primevue/fileupload'
import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import InputSwitch from 'primevue/inputswitch'
import Menu from 'primevue/menu'

const router = useRouter()
const toast = useToast()
const { t } = useI18n()

// State variables
const loading = ref(true)
const products = ref([])
const deleteDialog = ref(false)
const deleteId = ref(null)
const searchQuery = ref('')
const importDialog = ref(false)
const importDialog2 = ref(false)
const selectedFile = ref(null)
const importLoading = ref(false)
const categories = ref([])
const stores = ref([])
const markets = ref([])
const selectedCategory = ref(null)
const selectedStore = ref(null)
const selectedMarket = ref(null)
const categorySearchQuery = ref('')
const marketSearchQuery = ref('')
const appLanguage = ref(localStorage.getItem('appLang') || 'en')

// Price Update
const priceUpdateDialog = ref(false)
const selectedPriceFile = ref(null)
const priceUpdateLoading = ref(false)

// Filter Dialog
const filterDialog = ref(false)

// Toggle Loading States
const toggleLoading = ref({})
const toggleBestSellerLoading = ref({})

// Pagination
const currentPage = ref(1)
const totalRecords = ref(0)
const rowsPerPage = ref(10)
const totalPages = ref(0)
const from = ref(0)
const to = ref(0)
const links = ref([])

// Menu refs
const importMenu = ref(null)
const exportMenu = ref(null)

// Import Menu Items
const importItems = ref([
  { label: t('importProducts'), icon: 'pi pi-download', command: () => { importDialog.value = true } },
  { label: t('product.import_product_characteristics'), icon: 'pi pi-table', command: () => { importDialog2.value = true } },
  { label: t('updatePrice'), icon: 'pi pi-dollar', command: () => { priceUpdateDialog.value = true } }
])

// Export Menu Items
const exportItems = ref([
  { label: t('exportProducts'), icon: 'pi pi-upload', command: () => { exportCSV() } },
  { label: t('product.export_prices_features'), icon: 'pi pi-file-export', command: () => { export_prices_featuresCSV() } }
])

// Fetch functions
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/category', {
      params: { search: categorySearchQuery.value || undefined }
    })
    const lang = appLanguage.value
    categories.value = response.data.data.data.map(category => ({
      label: lang === 'en' ? category.name_en : category.name_ar,
      value: category.id
    }))
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('category.loadError'), life: 3000 })
  }
}

const fetchStores = async () => {
  try {
    const response = await axios.get('/api/store')
    const lang = appLanguage.value
    stores.value = response.data.data.data.map(store => ({
      label: lang === 'en' ? store.name_en : store.name_ar,
      value: store.id
    }))
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('store.loadError'), life: 3000 })
  }
}

const fetchMarkets = async () => {
  try {
    const response = await axios.get('/api/market', {
      params: { search: marketSearchQuery.value || undefined }
    })
    const lang = appLanguage.value
    markets.value = response.data.data.data.map(market => ({
      label: lang === 'en' ? market.name_en : market.name_ar,
      value: market.id
    }))
  } catch (error) {
    toast.add({ severity: 'error', summary: t('error'), detail: t('market.loadError'), life: 3000 })
  }
}

const fetchData = () => {
  loading.value = true
  axios.get('/api/product', {
    params: {
      page: currentPage.value,
      limit: rowsPerPage.value,
      search: searchQuery.value || undefined,
      category_id: selectedCategory.value || undefined,
      store_id: selectedStore.value || undefined,
      market_id: selectedMarket.value || undefined
    }
  })
    .then((response) => {
      products.value = response.data.data.data
      totalRecords.value = response.data.data.total
      totalPages.value = response.data.data.last_page
      from.value = response.data.data.from
      to.value = response.data.data.to
      links.value = response.data.data.links
      loading.value = false
    })
    .catch((error) => {
      toast.add({ severity: 'error', summary: t('error'), detail: t('product.loadError'), life: 3000 })
      loading.value = false
      console.error('Error fetching products:', error)
    })
}

// Watchers
watch([searchQuery, rowsPerPage, selectedCategory, selectedStore, selectedMarket], () => {
  currentPage.value = 1
  fetchData()
}, { deep: true })

watch(appLanguage, () => {
  fetchCategories()
  fetchStores()
  fetchMarkets()
  // Update menu labels
  importItems.value = [
    { label: t('importProducts'), icon: 'pi pi-download', command: () => { importDialog.value = true } },
    { label: t('product.import_product_characteristics'), icon: 'pi pi-table', command: () => { importDialog2.value = true } },
    { label: t('updatePrice'), icon: 'pi pi-dollar', command: () => { priceUpdateDialog.value = true } }
  ]
  exportItems.value = [
    { label: t('product.exportProducts'), icon: 'pi pi-upload', command: () => { exportCSV() } },
    { label: t('product.export_prices_features'), icon: 'pi pi-file-export', command: () => { export_prices_featuresCSV() } }
  ]
})

// Filter events
const onCategoryFilter = (event) => {
  categorySearchQuery.value = event.filter
  fetchCategories()
}

const onMarketFilter = (event) => {
  marketSearchQuery.value = event.filter
  fetchMarkets()
}

const clearFilters = () => {
  selectedCategory.value = null
  selectedStore.value = null
  selectedMarket.value = null
  currentPage.value = 1
  fetchData()
}

// Pagination
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchData()
  }
}

const changeRowsPerPage = (event) => {
  rowsPerPage.value = event.value
  currentPage.value = 1
  fetchData()
}

// Delete
const confirmDelete = (id) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteProduct = () => {
  axios.delete(`/api/product/${deleteId.value}`)
    .then(() => {
      toast.add({ severity: 'success', summary: t('success'), detail: t('product.deleteSuccess'), life: 3000 })
      fetchData()
      deleteDialog.value = false
    })
    .catch(() => {
      toast.add({ severity: 'error', summary: t('error'), detail: t('product.deleteError'), life: 3000 })
    })
}

// Export
const exportCSV = () => {
  const params = new URLSearchParams({
    search: searchQuery.value || '',
    category_id: selectedCategory.value || '',
    store_id: selectedStore.value || '',
    market_id: selectedMarket.value || ''
  })
  const url = `/api/export/products?${params.toString()}`
  axios.get(url, { responseType: 'blob' })
    .then((response) => {
      const blob = new Blob([response.data], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'products_export.csv'
      link.click()
      toast.add({ severity: 'success', summary: t('success'), detail: t('product.exportSuccess'), life: 3000 })
    })
    .catch(() => {
      toast.add({ severity: 'error', summary: t('error'), detail: t('product.exportError'), life: 3000 })
    })
}

const export_prices_featuresCSV = () => {
  const params = new URLSearchParams({
    search: searchQuery.value || '',
    category_id: selectedCategory.value || '',
    store_id: selectedStore.value || '',
    market_id: selectedMarket.value || ''
  })
  const url = `/api/export/variants?${params.toString()}`
  axios.get(url, { responseType: 'blob' })
    .then((response) => {
      const blob = new Blob([response.data], { type: 'text/csv' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'products_variants_export.csv'
      link.click()
      toast.add({ severity: 'success', summary: t('success'), detail: t('product.exportSuccess'), life: 3000 })
    })
    .catch(() => {
      toast.add({ severity: 'error', summary: t('error'), detail: t('product.exportError'), life: 3000 })
    })
}

// Download examples
const downloadExample = () => {
  const csvContent = 'store_id,category_id,market_id,name_en,name_ar,sku,brand_id,sub_name_en,sub_name_ar,description_en,description_ar,base_price,cost_price,tax\n1,1,1,Demo Product,منتج تجريبي,SKU001,1,Sub Demo,تجريبي فرعي,Description,وصف,15.50,10.00,0.05'
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'product_import_example.csv'
  link.click()
}

const downloadExample2 = () => {
  const data = [
    { product_id: 84, variant_id: 9, price: 2 },
    { product_id: 1650, variant_id: 10, price: 0 },
    { product_id: 22516, variant_id: 11, price: 0.03 },
    { product_id: 22516, variant_id: 12, price: 0.33 },
    { product_id: 37864, variant_id: 19, price: 10 },
    { product_id: 37864, variant_id: 20, price: 9 },
    { product_id: 37864, variant_id: 21, price: 10 },
    { product_id: 37864, variant_id: 22, price: 9 },
    { product_id: 55, variant_id: 25, price: 0.77 }
  ]
  const headers = ['product_id', 'variant_id', 'price']
  const csvContent = [headers.join(','), ...data.map(row => `${row.product_id},${row.variant_id},${row.price}`)].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'products_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadPriceExample = () => {
  const csvContent = 'id,price,cost_price\n1,16.00,10.50\n2,23.50,15.00'
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'product_price_update_example.csv'
  link.click()
}

// File handling
const onFileSelect = (event) => { selectedFile.value = event.files[0] }
const onPriceFileSelect = (event) => { selectedPriceFile.value = event.files[0] }

// Imports
const importProducts = () => {
  if (!selectedFile.value) return toast.add({ severity: 'error', detail: t('validation.fileRequired'), life: 3000 })
  importLoading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  axios.post('/api/import/products', formData)
    .then(() => {
      toast.add({ severity: 'success', detail: t('product.importSuccess'), life: 3000 })
      fetchData()
      importDialog.value = false
      selectedFile.value = null
    })
    .catch(() => toast.add({ severity: 'error', detail: t('product.importError'), life: 3000 }))
    .finally(() => importLoading.value = false)
}

const importProductsCharacteristics = () => {
  if (!selectedFile.value) return toast.add({ severity: 'error', detail: t('validation.fileRequired'), life: 3000 })
  importLoading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  axios.post('/api/product/update/variants/prices', formData)
    .then(() => {
      toast.add({ severity: 'success', detail: t('product.importSuccess'), life: 3000 })
      fetchData()
      importDialog2.value = false
      selectedFile.value = null
    })
    .catch(() => toast.add({ severity: 'error', detail: t('product.importError'), life: 3000 }))
    .finally(() => importLoading.value = false)
}

const updatePrices = () => {
  if (!selectedPriceFile.value) return toast.add({ severity: 'error', detail: t('validation.fileRequired'), life: 3000 })
  priceUpdateLoading.value = true
  const formData = new FormData()
  formData.append('file', selectedPriceFile.value)
  axios.post('/api/product/update/prices', formData)
    .then(() => {
      toast.add({ severity: 'success', detail: t('product.priceUpdateSuccess'), life: 3000 })
      fetchData()
      priceUpdateDialog.value = false
      selectedPriceFile.value = null
    })
    .catch(() => toast.add({ severity: 'error', detail: t('product.priceUpdateError'), life: 3000 }))
    .finally(() => priceUpdateLoading.value = false)
}

// Toggles
const toggleFreeShipping = async (product) => {
  const productId = product.id
  const currentValue = product.is_free_shipping
  const newValue = currentValue === 1 ? 0 : 1
  toggleLoading.value[productId] = true
  try {
    await axios.post(`/api/product/is/free/shipping/${productId}`, { is_free_shipping: newValue })
    product.is_free_shipping = newValue
    toast.add({ severity: 'success', detail: newValue === 1 ? t('product.freeShippingEnabled') : t('product.freeShippingDisabled'), life: 3000 })
  } catch (error) {
    product.is_free_shipping = currentValue
    toast.add({ severity: 'error', detail: t('product.freeShippingUpdateError'), life: 3000 })
  } finally {
    toggleLoading.value[productId] = false
  }
}

const toggleBestSeller = async (product) => {
  const productId = product.id
  const currentValue = product.is_best_seller ? 1 : 0
  const newValue = currentValue === 1 ? 0 : 1
  toggleBestSellerLoading.value[productId] = true
  try {
    await axios.get(`/api/product/update/best-sellers/${productId}`)
    product.is_best_seller = newValue === 1
    toast.add({ severity: 'success', detail: newValue === 1 ? 'Product marked as Best Seller' : 'Product removed from Best Sellers', life: 3000 })
  } catch (error) {
    product.is_best_seller = currentValue === 1
    toast.add({ severity: 'error', detail: 'Failed to update Best Seller status', life: 3000 })
  } finally {
    toggleBestSellerLoading.value[productId] = false
  }
}

// Navigation
const createNewProduct = () => router.push({ name: 'product-create' })
const editProduct = (id) => router.push({ name: 'product-update', params: { id } })

onMounted(() => {
  Promise.all([fetchCategories(), fetchStores(), fetchMarkets(), fetchData()])
})
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card p-4 shadow-2 border-round">
        <Toolbar class="mb-4">
          <template #start>
            <h2 class="text-2xl font-bold">{{ t('product.managementTitle') }}</h2>
            <span class="p-input-icon-left mx-4">
              <i class="pi pi-search" />
              <InputText v-model="searchQuery" :placeholder="t('product.search')" />
            </span>
          </template>
          <template #end>
            <div class="flex flex-wrap gap-3 align-items-center">
              <Button :label="t('filters')" icon="pi pi-filter" class="p-button-outlined" @click="filterDialog = true" />

              <Button :label="t('product.import')" icon="pi pi-download" class="p-button-outlined" @click="(e) => importMenu.toggle(e)" />
              <Menu ref="importMenu" :model="importItems" :popup="true" />

              <Button :label="t('product.export')" icon="pi pi-upload" class="p-button-outlined" @click="(e) => exportMenu.toggle(e)" />
              <Menu ref="exportMenu" :model="exportItems" :popup="true" />

              <Button v-can="'create products'" :label="t('product.new')" icon="pi pi-plus" class="p-button-success" @click="createNewProduct" />
            </div>
          </template>
        </Toolbar>

        <Toast />

        <div class="card shadow-1 surface-0">
          <DataTable :value="products" :loading="loading" data-key="id" responsive-layout="scroll" stripedRows showGridlines class="p-datatable-sm">
            <Column field="id" :header="t('id')" :sortable="true" header-style="width:6%">
              <template #body="slotProps">{{ slotProps.data.id }}</template>
            </Column>
            <Column field="name_ar" :header="t('product.nameAr')" :sortable="true">
              <template #body="slotProps">{{ slotProps.data.name_ar }}</template>
            </Column>
            <Column field="name_en" :header="t('product.nameEn')" :sortable="true">
              <template #body="slotProps">{{ slotProps.data.name_en }}</template>
            </Column>
            <Column field="base_price" :header="t('product.basePrice')">
              <template #body="slotProps">{{ slotProps.data.base_price }}</template>
            </Column>
            <Column :header="t('product.Price after discount')">
              <template #body="slotProps">
                {{ slotProps.data.base_price - slotProps.data.total_discounts_value }}
              </template>
            </Column>
            <Column field="is_displayed" :header="t('product.isDisplayed')">
              <template #body="slotProps">
                <Tag :value="slotProps.data.is_displayed ? t('yes') : t('no')"
                  :severity="slotProps.data.is_displayed ? 'success' : 'info'" />
              </template>
            </Column>
            <Column :header="t('product.freeShipping')">
              <template #body="slotProps">
                <div class="flex justify-content-center align-items-center">
                  <InputSwitch :model-value="slotProps.data.is_free_shipping === 1"
                    :disabled="toggleLoading[slotProps.data.id]"
                    @update:model-value="toggleFreeShipping(slotProps.data)"
                    v-tooltip.top="slotProps.data.is_free_shipping === 1 ? t('product.freeShipping') : t('product.notFreeShipping')" />
                  <ProgressSpinner v-if="toggleLoading[slotProps.data.id]" style="width:20px;height:20px" class="ml-2" strokeWidth="5" />
                </div>
              </template>
            </Column>
            <Column :header="t('product.bestSeller')">
              <template #body="slotProps">
                <div class="flex justify-content-center align-items-center">
                  <InputSwitch :model-value="slotProps.data.is_best_seller"
                    :disabled="toggleBestSellerLoading[slotProps.data.id]"
                    @update:model-value="toggleBestSeller(slotProps.data)"
                    v-tooltip.top="slotProps.data.is_best_seller ? 'Best Seller' : 'Not Best Seller'" />
                  <ProgressSpinner v-if="toggleBestSellerLoading[slotProps.data.id]" style="width:20px;height:20px" class="ml-2" strokeWidth="5" />
                </div>
              </template>
            </Column>
            <Column :header="t('actions')">
              <template #body="slotProps">
                <Button v-can="'edit products'" icon="pi pi-pencil" class="p-detail" @click="editProduct(slotProps.data.id)" v-tooltip.top="t('edit')" />
                <Button v-can="'delete products'" icon="pi pi-trash" class="p-delete mx-2" @click="confirmDelete(slotProps.data.id)" v-tooltip.top="t('delete')" />
              </template>
            </Column>

            <template #empty>
              <div class="text-center py-4">
                <p class="text-xl">{{ t('product.noData') }}</p>
              </div>
            </template>
          </DataTable>

          <!-- Pagination -->
          <div class="flex flex-column md:flex-row justify-content-between align-items-center mt-4">
            <span class="text-sm text-500">{{ t('show') }} {{ from }} {{ t('to') }} {{ to }} {{ t('from') }} {{ totalRecords }}</span>
            <div class="flex align-items-center gap-2 mt-3 md:mt-0">
              <Button icon="pi pi-angle-double-left" :disabled="currentPage === 1" @click="goToPage(1)" class="p-button-text" />
              <Button icon="pi pi-angle-left" :disabled="!links.prev" @click="goToPage(currentPage - 1)" class="p-button-text" />
              <span class="mx-3 text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
              <Button icon="pi pi-angle-right" :disabled="!links.next" @click="goToPage(currentPage + 1)" class="p-button-text" />
              <Button icon="pi pi-angle-double-right" :disabled="currentPage === totalPages" @click="goToPage(totalPages)" class="p-button-text" />
              <Dropdown v-model="rowsPerPage" :options="[5, 10, 20, 30]" @change="changeRowsPerPage" class="ml-3" style="width: 80px" />
            </div>
          </div>
        </div>

        <!-- Filter Dialog -->
        <Dialog v-model:visible="filterDialog" :header="t('filters')" :modal="true" :style="{ width: '90vw', maxWidth: '500px' }">
          <div class=" space-y-4">
            <div>
              <label class="block text-900 font-medium mb-2">{{ t('product.categoryFilter') }}</label>
              <Dropdown v-model="selectedCategory" :options="categories" optionLabel="label" optionValue="value"
                :placeholder="t('product.categoryFilter')" showClear filter @filter="onCategoryFilter" class="w-full" />
            </div>
            <div>
              <label class="block text-900 font-medium mb-2">{{ t('product.storeFilter') }}</label>
              <Dropdown v-model="selectedStore" :options="stores" optionLabel="label" optionValue="value"
                :placeholder="t('product.storeFilter')" showClear class="w-full" />
            </div>
            <div>
              <label class="block text-900 font-medium mb-2">{{ t('product.marketFilter') }}</label>
              <Dropdown v-model="selectedMarket" :options="markets" optionLabel="label" optionValue="value"
                :placeholder="t('product.marketFilter')" showClear filter @filter="onMarketFilter" class="w-full" />
            </div>
          </div>
          <template #footer>
            <Button :label="t('clearFilters')" icon="pi pi-refresh" class="p-button-text p-button-secondary" @click="clearFilters(); filterDialog = false" />
            <Button :label="t('apply')" icon="pi pi-check" @click="filterDialog = false; currentPage = 1; fetchData()" />
          </template>
        </Dialog>

        <!-- Delete Dialog -->
        <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" :header="t('product.deleteConfirmTitle')" :modal="true">
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
            <span>{{ t('product.deleteConfirmMessage') }}</span>
          </div>
          <template #footer>
            <Button :label="t('no')" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
            <Button :label="t('yes')" icon="pi pi-check" class="p-button-danger" @click="deleteProduct" />
          </template>
        </Dialog>

        <!-- Import Dialogs -->
        <Dialog v-model:visible="importDialog" :style="{ width: '450px' }" :header="t('product.importTitle')" :modal="true">
          <div class="flex flex-column gap-3">
            <Button :label="t('product.downloadExample')" icon="pi pi-download" class="p-button-outlined" @click="downloadExample" />
            <FileUpload mode="basic" :custom-upload="true" @select="onFileSelect" :maxFileSize="10000000" chooseLabel="Select File" />
            <div v-if="selectedFile" class="mt-2">
              <p class="font-semibold">{{ t('selectedFile') }}: {{ selectedFile.name }}</p>
            </div>
          </div>
          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="importDialog = false; selectedFile = null" />
            <Button :label="t('product.importButton')" icon="pi pi-check" :loading="importLoading" :disabled="!selectedFile" @click="importProducts" />
          </template>
        </Dialog>

        <Dialog v-model:visible="importDialog2" :style="{ width: '450px' }" :header="t('product.import_product_characteristics')" :modal="true">
          <div class="flex flex-column gap-3">
            <Button :label="t('product.downloadExample')" icon="pi pi-download" class="p-button-outlined" @click="downloadExample2" />
            <FileUpload mode="basic" :custom-upload="true" @select="onFileSelect" :maxFileSize="10000000" chooseLabel="Select File" />
            <div v-if="selectedFile" class="mt-2">
              <p class="font-semibold">{{ t('selectedFile') }}: {{ selectedFile.name }}</p>
            </div>
          </div>
          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="importDialog2 = false; selectedFile = null" />
            <Button :label="t('product.importButton')" icon="pi pi-check" :loading="importLoading" :disabled="!selectedFile" @click="importProductsCharacteristics" />
          </template>
        </Dialog>

        <!-- Price Update Dialog -->
        <Dialog v-model:visible="priceUpdateDialog" :style="{ width: '450px' }" :header="t('product.updatePriceTitle')" :modal="true">
          <div class="flex flex-column gap-3">
            <Button :label="t('product.downloadPriceExample')" icon="pi pi-download" class="p-button-outlined" @click="downloadPriceExample" />
            <FileUpload mode="basic" :custom-upload="true" @select="onPriceFileSelect" :maxFileSize="10000000" chooseLabel="Select Price File" />
          </div>
          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="priceUpdateDialog = false; selectedPriceFile = null" />
            <Button :label="t('product.updatePriceButton')" icon="pi pi-check" :loading="priceUpdateLoading" :disabled="!selectedPriceFile" @click="updatePrices" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable) {
  font-size: 0.9rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover);
}
</style>
