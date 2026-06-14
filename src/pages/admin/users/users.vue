<script setup>
  import { ref, onMounted, onBeforeMount, watch } from 'vue'
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
  import Tag from 'primevue/tag'
  import Dialog from 'primevue/dialog'
  import ProgressSpinner from 'primevue/progressspinner'
  import Dropdown from 'primevue/dropdown'

  const { t } = useI18n()
  const router = useRouter()
  const toast = useToast()

  // State variables
  const loading = ref(true)
  const delete_id = ref('')
  const users = ref(null)
  const deleteDialog = ref(false)
  const selectedUsers = ref(null)
  const dt = ref(null)
  const filters = ref({})
  const searchQuery = ref('')
  const resetPasswordDialog = ref(false)
  const resetPasswordForm = ref({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const resetPasswordLoading = ref(false)
  const resetPasswordErrors = ref([])

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

  // Initialize filters
  const initFilters = () => {
    filters.value = {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    }
  }

  // Fetch data
  const fetchData = () => {
    loading.value = true
    axios
      .get('/api/user', {
        params: {
          page: currentPage.value,
          limit: rowsPerPage.value,
          search: searchQuery.value || undefined,
        },
      })
      .then((res) => {
        users.value = res.data.data.data
        totalRecords.value = res.data.data.total
        totalPages.value = res.data.data.last_page
        firstPageUrl.value = res.data.data.first_page_url
        lastPageUrl.value = res.data.data.last_page_url
        nextPageUrl.value = res.data.data.next_page_url
        prevPageUrl.value = res.data.data.prev_page_url
        from.value = res.data.data.from
        to.value = res.data.data.to
        links.value = res.data.data.links
        loading.value = false
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('user.loadError'),
          life: 3000,
        })
        loading.value = false
        console.error('Error fetching data:', error)
      })
  }

  // Watch for search and rows per page changes
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

  // Delete user
  const confirmDelete = (id) => {
    delete_id.value = id
    deleteDialog.value = true
  }

  const deleteUser = () => {
    axios
      .delete(`/api/user/${delete_id.value}`)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('success'),
          detail: t('user.deleteSuccess'),
          life: 3000,
        })
        fetchData()
        deleteDialog.value = false
      })
      .catch((error) => {
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: t('user.deleteError'),
          life: 3000,
        })
      })
  }

  const extractErrorMessages = (error, fallback) => {
    const errors = error.response?.data?.errors

    if (errors) {
      return Object.values(errors).flat()
    }

    return [error.response?.data?.message || fallback]
  }

  const resetPasswordState = () => {
    resetPasswordForm.value = {
      current_password: '',
      password: '',
      password_confirmation: '',
    }
    resetPasswordErrors.value = []
  }

  const resetPassword = () => {
    resetPasswordState()
    resetPasswordDialog.value = true
  }

  const validateResetPasswordForm = () => {
    const errors = []

    if (
      !resetPasswordForm.value.current_password ||
      !resetPasswordForm.value.password ||
      !resetPasswordForm.value.password_confirmation
    ) {
      errors.push(t('user.resetPassword.requiredFields'))
    }

    if (
      resetPasswordForm.value.password &&
      resetPasswordForm.value.password_confirmation &&
      resetPasswordForm.value.password !== resetPasswordForm.value.password_confirmation
    ) {
      errors.push(t('user.resetPassword.passwordMismatch'))
    }

    resetPasswordErrors.value = errors

    if (errors.length) {
      toast.add({
        severity: 'warn',
        summary: t('warning'),
        detail: errors[0],
        life: 3000,
      })
    }

    return errors.length === 0
  }

  const confirmResetPassword = async () => {
    if (!validateResetPasswordForm()) {
      return
    }

    resetPasswordLoading.value = true

    try {
      const response = await axios.post('/api/profile/change-password', {
        current_password: resetPasswordForm.value.current_password,
        password: resetPasswordForm.value.password,
        password_confirmation: resetPasswordForm.value.password_confirmation,
      })

      if (response.data?.is_success === false) {
        const message = response.data?.message || t('user.resetPassword.passwordChangedError')
        resetPasswordErrors.value = [message]
        toast.add({
          severity: 'error',
          summary: t('error'),
          detail: message,
          life: 4000,
        })
        return
      }

      toast.add({
        severity: 'success',
        summary: t('success'),
        detail: response.data?.message || t('user.resetPassword.passwordChangedSuccess'),
        life: 3000,
      })
      resetPasswordDialog.value = false
    } catch (error) {
      const messages = extractErrorMessages(error, t('user.resetPassword.passwordChangedError'))
      resetPasswordErrors.value = messages
      toast.add({
        severity: 'error',
        summary: t('error'),
        detail: messages.join(' '),
        life: 4000,
      })
    } finally {
      resetPasswordLoading.value = false
    }
  }

  const closeResetPasswordDialog = () => {
    if (!resetPasswordLoading.value) {
      resetPasswordDialog.value = false
    }
  }

  // Export CSV
  const exportCSV = () => {
    dt.value.exportCSV()
  }

  // Navigation functions
  const openNew = () => {
    router.push({ name: 'user-create' })
  }

  const editUser = (id) => {
    router.push({ name: 'user-edit', params: { id } })
  }

  // Lifecycle hooks
  onBeforeMount(() => {
    initFilters()
  })

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
            <h2 class="text-2xl font-bold">{{ $t('user.managementTitle') }}</h2>
          </template>

          <template #end>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" :placeholder="$t('user.search')" />
              </span>
              <Button
                :label="$t('user.export')"
                icon="pi pi-upload"
                class="p-export"
                v-can="'export users'"
                @click="exportCSV"
              />
              <Button
                v-can="'create users'"
                :label="$t('user.new')"
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
            :value="users"
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
            v-can="'list users'"
          >
            <Column selection-mode="multiple" header-style="width: 3rem"></Column>

            <Column field="name" :header="t('user.name')" :sortable="true" header-style="width:14%; min-width:10rem;">
              <template #body="slotProps">
                {{ slotProps.data.name }}
              </template>
            </Column>

            <Column
              field="email"
              :header="$t('user.email')"
              :sortable="true"
              header-style="width:14%; min-width:10rem;"
            >
              <template #body="slotProps">
                {{ slotProps.data.email }}
              </template>
            </Column>

            <Column field="phone" :header="t('user.phone')" :sortable="true" header-style="width:14%; min-width:10rem;">
              <template #body="slotProps">
                {{ slotProps.data.phone }}
              </template>
            </Column>

            <Column
              field="type_description"
              :header="t('user.type')"
              :sortable="true"
              header-style="width:14%; min-width:10rem;"
            >
              <template #body="slotProps">
                <Tag
                  :value="slotProps.data.type_description"
                  :severity="
                    {
                      Admin: 'info',
                      Customer: 'success',
                      Guest: 'danger',
                    }[slotProps.data.type_description] || 'warning'
                  "
                />
              </template>
            </Column>

            <Column :header="t('actions')" header-style="min-width:10rem;">
              <template #body="slotProps">
                <Button
                  v-can="'edit users'"
                  icon="pi pi-pencil"
                  class="p-detail"
                  @click="editUser(slotProps.data.id)"
                  v-tooltip.top="t('edit')"
                />
                <Button
                  v-can="'delete users'"
                  icon="pi pi-trash mx-2"
                  class="p-delete"
                  @click="confirmDelete(slotProps.data.id)"
                  v-tooltip.top="t('delete')"
                />
                <Button
                  v-can="'edit users'"
                  icon="pi pi-lock mx-2"
                  class="p-detail"
                  :disabled="resetPasswordLoading"
                  @click="resetPassword"
                  v-tooltip.top="t('resetPassword')"
                />
              </template>
            </Column>

            <template #empty>
              <div class="text-center py-4">
                <i class="pi pi-exclamation-circle text-2xl mb-2" />
                <p class="text-xl">{{ t('user.noData') }}</p>
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

        <!-- Delete Confirmation Dialog -->
        <Dialog
          v-model:visible="deleteDialog"
          :style="{ width: '450px' }"
          :header="t('user.deleteConfirmTitle')"
          :modal="true"
        >
          <div class="flex align-items-center justify-content-center">
            <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem; color: var(--red-500)" />
            <span>{{ t('user.deleteConfirmMessage') }}</span>
          </div>
          <template #footer>
            <Button :label="t('no')" icon="pi pi-times" class="p-button-text" @click="deleteDialog = false" />
            <Button :label="t('yes')" icon="pi pi-check" class="p-button-text p-button-danger" @click="deleteUser" />
          </template>
        </Dialog>

        <Dialog
          v-model:visible="resetPasswordDialog"
          class="reset-password-dialog"
          :style="{ width: '560px', maxWidth: '95vw' }"
          :header="t('user.resetPassword.dialogTitle')"
          :modal="true"
          :closable="!resetPasswordLoading"
          @hide="resetPasswordState()"
        >
          <div class="reset-password-panel">
            <div class="reset-password-heading">
              <span class="reset-password-icon">
                <i class="pi pi-lock" />
              </span>
              <div>
                <h3>{{ t('user.resetPassword.dialogSubtitle') }}</h3>
                <p>{{ t('user.resetPassword.dialogDescription') }}</p>
              </div>
            </div>

            <div class="field">
              <label for="reset-password-current" class="font-semibold">
                {{ t('user.resetPassword.currentPassword') }}
              </label>
              <InputText
                id="reset-password-current"
                v-model="resetPasswordForm.current_password"
                type="password"
                class="w-full mt-2"
                autocomplete="current-password"
                :placeholder="t('user.resetPassword.currentPasswordPlaceholder')"
              />
            </div>

            <div class="field">
              <label for="reset-password-new" class="font-semibold">{{ t('user.resetPassword.newPassword') }}</label>
              <InputText
                id="reset-password-new"
                v-model="resetPasswordForm.password"
                type="password"
                class="w-full mt-2"
                autocomplete="new-password"
                :placeholder="t('user.resetPassword.newPasswordPlaceholder')"
              />
            </div>

            <div class="field">
              <label for="reset-password-confirm" class="font-semibold">
                {{ t('user.resetPassword.confirmPassword') }}
              </label>
              <InputText
                id="reset-password-confirm"
                v-model="resetPasswordForm.password_confirmation"
                type="password"
                class="w-full mt-2"
                autocomplete="new-password"
                :placeholder="t('user.resetPassword.confirmPasswordPlaceholder')"
              />
            </div>

            <div v-if="resetPasswordErrors.length" class="reset-password-errors">
              <div v-for="error in resetPasswordErrors" :key="error">{{ error }}</div>
            </div>
          </div>

          <template #footer>
            <div class="reset-password-footer">
              <Button
                :label="t('cancel')"
                icon="pi pi-times"
                class="p-button-text"
                :disabled="resetPasswordLoading"
                @click="closeResetPasswordDialog"
              />
              <Button
                :label="resetPasswordLoading ? t('user.resetPassword.confirming') : t('user.resetPassword.confirm')"
                icon="pi pi-check"
                class="p-button-success"
                :loading="resetPasswordLoading"
                @click="confirmResetPassword"
              />
            </div>
          </template>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<style>
.reset-password-dialog .p-dialog-content {
  padding-top: 0;
}

.reset-password-panel {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.reset-password-heading {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(215, 166, 72, 0.12), rgba(59, 130, 246, 0.08));
  border: 1px solid var(--surface-border, #e5e7eb);
  border-radius: 8px;
}

.reset-password-icon {
  display: inline-flex;
  width: 2.65rem;
  height: 2.65rem;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  background: #d7a648;
  border-radius: 8px;
  box-shadow: 0 8px 18px rgba(215, 166, 72, 0.22);
}

.reset-password-heading h3 {
  margin: 0 0 0.25rem;
  color: var(--text-color, #1f2937);
  font-size: 1.05rem;
  font-weight: 700;
}

.reset-password-heading p {
  margin: 0;
  color: var(--text-color-secondary, #64748b);
  line-height: 1.55;
}

.reset-password-errors {
  padding: 0.75rem 1rem;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 0.9rem;
}

.reset-password-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  width: 100%;
}

@media (max-width: 480px) {
  .reset-password-heading {
    padding: 0.85rem;
  }

  .reset-password-footer {
    flex-direction: column-reverse;
  }

  .reset-password-footer .p-button {
    width: 100%;
  }
}
</style>
