<template>
  <StudentLayout active-page="enrollment">
    <!-- Header Slot -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
        v-model="searchQuery"
      >
    </template>
    
    <!-- Main Content -->
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Enrollment & Requirements</h1>

      <!-- Tabs -->
      <div class="flex space-x-2 mb-6">
        <button 
          @click="activeTab = 'requirements'"
          :class="[
            'px-4 py-2 rounded-md font-medium transition-colors',
            activeTab === 'requirements' 
              ? 'bg-green-700 text-white' 
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
              ? 'bg-green-700 text-white' 
              : 'bg-gray-300 hover:bg-gray-400'
          ]"
        >
          📅 Enrollment Reservation
        </button>
      </div>

      <!-- REQUIREMENTS SECTION -->
      <section v-if="activeTab === 'requirements'" class="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">Available Courses</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- TDC Card -->
          <div class="border-2 border-green-700 rounded-xl p-6 hover:shadow-lg transition-shadow self-start">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-green-800 mb-2">Theoretical Driving Course (TDC)</h3>
                <p class="text-gray-700">A 15-hour classroom session about road safety and basic driving principles.</p>
              </div>
              <span class="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">Beginner</span>
            </div>
            
            <!-- Requirements Toggle Button -->
            <button 
              @click="showTDCRequirements = !showTDCRequirements"
              class="w-full flex items-center justify-between text-green-700 font-medium hover:text-green-800 transition-colors mb-3 px-3 py-2 bg-green-50 rounded-lg hover:bg-green-100"
            >
              <div class="flex items-center gap-2">
                <span>📋</span>
                <span>{{ showTDCRequirements ? 'Hide Requirements' : 'View Requirements' }}</span>
              </div>
              <span class="text-lg transform transition-transform duration-300" :class="{ 'rotate-180': showTDCRequirements }">
                ▼
              </span>
            </button>
            
            <!-- Requirements List - Smooth Expand/Collapse -->
            <div class="overflow-hidden transition-all duration-300 ease-in-out"
                :style="{ 
                  maxHeight: showTDCRequirements ? '200px' : '0px', 
                  marginTop: showTDCRequirements ? '0.75rem' : '0',
                  paddingTop: showTDCRequirements ? '0.75rem' : '0',
                  borderTopWidth: showTDCRequirements ? '1px' : '0'
                }">
              <div v-if="showTDCRequirements">
                <h4 class="font-semibold text-gray-800 mb-2">Requirements:</h4>
                <ul class="space-y-1.5 text-sm text-gray-700">
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Photocopy of valid ID (Passport, PRC, etc.)
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    2 pieces 1x1 ID picture (white background)
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Completed application form
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Student permit application fee
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Course Details -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Duration</p>
                <p class="font-semibold text-gray-800">15 Hours</p>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Course Fee</p>
                <p class="font-semibold text-green-700">₱2,000</p>
              </div>
            </div>
            
            <!-- Action Button -->
            <button 
              @click="enrollCourse('tdc')"
              class="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Enroll in TDC
            </button>
          </div>

          <!-- PDC Card -->
          <div class="border-2 border-green-700 rounded-xl p-6 hover:shadow-lg transition-shadow self-start">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-green-800 mb-2">Practical Driving Course (PDC)</h3>
                <p class="text-gray-700">Hands-on training for actual driving, parking, and road safety.</p>
              </div>
              <span class="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">Intermediate</span>
            </div>
            
            <!-- Requirements Toggle Button -->
            <button 
              @click="showPDCRequirements = !showPDCRequirements"
              class="w-full flex items-center justify-between text-green-700 font-medium hover:text-green-800 transition-colors mb-3 px-3 py-2 bg-green-50 rounded-lg hover:bg-green-100"
            >
              <div class="flex items-center gap-2">
                <span>📋</span>
                <span>{{ showPDCRequirements ? 'Hide Requirements' : 'View Requirements' }}</span>
              </div>
              <span class="text-lg transform transition-transform duration-300" :class="{ 'rotate-180': showPDCRequirements }">
                ▼
              </span>
            </button>
            
            <!-- Requirements List - Smooth Expand/Collapse -->
            <div class="overflow-hidden transition-all duration-300 ease-in-out"
                :style="{ 
                  maxHeight: showPDCRequirements ? '200px' : '0px', 
                  marginTop: showPDCRequirements ? '0.75rem' : '0',
                  paddingTop: showPDCRequirements ? '0.75rem' : '0',
                  borderTopWidth: showPDCRequirements ? '1px' : '0'
                }">
              <div v-if="showPDCRequirements">
                <h4 class="font-semibold text-gray-800 mb-2">Requirements:</h4>
                <ul class="space-y-1.5 text-sm text-gray-700">
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Valid Student Permit
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    Medical Certificate (from LTO-accredited clinic)
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    2 pieces 2x2 ID picture (white background)
                  </li>
                  <li class="flex items-start gap-2">
                    <div class="w-2 h-2 bg-green-600 rounded-full mt-1.5 flex-shrink-0"></div>
                    TDC Certificate of Completion
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Course Details -->
            <div class="grid grid-cols-2 gap-4 mt-4">
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Duration</p>
                <p class="font-semibold text-gray-800">10 Hours</p>
              </div>
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-sm text-gray-600">Course Fee</p>
                <p class="font-semibold text-green-700">₱4,500</p>
              </div>
            </div>
            
            <!-- Action Button -->
            <button 
              @click="enrollCourse('pdc')"
              class="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Enroll in PDC
            </button>
          </div>
        </div>
      </section>

      <!-- RESERVATION SECTION -->
      <section v-if="activeTab === 'reservation'" class="bg-white p-6 rounded-xl shadow border border-gray-200">
        <h2 class="bg-green-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">Reserve a Slot</h2>

        <!-- Calendar Section -->
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
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-2">
            <!-- Days Header -->
            <div 
              v-for="day in daysOfWeek" 
              :key="day"
              class="text-center font-medium text-gray-700 py-2"
            >
              {{ day }}
            </div>
            
            <!-- Calendar Days -->
            <div 
              v-for="day in calendarDays" 
              :key="day.date"
              :class="[
                'p-3 text-center rounded-lg border transition-all cursor-pointer',
                day.isCurrentMonth 
                  ? day.available 
                    ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                    : day.available === false && day.slots === 0
                      ? 'border-red-200 bg-red-50 hover:bg-red-100'
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  : 'border-gray-200 bg-gray-50 text-gray-400',
                day.isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''
              ]"
              @click="selectDate(day)"
            >
              <div class="font-medium">{{ day.day }}</div>
              <div v-if="day.isCurrentMonth && day.available && day.slots > 0" class="text-xs mt-1 text-green-700">
                {{ day.slots }} slot{{ day.slots !== 1 ? 's' : '' }}
              </div>
              <div v-else-if="day.isCurrentMonth && day.available === false && day.slots === 0" class="text-xs mt-1 text-red-600">
                Full
              </div>
              <div v-else-if="day.isCurrentMonth && day.available === null" class="text-xs mt-1 text-gray-500">
                -
              </div>
            </div>
          </div>
          
          <!-- Calendar Legend -->
          <div class="flex justify-center gap-4 mt-6 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
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

        <!-- Reservation Form -->
        <form @submit.prevent="submitReservation" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Course Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select 
                v-model="reservationForm.course"
                class="w-full border-2 border-green-700 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-700 transition-colors"
                required
              >
                <option value="" disabled>Select a course</option>
                <option value="tdc">Theoretical Driving Course (TDC)</option>
                <option value="pdc">Practical Driving Course (PDC)</option>
              </select>
            </div>

            <!-- Selected Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Selected Date
              </label>
              <div class="border-2 border-green-700 rounded-lg p-3 bg-green-50">
                <div class="font-medium text-green-800">
                  {{ selectedDate ? formatSelectedDate(selectedDate) : 'No date selected' }}
                </div>
                <div v-if="selectedDate" class="text-sm text-green-600 mt-1">
                  {{ selectedDate.available ? selectedDate.slots + ' slot(s) available' : 'No slots available' }}
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select 
                v-model="reservationForm.paymentMethod"
                class="w-full border-2 border-green-700 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-700 transition-colors"
                required
              >
                <option value="" disabled>Select payment method</option>
                <option value="gcash">GCash</option>
                <option value="bank">Bank Transfer</option>
                <option value="cash">Cash On-site</option>
              </select>
            </div>

            <!-- Time Slot -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <select 
                v-model="reservationForm.timeSlot"
                class="w-full border-2 border-green-700 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-700 transition-colors"
                required
              >
                <option value="" disabled>Select time slot</option>
                <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (1:00 PM - 5:00 PM)</option>
                <option value="evening">Evening (6:00 PM - 9:00 PM)</option>
              </select>
            </div>
          </div>

          <!-- Additional Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea 
              v-model="reservationForm.notes"
              rows="3"
              placeholder="Any special requests or notes..."
              class="w-full border-2 border-green-700 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-700 transition-colors"
            ></textarea>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <button 
              type="submit"
              :disabled="!canSubmitReservation"
              :class="[
                'w-full py-3 rounded-lg font-medium transition-colors',
                canSubmitReservation
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
            >
              {{ isSubmitting ? 'Processing...' : 'Reserve Slot' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </StudentLayout>
</template>

<script>
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentEnroll',
  components: {
    StudentLayout
  },
  data() {
    return {
      searchQuery: '',
      activeTab: 'requirements',
      showTDCRequirements: false,
      showPDCRequirements: false,
      currentDate: new Date(),
      selectedDate: null,
      isSubmitting: false,
      
      // Reservation form
      reservationForm: {
        course: '',
        paymentMethod: '',
        timeSlot: '',
        notes: ''
      },
      
      // Days of week
      daysOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },
  computed: {
    // Get current month and year
    currentMonth() {
      return this.currentDate.toLocaleString('default', { month: 'long' })
    },
    
    currentYear() {
      return this.currentDate.getFullYear()
    },
    
    // Generate calendar days with varied availability
    calendarDays() {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      // First day of the month
      const firstDay = new Date(year, month, 1)
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0)
      // Days in month
      const daysInMonth = lastDay.getDate()
      // Starting day (0 = Sunday, 1 = Monday, etc.)
      const startDay = firstDay.getDay()
      
      const days = []
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startDay; i++) {
        const date = new Date(year, month, -i)
        days.unshift({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          isCurrentMonth: false,
          available: false,
          slots: 0
        })
      }
      
      // Add days of the current month with varied availability
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateString = date.toISOString().split('T')[0]
        
        // Generate random availability for demonstration
        // In real app, this would come from API
        const dayOfWeek = date.getDay()
        let available = null
        let slots = 0
        
        // Make some days available, some full, some not available
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Weekends: 50% chance available, 30% full, 20% not available
          const random = Math.random()
          if (random < 0.5) {
            available = true
            slots = Math.floor(Math.random() * 4) + 1 // 1-4 slots
          } else if (random < 0.8) {
            available = false
            slots = 0
          } else {
            available = null // Not available for booking
          }
        } else {
          // Weekdays: 70% chance available, 20% full, 10% not available
          const random = Math.random()
          if (random < 0.7) {
            available = true
            slots = Math.floor(Math.random() * 6) + 2 // 2-7 slots
          } else if (random < 0.9) {
            available = false
            slots = 0
          } else {
            available = null // Not available for booking
          }
        }
        
        days.push({
          date: dateString,
          day: day,
          isCurrentMonth: true,
          available: available,
          slots: slots,
          isSelected: this.selectedDate && this.selectedDate.date === dateString
        })
      }
      
      // Add empty cells for days after the last day of the month
      const totalCells = 42 // 6 weeks * 7 days
      const remainingCells = totalCells - days.length
      
      for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(year, month + 1, i)
        days.push({
          date: date.toISOString().split('T')[0],
          day: date.getDate(),
          isCurrentMonth: false,
          available: false,
          slots: 0
        })
      }
      
      return days
    },
    
    // Check if reservation can be submitted
    canSubmitReservation() {
      return (
        this.reservationForm.course &&
        this.reservationForm.paymentMethod &&
        this.reservationForm.timeSlot &&
        this.selectedDate &&
        this.selectedDate.available === true && // Must be explicitly true
        this.selectedDate.slots > 0 &&
        !this.isSubmitting
      )
    }
  },
  methods: {
    // Enroll in course
    enrollCourse(course) {
      if (confirm(`Are you sure you want to enroll in ${course.toUpperCase()}?`)) {
        console.log(`Enrolling in ${course}`)
        // Here you would make API call to enroll
        this.activeTab = 'reservation'
      }
    },
    
    // Calendar navigation
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
      this.selectedDate = null
    },
    
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
      this.selectedDate = null
    },
    
    // Select date from calendar
    selectDate(day) {
      if (day.isCurrentMonth) {
        this.selectedDate = day
      }
    },
    
    // Format selected date for display
    formatSelectedDate(date) {
      const d = new Date(date.date)
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    
    // Submit reservation
    async submitReservation() {
      if (!this.canSubmitReservation) return
      
      this.isSubmitting = true
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        console.log('Reservation submitted:', {
          ...this.reservationForm,
          selectedDate: this.selectedDate
        })
        
        // Show success message
        alert('✅ Reservation successful! You will receive a confirmation email shortly.')
        
        // Reset form
        this.reservationForm = {
          course: '',
          paymentMethod: '',
          timeSlot: '',
          notes: ''
        }
        this.selectedDate = null
        
      } catch (error) {
        console.error('Reservation failed:', error)
        alert('❌ Reservation failed. Please try again.')
      } finally {
        this.isSubmitting = false
      }
    }
  },
  mounted() {
    // Set today's date as default selected date if available
    const today = new Date()
    const todayString = today.toISOString().split('T')[0]
    
    // Find today in calendarDays
    const todayInCalendar = this.calendarDays.find(day => day.date === todayString)
    if (todayInCalendar && todayInCalendar.available === true && todayInCalendar.slots > 0) {
      this.selectedDate = todayInCalendar
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
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

/* Custom scrollbar */
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