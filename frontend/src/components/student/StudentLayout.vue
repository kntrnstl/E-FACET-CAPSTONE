<template>
  <div class="bg-gray-200 min-h-screen flex">
    <!-- Sidebar -->
    <StudentSidebar />
    
    <!-- Main Content -->
    <main class="flex-1 p-6 ml-64">
      <!-- Header Slot -->
      <div class="flex justify-between items-center bg-green-800 text-white px-6 py-3 rounded-t-xl mb-6">
        <!-- Left slot for search or title -->
        <div class="flex-1">
          <slot name="header-left">
            <!-- Default content if no slot provided -->
            <input 
              type="text" 
              placeholder="Search..." 
              class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
            >
          </slot>
        </div>
        
        <!-- Right slot for user avatar -->
        <div class="w-10 h-10 bg-white text-green-800 rounded-full flex items-center justify-center text-xl">
          <slot name="header-right">
            👤
          </slot>
        </div>
      </div>
      
      <!-- Main Content Slot -->
      <slot></slot>
    </main>
  </div>
</template>

<script>
import StudentSidebar from './StudentSidebar.vue'

export default {
  name: 'StudentLayout',
  components: {
    StudentSidebar
  }
}
</script>