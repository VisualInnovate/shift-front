<script setup>
import { ref, onMounted, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
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

const toast = useToast()
const { t } = useI18n()

// State variables
const loading = ref(true)
const files = ref([])
const deleteDialog = ref(false)
const deleteId = ref(null)
const searchQuery = ref('')
const importDialog = ref(false)
const selectedFile = ref(null)
const importLoading = ref(false)

// Pagination variables
const currentPage = ref(1)
const totalRecords = ref(0)
const rowsPerPage = ref(10)
const totalPages = ref(0)
const links = ref([])
const from = ref(0)
const to = ref(0)

// Fetch files data
const fetchData = () => {
  loading.value = true
  axios.get('/api/shiftmartfile', {
    params: {
      page: currentPage.value,
      limit: rowsPerPage.value,
      search: searchQuery.value || undefined
    }
  })
    .then((response) => {
      const resData = response.data.data
      files.value = resData.data
      totalRecords.value = resData.total
      totalPages.value = resData.last_page
      links.value = resData.links
      from.value = resData.from
      to.value = resData.to
      loading.value = false
    })
    .catch((error) => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('shiftmart.loadError'),
        life: 3000
      })
      loading.value = false
    })
}

// Watchers for search and rows change
watch([searchQuery, rowsPerPage], () => {
  currentPage.value = 1
  fetchData()
})

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

// Delete Logic
const confirmDelete = (id) => {
  deleteId.value = id
  deleteDialog.value = true
}

const deleteFile = () => {
  axios.delete(`/api/shiftmartfile/${deleteId.value}`)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('shiftmart.deleteSuccess'),
        life: 3000
      })
      fetchData()
      deleteDialog.value = false
    })
    .catch(() => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('shiftmart.deleteError'),
        life: 3000
      })
    })
}

// Download Logic
const downloadFile = (id) => {
  const url = `/api/shiftmartfile/${id}`
  window.open(url, '_blank')
}

// Upload Logic
const openImportDialog = () => {
  importDialog.value = true
  selectedFile.value = null
}

const onFileSelect = (event) => {
  selectedFile.value = event.files[0]
}

const uploadFile = () => {
  if (!selectedFile.value) return

  importLoading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  axios.post('/api/shiftmartfile', formData)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: t('shiftmart.uploadSuccess'),
        life: 3000
      })
      fetchData()
      importDialog.value = false
    })
    .catch(() => {
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: t('shiftmart.uploadError'),
        life: 3000
      })
    })
    .finally(() => {
      importLoading.value = false
    })
}

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
            <h2 class="text-2xl font-bold">{{ t('shiftmart.title') }}</h2>
          </template>
          <template #end>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" :placeholder="t('market.search')" />
              </span>

            </div>
          </template>
        </Toolbar>

        <Toast />

        <div class="card shadow-1 surface-0">
          <DataTable
            :value="files"
            :loading="loading"
            data-key="id"
            responsive-layout="scroll"
            stripedRows
            showGridlines
            class="p-datatable-sm"
          >
            <Column field="id" :header="t('shiftmart.id')" :sortable="true" style="width: 15%"></Column>

            <Column field="created_at" :header="t('shiftmart.createdAt')" :sortable="true">
              <template #body="slotProps">
                {{ new Date(slotProps.data.created_at).toLocaleString() }}
              </template>
            </Column>

            <Column :header="t('actions')" style="width: 15rem">
              <template #body="slotProps">
                <Button
                  icon="pi pi-download"
                  class="p-button-rounded p-button-info mr-2"
                  v-tooltip.top="t('shiftmart.download')"
                  @click="downloadFile(slotProps.data.id)"
                />
                <Button
                  icon="pi pi-trash"
                  class="p-button-rounded p-button-danger"
                  v-tooltip.top="t('shiftmart.delete')"
                  @click="confirmDelete(slotProps.data.id)"
                />
              </template>
            </Column>

            <template #empty>
              <div class="text-center py-4">{{ t('shiftmart.noFiles') }}</div>
            </template>
            <template #loading>
              <div class="flex justify-content-center py-4">
                <ProgressSpinner style="width: 50px; height: 50px" />
              </div>
            </template>
          </DataTable>

          <div class="p-paginator p-component p-paginator-bottom">
            <div class="p-paginator-left-content">
              <span class="p-paginator-current">
                {{ t('showing') }} {{ from }} {{ t('to') }} {{ to }} {{ t('from') }} {{ totalRecords }}
              </span>
            </div>
            <div class="p-paginator-right-content">
              <button class="p-paginator-element p-link" :disabled="currentPage === 1" @click="goToPage(1)">
                <span class="pi pi-angle-double-left"></span>
              </button>
              <button class="p-paginator-element p-link" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                <span class="pi pi-angle-left"></span>
              </button>

              <template v-for="(link, index) in links" :key="index">
                <button
                  v-if="!isNaN(link.label)"
                  class="p-paginator-element p-link"
                  :class="{'p-highlight': link.active}"
                  @click="goToPage(parseInt(link.label))"
                >
                  {{ link.label }}
                </button>
              </template>

              <button class="p-paginator-element p-link" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                <span class="pi pi-angle-right"></span>
              </button>
              <Dropdown v-model="rowsPerPage" :options="[10, 20, 50]" @change="changeRowsPerPage" class="ml-2" />
            </div>
          </div>
        </div>

        <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" :header="t('shiftmart.deleteConfirmTitle')" :modal="true">
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: red" />
            <span>{{ t('shiftmart.deleteConfirmMessage') }}</span>
          </div>
          <template #footer>
            <Button :label="t('no')" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
            <Button :label="t('yes')" icon="pi pi-check" class="p-button-text p-button-danger" @click="deleteFile" />
          </template>
        </Dialog>

        <Dialog v-model:visible="importDialog" :style="{ width: '500px' }" :header="t('shiftmart.uploadFile')" :modal="true">
          <FileUpload
            mode="basic"
            name="file"
            :auto="false"
            @select="onFileSelect"
            :disabled="importLoading"
            class="w-full"
            :chooseLabel="t('shiftmart.chooseFile')"
          />
          <div v-if="selectedFile" class="mt-3 font-bold">
             {{ selectedFile.name }}
          </div>
          <template #footer>
            <Button :label="t('cancel')" icon="pi pi-times" class="p-button-text" @click="importDialog = false" />
            <Button :label="t('shiftmart.uploadFile')" icon="pi pi-check" class="p-button-success" @click="uploadFile" :loading="importLoading" :disabled="!selectedFile" />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-paginator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
}
.p-paginator-element {
  cursor: pointer;
  margin: 0 0.25rem;
  padding: 0.5rem;
  min-width: 2rem;
  text-align: center;
}
.p-highlight {
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
}
</style>
