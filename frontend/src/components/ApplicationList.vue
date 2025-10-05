<script setup>
import ApplicationCard from "./ApplicationCard.vue";

const props = defineProps({
  applications: {
    type: Array,
    required: true,
    default: () => [],
  },
});
</script>

<template>
  <div class="space-y-4">
    <ApplicationCard v-for="a in props.applications" :key="a._id" :application="a" />
  </div>
</template>


