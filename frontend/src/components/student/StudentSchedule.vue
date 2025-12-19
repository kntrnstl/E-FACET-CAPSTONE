<template>
  <StudentLayout active-page="schedule">
    <!-- Header Slot -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search schedule..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        v-model="searchQuery"
        @input="handleSearch"
      >
    </template>
    
    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-green-800 mb-6">📅 My Schedule</h2>

      <!-- Schedule Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-100 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Classes</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">{{ scheduleStats.totalClasses }}</h3>
            </div>
            <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">📅</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">This Week</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ scheduleStats.thisWeek }}</h3>
            </div>
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">🗓️</span>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Next Week</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ scheduleStats.nextWeek }}</h3>
            </div>
            <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">⏭️</span>
            </div>
          </div>
        </div>
        
        <div class="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Completed</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ scheduleStats.completed }}</h3>
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
              @click="prevMonth" 
              class="p-2 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors"
              title="Previous month"
            >
              &lt;
            </button>
            <h3 class="font-semibold text-green-800 text-center">
              {{ currentMonth }} {{ currentYear }}
            </h3>
            <button 
              @click="nextMonth" 
              class="p-2 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors"
              title="Next month"
            >
              &gt;
            </button>
          </div>
          
          <div class="grid grid-cols-7 text-center text-sm font-medium text-gray-700 gap-1">
            <div 
              v-for="day in daysOfWeek" 
              :key="day" 
              class="font-bold text-green-800 py-2 text-xs"
            >
              {{ day.substring(0, 2) }}
            </div>
            
            <div 
              v-for="day in blankDays" 
              :key="`blank-${day}`" 
              class="py-2"
            ></div>
            
            <div 
              v-for="day in daysInMonth" 
              :key="day" 
              :class="[
                'py-2 border rounded cursor-pointer text-sm transition-colors',
                hasScheduleForDay(day) 
                  ? 'bg-green-600 text-white font-semibold border-green-700' 
                  : selectedDay === day
                  ? 'bg-green-100 text-green-800 border-green-300 font-semibold'
                  : 'text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              ]"
              @click="selectDay(day)"
            >
              {{ day }}
            </div>
          </div>
          
          <!-- Legend -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 bg-green-600 rounded-full"></div>
              <span class="text-xs text-gray-600">Has schedule</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
              <span class="text-xs text-gray-600">Selected day</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Classes -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-md font-semibold text-green-800">Upcoming Classes</h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ selectedDay ? `Schedule for ${selectedMonth} ${selectedDay}, ${currentYear}` : 'Select a date to view schedule' }}
            </p>
          </div>
          
          <div v-if="upcomingClasses.length > 0" class="divide-y divide-gray-100">
            <div 
              v-for="classItem in upcomingClasses" 
              :key="classItem.id"
              class="p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">{{ getCourseIcon(classItem.course) }}</span>
                    <h4 class="font-medium text-gray-800">{{ classItem.course }}</h4>
                    <span 
                      class="px-2 py-0.5 text-xs rounded-full"
                      :class="getClassStatusClass(classItem.status)"
                    >
                      {{ classItem.status }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ classItem.description }}</p>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <span class="text-gray-500">👨‍🏫</span>
                      {{ classItem.instructor }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="text-gray-500">🕒</span>
                      {{ classItem.time }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="text-gray-500">📍</span>
                      {{ classItem.room }}
                    </span>
                  </div>
                </div>
                <button 
                  @click="viewClassDetails(classItem)"
                  class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="p-8 text-center text-gray-500">
            <div class="text-gray-400 mb-3">
              <span class="text-4xl">📅</span>
            </div>
            <p class="text-gray-500">No classes scheduled</p>
            <p class="text-sm text-gray-400 mt-1">Select another date or check for upcoming classes</p>
          </div>
        </div>
      </div>

      <!-- Schedule Table -->
      <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-md font-semibold text-green-800">Complete Schedule</h3>
          <div class="flex items-center gap-2">
            <select 
              v-model="filterCourse"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">All Courses</option>
              <option 
                v-for="course in uniqueCourses" 
                :key="course"
                :value="course"
              >
                {{ course }}
              </option>
            </select>
            <select 
              v-model="filterStatus"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              @click="refreshSchedule"
              class="p-1 text-green-700 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="Refresh schedule"
            >
              ↻
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p class="mt-2 text-gray-600">Loading schedule...</p>
        </div>

        <!-- Schedule Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Date</th>
                <th class="py-3 px-4 text-left font-medium">Time</th>
                <th class="py-3 px-4 text-left font-medium">Course</th>
                <th class="py-3 px-4 text-left font-medium">Instructor</th>
                <th class="py-3 px-4 text-left font-medium">Room</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="schedule in filteredSchedules" 
                :key="schedule.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="font-medium text-gray-800">{{ formatDate(schedule.date) }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ getDayName(schedule.date) }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                      🕒
                    </div>
                    <span class="font-medium">{{ schedule.time }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center" 
                         :class="getCourseColorClass(schedule.course)">
                      <span class="text-white text-sm">{{ getCourseIcon(schedule.course) }}</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-800">{{ schedule.course }}</div>
                      <div class="text-xs text-gray-500">{{ schedule.type }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {{ getInitials(schedule.instructor) }}
                    </div>
                    <span class="text-sm">{{ schedule.instructor }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs text-blue-700">
                      📍
                    </div>
                    <span class="text-sm">{{ schedule.room }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(schedule.status)"
                  >
                    {{ schedule.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button 
                      @click="viewScheduleDetails(schedule)"
                      class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      View
                    </button>
                    <button 
                      v-if="schedule.status === 'upcoming' || schedule.status === 'ongoing'"
                      @click="joinClass(schedule)"
                      class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Join
                    </button>
                    <button 
                      v-if="schedule.status === 'completed'"
                      @click="viewAttendance(schedule)"
                      class="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                    >
                      Attendance
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="filteredSchedules.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500">
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

        <!-- Table Footer -->
        <div v-if="filteredSchedules.length > 0" class="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {{ filteredSchedules.length }} of {{ schedules.length }} classes
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span class="px-2">Page {{ currentPage }} of {{ totalPages }}</span>
            <button 
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-green-800">🚀 Quick Actions</h3>
          <button 
            @click="exportSchedule"
            class="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            Export Schedule
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            @click="addToCalendar"
            class="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <span class="text-green-700 text-lg">📅</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">Add to Calendar</p>
                <p class="text-xs text-gray-500">Sync with Google/Outlook</p>
              </div>
            </div>
          </button>
          
          <button 
            @click="setReminders"
            class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <span class="text-blue-700 text-lg">⏰</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">Set Reminders</p>
                <p class="text-xs text-gray-500">Get class notifications</p>
              </div>
            </div>
          </button>
          
          <button 
            @click="viewClassMaterials"
            class="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <span class="text-yellow-700 text-lg">📚</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">Class Materials</p>
                <p class="text-xs text-gray-500">Download resources</p>
              </div>
            </div>
          </button>
          
          <button 
            @click="requestReschedule"
            class="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <span class="text-purple-700 text-lg">🔄</span>
              </div>
              <div>
                <p class="font-medium text-gray-800">Request Reschedule</p>
                <p class="text-xs text-gray-500">Change class timing</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentSchedule',
  components: {
    StudentLayout
  },
  data() {
    return {
      searchQuery: '',
      filterCourse: 'all',
      filterStatus: 'all',
      loading: false,
      currentPage: 1,
      itemsPerPage: 10,
      currentDate: new Date(),
      selectedDay: null,
      
      scheduleStats: {
        totalClasses: 0,
        thisWeek: 0,
        nextWeek: 0,
        completed: 0
      },
      
      schedules: [
        {
          id: 1,
          date: '2025-11-04',
          time: '8:00 AM - 10:00 AM',
          course: 'Basic Driving',
          type: 'Practical',
          instructor: 'Mr. Juan Santos',
          room: 'Room 101',
          description: 'Basic driving techniques and controls',
          status: 'completed'
        },
        {
          id: 2,
          date: '2025-11-06',
          time: '10:30 AM - 12:00 PM',
          course: 'Traffic Rules',
          type: 'Lecture',
          instructor: 'Ms. Maria Cruz',
          room: 'Room 102',
          description: 'Traffic signs and regulations',
          status: 'completed'
        },
        {
          id: 3,
          date: '2025-11-08',
          time: '1:00 PM - 3:00 PM',
          course: 'Simulation',
          type: 'Lab',
          instructor: 'Mr. Carlos Dela Cruz',
          room: 'Lab Room',
          description: 'Driving simulator practice',
          status: 'upcoming'
        },
        {
          id: 4,
          date: '2025-11-10',
          time: '9:00 AM - 11:00 AM',
          course: 'Safety Orientation',
          type: 'Seminar',
          instructor: 'Ms. Anna Reyes',
          room: 'Main Hall',
          description: 'Vehicle safety procedures',
          status: 'upcoming'
        },
        {
          id: 5,
          date: '2025-11-12',
          time: '2:00 PM - 4:00 PM',
          course: 'Road Signs',
          type: 'Lecture',
          instructor: 'Mr. Robert Garcia',
          room: 'Room 103',
          description: 'Understanding road signage',
          status: 'upcoming'
        },
        {
          id: 6,
          date: '2025-11-14',
          time: '11:00 AM - 1:00 PM',
          course: 'Night Driving',
          type: 'Practical',
          instructor: 'Mr. Daniel Tan',
          room: 'Room 104',
          description: 'Driving in low light conditions',
          status: 'ongoing'
        },
        {
          id: 7,
          date: '2025-11-16',
          time: '8:30 AM - 10:30 AM',
          course: 'Parallel Parking',
          type: 'Practical',
          instructor: 'Ms. Lisa Lim',
          room: 'Practical Area',
          description: 'Parking techniques and practice',
          status: 'upcoming'
        },
        {
          id: 8,
          date: '2025-11-18',
          time: '3:00 PM - 5:00 PM',
          course: 'Highway Driving',
          type: 'Simulation',
          instructor: 'Mr. James Wong',
          room: 'Simulator Room',
          description: 'Highway driving simulation',
          status: 'upcoming'
        }
      ],
      
      daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
    }
  },
  computed: {
    filteredSchedules() {
      let result = [...this.schedules]
      
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        result = result.filter(schedule => 
          schedule.course.toLowerCase().includes(query) ||
          schedule.instructor.toLowerCase().includes(query) ||
          schedule.room.toLowerCase().includes(query) ||
          schedule.description.toLowerCase().includes(query)
        )
      }
      
      // Apply course filter
      if (this.filterCourse !== 'all') {
        result = result.filter(schedule => schedule.course === this.filterCourse)
      }
      
      // Apply status filter
      if (this.filterStatus !== 'all') {
        result = result.filter(schedule => schedule.status === this.filterStatus)
      }
      
      // Apply pagination
      const startIndex = (this.currentPage - 1) * this.itemsPerPage
      const endIndex = startIndex + this.itemsPerPage
      
      return result.slice(startIndex, endIndex)
    },
    
    upcomingClasses() {
      if (!this.selectedDay) return []
      
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      const monthStr = month < 10 ? `0${month}` : `${month}`
      const dayStr = this.selectedDay < 10 ? `0${this.selectedDay}` : `${this.selectedDay}`
      const dateStr = `${year}-${monthStr}-${dayStr}`
      
      return this.schedules.filter(schedule => schedule.date === dateStr)
    },
    
    uniqueCourses() {
      return [...new Set(this.schedules.map(schedule => schedule.course))]
    },
    
    currentMonth() {
      return this.months[this.currentDate.getMonth()]
    },
    
    currentYear() {
      return this.currentDate.getFullYear()
    },
    
    selectedMonth() {
      return this.currentMonth.substring(0, 3)
    },
    
    daysInMonth() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      return new Date(year, month + 1, 0).getDate()
    },
    
    blankDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      const firstDay = new Date(year, month, 1).getDay()
      return firstDay
    },
    
    totalPages() {
      const totalItems = this.schedules.filter(schedule => {
        let filterPass = true
        
        if (this.filterCourse !== 'all') {
          filterPass = filterPass && schedule.course === this.filterCourse
        }
        
        if (this.filterStatus !== 'all') {
          filterPass = filterPass && schedule.status === this.filterStatus
        }
        
        return filterPass
      }).length
      
      return Math.ceil(totalItems / this.itemsPerPage)
    }
  },
  methods: {
    handleSearch() {
      this.currentPage = 1
    },
    
    refreshSchedule() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        console.log('Schedule refreshed')
      }, 800)
    },
    
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    },
    
    getStatusClass(status) {
      switch(status) {
        case 'upcoming': return 'bg-blue-100 text-blue-800'
        case 'ongoing': return 'bg-green-100 text-green-800'
        case 'completed': return 'bg-gray-100 text-gray-800'
        case 'cancelled': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    },
    
    getClassStatusClass(status) {
      switch(status) {
        case 'upcoming': return 'bg-blue-50 text-blue-700 border border-blue-200'
        case 'ongoing': return 'bg-green-50 text-green-700 border border-green-200'
        case 'completed': return 'bg-gray-50 text-gray-700 border border-gray-200'
        default: return 'bg-gray-50 text-gray-700 border border-gray-200'
      }
    },
    
    getCourseColorClass(course) {
      const colors = {
        'Basic Driving': 'bg-green-500',
        'Traffic Rules': 'bg-blue-500',
        'Simulation': 'bg-purple-500',
        'Safety Orientation': 'bg-yellow-500',
        'Road Signs': 'bg-indigo-500',
        'Night Driving': 'bg-gray-500',
        'Parallel Parking': 'bg-pink-500',
        'Highway Driving': 'bg-red-500'
      }
      return colors[course] || 'bg-green-500'
    },
    
    getCourseIcon(course) {
      const icons = {
        'Basic Driving': '🚗',
        'Traffic Rules': '🚦',
        'Simulation': '🎮',
        'Safety Orientation': '🛡️',
        'Road Signs': '🛣️',
        'Night Driving': '🌙',
        'Parallel Parking': '🅿️',
        'Highway Driving': '🛣️'
      }
      return icons[course] || '📚'
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      const month = this.months[date.getMonth()].substring(0, 3)
      const day = date.getDate()
      const year = date.getFullYear()
      return `${month} ${day}, ${year}`
    },
    
    getDayName(dateString) {
      const date = new Date(dateString)
      return this.daysOfWeek[date.getDay()]
    },
    
    prevMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      )
      this.selectedDay = null
      this.updateScheduleStats()
    },
    
    nextMonth() {
      this.currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      )
      this.selectedDay = null
      this.updateScheduleStats()
    },
    
    selectDay(day) {
      this.selectedDay = this.selectedDay === day ? null : day
    },
    
    hasScheduleForDay(day) {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      const monthStr = month < 10 ? `0${month}` : `${month}`
      const dayStr = day < 10 ? `0${day}` : `${day}`
      const dateStr = `${year}-${monthStr}-${dayStr}`
      
      return this.schedules.some(schedule => schedule.date === dateStr)
    },
    
    viewScheduleDetails(schedule) {
      console.log('Viewing schedule details:', schedule)
      // Navigate to schedule details
    },
    
    joinClass(schedule) {
      console.log('Joining class:', schedule.course)
      // Navigate to class
    },
    
    viewAttendance(schedule) {
      console.log('Viewing attendance for:', schedule.course)
      // Navigate to attendance
    },
    
    viewClassDetails(classItem) {
      console.log('Viewing class details:', classItem)
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
    },
    
    updateScheduleStats() {
      const today = new Date()
      const oneWeekLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      this.scheduleStats.totalClasses = this.schedules.length
      this.scheduleStats.thisWeek = this.schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date)
        return scheduleDate >= today && scheduleDate <= oneWeekLater
      }).length
      this.scheduleStats.nextWeek = this.schedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date)
        const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)
        return scheduleDate > oneWeekLater && scheduleDate <= twoWeeksLater
      }).length
      this.scheduleStats.completed = this.schedules.filter(s => s.status === 'completed').length
    },
    
    // Quick actions methods
    addToCalendar() {
      console.log('Adding to calendar')
    },
    
    setReminders() {
      console.log('Setting reminders')
    },
    
    viewClassMaterials() {
      console.log('Viewing class materials')
    },
    
    requestReschedule() {
      console.log('Requesting reschedule')
    },
    
    exportSchedule() {
      console.log('Exporting schedule')
    }
  },
  mounted() {
    // Set today as selected day
    this.selectedDay = new Date().getDate()
    
    // Update schedule stats
    this.updateScheduleStats()
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
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

/* Calendar day hover effect */
.calendar-day:hover {
  background-color: #dcfce7;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

/* Quick action buttons hover effect */
.group:hover .group-hover\:bg-green-200 {
  background-color: #bbf7d0;
}

.group:hover .group-hover\:bg-blue-200 {
  background-color: #bfdbfe;
}

.group:hover .group-hover\:bg-yellow-200 {
  background-color: #fef08a;
}

.group:hover .group-hover\:bg-purple-200 {
  background-color: #e9d5ff;
}
</style>