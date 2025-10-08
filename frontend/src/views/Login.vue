<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { login, googleAuth } from "../../services/api.js";

const router = useRouter();
const userStore = useUserStore();

const email = ref("");
const password = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const googleButtonEl = ref(null);
const showPassword = ref(false);

const handleLogin = async () => {
  errorMessage.value = "";
  if (!email.value || !password.value) {
    errorMessage.value = "Please provide email and password.";
    return;
  }
  try {
    isSubmitting.value = true;
    const res = await login({
      email: email.value,
      password: password.value,
    });
    userStore.setUser(res.user, res.token);
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = error?.message || "Login failed. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const initGoogle = () => {
  // Load Google script 
  if (!document.getElementById("google-gsi-script")) {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.id = "google-gsi-script";
    s.onload = () => setupGoogleButton();
    document.head.appendChild(s);
  } else {
    setupGoogleButton();
  }
};

const setupGoogleButton = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId || !window.google || !googleButtonEl.value) return;

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: false,
    use_fedcm_for_prompt: false,
  });
  window.google.accounts.id.renderButton(googleButtonEl.value, {
    theme: "outline",
    size: "large",
    width: 320,
    text: "signin_with",
    shape: "pill",
    type: "standard",
  });
};

const handleGoogleCredentialResponse = async (response) => {
  try {
    const idToken = response?.credential;
    if (!idToken) return;
    const res = await googleAuth(idToken);
    userStore.setUser(res.user, res.token);
    router.push("/dashboard");
  } catch (err) {
    errorMessage.value = err?.message || "Google sign-in failed.";
  }
};

  

onMounted(() => {
  initGoogle();
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <!-- Header -->
    <header class="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <h1 @click="router.push('/')" class="text-2xl font-bold text-blue-600 cursor-pointer">WorkCompass</h1>
      <nav class="space-x-6">
        <RouterLink to="/login" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Login</RouterLink>
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
        <h2 class="text-2xl font-extrabold text-center mb-6">Welcome back</h2>
        <p class="text-sm text-gray-600 text-center mb-8">Log in to access your dashboard.</p>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="email">Email</label>
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

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="block text-sm font-medium text-gray-700" for="password">Password</label>
              <RouterLink to="/forgot-password" class="text-sm text-blue-600 hover:underline">
                Forgot password?
              </RouterLink>
            </div>
            <div class="relative">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                class="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Logging in..." : "Login" }}
          </button>

          <p v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</p>

          <p class="text-sm text-gray-600 text-center">
            New here?
            <RouterLink to="/signup" class="text-blue-600 hover:underline">Create an account</RouterLink>
          </p>
        </form>

        <!-- Social auth divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="px-3 text-gray-400 text-sm">or</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Google Sign-In button mounts here -->
        <div class="flex justify-center">
          <div ref="googleButtonEl"></div>
        </div>

        
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white text-center py-4 text-gray-500 text-sm">
      © 2025 WorkCompass — Made with ❤️ for ambitious job seekers and recruiters
    </footer>
  </div>
</template>