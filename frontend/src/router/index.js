// router/index.js
import { createRouter, createWebHistory } from "vue-router";

// ================================
// LANDING
// ================================
import Landing from "../views/Landing.vue";

// ================================
// AUTH
// ================================
import Login from "../components/Login.vue";
import Signup from "../components/Signup.vue";

// ================================
// ADMIN
// ================================
import AdminDashboard from "../components/admin/AdminDashboard.vue";
import AdminStudents from "../components/admin/AdminStudents.vue";
import AdminCertificates from "../components/admin/AdminCertificates.vue";

// Admin components (lazy loaded)
const AdminCourses = () => import("../components/admin/AdminCourses.vue");
const AdminInstructors = () =>
  import("../components/admin/AdminInstructors.vue");
const AdminSchedule = () => import("../components/admin/AdminSchedule.vue");
const AdminReports = () => import("../components/admin/AdminReports.vue");
const AdminMockExam = () => import("../components/admin/AdminMockExam.vue");
const AdminMessages = () => import("../components/admin/AdminMessages.vue");
const AdminSettings = () => import("../components/admin/AdminSettings.vue");

// ✅ Admin Reservations (lazy loaded)
const AdminReservations = () =>
  import("../components/admin/AdminReservations.vue");

// ================================
// STUDENT (DRIVING)
// ================================
import StudentDashboard from "../components/student/StudentDashboard.vue";
import StudentAttendance from "../components/student/StudentAttendance.vue";

// Student routes configuration (Driving)
const studentRoutes = [
  {
    path: "/student-dashboard",
    name: "StudentDashboard",
    component: StudentDashboard,
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-enroll",
    name: "StudentEnroll",
    component: () => import("../components/student/StudentEnroll.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-schedule",
    name: "StudentSchedule",
    component: () => import("../components/student/StudentSchedule.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-quiz",
    name: "StudentMockExam",
    component: () => import("../components/student/StudentMockExam.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-certificate",
    name: "StudentCertificate",
    component: () => import("../components/student/StudentCertificate.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-messages",
    name: "StudentMessages",
    component: () => import("../components/student/StudentMessages.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-settings",
    name: "StudentSettings",
    component: () => import("../components/student/StudentSettings.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
];

// ================================
// TESDA STUDENT ROUTES
// ================================
const tesdaRoutes = [
  {
    path: "/tesda-dashboard",
    name: "TesdaDashboard",
    component: () => import("../components/student/TesdaDashboard.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-enrollment",
    name: "TesdaEnrollment",
    component: () => import("../components/student/TesdaEnrollment.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-requirements",
    name: "TesdaRequirements",
    component: () => import("../components/student/TesdaRequirements.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-schedule",
    name: "TesdaSchedule",
    component: () => import("../components/student/TesdaSchedule.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-attendance",
    name: "TesdaAttendance",
    component: () => import("../components/student/TesdaAttendance.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-materials",
    name: "TesdaMaterials",
    component: () => import("../components/student/TesdaMaterials.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-assessment",
    name: "TesdaAssessment",
    component: () => import("../components/student/TesdaAssessment.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-certificate",
    name: "TesdaCertificate",
    component: () => import("../components/student/TesdaCertificate.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-messages",
    name: "TesdaMessages",
    component: () => import("../components/student/TesdaMessages.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/tesda-settings",
    name: "TesdaSettings",
    component: () => import("../components/student/TesdaSettings.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
];

// ================================
// ROUTES
// ================================
const routes = [
  // ✅ Landing as homepage
  { path: "/", name: "Landing", component: Landing },

  // Auth
  { path: "/login", name: "Login", component: Login },
  { path: "/signup", name: "Signup", component: Signup },

  // Admin routes
  {
    path: "/admin-dashboard",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-students",
    name: "AdminStudents",
    component: AdminStudents,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-reservations",
    name: "AdminReservations",
    component: AdminReservations,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-certificates",
    name: "AdminCertificates",
    component: AdminCertificates,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-courses",
    name: "AdminCourses",
    component: AdminCourses,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-instructors",
    name: "AdminInstructors",
    component: AdminInstructors,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-schedule",
    name: "AdminSchedule",
    component: AdminSchedule,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-reports",
    name: "AdminReports",
    component: AdminReports,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-mockexam",
    name: "AdminMockExam",
    component: AdminMockExam,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-messages",
    name: "AdminMessages",
    component: AdminMessages,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin-settings",
    name: "AdminSettings",
    component: AdminSettings,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // Student (Driving)
  ...studentRoutes,

  // Student (TESDA)
  ...tesdaRoutes,

  // Catch-all
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ================================
// NAVIGATION GUARD
// ================================
router.beforeEach((to, from, next) => {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : {};

  // ✅ Public routes
  if (to.path === "/" || to.path === "/login" || to.path === "/signup") {
    return next();
  }

  // Only protect routes that require auth
  if (to.meta.requiresAuth) {
    if (!user.user_id) return next("/login");

    // helper: where students should go
    const studentHome =
      user.track === "tesda" ? "/tesda-dashboard" : "/student-dashboard";

    // ✅ Admin guard
    if (to.meta.requiresAdmin && user.role !== "admin") {
      if (user.role === "student" || user.role === "user")
        return next(studentHome);
      return next("/login");
    }

    // ✅ Student guard (accept 'student' and 'user')
    if (
      to.meta.requiresStudent &&
      user.role !== "student" &&
      user.role !== "user"
    ) {
      if (user.role === "admin") return next("/admin-dashboard");
      return next("/login");
    }

    // ✅ Prevent wrong portal for students/users
    if (user.role === "student" || user.role === "user") {
      const isTesdaRoute = to.path.startsWith("/tesda-");
      const isDrivingRoute = to.path.startsWith("/student-");

      if (user.track === "tesda" && isDrivingRoute)
        return next("/tesda-dashboard");
      if (user.track === "driving" && isTesdaRoute)
        return next("/student-dashboard");
    }

    return next();
  }

  return next();
});

export default router;
