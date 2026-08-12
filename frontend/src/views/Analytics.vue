<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import SidebarShell from "../components/SidebarShell.vue";
import SectionHeader from "../components/SectionHeader.vue";
import MetricCard from "../components/MetricCard.vue";
import Footer from "../components/Footer.vue";
import { getApplications } from "../../services/api.js";

const router = useRouter();
const userStore = useUserStore();
const applications = ref([]);
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

const total = computed(() => applications.value.length);
const interviews = computed(() => applications.value.filter((a) => a.status === "Interview").length);
const offers = computed(() => applications.value.filter((a) => a.status === "Offer").length);
const responseRate = computed(() => (total.value ? Math.round((interviews.value / total.value) * 100) : 0));
const offerConversion = computed(() => (interviews.value ? Math.round((offers.value / interviews.value) * 100) : 0));

const sourceEffectiveness = computed(() => {
  const byCompany = {};
  applications.value.forEach((app) => {
    byCompany[app.company] = byCompany[app.company] || { total: 0, success: 0 };
    byCompany[app.company].total += 1;
    if (app.status === "Interview" || app.status === "Offer") byCompany[app.company].success += 1;
  });
  return Object.entries(byCompany)
    .map(([company, stats]) => ({
      company,
      rate: Math.round((stats.success / stats.total) * 100),
      total: stats.total,
    }))
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 6);
});

onMounted(async () => {
  try {
    const token = userStore.token;
    const userId = userStore.user?.id;
    if (!token || !userId) {
      router.push("/login?redirect=/analytics");
      return;
    }
    applications.value = await getApplications(token, userId);
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load analytics.";
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
      <SectionHeader title="Analytics" subtitle="Measure your job search performance and focus where momentum is strongest." />
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Response rate" :value="`${responseRate}%`" hint="Interviewed from all applications" />
        <MetricCard label="Interview conversion" :value="`${responseRate}%`" hint="Applied -> Interview" />
        <MetricCard label="Offer conversion" :value="`${offerConversion}%`" hint="Interview -> Offer" />
        <MetricCard label="Total tracked" :value="total" />
      </div>

      <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 class="text-lg font-semibold dark:text-slate-100">Source effectiveness snapshot</h3>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Based on interview and offer outcomes across your tracked companies.</p>
        <div v-if="sourceEffectiveness.length" class="mt-4 space-y-2">
          <div v-for="item in sourceEffectiveness" :key="item.company" class="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
            <div class="flex items-center justify-between text-sm">
              <span class="font-medium dark:text-slate-100">{{ item.company }}</span>
              <span class="text-slate-600 dark:text-slate-400">{{ item.rate }}% success ({{ item.total }} apps)</span>
            </div>
          </div>
        </div>
        <p v-else class="mt-4 text-sm text-slate-500 dark:text-slate-400">Add more applications to unlock useful trend signals.</p>
      </section>

      <p v-if="errorMessage" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    </SidebarShell>
    <Footer />
  </div>
</template>
