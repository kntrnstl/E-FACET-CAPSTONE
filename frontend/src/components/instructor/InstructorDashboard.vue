<template>
  <InstructorLayout active-page="dashboard">
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
      <h2 class="text-lg font-bold text-green-800 mb-6">📊 Instructor Dashboard Overview</h2>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-green-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-green-800">{{ dashboardStats.assignedCourses }}</h3>
              <p class="text-green-700 font-medium mt-1">Assigned Courses</p>
              <p class="text-sm text-green-600 mt-1">Active handled subjects</p>
            </div>
            <div class="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">📚</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-blue-800">{{ dashboardStats.totalStudentsHandled }}</h3>
              <p class="text-blue-700 font-medium mt-1">Students Handled</p>
              <p class="text-sm text-blue-600 mt-1">Total under your classes</p>
            </div>
            <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">👨‍🎓</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-yellow-800">{{ dashboardStats.pendingGrades }}</h3>
              <p class="text-yellow-700 font-medium mt-1">Pending Grades</p>
              <p class="text-sm text-yellow-600 mt-1">Needs update</p>
            </div>
            <div class="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">📝</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Classes Table -->
      <div class="overflow-x-auto mb-10">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-green-800">Upcoming Classes</h3>
          <button @click="viewAllClasses" class="text-green-700 hover:text-green-800 font-medium text-sm">
            View All →
          </button>
        </div>

        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Section</th>
              <th class="py-3 px-4 text-left font-medium">Schedule</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="cls in filteredClasses"
              :key="cls.id"
              class="border-b hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">{{ cls.course }}</td>
              <td class="py-3 px-4">{{ cls.section }}</td>
              <td class="py-3 px-4">{{ formatDate(cls.date) }} • {{ cls.time }}</td>
              <td class="py-3 px-4">
                <span :class="statusClass(cls.status)">
                  {{ cls.status }}
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
                  v-if="cls.status === 'Pending'"
                  @click="markDone(cls)"
                  class="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Mark Done
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
            <h3 class="text-green-800 font-semibold">Monthly Classes Conducted</h3>
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
            <h3 class="text-green-800 font-semibold">Class Status Distribution</h3>
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
  </InstructorLayout>
</template>

<script>
import InstructorLayout from './InstructorLayout.vue';
import Chart from 'chart.js/auto';

export default {
  name: 'InstructorDashboard',
  components: {
    InstructorLayout
  },
  data() {
    return {
      searchQuery: '',
      chartYear: 2025,

      dashboardStats: {
        assignedCourses: 6,
        totalStudentsHandled: 120,
        pendingGrades: 18
      },

      classes: [
        { id: 1, course: 'Driving NC II', section: 'Batch A', date: '2026-02-01', time: '9:00 AM', status: 'Scheduled' },
        { id: 2, course: 'ATDC NC I', section: 'Batch B', date: '2026-02-02', time: '1:00 PM', status: 'Pending' },
        { id: 3, course: 'Driving NC II', section: 'Batch C', date: '2026-02-03', time: '10:00 AM', status: 'Scheduled' },
        { id: 4, course: 'Driving NC II', section: 'Batch A', date: '2026-02-04', time: '3:00 PM', status: 'Pending' },
      ],

      barChart: null,
      pieChart: null
    }
  },

  computed: {
    filteredClasses() {
      if (!this.searchQuery) return this.classes;

      const query = this.searchQuery.toLowerCase();
      return this.classes.filter(c =>
        c.course.toLowerCase().includes(query) ||
        c.section.toLowerCase().includes(query) ||
        c.status.toLowerCase().includes(query)
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
        const response = await fetch('/api/auth/check', { credentials: 'include' });
        const data = await response.json();

        if (data.status !== 'success' || !data.authenticated) {
          window.location.href = '/login.html';
          return;
        }

        // ✅ instructor only
        if (data.user.role !== 'instructor') {
          // redirect depending on role
          if (data.user.role === 'admin') window.location.href = '/admin-dashboard.html';
          else window.location.href = '/student-dashboard.html';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
      }
    },

    initializeCharts() {
      const barCtx = this.$refs.barChartCanvas.getContext('2d');
      this.barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Classes',
            data: [8, 10, 12, 14, 16, 15, 18, 20, 19, 22, 21, 17],
            backgroundColor: '#16a34a',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 5 } },
            x: { grid: { display: false } }
          },
          plugins: { legend: { display: false } }
        }
      });

      const pieCtx = this.$refs.pieChartCanvas.getContext('2d');
      this.pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: ['Scheduled', 'Pending', 'Done'],
          datasets: [{
            data: [10, 4, 6],
            backgroundColor: ['#22c55e', '#facc15', '#3b82f6'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    },

    updateBarChart() {
      const dataMap = {
        2024: [5, 7, 8, 10, 12, 11, 13, 15, 14, 16, 15, 12],
        2025: [8, 10, 12, 14, 16, 15, 18, 20, 19, 22, 21, 17],
        2026: [10, 12, 14, 16, 18, 17, 20, 22, 21, 24, 23, 19]
      };

      this.barChart.data.datasets[0].data = dataMap[this.chartYear];
      this.barChart.update();
    },

    refreshChart() {
      const scheduled = Math.floor(Math.random() * 10) + 8;
      const pending = Math.floor(Math.random() * 5) + 3;
      const done = Math.floor(Math.random() * 10) + 5;

      this.pieChart.data.datasets[0].data = [scheduled, pending, done];
      this.pieChart.update();
    },

    statusClass(status) {
      return {
        'text-green-600 font-semibold': status === 'Scheduled',
        'text-yellow-600 font-semibold': status === 'Pending',
        'text-blue-600 font-semibold': status === 'Done'
      };
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    handleSearch() {
      // handled by computed
    },

    viewAllClasses() {
      // adjust to your page/route
      window.location.href = '/instructor-classes.html';
    },

    viewClass(cls) {
      alert(`Viewing class: ${cls.course} (${cls.section})`);
    },

    markDone(cls) {
      if (confirm(`Mark class as Done? (${cls.course} - ${cls.section})`)) {
        cls.status = 'Done';
        this.refreshChart();
      }
    }
  }
}
</script>

<style scoped>
/* optional */
</style>