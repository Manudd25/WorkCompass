<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { useTheme } from "../composables/useTheme.js";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { isDark, toggleTheme } = useTheme();

const props = defineProps({
  navItems: {
    type: Array,
    default: () => [],
  },
  secondaryItems: {
    type: Array,
    default: () => [],
  },
});

const isActive = computed(() => (path) => route.path.startsWith(path));

const logout = () => {
  userStore.logout();
  router.push("/");
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 dark:text-slate-100">
    <div class="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 lg:hidden">
      <RouterLink
        to="/"
        class="text-xl font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
      >
        WorkCompass
      </RouterLink>
    </div>
    <div class="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <aside class="hidden w-64 shrink-0 self-start sticky top-6 min-h-[calc(100vh-3rem)] rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 p-4 lg:flex lg:flex-col">
        <RouterLink
          to="/"
          class="mb-5 block text-xl font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          WorkCompass
        </RouterLink>
        <p class="mb-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Navigate</p>
        <nav class="space-y-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="block rounded-lg px-3 py-2 text-sm font-medium"
            :class="isActive(item.to) ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <div v-if="secondaryItems.length" class="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Secondary</p>
          <nav class="space-y-1">
            <RouterLink
              v-for="item in secondaryItems"
              :key="item.to"
              :to="item.to"
              class="block rounded-lg px-3 py-2 text-sm"
              :class="isActive(item.to) ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'"
            >
              {{ item.label }}
            </RouterLink>
          </nav>
        </div>

        <!-- Bottom actions -->
        <div class="mt-auto border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2">
          <button
            type="button"
            @click="toggleTheme"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-700 transition"
          >
            <span v-if="isDark" aria-hidden="true">☀️</span>
            <span v-else aria-hidden="true">🌙</span>
            {{ isDark ? 'Light Mode' : 'Dark Mode' }}
          </button>
          <button
            @click="logout"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </aside>
      <div class="min-w-0 flex-1">
        <slot />
      </div>
    </div>
  </div>
</template>
