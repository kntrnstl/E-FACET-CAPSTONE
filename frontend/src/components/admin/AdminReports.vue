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
        <h2 class="text-lg font-bold text-green-800">📈 Analytics & Reports</h2>
        <button 
          @click="exportAllReports"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          📤 Export All
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <p class="text-sm text-green-700 font-medium">Total Enrolled</p>
          <h3 class="text-2xl font-bold text-green-800 mt-1">{{ summaryStats.totalEnrolled }}</h3>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p class="text-sm text-blue-700 font-medium">Most Popular Course</p>
          <h3 class="text-lg font-bold text-blue-800 mt-1">{{ summaryStats.mostPopularCourse }}</h3>
        </div>
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p class="text-sm text-yellow-700 font-medium">Avg. Monthly Enrollments</p>
          <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ summaryStats.avgMonthlyEnrollments }}</h3>
        </div>
        <div class="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <p class="text-sm text-orange-700 font-medium">Available Slots</p>
          <h3 class="text-2xl font-bold text-orange-800 mt-1">{{ summaryStats.availableSlots }}</h3>
        </div>
        <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <p class="text-sm text-emerald-700 font-medium">💰 Total Revenue</p>
          <h3 class="text-2xl font-bold text-emerald-800 mt-1">{{ formatCurrency(summaryStats.totalRevenue) }}</h3>
        </div>
      </div>

      <!-- Date Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <select 
            v-model="selectedDateRange"
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div v-if="selectedDateRange === 'custom'" class="flex items-end gap-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input 
              type="date" 
              v-model="customDateFrom"
              class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input 
              type="date" 
              v-model="customDateTo"
              class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
          </div>
        </div>

        <div class="flex items-end gap-2">
          <button 
            @click="applyFilters"
            class="px-3 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
          >
            Apply
          </button>
          <button 
            @click="clearFilters"
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Student Growth Chart -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-green-800 font-semibold">Student Growth</h3>
            <div class="flex gap-1">
              <button 
                @click="setChartPeriod('month')"
                :class="chartPeriod === 'month' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'"
                class="text-sm px-2 py-1 rounded hover:bg-green-200"
              >
                Month
              </button>
              <button 
                @click="setChartPeriod('quarter')"
                :class="chartPeriod === 'quarter' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'"
                class="text-sm px-2 py-1 rounded hover:bg-green-200"
              >
                Quarter
              </button>
              <button 
                @click="setChartPeriod('year')"
                :class="chartPeriod === 'year' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'"
                class="text-sm px-2 py-1 rounded hover:bg-green-200"
              >
                Year
              </button>
              <button 
                @click="exportChart('bar')"
                class="text-sm px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                📤
              </button>
            </div>
          </div>
          <div class="h-64">
            <canvas ref="barChartCanvas"></canvas>
          </div>
          <div class="mt-4 grid grid-cols-3 text-center text-sm text-gray-700 border-t pt-3">
            <div>
              <p class="font-semibold text-green-700">↑ {{ growthRate }}%</p>
              <p class="text-xs">Growth Rate</p>
            </div>
            <div>
              <p class="font-semibold text-blue-700">{{ newStudents }}</p>
              <p class="text-xs">New Students</p>
            </div>
            <div>
              <p class="font-semibold text-yellow-700">{{ returningStudents }}</p>
              <p class="text-xs">Returning Students</p>
            </div>
          </div>
        </div>

        <!-- Top Courses Chart -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-green-800 font-semibold">Top Courses</h3>
            <div class="flex gap-1">
              <button 
                @click="setTopCoursesPeriod('month')"
                :class="topCoursesPeriod === 'month' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'"
                class="text-sm px-2 py-1 rounded hover:bg-green-200"
              >
                Month
              </button>
              <button 
                @click="setTopCoursesPeriod('quarter')"
                :class="topCoursesPeriod === 'quarter' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'"
                class="text-sm px-2 py-1 rounded hover:bg-green-200"
              >
                Quarter
              </button>
              <button 
                @click="setTopCoursesPeriod('year')"
                :class="topCoursesPeriod === 'year' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700'"
                class="text-sm px-2 py-1 rounded hover:bg-green-200"
              >
                Year
              </button>
              <button 
                @click="exportChart('pie')"
                class="text-sm px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                📤
              </button>
            </div>
          </div>
          <div class="h-64">
            <canvas ref="pieChartCanvas"></canvas>
          </div>
          <div class="mt-4 grid grid-cols-3 text-center text-sm text-gray-700 border-t pt-3">
            <div>
              <p class="font-semibold text-green-700">{{ topCourses[0]?.name || 'Driving NC II' }}</p>
              <p class="text-xs">{{ topCourses[0]?.percentage || '45' }}%</p>
            </div>
            <div>
              <p class="font-semibold text-blue-700">{{ topCourses[1]?.name || 'ATDC NC I' }}</p>
              <p class="text-xs">{{ topCourses[1]?.percentage || '35' }}%</p>
            </div>
            <div>
              <p class="font-semibold text-yellow-700">{{ topCourses[2]?.name || 'Bread & Pastry' }}</p>
              <p class="text-xs">{{ topCourses[2]?.percentage || '20' }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Exam Result Summary -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-green-800 font-semibold flex items-center gap-2">🧑‍🏫 Exam Result Summary</h3>
          <button 
            @click="exportExamResults"
            class="text-sm px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            📤 Export
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-green-50 p-5 rounded-lg border border-green-100 text-center">
            <p class="text-sm text-green-700 font-medium">Passing Rate</p>
            <h3 class="text-3xl font-bold text-green-800 mt-1">{{ examStats.passingRate }}%</h3>
          </div>
          <div class="bg-blue-50 p-5 rounded-lg border border-blue-100 text-center">
            <p class="text-sm text-blue-700 font-medium">Highest Score</p>
            <h3 class="text-3xl font-bold text-blue-800 mt-1">{{ examStats.highestScore }}%</h3>
          </div>
          <div class="bg-red-50 p-5 rounded-lg border border-red-100 text-center">
            <p class="text-sm text-red-700 font-medium">Below Passing</p>
            <h3 class="text-3xl font-bold text-red-800 mt-1">{{ examStats.belowPassing }}%</h3>
          </div>
        </div>
      </div>

      <!-- Detailed Reports Table -->
      <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-bold text-green-800">📊 Detailed Reports</h3>
          <div class="text-sm text-gray-600">
            Last updated: {{ lastUpdated }}
          </div>
        </div>
        
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Report Type</th>
              <th class="py-3 px-4 text-left font-medium">Period</th>
              <th class="py-3 px-4 text-left font-medium">Generated Date</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="report in reports" 
              :key="report.id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="font-medium">{{ report.type }}</div>
              </td>
              <td class="py-3 px-4">{{ report.period }}</td>
              <td class="py-3 px-4">{{ formatDate(report.generatedDate) }}</td>
              <td class="py-3 px-4">
                <span :class="getReportStatusClass(report.status)">
                  {{ report.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                <button 
                  @click="viewReport(report)" 
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  View
                </button>
                <button 
                  @click="downloadReport(report)" 
                  class="text-green-600 hover:text-green-800 text-sm font-medium mr-3"
                >
                  Download
                </button>
                <button 
                  @click="generateReport(report.type)"
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                >
                  Regenerate
                </button>
              </td>
            </tr>
            <tr v-if="reports.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-500">
                No reports generated yet
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="reports.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ reports.length }} reports
        </div>
        <div class="flex gap-1">
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">← Previous</button>
          <button class="px-3 py-1 bg-green-700 text-white rounded text-sm">1</button>
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next →</button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import Chart from 'chart.js/auto'
import AdminLayout from './AdminLayout.vue'

export default {
  name: 'AdminReports',
  components: {
    AdminLayout
  },
  setup() {
    // State
    const searchQuery = ref('')
    const selectedDateRange = ref('thisMonth')
    const customDateFrom = ref('')
    const customDateTo = ref('')
    const chartPeriod = ref('month')
    const topCoursesPeriod = ref('month')
    
    // Chart instances
    const barChart = ref(null)
    const pieChart = ref(null)
    
    // Data
    const summaryStats = reactive({
      totalEnrolled: 125,
      mostPopularCourse: 'Driving NC II',
      avgMonthlyEnrollments: 32,
      availableSlots: 18,
      totalRevenue: 245000
    })
    
    const examStats = reactive({
      passingRate: 85,
      highestScore: 95,
      belowPassing: 10
    })
    
    const reports = ref([
      { id: 1, type: 'Enrollment Summary', period: 'November 2025', generatedDate: '2025-11-15', status: 'Ready' },
      { id: 2, type: 'Course Performance', period: 'Q4 2025', generatedDate: '2025-11-10', status: 'Ready' },
      { id: 3, type: 'Revenue Report', period: 'October 2025', generatedDate: '2025-11-05', status: 'Processing' },
      { id: 4, type: 'Student Demographics', period: '2025 Yearly', generatedDate: '2025-11-01', status: 'Ready' },
      { id: 5, type: 'Exam Results', period: 'November 2025', generatedDate: '2025-11-20', status: 'Ready' }
    ])
    
    const topCourses = ref([
      { name: 'Driving NC II', percentage: 45, students: 56 },
      { name: 'ATDC NC I', percentage: 35, students: 44 },
      { name: 'Bread & Pastry', percentage: 20, students: 25 }
    ])
    
    // Computed properties
    const growthRate = computed(() => {
      return chartPeriod.value === 'month' ? 12 : 
             chartPeriod.value === 'quarter' ? 8 : 5
    })
    
    const newStudents = computed(() => {
      return chartPeriod.value === 'month' ? 530 : 
             chartPeriod.value === 'quarter' ? 1200 : 5000
    })
    
    const returningStudents = computed(() => {
      return chartPeriod.value === 'month' ? 480 : 
             chartPeriod.value === 'quarter' ? 1100 : 4500
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
    const formatCurrency = (amount) => {
      return '₱' + amount.toLocaleString('en-PH')
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    
    const getReportStatusClass = (status) => {
      switch(status.toLowerCase()) {
        case 'ready': return 'text-green-600 font-semibold'
        case 'processing': return 'text-yellow-600 font-semibold'
        case 'failed': return 'text-red-600 font-semibold'
        default: return 'text-gray-600'
      }
    }
    
    const applyFilters = () => {
      console.log('Applying filters:', {
        dateRange: selectedDateRange.value,
        customFrom: customDateFrom.value,
        customTo: customDateTo.value
      })
      // In real app, this would trigger API call to fetch filtered data
      updateCharts()
    }
    
    const clearFilters = () => {
      selectedDateRange.value = 'thisMonth'
      customDateFrom.value = ''
      customDateTo.value = ''
      chartPeriod.value = 'month'
      topCoursesPeriod.value = 'month'
      updateCharts()
    }
    
    const setChartPeriod = (period) => {
      chartPeriod.value = period
      updateBarChart()
    }
    
    const setTopCoursesPeriod = (period) => {
      topCoursesPeriod.value = period
      updatePieChart()
    }
    
    const updateBarChart = () => {
      if (!barChart.value) return
      
      const dataMap = {
        month: [15, 25, 22, 30, 45, 40, 50, 65, 60, 75, 70, 80],
        quarter: [120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285],
        year: [500, 520, 540, 560, 580, 600, 620, 640, 660, 680, 700, 720]
      }
      
      const labelsMap = {
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        quarter: ['Q1', 'Q2', 'Q3', 'Q4'],
        year: ['2020', '2021', '2022', '2023', '2024', '2025']
      }
      
      const data = dataMap[chartPeriod.value] || dataMap.month
      const labels = labelsMap[chartPeriod.value] || labelsMap.month
      
      barChart.value.data.labels = labels.slice(0, data.length)
      barChart.value.data.datasets[0].data = data
      barChart.value.update()
    }
    
    const updatePieChart = () => {
      if (!pieChart.value) return
      
      const dataMap = {
        month: [45, 35, 20],
        quarter: [40, 30, 30],
        year: [35, 30, 35]
      }
      
      const data = dataMap[topCoursesPeriod.value] || dataMap.month
      
      pieChart.value.data.datasets[0].data = data
      pieChart.value.update()
    }
    
    const updateCharts = () => {
      updateBarChart()
      updatePieChart()
    }
    
    const exportChart = (chartType) => {
      alert(`Exporting ${chartType} chart data`)
    }
    
    const exportAllReports = () => {
      alert('Exporting all reports as PDF')
    }
    
    const exportExamResults = () => {
      alert('Exporting exam results report')
    }
    
    const viewReport = (report) => {
      alert(`Viewing report: ${report.type} for ${report.period}`)
    }
    
    const downloadReport = (report) => {
      alert(`Downloading report: ${report.type}`)
    }
    
    const generateReport = (reportType) => {
      alert(`Generating new ${reportType} report...`)
      // In real app, this would trigger API call
    }
    
    // Initialize charts
    const initializeCharts = () => {
      // Bar Chart
      const barCtx = barChartCanvas.value.getContext('2d')
      barChart.value = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'New Students',
            data: [15, 25, 22, 30, 45, 40, 50, 65, 60, 75, 70, 80],
            backgroundColor: '#16a34a',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { 
            y: { 
              beginAtZero: true,
              grid: { display: true },
              ticks: { stepSize: 20 }
            },
            x: { 
              grid: { display: false }
            }
          },
          plugins: { 
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
          }
        }
      })
      
      // Pie Chart
      const pieCtx = pieChartCanvas.value.getContext('2d')
      pieChart.value = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Driving NC II', 'ATDC NC I', 'Bread & Pastry'],
          datasets: [{
            data: [45, 35, 20],
            backgroundColor: ['#22c55e', '#3b82f6', '#facc15'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 20 }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || ''
                  const value = context.raw || 0
                  return `${label}: ${value}%`
                }
              }
            }
          }
        }
      })
    }
    
    // Refs for canvas elements
    const barChartCanvas = ref(null)
    const pieChartCanvas = ref(null)
    
    onMounted(() => {
      // Set default custom dates
      const today = new Date()
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      customDateFrom.value = lastMonth.toISOString().split('T')[0]
      customDateTo.value = today.toISOString().split('T')[0]
      
      // Initialize charts after DOM is mounted
      setTimeout(() => {
        if (barChartCanvas.value && pieChartCanvas.value) {
          initializeCharts()
        }
      }, 100)
    })
    
    // Clean up charts
    const cleanupCharts = () => {
      if (barChart.value) barChart.value.destroy()
      if (pieChart.value) pieChart.value.destroy()
    }
    
    return {
      // State
      searchQuery,
      selectedDateRange,
      customDateFrom,
      customDateTo,
      chartPeriod,
      topCoursesPeriod,
      summaryStats,
      examStats,
      reports,
      topCourses,
      
      // Refs
      barChartCanvas,
      pieChartCanvas,
      
      // Computed
      growthRate,
      newStudents,
      returningStudents,
      lastUpdated,
      
      // Methods
      formatCurrency,
      formatDate,
      getReportStatusClass,
      applyFilters,
      clearFilters,
      setChartPeriod,
      setTopCoursesPeriod,
      exportChart,
      exportAllReports,
      exportExamResults,
      viewReport,
      downloadReport,
      generateReport,
      
      // Lifecycle
      onUnmounted: cleanupCharts
    }
  }
}
</script>