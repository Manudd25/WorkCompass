<script setup>
defineProps({
  isSubmitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: "Save application" },
});

const company = defineModel("company", { type: String, default: "" });
const role = defineModel("role", { type: String, default: "" });
const status = defineModel("status", { type: String, default: "Applied" });
const date = defineModel("date", { type: String, default: "" });
const notes = defineModel("notes", { type: String, default: "" });

const emit = defineEmits(["submit", "cancel"]);

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400";
</script>

<template>
  <form class="space-y-4" @submit.prevent="emit('submit')">
    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" for="app-company">Company</label>
      <input id="app-company" v-model="company" :class="fieldClass" required autocomplete="organization" />
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" for="app-role">Role</label>
      <input id="app-role" v-model="role" :class="fieldClass" required autocomplete="organization-title" />
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" for="app-status">Status</label>
        <select id="app-status" v-model="status" :class="fieldClass">
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" for="app-date">Date</label>
        <input id="app-date" v-model="date" type="date" :class="fieldClass" required />
      </div>
    </div>

    <div>
      <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" for="app-notes">Notes, links, etc.</label>
      <textarea id="app-notes" v-model="notes" rows="3" :class="fieldClass" />
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button
        type="button"
        class="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
      >
        {{ isSubmitting ? "Saving…" : submitLabel }}
      </button>
    </div>
  </form>
</template>
