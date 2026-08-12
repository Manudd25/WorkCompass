import { computed, ref } from "vue";

const STORAGE_KEY = "theme";

/** Single global theme state shared by the entire app. */
const theme = ref("light");

function readPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "dark" || saved === "light") return saved;
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

function applyTheme(next) {
  const value = next === "dark" ? "dark" : "light";
  theme.value = value;
  document.documentElement.classList.toggle("dark", value === "dark");
  document.documentElement.dataset.theme = value;
  localStorage.setItem(STORAGE_KEY, value);
}

/** Call once at app boot (and from early HTML script for no-flash). */
export function initTheme() {
  applyTheme(readPreferredTheme());
}

export function useTheme() {
  // Keep Vue state in sync with the DOM root class on first use.
  theme.value = document.documentElement.classList.contains("dark") ? "dark" : "light";

  const isDark = computed(() => theme.value === "dark");

  const toggleTheme = () => {
    applyTheme(theme.value === "dark" ? "light" : "dark");
  };

  return {
    theme,
    isDark,
    toggleTheme,
    setTheme: applyTheme,
  };
}
