<template>
  <StudentLayoutTesda active-page="dashboard">
    <!-- Header Slots -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search modules, trainings..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        v-model="searchQuery"
      >
    </template>
    
    <template #header-right>
      <div class="flex items-center gap-4">
        <div class="relative">
          <button @click="toggleNotifications" class="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <span class="text-xl">🔔</span>
          </button>
          <div v-if="hasNotifications" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <div class="w-10 h-10 bg-white text-blue-800 rounded-full flex items-center justify-center text-xl font-bold">
          {{ getUserInitial() }}
        </div>
      </div>
    </template>
    
    <!-- Main Content -->
    <div>
      <!-- Welcome Section with User Name -->
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Welcome, {{ studentName }}!</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Progress Overview -->
        <div class="md:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-4 inline-block">
            Training Progress
          </h2>
          <div class="space-y-4">
            <!-- Progress bars will be dynamically inserted here -->
          </div>
        </div>

        <!-- Available Trainings -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-4 inline-block">
            Available Trainings
          </h2>
          <div class="space-y-3">
            <!-- Training cards will be dynamically inserted here -->
          </div>
        </div>

        <!-- Upcoming Sessions -->
        <div class="md:col-span-2 bg-white p-6 rounded-xl shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg inline-block">
              Upcoming Sessions
            </h2>
            <button @click="viewAllSessions" class="text-blue-700 hover:text-blue-800 font-medium text-sm">
              View All →
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
              <thead class="bg-blue-800 text-white">
                <tr>
                  <th class="py-3 px-4 text-left font-medium">Session Title</th>
                  <th class="py-3 px-4 text-left font-medium">Trainer</th>
                  <th class="py-3 px-4 text-left font-medium">Date & Time</th>
                  <th class="py-3 px-4 text-left font-medium">Status</th>
                  <th class="py-3 px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <!-- Table rows will be dynamically inserted here -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-4 inline-block">
            Quick Stats
          </h2>
          
          <!-- Progress Circles -->
          <div class="flex justify-center gap-6 mb-6">
            <!-- Progress circles will be dynamically inserted here -->
          </div>
          
          <!-- Stats Cards -->
          <div class="space-y-3">
            <!-- Stats cards will be dynamically inserted here -->
          </div>
        </div>
      </div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from './StudentLayoutTesda.vue'

export default {
  name: 'TesdaStudentDashboard',
  components: {
    StudentLayoutTesda
  },
  data() {
    return {
      searchQuery: '',
      studentName: 'Student',
      hasNotifications: false
    }
  },
  mounted() {
    // Load user data from localStorage or API
    this.loadUserData()
  },
  methods: {
    loadUserData() {
      // Try to load from localStorage (similar to your other dashboard)
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          this.studentName = user.name || user.username || 'Student'
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    },
    toggleNotifications() {
      this.hasNotifications = !this.hasNotifications
    },
    getUserInitial() {
      return this.studentName.charAt(0).toUpperCase()
    },
    viewAllSessions() {
      // To be implemented
      console.log('View all sessions')
    }
  }
}
</script>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Smooth transitions */
button, input, select {
  transition: all 0.2s ease;
}

/* Animation classes */
.progress-bar {
  transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-circle {
  transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:scale-110:hover {
  transform: scale(1.10);
}
</style>