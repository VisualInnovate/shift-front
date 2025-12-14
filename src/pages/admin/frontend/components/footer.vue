<template>
  <footer class="bg-[#1e3a8a] text-white py-12 px-6">
    <div class="max-w-7xl mx-auto">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
        <!-- Logo Section -->
        <div>
          <div class="flex items-center space-x-2 mb-4">
            <img
              src="../../../../assets/footer-logo.png"
              alt="Shift7 Logo"
              class="h-12 w-auto object-contain"
            />
          </div>
        </div>

        <!-- Categories (keep static or make dynamic later) -->
        <div>
          <h3 class="text-lg font-semibold mb-4">الأقسام</h3>
          <ul class="space-y-2 text-gray-200">
            <li><a href="#" class="hover:text-white transition-colors">بطاريات ولمبات</a></li>
            <li><a href="#" class="hover:text-white transition-colors">مستلزمات الحيوانات الأليفة</a></li>
            <li><a href="#" class="hover:text-white transition-colors">مكياج</a></li>
            <li><a href="#" class="hover:text-white transition-colors">مكتبة الكتب</a></li>
            <li><a href="#" class="hover:text-white transition-colors">ألعاب</a></li>
            <li><a href="#" class="hover:text-white transition-colors">العناية الشخصية</a></li>
            <li><a href="#" class="hover:text-white transition-colors">أطفال</a></li>
            <li><a href="#" class="hover:text-white transition-colors">أحذية</a></li>
            <li><a href="#" class="hover:text-white transition-colors">أدوات منزلية</a></li>
            <li><a href="#" class="hover:text-white transition-colors">إلكترونيات</a></li>
          </ul>
        </div>

        <!-- Stores & Markets -->
        <div>
          <h3 class="text-lg font-semibold mb-4">المتاجر والأسواق</h3>
          <ul class="space-y-2 text-gray-200">
            <li><a href="#" class="hover:text-white transition-colors">Shift7 Mall</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Shift7 mart</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Centro</a></li>
          </ul>
        </div>

        <!-- Contact (Dynamic from API) -->
        <div>
          <h3 class="text-lg font-semibold mb-4">تواصل معنا</h3>
          <div class="space-y-3 text-gray-200">
            <p v-if="phone">
              <span class="block text-sm">رقم الهاتف:</span>
              <a :href="`tel:${phone}`" class="hover:text-white transition-colors">
                {{ formatPhone(phone) }}
              </a>
            </p>
            <p v-if="email">
              <span class="block text-sm">البريد الإلكتروني:</span>
              <a :href="`mailto:${email}`" class="hover:text-white transition-colors">
                {{ email }}
              </a>
            </p>
          </div>
        </div>

        <!-- Social Media (Dynamic from API) -->
        <div>
          <h3 class="text-lg font-semibold mb-4">تابعنا</h3>
          <div class="flex space-x-4 space-x-reverse">
            <a
              v-if="facebook"
              :href="ensureHttps(facebook)"
              target="_blank"
              rel="noopener"
              class="hover:opacity-80 transition-opacity"
              aria-label="Facebook"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            <a
              v-if="instagram"
              :href="ensureHttps(instagram)"
              target="_blank"
              rel="noopener"
              class="hover:opacity-80 transition-opacity"
              aria-label="Instagram"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            <a
              v-if="twitter"
              :href="ensureHttps(twitter)"
              target="_blank"
              rel="noopener"
              class="hover:opacity-80 transition-opacity"
              aria-label="Twitter"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>

            <a
              v-if="youtube"
              :href="ensureHttps(youtube)"
              target="_blank"
              rel="noopener"
              class="hover:opacity-80 transition-opacity"
              aria-label="YouTube"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            <a
              v-if="tiktok"
              :href="ensureHttps(tiktok)"
              target="_blank"
              rel="noopener"
              class="hover:opacity-80 transition-opacity"
              aria-label="TikTok"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.69 4.3a6.48 6.48 0 01-3.7-1.9v8.66a4.15 4.15 0 11-4.15-4.15v-4.2a8.35 8.35 0 108.35 8.35v-4.58a6.49 6.49 0 004.5-6.18z"/>
              </svg>
            </a>

            <a
              v-if="snapchat"
              :href="ensureHttps(snapchat)"
              target="_blank"
              rel="noopener"
              class="hover:opacity-80 transition-opacity"
              aria-label="Snapchat"
            >
             <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.633 3.978C17.646 4.153 17.646 4.327 17.646 4.501C17.646 9.826 13.593 15.962 6.186 15.962C3.904 15.962 1.784 15.301 0 14.153C0.324 14.19 0.636 14.203 0.973 14.203C2.856 14.203 4.589 13.567 5.974 12.482C4.203 12.445 2.719 11.285 2.207 9.689C2.456 9.726 2.706 9.751 2.968 9.751C3.329 9.751 3.692 9.701 4.029 9.614C2.182 9.24 0.799 7.619 0.799 5.661V5.611C1.336 5.91 1.959 6.097 2.619 6.122C1.534 5.4 0.823 4.165 0.823 2.768C0.823 2.02 1.022 1.334 1.371 0.736C3.354 3.179 6.335 4.776 9.677 4.951C9.615 4.651 9.577 4.34 9.577 4.028C9.577 1.808 11.373 0 13.605 0C14.765 0 15.812 0.486 16.548 1.272C17.458 1.097 18.33 0.76 19.104 0.299C18.805 1.234 18.168 2.02 17.333 2.519C18.144 2.431 18.93 2.207 19.652 1.895C19.104 2.693 18.419 3.404 17.633 3.978Z" fill="white"/>
            </svg>

            </a>
          </div>
        </div>
      </div>

      <!-- Legal Links & Copyright -->
      <div class="border-t border-blue-800 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
          <!-- Legal Links -->
          <div class="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mb-4 md:mb-0">
            <a :href="privacyPolicyLink" class="hover:text-white transition-colors">
              سياسة الخصوصية
            </a>
            <span class="hidden md:inline text-gray-500">|</span>
            <a :href="termsLink" class="hover:text-white transition-colors">
              الشروط والأحكام
            </a>
          </div>

          <!-- Copyright -->
          <p class="text-center md:text-right">
            © {{ new Date().getFullYear() }} Shift7 - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const { t } = useI18n();
const toast = useToast();

// Language from localStorage
const appLang = ref(localStorage.getItem('appLang') || 'en');

// Reactive data
const settings = ref([]);
const isLoading = ref(false);

// Helper to get setting value by key
const getSetting = (key) => {
  const item = settings.value.find(s => s.key === key);
  return item ? item.value.trim() : '';
};

// Computed values from API
const phone = computed(() => getSetting('phone'));
const email = computed(() => getSetting('email'));
const facebook = computed(() => getSetting('facebook'));
const instagram = computed(() => getSetting('instagram'));
const youtube = computed(() => getSetting('youtube'));
const tiktok = computed(() => getSetting('tiktok'));
const snapchat = computed(() => getSetting('snapchat'));
const twitter = computed(() => getSetting('twitter')); // if you have a twitter key

// Privacy & Terms URLs (language-aware)
const privacyPolicyLink = computed(() =>
  appLang.value === 'ar' ? '/privacy-policy-ar' : '/privacy-policy-en'
);

const termsLink = computed(() =>
  appLang.value === 'ar' ? '/terms-conditions-ar' : '/terms-conditions-en'
);

// Format phone number nicely
const formatPhone = (num) => {
  if (!num) return '';
  return num.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  return num;
};

// Ensure URL has https://
const ensureHttps = (url) => {
  if (!url) return '#';
  if (url.startsWith('http')) return url;
  return 'https://' + url.replace(/^https?:\/\//, '');
};

// Load settings on mount
onMounted(async () => {
  isLoading.value = true;
  try {
    const { data } = await axios.get('/api/setting/not-auth');

    if (data.is_success && Array.isArray(data.data)) {
      settings.value = data.data;
    } else {
      throw new Error('Invalid response');
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'خطأ',
      detail: 'فشل تحميل إعدادات الفوتر',
      life: 5000
    });
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Optional: add loading spinner if needed */
</style>
