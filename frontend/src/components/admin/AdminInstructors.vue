<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input
        type="text"
        :placeholder="activeTab === 'instructors' ? 'Search instructors...' : 'Search trainers...'"
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <!-- ✅ Tabs (Instructor / Trainer) -->
      <div class="flex gap-2 mb-4">
        <button
          @click="activeTab = 'instructors'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium border',
            activeTab === 'instructors'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          👨‍🏫 Instructor Management
        </button>

        <button
          @click="activeTab = 'trainers'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium border',
            activeTab === 'trainers'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          🧑‍🏫 Trainer Management
        </button>
      </div>

      <!-- ===================================================== -->
      <!-- ✅ INSTRUCTORS TAB -->
      <!-- ===================================================== -->
      <div v-if="activeTab === 'instructors'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-green-800">👨‍🏫 Instructors Management</h2>
          <button
            @click="openAddModal"
            class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            ➕ Add New Instructor
          </button>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
          <p class="mt-3 text-gray-600">Loading instructors...</p>
        </div>

        <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <div class="text-sm text-gray-600">
              Showing {{ filteredInstructors.length }} of {{ instructors.length }} instructors
            </div>
            <select v-model="statusFilter" class="text-sm border rounded px-2 py-1">
              <option value="">All Status</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Code</th>
                <th class="py-3 px-4 text-left font-medium">Name</th>
                <th class="py-3 px-4 text-left font-medium">Email</th>
                <th class="py-3 px-4 text-left font-medium">Contact</th>
                <th class="py-3 px-4 text-left font-medium">Specialization</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="i in filteredInstructors"
                :key="i.instructor_id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4 font-medium">{{ i.instructor_code }}</td>
                <td class="py-3 px-4">
                  <div class="font-medium">{{ i.fullname || (i.firstname + ' ' + i.lastname) }}</div>
                  <div class="text-xs text-gray-500">{{ i.firstname }} {{ i.lastname }}</div>
                </td>
                <td class="py-3 px-4">{{ i.email || '—' }}</td>
                <td class="py-3 px-4">{{ i.contact_number || '—' }}</td>
                <td class="py-3 px-4">{{ i.specialization || '—' }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="i.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'"
                  >
                    {{ i.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button
                    @click="editInstructor(i)"
                    class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(i)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredInstructors.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500">
                  No instructors found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add/Edit Instructor Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-bold text-green-800">
                  {{ isEditing ? 'Edit Instructor' : 'Add New Instructor' }}
                </h3>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <form @submit.prevent="saveInstructor">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Instructor Code</label>
                    <input v-model="form.instructor_code" required class="w-full p-2 border rounded-md" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="form.status" class="w-full p-2 border rounded-md">
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <input v-model="form.firstname" required class="w-full p-2 border rounded-md" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                    <input v-model="form.lastname" required class="w-full p-2 border rounded-md" />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                    <input type="email" v-model="form.email" class="w-full p-2 border rounded-md" />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number (optional)</label>
                    <input v-model="form.contact_number" class="w-full p-2 border rounded-md" />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Specialization (optional)</label>
                    <input v-model="form.specialization" class="w-full p-2 border rounded-md" />
                  </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                  <button type="button" @click="closeModal" class="px-4 py-2 border rounded-md">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="saving"
                    class="px-4 py-2 bg-green-700 text-white rounded-md disabled:opacity-60"
                  >
                    {{ saving ? 'Saving...' : (isEditing ? 'Update' : 'Save') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Delete Instructor Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-red-600 mb-2">Confirm Deletion</h3>
            <p class="text-gray-600 mb-4">
              Delete instructor <span class="font-semibold">{{ toDelete?.fullname || (toDelete?.firstname + ' ' + toDelete?.lastname) }}</span>?
            </p>
            <div class="flex justify-end gap-2">
              <button @click="cancelDelete" class="px-4 py-2 border rounded-md">Cancel</button>
              <button
                @click="deleteInstructor"
                :disabled="deleting"
                class="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-60"
              >
                {{ deleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================== -->
      <!-- ✅ TRAINERS TAB -->
      <!-- ===================================================== -->
      <div v-else-if="activeTab === 'trainers'">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-green-800">🧑‍🏫 Trainers Management</h2>
          <button
            @click="openAddTrainerModal"
            class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            ➕ Add New Trainer
          </button>
        </div>

        <div v-if="loadingTrainers" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
          <p class="mt-3 text-gray-600">Loading trainers...</p>
        </div>

        <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <div class="text-sm text-gray-600">
              Showing {{ filteredTrainers.length }} of {{ trainers.length }} trainers
            </div>
            <select v-model="trainerStatusFilter" class="text-sm border rounded px-2 py-1">
              <option value="">All Status</option>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>

          <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Code</th>
                <th class="py-3 px-4 text-left font-medium">Name</th>
                <th class="py-3 px-4 text-left font-medium">Email</th>
                <th class="py-3 px-4 text-left font-medium">Contact</th>
                <th class="py-3 px-4 text-left font-medium">Specialization</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="t in filteredTrainers"
                :key="t.trainer_id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4 font-medium">{{ t.trainer_code }}</td>
                <td class="py-3 px-4">
                  <div class="font-medium">{{ t.fullname || (t.firstname + ' ' + t.lastname) }}</div>
                  <div class="text-xs text-gray-500">{{ t.firstname }} {{ t.lastname }}</div>
                </td>
                <td class="py-3 px-4">{{ t.email || '—' }}</td>
                <td class="py-3 px-4">{{ t.contact_number || '—' }}</td>
                <td class="py-3 px-4">{{ t.specialization || '—' }}</td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="t.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'"
                  >
                    {{ t.status }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button
                    @click="editTrainer(t)"
                    class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDeleteTrainer(t)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredTrainers.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500">
                  No trainers found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add/Edit Trainer Modal -->
        <div v-if="showTrainerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-bold text-green-800">
                  {{ isEditingTrainer ? 'Edit Trainer' : 'Add New Trainer' }}
                </h3>
                <button @click="closeTrainerModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <form @submit.prevent="saveTrainer">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Trainer Code</label>
                    <input v-model="trainerForm.trainer_code" required class="w-full p-2 border rounded-md" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select v-model="trainerForm.status" class="w-full p-2 border rounded-md">
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <input v-model="trainerForm.firstname" required class="w-full p-2 border rounded-md" />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                    <input v-model="trainerForm.lastname" required class="w-full p-2 border rounded-md" />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                    <input type="email" v-model="trainerForm.email" class="w-full p-2 border rounded-md" />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Contact Number (optional)</label>
                    <input v-model="trainerForm.contact_number" class="w-full p-2 border rounded-md" />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Specialization (optional)</label>
                    <input v-model="trainerForm.specialization" class="w-full p-2 border rounded-md" />
                  </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                  <button type="button" @click="closeTrainerModal" class="px-4 py-2 border rounded-md">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="savingTrainer"
                    class="px-4 py-2 bg-green-700 text-white rounded-md disabled:opacity-60"
                  >
                    {{ savingTrainer ? 'Saving...' : (isEditingTrainer ? 'Update' : 'Save') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Delete Trainer Modal -->
        <div v-if="showTrainerDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-md p-6">
            <h3 class="text-lg font-bold text-red-600 mb-2">Confirm Deletion</h3>
            <p class="text-gray-600 mb-4">
              Delete trainer <span class="font-semibold">{{ trainerToDelete?.fullname || (trainerToDelete?.firstname + ' ' + trainerToDelete?.lastname) }}</span>?
            </p>
            <div class="flex justify-end gap-2">
              <button @click="cancelDeleteTrainer" class="px-4 py-2 border rounded-md">Cancel</button>
              <button
                @click="deleteTrainer"
                :disabled="deletingTrainer"
                class="px-4 py-2 bg-red-600 text-white rounded-md disabled:opacity-60"
              >
                {{ deletingTrainer ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, reactive, onMounted } from "vue";
import axios from "axios";
import AdminLayout from "./AdminLayout.vue";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export default {
  name: "AdminInstructorTrainer",
  components: { AdminLayout },
  setup() {
    const activeTab = ref("instructors");

    // shared search for both tabs
    const searchQuery = ref("");

    // =====================
    // INSTRUCTORS
    // =====================
    const instructors = ref([]);
    const loading = ref(true);
    const statusFilter = ref("");

    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
    const toDelete = ref(null);

    const saving = ref(false);
    const deleting = ref(false);

    const form = reactive({
      instructor_id: null,
      instructor_code: "",
      firstname: "",
      lastname: "",
      email: "",
      contact_number: "",
      specialization: "",
      status: "active",
    });

    const fetchInstructors = async () => {
      loading.value = true;
      try {
        const res = await api.get("/admin/instructors");
        instructors.value = Array.isArray(res.data?.data) ? res.data.data : [];
      } catch (err) {
        console.error("fetchInstructors error:", err);
        alert(err?.response?.data?.message || err.message || "Failed to fetch instructors");
        instructors.value = [];
      } finally {
        loading.value = false;
      }
    };

    const filteredInstructors = computed(() => {
      let r = [...instructors.value];

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        r = r.filter((i) =>
          String(i.instructor_code || "").toLowerCase().includes(q) ||
          String(i.firstname || "").toLowerCase().includes(q) ||
          String(i.lastname || "").toLowerCase().includes(q) ||
          String(i.fullname || "").toLowerCase().includes(q) ||
          String(i.email || "").toLowerCase().includes(q) ||
          String(i.specialization || "").toLowerCase().includes(q)
        );
      }

      if (statusFilter.value) {
        r = r.filter((i) => (i.status || "") === statusFilter.value);
      }

      return r;
    });

    const resetForm = () => {
      form.instructor_id = null;
      form.instructor_code = "";
      form.firstname = "";
      form.lastname = "";
      form.email = "";
      form.contact_number = "";
      form.specialization = "";
      form.status = "active";
    };

    const openAddModal = () => {
      isEditing.value = false;
      resetForm();
      showModal.value = true;
    };

    const editInstructor = (i) => {
      isEditing.value = true;
      form.instructor_id = i.instructor_id;
      form.instructor_code = i.instructor_code || "";
      form.firstname = i.firstname || "";
      form.lastname = i.lastname || "";
      form.email = i.email || "";
      form.contact_number = i.contact_number || "";
      form.specialization = i.specialization || "";
      form.status = i.status || "active";
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    const saveInstructor = async () => {
      if (saving.value) return;
      saving.value = true;

      try {
        const payload = {
          instructor_code: form.instructor_code,
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email || null,
          contact_number: form.contact_number || null,
          specialization: form.specialization || null,
          status: form.status,
        };

        if (isEditing.value && form.instructor_id) {
          await api.put(`/admin/instructors/${form.instructor_id}`, payload);
        } else {
          await api.post(`/admin/instructors`, payload);
        }

        await fetchInstructors();
        closeModal();
      } catch (err) {
        console.error("saveInstructor error:", err);
        alert(err?.response?.data?.message || err.message || "Failed to save instructor");
      } finally {
        saving.value = false;
      }
    };

    const confirmDelete = (i) => {
      toDelete.value = i;
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      toDelete.value = null;
      showDeleteModal.value = false;
    };

    const deleteInstructor = async () => {
      if (!toDelete.value || deleting.value) return;
      deleting.value = true;

      try {
        await api.delete(`/admin/instructors/${toDelete.value.instructor_id}`);
        await fetchInstructors();
        cancelDelete();
      } catch (err) {
        console.error("deleteInstructor error:", err);
        alert(err?.response?.data?.message || err.message || "Failed to delete instructor");
      } finally {
        deleting.value = false;
      }
    };

    // =====================
    // TRAINERS (TESDA)
    // =====================
    const trainers = ref([]);
    const loadingTrainers = ref(false);

    const trainerStatusFilter = ref("");
    const showTrainerModal = ref(false);
    const showTrainerDeleteModal = ref(false);
    const isEditingTrainer = ref(false);
    const trainerToDelete = ref(null);

    const savingTrainer = ref(false);
    const deletingTrainer = ref(false);

    const trainerForm = reactive({
      trainer_id: null,
      trainer_code: "",
      firstname: "",
      lastname: "",
      email: "",
      contact_number: "",
      specialization: "",
      status: "active",
    });

    const fetchTrainers = async () => {
      loadingTrainers.value = true;
      try {
        const res = await api.get("/admin/tesda/trainers");
        trainers.value = Array.isArray(res.data?.data) ? res.data.data : [];
      } catch (err) {
        console.error("fetchTrainers error:", err);
        alert(err?.response?.data?.message || err.message || "Failed to fetch trainers");
        trainers.value = [];
      } finally {
        loadingTrainers.value = false;
      }
    };

    const filteredTrainers = computed(() => {
      let r = [...trainers.value];

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        r = r.filter((t) =>
          String(t.trainer_code || "").toLowerCase().includes(q) ||
          String(t.firstname || "").toLowerCase().includes(q) ||
          String(t.lastname || "").toLowerCase().includes(q) ||
          String(t.fullname || "").toLowerCase().includes(q) ||
          String(t.email || "").toLowerCase().includes(q) ||
          String(t.specialization || "").toLowerCase().includes(q)
        );
      }

      if (trainerStatusFilter.value) {
        r = r.filter((t) => (t.status || "") === trainerStatusFilter.value);
      }

      return r;
    });

    const resetTrainerForm = () => {
      trainerForm.trainer_id = null;
      trainerForm.trainer_code = "";
      trainerForm.firstname = "";
      trainerForm.lastname = "";
      trainerForm.email = "";
      trainerForm.contact_number = "";
      trainerForm.specialization = "";
      trainerForm.status = "active";
    };

    const openAddTrainerModal = () => {
      isEditingTrainer.value = false;
      resetTrainerForm();
      showTrainerModal.value = true;
    };

    const editTrainer = (t) => {
      isEditingTrainer.value = true;
      trainerForm.trainer_id = t.trainer_id;
      trainerForm.trainer_code = t.trainer_code || "";
      trainerForm.firstname = t.firstname || "";
      trainerForm.lastname = t.lastname || "";
      trainerForm.email = t.email || "";
      trainerForm.contact_number = t.contact_number || "";
      trainerForm.specialization = t.specialization || "";
      trainerForm.status = t.status || "active";
      showTrainerModal.value = true;
    };

    const closeTrainerModal = () => {
      showTrainerModal.value = false;
      resetTrainerForm();
    };

    const saveTrainer = async () => {
      if (savingTrainer.value) return;
      savingTrainer.value = true;

      try {
        const payload = {
          trainer_code: trainerForm.trainer_code,
          firstname: trainerForm.firstname,
          lastname: trainerForm.lastname,
          email: trainerForm.email || null,
          contact_number: trainerForm.contact_number || null,
          specialization: trainerForm.specialization || null,
          status: trainerForm.status,
          user_id: null,
        };

        if (isEditingTrainer.value && trainerForm.trainer_id) {
          await api.put(`/admin/tesda/trainers/${trainerForm.trainer_id}`, payload);
        } else {
          await api.post(`/admin/tesda/trainers`, payload);
        }

        await fetchTrainers();
        closeTrainerModal();
      } catch (err) {
        console.error("saveTrainer error:", err);
        alert(err?.response?.data?.message || err.message || "Failed to save trainer");
      } finally {
        savingTrainer.value = false;
      }
    };

    const confirmDeleteTrainer = (t) => {
      trainerToDelete.value = t;
      showTrainerDeleteModal.value = true;
    };

    const cancelDeleteTrainer = () => {
      trainerToDelete.value = null;
      showTrainerDeleteModal.value = false;
    };

    const deleteTrainer = async () => {
      if (!trainerToDelete.value || deletingTrainer.value) return;
      deletingTrainer.value = true;

      try {
        await api.delete(`/admin/tesda/trainers/${trainerToDelete.value.trainer_id}`);
        await fetchTrainers();
        cancelDeleteTrainer();
      } catch (err) {
        console.error("deleteTrainer error:", err);
        alert(err?.response?.data?.message || err.message || "Failed to delete trainer");
      } finally {
        deletingTrainer.value = false;
      }
    };

    onMounted(async () => {
      await fetchInstructors();
      await fetchTrainers();
    });

    return {
      activeTab,
      searchQuery,

      // instructors
      instructors,
      loading,
      statusFilter,
      filteredInstructors,
      showModal,
      showDeleteModal,
      isEditing,
      toDelete,
      form,
      saving,
      deleting,
      openAddModal,
      editInstructor,
      closeModal,
      saveInstructor,
      confirmDelete,
      cancelDelete,
      deleteInstructor,

      // trainers
      trainers,
      loadingTrainers,
      trainerStatusFilter,
      filteredTrainers,
      showTrainerModal,
      showTrainerDeleteModal,
      isEditingTrainer,
      trainerToDelete,
      trainerForm,
      savingTrainer,
      deletingTrainer,
      openAddTrainerModal,
      editTrainer,
      closeTrainerModal,
      saveTrainer,
      confirmDeleteTrainer,
      cancelDeleteTrainer,
      deleteTrainer,
    };
  },
};
</script>
