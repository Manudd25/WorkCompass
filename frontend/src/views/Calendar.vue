<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { getApplications, updateApplication } from "../../services/api.js";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import Calendar from "../components/Calendar.vue";

const router = useRouter();
const userStore = useUserStore();

const applications = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

const fetchApplications = async () => {
  errorMessage.value = "";
  try {
    isLoading.value = true;
    const token = userStore.token;
    const userId = userStore.user?.id;
    if (!token || !userId) {
      router.push("/login");
      return;
    }
    const isRecruiter = userStore.user?.role === "recruiter";
    const candidateId = isRecruiter ? null : userId;
    const res = await getApplications(token, candidateId);
    applications.value = res || [];
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load applications.";
  } finally {
    isLoading.value = false;
  }
};

const updateInterview = async (interviewData) => {
  try {
    const token = userStore.token;
    await updateApplication(interviewData.id, {
      interviewTime: interviewData.interviewTime,
      interviewDate: interviewData.interviewDate,
      interviewLocation: interviewData.interviewLocation,
      interviewType: interviewData.interviewType,
      interviewNotes: interviewData.interviewNotes
    }, token);
    
    // Refresh applications to show updated data
    await fetchApplications();
  } catch (error) {
    console.error("Failed to update interview:", error);
    errorMessage.value = "Failed to update interview details.";
  }
};

onMounted(fetchApplications);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <Header />

    <!-- Main content -->
    <main class="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl w-full mx-auto">
      <div v-if="errorMessage" class="mb-4 text-red-600">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="text-gray-600">Loading calendar...</div>
      <div v-else>
        <Calendar 
          :applications="applications" 
          @update-interview="updateInterview"
        />
      </div>
    </main>

    <Footer />
  </div>
</template>
