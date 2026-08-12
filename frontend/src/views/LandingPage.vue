<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import { useTheme } from "../composables/useTheme.js";
import AIAgent from "../components/AIAgent.vue";
import Footer from "../components/Footer.vue";

const router = useRouter();
const userStore = useUserStore();
const { isDark, toggleTheme } = useTheme();

const handleLogout = () => {
  userStore.logout();
  router.push("/");
};

const isScrolled = ref(false);

const onScroll = () => {
  isScrolled.value = window.scrollY > 24;
};

onMounted(() => {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <section id="home" class="relative isolate flex min-h-screen min-h-[100svh] flex-col overflow-hidden">
      <!-- Background video layer -->
      <div class="pointer-events-none absolute inset-0 -z-20 bg-slate-100 dark:bg-slate-900">
        <video
          autoplay
          muted
          loop
          playsinline
          class="h-full w-full object-contain object-center md:object-cover"
        >
          <source src="/videos/background-video.mp4" type="video/mp4" />
        </video>
      </div>

      <!-- Readability overlays (theme-aware, subtle) -->
      <div class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white/50 via-white/35 to-slate-50/95 dark:from-slate-900/60 dark:via-slate-900/45 dark:to-slate-900/95" />

      <!-- Navbar -->
      <header
        class="z-30 border-b transition-all duration-300"
        :class="isScrolled
          ? 'border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/80'
          : 'border-transparent bg-transparent'"
      >
        <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <RouterLink to="/" class="text-xl font-bold text-indigo-600 dark:text-indigo-300">WorkCompass</RouterLink>
          <nav class="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex dark:text-slate-200">
            <a href="#home" class="hover:text-indigo-600 dark:hover:text-indigo-300">Home</a>
            <RouterLink to="/wellness/resources" class="hover:text-indigo-600 dark:hover:text-indigo-300">Wellbeing</RouterLink>
            <a href="#community" class="hover:text-indigo-600 dark:hover:text-indigo-300">Community</a>
            <RouterLink to="/feedback" class="hover:text-indigo-600 dark:hover:text-indigo-300">About</RouterLink>
          </nav>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="toggleTheme"
              :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              class="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-slate-300/80 bg-white/80 text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white/70 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-900/70"
            >
              <span v-if="isDark" aria-hidden="true">☀️</span>
              <span v-else aria-hidden="true">🌙</span>
            </button>
            <RouterLink v-if="!userStore.user" to="/login" class="h-10 inline-flex items-center rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-slate-800/60">Login</RouterLink>
            <RouterLink v-if="!userStore.user" to="/signup" class="h-10 inline-flex items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">Get Started</RouterLink>
            <RouterLink v-else to="/dashboard" class="h-10 inline-flex items-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">Dashboard</RouterLink>
            <button v-if="userStore.user" class="h-10 inline-flex items-center rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-white/60 dark:text-slate-200 dark:hover:bg-slate-800/60" @click="handleLogout">Logout</button>
          </div>
        </div>
      </header>

      <!-- Hero content -->
      <div class="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-8 text-center sm:px-6 lg:px-8">
        <p class="mb-3 text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">Track -> Analyze -> Decide</p>
        <h1 class="max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Your job search, organized.
        </h1>
        <p class="mt-5 max-w-2xl text-lg text-slate-700 dark:text-slate-200">
          Stay on top of every application, understand what is working, and make confident next-step decisions without losing momentum.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <RouterLink :to="userStore.user ? '/dashboard' : '/signup'" class="h-11 inline-flex items-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700">
            {{ userStore.user ? "Open Dashboard" : "Get Started" }}
          </RouterLink>
          <RouterLink :to="userStore.user ? '/applications' : '/login?redirect=/applications'" class="h-11 inline-flex items-center rounded-lg border border-slate-300 bg-white/85 px-6 text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800">
            Learn More
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Smooth transition into preserved lower structure -->
    <main class="relative z-10 border-t border-slate-200/70 bg-slate-50 pt-14 dark:border-slate-700/70 dark:bg-slate-900">
      <!-- Mental Health & Wellness section (restored structure, refined styling) -->
      <section id="wellbeing" class="px-4 py-14 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
          <div class="mx-auto mb-12 max-w-3xl text-center">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Job Search Wellbeing Support</h2>
            <p class="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Support your search with consistent check-ins and practical resources designed to keep your energy, confidence, and focus sustainable.
            </p>
          </div>

          <div class="grid gap-8 md:grid-cols-2">
            <RouterLink :to="userStore.user ? '/wellness/monitoring' : '/login?redirect=/wellness/monitoring'" class="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-slate-900/30">
              <img src="/images/wellnessmonitoring.jpg" alt="Wellness Monitoring" class="h-52 w-full rounded-xl object-cover" />
              <div class="mt-5 flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Wellness Monitoring</h3>
              </div>
              <p class="mt-3 text-slate-600 dark:text-slate-300">
                Track mood, stress, and overall momentum with lightweight check-ins you can keep up consistently.
              </p>
              <ul class="mt-4 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                <li>• Personalized wellbeing questionnaire</li>
                <li>• Daily check-ins and trends</li>
                <li>• Simple report export</li>
              </ul>
              <span class="mt-5 inline-block text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-300 dark:group-hover:text-indigo-200">
                {{ userStore.user ? 'Open tracking →' : 'Sign in to track →' }}
              </span>
            </RouterLink>

            <RouterLink to="/wellness/resources" class="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-slate-900/30">
              <img src="/images/wellnessresource.jpg" alt="Wellness Resources" class="h-52 w-full rounded-xl object-cover" />
              <div class="mt-5 flex items-center gap-4">
                <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500 text-white">
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Wellness Resources</h3>
              </div>
              <p class="mt-3 text-slate-600 dark:text-slate-300">
                Access practical guides, exercises, and curated support materials that help you stay steady through the search.
              </p>
              <ul class="mt-4 space-y-1 text-sm text-slate-500 dark:text-slate-400">
                <li>• Guided breathing and mindfulness</li>
                <li>• Stress reset routines</li>
                <li>• Self-management playbooks</li>
              </ul>
              <span class="mt-5 inline-block text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-300 dark:group-hover:text-indigo-200">Explore resources →</span>
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Community section (preserved structural role) -->
      <section id="community" class="border-y border-slate-200 bg-gradient-to-b from-white to-slate-100/70 px-4 py-14 sm:px-6 lg:px-8 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
        <div class="mx-auto max-w-6xl">
          <div class="mx-auto mb-10 max-w-3xl text-center">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">Community Forum</h2>
            <p class="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Share your experience, ask practical questions, and learn from others navigating similar career decisions.
            </p>
          </div>

          <RouterLink :to="userStore.user ? '/community/forum' : '/login?redirect=/community/forum'" class="group mx-auto block max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-slate-900/30">
            <img src="/images/community.jpg" alt="Community discussions" class="h-56 w-full rounded-xl object-cover" />
            <div class="mt-6 flex items-center gap-4">
              <div class="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500 text-white">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              </div>
              <h3 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Community Discussions</h3>
            </div>
            <p class="mt-4 text-slate-600 dark:text-slate-300">
              Participate in themed discussions, exchange practical interview advice, and build professional connections.
            </p>
            <div class="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p>• Weekly topic threads</p>
              <p>• Q&A with experienced professionals</p>
              <p>• Peer support and accountability</p>
            </div>
            <span class="mt-6 inline-block text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 dark:text-indigo-300 dark:group-hover:text-indigo-200">Join discussion →</span>
          </RouterLink>
        </div>
      </section>
    </main>

    <Footer />

    <div class="fixed bottom-6 right-6 z-50">
      <AIAgent />
    </div>
  </div>
</template>
