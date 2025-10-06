<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { getCandidates, createCandidate as apiCreateCandidate, deleteCandidate as apiDeleteCandidate } from "../../services/api.js";
import { exportToPDF, exportToCSV, formatFilename } from "../utils/exportUtils.js";

// Pagination
const currentPage = ref(1);
const itemsPerPage = 10;

const router = useRouter();
const userStore = useUserStore();

const candidates = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

const name = ref("");
const email = ref("");
const wishedSalary = ref("");
const earlyStartDate = ref("");
const candidateNotes = ref("");
const jobTitle = ref("");
const company = ref("");
const experience = ref("");
const skills = ref("");
const location = ref("");
const isSubmitting = ref(false);
const deletingId = ref(null);
const showCreateModal = ref(false);

// Pagination computed properties
const paginatedCandidates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return candidates.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(candidates.value.length / itemsPerPage);
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
const exportCandidatesPDF = () => {
  const filename = formatFilename('candidates', 'pdf');
  exportToPDF.candidates(candidates.value, filename);
};

const exportCandidatesCSV = () => {
  const filename = formatFilename('candidates', 'csv');
  exportToCSV.candidates(candidates.value, filename);
};

const fetchCandidates = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const token = userStore.token;
    if (!token || userStore.user?.role !== "recruiter") {
      router.push("/login");
      return;
    }
    const res = await getCandidates(token);
    candidates.value = res || [];
  } catch (e) {
    errorMessage.value = e?.message || "Failed to load candidates.";
  } finally {
    isLoading.value = false;
  }
};

const createCandidateHandler = async () => {
  errorMessage.value = "";
  try {
    isSubmitting.value = true;
    const token = userStore.token;
    await apiCreateCandidate({ 
      name: name.value, 
      email: email.value,
      wishedSalary: wishedSalary.value,
      earlyStartDate: earlyStartDate.value,
      candidateNotes: candidateNotes.value,
      jobTitle: jobTitle.value,
      company: company.value,
      experience: experience.value,
      skills: skills.value,
      location: location.value
    }, token);
    name.value = "";
    email.value = "";
    wishedSalary.value = "";
    earlyStartDate.value = "";
    candidateNotes.value = "";
    jobTitle.value = "";
    company.value = "";
    experience.value = "";
    skills.value = "";
    location.value = "";
    showCreateModal.value = false;
    fetchCandidates();
  } catch (e) {
    errorMessage.value = e?.message || "Failed to create candidate.";
  } finally {
    isSubmitting.value = false;
  }
};

const deleteCandidateHandler = async (candidateId) => {
  if (!confirm("Are you sure you want to delete this candidate? This will also delete all their applications.")) {
    return;
  }
  
  errorMessage.value = "";
  try {
    deletingId.value = candidateId;
    const token = userStore.token;
    await apiDeleteCandidate(candidateId, token);
    fetchCandidates();
  } catch (e) {
    errorMessage.value = e?.message || "Failed to delete candidate.";
  } finally {
    deletingId.value = null;
  }
};

const openCreateModal = () => {
  showCreateModal.value = true;
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  // Reset form
  name.value = "";
  email.value = "";
  wishedSalary.value = "";
  earlyStartDate.value = "";
  candidateNotes.value = "";
  jobTitle.value = "";
  company.value = "";
  experience.value = "";
  skills.value = "";
  location.value = "";
  errorMessage.value = "";
};

onMounted(fetchCandidates);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <header class="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <h1 @click="router.push('/')" class="text-2xl font-bold text-blue-600 cursor-pointer">WorkCompass</h1>
      <nav class="space-x-3 flex items-center">
        <span class="hidden sm:inline text-gray-600 font-medium">Hi, {{ userStore.user?.name || "User" }}</span>
        <button @click="router.push('/dashboard')" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
          </svg>
          Dashboard
        </button>
        <button @click="router.push('/candidates')" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Candidates
        </button>
        <button @click="openCreateModal" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-transparent">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add New Candidate
        </button>
        <button @click="userStore.logout(); router.push('/login')" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </nav>
    </header>

    <main class="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full mx-auto">
      <h2 class="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6">Candidates</h2>

      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>

      <section class="bg-white rounded-xl shadow overflow-hidden">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-lg sm:text-xl font-semibold">All candidates</h3>
          <div class="flex items-center gap-4">
            <span v-if="isLoading" class="text-sm text-gray-500">Loading…</span>
            <div class="flex gap-2">
              <button
                @click="exportCandidatesPDF"
                :disabled="candidates.length === 0"
                class="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                PDF
              </button>
              <button
                @click="exportCandidatesCSV"
                :disabled="candidates.length === 0"
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
        
        <!-- Mobile Card Layout -->
        <div class="block sm:hidden">
          <div v-if="candidates.length === 0" class="px-4 py-6 text-center text-gray-500">No candidates yet.</div>
          <div v-else class="divide-y divide-gray-200">
            <div v-for="c in paginatedCandidates" :key="c._id" class="p-4">
              <div class="flex justify-between items-start mb-2">
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-gray-900 truncate">{{ c.name }}</h4>
                  <p class="text-sm text-gray-500 truncate">{{ c.email }}</p>
                  <p class="text-sm text-gray-600">{{ c.jobTitle || 'No job title' }}</p>
                  <p class="text-xs text-gray-400">{{ new Date(c.createdAt).toLocaleDateString() }}</p>
                </div>
              </div>
              <div class="flex gap-2 mt-3">
                <button @click="router.push(`/candidates/${c._id}`)" class="flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 text-sm">
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Manage
                </button>
                <button @click="deleteCandidateHandler(c._id)" :disabled="deletingId === c._id" class="flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 disabled:opacity-50 text-sm">
                  <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  {{ deletingId === c._id ? 'Deleting...' : 'Delete' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop Table Layout -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="min-w-full text-left">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-sm">
                <th class="px-4 py-3">Name</th>
                <th class="px-4 py-3">Email</th>
                <th class="px-4 py-3">Job Title</th>
                <th class="px-4 py-3">Created</th>
                <th class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              <tr v-for="c in paginatedCandidates" :key="c._id" class="hover:bg-gray-50">
                <td class="px-4 py-3">{{ c.name }}</td>
                <td class="px-4 py-3">{{ c.email }}</td>
                <td class="px-4 py-3">{{ c.jobTitle || '—' }}</td>
                <td class="px-4 py-3">{{ new Date(c.createdAt).toLocaleDateString() }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button @click="router.push(`/candidates/${c._id}`)" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent text-blue-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200">
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      Manage
                    </button>
                    <button @click="deleteCandidateHandler(c._id)" :disabled="deletingId === c._id" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 disabled:opacity-50">
                      <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      {{ deletingId === c._id ? 'Deleting...' : 'Delete' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="candidates.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-gray-500">No candidates yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
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
      </section>
    </main>

    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>

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
          
          <form @submit.prevent="createCandidateHandler" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input v-model="name" placeholder="Full name" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              <input v-model="email" type="email" placeholder="Email" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input v-model="jobTitle" placeholder="Job title" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input v-model="company" placeholder="Current company" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input v-model="experience" placeholder="Years of experience" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input v-model="location" placeholder="Location" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input v-model="wishedSalary" placeholder="Wished salary" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input v-model="earlyStartDate" type="date" placeholder="Early start date" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div class="grid grid-cols-1 gap-4">
              <input v-model="skills" placeholder="Skills (comma-separated)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <textarea v-model="candidateNotes" placeholder="Notes about the candidate" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" @click="closeCreateModal" class="px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent text-gray-600 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-200">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                Cancel
              </button>
              <button type="submit" :disabled="isSubmitting" class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:transform-none">
                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {{ isSubmitting ? "Creating…" : "Create Candidate" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


