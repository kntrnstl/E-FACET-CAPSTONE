<template>
  <TrainerLayout>
    <!-- Header -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search students..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 class="text-lg font-bold text-blue-800">✅ Trainer Attendance</h2>

        <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Date:</span>
            <input
              type="date"
              v-model="selectedDate"
              class="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            @click="markAll('present')"
            class="px-4 py-2 rounded-md text-sm font-medium border border-green-600 text-green-700 hover:bg-green-50"
          >
            Mark All Present
          </button>

          <button
            @click="saveAttendance"
            class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            💾 Save Attendance
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            v-model="selectedStatus"
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="unmarked">Unmarked</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
          <select
            v-model="selectedCourse"
            class="w-60 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Courses</option>
            <option v-for="c in courses" :key="c.course_id" :value="String(c.course_id)">
              {{ c.course_name }}
            </option>
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

        <div class="ml-auto flex flex-wrap items-end gap-2">
          <span class="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">
            Present: {{ stats.present }}
          </span>
          <span class="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-medium">
            Late: {{ stats.late }}
          </span>
          <span class="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-medium">
            Absent: {{ stats.absent }}
          </span>
          <span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
            Unmarked: {{ stats.unmarked }}
          </span>
        </div>
      </div>

      <!-- Success Alert -->
      <div
        v-if="successMsg"
        class="mb-4 p-3 rounded-md border border-green-200 bg-green-50 text-green-700 text-sm"
      >
        {{ successMsg }}
      </div>

      <!-- Table -->
      <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredStudents.length }} of {{ students.length }} students
            <span class="ml-2 text-gray-400">•</span>
            <span class="ml-2">Date: <span class="font-medium">{{ prettyDate }}</span></span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Sort by:</span>
            <select v-model="sortBy" class="text-sm border rounded px-2 py-1">
              <option value="name">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-blue-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Student</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Remarks</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="s in filteredStudents"
              :key="s.student_id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="flex flex-col">
                  <p class="font-medium">{{ s.fullname }}</p>
                  <p class="text-xs text-gray-500">{{ s.username }}</p>
                </div>
              </td>

              <td class="py-3 px-4">
                <span class="text-gray-700">{{ s.course_name }}</span>
              </td>

              <td class="py-3 px-4">
                <div class="flex items-center gap-2">
                  <span
                    class="text-xs px-2 py-1 rounded font-medium"
                    :class="getStatusBadge(getRow(s.student_id).status)"
                  >
                    {{ getRow(s.student_id).status }}
                  </span>
                </div>
              </td>

              <td class="py-3 px-4">
                <input
                  type="text"
                  v-model="getRow(s.student_id).remarks"
                  placeholder="e.g., traffic / sick"
                  class="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </td>

              <td class="py-3 px-4">
                <button
                  @click="setStatus(s.student_id, 'present')"
                  class="text-green-700 hover:text-green-900 text-sm font-medium mr-3"
                >
                  Present
                </button>
                <button
                  @click="setStatus(s.student_id, 'late')"
                  class="text-yellow-700 hover:text-yellow-900 text-sm font-medium mr-3"
                >
                  Late
                </button>
                <button
                  @click="setStatus(s.student_id, 'absent')"
                  class="text-red-700 hover:text-red-900 text-sm font-medium"
                >
                  Absent
                </button>
              </td>
            </tr>

            <tr v-if="filteredStudents.length === 0">
              <td colspan="5" class="py-8 text-center text-gray-500">
                No students found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (static like yours) -->
      <div v-if="filteredStudents.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ filteredStudents.length }} items
        </div>
        <div class="flex gap-1">
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">← Previous</button>
          <button class="px-3 py-1 bg-blue-700 text-white rounded text-sm">1</button>
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next →</button>
        </div>
      </div>
    </div>

    <!-- Save Preview Modal -->
    <div
      v-if="showSaveModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-blue-800">Attendance Saved (Mock)</h3>
            <button @click="closeSaveModal" class="text-gray-400 hover:text-gray-600 text-xl">
              ✕
            </button>
          </div>

          <p class="text-sm text-gray-600 mb-3">
            Date: <span class="font-medium">{{ prettyDate }}</span>
          </p>

          <div class="border rounded-md overflow-hidden">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100">
                <tr>
                  <th class="text-left py-2 px-3">Student</th>
                  <th class="text-left py-2 px-3">Status</th>
                  <th class="text-left py-2 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in savedPreview" :key="row.student_id" class="border-t">
                  <td class="py-2 px-3">{{ row.fullname }}</td>
                  <td class="py-2 px-3">
                    <span class="text-xs px-2 py-1 rounded font-medium" :class="getStatusBadge(row.status)">
                      {{ row.status }}
                    </span>
                  </td>
                  <td class="py-2 px-3">{{ row.remarks || "—" }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end gap-2 mt-5">
            <button
              @click="closeSaveModal"
              class="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm font-medium"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  </TrainerLayout>
</template>

<script>
import { ref, computed, reactive } from "vue";
import TrainerLayout from "./TrainerLayout.vue";

export default {
  name: "TrainerAttendance",
  components: { TrainerLayout },
  setup() {
    const searchQuery = ref("");
    const selectedStatus = ref("");
    const selectedCourse = ref("");
    const sortBy = ref("name");
    const selectedDate = ref(new Date().toISOString().slice(0, 10));

    const successMsg = ref("");
    const showSaveModal = ref(false);
    const savedPreview = ref([]);

    // MOCK courses
    const courses = ref([
      { course_id: 1, course_name: "Driving NC II" },
      { course_id: 2, course_name: "Cookery NC II" },
      { course_id: 3, course_name: "Electrical Installation NC II" },
    ]);

    // MOCK students
    const students = ref([
      { student_id: 101, fullname: "Juan Dela Cruz", username: "juan.dc", course_id: 1, course_name: "Driving NC II" },
      { student_id: 102, fullname: "Maria Santos", username: "maria.s", course_id: 1, course_name: "Driving NC II" },
      { student_id: 103, fullname: "Pedro Reyes", username: "pedro.r", course_id: 2, course_name: "Cookery NC II" },
      { student_id: 104, fullname: "Ana Lopez", username: "ana.l", course_id: 3, course_name: "Electrical Installation NC II" },
      { student_id: 105, fullname: "Carlo Bautista", username: "carlo.b", course_id: 2, course_name: "Cookery NC II" },
    ]);

    // attendance map
    const attendanceMap = reactive({});

    // ✅ safe accessor: never crashes even if map not initialized yet
    const getRow = (id) => {
      if (!attendanceMap[id]) attendanceMap[id] = { status: "unmarked", remarks: "" };
      return attendanceMap[id];
    };

    const prettyDate = computed(() => {
      try {
        const d = new Date(selectedDate.value);
        return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
      } catch {
        return selectedDate.value;
      }
    });

    const getStatusBadge = (status) => {
      switch (status) {
        case "present":
          return "bg-green-100 text-green-700";
        case "late":
          return "bg-yellow-100 text-yellow-700";
        case "absent":
          return "bg-red-100 text-red-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    const setStatus = (studentId, status) => {
      getRow(studentId).status = status;
    };

    const markAll = (status) => {
      for (const s of students.value) setStatus(s.student_id, status);
    };

    const stats = computed(() => {
      const counts = { present: 0, late: 0, absent: 0, unmarked: 0 };
      for (const s of students.value) {
        const st = getRow(s.student_id).status || "unmarked";
        if (counts[st] !== undefined) counts[st] += 1;
      }
      return counts;
    });

    const filteredStudents = computed(() => {
      let result = [...students.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(
          (s) =>
            String(s.fullname || "").toLowerCase().includes(q) ||
            String(s.username || "").toLowerCase().includes(q) ||
            String(s.course_name || "").toLowerCase().includes(q),
        );
      }

      if (selectedCourse.value) {
        result = result.filter((s) => String(s.course_id) === String(selectedCourse.value));
      }

      if (selectedStatus.value) {
        result = result.filter((s) => getRow(s.student_id).status === selectedStatus.value);
      }

      result.sort((a, b) => {
        const an = String(a.fullname || "");
        const bn = String(b.fullname || "");
        switch (sortBy.value) {
          case "name":
            return an.localeCompare(bn);
          case "nameDesc":
            return bn.localeCompare(an);
          case "status": {
            const sa = getRow(a.student_id).status || "unmarked";
            const sb = getRow(b.student_id).status || "unmarked";
            return sa.localeCompare(sb) || an.localeCompare(bn);
          }
          default:
            return 0;
        }
      });

      return result;
    });

    const clearFilters = () => {
      searchQuery.value = "";
      selectedStatus.value = "";
      selectedCourse.value = "";
    };

    const saveAttendance = () => {
      savedPreview.value = students.value.map((s) => ({
        student_id: s.student_id,
        fullname: s.fullname,
        status: getRow(s.student_id).status || "unmarked",
        remarks: getRow(s.student_id).remarks || "",
      }));

      showSaveModal.value = true;

      successMsg.value = "Attendance saved successfully ✅ (mock only)";
      setTimeout(() => (successMsg.value = ""), 2500);
    };

    const closeSaveModal = () => {
      showSaveModal.value = false;
    };

    return {
      searchQuery,
      selectedStatus,
      selectedCourse,
      sortBy,
      selectedDate,

      students,
      courses,
      attendanceMap,

      successMsg,
      showSaveModal,
      savedPreview,

      filteredStudents,
      prettyDate,
      stats,

      getRow,
      getStatusBadge,
      setStatus,
      markAll,
      clearFilters,
      saveAttendance,
      closeSaveModal,
    };
  },
};
</script>
