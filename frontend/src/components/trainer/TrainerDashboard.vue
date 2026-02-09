<template>
  <TrainerLayout active-page="dashboard">
    <!-- Header Slot -->
    <template #header-left>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search..."
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
        @input="handleSearch"
      />
    </template>

    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-blue-800 mb-6">
        📊 Trainer Dashboard Overview
      </h2>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-blue-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-blue-800">{{ dashboardStats.assignedBatches }}</h3>
              <p class="text-blue-700 font-medium mt-1">Assigned Batches</p>
              <p class="text-sm text-blue-600 mt-1">Batches you handle</p>
            </div>
            <div class="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div class="bg-sky-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-sky-800">{{ dashboardStats.totalTrainees }}</h3>
              <p class="text-sky-700 font-medium mt-1">Total Trainees</p>
              <p class="text-sm text-sky-600 mt-1">Under your sessions</p>
            </div>
            <div class="w-12 h-12 bg-sky-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">👨‍🎓</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-3xl font-bold text-yellow-800">{{ dashboardStats.pendingAttendance }}</h3>
              <p class="text-yellow-700 font-medium mt-1">Pending Attendance</p>
              <p class="text-sm text-yellow-600 mt-1">Needs marking</p>
            </div>
            <div class="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Sessions Table -->
      <div class="overflow-x-auto mb-10">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-blue-800">Upcoming Sessions</h3>
          <button
            @click="viewAllSessions"
            class="text-blue-700 hover:text-blue-800 font-medium text-sm"
          >
            View All →
          </button>
        </div>

        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-blue-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Batch</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Schedule</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="s in filteredSessions"
              :key="s.id"
              class="border-b hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">{{ s.batch }}</td>
              <td class="py-3 px-4">{{ s.course }}</td>
              <td class="py-3 px-4">{{ formatDate(s.date) }} • {{ s.time }}</td>
              <td class="py-3 px-4">
                <span :class="statusClass(s.status)">
                  {{ s.status }}
                </span>
              </td>
              <td class="py-3 px-4">
                <button
                  @click="openAttendance(s)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  Attendance
                </button>

                <button
                  v-if="s.status === 'Pending'"
                  @click="markDone(s)"
                  class="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
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
            <h3 class="text-blue-800 font-semibold">Monthly Sessions Conducted</h3>
            <select
              v-model="chartYear"
              @change="updateBarChart"
              class="text-sm border rounded px-2 py-1"
            >
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
            <h3 class="text-blue-800 font-semibold">Session Status Distribution</h3>
            <button @click="refreshChart" class="text-sm text-blue-700 hover:text-blue-800">
              ↻ Refresh
            </button>
          </div>
          <div class="h-64">
            <canvas ref="pieChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>
  </TrainerLayout>
</template>

<script>
import TrainerLayout from "./TrainerLayout.vue";
import Chart from "chart.js/auto";

export default {
  name: "TrainerDashboard",
  components: { TrainerLayout },

  data() {
    return {
      searchQuery: "",
      chartYear: 2025,

      dashboardStats: {
        assignedBatches: 4,
        totalTrainees: 80,
        pendingAttendance: 12,
      },

      // sample data (replace with API later)
      sessions: [
        { id: 1, batch: "Batch A", course: "Driving NC II", date: "2026-02-06", time: "9:00 AM", status: "Scheduled" },
        { id: 2, batch: "Batch B", course: "ATDC NC I", date: "2026-02-07", time: "1:00 PM", status: "Pending" },
        { id: 3, batch: "Batch C", course: "Driving NC II", date: "2026-02-08", time: "10:00 AM", status: "Scheduled" },
        { id: 4, batch: "Batch A", course: "Driving NC II", date: "2026-02-09", time: "3:00 PM", status: "Pending" },
      ],

      barChart: null,
      pieChart: null,
    };
  },

  computed: {
    filteredSessions() {
      if (!this.searchQuery) return this.sessions;
      const q = this.searchQuery.toLowerCase();
      return this.sessions.filter((s) =>
        s.course.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
      );
    },
  },

  mounted() {
    this.checkAuth();
    this.initializeCharts();
  },

  beforeUnmount() {
    if (this.barChart) this.barChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
  },

  methods: {
    async checkAuth() {
      try {
        const response = await fetch("/api/auth/check", { credentials: "include" });
        const data = await response.json();

        if (data.status !== "success" || !data.authenticated) {
          this.$router.push("/login");
          return;
        }

        // ✅ trainer only
        if (data.user.role !== "trainer") {
          if (data.user.role === "admin") return this.$router.push("/admin-dashboard");
          if (data.user.role === "instructor") return this.$router.push("/instructor-dashboard");

          // student/user
          const home =
            data.user.track === "tesda" ? "/tesda-dashboard" : "/student-dashboard";
          return this.$router.push(home);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        this.$router.push("/login");
      }
    },

    initializeCharts() {
      // Bar Chart
      const barCtx = this.$refs.barChartCanvas.getContext("2d");
      this.barChart = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          datasets: [
            {
              label: "Sessions",
              data: [6, 8, 10, 11, 12, 10, 13, 15, 14, 16, 15, 12],
              backgroundColor: "#1d4ed8", // blue
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 5 } },
            x: { grid: { display: false } },
          },
          plugins: { legend: { display: false } },
        },
      });

      // Pie Chart
      const pieCtx = this.$refs.pieChartCanvas.getContext("2d");
      this.pieChart = new Chart(pieCtx, {
        type: "pie",
        data: {
          labels: ["Scheduled", "Pending", "Done"],
          datasets: [
            {
              data: [10, 4, 6],
              backgroundColor: ["#2563eb", "#facc15", "#22c55e"],
              borderWidth: 2,
              borderColor: "#ffffff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      });
    },

    updateBarChart() {
      const dataMap = {
        2024: [4, 6, 7, 9, 10, 9, 11, 13, 12, 14, 13, 10],
        2025: [6, 8, 10, 11, 12, 10, 13, 15, 14, 16, 15, 12],
        2026: [8, 9, 11, 13, 14, 13, 15, 17, 16, 18, 17, 14],
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
        "text-blue-600 font-semibold": status === "Scheduled",
        "text-yellow-600 font-semibold": status === "Pending",
        "text-green-600 font-semibold": status === "Done",
      };
    },

    formatDate(dateString) {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    },

    handleSearch() {
      // handled by computed
    },

    viewAllSessions() {
      // If you have a sessions page later, route there.
      // For now, just go to attendance list page:
      this.$router.push("/trainer-attendance");
    },

    openAttendance(session) {
      // later you can pass session_id via query/params
      // e.g. /trainer-attendance?session_id=1
      this.$router.push(`/trainer-attendance`);
    },

    markDone(session) {
      if (confirm(`Mark session as Done? (${session.course} - ${session.batch})`)) {
        session.status = "Done";
        this.refreshChart();
      }
    },
  },
};
</script>

<style scoped>
/* optional */
</style>
