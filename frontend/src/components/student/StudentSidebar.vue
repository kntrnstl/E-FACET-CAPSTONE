<template>
  <aside class="w-64 bg-white shadow-md flex flex-col justify-between rounded-r-2xl h-screen fixed">
    <div>
      <!-- Logo -->
      <div class="flex items-center gap-2 p-4 border-b border-gray-300 sticky top-0 bg-white z-10">
        <img src="/facet-logo.png" alt="FACET Logo" class="w-10 h-10">
        <h1 class="font-bold text-green-800 text-lg">E-FACET</h1>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 space-y-1">
        <router-link 
          to="/student-dashboard"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-dashboard' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📊 Dashboard</span>
        </router-link>
        
        <router-link 
          to="/student-enroll"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-enroll' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📝 Enrollment</span>
        </router-link>
        
        <router-link 
          to="/student-course"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-course' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📚 My Course</span>
        </router-link>
        
        <router-link 
          to="/student-schedule"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-schedule' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🗓️ Schedule</span>
        </router-link>
        
        <router-link 
          to="/student-attendance"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-attendance' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">✅ Attendance</span>
        </router-link>
        
        <router-link 
          to="/student-quiz"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-quiz' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🧠 Mock Exam</span>
        </router-link>
        
        <router-link 
          to="/student-certificate"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-certificate' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🎓 Certificate</span>
        </router-link>
        
        <router-link 
          to="/student-messages"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-messages' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">💬 Messages</span>
        </router-link>
        
        <router-link 
          to="/student-settings"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.path === '/student-settings' ? 'bg-green-100 text-green-700 font-medium' : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">⚙️ Settings</span>
        </router-link>
      </nav>
    </div>

    <!-- Bottom User Info + Logout -->
    <div>
      <div class="border-t border-gray-200 p-4">
        <button 
          @click="logout"
          class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
        >
          🚪 Logout
        </button>
      </div>

      <div class="bg-green-800 text-white p-4 flex items-center rounded-br-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white text-green-800 flex items-center justify-center rounded-full text-lg font-bold">
            {{ userInitial }}
          </div>
          <div>
            <p class="text-sm font-semibold">{{ userName }}</p>
            <p class="text-xs">{{ userEmail }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'StudentSidebar',
  setup() {
    const router = useRouter()
    const userName = ref('John Doe')
    const userEmail = ref('johndoe@gmail.com')
    const userInitial = ref('J')
    
    const logout = () => {
      // Clear student data from localStorage
      localStorage.removeItem('student')
      localStorage.removeItem('token')
      
      // Redirect to login page
      router.push('/login')
    }
    
    onMounted(() => {
      // Load student data from localStorage
      const studentData = localStorage.getItem('student')
      if (studentData) {
        const student = JSON.parse(studentData)
        userName.value = student.fullname || 'John Doe'
        userEmail.value = student.email || 'johndoe@gmail.com'
        userInitial.value = userName.value.charAt(0).toUpperCase()
      }
    })
    
    return {
      userName,
      userEmail,
      userInitial,
      logout
    }
  }
}
</script>

<style scoped>
.router-link-exact-active {
  background-color: #d1fae5;
  color: #047857;
  font-weight: 500;
}

.router-link-active:hover:not(.router-link-exact-active) {
  background-color: #f3f4f6;
}
</style>