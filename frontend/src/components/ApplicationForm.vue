<script setup>
const props = defineProps({
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { type: String, required: true },
  date: { type: String, required: true },
  notes: { type: String, required: false, default: "" },
  isSubmitting: { type: Boolean, required: false, default: false },
});

const emit = defineEmits(["submit"]);
</script>

<template>
  <div class="hidden">
    <!-- This component is intentionally UI-agnostic since the parent already renders a form.
         It exists to preserve the API and can be enhanced to render the form directly
         if you decide to shift the markup from the parent into here. -->
    <button type="button" @click="$emit('submit')" :disabled="props.isSubmitting"></button>
  </div>
</template>


