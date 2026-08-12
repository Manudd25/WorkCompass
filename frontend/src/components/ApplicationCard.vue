<script setup>
import StatusBadge from "./StatusBadge.vue";

defineProps({
  application: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/30">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {{ application?.role }}
          <span class="text-slate-500 dark:text-slate-400">@ {{ application?.company }}</span>
        </h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ application?.date ? new Date(application.date).toLocaleDateString() : "" }}
        </p>
      </div>
      <StatusBadge :status="application?.status" />
    </div>

    <div
      v-if="application?.notes"
      class="mt-4 whitespace-pre-line break-words text-slate-700 dark:text-slate-300"
    >
      {{ application.notes }}
    </div>
  </div>
</template>
