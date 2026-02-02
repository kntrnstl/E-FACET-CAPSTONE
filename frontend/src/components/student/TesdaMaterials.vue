<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">Learning Materials</h2>
    </template>

    <ul class="space-y-2">
      <li>📄 Module 1</li>
      <li>📄 Module 2</li>
    </ul>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from '../student/StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>