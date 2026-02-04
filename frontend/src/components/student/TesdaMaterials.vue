<template>
  <StudentLayoutTesda active-page="materials">
    <!-- Header Slots -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search modules, guides..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </template>
    
    <template #header-right>
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-white text-blue-800 rounded-full flex items-center justify-center text-xl font-bold">
          {{ getUserInitial() }}
        </div>
      </div>
    </template>

    <!-- Main Content -->
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">📚 Learning Materials</h1>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Modules</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">0</h3>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">📚</span>
            </div>
          </div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Downloaded</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">0</h3>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">⬇️</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Recent Updates</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">0</h3>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">🆕</span>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Video Guides</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">0</h3>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">🎥</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Training</label>
          <select class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Trainings</option>
            <!-- Training options will go here -->
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
          <select class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="module">Modules</option>
            <option value="video">Videos</option>
            <option value="guide">Guides</option>
            <option value="quiz">Quizzes</option>
          </select>
        </div>

        <div class="flex items-end gap-2">
          <button class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
            Clear Filters
          </button>
        </div>
      </div>

      <!-- Learning Materials Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Module Card -->
        <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-700 text-2xl">📄</span>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Module 1</h3>
                  <p class="text-sm text-gray-600">Introduction to Electrical Safety</p>
                </div>
              </div>
              <span class="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Module
              </span>
            </div>
            
            <div class="text-sm text-gray-700 mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-gray-500">📚</span>
                <span>Electrical Installation (EIM NCII)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500">📅</span>
                <span>Updated: Oct 15, 2025</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-600">
                5.2 MB • PDF
              </div>
              <button class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Download
              </button>
            </div>
          </div>
        </div>

        <!-- Video Card -->
        <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span class="text-red-700 text-2xl">🎥</span>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Safety Procedures</h3>
                  <p class="text-sm text-gray-600">Hand Tool Demonstration</p>
                </div>
              </div>
              <span class="text-xs font-medium bg-red-100 text-red-800 px-2 py-1 rounded">
                Video
              </span>
            </div>
            
            <div class="text-sm text-gray-700 mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-gray-500">🔧</span>
                <span>Automotive Servicing (AS NCII)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500">⏱️</span>
                <span>Duration: 15:30 mins</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-600">
                24.5 MB • MP4
              </div>
              <button class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                Watch
              </button>
            </div>
          </div>
        </div>

        <!-- Quiz Card -->
        <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-green-700 text-2xl">📝</span>
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">Assessment Quiz</h3>
                  <p class="text-sm text-gray-600">Electrical Components</p>
                </div>
              </div>
              <span class="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                Quiz
              </span>
            </div>
            
            <div class="text-sm text-gray-700 mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-gray-500">⚡</span>
                <span>Electrical Installation (EIM NCII)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-500">❓</span>
                <span>20 Questions</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-600">
                45 mins • Online
              </div>
              <button class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="text-center py-12 mt-8">
        <div class="text-gray-400 mb-3">
          <span class="text-4xl">📚</span>
        </div>
        <p class="text-gray-500">No learning materials available yet</p>
        <p class="text-sm text-gray-400 mt-1">Materials will appear here once uploaded by your trainer</p>
      </div>

      <!-- Recent Downloads -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <h3 class="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
          <span>⬇️</span>
          Recent Downloads
        </h3>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span class="text-blue-700">📄</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">Module 1: Safety Guidelines</p>
                <p class="text-xs text-gray-600">Downloaded: Oct 20, 2025</p>
              </div>
            </div>
            <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from './StudentLayoutTesda.vue'

export default {
  name: 'TesdaLearningMaterials',
  components: {
    StudentLayoutTesda
  },
  data() {
    return {
      studentName: 'Student'
    }
  },
  mounted() {
    // Load user data
    this.loadUserData()
  },
  methods: {
    loadUserData() {
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
    getUserInitial() {
      return this.studentName.charAt(0).toUpperCase()
    }
  }
}
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.transition-shadow {
  transition: box-shadow 0.3s ease;
}
</style>