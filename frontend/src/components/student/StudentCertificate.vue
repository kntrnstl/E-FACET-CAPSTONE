<template>
  <StudentLayout active-page="certificate">
    <!-- Header Slot -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        v-model="searchQuery"
        @input="handleSearch"
      >
    </template>
    
    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-green-800 mb-6">🎓 Your Certificates</h2>

      <!-- Certificate Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-100 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Certificates</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">{{ certificateStats.total }}</h3>
            </div>
            <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">📜</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Completed</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ certificateStats.completed }}</h3>
            </div>
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">✅</span>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">In Progress</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ certificateStats.inProgress }}</h3>
            </div>
            <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">⏳</span>
            </div>
          </div>
        </div>
        
        <div class="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Available</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ certificateStats.available }}</h3>
            </div>
            <div class="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Certificate Table -->
      <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-md font-semibold text-green-800">Certificate List</h3>
          <div class="flex items-center gap-2">
            <select 
              v-model="filterStatus"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
            <button 
              @click="refreshCertificates"
              class="p-1 text-green-700 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="Refresh"
            >
              ↻
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p class="mt-2 text-gray-600">Loading certificates...</p>
        </div>

        <!-- Certificate Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Course</th>
                <th class="py-3 px-4 text-left font-medium">Certificate Type</th>
                <th class="py-3 px-4 text-left font-medium">Issue Date</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="certificate in filteredCertificates" 
                :key="certificate.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="font-medium text-gray-800">{{ certificate.course }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ certificate.courseCode }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span class="text-yellow-700 text-xs">🏆</span>
                    </div>
                    <span class="text-sm">{{ certificate.type }}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <div class="text-sm text-gray-700">{{ formatDate(certificate.issueDate) }}</div>
                  <div v-if="certificate.expiryDate" class="text-xs text-gray-500">
                    Expires: {{ formatDate(certificate.expiryDate) }}
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span 
                    class="px-3 py-1 rounded-full text-xs font-medium"
                    :class="getStatusClass(certificate.status)"
                  >
                    {{ formatStatus(certificate.status) }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button 
                      @click="viewCertificate(certificate)"
                      class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <span>👁️</span> View
                    </button>
                    <button 
                      v-if="certificate.status === 'completed'"
                      @click="downloadCertificate(certificate)"
                      class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <span>📥</span> Download
                    </button>
                    <button 
                      v-if="certificate.status === 'pending'"
                      @click="requestCertificate(certificate)"
                      class="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
                    >
                      Request
                    </button>
                  </div>
                </td>
              </tr>
              
              <tr v-if="filteredCertificates.length === 0">
                <td colspan="5" class="py-8 text-center text-gray-500">
                  <div class="text-gray-400">
                    <span class="text-3xl mb-2 block">📜</span>
                    <p class="text-gray-500">No certificates found</p>
                    <p class="text-sm text-gray-400 mt-1">Complete courses to earn certificates</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer -->
        <div v-if="filteredCertificates.length > 0" class="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {{ filteredCertificates.length }} of {{ certificates.length }} certificates
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

      <!-- Certificate Preview Modal -->
      <div v-if="showPreviewModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white w-4/5 max-w-4xl p-6 rounded-xl shadow-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-green-800">Certificate Preview</h3>
            <button @click="closePreview" class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <!-- Certificate Design -->
          <div class="border-4 border-gold-500 p-8 bg-gradient-to-br from-white to-gray-50">
            <div class="text-center mb-6">
              <div class="flex justify-center mb-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span class="text-green-700 text-2xl">🏆</span>
                </div>
              </div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">CERTIFICATE OF COMPLETION</h1>
              <p class="text-gray-600">This certifies that</p>
              <h2 class="text-4xl font-bold text-green-800 my-4">{{ selectedCertificate?.studentName || 'John Doe' }}</h2>
              <p class="text-gray-600">has successfully completed the course</p>
              <h3 class="text-2xl font-bold text-gray-800 my-3">{{ selectedCertificate?.course }}</h3>
              <p class="text-gray-600">on</p>
              <p class="text-lg font-semibold text-gray-700">{{ formatDate(selectedCertificate?.issueDate) }}</p>
            </div>
            
            <div class="flex justify-between mt-8 pt-6 border-t border-gray-300">
              <div class="text-center">
                <div class="font-bold text-gray-700 mb-2">Instructor</div>
                <div class="h-0.5 w-20 bg-gray-400 mx-auto mb-2"></div>
                <div class="text-sm">Mr. Juan Dela Cruz</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-gray-700 mb-2">Signature</div>
                <div class="h-0.5 w-20 bg-gray-400 mx-auto mb-2"></div>
                <div class="text-sm">___________________</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-gray-700 mb-2">FACET Seal</div>
                <div class="h-0.5 w-20 bg-gray-400 mx-auto mb-2"></div>
                <div class="text-sm">
                  <div class="w-12 h-12 bg-green-800 text-white rounded-full flex items-center justify-center text-xs mx-auto">
                    FACET
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end gap-3">
            <button 
              @click="closePreview"
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button 
              @click="downloadCertificate(selectedCertificate)"
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Download PDF
            </button>
            <button 
              @click="shareCertificate"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Certificate Activity -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-green-800">📝 Recent Certificate Activity</h3>
          <button 
            @click="viewAllCertificates"
            class="text-green-700 hover:text-green-800 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="activity in recentActivity" 
            :key="activity.id"
            class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center', getActivityIconClass(activity.type)]">
                <span class="text-white text-sm">{{ getActivityIcon(activity.type) }}</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ activity.course }} • {{ formatTimeAgo(activity.time) }}</p>
              </div>
            </div>
            <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{{ activity.status }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State (if no certificates) -->
      <div v-if="certificates.length === 0 && !loading" class="mt-8 text-center py-12">
        <div class="text-gray-400 mb-4">
          <span class="text-6xl">📜</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Certificates Yet</h3>
        <p class="text-gray-600 mb-6">Complete your courses to earn certificates</p>
        <button 
          @click="viewCourses"
          class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          View Courses
        </button>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentCertificate',
  components: {
    StudentLayout
  },
  setup() {
    const router = useRouter()
    
    // State
    const searchQuery = ref('')
    const filterStatus = ref('all')
    const loading = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(8)
    const showPreviewModal = ref(false)
    
    // Selected certificate for preview
    const selectedCertificate = ref(null)
    
    // Certificate data
    const certificates = ref([
      {
        id: 1,
        course: 'Basic Driving',
        courseCode: 'DRV-101',
        type: 'Certificate of Completion',
        issueDate: '2025-11-15',
        expiryDate: '2026-11-15',
        status: 'completed',
        studentName: 'John Doe',
        fileUrl: '/certificates/basic-driving.pdf'
      },
      {
        id: 2,
        course: 'Traffic Rules',
        courseCode: 'TRF-201',
        type: 'Certificate of Participation',
        issueDate: '2025-11-10',
        expiryDate: null,
        status: 'completed',
        studentName: 'John Doe',
        fileUrl: '/certificates/traffic-rules.pdf'
      },
      {
        id: 3,
        course: 'Safety Orientation',
        courseCode: 'SAF-301',
        type: 'Certificate of Achievement',
        issueDate: '2025-11-05',
        expiryDate: '2026-11-05',
        status: 'completed',
        studentName: 'John Doe',
        fileUrl: '/certificates/safety-orientation.pdf'
      },
      {
        id: 4,
        course: 'Vehicle Maintenance',
        courseCode: 'VHC-102',
        type: 'Certificate of Completion',
        issueDate: null,
        expiryDate: null,
        status: 'in-progress',
        studentName: 'John Doe',
        fileUrl: null
      },
      {
        id: 5,
        course: 'Defensive Driving',
        courseCode: 'DEF-302',
        type: 'Advanced Certificate',
        issueDate: null,
        expiryDate: null,
        status: 'pending',
        studentName: 'John Doe',
        fileUrl: null
      },
      {
        id: 6,
        course: 'Road Safety Fundamentals',
        courseCode: 'RSF-202',
        type: 'Certificate of Completion',
        issueDate: '2025-10-28',
        expiryDate: '2026-10-28',
        status: 'completed',
        studentName: 'John Doe',
        fileUrl: '/certificates/road-safety.pdf'
      }
    ])
    
    const recentActivity = ref([
      {
        id: 1,
        type: 'issued',
        description: 'Certificate issued for Basic Driving',
        course: 'DRV-101',
        time: '2025-11-15T14:30:00',
        status: 'Issued'
      },
      {
        id: 2,
        type: 'completed',
        description: 'Course completed for Traffic Rules',
        course: 'TRF-201',
        time: '2025-11-14T10:15:00',
        status: 'Completed'
      },
      {
        id: 3,
        type: 'progress',
        description: 'Vehicle Maintenance course progress',
        course: 'VHC-102',
        time: '2025-11-13T16:45:00',
        status: '75% Complete'
      },
      {
        id: 4,
        type: 'request',
        description: 'Certificate requested for Defensive Driving',
        course: 'DEF-302',
        time: '2025-11-12T08:30:00',
        status: 'Pending'
      }
    ])
    
    const certificateStats = ref({
      total: 0,
      completed: 0,
      inProgress: 0,
      available: 0
    })

    // Computed properties
    const filteredCertificates = computed(() => {
      let result = [...certificates.value]
      
      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(cert => 
          cert.course.toLowerCase().includes(query) ||
          cert.courseCode.toLowerCase().includes(query) ||
          cert.type.toLowerCase().includes(query)
        )
      }
      
      // Apply status filter
      if (filterStatus.value !== 'all') {
        result = result.filter(cert => cert.status === filterStatus.value)
      }
      
      // Apply pagination
      const startIndex = (currentPage.value - 1) * itemsPerPage.value
      const endIndex = startIndex + itemsPerPage.value
      
      return result.slice(startIndex, endIndex)
    })
    
    const totalPages = computed(() => {
      const totalItems = certificates.value.filter(cert => {
        if (filterStatus.value !== 'all') {
          return cert.status === filterStatus.value
        }
        return true
      }).length
      
      return Math.ceil(totalItems / itemsPerPage.value)
    })

    // Methods
    const handleSearch = () => {
      currentPage.value = 1
    }
    
    const refreshCertificates = () => {
      loading.value = true
      // Simulate API call
      setTimeout(() => {
        loading.value = false
        console.log('Certificates refreshed')
      }, 800)
    }
    
    const getStatusClass = (status) => {
      switch(status) {
        case 'completed': return 'bg-green-100 text-green-800'
        case 'in-progress': return 'bg-yellow-100 text-yellow-800'
        case 'pending': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    const formatStatus = (status) => {
      const statusMap = {
        'completed': 'Completed',
        'in-progress': 'In Progress',
        'pending': 'Pending'
      }
      return statusMap[status] || status
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Not yet issued'
      
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    const formatTimeAgo = (dateString) => {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffHours < 1) return 'Just now'
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        'issued': '📜',
        'completed': '✅',
        'progress': '📈',
        'request': '📝'
      }
      return icons[type] || '📌'
    }
    
    const getActivityIconClass = (type) => {
      const classes = {
        'issued': 'bg-green-500',
        'completed': 'bg-blue-500',
        'progress': 'bg-yellow-500',
        'request': 'bg-purple-500'
      }
      return classes[type] || 'bg-gray-500'
    }
    
    const viewCertificate = (certificate) => {
      selectedCertificate.value = certificate
      showPreviewModal.value = true
    }
    
    const closePreview = () => {
      showPreviewModal.value = false
      selectedCertificate.value = null
    }
    
    const downloadCertificate = (certificate) => {
      if (certificate.status !== 'completed') {
        alert('Certificate is not available for download yet.')
        return
      }
      
      console.log('Downloading certificate:', certificate.course)
      
      // In a real app, this would trigger a PDF download
      // For demo, we'll simulate the download
      const link = document.createElement('a')
      link.href = certificate.fileUrl || '#'
      link.download = `${certificate.courseCode}_Certificate.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Show success message
      alert(`Downloading ${certificate.course} certificate...`)
    }
    
    const requestCertificate = (certificate) => {
      console.log('Requesting certificate:', certificate.course)
      
      // Update certificate status to in-progress
      const certIndex = certificates.value.findIndex(c => c.id === certificate.id)
      if (certIndex !== -1) {
        certificates.value[certIndex].status = 'in-progress'
        
        // Add activity
        recentActivity.value.unshift({
          id: recentActivity.value.length + 1,
          type: 'request',
          description: `Certificate requested for ${certificate.course}`,
          course: certificate.courseCode,
          time: new Date().toISOString(),
          status: 'Requested'
        })
      }
      
      alert(`Certificate request submitted for ${certificate.course}.`)
    }
    
    const shareCertificate = () => {
      if (!selectedCertificate.value) return
      
      const certificate = selectedCertificate.value
      const text = `I just earned a ${certificate.type} for ${certificate.course} from FACET!`
      
      if (navigator.share) {
        navigator.share({
          title: `${certificate.course} Certificate`,
          text: text,
          url: window.location.href
        })
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(text)
          .then(() => alert('Share text copied to clipboard!'))
          .catch(() => prompt('Copy this text to share:', text))
      }
    }
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const viewAllCertificates = () => {
      console.log('View all certificates')
      // Navigate to all certificates page
      // router.push('/student-certificates/all')
    }
    
    const viewCourses = () => {
      console.log('Viewing courses')
      router.push('/student-course')
    }
    
    const updateCertificateStats = () => {
      const stats = {
        total: certificates.value.length,
        completed: certificates.value.filter(c => c.status === 'completed').length,
        inProgress: certificates.value.filter(c => c.status === 'in-progress').length,
        available: certificates.value.filter(c => c.status === 'completed' || c.status === 'in-progress').length
      }
      
      certificateStats.value = stats
    }

    // Lifecycle
    onMounted(() => {
      updateCertificateStats()
      
      // Load user data from localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          
          // Update certificate student names
          certificates.value.forEach(cert => {
            cert.studentName = user.fullname || user.username || 'Student'
          })
        } catch (error) {
          console.error('Error parsing user data:', error)
        }
      }
    })

    return {
      // State
      searchQuery,
      filterStatus,
      loading,
      currentPage,
      showPreviewModal,
      selectedCertificate,
      
      // Data
      certificates,
      recentActivity,
      certificateStats,
      
      // Computed
      filteredCertificates,
      totalPages,
      
      // Methods
      handleSearch,
      refreshCertificates,
      getStatusClass,
      formatStatus,
      formatDate,
      formatTimeAgo,
      getActivityIcon,
      getActivityIconClass,
      viewCertificate,
      closePreview,
      downloadCertificate,
      requestCertificate,
      shareCertificate,
      prevPage,
      nextPage,
      viewAllCertificates,
      viewCourses
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.transition-all {
  transition: all 0.3s ease-in-out;
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

/* Certificate border effect */
.border-gold-500 {
  border-color: #d4af37;
}

/* Modal backdrop */
.bg-opacity-50 {
  backdrop-filter: blur(4px);
}

/* Certificate preview animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fixed.inset-0 {
  animation: fadeIn 0.3s ease-out;
}
</style>