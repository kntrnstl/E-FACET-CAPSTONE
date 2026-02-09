<template>
  <TrainerLayout active-page="certificates">
    <!-- Header -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search certificates..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">🎓 Certificate Management</h2>
        <button
          @click="generateCertificate"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          ➕ Generate Certificate
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
              <p class="text-yellow-700 font-medium mt-1">Pending</p>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span class="text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 p-5 rounded-lg border border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-blue-800">{{ certificates.length }}</h3>
              <p class="text-blue-700 font-medium mt-1">Total</p>
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
            <option v-for="c in courses" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            v-model="selectedStatus"
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="issued">Issued</option>
            <option value="pending">Pending</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
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
            @click="exportCertificates"
            class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
          >
            Export
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading certificates...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredCertificates.length }} of {{ certificates.length }} certificates
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
              <th class="py-3 px-4 text-left font-medium">Date Issued</th>
              <th class="py-3 px-4 text-left font-medium">Certificate ID</th>
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
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                    {{ getInitials(certificate.studentName) }}
                  </div>
                  <div>
                    <p class="font-medium">{{ certificate.studentName }}</p>
                    <p class="text-xs text-gray-500">{{ certificate.studentEmail }}</p>
                  </div>
                </div>
              </td>

              <td class="py-3 px-4">
                <span class="font-medium">{{ certificate.course }}</span>
              </td>

              <td class="py-3 px-4 text-gray-600">
                {{ certificate.dateIssued ? formatDate(certificate.dateIssued) : "—" }}
              </td>

              <td class="py-3 px-4">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {{ certificate.certificateId }}
                </code>
              </td>

              <td class="py-3 px-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getStatusClass(certificate.status)"
                >
                  {{ formatStatus(certificate.status) }}
                </span>
              </td>

              <td class="py-3 px-4">
                <div class="flex gap-2">
                  <button
                    @click="viewCertificate(certificate)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded"
                  >
                    View
                  </button>

                  <button
                    @click="printCertificate(certificate)"
                    class="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 hover:bg-green-50 rounded"
                  >
                    Print
                  </button>

                  <button
                    v-if="certificate.status === 'pending'"
                    @click="approveCertificate(certificate)"
                    class="text-yellow-600 hover:text-yellow-800 text-sm font-medium px-2 py-1 hover:bg-yellow-50 rounded"
                  >
                    Approve
                  </button>

                  <button
                    @click="downloadCertificate(certificate)"
                    class="text-purple-600 hover:text-purple-800 text-sm font-medium px-2 py-1 hover:bg-purple-50 rounded"
                  >
                    Download
                  </button>

                  <button
                    v-if="certificate.status !== 'revoked'"
                    @click="revokeCertificate(certificate)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 hover:bg-red-50 rounded"
                  >
                    Revoke
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="filteredCertificates.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">
                <div class="text-gray-400">
                  <span class="text-3xl mb-2 block">🎓</span>
                  <p class="text-gray-500">No certificates found</p>
                  <p class="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredCertificates.length > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Page 1 of 1 • {{ filteredCertificates.length }} items
        </div>
        <div class="flex gap-1">
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">← Previous</button>
          <button class="px-3 py-1 bg-green-700 text-white rounded text-sm">1</button>
          <button class="px-3 py-1 border rounded text-sm hover:bg-gray-50">Next →</button>
        </div>
      </div>
    </div>

    <!-- Generate Certificate Modal -->
    <div v-if="showGenerateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">Generate Certificate</h3>
            <button @click="closeGenerateModal" class="text-gray-400 hover:text-gray-600 text-xl">
              ✕
            </button>
          </div>

          <div class="text-center py-8 text-gray-500">
            Certificate generation form would appear here
          </div>
        </div>
      </div>
    </div>
  </TrainerLayout>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import TrainerLayout from "./TrainerLayout.vue";

export default {
  name: "TrainerCertificates",
  components: { TrainerLayout },
  setup() {
    const certificates = ref([]);
    const loading = ref(true);

    const searchQuery = ref("");
    const selectedCourse = ref("");
    const selectedStatus = ref("");
    const selectedDate = ref("");
    const sortBy = ref("dateDesc");
    const showGenerateModal = ref(false);

    // Courses list (auto-derive from certificates later; for now keep fixed)
    const courses = ref([
      "Driving NC II",
      "Bread & Pastry NC II",
      "Cookery NC II",
      "Automotive NC I",
      "Electrical Installation NC II",
    ]);

    const filteredCertificates = computed(() => {
      let result = [...certificates.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(
          (cert) =>
            cert.studentName.toLowerCase().includes(q) ||
            cert.studentEmail.toLowerCase().includes(q) ||
            cert.course.toLowerCase().includes(q) ||
            cert.certificateId.toLowerCase().includes(q),
        );
      }

      if (selectedCourse.value) result = result.filter((cert) => cert.course === selectedCourse.value);
      if (selectedStatus.value) result = result.filter((cert) => cert.status === selectedStatus.value);
      if (selectedDate.value) result = result.filter((cert) => cert.dateIssued === selectedDate.value);

      result.sort((a, b) => {
        switch (sortBy.value) {
          case "dateDesc":
            return new Date(b.dateIssued || "1970-01-01") - new Date(a.dateIssued || "1970-01-01");
          case "dateAsc":
            return new Date(a.dateIssued || "1970-01-01") - new Date(b.dateIssued || "1970-01-01");
          case "name":
            return a.studentName.localeCompare(b.studentName);
          case "course":
            return a.course.localeCompare(b.course);
          case "status":
            return a.status.localeCompare(b.status);
          default:
            return 0;
        }
      });

      return result;
    });

    const issuedCount = computed(() => certificates.value.filter((c) => c.status === "issued").length);
    const pendingCount = computed(() => certificates.value.filter((c) => c.status === "pending").length);
    const revokedCount = computed(() => certificates.value.filter((c) => c.status === "revoked").length);

    const getInitials = (name) =>
      String(name || "")
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    const formatDate = (dateString) => {
      if (!dateString) return "—";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "issued":
          return "bg-green-100 text-green-800";
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "revoked":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const formatStatus = (status) => (status ? status.charAt(0).toUpperCase() + status.slice(1) : "—");

    const clearFilters = () => {
      searchQuery.value = "";
      selectedCourse.value = "";
      selectedStatus.value = "";
      selectedDate.value = "";
    };

    const exportCertificates = () => alert("Exporting certificates...");
    const generateCertificate = () => (showGenerateModal.value = true);
    const closeGenerateModal = () => (showGenerateModal.value = false);

    const viewCertificate = (c) => alert(`View certificate: ${c.certificateId} for ${c.studentName}`);
    const printCertificate = (c) => alert(`Printing certificate: ${c.certificateId}`);
    const downloadCertificate = (c) => alert(`Downloading certificate: ${c.certificateId}`);

    const approveCertificate = (certificate) => {
      if (confirm(`Approve certificate for ${certificate.studentName}?`)) {
        certificate.status = "issued";
        certificate.dateIssued = new Date().toISOString().split("T")[0];
      }
    };

    const revokeCertificate = (certificate) => {
      if (confirm(`Revoke certificate ${certificate.certificateId}?`)) {
        certificate.status = "revoked";
      }
    };

    const fetchCertificates = () => {
      // MOCK DATA (replace later with API)
      setTimeout(() => {
        certificates.value = [
          {
            id: 1,
            studentName: "Juan Dela Cruz",
            studentEmail: "juan@example.com",
            course: "Driving NC II",
            dateIssued: "2025-11-01",
            certificateId: "CERT-2025-001",
            status: "issued",
          },
          {
            id: 2,
            studentName: "Maria Santos",
            studentEmail: "maria@example.com",
            course: "Bread & Pastry NC II",
            dateIssued: "2025-10-20",
            certificateId: "CERT-2025-002",
            status: "issued",
          },
          {
            id: 3,
            studentName: "Carlos Reyes",
            studentEmail: "carlos@example.com",
            course: "Cookery NC II",
            dateIssued: null,
            certificateId: "CERT-2025-003",
            status: "pending",
          },
          {
            id: 4,
            studentName: "Anna Lim",
            studentEmail: "anna@example.com",
            course: "Automotive NC I",
            dateIssued: "2025-10-15",
            certificateId: "CERT-2025-004",
            status: "issued",
          },
          {
            id: 5,
            studentName: "Robert Tan",
            studentEmail: "robert@example.com",
            course: "Electrical Installation NC II",
            dateIssued: "2025-10-10",
            certificateId: "CERT-2025-005",
            status: "revoked",
          },
          {
            id: 6,
            studentName: "Sarah Chen",
            studentEmail: "sarah@example.com",
            course: "Driving NC II",
            dateIssued: null,
            certificateId: "CERT-2025-006",
            status: "pending",
          },
        ];
        loading.value = false;
      }, 500);
    };

    onMounted(fetchCertificates);

    return {
      certificates,
      loading,
      searchQuery,
      selectedCourse,
      selectedStatus,
      selectedDate,
      sortBy,
      showGenerateModal,
      courses,

      filteredCertificates,
      issuedCount,
      pendingCount,
      revokedCount,

      getInitials,
      formatDate,
      getStatusClass,
      formatStatus,

      clearFilters,
      exportCertificates,
      generateCertificate,
      closeGenerateModal,

      viewCertificate,
      printCertificate,
      downloadCertificate,
      approveCertificate,
      revokeCertificate,
    };
  },
};
</script>
