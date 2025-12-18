<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">📅 Schedule Management</h2>
        <button 
          @click="openAddModal"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          ➕ Add New Schedule
        </button>
      </div>

      <!-- Schedule Calendar -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-green-800">📅 Schedule Overview</h3>
          <div class="flex gap-3 text-sm">
            <span class="flex items-center gap-1">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              Available: {{ availableSlots }}
            </span>
            <span class="flex items-center gap-1">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              Full: {{ fullDates }}
            </span>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
            <select 
              v-model="selectedCourse"
              class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">All Courses</option>
              <option value="Driving NC II">Driving NC II</option>
              <option value="Automotive NC I">Automotive NC I</option>
              <option value="Electrical Installation NC II">Electrical Installation NC II</option>
              <option value="Cookery NC II">Cookery NC II</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
                <select 
                v-model="selectedMonth"
                class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                <option value="">All Months</option>
                <option v-for="month in months" :key="month" :value="month">
                    {{ month }}
                </option>
                </select>
          </div>

          <div class="flex items-end gap-2">
            <button 
              @click="clearFilters"
              class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- Calendar Navigation -->
        <div class="flex justify-between items-center mb-4">
          <button 
            @click="prevMonth"
            class="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium"
          >
            ◀ Prev
          </button>
          <h3 class="text-lg font-semibold text-green-800">{{ currentMonthName }} {{ currentYear }}</h3>
          <button 
            @click="nextMonth"
            class="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium"
          >
            Next ▶
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        
        <div class="grid grid-cols-7 gap-2">
          <div 
            v-for="date in calendarDates" 
            :key="date.key"
            :class="[
              'p-3 border rounded text-center cursor-pointer transition-colors',
              date.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
              date.isToday ? 'border-green-500' : 'border-gray-200',
              getDateClass(date.date)
            ]"
            @click="viewDateSchedules(date.date)"
          >
            <div class="font-medium">{{ date.day }}</div>
            <div v-if="date.slotCount !== null" class="text-xs mt-1">
              <span :class="date.slotCount === 0 ? 'text-red-600' : 'text-green-700'">
                {{ date.slotCount === 0 ? 'Full' : `${date.slotCount} Slots` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex gap-4 text-sm text-gray-600">
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-100 rounded"></div>
            Available
          </span>
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 bg-red-100 rounded"></div>
            Full
          </span>
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 border-2 border-green-500 rounded"></div>
            Today
          </span>
        </div>
      </div>

      <!-- Schedule Table -->
      <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-bold text-green-800">🗂️ Schedule List</h3>
          <div class="text-sm text-gray-600">
            Showing {{ filteredSchedules.length }} of {{ schedules.length }} schedules
          </div>
        </div>
        
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Date</th>
              <th class="py-3 px-4 text-left font-medium">Time</th>
              <th class="py-3 px-4 text-left font-medium">Instructor</th>
              <th class="py-3 px-4 text-left font-medium">Slots</th>
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
                <div class="font-medium">{{ schedule.course }}</div>
              </td>
              <td class="py-3 px-4">
                {{ formatDate(schedule.date) }}
                <div class="text-xs text-gray-500">{{ schedule.day }}</div>
              </td>
              <td class="py-3 px-4">
                <div class="font-medium">{{ schedule.startTime }} - {{ schedule.endTime }}</div>
              </td>
              <td class="py-3 px-4">{{ schedule.instructor }}</td>
              <td class="py-3 px-4">
                <div>{{ schedule.availableSlots }} / {{ schedule.totalSlots }}</div>
              </td>
              <td class="py-3 px-4">
                <span :class="getStatusClass(schedule.availableSlots)">
                  {{ schedule.availableSlots === 0 ? 'Full' : 'Open' }}
                </span>
              </td>
              <td class="py-3 px-4">
                <button 
                  @click="viewSchedule(schedule)" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  View
                </button>
                <button 
                  @click="editSchedule(schedule)" 
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                >
                  Edit
                </button>
                <button 
                  @click="confirmDelete(schedule)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredSchedules.length === 0">
              <td colspan="7" class="py-8 text-center text-gray-500">
                No schedules found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredSchedules.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ filteredSchedules.length }} items
        </div>
        <div class="flex gap-1">
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">← Previous</button>
          <button class="px-3 py-1 bg-green-700 text-white rounded text-sm">1</button>
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next →</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">
              {{ isEditing ? 'Edit Schedule' : 'Add New Schedule' }}
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          <form @submit.prevent="saveSchedule">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select 
                  v-model="formData.course"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select a course</option>
                  <option value="Driving NC II">Driving NC II</option>
                  <option value="Automotive NC I">Automotive NC I</option>
                  <option value="Electrical Installation NC II">Electrical Installation NC II</option>
                  <option value="Cookery NC II">Cookery NC II</option>
                  <option value="Bread and Pastry NC II">Bread and Pastry NC II</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date" 
                  v-model="formData.date"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <select 
                  v-model="formData.instructor"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select instructor</option>
                  <option value="Mr. Cruz">Mr. Cruz</option>
                  <option value="Ms. Reyes">Ms. Reyes</option>
                  <option value="Mr. Santos">Mr. Santos</option>
                  <option value="Ms. Tan">Ms. Tan</option>
                  <option value="Mr. Lim">Mr. Lim</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input 
                  type="time" 
                  v-model="formData.startTime"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input 
                  type="time" 
                  v-model="formData.endTime"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
                <input 
                  type="number" 
                  v-model.number="formData.totalSlots"
                  required
                  min="1"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter total slots"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Available Slots</label>
                <input 
                  type="number" 
                  v-model.number="formData.availableSlots"
                  required
                  :max="formData.totalSlots"
                  min="0"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter available slots"
                >
                <p class="text-xs text-gray-500 mt-1">
                  Cannot exceed total slots ({{ formData.totalSlots }})
                </p>
              </div>
            </div>
            
            <div class="flex justify-end gap-2 mt-6">
              <button 
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
              >
                {{ isEditing ? 'Update' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-md p-6">
        <div class="mb-4">
          <h3 class="text-lg font-bold text-red-600 mb-2">Confirm Deletion</h3>
          <p class="text-gray-600">
            Are you sure you want to delete schedule for <span class="font-semibold">{{ scheduleToDelete?.course }}</span> on 
            <span class="font-semibold">{{ scheduleToDelete ? formatDate(scheduleToDelete.date) : '' }}</span>? 
            This action cannot be undone.
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <button 
            @click="cancelDelete"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Cancel
          </button>
          <button 
            @click="deleteSchedule"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import AdminLayout from './AdminLayout.vue'

export default {
  name: 'AdminSchedule',
  components: {
    AdminLayout
  },
  setup() {
    // Constants - MOVE THIS FIRST
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    // State
    const schedules = ref([])
    const searchQuery = ref('')
    const selectedCourse = ref('')
    const selectedMonth = ref(months[new Date().getMonth()])
    const currentYear = ref(new Date().getFullYear())
    const currentMonth = ref(new Date().getMonth())
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const scheduleToDelete = ref(null)
    
    // Form data
    const formData = reactive({
      id: null,
      course: '',
      date: '',
      instructor: '',
      startTime: '09:00',
      endTime: '12:00',
      totalSlots: 10,
      availableSlots: 10
    })
    
    // Computed properties
    const filteredSchedules = computed(() => {
      let result = [...schedules.value]
      
      // Apply search
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(schedule => 
          schedule.course.toLowerCase().includes(query) ||
          schedule.instructor.toLowerCase().includes(query) ||
          schedule.day.toLowerCase().includes(query)
        )
      }
      
      // Apply course filter
      if (selectedCourse.value) {
        result = result.filter(schedule => schedule.course === selectedCourse.value)
      }
      
            // Apply month filter
            if (selectedMonth.value) {
            result = result.filter(schedule => {
                const scheduleMonthIndex = new Date(schedule.date).getMonth()
                const scheduleMonthName = months[scheduleMonthIndex]
                return scheduleMonthName === selectedMonth.value
            })
            }
      
      return result
    })
    
    const availableSlots = computed(() => {
      return schedules.value.filter(s => s.availableSlots > 0).length
    })
    
    const fullDates = computed(() => {
      return schedules.value.filter(s => s.availableSlots === 0).length
    })
    
    const calendarDates = computed(() => {
      const year = currentYear.value
      const month = currentMonth.value
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const firstDayIndex = firstDay.getDay()
      
      const dates = []
      
      // Previous month days
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i)
        dates.push({
          key: `prev-${i}`,
          day: prevMonthLastDay - i,
          date: date,
          isCurrentMonth: false,
          isToday: false,
          slotCount: null
        })
      }
      
      // Current month days
      const today = new Date()
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i)
        const dateStr = date.toISOString().split('T')[0]
        const daySchedules = schedules.value.filter(s => s.date === dateStr)
        const slotCount = daySchedules.reduce((sum, s) => sum + s.availableSlots, 0)
        
        dates.push({
          key: `current-${i}`,
          day: i,
          date: date,
          isCurrentMonth: true,
          isToday: date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear(),
          slotCount: daySchedules.length > 0 ? slotCount : null
        })
      }
      
      // Next month days
      const totalCells = 42 // 6 rows * 7 days
      const nextMonthDays = totalCells - dates.length
      for (let i = 1; i <= nextMonthDays; i++) {
        const date = new Date(year, month + 1, i)
        dates.push({
          key: `next-${i}`,
          day: i,
          date: date,
          isCurrentMonth: false,
          isToday: false,
          slotCount: null
        })
      }
      
      return dates
    })
    
    // Methods
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    
    const getStatusClass = (availableSlots) => {
      return availableSlots === 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'
    }
    
    const getDateClass = (date) => {
      const dateStr = date.toISOString().split('T')[0]
      const daySchedules = schedules.value.filter(s => s.date === dateStr)
      if (daySchedules.length === 0) return ''
      
      const totalAvailable = daySchedules.reduce((sum, s) => sum + s.availableSlots, 0)
      return totalAvailable === 0 ? 'bg-red-50' : 'bg-green-50'
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedCourse.value = ''
      selectedMonth.value = ''
      currentMonth.value = new Date().getMonth()
      currentYear.value = new Date().getFullYear()
    }
    
    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }
    
    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }
    
    const viewDateSchedules = (date) => {
      const dateStr = date.toISOString().split('T')[0]
      const daySchedules = schedules.value.filter(s => s.date === dateStr)
      if (daySchedules.length > 0) {
        alert(`Viewing ${daySchedules.length} schedule(s) for ${formatDate(dateStr)}`)
      } else {
        alert(`No schedules for ${formatDate(dateStr)}. Click "Add New Schedule" to create one.`)
      }
    }
    
    const openAddModal = () => {
      isEditing.value = false
      resetForm()
      showModal.value = true
    }
    
    const editSchedule = (schedule) => {
      isEditing.value = true
      Object.assign(formData, schedule)
      showModal.value = true
    }
    
    const viewSchedule = (schedule) => {
      alert(`View schedule: ${schedule.course} on ${formatDate(schedule.date)}`)
    }
    
    const closeModal = () => {
      showModal.value = false
      resetForm()
    }
    
    const resetForm = () => {
      formData.id = null
      formData.course = ''
      formData.date = new Date().toISOString().split('T')[0]
      formData.instructor = ''
      formData.startTime = '09:00'
      formData.endTime = '12:00'
      formData.totalSlots = 10
      formData.availableSlots = 10
    }
    
    const saveSchedule = () => {
      // Validate time
      if (formData.startTime >= formData.endTime) {
        alert('End time must be after start time')
        return
      }
      
      // Validate available slots
      if (formData.availableSlots > formData.totalSlots) {
        alert('Available slots cannot exceed total slots')
        return
      }
      
      if (isEditing.value) {
        // Update existing schedule
        const index = schedules.value.findIndex(s => s.id === formData.id)
        if (index !== -1) {
          schedules.value[index] = { 
            ...formData,
            day: new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short' })
          }
        }
      } else {
        // Add new schedule
        const newSchedule = {
          id: schedules.value.length + 1,
          ...formData,
          day: new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short' })
        }
        schedules.value.unshift(newSchedule)
      }
      
      closeModal()
    }
    
    const confirmDelete = (schedule) => {
      scheduleToDelete.value = schedule
      showDeleteModal.value = true
    }
    
    const cancelDelete = () => {
      scheduleToDelete.value = null
      showDeleteModal.value = false
    }
    
    const deleteSchedule = () => {
      if (scheduleToDelete.value) {
        schedules.value = schedules.value.filter(s => s.id !== scheduleToDelete.value.id)
      }
      cancelDelete()
    }
    
    // Fetch initial data
    const fetchSchedules = () => {
      // Sample data
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)
      
      schedules.value = [
        { 
          id: 1, 
          course: 'Driving NC II', 
          date: '2025-11-02', 
          day: 'Sun',
          startTime: '09:00', 
          endTime: '12:00', 
          instructor: 'Mr. Cruz', 
          totalSlots: 20, 
          availableSlots: 0 
        },
        { 
          id: 2, 
          course: 'Automotive NC I', 
          date: '2025-11-06', 
          day: 'Thu',
          startTime: '13:00', 
          endTime: '16:00', 
          instructor: 'Ms. Reyes', 
          totalSlots: 15, 
          availableSlots: 1 
        },
        { 
          id: 3, 
          course: 'Electrical Installation NC II', 
          date: '2025-11-10', 
          day: 'Mon',
          startTime: '10:00', 
          endTime: '13:00', 
          instructor: 'Mr. Santos', 
          totalSlots: 25, 
          availableSlots: 4 
        },
        { 
          id: 4, 
          course: 'Cookery NC II', 
          date: '2025-11-15', 
          day: 'Sat',
          startTime: '08:00', 
          endTime: '11:00', 
          instructor: 'Ms. Tan', 
          totalSlots: 30, 
          availableSlots: 10 
        },
        { 
          id: 5, 
          course: 'Bread and Pastry NC II', 
          date: '2025-11-20', 
          day: 'Thu',
          startTime: '14:00', 
          endTime: '17:00', 
          instructor: 'Mr. Lim', 
          totalSlots: 35, 
          availableSlots: 15 
        }
      ]
    }
    
    onMounted(() => {
      fetchSchedules()
      resetForm()
    })
    
    return {
      // State
      schedules,
      searchQuery,
      selectedCourse,
      selectedMonth,
      currentYear,
      currentMonth,
      showModal,
      showDeleteModal,
      isEditing,
      scheduleToDelete,
      formData,
      months,
      
      // Computed
      filteredSchedules,
      availableSlots,
      fullDates,
      calendarDates,
      currentMonthName: computed(() => months[currentMonth.value]),
      
      // Methods
      formatDate,
      getStatusClass,
      getDateClass,
      clearFilters,
      prevMonth,
      nextMonth,
      viewDateSchedules,
      openAddModal,
      editSchedule,
      viewSchedule,
      closeModal,
      saveSchedule,
      confirmDelete,
      cancelDelete,
      deleteSchedule
    }
  }
}
</script>