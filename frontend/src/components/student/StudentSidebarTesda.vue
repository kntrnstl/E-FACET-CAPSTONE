<template>
  <aside class="w-64 bg-white shadow-md flex flex-col justify-between rounded-r-2xl h-screen overflow-y-auto fixed">
    <div>
      <!-- Logo -->
      <div class="flex items-center gap-2 p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <img src="/facet-logo.png" alt="FACET Logo" class="w-10 h-10">
        <div>
          <h1 class="font-bold text-blue-900 text-lg">E-FACET TESDA</h1>
          <p class="text-xs text-gray-500 -mt-1">Student Portal</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 space-y-1">
        <router-link to="/tesda-dashboard" :class="linkClass('TesdaDashboard')">
          <span class="ml-2">📊 Dashboard</span>
        </router-link>

        <router-link to="/tesda-enrollment" :class="linkClass('TesdaEnrollment')">
          <span class="ml-2">📝 Enrollment Application</span>
        </router-link>

        <router-link to="/tesda-requirements" :class="linkClass('TesdaRequirements')">
          <span class="ml-2">📎 Requirements Upload</span>
        </router-link>

        <router-link to="/tesda-schedule" :class="linkClass('TesdaSchedule')">
          <span class="ml-2">🗓️ Training Schedule</span>
        </router-link>

        <router-link to="/tesda-attendance" :class="linkClass('TesdaAttendance')">
          <span class="ml-2">✅ Attendance</span>
        </router-link>

        <router-link to="/tesda-materials" :class="linkClass('TesdaMaterials')">
          <span class="ml-2">📚 Learning Materials</span>
        </router-link>

        <router-link to="/tesda-assessment" :class="linkClass('TesdaAssessment')">
          <span class="ml-2">🧪 Assessment</span>
        </router-link>

        <router-link to="/tesda-certificate" :class="linkClass('TesdaCertificate')">
          <span class="ml-2">🎓 Certificates</span>
        </router-link>

        <router-link to="/tesda-messages" :class="linkClass('TesdaMessages')">
          <span class="ml-2">💬 Messages</span>
        </router-link>

        <router-link to="/tesda-settings" :class="linkClass('TesdaSettings')">
          <span class="ml-2">⚙️ Settings</span>
        </router-link>
      </nav>
    </div>

    <!-- Bottom user info + logout -->
    <div class="sticky bottom-0 bg-white">
      <div class="border-t border-gray-200 p-4">
        <button @click="logout" class="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition">
          🚪 Logout
        </button>
      </div>

      <div class="bg-blue-800 text-white p-4 flex items-center rounded-br-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white text-blue-800 flex items-center justify-center rounded-full text-lg font-bold">
            {{ userInitial }}
          </div>
          <div>
            <p class="text-sm font-semibold">{{ user.fullname || user.username || 'Student' }}</p>
            <p class="text-xs">{{ user.email || 'student@gmail.com' }}</p>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { useRouter } from "vue-router";

export default {
  name: "StudentSidebarTesda",
  setup() {
    const router = useRouter();
    return { router };
  },
  data() {
    return { user: {} };
  },
  computed: {
    userInitial() {
      if (this.user.fullname) return this.user.fullname.charAt(0).toUpperCase();
      if (this.user.username) return this.user.username.charAt(0).toUpperCase();
      return "S";
    },
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (userData) this.user = JSON.parse(userData);
  },
  methods: {
    linkClass(routeName) {
      return [
        "flex items-center px-5 py-2 rounded-r-full",
        this.$route.name === routeName
          ? "bg-blue-100 text-blue-700 font-medium"
          : "hover:bg-gray-200",
      ];
    },
    async logout() {
      try {
        const response = await fetch("/api/auth/logout", { credentials: "include" });
        const data = await response.json();
        if (data.status === "success") {
          localStorage.removeItem("user");
          this.router.push("/login");
        }
      } catch (err) {
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
aside::-webkit-scrollbar { width: 6px; }
aside::-webkit-scrollbar-track { background: transparent; }
aside::-webkit-scrollbar-thumb { background-color: #cbd5e0; border-radius: 3px; }

.router-link-exact-active {
  background-color: #dbeafe;
  color: #1d4ed8;
  font-weight: 500;
}
.router-link-active:hover:not(.router-link-exact-active) {
  background-color: #f3f4f6;
}
</style>