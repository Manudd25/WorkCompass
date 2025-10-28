<script setup>
import { ref, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import Footer from "../components/Footer.vue";

const router = useRouter();
const userStore = useUserStore();

const newPost = ref({
  title: "",
  content: "",
  category: "general"
});

const showNewPostForm = ref(false);
const editingPost = ref(null);
const editForm = ref({
  title: "",
  content: "",
  category: "general"
});

const selectedPost = ref(null);
const newComment = ref("");
const showComments = ref({});

const editingComment = ref(null);
const editCommentForm = ref("");

const categories = [
  { value: "general", label: "General Discussion", icon: "💬", color: "bg-slate-500" },
  { value: "career", label: "Career Advice", icon: "💼", color: "bg-blue-500" },
  { value: "wellness", label: "Mental Wellness", icon: "🧘", color: "bg-emerald-500" },
  { value: "tips", label: "Tips & Tricks", icon: "💡", color: "bg-amber-500" },
  { value: "networking", label: "Networking", icon: "🤝", color: "bg-purple-500" }
];

const posts = ref([
  {
    id: 1,
    author: "Sarah Chen",
    authorRole: "Product Manager",
    title: "How to Handle Work-Life Balance as a Product Manager",
    content: "I've been struggling with maintaining a healthy work-life balance. Any tips from fellow PMs?",
    category: "general",
    likes: 24,
    likedBy: ["user1", "user2", "user3"],
    comments: [
      {
        id: 1,
        author: "Alex Thompson",
        content: "Great question! I find time-blocking really helpful for maintaining boundaries.",
        timestamp: "1 hour ago"
      },
      {
        id: 2,
        author: "Maria Garcia",
        content: "Setting clear expectations with your team about availability is crucial.",
        timestamp: "45 minutes ago"
      }
    ],
    timestamp: "2 hours ago"
  },
  {
    id: 2,
    author: "Michael Rodriguez",
    authorRole: "Software Engineer",
    title: "Best Practices for Technical Interviews",
    content: "Recently went through several interview rounds. Happy to share what I learned about preparation and common pitfalls.",
    category: "career",
    likes: 45,
    likedBy: ["user4", "user5", "user6"],
    comments: [
      {
        id: 3,
        author: "David Kim",
        content: "Thanks for sharing! What was the most challenging part for you?",
        timestamp: "3 hours ago"
      },
      {
        id: 4,
        author: "Lisa Wang",
        content: "I'd love to hear more about the coding challenges you faced.",
        timestamp: "2 hours ago"
      }
    ],
    timestamp: "5 hours ago"
  },
  {
    id: 3,
    author: "Emily Johnson",
    authorRole: "Marketing Director",
    title: "Managing Stress During High-Stakes Projects",
    content: "Our team is currently working on a major product launch. What strategies do you use to stay calm under pressure?",
    category: "wellness",
    likes: 32,
    likedBy: ["user7", "user8"],
    comments: [
      {
        id: 5,
        author: "James Wilson",
        content: "Deep breathing exercises and regular breaks have been game-changers for me.",
        timestamp: "4 hours ago"
      }
    ],
    timestamp: "1 day ago"
  },
  {
    id: 4,
    author: "David Kim",
    authorRole: "UX Designer",
    title: "Building Your Personal Brand in 2025",
    content: "Personal branding is more important than ever. Let's discuss strategies for standing out in your field.",
    category: "career",
    likes: 18,
    comments: 6,
    timestamp: "2 days ago"
  }
]);

const selectedCategory = ref("all");

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(3);

const filteredPosts = ref(posts.value);

const filterPosts = () => {
  if (selectedCategory.value === "all") {
    filteredPosts.value = posts.value;
  } else {
    filteredPosts.value = posts.value.filter(p => p.category === selectedCategory.value);
  }
  // Reset to first page when filtering
  currentPage.value = 1;
};

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredPosts.value.length / itemsPerPage.value);
});

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredPosts.value.slice(start, end);
});

// Pagination functions
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

const likePost = (postId) => {
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    const currentUser = userStore.user?.id || 'anonymous';
    
    if (!post.likedBy) {
      post.likedBy = [];
    }
    
    const userIndex = post.likedBy.indexOf(currentUser);
    if (userIndex > -1) {
      // User already liked, remove the like
      post.likedBy.splice(userIndex, 1);
      post.likes--;
    } else {
      // User hasn't liked yet, add the like
      post.likedBy.push(currentUser);
      post.likes++;
    }
  }
};

const isPostLiked = (post) => {
  const currentUser = userStore.user?.id || 'anonymous';
  return post.likedBy && post.likedBy.includes(currentUser);
};

const toggleComments = (postId) => {
  showComments.value[postId] = !showComments.value[postId];
};

const addComment = (postId) => {
  if (!newComment.value.trim()) {
    alert("Please enter a comment");
    return;
  }

  const post = posts.value.find(p => p.id === postId);
  if (post) {
    if (!post.comments) {
      post.comments = [];
    }
    
    const comment = {
      id: Date.now(), // Simple ID generation
      author: userStore.user?.name || "Anonymous",
      content: newComment.value,
      timestamp: "Just now"
    };
    
    post.comments.push(comment);
    newComment.value = "";
  }
};

const editComment = (comment) => {
  editingComment.value = comment;
  editCommentForm.value = comment.content;
};

const saveCommentEdit = () => {
  if (!editCommentForm.value.trim()) {
    alert("Please enter a comment");
    return;
  }

  if (editingComment.value) {
    editingComment.value.content = editCommentForm.value;
    editingComment.value.timestamp = "Edited just now";
    editingComment.value = null;
    editCommentForm.value = "";
  }
};

const cancelCommentEdit = () => {
  editingComment.value = null;
  editCommentForm.value = "";
};

const deleteComment = (postId, commentId) => {
  if (confirm("Are you sure you want to delete this comment? This action cannot be undone.")) {
    const post = posts.value.find(p => p.id === postId);
    if (post && post.comments) {
      const commentIndex = post.comments.findIndex(c => c.id === commentId);
      if (commentIndex > -1) {
        post.comments.splice(commentIndex, 1);
        alert("Comment deleted successfully!");
      }
    }
  }
};

const canEditComment = (comment) => {
  // Allow editing if user is the author or if no user (for demo purposes)
  return !userStore.user || comment.author === userStore.user.name || comment.author === "Anonymous";
};

const submitPost = () => {
  if (!newPost.value.title.trim() || !newPost.value.content.trim()) {
    alert("Please fill in both title and content");
    return;
  }

  const post = {
    id: posts.value.length + 1,
    author: userStore.user?.name || "Anonymous",
    authorRole: "Member",
    title: newPost.value.title,
    content: newPost.value.content,
    category: newPost.value.category,
    likes: 0,
    comments: 0,
    timestamp: "Just now"
  };

  posts.value.unshift(post);
  filteredPosts.value = posts.value;

  // Reset form
  newPost.value = { title: "", content: "", category: "general" };
  showNewPostForm.value = false;
  alert("Post published successfully!");
};

const getCategoryInfo = (category) => {
  return categories.find(c => c.value === category);
};

const editPost = (post) => {
  editingPost.value = post;
  editForm.value = {
    title: post.title,
    content: post.content,
    category: post.category
  };
};

const saveEdit = () => {
  if (!editForm.value.title.trim() || !editForm.value.content.trim()) {
    alert("Please fill in both title and content");
    return;
  }

  const post = posts.value.find(p => p.id === editingPost.value.id);
  if (post) {
    post.title = editForm.value.title;
    post.content = editForm.value.content;
    post.category = editForm.value.category;
    post.timestamp = "Edited just now";
  }

  editingPost.value = null;
  editForm.value = { title: "", content: "", category: "general" };
  alert("Post updated successfully!");
};

const cancelEdit = () => {
  editingPost.value = null;
  editForm.value = { title: "", content: "", category: "general" };
};

const deletePost = (post) => {
  if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
    const index = posts.value.indexOf(post);
    if (index > -1) {
      posts.value.splice(index, 1);
      filteredPosts.value = posts.value;
      alert("Post deleted successfully!");
    }
  }
};

const canEditPost = (post) => {
  // Allow editing if user is the author or if no user (for demo purposes)
  return !userStore.user || post.author === userStore.user.name || post.author === "Anonymous";
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50">
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
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-slate-900 mb-2">Discussion Forum</h1>
          <p class="text-lg text-slate-600">
            Connect, share experiences, and learn from fellow professionals
          </p>
        </div>
        <button 
          @click="showNewPostForm = !showNewPostForm"
          class="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          New Post
        </button>
      </div>

      <!-- New Post Form -->
      <div v-if="showNewPostForm" class="mb-8 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-slate-900 mb-4">Create New Post</h2>
        <form @submit.prevent="submitPost" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select v-model="newPost.category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input 
              v-model="newPost.title" 
              type="text" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your post title"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Content</label>
            <textarea 
              v-model="newPost.content" 
              rows="6" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Share your thoughts, questions, or experiences..."
            ></textarea>
          </div>
          
          <div class="flex gap-3">
            <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
              Publish Post
            </button>
            <button type="button" @click="showNewPostForm = false" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Category Filters -->
      <div class="mb-8 flex flex-wrap gap-3">
        <button 
          @click="selectedCategory = 'all'; filterPosts()"
          :class="selectedCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-200"
        >
          All Posts
        </button>
        <button 
          v-for="cat in categories" 
          :key="cat.value"
          @click="selectedCategory = cat.value; filterPosts()"
          :class="selectedCategory === cat.value ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'"
          class="px-6 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-200 flex items-center"
        >
          <span class="mr-2">{{ cat.icon }}</span>
          {{ cat.label }}
        </button>
      </div>

      <!-- Posts List -->
      <div class="space-y-6">
        <div 
          v-for="post in paginatedPosts" 
          :key="post.id"
          class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300"
        >
          <!-- Post Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-3">
                {{ post.author.charAt(0) }}
              </div>
              <div>
                <h3 class="font-semibold text-slate-900">{{ post.author }}</h3>
                <p class="text-sm text-slate-500">{{ post.authorRole }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span :class="getCategoryInfo(post.category)?.color || 'bg-slate-500'" class="px-3 py-1 rounded-full text-white text-xs font-semibold">
                {{ getCategoryInfo(post.category)?.icon }} {{ getCategoryInfo(post.category)?.label }}
              </span>
            </div>
          </div>

          <!-- Post Content -->
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-slate-900 mb-2">{{ post.title }}</h2>
            <p class="text-slate-600">{{ post.content }}</p>
          </div>

          <!-- Post Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="flex items-center gap-6">
              <button 
                @click="likePost(post.id)" 
                :class="isPostLiked(post) ? 'text-red-600' : 'text-slate-600 hover:text-red-600'"
                class="flex items-center transition-colors duration-200"
              >
                <svg 
                  class="w-5 h-5 mr-2" 
                  :fill="isPostLiked(post) ? 'currentColor' : 'none'" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                {{ post.likes }}
              </button>
              <button 
                @click="toggleComments(post.id)"
                class="flex items-center text-slate-600 hover:text-blue-600 transition-colors duration-200"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                {{ post.comments ? post.comments.length : 0 }} Comments
              </button>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-slate-500">{{ post.timestamp }}</span>
              <div v-if="canEditPost(post)" class="flex gap-2">
                <button @click="editPost(post)" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Edit
                </button>
                <button @click="deletePost(post)" class="text-red-600 hover:text-red-800 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div v-if="showComments[post.id]" class="mt-6 pt-4 border-t border-gray-100">
            <!-- Existing Comments -->
            <div v-if="post.comments && post.comments.length > 0" class="space-y-4 mb-6">
              <div 
                v-for="comment in post.comments" 
                :key="comment.id"
                class="bg-gray-50 rounded-lg p-4"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {{ comment.author.charAt(0) }}
                    </div>
                    <div>
                      <h4 class="font-semibold text-slate-900 text-sm">{{ comment.author }}</h4>
                      <p class="text-xs text-slate-500">{{ comment.timestamp }}</p>
                    </div>
                  </div>
                  <div v-if="canEditComment(comment)" class="flex gap-2">
                    <button @click="editComment(comment)" class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                      Edit
                    </button>
                    <button @click="deleteComment(post.id, comment.id)" class="text-red-600 hover:text-red-800 text-xs font-medium">
                      Delete
                    </button>
                  </div>
                </div>
                
                <!-- Comment Content -->
                <div v-if="editingComment && editingComment.id === comment.id">
                  <textarea 
                    v-model="editCommentForm"
                    rows="3" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm mb-3"
                    placeholder="Edit your comment..."
                  ></textarea>
                  <div class="flex gap-2">
                    <button 
                      @click="saveCommentEdit"
                      class="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-3 py-1 rounded-lg transition-colors duration-200 text-xs"
                    >
                      Save
                    </button>
                    <button 
                      @click="cancelCommentEdit"
                      class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-3 py-1 rounded-lg transition-colors duration-200 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <p v-else class="text-slate-700 text-sm">{{ comment.content }}</p>
              </div>
            </div>

            <!-- Add Comment Form -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-semibold text-slate-900 mb-3">Add a Comment</h4>
              <div class="space-y-3">
                <textarea 
                  v-model="newComment"
                  rows="3" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  placeholder="Share your thoughts..."
                ></textarea>
                <div class="flex justify-end">
                  <button 
                    @click="addComment(post.id)"
                    class="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Post Modal -->
      <div v-if="editingPost" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
          <h3 class="text-xl font-semibold text-slate-900 mb-4">Edit Post</h3>
          
          <form @submit.prevent="saveEdit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select v-model="editForm.category" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Title</label>
              <input 
                v-model="editForm.title" 
                type="text" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your post title"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Content</label>
              <textarea 
                v-model="editForm.content" 
                rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Share your thoughts, questions, or experiences..."
              ></textarea>
            </div>
            
            <div class="flex gap-3">
              <button type="submit" class="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
                Save Changes
              </button>
              <button type="button" @click="cancelEdit" class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors duration-200">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-8">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
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
            :class="currentPage === page ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'"
            class="px-3 py-2 rounded-lg transition-colors duration-200"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-lg transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      <!-- Pagination Info -->
      <div v-if="totalPages > 1" class="text-center text-sm text-gray-500 mt-2">
        Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, filteredPosts.length) }} of {{ filteredPosts.length }} posts
      </div>

      <div v-if="filteredPosts.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📭</div>
        <h3 class="text-xl font-semibold text-slate-900 mb-2">No posts yet in this category</h3>
        <p class="text-slate-600 mb-6">Be the first to share your thoughts!</p>
        <button 
          @click="showNewPostForm = true"
          class="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
        >
          Create First Post
        </button>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

