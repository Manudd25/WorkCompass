<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { getCandidates, getApplications, createApplication, updateApplication, deleteApplication, updateCandidate, deleteCandidate } from "../../services/api.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const candidate = ref(null);
const applications = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

// Edit mode for candidate details
const isEditing = ref(false);
const editName = ref("");
const editEmail = ref("");
const editWishedSalary = ref("");
const editEarlyStartDate = ref("");
const editCandidateNotes = ref("");
const editJobTitle = ref("");
const editCompany = ref("");
const editExperience = ref("");
const editSkills = ref("");
const editLocation = ref("");
const isUpdating = ref(false);
const isDeleting = ref(false);

const company = ref("");
const role = ref("");
const status = ref("Applied");
const date = ref(new Date().toISOString().slice(0, 10));
const notes = ref("");
const isSubmitting = ref(false);

const fetchData = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const token = userStore.token;
    if (!token || userStore.user?.role !== "recruiter") {
      router.push("/login");
      return;
    }
    const id = route.params.id;
    // Load candidate
    const candidatesResp = await getCandidates(token);
    candidate.value = (candidatesResp || []).find((u) => u._id === id) || null;
    if (!candidate.value) {
      errorMessage.value = "Candidate not found.";
    } else {
      // Initialize edit fields
      editName.value = candidate.value.name || "";
      editEmail.value = candidate.value.email || "";
      editWishedSalary.value = candidate.value.wishedSalary || "";
      editEarlyStartDate.value = candidate.value.earlyStartDate ? new Date(candidate.value.earlyStartDate).toISOString().slice(0, 10) : "";
      editCandidateNotes.value = candidate.value.candidateNotes || "";
      editJobTitle.value = candidate.value.jobTitle || "";
      editCompany.value = candidate.value.company || "";
      editExperience.value = candidate.value.experience || "";
      editSkills.value = candidate.value.skills || "";
      editLocation.value = candidate.value.location || "";
    }
    // Load applications for candidate
    const appsResp = await getApplications(token, id);
    applications.value = appsResp || [];
  } catch (e) {
    errorMessage.value = e?.message || "Failed to load candidate.";
  } finally {
    isLoading.value = false;
  }
};

const createApplicationHandler = async () => {
  errorMessage.value = "";
  try {
    isSubmitting.value = true;
    const token = userStore.token;
    const id = route.params.id;
    await createApplication(
      { company: company.value, role: role.value, status: status.value, date: date.value, notes: notes.value, candidateId: id },
      token
    );
    company.value = "";
    role.value = "";
    status.value = "Applied";
    notes.value = "";
    fetchData();
  } catch (e) {
    errorMessage.value = e?.message || "Failed to create application.";
  } finally {
    isSubmitting.value = false;
  }
};

const updateApplicationStatus = async (appId, newStatus) => {
  try {
    const token = userStore.token;
    await updateApplication(appId, { status: newStatus }, token);
    fetchData();
  } catch (e) {}
};

const deleteApplicationHandler = async (appId) => {
  try {
    const token = userStore.token;
    await deleteApplication(appId, token);
    fetchData();
  } catch (e) {}
};

const startEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
  // Reset edit fields to original values
  editName.value = candidate.value.name || "";
  editEmail.value = candidate.value.email || "";
  editWishedSalary.value = candidate.value.wishedSalary || "";
  editEarlyStartDate.value = candidate.value.earlyStartDate ? new Date(candidate.value.earlyStartDate).toISOString().slice(0, 10) : "";
  editCandidateNotes.value = candidate.value.candidateNotes || "";
  editJobTitle.value = candidate.value.jobTitle || "";
  editCompany.value = candidate.value.company || "";
  editExperience.value = candidate.value.experience || "";
  editSkills.value = candidate.value.skills || "";
  editLocation.value = candidate.value.location || "";
};

const saveCandidate = async () => {
  errorMessage.value = "";
  try {
    isUpdating.value = true;
    const token = userStore.token;
    const id = route.params.id;
    const res = await updateCandidate(id, {
      name: editName.value,
      email: editEmail.value,
      wishedSalary: editWishedSalary.value,
      earlyStartDate: editEarlyStartDate.value,
      candidateNotes: editCandidateNotes.value,
      jobTitle: editJobTitle.value,
      company: editCompany.value,
      experience: editExperience.value,
      skills: editSkills.value,
      location: editLocation.value
    }, token);
    candidate.value = res;
    isEditing.value = false;
  } catch (e) {
    errorMessage.value = e?.message || "Failed to update candidate.";
  } finally {
    isUpdating.value = false;
  }
};

const deleteCandidateHandler = async () => {
  if (!confirm("Are you sure you want to delete this candidate? This will also delete all their applications.")) {
    return;
  }
  
  errorMessage.value = "";
  try {
    isDeleting.value = true;
    const token = userStore.token;
    const id = route.params.id;
    await deleteCandidate(id, token);
    router.push("/candidates");
  } catch (e) {
    errorMessage.value = e?.message || "Failed to delete candidate.";
  } finally {
    isDeleting.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <header class="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <h1 @click="router.push('/')" class="text-2xl font-bold text-blue-600 cursor-pointer">WorkCompass</h1>
      <nav class="space-x-3 flex items-center">
        <span class="hidden sm:inline text-gray-600 font-medium">Hi, {{ userStore.user?.name || "User" }}</span>
        <button @click="router.push('/dashboard')" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
          </svg>
          Dashboard
        </button>
        <button @click="router.push('/candidates')" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Candidates
        </button>
        <button @click="userStore.logout(); router.push('/login')" class="text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-red-200">
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          Logout
        </button>
      </nav>
    </header>

    <main class="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
      <h2 class="text-3xl font-extrabold mb-6">Candidate details</h2>
      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>

      <section class="bg-white rounded-xl shadow p-6 mb-8">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold">Candidate Information</h3>
          <div v-if="!isEditing" class="flex gap-2">
            <button @click="startEdit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Edit</button>
            <button @click="deleteCandidateHandler" :disabled="isDeleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60">
              {{ isDeleting ? "Deleting..." : "Delete" }}
            </button>
          </div>
          <div v-else class="flex gap-2">
            <button @click="cancelEdit" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
            <button @click="saveCandidate" :disabled="isUpdating" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60">
              {{ isUpdating ? "Saving..." : "Save" }}
            </button>
          </div>
        </div>

        <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="font-medium text-gray-700">Name:</span>
            <p class="text-gray-600">{{ candidate?.name || '—' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Email:</span>
            <p class="text-gray-600">{{ candidate?.email || '—' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Job Title:</span>
            <p class="text-gray-600">{{ candidate?.jobTitle || 'Not specified' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Company:</span>
            <p class="text-gray-600">{{ candidate?.company || 'Not specified' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Experience:</span>
            <p class="text-gray-600">{{ candidate?.experience || 'Not specified' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Location:</span>
            <p class="text-gray-600">{{ candidate?.location || 'Not specified' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Wished Salary:</span>
            <p class="text-gray-600">{{ candidate?.wishedSalary || 'Not specified' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Early Start Date:</span>
            <p class="text-gray-600">{{ candidate?.earlyStartDate ? new Date(candidate.earlyStartDate).toLocaleDateString() : 'Not specified' }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-700">Skills:</span>
            <p class="text-gray-600">{{ candidate?.skills || 'Not specified' }}</p>
          </div>
          <div class="sm:col-span-2 lg:col-span-3">
            <span class="font-medium text-gray-700">Notes:</span>
            <p class="text-gray-600">{{ candidate?.candidateNotes || 'No notes' }}</p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input v-model="editName" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="editEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input v-model="editJobTitle" placeholder="e.g., Software Engineer" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input v-model="editCompany" placeholder="e.g., Google" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input v-model="editExperience" placeholder="e.g., 5 years" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input v-model="editLocation" placeholder="e.g., San Francisco, CA" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Wished Salary</label>
              <input v-model="editWishedSalary" placeholder="e.g., $50,000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Early Start Date</label>
              <input v-model="editEarlyStartDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Skills</label>
            <input v-model="editSkills" placeholder="e.g., JavaScript, React, Node.js" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea v-model="editCandidateNotes" rows="3" placeholder="Additional notes about the candidate..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow p-6 mb-8">
        <h3 class="text-xl font-semibold mb-4">Add application for this candidate</h3>
        <form @submit.prevent="createApplicationHandler" class="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <input v-model="company" placeholder="Company" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          <input v-model="role" placeholder="Role" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          <select v-model="status" class="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
          <input type="date" v-model="date" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          <button :disabled="isSubmitting" class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60">
            {{ isSubmitting ? "Saving…" : "Add" }}
          </button>
          <textarea v-model="notes" rows="3" placeholder="Notes" class="sm:col-span-5 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
        </form>
      </section>

      <section class="bg-white rounded-xl shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-xl font-semibold">Applications</h3>
          <span v-if="isLoading" class="text-sm text-gray-500">Loading…</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left">
            <thead>
              <tr class="bg-gray-50 text-gray-600 text-sm">
                <th class="px-4 py-3">Company</th>
                <th class="px-4 py-3">Role</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm">
              <tr v-for="app in applications" :key="app._id" class="hover:bg-gray-50">
                <td class="px-4 py-3">{{ app.company }}</td>
                <td class="px-4 py-3">{{ app.role }}</td>
                <td class="px-4 py-3">{{ app.status }}</td>
                <td class="px-4 py-3">{{ new Date(app.date).toLocaleDateString() }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <select :value="app.status" @change="updateApplicationStatus(app._id, $event.target.value)" class="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs">
                      <option>Applied</option>
                      <option>Interview</option>
                      <option>Offer</option>
                      <option>Rejected</option>
                    </select>
                    <button @click="deleteApplicationHandler(app._id)" class="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100">Delete</button>
                  </div>
                </td>
              </tr>
              <tr v-if="applications.length === 0">
                <td colspan="5" class="px-4 py-6 text-center text-gray-500">No applications.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>


