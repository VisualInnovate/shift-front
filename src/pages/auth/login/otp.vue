<template>
  <form @submit.prevent="submitOtp" class="space-y-8">
    <div v-if="authStore.authErrors.length" class="text-red-500 text-sm text-center">
      {{ authStore.authErrors[0] }}
    </div>

    <div class="text-center space-y-2">
      <h2 class="text-2xl font-bold" style="color: #1a1a1a">Enter Verification Code</h2>
      <p class="text-gray-500 text-sm">
        A 6-digit code has been sent to<br />
        <strong style="color: #1a1a1a">{{ email }}</strong>
      </p>
    </div>

    <div class="flex justify-center gap-3">
      <input
        v-for="(_, i) in digits"
        :key="i"
        :ref="(el) => setRef(el, i)"
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

    <div class="flex justify-center mt-4">
      <button
        style="background-color: #d7a648 !important; border-radius: 10px; color: white"
        class="w-full lg:w-[50%] py-2 text-lg font-semibold"
        type="submit"
        :disabled="authStore.loading || otpCode.length < 6"
      >
        {{ authStore.loading ? 'Verifying...' : 'Verify' }}
      </button>
    </div>

    <div class="flex justify-center">
      <button
        type="button"
        class="text-sm underline"
        style="color: #d7a648"
        @click="resendOtp"
        :disabled="authStore.otpLoading"
      >
        {{ authStore.otpLoading ? 'Sending...' : "Didn't receive a code? Resend" }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../../stores/Auth'

const route = useRoute()
const authStore = useAuthStore()

const email = route.params.email as string
const otp_type = route.params.otp_type as string

const digits = ref<string[]>(Array(6).fill(''))
const inputRefs = ref<HTMLInputElement[]>([])

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
  const next = Math.min(pasted.length, 5)
  inputRefs.value[next]?.focus()
}

async function resendOtp() {
  await authStore.handleSendOtp({ email, otp_type })
}

async function submitOtp() {
  if (otpCode.value.length < 6) return
  await authStore.handleVerifyOtp({ email, otp: otpCode.value })
}

onMounted(() => {
  authStore.handleSendOtp({ email, otp_type })
  inputRefs.value[0]?.focus()
})
</script>

<style scoped>
.otp-box {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  background-color: #faf7f2;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s;
  caret-color: #d7a648;
}

.otp-box:focus {
  border-color: #d7a648;
  box-shadow: 0 0 0 3px rgba(215, 166, 72, 0.15);
}
</style>
