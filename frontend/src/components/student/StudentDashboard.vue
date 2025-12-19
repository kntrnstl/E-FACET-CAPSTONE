<template>
  <StudentLayout active-page="dashboard">
    <!-- Header Slots -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
        v-model="searchQuery"
      >
    </template>
    
    <template #header-right>
      <div class="flex items-center gap-4">
        <div class="relative">
          <button @click="toggleNotifications" class="p-2 hover:bg-green-700 rounded-full">
            <span class="text-xl">🔔</span>
          </button>
          <div v-if="hasNotifications" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
        <div class="w-10 h-10 bg-white text-green-800 rounded-full flex items-center justify-center text-xl font-bold">
          {{ getUserInitial() }}
        </div>
      </div>
    </template>
    
    <!-- Main Content -->
    <div>
      <!-- Welcome Section -->
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Welcome, {{ studentName }}!</h1>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Progress Overview with Animation -->
        <div class="md:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-4 inline-block">
            Progress Overview
          </h2>
          <div class="space-y-4">
            <div 
              v-for="course in progressOverview" 
              :key="course.name"
              class="progress-item"
            >
              <div class="flex justify-between mb-1">
                <p class="font-medium text-gray-700">{{ course.name }}</p>
                <span class="text-sm text-gray-500">{{ course.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  class="h-3 rounded-full progress-bar"
                  :class="course.colorClass"
                  :style="{ width: '0%' }"
                  :data-width="course.percentage"
                  ref="progressBars"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enroll in Course -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-4 inline-block">
            Enroll in Course
          </h2>
          <div class="space-y-3">
            <div 
              v-for="course in availableCourses" 
              :key="course.id"
              class="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div>
                <p class="font-medium text-gray-700">{{ course.name }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ course.description }}</p>
              </div>
              <button 
                @click="enrollInCourse(course.id)"
                :class="[
                  'text-sm px-4 py-2 rounded-lg transition-all duration-300',
                  course.enrolled 
                    ? 'bg-gray-300 text-gray-700 cursor-not-allowed transform scale-95' 
                    : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
                ]"
                :disabled="course.enrolled"
              >
                {{ course.enrolled ? 'Enrolled ✓' : 'Enroll' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Upcoming Sessions Table (New format) -->
        <div class="md:col-span-2 bg-white p-6 rounded-xl shadow">
          <div class="flex justify-between items-center mb-4">
            <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg inline-block">
              Upcoming Sessions
            </h2>
            <button @click="viewAllSessions" class="text-green-700 hover:text-green-800 font-medium text-sm">
              View All →
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
              <thead class="bg-green-800 text-white">
                <tr>
                  <th class="py-3 px-4 text-left font-medium">Session Title</th>
                  <th class="py-3 px-4 text-left font-medium">Instructor</th>
                  <th class="py-3 px-4 text-left font-medium">Date & Time</th>
                  <th class="py-3 px-4 text-left font-medium">Status</th>
                  <th class="py-3 px-4 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(session, index) in filteredSessions" 
                  :key="session.id" 
                  class="border-b hover:bg-gray-50 transition-colors"
                  :style="{ animationDelay: `${index * 0.1}s` }"
                >
                  <td class="py-3 px-4">
                    <div class="font-medium text-gray-800">{{ session.title }}</div>
                    <div class="text-xs text-gray-500 mt-1">{{ session.instructor }}</div>
                  </td>
                  <td class="py-3 px-4">{{ session.instructor }}</td>
                  <td class="py-3 px-4">
                    <div>{{ formatDate(session.dateTime) }}</div>
                    <div class="text-xs text-gray-500">{{ formatTime(session.dateTime) }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <span :class="statusClass(session.status)">
                      {{ session.status === 'upcoming' ? 'Upcoming' : 
                         session.status === 'ongoing' ? 'Ongoing' : 'Completed' }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <button 
                      @click="handleSessionAction(session)"
                      :class="[
                        'text-sm font-medium transition-all duration-300',
                        session.actionText === 'Join' 
                          ? 'text-green-600 hover:text-green-800' 
                          : 'text-blue-600 hover:text-blue-800'
                      ]"
                    >
                      {{ session.actionText }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Course Progress & Quick Stats -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-4 inline-block">
            Course Progress
          </h2>
          
          <!-- Progress Circles with Animation -->
          <div class="flex justify-center gap-6 mb-6">
            <div 
              v-for="(course, index) in courseProgress" 
              :key="index"
              class="relative w-20 h-20 progress-circle-container"
            >
              <svg class="w-20 h-20 transform -rotate-90">
                <circle 
                  cx="40" 
                  cy="40" 
                  r="35" 
                  stroke="currentColor" 
                  :stroke-width="6" 
                  fill="transparent" 
                  class="text-gray-200"
                />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="35" 
                  stroke="currentColor" 
                  :stroke-width="6" 
                  fill="transparent" 
                  :stroke-dasharray="220"
                  :stroke-dashoffset="220"
                  :class="course.borderColor"
                  class="progress-circle"
                  :data-percentage="course.percentage"
                  ref="progressCircles"
                />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center font-bold text-gray-800 text-lg progress-percentage">
                {{ course.percentage }}%
              </span>
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <span class="text-green-700 text-xl">📚</span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Courses Taken</p>
                  <p class="font-bold text-gray-800">{{ stats.coursesTaken }}</p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <span class="text-blue-700 text-xl">✅</span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Attendance Rate</p>
                  <p class="font-bold text-gray-800">{{ stats.attendanceRate }}%</p>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                  <span class="text-yellow-700 text-xl">⭐</span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Average Score</p>
                  <p class="font-bold text-gray-800">{{ stats.averageScore }}/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentDashboard',
  components: {
    StudentLayout
  },
  data() {
    return {
      searchQuery: '',
      studentName: 'John',
      hasNotifications: true,
      progressOverview: [
        { name: 'Traffic Rules', percentage: 80, colorClass: 'bg-green-600' },
        { name: 'Driving Simulation', percentage: 45, colorClass: 'bg-yellow-500' },
        { name: 'Safety Orientation', percentage: 20, colorClass: 'bg-blue-500' }
      ],
      availableCourses: [
        { id: 1, name: 'First Aid Basics', description: 'Emergency response training', enrolled: false },
        { id: 2, name: 'Traffic Law Review', description: 'Latest traffic regulations', enrolled: false },
        { id: 3, name: 'Defensive Driving', description: 'Advanced driving techniques', enrolled: true }
      ],
      upcomingSessions: [
        { id: 1, title: 'Traffic Rules', instructor: 'Prof. Smith', dateTime: '2025-10-25T14:00:00', status: 'upcoming', actionText: 'View Details' },
        { id: 2, title: 'Driving Simulation', instructor: 'Coach Johnson', dateTime: '2025-10-28T09:00:00', status: 'ongoing', actionText: 'Join' },
        { id: 3, title: 'Safety Orientation', instructor: 'Dr. Williams', dateTime: '2025-11-02T13:30:00', status: 'upcoming', actionText: 'View Details' },
        { id: 4, title: 'Basic Driving', instructor: 'Mr. Cruz', dateTime: '2025-11-05T08:00:00', status: 'upcoming', actionText: 'View Details' },
        { id: 5, title: 'Traffic Rules', instructor: 'Ms. Reyes', dateTime: '2025-11-08T13:00:00', status: 'upcoming', actionText: 'View Details' }
      ],
      courseProgress: [
        { percentage: 80, borderColor: 'text-green-600' },
        { percentage: 45, borderColor: 'text-yellow-500' }
      ],
      stats: {
        coursesTaken: 5,
        attendanceRate: 92,
        averageScore: 85
      }
    }
  },
  computed: {
    filteredSessions() {
      if (!this.searchQuery) return this.upcomingSessions;
      
      const query = this.searchQuery.toLowerCase();
      return this.upcomingSessions.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.instructor.toLowerCase().includes(query) ||
        session.status.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    // Load student data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        this.studentName = user.name || user.username || 'John'
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
    
    // Initialize animations
    this.$nextTick(() => {
      this.animateProgressBars()
      this.animateProgressCircles()
    })
  },
  methods: {
    formatDate(dateTime) {
      const date = new Date(dateTime)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    },
    formatTime(dateTime) {
      const date = new Date(dateTime)
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    },
    statusClass(status) {
      return {
        'text-green-600 font-semibold': status === 'ongoing',
        'text-yellow-600 font-semibold': status === 'upcoming',
        'text-gray-600 font-semibold': status === 'completed'
      };
    },
    enrollInCourse(courseId) {
      const course = this.availableCourses.find(c => c.id === courseId)
      if (course && !course.enrolled) {
        course.enrolled = true
        console.log(`Enrolling in course: ${course.name}`)
      }
    },
    handleSessionAction(session) {
      if (session.actionText === 'Join') {
        console.log('Joining session:', session.title)
      } else {
        console.log('Viewing details for:', session.title)
      }
    },
    toggleNotifications() {
      this.hasNotifications = false
      console.log('Notifications clicked')
    },
    getUserInitial() {
      return this.studentName.charAt(0).toUpperCase()
    },
    viewAllSessions() {
      console.log('Viewing all sessions')
      // Implement navigation to schedule page
    },
    
    // Animation methods
    animateProgressBars() {
      const progressBars = this.$refs.progressBars
      if (progressBars) {
        progressBars.forEach((bar, index) => {
          const width = this.progressOverview[index]?.percentage || 0
          setTimeout(() => {
            bar.style.width = width + '%'
          }, index * 200) // Stagger the animations
        })
      }
    },
    
    animateProgressCircles() {
      const progressCircles = this.$refs.progressCircles
      if (progressCircles) {
        progressCircles.forEach((circle, index) => {
          const percentage = this.courseProgress[index]?.percentage || 0
          const circumference = 220 // 2 * π * r (r = 35)
          const offset = circumference - (circumference * percentage) / 100
          
          // Set initial state
          circle.style.strokeDashoffset = circumference
          
          // Animate to final state
          setTimeout(() => {
            circle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
            circle.style.strokeDashoffset = offset
          }, index * 300) // Stagger the animations
        })
      }
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

/* Progress Bar Animation */
.progress-bar {
  transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: 0%;
}

/* Progress Item Animation */
.progress-item {
  opacity: 0;
  transform: translateY(10px);
  animation: fadeInUp 0.5s ease forwards;
}

.progress-item:nth-child(1) { animation-delay: 0.1s; }
.progress-item:nth-child(2) { animation-delay: 0.2s; }
.progress-item:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Progress Circle Animation */
.progress-circle {
  transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-circle-container {
  opacity: 0;
  transform: scale(0.8);
  animation: scaleIn 0.6s ease forwards;
}

.progress-circle-container:nth-child(1) { animation-delay: 0.1s; }
.progress-circle-container:nth-child(2) { animation-delay: 0.3s; }

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Progress Percentage Animation */
.progress-percentage {
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
  animation-delay: 0.5s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Table Row Animation */
tr {
  opacity: 0;
  transform: translateX(-10px);
  animation: slideInRight 0.4s ease forwards;
}

tr:nth-child(1) { animation-delay: 0.1s; }
tr:nth-child(2) { animation-delay: 0.2s; }
tr:nth-child(3) { animation-delay: 0.3s; }
tr:nth-child(4) { animation-delay: 0.4s; }
tr:nth-child(5) { animation-delay: 0.5s; }

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Smooth transitions for all interactive elements */
button, input, select {
  transition: all 0.2s ease;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:scale-110:hover {
  transform: scale(1.10);
}
</style>