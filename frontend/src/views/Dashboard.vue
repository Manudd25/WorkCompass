<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import RecruiterTable from "../components/RecruiterTable.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import CandidateForm from "../components/CandidateForm.vue";
import CandidateApplicationCard from "../components/CandidateApplicationCard.vue";
import DashboardCharts from "../components/DashboardCharts.vue";
import RecruiterCharts from "../components/RecruiterCharts.vue";
import { getApplications, updateApplication as apiUpdateApplication, deleteApplication as apiDeleteApplication, createCandidate as apiCreateCandidate } from "../../services/api.js";
import { exportToPDF, exportToCSV, formatFilename } from "../utils/exportUtils.js";

const router = useRouter();
const userStore = useUserStore();

const applications = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Create candidate modal
const showCreateModal = ref(false);
const isSubmitting = ref(false);

// Pagination for candidate applications
const currentPage = ref(1);
const itemsPerPage = 10;

// Computed properties for pagination
const paginatedApplications = computed(() => {
  if (userStore.user?.role === 'recruiter') {
    return applications.value; // Recruiters see all applications without pagination
  }
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return applications.value.slice(start, end);
});

const totalPages = computed(() => {
  if (userStore.user?.role === 'recruiter') {
    return 1; // Recruiters don't need pagination
  }
  return Math.ceil(applications.value.length / itemsPerPage);
});

const hasNextPage = computed(() => currentPage.value < totalPages.value);
const hasPrevPage = computed(() => currentPage.value > 1);

// Pagination methods
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

// Export functions
const exportApplicationsPDF = () => {
  const filename = formatFilename('my_applications', 'pdf');
  exportToPDF.applications(applications.value, filename);
};

const exportApplicationsCSV = () => {
  const filename = formatFilename('my_applications', 'csv');
  exportToCSV.applications(applications.value, filename);
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
    const isRecruiter = userStore.user?.role === "recruiter";
    const candidateId = isRecruiter ? null : userId;
    const res = await getApplications(token, candidateId);
    applications.value = res || [];
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load applications.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchApplications);

// Listen for cross-view updates (e.g., from ApplicationDetails)
const onAppsUpdated = () => fetchApplications();
onMounted(() => window.addEventListener("applications-updated", onAppsUpdated));
onBeforeUnmount(() => window.removeEventListener("applications-updated", onAppsUpdated));

// Chart data is now handled by DashboardCharts component

const recentApplications = computed(() =>
  [...applications.value]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
);

const handleLogout = () => {
  userStore.logout();
  router.push("/");
};

const handleCreateCandidate = (formData) => {
  createCandidateHandler(formData);
};

// Candidate application management
const updateCandidateApplication = async (formData) => {
  try {
    const token = userStore.token;
    await apiUpdateApplication(formData.id, {
      company: formData.company,
      role: formData.role,
      status: formData.status,
      date: formData.date,
      notes: formData.notes
    }, token);
    fetchApplications(); // Refresh applications
  } catch (e) {
    errorMessage.value = e?.message || "Failed to update application.";
  }
};

const deleteCandidateApplication = async (applicationId) => {
  try {
    const token = userStore.token;
    await apiDeleteApplication(applicationId, token);
    fetchApplications(); // Refresh applications
  } catch (e) {
    errorMessage.value = e?.message || "Failed to delete application.";
  }
};

const archiveCandidateApplication = async (applicationId) => {
  try {
    const token = userStore.token;
    // Update the application status to "Rejected" to move it to archive
    await apiUpdateApplication(applicationId, { status: "Rejected" }, token);
    fetchApplications(); // Refresh applications
  } catch (e) {
    errorMessage.value = e?.message || "Failed to archive application.";
  }
};


// Recruiter actions
const updateApplicationStatus = async ({ id, status }) => {
  try {
    const token = userStore.token;
    await apiUpdateApplication(id, { status }, token);
    window.dispatchEvent(new CustomEvent("applications-updated"));
  } catch (e) {
    // no-op UI error; could surface toast here
  }
};

const deleteApplicationHandler = async ({ id }) => {
  try {
    const token = userStore.token;
    await apiDeleteApplication(id, token);
    window.dispatchEvent(new CustomEvent("applications-updated"));
  } catch (e) {
    // no-op UI error; could surface toast here
  }
};

// Create candidate functions
const openCreateModal = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  errorMessage.value = "";
};

const createCandidateHandler = async (formData) => {
  errorMessage.value = "";
  try {
    isSubmitting.value = true;
    const token = userStore.token;
    await apiCreateCandidate(formData, token);
    showCreateModal.value = false;
    fetchApplications(); // Refresh the applications list
  } catch (e) {
    errorMessage.value = e?.message || "Failed to create candidate.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <Header @open-create-modal="openCreateModal" />

        <!-- Main content -->
        <main class="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full mx-auto">
          <h2 class="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6">Dashboard</h2>

          <!-- Professional Charts (candidates only) -->
          <section v-if="userStore.user?.role !== 'recruiter'" class="mb-6 sm:mb-8">
            <DashboardCharts :applications="applications" />
          </section>


      <!-- Recruiter Analytics -->
      <section v-if="userStore.user?.role === 'recruiter'" class="mb-6 sm:mb-8">
        <RecruiterCharts :applications="applications" />
      </section>

      <!-- Recruiter Table -->
      <section v-if="userStore.user?.role === 'recruiter'" class="bg-white rounded-xl shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-xl font-semibold">Application Status</h3>
          <span v-if="isLoading" class="text-sm text-gray-500">Loading…</span>
        </div>
        <div v-if="errorMessage" class="px-6 py-4 text-red-600 text-sm">{{ errorMessage }}</div>
        <div class="p-4">
              <RecruiterTable
                :applications="applications"
                @update-status="updateApplicationStatus"
                @delete-application="deleteApplicationHandler"
              />
        </div>
      </section>

      <!-- Applications management (candidates only) -->
      <section v-else class="bg-white rounded-xl shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-xl font-semibold">My Applications</h3>
          <div class="flex items-center gap-3">
            <span v-if="isLoading" class="text-sm text-gray-500">Loading…</span>
            <div class="flex gap-2">
              <button
                @click="exportApplicationsPDF"
                :disabled="applications.length === 0"
                class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                PDF
              </button>
              <button
                @click="exportApplicationsCSV"
                :disabled="applications.length === 0"
                class="px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 hover:border-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                CSV
              </button>
            </div>
            <RouterLink to="/applications/new" class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105">
              <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Application
            </RouterLink>
          </div>
        </div>

        <div v-if="errorMessage" class="px-6 py-4 text-red-600 text-sm">{{ errorMessage }}</div>

        <div v-else class="p-6">
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
          <div v-else class="space-y-3">
                <CandidateApplicationCard
                  v-for="app in paginatedApplications"
                  :key="app._id" 
                  :application="app"
                  @update="updateCandidateApplication"
                  @delete="deleteCandidateApplication"
                  @archive="archiveCandidateApplication"
                />
          </div>

          <!-- Pagination for Candidates -->
          <div v-if="userStore.user?.role !== 'recruiter' && totalPages > 1" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
      </section>
    </main>

    <Footer />

    <!-- Create Candidate Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Create New Candidate</h3>
            <button @click="closeCreateModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <CandidateForm 
            :is-submitting="isSubmitting"
            :error-message="errorMessage"
            @submit="handleCreateCandidate"
            @cancel="closeCreateModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>