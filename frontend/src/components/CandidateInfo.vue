<script setup>
import { ref } from "vue";
import CandidateForm from "./CandidateForm.vue";

const props = defineProps({
  candidate: {
    type: Object,
    required: true
  },
  isUpdating: {
    type: Boolean,
    default: false
  },
  isDeleting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(['update', 'delete']);

const isEditing = ref(false);

const startEdit = () => {
  isEditing.value = true;
};

const cancelEdit = () => {
  isEditing.value = false;
};

const handleUpdate = (formData) => {
  emit('update', formData);
  isEditing.value = false;
};

const handleDelete = () => {
  if (confirm("Are you sure you want to delete this candidate? This will also delete all their applications.")) {
    emit('delete');
  }
};
</script>

<template>
  <section class="bg-white rounded-xl shadow p-6 mb-8">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-xl font-semibold">Candidate Information</h3>
      <div v-if="!isEditing" class="flex gap-2">
        <button @click="startEdit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Edit</button>
        <button @click="handleDelete" :disabled="isDeleting" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-60">
          {{ isDeleting ? "Deleting..." : "Delete" }}
        </button>
      </div>
      <div v-else class="flex gap-2">
        <button @click="cancelEdit" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
      </div>
    </div>

    <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
      <div>
        <span class="font-medium text-gray-700">Name:</span>
        <p class="text-gray-600">{{ candidate?.name || '—' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Email:</span>
        <p class="text-gray-600">{{ candidate?.email || '—' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Job Title:</span>
        <p class="text-gray-600">{{ candidate?.jobTitle || 'Not specified' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Company:</span>
        <p class="text-gray-600">{{ candidate?.company || 'Not specified' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Experience:</span>
        <p class="text-gray-600">{{ candidate?.experience || 'Not specified' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Location:</span>
        <p class="text-gray-600">{{ candidate?.location || 'Not specified' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Wished Salary:</span>
        <p class="text-gray-600">{{ candidate?.wishedSalary || 'Not specified' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Early Start Date:</span>
        <p class="text-gray-600">{{ candidate?.earlyStartDate ? new Date(candidate.earlyStartDate).toLocaleDateString() : 'Not specified' }}</p>
      </div>
      <div>
        <span class="font-medium text-gray-700">Skills:</span>
        <p class="text-gray-600">{{ candidate?.skills || 'Not specified' }}</p>
      </div>
      <div class="sm:col-span-2 lg:col-span-3">
        <span class="font-medium text-gray-700">Notes:</span>
        <p class="text-gray-600">{{ candidate?.candidateNotes || 'No notes' }}</p>
      </div>
    </div>

    <div v-else>
      <CandidateForm 
        :candidate="candidate"
        :is-submitting="isUpdating"
        :error-message="errorMessage"
        @submit="handleUpdate"
        @cancel="cancelEdit"
      />
    </div>
  </section>
</template>
