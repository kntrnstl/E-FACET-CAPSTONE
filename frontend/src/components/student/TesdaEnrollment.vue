<template>
  <StudentLayoutTesda active-page="enrollment">
    <template #header-left>
      <input
        type="text"
        placeholder="Search trainings..."
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        v-model="searchQuery"
      />
    </template>

    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Training Enrollment</h1>

      <!-- Tabs -->
      <div class="flex space-x-2 mb-6">
        <button
          @click="activeTab = 'requirements'"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            activeTab === 'requirements'
              ? 'bg-blue-700 text-white'
              : 'bg-gray-300 hover:bg-gray-400'
          ]"
        >
          📋 Requirements
        </button>

        <button
          @click="activeTab = 'reservation'"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            activeTab === 'reservation'
              ? 'bg-blue-700 text-white'
              : 'bg-gray-300 hover:bg-gray-400'
          ]"
        >
          📅 Enrollment Reservation
        </button>
      </div>

      <!-- REQUIREMENTS SECTION -->
      <section
        v-if="activeTab === 'requirements'"
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
                <p class="text-gray-700">
                  {{ course.description || "—" }}
                </p>
              </div>

              <span class="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Active
              </span>
            </div>

            <!-- Requirements Toggle Button -->
            <button
              @click="toggleRequirements(course)"
              class="w-full flex items-center justify-between text-blue-700 font-medium hover:text-blue-800 transition-colors mb-3 px-3 py-2 bg-blue-50 rounded-lg hover:bg-blue-100"
            >
              <div class="flex items-center gap-2">
                <span>📋</span>
                <span>
                  {{ showReqMap[course.id] ? "Hide Requirements" : "View Requirements" }}
                </span>
              </div>

              <span
                class="text-lg transform transition-transform duration-300"
                :class="{ 'rotate-180': showReqMap[course.id] }"
              >
                ▼
              </span>
            </button>

            <!-- Requirements List -->
            <div
              class="overflow-hidden transition-all duration-300 ease-in-out"
              :style="{
                maxHeight: showReqMap[course.id] ? '220px' : '0px',
                marginTop: showReqMap[course.id] ? '0.75rem' : '0',
                paddingTop: showReqMap[course.id] ? '0.75rem' : '0',
                borderTopWidth: showReqMap[course.id] ? '1px' : '0'
              }"
            >
              <div v-if="showReqMap[course.id]">
                <h4 class="font-semibold text-gray-800 mb-2">Requirements:</h4>

                <div v-if="loadingReqMap[course.id]" class="text-sm text-gray-500">
                  Loading requirements...
                </div>

                <ul
                  v-else-if="(requirementsMap[course.id] || []).length"
                  class="space-y-1.5 text-sm text-gray-700"
                >
                  <li
                    v-for="r in requirementsMap[course.id]"
                    :key="r.requirement_id"
                    class="flex items-start gap-2"
                  >
                    <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    {{ r.requirement_text }}
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

            <!-- Action Button -->
            <button
              @click="enrollCourse(course)"
              class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Enroll
            </button>
          </div>

          <div v-if="!filteredCourses.length" class="text-center text-gray-500 py-10 md:col-span-2">
            No trainings found.
          </div>
        </div>
      </section>

      <!-- RESERVATION SECTION -->
      <section
        v-if="activeTab === 'reservation'"
        class="bg-white p-6 rounded-xl shadow border border-gray-200"
      >
        <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
          Reserve a Slot
        </h2>

        <!-- Training filter affects calendar -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Select Training</label>
          <select
            v-model="reservationForm.course"
            @change="onCourseChange"
            class="w-full md:w-1/2 border-2 border-blue-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-700 transition-colors"
            required
          >
            <option value="" disabled>Select a training</option>
            <option v-for="c in courses" :key="c.id" :value="String(c.id)">
              {{ c.course_name }} ({{ c.course_code }})
            </option>
          </select>
        </div>

        <!-- Calendar -->
        <div class="border-2 border-blue-700 rounded-xl p-6 mb-8">
          <div class="flex justify-between items-center mb-6">
            <button
              @click="previousMonth"
              class="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              ◀ Previous
            </button>
            <h3 class="text-xl font-bold text-blue-800">{{ currentMonth }} {{ currentYear }}</h3>
            <button
              @click="nextMonth"
              class="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Next ▶
            </button>
          </div>

          <div class="grid grid-cols-7 gap-2">
            <div v-for="day in daysOfWeek" :key="day" class="text-center font-medium text-gray-700 py-2">
              {{ day }}
            </div>

            <div
              v-for="day in calendarDays"
              :key="day.key"
              :class="[
                'p-3 text-center rounded-lg border transition-all cursor-pointer',
                day.isCurrentMonth
                  ? day.available
                    ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                    : day.available === false && day.slots === 0
                      ? 'border-red-200 bg-red-50 hover:bg-red-100'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  : 'border-gray-200 bg-gray-50 text-gray-400',
                day.isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              ]"
              @click="selectDate(day)"
            >
              <div class="font-medium">{{ day.day }}</div>

              <div v-if="day.isCurrentMonth && day.available && day.slots > 0" class="text-xs mt-1 text-blue-700">
                {{ day.slots }} slot{{ day.slots !== 1 ? "s" : "" }}
              </div>

              <div
                v-else-if="day.isCurrentMonth && day.available === false && day.slots === 0"
                class="text-xs mt-1 text-red-600"
              >
                Full
              </div>

              <div v-else-if="day.isCurrentMonth && day.available === null" class="text-xs mt-1 text-gray-500">
                -
              </div>
            </div>
          </div>

          <div class="flex justify-center gap-4 mt-6 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span class="text-gray-700">Available</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span class="text-gray-700">Full</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span class="text-gray-700">Not Available</span>
            </div>
          </div>
        </div>

        <!-- Available time schedules list -->
        <div v-if="selectedDate && selectedDate.isCurrentMonth" class="mb-8">
          <h3 class="text-lg font-bold text-gray-800 mb-3">
            Available Time Slots for {{ formatSelectedDate(selectedDate) }}
          </h3>

          <div v-if="!reservationForm.course" class="text-gray-600">
            Please select a training first.
          </div>

          <div v-else-if="loadingAvailability" class="text-gray-600">
            Loading time slots...
          </div>

          <div v-else-if="availableSchedules.length === 0" class="text-gray-600">
            No available schedules for this date.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              v-for="s in availableSchedules"
              :key="s.schedule_id"
              type="button"
              @click="pickSchedule(s)"
              :class="[
                'p-3 border rounded-lg text-left transition-colors',
                reservationForm.schedule_id === String(s.schedule_id)
                  ? 'border-blue-700 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
              ]"
            >
              <div class="font-semibold text-gray-800">
                {{ s.startTime }} - {{ s.endTime }}
              </div>
              <div class="text-sm text-gray-600">
                Trainer: {{ s.instructor }}
              </div>
              <div class="text-sm" :class="Number(s.availableSlots) > 0 ? 'text-blue-700' : 'text-red-600'">
                {{ s.availableSlots }} / {{ s.totalSlots }} slots available
              </div>

              <!-- optional: show 2-day info if backend returns it -->
              <div v-if="s.schedule_group_id" class="text-xs text-gray-500 mt-1">
                2-day package
              </div>
            </button>
          </div>
        </div>

        <!-- Reservation Form -->
        <form @submit.prevent="submitReservation" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Selected Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Selected Date</label>
              <div class="border-2 border-blue-700 rounded-lg p-3 bg-blue-50">
                <div class="font-medium text-blue-800">
                  {{ selectedDate ? formatSelectedDate(selectedDate) : "No date selected" }}
                </div>
                <div v-if="selectedDate" class="text-sm text-blue-600 mt-1">
                  {{ selectedDate.available ? selectedDate.slots + " slot(s) available" : "No slots available" }}
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                v-model="reservationForm.paymentMethod"
                class="w-full border-2 border-blue-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-700 transition-colors"
                required
              >
                <option value="" disabled>Select payment method</option>
                <option value="gcash">GCash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash On-site</option>
              </select>
            </div>

            <!-- Picked Schedule ID -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Selected Schedule</label>
              <div class="border rounded-lg p-3 bg-gray-50 border-gray-200">
                <div class="text-sm text-gray-700">
                  {{
                    reservationForm.schedule_id
                      ? `Schedule #${reservationForm.schedule_id} selected`
                      : "No schedule selected (pick a time slot above)"
                  }}
                </div>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
            <textarea
              v-model="reservationForm.notes"
              rows="3"
              placeholder="Any special requests or notes..."
              class="w-full border-2 border-blue-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-700 transition-colors"
            ></textarea>
          </div>

          <div class="pt-4">
            <button
              type="submit"
              :disabled="!canSubmitReservation"
              :class="[
                'w-full py-3 rounded-lg font-medium transition-colors',
                canSubmitReservation
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              {{ isSubmitting ? "Processing..." : "Reserve Slot" }}
            </button>
          </div>
        </form>
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
      searchQuery: "",
      activeTab: "requirements",

      courses: [],
      loadingCourses: false,

      requirementsMap: {},
      showReqMap: {},
      loadingReqMap: {},

      // calendar
      currentDate: new Date(),
      selectedDate: null,

      // month schedule map
      scheduleMap: {},
      loadingMonth: false,

      // availability (time schedules list)
      availableSchedules: [],
      loadingAvailability: false,

      isSubmitting: false,
      reservationForm: {
        course: "",
        schedule_id: "",
        paymentMethod: "",
        notes: "",
      },

      daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
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

    currentMonth() {
      return this.currentDate.toLocaleString("default", { month: "long" });
    },

    currentYear() {
      return this.currentDate.getFullYear();
    },

    calendarDays() {
      // Calendar logic - returns array of day objects
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDay = firstDay.getDay();

      const days = [];

      // previous month fillers
      for (let i = startDay - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        const dateString = this.toLocalYMD(d);
        days.push({
          key: `prev-${dateString}`,
          date: dateString,
          day: d.getDate(),
          isCurrentMonth: false,
          available: false,
          slots: 0,
          isSelected: this.selectedDate?.date === dateString,
        });
      }

      // current month days
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const dateString = this.toLocalYMD(d);

        const info = this.scheduleMap[dateString];
        const slots = info ? Number(info.availableSlots || 0) : 0;
        const available = info ? slots > 0 : null;

        days.push({
          key: `cur-${dateString}`,
          date: dateString,
          day,
          isCurrentMonth: true,
          available,
          slots,
          isSelected: this.selectedDate?.date === dateString,
        });
      }

      // next month fillers
      const totalCells = 42;
      const remainingCells = totalCells - days.length;

      for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(year, month + 1, i);
        const dateString = this.toLocalYMD(d);
        days.push({
          key: `next-${dateString}`,
          date: dateString,
          day: d.getDate(),
          isCurrentMonth: false,
          available: false,
          slots: 0,
          isSelected: this.selectedDate?.date === dateString,
        });
      }

      return days;
    },

    canSubmitReservation() {
      return (
        this.reservationForm.course &&
        this.reservationForm.schedule_id &&
        this.reservationForm.paymentMethod &&
        this.selectedDate &&
        this.selectedDate.available === true &&
        this.selectedDate.slots > 0 &&
        !this.isSubmitting
      );
    },
  },

  methods: {
    toLocalYMD(dateLike) {
      const d = new Date(dateLike);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    },

    async fetchCourses() {
      // To be implemented with API call
      this.loadingCourses = true;
      // API call here
      this.loadingCourses = false;
    },

    async toggleRequirements(course) {
      const courseId = course.id;
      this.showReqMap[courseId] = !this.showReqMap[courseId];

      if (this.showReqMap[courseId] && !this.requirementsMap[courseId]) {
        this.loadingReqMap[courseId] = true;
        // API call to fetch requirements here
        this.loadingReqMap[courseId] = false;
      }
    },

    enrollCourse(course) {
      if (confirm(`Are you sure you want to enroll in ${course.course_name}?`)) {
        this.reservationForm.course = String(course.id);
        this.activeTab = "reservation";
        this.fetchMonthSchedules();
      }
    },

    async fetchMonthSchedules() {
      // To be implemented with API call
      this.loadingMonth = true;
      // API call here
      this.loadingMonth = false;
    },

    async onCourseChange() {
      this.reservationForm.schedule_id = "";
      this.availableSchedules = [];
      this.selectedDate = null;
      await this.fetchMonthSchedules();
    },

    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
      this.selectedDate = null;
      this.availableSchedules = [];
      this.reservationForm.schedule_id = "";
      this.fetchMonthSchedules();
    },

    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
      this.selectedDate = null;
      this.availableSchedules = [];
      this.reservationForm.schedule_id = "";
      this.fetchMonthSchedules();
    },

    async selectDate(day) {
      if (!day.isCurrentMonth) return;
      if (!this.reservationForm.course) {
        alert("Please select a training first.");
        return;
      }

      this.selectedDate = day;
      this.availableSchedules = [];
      this.reservationForm.schedule_id = "";

      await this.fetchAvailabilityForSelectedDate();
    },

    formatSelectedDate(dateObj) {
      const d = new Date(dateObj.date + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    async fetchAvailabilityForSelectedDate() {
      if (!this.selectedDate?.date) return;
      if (!this.reservationForm.course) return;

      this.loadingAvailability = true;
      // API call to fetch availability here
      this.loadingAvailability = false;
    },

    pickSchedule(s) {
      this.reservationForm.schedule_id = String(s.schedule_id);
    },

    async submitReservation() {
      if (!this.canSubmitReservation) return;

      this.isSubmitting = true;
      try {
        // API call to submit reservation here
        alert("✅ Reservation successful!");
        
        // Reset form
        this.reservationForm.paymentMethod = "";
        this.reservationForm.notes = "";
        this.reservationForm.schedule_id = "";
        this.availableSchedules = [];
        this.selectedDate = null;

        await this.fetchMonthSchedules();
      } catch (err) {
        console.error("Reservation failed:", err);
        alert("❌ Reservation failed. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },
  },

  async mounted() {
    // Initialize data fetching
    // await this.fetchCourses();
    // await this.fetchMonthSchedules();
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