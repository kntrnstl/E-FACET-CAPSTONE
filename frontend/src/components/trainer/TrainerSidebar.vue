<template>
  <aside
    class="w-64 bg-white shadow-md flex flex-col justify-between rounded-r-2xl h-screen overflow-y-auto fixed"
  >
    <div>
      <!-- Logo -->
      <div
        class="flex items-center gap-2 p-4 border-b border-gray-200 sticky top-0 bg-white z-10"
      >
        <img src="/facet-logo.png" alt="FACET Logo" class="w-10 h-10" />
        <h1 class="font-bold text-blue-900 text-lg">E-FACET Trainer</h1>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 space-y-1">
        <router-link
          to="/trainer-dashboard"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerDashboard'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📊 Dashboard</span>
        </router-link>

        <router-link
          to="/trainer-courses"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerCourses'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">📚 My Courses</span>
        </router-link>

        <router-link
          to="/trainer-students"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerStudents'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">👨‍🎓 My Students</span>
        </router-link>

        <router-link
          to="/trainer-schedule"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerSchedule'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🗓️ Schedule</span>
        </router-link>

        <!-- ✅ Attendance (added) -->
        <router-link
          to="/trainer-attendance"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerAttendance'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">✅ Attendance</span>
        </router-link>

        <router-link
          to="/trainer-certificates"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerCertificates'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">🎓 Certificates</span>
        </router-link>

        <router-link
          to="/trainer-messages"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerMessages'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">💬 Messages</span>
        </router-link>

        <router-link
          to="/trainer-settings"
          :class="[
            'flex items-center px-5 py-2 rounded-r-full',
            $route.name === 'TrainerSettings'
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-200'
          ]"
        >
          <span class="ml-2">⚙️ Settings</span>
        </router-link>
      </nav>
    </div>

    <!-- Bottom User Info + Logout -->
    <div class="sticky bottom-0 bg-white">
      <div class="border-t border-gray-200 p-4">
        <button
          @click="logout"
          class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition"
        >
          🚪 Logout
        </button>
      </div>

      <div class="bg-blue-800 text-white p-4 flex items-center rounded-br-2xl">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-white text-blue-800 flex items-center justify-center rounded-full text-lg font-bold"
          >
            {{ userInitial }}
          </div>
          <div>
            <p class="text-sm font-semibold">{{ user.fullname || "Trainer" }}</p>
            <p class="text-xs">{{ user.email || "trainer@gmail.com" }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "TrainerSidebar",
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return {
      user: {},
    };
  },
  computed: {
    userInitial() {
      if (this.user.fullname) return this.user.fullname.charAt(0).toUpperCase();
      return "T";
    },
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (userData) this.user = JSON.parse(userData);
  },
  methods: {
    async logout() {
      try {
        const response = await fetch("/api/auth/logout", {
          credentials: "include",
        });
        await response.json();

        localStorage.removeItem("user");
        this.router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
        localStorage.removeItem("user");
        this.router.push("/login");
      }
    },
  },
};
</script>

<style scoped>
aside {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

aside::-webkit-scrollbar {
  width: 6px;
}

aside::-webkit-scrollbar-track {
  background: transparent;
}

aside::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

/* ✅ BLUE active state (same behavior as instructor) */
.router-link-exact-active {
  background-color: #dbeafe; /* blue-100 */
  color: #1d4ed8; /* blue-700-ish */
  font-weight: 500;
}

.router-link-active:hover:not(.router-link-exact-active) {
  background-color: #f3f4f6;
}
</style>
