<script setup>
import { ref } from "vue";

const props = defineProps({
  application: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update', 'delete']);

const isExpanded = ref(false);
const showEditModal = ref(false);
const editCompany = ref("");
const editRole = ref("");
const editStatus = ref("");
const editDate = ref("");
const editNotes = ref("");

const startEdit = () => {
  showEditModal.value = true;
  editCompany.value = props.application.company || "";
  editRole.value = props.application.role || "";
  editStatus.value = props.application.status || "Applied";
  editDate.value = props.application.date ? new Date(props.application.date).toISOString().slice(0, 10) : "";
  editNotes.value = props.application.notes || "";
};

const closeEditModal = () => {
  showEditModal.value = false;
};

const handleUpdate = () => {
  emit('update', {
    id: props.application._id,
    company: editCompany.value,
    role: editRole.value,
    status: editStatus.value,
    date: editDate.value,
    notes: editNotes.value
  });
  showEditModal.value = false;
};

const handleDelete = () => {
  if (confirm("Are you sure you want to delete this application?")) {
    emit('delete', props.application._id);
  }
};


const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value;
};

const getTruncatedText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Applied': return 'bg-blue-100 text-blue-700';
    case 'Interview': return 'bg-yellow-100 text-yellow-700';
    case 'Offer': return 'bg-green-100 text-green-700';
    case 'Rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
    <!-- Main Row Layout -->
    <div class="flex items-center justify-between p-4">
      <!-- Left: Job Info -->
      <div class="flex-1 min-w-0">
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-lg text-gray-900 truncate">{{ application.role }}</h3>
          <p class="text-gray-600 truncate">{{ application.company }}</p>
          <p class="text-sm text-gray-500">{{ new Date(application.date).toLocaleDateString() }}</p>
        </div>
        
        <!-- Expandable Notes Section -->
        <div v-if="application.notes" class="mt-3">
          <div class="text-sm text-gray-600">
            <strong>Notes:</strong>
            <span v-if="!isExpanded">{{ getTruncatedText(application.notes, 80) }}</span>
            <span v-else>{{ application.notes }}</span>
            <button 
              v-if="application.notes.length > 80" 
              @click="toggleExpanded" 
              class="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {{ isExpanded ? 'Show less' : 'Show more' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Right: Status Badge and Action Buttons -->
      <div class="flex-shrink-0 ml-4 flex items-center gap-3">
        <!-- Status Badge -->
        <span :class="getStatusColor(application.status)" class="px-3 py-1 rounded-full text-sm font-semibold">
          {{ application.status }}
        </span>
        
        <!-- Action Buttons -->
        <div class="flex gap-2">
          <button @click="startEdit" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button @click="handleDelete" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">Edit Application</h3>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input v-model="editCompany" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input v-model="editRole" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select v-model="editStatus" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input v-model="editDate" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea v-model="editNotes" rows="3" placeholder="Additional notes..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div class="flex justify-end gap-2 pt-4">
              <button @click="closeEditModal" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Cancel</button>
              <button @click="handleUpdate" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
