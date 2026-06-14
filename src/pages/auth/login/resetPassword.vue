<template>
  <form @submit.prevent="submitReset" class="space-y-6">
    <div class="text-center space-y-2">
      <h2 class="text-xl font-black text-[#0b3baa]">
        {{ t('authPasswordReset.resetTitle') }}
      </h2>
      <p class="text-sm text-gray-500 leading-6 break-words">
        {{ t('authPasswordReset.resetDescription', { email }) }}
      </p>
    </div>

    <div
      v-if="successMessage"
      class="p-4 text-sm text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-100/60 shadow-sm"
      role="status"
    >
      {{ successMessage }}
    </div>

    <div
      v-if="errors.length"
      class="p-4 text-sm text-red-800 rounded-2xl bg-red-50 border border-red-100/60 shadow-sm"
      role="alert"
    >
      <p v-for="error in errors" :key="error" class="font-medium">
        {{ error }}
      </p>
    </div>

    <div class="space-y-5">
      <div class="w-full">
        <span class="p-float-label w-full block">
          <InputText
            id="reset-email"
            v-model="email"
            type="email"
            readonly
            class="w-full px-4 py-4 rounded-xl border border-gray-200 transition-all duration-200 bg-gray-100 outline-none text-gray-700 text-sm font-medium cursor-not-allowed"
          />
          <label
            for="reset-email"
            class="absolute inset-x-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none"
          >
            {{ t('authPasswordReset.readonlyEmail') }}
          </label>
        </span>
      </div>

      <div class="space-y-3">
        <label class="block text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
          {{ t('authPasswordReset.otpLabel') }}
        </label>
        <div class="flex justify-center gap-2 sm:gap-3" dir="ltr">
          <input
            v-for="(_, i) in digits"
            :key="i"
            :ref="(el) => setRef(el, i)"
            :aria-label="t('authPasswordReset.otpDigit', { number: i + 1 })"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="otp-box"
            :value="digits[i]"
            @input="onInput($event, i)"
            @keydown="onKeydown($event, i)"
            @paste="onPaste($event)"
          />
        </div>
        <p class="text-xs text-gray-500 text-center">
          {{ t('authPasswordReset.otpHelp') }}
        </p>
      </div>

      <div class="w-full">
        <span class="p-float-label w-full block">
          <InputText
            id="reset-password"
            v-model="password"
            type="password"
            :placeholder="t('authPasswordReset.newPasswordPlaceholder')"
            class="w-full px-4 py-4 rounded-xl border border-gray-200 transition-all duration-200 focus:border-[#0b3baa] focus:ring-4 focus:ring-[#0b3baa]/10 bg-gray-50/50 focus:bg-white outline-none text-gray-900 text-sm font-medium"
          />
          <label
            for="reset-password"
            class="absolute inset-x-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none"
          >
            {{ t('authPasswordReset.newPassword') }}
          </label>
        </span>
      </div>

      <div class="w-full">
        <span class="p-float-label w-full block">
          <InputText
            id="reset-password-confirmation"
            v-model="passwordConfirmation"
            type="password"
            :placeholder="t('authPasswordReset.confirmPasswordPlaceholder')"
            class="w-full px-4 py-4 rounded-xl border border-gray-200 transition-all duration-200 focus:border-[#0b3baa] focus:ring-4 focus:ring-[#0b3baa]/10 bg-gray-50/50 focus:bg-white outline-none text-gray-900 text-sm font-medium"
          />
          <label
            for="reset-password-confirmation"
            class="absolute inset-x-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-gray-400 transition-all duration-200 pointer-events-none"
          >
            {{ t('authPasswordReset.confirmPassword') }}
          </label>
        </span>
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading || otpLoading"
      class="w-full py-3.5 px-4 text-white font-bold text-sm uppercase tracking-widest rounded-xl bg-[#0b3baa] hover:bg-[#082d8a] active:scale-[0.985] transform transition-all duration-200 shadow-lg shadow-[#0b3baa]/10 hover:shadow-xl hover:shadow-[#0b3baa]/20 focus:outline-none focus:ring-2 focus:ring-[#0b3baa] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {{ loading ? t('authPasswordReset.confirming') : t('authPasswordReset.confirm') }}
    </button>

    <div class="text-center">
      <router-link
        :to="{ name: 'login' }"
        class="text-sm font-bold text-[#0b3baa] hover:text-[#082d8a] hover:underline transition-colors"
      >
        {{ t('authPasswordReset.backToLogin') }}
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import InputText from 'primevue/inputtext'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const routeEmail = typeof route.query.email === 'string' ? route.query.email : ''
const email = ref(routeEmail)
const password = ref('')
const passwordConfirmation = ref('')
const digits = ref<string[]>(Array(6).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])
const errors = ref<string[]>([])
const successMessage = ref('')
const loading = ref(false)
const otpLoading = ref(false)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const otpCode = computed(() => digits.value.join(''))

function setRef(el: unknown, i: number) {
  if (el) inputRefs.value[i] = el as HTMLInputElement
}

function onInput(event: Event, i: number) {
  const target = event.target as HTMLInputElement
  const val = target.value.replace(/\D/g, '').slice(-1)
  digits.value[i] = val
  target.value = val
  if (val && i < 5) inputRefs.value[i + 1]?.focus()
}

function onKeydown(event: KeyboardEvent, i: number) {
  if (event.key === 'Backspace' && !digits.value[i] && i > 0) {
    inputRefs.value[i - 1]?.focus()
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''
  pasted.split('').forEach((char, i) => {
    digits.value[i] = char
    if (inputRefs.value[i]) inputRefs.value[i].value = char
  })
  inputRefs.value[Math.min(pasted.length, 5)]?.focus()
}

function extractErrors(error: unknown, fallback: string) {
  const responseData = (error as { response?: { data?: { errors?: unknown; message?: string } } }).response?.data

  if (responseData?.errors) {
    if (Array.isArray(responseData.errors)) {
      return responseData.errors.map(String)
    }

    if (typeof responseData.errors === 'object') {
      return Object.values(responseData.errors as Record<string, unknown>).flat().map(String)
    }
  }

  return [responseData?.message || fallback]
}

function validateEmail() {
  if (!email.value) {
    errors.value = [t('authPasswordReset.missingEmail')]
    return false
  }

  if (!emailRegex.test(email.value)) {
    errors.value = [t('authPasswordReset.invalidEmail')]
    return false
  }

  return true
}

async function sendOtp() {
  successMessage.value = ''
  errors.value = []

  if (!validateEmail()) return

  otpLoading.value = true

  try {
    const response = await axios.post('/api/send-otp', {
      email: email.value,
      otp_type: 'email',
    })

    if (response.data?.is_success === false) {
      errors.value = [response.data?.message || t('authPasswordReset.otpSentError')]
      return
    }

    successMessage.value = t('authPasswordReset.otpSentSuccess')
  } catch (error) {
    errors.value = extractErrors(error, t('authPasswordReset.otpSentError'))
  } finally {
    otpLoading.value = false
  }
}

function validateForm() {
  errors.value = []

  if (!validateEmail()) return false

  if (!otpCode.value || otpCode.value.length !== 6) {
    errors.value = [t('authPasswordReset.invalidOtp')]
    return false
  }

  if (!password.value || !passwordConfirmation.value) {
    errors.value = [t('authPasswordReset.requiredFields')]
    return false
  }

  if (password.value !== passwordConfirmation.value) {
    errors.value = [t('authPasswordReset.passwordMismatch')]
    return false
  }

  return true
}

async function submitReset() {
  successMessage.value = ''

  if (!validateForm()) return

  loading.value = true

  try {
    const response = await axios.post('/api/change-password', {
      email: email.value,
      otp: otpCode.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })

    if (response.data?.is_success === false) {
      errors.value = [response.data?.message || t('authPasswordReset.changeError')]
      return
    }

    await router.push({
      name: 'login',
      query: { passwordChanged: '1' },
    })
  } catch (error) {
    errors.value = extractErrors(error, t('authPasswordReset.changeError'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await sendOtp()
  await nextTick()
  inputRefs.value[0]?.focus()
})
</script>

<style scoped>
:deep(.p-float-label) {
  position: relative;
}

:deep(.p-float-label) label {
  left: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.p-float-label input:focus ~ label),
:deep(.p-float-label input.p-filled ~ label),
:deep(.p-float-label input[readonly] ~ label) {
  top: -0.1rem !important;
  font-size: 0.7rem !important;
  font-weight: 800 !important;
  color: #0b3baa !important;
  background-color: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid rgba(249, 192, 6, 0.4);
}

.otp-box {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  background-color: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
  caret-color: #0b3baa;
}

.otp-box:focus {
  background-color: white;
  border-color: #0b3baa;
  box-shadow: 0 0 0 4px rgba(11, 59, 170, 0.12);
}

@media (max-width: 420px) {
  .otp-box {
    width: 40px;
    height: 50px;
    font-size: 1.25rem;
  }
}
</style>
