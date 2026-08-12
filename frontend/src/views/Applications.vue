<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import Footer from "../components/Footer.vue";
import SectionHeader from "../components/SectionHeader.vue";
import EmptyState from "../components/EmptyState.vue";
import StatusBadge from "../components/StatusBadge.vue";
import SidebarShell from "../components/SidebarShell.vue";
import ApplicationCreateModal from "../components/ApplicationCreateModal.vue";
import { getApplications } from "../../services/api.js";
import { exportToPDF, exportToCSV, formatFilename } from "../utils/exportUtils.js";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const showCreateModal = ref(false);

const openCreateModal = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  if (route.query.new !== undefined) {
    const nextQuery = { ...route.query };
    delete nextQuery.new;
    router.replace({ path: "/applications", query: nextQuery });
  }
};

watch(
  () => route.query.new,
  (value) => {
    if (value !== undefined) showCreateModal.value = true;
  },
  { immediate: true }
);
const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Applications", to: "/applications" },
  { label: "Calendar", to: "/calendar" },
  { label: "Analytics", to: "/analytics" },
  { label: "Career Compass", to: "/career-compass" },
  { label: "Wellbeing", to: "/wellness/monitoring" },
  { label: "Settings", to: "/settings" },
];
const secondaryItems = [{ label: "Community", to: "/community/forum" }];

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

onMounted(() => {
  fetchApplications();
  window.addEventListener("applications-updated", fetchApplications);
});
onBeforeUnmount(() => {
  window.removeEventListener("applications-updated", fetchApplications);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
      <SectionHeader title="Applications" subtitle="Track every application and keep your outreach organized." />
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <h2 class="text-xl font-semibold mb-4 sm:mb-0">All applications</h2>
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <div class="text-sm text-gray-600 dark:text-slate-400">
            Showing {{ paginatedApplications.length }} of {{ filteredApplications.length }} applications
          </div>
          <div class="flex gap-2">
            <button
              @click="exportApplicationsPDF"
              :disabled="filteredApplications.length === 0"
              class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              PDF
            </button>
            <button
              @click="exportApplicationsCSV"
              :disabled="filteredApplications.length === 0"
              class="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              CSV
            </button>
            <button
              type="button"
              class="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200"
              @click="openCreateModal"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Application
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow p-4 mb-6 dark:bg-slate-800 dark:shadow-slate-900/30">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Search by company</label>
            <input 
              v-model="companyFilter" 
              type="text" 
              placeholder="Enter company name..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Filter by status</label>
            <select 
              v-model="statusFilter" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="">All statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">From date</label>
            <input 
              v-model="dateFromFilter" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">To date</label>
            <input 
              v-model="dateToFilter" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            />
          </div>
          <div class="flex items-end">
            <button 
              @click="clearFilters" 
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all duration-200 border border-transparent text-sm dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div v-if="rejectedApplications.length > 0" class="bg-white rounded-xl border border-slate-200 p-4 mb-6 dark:bg-slate-800 dark:border-slate-700">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-800 flex items-center dark:text-slate-100">
              <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Keep Going! 💪
            </h3>
            <p class="text-sm text-gray-600 dark:text-slate-400">Every application is a step forward. Your persistence will pay off!</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ (100 - rejectionStats.rejectionRate).toFixed(1) }}%</div>
            <div class="text-sm text-gray-500 dark:text-slate-400">Success Rate</div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-blue-50 rounded-lg p-3 dark:bg-blue-900/20">
            <div class="text-sm text-blue-600 font-medium dark:text-blue-400">Total Applications</div>
            <div class="text-xl font-bold text-blue-700 dark:text-blue-300">{{ rejectionStats.total }}</div>
          </div>
          <div class="bg-green-50 rounded-lg p-3 dark:bg-green-900/20">
            <div class="text-sm text-green-600 font-medium dark:text-green-400">Success Rate</div>
            <div class="text-xl font-bold text-green-700 dark:text-green-300">{{ (100 - rejectionStats.rejectionRate).toFixed(1) }}%</div>
          </div>
          <div class="bg-yellow-50 rounded-lg p-3 dark:bg-yellow-900/20">
            <div class="text-sm text-yellow-600 font-medium dark:text-yellow-400">Learning Opportunities</div>
            <div class="text-xl font-bold text-yellow-700 dark:text-yellow-300">{{ rejectionStats.rejected }}</div>
          </div>
        </div>

        <div v-if="rejectionStats.topRejectingCompanies.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2 dark:text-slate-300">Companies to Re-apply to (with improved applications):</h4>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="company in rejectionStats.topRejectingCompanies" 
              :key="company.company"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            >
              {{ company.company }} ({{ company.count }} opportunities)
            </span>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button 
            @click="statusFilter = 'Rejected'"
            class="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors dark:text-red-400 dark:bg-red-900/20 dark:border-red-700 dark:hover:bg-red-900/30"
          >
            View All Rejections
          </button>
          <button 
            @click="statusFilter = ''; companyFilter = ''; dateFromFilter = ''; dateToFilter = ''"
            class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors dark:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-4 text-red-600 dark:text-red-400">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-gray-600 dark:text-slate-400">Loading...</div>
      <div v-else class="bg-white rounded-xl border border-slate-200 p-4 dark:bg-slate-800 dark:border-slate-700">
        <EmptyState
          v-if="applications.length === 0"
          title="No applications yet"
          message="Start tracking your job applications by adding your first one."
          cta-text="Add your first application"
          @cta="openCreateModal"
        />
        <EmptyState
          v-else-if="filteredApplications.length === 0"
          title="No applications found"
          message="Try adjusting filters or add a new application."
          cta-text="Add application"
          @cta="openCreateModal"
        />
        <div v-else class="divide-y divide-gray-100 dark:divide-slate-700">
          <div v-for="app in paginatedApplications" :key="app._id" class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-base sm:text-lg truncate">{{ app.role }} <span class="text-gray-500 dark:text-slate-400">@ {{ app.company }}</span></p>
              <p class="text-sm text-gray-500 dark:text-slate-400">{{ new Date(app.date).toLocaleDateString() }}</p>
              <p v-if="app.notes" class="text-sm text-gray-600 mt-1 break-words break-all line-clamp-2 dark:text-slate-400">{{ app.notes }}</p>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <StatusBadge :status="app.status" />
              <RouterLink :to="`/applications/${app._id}`" class="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 text-sm sm:text-base dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:border-blue-700">
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
          <div class="text-sm text-gray-600 dark:text-slate-400">
            Page {{ currentPage }} of {{ totalPages }}
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="prevPage" 
              :disabled="!hasPrevPage"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 dark:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-200"
            >
              <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </button>

            <div class="flex gap-1">
              <button 
                v-for="page in Math.min(5, totalPages)" 
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  currentPage === page 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'
                ]"
              >
                {{ page }}
              </button>
              <span v-if="totalPages > 5" class="px-3 py-2 text-sm text-gray-500 dark:text-slate-400">...</span>
              <button 
                v-if="totalPages > 5"
                @click="goToPage(totalPages)"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                  currentPage === totalPages 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'
                ]"
              >
                {{ totalPages }}
              </button>
            </div>

            <button 
              @click="nextPage" 
              :disabled="!hasNextPage"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 dark:text-slate-400 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-200"
            >
              Next
              <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </SidebarShell>

    <ApplicationCreateModal
      :open="showCreateModal"
      @close="closeCreateModal"
      @created="fetchApplications"
    />

    <Footer />
  </div>
</template>
