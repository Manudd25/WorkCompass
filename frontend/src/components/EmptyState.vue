<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, required: true },
  ctaText: { type: String, default: "" },
  ctaTo: { type: String, default: "" },
});

defineEmits(["cta"]);
</script>

<template>
  <div class="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-600 dark:bg-slate-800">
    <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ title }}</h3>
    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">{{ message }}</p>
    <RouterLink
      v-if="ctaText && ctaTo"
      :to="ctaTo"
      class="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
    >
      {{ ctaText }}
    </RouterLink>
    <button
      v-else-if="ctaText"
      type="button"
      class="mt-5 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
      @click="$emit('cta')"
    >
      {{ ctaText }}
    </button>
  </div>
</template>
