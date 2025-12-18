<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search exam..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">🧠 Mock Exam Management</h2>
        <button 
          @click="openAddModal"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          ➕ Add New Mock Exam
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <p class="text-sm text-gray-600">Total Exams</p>
          <h3 class="text-2xl font-bold text-green-800 mt-1">{{ examStats.totalExams }}</h3>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p class="text-sm text-gray-600">Active Exams</p>
          <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ examStats.activeExams }}</h3>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p class="text-sm text-gray-600">Total Attempts</p>
          <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ examStats.totalAttempts }}</h3>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p class="text-sm text-gray-600">Average Score</p>
          <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ examStats.averageScore }}%</h3>
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
            <option value="Traffic Rules">Traffic Rules</option>
            <option value="Safety">Safety</option>
            <option value="Driving NC II">Driving NC II</option>
            <option value="Electrical Installation">Electrical Installation</option>
            <option value="Cookery">Cookery</option>
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
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
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
            @click="exportExams"
            class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Export
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading exams...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-bold text-green-800">All Mock Exams</h3>
          <div class="text-sm text-gray-600">
            Showing {{ filteredExams.length }} of {{ exams.length }} exams
          </div>
        </div>
        
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Exam Title</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Total Questions</th>
              <th class="py-3 px-4 text-left font-medium">Time Limit</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="exam in filteredExams" 
              :key="exam.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div>
                  <p class="font-medium">{{ exam.title }}</p>
                  <p class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                    {{ exam.description }}
                  </p>
                </div>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium">{{ exam.course }}</span>
              </td>
              <td class="py-3 px-4">{{ exam.totalQuestions }}</td>
              <td class="py-3 px-4">{{ exam.timeLimit }} min</td>
              <td class="py-3 px-4">
                <span 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(exam.status)"
                >
                  {{ formatStatus(exam.status) }}
                </span>
              </td>
              <td class="py-3 px-4">
                <div class="flex gap-2">
                  <button 
                    @click="viewExam(exam)" 
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded"
                  >
                    View
                  </button>
                  <button 
                    @click="editExam(exam)" 
                    class="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-2 py-1 hover:bg-yellow-50 rounded"
                  >
                    Edit
                  </button>
                  <button 
                    v-if="exam.status === 'draft'"
                    @click="publishExam(exam)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 hover:bg-green-50 rounded"
                  >
                    Publish
                  </button>
                  <button 
                    @click="confirmDelete(exam)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredExams.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">
                <div class="text-gray-400">
                  <span class="text-3xl mb-2 block">🧠</span>
                  <p class="text-gray-500">No exams found</p>
                  <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new exam</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredExams.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ filteredExams.length }} items
        </div>
        <div class="flex gap-1">
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">← Previous</button>
          <button class="px-3 py-1 bg-green-700 text-white rounded text-sm">1</button>
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next →</button>
        </div>
      </div>

      <!-- Recent Attempts Section -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-green-800">📊 Recent Exam Attempts</h3>
          <button 
            @click="viewAllAttempts"
            class="text-green-700 hover:text-green-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="py-2 px-4 text-left font-medium text-gray-600">Student</th>
                <th class="py-2 px-4 text-left font-medium text-gray-600">Exam</th>
                <th class="py-2 px-4 text-left font-medium text-gray-600">Score</th>
                <th class="py-2 px-4 text-left font-medium text-gray-600">Time Taken</th>
                <th class="py-2 px-4 text-left font-medium text-gray-600">Date</th>
                <th class="py-2 px-4 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="attempt in recentAttempts" 
                :key="attempt.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {{ getInitials(attempt.studentName) }}
                    </div>
                    {{ attempt.studentName }}
                  </div>
                </td>
                <td class="py-3 px-4">{{ attempt.examTitle }}</td>
                <td class="py-3 px-4">
                  <span :class="getScoreClass(attempt.score)">
                    {{ attempt.score }}%
                  </span>
                </td>
                <td class="py-3 px-4">{{ attempt.timeTaken }} min</td>
                <td class="py-3 px-4 text-gray-500">{{ formatDate(attempt.date) }}</td>
                <td class="py-3 px-4">
                  <button 
                    @click="viewAttemptDetails(attempt)"
                    class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">
              {{ isEditing ? 'Edit Exam' : 'Add New Mock Exam' }}
            </h3>
            <button 
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
          
          <form @submit.prevent="saveExam">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                <input 
                  type="text" 
                  v-model="formData.title"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter exam title"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  v-model="formData.description"
                  rows="2"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter exam description"
                ></textarea>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select 
                    v-model="formData.course"
                    required
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="" disabled>Select course</option>
                    <option value="Traffic Rules">Traffic Rules</option>
                    <option value="Safety">Safety</option>
                    <option value="Driving NC II">Driving NC II</option>
                    <option value="Electrical Installation">Electrical Installation</option>
                    <option value="Cookery">Cookery</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    v-model="formData.status"
                    required
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                  <input 
                    type="number" 
                    v-model.number="formData.totalQuestions"
                    required
                    min="1"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Number of questions"
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                  <input 
                    type="number" 
                    v-model.number="formData.timeLimit"
                    required
                    min="1"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    placeholder="Time in minutes"
                  >
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Passing Score (%)</label>
                <input 
                  type="number" 
                  v-model.number="formData.passingScore"
                  required
                  min="0"
                  max="100"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Minimum passing score"
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
            Are you sure you want to delete <span class="font-semibold">{{ examToDelete?.title }}</span>? 
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
            @click="deleteExam"
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
  name: 'AdminMockExam',
  components: {
    AdminLayout
  },
  setup() {
    // State
    const exams = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const selectedCourse = ref('')
    const selectedStatus = ref('')
    const sortBy = ref('title')
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const examToDelete = ref(null)
    
    // Form data
    const formData = reactive({
      id: null,
      title: '',
      description: '',
      course: '',
      status: 'draft',
      totalQuestions: 20,
      timeLimit: 30,
      passingScore: 75
    })
    
    // Stats
    const examStats = reactive({
      totalExams: 12,
      activeExams: 8,
      totalAttempts: 152,
      averageScore: 82
    })
    
    // Recent attempts data
    const recentAttempts = ref([
      { id: 1, studentName: 'John Doe', examTitle: 'Traffic Rules Mock Exam', score: 85, timeTaken: 25, date: '2025-11-15' },
      { id: 2, studentName: 'Jane Smith', examTitle: 'Safety Orientation Exam', score: 92, timeTaken: 20, date: '2025-11-14' },
      { id: 3, studentName: 'Michael Reyes', examTitle: 'Traffic Rules Mock Exam', score: 78, timeTaken: 28, date: '2025-11-13' },
      { id: 4, studentName: 'Sarah Johnson', examTitle: 'Safety Orientation Exam', score: 65, timeTaken: 35, date: '2025-11-12' },
      { id: 5, studentName: 'Robert Chen', examTitle: 'Traffic Rules Mock Exam', score: 95, timeTaken: 22, date: '2025-11-11' }
    ])
    
    // Computed properties
    const filteredExams = computed(() => {
      let result = [...exams.value]
      
      // Apply search
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(exam => 
          exam.title.toLowerCase().includes(query) ||
          exam.description.toLowerCase().includes(query) ||
          exam.course.toLowerCase().includes(query)
        )
      }
      
      // Apply course filter
      if (selectedCourse.value) {
        result = result.filter(exam => exam.course === selectedCourse.value)
      }
      
      // Apply status filter
      if (selectedStatus.value) {
        result = result.filter(exam => exam.status === selectedStatus.value)
      }
      
      // Apply sorting
      result.sort((a, b) => {
        switch(sortBy.value) {
          case 'title':
            return a.title.localeCompare(b.title)
          case 'course':
            return a.course.localeCompare(b.course)
          case 'questions':
            return b.totalQuestions - a.totalQuestions
          case 'status':
            return a.status.localeCompare(b.status)
          default:
            return 0
        }
      })
      
      return result
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
    
    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }
    
    const getStatusClass = (status) => {
      switch(status) {
        case 'active': return 'bg-green-100 text-green-800'
        case 'draft': return 'bg-yellow-100 text-yellow-800'
        case 'archived': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    const formatStatus = (status) => {
      return status.charAt(0).toUpperCase() + status.slice(1)
    }
    
    const getScoreClass = (score) => {
      if (score >= 90) return 'text-green-600 font-semibold'
      if (score >= 75) return 'text-blue-600 font-semibold'
      if (score >= 60) return 'text-yellow-600 font-semibold'
      return 'text-red-600 font-semibold'
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedCourse.value = ''
      selectedStatus.value = ''
    }
    
    const exportExams = () => {
      alert('Exporting exams data...')
    }
    
    const openAddModal = () => {
      isEditing.value = false
      resetForm()
      showModal.value = true
    }
    
    const editExam = (exam) => {
      isEditing.value = true
      Object.assign(formData, exam)
      showModal.value = true
    }
    
    const viewExam = (exam) => {
      alert(`View exam: ${exam.title}`)
    }
    
    const publishExam = (exam) => {
      if (confirm(`Publish "${exam.title}"?`)) {
        exam.status = 'active'
      }
    }
    
    const closeModal = () => {
      showModal.value = false
      resetForm()
    }
    
    const resetForm = () => {
      formData.id = null
      formData.title = ''
      formData.description = ''
      formData.course = ''
      formData.status = 'draft'
      formData.totalQuestions = 20
      formData.timeLimit = 30
      formData.passingScore = 75
    }
    
    const saveExam = () => {
      if (isEditing.value) {
        // Update existing exam
        const index = exams.value.findIndex(e => e.id === formData.id)
        if (index !== -1) {
          exams.value[index] = { ...formData }
        }
      } else {
        // Add new exam
        const newExam = {
          id: exams.value.length + 1,
          ...formData
        }
        exams.value.unshift(newExam)
      }
      
      closeModal()
    }
    
    const confirmDelete = (exam) => {
      examToDelete.value = exam
      showDeleteModal.value = true
    }
    
    const cancelDelete = () => {
      examToDelete.value = null
      showDeleteModal.value = false
    }
    
    const deleteExam = () => {
      if (examToDelete.value) {
        exams.value = exams.value.filter(e => e.id !== examToDelete.value.id)
      }
      cancelDelete()
    }
    
    const viewAllAttempts = () => {
      alert('Viewing all exam attempts...')
    }
    
    const viewAttemptDetails = (attempt) => {
      alert(`Viewing attempt details for ${attempt.studentName}`)
    }
    
    // Fetch initial data
    const fetchExams = () => {
      setTimeout(() => {
        exams.value = [
          { 
            id: 1, 
            title: 'Traffic Rules Mock Exam', 
            description: 'Test your knowledge of traffic rules and regulations',
            course: 'Traffic Rules', 
            totalQuestions: 20, 
            timeLimit: 30,
            passingScore: 75,
            status: 'active' 
          },
          { 
            id: 2, 
            title: 'Safety Orientation Exam', 
            description: 'Safety protocols and best practices',
            course: 'Safety', 
            totalQuestions: 15, 
            timeLimit: 20,
            passingScore: 80,
            status: 'draft' 
          },
          { 
            id: 3, 
            title: 'Driving Techniques Assessment', 
            description: 'Practical driving skills evaluation',
            course: 'Driving NC II', 
            totalQuestions: 25, 
            timeLimit: 40,
            passingScore: 70,
            status: 'active' 
          },
          { 
            id: 4, 
            title: 'Electrical Safety Exam', 
            description: 'Electrical installation safety guidelines',
            course: 'Electrical Installation', 
            totalQuestions: 30, 
            timeLimit: 45,
            passingScore: 80,
            status: 'active' 
          },
          { 
            id: 5, 
            title: 'Food Safety Quiz', 
            description: 'Food handling and safety regulations',
            course: 'Cookery', 
            totalQuestions: 18, 
            timeLimit: 25,
            passingScore: 85,
            status: 'archived' 
          }
        ]
        loading.value = false
      }, 500)
    }
    
    onMounted(() => {
      fetchExams()
    })
    
    return {
      // State
      exams,
      loading,
      searchQuery,
      selectedCourse,
      selectedStatus,
      sortBy,
      showModal,
      showDeleteModal,
      isEditing,
      examToDelete,
      formData,
      examStats,
      recentAttempts,
      
      // Computed
      filteredExams,
      
      // Methods
      formatDate,
      getInitials,
      getStatusClass,
      formatStatus,
      getScoreClass,
      clearFilters,
      exportExams,
      openAddModal,
      editExam,
      viewExam,
      publishExam,
      closeModal,
      saveExam,
      confirmDelete,
      cancelDelete,
      deleteExam,
      viewAllAttempts,
      viewAttemptDetails
    }
  }
}
</script>