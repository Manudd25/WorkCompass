<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import Footer from "../components/Footer.vue";
import AIAgent from "../components/AIAgent.vue";
import SectionHeader from "../components/SectionHeader.vue";
import MetricCard from "../components/MetricCard.vue";
import StatusBadge from "../components/StatusBadge.vue";
import EmptyState from "../components/EmptyState.vue";
import SidebarShell from "../components/SidebarShell.vue";
import { getApplications } from "../../services/api.js";

const router = useRouter();
const userStore = useUserStore();

const applications = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

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

const fetchApplications = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const token = userStore.token;
    const userId = userStore.user?.id;
    if (!token || !userId) {
      router.push("/login");
      return;
    }
    const isRecruiter = userStore.user?.role === "recruiter";
    const candidateId = isRecruiter ? null : userId;
    const res = await getApplications(token, candidateId);
    applications.value = res || [];
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load applications.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchApplications);
const onAppsUpdated = () => fetchApplications();
onMounted(() => window.addEventListener("applications-updated", onAppsUpdated));
onBeforeUnmount(() => window.removeEventListener("applications-updated", onAppsUpdated));

const statusCount = computed(() => {
  const counts = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
  applications.value.forEach((app) => {
    if (counts[app.status] !== undefined) counts[app.status] += 1;
  });
  return counts;
});

const recentApplications = computed(() =>
  [...applications.value]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
);

const upcomingActions = computed(() =>
  applications.value
    .filter((app) => app.interviewDate || app.interviewTime)
    .sort((a, b) => new Date(a.interviewDate || a.date) - new Date(b.interviewDate || b.date))
    .slice(0, 4)
);
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
      <SectionHeader title="Dashboard" subtitle="Track your pipeline, analyze outcomes, and decide your next move." />

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Applications" :value="applications.length" />
        <MetricCard label="Interviews" :value="statusCount.Interview" />
        <MetricCard label="Offers" :value="statusCount.Offer" />
        <MetricCard label="Rejections" :value="statusCount.Rejected" />
      </div>

      <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Pipeline</h3>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-lg bg-indigo-50 p-3 text-sm dark:bg-indigo-900/20 dark:text-indigo-300">Applied: <strong>{{ statusCount.Applied }}</strong></div>
          <div class="rounded-lg bg-amber-50 p-3 text-sm dark:bg-amber-900/20 dark:text-amber-300">Interview: <strong>{{ statusCount.Interview }}</strong></div>
          <div class="rounded-lg bg-emerald-50 p-3 text-sm dark:bg-emerald-900/20 dark:text-emerald-300">Offer: <strong>{{ statusCount.Offer }}</strong></div>
          <div class="rounded-lg bg-red-50 p-3 text-sm dark:bg-red-900/20 dark:text-red-300">Rejected: <strong>{{ statusCount.Rejected }}</strong></div>
        </div>
      </section>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <section class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Upcoming actions</h3>
          <div v-if="upcomingActions.length" class="mt-4 space-y-3">
            <article v-for="app in upcomingActions" :key="app._id" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p class="font-semibold dark:text-slate-100">{{ app.role }} <span class="text-slate-500 dark:text-slate-400">@ {{ app.company }}</span></p>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                {{ new Date(app.interviewDate || app.date).toLocaleDateString() }}
              </p>
            </article>
          </div>
          <EmptyState v-else title="No scheduled follow-ups" message="Add interview dates in application details to see them here." />
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent applications</h3>
          <div v-if="recentApplications.length" class="mt-4 space-y-3">
            <article v-for="app in recentApplications" :key="app._id" class="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div>
                <p class="font-semibold dark:text-slate-100">{{ app.role }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ app.company }}</p>
              </div>
              <div class="flex items-center gap-3">
                <StatusBadge :status="app.status" />
                <RouterLink :to="`/applications/${app._id}`" class="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">Open</RouterLink>
              </div>
            </article>
          </div>
          <EmptyState v-else title="No applications yet" message="Create your first application to start the pipeline." cta-text="Add application" cta-to="/applications/new" />
        </section>
      </div>

      <p v-if="isLoading" class="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading dashboard data...</p>
      <p v-if="errorMessage" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    </SidebarShell>

    <Footer />
    <div class="fixed bottom-6 right-6 z-50"><AIAgent /></div>
  </div>
</template>
