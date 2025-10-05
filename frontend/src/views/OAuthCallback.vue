<script setup>
import axios from "axios";
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  const provider = route.params.provider; // 'github' or 'linkedin'
  const code = route.query.code;
  const redirectUri = window.location.origin + `/oauth/callback/${provider}`;
  if (!provider || !code) return router.push("/login");
  try {
    const res = await axios.post(`http://localhost:8000/api/auth/${provider}`, { code, redirectUri });
    userStore.setUser(res.data.user, res.data.token);
    router.replace("/dashboard");
  } catch (e) {
    router.replace("/login");
  }
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800">
    <div class="bg-white rounded-xl shadow p-6">Completing sign-in…</div>
  </div>
</template>


