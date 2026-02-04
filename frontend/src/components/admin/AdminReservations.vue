<template>
  <AdminLayout>
    <template #header-left>
      <input
        type="text"
        placeholder="Search reservation (student, email, course)..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">📌 Reservations Management</h2>
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
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
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
        <p class="mt-3 text-gray-600">Loading reservations...</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredReservations.length }} of {{ reservations.length }} reservations
          </div>
        </div>

        <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
          <thead class="bg-green-800 text-white">
            <tr>
              <th class="py-3 px-4 text-left font-medium">Reservation ID</th>
              <th class="py-3 px-4 text-left font-medium">Student</th>
              <th class="py-3 px-4 text-left font-medium">Course</th>
              <th class="py-3 px-4 text-left font-medium">Schedule</th>
              <th class="py-3 px-4 text-left font-medium">Status</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="r in filteredReservations"
              :key="r.reservation_id"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td class="py-3 px-4 font-mono text-xs">{{ r.reservation_id }}</td>

              <td class="py-3 px-4">
                <div class="font-medium">{{ r.student_name }}</div>
                <div class="text-xs text-gray-500">{{ r.email }}</div>
              </td>

              <td class="py-3 px-4">{{ r.course_name }}</td>

              <td class="py-3 px-4">
                <div class="text-xs text-gray-700">
                  {{ formatManilaDate(r.schedule_date) }}<br />
                  {{ r.startTime }} - {{ r.endTime }}
                </div>
              </td>

              <td class="py-3 px-4">
                <span :class="getStatusClass(r.reservation_status)">
                  {{ String(r.reservation_status || "").toUpperCase() }}
                </span>
              </td>

              <td class="py-3 px-4">
                <button
                  @click="openUpdateStatus(r)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  Update Status
                </button>
                <button
                  @click="viewReservation(r)"
                  class="text-gray-700 hover:text-black text-sm font-medium"
                >
                  View
                </button>
              </td>
            </tr>

            <tr v-if="filteredReservations.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">
                No reservations found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Update Status Modal -->
      <div
        v-if="showStatusModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg w-full max-w-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-green-800">Update Reservation Status</h3>
            <button @click="closeStatusModal" class="text-gray-400 hover:text-gray-600 text-xl">
              ✕
            </button>
          </div>

          <div class="text-sm text-gray-700 mb-3">
            <div><b>Reservation:</b> {{ selectedReservation?.reservation_id }}</div>
            <div><b>Student:</b> {{ selectedReservation?.student_name }}</div>
            <div><b>Course:</b> {{ selectedReservation?.course_name }}</div>
            <div>
              <b>Schedule:</b>
              {{ selectedReservation ? formatManilaDate(selectedReservation.schedule_date) : "" }}
              {{ selectedReservation?.startTime }}-{{ selectedReservation?.endTime }}
            </div>
          </div>

          <select
            v-model="newStatus"
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <div class="flex justify-end gap-2 mt-6">
            <button
              @click="closeStatusModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              @click="saveStatus"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
              :disabled="saving"
            >
              {{ saving ? "Saving..." : "Save" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import AdminLayout from "./AdminLayout.vue";
import axios from "axios";

export default {
  name: "AdminReservations",
  components: { AdminLayout },
  setup() {
    const reservations = ref([]);
    const loading = ref(true);

    const searchQuery = ref("");
    const selectedCourse = ref("");
    const selectedStatus = ref("");

    const showStatusModal = ref(false);
    const selectedReservation = ref(null);
    const newStatus = ref("PENDING");
    const saving = ref(false);

    // ✅ Convert UTC ISO (with Z) to Manila local date (YYYY-MM-DD)
    const formatManilaDate = (value) => {
      if (!value) return "";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
    };

    const courseOptions = computed(() => {
      const set = new Set(reservations.value.map((r) => r.course_name).filter(Boolean));
      return Array.from(set).sort();
    });

    const filteredReservations = computed(() => {
      let result = [...reservations.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(
          (r) =>
            String(r.student_name || "").toLowerCase().includes(q) ||
            String(r.email || "").toLowerCase().includes(q) ||
            String(r.course_name || "").toLowerCase().includes(q) ||
            String(r.reservation_id || "").toLowerCase().includes(q),
        );
      }

      if (selectedCourse.value) {
        result = result.filter((r) => r.course_name === selectedCourse.value);
      }

      if (selectedStatus.value) {
        result = result.filter(
          (r) => String(r.reservation_status || "").toUpperCase() === selectedStatus.value,
        );
      }

      return result;
    });

    const getStatusClass = (status) => {
      const s = String(status || "").toUpperCase();
      if (s === "CONFIRMED") return "text-green-600 font-semibold";
      if (s === "PENDING") return "text-yellow-600 font-semibold";
      if (s === "CANCELLED") return "text-red-600 font-semibold";
      return "text-gray-600";
    };

    const clearFilters = () => {
      searchQuery.value = "";
      selectedCourse.value = "";
      selectedStatus.value = "";
    };

    const fetchReservations = async () => {
      loading.value = true;
      try {
        const res = await axios.get("http://localhost:3000/api/admin/reservations", {
          withCredentials: true,
        });
        reservations.value = res.data.data || [];
      } catch (err) {
        console.error("fetchReservations error:", err);
        reservations.value = [];
      } finally {
        loading.value = false;
      }
    };

    const viewReservation = (r) => {
      alert(
        `Reservation: ${r.reservation_id}\nStudent: ${r.student_name}\nCourse: ${r.course_name}\nSchedule: ${formatManilaDate(
          r.schedule_date,
        )} ${r.startTime}-${r.endTime}\nStatus: ${String(r.reservation_status || "").toUpperCase()}`,
      );
    };

    const openUpdateStatus = (r) => {
      selectedReservation.value = r;
      newStatus.value = String(r.reservation_status || "PENDING").toUpperCase();
      showStatusModal.value = true;
    };

    const closeStatusModal = () => {
      showStatusModal.value = false;
      selectedReservation.value = null;
    };

    const saveStatus = async () => {
      if (!selectedReservation.value) return;
      saving.value = true;
      try {
        await axios.put(
          `http://localhost:3000/api/admin/reservations/${selectedReservation.value.reservation_id}`,
          { status: newStatus.value },
          { withCredentials: true },
        );

        // update local list
        const idx = reservations.value.findIndex(
          (x) => x.reservation_id === selectedReservation.value.reservation_id,
        );
        if (idx !== -1) {
          reservations.value[idx] = {
            ...reservations.value[idx],
            reservation_status: newStatus.value,
          };
        }

        closeStatusModal();
      } catch (err) {
        console.error("saveStatus error:", err);
        alert("Failed to update status");
      } finally {
        saving.value = false;
      }
    };

    onMounted(() => {
      fetchReservations();
    });

    return {
      reservations,
      loading,
      searchQuery,
      selectedCourse,
      selectedStatus,
      courseOptions,
      filteredReservations,
      getStatusClass,
      clearFilters,
      viewReservation,
      openUpdateStatus,
      closeStatusModal,
      showStatusModal,
      selectedReservation,
      newStatus,
      saveStatus,
      saving,
      formatManilaDate,
    };
  },
};
</script>