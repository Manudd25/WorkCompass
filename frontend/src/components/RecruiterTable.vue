<script setup>
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  applications: {
    type: Array,
    required: true,
    default: () => [],
  },
  showActions: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update-status", "delete-application"]);

const search = ref("");
const statusFilter = ref("");
const sortKey = ref("date");
const sortDir = ref("desc");

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase();
  const status = statusFilter.value;
  return props.applications.filter((a) => {
    const matchesTerm = !term ||
      String(a.company || "").toLowerCase().includes(term) ||
      String(a.role || "").toLowerCase().includes(term) ||
      String(a?.candidateId?.name || "").toLowerCase().includes(term) ||
      String(a?.candidateId?.email || "").toLowerCase().includes(term);
    const matchesStatus = !status || a.status === status;
    return matchesTerm && matchesStatus;
  });
});

const sorted = computed(() => {
  const list = [...filtered.value];
  list.sort((a, b) => {
    const dir = sortDir.value === "asc" ? 1 : -1;
    const k = sortKey.value;
    let av = a[k];
    let bv = b[k];
    if (k === "date") {
      av = new Date(a.date).getTime();
      bv = new Date(b.date).getTime();
    } else if (k === "candidate") {
      av = (a?.candidateId?.name || a?.candidateId?.email || "").toLowerCase();
      bv = (b?.candidateId?.name || b?.candidateId?.email || "").toLowerCase();
    } else {
      av = String(av || "").toLowerCase();
      bv = String(bv || "").toLowerCase();
    }
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
  return list;
});

const setSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
};

const onUpdateStatus = (app, newStatus) => {
  emit("update-status", { id: app._id, status: newStatus });
};

const onDelete = (app) => {
  emit("delete-application", { id: app._id });
};
</script>

<template>
  <div class="bg-white rounded-xl shadow border border-gray-100">
    <div class="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex gap-3 w-full sm:w-auto">
        <input
          v-model="search"
          type="text"
          placeholder="Search company, role, candidate..."
          class="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          v-model="statusFilter"
          class="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option>Applied</option>
          <option>Interview</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full text-left">
        <thead>
          <tr class="bg-gray-50 text-gray-600 text-sm">
            <th class="px-4 py-3 cursor-pointer" @click="setSort('candidate')">Candidate</th>
            <th class="px-4 py-3 cursor-pointer" @click="setSort('company')">Company</th>
            <th class="px-4 py-3 cursor-pointer" @click="setSort('role')">Role</th>
            <th class="px-4 py-3 cursor-pointer" @click="setSort('status')">Status</th>
            <th class="px-4 py-3 cursor-pointer" @click="setSort('date')">Date</th>
            <th v-if="showActions" class="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr v-for="app in sorted" :key="app._id" class="hover:bg-gray-50">
            <td class="px-4 py-3 whitespace-nowrap">
              <div class="font-medium">
                <RouterLink 
                  v-if="app?.candidateId?._id" 
                  :to="`/candidates/${app.candidateId._id}`" 
                  class="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {{ app?.candidateId?.name || '—' }}
                </RouterLink>
                <span v-else>{{ app?.candidateId?.name || '—' }}</span>
              </div>
              <div class="text-gray-500">{{ app?.candidateId?.email || '—' }}</div>
            </td>
            <td class="px-4 py-3">{{ app.company }}</td>
            <td class="px-4 py-3">{{ app.role }}</td>
            <td class="px-4 py-3">
              <span
                class="px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="{
                  'bg-blue-100 text-blue-700': app.status === 'Applied',
                  'bg-yellow-100 text-yellow-700': app.status === 'Interview',
                  'bg-green-100 text-green-700': app.status === 'Offer',
                  'bg-red-100 text-red-700': app.status === 'Rejected',
                }"
              >
                {{ app.status }}
              </span>
            </td>
            <td class="px-4 py-3">{{ new Date(app.date).toLocaleDateString() }}</td>
            <td v-if="showActions" class="px-4 py-3">
              <div class="flex items-center gap-2">
                <select
                  :value="app.status"
                  @change="onUpdateStatus(app, $event.target.value)"
                  class="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs"
                >
                  <option>Applied</option>
                  <option>Interview</option>
                  <option>Offer</option>
                  <option>Rejected</option>
                </select>
                <button
                  @click="onDelete(app)"
                  class="px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="sorted.length === 0">
            <td colspan="6" class="px-4 py-6 text-center text-gray-500">No applications found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


