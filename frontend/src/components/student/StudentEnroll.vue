<template>
  <StudentLayout active-page="enrollment">
    <template #header-left>
      <input
        type="text"
        placeholder="Search..."
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
        v-model="searchQuery"
      />
    </template>

    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Enrollment</h1>

      <!-- ✅ Active Reservation Banner -->
      <div
        v-if="activeReservation"
        class="mb-6 p-4 rounded-xl border border-yellow-200 bg-yellow-50"
      >
        <div class="font-semibold text-yellow-900">
          ⚠ You already have an active reservation.
        </div>
        <div class="text-sm text-yellow-900 mt-1">
          Course: <span class="font-semibold">{{ activeReservation.course }}</span>
        </div>
        <div class="text-sm text-yellow-900">
          Date: <span class="font-semibold">{{ formatDateYMD(activeReservation.date) }}</span>
          • Time:
          <span class="font-semibold">
            {{ activeReservation.startTime }} - {{ activeReservation.endTime }}
          </span>
        </div>
        <div class="text-sm text-yellow-900">
          Schedule #<span class="font-semibold">{{ activeReservation.schedule_id }}</span>
          • Status:
          <span class="font-semibold">{{ activeReservation.reservation_status }}</span>
        </div>

        <!-- ✅ show sibling if 2-day -->
        <div
          v-if="activeReservation.isPackage && activeReservation.sibling"
          class="text-sm text-yellow-900 mt-2"
        >
          Package Day 2:
          <span class="font-semibold">
            {{ formatDateYMD(activeReservation.sibling.date) }}
            • {{ activeReservation.sibling.startTime }} - {{ activeReservation.sibling.endTime }}
            • Schedule #{{ activeReservation.sibling.schedule_id }}
          </span>
        </div>

        <div class="text-xs text-yellow-800 mt-2">
          You can reserve again after this reservation is marked DONE (automatic after the reserved day).
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button @click="activeTab = 'courses'" :class="tabClass('courses')">📚 Course</button>

        <button
          @click="activeTab = 'slot'"
          :disabled="!selectedCourse || hasActiveReservation"
          :class="tabClass('slot', !selectedCourse || hasActiveReservation)"
          :title="hasActiveReservation ? 'You already have an active reservation' : 'Select a course first'"
        >
          📅 Slot
        </button>

        <button
          @click="activeTab = 'upload'"
          :disabled="!canGoUpload || hasActiveReservation"
          :class="tabClass('upload', !canGoUpload || hasActiveReservation)"
          :title="hasActiveReservation ? 'You already have an active reservation' : 'Pick a slot first'"
        >
          📤 Upload
        </button>

        <button
          @click="activeTab = 'payment'"
          :disabled="!canGoPayment || hasActiveReservation"
          :class="tabClass('payment', !canGoPayment || hasActiveReservation)"
          :title="hasActiveReservation ? 'You already have an active reservation' : 'Complete upload step first'"
        >
          💳 Payment
        </button>
      </div>

      <!-- ===================== -->
      <!-- 1) COURSES -->
      <!-- ===================== -->
      <section
        v-if="activeTab === 'courses'"
        class="bg-white p-6 rounded-xl shadow border border-gray-200"
      >
        <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
          Available Courses
        </h2>

        <div v-if="loadingCourses" class="text-center py-10 text-gray-600">
          Loading courses...
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="border-2 border-green-700 rounded-xl p-6 hover:shadow-lg transition-shadow self-start"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-green-800 mb-2">
                  {{ course.course_name }} ({{ course.course_code }})
                </h3>
                <p class="text-gray-700">{{ course.description || "—" }}</p>
              </div>

              <span class="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                Active
              </span>
            </div>

            <!-- Requirements preview -->
            <button
              @click="toggleRequirements(course)"
              class="w-full flex items-center justify-between text-green-700 font-medium hover:text-green-800 transition-colors mb-3 px-3 py-2 bg-green-50 rounded-lg hover:bg-green-100"
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
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    {{ r.requirement_text }}
                  </li>
                </ul>

                <p v-else class="text-sm text-gray-500">— No requirements found</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Duration</p>
                <p class="font-semibold text-gray-800">{{ course.duration || "—" }}</p>
              </div>

              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Course Fee</p>
                <p class="font-semibold text-green-700">
                  ₱{{ Number(course.course_fee || 0).toLocaleString() }}
                </p>
              </div>
            </div>

            <button
              @click="selectCourse(course)"
              class="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
              :disabled="hasActiveReservation"
              :title="hasActiveReservation ? 'You already have an active reservation' : ''"
            >
              Choose & Pick Slot
            </button>
          </div>

          <div v-if="!filteredCourses.length" class="text-center text-gray-500 py-10 md:col-span-2">
            No courses found.
          </div>
        </div>
      </section>

      <!-- ===================== -->
      <!-- 2) SLOT -->
      <!-- ===================== -->
      <section
        v-if="activeTab === 'slot'"
        class="bg-white p-6 rounded-xl shadow border border-gray-200"
      >
        <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
          Pick a Slot
        </h2>

        <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="font-semibold text-green-800">
            Selected Course:
            <span class="font-bold">
              {{ selectedCourse?.course_name }} ({{ selectedCourse?.course_code }})
            </span>
          </div>

          <div v-if="reservationForm.schedule_id" class="text-sm text-green-800 mt-2">
            ✅ Selected Schedule:
            <span class="font-semibold">#{{ reservationForm.schedule_id }}</span>
            <span v-if="selectedPickedPackage" class="ml-2 text-xs text-green-800">
              (2-day package locked)
            </span>
          </div>
          <div v-else class="text-sm text-gray-700 mt-2">
            Select a date then pick a time slot.
          </div>
        </div>

        <!-- Calendar -->
        <div class="border-2 border-green-700 rounded-xl p-6 mb-8">
          <div class="flex justify-between items-center mb-6">
            <button
              @click="previousMonth"
              class="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              ◀ Previous
            </button>
            <h3 class="text-xl font-bold text-green-800">{{ currentMonth }} {{ currentYear }}</h3>
            <button
              @click="nextMonth"
              class="p-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
            >
              Next ▶
            </button>
          </div>

          <div class="grid grid-cols-7 gap-2">
            <div
              v-for="day in daysOfWeek"
              :key="day"
              class="text-center font-medium text-gray-700 py-2"
            >
              {{ day }}
            </div>

            <div
              v-for="day in calendarDays"
              :key="day.key"
              :class="[
                'p-3 text-center rounded-lg border transition-all',
                isDayDisabled(day) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                !day.isCurrentMonth
                  ? 'border-gray-200 bg-gray-50 text-gray-400'
                  : isPastDate(day.date)
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : day.available
                      ? 'border-green-200 bg-green-50 hover:bg-green-100'
                      : day.available === false && day.slots === 0
                        ? 'border-red-200 bg-red-50 hover:bg-red-100'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100',
                day.isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''
              ]"
              @click="selectDate(day)"
            >
              <div class="font-medium">{{ day.day }}</div>

              <div
                v-if="day.isCurrentMonth && isPastDate(day.date)"
                class="text-xs mt-1 text-red-600"
              >
                Past
              </div>

              <div
                v-else-if="day.isCurrentMonth && !isPastDate(day.date) && day.available && day.slots > 0"
                class="text-xs mt-1 text-green-700"
              >
                {{ day.slots }} slot{{ day.slots !== 1 ? "s" : "" }}
              </div>

              <div
                v-else-if="day.isCurrentMonth && !isPastDate(day.date) && day.available === false && day.slots === 0"
                class="text-xs mt-1 text-red-600"
              >
                Full
              </div>

              <div
                v-else-if="day.isCurrentMonth && day.available === null"
                class="text-xs mt-1 text-gray-500"
              >
                -
              </div>
            </div>
          </div>
        </div>

        <div v-if="selectedDate && selectedDate.isCurrentMonth" class="mb-8">
          <h3 class="text-lg font-bold text-gray-800 mb-3">
            Available Time Slots for {{ formatSelectedDate(selectedDate) }}
          </h3>

          <div v-if="loadingAvailability" class="text-gray-600">Loading time slots...</div>
          <div v-else-if="availableSchedules.length === 0" class="text-gray-600">
            No available schedules for this date.
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              v-for="s in availableSchedules"
              :key="scheduleKey(s)"
              type="button"
              @click="pickSchedule(s)"
              :class="[
                'p-3 border rounded-lg text-left transition-colors',
                isPicked(s) ? 'border-green-700 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
              ]"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="font-semibold text-gray-800">
                  {{ s.startTime }} - {{ s.endTime }}
                </div>

                <span
                  v-if="s.isPackage"
                  class="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800"
                >
                  2-Day Package
                </span>
              </div>

              <div class="text-sm text-gray-600">Instructor: {{ s.instructor }}</div>

              <!-- ✅ show dates if package -->
              <div v-if="s.isPackage" class="text-xs text-gray-600 mt-1">
                Day 1: <span class="font-medium">{{ formatDateYMD(s.day1_date) }}</span>
                • Day 2: <span class="font-medium">{{ formatDateYMD(s.day2_date) }}</span>
              </div>

              <div
                class="text-sm mt-1"
                :class="Number(s.availableSlots) > 0 ? 'text-green-700' : 'text-red-600'"
              >
                {{ s.availableSlots }}
                <span v-if="!s.isPackage">/ {{ s.totalSlots }}</span>
                <span v-else> package slot{{ Number(s.availableSlots) !== 1 ? "s" : "" }} available</span>
              </div>

              <div v-if="s.isPackage" class="text-xs text-gray-500 mt-1">
                Selecting this will reserve BOTH days.
              </div>
            </button>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <textarea
            v-model="reservationForm.notes"
            rows="3"
            placeholder="Any special requests or notes..."
            class="w-full border-2 border-green-700 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-700 transition-colors"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" @click="activeTab = 'courses'">
            Back
          </button>

          <button
            class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
            :disabled="!canGoUpload"
            @click="goToUpload"
          >
            Continue to Upload
          </button>
        </div>
      </section>

      <!-- ===================== -->
      <!-- 3) UPLOAD REQUIREMENTS -->
      <!-- ===================== -->
      <section
        v-if="activeTab === 'upload'"
        class="bg-white p-6 rounded-xl shadow border border-gray-200"
      >
        <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
          Requirements
        </h2>

        <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="font-semibold text-green-800">
            Course:
            <span class="font-bold">
              {{ selectedCourse?.course_name }} ({{ selectedCourse?.course_code }})
            </span>
          </div>
          <div class="text-sm text-green-800 mt-1">
            Slot:
            <span class="font-semibold">Schedule #{{ reservationForm.schedule_id || "—" }}</span>
            <span v-if="selectedPickedPackage" class="ml-2 text-xs text-green-800">(2-day package)</span>
          </div>

          <div class="mt-4">
            <div class="text-sm font-medium text-gray-700 mb-2">Requirements Submission</div>

            <label class="flex items-center gap-2 text-gray-700">
              <input type="radio" value="online" v-model="requirementsMode" />
              Online upload ngayon
            </label>

            <label class="flex items-center gap-2 text-gray-700 mt-2">
              <input type="radio" value="walkin" v-model="requirementsMode" @change="onRequirementsModeChange" />
              Walk-in (on-site ko ipapasa)
            </label>

            <p class="text-sm text-gray-600 mt-2">
              Kapag Walk-in, hindi required mag-upload dito.
            </p>
          </div>
        </div>

        <div v-if="uploadLoading" class="text-gray-600">Loading requirements...</div>

        <div v-else>
          <div v-if="selectedRequirements.length === 0" class="text-gray-600">
            No requirements for this course.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="req in selectedRequirements"
              :key="req.requirement_id"
              class="p-4 border rounded-lg"
            >
              <div class="font-semibold text-gray-800 mb-2">
                {{ req.requirement_text }}
              </div>

              <div class="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="file"
                  :disabled="requirementsMode === 'walkin'"
                  @change="onFileChange(req.requirement_id, $event)"
                  class="block w-full md:w-2/3 text-sm"
                  accept="image/*,.pdf"
                />

                <div class="text-sm text-gray-600 md:w-1/3">
                  <span v-if="requirementsMode === 'walkin'" class="text-green-700 font-medium">
                    Will submit on-site
                  </span>
                  <span v-else-if="uploads[req.requirement_id]" class="text-green-700 font-medium">
                    Selected: {{ uploads[req.requirement_id].name }}
                  </span>
                  <span v-else class="text-gray-500">No file selected</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" @click="activeTab = 'slot'">
              Back
            </button>

            <button
              class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
              :disabled="!canGoPayment"
              @click="activeTab = 'payment'"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </section>

      <!-- ===================== -->
      <!-- 4) PAYMENT -->
      <!-- ===================== -->
      <section
        v-if="activeTab === 'payment'"
        class="bg-white p-6 rounded-xl shadow border border-gray-200"
      >
        <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
          Payment
        </h2>

        <div class="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div class="font-semibold text-gray-800">
            Course Fee:
            <span class="text-green-700 font-bold">
              ₱{{ Number(selectedCourse?.course_fee || 0).toLocaleString() }}
            </span>
          </div>
          <div class="text-sm text-gray-600 mt-1">
            Course:
            <span class="font-medium">{{ selectedCourse?.course_name }} ({{ selectedCourse?.course_code }})</span>
          </div>
          <div class="text-sm text-gray-600">
            Slot:
            <span class="font-medium">Schedule #{{ reservationForm.schedule_id }}</span>
            <span v-if="selectedPickedPackage" class="ml-2 text-xs text-gray-600">(2-day package)</span>
          </div>
          <div class="text-sm text-gray-600">
            Requirements mode:
            <span class="font-medium">{{ requirementsMode === "walkin" ? "Walk-in" : "Online upload" }}</span>
          </div>
          <div class="text-sm text-gray-600">
            Payment Ref:
            <span class="font-mono">{{ paymentRef || "— (not generated yet)" }}</span>
          </div>
          <div v-if="qrphSubmitted" class="text-sm text-green-700 mt-2 font-medium">
            ✅ Proof submitted! Now click 'Reserve Slot' to finalize.
          </div>
        </div>

        <!-- Payment mode -->
        <div class="mb-6">
          <div class="block text-sm font-medium text-gray-700 mb-2">Payment Mode</div>

          <label class="flex items-center gap-2 text-gray-700">
            <input type="radio" value="online" v-model="paymentMode" @change="onPaymentModeChange" />
            Online payment
          </label>

          <label class="flex items-center gap-2 text-gray-700 mt-2">
            <input type="radio" value="cash" v-model="paymentMode" @change="onPaymentModeChange" />
            Cash on-site
          </label>
        </div>

        <!-- Payment method (online) -->
        <div v-if="paymentMode === 'online'" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
          <select
            v-model="payment.paymentMethod"
            class="w-full md:w-1/2 border-2 border-green-700 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-700 transition-colors"
            required
          >
            <option value="" disabled>Select payment method</option>
            <option value="GCASH">GCash (QRPH)</option>
          </select>

          <div class="mt-3" v-if="payment.paymentMethod === 'GCASH'">
            <button
              class="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:bg-gray-300"
              :disabled="isSubmitting || !reservationForm.schedule_id"
              @click="openGcashModal"
              type="button"
              :title="!reservationForm.schedule_id ? 'Pick a schedule first' : ''"
            >
              Open GCash Payment (QRPH)
            </button>
          </div>
        </div>

        <div class="flex gap-3">
          <button class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300" @click="activeTab = 'upload'">
            Back
          </button>

          <button
            class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
            :disabled="!canSubmitFinal"
            @click="onConfirmClick"
          >
            {{ isSubmitting ? "Processing..." : confirmButtonText }}
          </button>
        </div>

        <p class="text-xs text-gray-500 mt-4">
          ✅ Reservation locks your slot immediately. <br />
          ✅ Online proof (optional): upload proof so admin can check. <br />
          ✅ Cash/On-site: pay personally on your schedule date.
        </p>
      </section>
    </div>

    <!-- ===================== -->
    <!-- GCash QRPH Modal -->
    <!-- ===================== -->
    <div v-if="showGcashModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-bold text-green-800">Pay with GCash (QRPH)</h3>
            <p class="text-sm text-gray-600 mt-1">
              Course: <span class="font-medium">{{ selectedCourse?.course_name }}</span>
            </p>
            <p class="text-sm text-gray-600">
              Amount:
              <span class="font-semibold text-green-700">
                ₱{{ Number(selectedCourse?.course_fee || 0).toLocaleString() }}
              </span>
            </p>
            <p class="text-xs text-gray-500 mt-2">
              Payment Ref: <span class="font-mono">{{ paymentRef || "—" }}</span>
            </p>
          </div>

          <button class="text-gray-400 hover:text-gray-600 text-xl" @click="closeGcashModal">✕</button>
        </div>

        <div v-if="gcashError" class="mt-4 text-sm text-red-600">
          {{ gcashError }}
        </div>

        <div class="mt-5">
          <button
            v-if="!paymentRef"
            class="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-300"
            @click="createQrphPaymentRef"
            :disabled="gcashLoading || !reservationForm.schedule_id"
            :title="!reservationForm.schedule_id ? 'Pick a schedule first' : ''"
          >
            {{ gcashLoading ? "Preparing..." : "Generate Payment Ref" }}
          </button>

          <div v-else class="space-y-4">
            <div class="border rounded-lg p-3 bg-gray-50">
              <div class="text-sm text-gray-700 font-medium mb-2">Scan this QRPH in your GCash app:</div>
              <img src="/admin-qrph.png" alt="QRPH" class="w-full rounded-lg border bg-white" />
              <div class="text-xs text-gray-500 mt-2">
                Open GCash → Scan QR → Pay → screenshot/receipt → upload below.
              </div>
            </div>

            <div class="border rounded-lg p-3">
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload Proof of Payment</label>
              <input type="file" accept="image/*,.pdf" @change="onQrphProofChange" class="block w-full text-sm" />
              <div class="text-xs text-gray-600 mt-2">
                <span v-if="qrphProofFile">Selected: {{ qrphProofFile.name }}</span>
                <span v-else>No file selected</span>
              </div>

              <button
                class="mt-3 w-full rounded-lg bg-green-700 px-4 py-2 text-white hover:bg-green-800 disabled:bg-gray-300"
                @click="uploadQrphProof"
                :disabled="gcashLoading || !qrphProofFile"
              >
                {{ gcashLoading ? "Uploading..." : "Submit Proof" }}
              </button>

              <div v-if="qrphSubmitted" class="mt-3 text-sm text-green-700 font-medium">
                ✅ Submitted! Waiting for admin verification.
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 flex gap-2">
          <button
            class="flex-1 rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
            @click="closeGcashModal"
            :disabled="gcashLoading"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import StudentLayout from "./StudentLayout.vue";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// avoid UTC shift
const toLocalYMD = (dateLike) => {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default {
  name: "StudentEnroll",
  components: { StudentLayout },

  data() {
    return {
      searchQuery: "",
      activeTab: "courses",

      courses: [],
      loadingCourses: false,

      requirementsMap: {},
      showReqMap: {},
      loadingReqMap: {},

      selectedCourse: null,

      uploadLoading: false,

      requirementsMode: "online",
      paymentMode: "online",

      uploads: {},

      currentDate: new Date(),
      selectedDate: null,
      scheduleMap: {},
      loadingMonth: false,

      availableSchedules: [],
      loadingAvailability: false,

      payment: {
        paymentMethod: "",
        proofFile: null,
      },

      isSubmitting: false,

      // QRPH payment
      paymentRef: "",
      qrphProofFile: null,
      qrphSubmitted: false,

      // Modal state
      showGcashModal: false,
      gcashLoading: false,
      gcashError: "",

      reservationForm: {
        course: "",
        schedule_id: "",
        notes: "",
      },

      // ✅ Active reservation state
      activeReservation: null,
      loadingActiveReservation: false,

      daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  },

  computed: {
    hasActiveReservation() {
      return Boolean(this.activeReservation);
    },

    // ✅ tell UI if picked item is 2-day package
    selectedPickedPackage() {
      const sid = String(this.reservationForm.schedule_id || "");
      if (!sid) return false;
      return this.availableSchedules.some((s) => {
        if (s?.isPackage) return String(s.day1_schedule_id) === sid;
        return false;
      });
    },

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

    selectedRequirements() {
      const id = this.selectedCourse?.id;
      return id ? (this.requirementsMap[id] || []) : [];
    },

    currentMonth() {
      return this.currentDate.toLocaleString("default", { month: "long" });
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },

    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDay = firstDay.getDay();

      const days = [];

      for (let i = startDay - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        const dateString = toLocalYMD(d);
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

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const dateString = toLocalYMD(d);

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

      const totalCells = 42;
      const remainingCells = totalCells - days.length;

      for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(year, month + 1, i);
        const dateString = toLocalYMD(d);
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

    canGoUpload() {
      return Boolean(!this.hasActiveReservation && this.selectedCourse && this.reservationForm.schedule_id);
    },

    canProceedUploadStep() {
      if (!this.canGoUpload) return false;
      if (this.requirementsMode === "walkin") return true;

      const reqs = this.selectedRequirements;
      if (!reqs.length) return true;
      return reqs.every((r) => Boolean(this.uploads[r.requirement_id]));
    },

    canGoPayment() {
      return this.canProceedUploadStep;
    },

    canSubmitFinal() {
      if (this.hasActiveReservation) return false;
      if (!this.selectedCourse) return false;
      if (!this.reservationForm.schedule_id) return false (this.canProceedUploadStep ? false : false);
      if (!this.canProceedUploadStep) return false;
      if (this.isSubmitting) return false;

      if (this.paymentMode === "cash") return true;
      if (!this.payment.paymentMethod) return false;

      return true;
    },

    confirmButtonText() {
      if (this.paymentMode === "cash") return "Reserve Slot (Confirmed)";
      if (this.paymentMode === "online") return "Reserve Slot (Confirmed)";
      return "Reserve Slot (Confirmed)";
    },
  },

  methods: {
    // ✅ NEW: normalize schedule item key
    scheduleKey(s) {
      if (s?.isPackage) return `pkg-${s.day1_schedule_id}-${s.day2_schedule_id}`;
      return `sch-${s.schedule_id}`;
    },

    // ✅ NEW: check if schedule picked
    isPicked(s) {
      const sid = String(this.reservationForm.schedule_id || "");
      if (!sid) return false;
      if (s?.isPackage) return String(s.day1_schedule_id) === sid;
      return String(s.schedule_id) === sid;
    },

    // ✅ NEW: past date helper
    isPastDate(ymd) {
      const today = toLocalYMD(new Date());
      return String(ymd || "") < today;
    },

    // ✅ NEW: disable day helper
    isDayDisabled(day) {
      if (!day.isCurrentMonth) return true;
      if (this.isPastDate(day.date)) return true;
      if (day.available === false || Number(day.slots || 0) <= 0) return true;
      if (day.available === null) return true; // no data
      return false;
    },

    tabClass(tab, disabled = false) {
      const base = "px-4 py-2 rounded-md font-medium transition-colors";
      if (disabled) return [base, "bg-gray-200 text-gray-400 cursor-not-allowed"].join(" ");
      return [
        base,
        this.activeTab === tab ? "bg-green-700 text-white" : "bg-gray-300 hover:bg-gray-400",
      ].join(" ");
    },

    formatDateYMD(ymd) {
      if (!ymd) return "—";
      const d = new Date(String(ymd) + "T00:00:00");
      if (Number.isNaN(d.getTime())) return String(ymd);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    async fetchActiveReservation() {
      this.loadingActiveReservation = true;
      try {
        const res = await api.get("/student/reservations/active");
        this.activeReservation = res.data?.data || null;

        if (this.activeReservation) {
          this.activeTab = "courses";
          this.selectedCourse = null;
          this.selectedDate = null;
          this.availableSchedules = [];
          this.reservationForm.course = "";
          this.reservationForm.schedule_id = "";
          this.reservationForm.notes = "";
        }
      } catch (err) {
        console.error("fetchActiveReservation error:", err);
        this.activeReservation = null;
      } finally {
        this.loadingActiveReservation = false;
      }
    },

    async fetchCourses() {
      this.loadingCourses = true;
      try {
        const res = await api.get("/student/courses");
        this.courses = Array.isArray(res.data?.data) ? res.data.data : [];
      } catch (err) {
        console.error("fetchCourses error:", err);
        this.courses = [];
        alert(err.response?.data?.message || "Failed to load courses");
      } finally {
        this.loadingCourses = false;
      }
    },

    async toggleRequirements(course) {
      const courseId = course.id;
      this.showReqMap[courseId] = !this.showReqMap[courseId];

      if (this.showReqMap[courseId] && !this.requirementsMap[courseId]) {
        this.loadingReqMap[courseId] = true;
        try {
          const res = await api.get(`/student/courses/${courseId}/requirements`);
          this.requirementsMap[courseId] = Array.isArray(res.data?.data) ? res.data.data : [];
        } catch (err) {
          console.error("toggleRequirements error:", err);
          this.requirementsMap[courseId] = [];
          alert(err.response?.data?.message || "Failed to load requirements");
        } finally {
          this.loadingReqMap[courseId] = false;
        }
      }
    },

    async fetchMonthSchedules() {
      if (!this.reservationForm.course) {
        this.scheduleMap = {};
        return;
      }

      const y = this.currentDate.getFullYear();
      const m = String(this.currentDate.getMonth() + 1).padStart(2, "0");
      const month = `${y}-${m}`;

      this.loadingMonth = true;
      try {
        const params = { month, course_id: Number(this.reservationForm.course) };
        const res = await api.get("/student/schedules", { params });

        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        const map = {};
        for (const r of rows) map[r.date] = r;
        this.scheduleMap = map;
      } catch (err) {
        console.error("fetchMonthSchedules error:", err);
        this.scheduleMap = {};
        alert(err.response?.data?.message || "Failed to load month schedules");
      } finally {
        this.loadingMonth = false;
      }
    },

    async fetchAvailabilityForSelectedDate() {
      if (!this.selectedDate?.date) return;
      if (!this.reservationForm.course) return;

      this.loadingAvailability = true;
      try {
        const res = await api.get("/student/availability", {
          params: {
            date: this.selectedDate.date,
            course_id: Number(this.reservationForm.course),
          },
        });
        this.availableSchedules = Array.isArray(res.data?.data) ? res.data.data : [];
      } catch (err) {
        console.error("fetchAvailability error:", err);
        this.availableSchedules = [];
        alert(err.response?.data?.message || "Failed to load availability");
      } finally {
        this.loadingAvailability = false;
      }
    },

    async selectCourse(course) {
      if (this.hasActiveReservation) {
        alert("You already have an active reservation.");
        return;
      }

      this.selectedCourse = course;
      this.reservationForm.course = String(course.id);

      this.selectedDate = null;
      this.availableSchedules = [];
      this.reservationForm.schedule_id = "";
      this.reservationForm.notes = "";

      this.requirementsMode = "online";
      this.paymentMode = "online";
      this.uploads = {};
      this.payment.paymentMethod = "";
      this.payment.proofFile = null;

      this.paymentRef = "";
      this.qrphProofFile = null;
      this.qrphSubmitted = false;

      this.showGcashModal = false;
      this.gcashLoading = false;
      this.gcashError = "";

      if (!this.requirementsMap[course.id]) {
        this.uploadLoading = true;
        try {
          const res = await api.get(`/student/courses/${course.id}/requirements`);
          this.requirementsMap[course.id] = Array.isArray(res.data?.data) ? res.data.data : [];
        } catch (err) {
          console.error("selectCourse requirements error:", err);
          this.requirementsMap[course.id] = [];
          alert(err.response?.data?.message || "Failed to load requirements");
        } finally {
          this.uploadLoading = false;
        }
      }

      await this.fetchMonthSchedules();
      this.activeTab = "slot";
    },

    // ✅ block past/disabled days immediately
    async selectDate(day) {
      if (this.isDayDisabled(day)) return;
      if (!this.reservationForm.course) return;

      this.selectedDate = day;
      this.availableSchedules = [];
      this.reservationForm.schedule_id = "";

      await this.fetchAvailabilityForSelectedDate();
    },

    // ✅ UPDATED: handles package schedule
    pickSchedule(s) {
      if (s?.isPackage) {
        // ✅ backend expects DAY 1 schedule_id
        this.reservationForm.schedule_id = String(s.day1_schedule_id);
      } else {
        this.reservationForm.schedule_id = String(s.schedule_id);
      }
    },

    goToUpload() {
      if (!this.canGoUpload) {
        alert("Pick a slot first.");
        return;
      }
      this.activeTab = "upload";
    },

    onFileChange(requirementId, event) {
      const file = event.target.files?.[0];
      if (!file) return;
      this.uploads = { ...this.uploads, [requirementId]: file };
    },

    onRequirementsModeChange() {
      if (this.requirementsMode === "walkin") {
        this.uploads = {};
      }
    },

    onPaymentModeChange() {
      if (this.paymentMode === "cash") {
        this.payment.paymentMethod = "";
        this.payment.proofFile = null;
      }
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

    formatSelectedDate(dateObj) {
      const d = new Date(dateObj.date + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    openGcashModal() {
      if (!this.reservationForm.schedule_id) {
        alert("Pick a schedule first.");
        return;
      }
      this.gcashError = "";
      this.showGcashModal = true;
    },
    closeGcashModal() {
      this.showGcashModal = false;
      this.gcashLoading = false;
      this.gcashError = "";
    },

    onQrphProofChange(e) {
      this.qrphProofFile = e.target.files?.[0] || null;
    },

    async createQrphPaymentRef() {
      try {
        this.gcashLoading = true;
        this.gcashError = "";

        if (!this.reservationForm.schedule_id) {
          this.gcashError = "Pick a schedule first.";
          return;
        }

        const res = await api.post("/student/payments/qrph/create", {
          course_id: Number(this.selectedCourse.id),
          schedule_id: Number(this.reservationForm.schedule_id), // ✅ day1 schedule id
          notes: this.reservationForm.notes || null,
        });

        this.paymentRef = res.data?.data?.payment_ref || "";
        if (!this.paymentRef) throw new Error("No payment_ref returned.");
        alert(`✅ Payment ref created: ${this.paymentRef}`);
      } catch (err) {
        console.error("createQrphPaymentRef error:", err.response?.data || err);
        this.gcashError = err.response?.data?.message || err.message || "Failed to create payment ref.";
      } finally {
        this.gcashLoading = false;
      }
    },

    async uploadQrphProof() {
      try {
        this.gcashLoading = true;
        this.gcashError = "";

        if (!this.paymentRef) {
          this.gcashError = "Generate Payment Ref first.";
          return;
        }
        if (!this.qrphProofFile) {
          this.gcashError = "Select a proof file first.";
          return;
        }

        const fd = new FormData();
        fd.append("proof", this.qrphProofFile);

        await api.post(
          `/student/payments/qrph/${encodeURIComponent(this.paymentRef)}/proof`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        this.qrphSubmitted = true;
        alert("✅ Proof submitted! Admin can check it.");
      } catch (err) {
        console.error("uploadQrphProof error:", err.response?.data || err);
        this.gcashError = err.response?.data?.message || err.message || "Failed to upload proof.";
      } finally {
        this.gcashLoading = false;
      }
    },

    async onConfirmClick() {
      if (!this.canSubmitFinal) return;
      return this.submitReservationAndUploads();
    },

    // ✅ FINAL RESERVE: sends CASH or GCASH (if online)
    async submitReservationAndUploads() {
      this.isSubmitting = true;
      try {
        const payment_method =
          this.paymentMode === "cash"
            ? "CASH"
            : String(this.payment.paymentMethod || "").trim().toUpperCase(); // "GCASH"

        const reservationPayload = {
          schedule_id: Number(this.reservationForm.schedule_id), // ✅ day1 schedule id (even for package)
          notes: this.reservationForm.notes || null,
          payment_method,
          requirements_mode: this.requirementsMode, // 'online' or 'walkin'
          fee_option_code: null,
        };

        // ✅ if GCASH, require paymentRef + proof submitted first (backend rule)
        if (payment_method === "GCASH") {
          reservationPayload.payment_ref = this.paymentRef || null;
        }

        const resCreate = await api.post("/student/reservations", reservationPayload);

        const reservationId =
          resCreate.data?.data?.reservation_id ||
          resCreate.data?.reservation_id ||
          resCreate.data?.data?.id;

        if (!reservationId) {
          throw new Error("Reservation created but reservation_id not returned by backend.");
        }

        if (this.requirementsMode === "online") {
          const fd = new FormData();
          for (const [rid, file] of Object.entries(this.uploads)) {
            fd.append("requirement_ids", String(rid));
            fd.append("files", file);
          }

          await api.post(`/student/reservations/${reservationId}/requirements`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        alert("✅ Reservation confirmed! Your slot is locked.");

        await this.fetchActiveReservation();
        this.resetAll();
      } catch (err) {
        console.error("submitReservationAndUploads error:", err.response?.data || err);
        alert(err.response?.data?.message || err.message || "❌ Failed. Please try again.");
      } finally {
        this.isSubmitting = false;
      }
    },

    resetAll() {
      this.activeTab = "courses";
      this.selectedCourse = null;

      this.selectedDate = null;
      this.availableSchedules = [];
      this.scheduleMap = {};

      this.reservationForm.course = "";
      this.reservationForm.schedule_id = "";
      this.reservationForm.notes = "";

      this.requirementsMode = "online";
      this.paymentMode = "online";
      this.uploads = {};
      this.payment.paymentMethod = "";
      this.payment.proofFile = null;

      this.paymentRef = "";
      this.qrphProofFile = null;
      this.qrphSubmitted = false;

      this.showGcashModal = false;
      this.gcashLoading = false;
      this.gcashError = "";

      this.fetchCourses();
    },
  },

  async mounted() {
    await this.fetchActiveReservation();
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
