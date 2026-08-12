<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { getApplications, updateApplication } from "../../services/api.js";
import Footer from "../components/Footer.vue";
import SidebarShell from "../components/SidebarShell.vue";
import SectionHeader from "../components/SectionHeader.vue";
import Calendar from "../components/Calendar.vue";

const router = useRouter();
const userStore = useUserStore();

const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Applications", to: "/applications" },
  { label: "Calendar", to: "/calendar" },
  { label: "Analytics", to: "/analytics" },
  { label: "Career Compass", to: "/career-compass" },
  { label: "Wellbeing", to: "/wellness/monitoring" },
  { label: "Settings", to: "/settings" },
];
const secondaryItems = [{ label: "Community", to: "/community/forum" }];

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
    
    await fetchApplications();
  } catch (error) {
    console.error("Failed to update interview:", error);
    errorMessage.value = "Failed to update interview details.";
  }
};

onMounted(fetchApplications);
</script>

<template>
  <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader title="Calendar" subtitle="Track your interviews, deadlines, and follow-ups" />

      <div v-if="errorMessage" class="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-700 dark:text-red-400">{{ errorMessage }}</div>
      <div v-else-if="isLoading" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
      <div v-else class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
        <Calendar 
          :applications="applications" 
          @update-interview="updateInterview"
        />
      </div>
    </div>
  </SidebarShell>
</template>
