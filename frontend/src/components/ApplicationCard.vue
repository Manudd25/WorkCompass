<script setup>
const props = defineProps({
  application: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});
</script>

<template>
  <div class="bg-white rounded-xl shadow p-6 border border-gray-100">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-xl font-semibold">
          {{ props.application?.role }}
          <span class="text-gray-500">@ {{ props.application?.company }}</span>
        </h3>
        <p class="text-sm text-gray-500 mt-1">{{ new Date(props.application?.date).toLocaleDateString() }}</p>
      </div>
      <span
        class="px-2.5 py-1 rounded-full text-xs font-semibold"
        :class="{
          'bg-blue-100 text-blue-700': props.application?.status === 'Applied',
          'bg-yellow-100 text-yellow-700': props.application?.status === 'Interview',
          'bg-green-100 text-green-700': props.application?.status === 'Offer',
          'bg-red-100 text-red-700': props.application?.status === 'Rejected',
        }"
      >
        {{ props.application?.status }}
      </span>
    </div>

    <div class="mt-4 text-gray-700 whitespace-pre-line break-words break-all" v-if="props.application?.notes">
      {{ props.application.notes }}
    </div>
  </div>
</template>


