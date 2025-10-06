<script setup>
import { onMounted, ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { getApplications } from "../../services/api.js";
import { exportToPDF, exportToCSV, formatFilename } from "../utils/exportUtils.js";

const router = useRouter();
const userStore = useUserStore();

const applications = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

// Filters
const companyFilter = ref("");
const dateFromFilter = ref("");
const dateToFilter = ref("");

// Computed properties
const rejectedApplications = computed(() => {
  return applications.value.filter(app => app.status === 'Rejected');
});

const filteredRejections = computed(() => {
  let filtered = rejectedApplications.value;

  if (companyFilter.value) {
    filtered = filtered.filter(app => 
      app.company.toLowerCase().includes(companyFilter.value.toLowerCase())
    );
  }

  if (dateFromFilter.value) {
    filtered = filtered.filter(app => 
      new Date(app.date) >= new Date(dateFromFilter.value)
    );
  }

  if (dateToFilter.value) {
    filtered = filtered.filter(app => 
      new Date(app.date) <= new Date(dateToFilter.value)
    );
  }

  return filtered;
});

const paginatedRejections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredRejections.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRejections.value.length / itemsPerPage);
});

const hasNextPage = computed(() => currentPage.value < totalPages.value);
const hasPrevPage = computed(() => currentPage.value > 1);

// Rejection analysis
const rejectionStats = computed(() => {
  const total = applications.value.length;
  const rejected = rejectedApplications.value.length;
  const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : 0;
  
  // Group by company to see which companies reject most
  const companyRejections = rejectedApplications.value.reduce((acc, app) => {
    acc[app.company] = (acc[app.company] || 0) + 1;
    return acc;
  }, {});
  
  const topRejectingCompanies = Object.entries(companyRejections)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([company, count]) => ({ company, count }));
  
  // Group by month to see rejection trends
  const monthlyRejections = rejectedApplications.value.reduce((acc, app) => {
    const month = new Date(app.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  
  const monthlyData = Object.entries(monthlyRejections)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([month, count]) => ({ month, count }));
  
  return {
    total,
    rejected,
    rejectionRate,
    topRejectingCompanies,
    monthlyData
  };
});

// Methods
const nextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (hasPrevPage.value) {
    currentPage.value--;
  }
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const clearFilters = () => {
  companyFilter.value = "";
  dateFromFilter.value = "";
  dateToFilter.value = "";
  currentPage.value = 1;
};

// Export functions
const exportRejectionsPDF = () => {
  const filename = formatFilename('rejections', 'pdf');
  exportToPDF.applications(filteredRejections.value, filename);
};

const exportRejectionsCSV = () => {
  const filename = formatFilename('rejections', 'csv');
  exportToCSV.applications(filteredRejections.value, filename);
};

const fetchApplications = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const token = userStore.token;
    const userId = userStore.user?.id;
    if (!token || !userId) {
      router.push("/login");
      return;
    }
    const res = await getApplications(token, userId);
    applications.value = res || [];
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load applications.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchApplications);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <!-- Header -->
    <header class="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <h1 @click="router.push('/')" class="text-2xl font-bold text-blue-600 cursor-pointer">WorkCompass</h1>
      <nav class="space-x-3 flex items-center">
        <span class="hidden sm:inline text-gray-600 font-medium">Hi, {{ userStore.user?.name || "User" }}</span>
        <RouterLink to="/dashboard" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
          </svg>
          Dashboard
        </RouterLink>
        <RouterLink to="/applications" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          All Applications
        </RouterLink>
        <button @click="userStore.logout(); router.push('/login')" class="text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-red-200">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </nav>
    </header>

    <!-- Main content -->
    <main class="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold mb-2 flex items-center">
            <svg class="w-8 h-8 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
            </svg>
            Archive
          </h2>
          <p class="text-gray-600">Review your archived applications and learn from past experiences</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 sm:mt-0">
          <div class="text-sm text-gray-600">
            Showing {{ paginatedRejections.length }} of {{ filteredRejections.length }} archived applications
          </div>
          <div class="flex gap-2">
            <button
              @click="exportRejectionsPDF"
              :disabled="filteredRejections.length === 0"
              class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              PDF
            </button>
            <button
              @click="exportRejectionsCSV"
              :disabled="filteredRejections.length === 0"
              class="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Rejection Statistics -->
      <div v-if="rejectedApplications.length > 0" class="bg-white rounded-xl shadow p-6 mb-6 border-l-4 border-red-500">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-red-600">{{ rejectionStats.rejected }}</div>
            <div class="text-sm text-gray-600">Total Rejections</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ rejectionStats.total }}</div>
            <div class="text-sm text-gray-600">Total Applications</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-red-500">{{ rejectionStats.rejectionRate }}%</div>
            <div class="text-sm text-gray-600">Rejection Rate</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ (100 - rejectionStats.rejectionRate).toFixed(1) }}%</div>
            <div class="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>

        <!-- Top Rejecting Companies -->
        <div v-if="rejectionStats.topRejectingCompanies.length > 0" class="mt-6">
          <h4 class="text-lg font-semibold text-gray-800 mb-3">Companies with Most Rejections:</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div 
              v-for="company in rejectionStats.topRejectingCompanies" 
              :key="company.company"
              class="bg-red-50 rounded-lg p-3 border border-red-200"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium text-gray-800">{{ company.company }}</span>
                <span class="text-sm text-red-600 font-bold">{{ company.count }} rejections</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow p-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Search by company</label>
            <input 
              v-model="companyFilter" 
              type="text" 
              placeholder="Enter company name..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">From date</label>
            <input 
              v-model="dateFromFilter" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">To date</label>
            <input 
              v-model="dateToFilter" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="clearFilters" 
              class="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-gray-600">Loading…</div>
      <div v-else class="bg-white rounded-xl shadow p-4">
        <div v-if="rejectedApplications.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
          <p class="text-xl font-medium mb-2">No archived applications yet!</p>
          <p class="text-sm mb-4">This is great news - you haven't had any applications archived yet.</p>
          <RouterLink to="/applications/new" class="px-6 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center mx-auto">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Application
          </RouterLink>
        </div>
        <div v-else-if="filteredRejections.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p class="text-xl font-medium mb-2">No archived applications found</p>
          <p class="text-sm mb-4">Try adjusting your filters or check all applications.</p>
          <button 
            @click="clearFilters" 
            class="px-6 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center mx-auto"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear Filters
          </button>
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="app in paginatedRejections" :key="app._id" class="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="font-semibold text-lg text-gray-900 truncate">{{ app.role }}</h3>
                <span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Rejected</span>
              </div>
              <p class="text-gray-600 font-medium">{{ app.company }}</p>
              <p class="text-sm text-gray-500 mb-2">{{ new Date(app.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) }}</p>
              <p v-if="app.notes" class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mt-2 break-words">{{ app.notes }}</p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <RouterLink :to="`/applications/${app._id}`" class="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View Details
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray-600">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <div class="flex items-center gap-2">
            <!-- Previous Button -->
            <button 
              @click="prevPage" 
              :disabled="!hasPrevPage"
              class="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </button>

            <!-- Page Numbers -->
            <div class="flex gap-1">
              <button 
                v-for="page in Math.min(5, totalPages)" 
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[40px]',
                  currentPage === page 
                    ? 'bg-gray-200 text-gray-900 font-semibold' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ page }}
              </button>
              <span v-if="totalPages > 5" class="px-3 py-2 text-sm text-gray-500">...</span>
              <button 
                v-if="totalPages > 5"
                @click="goToPage(totalPages)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 min-w-[40px]',
                  currentPage === totalPages 
                    ? 'bg-gray-200 text-gray-900 font-semibold' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ totalPages }}
              </button>
            </div>

            <!-- Next Button -->
            <button 
              @click="nextPage" 
              :disabled="!hasNextPage"
              class="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
            >
              Next
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>
