// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import AdminDashboard from '../components/admin/AdminDashboard.vue'
import AdminStudents from '../components/admin/AdminStudents.vue'
import AdminCertificates from '../components/admin/AdminCertificates.vue'

// Import other components (lazy loaded for better performance)
const AdminCourses = () => import('../components/admin/AdminCourses.vue')
const AdminSchedule = () => import('../components/admin/AdminSchedule.vue')
const AdminReports = () => import('../components/admin/AdminReports.vue')
const AdminMockExam = () => import('../components/admin/AdminMockExam.vue')
const AdminMessages = () => import('../components/admin/AdminMessages.vue')
const AdminSettings = () => import('../components/admin/AdminSettings.vue')

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
  // Add routes for all sidebar links
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
  // Add a catch-all route for 404
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/admin-dashboard' 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!user.user_id) {
      // Not logged in, redirect to login
      next('/login')
    } else if (to.meta.requiresAdmin && user.role !== 'admin') {
      // Not admin, redirect to appropriate page
      next('/student-dashboard')
    } else {
      // All good, proceed
      next()
    }
  } else {
    // Public route, allow access
    next()
  }
})

export default router