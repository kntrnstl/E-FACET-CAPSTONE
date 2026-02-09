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
        <!-- ✅ removed Add Class button -->
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

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading classes...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
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
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
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
  </InstructorLayout>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";
import InstructorLayout from "./InstructorLayout.vue";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export default {
  name: "InstructorClasses",
  components: { InstructorLayout },
  setup() {
    const loading = ref(true);
    const classes = ref([]);

    const searchQuery = ref("");
    const selectedCourse = ref("");
    const selectedStatus = ref("");
    const sortBy = ref("dateAsc");

    // ✅ course options generated from loaded classes
    const courseOptions = ref([]);

    // -----------------------------
      const deriveStatus = (dateLike, startTime, endTime) => {
        const now = new Date();

        const buildDateTime = (dateInput, timeInput) => {
          const d = new Date(dateInput); // works for YYYY-MM-DD, ISO string, Date
          if (Number.isNaN(d.getTime())) return null;

          const [hh, mm] = String(timeInput || "00:00")
            .slice(0, 5)
            .split(":")
            .map((x) => Number(x));

          d.setHours(hh || 0, mm || 0, 0, 0);
          return d;
        };

        const startDT = buildDateTime(dateLike, startTime);
        const endDT = buildDateTime(dateLike, endTime);

        if (!startDT || !endDT) return "upcoming";

        // if end time earlier than start time (rare), push end to next day
        if (endDT < startDT) endDT.setDate(endDT.getDate() + 1);

        if (now < startDT) return "upcoming";
        if (now >= startDT && now <= endDT) return "active";
        return "completed";
      };


    // ---- helpers ----
    const formatDate = (dateString) => {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const formatStatus = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);

    const statusBadgeClass = (status) => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800";
        case "upcoming":
          return "bg-yellow-100 text-yellow-800";
        case "completed":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const clearFilters = () => {
      searchQuery.value = "";
      selectedCourse.value = "";
      selectedStatus.value = "";
    };

    // ---- API ----
    const fetchClasses = async () => {
      loading.value = true;
      try {
        const res = await api.get("/instructor/driving/classes");

        classes.value = (res.data?.data ?? []).map((row) => {
          const dayName = new Date(row.class_date).toLocaleDateString("en-US", { weekday: "short" });

          const start = String(row.start_time).slice(0, 5);
          const end = String(row.end_time).slice(0, 5);

          // ✅ computed status based on date/time
          const computedStatus = deriveStatus(row.class_date, start, end);

          return {
            id: row.class_id,
            course: row.course_name,
            section: row.section,
            date: row.class_date,
            startTime: start,
            endTime: end,
            status: computedStatus,
            studentCount: row.student_count,
            day: dayName,
          };
        });

        // ✅ update dropdown options from returned classes
        courseOptions.value = [...new Set(classes.value.map((c) => c.course))].sort();
      } catch (err) {
        console.error("fetchClasses error:", err);
        classes.value = [];
        courseOptions.value = [];
        alert(err.response?.data?.message || "Failed to load assigned classes");
      } finally {
        loading.value = false;
      }
    };

    const viewClass = (cls) => {
      alert(
        `Class: ${cls.course}\n` +
          `Section: ${cls.section}\n` +
          `Date: ${formatDate(cls.date)} (${cls.day})\n` +
          `Time: ${cls.startTime} - ${cls.endTime}\n` +
          `Status: ${formatStatus(cls.status)}\n` +
          `Students: ${cls.studentCount}`
      );
    };

    // ---- computed ----
    const filteredClasses = computed(() => {
      let result = [...classes.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(
          (c) =>
            (c.course || "").toLowerCase().includes(q) ||
            (c.section || "").toLowerCase().includes(q) ||
            (c.day || "").toLowerCase().includes(q)
        );
      }

      if (selectedCourse.value) result = result.filter((c) => c.course === selectedCourse.value);
      if (selectedStatus.value) result = result.filter((c) => c.status === selectedStatus.value);

      result.sort((a, b) => {
        switch (sortBy.value) {
          case "dateAsc":
            return new Date(a.date) - new Date(b.date);
          case "dateDesc":
            return new Date(b.date) - new Date(a.date);
          case "course":
            return (a.course || "").localeCompare(b.course || "");
          case "students":
            return (b.studentCount || 0) - (a.studentCount || 0);
          case "status":
            return (a.status || "").localeCompare(b.status || "");
          default:
            return 0;
        }
      });

      return result;
    });

    const activeCount = computed(() => classes.value.filter((c) => c.status === "active").length);
    const upcomingCount = computed(() => classes.value.filter((c) => c.status === "upcoming").length);
    const totalStudents = computed(() => classes.value.reduce((sum, c) => sum + (c.studentCount || 0), 0));

    // ✅ keep status updated while page is open (optional but helpful)
    let timer = null;

    onMounted(async () => {
      await fetchClasses();

      timer = setInterval(() => {
        classes.value = classes.value.map((c) => ({
          ...c,
          status: deriveStatus(c.date, c.startTime, c.endTime),
        }));
      }, 60 * 1000); // every 1 minute
    });

    onBeforeUnmount(() => {
      if (timer) clearInterval(timer);
    });

    return {
      loading,
      classes,

      searchQuery,
      selectedCourse,
      selectedStatus,
      sortBy,

      courseOptions,

      filteredClasses,
      activeCount,
      upcomingCount,
      totalStudents,

      formatDate,
      formatStatus,
      statusBadgeClass,

      clearFilters,
      viewClass,
    };
  },
};
</script>
