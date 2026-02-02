<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">Requirements Upload</h2>
    </template>

    <ul class="list-disc ml-6 text-gray-700">
      <li>Valid ID</li>
      <li>Birth Certificate</li>
      <li>Application Form</li>
    </ul>

    <div class="mt-4 bg-gray-50 p-4 rounded">
      📎 Upload area
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from '../student/StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>