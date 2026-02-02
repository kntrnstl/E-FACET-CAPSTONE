<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">Certificates</h2>
    </template>

    <div class="bg-green-100 p-4 rounded">
      🎓 TESDA Certificate (Available after completion)
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from '../student/StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>