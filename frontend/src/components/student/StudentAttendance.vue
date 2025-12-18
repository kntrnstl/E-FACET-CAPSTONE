<template>
  <StudentLayout>
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search attendance..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      >
    </template>

    <!-- Main Content -->
    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">✅ Attendance</h2>
        <div class="text-sm text-gray-600">
          Last updated: {{ lastUpdated }}
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <p class="text-sm text-gray-600">Total Classes</p>
          <h3 class="text-2xl font-bold text-green-800 mt-1">{{ attendanceStats.totalClasses }}</h3>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p class="text-sm text-gray-600">Present</p>
          <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ attendanceStats.present }}</h3>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p class="text-sm text-gray-600">Absent</p>
          <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ attendanceStats.absent }}</h3>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p class="text-sm text-gray-600">Attendance Rate</p>
          <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ attendanceStats.attendanceRate }}%</h3>
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
            <option value="Basic Driving">Basic Driving</option>
            <option value="Traffic Rules">Traffic Rules</option>
            <option value="Simulation">Simulation</option>
            <option value="Safety Orientation">Safety Orientation</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select 
            v-model="selectedStatus"
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
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
            v-model="selectedMonth"
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
        </div>

        <div class="flex items-end gap-2">
          <button 
            @click="clearFilters"
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Clear
          </button>
          <button 
            @click="exportAttendance"
            class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Export
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading attendance records...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-bold text-green-800">Attendance Records</h3>
          <div class="text-sm text-gray-600">
            Showing {{ filteredAttendance.length }} of {{ attendanceRecords.length }} records
          </div>
        </div>
        
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Date</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Time</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Remarks</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="record in filteredAttendance" 
              :key="record.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="font-medium">{{ formatDate(record.date) }}</div>
                <div class="text-xs text-gray-500">{{ record.day }}</div>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium">{{ record.course }}</span>
                <div class="text-xs text-gray-500">{{ record.instructor }}</div>
              </td>
              <td class="py-3 px-4 text-gray-600">{{ record.time }}</td>
              <td class="py-3 px-4">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(record.status)"
                >
                  {{ formatStatus(record.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="text-sm">{{ record.remarks }}</span>
                <div v-if="record.note" class="text-xs text-gray-500 mt-1">
                  {{ record.note }}
                </div>
              </td>
              <td class="py-3 px-4">
                <button 
                  @click="viewDetails(record)" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded"
                >
                  Details
                </button>
                <button 
                  v-if="record.status === 'absent' && !record.excuseSubmitted"
                  @click="submitExcuse(record)"
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-2 py-1 hover:bg-yellow-50 rounded"
                >
                  Submit Excuse
                </button>
              </td>
            </tr>
            <tr v-if="filteredAttendance.length === 0">
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
          <h3 class="text-lg font-bold text-green-800">📈 Attendance Summary</h3>
          <button 
            @click="refreshSummary"
            class="text-green-700 hover:text-green-800 text-sm font-medium"
          >
            ↻ Refresh
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-md font-medium text-gray-800 mb-3">Monthly Overview</h4>
            <div class="space-y-2">
              <div v-for="month in monthlySummary" :key="month.month" class="flex items-center justify-between">
                <span class="text-sm text-gray-700">{{ month.month }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium">{{ month.rate }}%</span>
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full"
                      :class="month.rate >= 90 ? 'bg-green-500' : month.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'"
                      :style="{ width: `${month.rate}%` }"
                    ></div>
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
                <span class="text-sm font-medium">{{ attendanceStats.present }} records</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Late</span>
                </div>
                <span class="text-sm font-medium">{{ attendanceStats.late }} records</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Absent</span>
                </div>
                <span class="text-sm font-medium">{{ attendanceStats.absent }} records</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span class="text-sm text-gray-700">Excused</span>
                </div>
                <span class="text-sm font-medium">{{ attendanceStats.excused }} records</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="filteredAttendance.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ filteredAttendance.length }} records
        </div>
        <div class="flex gap-1">
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">← Previous</button>
          <button class="px-3 py-1 bg-green-700 text-white rounded text-sm">1</button>
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next →</button>
        </div>
      </div>
    </div>

    <!-- Submit Excuse Modal -->
    <div v-if="showExcuseModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">Submit Excuse</h3>
            <button 
              @click="closeExcuseModal"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-600 mb-2">
                For: <span class="font-medium">{{ excuseRecord?.course }}</span> on 
                <span class="font-medium">{{ excuseRecord ? formatDate(excuseRecord.date) : '' }}</span>
              </p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Excuse Type</label>
              <select 
                v-model="excuseForm.type"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
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
                v-model="excuseForm.reason"
                rows="3"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Please provide details for your absence..."
              ></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Supporting Document (Optional)</label>
              <input 
                type="file"
                @change="handleFileUpload"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                accept=".pdf,.jpg,.jpeg,.png"
              >
              <p class="text-xs text-gray-500 mt-1">Upload PDF, JPG, or PNG file (max 5MB)</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              @click="closeExcuseModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              @click="submitExcuseForm"
              :disabled="!excuseForm.type || !excuseForm.reason.trim()"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Excuse
            </button>
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentAttendance',
  components: {
    StudentLayout
  },
  setup() {
    // State
    const searchQuery = ref('')
    const selectedCourse = ref('')
    const selectedStatus = ref('')
    const selectedMonth = ref('')
    const loading = ref(true)
    const showExcuseModal = ref(false)
    const excuseRecord = ref(null)
    
    // Attendance data
    const attendanceRecords = ref([])
    
    // Attendance statistics
    const attendanceStats = reactive({
      totalClasses: 20,
      present: 15,
      absent: 2,
      late: 2,
      excused: 1,
      attendanceRate: 85
    })
    
    // Monthly summary
    const monthlySummary = ref([
      { month: 'November 2025', rate: 90 },
      { month: 'October 2025', rate: 85 },
      { month: 'September 2025', rate: 80 },
      { month: 'August 2025', rate: 95 }
    ])
    
    // Excuse form
    const excuseForm = reactive({
      type: '',
      reason: '',
      document: null
    })
    
    // Computed properties
    const filteredAttendance = computed(() => {
      let result = [...attendanceRecords.value]
      
      // Apply search
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(record => 
          record.course.toLowerCase().includes(query) ||
          record.instructor.toLowerCase().includes(query) ||
          record.remarks.toLowerCase().includes(query)
        )
      }
      
      // Apply course filter
      if (selectedCourse.value) {
        result = result.filter(record => record.course === selectedCourse.value)
      }
      
      // Apply status filter
      if (selectedStatus.value) {
        result = result.filter(record => record.status === selectedStatus.value)
      }
      
      // Apply month filter
      if (selectedMonth.value) {
        result = result.filter(record => {
          const recordMonth = new Date(record.date).toISOString().slice(0, 7)
          return recordMonth === selectedMonth.value
        })
      }
      
      // Sort by date (newest first)
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      return result
    })
    
    const lastUpdated = computed(() => {
      const now = new Date()
      return now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
    
    const getStatusClass = (status) => {
      switch(status) {
        case 'present': return 'bg-green-100 text-green-800'
        case 'absent': return 'bg-red-100 text-red-800'
        case 'late': return 'bg-yellow-100 text-yellow-800'
        case 'excused': return 'bg-blue-100 text-blue-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedCourse.value = ''
      selectedStatus.value = ''
      selectedMonth.value = ''
    }
    
    const exportAttendance = () => {
      alert('Exporting attendance records...')
    }
    
    const viewDetails = (record) => {
      alert(`Viewing attendance details for ${record.course} on ${formatDate(record.date)}`)
    }
    
    const submitExcuse = (record) => {
      excuseRecord.value = record
      showExcuseModal.value = true
    }
    
    const closeExcuseModal = () => {
      showExcuseModal.value = false
      excuseRecord.value = null
      excuseForm.type = ''
      excuseForm.reason = ''
      excuseForm.document = null
    }
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          alert('File size exceeds 5MB limit')
          return
        }
        excuseForm.document = file
      }
    }
    
    const submitExcuseForm = () => {
      if (!excuseForm.type || !excuseForm.reason.trim()) {
        alert('Please fill in all required fields')
        return
      }
      
      // Find and update the attendance record
      const index = attendanceRecords.value.findIndex(r => r.id === excuseRecord.value.id)
      if (index !== -1) {
        attendanceRecords.value[index].status = 'excused'
        attendanceRecords.value[index].excuseSubmitted = true
        attendanceRecords.value[index].remarks = 'Excuse submitted - pending approval'
        attendanceRecords.value[index].note = `Excuse: ${excuseForm.type} - ${excuseForm.reason}`
        
        // Update statistics
        attendanceStats.absent--
        attendanceStats.excused++
        attendanceStats.attendanceRate = Math.round((attendanceStats.present + attendanceStats.excused) / attendanceStats.totalClasses * 100)
      }
      
      alert('Excuse submitted successfully. Awaiting instructor approval.')
      closeExcuseModal()
    }
    
    const refreshSummary = () => {
      loading.value = true
      setTimeout(() => {
        loading.value = false
        alert('Attendance summary refreshed')
      }, 500)
    }
    
    // Fetch initial data
    const fetchAttendance = () => {
      setTimeout(() => {
        attendanceRecords.value = [
          { 
            id: 1, 
            date: '2025-10-20', 
            day: 'Mon',
            course: 'Basic Driving', 
            instructor: 'Mr. Cruz',
            time: '9:00 AM - 12:00 PM',
            status: 'present', 
            remarks: 'On Time',
            note: 'Participated in practical driving session',
            excuseSubmitted: false
          },
          { 
            id: 2, 
            date: '2025-10-22', 
            day: 'Wed',
            course: 'Traffic Rules', 
            instructor: 'Ms. Reyes',
            time: '1:00 PM - 4:00 PM',
            status: 'absent', 
            remarks: 'No Excuse',
            note: 'Did not notify instructor',
            excuseSubmitted: false
          },
          { 
            id: 3, 
            date: '2025-10-25', 
            day: 'Sat',
            course: 'Simulation', 
            instructor: 'Mr. Santos',
            time: '8:00 AM - 11:00 AM',
            status: 'late', 
            remarks: '5 mins late',
            note: 'Traffic congestion',
            excuseSubmitted: false
          },
          { 
            id: 4, 
            date: '2025-10-28', 
            day: 'Tue',
            course: 'Safety Orientation', 
            instructor: 'Ms. Tan',
            time: '10:00 AM - 1:00 PM',
            status: 'present', 
            remarks: 'Participated well',
            note: 'Active participation in safety drills',
            excuseSubmitted: false
          },
          { 
            id: 5, 
            date: '2025-10-30', 
            day: 'Thu',
            course: 'Basic Driving', 
            instructor: 'Mr. Cruz',
            time: '9:00 AM - 12:00 PM',
            status: 'present', 
            remarks: 'Excellent performance',
            note: 'Completed parking exercises successfully',
            excuseSubmitted: false
          },
          { 
            id: 6, 
            date: '2025-11-02', 
            day: 'Sun',
            course: 'Traffic Rules', 
            instructor: 'Ms. Reyes',
            time: '1:00 PM - 4:00 PM',
            status: 'excused', 
            remarks: 'Medical reason',
            note: 'Submitted medical certificate',
            excuseSubmitted: true
          }
        ]
        loading.value = false
      }, 500)
    }
    
    onMounted(() => {
      // Set default month to current month
      const now = new Date()
      selectedMonth.value = now.toISOString().slice(0, 7)
      
      fetchAttendance()
    })
    
    return {
      // State
      searchQuery,
      selectedCourse,
      selectedStatus,
      selectedMonth,
      loading,
      showExcuseModal,
      excuseRecord,
      attendanceRecords,
      attendanceStats,
      monthlySummary,
      excuseForm,
      
      // Computed
      filteredAttendance,
      lastUpdated,
      
      // Methods
      formatDate,
      getStatusClass,
      formatStatus,
      clearFilters,
      exportAttendance,
      viewDetails,
      submitExcuse,
      closeExcuseModal,
      handleFileUpload,
      submitExcuseForm,
      refreshSummary
    }
  }
}
</script>