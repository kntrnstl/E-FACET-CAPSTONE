<template>
  <AdminLayout>
    <template #header-left>
      <input
        type="text"
        placeholder="Search reservation (student, email, course, id)..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">📌 Reservations Management</h2>
      </div>

      <!-- ✅ Tabs: Verification / Ongoing / History -->
      <div class="flex gap-2 mb-5">
        <button
          class="px-4 py-2 rounded-md font-medium"
          :class="activeTab === 'verification' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          @click="activeTab = 'verification'"
        >
          For Verification
        </button>

        <button
          class="px-4 py-2 rounded-md font-medium"
          :class="activeTab === 'ongoing' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          @click="activeTab = 'ongoing'"
        >
          Confirmed Reservations
        </button>

        <button
          class="px-4 py-2 rounded-md font-medium"
          :class="activeTab === 'history' ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
          @click="activeTab = 'history'"
        >
          Completed / History
        </button>
      </div>

      <!-- ========================= -->
      <!-- FILTERS -->
      <!-- ========================= -->
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

        <!-- Status filter depends on tab -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>

          <!-- Verification tab -->
          <select
            v-if="activeTab === 'verification'"
            v-model="selectedStatus"
            class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All</option>
            <option value="PENDING">PENDING (Verification)</option>
          </select>

          <!-- Ongoing tab -->
          <select
            v-else-if="activeTab === 'ongoing'"
            v-model="selectedStatus"
            class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="ACTIVE">ACTIVE</option>
          </select>

          <!-- History tab -->
          <select
            v-else
            v-model="selectedStatus"
            class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All</option>
            <option value="DONE">DONE</option>
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

          <button
            @click="fetchReservations"
            class="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <!-- ========================= -->
      <!-- LOADING -->
      <!-- ========================= -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading...</p>
      </div>

      <!-- ========================= -->
      <!-- TABLE (shared for all tabs) -->
      <!-- ========================= -->
      <div
        v-else
        class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Showing {{ filteredRows.length }} of {{ currentRows.length }} records
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
              <th class="py-3 px-4 text-left font-medium">Payment</th>
              <th class="py-3 px-4 text-left font-medium">Requirements</th>
              <th class="py-3 px-4 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="r in filteredRows"
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
                  {{ formatManilaDateOnly(r.schedule_date) }}<br />
                  {{ r.startTime }} - {{ r.endTime }}
                </div>
              </td>

              <td class="py-3 px-4">
                <span :class="getStatusClass(displayStatus(r))">
                  {{ String(displayStatus(r) || "").toUpperCase() }}
                </span>
              </td>

              <!-- Payment -->
              <td class="py-3 px-4">
                <span v-if="!isGcash(r)" class="text-xs text-gray-500">Cash (no proof)</span>
                <button
                  v-else
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  @click="openDetails(r, 'payment')"
                >
                  View Payment
                </button>
              </td>

              <!-- Requirements -->
              <td class="py-3 px-4">
                <span v-if="isRequirementsWalkIn(r)" class="text-xs text-gray-500">Walk-in submission</span>
                <button
                  v-else
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  @click="openDetails(r, 'requirements')"
                >
                  View Requirements
                </button>
              </td>

              <td class="py-3 px-4">
                <!-- ✅ allow update status in verification + ongoing only -->
                <button
                  v-if="activeTab !== 'history'"
                  @click="openUpdateStatus(r)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                >
                  Update Status
                </button>

                <button
                  @click="openDetails(r)"
                  class="text-gray-700 hover:text-black text-sm font-medium"
                >
                  View Full
                </button>
              </td>
            </tr>

            <tr v-if="filteredRows.length === 0">
              <td colspan="8" class="py-8 text-center text-gray-500">No records found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ===================== -->
      <!-- Update Status Modal -->
      <!-- ===================== -->
      <div
        v-if="showStatusModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg w-full max-w-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-green-800">Update Reservation Status</h3>
            <button @click="closeStatusModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div class="text-sm text-gray-700 mb-3">
            <div><b>Reservation:</b> {{ selectedReservation?.reservation_id }}</div>
            <div><b>Student:</b> {{ selectedReservation?.student_name }}</div>
            <div><b>Course:</b> {{ selectedReservation?.course_name }}</div>
            <div>
              <b>Schedule:</b>
              {{ selectedReservation ? formatManilaDateOnly(selectedReservation.schedule_date) : "" }}
              {{ selectedReservation?.startTime }}-{{ selectedReservation?.endTime }}
            </div>

            <!-- extra context for verification -->
            <div v-if="String(selectedReservation?.admin_status || '').toUpperCase() === 'PENDING'" class="mt-2 text-xs text-yellow-700">
              *This is PENDING in admin because payment proof is still for verification.
            </div>
          </div>

          <select
            v-model="newStatus"
            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED" disabled>CONFIRMED (Auto)</option>
            <option value="APPROVED">APPROVED</option>
            <option value="DONE">DONE</option>
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

      <!-- ===================== -->
      <!-- View Full Details Modal -->
      <!-- ===================== -->
      <div
        v-if="showDetailsModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-white rounded-lg w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-green-800">Reservation Full Details</h3>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div v-if="detailsLoading" class="py-10 text-center text-gray-600">Loading details...</div>

          <div v-else>
            <div class="p-4 rounded-lg border bg-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div><b>ID:</b> {{ details?.reservation?.reservation_id }}</div>
                <div><b>Status:</b> {{ details?.reservation?.reservation_status }}</div>
                <div><b>Student:</b> {{ details?.reservation?.student_name }} ({{ details?.reservation?.email }})</div>
                <div><b>Course:</b> {{ details?.reservation?.course_name }}</div>
                <div>
                  <b>Schedule:</b>
                  {{ formatManilaDateOnly(details?.reservation?.schedule_date) }}
                  {{ details?.reservation?.startTime }}-{{ details?.reservation?.endTime }}
                </div>
                <div><b>Payment Method:</b> {{ details?.reservation?.payment_method || "—" }}</div>
                <div><b>Requirements Mode:</b> {{ details?.reservation?.requirements_mode || "—" }}</div>
                <div><b>Notes:</b> {{ details?.reservation?.notes || "—" }}</div>
              </div>
            </div>

            <!-- Payment -->
            <div ref="paymentSectionRef" class="mt-5">
              <h4 class="font-semibold text-gray-800 mb-2">💳 Payment</h4>
              <div class="border rounded-lg p-4">
                <div v-if="!details?.payment" class="text-sm text-gray-500">No payment submission.</div>
                <div v-else class="text-sm space-y-1">
                  <div><b>Payment Ref:</b> <span class="font-mono">{{ details.payment.payment_ref }}</span></div>
                  <div><b>Status:</b> {{ details.payment.status }}</div>
                  <div><b>Amount:</b> ₱{{ (Number(details.payment.amount_centavos || 0) / 100).toLocaleString() }}</div>
                  <div>
                    <b>Proof:</b>
                    <button
                      v-if="details.payment.proof_url"
                      class="text-blue-600 hover:text-blue-800 font-medium ml-2"
                      @click="openProof(details.payment.proof_url)"
                    >
                      View Proof
                    </button>
                    <span v-else class="text-gray-400 ml-2">No proof</span>
                  </div>
                  <div><b>Verified At:</b> {{ details.payment.verified_at || "—" }}</div>
                  <div><b>Admin Note:</b> {{ details.payment.admin_note || "—" }}</div>
                </div>
              </div>
            </div>

            <!-- Requirements -->
            <div ref="requirementsSectionRef" class="mt-5">
              <h4 class="font-semibold text-gray-800 mb-2">📎 Requirements</h4>
              <div class="border rounded-lg p-4">
                <div v-if="!(details?.requirements || []).length" class="text-sm text-gray-500">
                  No uploaded requirements.
                </div>

                <div v-else class="space-y-3">
                  <div
                    v-for="req in details.requirements"
                    :key="req.requirement_id || req.id"
                    class="p-3 rounded border bg-white"
                  >
                    <div class="font-medium text-gray-800">
                      {{ req.requirement_text || req.name || "Requirement" }}
                    </div>

                    <div class="text-xs text-gray-600 mt-1">
                      File:
                      <button
                        v-if="req.file_url"
                        class="text-blue-600 hover:text-blue-800 font-medium ml-2"
                        @click="openProof(req.file_url)"
                      >
                        View File
                      </button>
                      <span v-else class="text-gray-400 ml-2">No file</span>
                    </div>

                    <div class="text-xs text-gray-500 mt-1">
                      Uploaded: {{ req.created_at || "—" }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                @click="closeDetailsModal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================== -->
      <!-- ✅ Proof Modal -->
      <!-- ===================== -->
      <div
        v-if="showProofModal"
        class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4"
      >
        <div class="bg-white rounded-lg w-full max-w-4xl p-4 max-h-[90vh] overflow-hidden">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-bold text-gray-800">Proof Viewer</h3>
            <button @click="closeProofModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div class="border rounded-lg overflow-hidden bg-gray-50">
            <div v-if="proofType === 'image'" class="max-h-[75vh] overflow-auto p-2">
              <img :src="proofFullUrl" class="mx-auto max-w-full h-auto rounded" />
            </div>

            <div v-else class="h-[75vh]">
              <iframe :src="proofFullUrl" class="w-full h-full" frameborder="0"></iframe>
            </div>
          </div>

          <div class="flex justify-end mt-3">
            <a
              :href="proofFullUrl"
              target="_blank"
              rel="noopener"
              class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Open in new tab
            </a>
          </div>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import AdminLayout from "./AdminLayout.vue";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export default {
  name: "AdminReservations",
  components: { AdminLayout },
  setup() {
    // tabs: verification / ongoing / history
    const activeTab = ref("verification");

    const reservations = ref([]);
    const loading = ref(true);

    const searchQuery = ref("");
    const selectedCourse = ref("");
    const selectedStatus = ref("");

    // status modal
    const showStatusModal = ref(false);
    const selectedReservation = ref(null);
    const newStatus = ref("PENDING");
    const saving = ref(false);

    // details modal
    const showDetailsModal = ref(false);
    const detailsLoading = ref(false);
    const details = ref(null);

    // scroll anchors
    const paymentSectionRef = ref(null);
    const requirementsSectionRef = ref(null);

    // proof modal state
    const showProofModal = ref(false);
    const proofUrl = ref("");
    const proofType = ref("image"); // "image" | "pdf"

    const proofFullUrl = computed(() => {
      const url = String(proofUrl.value || "");
      if (!url) return "";
      return url.startsWith("http") ? url : `http://localhost:3000${url}`;
    });

    const formatManilaDateOnly = (value) => {
      if (!value) return "—";
      const s = String(value).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return s;
      return d.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
    };

    const getStatusClass = (status) => {
      const s = String(status || "").toUpperCase();
      if (s === "CONFIRMED") return "text-green-600 font-semibold";
      if (s === "APPROVED") return "text-green-700 font-semibold";
      if (s === "ACTIVE") return "text-blue-700 font-semibold";
      if (s === "PENDING") return "text-yellow-600 font-semibold";
      if (s === "CANCELLED") return "text-red-600 font-semibold";
      if (s === "DONE") return "text-gray-700 font-semibold";
      return "text-gray-600";
    };

    const isGcash = (r) => String(r?.payment_method || "").toUpperCase() === "GCASH";
    const isRequirementsWalkIn = (r) => String(r?.requirements_mode || "").toLowerCase() !== "online";

    // ✅ choose what to display as status per tab
    const displayStatus = (r) => {
      if (activeTab.value === "verification") return r.admin_status || r.reservation_status;
      return r.reservation_status;
    };

    // ✅ buckets
    const reservationsVerification = computed(() =>
      reservations.value.filter((r) =>
        String(r.admin_status || "").toUpperCase() === "PENDING"
      )
    );

    const reservationsOngoing = computed(() =>
      reservations.value.filter((r) =>
        ["CONFIRMED", "APPROVED", "ACTIVE"].includes(
          String(r.reservation_status || "").toUpperCase()
        )
      )
    );

    const reservationsHistory = computed(() =>
      reservations.value.filter((r) =>
        ["DONE", "CANCELLED"].includes(
          String(r.reservation_status || "").toUpperCase()
        )
      )
    );

    const currentRows = computed(() => {
      if (activeTab.value === "verification") return reservationsVerification.value;
      if (activeTab.value === "ongoing") return reservationsOngoing.value;
      return reservationsHistory.value;
    });

    const courseOptions = computed(() => {
      const set = new Set(reservations.value.map((r) => r.course_name).filter(Boolean));
      return Array.from(set).sort();
    });

    // ✅ one filter pipeline for all tabs
    const filteredRows = computed(() => {
      let result = [...currentRows.value];

      const q = String(searchQuery.value || "").toLowerCase().trim();
      if (q) {
        result = result.filter((r) => {
          const hay = [
            r.student_name,
            r.email,
            r.course_name,
            r.reservation_id,
          ]
            .map((x) => String(x || "").toLowerCase())
            .join(" ");
          return hay.includes(q);
        });
      }

      if (selectedCourse.value) {
        result = result.filter((r) => r.course_name === selectedCourse.value);
      }

      if (selectedStatus.value) {
        result = result.filter((r) => {
          const st = String(displayStatus(r) || "").toUpperCase();
          return st === String(selectedStatus.value).toUpperCase();
        });
      }

      return result;
    });

    const clearFilters = () => {
      searchQuery.value = "";
      selectedCourse.value = "";
      selectedStatus.value = "";
    };

    // ✅ reset status filter when switching tab (para di "blank table" bigla)
    watch(activeTab, () => {
      selectedStatus.value = "";
    });

    const fetchReservations = async () => {
      loading.value = true;
      try {
        const res = await api.get("/admin/reservations");
        reservations.value = res.data?.data || [];
      } catch (err) {
        console.error("fetchReservations error:", err);
        reservations.value = [];
      } finally {
        loading.value = false;
      }
    };

    const openUpdateStatus = (r) => {
      selectedReservation.value = r;
      // use real reservation_status for updates
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
        await api.put(`/admin/reservations/${selectedReservation.value.reservation_id}`, {
          status: newStatus.value,
        });

        // ✅ refresh para admin_status recalculated sa backend
        await fetchReservations();

        closeStatusModal();
      } catch (err) {
        console.error("saveStatus error:", err);
        alert(err.response?.data?.message || "Failed to update status");
      } finally {
        saving.value = false;
      }
    };

    // details
    const openDetails = async (r, focus = null) => {
      showDetailsModal.value = true;
      detailsLoading.value = true;
      details.value = null;

      try {
        const res = await api.get(`/admin/reservations/${r.reservation_id}/details`);
        details.value = res.data?.data || null;

        await nextTick();
        if (focus === "payment" && paymentSectionRef.value) {
          paymentSectionRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (focus === "requirements" && requirementsSectionRef.value) {
          requirementsSectionRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (err) {
        console.error("openDetails error:", err);
        alert(err.response?.data?.message || "Failed to load details");
        showDetailsModal.value = false;
      } finally {
        detailsLoading.value = false;
      }
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      details.value = null;
      detailsLoading.value = false;
    };

    // proof modal
    const openProof = (url) => {
      if (!url) return;
      proofUrl.value = url;

      const lower = String(url).toLowerCase();
      const isPdf = lower.endsWith(".pdf") || lower.includes(".pdf?");
      proofType.value = isPdf ? "pdf" : "image";

      showProofModal.value = true;
    };

    const closeProofModal = () => {
      showProofModal.value = false;
      proofUrl.value = "";
      proofType.value = "image";
    };

    onMounted(async () => {
      await fetchReservations();
    });

    return {
      // state
      activeTab,
      reservations,
      loading,

      // filters
      searchQuery,
      selectedCourse,
      selectedStatus,
      courseOptions,
      clearFilters,

      // table
      currentRows,
      filteredRows,
      displayStatus,
      getStatusClass,

      // helpers
      isGcash,
      isRequirementsWalkIn,
      formatManilaDateOnly,
      fetchReservations,

      // status modal
      showStatusModal,
      selectedReservation,
      newStatus,
      saving,
      openUpdateStatus,
      closeStatusModal,
      saveStatus,

      // details modal
      showDetailsModal,
      detailsLoading,
      details,
      openDetails,
      closeDetailsModal,
      paymentSectionRef,
      requirementsSectionRef,

      // proof modal
      showProofModal,
      proofType,
      proofFullUrl,
      openProof,
      closeProofModal,
    };
  },
};
</script>
