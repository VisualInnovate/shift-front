<template>
  <div class="bg-gray-900 min-h-screen flex items-start justify-center p-4 overflow-hidden">
    <div class="bg-white rounded-3xl shadow-2xl p-4 w-full max-w-sm sm:max-w-lg my-8">
      <div class="flex flex-col items-center mb-8">
        <img src="../../../../../assets/shiftlogo.png" alt="SHIFT7 Logo" class="h-16 w-16 object-contain" />
      </div>

      <div class="bg-gray-100 rounded-xl p-1 mb-8 flex transition-all duration-300">
        <button @click="selectedTab = 'phone'" :class="[
          'flex-1 mx-2 py-3 px-4 rounded-xl font-bold transition-colors duration-300',
          selectedTab === 'phone' ? 'bg-yellow-400 text-gray-700' : 'bg-white text-gray-500'
        ]" :aria-label="t('login.phoneTab')">
          {{ t('login.phoneTab') }}
        </button>
        <button @click="selectedTab = 'email'" :class="[
          'flex-1 mx-2 py-3 px-4 rounded-xl font-bold transition-colors duration-300',
          selectedTab === 'email' ? 'bg-yellow-400 text-gray-700' : 'bg-white text-gray-500'
        ]" :aria-label="t('login.emailTab')">
          {{ t('login.emailTab') }}
        </button>
      </div>

      <form @submit.prevent="handleLogin" v-if="selectedTab === 'phone'" class="space-y-6">
        <div class="flex">
          <select v-model="countryCode"
            class="w-1/3 px-4 py-3 rounded-tr-xl rounded-br-xl bg-gray-100 text-gray-700 focus:outline-none transition-shadow"
            :class="{ 'text-right': $i18n.locale === 'ar', 'text-left': $i18n.locale !== 'ar' }" required>
            <option value="" disabled>{{ t('login.selectCountry') }}</option>
            <option v-for="country in countries" :key="country.code" :value="country.code">
              {{ $i18n.locale === 'ar' ? country.name_ar : country.name_en }} ({{ country.code }})
            </option>
          </select>
          <input type="number" v-model="phoneNumber" :placeholder="t('login.phonePlaceholder')"
            class="w-2/3 px-4 py-3 rounded-tl-xl rounded-bl-xl bg-gray-100 text-gray-700 focus:outline-none transition-shadow"
            :class="{ 'text-right': $i18n.locale === 'ar', 'text-left': $i18n.locale !== 'ar' }" required
            pattern="[0-9]{9,12}" />
        </div>

        <button type="submit"
          class="w-full mt-8 py-3 bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-colors duration-300"
          :disabled="authStore.loading">
          {{ authStore.loading ? t('login.loading') : t('login.submit') }}
        </button>

        <div v-if="errors.length" class="text-red-600 text-sm text-center">
          <p v-for="error in errors" :key="error">{{ error }}</p>
        </div>
      </form>

      <form @submit.prevent="handleLogin" v-else class="space-y-6">
        <input type="email" v-model="email" :placeholder="t('login.emailPlaceholder')"
          class="w-full px-4 py-3 rounded-xl bg-gray-100 placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          :class="{ 'text-right': $i18n.locale === 'ar', 'text-left': $i18n.locale !== 'ar' }" required />

        <button type="submit"
          class="w-full mt-8 py-3 bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:bg-blue-800 transition-colors duration-300"
          :disabled="authStore.loading">
          {{ authStore.loading ? t('login.loading') : t('login.submit') }}
        </button>

        <div v-if="errors.length" class="text-red-600 text-sm text-center">
          <p v-for="error in errors" :key="error">{{ error }}</p>
        </div>
      </form>

      <div class="flex items-center my-6">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="mx-4 text-gray-400 text-xs font-semibold">{{ t('login.or') }}</span>
        <div class="flex-grow border-t border-gray-300"></div>
      </div>

      <div class="mt-8 text-center text-sm text-gray-500">
        {{ t('login.noAccount') }}
        <a @click="router.push({ name: 'register' })"
          class="text-blue-600 cursor-pointer font-semibold hover:underline">
          {{ t('login.register') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuthStore } from '../../../../../stores/WebAuth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const selectedTab = ref('phone');
const phoneNumber = ref('');
const countryCode = ref('+962');
const email = ref('');
const authStore = useAuthStore();
const errors = ref([]);

const countries = [
  { name_ar: 'السعودية', name_en: 'Saudi Arabia', code: '+966' },
  { name_ar: 'الإمارات', name_en: 'United Arab Emirates', code: '+971' },
  { name_ar: 'مصر', name_en: 'Egypt', code: '+20' },
  { name_ar: 'الكويت', name_en: 'Kuwait', code: '+965' },
  { name_ar: 'قطر', name_en: 'Qatar', code: '+974' },
  { name_ar: 'الجزائر', name_en: 'Algeria', code: '+213' },
  { name_ar: 'البحرين', name_en: 'Bahrain', code: '+973' },
  { name_ar: 'جزر القمر', name_en: 'Comoros', code: '+269' },
  { name_ar: 'جيبوتي', name_en: 'Djibouti', code: '+253' },
  { name_ar: 'العراق', name_en: 'Iraq', code: '+964' },
  { name_ar: 'الأردن', name_en: 'Jordan', code: '+962' },
  { name_ar: 'لبنان', name_en: 'Lebanon', code: '+961' },
  { name_ar: 'ليبيا', name_en: 'Libya', code: '+218' },
  { name_ar: 'المغرب', name_en: 'Morocco', code: '+212' },
  { name_ar: 'موريتانيا', name_en: 'Mauritania', code: '+222' },
  { name_ar: 'عمان', name_en: 'Oman', code: '+968' },
  { name_ar: 'فلسطين', name_en: 'Palestine', code: '+970' },
  { name_ar: 'الصومال', name_en: 'Somalia', code: '+252' },
  { name_ar: 'السودان', name_en: 'Sudan', code: '+249' },
  { name_ar: 'سوريا', name_en: 'Syria', code: '+963' },
  { name_ar: 'تونس', name_en: 'Tunisia', code: '+216' },
  { name_ar: 'اليمن', name_en: 'Yemen', code: '+967' },
];

watch(selectedTab, () => {
  errors.value = [];
});

watch(phoneNumber, () => {
  if (!/^[1-9][0-9]*$/.test(phoneNumber.value)) {
    phoneNumber.value = '';

  }
});

const handleLogin = async () => {
  errors.value = [];
  // Password removed from the data object
  const data = selectedTab.value === 'phone'
    ? { type: 'phone', phoneNumber: phoneNumber.value, countryCode: countryCode.value }
    : { type: 'email', email: email.value };

  const result = await authStore.handleLogin(data);
  if (!result.is_success) {
    errors.value = result.errors;
  }
};
</script>

<style scoped>
[dir="rtl"] .text-right {
  text-align: right;
}

[dir="ltr"] .text-left {
  text-align: left;
}
</style>
