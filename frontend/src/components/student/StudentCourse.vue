<template>
  <StudentLayout active-page="course">
    <!-- Header Slot -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search course..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
        v-model="searchQuery"
        @input="handleSearch"
      >
    </template>
    
    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-green-800 mb-6">📚 My Course</h2>

      <!-- Course Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-100 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Courses</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">{{ courseStats.totalCourses }}</h3>
            </div>
            <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">📚</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">In Progress</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ courseStats.inProgress }}</h3>
            </div>
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">⏳</span>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Completed</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ courseStats.completed }}</h3>
            </div>
            <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">✅</span>
            </div>
          </div>
        </div>
        
        <div class="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Avg. Progress</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ courseStats.averageProgress }}%</h3>
            </div>
            <div class="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Course Table -->
      <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-md font-semibold text-green-800">My Course List</h3>
          <div class="flex items-center gap-2">
            <select 
              v-model="filterStatus"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="ongoing">Ongoing</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
            <button 
              @click="refreshCourses"
              class="p-1 text-green-700 hover:text-green-800 hover:bg-green-50 rounded"
              title="Refresh"
            >
              ↻
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p class="mt-2 text-gray-600">Loading courses...</p>
        </div>

        <!-- Course Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Course Title</th>
                <th class="py-3 px-4 text-left font-medium">Instructor</th>
                <th class="py-3 px-4 text-left font-medium">Progress</th>
                <th class="py-3 px-4 text-left font-medium">Attendance</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="course in filteredCourses" 
                :key="course.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="font-medium text-gray-800">{{ course.title }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ course.code }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {{ getInitials(course.instructor) }}
                    </div>
                    <span class="text-sm">{{ course.instructor }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-500"
                        :class="getProgressColor(course.progress)"
                        :style="{ width: course.progress + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700">{{ course.progress }}%</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-500"
                        :class="getAttendanceColor(course.attendance)"
                        :style="{ width: course.attendance + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm font-medium text-gray-700">{{ course.attendance }}%</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(course.status)"
                  >
                    {{ formatStatus(course.status) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button 
                      @click="viewCourseDetails(course)"
                      class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button 
                      v-if="course.status === 'ongoing' || course.status === 'in-progress'"
                      @click="continueCourse(course)"
                      class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Continue
                    </button>
                    <button 
                      v-if="course.status === 'completed'"
                      @click="viewCertificate(course)"
                      class="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                    >
                      Certificate
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="filteredCourses.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500">
                  <div class="text-gray-400">
                    <span class="text-3xl mb-2 block">📚</span>
                    <p class="text-gray-500">No courses found</p>
                    <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or search</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer -->
        <div v-if="filteredCourses.length > 0" class="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {{ filteredCourses.length }} of {{ courses.length }} courses
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span class="px-2">Page {{ currentPage }} of {{ totalPages }}</span>
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-green-800">📝 Recent Course Activity</h3>
          <button 
            @click="viewAllActivity"
            class="text-green-700 hover:text-green-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center', getActivityIconClass(activity.type)]">
                <span class="text-white text-sm">{{ getActivityIcon(activity.type) }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ activity.course }} • {{ formatTimeAgo(activity.time) }}</p>
              </div>
            </div>
            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{{ activity.status }}</span>
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentCourse',
  components: {
    StudentLayout
  },
  data() {
    return {
      searchQuery: '',
      filterStatus: 'all',
      loading: false,
      currentPage: 1,
      itemsPerPage: 10,
      
      courseStats: {
        totalCourses: 5,
        inProgress: 2,
        completed: 2,
        averageProgress: 72
      },
      
      courses: [
        {
          id: 1,
          title: 'Basic Driving Course',
          code: 'DRV-101',
          instructor: 'Mr. Juan Dela Cruz',
          progress: 75,
          attendance: 90,
          status: 'ongoing',
          startDate: '2025-10-01',
          endDate: '2025-12-15'
        },
        {
          id: 2,
          title: 'Traffic Rules & Regulations',
          code: 'TRF-201',
          instructor: 'Atty. Maria Santos',
          progress: 100,
          attendance: 100,
          status: 'completed',
          startDate: '2025-09-01',
          endDate: '2025-10-30'
        },
        {
          id: 3,
          title: 'Vehicle Maintenance',
          code: 'VHC-102',
          instructor: 'Engr. Carlos Reyes',
          progress: 40,
          attendance: 70,
          status: 'in-progress',
          startDate: '2025-11-01',
          endDate: '2026-01-15'
        },
        {
          id: 4,
          title: 'Defensive Driving Techniques',
          code: 'DEF-301',
          instructor: 'Coach Miguel Torres',
          progress: 20,
          attendance: 85,
          status: 'ongoing',
          startDate: '2025-10-15',
          endDate: '2026-02-28'
        },
        {
          id: 5,
          title: 'Road Safety Fundamentals',
          code: 'RSF-202',
          instructor: 'Ms. Anna Lopez',
          progress: 100,
          attendance: 95,
          status: 'completed',
          startDate: '2025-08-01',
          endDate: '2025-09-30'
        },
        {
          id: 6,
          title: 'Night Driving Course',
          code: 'NDR-302',
          instructor: 'Mr. Roberto Lim',
          progress: 0,
          attendance: 0,
          status: 'pending',
          startDate: '2025-12-01',
          endDate: '2026-01-31'
        }
      ],
      
      recentActivity: [
        {
          id: 1,
          type: 'lesson',
          description: 'Completed Traffic Signs Module',
          course: 'TRF-201',
          time: '2025-11-15T14:30:00',
          status: 'Completed'
        },
        {
          id: 2,
          type: 'quiz',
          description: 'Passed Basic Driving Quiz',
          course: 'DRV-101',
          time: '2025-11-14T10:15:00',
          status: 'Score: 85%'
        },
        {
          id: 3,
          type: 'assignment',
          description: 'Submitted Vehicle Checklist',
          course: 'VHC-102',
          time: '2025-11-13T16:45:00',
          status: 'Submitted'
        },
        {
          id: 4,
          type: 'attendance',
          description: 'Attended Practical Session',
          course: 'DRV-101',
          time: '2025-11-12T08:30:00',
          status: 'Present'
        }
      ]
    }
  },
  computed: {
    filteredCourses() {
      let result = [...this.courses]
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(course => 
          course.title.toLowerCase().includes(query) ||
          course.code.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query)
        )
      }
      
      // Apply status filter
      if (this.filterStatus !== 'all') {
        result = result.filter(course => course.status === this.filterStatus)
      }
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      
      return result.slice(startIndex, endIndex)
    },
    
    totalPages() {
      const totalItems = this.courses.filter(course => {
        if (this.filterStatus !== 'all') {
          return course.status === this.filterStatus
        }
        return true
      }).length
      
      return Math.ceil(totalItems / this.itemsPerPage)
    }
  },
  methods: {
    handleSearch() {
      this.currentPage = 1 // Reset to first page when searching
    },
    
    refreshCourses() {
      this.loading = true
      // Simulate API call
      setTimeout(() => {
        this.loading = false
        console.log('Courses refreshed')
      }, 800)
    },
    
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    },
    
    getProgressColor(progress) {
      if (progress >= 80) return 'bg-green-500'
      if (progress >= 50) return 'bg-yellow-500'
      return 'bg-red-500'
    },
    
    getAttendanceColor(attendance) {
      if (attendance >= 90) return 'bg-green-500'
      if (attendance >= 75) return 'bg-yellow-500'
      return 'bg-red-500'
    },
    
    getStatusClass(status) {
      switch(status) {
        case 'ongoing': return 'bg-green-100 text-green-800'
        case 'in-progress': return 'bg-yellow-100 text-yellow-800'
        case 'completed': return 'bg-blue-100 text-blue-800'
        case 'pending': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    },
    
    formatStatus(status) {
      const statusMap = {
        'ongoing': 'Ongoing',
        'in-progress': 'In Progress',
        'completed': 'Completed',
        'pending': 'Pending'
      }
      return statusMap[status] || status
    },
    
    getActivityIcon(type) {
      const icons = {
        'lesson': '📖',
        'quiz': '🧠',
        'assignment': '📝',
        'attendance': '✅'
      }
      return icons[type] || '📌'
    },
    
    getActivityIconClass(type) {
      const classes = {
        'lesson': 'bg-blue-500',
        'quiz': 'bg-purple-500',
        'assignment': 'bg-yellow-500',
        'attendance': 'bg-green-500'
      }
      return classes[type] || 'bg-gray-500'
    },
    
    formatTimeAgo(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffHours < 1) return 'Just now'
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    },
    
    viewCourseDetails(course) {
      console.log('Viewing course details:', course.title)
      // Navigate to course details page
      // this.$router.push(`/student-course/${course.id}`)
    },
    
    continueCourse(course) {
      console.log('Continuing course:', course.title)
      // Navigate to course content
      // this.$router.push(`/student-course/${course.id}/continue`)
    },
    
    viewCertificate(course) {
      console.log('Viewing certificate for:', course.title)
      // Navigate to certificate page
      // this.$router.push(`/student-certificate/${course.id}`)
    },
    
    viewAllActivity() {
      console.log('Viewing all activity')
      // Navigate to activity page
      // this.$router.push('/student-activity')
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    }
  },
  mounted() {
    // Update course stats based on actual data
    this.courseStats.totalCourses = this.courses.length
    this.courseStats.inProgress = this.courses.filter(c => c.status === 'ongoing' || c.status === 'in-progress').length
    this.courseStats.completed = this.courses.filter(c => c.status === 'completed').length
    this.courseStats.averageProgress = Math.round(
      this.courses.reduce((sum, course) => sum + course.progress, 0) / this.courses.length
    )
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.transition-all {
  transition: all 0.3s ease-in-out;
}

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

/* Animation for progress bars */
@keyframes progressFill {
  from { width: 0; }
}

.bg-green-500, .bg-yellow-500, .bg-red-500 {
  animation: progressFill 1s ease-out;
}
</style>