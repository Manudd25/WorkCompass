<script setup>
import { onMounted, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import ApplicationCard from "../components/ApplicationCard.vue";
import AIInsights from "../components/AIInsights.vue";
import InterviewPrep from "../components/InterviewPrep.vue";
import StatusBadge from "../components/StatusBadge.vue";
import Footer from "../components/Footer.vue";
import { getApplications, updateApplication } from "../../services/api.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const application = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const isUpdating = ref(false);
const updateMessage = ref("");

const fetchApplication = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }
    const id = route.params.id;
    const res = await getApplications(token, userStore.user?.id);
    const list = res || [];
    application.value = list.find((a) => a._id === id) || null;
    if (!application.value) errorMessage.value = "Application not found.";
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load application.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchApplication);

const saveStatus = async () => {
  updateMessage.value = "";
  try {
    if (!application.value) return;
    isUpdating.value = true;
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }
    const id = application.value._id;
    await updateApplication(id, { status: application.value.status }, token);
    updateMessage.value = "Status updated.";
    window.dispatchEvent(new CustomEvent("applications-updated"));
  } catch (error) {
    updateMessage.value = error?.message || "Failed to update status.";
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <!-- Header -->
    <header class="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div class="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <h1 @click="router.push('/')" class="cursor-pointer text-2xl font-bold text-indigo-600 dark:text-indigo-400">WorkCompass</h1>
        <nav class="space-x-4 flex items-center">
          <RouterLink to="/applications" class="text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400">All Applications</RouterLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <h2 class="mb-6 text-3xl font-bold">Application details</h2>

      <div v-if="errorMessage" class="mb-4 text-red-600 dark:text-red-400">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-gray-600 dark:text-slate-400">Loading…</div>
      <div v-else-if="!application" class="text-gray-600 dark:text-slate-400">No application found.</div>
      <div v-else class="space-y-6">
        <section class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-2xl font-semibold">{{ application.role }}</p>
              <p class="text-slate-600 dark:text-slate-400">{{ application.company }}</p>
            </div>
            <StatusBadge :status="application.status" />
          </div>
          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Applied on</p>
              <p class="mt-1 font-medium">{{ new Date(application.date).toLocaleDateString() }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Interview plan</p>
              <p class="mt-1 font-medium">{{ application.interviewDate ? new Date(application.interviewDate).toLocaleDateString() : "Not scheduled" }}</p>
            </div>
          </div>
          <div class="mt-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Notes and recruiter context</p>
            <p class="mt-1 text-sm text-slate-700 dark:text-slate-300">{{ application.notes || "No notes yet." }}</p>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 class="text-lg font-semibold">Update pipeline status</h3>
          <div class="mt-3 flex items-center gap-3">
            <select
              id="status"
              v-model="application.status"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <button
              @click="saveStatus"
              :disabled="isUpdating"
              class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {{ isUpdating ? "Saving…" : "Save" }}
            </button>
            <span v-if="updateMessage" class="text-sm" :class="updateMessage.includes('Failed') ? 'text-red-600 dark:text-red-400' : 'text-green-700 dark:text-green-400'">{{ updateMessage }}</span>
          </div>
        </section>

        <ApplicationCard :application="application" />

        <AIInsights :application="application" />
        <InterviewPrep v-if="application.status === 'Interview'" :application="application" />
      </div>
    </main>

    <Footer />
  </div>
</template>
