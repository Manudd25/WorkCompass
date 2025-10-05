<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import RecruiterTable from "../components/RecruiterTable.vue";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import CandidateForm from "../components/CandidateForm.vue";
import CandidateApplicationCard from "../components/CandidateApplicationCard.vue";
import { getApplications, updateApplication as apiUpdateApplication, deleteApplication as apiDeleteApplication, createCandidate as apiCreateCandidate } from "../../services/api.js";

const router = useRouter();
const userStore = useUserStore();

const applications = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Create candidate modal
const showCreateModal = ref(false);
const isSubmitting = ref(false);

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

const totalCount = computed(() => applications.value.length);
const appliedCount = computed(
  () => applications.value.filter((a) => a.status === "Applied").length
);
const interviewCount = computed(
  () => applications.value.filter((a) => a.status === "Interview").length
);
const offerCount = computed(
  () => applications.value.filter((a) => a.status === "Offer").length
);
const rejectedCount = computed(
  () => applications.value.filter((a) => a.status === "Rejected").length
);

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
    <main class="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
      <h2 class="text-3xl font-extrabold mb-6">Dashboard</h2>

      <!-- Stats (candidates only) -->
      <section v-if="userStore.user?.role !== 'recruiter'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Applications -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Total</p>
                <p class="text-4xl font-bold text-blue-900">{{ totalCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Applied -->
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600 uppercase tracking-wide">Applied</p>
                <p class="text-4xl font-bold text-gray-900">{{ appliedCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Interview -->
        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-sm border border-yellow-200 p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-yellow-600 uppercase tracking-wide">Interview</p>
                <p class="text-4xl font-bold text-yellow-900">{{ interviewCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Offer -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all duration-300">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-green-600 uppercase tracking-wide">Offers</p>
                <p class="text-4xl font-bold text-green-900">{{ offerCount }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <!-- Recruiter Table -->
      <section v-if="userStore.user?.role === 'recruiter'" class="bg-white rounded-xl shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-xl font-semibold">Applications</h3>
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
            <RouterLink to="/applications/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
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
            <RouterLink to="/applications/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Add Your First Application
            </RouterLink>
          </div>
          <div v-else class="space-y-3">
                <CandidateApplicationCard 
                  v-for="app in applications" 
                  :key="app._id" 
                  :application="app"
                  @update="updateCandidateApplication"
                  @delete="deleteCandidateApplication"
                />
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