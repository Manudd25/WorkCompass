<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import SidebarShell from "../components/SidebarShell.vue";
import SectionHeader from "../components/SectionHeader.vue";
import { getProfile, updateProfile, changePassword, deleteAccount } from "../../services/api.js";

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

const isEditing = ref(false);
const isDeleting = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const name = ref("");
const email = ref("");
const recruiterCompany = ref("");
const location = ref("");
const strivingFor = ref("");

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const fetchUserData = async () => {
  try {
    const token = userStore.token;
    if (!token) {
      router.push("/login");
      return;
    }

    const user = await getProfile(token);
    
    name.value = user.name || "";
    email.value = user.email || "";
    recruiterCompany.value = user.recruiterCompany || "";
    location.value = user.location || "";
    strivingFor.value = user.strivingFor || "";
  } catch (error) {
    errorMessage.value = error?.message || "Failed to load profile data.";
  }
};

const startEdit = () => {
  isEditing.value = true;
  errorMessage.value = "";
  successMessage.value = "";
};

const cancelEdit = () => {
  isEditing.value = false;
  fetchUserData();
  errorMessage.value = "";
  successMessage.value = "";
};

const saveProfile = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  
  try {
    isSubmitting.value = true;
    const token = userStore.token;
    
    const updateData = {
      name: name.value,
      email: email.value,
      location: location.value,
      strivingFor: strivingFor.value
    };

    if (userStore.user?.role === "recruiter") {
      updateData.recruiterCompany = recruiterCompany.value;
    }

    await updateProfile(updateData, token);

    userStore.setUser({
      ...userStore.user,
      name: name.value,
      email: email.value
    });

    successMessage.value = "Profile updated successfully!";
    isEditing.value = false;
  } catch (error) {
    errorMessage.value = error?.message || "Failed to update profile.";
  } finally {
    isSubmitting.value = false;
  }
};

const changePasswordHandler = async () => {
  errorMessage.value = "";
  successMessage.value = "";
  
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = "New passwords do not match.";
    return;
  }
  
  if (newPassword.value.length < 6) {
    errorMessage.value = "New password must be at least 6 characters long.";
    return;
  }
  
  try {
    isSubmitting.value = true;
    const token = userStore.token;
    
    await changePassword({
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    }, token);

    successMessage.value = "Password changed successfully!";
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error) {
    errorMessage.value = error?.message || "Failed to change password.";
  } finally {
    isSubmitting.value = false;
  }
};

const deleteAccountHandler = async () => {
  if (!confirm("Are you sure you want to delete your account? This action cannot be undone and will delete all your data.")) {
    return;
  }
  
  if (!confirm("This will permanently delete your account and all associated data. Are you absolutely sure?")) {
    return;
  }
  
  errorMessage.value = "";
  
  try {
    isDeleting.value = true;
    const token = userStore.token;
    
    await deleteAccount(token);

    userStore.logout();
    router.push("/");
  } catch (error) {
    errorMessage.value = error?.message || "Failed to delete account.";
    isDeleting.value = false;
  }
};

onMounted(fetchUserData);
</script>

<template>
  <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader title="Settings" subtitle="Manage your account, profile, and preferences">
        <template #actions>
          <div v-if="!isEditing">
            <button
              @click="startEdit"
              class="inline-flex h-10 items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-0 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Profile
            </button>
          </div>
          <div v-else class="flex gap-3">
            <button
              @click="cancelEdit"
              class="inline-flex h-10 items-center justify-center px-4 py-0 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition text-sm font-medium dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              @click="saveProfile"
              :disabled="isSubmitting"
              class="inline-flex h-10 items-center justify-center bg-indigo-600 text-white px-4 py-0 rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-60"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </template>
      </SectionHeader>

      <!-- Messages -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-700 dark:text-red-400">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400">
        {{ successMessage }}
      </div>

      <!-- Profile Information -->
      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
        <h3 class="text-lg font-semibold text-slate-900 mb-6 dark:text-slate-100">Profile Information</h3>
        
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-500 mb-1 dark:text-slate-400">Name</label>
            <p class="text-slate-900 font-medium dark:text-slate-100">{{ name || 'Not set' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-500 mb-1 dark:text-slate-400">Email</label>
            <p class="text-slate-900 font-medium dark:text-slate-100">{{ email || 'Not set' }}</p>
          </div>
          <div v-if="userStore.user?.role === 'recruiter'">
            <label class="block text-sm font-medium text-slate-500 mb-1 dark:text-slate-400">Company</label>
            <p class="text-slate-900 font-medium dark:text-slate-100">{{ recruiterCompany || 'Not set' }}</p>
          </div>
          <div v-if="userStore.user?.role === 'candidate'">
            <label class="block text-sm font-medium text-slate-500 mb-1 dark:text-slate-400">Location</label>
            <p class="text-slate-900 font-medium dark:text-slate-100">{{ location || 'Not set' }}</p>
          </div>
          <div v-if="userStore.user?.role === 'candidate'" class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-500 mb-1 dark:text-slate-400">Striving For</label>
            <p class="text-slate-900 font-medium dark:text-slate-100">{{ strivingFor || 'Not set' }}</p>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div v-if="userStore.user?.role === 'recruiter'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Name</label>
                <input v-model="name" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Email</label>
                <input v-model="email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Company</label>
              <input v-model="recruiterCompany" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
            </div>
          </div>

          <div v-if="userStore.user?.role === 'candidate'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Name</label>
                <input v-model="name" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Location</label>
                <input v-model="location" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Email</label>
                <input v-model="email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Striving For</label>
                <input v-model="strivingFor" placeholder="e.g., Senior Developer role, Remote work, Startup environment..." class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Password Change -->
      <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6 dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
        <h3 class="text-lg font-semibold text-slate-900 mb-6 dark:text-slate-100">Change Password</h3>
        <form @submit.prevent="changePasswordHandler" class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Current Password</label>
            <input v-model="currentPassword" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">New Password</label>
            <input v-model="newPassword" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">Confirm New Password</label>
            <input v-model="confirmPassword" type="password" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" required />
          </div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex h-10 items-center justify-center bg-indigo-600 text-white px-4 py-0 rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-60"
          >
            {{ isSubmitting ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
      </section>

      <!-- Danger Zone -->
      <section class="bg-red-50 border border-red-200 rounded-xl p-6 dark:bg-red-900/20 dark:border-red-700">
        <h3 class="text-lg font-semibold text-red-800 mb-3 dark:text-red-300">Danger Zone</h3>
        <p class="text-red-600 text-sm mb-4 dark:text-red-400">Once you delete your account, there is no going back. Please be certain.</p>
        <button
          @click="deleteAccountHandler"
          :disabled="isDeleting"
          class="inline-flex h-10 items-center justify-center bg-red-600 text-white px-4 py-0 rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-60"
        >
          {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
        </button>
      </section>
    </div>
  </SidebarShell>
</template>
