<script setup>
import { RouterView, useRouter } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();

onMounted(() => {
  // Check if we have reset parameters in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const reset = urlParams.get('reset');
  const token = urlParams.get('token');
  
  if (reset === 'true' && token) {
    // Redirect to reset password page with hash routing
    router.push(`/reset-password?token=${token}`);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <RouterView />
  </div>
</template>
