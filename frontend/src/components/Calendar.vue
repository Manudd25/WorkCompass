<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "../store/userStore.js";
import { getApplications } from "../../services/api.js";

const props = defineProps({
  applications: {
    type: Array,
    default: () => []
  }
});

const userStore = useUserStore();

// Calendar state
const currentDate = ref(new Date());
const viewMode = ref('month'); // 'month', 'week', 'day'
const selectedDate = ref(null);
const showInterviewModal = ref(false);
const selectedApplication = ref(null);

// Interview scheduling
const interviewTime = ref('');
const interviewDate = ref('');
const interviewNotes = ref('');
const interviewLocation = ref('');
const interviewType = ref('video'); // 'video', 'phone', 'in-person'

// Computed properties
const currentMonth = computed(() => currentDate.value.getMonth());
const currentYear = computed(() => currentDate.value.getFullYear());
const currentDay = computed(() => currentDate.value.getDate());

// Get applications with interview status
const interviewApplications = computed(() => {
  return props.applications.filter(app => app.status === 'Interview');
});

// Calendar days for current month
const calendarDays = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    const dayApplications = interviewApplications.value.filter(app => {
      const appDate = new Date(app.date);
      return appDate.toDateString() === current.toDateString();
    });
    
    days.push({
      date: new Date(current),
      isCurrentMonth: current.getMonth() === month,
      isToday: current.toDateString() === new Date().toDateString(),
      applications: dayApplications
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
});

// Week view days
const weekDays = computed(() => {
  const startOfWeek = new Date(currentDate.value);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(day.getDate() + i);
    
    const dayApplications = interviewApplications.value.filter(app => {
      const appDate = new Date(app.date);
      return appDate.toDateString() === day.toDateString();
    });
    
    days.push({
      date: new Date(day),
      applications: dayApplications
    });
  }
  
  return days;
});

// Day view applications
const dayApplications = computed(() => {
  if (!selectedDate.value) return [];
  
  return interviewApplications.value.filter(app => {
    const appDate = new Date(app.date);
    return appDate.toDateString() === selectedDate.value.toDateString();
  });
});

// Methods
const navigateMonth = (direction) => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + direction);
  currentDate.value = newDate;
};

const navigateWeek = (direction) => {
  const newDate = new Date(currentDate.value);
  newDate.setDate(newDate.getDate() + (direction * 7));
  currentDate.value = newDate;
};

const navigateDay = (direction) => {
  const newDate = new Date(currentDate.value);
  newDate.setDate(newDate.getDate() + direction);
  currentDate.value = newDate;
};

const goToToday = () => {
  currentDate.value = new Date();
};

const selectDate = (date) => {
  selectedDate.value = date;
  if (viewMode.value === 'day') {
    // Day view logic
  }
};

const openInterviewModal = (application) => {
  selectedApplication.value = application;
  interviewDate.value = application.date ? new Date(application.date).toISOString().slice(0, 10) : '';
  interviewTime.value = application.interviewTime || '';
  interviewLocation.value = application.interviewLocation || '';
  interviewType.value = application.interviewType || 'video';
  interviewNotes.value = application.interviewNotes || '';
  showInterviewModal.value = true;
};

const closeInterviewModal = () => {
  showInterviewModal.value = false;
  selectedApplication.value = null;
  interviewTime.value = '';
  interviewDate.value = '';
  interviewLocation.value = '';
  interviewType.value = 'video';
  interviewNotes.value = '';
};

const saveInterview = () => {
  if (selectedApplication.value && interviewTime.value && interviewDate.value) {
    // Emit event to parent to update application
    emit('updateInterview', {
      id: selectedApplication.value._id,
      interviewTime: interviewTime.value,
      interviewDate: interviewDate.value,
      interviewLocation: interviewLocation.value,
      interviewType: interviewType.value,
      interviewNotes: interviewNotes.value
    });
    closeInterviewModal();
  }
};

const emit = defineEmits(['updateInterview']);

// Format time for display
const formatTime = (time) => {
  if (!time) return '';
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Interview': return 'bg-yellow-100 text-yellow-800';
    case 'Offer': return 'bg-green-100 text-green-800';
    case 'Applied': return 'bg-blue-100 text-blue-800';
    case 'Rejected': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <!-- Calendar Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div class="flex items-center gap-4 mb-4 sm:mb-0">
        <h2 class="text-2xl font-bold text-gray-900">Interview Calendar</h2>
        <div class="flex gap-2">
          <button
            @click="goToToday"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
      
      <!-- View Mode Toggle -->
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          @click="viewMode = 'month'"
          :class="[
            'px-3 py-1 text-sm font-medium rounded-md transition-colors',
            viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Month
        </button>
        <button
          @click="viewMode = 'week'"
          :class="[
            'px-3 py-1 text-sm font-medium rounded-md transition-colors',
            viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Week
        </button>
        <button
          @click="viewMode = 'day'"
          :class="[
            'px-3 py-1 text-sm font-medium rounded-md transition-colors',
            viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          Day
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <button
          @click="viewMode === 'month' ? navigateMonth(-1) : viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h3 class="text-lg font-semibold text-gray-900 min-w-0">
          {{ currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric',
            ...(viewMode === 'week' ? { day: 'numeric' } : {}),
            ...(viewMode === 'day' ? { weekday: 'long', day: 'numeric' } : {})
          }) }}
        </h3>
        <button
          @click="viewMode === 'month' ? navigateMonth(1) : viewMode === 'week' ? navigateWeek(1) : navigateDay(1)"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <div class="text-sm text-gray-600">
        {{ interviewApplications.length }} interview{{ interviewApplications.length !== 1 ? 's' : '' }} scheduled
      </div>
    </div>

    <!-- Month View -->
    <div v-if="viewMode === 'month'" class="grid grid-cols-7 gap-1">
      <!-- Day headers -->
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
           :key="day" 
           class="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-t-lg">
        {{ day }}
      </div>
      
      <!-- Calendar days -->
      <div
        v-for="day in calendarDays"
        :key="day.date.toISOString()"
        @click="selectDate(day.date)"
        :class="[
          'min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors',
          day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
          day.isToday ? 'ring-2 ring-blue-500' : '',
          selectedDate?.toDateString() === day.date.toDateString() ? 'bg-blue-50' : ''
        ]"
      >
        <div class="flex items-center justify-between mb-1">
          <span :class="[
            'text-sm font-medium',
            day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
            day.isToday ? 'text-blue-600' : ''
          ]">
            {{ day.date.getDate() }}
          </span>
          <span v-if="day.applications.length > 0" 
                class="w-2 h-2 bg-yellow-400 rounded-full"></span>
        </div>
        
        <!-- Applications for this day -->
        <div class="space-y-1">
          <div
            v-for="app in day.applications.slice(0, 2)"
            :key="app._id"
            @click.stop="openInterviewModal(app)"
            class="text-xs p-1 bg-yellow-100 text-yellow-800 rounded truncate cursor-pointer hover:bg-yellow-200 transition-colors"
          >
            {{ app.company }} - {{ app.role }}
          </div>
          <div v-if="day.applications.length > 2" 
               class="text-xs text-gray-500 text-center">
            +{{ day.applications.length - 2 }} more
          </div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div v-if="viewMode === 'week'" class="grid grid-cols-7 gap-1">
      <div v-for="day in weekDays" :key="day.date.toISOString()" 
           class="min-h-[200px] border border-gray-200 rounded-lg">
        <div class="p-2 bg-gray-50 border-b border-gray-200">
          <div class="text-sm font-medium text-gray-900">
            {{ day.date.toLocaleDateString('en-US', { weekday: 'short' }) }}
          </div>
          <div class="text-lg font-bold text-gray-900">
            {{ day.date.getDate() }}
          </div>
        </div>
        <div class="p-2 space-y-1">
          <div
            v-for="app in day.applications"
            :key="app._id"
            @click="openInterviewModal(app)"
            class="text-xs p-2 bg-yellow-100 text-yellow-800 rounded cursor-pointer hover:bg-yellow-200 transition-colors"
          >
            <div class="font-medium">{{ app.company }}</div>
            <div class="text-yellow-600">{{ app.role }}</div>
            <div v-if="app.interviewTime" class="text-yellow-600">
              {{ formatTime(app.interviewTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day View -->
    <div v-if="viewMode === 'day'">
      <div class="space-y-3">
        <div
          v-for="app in dayApplications"
          :key="app._id"
          @click="openInterviewModal(app)"
          class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-gray-900">{{ app.company }}</h4>
              <p class="text-sm text-gray-600">{{ app.role }}</p>
            </div>
            <div class="text-right">
              <div v-if="app.interviewTime" class="text-sm font-medium text-gray-900">
                {{ formatTime(app.interviewTime) }}
              </div>
              <div v-if="app.interviewType" class="text-xs text-gray-500 capitalize">
                {{ app.interviewType }}
              </div>
            </div>
          </div>
          <div v-if="app.interviewLocation" class="mt-2 text-sm text-gray-600">
            📍 {{ app.interviewLocation }}
          </div>
        </div>
        
        <div v-if="dayApplications.length === 0" class="text-center py-8 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p class="text-lg font-medium mb-2">No interviews scheduled</p>
          <p class="text-sm">Mark applications as "Interview" to see them here</p>
        </div>
      </div>
    </div>

    <!-- Interview Details Modal -->
    <div v-if="showInterviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Schedule Interview</h3>
            <button @click="closeInterviewModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="selectedApplication" class="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-900">{{ selectedApplication.company }}</h4>
            <p class="text-sm text-gray-600">{{ selectedApplication.role }}</p>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  v-model="interviewDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  v-model="interviewTime"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                v-model="interviewType"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Location/Link</label>
              <input
                v-model="interviewLocation"
                type="text"
                placeholder="Meeting link or address"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="interviewNotes"
                rows="3"
                placeholder="Interview notes, questions, etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="flex justify-end gap-2 pt-4">
              <button
                @click="closeInterviewModal"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                @click="saveInterview"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
