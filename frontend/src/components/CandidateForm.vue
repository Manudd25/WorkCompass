<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  candidate: {
    type: Object,
    default: null
  },
  isSubmitting: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(['submit', 'cancel']);

const name = ref("");
const email = ref("");
const wishedSalary = ref("");
const earlyStartDate = ref("");
const candidateNotes = ref("");
const jobTitle = ref("");
const experience = ref("");
const skills = ref("");
const location = ref("");

// Initialize form with candidate data if editing
watch(() => props.candidate, (newCandidate) => {
  if (newCandidate) {
    name.value = newCandidate.name || "";
    email.value = newCandidate.email || "";
    wishedSalary.value = newCandidate.wishedSalary || "";
    earlyStartDate.value = newCandidate.earlyStartDate ? new Date(newCandidate.earlyStartDate).toISOString().slice(0, 10) : "";
    candidateNotes.value = newCandidate.candidateNotes || "";
    jobTitle.value = newCandidate.jobTitle || "";
    experience.value = newCandidate.experience || "";
    skills.value = newCandidate.skills || "";
    location.value = newCandidate.location || "";
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('submit', {
    name: name.value,
    email: email.value,
    wishedSalary: wishedSalary.value,
    earlyStartDate: earlyStartDate.value,
    candidateNotes: candidateNotes.value,
    jobTitle: jobTitle.value,
    experience: experience.value,
    skills: skills.value,
    location: location.value
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <div>
    <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input v-model="name" placeholder="Full name" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
        <input v-model="email" type="email" placeholder="Email" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
      </div>
      <div>
        <input v-model="jobTitle" placeholder="Job title" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input v-model="experience" placeholder="Years of experience" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        <input v-model="location" placeholder="Location" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input v-model="wishedSalary" placeholder="Wished salary" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        <input v-model="earlyStartDate" type="date" placeholder="Early start date" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
      </div>
      <div class="grid grid-cols-1 gap-4">
        <input v-model="skills" placeholder="Skills (comma-separated)" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        <textarea v-model="candidateNotes" placeholder="Notes about the candidate" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
      </div>
      <div class="flex justify-end gap-3 pt-4">
        <button type="button" @click="handleCancel" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
        <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60">
          {{ isSubmitting ? "Saving..." : "Save" }}
        </button>
      </div>
    </form>
  </div>
</template>
