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
              v-model.number="selectedCourseId"
              class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option :value="0">All Courses</option>
              <option v-for="c in courses" :key="c.id" :value="c.id">
                {{ c.course }}
              </option>
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
            <button
              @click="fetchSchedules"
              class="px-3 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
            >
              Refresh
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
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
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
            <div class="w-3 h-3 bg-green-100 rounded"></div> Available
          </span>
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 bg-red-100 rounded"></div> Full
          </span>
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 border-2 border-green-500 rounded"></div> Today
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
                <span :class="getStatusClass(schedule)">
                  {{ schedule.computedStatus || (schedule.availableSlots === 0 ? 'Full' : 'Open') }}
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
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">
              {{ isEditing ? 'Edit Schedule' : 'Add New Schedule' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <form @submit.prevent="saveSchedule">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  v-model.number="formData.course_id"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select a course</option>
                  <option v-for="c in coursesRaw" :key="c.id" :value="c.id">
                    {{ c.course_name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  v-model="formData.schedule_date"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                <select
                  v-model.number="formData.instructor_id"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select instructor</option>
                  <option v-for="i in instructors" :key="i.instructor_id" :value="i.instructor_id">
                    {{ i.firstname }} {{ i.lastname }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  v-model="formData.start_time"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  v-model="formData.end_time"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
                <input
                  type="number"
                  v-model.number="formData.total_slots"
                  required
                  min="1"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter total slots"
                >
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
                :disabled="saving"
                class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium disabled:opacity-60"
              >
                {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Save') }}
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
            Are you sure you want to delete schedule for
            <span class="font-semibold">{{ scheduleToDelete?.course }}</span> on
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
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-60"
          >
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import AdminLayout from './AdminLayout.vue'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true
})

// ✅ LOCAL date string (no UTC shift)
const toLocalYMD = (dateLike) => {
  const d = new Date(dateLike)
  if (Number.isNaN(d.getTime())) return String(dateLike || '')
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default {
  name: 'AdminSchedule',
  components: { AdminLayout },
  setup() {
    const months = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December'
    ]

    const schedules = ref([])
    const coursesRaw = ref([])
    const instructors = ref([])

    const searchQuery = ref('')
    const selectedCourseId = ref(0)
    const selectedMonth = ref(months[new Date().getMonth()])
    const currentYear = ref(new Date().getFullYear())
    const currentMonth = ref(new Date().getMonth())

    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const scheduleToDelete = ref(null)

    const saving = ref(false)
    const deleting = ref(false)

    const formData = reactive({
      id: null,
      course_id: '',
      instructor_id: '',
      schedule_date: toLocalYMD(new Date()),
      start_time: '09:00',
      end_time: '12:00',
      total_slots: 10,
      status: 'open'
    })

    const courses = computed(() => {
      const map = new Map()
      for (const s of schedules.value) {
        const cid = Number(s.course_id)
        if (!map.has(cid)) {
          map.set(cid, { id: cid, course: s.course })
        }
      }
      return Array.from(map.values()).sort((a, b) => a.course.localeCompare(b.course))
    })

    const filteredSchedules = computed(() => {
      let result = [...schedules.value]

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(s =>
          String(s.course || '').toLowerCase().includes(q) ||
          String(s.instructor || '').toLowerCase().includes(q) ||
          String(s.day || '').toLowerCase().includes(q)
        )
      }

      if (Number(selectedCourseId.value) > 0) {
        result = result.filter(s => Number(s.course_id) === Number(selectedCourseId.value))
      }

      if (selectedMonth.value) {
        result = result.filter(s => {
          const d = new Date(String(s.date) + 'T00:00:00')
          return months[d.getMonth()] === selectedMonth.value
        })
      }

      return result
    })

    const availableSlots = computed(() => schedules.value.filter(s => Number(s.availableSlots) > 0).length)
    const fullDates = computed(() => schedules.value.filter(s => Number(s.availableSlots) === 0).length)

    const calendarDates = computed(() => {
      const year = currentYear.value
      const month = currentMonth.value
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const firstDayIndex = firstDay.getDay()

      const dates = []

      // prev month fillers
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthLastDay - i)
        dates.push({ key: `prev-${i}`, day: prevMonthLastDay - i, date: d, isCurrentMonth: false, isToday: false, slotCount: null })
      }

      const today = new Date()
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i)
        const dStr = toLocalYMD(d)

        const daySchedules = schedules.value.filter(s => s.date === dStr)
        const slotCount = daySchedules.reduce((sum, s) => sum + Number(s.availableSlots || 0), 0)

        dates.push({
          key: `current-${i}`,
          day: i,
          date: d,
          isCurrentMonth: true,
          isToday:
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear(),
          slotCount: daySchedules.length > 0 ? slotCount : null
        })
      }

      // next month fillers to 42
      const totalCells = 42
      const nextMonthDays = totalCells - dates.length
      for (let i = 1; i <= nextMonthDays; i++) {
        const d = new Date(year, month + 1, i)
        dates.push({ key: `next-${i}`, day: i, date: d, isCurrentMonth: false, isToday: false, slotCount: null })
      }

      return dates
    })

    const currentMonthName = computed(() => months[currentMonth.value])

    const formatDate = (ymd) => {
      const d = new Date(String(ymd) + 'T00:00:00')
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const getDateClass = (dateObj) => {
      const dateStr = toLocalYMD(dateObj)
      const daySchedules = schedules.value.filter(s => s.date === dateStr)
      if (daySchedules.length === 0) return ''
      const totalAvailable = daySchedules.reduce((sum, s) => sum + Number(s.availableSlots || 0), 0)
      return totalAvailable === 0 ? 'bg-red-50' : 'bg-green-50'
    }

    const getStatusClass = (schedule) => {
      const status = schedule.computedStatus || (Number(schedule.availableSlots) === 0 ? 'Full' : 'Open')
      if (status === 'Full') return 'text-red-600 font-semibold'
      if (status === 'Closed') return 'text-gray-600 font-semibold'
      return 'text-green-600 font-semibold'
    }

    const clearFilters = () => {
      searchQuery.value = ''
      selectedCourseId.value = 0
      selectedMonth.value = ''
      currentMonth.value = new Date().getMonth()
      currentYear.value = new Date().getFullYear()
    }

    const prevMonth = () => {
      if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
      else currentMonth.value--
    }
    const nextMonth = () => {
      if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
      else currentMonth.value++
    }

    const viewDateSchedules = (dateObj) => {
      const dateStr = toLocalYMD(dateObj)
      const daySchedules = schedules.value.filter(s => s.date === dateStr)
      alert(daySchedules.length > 0
        ? `Viewing ${daySchedules.length} schedule(s) for ${formatDate(dateStr)}`
        : `No schedules for ${formatDate(dateStr)}. Click "Add New Schedule" to create one.`
      )
    }

    const resetForm = () => {
      formData.id = null
      formData.course_id = ''
      formData.instructor_id = ''
      formData.schedule_date = toLocalYMD(new Date())
      formData.start_time = '09:00'
      formData.end_time = '12:00'
      formData.total_slots = 10
      formData.status = 'open'
    }

    const openAddModal = () => {
      isEditing.value = false
      resetForm()
      showModal.value = true
    }

    const editSchedule = (schedule) => {
      isEditing.value = true
      formData.id = Number(schedule.id)
      formData.course_id = Number(schedule.course_id)
      formData.instructor_id = Number(schedule.instructor_id)
      formData.schedule_date = String(schedule.date)
      formData.start_time = String(schedule.startTime)
      formData.end_time = String(schedule.endTime)
      formData.total_slots = Number(schedule.totalSlots)
      formData.status = schedule.scheduleStatus || 'open'
      showModal.value = true
    }

    const viewSchedule = (schedule) => {
      alert(`View schedule: ${schedule.course} on ${formatDate(schedule.date)} (${schedule.startTime}-${schedule.endTime})`)
    }

    const closeModal = () => {
      showModal.value = false
      resetForm()
    }

    const confirmDelete = (schedule) => {
      scheduleToDelete.value = schedule
      showDeleteModal.value = true
    }

    const cancelDelete = () => {
      scheduleToDelete.value = null
      showDeleteModal.value = false
    }

    // ---------------- API CALLS ----------------
    const fetchCourses = async () => {
      const res = await api.get('/admin/courses')
      coursesRaw.value = Array.isArray(res.data?.data) ? res.data.data : []
    }

    const fetchInstructors = async () => {
      const res = await api.get('/admin/instructors')
      instructors.value = Array.isArray(res.data?.data) ? res.data.data : []
    }

    const fetchSchedules = async () => {
      try {
        const res = await api.get('/admin/schedules')
        const rows = Array.isArray(res.data?.data) ? res.data.data : []

        schedules.value = rows.map(s => {
          const dateStr = String(s.date || '')
          const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr

          return {
            ...s,
            id: Number(s.id),
            course_id: Number(s.course_id),
            instructor_id: Number(s.instructor_id),
            date: cleanDate
          }
        })
      } catch (err) {
        console.error('fetchSchedules error:', err?.response?.data || err)
        alert(err?.response?.data?.message || err.message || 'Failed to fetch schedules')
      }
    }

    const saveSchedule = async () => {
      if (saving.value) return

      // ✅ basic validation
      if (!formData.course_id || !formData.instructor_id || !formData.schedule_date) {
        alert('Course, Instructor, and Date are required')
        return
      }
      if (String(formData.start_time) >= String(formData.end_time)) {
        alert('End time must be after start time')
        return
      }
      if (!Number.isFinite(Number(formData.total_slots)) || Number(formData.total_slots) < 1) {
        alert('Total slots must be >= 1')
        return
      }

      saving.value = true
      try {
        const payload = {
          course_id: Number(formData.course_id),
          instructor_id: Number(formData.instructor_id),
          schedule_date: String(formData.schedule_date), // YYYY-MM-DD
          start_time: String(formData.start_time),
          end_time: String(formData.end_time),
          total_slots: Number(formData.total_slots),
          status: formData.status || 'open'
        }

        // ✅ debug (para makita agad kung ano sinend)
        console.log('SAVE payload:', payload, 'isEditing:', isEditing.value, 'id:', formData.id)

        if (isEditing.value) {
          const id = Number(formData.id)
          if (!Number.isFinite(id) || id < 1) {
            alert('Invalid schedule id (client). Please refresh and try again.')
            return
          }
          await api.put(`/admin/schedules/${id}`, payload)
        } else {
          await api.post('/admin/schedules', payload)
        }

        await fetchSchedules()
        closeModal()
      } catch (err) {
        console.error('saveSchedule error:', err?.response?.data || err)
        alert(err?.response?.data?.message || err.message || 'Failed to save schedule')
      } finally {
        saving.value = false
      }
    }

    const deleteSchedule = async () => {
      if (!scheduleToDelete.value || deleting.value) return
      deleting.value = true
      try {
        await api.delete(`/admin/schedules/${Number(scheduleToDelete.value.id)}`)
        await fetchSchedules()
        cancelDelete()
      } catch (err) {
        console.error('deleteSchedule error:', err?.response?.data || err)
        alert(err?.response?.data?.message || err.message || 'Failed to delete schedule')
      } finally {
        deleting.value = false
      }
    }

    onMounted(async () => {
      try {
        await Promise.all([fetchCourses(), fetchInstructors()])
      } catch (e) {
        console.error('dropdown fetch error:', e)
      }
      await fetchSchedules()
      resetForm()
    })

    return {
      months,

      schedules,
      coursesRaw,
      courses,
      instructors,

      searchQuery,
      selectedCourseId,
      selectedMonth,
      currentYear,
      currentMonth,

      showModal,
      showDeleteModal,
      isEditing,
      scheduleToDelete,

      formData,
      saving,
      deleting,

      filteredSchedules,
      availableSlots,
      fullDates,
      calendarDates,
      currentMonthName,

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
      deleteSchedule,

      fetchSchedules
    }
  }
}
</script>