<template>
  <StudentLayoutTesda active-page="schedule">
    <!-- Header Slot -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search schedule..."
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </template>

    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-blue-800 mb-6">📅 My Training Schedule</h2>

      <!-- Schedule Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Reservations</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">
                0
              </h3>
            </div>
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">📅</span>
            </div>
          </div>
        </div>

        <div class="bg-green-100 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">This Week</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">
                0
              </h3>
            </div>
            <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">🗓️</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Next Week</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">
                0
              </h3>
            </div>
            <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">⏭️</span>
            </div>
          </div>
        </div>

        <div class="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Confirmed</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">
                  0
              </h3>
            </div>
            <div class="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar & Schedule Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Calendar -->
        <div class="lg:col-span-1 bg-white rounded-xl shadow border border-gray-200 p-4">
          <div class="flex justify-between items-center mb-4">
            <button
              class="p-2 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
              title="Previous month"
            >
              &lt;
            </button>

            <h3 class="font-semibold text-blue-800 text-center">
              <!-- Month and year will go here -->
            </h3>

            <button
              class="p-2 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-colors"
              title="Next month"
            >
              &gt;
            </button>
          </div>

          <div class="grid grid-cols-7 text-center text-sm font-medium text-gray-700 gap-1">
            <div
              v-for="day in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
              :key="day"
              class="font-bold text-blue-800 py-2 text-xs"
            >
              {{ day }}
            </div>

            <!-- Blank days will be generated here -->
            
            <!-- Calendar days will be generated here -->
          </div>

          <!-- Legend -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span class="text-xs text-gray-600">Has reservation (CONFIRMED)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full"></div>
              <span class="text-xs text-gray-600">Selected day</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Classes -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-md font-semibold text-blue-800">Upcoming / Selected Day</h3>
            <p class="text-sm text-gray-600 mt-1">
              <!-- Selected date message will go here -->
            </p>
          </div>

          <div class="p-8 text-center">
            <div class="text-gray-400 mb-3">
              <span class="text-4xl">📅</span>
            </div>
            <p class="text-gray-500">Select a date to view reservations</p>
          </div>
        </div>
      </div>

      <!-- Schedule Table -->
      <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-md font-semibold text-blue-800">My Reserved Training Schedule</h3>
          <div class="flex items-center gap-2">
            <select
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Courses</option>
              <!-- Course options will go here -->
            </select>

            <select
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="ACTIVE">ACTIVE</option>
            </select>

            <button
              class="p-1 text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Refresh schedule"
            >
              ↻
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-blue-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Date</th>
                <th class="py-3 px-4 text-left font-medium">Time</th>
                <th class="py-3 px-4 text-left font-medium">Training</th>
                <th class="py-3 px-4 text-left font-medium">Trainer</th>
                <th class="py-3 px-4 text-left font-medium">Reservation Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <!-- Table rows will be generated here -->
              
              <tr>
                <td colspan="6" class="py-8 text-center text-gray-500">
                  <div class="text-gray-400">
                    <span class="text-3xl mb-2 block">📅</span>
                    <p class="text-gray-500">No schedule found</p>
                    <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or search</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <div>Showing <!-- count --> of <!-- total --> reservations</div>
          <div class="flex items-center gap-2">
            <button
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span class="px-2">Page <!-- current --> of <!-- total --></span>
            <button
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from "./StudentLayoutTesda.vue";

export default {
  name: "TesdaStudentSchedule",
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
</style>