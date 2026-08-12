<script setup>
import { onMounted, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import ApplicationCard from "../components/ApplicationCard.vue";
import AIInsights from "../components/AIInsights.vue";
import InterviewPrep from "../components/InterviewPrep.vue";
import StatusBadge from "../components/StatusBadge.vue";
import Footer from "../components/Footer.vue";
import SectionHeader from "../components/SectionHeader.vue";
import SidebarShell from "../components/SidebarShell.vue";
import { getApplications, updateApplication } from "../../services/api.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Applications", to: "/applications" },
  { label: "Calendar", to: "/calendar" },
  { label: "Analytics", to: "/analytics" },
  { label: "Career Compass", to: "/career-compass" },
  { label: "Wellbeing", to: "/wellness/monitoring" },
  { label: "Settings", to: "/settings" },
];
const secondaryItems = [{ label: "Community", to: "/community/forum" }];

const application = ref(null);
const isLoading = ref(false);
const errorMessage = ref("");
const isUpdating = ref(false);
const updateMessage = ref("");

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100";

const toDateInput = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const interviewForm = ref({
  interviewDate: "",
  interviewTime: "",
  interviewType: "video",
  interviewLocation: "",
  notes: "",
});

const syncFormFromApplication = () => {
  if (!application.value) return;
  interviewForm.value = {
    interviewDate: toDateInput(application.value.interviewDate),
    interviewTime: application.value.interviewTime || "",
    interviewType: application.value.interviewType || "video",
    interviewLocation: application.value.interviewLocation || "",
    notes: application.value.notes || "",
  };
};

const hasInterviewScheduled = computed(() => Boolean(interviewForm.value.interviewDate));

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
    if (!application.value) {
      errorMessage.value = "Application not found.";
      return;
    }
    syncFormFromApplication();
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
    const updated = await updateApplication(id, { status: application.value.status }, token);
    application.value = updated;
    updateMessage.value = "Status updated.";
    window.dispatchEvent(new CustomEvent("applications-updated"));
  } catch (error) {
    updateMessage.value = error?.message || "Failed to update status.";
  } finally {
    isUpdating.value = false;
  }
};

const clearInterviewPlan = () => {
  interviewForm.value.interviewDate = "";
  interviewForm.value.interviewTime = "";
  interviewForm.value.interviewLocation = "";
  interviewForm.value.interviewType = "video";
};

const saveDetails = async () => {
  updateMessage.value = "";
  try {
    if (!application.value) return;
    isUpdating.value = true;
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }

    const payload = {
      notes: interviewForm.value.notes,
      interviewDate: interviewForm.value.interviewDate || null,
      interviewTime: interviewForm.value.interviewTime || "",
      interviewType: interviewForm.value.interviewType || "video",
      interviewLocation: interviewForm.value.interviewLocation || "",
    };

    // Scheduling an interview should surface it on the calendar.
    if (payload.interviewDate && application.value.status === "Applied") {
      payload.status = "Interview";
    }

    const id = application.value._id;
    await updateApplication(id, payload, token);
    window.dispatchEvent(new CustomEvent("applications-updated"));
    router.push("/applications");
  } catch (error) {
    updateMessage.value = error?.message || "Failed to save details.";
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
      <SectionHeader title="Application details" subtitle="Review context, update status, and get AI guidance." />

      <div v-if="errorMessage" class="mb-4 text-red-600 dark:text-red-400">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-slate-600 dark:text-slate-400">Loading…</div>
      <div v-else-if="!application" class="text-slate-600 dark:text-slate-400">No application found.</div>
      <div v-else class="space-y-6">
        <section class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ application.role }}</p>
              <p class="text-slate-600 dark:text-slate-400">{{ application.company }}</p>
            </div>
            <StatusBadge :status="application.status" />
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Applied on</p>
              <p class="mt-1 font-medium text-slate-900 dark:text-slate-100">{{ new Date(application.date).toLocaleDateString() }}</p>
            </div>

            <div class="rounded-lg border border-slate-200 p-3 dark:border-slate-700 sm:col-span-1">
              <div class="mb-2 flex items-center justify-between gap-2">
                <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Interview plan</p>
                <button
                  v-if="hasInterviewScheduled"
                  type="button"
                  class="text-xs font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                  @click="clearInterviewPlan"
                >
                  Clear
                </button>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-xs text-slate-500 dark:text-slate-400" for="interview-date">Date</label>
                  <input id="interview-date" v-model="interviewForm.interviewDate" type="date" :class="fieldClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs text-slate-500 dark:text-slate-400" for="interview-time">Time</label>
                  <input id="interview-time" v-model="interviewForm.interviewTime" type="time" :class="fieldClass" />
                </div>
                <div>
                  <label class="mb-1 block text-xs text-slate-500 dark:text-slate-400" for="interview-type">Type</label>
                  <select id="interview-type" v-model="interviewForm.interviewType" :class="fieldClass">
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-xs text-slate-500 dark:text-slate-400" for="interview-location">Location / link</label>
                  <input
                    id="interview-location"
                    v-model="interviewForm.interviewLocation"
                    type="text"
                    placeholder="Meet link or address"
                    :class="fieldClass"
                  />
                </div>
              </div>
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Saving a date adds this interview to your calendar
                <template v-if="application.status === 'Applied'"> and sets status to Interview</template>.
              </p>
            </div>
          </div>

          <div class="mt-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <label class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400" for="app-notes">
              Notes and recruiter context
            </label>
            <textarea
              id="app-notes"
              v-model="interviewForm.notes"
              rows="4"
              placeholder="Add notes, recruiter context, links…"
              class="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400"
            />
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              :disabled="isUpdating"
              class="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              @click="saveDetails"
            >
              {{ isUpdating ? "Saving…" : "Save details" }}
            </button>
            <span
              v-if="updateMessage"
              class="text-sm"
              :class="updateMessage.includes('Failed') ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'"
            >
              {{ updateMessage }}
            </span>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Update pipeline status</h3>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <select
              id="status"
              v-model="application.status"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <button
              type="button"
              :disabled="isUpdating"
              class="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              @click="saveStatus"
            >
              {{ isUpdating ? "Saving…" : "Save" }}
            </button>
          </div>
        </section>

        <ApplicationCard :application="application" />

        <AIInsights :application="application" />
        <InterviewPrep v-if="application.status === 'Interview'" :application="application" />
      </div>
    </SidebarShell>

    <Footer />
  </div>
</template>
