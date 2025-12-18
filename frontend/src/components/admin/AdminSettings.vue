<template>
  <AdminLayout>
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search settings..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">⚙️ Settings</h2>
        <button 
          @click="saveAllSettings"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          💾 Save All Changes
        </button>
      </div>

      <!-- Settings Tabs -->
      <div class="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md transition-colors',
            activeTab === tab.id 
              ? 'bg-green-700 text-white' 
              : 'text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        <p class="mt-3 text-gray-600">Loading settings...</p>
      </div>

      <!-- Settings Content -->
      <div v-else class="space-y-6">
        <!-- Profile Settings -->
        <div v-if="activeTab === 'profile'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-green-800">👤 Profile Information</h3>
            <button 
              @click="saveProfile"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
            >
              Save Profile
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-green-800">
                {{ getInitials(profile.name) }}
              </div>
              <div>
                <button 
                  @click="uploadPhoto"
                  class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
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
                  v-model="profile.name"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  v-model="profile.email"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  v-model="profile.phone"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="+63 123 456 7890"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input 
                  type="text" 
                  v-model="profile.position"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Administrator"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- System Preferences -->
        <div v-if="activeTab === 'preferences'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-green-800">🎨 System Preferences</h3>
            <button 
              @click="savePreferences"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
            >
              Save Preferences
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select 
                v-model="preferences.theme"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dashboard Layout</label>
              <select 
                v-model="preferences.layout"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="compact">Compact</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notification Sound</label>
              <select 
                v-model="preferences.sound"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="default">Default</option>
                <option value="muted">Muted</option>
                <option value="soft">Soft Tone</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select 
                v-model="preferences.language"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
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
                  v-model="preferences.showAvatars"
                  class="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                >
                <span class="text-sm text-gray-700">Show user avatars</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="preferences.showNotificationsBadge"
                  class="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                >
                <span class="text-sm text-gray-700">Show notifications badge</span>
              </label>
              <label class="flex items-center">
                <input 
                  type="checkbox" 
                  v-model="preferences.autoRefresh"
                  class="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                >
                <span class="text-sm text-gray-700">Auto-refresh dashboard</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Security Settings -->
        <div v-if="activeTab === 'security'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-green-800">🔒 Account Security</h3>
            <button 
              @click="updatePassword"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
            >
              Update Password
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input 
                type="password" 
                v-model="security.currentPassword"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input 
                  type="password" 
                  v-model="security.newPassword"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                <div class="text-xs text-gray-500 mt-1">
                  Password strength: 
                  <span :class="passwordStrengthClass">{{ passwordStrength }}</span>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input 
                  type="password" 
                  v-model="security.confirmPassword"
                  class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                <div v-if="security.newPassword !== security.confirmPassword" class="text-xs text-red-600 mt-1">
                  Passwords do not match
                </div>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <h4 class="text-md font-medium text-gray-800 mb-3">Security Options</h4>
              <div class="space-y-3">
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="security.twoFactorAuth"
                    class="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">Two-factor authentication</span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="security.loginAlerts"
                    class="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">Email alerts for new logins</span>
                </label>
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="security.sessionTimeout"
                    class="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">Auto logout after 30 minutes of inactivity</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div v-if="activeTab === 'notifications'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-green-800">🔔 Notifications</h3>
            <button 
              @click="saveNotifications"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
            >
              Save Notifications
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-medium text-gray-800 mb-3">Email Notifications</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">New enrollment alerts</span>
                  <input 
                    type="checkbox" 
                    v-model="notifications.email.newEnrollments"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Course update notifications</span>
                  <input 
                    type="checkbox" 
                    v-model="notifications.email.courseUpdates"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">System logs summary</span>
                  <input 
                    type="checkbox" 
                    v-model="notifications.email.systemLogs"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Exam completion alerts</span>
                  <input 
                    type="checkbox" 
                    v-model="notifications.email.examCompletion"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                </label>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-medium text-gray-800 mb-3">In-App Notifications</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">New messages</span>
                  <input 
                    type="checkbox" 
                    v-model="notifications.inApp.newMessages"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Pending approvals</span>
                  <input 
                    type="checkbox" 
                    v-model="notifications.inApp.pendingApprovals"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">System announcements</span>
                  <input 
                    type="checkbox" 
                    v-model="notifications.inApp.announcements"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Management -->
        <div v-if="activeTab === 'data'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-green-800">💾 Data Management</h3>
            <button 
              @click="runBackup"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
            >
              Backup Now
            </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-medium text-gray-800 mb-3">Backup Settings</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Auto Backup</label>
                  <select 
                    v-model="dataManagement.autoBackup"
                    class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    v-model="dataManagement.compressBackup"
                    class="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  >
                  <span class="text-sm text-gray-700">Compress backup files</span>
                </label>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-medium text-gray-800 mb-3">Last Backup</h4>
              <div class="space-y-2">
                <p class="text-sm text-gray-600">Date: {{ formatDate(dataManagement.lastBackup) }}</p>
                <p class="text-sm text-gray-600">Size: {{ dataManagement.backupSize }}</p>
                <p class="text-sm text-gray-600">Status: 
                  <span :class="dataManagement.backupStatus === 'success' ? 'text-green-600' : 'text-yellow-600'">
                    {{ dataManagement.backupStatus }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button 
              @click="runBackup"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium flex items-center gap-2"
            >
              📤 Backup Now
            </button>
            <button 
              @click="restoreData"
              class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium flex items-center gap-2"
            >
              ♻️ Restore Data
            </button>
            <button 
              @click="clearCache"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center gap-2"
            >
              🗑️ Clear Cache
            </button>
            <button 
              @click="exportData"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              📁 Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import AdminLayout from './AdminLayout.vue'

export default {
  name: 'AdminSettings',
  components: {
    AdminLayout
  },
  setup() {
    // State
    const searchQuery = ref('')
    const loading = ref(true)
    const activeTab = ref('profile')
    
    // Tabs
    const tabs = [
      { id: 'profile', label: '👤 Profile' },
      { id: 'preferences', label: '🎨 Preferences' },
      { id: 'security', label: '🔒 Security' },
      { id: 'notifications', label: '🔔 Notifications' },
      { id: 'data', label: '💾 Data' }
    ]
    
    // Profile data
    const profile = reactive({
      name: 'Administrator',
      email: 'admin@efacet.com',
      phone: '+63 123 456 7890',
      position: 'System Administrator'
    })
    
    // Preferences data
    const preferences = reactive({
      theme: 'light',
      layout: 'compact',
      sound: 'default',
      language: 'en',
      showAvatars: true,
      showNotificationsBadge: true,
      autoRefresh: true
    })
    
    // Security data
    const security = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: true
    })
    
    // Notifications data
    const notifications = reactive({
      email: {
        newEnrollments: true,
        courseUpdates: true,
        systemLogs: false,
        examCompletion: true
      },
      inApp: {
        newMessages: true,
        pendingApprovals: true,
        announcements: true
      }
    })
    
    // Data management data
    const dataManagement = reactive({
      autoBackup: 'weekly',
      compressBackup: true,
      lastBackup: '2025-11-15T10:30:00',
      backupSize: '245 MB',
      backupStatus: 'success'
    })
    
    // Computed properties
    const passwordStrength = computed(() => {
      if (!security.newPassword) return 'None'
      const length = security.newPassword.length
      const hasUpper = /[A-Z]/.test(security.newPassword)
      const hasLower = /[a-z]/.test(security.newPassword)
      const hasNumber = /\d/.test(security.newPassword)
      const hasSpecial = /[^A-Za-z0-9]/.test(security.newPassword)
      
      let score = 0
      if (length >= 8) score++
      if (length >= 12) score++
      if (hasUpper && hasLower) score++
      if (hasNumber) score++
      if (hasSpecial) score++
      
      if (score >= 4) return 'Strong'
      if (score >= 3) return 'Good'
      if (score >= 2) return 'Fair'
      return 'Weak'
    })
    
    const passwordStrengthClass = computed(() => {
      switch(passwordStrength.value) {
        case 'Strong': return 'text-green-600 font-semibold'
        case 'Good': return 'text-blue-600 font-semibold'
        case 'Fair': return 'text-yellow-600 font-semibold'
        case 'Weak': return 'text-red-600 font-semibold'
        default: return 'text-gray-600'
      }
    })
    
    // Methods
    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    const saveProfile = () => {
      alert('Profile settings saved successfully')
      // In real app, this would call an API
    }
    
    const savePreferences = () => {
      alert('Preferences saved successfully')
      // In real app, this would call an API
    }
    
    const updatePassword = () => {
      if (!security.currentPassword) {
        alert('Please enter your current password')
        return
      }
      if (security.newPassword !== security.confirmPassword) {
        alert('New passwords do not match')
        return
      }
      if (security.newPassword.length < 8) {
        alert('Password must be at least 8 characters long')
        return
      }
      
      alert('Password updated successfully')
      security.currentPassword = ''
      security.newPassword = ''
      security.confirmPassword = ''
    }
    
    const saveNotifications = () => {
      alert('Notification settings saved successfully')
      // In real app, this would call an API
    }
    
    const saveAllSettings = () => {
      alert('All settings saved successfully')
      // In real app, this would call an API
    }
    
    const runBackup = () => {
      alert('Starting system backup...')
      // In real app, this would call an API
    }
    
    const restoreData = () => {
      if (confirm('Restore data from backup? This will overwrite current data.')) {
        alert('Data restoration started...')
        // In real app, this would call an API
      }
    }
    
    const clearCache = () => {
      if (confirm('Clear all cache data?')) {
        alert('Cache cleared successfully')
        // In real app, this would call an API
      }
    }
    
    const exportData = () => {
      alert('Exporting data...')
      // In real app, this would call an API
    }
    
    const uploadPhoto = () => {
      alert('Photo upload feature')
      // In real app, this would open a file picker
    }
    
    // Fetch initial data
    const fetchSettings = () => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    }
    
    onMounted(() => {
      fetchSettings()
    })
    
    return {
      // State
      searchQuery,
      loading,
      activeTab,
      tabs,
      profile,
      preferences,
      security,
      notifications,
      dataManagement,
      
      // Computed
      passwordStrength,
      passwordStrengthClass,
      
      // Methods
      getInitials,
      formatDate,
      saveProfile,
      savePreferences,
      updatePassword,
      saveNotifications,
      saveAllSettings,
      runBackup,
      restoreData,
      clearCache,
      exportData,
      uploadPhoto
    }
  }
}
</script>