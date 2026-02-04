<template>
  <StudentLayoutTesda active-page="settings">
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search settings..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-blue-800">⚙️ Settings</h2>
        <button 
          class="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm transition-colors"
        >
          💾 Save All Changes
        </button>
      </div>

      <!-- Settings Tabs -->
      <div class="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg">
        <button 
          v-for="tab in ['profile', 'preferences', 'security', 'notifications']" 
          :key="tab"
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-700 hover:bg-gray-200"
        >
          {{ tab === 'profile' ? '👤 Profile' : 
             tab === 'preferences' ? '🎨 Preferences' :
             tab === 'security' ? '🔒 Security' : '🔔 Notifications' }}
        </button>
      </div>

      <!-- Settings Content -->
      <div class="space-y-6">
        <!-- Profile Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-blue-800">👤 Profile Information</h3>
            <button 
              class="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm font-medium transition-colors"
            >
              Save Profile
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-800">
                <!-- Initials will go here -->
              </div>
              <div>
                <button 
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  Change Photo
                </button>
                <p class="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your full name"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your email"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="+63 123 456 7890"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input 
                  type="text" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your address"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-blue-800">🔒 Account Security</h3>
            <button 
              class="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm font-medium transition-colors"
            >
              Update Password
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input 
                type="password" 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter current password"
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter new password"
                >
                <div class="text-xs text-gray-500 mt-1">
                  Password strength: 
                  <span class="text-gray-600">None</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Confirm new password"
                >
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <h4 class="text-md font-medium text-gray-800 mb-3">Security Options</h4>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">Two-factor authentication</span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">Email alerts for new logins</span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">Auto logout after 30 minutes of inactivity</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- System Preferences -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-blue-800">🎨 System Preferences</h3>
            <button 
              class="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm font-medium transition-colors"
            >
              Save Preferences
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dashboard Layout</label>
              <select 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="compact">Compact</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notification Sound</label>
              <select 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="muted">Muted</option>
                <option value="soft">Soft Tone</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select 
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="fil">Filipino</option>
              </select>
            </div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-200">
            <h4 class="text-md font-medium text-gray-800 mb-3">Display Settings</h4>
            <div class="space-y-3">
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked
                >
                <span class="text-sm text-gray-700">Show user avatars</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked
                >
                <span class="text-sm text-gray-700">Show notifications badge</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  class="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked
                >
                <span class="text-sm text-gray-700">Auto-save assessment progress</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-blue-800">🔔 Notifications</h3>
            <button 
              class="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 text-sm font-medium transition-colors"
            >
              Save Notifications
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-medium text-gray-800 mb-3">Email Notifications</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Training update notifications</span>
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Assessment schedule alerts</span>
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Certificate release notifications</span>
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Training completion alerts</span>
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked
                  >
                </label>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-medium text-gray-800 mb-3">In-App Notifications</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">New messages from trainers</span>
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Training deadlines</span>
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">System announcements</span>
                  <input 
                    type="checkbox" 
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked
                  >
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from "./StudentLayoutTesda.vue";

export default {
  name: "TesdaStudentSettings",
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
</style>