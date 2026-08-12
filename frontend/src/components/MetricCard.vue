<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: "" },
});
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/30">
    <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ label }}</p>
    <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
  </article>
</template>
