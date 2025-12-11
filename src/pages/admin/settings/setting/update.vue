<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'

import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import Editor from 'primevue/editor'

const { t } = useI18n()
const route = useRoute()
const toast = useToast()
const isLoading = ref(false)

// All fields including new social links
const formData = ref({
  order_tax: '',
  address: '',
  phone: '',
  email: '',          // New: contact email
  facebook: '',       // New
  instagram: '',      // New
  youtube: '',        // New
  snapchat: '',       // New
  tiktok: '',         // New (optional but common)

  privacy_policy_ar: '',
  privacy_policy_en: '',
  terms_conditions_ar: '',
  terms_conditions_en: '',
})

// Editor toolbar with alignment
const editorOptions = {
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
  },
}

// Fetch settings on mount
onMounted(() => {
  fetchSettings()
})

const fetchSettings = async () => {
  isLoading.value = true
  try {
    const response = await axios.get('api/setting', {
      params: {
        code: route.query.code,
        realmId: route.query.realmId,
      },
    })

    if (response.data.is_success) {
      const data = response.data.data

      const mapping = {
        order_tax: 'order_tax',
        address: 'address',
        phone: 'phone',
        email: 'email',
        facebook: 'facebook',
        instagram: 'instagram',
        youtube: 'youtube',
        snapchat: 'snapchat',
        tiktok: 'tiktok',
        privacy_policy_ar: 'privacy_policy_ar',
        privacy_policy_en: 'privacy_policy_en',
        terms_conditions_ar: 'terms_conditions_ar',
        terms_conditions_en: 'terms_conditions_en',
      }

      data.forEach(item => {
        const fieldKey = mapping[item.key]
        if (fieldKey && formData.value.hasOwnProperty(fieldKey)) {
          formData.value[fieldKey] = item.value || ''
        }
      })

      toast.add({
        severity: 'success',
        summary: t('quickBooks.success'),
        detail: t('quickBooks.successContent'),
        life: 3000,
      })
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('quickBooks.error'),
      detail: t('quickBooks.erorrContent'),
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

// Update settings – SAME FORMAT AS YOUR OLD CODE
const updateSettings = async () => {
  isLoading.value = true
  try {
    const formDataToSend = new FormData()

    // Exactly the same structure your backend expects
    const fields = [
      'order_tax',
      'address',
      'phone',
      'email',
      'facebook',
      'instagram',
      'youtube',
      'snapchat',
      'tiktok',
      'privacy_policy_ar',
      'privacy_policy_en',
      'terms_conditions_ar',
      'terms_conditions_en',
    ]

    fields.forEach((key, index) => {
      formDataToSend.append(`data[${index}][key]`, key)
      formDataToSend.append(`data[${index}][value]`, formData.value[key] || '')
    })

    // If you add file upload later for policies, you can append files here
    // Example:
    // if (formData.value.privacy_policy_ar_file) {
    //   formDataToSend.append('privacy_policy_ar_file', formData.value.privacy_policy_ar_file)
    // }

    const response = await axios.post('api/setting', formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (response.data.is_success) {
      toast.add({
        severity: 'success',
        summary: t('settings.updateSuccess'),
        detail: t('settings.settingsUpdated'),
        life: 4000,
      })

      // Optional: refetch fresh data
      await fetchSettings()
    }
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: t('settings.updateFailed'),
      detail: error.response?.data?.message || t('settings.updateError'),
      life: 6000,
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="mx-auto p-4 max-w-6xl">
    <Card>
      <template #title>
        <h2 class="text-2xl font-bold">{{ t('settings.title') }}</h2>
      </template>

      <template #content>
        <!-- Loading -->
        <div v-if="isLoading" class="flex justify-center py-12">
          <ProgressSpinner style="width: 60px; height: 60px" />
        </div>

        <!-- Form -->
        <div v-else class="space-y-10">

          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block mb-2 font-medium">{{ t('settings.order_tax') }}</label>
              <InputText v-model="formData.order_tax" :placeholder="t('settings.order_taxPlaceholder')" class="w-full" />
            </div>

            <div>
              <label class="block mb-2 font-medium">{{ t('settings.phone') }}</label>
              <InputText v-model="formData.phone" :placeholder="t('settings.phonePlaceholder')" class="w-full" />
            </div>

            <div>
              <label class="block mb-2 font-medium">{{ t('settings.email') }}</label>
              <InputText v-model="formData.email" type="email" placeholder="contact@company.com" class="w-full" />
            </div>

            <div class="md:col-span-2">
              <label class="block mb-2 font-medium">{{ t('settings.address') }}</label>
              <InputText v-model="formData.address" :placeholder="t('settings.addressPlaceholder')" class="w-full" />
            </div>
          </div>

          <!-- Social Media Links -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-semibold mb-6 text-indigo-600">{{ t('settings.socialLinks') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-facebook text-blue-600"></i> Facebook
                </label>
                <InputText v-model="formData.facebook" placeholder="https://facebook.com/yourpage" class="w-full" />
              </div>

              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-instagram text-pink-600"></i> Instagram
                </label>
                <InputText v-model="formData.instagram" placeholder="https://instagram.com/yourhandle" class="w-full" />
              </div>

              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-youtube text-red-600"></i> YouTube
                </label>
                <InputText v-model="formData.youtube" placeholder="https://youtube.com/c/yourchannel" class="w-full" />
              </div>

              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-snapchat text-yellow-400"></i> Snapchat
                </label>
                <InputText v-model="formData.snapchat" placeholder="https://snapchat.com/add/username" class="w-full" />
              </div>

              <div class="md:col-span-2">
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-tiktok text-black"></i> TikTok
                </label>
                <InputText v-model="formData.tiktok" placeholder="https://tiktok.com/@yourusername" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Privacy Policy -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-semibold mb-6 text-indigo-600">{{ t('settings.privacyPolicy') }}</h3>

            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.privacy_policy_ar') }}</label>
              <Editor
                v-model="formData.privacy_policy_ar"
                :placeholder="t('settings.privacy_policy_arPlaceholder')"
                editorStyle="min-height: 320px"
                :formats="['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'align']"
                :modules="editorOptions.modules"
              />
            </div>

            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.privacy_policy_en') }}</label>
              <Editor
                v-model="formData.privacy_policy_en"
                :placeholder="t('settings.privacy_policy_enPlaceholder')"
                editorStyle="min-height: 320px"
                :formats="['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'align']"
                :modules="editorOptions.modules"
              />
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-semibold mb-6 text-indigo-600">{{ t('settings.termsConditions') }}</h3>

            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.terms_conditions_ar') }}</label>
              <Editor
                v-model="formData.terms_conditions_ar"
                :placeholder="t('settings.terms_conditions_arPlaceholder')"
                editorStyle="min-height: 320px"
                :formats="['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'align']"
                :modules="editorOptions.modules"
              />
            </div>

            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.terms_conditions_en') }}</label>
              <Editor
                v-model="formData.terms_conditions_en"
                :placeholder="t('settings.terms_conditions_enPlaceholder')"
                editorStyle="min-height: 320px"
                :formats="['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link', 'align']"
                :modules="editorOptions.modules"
              />
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end mt-12">
            <Button
              :label="t('settings.updateButton')"
              icon="pi pi-check"
              :loading="isLoading"
              class="px-8 py-3 text-lg"
              @click="updateSettings"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
:deep(.p-editor-container .p-editor-content) {
  min-height: 320px;
  font-size: 1rem;
  line-height: 1.6;
}

:deep(.p-button) {
  background: #6366f1;
  border: none;
}

:deep(.p-button:hover) {
  background: #4f46e5 !important;
}
</style>
