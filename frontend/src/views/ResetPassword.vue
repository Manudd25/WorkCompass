<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { resetPassword } from "../../services/api.js";

const router = useRouter();
const route = useRoute();

const password = ref("");
const confirmPassword = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const token = ref("");

onMounted(() => {
  token.value = route.query.token;
  if (!token.value) {
    errorMessage.value = "Invalid or missing reset token. Please request a new password reset.";
  }
});

const handleResetPassword = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  
  if (!password.value || !confirmPassword.value) {
    errorMessage.value = "Please fill in all fields.";
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Passwords do not match.";
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = "Password must be at least 6 characters long.";
    return;
  }

  try {
    isSubmitting.value = true;
    await resetPassword(token.value, password.value);
    successMessage.value = "Password reset successfully! You can now log in with your new password.";
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (error) {
    errorMessage.value = error?.message || "Failed to reset password. Please try again.";
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
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-extrabold">Reset Your Password</h2>
          <p class="text-sm text-gray-600 mt-2">Enter your new password below.</p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="password">New Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              autocomplete="new-password"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="confirmPassword"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              autocomplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting || !token"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Resetting..." : "Reset Password" }}
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
