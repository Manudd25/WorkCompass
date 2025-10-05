<script setup>
const props = defineProps({
  total: { type: Number, required: true },
  applied: { type: Number, required: true },
  interview: { type: Number, required: true },
  offer: { type: Number, required: true },
  rejected: { type: Number, required: false, default: 0 },
});
</script>

<template>
  <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    <div class="bg-white rounded-xl shadow p-5">
      <p class="text-sm text-gray-500">Total</p>
      <p class="text-3xl font-bold">{{ props.total }}</p>
    </div>
    <div class="bg-white rounded-xl shadow p-5">
      <p class="text-sm text-gray-500">Applied</p>
      <p class="text-3xl font-bold">{{ props.applied }}</p>
    </div>
    <div class="bg-white rounded-xl shadow p-5">
      <p class="text-sm text-gray-500">Interview</p>
      <p class="text-3xl font-bold">{{ props.interview }}</p>
    </div>
    <div class="bg-white rounded-xl shadow p-5">
      <p class="text-sm text-gray-500">Offer</p>
      <p class="text-3xl font-bold">{{ props.offer }}</p>
    </div>
    <div class="bg-white rounded-xl shadow p-5">
      <p class="text-sm text-gray-500">Rejected</p>
      <p class="text-3xl font-bold">{{ props.rejected }}</p>
    </div>
  </section>
</template>


