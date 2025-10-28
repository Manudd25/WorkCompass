<template>
  <div class="ai-insights-card bg-white rounded-lg shadow-md border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800">AI Insights</h3>
          <p class="text-sm text-gray-600">Personalized recommendations for {{ application.company }}</p>
        </div>
      </div>
      <button 
        @click="generateInsights" 
        :disabled="isLoading"
        class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="!isLoading" class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
        {{ isLoading ? 'Analyzing...' : 'Get Insights' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-8">
      <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <div class="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p class="text-gray-600">Analyzing your application...</p>
    </div>

    <!-- Insights Content -->
    <div v-else-if="insights" class="space-y-4">
      <!-- Summary -->
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="font-semibold text-blue-800 mb-2">Summary</h4>
        <p class="text-blue-700">{{ insights.summary }}</p>
        <div class="mt-2 text-sm text-blue-600">
          Confidence: {{ Math.round(insights.confidence * 100) }}%
        </div>
      </div>

      <!-- Strengths -->
      <div v-if="insights.insights.strengths.length > 0" class="bg-green-50 rounded-lg p-4">
        <h4 class="font-semibold text-green-800 mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Strengths
        </h4>
        <ul class="space-y-1">
          <li v-for="strength in insights.insights.strengths" :key="strength" class="text-green-700 flex items-start">
            <span class="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            {{ strength }}
          </li>
        </ul>
      </div>

      <!-- Improvements -->
      <div v-if="insights.insights.improvements.length > 0" class="bg-yellow-50 rounded-lg p-4">
        <h4 class="font-semibold text-yellow-800 mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          Areas for Improvement
        </h4>
        <ul class="space-y-1">
          <li v-for="improvement in insights.insights.improvements" :key="improvement" class="text-yellow-700 flex items-start">
            <span class="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            {{ improvement }}
          </li>
        </ul>
      </div>

      <!-- Recommendations -->
      <div v-if="insights.insights.recommendations.length > 0" class="bg-indigo-50 rounded-lg p-4">
        <h4 class="font-semibold text-indigo-800 mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Recommendations
        </h4>
        <ul class="space-y-1">
          <li v-for="recommendation in insights.insights.recommendations" :key="recommendation" class="text-indigo-700 flex items-start">
            <span class="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            {{ recommendation }}
          </li>
        </ul>
      </div>

      <!-- Interview Tips -->
      <div v-if="insights.insights.interviewTips.length > 0" class="bg-purple-50 rounded-lg p-4">
        <h4 class="font-semibold text-purple-800 mb-2 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          Interview Tips
        </h4>
        <ul class="space-y-1">
          <li v-for="tip in insights.insights.interviewTips" :key="tip" class="text-purple-700 flex items-start">
            <span class="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            {{ tip }}
          </li>
        </ul>
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
        @click="generateInsights" 
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Initial State -->
    <div v-else class="text-center py-8 text-gray-500">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      </div>
      <p class="text-lg font-medium mb-2">Get AI-Powered Insights</p>
      <p class="text-sm">Click the button above to analyze your application and get personalized recommendations.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '../store/userStore.js';
import { generateApplicationInsights } from '../../services/aiService.js';

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
});

const userStore = useUserStore();

const insights = ref(null);
const isLoading = ref(false);
const error = ref('');

const generateInsights = async () => {
  if (isLoading.value) return;
  
  try {
    isLoading.value = true;
    error.value = '';
    
    const result = await generateApplicationInsights(props.application._id, userStore.token);
    insights.value = result;
  } catch (err) {
    console.error('Failed to generate insights:', err);
    error.value = err.message || 'Failed to generate insights. Please try again.';
  } finally {
    isLoading.value = false;
  }
};
</script>
