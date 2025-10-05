<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const userStore = useUserStore();

const isEditing = ref(false);
const isDeleting = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Profile data
const name = ref("");
const email = ref("");
const recruiterCompany = ref("");
const location = ref("");
const strivingFor = ref("");

// Password change
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

    const res = await axios.get("http://localhost:8000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const user = res.data;
    name.value = user.name || "";
    email.value = user.email || "";
    recruiterCompany.value = user.recruiterCompany || "";
    location.value = user.location || "";
    strivingFor.value = user.strivingFor || "";
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to load profile data.";
  }
};

const startEdit = () => {
  isEditing.value = true;
  errorMessage.value = "";
  successMessage.value = "";
};

const cancelEdit = () => {
  isEditing.value = false;
  fetchUserData(); // Reset to original values
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

    // Add recruiter company if user is a recruiter
    if (userStore.user?.role === "recruiter") {
      updateData.recruiterCompany = recruiterCompany.value;
    }

    await axios.put("http://localhost:8000/api/auth/profile", updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Update user store with new data
    userStore.setUser({
      ...userStore.user,
      name: name.value,
      email: email.value
    });

    successMessage.value = "Profile updated successfully!";
    isEditing.value = false;
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to update profile.";
  } finally {
    isSubmitting.value = false;
  }
};

const changePassword = async () => {
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
    
    await axios.put("http://localhost:8000/api/auth/password", {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    successMessage.value = "Password changed successfully!";
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to change password.";
  } finally {
    isSubmitting.value = false;
  }
};

const deleteAccount = async () => {
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
    
    await axios.delete("http://localhost:8000/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Logout and redirect
    userStore.logout();
    router.push("/");
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to delete account.";
    isDeleting.value = false;
  }
};

onMounted(fetchUserData);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-100 text-gray-800 font-sans">
    <Header />

    <!-- Main content -->
    <main class="flex-1 px-6 py-8 max-w-4xl w-full mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-3xl font-extrabold">Account Settings</h2>
        <div v-if="!isEditing" class="flex gap-3">
          <button @click="startEdit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit Profile
          </button>
        </div>
        <div v-else class="flex gap-3">
          <button @click="cancelEdit" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
            Cancel
          </button>
          <button @click="saveProfile" :disabled="isSubmitting" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60">
            {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="errorMessage" class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
        {{ successMessage }}
      </div>

      <!-- Profile Information -->
      <section class="bg-white rounded-xl shadow p-6 mb-8">
        <h3 class="text-xl font-semibold mb-6">Profile Information</h3>
        
        <div v-if="!isEditing" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <p class="text-gray-900">{{ name || 'Not set' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p class="text-gray-900">{{ email || 'Not set' }}</p>
          </div>
          <div v-if="userStore.user?.role === 'recruiter'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <p class="text-gray-900">{{ recruiterCompany || 'Not set' }}</p>
          </div>
          <div v-if="userStore.user?.role === 'candidate'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <p class="text-gray-900">{{ location || 'Not set' }}</p>
          </div>
          <div v-if="userStore.user?.role === 'candidate'" class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Striving For</label>
            <p class="text-gray-900">{{ strivingFor || 'Not set' }}</p>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div v-if="userStore.user?.role === 'recruiter'" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input v-model="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input v-model="recruiterCompany" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>

          <div v-if="userStore.user?.role === 'candidate'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input v-model="name" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input v-model="location" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input v-model="email" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Striving For</label>
                <input v-model="strivingFor" placeholder="e.g., Senior Developer role, Remote work, Startup environment..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Password Change -->
      <section class="bg-white rounded-xl shadow p-6 mb-8">
        <h3 class="text-xl font-semibold mb-6">Change Password</h3>
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input v-model="currentPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input v-model="newPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input v-model="confirmPassword" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" :disabled="isSubmitting" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
            {{ isSubmitting ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
      </section>

      <!-- Danger Zone -->
      <section class="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 class="text-xl font-semibold text-red-800 mb-4">Danger Zone</h3>
        <p class="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button @click="deleteAccount" :disabled="isDeleting" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-60">
          {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
        </button>
      </section>
    </main>

    <Footer />
  </div>
</template>
