<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search courses..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">📚 Courses Management</h2>
        <button 
          @click="openAddModal"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          ▲ Add New Course
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
          <select 
            v-model="selectedType" 
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Types</option>
            <option value="Technical">Technical</option>
            <option value="Vocational">Vocational</option>
            <option value="Short Course">Short Course</option>
            <option value="Certification">Certification</option>
            <option value="Workshop">Workshop</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Duration</label>
          <select 
            v-model="selectedDuration" 
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Durations</option>
            <option value="2 Months">2 Months</option>
            <option value="4 Months">4 Months</option>
            <option value="6 Months">6 Months</option>
            <option value="1 Year">1 Year</option>
            <option value="2 Years">2 Years</option>
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

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading courses...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredCourses.length }} of {{ courses.length }} courses
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Sort by:</span>
            <select 
              v-model="sortBy"
              class="text-sm border rounded px-2 py-1"
            >
              <option value="name">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
              <option value="slots">Available Slots</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
        
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Course Name</th>
              <th class="py-3 px-4 text-left font-medium">Type</th>
              <th class="py-3 px-4 text-left font-medium">Duration</th>
              <th class="py-3 px-4 text-left font-medium">Slots</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="course in filteredCourses" 
              :key="course.id" 
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div>
                  <p class="font-medium">{{ course.name }}</p>
                  <p class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                    {{ course.description }}
                  </p>
                </div>
              </td>
              <td class="py-3 px-4">
                <span :class="getTypeClass(course.type)">
                  {{ course.type }}
                </span>
              </td>
              <td class="py-3 px-4">{{ course.duration }}</td>
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="text-sm font-medium">
                    {{ course.availableSlots }} / {{ course.totalSlots }}
                  </div>
                  <div class="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      class="h-2 rounded-full"
                      :class="getSlotPercentage(course) > 70 ? 'bg-green-500' : getSlotPercentage(course) > 30 ? 'bg-yellow-500' : 'bg-red-500'"
                      :style="{ width: `${getSlotPercentage(course)}%` }"
                    ></div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4">
                <button 
                  @click="viewCourse(course)" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  View
                </button>
                <button 
                  @click="editCourse(course)" 
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                >
                  Edit
                </button>
                <button 
                  @click="confirmDelete(course)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredCourses.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-500">
                No courses found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredCourses.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ filteredCourses.length }} items
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
              {{ isEditing ? 'Edit Course' : 'Add New Course' }}
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          <form @submit.prevent="saveCourse">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input 
                  type="text" 
                  v-model="formData.name"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter course name"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
                <select 
                  v-model="formData.type"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select type</option>
                  <option value="Technical">Technical</option>
                  <option value="Vocational">Vocational</option>
                  <option value="Short Course">Short Course</option>
                  <option value="Certification">Certification</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <select 
                  v-model="formData.duration"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select duration</option>
                  <option value="2 Months">2 Months</option>
                  <option value="4 Months">4 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="2 Years">2 Years</option>
                </select>
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
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  v-model="formData.description"
                  rows="3"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter course description"
                ></textarea>
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
            Are you sure you want to delete <span class="font-semibold">{{ courseToDelete?.name }}</span>? 
            This action will remove all associated data and cannot be undone.
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
            @click="deleteCourse"
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
import { ref, computed, onMounted, reactive, watch } from 'vue'
import AdminLayout from './AdminLayout.vue'

export default {
  name: 'AdminCourses',
  components: {
    AdminLayout
  },
  setup() {
    // State
    const courses = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const selectedType = ref('')
    const selectedDuration = ref('')
    const sortBy = ref('name')
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const courseToDelete = ref(null)
    
    // Form data
    const formData = reactive({
      id: null,
      name: '',
      type: '',
      duration: '',
      totalSlots: 0,
      availableSlots: 0,
      description: ''
    })
    
    // Computed properties
    const filteredCourses = computed(() => {
      let result = [...courses.value]
      
      // Apply search
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(course => 
          course.name.toLowerCase().includes(query) ||
          (course.description && course.description.toLowerCase().includes(query))
        )
      }
      
      // Apply type filter
      if (selectedType.value) {
        result = result.filter(course => course.type === selectedType.value)
      }
      
      // Apply duration filter
      if (selectedDuration.value) {
        result = result.filter(course => course.duration === selectedDuration.value)
      }
      
      // Apply sorting
      result.sort((a, b) => {
        switch(sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'nameDesc':
            return b.name.localeCompare(a.name)
          case 'slots':
            return b.availableSlots - a.availableSlots
          case 'duration':
            // Simple duration comparison based on months
            const getMonths = (duration) => {
              if (duration.includes('Year')) return parseInt(duration) * 12
              if (duration.includes('Month')) return parseInt(duration)
              return 0
            }
            return getMonths(a.duration) - getMonths(b.duration)
          default:
            return 0
        }
      })
      
      return result
    })
    
    // Methods
    const getTypeClass = (type) => {
      switch(type) {
        case 'Technical': return 'text-blue-600 font-semibold'
        case 'Vocational': return 'text-purple-600 font-semibold'
        case 'Short Course': return 'text-yellow-600 font-semibold'
        case 'Certification': return 'text-green-600 font-semibold'
        case 'Workshop': return 'text-indigo-600 font-semibold'
        default: return 'text-gray-600'
      }
    }
    
    const getSlotPercentage = (course) => {
      if (course.totalSlots === 0) return 0
      return Math.round((course.availableSlots / course.totalSlots) * 100)
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedType.value = ''
      selectedDuration.value = ''
    }
    
    const openAddModal = () => {
      isEditing.value = false
      resetForm()
      showModal.value = true
    }
    
    const editCourse = (course) => {
      isEditing.value = true
      Object.assign(formData, course)
      showModal.value = true
    }
    
    const viewCourse = (course) => {
      alert(`View course: ${course.name}`)
      // In real app, navigate to course detail page
    }
    
    const closeModal = () => {
      showModal.value = false
      resetForm()
    }
    
    const resetForm = () => {
      formData.id = null
      formData.name = ''
      formData.type = ''
      formData.duration = ''
      formData.totalSlots = 0
      formData.availableSlots = 0
      formData.description = ''
    }
    
    const saveCourse = () => {
      // Validate available slots don't exceed total slots
      if (formData.availableSlots > formData.totalSlots) {
        alert('Available slots cannot exceed total slots')
        return
      }
      
      if (isEditing.value) {
        // Update existing course
        const index = courses.value.findIndex(c => c.id === formData.id)
        if (index !== -1) {
          courses.value[index] = { ...formData }
        }
      } else {
        // Add new course
        const newCourse = {
          id: courses.value.length + 1,
          ...formData
        }
        courses.value.unshift(newCourse)
      }
      
      closeModal()
    }
    
    const confirmDelete = (course) => {
      courseToDelete.value = course
      showDeleteModal.value = true
    }
    
    const cancelDelete = () => {
      courseToDelete.value = null
      showDeleteModal.value = false
    }
    
    const deleteCourse = () => {
      if (courseToDelete.value) {
        courses.value = courses.value.filter(c => c.id !== courseToDelete.value.id)
      }
      cancelDelete()
    }
    
    // Watch for total slots changes to adjust available slots
    watch(() => formData.totalSlots, (newTotal) => {
      if (formData.availableSlots > newTotal) {
        formData.availableSlots = newTotal
      }
    })
    
    // Fetch initial data
    const fetchCourses = () => {
      // Simulate API call
      setTimeout(() => {
        courses.value = [
          { id: 1, name: 'Driving NC II', type: 'Technical', duration: '6 Months', totalSlots: 20, availableSlots: 20, description: 'Professional driving certification course' },
          { id: 2, name: 'Automotive Servicing NC I', type: 'Vocational', duration: '4 Months', totalSlots: 15, availableSlots: 5, description: 'Basic automotive repair and maintenance' },
          { id: 3, name: 'Bread and Pastry NC II', type: 'Short Course', duration: '2 Months', totalSlots: 30, availableSlots: 10, description: 'Baking and pastry making course' },
          { id: 4, name: 'Electrical Installation NC II', type: 'Technical', duration: '1 Year', totalSlots: 25, availableSlots: 8, description: 'Electrical wiring and installation' },
          { id: 5, name: 'Computer Systems Servicing NC II', type: 'Certification', duration: '6 Months', totalSlots: 35, availableSlots: 15, description: 'Computer repair and network setup' },
          { id: 6, name: 'Cookery NC II', type: 'Vocational', duration: '4 Months', totalSlots: 40, availableSlots: 25, description: 'Professional cooking course' }
        ]
        loading.value = false
      }, 500)
    }
    
    onMounted(() => {
      fetchCourses()
    })
    
    return {
      // State
      courses,
      loading,
      searchQuery,
      selectedType,
      selectedDuration,
      sortBy,
      showModal,
      showDeleteModal,
      isEditing,
      courseToDelete,
      formData,
      
      // Computed
      filteredCourses,
      
      // Methods
      getTypeClass,
      getSlotPercentage,
      clearFilters,
      openAddModal,
      editCourse,
      viewCourse,
      closeModal,
      saveCourse,
      confirmDelete,
      cancelDelete,
      deleteCourse
    }
  }
}
</script>