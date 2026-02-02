<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">TESDA Dashboard</h2>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card">📌 Application Status</div>
      <div class="card">🗓 Upcoming Training</div>
      <div class="card">🎓 Certificate Status</div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from './StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>

<style scoped>
.card {
  @apply bg-gray-100 p-4 rounded-lg shadow;
}
</style>