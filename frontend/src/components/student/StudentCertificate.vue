<template>
  <StudentLayout active-page="certificate">
    <template #header-left>
      <input
        type="text"
        placeholder="Search..."
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        v-model="searchQuery"
      />
    </template>

    <div>
      <h2 class="text-lg font-bold text-green-800 mb-6">🎓 Your Certificates</h2>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-100 p-4 rounded-lg border border-green-200">
          <p class="text-sm text-gray-600">Total</p>
          <h3 class="text-2xl font-bold text-green-800 mt-1">{{ stats.total }}</h3>
        </div>
        <div class="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <p class="text-sm text-gray-600">Completed</p>
          <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ stats.completed }}</h3>
        </div>
        <div class="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <p class="text-sm text-gray-600">Pending</p>
          <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ stats.pending }}</h3>
        </div>
        <div class="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <p class="text-sm text-gray-600">Available</p>
          <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ stats.available }}</h3>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-md font-semibold text-green-800">Certificate List</h3>

          <div class="flex items-center gap-2">
            <select
              v-model="filterStatus"
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>

            <button
              @click="fetchCertificates"
              class="p-1 text-green-700 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="Refresh"
            >
              ↻
            </button>
          </div>
        </div>

        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p class="mt-2 text-gray-600">Loading certificates...</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Course</th>
                <th class="py-3 px-4 text-left font-medium">Type</th>
                <th class="py-3 px-4 text-left font-medium">Issue Date</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in filtered"
                :key="c.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="font-medium text-gray-800">{{ c.course }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ c.certificate_code || "—" }}</div>
                </td>

                <td class="py-3 px-4">{{ c.type }}</td>

                <td class="py-3 px-4">
                  {{ c.issueDate ? formatDate(c.issueDate) : "Not yet issued" }}
                </td>

                <td class="py-3 px-4">
                  <span class="px-3 py-1 rounded-full text-xs font-medium" :class="statusClass(c.status)">
                    {{ c.status === "completed" ? "Completed" : "Pending" }}
                  </span>
                </td>

                <td class="py-3 px-4">
                  <div class="flex gap-2">
                    <button
                      v-if="c.certificate_id"
                      @click="viewCertificate(c)"
                      class="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      👁️ View
                    </button>

                    <button
                      v-if="c.certificate_id"
                      @click="downloadCertificate(c)"
                      class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      📥 Download
                    </button>

                    <span v-if="!c.certificate_id" class="text-xs text-gray-500 py-1">
                      Waiting for admin to generate
                    </span>
                  </div>
                </td>
              </tr>

              <tr v-if="filtered.length === 0">
                <td colspan="5" class="py-8 text-center text-gray-500">
                  No certificates found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    </div>
  </StudentLayout>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import StudentLayout from "./StudentLayout.vue";

export default {
  name: "StudentCertificate",
  components: { StudentLayout },
  setup() {
    const API_BASE = "http://localhost:3000";

    const loading = ref(false);
    const error = ref("");
    const certificates = ref([]);

    const searchQuery = ref("");
    const filterStatus = ref("all");

    const fetchCertificates = async () => {
      loading.value = true;
      error.value = "";
      try {
        const res = await axios.get(`${API_BASE}/api/student/certificates`, {
          withCredentials: true,
        });
        certificates.value = res.data.data || [];
      } catch (e) {
        error.value = e?.response?.data?.message || e.message || "Failed to load.";
      } finally {
        loading.value = false;
      }
    };

    const filtered = computed(() => {
      let list = [...certificates.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        list = list.filter((c) => (c.course || "").toLowerCase().includes(q));
      }

      if (filterStatus.value !== "all") {
        list = list.filter((c) => c.status === filterStatus.value);
      }

      return list;
    });

    const stats = computed(() => {
      const total = certificates.value.length;
      const completed = certificates.value.filter((c) => c.status === "completed").length;
      const pending = certificates.value.filter((c) => c.status === "pending").length;
      const available = completed; // downloadable ones
      return { total, completed, pending, available };
    });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    };

    const statusClass = (status) => {
      if (status === "completed") return "bg-green-100 text-green-800";
      return "bg-gray-100 text-gray-800";
    };

    const viewCertificate = (c) => {
      window.open(`${API_BASE}/api/student/certificates/${c.certificate_id}/view`, "_blank");
    };

    const downloadCertificate = (c) => {
      window.open(`${API_BASE}/api/student/certificates/${c.certificate_id}/download`, "_blank");
    };

    onMounted(fetchCertificates);

    return {
      loading,
      error,
      certificates,
      searchQuery,
      filterStatus,
      filtered,
      stats,
      fetchCertificates,
      viewCertificate,
      downloadCertificate,
      formatDate,
      statusClass,
    };
  },
};
</script>
