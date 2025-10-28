<template>
  <div class="interview-prep-card bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Interview Preparation</h3>
          <p class="text-sm text-gray-600">Get ready for your {{ application.role }} interview at {{ application.company }}</p>
        </div>
      </div>
      <button 
        @click="generatePrep" 
        :disabled="isLoading"
        class="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="!isLoading" class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
        {{ isLoading ? 'Preparing...' : 'Get Prep Guide' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <div class="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="text-gray-600">Preparing your interview guide...</p>
    </div>

    <!-- Prep Content -->
    <div v-else-if="prepData" class="space-y-6">
      <!-- Company Information -->
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-800 mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          Company Research
        </h4>
        <p class="text-blue-700">{{ prepData.companyInfo }}</p>
      </div>

      <!-- Interview Questions -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Practice Questions
        </h4>
        <div class="space-y-3">
          <div v-for="(question, index) in prepData.questions" :key="index" class="bg-white rounded-lg p-3 border border-gray-200">
            <div class="flex items-start space-x-3">
              <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <p class="text-gray-800 font-medium">{{ question }}</p>
                <div class="mt-2 flex space-x-2">
                  <button 
                    @click="toggleAnswer(index)"
                    class="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {{ showAnswers[index] ? 'Hide' : 'Show' }} Answer Tips
                  </button>
                </div>
                <div v-if="showAnswers[index]" class="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                  <strong>Tips:</strong> Prepare specific examples using the STAR method (Situation, Task, Action, Result). Be concise but detailed, and relate your answer to the role you're applying for.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Interview Tips -->
      <div class="bg-purple-50 rounded-lg p-4">
        <h4 class="font-semibold text-purple-800 mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Interview Tips
        </h4>
        <ul class="space-y-2">
          <li v-for="tip in prepData.tips" :key="tip" class="text-purple-700 flex items-start">
            <span class="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            {{ tip }}
          </li>
        </ul>
      </div>

      <!-- Action Items -->
      <div class="bg-yellow-50 rounded-lg p-4">
        <h4 class="font-semibold text-yellow-800 mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          Pre-Interview Checklist
        </h4>
        <div class="space-y-2">
          <label class="flex items-center space-x-3 text-yellow-700">
            <input type="checkbox" class="rounded border-yellow-300 text-yellow-500 focus:ring-yellow-500" />
            <span>Research company culture and recent news</span>
          </label>
          <label class="flex items-center space-x-3 text-yellow-700">
            <input type="checkbox" class="rounded border-yellow-300 text-yellow-500 focus:ring-yellow-500" />
            <span>Prepare 3-5 thoughtful questions about the role</span>
          </label>
          <label class="flex items-center space-x-3 text-yellow-700">
            <input type="checkbox" class="rounded border-yellow-300 text-yellow-500 focus:ring-yellow-500" />
            <span>Practice answers to common questions</span>
          </label>
          <label class="flex items-center space-x-3 text-yellow-700">
            <input type="checkbox" class="rounded border-yellow-300 text-yellow-500 focus:ring-yellow-500" />
            <span>Test technology setup (if virtual interview)</span>
          </label>
          <label class="flex items-center space-x-3 text-yellow-700">
            <input type="checkbox" class="rounded border-yellow-300 text-yellow-500 focus:ring-yellow-500" />
            <span>Prepare professional attire and quiet space</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button 
        @click="generatePrep" 
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Initial State -->
    <div v-else class="text-center py-8 text-gray-500">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <p class="text-lg font-medium mb-2">Prepare for Your Interview</p>
      <p class="text-sm">Click the button above to get personalized interview preparation materials.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../store/userStore.js';
import { generateInterviewPrep } from '../../services/aiService.js';

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
});

const userStore = useUserStore();

const prepData = ref(null);
const isLoading = ref(false);
const error = ref('');
const showAnswers = ref({});

const generatePrep = async () => {
  if (isLoading.value) return;
  
  try {
    isLoading.value = true;
    error.value = '';
    
    const result = await generateInterviewPrep(props.application._id, userStore.token);
    prepData.value = result;
    
    // Initialize showAnswers for each question
    showAnswers.value = {};
    result.questions.forEach((_, index) => {
      showAnswers.value[index] = false;
    });
  } catch (err) {
    console.error('Failed to generate interview prep:', err);
    error.value = err.message || 'Failed to generate interview preparation. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

const toggleAnswer = (index) => {
  showAnswers.value[index] = !showAnswers.value[index];
};
</script>
