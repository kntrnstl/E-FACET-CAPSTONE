<template>
  <StudentLayoutTesda active-page="assessment">
    <!-- Header Slots -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search assessments..." 
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
      <h1 class="text-3xl font-bold text-gray-800 mb-6">📝 Assessments & Exams</h1>

      <!-- Assessment Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Assessments</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">0</h3>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">📝</span>
            </div>
          </div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Completed</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">0</h3>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Pending</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">0</h3>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Average Score</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">0%</h3>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Tabs -->
      <div class="flex space-x-2 mb-6">
        <button class="px-4 py-2 rounded-md font-medium bg-blue-700 text-white">
          📋 All Assessments
        </button>
        <button class="px-4 py-2 rounded-md font-medium bg-gray-300 hover:bg-gray-400">
          🏆 Competency Exams
        </button>
        <button class="px-4 py-2 rounded-md font-medium bg-gray-300 hover:bg-gray-400">
          🔄 Post-Assessment
        </button>
      </div>

      <!-- Upcoming Assessments -->
      <div class="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg inline-block">
            ⏰ Upcoming Assessments
          </h2>
          <button class="text-blue-700 hover:text-blue-800 font-medium text-sm">
            View All →
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
            <thead class="bg-blue-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Assessment</th>
                <th class="py-3 px-4 text-left font-medium">Training</th>
                <th class="py-3 px-4 text-left font-medium">Type</th>
                <th class="py-3 px-4 text-left font-medium">Date & Time</th>
                <th class="py-3 px-4 text-left font-medium">Duration</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <!-- Table rows will be generated here -->
              <tr>
                <td colspan="6" class="py-8 text-center text-gray-500">
                  <div class="text-gray-400">
                    <span class="text-3xl mb-2 block">📅</span>
                    <p class="text-gray-500">No upcoming assessments</p>
                    <p class="text-sm text-gray-400 mt-1">Check back later for scheduled exams</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Completed Assessments -->
      <div class="bg-white p-6 rounded-xl shadow border border-gray-200 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg inline-block">
            ✅ Completed Assessments
          </h2>
          <button class="text-green-700 hover:text-green-800 font-medium text-sm">
            View All →
          </button>
        </div>

        <div class="space-y-4">
          <!-- Assessment Result Card -->
          <div class="border-2 border-green-200 rounded-xl p-4 bg-green-50 hover:bg-green-100 transition-colors">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-bold text-gray-800 text-lg">Electrical Safety Assessment</h3>
                <p class="text-sm text-gray-600 mt-1">Electrical Installation (EIM NCII)</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-green-700">85%</div>
                <div class="text-sm text-gray-600">Passing Score: 75%</div>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="bg-white p-3 rounded-lg">
                <p class="text-sm text-gray-600">Date Taken</p>
                <p class="font-semibold text-gray-800">Oct 20, 2025</p>
              </div>
              <div class="bg-white p-3 rounded-lg">
                <p class="text-sm text-gray-600">Duration</p>
                <p class="font-semibold text-gray-800">45 mins</p>
              </div>
              <div class="bg-white p-3 rounded-lg">
                <p class="text-sm text-gray-600">Questions</p>
                <p class="font-semibold text-gray-800">30 items</p>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-sm text-gray-600">
                Score: 25/30 • Status: <span class="text-green-600 font-medium">PASSED</span>
              </div>
              <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                View Results
              </button>
            </div>
          </div>
        </div>

        <div class="text-center py-8 text-gray-500">
          <div class="text-gray-400 mb-3">
            <span class="text-4xl">📝</span>
          </div>
          <p class="text-gray-500">No completed assessments yet</p>
          <p class="text-sm text-gray-400 mt-1">Complete your first assessment to see results here</p>
        </div>
      </div>

      <!-- Assessment Results Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Score Progress -->
        <div class="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 class="text-lg font-bold text-blue-800 mb-4">📈 Score Progress</h3>
          
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Electrical Safety</span>
                <span class="text-sm font-medium text-blue-700">85%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-blue-600 h-3 rounded-full" style="width: 85%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Tool Identification</span>
                <span class="text-sm font-medium text-green-700">92%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-green-600 h-3 rounded-full" style="width: 92%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-700">Safety Procedures</span>
                <span class="text-sm font-medium text-yellow-700">78%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div class="bg-yellow-600 h-3 rounded-full" style="width: 78%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Overview -->
        <div class="bg-white p-6 rounded-xl shadow border border-gray-200">
          <h3 class="text-lg font-bold text-blue-800 mb-4">🎯 Performance Overview</h3>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-700">🏆</span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Highest Score</p>
                  <p class="font-bold text-gray-800">92%</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-700">📊</span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Average Score</p>
                  <p class="font-bold text-gray-800">85%</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span class="text-yellow-700">🎯</span>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Passing Rate</p>
                  <p class="font-bold text-gray-800">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assessment Instructions -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <h3 class="text-lg font-bold text-blue-800 mb-4">ℹ️ Assessment Guidelines</h3>
        <ul class="space-y-2 text-gray-700">
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            All assessments must be completed within the scheduled time
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            A passing score of 75% or higher is required for competency certification
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            You may retake failed assessments after a 7-day waiting period
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            Technical issues during assessment? Contact your trainer immediately
          </li>
        </ul>
      </div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from './StudentLayoutTesda.vue'

export default {
  name: 'TesdaAssessment',
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
</style>