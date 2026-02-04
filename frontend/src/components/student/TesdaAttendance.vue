<template>
  <StudentLayoutTesda active-page="attendance">
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search attendance..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </template>

    <!-- Main Content -->
    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-blue-800">✅ Training Attendance</h2>
        <div class="text-sm text-gray-600">
          Last updated: <!-- Last updated time will go here -->
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p class="text-sm text-gray-600">Total Trainings</p>
          <h3 class="text-2xl font-bold text-blue-800 mt-1">
            0
          </h3>
        </div>
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <p class="text-sm text-gray-600">Present</p>
          <h3 class="text-2xl font-bold text-green-800 mt-1">
            0
          </h3>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p class="text-sm text-gray-600">Absent</p>
          <h3 class="text-2xl font-bold text-yellow-800 mt-1">
            0
          </h3>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p class="text-sm text-gray-600">Attendance Rate</p>
          <h3 class="text-2xl font-bold text-purple-800 mt-1">
            0
          </h3>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Training</label>
          <select 
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Trainings</option>
            <!-- Training options will go here -->
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select 
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <input 
            type="month" 
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
        </div>

        <div class="flex items-end gap-2">
          <button 
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Clear
          </button>
          <button 
            class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Export
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
        <p class="mt-3 text-gray-600">Loading attendance records...</p>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-bold text-blue-800">Attendance Records</h3>
          <div class="text-sm text-gray-600">
            Showing <!-- filtered count --> of <!-- total count --> records
          </div>
        </div>
        
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-blue-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Date</th>
              <th class="py-3 px-4 text-left font-medium">Training</th>
              <th class="py-3 px-4 text-left font-medium">Time</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Remarks</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Table rows will be generated here -->
            
            <tr>
              <td colspan="6" class="py-8 text-center text-gray-500">
                <div class="text-gray-400">
                  <span class="text-3xl mb-2 block">📊</span>
                  <p class="text-gray-500">No attendance records found</p>
                  <p class="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Attendance Summary -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-blue-800">📈 Attendance Summary</h3>
          <button 
            class="text-blue-700 hover:text-blue-800 text-sm font-medium"
          >
            ↻ Refresh
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-md font-medium text-gray-800 mb-3">Monthly Overview</h4>
            <div class="space-y-2">
              <!-- Monthly summary items will go here -->
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-700">Month Year</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">Rate%</span>
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full bg-blue-500" style="width: 0%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="text-md font-medium text-gray-800 mb-3">Status Distribution</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Present</span>
                </div>
                <span class="text-sm font-medium">0 records</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Late</span>
                </div>
                <span class="text-sm font-medium">0 records</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Absent</span>
                </div>
                <span class="text-sm font-medium">0 records</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Excused</span>
                </div>
                <span class="text-sm font-medium">0 records</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • 0 records
        </div>
        <div class="flex gap-1">
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">← Previous</button>
          <button class="px-3 py-1 bg-blue-700 text-white rounded text-sm">1</button>
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next →</button>
        </div>
      </div>
    </div>

    <!-- Submit Excuse Modal (Hidden by default) -->
    <!-- <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-blue-800">Submit Excuse</h3>
            <button 
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 mb-2">
                For: <span class="font-medium">Training Name</span> on 
                <span class="font-medium">Date</span>
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Excuse Type</label>
              <select 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>Select excuse type</option>
                <option value="medical">Medical</option>
                <option value="family">Family Emergency</option>
                <option value="personal">Personal</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea 
                rows="3"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Please provide details for your absence..."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Supporting Document (Optional)</label>
              <input 
                type="file"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                accept=".pdf,.jpg,.jpeg,.png"
              >
              <p class="text-xs text-gray-500 mt-1">Upload PDF, JPG, or PNG file (max 5MB)</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              class="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm font-medium"
            >
              Submit Excuse
            </button>
          </div>
        </div>
      </div>
    </div> -->
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from "./StudentLayoutTesda.vue";

export default {
  name: "TesdaStudentAttendance",
  components: { StudentLayoutTesda },

  data() {
    return {};
  }
};
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
</style>