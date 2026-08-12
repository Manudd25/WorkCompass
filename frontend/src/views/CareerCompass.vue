<script setup>
import { computed, reactive } from "vue";
import SidebarShell from "../components/SidebarShell.vue";
import SectionHeader from "../components/SectionHeader.vue";
import Footer from "../components/Footer.vue";

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

const weights = reactive({ salary: 30, commute: 15, growth: 25, flexibility: 15, culture: 15 });
const optionA = reactive({ name: "Offer A", salary: 8, commute: 6, growth: 8, flexibility: 7, culture: 7 });
const optionB = reactive({ name: "Offer B", salary: 7, commute: 8, growth: 7, flexibility: 9, culture: 8 });

const score = (offer) => (
  (offer.salary * weights.salary) +
  (offer.commute * weights.commute) +
  (offer.growth * weights.growth) +
  (offer.flexibility * weights.flexibility) +
  (offer.culture * weights.culture)
) / 10;

const scoreA = computed(() => Math.round(score(optionA)));
const scoreB = computed(() => Math.round(score(optionB)));
const winner = computed(() => (scoreA.value === scoreB.value ? "Tie" : scoreA.value > scoreB.value ? optionA.name : optionB.name));
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
      <SectionHeader title="Career Compass" subtitle="Compare options with deterministic weighted scoring to support better decisions." />

      <section class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 class="text-lg font-semibold dark:text-slate-100">Weight priorities</h3>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <label v-for="(value, key) in weights" :key="key" class="text-sm dark:text-slate-300">
            <span class="mb-1 block font-medium capitalize">{{ key }} ({{ value }}%)</span>
            <input v-model.number="weights[key]" type="range" min="0" max="50" class="w-full" />
          </label>
        </div>
      </section>

      <section class="mt-6 grid gap-6 lg:grid-cols-2">
        <article class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <input v-model="optionA.name" class="w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label v-for="metric in Object.keys(weights)" :key="`a-${metric}`" class="dark:text-slate-300">
              <span class="mb-1 block capitalize">{{ metric }} (1-10)</span>
              <input v-model.number="optionA[metric]" type="number" min="1" max="10" class="w-full rounded-lg border border-slate-300 px-2 py-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
            </label>
          </div>
          <p class="mt-4 text-lg font-bold text-indigo-700 dark:text-indigo-400">Compass Score: {{ scoreA }}</p>
        </article>

        <article class="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <input v-model="optionB.name" class="w-full rounded-lg border border-slate-300 px-3 py-2 font-semibold dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <label v-for="metric in Object.keys(weights)" :key="`b-${metric}`" class="dark:text-slate-300">
              <span class="mb-1 block capitalize">{{ metric }} (1-10)</span>
              <input v-model.number="optionB[metric]" type="number" min="1" max="10" class="w-full rounded-lg border border-slate-300 px-2 py-1 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
            </label>
          </div>
          <p class="mt-4 text-lg font-bold text-indigo-700 dark:text-indigo-400">Compass Score: {{ scoreB }}</p>
        </article>
      </section>

      <div class="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-900/20">
        <p class="text-sm font-medium text-indigo-900 dark:text-indigo-300">Recommended direction: {{ winner }}</p>
      </div>
    </SidebarShell>
    <Footer />
  </div>
</template>
