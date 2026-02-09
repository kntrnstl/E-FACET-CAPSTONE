<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-green-800">📅 Schedule Management</h2>
        <button
          @click="openAddModal"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          ➕ Add New Schedule
        </button>
      </div>

      <!-- ✅ Driving / TESDA Switch -->
      <div class="flex gap-2 mb-6">
        <button
          @click="switchTrack('driving')"
          class="px-4 py-2 rounded-md text-sm font-medium border"
          :class="
            activeTrack === 'driving'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          "
        >
          🚗 Driving
        </button>

        <button
          @click="switchTrack('tesda')"
          class="px-4 py-2 rounded-md text-sm font-medium border"
          :class="
            activeTrack === 'tesda'
              ? 'bg-green-700 text-white border-green-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          "
        >
          🧰 TESDA
        </button>
      </div>

      <!-- ========================= -->
      <!-- Schedule Calendar -->
      <!-- ========================= -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-green-800">📅 Schedule Overview</h3>
          <div class="flex gap-3 text-sm">
            <span class="flex items-center gap-1">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              Available: {{ availableSlots }}
            </span>
            <span class="flex items-center gap-1">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              Full: {{ fullDates }}
            </span>
          </div>
        </div>

        <!-- ✅ TOP FILTERS (AFFECTS CALENDAR + LIST) -->
        <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Course</label>
            <select
              v-model.number="selectedCourseId"
              class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option :value="0">All Courses</option>
              <option v-for="c in topCourses" :key="c.id" :value="c.id">
                {{ c.course }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Month</label>
            <select
              v-model="selectedMonth"
              class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">All Months</option>
              <option v-for="month in months" :key="month" :value="month">
                {{ month }}
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
            <button
              @click="fetchSchedules"
              class="px-3 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        </div>

        <!-- Calendar Navigation -->
        <div class="flex justify-between items-center mb-4">
          <button
            @click="prevMonth"
            class="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium"
          >
            ◀ Prev
          </button>
          <h3 class="text-lg font-semibold text-green-800">{{ currentMonthName }} {{ currentYear }}</h3>
          <button
            @click="nextMonth"
            class="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm font-medium"
          >
            Next ▶
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-600 mb-2">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="date in calendarDates"
            :key="date.key"
            :class="[
              'p-3 border rounded text-center cursor-pointer transition-colors',
              date.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400',
              date.isToday ? 'border-green-500' : 'border-gray-200',
              getDateClass(date.date),
            ]"
            @click="openDayModal(date.date)"
          >
            <div class="font-medium">{{ date.day }}</div>
            <div v-if="date.slotCount !== null" class="text-xs mt-1">
              <span :class="date.slotCount === 0 ? 'text-red-600' : 'text-green-700'">
                {{ date.slotCount === 0 ? 'Full' : `${date.slotCount} Slots` }}
              </span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex gap-4 text-sm text-gray-600">
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 bg-green-100 rounded"></div> Available
          </span>
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 bg-red-100 rounded"></div> Full
          </span>
          <span class="flex items-center gap-2">
            <div class="w-3 h-3 border-2 border-green-500 rounded"></div> Today
          </span>
        </div>
      </div>

      <!-- ========================= -->
      <!-- Schedule List Filters + Pagination -->
      <!-- ========================= -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="p-4 border-b border-gray-200">
          <div class="flex flex-wrap gap-4 items-end justify-between">
            <div>
              <h3 class="text-lg font-bold text-green-800">🗂️ Schedule List</h3>
              <div class="text-sm text-gray-600">
                Showing {{ pagedSchedules.length }} of {{ filteredSchedules.length }} (Total Loaded: {{ schedules.length }})
              </div>
              <div class="text-xs text-gray-500 mt-1">
                *Top filters (Course/Month/Search) affects both Calendar + List.
              </div>
            </div>

            <div class="flex flex-wrap gap-3 items-end">
              <!-- ✅ NEW: Course filter inside LIST (does NOT affect calendar) -->
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Course (List)</label>
                <select
                  v-model.number="listCourseFilter"
                  class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option :value="0">All</option>
                  <option v-for="c in listCourses" :key="c.id" :value="c.id">
                    {{ c.course }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="listStatusFilter"
                  class="w-44 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="">All</option>
                  <option value="Open">Open</option>
                  <option value="Full">Full</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  {{ activeTrack === "tesda" ? "Trainer" : "Instructor" }}
                </label>
                <input
                  v-model="listPersonFilter"
                  type="text"
                  placeholder="Name..."
                  class="w-56 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Rows</label>
                <select
                  v-model.number="pageSize"
                  class="w-24 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option :value="5">5</option>
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                </select>
              </div>

              <button
                @click="resetListFilters"
                class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
            <thead class="bg-green-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Course</th>
                <th class="py-3 px-4 text-left font-medium">Date</th>
                <th class="py-3 px-4 text-left font-medium">Time</th>
                <th class="py-3 px-4 text-left font-medium">
                  {{ activeTrack === "tesda" ? "Trainer" : "Instructor" }}
                </th>
                <th class="py-3 px-4 text-left font-medium">Slots</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="schedule in pagedSchedules"
                :key="schedule.id"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="font-medium">{{ schedule.course }}</div>
                </td>
                <td class="py-3 px-4">
                  {{ formatDate(schedule.date) }}
                  <div class="text-xs text-gray-500">{{ schedule.day }}</div>
                </td>
                <td class="py-3 px-4">
                  <div class="font-medium">{{ schedule.startTime }} - {{ schedule.endTime }}</div>
                </td>
                <td class="py-3 px-4">{{ schedule.instructor }}</td>
                <td class="py-3 px-4">
                  <div>{{ schedule.availableSlots }} / {{ schedule.totalSlots }}</div>
                </td>
                <td class="py-3 px-4">
                  <span :class="getStatusClass(schedule)">
                    {{ schedule.computedStatus || (schedule.availableSlots === 0 ? "Full" : "Open") }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <button
                    @click="viewSchedule(schedule)"
                    class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                  >
                    View
                  </button>
                  <button
                    @click="editSchedule(schedule)"
                    class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(schedule)"
                    class="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>

              <tr v-if="pagedSchedules.length === 0">
                <td colspan="7" class="py-8 text-center text-gray-500">No schedules found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="p-4 border-t border-gray-200 flex flex-wrap gap-3 items-center justify-between">
          <div class="text-sm text-gray-600">
            Page {{ page }} of {{ totalPages }} ({{ filteredSchedules.length }} results)
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              :disabled="page <= 1"
              @click="page = 1"
            >
              ⏮ First
            </button>
            <button
              class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              :disabled="page <= 1"
              @click="page = page - 1"
            >
              ◀ Prev
            </button>

            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Go to</span>
              <input
                type="number"
                :min="1"
                :max="totalPages"
                v-model.number="pageJump"
                class="w-20 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <button
                class="px-3 py-2 bg-green-700 text-white rounded-md text-sm font-medium hover:bg-green-800 disabled:opacity-50"
                :disabled="!pageJump || pageJump < 1 || pageJump > totalPages"
                @click="page = pageJump"
              >
                Go
              </button>
            </div>

            <button
              class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              :disabled="page >= totalPages"
              @click="page = page + 1"
            >
              Next ▶
            </button>
            <button
              class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              :disabled="page >= totalPages"
              @click="page = totalPages"
            >
              Last ⏭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- Day Details Modal (Calendar Click) -->
    <!-- ========================= -->
    <div v-if="showDayModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="text-lg font-bold text-green-800">📌 Schedules for {{ formatDate(dayModalDate) }}</h3>
              <div class="text-sm text-gray-600">
                {{ dayModalSchedules.length }} schedule(s) found
                <span v-if="selectedCourseId > 0" class="ml-2 text-xs text-gray-500">
                  (Top Course Filter applied)
                </span>
              </div>
            </div>
            <button @click="closeDayModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <div v-if="dayModalSchedules.length === 0" class="py-10 text-center text-gray-500">
            Walang schedule sa date na ito (base sa current filters).
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
              <thead class="bg-green-800 text-white">
                <tr>
                  <th class="py-3 px-4 text-left font-medium">Course</th>
                  <th class="py-3 px-4 text-left font-medium">Time</th>
                  <th class="py-3 px-4 text-left font-medium">
                    {{ activeTrack === "tesda" ? "Trainer" : "Instructor" }}
                  </th>
                  <th class="py-3 px-4 text-left font-medium">Slots</th>
                  <th class="py-3 px-4 text-left font-medium">Status</th>
                  <th class="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="s in dayModalSchedules"
                  :key="s.id || (s.date + '-' + s.startTime)"
                  class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="font-medium">{{ s.course }}</div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="font-medium">{{ s.startTime }} - {{ s.endTime }}</div>
                  </td>
                  <td class="py-3 px-4">{{ s.instructor }}</td>
                  <td class="py-3 px-4">{{ s.availableSlots }} / {{ s.totalSlots }}</td>
                  <td class="py-3 px-4">
                    <span :class="getStatusClass(s)">{{ s.computedStatus || (s.availableSlots === 0 ? "Full" : "Open") }}</span>
                  </td>
                  <td class="py-3 px-4">
                    <button
                      @click="viewSchedule(s)"
                      class="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3"
                    >
                      View
                    </button>
                    <button
                      @click="editSchedule(s); closeDayModal()"
                      class="text-yellow-600 hover:text-yellow-800 text-sm font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button
                      @click="confirmDelete(s); closeDayModal()"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end mt-5">
            <button
              @click="closeDayModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================= -->
    <!-- Add/Edit Modal -->
    <!-- ========================= -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">
              {{ isEditing ? "Edit Schedule" : "Add New Schedule" }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>

          <!-- ✅ BULK MODE (Driving only, create only) -->
          <div v-if="!isEditing && activeTrack === 'driving'" class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-2">Create Mode</label>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                @click="createMode = 'single'"
                class="px-3 py-2 rounded-md border text-sm font-medium"
                :class="createMode === 'single'
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                Single
              </button>
              <button
                type="button"
                @click="createMode = 'weekly'"
                class="px-3 py-2 rounded-md border text-sm font-medium"
                :class="createMode === 'weekly'
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                Weekly
              </button>
              <button
                type="button"
                @click="createMode = 'monthly'"
                class="px-3 py-2 rounded-md border text-sm font-medium"
                :class="createMode === 'monthly'
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              >
                Monthly
              </button>
            </div>
            <div class="mt-2 text-xs text-gray-500">
              Weekly/Monthly generates many dates and will create schedules automatically.
            </div>

            <!-- ✅ NEW UI NOTE FOR TDC -->
            <div
              v-if="isTdcCourse && createMode !== 'single'"
              class="mt-3 p-3 rounded-md border bg-yellow-50 text-yellow-800 text-xs"
            >
              <b>TDC Note:</b> TDC auto-splits into multiple days. Kaya kapag Weekly/Monthly,
              <b>ini-skip namin ang consecutive start dates</b> para walang overlap (hal. 22,24,26...).
              Preview below shows the actual dates that will be created.
            </div>
          </div>

          <form @submit.prevent="saveSchedule">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  v-model.number="formData.course_id"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>Select a course</option>
                  <option v-for="c in coursesRaw" :key="c.id" :value="c.id">
                    {{ c.course_name }}
                  </option>
                </select>

                <p v-if="courseRuleHint" class="text-xs text-gray-500 mt-1">
                  Auto-duration: {{ courseRuleHint }}
                </p>

                <p v-if="activeTrack==='driving' && isTdcCourse" class="text-xs text-gray-600 mt-1">
                  TDC weekly cap: <b>48 slots per week</b>. (Backend enforces.)
                </p>
              </div>

              <!-- SINGLE date -->
              <div v-if="isEditing || activeTrack === 'tesda' || createMode === 'single'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  v-model="formData.schedule_date"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <!-- BULK range (Driving only) -->
              <template v-if="!isEditing && activeTrack === 'driving' && createMode !== 'single'">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    v-model="range.start"
                    required
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    v-model="range.end"
                    required
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </template>

              <!-- Instructor/Trainer -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ activeTrack === 'tesda' ? 'Trainer' : 'Instructor' }}
                </label>
                <select
                  v-model.number="personId"
                  required
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="" disabled>
                    {{ activeTrack === 'tesda' ? 'Select trainer' : 'Select instructor' }}
                  </option>
                  <option
                    v-for="p in instructors"
                    :key="activeTrack === 'tesda' ? p.trainer_id : p.instructor_id"
                    :value="activeTrack === 'tesda' ? p.trainer_id : p.instructor_id"
                  >
                    {{ p.firstname }} {{ p.lastname }}
                  </option>
                </select>
              </div>

              <!-- Weekly days -->
              <div v-if="!isEditing && activeTrack === 'driving' && createMode === 'weekly'" class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Days of Week</label>
                <div class="flex flex-wrap gap-2">
                  <label
                    v-for="d in weekdayOptions"
                    :key="d.key"
                    class="flex items-center gap-2 px-3 py-2 border rounded-md text-sm"
                  >
                    <input type="checkbox" v-model="weekly.days" :value="d.key" />
                    <span>{{ d.label }}</span>
                  </label>
                </div>

                <!-- ✅ NEW UI HINT -->
                <p v-if="isTdcCourse" class="text-xs text-yellow-700 mt-2">
                  Note: Kahit i-check mo lahat, TDC will still skip consecutive start dates (para iwas overlap).
                </p>
              </div>

              <!-- Monthly options -->
              <div v-if="!isEditing && activeTrack === 'driving' && createMode === 'monthly'" class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Monthly Pattern</label>

                <div class="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    class="px-3 py-2 rounded-md border text-sm font-medium"
                    @click="monthly.mode = 'dayOfMonth'"
                    :class="monthly.mode === 'dayOfMonth'
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  >
                    Day of Month
                  </button>
                  <button
                    type="button"
                    class="px-3 py-2 rounded-md border text-sm font-medium"
                    @click="monthly.mode = 'weekdayOfMonth'"
                    :class="monthly.mode === 'weekdayOfMonth'
                      ? 'bg-green-700 text-white border-green-700'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  >
                    Weekday Pattern
                  </button>
                </div>

                <div v-if="monthly.mode === 'dayOfMonth'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Day (1-31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      v-model.number="monthly.day"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div class="text-xs text-gray-500 flex items-end">
                    If a month has no such day (e.g. day 31), it will skip that month.
                  </div>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Week</label>
                    <select
                      v-model="monthly.week"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="1">1st</option>
                      <option value="2">2nd</option>
                      <option value="3">3rd</option>
                      <option value="4">4th</option>
                      <option value="last">Last</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Weekday</label>
                    <select
                      v-model="monthly.weekday"
                      class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option v-for="d in weekdayOptions" :key="d.key" :value="d.key">
                        {{ d.label }}
                      </option>
                    </select>
                  </div>
                  <div class="text-xs text-gray-500 flex items-end">Example: 2nd Saturday of every month.</div>
                </div>
              </div>


              <!-- ✅ PDC A&B Only: AM/PM Option -->
<div v-if="showPdcABTimeOptions" class="md:col-span-2">
  <label class="block text-sm font-medium text-gray-700 mb-2">PDC A&B Time Slot</label>
  <div class="flex gap-2">
    <button
      type="button"
      @click="pdcSlot = 'AM'"
      class="px-3 py-2 rounded-md border text-sm font-medium"
      :class="pdcSlot === 'AM'
        ? 'bg-green-700 text-white border-green-700'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
    >
      08:00 - 12:00
    </button>

    <button
      type="button"
      @click="pdcSlot = 'PM'"
      class="px-3 py-2 rounded-md border text-sm font-medium"
      :class="pdcSlot === 'PM'
        ? 'bg-green-700 text-white border-green-700'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
    >
      13:00 - 17:00
    </button>
  </div>
  <p class="text-xs text-gray-500 mt-2">
    Applies to both Day 1 and Day 2.
  </p>
</div>




              <!-- Time -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
<input
  type="time"
  v-model="formData.start_time"
  required
  :readonly="showPdcABTimeOptions"
  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
/>

                <p class="text-xs text-gray-500 mt-1">FACET hours: 08:00 - 17:00</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
<input
  type="time"
  v-model="formData.end_time"
  required
  :readonly="Boolean(activeCourseRule) && !isEditing && activeTrack === 'driving'"
  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
/>

                <p v-if="activeCourseRule && !isEditing && activeTrack === 'driving'" class="text-xs text-gray-500 mt-1">
                  End time is auto-computed for this course (when creating).
                </p>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Total Slots</label>
                <input
                  type="number"
                  v-model.number="formData.total_slots"
                  required
                  min="1"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Enter total slots"
                />
              </div>

              <!-- Preview (Driving bulk) -->
              <div v-if="!isEditing && activeTrack === 'driving' && createMode !== 'single'" class="md:col-span-2">
                <div class="p-3 rounded-md border bg-gray-50">
                  <div class="flex items-center justify-between gap-3">
                    <div class="text-sm text-gray-700">
                      <b>Preview:</b> will create <b>{{ previewCount }}</b> schedule(s)
                    </div>
                    <button
                      type="button"
                      class="px-3 py-2 rounded-md border text-sm font-medium bg-white hover:bg-gray-50"
                      @click="recomputePreview"
                    >
                      Recompute
                    </button>
                  </div>
                  <div class="mt-2 text-xs text-gray-600 max-h-28 overflow-auto">
                    <div v-if="previewDates.length === 0">No dates selected yet.</div>
                    <div v-else class="flex flex-wrap gap-2">
                      <span
                        v-for="d in previewDates.slice(0, 30)"
                        :key="d"
                        class="px-2 py-1 rounded bg-white border"
                      >
                        {{ d }}
                      </span>
                      <span v-if="previewDates.length > 30" class="px-2 py-1 text-gray-500">
                        +{{ previewDates.length - 30 }} more...
                      </span>
                    </div>
                  </div>

                  <div v-if="isTdcCourse" class="mt-2 text-[11px] text-gray-600">
                    TDC preview is already adjusted to avoid overlaps.
                  </div>
                </div>
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
                :disabled="saving"
                class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium disabled:opacity-60"
              >
                {{ saving ? "Saving..." : isEditing ? "Update" : "Save" }}
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
            Are you sure you want to delete schedule for
            <span class="font-semibold">{{ scheduleToDelete?.course }}</span>
            on
            <span class="font-semibold">{{ scheduleToDelete ? formatDate(scheduleToDelete.date) : "" }}</span
            >?
            This action cannot be undone.
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
            @click="deleteSchedule"
            :disabled="deleting"
            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-60"
          >
            {{ deleting ? "Deleting..." : "Delete" }}
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, reactive, watch } from "vue";
import AdminLayout from "./AdminLayout.vue";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// ✅ LOCAL date string (no UTC shift)
const toLocalYMD = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return String(dateLike || "");
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* ===============================
   FACET OPERATING HOURS + RULES
   =============================== */
const OPEN_TIME = "08:00";
const CLOSE_TIME = "17:00";
const MAX_HOURS_PER_DAY = 9;

const pad2 = (n) => String(n).padStart(2, "0");

const timeToMins = (t) => {
  const [h, m] = String(t || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const minsToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}`;
};

const addHoursToTime = (startTime, hours) => {
  const start = timeToMins(startTime);
  return minsToTime(start + Math.round(hours * 60));
};

const addDaysYMD = (ymd, addDays) => {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + addDays);
  return toLocalYMD(d);
};

const withinFacetHours = (start, end) => {
  return (
    timeToMins(start) >= timeToMins(OPEN_TIME) &&
    timeToMins(end) <= timeToMins(CLOSE_TIME) &&
    timeToMins(end) > timeToMins(start)
  );
};

// ✅ course rules (Driving auto-duration)
const COURSE_HOURS_RULES = [
  { match: /PDC-?AB|\(AB\)/i, days: 2, hoursPerDay: 4 }, // 8-12 or 13-17
  { match: /TDC/i, days: 2, hoursPerDay: 7.5 },         // example only kung gusto mo fixed
  { match: /PDC-A/i, days: 1 },
  { match: /PDC-B/i, days: 2 }, // kasi sabi mo "4 hours for 2 days"
];



const getCourseRule = (courseName) => {
  const name = String(courseName || "");
  return COURSE_HOURS_RULES.find((r) => r.match.test(name)) || null;
};

const buildSessionsByRule = ({ courseName, startDate, startTime, endTime }) => {
  const rule = getCourseRule(courseName);
  if (!rule) return null;

  const st = startTime || OPEN_TIME;
  const et = endTime || "12:00";

  // 1 day
  if (rule.days === 1) {
    return [{ date: startDate, start_time: st, end_time: et }];
  }

  // 2 days
  if (rule.days === 2) {
    return [
      { date: startDate, start_time: st, end_time: et },
      { date: addDaysYMD(startDate, 1), start_time: st, end_time: et },
    ];
  }

  return null;
};


/* ===============================
   BULK DATE GENERATORS (Driving)
   =============================== */
const ymdToDate = (ymd) => new Date(`${ymd}T00:00:00`);
const dateToYmd = (d) => toLocalYMD(d);

const clampRange = (startYmd, endYmd) => {
  const a = ymdToDate(startYmd);
  const b = ymdToDate(endYmd);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  if (a.getTime() > b.getTime()) return { start: endYmd, end: startYmd };
  return { start: startYmd, end: endYmd };
};

const iterateDays = (startYmd, endYmd, cb) => {
  const s = ymdToDate(startYmd);
  const e = ymdToDate(endYmd);
  for (let d = new Date(s); d.getTime() <= e.getTime(); d.setDate(d.getDate() + 1)) {
    cb(new Date(d));
  }
};

const nthWeekdayOfMonth = (year, monthIdx, weekday, nth) => {
  const first = new Date(year, monthIdx, 1);
  const last = new Date(year, monthIdx + 1, 0);

  if (nth === "last") {
    for (let d = new Date(last); d.getMonth() === monthIdx; d.setDate(d.getDate() - 1)) {
      if (d.getDay() === weekday) return d;
    }
    return null;
  }

  const targetNth = Number(nth);
  if (![1, 2, 3, 4].includes(targetNth)) return null;

  let count = 0;
  for (let d = new Date(first); d.getMonth() === monthIdx; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === weekday) {
      count++;
      if (count === targetNth) return d;
    }
  }
  return null;
};

// ✅ NEW: for TDC (avoid overlap): remove consecutive start dates
const skipConsecutiveStartDates = (dates) => {
  const sorted = [...dates].filter(Boolean).sort(); // YYYY-MM-DD sort ok
  const out = [];
  let lastKept = null;

  for (const d of sorted) {
    if (!lastKept) {
      out.push(d);
      lastKept = d;
      continue;
    }
    const nextDay = addDaysYMD(lastKept, 1);
    if (d === nextDay) continue; // skip consecutive
    out.push(d);
    lastKept = d;
  }

  return out;
};

export default {
  name: "AdminSchedule",
  components: { AdminLayout },
  setup() {
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];

    const activeTrack = ref("driving"); // driving | tesda

    const schedules = ref([]);
    const coursesRaw = ref([]);
    const instructors = ref([]); // reused: instructors OR trainers

    const searchQuery = ref("");
    const selectedCourseId = ref(0);
    const selectedMonth = ref(months[new Date().getMonth()]);
    const currentYear = ref(new Date().getFullYear());
    const currentMonth = ref(new Date().getMonth());

    const showModal = ref(false);
    const showDeleteModal = ref(false);
    const isEditing = ref(false);
    const scheduleToDelete = ref(null);

    const saving = ref(false);
    const deleting = ref(false);

    // ✅ Day modal
    const showDayModal = ref(false);
    const dayModalDate = ref("");
    const dayModalSchedules = ref([]);

    // ✅ robust ID getter (FIX DELETE)
    const getScheduleId = (s) => {
      const raw = s?.id;
      const id = Number(String(raw ?? "").trim());
      return Number.isInteger(id) && id > 0 ? id : null;
    };

    // ✅ person select for tesda/driving
    const formData = reactive({
      id: null,
      course_id: "",
      instructor_id: "",
      trainer_id: "",
      schedule_date: toLocalYMD(new Date()),
      start_time: OPEN_TIME,
      end_time: "12:00",
      total_slots: 10,
      status: "open",
    });

    const personId = computed({
      get() {
        return activeTrack.value === "tesda" ? formData.trainer_id : formData.instructor_id;
      },
      set(val) {
        if (activeTrack.value === "tesda") formData.trainer_id = val;
        else formData.instructor_id = val;
      },
    });

    // ✅ BULK MODE (Driving only)
    const createMode = ref("single"); // single | weekly | monthly
    const range = reactive({
      start: toLocalYMD(new Date()),
      end: toLocalYMD(new Date()),
    });

    const weekdayOptions = [
      { key: 0, label: "Sun" },
      { key: 1, label: "Mon" },
      { key: 2, label: "Tue" },
      { key: 3, label: "Wed" },
      { key: 4, label: "Thu" },
      { key: 5, label: "Fri" },
      { key: 6, label: "Sat" },
    ];

    const weekly = reactive({
      days: [1, 3, 5],
    });

    const monthly = reactive({
      mode: "dayOfMonth",
      day: 1,
      week: "1",
      weekday: 6,
    });

    const previewDates = ref([]);

    // ✅ PDC A&B time slot (AM = 08-12, PM = 13-17)
    const pdcSlot = ref("AM"); // "AM" | "PM"


    // ✅ LIST FILTERS + PAGINATION
    const listCourseFilter = ref(0);
    const listStatusFilter = ref("");
    const listPersonFilter = ref("");
    const page = ref(1);
    const pageJump = ref(1);
    const pageSize = ref(10);

    // ✅ endpoints per track
    const scheduleUrl = () => (activeTrack.value === "tesda" ? "/admin/tesda/schedules" : "/admin/schedules");
    const coursesUrl = () => (activeTrack.value === "tesda" ? "/admin/tesda/courses" : "/admin/courses");
    const peopleUrl = () => (activeTrack.value === "tesda" ? "/admin/tesda/trainers" : "/admin/instructors");

    // -------------------------
    // ✅ TOP FILTERS: affects calendar + list
    // -------------------------
    const baseFilteredSchedules = computed(() => {
      let result = [...schedules.value];

      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase().trim();
        result = result.filter(
          (s) =>
            String(s.course || "").toLowerCase().includes(q) ||
            String(s.instructor || "").toLowerCase().includes(q) ||
            String(s.day || "").toLowerCase().includes(q) ||
            String(s.date || "").toLowerCase().includes(q)
        );
      }

      if (Number(selectedCourseId.value) > 0) {
        result = result.filter((s) => Number(s.course_id) === Number(selectedCourseId.value));
      }

      if (selectedMonth.value) {
        result = result.filter((s) => {
          const d = new Date(String(s.date) + "T00:00:00");
          return months[d.getMonth()] === selectedMonth.value;
        });
      }

      return result;
    });

    const topCourses = computed(() => {
      const map = new Map();
      for (const s of schedules.value) {
        const cid = Number(s.course_id);
        if (!map.has(cid)) map.set(cid, { id: cid, course: s.course });
      }
      return Array.from(map.values()).sort((a, b) => a.course.localeCompare(b.course));
    });

    const listCourses = computed(() => {
      const map = new Map();
      for (const s of baseFilteredSchedules.value) {
        const cid = Number(s.course_id);
        if (!map.has(cid)) map.set(cid, { id: cid, course: s.course });
      }
      return Array.from(map.values()).sort((a, b) => a.course.localeCompare(b.course));
    });

    const filteredSchedules = computed(() => {
      let result = [...baseFilteredSchedules.value];

      if (Number(listCourseFilter.value) > 0) {
        result = result.filter((s) => Number(s.course_id) === Number(listCourseFilter.value));
      }

      if (listStatusFilter.value) {
        result = result.filter(
          (s) => String(s.computedStatus || "").toLowerCase() === String(listStatusFilter.value).toLowerCase()
        );
      }

      if (listPersonFilter.value) {
        const q = listPersonFilter.value.toLowerCase().trim();
        result = result.filter((s) => String(s.instructor || "").toLowerCase().includes(q));
      }

      result.sort((a, b) => {
        const ad = String(a.date || "");
        const bd = String(b.date || "");
        if (ad !== bd) return bd.localeCompare(ad);
        return String(b.startTime || "").localeCompare(String(a.startTime || ""));
      });

      return result;
    });

    const totalPages = computed(() =>
      Math.max(1, Math.ceil(filteredSchedules.value.length / Number(pageSize.value || 10)))
    );

    watch([filteredSchedules, pageSize], () => {
      page.value = 1;
      pageJump.value = 1;
    });

    watch(totalPages, () => {
      if (page.value > totalPages.value) page.value = totalPages.value;
      if (pageJump.value > totalPages.value) pageJump.value = totalPages.value;
    });

    const pagedSchedules = computed(() => {
      const size = Number(pageSize.value || 10);
      const p = Number(page.value || 1);
      const start = (p - 1) * size;
      return filteredSchedules.value.slice(start, start + size);
    });

    const resetListFilters = () => {
      listCourseFilter.value = 0;
      listStatusFilter.value = "";
      listPersonFilter.value = "";
      page.value = 1;
      pageJump.value = 1;
      pageSize.value = 10;
    };

    const availableSlots = computed(() => baseFilteredSchedules.value.filter((s) => Number(s.availableSlots) > 0).length);
    const fullDates = computed(() => baseFilteredSchedules.value.filter((s) => Number(s.availableSlots) === 0).length);

    const calendarDates = computed(() => {
      const year = currentYear.value;
      const month = currentMonth.value;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const firstDayIndex = firstDay.getDay();

      const dates = [];
      const prevMonthLastDay = new Date(year, month, 0).getDate();

      for (let i = firstDayIndex - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthLastDay - i);
        dates.push({ key: `prev-${i}`, day: prevMonthLastDay - i, date: d, isCurrentMonth: false, isToday: false, slotCount: null });
      }

      const today = new Date();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dStr = toLocalYMD(d);

        const daySchedules = baseFilteredSchedules.value.filter((s) => s.date === dStr);

        const uniq = new Map();
        for (const r of daySchedules) {
          if (r?.id) uniq.set(r.id, r);
        }

        const slotCount = Array.from(uniq.values()).reduce(
          (sum, s) => sum + Number(s.availableSlots || 0),
          0
        );

        dates.push({
          key: `current-${i}`,
          day: i,
          date: d,
          isCurrentMonth: true,
          isToday: d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
          slotCount: daySchedules.length > 0 ? slotCount : null,
        });
      }

      const totalCells = 42;
      const nextMonthDays = totalCells - dates.length;
      for (let i = 1; i <= nextMonthDays; i++) {
        const d = new Date(year, month + 1, i);
        dates.push({ key: `next-${i}`, day: i, date: d, isCurrentMonth: false, isToday: false, slotCount: null });
      }

      return dates;
    });

    const currentMonthName = computed(() => months[currentMonth.value]);

    const formatDate = (ymd) => {
      const d = new Date(String(ymd) + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getDateClass = (dateObj) => {
      const dateStr = toLocalYMD(dateObj);
      const daySchedules = baseFilteredSchedules.value.filter((s) => s.date === dateStr);
      if (daySchedules.length === 0) return "";

      const uniq = new Map();
      for (const r of daySchedules) {
        if (r?.id) uniq.set(r.id, r);
      }

      const totalAvailable = Array.from(uniq.values()).reduce(
        (sum, s) => sum + Number(s.availableSlots || 0),
        0
      );

      return totalAvailable === 0 ? "bg-red-50" : "bg-green-50";
    };

    const getStatusClass = (schedule) => {
      const status = schedule.computedStatus || (Number(schedule.availableSlots) === 0 ? "Full" : "Open");
      if (status === "Full") return "text-red-600 font-semibold";
      if (status === "Closed") return "text-gray-600 font-semibold";
      return "text-green-600 font-semibold";
    };

    const clearFilters = () => {
      searchQuery.value = "";
      selectedCourseId.value = 0;
      selectedMonth.value = "";
      currentMonth.value = new Date().getMonth();
      currentYear.value = new Date().getFullYear();
      resetListFilters();
    };

    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11;
        currentYear.value--;
      } else currentMonth.value--;
    };

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0;
        currentYear.value++;
      } else currentMonth.value++;
    };

    // ✅ Calendar click -> modal details
    const openDayModal = (dateObj) => {
      const dateStr = toLocalYMD(dateObj);
      dayModalDate.value = dateStr;

      const raw = baseFilteredSchedules.value.filter((s) => s.date === dateStr);

      const uniq = new Map();
      for (const r of raw) {
        if (r?.id) uniq.set(r.id, r);
      }

      const rows = Array.from(uniq.values())
        .sort((a, b) => String(a.startTime || "").localeCompare(String(b.startTime || "")));

      dayModalSchedules.value = rows;
      showDayModal.value = true;
    };

    const closeDayModal = () => {
      showDayModal.value = false;
      dayModalDate.value = "";
      dayModalSchedules.value = [];
    };

    // ---------------- API CALLS ----------------
    const fetchCourses = async () => {
      const res = await api.get(coursesUrl());
      coursesRaw.value = Array.isArray(res.data?.data) ? res.data.data : [];
    };

    const fetchInstructors = async () => {
      const res = await api.get(peopleUrl());
      instructors.value = Array.isArray(res.data?.data) ? res.data.data : [];
    };

    const fetchSchedules = async () => {
      try {
        const res = await api.get(scheduleUrl());
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];

        schedules.value = rows
          .map((s) => {
            const idNum = Number(s.id);
            const fixedId = Number.isFinite(idNum) ? idNum : Number(String(s.id).trim());

            return {
              ...s,
              id: Number.isFinite(fixedId) && fixedId > 0 ? fixedId : null,
              course_id: Number(s.course_id),
              instructor_id: Number(s.instructor_id || 0),
              date: String(s.date || "").includes("T") ? String(s.date).split("T")[0] : String(s.date || ""),
            };
          })
          .filter((s) => s.id);
      } catch (err) {
        console.error("fetchSchedules error:", err?.response?.data || err);
        alert(err?.response?.data?.message || err.message || "Failed to fetch schedules");
      }
    };

    // ==============================
    // AUTO RULES: Driving only
    // ==============================
    const activeCourse = computed(
      () => coursesRaw.value.find((c) => Number(c.id) === Number(formData.course_id)) || null
    );

    const isTdcCourse = computed(() => {
      if (activeTrack.value !== "driving") return false;
      return /TDC/i.test(String(activeCourse.value?.course_name || ""));
    });

    const activeCourseRule = computed(() => {
      if (activeTrack.value !== "driving") return null;
      return getCourseRule(activeCourse.value?.course_name || "");
    });

    // ✅ show AM/PM option only when course is PDC A & B (2 days, 4h/day)
const showPdcABTimeOptions = computed(() => {
  return (
    activeTrack.value === "driving" &&
    !isEditing.value &&
    String(activeCourse.value?.course_code || "").toUpperCase() === "PDC-AB"
  );
});




const courseRuleHint = computed(() => {
  const rule = activeCourseRule.value;
  if (!rule) return "";
  if (rule.days === 1) return `1 day schedule`;
  if (rule.days === 2) return `2 days schedule`;
  return "";
});


    watch(
      () => formData.course_id,
      (cid) => {
        if (activeTrack.value !== "driving") return;

        const c = coursesRaw.value.find((x) => Number(x.id) === Number(cid));
        if (!c) return;

        const rule = getCourseRule(c.course_name);
        if (!rule) return;

        formData.start_time = OPEN_TIME;

        // ✅ If PDC A&B, set start/end based on selected slot (default AM)
// If PDC A&B, force AM/PM times
const isPdcAB = String(c.course_code || "").toUpperCase() === "PDC-AB";

if (isPdcAB) {
  const start = pdcSlot.value === "PM" ? "13:00" : "08:00";
  const end = pdcSlot.value === "PM" ? "17:00" : "12:00";
  formData.start_time = start;
  formData.end_time = end;
  recomputePreview();
  return;
}


// Default: wag na auto compute, keep user input
recomputePreview();

      }
    );

    watch(
      () => [
        activeTrack.value,
        createMode.value,
        range.start,
        range.end,
        weekly.days.slice(),
        monthly.mode,
        monthly.day,
        monthly.week,
        monthly.weekday,
        formData.schedule_date,
      ],
      () => {
        if (activeTrack.value === "driving") recomputePreview();
      },
      { deep: true }
    );

      watch(
  () => pdcSlot.value,
  () => {
    if (!showPdcABTimeOptions.value) return;

    const start = pdcSlot.value === "PM" ? "13:00" : "08:00";
    const end = pdcSlot.value === "PM" ? "17:00" : "12:00";

    formData.start_time = start;
    formData.end_time = end;
  }
);



    const normalizeUniqueSorted = (arr) => {
      const set = new Set(arr.filter(Boolean));
      return Array.from(set).sort();
    };

    // ✅ FIXED + CLEAN: weekly + monthly both apply TDC skip
    const computeDatesByMode = () => {
      if (activeTrack.value !== "driving") return [String(formData.schedule_date)];
      if (isEditing.value) return [String(formData.schedule_date)];
      if (createMode.value === "single") return [String(formData.schedule_date)];

      const fixed = clampRange(range.start, range.end);
      if (!fixed) return [];
      const { start, end } = fixed;

      let result = [];

      if (createMode.value === "weekly") {
        const allowed = new Set((weekly.days || []).map(Number));
        if (allowed.size === 0) return [];
        const out = [];
        iterateDays(start, end, (d) => {
          if (allowed.has(d.getDay())) out.push(dateToYmd(d));
        });
        result = normalizeUniqueSorted(out);
      } else if (createMode.value === "monthly") {
        const out = [];
        const s = ymdToDate(start);
        const e = ymdToDate(end);

        let y = s.getFullYear();
        let m = s.getMonth();

        const endY = e.getFullYear();
        const endM = e.getMonth();

        while (y < endY || (y === endY && m <= endM)) {
          let d = null;

          if (monthly.mode === "dayOfMonth") {
            const dayNum = Number(monthly.day);
            if (Number.isFinite(dayNum) && dayNum >= 1 && dayNum <= 31) {
              const cand = new Date(y, m, dayNum);
              if (cand.getMonth() === m) d = cand;
            }
          } else {
            const wd = Number(monthly.weekday);
            d = nthWeekdayOfMonth(y, m, wd, monthly.week);
          }

          if (d) {
            const ymd = dateToYmd(d);
            if (ymd >= start && ymd <= end) out.push(ymd);
          }

          m++;
          if (m > 11) {
            m = 0;
            y++;
          }
        }

        result = normalizeUniqueSorted(out);
      } else {
        result = [String(formData.schedule_date)];
      }

      // ✅ APPLY TDC overlap fix in weekly/monthly
      if (isTdcCourse.value && createMode.value !== "single") {
        result = skipConsecutiveStartDates(result);
      }

      return result;
    };

    const recomputePreview = () => {
      previewDates.value = computeDatesByMode();
    };

    const previewCount = computed(() => previewDates.value.length);

    // ==============================
    // MODAL ACTIONS
    // ==============================
    const resetForm = () => {
      formData.id = null;
      formData.course_id = "";
      formData.instructor_id = "";
      formData.trainer_id = "";
      formData.schedule_date = toLocalYMD(new Date());
      formData.start_time = OPEN_TIME;
      formData.end_time = "12:00";
      formData.total_slots = 10;
      formData.status = "open";
      pdcSlot.value = "AM";


      createMode.value = "single";
      range.start = toLocalYMD(new Date());
      range.end = toLocalYMD(new Date());
      weekly.days = [1, 3, 5];

      monthly.mode = "dayOfMonth";
      monthly.day = 1;
      monthly.week = "1";
      monthly.weekday = 6;

      previewDates.value = [];
    };

    const openAddModal = () => {
      isEditing.value = false;
      resetForm();
      showModal.value = true;
      recomputePreview();
    };

    const editSchedule = (schedule) => {
      const id = getScheduleId(schedule);
      if (!id) {
        console.log("Bad schedule object:", schedule);
        alert("Invalid schedule id. Please refresh.");
        return;
      }

      isEditing.value = true;

      formData.id = id;
      formData.course_id = Number(schedule.course_id);

      if (activeTrack.value === "tesda") {
        formData.trainer_id = Number(schedule.instructor_id || 0);
        formData.instructor_id = "";
      } else {
        formData.instructor_id = Number(schedule.instructor_id || 0);
        formData.trainer_id = "";
      }

      formData.schedule_date = String(schedule.date);
      formData.start_time = String(schedule.startTime);
      formData.end_time = String(schedule.endTime);
      formData.total_slots = Number(schedule.totalSlots);
      formData.status = schedule.scheduleStatus || "open";

      showModal.value = true;
      previewDates.value = [String(schedule.date)];
    };

    const viewSchedule = (schedule) => {
      alert(`View schedule: ${schedule.course} on ${formatDate(schedule.date)} (${schedule.startTime}-${schedule.endTime})`);
    };

    const closeModal = () => {
      showModal.value = false;
      resetForm();
    };

    // ✅ CONFIRM DELETE
    const confirmDelete = (schedule) => {
      const id = getScheduleId(schedule);
      if (!id) {
        alert("Invalid schedule id from UI. Please refresh.");
        return;
      }
      scheduleToDelete.value = { ...schedule, id };
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      scheduleToDelete.value = null;
      showDeleteModal.value = false;
    };

    // ==============================
    // SAVE
    // ==============================
    const saveSchedule = async () => {
      if (saving.value) return;

      const selectedPersonId = Number(personId.value);
      const courseId = Number(formData.course_id);

      if (!courseId || !selectedPersonId) {
        alert(activeTrack.value === "tesda" ? "Course and Trainer are required" : "Course and Instructor are required");
        return;
      }

      if (!Number.isFinite(Number(formData.total_slots)) || Number(formData.total_slots) < 1) {
        alert("Total slots must be >= 1");
        return;
      }

      const dates = computeDatesByMode();
      if (!dates.length) {
        alert("No dates generated. Please check your mode and range/day selection.");
        return;
      }

      const courseName = activeCourse.value?.course_name || "";
      const rule = activeCourseRule.value;

let createRows = [];

const isTwoDayCourse =
  activeTrack.value === "driving" &&
  !isEditing.value &&
  rule?.days === 2;

if (!isEditing.value && activeTrack.value === "driving" && rule) {
  if (createMode.value === "single") {
    if (isTwoDayCourse) {
      const start = showPdcABTimeOptions.value
        ? (pdcSlot.value === "PM" ? "13:00" : "08:00")
        : String(formData.start_time || OPEN_TIME);

      const end = showPdcABTimeOptions.value
        ? (pdcSlot.value === "PM" ? "17:00" : "12:00")
        : String(formData.end_time || "12:00");

      createRows = [
        { schedule_date: dates[0], start_time: start, end_time: end },
        { schedule_date: addDaysYMD(dates[0], 1), start_time: start, end_time: end },
      ];
    } else {
      // 1-day courses (PDC-A, PDC-B etc.)
      createRows = [
        {
          schedule_date: dates[0],
          start_time: String(formData.start_time || OPEN_TIME),
          end_time: String(formData.end_time || "12:00"),
        },
      ];
    }
  } else {
    for (const d of dates) {
      if (isTwoDayCourse) {
        const start = showPdcABTimeOptions.value
          ? (pdcSlot.value === "PM" ? "13:00" : "08:00")
          : String(formData.start_time || OPEN_TIME);

        const end = showPdcABTimeOptions.value
          ? (pdcSlot.value === "PM" ? "17:00" : "12:00")
          : String(formData.end_time || "12:00");

        createRows.push(
          { schedule_date: d, start_time: start, end_time: end },
          { schedule_date: addDaysYMD(d, 1), start_time: start, end_time: end }
        );
      } else {
        createRows.push({
          schedule_date: d,
          start_time: String(formData.start_time || OPEN_TIME),
          end_time: String(formData.end_time || "12:00"),
        });
      }
    }
  }
}




      for (const r of createRows) {
        if (!withinFacetHours(r.start_time, r.end_time)) {
          alert(`Invalid time. FACET hours only: ${OPEN_TIME} - ${CLOSE_TIME}. (Got ${r.start_time}-${r.end_time})`);
          return;
        }
        if (String(r.start_time) >= String(r.end_time)) {
          alert(`End time must be after start time (${r.start_time} - ${r.end_time})`);
          return;
        }
      }

      saving.value = true;
      try {
        const base = {
          course_id: courseId,
          total_slots: Number(formData.total_slots),
          status: formData.status || "open",
        };

        if (activeTrack.value === "tesda") base.trainer_id = selectedPersonId;
        else base.instructor_id = selectedPersonId;

        if (isEditing.value) {
          const id = parseInt(formData.id, 10);
          if (!Number.isInteger(id) || id < 1) {
            alert("Invalid schedule id (client). Please refresh and try again.");
            return;
          }

          await api.put(`${scheduleUrl()}/${id}`, {
            ...base,
            schedule_date: String(formData.schedule_date),
            start_time: String(formData.start_time),
            end_time: String(formData.end_time),
          });
        } else {
          for (const row of createRows) {
            await api.post(scheduleUrl(), {
              ...base,
              schedule_date: row.schedule_date,
              start_time: row.start_time,
              end_time: row.end_time,
            });
          }
        }

        await fetchSchedules();
        closeModal();
      } catch (err) {
        console.error("saveSchedule error:", err?.response?.data || err);
        alert(err?.response?.data?.message || err.message || "Failed to save schedule");
      } finally {
        saving.value = false;
      }
    };

    // ✅ DELETE
    const deleteSchedule = async () => {
      if (!scheduleToDelete.value || deleting.value) return;

      const id = getScheduleId(scheduleToDelete.value);
      if (!id) {
        alert("Invalid schedule id. Refresh and try again.");
        return;
      }

      deleting.value = true;
      try {
        await api.delete(`${scheduleUrl()}/${id}`);
        await fetchSchedules();
        cancelDelete();
      } catch (err) {
        console.error("deleteSchedule error:", err?.response?.data || err);
        alert(err?.response?.data?.message || err.message || "Failed to delete schedule");
      } finally {
        deleting.value = false;
      }
    };

    const initForActiveTrack = async () => {
      selectedCourseId.value = 0;
      selectedMonth.value = months[new Date().getMonth()];
      listCourseFilter.value = 0;
      resetForm();
      resetListFilters();
      try {
        await Promise.all([fetchCourses(), fetchInstructors()]);
      } catch (e) {
        console.error("dropdown fetch error:", e);
      }
      await fetchSchedules();
      recomputePreview();
    };

    const switchTrack = async (track) => {
      if (activeTrack.value === track) return;
      activeTrack.value = track;
      await initForActiveTrack();
    };

    onMounted(async () => {
      await initForActiveTrack();
    });

    return {
      months,
      activeTrack,
      switchTrack,

      schedules,
      coursesRaw,
      instructors,

      searchQuery,
      selectedCourseId,
      selectedMonth,
      topCourses,

      currentYear,
      currentMonth,

      showModal,
      showDeleteModal,
      isEditing,
      scheduleToDelete,

      showDayModal,
      dayModalDate,
      dayModalSchedules,
      openDayModal,
      closeDayModal,

      formData,
      personId,
      saving,
      deleting,

      filteredSchedules,
      pagedSchedules,
      availableSlots,
      fullDates,
      calendarDates,
      currentMonthName,

      formatDate,
      getStatusClass,
      getDateClass,
      clearFilters,
      prevMonth,
      nextMonth,

      openAddModal,
      editSchedule,
      viewSchedule,
      closeModal,
      saveSchedule,

      confirmDelete,
      cancelDelete,
      deleteSchedule,

      fetchSchedules,

      createMode,
      range,
      weekly,
      monthly,
      weekdayOptions,
      previewDates,
      previewCount,
      recomputePreview,

      activeCourseRule,
      courseRuleHint,
      isTdcCourse,

      listCourseFilter,
      listCourses,
      listStatusFilter,
      listPersonFilter,
      resetListFilters,
      page,
      pageJump,
      pageSize,
      totalPages,

      pdcSlot,
showPdcABTimeOptions,

    };
  },
};
</script>
