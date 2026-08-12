import { createRouter, createWebHashHistory } from "vue-router";
import { useUserStore } from "../store/userStore.js";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import Dashboard from "../views/Dashboard.vue";
import LandingPage from "../views/LandingPage.vue";
import Applications from "../views/Applications.vue";
import NewApplication from "../views/NewApplication.vue";
import ApplicationDetails from "../views/ApplicationDetails.vue";
import Rejections from "../views/Rejections.vue";
import Candidates from "../views/Candidates.vue";
import CandidateDetails from "../views/CandidateDetails.vue";
import Settings from "../views/Settings.vue";
import Calendar from "../views/Calendar.vue";
import Feedback from "../views/Feedback.vue";
import WellnessMonitoring from "../views/WellnessMonitoring.vue";
import WellnessResources from "../views/WellnessResources.vue";
import DiscussionForum from "../views/DiscussionForum.vue";
import Analytics from "../views/Analytics.vue";
import CareerCompass from "../views/CareerCompass.vue";

const routes = [
  { path: "/", name: "LandingPage", component: LandingPage },
  { path: "/login", name: "Login", component: Login },
  { path: "/signup", name: "Signup", component: Signup },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
  { path: "/dashboard", name: "Dashboard", component: Dashboard, meta: { requiresAuth: true } },
  { path: "/applications", name: "Applications", component: Applications, meta: { requiresAuth: true } },
  { path: "/applications/new", name: "NewApplication", component: NewApplication, meta: { requiresAuth: true } },
  { path: "/applications/:id", name: "ApplicationDetails", component: ApplicationDetails, meta: { requiresAuth: true } },
  { path: "/rejections", name: "Rejections", component: Rejections, meta: { requiresAuth: true } },
  { path: "/candidates", name: "Candidates", component: Candidates, meta: { requiresAuth: true } },
  { path: "/candidates/:id", name: "CandidateDetails", component: CandidateDetails, meta: { requiresAuth: true } },
  { path: "/settings", name: "Settings", component: Settings, meta: { requiresAuth: true } },
  { path: "/calendar", name: "Calendar", component: Calendar, meta: { requiresAuth: true } },
  { path: "/feedback", name: "Feedback", component: Feedback },
  { path: "/analytics", name: "Analytics", component: Analytics, meta: { requiresAuth: true } },
  { path: "/career-compass", name: "CareerCompass", component: CareerCompass, meta: { requiresAuth: true } },
  // Personal wellbeing tracking — login required
  { path: "/wellness/monitoring", name: "WellnessMonitoring", component: WellnessMonitoring, meta: { requiresAuth: true } },
  // Public wellness resources — no auth
  { path: "/wellness/resources", name: "WellnessResources", component: WellnessResources, meta: { public: true } },
  { path: "/community/forum", name: "DiscussionForum", component: DiscussionForum, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to) => {
  if (!to.meta?.requiresAuth) return true;

  const userStore = useUserStore();
  if (userStore.token) return true;

  return {
    path: "/login",
    query: { redirect: to.fullPath },
  };
});

export default router;
