<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import SidebarShell from "../components/SidebarShell.vue";
import SectionHeader from "../components/SectionHeader.vue";
import jsPDF from 'jspdf';
import {
  getMoodEntries,
  createMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getWellnessAssessments,
  createWellnessAssessment,
  updateWellnessAssessment,
  deleteWellnessAssessment
} from "../services/wellnessService.js";

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

const moodEntries = ref([]);
const wellnessAssessments = ref([]);

const questionnaire = ref({
  sleep: 7,
  diet: 6,
  exercise: 5,
  workLife: 7,
  social: 8,
  overall: 8
});

const currentPage = ref(1);
const itemsPerPage = ref(5);
const editingAssessment = ref(null);
const editAssessmentForm = ref({
  scores: {
    sleep: 7,
    diet: 6,
    exercise: 5,
    workLife: 7,
    social: 8,
    overall: 8
  },
  notes: ""
});

const currentDate = ref(new Date());
const selectedMood = ref("");
const moodEnergy = ref(5);
const moodStress = ref(5);
const moodNotes = ref("");

const editingEntry = ref(null);
const editForm = ref({
  mood: "",
  energy: 5,
  stress: 5,
  notes: ""
});

const moods = ["😊 happy", "😌 calm", "😐 neutral", "😰 anxious", "😴 tired", "😃 excited", "😔 sad", "😤 frustrated"];

const submitMoodEntry = async () => {
  if (!selectedMood.value) {
    alert("Please select your mood");
    return;
  }
  
  try {
    const entry = await createMoodEntry({
      date: currentDate.value.toISOString().split('T')[0],
      mood: selectedMood.value,
      energy: moodEnergy.value,
      stress: moodStress.value,
      notes: moodNotes.value
    });
    
    moodEntries.value.unshift(entry);
    
    selectedMood.value = "";
    moodEnergy.value = 5;
    moodStress.value = 5;
    moodNotes.value = "";
    
    alert("Wellbeing check-in saved successfully!");
  } catch (error) {
    console.error("Error creating mood entry:", error);
    alert("Failed to save wellbeing check-in. Please try again.");
  }
};

const editEntry = (entry) => {
  editingEntry.value = entry;
  editForm.value = {
    mood: entry.mood,
    energy: entry.energy,
    stress: entry.stress,
    notes: entry.notes
  };
};

const saveEdit = async () => {
  if (!editForm.value.mood) {
    alert("Please select your mood");
    return;
  }
  
  try {
    const updatedEntry = await updateMoodEntry(editingEntry.value._id, {
      date: editingEntry.value.date,
      mood: editForm.value.mood,
      energy: editForm.value.energy,
      stress: editForm.value.stress,
      notes: editForm.value.notes
    });
    
    const index = moodEntries.value.findIndex(e => e._id === editingEntry.value._id);
    if (index > -1) {
      moodEntries.value[index] = updatedEntry;
    }
    
    editingEntry.value = null;
    alert("Entry updated successfully!");
  } catch (error) {
    console.error("Error updating mood entry:", error);
    alert("Failed to update entry. Please try again.");
  }
};

const cancelEdit = () => {
  editingEntry.value = null;
  editForm.value = { mood: "", energy: 5, stress: 5, notes: "" };
};

const deleteEntry = async (entry) => {
  if (confirm("Are you sure you want to delete this entry?")) {
    try {
      await deleteMoodEntry(entry._id);
      const index = moodEntries.value.indexOf(entry);
      if (index > -1) {
        moodEntries.value.splice(index, 1);
      }
      alert("Entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Failed to delete entry. Please try again.");
    }
  }
};

const moodClass = (mood) => {
  const moodMap = {
    "happy": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "calm": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "neutral": "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300",
    "anxious": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    "tired": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    "excited": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    "sad": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "frustrated": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };
  return moodMap[mood] || "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300";
};

const submitAssessment = async () => {
  const scores = Object.values(questionnaire.value);
  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  try {
    const newAssessment = await createWellnessAssessment({
      date: new Date().toISOString().split('T')[0],
      scores: { ...questionnaire.value },
      overallScore: Math.round(overallScore * 10) / 10,
      notes: ""
    });
    
    wellnessAssessments.value.unshift(newAssessment);
    
    questionnaire.value = {
      sleep: 7,
      diet: 6,
      exercise: 5,
      workLife: 7,
      social: 8,
      overall: 8
    };
    
    alert("Wellbeing assessment submitted successfully!");
  } catch (error) {
    console.error("Error submitting assessment:", error);
    alert("Failed to submit wellbeing assessment. Please try again.");
  }
};

const editAssessment = (assessment) => {
  editingAssessment.value = assessment;
  editAssessmentForm.value = {
    scores: { ...assessment.scores },
    notes: assessment.notes || ""
  };
};

const saveAssessmentEdit = async () => {
  if (!editingAssessment.value) return;
  
  const scores = Object.values(editAssessmentForm.value.scores);
  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  try {
    const updatedAssessment = await updateWellnessAssessment(editingAssessment.value._id, {
      date: new Date().toISOString().split('T')[0],
      scores: { ...editAssessmentForm.value.scores },
      overallScore: Math.round(overallScore * 10) / 10,
      notes: editAssessmentForm.value.notes
    });
    
    const index = wellnessAssessments.value.findIndex(a => a._id === editingAssessment.value._id);
    if (index > -1) {
      wellnessAssessments.value[index] = updatedAssessment;
    }
    
    editingAssessment.value = null;
    editAssessmentForm.value = {
      scores: { sleep: 7, diet: 6, exercise: 5, workLife: 7, social: 8, overall: 8 },
      notes: ""
    };
    
    alert("Assessment updated successfully!");
  } catch (error) {
    console.error("Error updating assessment:", error);
    alert("Failed to update assessment. Please try again.");
  }
};

const cancelAssessmentEdit = () => {
  editingAssessment.value = null;
  editAssessmentForm.value = {
    scores: { sleep: 7, diet: 6, exercise: 5, workLife: 7, social: 8, overall: 8 },
    notes: ""
  };
};

const deleteAssessment = async (assessment) => {
  if (confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) {
    try {
      await deleteWellnessAssessment(assessment._id);
      const index = wellnessAssessments.value.findIndex(a => a._id === assessment._id);
      if (index > -1) {
        wellnessAssessments.value.splice(index, 1);
      }
      alert("Assessment deleted successfully!");
    } catch (error) {
      console.error("Error deleting assessment:", error);
      alert("Failed to delete assessment. Please try again.");
    }
  }
};

const totalPages = computed(() => {
  return Math.ceil(wellnessAssessments.value.length / itemsPerPage.value);
});

const paginatedAssessments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return wellnessAssessments.value.slice(start, end);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const getScoreColor = (score) => {
  if (score >= 8) return "text-green-600 dark:text-green-400";
  if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
};

const downloadPDF = () => {
  const reportData = generateReportData();
  
  const doc = new jsPDF();
  
  const primaryColor = [5, 150, 105];
  const textColor = [51, 65, 85];
  const lightGray = [243, 244, 246];
  
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Weekly Wellbeing Report', 105, 20, { align: 'center' });
  
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${reportData.dateRange}`, 20, 45);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);
  
  let yPosition = 70;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Average Wellbeing Score: ${reportData.averageWellnessScore}/10`, 20, yPosition);
  yPosition += 10;
  doc.text(`Total Assessments: ${reportData.assessments.length}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Total Mood Entries: ${reportData.moodEntries.length}`, 20, yPosition);
  yPosition += 20;
  
  if (reportData.assessments.length > 0) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Wellbeing Assessments', 20, yPosition);
    yPosition += 15;
    
    const headers = ['Date', 'Sleep', 'Diet', 'Exercise', 'Work Life', 'Social', 'Overall'];
    const colWidths = [30, 20, 20, 25, 25, 20, 20];
    let xPosition = 20;
    
    doc.setFillColor(...lightGray);
    doc.rect(xPosition, yPosition - 8, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    headers.forEach((header, index) => {
      doc.text(header, xPosition + 2, yPosition - 2);
      xPosition += colWidths[index];
    });
    
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    reportData.assessments.forEach(assessment => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      xPosition = 20;
      const rowData = [
        assessment.date,
        assessment.scores.sleep.toString(),
        assessment.scores.diet.toString(),
        assessment.scores.exercise.toString(),
        assessment.scores.workLife.toString(),
        assessment.scores.social.toString(),
        assessment.overallScore.toString()
      ];
      
      rowData.forEach((data, index) => {
        doc.text(data, xPosition + 2, yPosition);
        xPosition += colWidths[index];
      });
      
      yPosition += 8;
    });
    
    yPosition += 10;
  }
  
  if (reportData.moodEntries.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Mood Entries', 20, yPosition);
    yPosition += 15;
    
    const moodHeaders = ['Date', 'Mood', 'Energy', 'Stress', 'Notes'];
    const moodColWidths = [30, 25, 20, 20, 60];
    let xPosition = 20;
    
    doc.setFillColor(...lightGray);
    doc.rect(xPosition, yPosition - 8, moodColWidths.reduce((a, b) => a + b, 0), 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    moodHeaders.forEach((header, index) => {
      doc.text(header, xPosition + 2, yPosition - 2);
      xPosition += moodColWidths[index];
    });
    
    yPosition += 5;
    
    doc.setFont('helvetica', 'normal');
    reportData.moodEntries.forEach(entry => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      xPosition = 20;
      const rowData = [
        entry.date,
        entry.mood,
        entry.energy.toString(),
        entry.stress.toString(),
        entry.notes || '-'
      ];
      
      rowData.forEach((data, index) => {
        doc.text(data, xPosition + 2, yPosition);
        xPosition += moodColWidths[index];
      });
      
      yPosition += 8;
    });
  }
  
  doc.save(`wellbeing-report-${new Date().toISOString().split('T')[0]}.pdf`);
  alert('PDF report downloaded successfully!');
};

const downloadCSV = () => {
  const csvContent = generateCSVContent();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wellness-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('CSV report downloaded successfully!');
};

const generateReportData = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastWeekDate = lastWeek.toISOString().split('T')[0];
  
  const recentAssessments = wellnessAssessments.value.filter(assessment => 
    assessment.date >= lastWeekDate && assessment.date <= currentDate
  );
  
  const recentMoodEntries = moodEntries.value.filter(entry => 
    entry.date >= lastWeekDate && entry.date <= currentDate
  );
  
  return {
    dateRange: `${lastWeekDate} to ${currentDate}`,
    assessments: recentAssessments,
    moodEntries: recentMoodEntries,
    averageWellnessScore: recentAssessments.length > 0 
      ? (recentAssessments.reduce((sum, a) => sum + a.overallScore, 0) / recentAssessments.length).toFixed(1)
      : 0
  };
};

const generateCSVContent = () => {
  const reportData = generateReportData();
  
  let csvContent = 'Weekly Wellbeing Report\n';
  csvContent += `Period,${reportData.dateRange}\n`;
  csvContent += `Generated,${new Date().toLocaleDateString()}\n`;
  csvContent += `Average Wellbeing Score,${reportData.averageWellnessScore}\n\n`;
  
  csvContent += 'Wellbeing Assessments\n';
  csvContent += 'Date,Sleep,Diet,Exercise,Work Life,Social,Overall Score\n';
  
  if (reportData.assessments.length > 0) {
    reportData.assessments.forEach(assessment => {
      csvContent += `${assessment.date},${assessment.scores.sleep},${assessment.scores.diet},${assessment.scores.exercise},${assessment.scores.workLife},${assessment.scores.social},${assessment.overallScore}\n`;
    });
  } else {
    csvContent += 'No assessments recorded this week\n';
  }
  
  csvContent += '\nMood Entries\n';
  csvContent += 'Date,Mood,Energy,Stress,Notes\n';
  
  if (reportData.moodEntries.length > 0) {
    reportData.moodEntries.forEach(entry => {
      csvContent += `${entry.date},${entry.mood},${entry.energy},${entry.stress},"${entry.notes || ''}"\n`;
    });
  } else {
    csvContent += 'No mood entries recorded this week\n';
  }
  
  return csvContent;
};

onMounted(async () => {
  try {
    const [entries, assessments] = await Promise.all([
      getMoodEntries(),
      getWellnessAssessments()
    ]);
    moodEntries.value = entries;
    wellnessAssessments.value = assessments;
  } catch (error) {
    console.error("Error loading wellness data:", error);
  }
});
</script>

<template>
  <SidebarShell :nav-items="navItems" :secondary-items="secondaryItems">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionHeader title="Job Search Wellbeing" subtitle="Lightweight check-ins to support your job search energy, confidence, and focus over time." />

      <div class="grid md:grid-cols-2 gap-8 mb-12">
        <!-- Mood Tracking Form -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 flex flex-col dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
          <h2 class="text-2xl font-semibold text-slate-900 mb-6 flex items-center dark:text-slate-100">
            <svg class="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Daily Wellbeing Check-in
          </h2>
          
          <form @submit.prevent="submitMoodEntry" class="flex flex-col flex-1 space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">How are you feeling?</label>
              <div class="grid grid-cols-2 gap-3">
                <label v-for="mood in moods" :key="mood" 
                  class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400"
                  :class="selectedMood === mood.split(' ')[1] ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-600'">
                  <input type="radio" v-model="selectedMood" :value="mood.split(' ')[1]" class="mr-2 hidden">
                  <span class="text-2xl">{{ mood.split(' ')[0] }}</span>
                  <span class="ml-2 text-sm text-slate-700 capitalize dark:text-slate-300">{{ mood.split(' ')[1] }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Energy Level: {{ moodEnergy }}/10</label>
              <input type="range" v-model="moodEnergy" min="1" max="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Stress Level: {{ moodStress }}/10</label>
              <input type="range" v-model="moodStress" min="1" max="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Notes (optional)</label>
              <textarea v-model="moodNotes" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400" placeholder="How was your day?"></textarea>
            </div>

          <div class="mt-auto pt-6">
            <button
              type="submit"
              class="inline-flex h-10 w-full items-center justify-center leading-none bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-0 rounded-lg transition-colors duration-200"
            >
              Save Check-in
            </button>
          </div>
          </form>
        </div>

        <!-- Wellness Questionnaire -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 flex flex-col dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
          <h2 class="text-2xl font-semibold text-slate-900 mb-6 flex items-center dark:text-slate-100">
            <svg class="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Weekly Wellbeing Assessment
          </h2>

          <div class="space-y-6 flex-1">
            <div v-for="(value, key) in questionnaire" :key="key" class="space-y-2">
              <div class="flex justify-between items-center">
                <label class="text-sm font-medium text-slate-700 capitalize dark:text-slate-300">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</label>
                <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{ value }}/10</span>
              </div>
              <input type="range" v-model="questionnaire[key]" min="1" max="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600">
            </div>
          </div>

          <div class="mt-auto pt-6">
            <button
              @click="submitAssessment"
              class="inline-flex h-10 w-full items-center justify-center leading-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-0 rounded-lg transition-colors duration-200"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Entries -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
        <h2 class="text-2xl font-semibold text-slate-900 mb-6 dark:text-slate-100">Recent Entries</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-slate-700">
                <th class="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Mood</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Energy</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Stress</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Notes</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(entry, index) in moodEntries" :key="index" class="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700">
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{{ entry.date }}</td>
                <td class="py-3 px-4">
                  <span :class="moodClass(entry.mood)" class="px-3 py-1 rounded-full text-sm font-medium capitalize">
                    {{ entry.mood }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center">
                    <div class="w-24 h-2 bg-gray-200 rounded-full mr-2 dark:bg-slate-600">
                      <div class="h-2 bg-green-500 rounded-full" :style="`width: ${entry.energy * 10}%`"></div>
                    </div>
                    <span class="text-sm text-slate-600 dark:text-slate-400">{{ entry.energy }}/10</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center">
                    <div class="w-24 h-2 bg-gray-200 rounded-full mr-2 dark:bg-slate-600">
                      <div class="h-2 bg-red-500 rounded-full" :style="`width: ${entry.stress * 10}%`"></div>
                    </div>
                    <span class="text-sm text-slate-600 dark:text-slate-400">{{ entry.stress }}/10</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-sm text-slate-600 dark:text-slate-400">{{ entry.notes || "-" }}</td>
                <td class="py-3 px-4">
                  <div class="flex space-x-2">
                    <button @click="editEntry(entry)" class="text-blue-600 hover:text-blue-800 text-sm font-medium dark:text-blue-400 dark:hover:text-blue-300">
                      Edit
                    </button>
                    <button @click="deleteEntry(entry)" class="text-red-600 hover:text-red-800 text-sm font-medium dark:text-red-400 dark:hover:text-red-300">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Wellness Assessments History -->
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-8 dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/30">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold text-slate-900 flex items-center dark:text-slate-100">
            <svg class="w-6 h-6 mr-2 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            Wellbeing Assessment History
          </h2>
          
          <div class="flex gap-3">
            <button
              @click="downloadPDF"
              class="inline-flex h-10 items-center justify-center px-4 py-0 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download PDF
            </button>
            <button
              @click="downloadCSV"
              class="inline-flex h-10 items-center justify-center px-4 py-0 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Download CSV
            </button>
          </div>
        </div>
        
        <div v-if="wellnessAssessments.length === 0" class="text-center py-8 text-gray-500 dark:text-slate-400">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <p>No assessments submitted yet. Complete your first wellbeing assessment above!</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="assessment in paginatedAssessments" :key="assessment._id" 
               class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow dark:border-slate-700 dark:hover:shadow-slate-900/30">
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-3">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ assessment.date }}</h3>
                  <p class="text-sm text-gray-500 dark:text-slate-400">Weekly Assessment</p>
                </div>
                <div class="flex gap-2">
                  <button @click="editAssessment(assessment)" 
                          class="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                          title="Edit Assessment">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button @click="deleteAssessment(assessment)" 
                          class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                          title="Delete Assessment">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold" :class="getScoreColor(assessment.overallScore)">
                  {{ assessment.overallScore }}/10
                </div>
                <p class="text-sm text-gray-500 dark:text-slate-400">Overall Score</p>
              </div>
            </div>
            
            <div v-if="editingAssessment && editingAssessment.id === assessment.id">
              <div class="space-y-4 mb-4">
                <div v-for="(value, key) in editAssessmentForm.scores" :key="key" class="space-y-2">
                  <div class="flex justify-between items-center">
                    <label class="text-sm font-medium text-slate-700 capitalize dark:text-slate-300">{{ key.replace(/([A-Z])/g, ' $1').trim() }}</label>
                    <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{ value }}/10</span>
                  </div>
                  <input type="range" v-model="editAssessmentForm.scores[key]" min="1" max="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600">
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Notes (Optional)</label>
                  <textarea 
                    v-model="editAssessmentForm.notes"
                    rows="3" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>
              </div>
              
              <div class="flex gap-2">
                <button 
                  @click="saveAssessmentEdit"
                  class="inline-flex h-10 items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-0 rounded-lg transition-colors duration-200 text-sm"
                >
                  Save Changes
                </button>
                <button 
                  @click="cancelAssessmentEdit"
                  class="inline-flex h-10 items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-0 rounded-lg transition-colors duration-200 text-sm dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div v-else>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="(score, category) in assessment.scores" :key="category" 
                     class="text-center p-3 bg-gray-50 rounded-lg dark:bg-slate-700">
                  <div class="text-sm text-gray-600 capitalize mb-1 dark:text-slate-400">{{ category.replace(/([A-Z])/g, ' $1').trim() }}</div>
                  <div class="text-lg font-semibold" :class="getScoreColor(score)">{{ score }}/10</div>
                </div>
              </div>
              
              <div v-if="assessment.notes" class="mt-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                <p class="text-sm text-blue-800 dark:text-blue-300">{{ assessment.notes }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors duration-200 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            
            <div class="flex gap-1">
              <button 
                v-for="page in totalPages" 
                :key="page"
                @click="goToPage(page)"
                :class="currentPage === page ? 'bg-emerald-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200'"
                class="px-3 py-2 rounded-lg transition-colors duration-200"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors duration-200 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200 dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          <div v-if="totalPages > 1" class="text-center text-sm text-gray-500 mt-2 dark:text-slate-400">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, wellnessAssessments.length) }} of {{ wellnessAssessments.length }} assessments
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="editingEntry" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 dark:bg-slate-800">
          <h3 class="text-xl font-semibold text-slate-900 mb-4 dark:text-slate-100">Edit Entry</h3>
          
          <form @submit.prevent="saveEdit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">How were you feeling?</label>
              <div class="grid grid-cols-2 gap-3">
                <label v-for="mood in moods" :key="mood" 
                  class="flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-400"
                  :class="editForm.mood === mood.split(' ')[1] ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-600'">
                  <input type="radio" v-model="editForm.mood" :value="mood.split(' ')[1]" class="mr-2 hidden">
                  <span class="text-2xl">{{ mood.split(' ')[0] }}</span>
                  <span class="ml-2 text-sm text-slate-700 capitalize dark:text-slate-300">{{ mood.split(' ')[1] }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Energy Level: {{ editForm.energy }}/10</label>
              <input type="range" v-model="editForm.energy" min="1" max="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Stress Level: {{ editForm.stress }}/10</label>
              <input type="range" v-model="editForm.stress" min="1" max="10" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600">
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">Notes (optional)</label>
              <textarea v-model="editForm.notes" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400" placeholder="How was your day?"></textarea>
            </div>

            <div class="flex gap-3">
              <button
                type="submit"
                class="inline-flex h-10 flex-1 items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-0 rounded-lg transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                @click="cancelEdit"
                class="inline-flex h-10 flex-1 items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-0 rounded-lg transition-colors duration-200 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </SidebarShell>
</template>
