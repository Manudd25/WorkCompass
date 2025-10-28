<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import AIAgent from "../components/AIAgent.vue";
import Footer from "../components/Footer.vue";
import { submitFeedback } from "../../services/api.js";

const router = useRouter();
const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout();
  router.push("/");
};

// Feedback form state
const showFeedbackForm = ref(false);
const feedback = ref({
  name: "",
  email: "",
  message: "",
  rating: 5
});
const isSubmittingFeedback = ref(false);
const feedbackMessage = ref("");

const toggleFeedbackForm = () => {
  showFeedbackForm.value = !showFeedbackForm.value;
  if (!showFeedbackForm.value) {
    // Reset form when closing
    feedback.value = { name: "", email: "", message: "", rating: 5 };
    feedbackMessage.value = "";
  }
};

const submitFeedbackForm = async () => {
  if (!feedback.value.message.trim()) {
    feedbackMessage.value = "Please enter your feedback message.";
    return;
  }

  isSubmittingFeedback.value = true;
  feedbackMessage.value = "";

  try {
    await submitFeedback(feedback.value);
    feedbackMessage.value = "Thank you for your feedback! We'll review it soon.";
    setTimeout(() => {
      toggleFeedbackForm();
    }, 2000);
  } catch (error) {
    feedbackMessage.value = "Failed to submit feedback. Please try again.";
  } finally {
    isSubmittingFeedback.value = false;
  }
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
    <div class="absolute inset-0 bg-black bg-opacity-10 z-10"></div>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center px-4 sm:px-8 py-4 bg-white bg-opacity-90 backdrop-blur-sm shadow-md">
      <h1 class="text-xl sm:text-2xl font-bold text-blue-600">WorkCompass</h1>
      <nav class="space-x-2 sm:space-x-6">
        <!-- Show different nav based on login status -->
        <template v-if="userStore.user">
          <!-- Logged in user navigation -->
          <span class="hidden md:inline text-gray-600 font-medium text-sm sm:text-base">Hi, {{ userStore.user.name }}</span>
          <RouterLink to="/dashboard" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200 text-sm sm:text-base">
            <svg class="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
            </svg>
            <span class="hidden sm:inline">Dashboard</span>
          </RouterLink>
          <RouterLink to="/feedback" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200 text-sm sm:text-base">
            <svg class="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span class="hidden sm:inline">Contact</span>
          </RouterLink>
          <button @click="handleLogout" class="text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-red-200 text-sm sm:text-base">
            <svg class="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span class="hidden sm:inline">Logout</span>
          </button>
        </template>
        <template v-else>
          <!-- Guest user navigation -->
          <RouterLink to="/login" class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200 text-sm sm:text-base">
            <svg class="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            <span class="hidden sm:inline">Login</span>
          </RouterLink>
          <RouterLink
            to="/signup"
            class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 sm:px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
          >
            <svg class="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            <span class="hidden sm:inline">Sign Up</span>
          </RouterLink>
          <RouterLink
            to="/feedback"
            class="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-blue-200 text-sm sm:text-base"
            title="Contact Us"
          >
            <svg class="w-4 h-4 inline mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span class="hidden sm:inline">Contact</span>
          </RouterLink>
        </template>
      </nav>
    </header>

    <!-- Hero -->
    <main class="relative z-20 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 sm:py-12 min-h-[720px]">
      <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-white drop-shadow-lg">
        Track your job search like a pro 🚀
      </h2>
      <p class="max-w-xl text-base sm:text-lg mb-8 sm:mb-10 text-white drop-shadow-md">
        Manage your applications, monitor progress, and stay organized —
        whether you're a candidate or a recruiter.
      </p>
      <RouterLink
        :to="userStore.user ? '/dashboard' : '/signup'"
        class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
      >
        <svg class="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        {{ userStore.user ? 'Go to Dashboard' : 'Get Started' }}
      </RouterLink>
    </main>

    <!-- Mental Health & Wellness Section -->
    <section class="relative z-20 bg-white bg-opacity-95 backdrop-blur-sm py-16 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h3 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Mental Health & Wellness Support
          </h3>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            We integrate features that monitor employee psychological well-being, 
            offering resources like wellness tracking tools and simple emotional state check-ins.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <!-- Wellness Monitoring -->
          <RouterLink :to="userStore.user ? '/wellness/monitoring' : '/signup'" class="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 block hover:-translate-y-1">
            <div class="mb-4">
              <img src="/images/wellnessmonitoring.jpg" alt="Wellness Monitoring" class="w-full h-48 object-cover rounded-lg">
            </div>
            <div class="flex items-center mb-3">
              <div class="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h4 class="text-xl font-semibold text-gray-800">Wellness Monitoring</h4>
            </div>
            <p class="text-gray-600 mb-4">
              Regular check-ins on emotional state and tools to track psychological well-being over time.
            </p>
            <ul class="text-sm text-gray-500 space-y-1 mb-4">
              <li>• Personalized wellness questionnaires</li>
              <li>• Daily mood tracking</li>
              <li>• Automatic reports for managers</li>
            </ul>
            <span class="text-blue-600 font-semibold text-sm hover:text-blue-700">Explore feature →</span>
          </RouterLink>

          <!-- Wellness Resources -->
          <RouterLink :to="userStore.user ? '/wellness/resources' : '/signup'" class="bg-white rounded-xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 block hover:-translate-y-1">
            <div class="mb-4">
              <img src="/images/wellnessresource.jpg" alt="Wellness Resources" class="w-full h-48 object-cover rounded-lg">
            </div>
            <div class="flex items-center mb-3">
              <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <h4 class="text-xl font-semibold text-gray-800">Wellness Resources</h4>
            </div>
            <p class="text-gray-600 mb-4">
              A comprehensive library of resources to improve employee engagement and productivity.
            </p>
            <ul class="text-sm text-gray-500 space-y-1 mb-4">
              <li>• Guided meditations and mindfulness</li>
              <li>• Stress management exercises</li>
              <li>• Educational content on mental health</li>
            </ul>
            <span class="text-blue-600 font-semibold text-sm hover:text-blue-700">Explore resources →</span>
          </RouterLink>
        </div>

      </div>
    </section>

    <!-- Discussion Forum Section -->
    <section class="relative z-20 bg-gradient-to-br from-gray-50 to-blue-50 py-16 px-4 sm:px-6">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h3 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            Discussion Forum
          </h3>
          <p class="text-lg text-gray-600 max-w-3xl mx-auto">
            Join our community discussions to share experiences, get advice from industry professionals, 
            and connect with like-minded individuals in your field.
          </p>
        </div>

        <div class="max-w-4xl mx-auto">
          <!-- Discussion Forum -->
          <RouterLink :to="userStore.user ? '/community/forum' : '/signup'" class="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 block hover:-translate-y-1">
            <div class="mb-6">
              <img src="/images/community.jpg" alt="Community Discussions" class="w-full h-48 object-cover rounded-lg">
            </div>
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </div>
              <h4 class="text-2xl font-semibold text-gray-800">Community Discussions</h4>
            </div>
            <p class="text-gray-600 mb-6">
              Participate in community discussions, share your experiences and get advice 
              from other professionals in the industry.
            </p>
            <div class="space-y-4 mb-4">
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                Weekly themed discussions
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                Q&A with industry experts
              </div>
              <div class="flex items-center text-sm text-gray-500">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                Professional networking and connections
              </div>
            </div>
            <span class="text-orange-600 font-semibold text-sm hover:text-orange-700">Join discussion →</span>
          </RouterLink>
        </div>

      </div>
    </section>

    <!-- Footer -->
    <Footer class="relative z-20 bg-white bg-opacity-95 backdrop-blur-sm" />

    <!-- Floating Feedback Chat Icon -->
    <div class="fixed bottom-6 right-6 z-50">
      <!-- Chat Icon Button -->
      <button
        v-if="!showFeedbackForm"
        @click="toggleFeedbackForm"
        class="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        title="Send us feedback"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </button>

      <!-- Feedback Form Modal -->
      <div
        v-if="showFeedbackForm"
        class="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-w-sm"
      >
        <!-- Header -->
        <div class="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 class="font-semibold text-lg">Send Feedback</h3>
          <button
            @click="toggleFeedbackForm"
            class="text-white hover:text-gray-200 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Form Content -->
        <div class="p-4">
          <form @submit.prevent="submitFeedbackForm" class="space-y-4">
            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">How would you rate us?</label>
              <div class="flex space-x-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  @click="feedback.rating = star"
                  class="text-2xl transition-colors"
                  :class="star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </button>
              </div>
            </div>

            <!-- Name (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
              <input
                v-model="feedback.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Your name"
              />
            </div>

            <!-- Email (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                v-model="feedback.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="your@email.com"
              />
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                v-model="feedback.message"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Tell us what you think..."
                required
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmittingFeedback || !feedback.message.trim()"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {{ isSubmittingFeedback ? 'Sending...' : 'Send Feedback' }}
            </button>

            <!-- Message -->
            <p v-if="feedbackMessage" class="text-sm text-center" :class="feedbackMessage.includes('Thank you') ? 'text-green-600' : 'text-red-600'">
              {{ feedbackMessage }}
            </p>
          </form>
        </div>
      </div>
    </div>

    <!-- AI Agent - Positioned as floating widget -->
    <div class="fixed bottom-6 right-6 z-50">
      <AIAgent />
    </div>

  </div>
</template>
