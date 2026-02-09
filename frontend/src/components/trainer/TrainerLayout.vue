<template>
  <div class="bg-gray-100 flex min-h-screen">
    <!-- Sidebar -->
    <TrainerSidebar :active-page="activePage" />

    <!-- Main Content -->
    <main class="flex-1 p-6 ml-64 overflow-y-auto min-h-screen bg-gray-100">
      <!-- Page Header -->
      <header class="flex justify-between items-center bg-blue-800 text-white px-6 py-3 rounded-t-xl mb-4">
        <div class="flex items-center w-full gap-4">
          <slot name="header-left"></slot>
        </div>
        <div class="w-10 h-10 bg-white text-blue-800 rounded-full flex items-center justify-center text-xl">
          👤
        </div>
      </header>

      <!-- Page Content -->
      <div class="bg-white rounded-b-xl shadow p-6">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script>
import TrainerSidebar from "./TrainerSidebar.vue";

export default {
  name: "TrainerLayout",
  components: { TrainerSidebar },
  props: {
    activePage: { type: String, default: "" },
  },

  async mounted() {
    await this.checkAuthTrainer();
  },

  methods: {
    async checkAuthTrainer() {
      try {
        const res = await fetch("/api/auth/check", { credentials: "include" });
        const data = await res.json();

        if (data.status !== "success" || !data.authenticated) {
          this.$router.push("/login");
          return;
        }

        // ✅ trainer only
        if (data.user.role !== "trainer") {
          if (data.user.role === "admin") return this.$router.push("/admin-dashboard");
          if (data.user.role === "instructor") return this.$router.push("/instructor-dashboard");

          const home = data.user.track === "tesda" ? "/tesda-dashboard" : "/student-dashboard";
          return this.$router.push(home);
        }

        // ✅ IMPORTANT: sync localStorage para pumasa rin router guard
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (e) {
        console.error("TrainerLayout auth check failed:", e);
        this.$router.push("/login");
      }
    },
  },
};
</script>



<style scoped>
main {
  max-height: 100vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

main::-webkit-scrollbar {
  width: 8px;
}

main::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
