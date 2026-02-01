// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Signup from "../components/Signup.vue";

import AdminDashboard from "../components/admin/AdminDashboard.vue";
import AdminStudents from "../components/admin/AdminStudents.vue";
import AdminCertificates from "../components/admin/AdminCertificates.vue";

import StudentDashboard from "../components/student/StudentDashboard.vue";
import StudentAttendance from "../components/student/StudentAttendance.vue";

// Admin components (lazy loaded)
const AdminCourses = () => import("../components/admin/AdminCourses.vue");
const AdminInstructors = () =>
  import("../components/admin/AdminInstructors.vue"); // ✅ NEW
const AdminSchedule = () => import("../components/admin/AdminSchedule.vue");
const AdminReports = () => import("../components/admin/AdminReports.vue");
const AdminMockExam = () => import("../components/admin/AdminMockExam.vue");
const AdminMessages = () => import("../components/admin/AdminMessages.vue");
const AdminSettings = () => import("../components/admin/AdminSettings.vue");

// ✅ NEW: Admin Reservations (lazy loaded)
const AdminReservations = () =>
  import("../components/admin/AdminReservations.vue");

// Student routes configuration
const studentRoutes = [
  {
    path: "/student-dashboard",
    name: "StudentDashboard",
    component: StudentDashboard,
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-attendance",
    name: "StudentAttendance",
    component: StudentAttendance,
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-enroll",
    name: "StudentEnroll",
    component: () => import("../components/student/StudentEnroll.vue"),
    meta: { requiresAuth: true, requiresStudent: true },
  },
  {
    path: "/student-course",
    name: "StudentCourse",
    component: () => import("../components/student/StudentCourse.vue"),
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

const routes = [
  { path: "/", redirect: "/login" },

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

  // ✅ NEW: Admin Reservations route
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

  // ✅ Admin Instructors route
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

  // Student routes
  ...studentRoutes,

  // Catch-all
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : {};

  // Public routes
  if (to.path === "/login" || to.path === "/signup") {
    return next();
  }

  if (to.meta.requiresAuth) {
    if (!user.user_id) return next("/login");

    if (to.meta.requiresAdmin && user.role !== "admin") {
      if (user.role === "student" || user.role === "user")
        return next("/student-dashboard");
      return next("/login");
    }

    if (
      to.meta.requiresStudent &&
      user.role !== "student" &&
      user.role !== "user"
    ) {
      if (user.role === "admin") return next("/admin-dashboard");
      return next("/login");
    }

    return next();
  }

  return next();
});

export default router;
