import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Signup from "../views/Signup.vue";
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
// OAuthCallback not needed when only Google (GSI) is used

const routes = [
    { path: "/", name: "LandingPage", component: LandingPage },
    { path: "/login", name: "Login", component: Login },
    { path: "/signup", name: "Signup", component: Signup },
    { path: "/dashboard", name: "Dashboard", component: Dashboard },
        { path: "/applications", name: "Applications", component: Applications },
        { path: "/applications/new", name: "NewApplication", component: NewApplication },
        { path: "/applications/:id", name: "ApplicationDetails", component: ApplicationDetails },
        { path: "/rejections", name: "Rejections", component: Rejections },
    { path: "/candidates", name: "Candidates", component: Candidates },
    { path: "/candidates/:id", name: "CandidateDetails", component: CandidateDetails },
    { path: "/settings", name: "Settings", component: Settings },
    { path: "/calendar", name: "Calendar", component: Calendar },
    
  ];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
