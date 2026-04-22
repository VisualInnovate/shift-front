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
const newNotificationEmail = ref('')
const newNotificationWhatsapp = ref('')

// Cart Image Handling
const cartImageFile = ref(null)
const cartImagePreview = ref(null)
const isDraggingCartImage = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Form Data
const formData = ref({
  order_tax: '',
  address: '',
  phone: '',
  email: '',
  order_notification_emails: [],
  order_notification_whatsapp: [],
  facebook: '',
  instagram: '',
  youtube: '',
  snapchat: '',
  tiktok: '',
  privacy_policy_ar: '',
  privacy_policy_en: '',
  terms_conditions_ar: '',
  terms_conditions_en: '',
  cart_image: '',           // Existing image URL from backend
})

// ==================== Cart Image Handlers ====================

const handleCartImageDragOver = (e) => {
  e.preventDefault()
  isDraggingCartImage.value = true
}

const handleCartImageDragLeave = () => {
  isDraggingCartImage.value = false
}

const handleCartImageDrop = (e) => {
  e.preventDefault()
  isDraggingCartImage.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleCartImageSelect(file)
}

const handleCartImageSelect = (file) => {
  if (!file.type.match('image.*')) {
    toast.add({
      severity: 'error',
      summary: t('error') || 'Error',
      detail: 'Only image files are allowed (PNG, JPG, JPEG)',
      life: 4000
    })
    return
  }

  cartImageFile.value = file

  const reader = new FileReader()
  reader.onload = (e) => {
    cartImagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeCartImage = () => {
  cartImageFile.value = null
  cartImagePreview.value = null
}

// ==================== Notification Emails ====================

const isValidEmail = (email) => emailPattern.test(email)

const addNotificationEmail = () => {
  const email = newNotificationEmail.value.trim()
  if (!email) return

  if (!isValidEmail(email)) {
    toast.add({
      severity: 'warn',
      summary: t('settings.invalidEmail') || 'Invalid Email',
      detail: t('settings.invalidEmailDetail') || 'Please enter a valid email address',
      life: 4000
    })
    return
  }

  if (formData.value.order_notification_emails.includes(email)) {
    toast.add({
      severity: 'warn',
      summary: t('settings.duplicateEmail') || 'Duplicate Email',
      detail: t('settings.duplicateEmailDetail') || 'This email is already added',
      life: 4000
    })
    return
  }

  formData.value.order_notification_emails.push(email)
  newNotificationEmail.value = ''
}

const removeNotificationEmail = (index) => {
  formData.value.order_notification_emails.splice(index, 1)
}

const addNotificationWhatsapp = () => {
  const whatsapp = newNotificationWhatsapp.value.trim()
  if (!whatsapp) return

  if (formData.value.order_notification_whatsapp.includes(whatsapp)) {
    toast.add({
      severity: 'warn',
      summary: t('settings.duplicateWhatsapp') || 'Duplicate WhatsApp',
      detail: t('settings.duplicateWhatsappDetail') || 'This WhatsApp number is already added',
      life: 4000
    })
    return
  }

  formData.value.order_notification_whatsapp.push(whatsapp)
  newNotificationWhatsapp.value = ''
}

const removeNotificationWhatsapp = (index) => {
  formData.value.order_notification_whatsapp.splice(index, 1)
}
// Editor Configuration
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

// Fetch Settings
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
        order_notification_emails: 'order_notification_emails',
        order_notification_whatsapp: 'order_notification_whatsapp',
        facebook: 'facebook',
        instagram: 'instagram',
        youtube: 'youtube',
        snapchat: 'snapchat',
        tiktok: 'tiktok',
        privacy_policy_ar: 'privacy_policy_ar',
        privacy_policy_en: 'privacy_policy_en',
        terms_conditions_ar: 'terms_conditions_ar',
        terms_conditions_en: 'terms_conditions_en',
        cart_image: 'cart_image',
      }
 
      data.forEach(item => {
        const fieldKey = mapping[item.key]
        if (fieldKey && Object.prototype.hasOwnProperty.call(formData.value, fieldKey)) {
          if (fieldKey === 'order_notification_emails') {
            formData.value[fieldKey] = Array.isArray(item.value)
              ? item.value
              : (item.value ? JSON.parse(item.value) : [])
          } else if (fieldKey === 'order_notification_whatsapp') {
            formData.value[fieldKey] = Array.isArray(item.value)
              ? item.value
              : (item.value ? JSON.parse(item.value) : [])
          }
        } else if (fieldKey === 'cart_image') {
          formData.value.cart_image = item.value || ''
          if (item.media[0]?.url) {
            cartImagePreview.value = item.media[0]?.url
          }
          else {
            formData.value[fieldKey] = item.value || ''
          }
        }
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

// Update Settings
const updateSettings = async () => {
  isLoading.value = true

  try {
    const formDataToSend = new FormData()

    const fields = [
      'order_tax', 'address', 'phone', 'email', 'order_notification_emails',
      'order_notification_whatsapp',
      'facebook', 'instagram', 'youtube', 'snapchat', 'tiktok',
      'privacy_policy_ar', 'privacy_policy_en',
      'terms_conditions_ar', 'terms_conditions_en',
      'cart_image'
    ]

    fields.forEach((key, index) => {
      formDataToSend.append(`data[${index}][key]`, key)

      let value = ''
      if (key === 'order_notification_emails') {
        value = JSON.stringify(formData.value.order_notification_emails || [])
      } else if (key === 'order_notification_whatsapp') {
        value = JSON.stringify(formData.value.order_notification_whatsapp || [])
      }
      else if (key === 'cart_image') {
        value = formData.value.cart_image || ''
      } else {
        value = formData.value[key] || ''
      }

      formDataToSend.append(`data[${index}][value]`, value)
    })

    // Append new image file if selected
    if (cartImageFile.value) {
      formDataToSend.append('cart_image', cartImageFile.value)
    }

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

      // Refresh to get latest image URL
      await fetchSettings()
      cartImageFile.value = null // Clear the uploaded file
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
        <!-- Loading Spinner -->
        <div v-if="isLoading" class="flex justify-center py-12">
          <ProgressSpinner style="width: 60px; height: 60px" />
        </div>

        <!-- Main Form -->
        <div v-else class="space-y-10">

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block mb-2 font-medium">{{ t('settings.order_tax') }}</label>
              <InputText v-model="formData.order_tax" class="w-full" />
            </div>

            <div>
              <label class="block mb-2 font-medium">{{ t('settings.phone') }}</label>
              <InputText v-model="formData.phone" class="w-full" />
            </div>

            <div>
              <label class="block mb-2 font-medium">{{ t('settings.email') }}</label>
              <InputText v-model="formData.email" type="email" class="w-full" />
            </div>

            <div class="md:col-span-2">
              <label class="block mb-2 font-medium">{{ t('settings.order_notification_emails') }}</label>
              <div class="flex gap-2 mb-3">
                <InputText v-model="newNotificationEmail" type="email"
                  :placeholder="t('settings.order_notification_emailsPlaceholder')" class="flex-1" />
                <Button icon="pi pi-plus" @click="addNotificationEmail" />
              </div>

              <div class="space-y-2">
                <div v-for="(email, index) in formData.order_notification_emails" :key="index"
                  class="flex items-center justify-between px-4 py-2 bg-white border rounded-lg">
                  <span>{{ email }}</span>
                  <Button icon="pi pi-times" severity="danger" text @click="removeNotificationEmail(index)" />
                </div>
                <p v-if="!formData.order_notification_emails.length" class="text-sm text-slate-500 italic">
                  {{ t('settings.order_notification_emailsEmpty') }}
                </p>
              </div>
            </div>

            <hr class="w-full col-span-2 my-4">

            <div class="md:col-span-2">
              <label class="block mb-2 font-medium">{{ t('settings.order_notification_whatsapp') }}</label>
              <div class="flex gap-2 mb-3">
                <InputText v-model="newNotificationWhatsapp" type="tel"
                  :placeholder="t('settings.order_notification_whatsappPlaceholder')" class="flex-1" />
                <Button icon="pi pi-plus" @click="addNotificationWhatsapp" />
              </div>

              <div class="space-y-2">
                <div v-for="(whatsapp, index) in formData.order_notification_whatsapp" :key="index"
                  class="flex items-center justify-between px-4 py-2 bg-white border rounded-lg">
                  <span>{{ whatsapp }}</span>
                  <Button icon="pi pi-times" severity="danger" text @click="removeNotificationWhatsapp(index)" />
                </div>
                <p v-if="!formData.order_notification_whatsapp.length" class="text-sm text-slate-500 italic">
                  {{ t('settings.order_notification_whatsappEmpty') }}
                </p>
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="block mb-2 font-medium">{{ t('settings.address') }}</label>
              <InputText v-model="formData.address" class="w-full" />
            </div>
          </div>

          <!-- Social Media -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-semibold mb-6 text-indigo-600">{{ t('settings.socialLinks') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-facebook text-blue-600"></i> Facebook
                </label>
                <InputText v-model="formData.facebook" placeholder="https://facebook.com/..." class="w-full" />
              </div>
              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-instagram text-pink-600"></i> Instagram
                </label>
                <InputText v-model="formData.instagram" placeholder="https://instagram.com/..." class="w-full" />
              </div>
              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-youtube text-red-600"></i> YouTube
                </label>
                <InputText v-model="formData.youtube" placeholder="https://youtube.com/..." class="w-full" />
              </div>
              <div>
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-snapchat text-yellow-500"></i> Snapchat
                </label>
                <InputText v-model="formData.snapchat" placeholder="https://snapchat.com/..." class="w-full" />
              </div>
              <div class="md:col-span-2">
                <label class="block mb-2 font-medium flex items-center gap-2">
                  <i class="pi pi-tiktok"></i> TikTok
                </label>
                <InputText v-model="formData.tiktok" placeholder="https://tiktok.com/..." class="w-full" />
              </div>
            </div>
          </div>

          <!-- Cart Image -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-semibold mb-6 text-indigo-600">
              {{ t('settings.cartImage') || 'Cart Image' }}
            </h3>

            <div class="max-w-md">
              <label @dragover.prevent="handleCartImageDragOver" @dragleave="handleCartImageDragLeave"
                @drop.prevent="handleCartImageDrop"
                class="block border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer min-h-[280px]" :class="{
                  'border-indigo-500 bg-indigo-50': isDraggingCartImage,
                  'border-gray-300 hover:border-gray-400': !isDraggingCartImage
                }">
                <input type="file" @change="e => handleCartImageSelect(e.target.files[0])" accept="image/*"
                  class="hidden" />

                <!-- Image Preview -->
                <div v-if="cartImagePreview" class="relative group">
                  <img :src="cartImagePreview" alt="Cart Image Preview"
                    class="w-full h-64 object-contain rounded-xl shadow-md" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-xl">
                    <div class="flex gap-3">
                      <Button type="button" icon="pi pi-trash" severity="danger" rounded
                        @click.stop="removeCartImage" />
                      <label>
                        <Button type="button" icon="pi pi-pencil" severity="secondary" rounded />
                        <input type="file" @change="e => handleCartImageSelect(e.target.files[0])" accept="image/*"
                          class="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Upload Placeholder -->
                <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <i class="pi pi-image text-indigo-600 text-4xl"></i>
                  </div>
                  <p class="font-medium text-gray-700">
                    {{ t('brand.upload') || 'Click to upload' }}
                    <span class="text-indigo-600">or drag & drop</span>
                  </p>
                  <p class="text-xs text-gray-400 mt-2">PNG, JPG, JPEG</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Privacy Policy -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-semibold mb-6 text-indigo-600">{{ t('settings.privacyPolicy') }}</h3>
            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.privacy_policy_ar') }}</label>
              <Editor v-model="formData.privacy_policy_ar" editorStyle="min-height: 320px"
                :modules="editorOptions.modules" />
            </div>
            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.privacy_policy_en') }}</label>
              <Editor v-model="formData.privacy_policy_en" editorStyle="min-height: 320px"
                :modules="editorOptions.modules" />
            </div>
          </div>

          <!-- Terms & Conditions -->
          <div class="border-t pt-8">
            <h3 class="text-xl font-semibold mb-6 text-indigo-600">{{ t('settings.termsConditions') }}</h3>
            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.terms_conditions_ar') }}</label>
              <Editor v-model="formData.terms_conditions_ar" editorStyle="min-height: 320px"
                :modules="editorOptions.modules" />
            </div>
            <div class="mb-10">
              <label class="block mb-3 font-medium text-lg">{{ t('settings.terms_conditions_en') }}</label>
              <Editor v-model="formData.terms_conditions_en" editorStyle="min-height: 320px"
                :modules="editorOptions.modules" />
            </div>
          </div>

          <!-- Save Button -->
          <div class="flex justify-end mt-12">
            <Button :label="t('settings.updateButton')" icon="pi pi-check" :loading="isLoading"
              class="px-10 py-3 text-lg" @click="updateSettings" />
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
</style>
