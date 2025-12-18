<template>
  <AdminLayout active-page="dashboard">
    <!-- Header Slot -->
    <template #header-left>
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Search..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
        @input="handleSearch"
      >
    </template>
    
    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-green-800 mb-6">📊 Dashboard Overview</h2>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-green-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-green-800">{{ dashboardStats.totalStudents }}</h3>
              <p class="text-green-700 font-medium mt-1">Total Students</p>
              <p class="text-sm text-green-600 mt-1">↑ 12% from last month</p>
            </div>
            <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">👨‍🎓</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-blue-800">{{ dashboardStats.activeCourses }}</h3>
              <p class="text-blue-700 font-medium mt-1">Active Courses</p>
              <p class="text-sm text-blue-600 mt-1">3 new this quarter</p>
            </div>
            <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">📚</span>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-yellow-800">{{ dashboardStats.pendingEnrollments }}</h3>
              <p class="text-yellow-700 font-medium mt-1">Pending Enrollments</p>
              <p class="text-sm text-yellow-600 mt-1">Needs attention</p>
            </div>
            <div class="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Enrollments Table -->
      <div class="overflow-x-auto mb-10">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-green-800">Recent Enrollments</h3>
          <button @click="viewAllEnrollments" class="text-green-700 hover:text-green-800 font-medium text-sm">
            View All →
          </button>
        </div>
        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Student</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Date</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="enrollment in filteredEnrollments" :key="enrollment.id" 
                class="border-b hover:bg-gray-50 transition-colors">
              <td class="py-3 px-4 flex items-center gap-2">
                <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                  {{ getInitials(enrollment.student) }}
                </div>
                {{ enrollment.student }}
              </td>
              <td class="py-3 px-4">{{ enrollment.course }}</td>
              <td class="py-3 px-4">{{ formatDate(enrollment.date) }}</td>
              <td class="py-3 px-4">
                <span :class="statusClass(enrollment.status)">
                  {{ enrollment.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                <button @click="viewEnrollment(enrollment)" 
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">
                  View
                </button>
                <button v-if="enrollment.status === 'Pending'" 
                        @click="approveEnrollment(enrollment)"
                        class="text-green-600 hover:text-green-800 text-sm font-medium">
                  Approve
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Charts Section -->
      <div class="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-green-800 font-semibold">Monthly Enrollment Trends</h3>
            <select v-model="chartYear" @change="updateBarChart" class="text-sm border rounded px-2 py-1">
              <option v-for="year in [2024, 2025, 2026]" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>
          <div class="h-64">
            <canvas ref="barChartCanvas"></canvas>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-green-800 font-semibold">Enrollment Status Distribution</h3>
            <button @click="refreshChart" class="text-sm text-green-700 hover:text-green-800">
              ↻ Refresh
            </button>
          </div>
          <div class="h-64">
            <canvas ref="pieChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import AdminLayout from './AdminLayout.vue';
import Chart from 'chart.js/auto';

export default {
  name: 'AdminDashboard',
  components: {
    AdminLayout
  },
  data() {
    return {
      searchQuery: '',
      chartYear: 2025,
      dashboardStats: {
        totalStudents: 230,
        activeCourses: 15,
        pendingEnrollments: 8
      },
      enrollments: [
        { id: 1, student: 'John Doe', course: 'Driving NC II', date: '2025-11-01', status: 'Approved' },
        { id: 2, student: 'Jane Smith', course: 'ATDC NC I', date: '2025-10-29', status: 'Pending' },
        { id: 3, student: 'Michael Reyes', course: 'Driving NC II', date: '2025-10-27', status: 'Approved' },
        { id: 4, student: 'Sarah Johnson', course: 'Cookery NC II', date: '2025-10-25', status: 'Pending' },
        { id: 5, student: 'Robert Chen', course: 'Bread & Pastry', date: '2025-10-23', status: 'Rejected' },
        { id: 6, student: 'Lisa Wang', course: 'Driving NC II', date: '2025-10-20', status: 'Approved' }
      ],
      barChart: null,
      pieChart: null
    }
  },
  computed: {
    filteredEnrollments() {
      if (!this.searchQuery) return this.enrollments;
      
      const query = this.searchQuery.toLowerCase();
      return this.enrollments.filter(enrollment => 
        enrollment.student.toLowerCase().includes(query) ||
        enrollment.course.toLowerCase().includes(query) ||
        enrollment.status.toLowerCase().includes(query)
      );
    }
  },
  mounted() {
    this.initializeCharts();
    this.checkAuth();
  },
  beforeUnmount() {
    if (this.barChart) this.barChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
  },
  methods: {
    async checkAuth() {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status !== 'success' || !data.authenticated) {
          window.location.href = '/login.html';
        } else if (data.user.role !== 'admin') {
          window.location.href = '/student-dashboard.html';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
      }
    },
    
    initializeCharts() {
      // Bar Chart
      const barCtx = this.$refs.barChartCanvas.getContext('2d');
      this.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Enrollments',
            data: [15, 20, 25, 30, 40, 35, 50, 60, 55, 70, 65, 45],
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
              ticks: { stepSize: 10 }
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
      });

      // Pie Chart
      const pieCtx = this.$refs.pieChartCanvas.getContext('2d');
      this.pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [{
            data: [120, 35, 10],
            backgroundColor: ['#22c55e', '#facc15', '#ef4444'],
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
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    
    updateBarChart() {
      // Update bar chart data based on selected year
      const dataMap = {
        2024: [10, 15, 20, 25, 30, 25, 40, 45, 40, 50, 45, 35],
        2025: [15, 20, 25, 30, 40, 35, 50, 60, 55, 70, 65, 45],
        2026: [20, 25, 30, 35, 45, 40, 55, 65, 60, 75, 70, 50]
      };
      
      this.barChart.data.datasets[0].data = dataMap[this.chartYear];
      this.barChart.update();
    },
    
    refreshChart() {
      // Refresh pie chart with updated data
      const approved = Math.floor(Math.random() * 50) + 100;
      const pending = Math.floor(Math.random() * 20) + 20;
      const rejected = Math.floor(Math.random() * 10) + 5;
      
      this.pieChart.data.datasets[0].data = [approved, pending, rejected];
      this.pieChart.update();
    },
    
    getInitials(name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },
    
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    },
    
    statusClass(status) {
      return {
        'text-green-600 font-semibold': status === 'Approved',
        'text-yellow-600 font-semibold': status === 'Pending',
        'text-red-600 font-semibold': status === 'Rejected'
      };
    },
    
    handleSearch() {
      // Search logic handled by computed property
    },
    
    viewAllEnrollments() {
      window.location.href = '/admin-students.html';
    },
    
    viewEnrollment(enrollment) {
      alert(`Viewing enrollment for ${enrollment.student}`);
      // Implement detailed view
    },
    
    approveEnrollment(enrollment) {
      if (confirm(`Approve enrollment for ${enrollment.student}?`)) {
        enrollment.status = 'Approved';
        this.dashboardStats.pendingEnrollments -= 1;
        this.refreshChart();
      }
    }
  }
}
</script>

<style scoped>
/* Add any custom styles here */
</style>