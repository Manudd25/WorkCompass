<script setup>
import { onMounted, ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import ApplicationList from "../components/ApplicationList.vue";
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
const statusFilter = ref("");
const companyFilter = ref("");
const dateFromFilter = ref("");
const dateToFilter = ref("");

// Computed properties
const filteredApplications = computed(() => {
  let filtered = applications.value;

  if (statusFilter.value) {
    filtered = filtered.filter(app => app.status === statusFilter.value);
  }

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

// Rejection analysis
const rejectedApplications = computed(() => {
  return applications.value.filter(app => app.status === 'Rejected');
});

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
    .slice(0, 3)
    .map(([company, count]) => ({ company, count }));
  
  return {
    total,
    rejected,
    rejectionRate,
    topRejectingCompanies
  };
});

const paginatedApplications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredApplications.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredApplications.value.length / itemsPerPage);
});

const hasNextPage = computed(() => currentPage.value < totalPages.value);
const hasPrevPage = computed(() => currentPage.value > 1);

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
  statusFilter.value = "";
  companyFilter.value = "";
  dateFromFilter.value = "";
  dateToFilter.value = "";
  currentPage.value = 1;
};

// Export functions
const exportApplicationsPDF = () => {
  const filename = formatFilename('applications', 'pdf');
  exportToPDF.applications(filteredApplications.value, filename);
};

const exportApplicationsCSV = () => {
  const filename = formatFilename('applications', 'csv');
  exportToCSV.applications(filteredApplications.value, filename);
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
      <nav class="flex items-center gap-2 flex-wrap">
        <span class="hidden sm:inline text-gray-600 font-medium">Hi, {{ userStore.user?.name || "User" }}</span>
        <RouterLink to="/dashboard" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
          </svg>
          <span class="hidden sm:inline">Dashboard</span>
        </RouterLink>
        <RouterLink to="/rejections" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>
          Archive
        </RouterLink>
        <button @click="userStore.logout(); router.push('/login')" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </nav>
    </header>

    <!-- Main content -->
    <main class="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h2 class="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-0">All applications</h2>
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="text-sm text-gray-600">
            Showing {{ paginatedApplications.length }} of {{ filteredApplications.length }} applications
          </div>
          <div class="flex gap-2">
            <button
              @click="exportApplicationsPDF"
              :disabled="filteredApplications.length === 0"
              class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              PDF
            </button>
            <button
              @click="exportApplicationsCSV"
              :disabled="filteredApplications.length === 0"
              class="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              CSV
            </button>
            <RouterLink to="/applications/new" class="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200">
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Application
            </RouterLink>
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
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by status</label>
            <select 
              v-model="statusFilter" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">From date</label>
            <input 
              v-model="dateFromFilter" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">To date</label>
            <input 
              v-model="dateToFilter" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="clearFilters" 
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 border border-transparent text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Rejection History Section -->
      <div v-if="rejectedApplications.length > 0" class="bg-white rounded-xl shadow p-4 mb-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Keep Going! 💪
            </h3>
            <p class="text-sm text-gray-600">Every application is a step forward. Your persistence will pay off!</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-green-600">{{ (100 - rejectionStats.rejectionRate).toFixed(1) }}%</div>
            <div class="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-3">
            <div class="text-sm text-blue-600 font-medium">Total Applications</div>
            <div class="text-xl font-bold text-blue-700">{{ rejectionStats.total }}</div>
          </div>
          <div class="bg-green-50 rounded-lg p-3">
            <div class="text-sm text-green-600 font-medium">Success Rate</div>
            <div class="text-xl font-bold text-green-700">{{ (100 - rejectionStats.rejectionRate).toFixed(1) }}%</div>
          </div>
          <div class="bg-yellow-50 rounded-lg p-3">
            <div class="text-sm text-yellow-600 font-medium">Learning Opportunities</div>
            <div class="text-xl font-bold text-yellow-700">{{ rejectionStats.rejected }}</div>
          </div>
        </div>

        <!-- Learning Opportunities -->
        <div v-if="rejectionStats.topRejectingCompanies.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Companies to Re-apply to (with improved applications):</h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="company in rejectionStats.topRejectingCompanies" 
              :key="company.company"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
            >
              {{ company.company }} ({{ company.count }} opportunities)
            </span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button 
            @click="statusFilter = 'Rejected'"
            class="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            View All Rejections
          </button>
          <button 
            @click="statusFilter = ''; companyFilter = ''; dateFromFilter = ''; dateToFilter = ''"
            class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-gray-600">Loading…</div>
      <div v-else class="bg-white rounded-xl shadow p-4">
        <div v-if="applications.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">No applications yet</p>
          <p class="text-sm mb-4">Start tracking your job applications by adding your first one.</p>
          <RouterLink to="/applications/new" class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Your First Application
          </RouterLink>
        </div>
        <div v-else-if="filteredApplications.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">No applications found</p>
          <p class="text-sm mb-4">Try adjusting your filters or add a new application.</p>
          <RouterLink to="/applications/new" class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Application
          </RouterLink>
        </div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="app in paginatedApplications" :key="app._id" class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-base sm:text-lg truncate">{{ app.role }} <span class="text-gray-500">@ {{ app.company }}</span></p>
              <p class="text-sm text-gray-500">{{ new Date(app.date).toLocaleDateString() }}</p>
              <p v-if="app.notes" class="text-sm text-gray-600 mt-1 break-words break-all line-clamp-2">{{ app.notes }}</p>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <!-- Status Badge -->
              <span :class="{
                'bg-blue-100 text-blue-800': app.status === 'Applied',
                'bg-yellow-100 text-yellow-800': app.status === 'Interview',
                'bg-green-100 text-green-800': app.status === 'Offer',
                'bg-red-100 text-red-800': app.status === 'Rejected'
              }" class="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                {{ app.status }}
              </span>
              <!-- Details Button -->
              <RouterLink :to="`/applications/${app._id}`" class="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 text-sm sm:text-base">
                <svg class="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span class="hidden sm:inline">Details</span>
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
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  currentPage === page 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                ]"
              >
                {{ page }}
              </button>
              <span v-if="totalPages > 5" class="px-3 py-2 text-sm text-gray-500">...</span>
              <button 
                v-if="totalPages > 5"
                @click="goToPage(totalPages)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  currentPage === totalPages 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                ]"
              >
                {{ totalPages }}
              </button>
            </div>

            <!-- Next Button -->
            <button 
              @click="nextPage" 
              :disabled="!hasNextPage"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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


