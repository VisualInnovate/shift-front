<template>
  <va-card class="card my-4 p-[2%] min-h-[50vh] max-w-7xl m-auto">
    <div class="flex">
      <div class="w-full">
        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <ProgressSpinner style="width: 50px; height: 50px" />
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center text-red-500 py-10">
          <p class="text-lg font-semibold">{{ $t('error.title') }}</p>
          <p>{{ error }}</p>
        </div>

        <!-- Privacy Policy Content -->
        <div
          v-else-if="currentPrivacyPolicy"
          class="prose max-w-none"
          :dir="appLang === 'ar' ? 'rtl' : 'ltr'"
          v-html="sanitizedPrivacyPolicy"
        />

        <!-- Empty State -->
        <div v-else class="text-center text-gray-600 py-10">
          <p>{{ $t('privacyPolicy.noContent') }}</p>
        </div>
      </div>
    </div>

    <Toast />
  </va-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import DOMPurify from 'dompurify';

const { t } = useI18n();
const toast = useToast();

// Get app language from localStorage
const getAppLang = () => localStorage.getItem('appLang') || 'en';
const appLang = ref(getAppLang());

/* ------------------------------------------------------------------ */
/* Reactive data                                                      */
/* ------------------------------------------------------------------ */
const settings = ref([]);     // Full array from API
const isLoading = ref(false);
const error = ref(null);

/* ------------------------------------------------------------------ */
/* Helper: Get setting value by key                                   */
/* ------------------------------------------------------------------ */
const getSettingValue = (key) => {
  const item = settings.value.find(s => s.key === key);
  return item?.value || '';
};

/* ------------------------------------------------------------------ */
/* Computed: Current Privacy Policy based on language                 */
/* ------------------------------------------------------------------ */
const currentPrivacyPolicy = computed(() => {
  return appLang.value === 'ar'
    ? getSettingValue('privacy_policy_ar')
    : getSettingValue('privacy_policy_en');
});

/* ------------------------------------------------------------------ */
/* Sanitized HTML output                                              */
/* ------------------------------------------------------------------ */
const sanitizedPrivacyPolicy = computed(() => {
  return DOMPurify.sanitize(currentPrivacyPolicy.value);
});

/* ------------------------------------------------------------------ */
/* Load settings data                                                 */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get('/api/setting/not-auth');

    if (data.is_success && Array.isArray(data.data)) {
      settings.value = data.data;

      // Show warning if no privacy policy content
      if (!currentPrivacyPolicy.value) {
        toast.add({
          severity: 'warn',
          summary: t('privacyPolicy.warning') || t('common.warning'),
          detail: t('privacyPolicy.noContent'),
          life: 4000,
        });
      }
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (e) {
    const message = e.response?.data?.message || t('error.loadPrivacyPolicy') || 'Failed to load privacy policy';
    error.value = message;

    toast.add({
      severity: 'error',
      summary: t('error.title'),
      detail: message,
      life: 5000,
    });
    console.error('Privacy Policy load error:', e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.card {
  margin: 10px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Enhanced prose styling for rich text (supports Quill editor output) */
.prose {
  color: #374151;
  line-height: 1.8;
  font-size: 1.05rem;
}

.prose h1,
.prose h2,
.prose h3,
.prose strong {
  color: #1f2937;
  font-weight: 700;
  margin: 1.5rem 0 0.75rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul,
.prose ol {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

/* RTL Support for Arabic */
[dir="rtl"] .prose {
  text-align: right;
}

[dir="rtl"] .prose ul,
[dir="rtl"] .prose ol {
  padding-right: 1.5rem;
  padding-left: 0;
  list-style-position: outside;
}

/* Quill Editor specific classes */
.prose .ql-align-right { text-align: right; }
.prose .ql-align-center { text-align: center; }
.prose .ql-align-justify { text-align: justify; }
</style>
