<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
});
</script>

<template>
  <header class="mb-6">
    <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{{ title }}</h2>
    <p v-if="subtitle" class="mt-1 max-w-3xl text-sm text-slate-600 dark:text-slate-400">{{ subtitle }}</p>
    <slot name="actions" />
  </header>
</template>
