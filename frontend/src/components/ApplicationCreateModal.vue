<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import Modal from "./Modal.vue";
import ApplicationForm from "./ApplicationForm.vue";
import { createApplication } from "../../services/api.js";

const props = defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "created"]);

const router = useRouter();
const userStore = useUserStore();

const company = ref("");
const role = ref("");
const status = ref("Applied");
const date = ref(new Date().toISOString().slice(0, 10));
const notes = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

const resetForm = () => {
  company.value = "";
  role.value = "";
  status.value = "Applied";
  date.value = new Date().toISOString().slice(0, 10);
  notes.value = "";
  errorMessage.value = "";
  isSubmitting.value = false;
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm();
  }
);

const close = () => emit("close");

const submitForm = async () => {
  errorMessage.value = "";
  try {
    isSubmitting.value = true;
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }
    const created = await createApplication(
      {
        company: company.value,
        role: role.value,
        status: status.value,
        date: date.value,
        notes: notes.value,
      },
      token
    );
    window.dispatchEvent(new CustomEvent("applications-updated"));
    emit("created", created);
    close();
  } catch (error) {
    errorMessage.value = error?.message || "Failed to create application.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Modal :open="open" title="Add application" size="md" @close="close">
    <p v-if="errorMessage" class="mb-4 text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
    <ApplicationForm
      v-model:company="company"
      v-model:role="role"
      v-model:status="status"
      v-model:date="date"
      v-model:notes="notes"
      :is-submitting="isSubmitting"
      submit-label="Save application"
      @submit="submitForm"
      @cancel="close"
    />
  </Modal>
</template>
