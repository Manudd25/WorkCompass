<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import ApplicationForm from "../components/ApplicationForm.vue";
import { createApplication } from "../../services/api.js";

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
    await createApplication(
      { company: company.value, role: role.value, status: status.value, date: date.value, notes: notes.value },
      token
    );
    router.push("/applications");
  } catch (error) {
    errorMessage.value = error?.message || "Failed to create application.";
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

    <main class="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-3xl w-full mx-auto">
      <h2 class="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6">Add application</h2>

      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>

      <div class="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 sm:space-y-5">
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
        <form @submit.prevent="submitForm" class="space-y-4 sm:space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="company">Company</label>
            <input id="company" v-model="company" class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="role">Role</label>
            <input id="role" v-model="role" class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" required />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="status">Status</label>
              <select id="status" v-model="status" class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base">
                <option>Applied</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="date">Date</label>
              <input id="date" type="date" v-model="date" class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="notes">Notes, Links, etc.</label>
            <textarea id="notes" v-model="notes" rows="3" class="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none" />
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-60 disabled:transform-none"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
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


