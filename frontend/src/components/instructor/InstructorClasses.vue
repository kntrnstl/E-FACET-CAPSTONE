<template>
  <InstructorLayout active-page="classes">
    <!-- Header -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search classes..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">📚 My Classes</h2>
        <button
          @click="openAddModal"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          ➕ Add Class
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <p class="text-sm text-gray-600">Total Classes</p>
          <h3 class="text-2xl font-bold text-green-800 mt-1">{{ classes.length }}</h3>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p class="text-sm text-gray-600">Active</p>
          <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ activeCount }}</h3>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p class="text-sm text-gray-600">Upcoming</p>
          <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ upcomingCount }}</h3>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p class="text-sm text-gray-600">Total Students</p>
          <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ totalStudents }}</h3>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
          <select
            v-model="selectedCourse"
            class="w-52 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Courses</option>
            <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            v-model="selectedStatus"
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
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

      <!-- Table -->
      <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredClasses.length }} of {{ classes.length }} classes
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Sort by:</span>
            <select v-model="sortBy" class="text-sm border rounded px-2 py-1">
              <option value="dateAsc">Soonest</option>
              <option value="dateDesc">Latest</option>
              <option value="course">Course</option>
              <option value="students">Students</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Date</th>
              <th class="py-3 px-4 text-left font-medium">Time</th>
              <th class="py-3 px-4 text-left font-medium">Room</th>
              <th class="py-3 px-4 text-left font-medium">Students</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="cls in filteredClasses"
              :key="cls.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="font-medium">{{ cls.course }}</div>
                <div class="text-xs text-gray-500">Section: {{ cls.section }}</div>
              </td>

              <td class="py-3 px-4">
                {{ formatDate(cls.date) }}
                <div class="text-xs text-gray-500">{{ cls.day }}</div>
              </td>

              <td class="py-3 px-4">
                <div class="font-medium">{{ cls.startTime }} - {{ cls.endTime }}</div>
              </td>

              <td class="py-3 px-4">
                <span class="text-gray-700">{{ cls.room }}</span>
              </td>

              <td class="py-3 px-4">
                <span class="font-medium">{{ cls.studentCount }}</span>
              </td>

              <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="statusBadgeClass(cls.status)">
                  {{ formatStatus(cls.status) }}
                </span>
              </td>

              <td class="py-3 px-4">
                <button
                  @click="viewClass(cls)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  View
                </button>
                <button
                  @click="editClass(cls)"
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                >
                  Edit
                </button>
                <button
                  @click="confirmDelete(cls)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="filteredClasses.length === 0">
              <td colspan="7" class="py-8 text-center text-gray-500">
                No classes found
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
              {{ isEditing ? 'Edit Class' : 'Add Class' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <form @submit.prevent="saveClass">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  v-model="form.course"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select a course</option>
                  <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  v-model="form.section"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., A / B / Morning"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <input
                  type="text"
                  v-model="form.room"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="e.g., Room 101"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  v-model="form.date"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="form.status"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  v-model="form.startTime"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  v-model="form.endTime"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Student Count</label>
                <input
                  type="number"
                  min="0"
                  v-model.number="form.studentCount"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
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
            Delete class <span class="font-semibold">{{ classToDelete?.course }}</span>
            on <span class="font-semibold">{{ classToDelete ? formatDate(classToDelete.date) : '' }}</span>?
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
            @click="deleteClass"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </InstructorLayout>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import InstructorLayout from './InstructorLayout.vue'

export default {
  name: 'InstructorClasses',
  components: { InstructorLayout },
  setup() {
    const loading = ref(false) // pwede mo gawing true kung API call
    const classes = ref([])

    const searchQuery = ref('')
    const selectedCourse = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('dateAsc')

    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const classToDelete = ref(null)

    const courseOptions = [
      'Driving NC II',
      'ATDC NC I',
      'Electrical Installation NC II',
      'Cookery NC II',
      'Bread & Pastry'
    ]

    const form = reactive({
      id: null,
      course: '',
      section: '',
      room: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '12:00',
      status: 'upcoming',
      studentCount: 0,
      day: ''
    })

    const filteredClasses = computed(() => {
      let result = [...classes.value]

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(c =>
          c.course.toLowerCase().includes(q) ||
          c.section.toLowerCase().includes(q) ||
          c.room.toLowerCase().includes(q) ||
          c.day.toLowerCase().includes(q)
        )
      }

      if (selectedCourse.value) result = result.filter(c => c.course === selectedCourse.value)
      if (selectedStatus.value) result = result.filter(c => c.status === selectedStatus.value)

      result.sort((a, b) => {
        switch (sortBy.value) {
          case 'dateAsc': return new Date(a.date) - new Date(b.date)
          case 'dateDesc': return new Date(b.date) - new Date(a.date)
          case 'course': return a.course.localeCompare(b.course)
          case 'students': return (b.studentCount || 0) - (a.studentCount || 0)
          case 'status': return a.status.localeCompare(b.status)
          default: return 0
        }
      })

      return result
    })

    const activeCount = computed(() => classes.value.filter(c => c.status === 'active').length)
    const upcomingCount = computed(() => classes.value.filter(c => c.status === 'upcoming').length)
    const totalStudents = computed(() => classes.value.reduce((sum, c) => sum + (c.studentCount || 0), 0))

    const formatDate = (dateString) => {
      const d = new Date(dateString)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const formatStatus = (s) => s.charAt(0).toUpperCase() + s.slice(1)

    const statusBadgeClass = (status) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800'
        case 'upcoming': return 'bg-yellow-100 text-yellow-800'
        case 'completed': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    const clearFilters = () => {
      searchQuery.value = ''
      selectedCourse.value = ''
      selectedStatus.value = ''
    }

    const resetForm = () => {
      form.id = null
      form.course = ''
      form.section = ''
      form.room = ''
      form.date = new Date().toISOString().split('T')[0]
      form.startTime = '09:00'
      form.endTime = '12:00'
      form.status = 'upcoming'
      form.studentCount = 0
      form.day = ''
    }

    const openAddModal = () => {
      isEditing.value = false
      resetForm()
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      resetForm()
    }

    const viewClass = (cls) => {
      alert(`View class: ${cls.course} (${cls.section})`)
    }

    const editClass = (cls) => {
      isEditing.value = true
      Object.assign(form, cls)
      showModal.value = true
    }

    const saveClass = () => {
      if (form.startTime >= form.endTime) {
        alert('End time must be after start time')
        return
      }

      const dayName = new Date(form.date).toLocaleDateString('en-US', { weekday: 'short' })

      if (isEditing.value) {
        const idx = classes.value.findIndex(c => c.id === form.id)
        if (idx !== -1) classes.value[idx] = { ...form, day: dayName }
      } else {
        classes.value.unshift({
          id: classes.value.length + 1,
          ...form,
          day: dayName
        })
      }

      closeModal()
    }

    const confirmDelete = (cls) => {
      classToDelete.value = cls
      showDeleteModal.value = true
    }

    const cancelDelete = () => {
      classToDelete.value = null
      showDeleteModal.value = false
    }

    const deleteClass = () => {
      if (classToDelete.value) {
        classes.value = classes.value.filter(c => c.id !== classToDelete.value.id)
      }
      cancelDelete()
    }

    const fetchClasses = () => {
      // sample/demo data (palitan mo later ng API)
      classes.value = [
        {
          id: 1,
          course: 'Driving NC II',
          section: 'A',
          room: 'Room 101',
          date: '2025-11-05',
          startTime: '09:00',
          endTime: '12:00',
          status: 'active',
          studentCount: 18,
          day: 'Tue'
        },
        {
          id: 2,
          course: 'Cookery NC II',
          section: 'Morning',
          room: 'Kitchen Lab',
          date: '2025-11-10',
          startTime: '08:00',
          endTime: '11:00',
          status: 'upcoming',
          studentCount: 25,
          day: 'Sun'
        },
        {
          id: 3,
          course: 'Electrical Installation NC II',
          section: 'B',
          room: 'Workshop 2',
          date: '2025-10-20',
          startTime: '13:00',
          endTime: '16:00',
          status: 'completed',
          studentCount: 12,
          day: 'Mon'
        }
      ]
    }

    onMounted(() => {
      fetchClasses()
    })

    return {
      loading,
      classes,
      searchQuery,
      selectedCourse,
      selectedStatus,
      sortBy,
      showModal,
      showDeleteModal,
      isEditing,
      classToDelete,
      courseOptions,
      form,

      filteredClasses,
      activeCount,
      upcomingCount,
      totalStudents,

      formatDate,
      formatStatus,
      statusBadgeClass,

      clearFilters,
      openAddModal,
      closeModal,
      viewClass,
      editClass,
      saveClass,
      confirmDelete,
      cancelDelete,
      deleteClass
    }
  }
}
</script>