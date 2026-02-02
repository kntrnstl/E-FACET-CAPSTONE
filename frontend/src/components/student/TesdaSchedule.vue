<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">Training Schedule</h2>
    </template>

    <div class="bg-gray-100 p-4 rounded">
      🗓 Training sessions will appear here
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from '../student/StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>