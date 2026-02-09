<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search courses..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <!-- ✅ Course Tabs (Driving / TESDA) -->
      <div class="flex gap-2 mb-4">
        <button
          @click="activeTab = 'driving'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium border',
            activeTab === 'driving'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          🚗 Driving Courses
        </button>

        <button
          @click="activeTab = 'tesda'"
          :class="[
            'px-4 py-2 rounded-md text-sm font-medium border',
            activeTab === 'tesda'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          🧰 TESDA Courses
        </button>
      </div>

      <!-- ===================================================== -->
      <!-- ✅ DRIVING TAB -->
      <!-- ===================================================== -->
      <div v-if="activeTab === 'driving'">
        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-green-800">📚 Courses Management</h2>
          <button
            @click="openAddModal"
            class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            ➕ Add New Course
          </button>
        </div>

        <!-- ✅ Driving Instructor Assignment Panel -->
        <div class="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-md font-bold text-green-800">🚗 Driving Course Instructor Assignment</h3>
              <p class="text-xs text-gray-500 mt-1">
                Assign instructors to driving courses here.
              </p>
            </div>
            <button
              @click="refreshAssignments"
              class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          <div class="p-4 overflow-x-auto">
            <table class="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Course</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Current Instructor</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Assign New</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="c in courses" :key="c.id" class="border-t">
                  <td class="py-2 px-3">
                    <div class="font-medium">{{ c.course_name }}</div>
                    <div class="text-xs text-gray-500">{{ c.course_code }}</div>
                  </td>

                  <td class="py-2 px-3">
                    <span class="text-gray-700">{{ assignmentLabel(c.id) }}</span>
                  </td>

                  <td class="py-2 px-3">
                    <select
                      v-model="pendingAssign[c.id]"
                      class="w-72 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">-- Select Instructor --</option>
                      <option
                        v-for="ins in instructors"
                        :key="ins.instructor_id"
                        :value="ins.instructor_id"
                      >
                        {{ ins.fullname }} ({{ ins.instructor_code }})
                      </option>
                    </select>
                  </td>

                  <td class="py-2 px-3">
                    <button
                      class="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50"
                      :disabled="!pendingAssign[c.id]"
                      @click="saveAssignment(c.id)"
                    >
                      Save
                    </button>
                  </td>
                </tr>

                <tr v-if="courses.length === 0">
                  <td colspan="4" class="py-6 text-center text-gray-500">
                    No courses loaded
                  </td>
                </tr>
              </tbody>
            </table>

            <p class="text-xs text-gray-500 mt-3">
              Tip: Pag nag-Save ka, automatic yan mag-o-overwrite kung may dati nang assigned instructor sa course na yun.
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
          <p class="mt-3 text-gray-600">Loading courses...</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <div class="text-sm text-gray-600">
              Showing {{ filteredCourses.length }} of {{ courses.length }} courses
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Sort by:</span>
              <select v-model="sortBy" class="text-sm border rounded px-2 py-1">
                <option value="name">Name A-Z</option>
                <option value="nameDesc">Name Z-A</option>
                <option value="feeAsc">Fee Low-High</option>
                <option value="feeDesc">Fee High-Low</option>
                <option value="duration">Duration</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Code</th>
                <th class="py-3 px-4 text-left font-medium">Course Name</th>
                <th class="py-3 px-4 text-left font-medium">Duration</th>
                <th class="py-3 px-4 text-left font-medium">Fee</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="course in filteredCourses"
                :key="course.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4 font-medium">{{ course.course_code }}</td>

                <td class="py-3 px-4">
                  <div>
                    <p class="font-medium">{{ course.course_name }}</p>
                    <p class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      {{ course.description || "—" }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      <span class="font-semibold">Req:</span>
                      {{ formatRequirementsInline(course.requirements) }}
                    </p>
                  </div>
                </td>

                <td class="py-3 px-4">
                  {{ course.duration || "—" }}
                </td>

                <td class="py-3 px-4">
                  ₱{{ Number(course.course_fee || 0).toLocaleString() }}
                </td>

                <td class="py-3 px-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="course.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'"
                  >
                    {{ course.status }}
                  </span>
                </td>

                <td class="py-3 px-4">
                  <button
                    @click="viewCourse(course)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                  >
                    View
                  </button>
                  <button
                    @click="editCourse(course)"
                    class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(course)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredCourses.length === 0">
                <td colspan="6" class="py-8 text-center text-gray-500">
                  No courses found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add/Edit Modal -->
        <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-bold text-green-800">
                  {{ isEditing ? 'Edit Course' : 'Add New Course' }}
                </h3>
                <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <form @submit.prevent="saveCourse">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      v-model="formData.course_code"
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="e.g. DRV101"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      v-model="formData.duration"
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="" disabled>Select duration</option>
                      <option value="8 hours">8 hours</option>
                      <option value="15 hours">15 hours</option>
                      <option value="4 hours for 2 days">4 hours for 2 days</option>
                    </select>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      v-model="formData.course_name"
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Enter course name"
                    />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      v-model="formData.description"
                      rows="3"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Enter course description"
                    ></textarea>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Course Requirements</label>
                    <textarea
                      v-model="formData.requirementsText"
                      rows="4"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="One requirement per line (e.g. Valid ID, 2x2 Photo, Medical Certificate)"
                    ></textarea>
                    <p class="text-xs text-gray-500 mt-1">
                      Tip: isang requirement bawat line.
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Course Fee</label>
                    <input
                      type="number"
                      v-model.number="formData.course_fee"
                      min="0"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
                  >
                    {{ isEditing ? 'Update' : 'Save' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-md p-6">
            <div class="mb-4">
              <h3 class="text-lg font-bold text-red-600 mb-2">Confirm Deletion</h3>
              <p class="text-gray-600">
                Are you sure you want to delete
                <span class="font-semibold">{{ courseToDelete?.course_name }}</span>?
                This cannot be undone.
              </p>
            </div>
            <div class="flex justify-end gap-2">
              <button
                @click="cancelDelete"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                @click="deleteCourse"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===================================================== -->
      <!-- ✅ TESDA TAB -->
      <!-- ===================================================== -->
      <div v-else-if="activeTab === 'tesda'">
        <!-- Page Header -->
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-lg font-bold text-green-800">🧰 TESDA Courses Management</h2>
          <button
            @click="openTesdaAddModal"
            class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            ➕ Add New TESDA Course
          </button>
        </div>

        <!-- ✅ TESDA Trainer Assignment Panel -->
        <div class="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 class="text-md font-bold text-green-800">🧰 TESDA Course Trainer Assignment</h3>
              <p class="text-xs text-gray-500 mt-1">
                Assign trainers to TESDA courses here.
              </p>
            </div>
            <button
              @click="refreshTesdaAssignments"
              class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Refresh
            </button>
          </div>

          <div class="p-4 overflow-x-auto">
            <table class="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Course</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Current Trainer</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Assign New</th>
                  <th class="py-2 px-3 text-left font-medium text-gray-700">Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="c in tesdaCourses" :key="c.id" class="border-t">
                  <td class="py-2 px-3">
                    <div class="font-medium">{{ c.course_name }}</div>
                    <div class="text-xs text-gray-500">{{ c.course_code }}</div>
                  </td>

                  <td class="py-2 px-3">
                    <span class="text-gray-700">{{ tesdaAssignmentLabel(c.id) }}</span>
                  </td>

                  <td class="py-2 px-3">
                    <select
                      v-model="tesdaPendingAssign[c.id]"
                      class="w-72 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="">-- Select Trainer --</option>
                      <option
                        v-for="t in tesdaTrainers"
                        :key="t.trainer_id"
                        :value="t.trainer_id"
                      >
                        {{ t.fullname }} ({{ t.trainer_code }})
                      </option>
                    </select>
                  </td>

                  <td class="py-2 px-3">
                    <button
                      class="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-700 hover:bg-green-800 disabled:opacity-50"
                      :disabled="!tesdaPendingAssign[c.id]"
                      @click="saveTesdaAssignment(c.id)"
                    >
                      Save
                    </button>
                  </td>
                </tr>

                <tr v-if="tesdaCourses.length === 0">
                  <td colspan="4" class="py-6 text-center text-gray-500">
                    No TESDA courses loaded
                  </td>
                </tr>
              </tbody>
            </table>

            <p class="text-xs text-gray-500 mt-3">
              Tip: Pag nag-Save ka, overwrite agad yung previous assigned trainer.
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="tesdaLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
          <p class="mt-3 text-gray-600">Loading TESDA courses...</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-4 border-b border-gray-200 flex justify-between items-center">
            <div class="text-sm text-gray-600">
              Showing {{ filteredTesdaCourses.length }} of {{ tesdaCourses.length }} courses
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Sort by:</span>
              <select v-model="tesdaSortBy" class="text-sm border rounded px-2 py-1">
                <option value="name">Name A-Z</option>
                <option value="nameDesc">Name Z-A</option>
                <option value="duration">Duration</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Code</th>
                <th class="py-3 px-4 text-left font-medium">Course Name</th>
                <th class="py-3 px-4 text-left font-medium">Duration</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="course in filteredTesdaCourses"
                :key="course.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4 font-medium">{{ course.course_code }}</td>

                <td class="py-3 px-4">
                  <div>
                    <p class="font-medium">{{ course.course_name }}</p>
                    <p class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      {{ course.description || "—" }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      <span class="font-semibold">Req:</span>
                      {{ formatRequirementsInline(course.requirements) }}
                    </p>
                  </div>
                </td>

                <td class="py-3 px-4">
                  {{ course.duration || "—" }}
                </td>

                <td class="py-3 px-4">
                  <span
                    class="px-2 py-1 rounded-full text-xs font-medium"
                    :class="course.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'"
                  >
                    {{ course.status }}
                  </span>
                </td>

                <td class="py-3 px-4">
                  <button
                    @click="viewTesdaCourse(course)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                  >
                    View
                  </button>
                  <button
                    @click="editTesdaCourse(course)"
                    class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmTesdaDelete(course)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="filteredTesdaCourses.length === 0">
                <td colspan="5" class="py-8 text-center text-gray-500">
                  No TESDA courses found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ✅ TESDA Add/Edit Modal -->
        <div v-if="showTesdaModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-bold text-green-800">
                  {{ tesdaIsEditing ? 'Edit TESDA Course' : 'Add New TESDA Course' }}
                </h3>
                <button @click="closeTesdaModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <form @submit.prevent="saveTesdaCourse">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                    <input
                      type="text"
                      v-model="tesdaFormData.course_code"
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="e.g. TESDA101"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      v-model="tesdaFormData.duration"
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="e.g. 160 hours"
                    />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input
                      type="text"
                      v-model="tesdaFormData.course_name"
                      required
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Enter course name"
                    />
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      v-model="tesdaFormData.description"
                      rows="3"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Enter course description"
                    ></textarea>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Course Requirements</label>
                    <textarea
                      v-model="tesdaFormData.requirementsText"
                      rows="4"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="One requirement per line"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      v-model="tesdaFormData.status"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="active">active</option>
                      <option value="inactive">inactive</option>
                    </select>
                  </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    @click="closeTesdaModal"
                    class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
                  >
                    {{ tesdaIsEditing ? 'Update' : 'Save' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- ✅ TESDA Delete Modal -->
        <div v-if="showTesdaDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-lg w-full max-w-md p-6">
            <div class="mb-4">
              <h3 class="text-lg font-bold text-red-600 mb-2">Confirm Deletion</h3>
              <p class="text-gray-600">
                Are you sure you want to delete
                <span class="font-semibold">{{ tesdaCourseToDelete?.course_name }}</span>?
                This cannot be undone.
              </p>
            </div>
            <div class="flex justify-end gap-2">
              <button
                @click="cancelTesdaDelete"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                @click="deleteTesdaCourse"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </div>
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
  name: "AdminCourses",
  components: { AdminLayout },

  setup() {
    const activeTab = ref("driving"); // driving | tesda

    // ===============================
    // ✅ DRIVING STATE
    // ===============================
    const courses = ref([]);
    const loading = ref(true);

    const searchQuery = ref("");
    const selectedDuration = ref("");
    const sortBy = ref("name");

    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
    const courseToDelete = ref(null);

    const instructors = ref([]);
    const assignmentsMap = ref({});
    const pendingAssign = reactive({});

    const formData = reactive({
      id: null,
      course_code: "",
      course_name: "",
      description: "",
      duration: "",
      requirementsText: "",
      course_fee: 0,
      status: "active",
    });

    // ===============================
    // ✅ HELPERS
    // ===============================
    const parseRequirements = (reqValue) => {
      if (Array.isArray(reqValue)) return reqValue;
      if (typeof reqValue === "string") {
        const s = reqValue.trim();
        if (!s) return [];
        try {
          const parsed = JSON.parse(s);
          return Array.isArray(parsed) ? parsed : [String(parsed)];
        } catch {
          return [s];
        }
      }
      return [];
    };

    const requirementsToText = (requirements) => {
      const arr = parseRequirements(requirements);
      return arr.join("\n");
    };

    const textToRequirementsArray = (text) => {
      return String(text || "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
    };

    const formatRequirementsInline = (requirements) => {
      const arr = parseRequirements(requirements);
      if (!arr.length) return "—";
      return arr.slice(0, 2).join(", ") + (arr.length > 2 ? ` (+${arr.length - 2} more)` : "");
    };

    // ===============================
    // ✅ DRIVING LIST
    // ===============================
    const filteredCourses = computed(() => {
      let result = [...courses.value];

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter((c) => {
          const reqText = parseRequirements(c.requirements).join(" ").toLowerCase();
          return (
            (c.course_name || "").toLowerCase().includes(q) ||
            (c.course_code || "").toLowerCase().includes(q) ||
            (c.duration || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q) ||
            reqText.includes(q)
          );
        });
      }

      if (selectedDuration.value) {
        result = result.filter((c) => (c.duration || "") === selectedDuration.value);
      }

      result.sort((a, b) => {
        if (sortBy.value === "name") return (a.course_name || "").localeCompare(b.course_name || "");
        if (sortBy.value === "nameDesc") return (b.course_name || "").localeCompare(a.course_name || "");
        if (sortBy.value === "feeAsc") return Number(a.course_fee || 0) - Number(b.course_fee || 0);
        if (sortBy.value === "feeDesc") return Number(b.course_fee || 0) - Number(a.course_fee || 0);
        if (sortBy.value === "duration") return (a.duration || "").localeCompare(b.duration || "");
        if (sortBy.value === "status") return (a.status || "").localeCompare(b.status || "");
        return 0;
      });

      return result;
    });

    const clearFilters = () => {
      selectedDuration.value = "";
      searchQuery.value = "";
      sortBy.value = "name";
    };

    const fetchCourses = async () => {
      loading.value = true;
      try {
        const res = await api.get("/admin/courses");
        const maybe = res.data?.data;
        courses.value = Array.isArray(maybe) ? maybe : (maybe?.data ?? []);
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        console.error("Fetch courses failed:", { status, data, err });
        courses.value = [];
        alert(
          `Failed to load courses.\n` +
          `Status: ${status ?? "NO_RESPONSE"}\n` +
          `Message: ${data?.message ?? err.message}`
        );
      } finally {
        loading.value = false;
      }
    };

    // ===============================
    // ✅ DRIVING ASSIGNMENTS
    // ===============================
    const fetchDrivingInstructors = async () => {
      const res = await api.get("/admin/driving/instructors");
      instructors.value = res.data?.data ?? [];
    };

    const fetchDrivingAssignments = async () => {
      const res = await api.get("/admin/driving/course-instructors");
      const rows = res.data?.data ?? [];

      const map = {};
      for (const r of rows) {
        map[r.course_id] = {
          instructor_id: r.instructor_id,
          instructor_name: r.instructor_name || "—",
          instructor_code: r.instructor_code || "",
        };
      }
      assignmentsMap.value = map;
    };

    const refreshAssignments = async () => {
      try {
        await fetchDrivingInstructors();
        await fetchDrivingAssignments();
        Object.keys(pendingAssign).forEach((k) => delete pendingAssign[k]);
      } catch (err) {
        console.error("refreshAssignments error:", err);
        alert(err.response?.data?.message || "Failed to load driving assignment data");
      }
    };

    const assignmentLabel = (courseId) => {
      const a = assignmentsMap.value[courseId];
      if (!a || !a.instructor_id) return "—";
      return `${a.instructor_name}${a.instructor_code ? ` (${a.instructor_code})` : ""}`;
    };

    const saveAssignment = async (courseId) => {
      const instructorId = Number(pendingAssign[courseId]);
      if (!instructorId) return;

      try {
        await api.post("/admin/driving/course-instructors", {
          course_id: courseId,
          instructor_id: instructorId,
        });

        await fetchDrivingAssignments();
        alert("Assigned successfully ✅");
      } catch (err) {
        console.error("saveAssignment error:", err);
        alert(err.response?.data?.message || "Failed to assign");
      }
    };

    // ===============================
    // ✅ DRIVING CRUD
    // ===============================
    const createCourse = async () => {
      await api.post("/admin/courses", {
        course_code: formData.course_code,
        course_name: formData.course_name,
        description: formData.description,
        duration: formData.duration,
        requirements: JSON.stringify(textToRequirementsArray(formData.requirementsText)),
        course_fee: formData.course_fee,
        status: formData.status,
      });
    };

    const updateCourse = async () => {
      await api.put(`/admin/courses/${formData.id}`, {
        course_code: formData.course_code,
        course_name: formData.course_name,
        description: formData.description,
        duration: formData.duration,
        requirements: JSON.stringify(textToRequirementsArray(formData.requirementsText)),
        course_fee: formData.course_fee,
        status: formData.status,
      });
    };

    const removeCourse = async (id) => {
      await api.delete(`/admin/courses/${id}`);
    };

    const openAddModal = () => {
      isEditing.value = false;
      resetForm();
      showModal.value = true;
    };

    const editCourse = (course) => {
      isEditing.value = true;
      Object.assign(formData, {
        id: course.id,
        course_code: course.course_code ?? "",
        course_name: course.course_name ?? "",
        description: course.description ?? "",
        duration: course.duration ?? "",
        requirementsText: requirementsToText(course.requirements),
        course_fee: Number(course.course_fee ?? 0),
        status: course.status ?? "active",
      });
      showModal.value = true;
    };

    const viewCourse = (course) => {
      const reqs = parseRequirements(course.requirements);
      alert(
        `Course: ${course.course_name}\n` +
        `Code: ${course.course_code}\n` +
        `Duration: ${course.duration || "—"}\n` +
        `Fee: ${course.course_fee}\n` +
        `Status: ${course.status}\n\n` +
        `Requirements:\n- ${reqs.length ? reqs.join("\n- ") : "—"}`
      );
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    const resetForm = () => {
      formData.id = null;
      formData.course_code = "";
      formData.course_name = "";
      formData.description = "";
      formData.duration = "";
      formData.requirementsText = "";
      formData.course_fee = 0;
      formData.status = "active";
    };

    const saveCourse = async () => {
      try {
        if (isEditing.value) await updateCourse();
        else await createCourse();

        await fetchCourses();
        closeModal();
      } catch (err) {
        console.error("Save course failed:", err);
        alert(err.response?.data?.message || "Failed to save course");
      }
    };

    const confirmDelete = (course) => {
      courseToDelete.value = course;
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      courseToDelete.value = null;
      showDeleteModal.value = false;
    };

    const deleteCourse = async () => {
      try {
        await removeCourse(courseToDelete.value.id);
        await fetchCourses();
        cancelDelete();
      } catch (err) {
        console.error("Delete failed:", err);
        alert(err.response?.data?.message || "Failed to delete course");
      }
    };

    // ===============================
    // ✅ TESDA STATE (REAL)
    // ===============================
    const tesdaCourses = ref([]);
    const tesdaLoading = ref(true);
    const tesdaSortBy = ref("name");

    const tesdaTrainers = ref([]);
    const tesdaAssignmentsMap = ref({});
    const tesdaPendingAssign = reactive({});

    const showTesdaModal = ref(false);
    const showTesdaDeleteModal = ref(false);
    const tesdaIsEditing = ref(false);
    const tesdaCourseToDelete = ref(null);

    const tesdaFormData = reactive({
      id: null,
      course_code: "",
      course_name: "",
      description: "",
      duration: "",
      requirementsText: "",
      status: "active",
    });

    const fetchTesdaTrainers = async () => {
      const res = await api.get("/admin/tesda/trainers");
      tesdaTrainers.value = res.data?.data ?? [];
    };

    const fetchTesdaCourses = async () => {
      tesdaLoading.value = true;
      try {
        const res = await api.get("/admin/tesda/courses");
        const rows = res.data?.data ?? [];

        tesdaCourses.value = rows.map((r) => ({
          id: r.id,
          course_code: r.course_code,
          course_name: r.course_name,
          description: r.description,
          duration: r.duration,
          requirements: r.requirements,
          status: r.status,
        }));
      } catch (err) {
        console.error("fetchTesdaCourses error:", err);
        tesdaCourses.value = [];
        alert(err.response?.data?.message || "Failed to load TESDA courses");
      } finally {
        tesdaLoading.value = false;
      }
    };

    const fetchTesdaAssignments = async () => {
      const res = await api.get("/admin/tesda/course-trainers");
      const rows = res.data?.data ?? [];

      const map = {};
      for (const r of rows) {
        map[r.course_id] = {
          trainer_id: r.trainer_id,
          trainer_name: r.trainer_name || "—",
          trainer_code: r.trainer_code || "",
        };
      }
      tesdaAssignmentsMap.value = map;
    };

    const tesdaAssignmentLabel = (courseId) => {
      const a = tesdaAssignmentsMap.value[courseId];
      if (!a || !a.trainer_id) return "—";
      return `${a.trainer_name}${a.trainer_code ? ` (${a.trainer_code})` : ""}`;
    };

    const refreshTesdaAssignments = async () => {
      try {
        await fetchTesdaTrainers();
        await fetchTesdaAssignments();
        Object.keys(tesdaPendingAssign).forEach((k) => delete tesdaPendingAssign[k]);
      } catch (err) {
        console.error("refreshTesdaAssignments error:", err);
        alert(err.response?.data?.message || "Failed to load TESDA assignment data");
      }
    };

    const saveTesdaAssignment = async (courseId) => {
      const trainerId = Number(tesdaPendingAssign[courseId]);
      if (!trainerId) return;

      try {
        await api.post("/admin/tesda/course-trainers", {
          course_id: courseId,
          trainer_id: trainerId,
        });

        await fetchTesdaAssignments();
        alert("TESDA Trainer assigned ✅");
      } catch (err) {
        console.error("saveTesdaAssignment error:", err);
        alert(err.response?.data?.message || "Failed to assign trainer");
      }
    };

    // TESDA CRUD (REAL)
    const createTesdaCourse = async () => {
      await api.post("/admin/tesda/courses", {
        course_code: tesdaFormData.course_code,
        course_name: tesdaFormData.course_name,
        description: tesdaFormData.description,
        duration: tesdaFormData.duration,
        requirements: JSON.stringify(textToRequirementsArray(tesdaFormData.requirementsText)),
        status: tesdaFormData.status,
      });
    };

    const updateTesdaCourse = async () => {
      await api.put(`/admin/tesda/courses/${tesdaFormData.id}`, {
        course_code: tesdaFormData.course_code,
        course_name: tesdaFormData.course_name,
        description: tesdaFormData.description,
        duration: tesdaFormData.duration,
        requirements: JSON.stringify(textToRequirementsArray(tesdaFormData.requirementsText)),
        status: tesdaFormData.status,
      });
    };

    const removeTesdaCourse = async (id) => {
      await api.delete(`/admin/tesda/courses/${id}`);
    };

    const openTesdaAddModal = () => {
      tesdaIsEditing.value = false;
      resetTesdaForm();
      showTesdaModal.value = true;
    };

    const editTesdaCourse = (course) => {
      tesdaIsEditing.value = true;
      Object.assign(tesdaFormData, {
        id: course.id,
        course_code: course.course_code ?? "",
        course_name: course.course_name ?? "",
        description: course.description ?? "",
        duration: course.duration ?? "",
        requirementsText: requirementsToText(course.requirements),
        status: course.status ?? "active",
      });
      showTesdaModal.value = true;
    };

    const viewTesdaCourse = (course) => {
      const reqs = parseRequirements(course.requirements);
      alert(
        `TESDA Course: ${course.course_name}\n` +
        `Code: ${course.course_code}\n` +
        `Duration: ${course.duration || "—"}\n` +
        `Status: ${course.status}\n\n` +
        `Requirements:\n- ${reqs.length ? reqs.join("\n- ") : "—"}`
      );
    };

    const closeTesdaModal = () => {
      showTesdaModal.value = false;
      resetTesdaForm();
    };

    const resetTesdaForm = () => {
      tesdaFormData.id = null;
      tesdaFormData.course_code = "";
      tesdaFormData.course_name = "";
      tesdaFormData.description = "";
      tesdaFormData.duration = "";
      tesdaFormData.requirementsText = "";
      tesdaFormData.status = "active";
    };

    const saveTesdaCourse = async () => {
      try {
        if (tesdaIsEditing.value) await updateTesdaCourse();
        else await createTesdaCourse();

        await fetchTesdaCourses();
        closeTesdaModal();
        alert("TESDA course saved ✅");
      } catch (err) {
        console.error("saveTesdaCourse error:", err);
        alert(err.response?.data?.message || "Failed to save TESDA course");
      }
    };

    const confirmTesdaDelete = (course) => {
      tesdaCourseToDelete.value = course;
      showTesdaDeleteModal.value = true;
    };

    const cancelTesdaDelete = () => {
      tesdaCourseToDelete.value = null;
      showTesdaDeleteModal.value = false;
    };

    const deleteTesdaCourse = async () => {
      try {
        await removeTesdaCourse(tesdaCourseToDelete.value.id);
        await fetchTesdaCourses();
        cancelTesdaDelete();
        alert("TESDA course deleted ✅");
      } catch (err) {
        console.error("deleteTesdaCourse error:", err);
        alert(err.response?.data?.message || "Failed to delete TESDA course");
      }
    };

    const filteredTesdaCourses = computed(() => {
      let result = [...tesdaCourses.value];

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter((c) => {
          const reqText = parseRequirements(c.requirements).join(" ").toLowerCase();
          return (
            (c.course_name || "").toLowerCase().includes(q) ||
            (c.course_code || "").toLowerCase().includes(q) ||
            (c.duration || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q) ||
            reqText.includes(q)
          );
        });
      }

      result.sort((a, b) => {
        if (tesdaSortBy.value === "name") return (a.course_name || "").localeCompare(b.course_name || "");
        if (tesdaSortBy.value === "nameDesc") return (b.course_name || "").localeCompare(a.course_name || "");
        if (tesdaSortBy.value === "duration") return (a.duration || "").localeCompare(b.duration || "");
        if (tesdaSortBy.value === "status") return (a.status || "").localeCompare(b.status || "");
        return 0;
      });

      return result;
    });

    // ===============================
    // ✅ MOUNT
    // ===============================
    onMounted(async () => {
      await fetchCourses();
      await refreshAssignments();

      // ✅ load TESDA
      await fetchTesdaCourses();
      await refreshTesdaAssignments();
    });

    return {
      activeTab,

      // driving
      courses,
      loading,
      searchQuery,
      selectedDuration,
      sortBy,
      instructors,
      assignmentsMap,
      pendingAssign,
      assignmentLabel,
      saveAssignment,
      refreshAssignments,
      showModal,
      showDeleteModal,
      isEditing,
      courseToDelete,
      formData,
      filteredCourses,
      formatRequirementsInline,
      clearFilters,
      openAddModal,
      editCourse,
      viewCourse,
      closeModal,
      saveCourse,
      confirmDelete,
      cancelDelete,
      deleteCourse,

      // tesda
      tesdaCourses,
      tesdaLoading,
      tesdaSortBy,
      filteredTesdaCourses,
      tesdaTrainers,
      tesdaAssignmentsMap,
      tesdaPendingAssign,
      tesdaAssignmentLabel,
      refreshTesdaAssignments,
      saveTesdaAssignment,
      showTesdaModal,
      showTesdaDeleteModal,
      tesdaIsEditing,
      tesdaCourseToDelete,
      tesdaFormData,
      openTesdaAddModal,
      editTesdaCourse,
      viewTesdaCourse,
      closeTesdaModal,
      saveTesdaCourse,
      confirmTesdaDelete,
      cancelTesdaDelete,
      deleteTesdaCourse,
    };
  },
};
</script>
