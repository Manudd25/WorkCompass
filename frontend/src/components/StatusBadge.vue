<script setup>
import { computed } from "vue";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const badgeClass = computed(() => {
  if (props.status === "Offer") return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
  if (props.status === "Interview") return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";
  if (props.status === "Rejected") return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700";
  if (props.status === "Applied") return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700";
  return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600";
});
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide"
    :class="badgeClass"
  >
    {{ status }}
  </span>
</template>
