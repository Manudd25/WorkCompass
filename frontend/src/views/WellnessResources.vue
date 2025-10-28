<script setup>
import { ref } from "vue";
import { RouterLink } from "vue-router";
import Footer from "../components/Footer.vue";

const selectedCategory = ref("all");
const resources = ref([
  {
    id: 1,
    category: "meditation",
    title: "Mindful Breathing Exercise",
    type: "Video",
    duration: "10 min",
    description: "A guided breathing exercise to help you center yourself and reduce stress.",
    url: "https://www.youtube.com/watch?v=ZToicYcHIOU",
    preview: "/images/breathingexercise.png"
  },
  {
    id: 2,
    category: "meditation",
    title: "Progressive Muscle Relaxation",
    type: "Video",
    duration: "15 min",
    description: "Learn to release physical tension through systematic muscle relaxation.",
    url: "https://www.youtube.com/watch?v=86HUcX8ZtAk",
    preview: "https://img.youtube.com/vi/86HUcX8ZtAk/maxresdefault.jpg"
  },
  {
    id: 3,
    category: "stress",
    title: "Understanding Workplace Stress",
    type: "Article",
    duration: "5 min read",
    description: "Learn about the causes of workplace stress and effective coping strategies.",
    url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress/art-20046037",
    preview: "/images/workplacestress.png"
  },
  {
    id: 4,
    category: "stress",
    title: "Quick Stress Relief Techniques",
    type: "Video",
    duration: "8 min",
    description: "Practical techniques you can use in the moment when stress strikes.",
    url: "https://www.youtube.com/watch?v=0fL-pn80s-c",
    preview: "https://img.youtube.com/vi/0fL-pn80s-c/maxresdefault.jpg"
  },
  {
    id: 5,
    category: "education",
    title: "Mental Health at Work: A Comprehensive Guide",
    type: "Article",
    duration: "12 min read",
    description: "Understanding mental health in the workplace and your rights.",
    url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work",
    preview: "https://www.who.int/images/default-source/imported/mental-health-workplace.jpg"
  },
  {
    id: 6,
    category: "education",
    title: "Building Resilience",
    type: "Video",
    duration: "45 min",
    description: "Develop your emotional resilience to better handle workplace challenges.",
    url: "https://www.youtube.com/watch?v=GLAdRgft7pU",
    preview: "https://img.youtube.com/vi/GLAdRgft7pU/maxresdefault.jpg"
  },
  {
    id: 7,
    category: "meditation",
    title: "Body Scan Meditation",
    type: "Video",
    duration: "20 min",
    description: "A comprehensive body scan meditation for deep relaxation and awareness.",
    url: "https://www.youtube.com/watch?v=ihwcw_ofuME",
    preview: "https://img.youtube.com/vi/ihwcw_ofuME/maxresdefault.jpg"
  },
  {
    id: 8,
    category: "stress",
    title: "Work-Life Balance Strategies",
    type: "Article",
    duration: "7 min read",
    description: "Evidence-based strategies for achieving better work-life balance.",
    url: "https://hbr.org/2019/11/the-research-is-clear-long-hours-backfire-for-people-and-for-companies",
    preview: "/images/worklifebalance.jpg"
  },
  {
    id: 9,
    category: "education",
    title: "Mindfulness-Based Stress Reduction",
    type: "Video",
    duration: "30 min",
    description: "Introduction to MBSR techniques for managing stress and anxiety.",
    url: "https://www.youtube.com/watch?v=w6T02g5hnT4",
    preview: "https://img.youtube.com/vi/w6T02g5hnT4/maxresdefault.jpg"
  }
]);

const categories = [
  { value: "all", label: "All Resources" },
  { value: "meditation", label: "Meditation & Mindfulness" },
  { value: "stress", label: "Stress Management" },
  { value: "education", label: "Educational Content" }
];

const getTypeIcon = (type) => {
  const icons = {
    "Video": "▶️",
    "Audio": "🎧",
    "Article": "📄",
    "Guide": "📋",
    "Course": "🎓"
  };
  return icons[type] || "📎";
};

const getTypeColor = (type) => {
  const colors = {
    "Video": "bg-purple-100 text-purple-800",
    "Audio": "bg-blue-100 text-blue-800",
    "Article": "bg-green-100 text-green-800",
    "Guide": "bg-orange-100 text-orange-800",
    "Course": "bg-indigo-100 text-indigo-800"
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

const filteredResources = ref(resources.value);

const filterResources = () => {
  if (selectedCategory.value === "all") {
    filteredResources.value = resources.value;
  } else {
    filteredResources.value = resources.value.filter(r => r.category === selectedCategory.value);
  }
};

const handleImageError = (event) => {
  // Simple fallback to a generic placeholder
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFByZXZpZXcgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div>
            <RouterLink to="/" class="text-2xl font-bold text-slate-800 hover:text-blue-600 transition-colors">
              WorkCompass
            </RouterLink>
          </div>
          <nav class="space-x-4">
            <RouterLink to="/dashboard" class="text-slate-600 hover:text-slate-800 font-medium">
              Dashboard
            </RouterLink>
            <RouterLink to="/settings" class="text-slate-600 hover:text-slate-800 font-medium">
              Settings
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Page Header -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl font-bold text-slate-900 mb-4">Wellness Resources</h1>
        <p class="text-lg text-slate-600 max-w-3xl mx-auto">
          Access a comprehensive library of mental health resources, guided meditations, stress management techniques, and educational content.
        </p>
      </div>

      <!-- Category Filters -->
      <div class="mb-8 flex flex-wrap justify-center gap-3">
        <button 
          v-for="cat in categories" 
          :key="cat.value"
          @click="selectedCategory = cat.value; filterResources()"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200"
          :class="selectedCategory === cat.value 
            ? 'bg-slate-800 text-white shadow-lg' 
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-gray-200'"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Resources Grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          v-for="resource in filteredResources" 
          :key="resource.id"
          class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col resource-card"
          :data-type="resource.type"
        >
          <!-- Preview Image -->
          <div class="mb-4">
            <img 
              :src="resource.preview" 
              :alt="resource.title"
              class="w-full h-48 object-cover rounded-lg"
              @error="handleImageError"
            />
          </div>

          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center mb-2">
                <span class="text-2xl mr-2">{{ getTypeIcon(resource.type) }}</span>
                <h3 class="text-xl font-semibold text-slate-900">{{ resource.title }}</h3>
              </div>
              <span :class="getTypeColor(resource.type)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ resource.type }}
              </span>
            </div>
          </div>
          
          <p class="text-slate-600 mb-4 text-sm flex-grow">
            {{ resource.description }}
          </p>
          
          <div class="flex items-center justify-between mt-auto">
            <span class="text-sm text-slate-500">{{ resource.duration }}</span>
            <a 
              :href="resource.url" 
              target="_blank" 
              rel="noopener noreferrer"
              class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm inline-block"
            >
              Open Resource
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Tips Section -->
      <div class="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
        <h2 class="text-2xl font-semibold text-slate-900 mb-6 text-center">Quick Wellness Tips</h2>
        
        <div class="grid md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="text-3xl mb-3">🧘</div>
            <h3 class="font-semibold text-slate-900 mb-2">Practice Mindfulness</h3>
            <p class="text-sm text-slate-600">Take 5 minutes daily to practice mindfulness meditation. Focus on your breathing and be present in the moment.</p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="text-3xl mb-3">🏃</div>
            <h3 class="font-semibold text-slate-900 mb-2">Stay Active</h3>
            <p class="text-sm text-slate-600">Regular exercise releases endorphins and reduces stress. Even a 10-minute walk can make a difference.</p>
          </div>
          
          <div class="bg-white rounded-lg p-6 shadow-sm">
            <div class="text-3xl mb-3">💤</div>
            <h3 class="font-semibold text-slate-900 mb-2">Prioritize Sleep</h3>
            <p class="text-sm text-slate-600">Aim for 7-9 hours of quality sleep each night. Good sleep improves mood and cognitive function.</p>
          </div>
        </div>
      </div>

    </main>
    
    <Footer />
  </div>
</template>

