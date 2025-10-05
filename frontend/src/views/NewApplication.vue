<script setup>
import axios from "axios";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import ApplicationForm from "../components/ApplicationForm.vue";

const router = useRouter();
const userStore = useUserStore();

const company = ref("");
const role = ref("");
const status = ref("Applied");
const date = ref(new Date().toISOString().slice(0, 10));
const notes = ref("");

const isSubmitting = ref(false);
const errorMessage = ref("");

const submitForm = async () => {
  errorMessage.value = "";
  try {
    isSubmitting.value = true;
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }
    await axios.post(
      "http://localhost:8000/api/applications",
      { company: company.value, role: role.value, status: status.value, date: date.value, notes: notes.value },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    router.push("/applications");
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to create application.";
  } finally {
    isSubmitting.value = false;
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
      <h2 class="text-3xl font-extrabold mb-6">Add application</h2>

      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>

      <div class="bg-white rounded-xl shadow p-6 space-y-4">
        <!-- Pass form fields and submit through props/events to ApplicationForm component -->
        <ApplicationForm
          :company="company"
          :role="role"
          :status="status"
          :date="date"
          :notes="notes"
          :isSubmitting="isSubmitting"
          @submit="submitForm"
        />

        <!-- Fallback inline form if component is empty -->
        <form @submit.prevent="submitForm" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="company">Company</label>
            <input id="company" v-model="company" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="role">Role</label>
            <input id="role" v-model="role" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="status">Status</label>
              <select id="status" v-model="status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="date">Date</label>
              <input id="date" type="date" v-model="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="notes">Notes, Links, etc.</label>
            <textarea id="notes" v-model="notes" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
          >
            {{ isSubmitting ? "Saving…" : "Save application" }}
          </button>
        </form>
      </div>
    </main>

    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>


