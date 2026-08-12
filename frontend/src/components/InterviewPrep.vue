<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/30">
    <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center space-x-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500">
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Interview Preparation</h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Get ready for your {{ application.role }} interview at {{ application.company }}
          </p>
        </div>
      </div>
      <button
        type="button"
        :disabled="isLoading"
        class="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        @click="generatePrep"
      >
        <svg v-if="!isLoading" class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <div v-else class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        {{ isLoading ? "Preparing..." : "Get Prep Guide" }}
      </button>
    </div>

    <div v-if="isLoading" class="py-8 text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
      <p class="text-slate-600 dark:text-slate-400">Preparing your interview guide...</p>
    </div>

    <div v-else-if="prepData" class="space-y-6">
      <div class="rounded-lg bg-sky-50 p-4 dark:bg-sky-900/20">
        <h4 class="mb-2 flex items-center font-semibold text-sky-800 dark:text-sky-200">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          Company Research
        </h4>
        <p class="text-sky-700 dark:text-sky-300">{{ prepData.companyInfo }}</p>
      </div>

      <div class="rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
        <h4 class="mb-3 flex items-center font-semibold text-slate-800 dark:text-slate-100">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Practice Questions
        </h4>
        <div class="space-y-3">
          <div
            v-for="(question, index) in prepData.questions"
            :key="index"
            class="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
          >
            <div class="flex items-start space-x-3">
              <span class="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-medium text-white">
                {{ index + 1 }}
              </span>
              <div class="flex-1">
                <p class="font-medium text-slate-800 dark:text-slate-100">{{ question }}</p>
                <div class="mt-2 flex space-x-2">
                  <button
                    type="button"
                    class="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    @click="toggleAnswer(index)"
                  >
                    {{ showAnswers[index] ? "Hide" : "Show" }} Answer Tips
                  </button>
                </div>
                <div
                  v-if="showAnswers[index]"
                  class="mt-2 rounded bg-emerald-50 p-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                >
                  <strong>Tips:</strong> Prepare specific examples using the STAR method (Situation, Task, Action, Result). Be concise but detailed, and relate your answer to the role you're applying for.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-lg bg-violet-50 p-4 dark:bg-violet-900/20">
        <h4 class="mb-2 flex items-center font-semibold text-violet-800 dark:text-violet-200">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
          Interview Tips
        </h4>
        <ul class="space-y-2">
          <li v-for="tip in prepData.tips" :key="tip" class="flex items-start text-violet-700 dark:text-violet-300">
            <span class="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-violet-500"></span>
            {{ tip }}
          </li>
        </ul>
      </div>

      <div class="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
        <h4 class="mb-2 flex items-center font-semibold text-amber-800 dark:text-amber-200">
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          Pre-Interview Checklist
        </h4>
        <div class="space-y-2">
          <label class="flex items-center space-x-3 text-amber-700 dark:text-amber-300">
            <input type="checkbox" class="rounded border-amber-300 text-amber-500 focus:ring-amber-500 dark:border-amber-600" />
            <span>Research company culture and recent news</span>
          </label>
          <label class="flex items-center space-x-3 text-amber-700 dark:text-amber-300">
            <input type="checkbox" class="rounded border-amber-300 text-amber-500 focus:ring-amber-500 dark:border-amber-600" />
            <span>Prepare 3-5 thoughtful questions about the role</span>
          </label>
          <label class="flex items-center space-x-3 text-amber-700 dark:text-amber-300">
            <input type="checkbox" class="rounded border-amber-300 text-amber-500 focus:ring-amber-500 dark:border-amber-600" />
            <span>Practice answers to common questions</span>
          </label>
          <label class="flex items-center space-x-3 text-amber-700 dark:text-amber-300">
            <input type="checkbox" class="rounded border-amber-300 text-amber-500 focus:ring-amber-500 dark:border-amber-600" />
            <span>Test technology setup (if virtual interview)</span>
          </label>
          <label class="flex items-center space-x-3 text-amber-700 dark:text-amber-300">
            <input type="checkbox" class="rounded border-amber-300 text-amber-500 focus:ring-amber-500 dark:border-amber-600" />
            <span>Prepare professional attire and quiet space</span>
          </label>
        </div>
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
        @click="generatePrep"
      >
        Try Again
      </button>
    </div>

    <div v-else class="py-8 text-center text-slate-500 dark:text-slate-400">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
        <svg class="h-8 w-8 text-slate-400 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      </div>
      <p class="mb-2 text-lg font-medium text-slate-800 dark:text-slate-100">Prepare for Your Interview</p>
      <p class="text-sm">Click the button above to get personalized interview preparation materials.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "../store/userStore.js";
import { generateInterviewPrep } from "../../services/aiService.js";

const props = defineProps({
  application: {
    type: Object,
    required: true,
  },
});

const userStore = useUserStore();

const prepData = ref(null);
const isLoading = ref(false);
const error = ref("");
const showAnswers = ref({});

const generatePrep = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    error.value = "";

    const result = await generateInterviewPrep(props.application._id, userStore.token);
    prepData.value = result;

    showAnswers.value = {};
    result.questions.forEach((_, index) => {
      showAnswers.value[index] = false;
    });
  } catch (err) {
    console.error("Failed to generate interview prep:", err);
    error.value = err.message || "Failed to generate interview preparation. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const toggleAnswer = (index) => {
  showAnswers.value[index] = !showAnswers.value[index];
};
</script>
