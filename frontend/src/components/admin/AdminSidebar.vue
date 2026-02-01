<template>
  <aside class="w-64 bg-white shadow-md flex flex-col justify-between rounded-r-2xl h-screen overflow-y-auto fixed">
    <div>
      <!-- Logo -->
      <div class="flex items-center gap-2 p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <img src="/facet-logo.png" alt="FACET Logo" class="w-10 h-10">
        <h1 class="font-bold text-green-900 text-lg">E-FACET Admin</h1>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 space-y-1">
        <router-link
          to="/admin-dashboard"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminDashboard'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📊 Dashboard</span>
        </router-link>

        <router-link
          to="/admin-students"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminStudents'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">👨‍🎓 Students</span>
        </router-link>

        <!-- ✅ NEW: Reservations -->
        <router-link
          to="/admin-reservations"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminReservations'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📌 Manage Reservations</span>
        </router-link>

        <router-link
          to="/admin-courses"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminCourses'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📚 Manage Courses</span>
        </router-link>

        <!-- ✅ Instructors -->
        <router-link
          to="/admin-instructors"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminInstructors'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">👨‍🏫 Manage Instructors</span>
        </router-link>

        <router-link
          to="/admin-schedule"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminSchedule'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🗓️ Schedule Management</span>
        </router-link>

        <router-link
          to="/admin-reports"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminReports'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📈 Analytics & Reports</span>
        </router-link>

        <router-link
          to="/admin-certificates"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminCertificates'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🎓 Certificates</span>
        </router-link>

        <router-link
          to="/admin-mockexam"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminMockExam'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🧠 Mock Exam Management</span>
        </router-link>

        <router-link
          to="/admin-messages"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminMessages'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">💬 Messages</span>
        </router-link>

        <router-link
          to="/admin-settings"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'AdminSettings'
              ? 'bg-green-100 text-green-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">⚙️ Settings</span>
        </router-link>
      </nav>
    </div>

    <!-- Bottom User Info + Logout -->
    <div class="sticky bottom-0 bg-white">
      <div class="border-t border-gray-200 p-4">
        <button
          @click="logout"
          class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
        >
          🚪 Logout
        </button>
      </div>

      <div class="bg-green-800 text-white p-4 flex items-center rounded-br-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white text-green-800 flex items-center justify-center rounded-full text-lg font-bold">
            {{ userInitial }}
          </div>
          <div>
            <p class="text-sm font-semibold">{{ user.fullname || 'Admin' }}</p>
            <p class="text-xs">{{ user.email || 'admin@gmail.com' }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'AdminSidebar',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      user: {}
    }
  },
  computed: {
    userInitial() {
      if (this.user.fullname) return this.user.fullname.charAt(0).toUpperCase()
      return 'A'
    }
  },
  mounted() {
    const userData = localStorage.getItem('user')
    if (userData) this.user = JSON.parse(userData)
  },
  methods: {
    async logout() {
      try {
        const response = await fetch('/api/auth/logout', { credentials: 'include' })
        const data = await response.json()

        if (data.status === 'success') {
          localStorage.removeItem('user')
          this.router.push('/login')
        }
      } catch (error) {
        console.error('Logout error:', error)
        localStorage.removeItem('user')
        this.router.push('/login')
      }
    }
  }
}
</script>

<style scoped>
aside {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.router-link-exact-active {
  background-color: #d1fae5;
  color: #047857;
  font-weight: 500;
}

.router-link-active:hover:not(.router-link-exact-active) {
  background-color: #f3f4f6;
}
</style>