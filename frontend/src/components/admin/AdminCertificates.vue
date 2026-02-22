<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search students/certificates..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">🎓 Certificate Management</h2>

        <button
          @click="fetchRows"
          class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          🔄 Refresh
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-green-50 p-5 rounded-lg border border-green-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-green-800">{{ issuedCount }}</h3>
              <p class="text-green-700 font-medium mt-1">Issued</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-xl">✅</span>
            </div>
          </div>
        </div>

        <div class="bg-yellow-50 p-5 rounded-lg border border-yellow-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-yellow-800">{{ pendingCount }}</h3>
              <p class="text-yellow-700 font-medium mt-1">Ready to Generate</p>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span class="text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-blue-800">{{ rows.length }}</h3>
              <p class="text-blue-700 font-medium mt-1">Total Done Students</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-xl">📄</span>
            </div>
          </div>
        </div>

        <div class="bg-red-50 p-5 rounded-lg border border-red-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-red-800">{{ revokedCount }}</h3>
              <p class="text-red-700 font-medium mt-1">Revoked</p>
            </div>
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span class="text-xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
          <select
            v-model="selectedCourse"
            class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Courses</option>
            <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            v-model="selectedStatus"
            class="w-44 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All</option>
            <option value="issued">Issued</option>
            <option value="ready">Ready</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Done Date</label>
          <input
            type="date"
            v-model="selectedDate"
            class="w-44 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        <div class="flex items-end gap-2">
          <button
            @click="clearFilters"
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Clear
          </button>

          <button
            @click="exportCsv"
            class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Export CSV
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredRows.length }} of {{ rows.length }} done students
          </div>

          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Sort by:</span>
            <select v-model="sortBy" class="text-sm border rounded px-2 py-1">
              <option value="dateDesc">Most Recent</option>
              <option value="dateAsc">Oldest First</option>
              <option value="name">Student A-Z</option>
              <option value="course">Course</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Student</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Done Date</th>
              <th class="py-3 px-4 text-left font-medium">Certificate ID</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.reservation_id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    {{ getInitials(row.student_name) }}
                  </div>
                  <div>
                    <p class="font-medium">{{ row.student_name }}</p>
                    <p class="text-xs text-gray-500">{{ row.student_email }}</p>
                  </div>
                </div>
              </td>

              <td class="py-3 px-4">
                <span class="font-medium">{{ row.course_name }}</span>
              </td>

              <td class="py-3 px-4 text-gray-600">
                {{ row.done_at ? formatDate(row.done_at) : "—" }}
              </td>

              <td class="py-3 px-4">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {{ row.certificate_code || "—" }}
                </code>
              </td>

              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(row.ui_status)"
                >
                  {{ formatStatus(row.ui_status) }}
                </span>
              </td>

              <td class="py-3 px-4">
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-if="row.ui_status === 'ready'"
                    @click="generateForReservation(row)"
                    class="text-green-700 hover:text-green-900 text-sm font-medium px-2 py-1 hover:bg-green-50 rounded"
                  >
                    ➕ Generate
                  </button>

                  <button
                    v-if="row.certificate_id"
                    @click="viewCertificate(row)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded"
                  >
                    View
                  </button>

                  <button
                    v-if="row.certificate_id"
                    @click="downloadCertificate(row)"
                    class="text-purple-600 hover:text-purple-800 text-sm font-medium px-2 py-1 hover:bg-purple-50 rounded"
                  >
                    Download
                  </button>

                  <button
                    v-if="row.ui_status === 'issued'"
                    @click="revokeCertificate(row)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                  >
                    Revoke
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredRows.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">
                <div class="text-gray-400">
                  <span class="text-3xl mb-2 block">🎓</span>
                  <p class="text-gray-500">No results</p>
                  <p class="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">
        {{ error }}
      </p>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import AdminLayout from "./AdminLayout.vue";

export default {
  name: "AdminCertificates",
  components: { AdminLayout },
  setup() {
    // ✅ FIX: backend is running on PORT 3000 based on your server.js
    const API_BASE = "http://localhost:3000";

    const rows = ref([]);
    const loading = ref(true);
    const error = ref("");

    const searchQuery = ref("");
    const selectedCourse = ref("");
    const selectedStatus = ref("");
    const selectedDate = ref("");
    const sortBy = ref("dateDesc");

    const courseOptions = computed(() => {
      const set = new Set(rows.value.map((r) => r.course_name).filter(Boolean));
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    });

    const issuedCount = computed(() => rows.value.filter((r) => r.ui_status === "issued").length);
    const revokedCount = computed(() => rows.value.filter((r) => r.ui_status === "revoked").length);
    const pendingCount = computed(() => rows.value.filter((r) => r.ui_status === "ready").length);

    const filteredRows = computed(() => {
      let result = [...rows.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(
          (r) =>
            (r.student_name || "").toLowerCase().includes(q) ||
            (r.student_email || "").toLowerCase().includes(q) ||
            (r.course_name || "").toLowerCase().includes(q) ||
            (r.certificate_code || "").toLowerCase().includes(q),
        );
      }

      if (selectedCourse.value) {
        result = result.filter((r) => r.course_name === selectedCourse.value);
      }

      if (selectedStatus.value) {
        result = result.filter((r) => r.ui_status === selectedStatus.value);
      }

      if (selectedDate.value) {
        // compare YYYY-MM-DD from done_at
        result = result.filter((r) => (r.done_at || "").slice(0, 10) === selectedDate.value);
      }

      result.sort((a, b) => {
        switch (sortBy.value) {
          case "dateDesc":
            return new Date(b.done_at || 0) - new Date(a.done_at || 0);
          case "dateAsc":
            return new Date(a.done_at || 0) - new Date(b.done_at || 0);
          case "name":
            return (a.student_name || "").localeCompare(b.student_name || "");
          case "course":
            return (a.course_name || "").localeCompare(b.course_name || "");
          case "status":
            return (a.ui_status || "").localeCompare(b.ui_status || "");
          default:
            return 0;
        }
      });

      return result;
    });

    const getInitials = (name) => {
      const safe = String(name || "").trim();
      if (!safe) return "??";
      return safe
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "—";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "issued":
          return "bg-green-100 text-green-800";
        case "ready":
          return "bg-yellow-100 text-yellow-800";
        case "revoked":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const formatStatus = (status) => {
      if (status === "ready") return "Ready";
      return String(status || "").charAt(0).toUpperCase() + String(status || "").slice(1);
    };

    const clearFilters = () => {
      searchQuery.value = "";
      selectedCourse.value = "";
      selectedStatus.value = "";
      selectedDate.value = "";
    };

    const fetchRows = async () => {
      loading.value = true;
      error.value = "";
      try {
        const res = await axios.get(`${API_BASE}/api/admin/certificates/completions`, {
          withCredentials: true,
        });
        rows.value = res.data.data || [];
      } catch (e) {
        error.value = e?.response?.data?.message || e.message || "Failed to load.";
      } finally {
        loading.value = false;
      }
    };

    const generateForReservation = async (row) => {
      error.value = "";
      try {
        const ok = confirm(`Generate certificate for ${row.student_name} (${row.course_name})?`);
        if (!ok) return;

        await axios.post(
          `${API_BASE}/api/admin/certificates/generate`,
          { reservation_id: row.reservation_id },
          { withCredentials: true },
        );

        await fetchRows();
      } catch (e) {
        error.value = e?.response?.data?.message || e.message || "Failed to generate certificate.";
      }
    };

    const viewCertificate = (row) => {
      const url = `${API_BASE}/api/admin/certificates/${row.certificate_id}/view`;
      window.open(url, "_blank");
    };

    const downloadCertificate = (row) => {
      const url = `${API_BASE}/api/admin/certificates/${row.certificate_id}/download`;
      window.open(url, "_blank");
    };

    const revokeCertificate = async (row) => {
      error.value = "";
      try {
        const ok = confirm(`Revoke certificate ${row.certificate_code}?`);
        if (!ok) return;

        await axios.patch(
          `${API_BASE}/api/admin/certificates/${row.certificate_id}/revoke`,
          {},
          { withCredentials: true },
        );

        await fetchRows();
      } catch (e) {
        error.value = e?.response?.data?.message || e.message || "Failed to revoke.";
      }
    };

    const exportCsv = () => {
      const headers = ["Student", "Email", "Course", "Done At", "Certificate Code", "Status"];
      const lines = filteredRows.value.map((r) =>
        [
          r.student_name,
          r.student_email,
          r.course_name,
          (r.done_at || "").slice(0, 10),
          r.certificate_code || "",
          r.ui_status,
        ]
          .map((v) => `"${String(v || "").replace(/"/g, '""')}"`)
          .join(","),
      );

      const csv = [headers.join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "certificates.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    };

    onMounted(fetchRows);

    return {
      rows,
      loading,
      error,
      searchQuery,
      selectedCourse,
      selectedStatus,
      selectedDate,
      sortBy,
      courseOptions,
      filteredRows,
      issuedCount,
      pendingCount,
      revokedCount,
      getInitials,
      formatDate,
      getStatusClass,
      formatStatus,
      clearFilters,
      fetchRows,
      generateForReservation,
      viewCertificate,
      downloadCertificate,
      revokeCertificate,
      exportCsv,
    };
  },
};
</script>
