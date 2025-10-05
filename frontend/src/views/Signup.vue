<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { signup, googleAuth } from "../../services/api.js";

const router = useRouter();
const userStore = useUserStore();

const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("candidate");
const recruiterCompany = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const googleButtonEl = ref(null);

const handleSignup = async () => {
  errorMessage.value = "";
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = "Please fill in all required fields.";
    return;
  }
  if (role.value === "recruiter" && !recruiterCompany.value) {
    errorMessage.value = "Company is required for recruiters.";
    return;
  }
  try {
    isSubmitting.value = true;
    const res = await signup({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
      recruiterCompany: role.value === "recruiter" ? recruiterCompany.value : null,
    });
    // Persist user + token in store
    userStore.setUser(res.user, res.token);
    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = error?.message || "Signup failed. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const initGoogle = () => {
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
    text: "signup_with",
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
    errorMessage.value = err?.message || "Google sign-up failed.";
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
        <RouterLink to="/login" class="text-gray-700 hover:text-blue-600">Login</RouterLink>
        <RouterLink
          to="/signup"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Sign Up
        </RouterLink>
      </nav>
    </header>

    <!-- Main content -->
    <main class="flex-1 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
        <h2 class="text-2xl font-extrabold text-center mb-6">Create your account</h2>
        <p class="text-sm text-gray-600 text-center mb-8">Start tracking your applications today.</p>

        <form @submit.prevent="handleSignup" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="name">Name</label>
            <input
              id="name"
              type="text"
              v-model="name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jane Doe"
              autocomplete="name"
              required
            />
          </div>

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
            <label class="block text-sm font-medium text-gray-700 mb-1" for="password">Password</label>
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
            <label class="block text-sm font-medium text-gray-700 mb-1" for="role">Role</label>
            <select
              id="role"
              v-model="role"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="candidate">Candidate</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>
          
          <!-- Company field for recruiters -->
          <div v-if="role === 'recruiter'">
            <label class="block text-sm font-medium text-gray-700 mb-1" for="company">Company</label>
            <input
              id="company"
              v-model="recruiterCompany"
              type="text"
              placeholder="Enter your company name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Creating account..." : "Sign Up" }}
          </button>

          <p v-if="errorMessage" class="text-red-600 text-sm text-center">{{ errorMessage }}</p>

          <p class="text-sm text-gray-600 text-center">
            Already have an account?
            <RouterLink to="/login" class="text-blue-600 hover:underline">Login</RouterLink>
          </p>
        </form>

        <!-- Social auth divider -->
        <div class="flex items-center my-6">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="px-3 text-gray-400 text-sm">or</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        <!-- Google Sign-Up button mounts here -->
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