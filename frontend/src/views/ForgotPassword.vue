<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { requestPasswordReset } from "../../services/api.js";

const router = useRouter();

const email = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const handleForgotPassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  
  if (!email.value) {
    errorMessage.value = "Please enter your email address.";
    return;
  }

  try {
    isSubmitting.value = true;
    await requestPasswordReset(email.value);
    successMessage.value = "Password reset instructions have been sent to your email!";
  } catch (error) {
    const errorMsg = error?.message || "Failed to send reset instructions. Please try again.";
    
    // Check if it's an OAuth account
    if (errorMsg.includes("Google")) {
      errorMessage.value = "This account was created with Google. Please use 'Sign in with Google' instead.";
    } else {
      errorMessage.value = errorMsg;
    }
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
      <nav class="space-x-6">
        <RouterLink to="/login" class="text-gray-700 hover:text-blue-600">Back to Login</RouterLink>
        <RouterLink
          to="/signup"
          class="text-gray-700 hover:text-blue-600"
        >
          Sign Up
        </RouterLink>
      </nav>
    </header>

    <!-- Main content -->
    <main class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <div class="text-center mb-6">
          <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-extrabold">Forgot Password?</h2>
          <p class="text-sm text-gray-600 mt-2">No worries! Enter your email and we'll send you reset instructions.</p>
          <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-xs text-blue-700">
              <strong>Note:</strong> If you signed up with Google, please use the "Sign in with Google" button on the login page instead.
            </p>
          </div>
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="email">Email Address</label>
            <input
              id="email"
              type="email"
              v-model="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="jane@example.com"
              autocomplete="email"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Sending..." : "Send Reset Instructions" }}
          </button>

          <p v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</p>
          <p v-if="successMessage" class="text-green-600 text-sm text-center">{{ successMessage }}</p>

          <p class="text-sm text-gray-600 text-center">
            Remember your password?
            <RouterLink to="/login" class="text-blue-600 hover:underline">Back to Login</RouterLink>
          </p>
        </form>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>
