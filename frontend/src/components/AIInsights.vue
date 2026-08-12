<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/30">
    <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center space-x-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500">
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Insights</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">Personalized recommendations for {{ application.company }}</p>
        </div>
      </div>
      <button
        type="button"
        :disabled="isLoading"
        class="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="generateInsights"
      >
        <svg v-if="!isLoading" class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <div v-else class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        {{ isLoading ? "Analyzing..." : "Get Insights" }}
      </button>
    </div>

    <div v-if="isLoading" class="py-8 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
      <p class="text-slate-600 dark:text-slate-400">Analyzing your application...</p>
    </div>

    <div v-else-if="insights" class="space-y-4">
      <div class="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-900/20">
        <h4 class="mb-2 font-semibold text-indigo-800 dark:text-indigo-200">Summary</h4>
        <p class="text-indigo-700 dark:text-indigo-300">{{ insights.summary }}</p>
        <div class="mt-2 text-sm text-indigo-600 dark:text-indigo-400">
          Confidence: {{ Math.round(insights.confidence * 100) }}%
        </div>
      </div>

      <div v-if="insights.insights.strengths.length > 0" class="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
        <h4 class="mb-2 flex items-center font-semibold text-emerald-800 dark:text-emerald-200">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Strengths
        </h4>
        <ul class="space-y-1">
          <li v-for="strength in insights.insights.strengths" :key="strength" class="flex items-start text-emerald-700 dark:text-emerald-300">
            <span class="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500"></span>
            {{ strength }}
          </li>
        </ul>
      </div>

      <div v-if="insights.insights.improvements.length > 0" class="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
        <h4 class="mb-2 flex items-center font-semibold text-amber-800 dark:text-amber-200">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          Areas for Improvement
        </h4>
        <ul class="space-y-1">
          <li v-for="improvement in insights.insights.improvements" :key="improvement" class="flex items-start text-amber-700 dark:text-amber-300">
            <span class="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500"></span>
            {{ improvement }}
          </li>
        </ul>
      </div>

      <div v-if="insights.insights.recommendations.length > 0" class="rounded-lg bg-sky-50 p-4 dark:bg-sky-900/20">
        <h4 class="mb-2 flex items-center font-semibold text-sky-800 dark:text-sky-200">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Recommendations
        </h4>
        <ul class="space-y-1">
          <li v-for="recommendation in insights.insights.recommendations" :key="recommendation" class="flex items-start text-sky-700 dark:text-sky-300">
            <span class="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-sky-500"></span>
            {{ recommendation }}
          </li>
        </ul>
      </div>

      <div v-if="insights.insights.interviewTips.length > 0" class="rounded-lg bg-violet-50 p-4 dark:bg-violet-900/20">
        <h4 class="mb-2 flex items-center font-semibold text-violet-800 dark:text-violet-200">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          Interview Tips
        </h4>
        <ul class="space-y-1">
          <li v-for="tip in insights.insights.interviewTips" :key="tip" class="flex items-start text-violet-700 dark:text-violet-300">
            <span class="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-violet-500"></span>
            {{ tip }}
          </li>
        </ul>
      </div>
    </div>

    <div v-else-if="error" class="py-8 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <svg class="h-8 w-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="mb-4 text-red-600 dark:text-red-400">{{ error }}</p>
      <button
        type="button"
        class="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        @click="generateInsights"
      >
        Try Again
      </button>
    </div>

    <div v-else class="py-8 text-center text-slate-500 dark:text-slate-400">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
        <svg class="h-8 w-8 text-slate-400 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      </div>
      <p class="mb-2 text-lg font-medium text-slate-800 dark:text-slate-100">Get AI-Powered Insights</p>
      <p class="text-sm">Click the button above to analyze your application and get personalized recommendations.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "../store/userStore.js";
import { generateApplicationInsights } from "../../services/aiService.js";

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
});

const userStore = useUserStore();

const insights = ref(null);
const isLoading = ref(false);
const error = ref("");

const generateInsights = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    error.value = "";

    const result = await generateApplicationInsights(props.application._id, userStore.token);
    insights.value = result;
  } catch (err) {
    console.error("Failed to generate insights:", err);
    error.value = err.message || "Failed to generate insights. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>
