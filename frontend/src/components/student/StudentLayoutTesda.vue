<template>
  <div class="bg-gray-100 flex min-h-screen">
    <!-- Sidebar -->
    <StudentSidebarTesda :active-page="activePage" />

    <!-- Main Content -->
    <main class="flex-1 p-6 ml-64 overflow-y-auto min-h-screen bg-gray-100">
      <!-- Page Header -->
      <header class="flex justify-between items-center bg-blue-800 text-white px-6 py-3 rounded-t-xl mb-4">
        <div class="flex items-center w-full gap-4">
          <slot name="header-left"></slot>
        </div>
        <div class="w-10 h-10 bg-white text-blue-800 rounded-full flex items-center justify-center text-xl">👤</div>
      </header>

      <!-- Page Content -->
      <div class="bg-white rounded-b-xl shadow p-6">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script>
import StudentSidebarTesda from "./StudentSidebarTesda.vue";

export default {
  name: "StudentLayoutTesda",
  components: { StudentSidebarTesda },
  props: {
    activePage: { type: String, default: "" },
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