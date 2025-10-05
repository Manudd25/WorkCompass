<script setup>
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";

const router = useRouter();
const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
  router.push("/");
};
</script>

<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden">
    <!-- Video Background -->
    <video 
      autoplay 
      muted 
      loop 
      playsinline 
      class="absolute inset-0 w-full h-full object-cover z-0"
    >
      <source src="/videos/background-video.mp4" type="video/mp4">
      <!-- Fallback for browsers that don't support video -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-100 to-blue-100"></div>
    </video>

    <!-- Overlay for better text readability -->
    <div class="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center px-8 py-4 bg-white bg-opacity-90 backdrop-blur-sm shadow-md">
      <h1 class="text-2xl font-bold text-blue-600">WorkCompass</h1>
      <nav class="space-x-6">
        <!-- Show different nav based on login status -->
        <template v-if="userStore.user">
          <!-- Logged in user navigation -->
          <span class="hidden sm:inline text-gray-600 font-medium">Hi, {{ userStore.user.name }}</span>
          <RouterLink to="/dashboard" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
            </svg>
            Dashboard
          </RouterLink>
          <button @click="handleLogout" class="text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-red-200">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Logout
          </button>
        </template>
        <template v-else>
          <!-- Guest user navigation -->
          <RouterLink to="/login" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            Login
          </RouterLink>
          <RouterLink
            to="/signup"
            class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
          >
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            Sign Up
          </RouterLink>
        </template>
      </nav>
    </header>

    <!-- Hero -->
    <main class="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
      <h2 class="text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg">
        Track your job search like a pro 🚀
      </h2>
      <p class="max-w-xl text-lg mb-10 text-white drop-shadow-md">
        Manage your applications, monitor progress, and stay organized —
        whether you're a candidate or a recruiter.
      </p>
      <RouterLink
        :to="userStore.user ? '/dashboard' : '/signup'"
        class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
      >
        <svg class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        {{ userStore.user ? 'Go to Dashboard' : 'Get Started' }}
      </RouterLink>
    </main>

    <!-- Footer -->
    <footer class="relative z-20 bg-white bg-opacity-90 backdrop-blur-sm text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>
