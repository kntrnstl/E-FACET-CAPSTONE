<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search student..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">👨‍🎓 Students Management</h2>
        <button 
          @click="openAddModal"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          ➕ Add New Student
        </button>
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
            <option value="ATDC NC I">ATDC NC I</option>
            <option value="Electrical Installation NC II">Electrical Installation NC II</option>
            <option value="Cookery NC II">Cookery NC II</option>
            <option value="Bread & Pastry">Bread & Pastry</option>
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
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
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
        <p class="mt-3 text-gray-600">Loading students...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredStudents.length }} of {{ students.length }} students
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Sort by:</span>
            <select 
              v-model="sortBy"
              class="text-sm border rounded px-2 py-1"
            >
              <option value="name">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
              <option value="date">Recently Added</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
        
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Student</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="student in filteredStudents" 
              :key="student.id" 
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4 flex items-center gap-3">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                  {{ getInitials(student.name) }}
                </div>
                <div>
                  <p class="font-medium">{{ student.name }}</p>
                  <p class="text-xs text-gray-500">{{ student.email }}</p>
                </div>
              </td>
              <td class="py-3 px-4">{{ student.course }}</td>
              <td class="py-3 px-4">
                <span :class="getStatusClass(student.status)">
                  {{ formatStatus(student.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <button 
                  @click="viewStudent(student)" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  View
                </button>
                <button 
                  @click="editStudent(student)" 
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                >
                  Edit
                </button>
                <button 
                  @click="confirmDelete(student)"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="filteredStudents.length === 0">
              <td colspan="4" class="py-8 text-center text-gray-500">
                No students found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredStudents.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ filteredStudents.length }} items
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
      <div class="bg-white rounded-lg w-full max-w-md">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">
              {{ isEditing ? 'Edit Student' : 'Add New Student' }}
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          <form @submit.prevent="saveStudent">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  v-model="formData.name"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter student name"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  v-model="formData.email"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter student email"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select 
                  v-model="formData.course"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select a course</option>
                  <option value="Driving NC II">Driving NC II</option>
                  <option value="ATDC NC I">ATDC NC I</option>
                  <option value="Electrical Installation NC II">Electrical Installation NC II</option>
                  <option value="Cookery NC II">Cookery NC II</option>
                  <option value="Bread & Pastry">Bread & Pastry</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  v-model="formData.status"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
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
            Are you sure you want to delete <span class="font-semibold">{{ studentToDelete?.name }}</span>? 
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
            @click="deleteStudent"
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
  name: 'AdminStudents',
  components: {
    AdminLayout
  },
  setup() {
    // State
    const students = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const selectedCourse = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('name')
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const studentToDelete = ref(null)
    
    // Form data
    const formData = reactive({
      id: null,
      name: '',
      email: '',
      course: '',
      status: 'active'
    })
    
    // Computed properties
    const filteredStudents = computed(() => {
      let result = [...students.value]
      
      // Apply search
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(student => 
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.course.toLowerCase().includes(query)
        )
      }
      
      // Apply course filter
      if (selectedCourse.value) {
        result = result.filter(student => student.course === selectedCourse.value)
      }
      
      // Apply status filter
      if (selectedStatus.value) {
        result = result.filter(student => student.status === selectedStatus.value)
      }
      
      // Apply sorting
      result.sort((a, b) => {
        switch(sortBy.value) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'nameDesc':
            return b.name.localeCompare(a.name)
          case 'date':
            return new Date(b.enrollmentDate) - new Date(a.enrollmentDate)
          case 'status':
            return a.status.localeCompare(b.status)
          default:
            return 0
        }
      })
      
      return result
    })
    
    // Methods
    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }
    
    const getStatusClass = (status) => {
      switch(status) {
        case 'active': return 'text-green-600 font-semibold'
        case 'pending': return 'text-yellow-600 font-semibold'
        case 'inactive': return 'text-red-600 font-semibold'
        default: return 'text-gray-600'
      }
    }
    
    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedCourse.value = ''
      selectedStatus.value = ''
    }
    
    const openAddModal = () => {
      isEditing.value = false
      resetForm()
      showModal.value = true
    }
    
    const editStudent = (student) => {
      isEditing.value = true
      Object.assign(formData, student)
      showModal.value = true
    }
    
    const viewStudent = (student) => {
      alert(`View student: ${student.name}`)
      // In real app, navigate to student detail page
    }
    
    const closeModal = () => {
      showModal.value = false
      resetForm()
    }
    
    const resetForm = () => {
      formData.id = null
      formData.name = ''
      formData.email = ''
      formData.course = ''
      formData.status = 'active'
    }
    
    const saveStudent = () => {
      if (isEditing.value) {
        // Update existing student
        const index = students.value.findIndex(s => s.id === formData.id)
        if (index !== -1) {
          students.value[index] = { ...formData }
        }
      } else {
        // Add new student
        const newStudent = {
          id: students.value.length + 1,
          ...formData,
          enrollmentDate: new Date().toISOString().split('T')[0]
        }
        students.value.unshift(newStudent)
      }
      
      closeModal()
    }
    
    const confirmDelete = (student) => {
      studentToDelete.value = student
      showDeleteModal.value = true
    }
    
    const cancelDelete = () => {
      studentToDelete.value = null
      showDeleteModal.value = false
    }
    
    const deleteStudent = () => {
      if (studentToDelete.value) {
        students.value = students.value.filter(s => s.id !== studentToDelete.value.id)
      }
      cancelDelete()
    }
    
    // Fetch initial data
    const fetchStudents = () => {
      // Simulate API call
      setTimeout(() => {
        students.value = [
          { id: 1, name: 'John Doe', email: 'john@example.com', course: 'Driving NC II', status: 'active', enrollmentDate: '2025-11-01' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com', course: 'ATDC NC I', status: 'pending', enrollmentDate: '2025-10-29' },
          { id: 3, name: 'Michael Reyes', email: 'michael@example.com', course: 'Driving NC II', status: 'active', enrollmentDate: '2025-10-27' },
          { id: 4, name: 'Sarah Johnson', email: 'sarah@example.com', course: 'Cookery NC II', status: 'pending', enrollmentDate: '2025-10-25' },
          { id: 5, name: 'Robert Chen', email: 'robert@example.com', course: 'Bread & Pastry', status: 'inactive', enrollmentDate: '2025-10-23' },
          { id: 6, name: 'Lisa Wang', email: 'lisa@example.com', course: 'Driving NC II', status: 'active', enrollmentDate: '2025-10-20' }
        ]
        loading.value = false
      }, 500)
    }
    
    onMounted(() => {
      fetchStudents()
    })
    
    return {
      // State
      students,
      loading,
      searchQuery,
      selectedCourse,
      selectedStatus,
      sortBy,
      showModal,
      showDeleteModal,
      isEditing,
      studentToDelete,
      formData,
      
      // Computed
      filteredStudents,
      
      // Methods
      getInitials,
      getStatusClass,
      formatStatus,
      clearFilters,
      openAddModal,
      editStudent,
      viewStudent,
      closeModal,
      saveStudent,
      confirmDelete,
      cancelDelete,
      deleteStudent
    }
  }
}
</script>