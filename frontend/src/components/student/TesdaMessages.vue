<template>
  <StudentLayoutTesda active-page="messages">
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search messages..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-blue-800">💬 Messages</h2>
        <button 
          class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm transition-colors"
        >
          + New Message
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Messages</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">
                <!-- Total count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">💬</span>
            </div>
          </div>
        </div>
        
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Unread</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">
                <!-- Unread count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">📩</span>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Trainers</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">
                <!-- Trainer messages count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">👨‍🏫</span>
            </div>
          </div>
        </div>
        
        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Admin</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">
                <!-- Admin messages count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">👨‍💼</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Type</label>
          <select 
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="trainer">Trainers</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select 
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div class="flex items-end gap-2">
          <button 
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Clear
          </button>
          <button 
            class="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="flex h-[600px]">
          <!-- Left: Conversations List -->
          <div class="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
            <div class="p-4 bg-blue-800 text-white">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Inbox</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs bg-blue-600 px-2 py-1 rounded-full">
                    <!-- Conversation count will go here --> conversations
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto">
              <!-- Conversations will be generated here -->
              
              <div class="p-8 text-center text-gray-500">
                <span class="text-3xl mb-2 block">📭</span>
                <p>No conversations found</p>
                <p class="text-sm mt-1">Start a new conversation</p>
              </div>
            </div>
          </div>

          <!-- Right: Chat Window -->
          <div class="w-2/3 flex flex-col">
            <!-- Chat Header -->
            <div class="p-4 bg-blue-800 text-white flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white text-blue-800 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  <!-- Initials will go here -->
                </div>
                <div>
                  <p class="font-medium">Trainer Name</p>
                  <p class="text-xs opacity-90">Electrical Installation Trainer</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  class="text-xs bg-blue-900 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Archive
                </button>
                <button 
                  class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <!-- Chat Messages -->
            <div class="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div class="space-y-4">
                <!-- Messages will be generated here -->
              </div>
            </div>

            <!-- No Conversation Selected -->
            <div class="flex-1 flex items-center justify-center bg-gray-50">
              <div class="text-center text-gray-500">
                <span class="text-4xl mb-4 block">💬</span>
                <p class="text-lg font-medium">Select a conversation</p>
                <p class="text-sm mt-1">Choose a conversation from the list to start messaging</p>
              </div>
            </div>

            <!-- Message Input -->
            <div class="border-t border-gray-200 p-4">
              <div class="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  class="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                <button 
                  class="px-4 py-3 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Contacts -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-blue-800">Recent Contacts</h3>
          <button 
            class="text-blue-700 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            View All →
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div 
            v-for="i in 6" 
            :key="i"
            class="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group"
          >
            <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-medium bg-blue-600">
              <!-- Initials will go here -->
            </div>
            <p class="text-xs font-medium text-gray-900 truncate">Contact Name</p>
            <p class="text-xs text-gray-500 truncate">Role</p>
          </div>
        </div>
      </div>
    </div>

    <!-- New Message Modal (Hidden by default - remove comment tags to use) -->
    <!-- 
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-blue-800">New Message</h3>
            <button 
              class="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="" disabled>Select recipient</option>
                <option value="1">Trainer Name (Electrical Installation)</option>
                <option value="2">Admin (TESDA Office)</option>
                <option value="3">Support Team</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                rows="4"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Type your message here..."
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              class="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm font-medium transition-colors"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
    -->
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from "./StudentLayoutTesda.vue";

export default {
  name: "TesdaStudentMessages",
  components: { StudentLayoutTesda },

  data() {
    return {};
  }
};
</script>

<style scoped>
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>