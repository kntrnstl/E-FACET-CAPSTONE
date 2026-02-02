<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">Attendance</h2>
    </template>

    <table class="w-full border">
      <tr class="bg-gray-200">
        <th class="p-2">Date</th>
        <th>Status</th>
      </tr>
      <tr>
        <td class="p-2">2026-02-01</td>
        <td>Present</td>
      </tr>
    </table>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from '../student/StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>