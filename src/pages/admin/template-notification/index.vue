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
  import MultiSelect from 'primevue/multiselect'

  const toast = useToast()
  const { t } = useI18n()

  // State variables
  const loading = ref(true)
  const notifications = ref([])
  const dt = ref(null)
  const filters = ref({})
  const searchQuery = ref('')
  const selectedNotifications = ref(null)

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

  // Update modal variables
  const updateDialog = ref(false)
  const showDialog = ref(false)
  const createDialog = ref(false)
  const confirmDeleteDialog = ref(false)
  const deleteLoading = ref(false)
  const updateId = ref(null)
  const deleteId = ref(null)
  const updateForm = ref({
    name: '',
    title: '',
    body: '',
  })
  const DataForm = ref({
    id: null,
    name: '',
    title: '',
    body: '',
  })
  const updateLoading = ref(false)
  const createLoading = ref(false)

  // Send notification modal variables
  const sendNotificationDialog = ref(false)
  const sendForm = ref({
    all: 1,
    title: '',
    body: '',
    ids: [],
  })
  const sendLoading = ref(false)
  const allUsers = ref([])
  const selectedUsers = ref([])
  const usersLoading = ref(false)
  const sendMode = ref('custom') // 'template' | 'custom'
  const selectedTemplate = ref(null)

  // Fetch data
  const fetchData = () => {
    loading.value = true
    axios
      .get('/api/template-notification', {
        params: {
          page: currentPage.value,
          limit: rowsPerPage.value,
          search: searchQuery.value || undefined,
        },
      })
      .then((response) => {
        notifications.value = response.data.data.data
        totalRecords.value = response.data.data.total
        totalPages.value = response.data.data.last_page
        firstPageUrl.value = response.data.data.first_page_url
        lastPageUrl.value = response.data.data.last_page_url
        nextPageUrl.value = response.data.data.next_page_url
        prevPageUrl.value = response.data.data.prev_page_url
        from.value = response.data.data.from
        to.value = response.data.data.to
        links.value = response.data.data.links
        loading.value = false
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('templateNotification.loadError'),
          life: 3000,
        })
        loading.value = false
        console.error('Error fetching template notifications:', error)
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

  // Export CSV
  const exportCSV = () => {
    dt.value.exportCSV()
  }

  // Update functions
  const openUpdateModal = (notification) => {
    updateId.value = notification.id
    updateForm.value.name = notification.name
    updateForm.value.title = notification.title
    updateForm.value.body = notification.body
    updateDialog.value = true
  }
  const openShowModal = (notification) => {
    DataForm.value.id = notification.id
    DataForm.value.name = notification.name
    DataForm.value.title = notification.title
    DataForm.value.body = notification.body
    showDialog.value = true
  }

  const updateNotification = () => {
    updateLoading.value = true
    axios
      .post(`/api/template-notification/${updateId.value}`, {
        name: updateForm.value.name,
        title: updateForm.value.title,
        body: updateForm.value.body,
      })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('success'),
          detail: t('templateNotification.updateSuccess'),
          life: 3000,
        })
        fetchData()
        updateDialog.value = false
        updateForm.value = { name: '', title: '', body: '' }
        updateId.value = null
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('templateNotification.updateError'),
          life: 3000,
        })
      })
      .finally(() => {
        updateLoading.value = false
      })
  }
  const createNotification = () => {
    createLoading.value = true
    axios
      .post(`/api/template-notification`, {
        name: DataForm.value.name,
        title: DataForm.value.title,
        body: DataForm.value.body,
      })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('success'),
          detail: t('templateNotification.createSuccess'),
          life: 3000,
        })
        fetchData()
        updateDialog.value = false
        updateForm.value = { name: '', title: '', body: '' }
        updateId.value = null
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('templateNotification.createError'),
          life: 3000,
        })
      })
      .finally(() => {
        createLoading.value = false
        createDialog.value = false
      })
  }

  const deleteNotification = () => {
    deleteLoading.value = true
    axios
      .delete(`/api/template-notification/${deleteId.value}`)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('success'),
          detail: t('templateNotification.deleteSuccess'),
          life: 3000,
        })
        fetchData()
      })
      .catch(() => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('templateNotification.deleteError'),
          life: 3000,
        })
      })
      .finally(() => {
        deleteLoading.value = false
        confirmDeleteDialog.value = false
      })
  }

  const openConfirmDelete = (notifications) => {
    deleteId.value = notifications.id
    confirmDeleteDialog.value = true
  }
  // Lifecycle hooks
  onMounted(() => {
    fetchData()
    fetchAllUsers() // Load initial users
  })

  // Fetch all users for multi-select
  const fetchAllUsers = (searchTerm = '') => {
    usersLoading.value = true
    axios
      .get('/api/user', {
        params: {
          limit: 20,
          search: searchTerm || undefined,
        },
      })
      .then((response) => {
        allUsers.value = response.data.data.data.map((user) => ({
          id: user.id,
          label: `${user.name} `,
          value: user.id,
        }))
      })
      .catch((error) => {
        console.error('Error fetching users:', error)
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: 'Failed to load users',
          life: 3000,
        })
      })
      .finally(() => {
        usersLoading.value = false
      })
  }

  // Handle multi-select filter
  const handleUserFilter = (event) => {
    fetchAllUsers(event.value)
  }

  // Send notification functions
  const openSendNotificationModal = () => {
    sendForm.value = { all: 1, title: '', body: '', ids: [] }
    selectedUsers.value = []
    sendMode.value = 'custom'
    selectedTemplate.value = null
    sendNotificationDialog.value = true
  }

  const applyTemplate = (template) => {
    if (template) {
      sendForm.value.title = template.title
      sendForm.value.body = template.body
    }
  }

  const onSendModeChange = () => {
    sendForm.value.title = ''
    sendForm.value.body = ''
    selectedTemplate.value = null
  }

  const openCreateModal = () => {
    DataForm.value = { id: null, name: '', title: '', body: '' }
    createDialog.value = true
  }
  const sendNotification = () => {
    if (!sendForm.value.title || !sendForm.value.body) {
      toast.add({
        severity: 'warn',
        summary: t('warning'),
        detail: t('templateNotification.requiredFields'),
        life: 3000,
      })
      return
    }

    if (sendForm.value.all === 0 && selectedUsers.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: t('warning'),
        detail: t('templateNotification.selectAtLeastOne'),
        life: 3000,
      })
      return
    }

    sendLoading.value = true
    const payload = {
      all: sendForm.value.all,
      title: sendForm.value.title,
      body: sendForm.value.body,
      ids: sendForm.value.all === 0 ? selectedUsers.value : [],
    }

    axios
      .post('/api/user-notification/send', payload)
      .then((response) => {
        toast.add({
          severity: 'success',
          summary: t('success'),
          detail: t('templateNotification.notificationSent'),
          life: 3000,
        })
        sendNotificationDialog.value = false
        sendForm.value = {
          all: 1,
          title: '',
          body: '',
          ids: [],
        }
        selectedUsers.value = []
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: error.response?.data?.message || 'Failed to send notification',
          life: 3000,
        })
      })
      .finally(() => {
        sendLoading.value = false
      })
  }
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="card p-4 shadow-2 border-round">
        <Toolbar class="mb-4">
          <template #start>
            <h2 class="text-2xl font-bold">{{ t('templateNotification.managementTitle') }}</h2>
          </template>

          <template #end>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" :placeholder="t('templateNotification.search')" />
              </span>
              <Button
                :label="t('templateNotification.export')"
                icon="pi pi-upload"
                class="p-export"
                v-can="'list template-notification'"
                @click="exportCSV"
              />
              <Button
                :label="t('templateNotification.sendNotificationButton')"
                icon="pi pi-send"
                class="p-button-success"
                v-can="'create template-notification'"
                @click="openSendNotificationModal"
              />
              <Button
                :label="t('templateNotification.createTemplateNotification')"
                icon="pi pi-plus"
                class="p-button-success"
                v-can="'create template-notification'"
                @click="openCreateModal"
              />
            </div>
          </template>
        </Toolbar>

        <Toast />

        <div class="card shadow-1 surface-0">
          <DataTable
            ref="dt"
            :value="notifications"
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
            v-can="'list template-notification'"
          >
            <Column selection-mode="multiple" header-style="width: 3rem"></Column>

            <Column field="name" :header="t('templateNotification.name')" :sortable="true">
              <template #body="slotProps">
                {{ slotProps.data.name }}
              </template>
            </Column>

            <Column field="title" :header="t('templateNotification.title')" :sortable="true">
              <template #body="slotProps">
                {{ slotProps.data.title }}
              </template>
            </Column>

            <Column field="body" :header="t('templateNotification.body')" :sortable="true">
              <template #body="slotProps">
                {{ slotProps.data.body || '-' }}
              </template>
            </Column>

            <Column :header="t('actions')" headerStyle="width: 8rem">
              <template #body="slotProps">
                <div class="flex gap-2 items-center justify-evenly">
                  <Button
                    v-can="'show template-notification'"
                    icon="pi pi-eye"
                    class="p-detail"
                    @click="openShowModal(slotProps.data)"
                    v-tooltip.top="t('show')"
                  />
                  <Button
                    v-can="'edit template-notification'"
                    icon="pi pi-pencil"
                    class="p-detail"
                    @click="openUpdateModal(slotProps.data)"
                    v-tooltip.top="t('edit')"
                  />
                  <Button
                    v-can="'delete template-notification'"
                    icon="pi pi-trash"
                    class="p-delete p-button-danger"
                    @click="openConfirmDelete(slotProps.data)"
                    v-tooltip.top="t('delete')"
                  />
                </div>
              </template>
            </Column>

            <template #empty>
              <div class="text-center py-4">
                <i class="pi pi-exclamation-circle text-2xl mb-2" />
                <p class="text-xl">{{ t('templateNotification.noData') }}</p>
              </div>
            </template>

            <template #loading>
              <div class="flex justify-content-center align-items-center py-4">
                <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
              </div>
            </template>
          </DataTable>

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
                v-model="rowsPerPage"
                :options="[5, 10, 20, 30]"
                @change="changeRowsPerPage"
                class="ml-2"
                style="width: 80px"
              />
            </div>
          </div>
        </div>

        <!-- Create Modal -->
        <Dialog
          v-model:visible="createDialog"
          :style="{ width: '450px' }"
          :header="t('templateNotification.createTitle')"
          :modal="true"
        >
          <div class="p-fluid">
            <div class="p-field mb-4">
              <label for="name">{{ t('templateNotification.name') }}</label>
              <InputText
                id="name"
                v-model="DataForm.name"
                :placeholder="t('templateNotification.name')"
                :disabled="createLoading"
              />
            </div>
            <div class="p-field mb-4">
              <label for="title">{{ t('templateNotification.title') }}</label>
              <InputText
                id="title"
                v-model="DataForm.title"
                :placeholder="t('templateNotification.title')"
                :disabled="createLoading"
              />
            </div>
            <div class="p-field">
              <label for="body">{{ t('templateNotification.body') }}</label>
              <InputText
                id="body"
                v-model="DataForm.body"
                :placeholder="t('templateNotification.body')"
                :disabled="createLoading"
              />
            </div>
          </div>
          <template #footer>
            <Button
              :label="t('cancel')"
              icon="pi pi-times"
              class="p-button-text"
              :disabled="createLoading"
              @click="createDialog = false"
            />
            <Button
              :label="t('save')"
              icon="pi pi-check"
              class="p-button-text p-button-success"
              :disabled="createLoading"
              @click="createNotification"
            />
          </template>
        </Dialog>

        <!-- Update Modal -->
        <Dialog
          v-model:visible="updateDialog"
          :style="{ width: '450px' }"
          :header="t('templateNotification.updateTitle')"
          :modal="true"
        >
          <div class="p-fluid">
            <div class="p-field mb-4">
              <label for="name">{{ t('templateNotification.name') }}</label>
              <InputText
                id="name"
                disabled="true"
                v-model="updateForm.name"
                :placeholder="t('templateNotification.name')"
                :disabled="updateLoading"
              />
            </div>
            <div class="p-field mb-4">
              <label for="title">{{ t('templateNotification.title') }}</label>
              <InputText
                id="title"
                v-model="updateForm.title"
                :placeholder="t('templateNotification.title')"
                :disabled="updateLoading"
              />
            </div>
            <div class="p-field">
              <label for="body">{{ t('templateNotification.body') }}</label>
              <InputText
                id="body"
                v-model="updateForm.body"
                :placeholder="t('templateNotification.body')"
                :disabled="updateLoading"
              />
            </div>
          </div>
          <template #footer>
            <Button
              :label="t('cancel')"
              icon="pi pi-times"
              class="p-button-text"
              :disabled="updateLoading"
              @click="updateDialog = false"
            />
            <Button
              :label="t('save')"
              icon="pi pi-check"
              class="p-button-text p-button-success"
              :disabled="updateLoading"
              @click="updateNotification"
            />
          </template>
        </Dialog>

        <!-- Show Modal -->
        <Dialog
          v-model:visible="showDialog"
          :style="{ width: '450px' }"
          :header="t('templateNotification.showTitle')"
          :modal="true"
        >
          <div class="flex flex-col gap-4">
            <div class="p-field mb-4">
              <label for="name">{{ t('templateNotification.name') }}</label>
              <p>{{ DataForm.name }}</p>
            </div>
            <div class="p-field mb-4">
              <label for="title">{{ t('templateNotification.title') }}</label>
              <p>{{ DataForm.title }}</p>
            </div>
            <div class="p-field">
              <label for="body">{{ t('templateNotification.body') }}</label>
              <p>{{ DataForm.body }}</p>
            </div>
          </div>
          <template #footer>
            <Button
              :label="t('cancel')"
              icon="pi pi-times"
              class="p-button-text"
              :disabled="showLoading"
              @click="showDialog = false"
            />
          </template>
        </Dialog>

        <!-- Send Notification Modal -->
        <Dialog
          v-model:visible="sendNotificationDialog"
          :style="{ width: '580px' }"
          :header="t('templateNotification.sendNotificationTitle')"
          :modal="true"
        >
          <div class="flex flex-col gap-5 pt-2">

            <!-- Source toggle -->
            <div class="flex gap-3">
              <label
                for="mode-template"
                class="send-mode-card"
                :class="{ active: sendMode === 'template' }"
              >
                <input
                  id="mode-template"
                  v-model="sendMode"
                  type="radio"
                  value="template"
                  :disabled="sendLoading"
                  @change="onSendModeChange"
                  class="hidden"
                />
                <i class="pi pi-list text-xl" />
                <span>{{ t('templateNotification.useTemplate') }}</span>
              </label>

              <label
                for="mode-custom"
                class="send-mode-card"
                :class="{ active: sendMode === 'custom' }"
              >
                <input
                  id="mode-custom"
                  v-model="sendMode"
                  type="radio"
                  value="custom"
                  :disabled="sendLoading"
                  @change="onSendModeChange"
                  class="hidden"
                />
                <i class="pi pi-pencil text-xl" />
                <span>{{ t('templateNotification.customNotification') }}</span>
              </label>
            </div>

            <!-- Template selector -->
            <div v-if="sendMode === 'template'" class="flex flex-col gap-1">
              <label for="template-select" class="field-label">
                <i class="pi pi-bookmark mr-1" />
                {{ t('templateNotification.selectTemplate') }}
              </label>
              <Dropdown
                id="template-select"
                v-model="selectedTemplate"
                :options="notifications"
                option-label="name"
                :placeholder="t('templateNotification.selectTemplatePlaceholder')"
                :disabled="sendLoading"
                @change="applyTemplate($event.value)"
                class="w-full"
              />
            </div>

            <!-- Divider -->
            <div class="send-divider" />

            <!-- Title & Body -->
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label for="send-title" class="field-label">
                  <i class="pi pi-tag mr-1" />
                  {{ t('templateNotification.notificationTitle') }}
                </label>
                <InputText
                  id="send-title"
                  v-model="sendForm.title"
                  :placeholder="t('templateNotification.notificationTitle')"
                  :disabled="sendLoading"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label for="send-body" class="field-label">
                  <i class="pi pi-align-left mr-1" />
                  {{ t('templateNotification.notificationBody') }}
                </label>
                <InputText
                  id="send-body"
                  v-model="sendForm.body"
                  :placeholder="t('templateNotification.notificationBody')"
                  :disabled="sendLoading"
                />
              </div>
            </div>

            <!-- Divider -->
            <div class="send-divider" />

            <!-- Recipients -->
            <div class="flex flex-col gap-3">
              <div class="flex align-items-center justify-content-between send-recipients-toggle">
                <div
                  class="toggle-switch mx-4"
                  :class="{ on: sendForm.all === 1 }"
                  @click="!sendLoading && (sendForm.all = sendForm.all === 1 ? 0 : 1)"
                >
                  <div class="toggle-thumb" />
                </div>
                <span class="font-semibold">{{ t('templateNotification.yesAllUsers') }}</span>
              </div>

              <div v-if="sendForm.all === 0" class="flex flex-col gap-1">
                <label for="send-users" class="field-label">
                  <i class="pi pi-users mr-1" />
                  {{ t('templateNotification.selectUsers') }}
                </label>
                <MultiSelect
                  id="send-users"
                  v-model="selectedUsers"
                  :options="allUsers"
                  option-label="label"
                  option-value="value"
                  :placeholder="t('templateNotification.searchUsers')"
                  :max-selected-labels="3"
                  :disabled="sendLoading"
                  :loading="usersLoading"
                  filter
                  @filter="handleUserFilter"
                  class="w-full"
                />
              </div>
            </div>

          </div>
          <template #footer>
            <div class="flex justify-content-end gap-2 pt-2">
              <Button
                :label="t('cancel')"
                icon="pi pi-times"
                class="p-button-outlined p-button-secondary"
                :disabled="sendLoading"
                @click="sendNotificationDialog = false"
              />
              <Button
                :label="t('templateNotification.sendNotificationButton')"
                icon="pi pi-send"
                class="p-button-success"
                :loading="sendLoading"
                @click="sendNotification"
              />
            </div>
          </template>
        </Dialog>

        <Dialog
          v-model:visible="confirmDeleteDialog"
          :style="{ width: '450px' }"
          :header="t('templateNotification.confirmDeleteTitle')"
          :modal="true"
        >
          <div class="p-fluid">
            <p>{{ t('templateNotification.confirmDeleteMessage') }}</p>
          </div>
          <template #footer>
            <Button
              :label="t('cancel')"
              icon="pi pi-times"
              class="p-button-text"
              :disabled="deleteLoading"
              @click="confirmDeleteDialog = false"
            />
            <Button
              :label="t('delete')"
              icon="pi pi-trash"
              class="p-button-text p-button-danger"
              :disabled="deleteLoading"
              @click="deleteNotification"
            />
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .p-field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  .field-label {
  margin-bottom: 4px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-color-secondary);
  }

  .send-mode-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid var(--surface-border);
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-color-secondary);
    transition: all 0.2s;
  }

  .send-mode-card:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-50, #f0f7ff);
  }

  .send-mode-card.active {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--primary-50, #f0f7ff);
  }

  .send-divider {
    border-top: 1px solid var(--surface-border);
  }

  .send-recipients-toggle {
    padding: 0.85rem 1rem;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background: var(--surface-50, #fafafa);
  }

  .toggle-switch {
    width: 44px;
    height: 24px;
    border-radius: 999px;
    background: var(--surface-300, #cbd5e1);
    position: relative;
    cursor: pointer;
    transition: background 0.25s;
    flex-shrink: 0;
  }

  .toggle-switch.on {
    background: var(--green-500, #22c55e);
  }

  .toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: left 0.25s;
  }

  .toggle-switch.on .toggle-thumb {
    left: 23px;
  }

  .hidden {
    display: none;
  }
</style>
