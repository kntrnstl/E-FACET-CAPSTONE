<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">Enrollment Application</h2>
    </template>

    <p class="text-gray-600 mb-4">
      Fill out your TESDA enrollment application.
    </p>

    <div class="bg-gray-50 p-4 rounded-lg">
      <p>📝 Enrollment form goes here</p>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from '../student/StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>