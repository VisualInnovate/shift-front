<template>
  <div class="bg-gradient-to-br from-gray-100 to-blue-100 min-h-screen p-4 md:p-8">
    <!-- Header -->
    <div class="mb-8 text-right">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{{ t('dashboard.title') }}</h1>
      <p class="text-lg text-gray-600">{{ t('dashboard.subtitle') }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <!-- Total Users -->
      <div class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border-r-4 border-blue-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ t('dashboard.totalUsers') }}</p>
            <h3 class="text-3xl font-bold text-gray-800 mt-2">{{ data.total_users }}</h3>
          </div>
          <div class="bg-blue-100 p-3 rounded-lg">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Products -->
      <div class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border-r-4 border-green-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ t('dashboard.totalProducts') }}</p>
            <h3 class="text-3xl font-bold text-gray-800 mt-2">{{ data.total_products }}</h3>
          </div>
          <div class="bg-green-100 p-3 rounded-lg">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0v6l-8 4m0-10l-8 4m8 4V3m-8 4v6" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Sales -->
      <div class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border-r-4 border-orange-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ t('dashboard.totalSales') }}</p>
            <h3 class="text-3xl font-bold text-gray-800 mt-2">
              {{ formatCurrency(data.total_sales) }}{{ $t("currencyLabel") }}
            </h3>
          </div>
          <div class="bg-orange-100 p-3 rounded-lg">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Stores -->
      <div class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-all duration-300 border-r-4 border-purple-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-500">{{ t('dashboard.totalStores') }}</p>
            <h3 class="text-3xl font-bold text-gray-800 mt-2">{{ data.total_stores }}</h3>
          </div>
          <div class="bg-purple-100 p-3 rounded-lg">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Top Selling Products Chart -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ t('dashboard.topSellingProducts') }}</h2>
        <div class="relative h-80">
          <canvas ref="topSellingChart"></canvas>
        </div>
      </div>

      <!-- Sales Summary Chart -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ t('dashboard.salesSummary') }}</h2>
        <div class="relative h-80">
          <canvas ref="salesSummaryChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Least Selling Products + Recent Activity Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Least Selling Products -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">{{ t('dashboard.leastSellingProducts') || 'Least Selling Products' }}</h2>
        <div class="relative h-80">
          <canvas ref="leastSellingChart"></canvas>
        </div>
      </div>

      <!-- Recent Activity (You can populate this later from API if needed) -->
      <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-800">{{ t('dashboard.recentActivity') }}</h2>
        </div>
        <div class="p-6 text-center text-gray-500 py-12" v-if="recentActivities.length === 0">
          {{ t('dashboard.noRecentActivity') || 'No recent activity yet' }}
        </div>
        <!-- Add activity items here when you have real data -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

Chart.register(...registerables);

const { t } = useI18n();

const topSellingChart = ref<HTMLCanvasElement | null>(null);
const salesSummaryChart = ref<HTMLCanvasElement | null>(null);
const leastSellingChart = ref<HTMLCanvasElement | null>(null);

const data = ref({
  total_users: 0,
  total_products: 0,
  total_stores: 0,
  total_sales: '0.00',
  top_selling_products: [] as Array<any>,
  least_selling_products: [] as Array<any>,
  sales_summary: {
    months: [] as Array<{
      month_name_ar: string;
      month_name_en: string;
      total_sales: number;
    }>,
  },
});

const recentActivities = ref([]); // Populate from API later if needed

const formatCurrency = (value: string | number) => {
  return parseFloat(String(value)).toFixed(2);
};

const fetchData = async () => {
  try {
    const response = await axios.get('api/dashboard');
    data.value = response.data.data;

    // Top Selling Products Chart
    if (topSellingChart.value && data.value.top_selling_products.length) {
      new Chart(topSellingChart.value, {
        type: 'bar',
        data: {
          labels: data.value.top_selling_products.map(p =>
            t('dashboard.language') === 'ar' ? p.name_ar : p.name_en
          ),
          datasets: [{
            label: t('dashboard.topSellingProducts'),
            data: data.value.top_selling_products.map(p => p.order_item_count),
            backgroundColor: '#3B82F6',
            borderRadius: 8,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false }, ticks: { maxRotation: 45, minRotation: 45 } },
          },
        },
      });
    }

    // Sales Summary Chart (Real Data)
    if (salesSummaryChart.value && data.value.sales_summary?.months?.length) {
      const months = data.value.sales_summary.months;
      new Chart(salesSummaryChart.value, {
        type: 'line',
        data: {
          labels: months.map(m => t('dashboard.language') === 'ar' ? m.month_name_ar : m.month_name_en),
          datasets: [{
            label: t('dashboard.sales'),
            data: months.map(m => m.total_sales),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#10B981',
            pointRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}${ $t("currencyLabel") }`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { callback: (v) => `$${Number(v).toLocaleString()}` }
            },
            x: { grid: { display: false } },
          },
        },
      });
    }

    // Least Selling Products Chart
    if (leastSellingChart.value && data.value.least_selling_products.length) {
      new Chart(leastSellingChart.value, {
        type: 'bar',
        data: {
          labels: data.value.least_selling_products.map(p =>
            t('dashboard.language') === 'ar' ? p.name_ar : p.name_en
          ),
          datasets: [{
            label: t('dashboard.leastSellingProducts') || 'Least Selling',
            data: data.value.least_selling_products.map(p => p.order_item_count || 1),
            backgroundColor: '#EF4444',
            borderRadius: 8,
          }],
        },
        options: {
          indexAxis: 'y', // Horizontal bar
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            y: { grid: { display: false } },
          },
        },
      });
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

/* RTL Support */
.text-right {
  text-align: right;
}
</style>
