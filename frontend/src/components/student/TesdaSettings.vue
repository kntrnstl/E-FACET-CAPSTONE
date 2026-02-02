<template>
  <StudentLayoutTesda>
    <template #header-left>
      <h2 class="text-lg font-bold">Settings</h2>
    </template>

    <div class="space-y-3">
      <button class="btn">Change Password</button>
      <button class="btn">Update Profile</button>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from '../student/StudentLayoutTesda.vue'
export default { components: { StudentLayoutTesda } }
</script>

<style scoped>
.btn {
  @apply bg-blue-600 text-white px-4 py-2 rounded;
}
</style>