<template>
  <StudentLayoutTesda active-page="enrollment">
    <!-- Header Slot -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search trainings..."
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        v-model="searchQuery"
      />
    </template>

    <template #header-right>
      <div class="flex items-center gap-4">
        <button class="p-2 hover:bg-blue-700 rounded-full transition-colors">
          <span class="text-xl">🔔</span>
        </button>
        <div class="w-10 h-10 bg-white text-blue-800 rounded-full flex items-center justify-center text-xl font-bold">
          {{ getUserInitial() }}
        </div>
      </div>
    </template>

    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Training Enrollment</h1>

      <!-- Tabs (Reservation removed) -->
      <div class="flex space-x-2 mb-6">
        <button
          @click="activeTab = 'trainings'"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            activeTab === 'trainings' ? 'bg-blue-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
          ]"
        >
          📋 Available Trainings
        </button>

        <button
          @click="activeTab = 'upload'"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            activeTab === 'upload' ? 'bg-blue-700 text-white' : 'bg-gray-300 hover:bg-gray-400'
          ]"
        >
          📎 Requirements Upload
        </button>
      </div>

      <!-- ✅ TRAININGS LIST -->
      <section
        v-if="activeTab === 'trainings'"
        class="bg-white p-6 rounded-xl shadow border border-gray-200"
      >
        <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
          Available Trainings
        </h2>

        <div v-if="loadingCourses" class="text-center py-10 text-gray-600">
          Loading trainings...
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="border-2 border-blue-700 rounded-xl p-6 hover:shadow-lg transition-shadow self-start"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-blue-800 mb-2">
                  {{ course.course_name }} ({{ course.course_code }})
                </h3>
                <p class="text-gray-700">{{ course.description || "—" }}</p>
              </div>

              <span class="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Active
              </span>
            </div>

            <!-- Requirements Toggle Button -->
            <button
              @click="toggleRequirements(course.id)"
              class="w-full flex items-center justify-between text-blue-700 font-medium hover:text-blue-800 transition-colors mb-3 px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <div class="flex items-center gap-2">
                <span>📋</span>
                <span>{{ showReqMap[course.id] ? "Hide Requirements" : "View Requirements" }}</span>
              </div>

              <span
                class="text-lg transform transition-transform duration-300"
                :class="{ 'rotate-180': showReqMap[course.id] }"
              >
                ▼
              </span>
            </button>

            <!-- Requirements List (uses course.requirements directly) -->
            <div
              class="overflow-hidden transition-all duration-300 ease-in-out border-gray-200"
              :style="{
                maxHeight: showReqMap[course.id] ? '220px' : '0px',
                marginTop: showReqMap[course.id] ? '0.75rem' : '0',
                paddingTop: showReqMap[course.id] ? '0.75rem' : '0',
                borderTopWidth: showReqMap[course.id] ? '1px' : '0'
              }"
            >
              <div v-if="showReqMap[course.id]">
                <h4 class="font-semibold text-gray-800 mb-2">Requirements:</h4>

                <ul
                  v-if="Array.isArray(course.requirements) && course.requirements.length"
                  class="space-y-1.5 text-sm text-gray-700"
                >
                  <li
                    v-for="(req, idx) in course.requirements"
                    :key="idx"
                    class="flex items-start gap-2"
                  >
                    <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    {{ req }}
                  </li>
                </ul>

                <p v-else class="text-sm text-gray-500">— No requirements found</p>
              </div>
            </div>

            <!-- Training Details -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Duration</p>
                <p class="font-semibold text-gray-800">{{ course.duration || "—" }}</p>
              </div>

              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Training Fee</p>
                <p class="font-semibold text-blue-700">
                  ₱{{ Number(course.course_fee || 0).toLocaleString() }}
                </p>
              </div>
            </div>

            <!-- Action Button: proceed to upload (no reservation) -->
            <button
              @click="selectCourseForUpload(course)"
              class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Proceed to Upload Requirements
            </button>
          </div>

          <div v-if="!filteredCourses.length" class="text-center text-gray-500 py-10 md:col-span-2">
            No trainings found.
          </div>
        </div>
      </section>

      <!-- ✅ REQUIREMENTS UPLOAD (Reservation removed, waiting flow) -->
      <section
        v-if="activeTab === 'upload'"
        class="bg-white p-6 rounded-xl shadow border border-gray-200"
      >
        <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
          Requirements Upload
        </h2>

        <!-- selected course banner -->
        <div class="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50">
          <div class="font-semibold text-blue-900">
            {{ selectedCourse ? `Selected Training: ${selectedCourse.course_name} (${selectedCourse.course_code})` : "No training selected yet." }}
          </div>
          <div class="text-sm text-blue-800 mt-1">
            After submitting your documents, please wait for a call/message from the admin for verification and schedule instructions.
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Requirements List -->
          <div class="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-blue-600">📋</span>
              Required Documents
            </h3>

            <div v-if="!selectedCourse" class="text-gray-600">
              Please pick a training first from “Available Trainings”.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(req, idx) in normalizedSelectedRequirements"
                :key="idx"
                class="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-semibold text-gray-800">{{ req }}</h4>
                    <p class="text-xs text-gray-500 mt-1">File types: PDF, JPG, PNG | Max size: 5MB</p>
                  </div>
                  <span class="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Required
                  </span>
                </div>
              </div>

              <p v-if="!normalizedSelectedRequirements.length" class="text-sm text-gray-500">
                — No requirements listed for this training.
              </p>
            </div>
          </div>

          <!-- Upload Section -->
          <div class="bg-white p-6 rounded-xl border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-blue-600">📎</span>
              Upload Documents
            </h3>

            <!-- Upload Area -->
            <label
              class="block border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <input
                type="file"
                class="hidden"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                @change="onFilesPicked"
              />
              <div class="text-blue-600 text-4xl mb-4">📎</div>
              <h4 class="font-semibold text-gray-800 mb-2">Drop files here</h4>
              <p class="text-sm text-gray-600 mb-2">or click to browse</p>
              <p class="text-xs text-gray-500">Supports: PDF, JPG, PNG (Max 5MB each)</p>
            </label>

            <!-- Selected Files -->
            <div class="mt-6">
              <h4 class="font-semibold text-gray-700 mb-3">
                Selected Files ({{ selectedFiles.length }})
              </h4>

              <div v-if="!selectedFiles.length" class="text-center text-gray-500 py-4 border border-dashed border-gray-300 rounded-lg">
                No files selected
              </div>

              <ul v-else class="space-y-2">
                <li
                  v-for="(f, idx) in selectedFiles"
                  :key="idx"
                  class="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div class="text-sm text-gray-800">
                    <span class="font-medium">{{ f.name }}</span>
                    <span class="text-gray-500 ml-2">({{ formatBytes(f.size) }})</span>
                  </div>
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                    @click="removeFile(idx)"
                  >
                    Remove
                  </button>
                </li>
              </ul>
            </div>

            <button
              class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              :disabled="!canSubmitUploads"
              :class="!canSubmitUploads ? 'opacity-60 cursor-not-allowed' : ''"
              @click="submitDocuments"
              type="button"
            >
              {{ submitting ? "Submitting..." : "Submit Documents" }}
            </button>

            <p class="text-xs text-gray-500 mt-3">
              Note: This button is wired as UI-only. Connect it to your upload API when ready.
            </p>
          </div>
        </div>

        <!-- Instructions -->
        <div class="mt-8 bg-white p-6 rounded-xl border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="text-blue-500">ℹ️</span>
            Upload Instructions
          </h3>
          <ul class="space-y-2 text-gray-700">
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
              Ensure all documents are clear and readable
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
              File names should indicate the document type (e.g., "valid_id_passport.jpg")
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
              Uploaded documents will be reviewed by the admin
            </li>
            <li class="flex items-start gap-2">
              <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
              Wait for a call/message after submission for next steps
            </li>
          </ul>
        </div>
      </section>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from "./StudentLayoutTesda.vue";

export default {
  name: "TesdaStudentEnroll",
  components: { StudentLayoutTesda },

  data() {
    return {
      // UI
      searchQuery: "",
      activeTab: "trainings",

      // user
      studentName: "Student",

      // courses
      courses: [],
      loadingCourses: false,

      // requirement toggle per course id
      showReqMap: {},

      // upload flow
      selectedCourse: null,
      selectedFiles: [],
      submitting: false,
    };
  },

  computed: {
    filteredCourses() {
      const q = (this.searchQuery || "").trim().toLowerCase();
      if (!q) return this.courses;

      return this.courses.filter((c) => {
        return (
          (c.course_name || "").toLowerCase().includes(q) ||
          (c.course_code || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.duration || "").toLowerCase().includes(q)
        );
      });
    },

    normalizedSelectedRequirements() {
      const reqs = this.selectedCourse?.requirements;
      if (Array.isArray(reqs)) return reqs.filter(Boolean).map(String);
      return [];
    },

    canSubmitUploads() {
      return !!this.selectedCourse && this.selectedFiles.length > 0 && !this.submitting;
    },
  },

  methods: {
async fetchCourses() {
  this.loadingCourses = true;
  try {
    const res = await fetch("http://localhost:3000/api/tesda/courses");
    const json = await res.json();

    this.courses = json?.data || [];
  } catch (err) {
    console.error("fetchCourses error:", err);
    this.courses = [];
  } finally {
    this.loadingCourses = false;
  }
},

    toggleRequirements(courseId) {
      this.showReqMap[courseId] = !this.showReqMap[courseId];
    },

    selectCourseForUpload(course) {
      this.selectedCourse = course;
      this.activeTab = "upload";
      // optional: auto-open requirements list on selected course
    },

    onFilesPicked(e) {
      const files = Array.from(e.target.files || []);
      // simple validation: max 5MB, allowed types
      const allowed = new Set([
        "application/pdf",
        "image/jpeg",
        "image/png",
      ]);

      const filtered = files.filter((f) => {
        if (!allowed.has(f.type)) return false;
        if (f.size > 5 * 1024 * 1024) return false;
        return true;
      });

      this.selectedFiles = filtered;
      // reset input so picking same file again works
      e.target.value = "";
    },

    removeFile(idx) {
      this.selectedFiles.splice(idx, 1);
    },

    formatBytes(bytes) {
      const b = Number(bytes || 0);
      if (b < 1024) return `${b} B`;
      const kb = b / 1024;
      if (kb < 1024) return `${kb.toFixed(1)} KB`;
      const mb = kb / 1024;
      return `${mb.toFixed(1)} MB`;
    },

    // UI-only placeholder (wire to your API later)
    async submitDocuments() {
      if (!this.canSubmitUploads) return;

      this.submitting = true;
      try {
        // TODO: connect to your upload API (FormData + POST)
        // For now, show a realistic message.
        alert("✅ Documents submitted! Please wait for admin call/message for next steps.");
        this.selectedFiles = [];
      } catch (err) {
        console.error(err);
        alert("❌ Upload failed. Please try again.");
      } finally {
        this.submitting = false;
      }
    },

    loadUserData() {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.studentName = user.name || user.username || "Student";
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    },

    getUserInitial() {
      return String(this.studentName || "S").charAt(0).toUpperCase();
    },
  },

  async mounted() {
    this.loadUserData();
    await this.fetchCourses();
  },
};
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.transition-shadow {
  transition: box-shadow 0.3s ease;
}
.transition-all {
  transition: all 0.3s ease-in-out;
}
.transition-transform {
  transition: transform 0.3s ease;
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
