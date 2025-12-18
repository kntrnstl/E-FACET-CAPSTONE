<!-- components/student/StudentDashboard.vue -->
<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Main Content -->
    <main class="p-6 ml-64"> <!-- Adjust ml-64 based on your sidebar width -->
      <!-- Header -->
      <header class="flex justify-between items-center bg-green-800 text-white px-6 py-3 rounded-xl mb-6">
        <input 
          type="text" 
          placeholder="Search..." 
          class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
          v-model="searchQuery"
        >
        <div class="w-10 h-10 bg-white text-green-800 rounded-full flex items-center justify-center text-xl">👤</div>
      </header>

      <!-- Welcome Section -->
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Welcome, {{ studentName }}!</h1>

      <div class="grid grid-cols-3 gap-4">
        <!-- Progress Overview -->
        <div class="col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 class="bg-green-700 text-white font-semibold px-3 py-1 rounded mb-3 inline-block">
            Progress Overview:
          </h2>
          <div class="space-y-4">
            <div v-for="course in progressOverview" :key="course.name">
              <p class="font-medium text-gray-700 mb-1">{{ course.name }}</p>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div 
                  class="h-3 rounded-full" 
                  :class="course.colorClass"
                  :style="{ width: course.percentage + '%' }"
                ></div>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ course.percentage }}% completed</p>
            </div>
          </div>
        </div>

        <!-- Enroll in Course -->
        <div class="bg-white p-4 rounded-lg shadow">
          <h2 class="bg-green-700 text-white font-semibold px-3 py-1 rounded mb-3 inline-block">
            Enroll in Course:
          </h2>
          <div class="space-y-3">
            <div 
              v-for="course in availableCourses" 
              :key="course.id"
              class="flex items-center justify-between bg-gray-100 p-2 rounded"
            >
              <p class="font-medium text-gray-700">{{ course.name }}</p>
              <button 
                @click="enrollInCourse(course.id)"
                class="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 transition"
                :disabled="course.enrolled"
              >
                {{ course.enrolled ? 'Enrolled' : 'Enroll' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Upcoming Sessions -->
        <div class="col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 class="bg-green-700 text-white font-semibold px-3 py-1 rounded mb-3 inline-block">
            Upcoming Sessions:
          </h2>
          <table class="w-full border border-gray-200 text-sm">
            <thead>
              <tr class="bg-gray-100 text-left">
                <th class="py-2 px-3 border-b">Session Title</th>
                <th class="py-2 px-3 border-b">Date & Time</th>
                <th class="py-2 px-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="session in upcomingSessions" 
                :key="session.id"
                class="hover:bg-gray-50"
              >
                <td class="py-2 px-3 border-b">{{ session.title }}</td>
                <td class="py-2 px-3 border-b">{{ formatDateTime(session.dateTime) }}</td>
                <td class="py-2 px-3 border-b">
                  <button 
                    @click="handleSessionAction(session)"
                    class="text-blue-600 hover:underline"
                  >
                    {{ session.actionText }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Course Progress -->
        <div class="bg-white p-4 rounded-lg shadow text-center">
          <h2 class="bg-green-700 text-white font-semibold px-3 py-1 rounded mb-3 inline-block">
            Course Progress:
          </h2>
          <div class="flex justify-center gap-6 mt-4">
            <div 
              v-for="(course, index) in courseProgress" 
              :key="index"
              class="relative w-20 h-20"
            >
              <div 
                class="absolute inset-0 rounded-full border-8 border-t-gray-200 animate-spin-slow"
                :class="course.borderColor"
              ></div>
              <span class="absolute inset-0 flex items-center justify-center font-semibold text-gray-700 text-sm">
                {{ course.percentage }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'StudentDashboard',
  data() {
    return {
      searchQuery: '',
      studentName: 'John',
      progressOverview: [
        { name: 'Traffic Rules', percentage: 80, colorClass: 'bg-green-600' },
        { name: 'Driving Simulation', percentage: 45, colorClass: 'bg-yellow-500' },
        { name: 'Safety Orientation', percentage: 20, colorClass: 'bg-blue-500' }
      ],
      availableCourses: [
        { id: 1, name: 'First Aid Basics', enrolled: false },
        { id: 2, name: 'Traffic Law Review', enrolled: false },
        { id: 3, name: 'Defensive Driving', enrolled: true }
      ],
      upcomingSessions: [
        { id: 1, title: 'Traffic Rules', dateTime: '2025-10-25T14:00:00', actionText: 'View Details' },
        { id: 2, title: 'Driving Simulation', dateTime: '2025-10-28T09:00:00', actionText: 'Join' },
        { id: 3, title: 'Safety Orientation', dateTime: '2025-11-02T13:30:00', actionText: 'View Details' }
      ],
      courseProgress: [
        { percentage: 80, borderColor: 'border-green-600' },
        { percentage: 45, borderColor: 'border-yellow-500' }
      ]
    }
  },
  methods: {
    formatDateTime(dateTime) {
      const date = new Date(dateTime)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) + ' – ' + date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    },
    enrollInCourse(courseId) {
      const course = this.availableCourses.find(c => c.id === courseId)
      if (course && !course.enrolled) {
        course.enrolled = true
        // Here you would make an API call to enroll the student
        console.log(`Enrolling in course: ${course.name}`)
        
        // Simulate API call
        // this.$api.post(`/enroll/${courseId}`)
        //   .then(response => {
        //     console.log('Enrollment successful', response)
        //   })
        //   .catch(error => {
        //     console.error('Enrollment failed', error)
        //     course.enrolled = false
        //   })
      }
    },
    handleSessionAction(session) {
      if (session.actionText === 'Join') {
        // Handle join session
        console.log('Joining session:', session.title)
        // Redirect to session or open modal
      } else {
        // Handle view details
        console.log('Viewing details for:', session.title)
        // Show session details modal or redirect
      }
    }
  }
}
</script>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 5s linear infinite;
}
</style>