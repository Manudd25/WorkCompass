<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <!-- Header -->
    <header class="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      <RouterLink to="/" class="text-2xl font-bold text-blue-600">WorkCompass</RouterLink>
      <nav class="space-x-4 flex items-center">
        <RouterLink to="/" class="text-gray-700 hover:text-blue-600">Home</RouterLink>
        <RouterLink v-if="userStore.user" to="/dashboard" class="text-gray-700 hover:text-blue-600">Dashboard</RouterLink>
        <RouterLink v-if="!userStore.user" to="/login" class="text-gray-700 hover:text-blue-600">Login</RouterLink>
        <RouterLink v-if="!userStore.user" to="/signup" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Sign Up</RouterLink>
        <button v-if="userStore.user" @click="handleLogout" class="text-gray-700 hover:text-red-600">Logout</button>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="max-w-2xl w-full">
        <!-- Page Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
          <p class="text-gray-600">We'd love to hear from you! Send us your feedback, questions, or suggestions.</p>
        </div>

        <!-- Feedback Form -->
        <div class="bg-white rounded-xl shadow-lg p-8">
          <form @submit.prevent="submitFeedbackForm" class="space-y-6">
            <!-- Rating -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">How would you rate your experience with WorkCompass?</label>
              <div class="flex space-x-2 justify-center">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  @click="feedback.rating = star"
                  class="text-3xl transition-colors hover:scale-110 transform"
                  :class="star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'"
                >
                  ★
                </button>
              </div>
              <p class="text-center text-sm text-gray-500 mt-2">
                {{ feedback.rating === 1 ? 'Poor' : feedback.rating === 2 ? 'Fair' : feedback.rating === 3 ? 'Good' : feedback.rating === 4 ? 'Very Good' : feedback.rating === 5 ? 'Excellent' : 'Select a rating' }}
              </p>
            </div>

            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Name (Optional)</label>
              <input
                v-model="feedback.name"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
              <input
                v-model="feedback.email"
                type="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <!-- Message -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Message *</label>
              <textarea
                v-model="feedback.message"
                rows="5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Send us your message, feedback, questions, or suggestions..."
                required
              ></textarea>
            </div>

            <!-- Category -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Category (Optional)</label>
              <select
                v-model="feedback.category"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="ui">User Interface</option>
                <option value="performance">Performance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Submit Button -->
            <div class="text-center">
              <button
                type="submit"
                :disabled="isSubmittingFeedback || !feedback.message.trim()"
                class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <svg v-if="!isSubmittingFeedback" class="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
                <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                {{ isSubmittingFeedback ? 'Sending...' : 'Send Message' }}
              </button>
            </div>

            <!-- Message -->
            <div v-if="feedbackMessage" class="text-center">
              <div class="p-4 rounded-lg" :class="feedbackMessage.includes('Thank you') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'">
                <svg v-if="feedbackMessage.includes('Thank you')" class="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <svg v-else class="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ feedbackMessage }}
              </div>
            </div>
          </form>
        </div>

      </div>
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import Footer from "../components/Footer.vue";
import { submitFeedback } from "../../services/api.js";

const router = useRouter();
const userStore = useUserStore();

// Feedback form state
const feedback = ref({
  name: "",
  email: "",
  message: "",
  rating: 5,
  category: ""
});

const isSubmittingFeedback = ref(false);
const feedbackMessage = ref("");

const handleLogout = () => {
  userStore.logout();
  router.push("/");
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
    feedbackMessage.value = "Thank you for your feedback! We'll review it soon and get back to you if needed.";
    
    // Reset form after successful submission
    setTimeout(() => {
      feedback.value = { name: "", email: "", message: "", rating: 5, category: "" };
      feedbackMessage.value = "";
    }, 3000);
  } catch (error) {
    feedbackMessage.value = "Failed to submit feedback. Please try again or contact us directly.";
  } finally {
    isSubmittingFeedback.value = false;
  }
};
</script>
