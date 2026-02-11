<template>
  <StudentLayout active-page="schedule">
    <!-- Header Slot -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search schedule..."
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        v-model="searchQuery"
        @input="handleSearch"
      />
    </template>

    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-green-800 mb-6">📅 My Schedule</h2>

      <!-- Schedule Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-100 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Reservations</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">
                {{ scheduleStats.totalClasses }}
              </h3>
            </div>
            <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">📅</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">This Week</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">
                {{ scheduleStats.thisWeek }}
              </h3>
            </div>
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">🗓️</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Next Week</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">
                {{ scheduleStats.nextWeek }}
              </h3>
            </div>
            <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">⏭️</span>
            </div>
          </div>
        </div>

        <div class="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Confirmed</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">
                {{ scheduleStats.completed }}
              </h3>
            </div>
            <div class="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar & Schedule Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Calendar -->
        <div class="lg:col-span-1 bg-white rounded-xl shadow border border-gray-200 p-4">
          <div class="flex justify-between items-center mb-4">
            <button
              @click="prevMonth"
              class="p-2 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors"
              title="Previous month"
            >
              &lt;
            </button>

            <h3 class="font-semibold text-green-800 text-center">
              {{ currentMonth }} {{ currentYear }}
            </h3>

            <button
              @click="nextMonth"
              class="p-2 text-green-700 hover:text-green-900 hover:bg-green-50 rounded-full transition-colors"
              title="Next month"
            >
              &gt;
            </button>
          </div>

          <div class="grid grid-cols-7 text-center text-sm font-medium text-gray-700 gap-1">
            <div
              v-for="day in daysOfWeek"
              :key="day"
              class="font-bold text-green-800 py-2 text-xs"
            >
              {{ day.substring(0, 2) }}
            </div>

            <div v-for="n in blankDays" :key="`blank-${n}`" class="py-2"></div>

            <div
              v-for="day in daysInMonth"
              :key="day"
              :class="[
                'py-2 border rounded cursor-pointer text-sm transition-colors',
                hasScheduleForDay(day)
                  ? 'bg-green-600 text-white font-semibold border-green-700'
                  : selectedDay === day
                  ? 'bg-green-100 text-green-800 border-green-300 font-semibold'
                  : 'text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              ]"
              @click="selectDay(day)"
            >
              {{ day }}
            </div>
          </div>

          <!-- Legend -->
          <div class="mt-6 pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 bg-green-600 rounded-full"></div>
              <span class="text-xs text-gray-600">Has reservation (CONFIRMED)</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-100 border border-green-300 rounded-full"></div>
              <span class="text-xs text-gray-600">Selected day</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Classes -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-200">
            <h3 class="text-md font-semibold text-green-800">Upcoming / Selected Day</h3>
            <p class="text-sm text-gray-600 mt-1">
              {{
                selectedDay
                  ? `Schedule for ${selectedMonth} ${selectedDay}, ${currentYear}`
                  : 'Select a date to view reservations'
              }}
            </p>
          </div>

          <div v-if="loading" class="p-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p class="mt-2 text-gray-600">Loading schedule...</p>
          </div>

          <div v-else-if="upcomingClasses.length > 0" class="divide-y divide-gray-100">
            <div
              v-for="classItem in upcomingClasses"
              :key="classItem.id"
              class="p-4 hover:bg-gray-50 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">{{ getCourseIcon(classItem.course) }}</span>
                    <h4 class="font-medium text-gray-800">{{ classItem.course }}</h4>
                    <span
                      class="px-2 py-0.5 text-xs rounded-full"
                      :class="getClassStatusClass(classItem.status)"
                    >
                      {{ classItem.status }}
                    </span>
                  </div>

                  <p class="text-sm text-gray-600 mb-2">
                    {{ classItem.course_code ? `(${classItem.course_code})` : '—' }}
                  </p>

                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <span class="text-gray-500">👨‍🏫</span>
                      {{ classItem.instructor || '—' }}
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="text-gray-500">🕒</span>
                      {{ classItem.time || '—' }}
                    </span>
                  </div>
                </div>

                <button
                  @click="openDetails(classItem)"
                  class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Details
                </button>
              </div>
            </div>
          </div>

          <div v-else class="p-8 text-center text-gray-500">
            <div class="text-gray-400 mb-3">
              <span class="text-4xl">📅</span>
            </div>
            <p class="text-gray-500">No reservation on this date</p>
            <p class="text-sm text-gray-400 mt-1">Select another date</p>
          </div>
        </div>
      </div>

      <!-- Schedule Table -->
      <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-md font-semibold text-green-800">My Reserved Schedule</h3>
          <div class="flex items-center gap-2">
            <select
              v-model="filterCourse"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">All Courses</option>
              <option v-for="course in uniqueCourses" :key="course" :value="course">
                {{ course }}
              </option>
            </select>

            <select
              v-model="filterStatus"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <!-- student-facing statuses -->
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="DONE">DONE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <button
              @click="fetchMySchedule"
              class="p-1 text-green-700 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="Refresh schedule"
            >
              ↻
            </button>
          </div>
        </div>

        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p class="mt-2 text-gray-600">Loading schedule...</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Date</th>
                <th class="py-3 px-4 text-left font-medium">Time</th>
                <th class="py-3 px-4 text-left font-medium">Course</th>
                <th class="py-3 px-4 text-left font-medium">Instructor</th>
                <th class="py-3 px-4 text-left font-medium">Reservation Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="schedule in paginatedSchedules"
                :key="schedule.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="font-medium text-gray-800">{{ formatDate(schedule.date) }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ getDayName(schedule.date) }}</div>
                </td>

                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                      🕒
                    </div>
                    <span class="font-medium">{{ schedule.time || '—' }}</span>
                  </div>
                </td>

                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center"
                      :class="getCourseColorClass(schedule.course)"
                    >
                      <span class="text-white text-sm">{{ getCourseIcon(schedule.course) }}</span>
                    </div>
                    <div>
                      <div class="font-medium text-gray-800">{{ schedule.course || '—' }}</div>
                      <div class="text-xs text-gray-500">{{ schedule.course_code || '—' }}</div>
                    </div>
                  </div>
                </td>

                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                      {{ getInitials(schedule.instructor || 'NA') }}
                    </div>
                    <span class="text-sm">{{ schedule.instructor || '—' }}</span>
                  </div>
                </td>

                <td class="py-3 px-4">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getStatusClass(schedule.status)">
                    {{ schedule.status }}
                  </span>
                  <!-- optional debug tiny text: admin raw status -->
                  <!-- <div class="text-[10px] text-gray-400 mt-1">admin: {{ schedule.raw_status }}</div> -->
                </td>

                <td class="py-3 px-4">
                  <button
                    @click="openDetails(schedule)"
                    class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>

              <tr v-if="filteredSchedules.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500">
                  <div class="text-gray-400">
                    <span class="text-3xl mb-2 block">📅</span>
                    <p class="text-gray-500">No schedule found</p>
                    <p class="text-sm text-gray-400 mt-1">Try adjusting your filters or search</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="filteredSchedules.length > 0"
          class="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600"
        >
          <div>Showing {{ paginatedSchedules.length }} of {{ filteredSchedules.length }} reservations</div>
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
    </div>

    <!-- ✅ DETAILS MODAL -->
    <div
      v-if="detailsOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="closeDetails"
    >
      <div class="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ getCourseIcon(detailsItem?.course) }}</span>
              <h3 class="text-lg font-semibold text-gray-800">
                {{ detailsItem?.course || "Schedule Details" }}
              </h3>
            </div>
            <p class="text-sm text-gray-500 mt-1">
              {{ detailsItem?.course_code ? `Code: ${detailsItem.course_code}` : "—" }}
            </p>
          </div>

          <button
            @click="closeDetails"
            class="px-3 py-1 text-sm rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div class="p-3 rounded-xl border bg-gray-50">
              <div class="text-xs text-gray-500">Date</div>
              <div class="font-medium text-gray-800 mt-1">{{ formatDate(detailsItem?.date) }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ getDayName(detailsItem?.date) }}</div>
            </div>

            <div class="p-3 rounded-xl border bg-gray-50">
              <div class="text-xs text-gray-500">Time</div>
              <div class="font-medium text-gray-800 mt-1">{{ detailsItem?.time || "—" }}</div>
            </div>

            <div class="p-3 rounded-xl border bg-gray-50">
              <div class="text-xs text-gray-500">Instructor</div>
              <div class="font-medium text-gray-800 mt-1">{{ detailsItem?.instructor || "—" }}</div>
            </div>

            <div class="p-3 rounded-xl border bg-gray-50">
              <div class="text-xs text-gray-500">Status (Student)</div>
              <div class="mt-1">
                <span class="px-3 py-1 rounded-full text-xs font-medium" :class="getStatusClass(detailsItem?.status)">
                  {{ detailsItem?.status || "—" }}
                </span>
              </div>
              <div class="text-[11px] text-gray-400 mt-2">
                Note: Admin may show this as PENDING for verification.
              </div>
            </div>

            <div class="p-3 rounded-xl border bg-gray-50">
              <div class="text-xs text-gray-500">Room</div>
              <div class="font-medium text-gray-800 mt-1">{{ detailsItem?.room || "—" }}</div>
            </div>

            <div class="p-3 rounded-xl border bg-gray-50">
              <div class="text-xs text-gray-500">Payment Method</div>
              <div class="font-medium text-gray-800 mt-1">{{ detailsItem?.payment_method || "—" }}</div>
            </div>

            <div class="p-3 rounded-xl border bg-gray-50 md:col-span-2">
              <div class="text-xs text-gray-500">Created At</div>
              <div class="font-medium text-gray-800 mt-1">{{ formatDateTime(detailsItem?.created_at) }}</div>
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button
              @click="closeDetails"
              class="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import StudentLayout from "./StudentLayout.vue";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export default {
  name: "StudentSchedule",
  components: { StudentLayout },

  data() {
    return {
      searchQuery: "",
      filterCourse: "all",
      filterStatus: "all",
      loading: false,
      currentPage: 1,
      itemsPerPage: 10,

      currentDate: new Date(),
      selectedDay: null,

      scheduleStats: { totalClasses: 0, thisWeek: 0, nextWeek: 0, completed: 0 },

      schedules: [],

      // ✅ modal state
      detailsOpen: false,
      detailsItem: null,

      daysOfWeek: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      months: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    };
  },

  computed: {
    filteredSchedules() {
      let result = [...this.schedules];

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        result = result.filter((s) =>
          String(s.course || "").toLowerCase().includes(q) ||
          String(s.instructor || "").toLowerCase().includes(q) ||
          String(s.time || "").toLowerCase().includes(q) ||
          String(s.status || "").toLowerCase().includes(q) ||       // student-facing
          String(s.raw_status || "").toLowerCase().includes(q)      // admin raw
        );
      }

      if (this.filterCourse !== "all") result = result.filter((s) => s.course === this.filterCourse);
      if (this.filterStatus !== "all") result = result.filter((s) => String(s.status || "").toUpperCase() === this.filterStatus);

      result.sort((a, b) => {
        const da = a.date ? new Date(a.date + "T00:00:00") : new Date(0);
        const db = b.date ? new Date(b.date + "T00:00:00") : new Date(0);
        if (da - db !== 0) return da - db;
        return String(a.time || "").localeCompare(String(b.time || ""));
      });

      return result;
    },

    paginatedSchedules() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredSchedules.slice(start, start + this.itemsPerPage);
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredSchedules.length / this.itemsPerPage));
    },

    // ✅ Student-facing "confirmed" schedules = anything that should be shown as CONFIRMED/APPROVED/ACTIVE
studentConfirmedSchedules() {
  const ok = new Set(["CONFIRMED"]);
  return this.schedules.filter((s) => ok.has(String(s.status || "").toUpperCase()));
},


    upcomingClasses() {
      if (!this.selectedDay) return [];

      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const dayStr = this.selectedDay < 10 ? `0${this.selectedDay}` : `${this.selectedDay}`;
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      // ✅ use student-facing statuses
      return this.studentConfirmedSchedules.filter((s) => s.date === dateStr);
    },

    uniqueCourses() {
      return [...new Set(this.schedules.map((s) => s.course).filter(Boolean))];
    },

    currentMonth() { return this.months[this.currentDate.getMonth()]; },
    currentYear() { return this.currentDate.getFullYear(); },
    selectedMonth() { return this.currentMonth.substring(0, 3); },

    daysInMonth() {
      const y = this.currentDate.getFullYear();
      const m = this.currentDate.getMonth();
      return new Date(y, m + 1, 0).getDate();
    },

    blankDays() {
      const y = this.currentDate.getFullYear();
      const m = this.currentDate.getMonth();
      return new Date(y, m, 1).getDay();
    },
  },

  methods: {
    // ✅ map admin/raw status to student-facing status
toStudentStatus(rawStatus) {
  const s = String(rawStatus || "").toUpperCase();

  if (s === "CANCELLED") return "CANCELLED";
    if (s === "DONE" || s === "COMPLETED") return "DONE"; // ✅ add this
  if (s === "PENDING") return "CONFIRMED";   // admin verification
  if (s === "APPROVED") return "CONFIRMED";  // admin approved step

  if (["CONFIRMED", "ACTIVE"].includes(s)) return s;

  return "CONFIRMED"; // safe default for student
},


    async fetchMySchedule() {
      try {
        this.loading = true;
        this.currentPage = 1;

        const res = await api.get("/student/my-schedule");
        const list = res.data?.schedules || res.data?.data || [];

        this.schedules = list.map((x) => {
          const raw = String(x.status || "").toUpperCase();
          return {
            id: x.id,
            date: x.date || null,
            time: x.time || "—",
            course: x.course || (x.course_id ? `Course #${x.course_id}` : "—"),
            course_code: x.course_code || "",
            instructor: x.instructor || "—",

            // ✅ keep admin raw status
            raw_status: raw,

            // ✅ student-facing status
            status: this.toStudentStatus(raw),

            payment_method: x.payment_method || null,
            room: x.room || x.room_name || null,
            created_at: x.created_at || null,

            // optional extras if exist
            proof_url: x.proof_url || x.proofUrl || x.proof || null,
            reference_no: x.reference_no || x.referenceNo || null,
          };
        });

        this.updateScheduleStats();
      } catch (err) {
        console.error("fetchMySchedule error:", err.response?.data || err);
        this.schedules = [];
        this.updateScheduleStats();
      } finally {
        this.loading = false;
      }
    },

    handleSearch() { this.currentPage = 1; },

    openDetails(item) {
      this.detailsItem = item || null;
      this.detailsOpen = true;
    },

    closeDetails() {
      this.detailsOpen = false;
      this.detailsItem = null;
    },

    getInitials(name) {
      const str = String(name || "").trim();
      if (!str || str === "—") return "NA";
      return str.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
    },

getStatusClass(status) {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "CONFIRMED": return "bg-green-100 text-green-800";
    case "DONE": return "bg-indigo-100 text-indigo-800";
    case "CANCELLED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
},

getClassStatusClass(status) {
  const s = String(status || "").toUpperCase();
  switch (s) {
    case "CONFIRMED": return "bg-green-50 text-green-700 border border-green-200";
    case "DONE": return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    case "CANCELLED": return "bg-red-50 text-red-700 border border-red-200";
    default: return "bg-gray-50 text-gray-700 border border-gray-200";
  }
},


    getCourseColorClass(course) {
      const colors = {
        "Basic Driving": "bg-green-500",
        "Traffic Rules": "bg-blue-500",
        Simulation: "bg-purple-500",
        "Safety Orientation": "bg-yellow-500",
        "Road Signs": "bg-indigo-500",
        "Night Driving": "bg-gray-500",
        "Parallel Parking": "bg-pink-500",
        "Highway Driving": "bg-red-500",
      };
      return colors[course] || "bg-green-500";
    },

    getCourseIcon(course) {
      const icons = {
        "Basic Driving": "🚗",
        "Traffic Rules": "🚦",
        Simulation: "🎮",
        "Safety Orientation": "🛡️",
        "Road Signs": "🛣️",
        "Night Driving": "🌙",
        "Parallel Parking": "🅿️",
        "Highway Driving": "🛣️",
      };
      return icons[course] || "📚";
    },

    formatDate(dateString) {
      if (!dateString) return "—";
      const d = new Date(String(dateString) + "T00:00:00");
      if (Number.isNaN(d.getTime())) return "—";
      const month = this.months[d.getMonth()].substring(0, 3);
      return `${month} ${d.getDate()}, ${d.getFullYear()}`;
    },

    formatDateTime(dateTimeString) {
      if (!dateTimeString) return "—";
      const d = new Date(dateTimeString);
      if (Number.isNaN(d.getTime())) return String(dateTimeString);
      const month = this.months[d.getMonth()].substring(0, 3);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${month} ${d.getDate()}, ${d.getFullYear()} ${hh}:${mm}`;
    },

    getDayName(dateString) {
      if (!dateString) return "—";
      const d = new Date(String(dateString) + "T00:00:00");
      if (Number.isNaN(d.getTime())) return "—";
      return this.daysOfWeek[d.getDay()];
    },

    prevMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.selectedDay = null;
    },

    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.selectedDay = null;
    },

    selectDay(day) {
      this.selectedDay = this.selectedDay === day ? null : day;
    },

    // ✅ Calendar highlight if student sees it as confirmed/approved/active
    hasScheduleForDay(day) {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth() + 1;
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      return this.studentConfirmedSchedules.some((s) => s.date === dateStr);
    },

    prevPage() { if (this.currentPage > 1) this.currentPage--; },
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },

    updateScheduleStats() {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const oneWeekLater = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
      const twoWeeksLater = new Date(startOfToday.getTime() + 14 * 24 * 60 * 60 * 1000);

      this.scheduleStats.totalClasses = this.schedules.length;

      this.scheduleStats.thisWeek = this.schedules.filter((s) => {
        if (!s.date) return false;
        const d = new Date(s.date + "T00:00:00");
        return d >= startOfToday && d <= oneWeekLater;
      }).length;

      this.scheduleStats.nextWeek = this.schedules.filter((s) => {
        if (!s.date) return false;
        const d = new Date(s.date + "T00:00:00");
        return d > oneWeekLater && d <= twoWeeksLater;
      }).length;

      // ✅ student confirmed count (includes mapped-from-pending)
      this.scheduleStats.completed = this.studentConfirmedSchedules.length;
    },
  },

  async mounted() {
    this.selectedDay = new Date().getDate();
    await this.fetchMySchedule();
  },
};
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
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
</style>
