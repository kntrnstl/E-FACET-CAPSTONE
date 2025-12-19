// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminStudents from '../components/admin/AdminStudents.vue'
import AdminCertificates from '../components/admin/AdminCertificates.vue'
import StudentDashboard from '../components/student/StudentDashboard.vue'
import StudentAttendance from '../components/student/StudentAttendance.vue'

// Import other admin components (lazy loaded for better performance)
const AdminCourses = () => import('../components/admin/AdminCourses.vue')
const AdminSchedule = () => import('../components/admin/AdminSchedule.vue')
const AdminReports = () => import('../components/admin/AdminReports.vue')
const AdminMockExam = () => import('../components/admin/AdminMockExam.vue')
const AdminMessages = () => import('../components/admin/AdminMessages.vue')
const AdminSettings = () => import('../components/admin/AdminSettings.vue')

// Student routes configuration (lazy loaded for better performance)
const studentRoutes = [
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student-attendance',
    name: 'StudentAttendance',
    component: StudentAttendance,
    meta: { requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student-enroll',
    name: 'StudentEnroll',
    component: () => import('../components/student/StudentEnroll.vue'),
    meta: { requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student-course',
    name: 'StudentCourse',
    component: () => import('../components/student/StudentCourse.vue'),
    meta: { requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student-schedule',
    name: 'StudentSchedule',
    component: () => import('../components/student/StudentSchedule.vue'),
    meta: { requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student-quiz',
    name: 'StudentMockExam',
    component: () => import('../components/student/StudentMockExam.vue'),
    meta: { requiresAuth: true, requiresStudent: true }
  },
  {
  path: '/student-certificate',
  name: 'StudentCertificate',
  component: () => import('../components/student/StudentCertificate.vue'),
  meta: { requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student-messages',
    name: 'StudentMessages',
    component: () => import('../components/student/StudentMessages.vue'),
    meta: { requiresAuth: true, requiresStudent: true }
  },
  {
    path: '/student-settings',
    name: 'StudentSettings',
    component: () => import('../components/student/StudentSettings.vue'),
    meta: { requiresAuth: true, requiresStudent: true }
  }

]

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    name: 'Login',
    component: Login 
  },
  { 
    path: '/signup', 
    name: 'Signup',
    component: Signup 
  },
  // Admin routes
  { 
    path: '/admin-dashboard', 
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-students', 
    name: 'AdminStudents',
    component: AdminStudents,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-certificates', 
    name: 'AdminCertificates',
    component: AdminCertificates,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-courses', 
    name: 'AdminCourses',
    component: AdminCourses,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-schedule', 
    name: 'AdminSchedule',
    component: AdminSchedule,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-reports', 
    name: 'AdminReports',
    component: AdminReports,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-mockexam', 
    name: 'AdminMockExam',
    component: AdminMockExam,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-messages', 
    name: 'AdminMessages',
    component: AdminMessages,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admin-settings', 
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Student routes
  ...studentRoutes,
  // Catch-all route - redirect based on user role
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/login' 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication and role-based access
router.beforeEach((to, from, next) => {
  console.log('🚦 Router guard triggered');
  console.log('🚦 Navigating from:', from.path, 'to:', to.path);
  
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : {};
  
  console.log('🚦 User data from localStorage:', user);
  console.log('🚦 User role:', user.role);
  console.log('🚦 User ID:', user.user_id);
  console.log('🚦 Route meta:', to.meta);
  
  // Skip auth check for login and signup pages
  if (to.path === '/login' || to.path === '/signup') {
    console.log('🚦 Public route, allowing access');
    return next();
  }
  
  if (to.meta.requiresAuth) {
    if (!user.user_id) {
      console.log('🚦 No user ID found, redirecting to login');
      next('/login');
    } else if (to.meta.requiresAdmin && user.role !== 'admin') {
      console.log('🚦 Route requires admin, but user role is:', user.role);
      // If user is student/user but trying to access admin page
      if (user.role === 'student' || user.role === 'user') {
        console.log('🚦 Redirecting student/user to student dashboard');
        next('/student-dashboard');
      } else {
        console.log('🚦 Unknown role, redirecting to login');
        next('/login');
      }
    } else if (to.meta.requiresStudent && (user.role !== 'student' && user.role !== 'user')) {
      console.log('🚦 Route requires student, but user role is:', user.role);
      // If user is admin but trying to access student page
      if (user.role === 'admin') {
        console.log('🚦 Redirecting admin to admin dashboard');
        next('/admin-dashboard');
      } else {
        console.log('🚦 Unknown role, redirecting to login');
        next('/login');
      }
    } else {
      console.log('🚦 Access granted to:', to.path);
      next();
    }
  } else {
    console.log('🚦 Route does not require auth, allowing access');
    next();
  }
})

export default router