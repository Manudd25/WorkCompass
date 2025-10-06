<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import ApplicationCard from "../components/ApplicationCard.vue";
import { getApplications, updateApplication } from "../../services/api.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const application = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const isUpdating = ref(false);
const updateMessage = ref("");

const fetchApplication = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }
    const id = route.params.id;
    const res = await getApplications(token, userStore.user?.id);
    const list = res || [];
    application.value = list.find((a) => a._id === id) || null;
    if (!application.value) errorMessage.value = "Application not found.";
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load application.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchApplication);

const saveStatus = async () => {
  updateMessage.value = "";
  try {
    if (!application.value) return;
    isUpdating.value = true;
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }
    const id = application.value._id;
    await updateApplication(id, { status: application.value.status }, token);
    updateMessage.value = "Status updated.";
    // Notify other views (e.g., Dashboard) to refresh
    window.dispatchEvent(new CustomEvent("applications-updated"));
  } catch (error) {
    updateMessage.value = error?.message || "Failed to update status.";
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <!-- Header -->
    <header class="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <h1 @click="router.push('/')" class="text-2xl font-bold text-blue-600 cursor-pointer">WorkCompass</h1>
      <nav class="space-x-4 flex items-center">
        <RouterLink to="/applications" class="text-gray-700 hover:text-blue-600">All Applications</RouterLink>
      </nav>
    </header>

    <main class="flex-1 px-6 py-8 max-w-3xl w-full mx-auto">
      <h2 class="text-3xl font-extrabold mb-6">Application details</h2>

      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-gray-600">Loading…</div>
      <div v-else-if="!application" class="text-gray-600">No application found.</div>
      <div v-else class="bg-white rounded-xl shadow p-6 space-y-6">
        <!-- Pass application object as-is to the component -->
        <ApplicationCard :application="application" />

        <!-- Fallback details rendering -->
        <div class="space-y-3">
          <p class="text-xl font-semibold">{{ application.role }} <span class="text-gray-500">@ {{ application.company }}</span></p>
          <div class="text-sm text-gray-600">Status: {{ application.status }}</div>
          <div class="text-sm text-gray-600">Date: {{ new Date(application.date).toLocaleDateString() }}</div>
          <div class="text-sm text-gray-600 break-words break-all">Notes: {{ application.notes || "—" }}</div>
        </div>

        <!-- Status editor -->
        <div class="border-t border-gray-100 pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1" for="status">Change status</label>
          <div class="flex items-center gap-3">
            <select
              id="status"
              v-model="application.status"
              class="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <button
              @click="saveStatus"
              :disabled="isUpdating"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
            >
              {{ isUpdating ? "Saving…" : "Save" }}
            </button>
            <span v-if="updateMessage" class="text-sm" :class="updateMessage.includes('Failed') ? 'text-red-600' : 'text-green-700'">{{ updateMessage }}</span>
          </div>
        </div>
      </div>
    </main>

    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>


