<template>
  <div class="ai-chat-container">
    <!-- Chat Toggle Button (when closed) -->
    <div v-if="!isOpen" class="fixed bottom-6 right-6 z-50">
      <button 
        @click="toggleChat" 
        class="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        title="Chat with AI Assistant"
      >
        <!-- Modern AI Chat Icon -->
        <svg class="w-7 h-7 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <!-- Online indicator -->
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
      </button>
    </div>

    <!-- Chat Window (when open) -->
    <div v-if="isOpen" class="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 max-w-sm">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-white">AI Assistant</h3>
            <p class="text-sm text-blue-100">Online • Ready to help</p>
          </div>
        </div>
        <button 
          @click="toggleChat" 
          class="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 h-80">
        <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <p class="text-lg font-medium mb-2">Welcome to WorkCompass Agent!</p>
          <p class="text-sm">I can help you with job applications, interview prep, and career insights.</p>
        </div>

        <div v-for="message in messages" :key="message.id" class="flex" :class="message.sender === 'user' ? 'justify-end' : 'justify-start'">
          <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg" 
               :class="message.sender === 'user' 
                 ? 'bg-blue-500 text-white' 
                 : 'bg-gray-100 text-gray-800'">
            <div class="flex items-start space-x-2">
              <div v-if="message.sender === 'agent'" class="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm">{{ message.text }}</p>
                <p class="text-xs opacity-70 mt-1">{{ formatTime(message.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex justify-start">
          <div class="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-gray-200 p-4 bg-gray-50 rounded-b-2xl">
        <div class="flex space-x-2">
          <!-- Text Input -->
          <div class="flex-1 relative">
            <input 
              v-model="currentMessage" 
              @keypress.enter="sendMessage"
              :disabled="isLoading"
              :placeholder="userStore.user 
                ? 'Ask me about your applications, interview prep, or career advice...' 
                : 'Ask me about WorkCompass features, pricing, or job search tips...'"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <!-- Send Button -->
          <button 
            @click="sendMessage" 
            :disabled="!currentMessage.trim() || isLoading"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <svg v-if="!isLoading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
            <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useUserStore } from '../store/userStore.js';
import { aiChat, guestChat } from '../../services/aiService.js';

const userStore = useUserStore();

// Component state
const isOpen = ref(false);
const messages = ref([]);
const currentMessage = ref('');
const isLoading = ref(false);
const isTyping = ref(false);
const messagesContainer = ref(null);

// Initialize with welcome message based on login status
onMounted(() => {
  if (userStore.user) {
    addMessage('agent', `Hello ${userStore.user.name}! I'm your WorkCompass AI agent. I can help you with job applications, interview preparation, career insights, and more. How can I assist you today?`);
  } else {
    addMessage('agent', 'Hello! I\'m the WorkCompass AI agent. I can help you learn about our platform, answer questions about job tracking, and provide career advice. What would you like to know?');
  }
});

// Cleanup on unmount
onUnmounted(() => {
  // No cleanup needed for basic chat
});

// Message management
const addMessage = (sender, text) => {
  const message = {
    id: Date.now() + Math.random(),
    sender,
    text,
    timestamp: new Date()
  };
  messages.value.push(message);
  scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Chat functionality
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isLoading.value) return;

  const messageText = currentMessage.value.trim();
  currentMessage.value = '';
  
  // Add user message
  addMessage('user', messageText);
  
  // Show typing indicator
  isTyping.value = true;
  
  try {
    isLoading.value = true;
    
    let response;
    
    if (userStore.user && userStore.token) {
      // Logged-in user: full AI chat with personalization
      response = await aiChat(messageText, {
        userId: userStore.user?.id,
        userRole: userStore.user?.role,
        timestamp: new Date().toISOString()
      }, userStore.token);
    } else {
      // Guest user: use backend guest chat endpoint
      response = await guestChat(messageText);
    }
    
    // Add AI response
    addMessage('agent', response.response);
    
  } catch (error) {
    console.error('Chat error:', error);
    addMessage('agent', 'Sorry, I encountered an error. Please try again.');
  } finally {
    isLoading.value = false;
    isTyping.value = false;
  }
};



// Toggle chat visibility
const toggleChat = () => {
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0,-8px,0);
  }
  70% {
    transform: translate3d(0,-4px,0);
  }
  90% {
    transform: translate3d(0,-2px,0);
  }
}

/* Custom scrollbar for messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
