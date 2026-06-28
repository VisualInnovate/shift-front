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
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'

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
        if (!fieldKey) return

        if (fieldKey === 'order_notification_emails' || fieldKey === 'order_notification_whatsapp') {
          formData.value[fieldKey] = Array.isArray(item.value)
            ? item.value
            : (item.value ? JSON.parse(item.value) : [])
        } else if (fieldKey === 'cart_image') {
          if (item.media && item.media.length > 0) {
            cartImagePreview.value = item.media[0].url
          }
          formData.value.cart_image = item.value || ''
        } else {
          formData.value[fieldKey] = item.value || ''
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
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-8 md:px-8">
    <div class="mx-auto max-w-6xl">

      <!-- Page Header -->
      <div class="mb-8 flex flex-col gap-1">
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
          <i class="pi pi-cog text-[11px]"></i>
          {{ t('settings.badge') || 'Store Configuration' }}
        </span>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          {{ t('settings.title') }}
        </h1>

      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !formData.email" class="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-24 shadow-sm">
        <ProgressSpinner style="width: 56px; height: 56px" strokeWidth="4" />
        <p class="text-sm font-medium text-slate-400">{{ t('settings.loading') || 'Loading settings…' }}</p>
      </div>

      <!-- Main Form -->
      <div v-else class="space-y-6">

        <!-- Basic Information -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-100">
          <div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <i class="pi pi-building text-sm"></i>
            </span>
            <div>
              <h2 class="text-base font-bold text-slate-800">{{ t('settings.basicInfo') || 'Basic Information' }}</h2>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ t('settings.order_tax') }}</label>
              <InputText v-model="formData.order_tax" class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ t('settings.phone') }}</label>
              <InputText v-model="formData.phone" class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ t('settings.email') }}</label>
              <InputText v-model="formData.email" type="email" class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>

            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ t('settings.address') }}</label>
              <InputText v-model="formData.address" class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>

            <!-- Notification Emails -->
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ t('settings.order_notification_emails') }}</label>
              <div class="flex gap-2">
                <InputText v-model="newNotificationEmail" type="email" @keyup.enter="addNotificationEmail"
                  :placeholder="t('settings.order_notification_emailsPlaceholder')"
                  class="w-full !rounded-xl !border-slate-200 !py-2.5" />
                <Button icon="pi pi-plus" @click="addNotificationEmail" class="!aspect-square !rounded-xl" />
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="(email, index) in formData.order_notification_emails" :key="index"
                  class="group inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
                  <i class="pi pi-envelope text-[11px] text-indigo-400"></i>
                  {{ email }}
                  <button type="button" @click="removeNotificationEmail(index)"
                    class="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 transition hover:bg-indigo-200 hover:text-indigo-700">
                    <i class="pi pi-times text-[10px]"></i>
                  </button>
                </span>
                <p v-if="!formData.order_notification_emails.length" class="text-sm italic text-slate-400">
                  {{ t('settings.order_notification_emailsEmpty') }}
                </p>
              </div>
            </div>

            <!-- Notification WhatsApp -->
            <div class="md:col-span-2">
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ t('settings.order_notification_whatsapp') }}</label>
              <div class="flex gap-2">
                <InputText v-model="newNotificationWhatsapp" type="tel" @keyup.enter="addNotificationWhatsapp"
                  :placeholder="t('settings.order_notification_whatsappPlaceholder')"
                  class="w-full !rounded-xl !border-slate-200 !py-2.5" />
                <Button icon="pi pi-plus" @click="addNotificationWhatsapp" class="!aspect-square !rounded-xl" />
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <span v-for="(whatsapp, index) in formData.order_notification_whatsapp" :key="index"
                  class="group inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  <i class="pi pi-whatsapp text-[11px] text-emerald-400"></i>
                  {{ whatsapp }}
                  <button type="button" @click="removeNotificationWhatsapp(index)"
                    class="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-emerald-400 transition hover:bg-emerald-200 hover:text-emerald-700">
                    <i class="pi pi-times text-[10px]"></i>
                  </button>
                </span>
                <p v-if="!formData.order_notification_whatsapp.length" class="text-sm italic text-slate-400">
                  {{ t('settings.order_notification_whatsappEmpty') }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Social Media -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-100">
          <div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-600 text-white shadow-sm">
              <i class="pi pi-share-alt text-sm"></i>
            </span>
            <div>
              <h2 class="text-base font-bold text-slate-800">{{ t('settings.socialLinks') }}</h2>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
            <div>
              <label class="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <i class="pi pi-facebook text-blue-600"></i> Facebook
              </label>
              <InputText v-model="formData.facebook" placeholder="https://facebook.com/..." class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>
            <div>
              <label class="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <i class="pi pi-instagram text-pink-600"></i> Instagram
              </label>
              <InputText v-model="formData.instagram" placeholder="https://instagram.com/..." class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>
            <div>
              <label class="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <i class="pi pi-youtube text-red-600"></i> YouTube
              </label>
              <InputText v-model="formData.youtube" placeholder="https://youtube.com/..." class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>
            <div>
              <label class="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <i class="pi pi-snapchat text-yellow-500"></i> Snapchat
              </label>
              <InputText v-model="formData.snapchat" placeholder="https://snapchat.com/..." class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>
            <div class="md:col-span-2">
              <label class="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <i class="pi pi-tiktok"></i> TikTok
              </label>
              <InputText v-model="formData.tiktok" placeholder="https://tiktok.com/..." class="w-full !rounded-xl !border-slate-200 !py-2.5" />
            </div>
          </div>
        </section>

        <!-- Cart Image -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-100">
          <div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
              <i class="pi pi-image text-sm"></i>
            </span>
            <div>
              <h2 class="text-base font-bold text-slate-800">{{ t('settings.cartImage') || 'Cart Image' }}</h2>
            </div>
          </div>

          <div class="p-6">
            <div class="max-w-md">
              <label @dragover.prevent="handleCartImageDragOver" @dragleave="handleCartImageDragLeave"
                @drop.prevent="handleCartImageDrop"
                class="block min-h-[280px] cursor-pointer rounded-2xl border-2 border-dashed p-6 transition-all duration-200"
                :class="isDraggingCartImage
                  ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/40 hover:border-indigo-400 hover:bg-indigo-50/40'">
                <input type="file" @change="e => handleCartImageSelect(e.target.files[0])" accept="image/*" class="hidden" />

                <!-- Image Preview -->
                <div v-if="cartImagePreview" class="group relative">
                  <img :src="cartImagePreview" alt="Cart Image Preview"
                    class="h-64 w-full rounded-xl object-contain shadow-md" />
                  <div class="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-all group-hover:opacity-100">
                    <div class="flex gap-3">
                      <Button type="button" icon="pi pi-trash" severity="danger" rounded @click.stop="removeCartImage" />
                      <label @click.stop>
                        <Button type="button" icon="pi pi-pencil" severity="secondary" rounded />
                        <input type="file" @change="e => handleCartImageSelect(e.target.files[0])" accept="image/*" class="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Upload Placeholder -->
                <div v-else class="flex flex-col items-center justify-center py-12 text-center">
                  <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                    <i class="pi pi-image text-4xl text-indigo-600"></i>
                  </div>
                  <p class="font-medium text-slate-700">
                    {{ t('brand.upload') || 'Click to upload' }}
                    <span class="text-indigo-600">{{ t('brand.orDrag') || 'or drag & drop' }}</span>
                  </p>
                  <p class="mt-2 text-xs text-slate-400">PNG, JPG, JPEG</p>
                </div>
              </label>
            </div>
          </div>
        </section>

        <!-- Privacy Policy -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-100">
          <div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <i class="pi pi-shield text-sm"></i>
            </span>
            <div>
              <h2 class="text-base font-bold text-slate-800">{{ t('settings.privacyPolicy') }}</h2>
            </div>
          </div>

          <div class="p-6">
            <TabView>
              <TabPanel :header="t('settings.privacy_policy_ar')">
                <Editor v-model="formData.privacy_policy_ar" editorStyle="height: 320px" :modules="editorOptions.modules"
                  class="overflow-hidden rounded-xl border border-slate-200" />
              </TabPanel>
              <TabPanel :header="t('settings.privacy_policy_en')">
                <Editor v-model="formData.privacy_policy_en" editorStyle="height: 320px" :modules="editorOptions.modules"
                  class="overflow-hidden rounded-xl border border-slate-200" />
              </TabPanel>
            </TabView>
          </div>
        </section>

        <!-- Terms & Conditions -->
        <section class="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm shadow-slate-100">
          <div class="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <i class="pi pi-file-edit text-sm"></i>
            </span>
            <div>
              <h2 class="text-base font-bold text-slate-800">{{ t('settings.termsConditions') }}</h2>
            </div>
          </div>

          <div class="p-6">
            <TabView>
              <TabPanel :header="t('settings.terms_conditions_ar')">
                <Editor v-model="formData.terms_conditions_ar" editorStyle="height: 320px" :modules="editorOptions.modules"
                  class="overflow-hidden rounded-xl border border-slate-200" />
              </TabPanel>
              <TabPanel :header="t('settings.terms_conditions_en')">
                <Editor v-model="formData.terms_conditions_en" editorStyle="height: 320px" :modules="editorOptions.modules"
                  class="overflow-hidden rounded-xl  border border-slate-200" />
              </TabPanel>
            </TabView>
          </div>
        </section>

        <!-- Save Bar -->
        <div class="sticky bottom-4 z-10 flex justify-end">
          <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg shadow-slate-200/60 backdrop-blur">
            <Button :label="t('settings.updateButton')" icon="pi pi-check" :loading="isLoading"
              class="!rounded-xl !px-8 !py-2.5 !text-base !font-semibold" @click="updateSettings" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
