<script setup>
import axios from "axios";
import { onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import ApplicationList from "../components/ApplicationList.vue";

const router = useRouter();
const userStore = useUserStore();

const applications = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

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
    const res = await axios.get(
      `http://localhost:8000/api/applications?candidateId=${encodeURIComponent(userId)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    applications.value = res.data || [];
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to load applications.";
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
      <nav class="space-x-4 flex items-center">
        <RouterLink to="/dashboard" class="text-gray-700 hover:text-blue-600">Dashboard</RouterLink>
        <RouterLink to="/applications/new" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Add Application</RouterLink>
      </nav>
    </header>

    <!-- Main content -->
    <main class="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
      <h2 class="text-3xl font-extrabold mb-6">All applications</h2>

      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-gray-600">Loading…</div>
      <div v-else class="bg-white rounded-xl shadow p-4">
        <!-- Pass applications as props to the component (component may implement it later) -->
        <ApplicationList :applications="applications" />

        <!-- Simple fallback list rendering -->
        <ul class="divide-y divide-gray-100">
          <li v-for="app in applications" :key="app._id" class="py-4 flex items-center justify-between">
            <div>
              <p class="font-semibold">{{ app.role }} <span class="text-gray-500">@ {{ app.company }}</span></p>
              <p class="text-sm text-gray-500">{{ new Date(app.date).toLocaleDateString() }}</p>
            </div>
            <RouterLink :to="`/applications/${app._id}`" class="text-blue-600 hover:underline">Details</RouterLink>
          </li>
        </ul>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>


