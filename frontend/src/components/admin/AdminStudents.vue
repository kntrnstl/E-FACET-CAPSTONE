<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search student..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">👨‍🎓 Students Management</h2>
        <button 
          @click="openAddModal"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          ➕ Add Student
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
          <select 
            v-model="selectedCourse" 
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">All Courses</option>
            <option v-for="c in courses" :key="c.id" :value="c.course_name">
              {{ c.course_name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            v-model="selectedStatus.val" 
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All</option>
          </select>
        </div>

        <div class="ml-auto">
          <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select 
            v-model="sortBy"
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="course">Course</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
        <div v-if="loading" class="p-6 text-center text-gray-500">
          Loading students...
        </div>

        <table v-else class="w-full text-sm">
          <thead class="bg-green-50 text-green-900">
            <tr>
              <th class="text-left p-3">Name</th>
              <th class="text-left p-3">Email</th>
              <th class="text-left p-3">Course</th>
              <th class="text-left p-3">Status</th>
              <th class="text-right p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr 
              v-for="s in filteredStudents" 
              :key="s.id"
              class="border-t border-gray-100 hover:bg-gray-50"
            >
              <td class="p-3 flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold">
                  {{ getInitials(s.name) }}
                </div>
                <div class="font-medium text-gray-900">
                  {{ s.name }}
                </div>
              </td>

              <td class="p-3 text-gray-700">{{ s.email }}</td>
              <td class="p-3 text-gray-700">{{ s.course }}</td>

              <td class="p-3">
                <span 
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    s.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ s.status }}
                </span>
              </td>

              <td class="p-3 text-right">
                <button 
                  @click="openEditModal(s)"
                  class="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700 mr-2"
                >
                  Edit
                </button>
                <button 
                  @click="openDeleteModal(s)"
                  class="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>

            <tr v-if="!filteredStudents.length">
              <td colspan="5" class="p-6 text-center text-gray-500">
                No students found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div 
        v-if="showModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div class="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-800">
              {{ isEditing ? "Edit Student" : "Add Student" }}
            </h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-800">✖</button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm text-gray-700 mb-1">Name</label>
              <input 
                v-model="formData.name"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-1">Email</label>
              <input 
                v-model="formData.email"
                type="email"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-1">Course</label>
              <input 
                v-model="formData.course"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-700 mb-1">Status</label>
              <select 
                v-model="formData.status"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 mt-6">
            <button 
              @click="closeModal"
              class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>

            <button 
              @click="submitStudent"
              class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              {{ isEditing ? "Save Changes" : "Add Student" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Modal -->
      <div 
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <div class="bg-white w-full max-w-md rounded-xl shadow-lg p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-2">Delete Student</h3>
          <p class="text-sm text-gray-600">
            Are you sure you want to delete <b>{{ studentToDelete?.name }}</b>?
          </p>

          <div class="flex justify-end gap-2 mt-6">
            <button 
              @click="closeDeleteModal"
              class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>

            <button 
              @click="confirmDelete"
              class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, reactive } from "vue";
import axios from "axios";
import AdminLayout from "./AdminLayout.vue";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export default {
  name: "AdminStudents",
  components: { AdminLayout },

  setup() {
    // State
    const students = ref([]);
    const loading = ref(false);

    const searchQuery = ref("");
    const selectedCourse = ref(""); // optional, but we focus Driving
    const courses = ref([]);
    const selectedStatus = reactive({
      val: "active",
    });
    const sortBy = ref("name");

    // Modals
    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
    const studentToDelete = ref(null);

    // Form
    const formData = reactive({
      id: null,
      name: "",
      email: "",
      course: "",
      status: "active",
    });

    const fetchCourses = async () => {
      try {
        const res = await api.get("/admin/courses");
        courses.value = res.data?.data || [];
      } catch (err) {
        console.error("fetchCourses error:", err);
        courses.value = [];
      }
    };

    // ✅ Fetch confirmed driving students from backend
    const fetchStudents = async () => {
      loading.value = true;
      try {
        // We focus driving; backend already filters by CONFIRMED + Driving
        const res = await api.get("/admin/students/confirmed", {
          params: {
            q: searchQuery.value || "",
            status: selectedStatus.val || "active",
            // course param optional; you can force driving keyword
            course: "Driving",
          },
        });

        const list = res.data?.data || [];
        students.value = list.map((x) => ({
          id: x.id,
          name: x.name || "—",
          email: x.email || "—",
          course: x.course || x.course_name || "Driving",
          status: x.status || "active",
        }));
      } catch (err) {
        console.error("fetchStudents error:", err);
        students.value = [];
      } finally {
        loading.value = false;
      }
    };

    const filteredStudents = computed(() => {
      let arr = [...students.value];

      // search
      const q = (searchQuery.value || "").toLowerCase().trim();
      if (q) {
        arr = arr.filter((s) =>
          [s.name, s.email, s.course, s.status]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
      }

      // status filter
      if (selectedStatus.val && selectedStatus.val !== "all") {
        arr = arr.filter((s) => s.status === selectedStatus.val);
      }

      // course filter (optional)
      if (selectedCourse.value) {
        arr = arr.filter((s) => s.course === selectedCourse.value);
      }

      // sort
      const key = sortBy.value;
      arr.sort((a, b) => String(a[key] || "").localeCompare(String(b[key] || "")));

      return arr;
    });

    const getInitials = (name) => {
      const parts = String(name || "").trim().split(/\s+/);
      const a = parts[0]?.[0] || "";
      const b = parts[1]?.[0] || "";
      return (a + b).toUpperCase() || "—";
    };

    // Modal handlers
    const openAddModal = () => {
      isEditing.value = false;
      formData.id = null;
      formData.name = "";
      formData.email = "";
      formData.course = "Driving";
      formData.status = "active";
      showModal.value = true;
    };

    const openEditModal = (s) => {
      isEditing.value = true;
      formData.id = s.id;
      formData.name = s.name;
      formData.email = s.email;
      formData.course = s.course;
      formData.status = s.status;
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const openDeleteModal = (s) => {
      studentToDelete.value = s;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      studentToDelete.value = null;
      showDeleteModal.value = false;
    };

    // Actions
    const submitStudent = async () => {
      try {
        if (!formData.name || !formData.email) return;

        if (isEditing.value) {
          await api.put(`/admin/students/${formData.id}`, {
            name: formData.name,
            email: formData.email,
            course: formData.course,
            status: formData.status,
          });
        } else {
          await api.post(`/admin/students`, {
            name: formData.name,
            email: formData.email,
            course: formData.course,
            status: formData.status,
          });
        }

        closeModal();
        fetchStudents();
      } catch (err) {
        console.error("submitStudent error:", err);
      }
    };

    const confirmDelete = async () => {
      try {
        if (!studentToDelete.value?.id) return;
        await api.delete(`/admin/students/${studentToDelete.value.id}`);
        closeDeleteModal();
        fetchStudents();
      } catch (err) {
        console.error("confirmDelete error:", err);
      }
    };

    // Init
    onMounted(() => {
      fetchCourses();
      fetchStudents();
    });

    return {
      students,
      loading,
      searchQuery,
      selectedCourse,
      courses,
      selectedStatus,
      sortBy,
      showModal,
      showDeleteModal,
      isEditing,
      studentToDelete,
      formData,
      filteredStudents,

      getInitials,
      openAddModal,
      openEditModal,
      closeModal,
      openDeleteModal,
      closeDeleteModal,
      submitStudent,
      confirmDelete,
      fetchStudents,
    };
  },
};
</script>
