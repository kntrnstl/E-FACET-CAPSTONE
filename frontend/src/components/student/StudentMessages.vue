<template>
  <StudentLayout active-page="messages">
    <!-- Header -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search messages..." 
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
    </template>

    <div>
      <!-- Page Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold text-green-800">💬 Messages</h2>
        <button 
          @click="startNewMessage"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm transition-colors"
        >
          + New Message
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Messages</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">{{ messageStats.totalMessages }}</h3>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">💬</span>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Unread</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">{{ messageStats.unreadMessages }}</h3>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">📩</span>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Instructors</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ messageStats.instructorMessages }}</h3>
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
              <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ messageStats.adminMessages }}</h3>
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
            v-model="selectedType"
            class="w-48 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
          >
            <option value="">All Types</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select 
            v-model="selectedStatus"
            class="w-40 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div class="flex items-end gap-2">
          <button 
            @click="clearFilters"
            class="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            Clear
          </button>
          <button 
            @click="markAllAsRead"
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
            <div class="p-4 bg-green-800 text-white">
              <div class="flex justify-between items-center">
                <span class="font-semibold">Inbox</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs bg-green-600 px-2 py-1 rounded-full">
                    {{ filteredConversations.length }} conversations
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto">
              <div 
                v-for="conversation in filteredConversations" 
                :key="conversation.id"
                @click="selectConversation(conversation)"
                :class="[
                  'p-4 cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-100',
                  selectedConversation?.id === conversation.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                ]"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0"
                    :class="getUserBadgeClass(conversation.type)">
                    {{ getInitials(conversation.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <div class="truncate">
                        <p class="font-medium text-gray-900 truncate">{{ conversation.name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ conversation.role }}</p>
                      </div>
                      <div class="text-xs text-gray-500 shrink-0 ml-2">
                        {{ formatTime(conversation.lastMessageTime) }}
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1 truncate">
                      {{ conversation.lastMessage }}
                    </p>
                    <div class="flex items-center gap-2 mt-2">
                      <span 
                        v-if="conversation.unreadCount > 0"
                        class="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full shrink-0"
                      >
                        {{ conversation.unreadCount }} new
                      </span>
                      <span 
                        class="text-xs px-2 py-0.5 rounded-full shrink-0"
                        :class="getStatusBadgeClass(conversation.status)"
                      >
                        {{ conversation.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="filteredConversations.length === 0" class="p-8 text-center text-gray-500">
                <span class="text-3xl mb-2 block">📭</span>
                <p>No conversations found</p>
                <p class="text-sm mt-1">Start a new conversation</p>
              </div>
            </div>
          </div>

          <!-- Right: Chat Window -->
          <div class="w-2/3 flex flex-col">
            <!-- Chat Header -->
            <div v-if="selectedConversation" class="p-4 bg-green-800 text-white flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-white text-green-800 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {{ getInitials(selectedConversation.name) }}
                </div>
                <div>
                  <p class="font-medium">{{ selectedConversation.name }}</p>
                  <p class="text-xs opacity-90">{{ selectedConversation.role }}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="archiveConversation(selectedConversation)"
                  class="text-xs bg-green-900 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Archive
                </button>
                <button 
                  @click="deleteConversation(selectedConversation)"
                  class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <!-- Chat Messages -->
            <div v-if="selectedConversation" class="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div class="space-y-4">
                <div 
                  v-for="message in selectedConversation.messages" 
                  :key="message.id"
                  :class="[
                    'flex',
                    message.sender === 'student' ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div 
                    :class="[
                      'rounded-lg p-3 max-w-md',
                      message.sender === 'student' 
                        ? 'bg-green-600 text-white rounded-br-none' 
                        : message.sender === 'instructor'
                        ? 'bg-blue-100 border border-blue-200 text-gray-800 rounded-bl-none'
                        : 'bg-purple-100 border border-purple-200 text-gray-800 rounded-bl-none'
                    ]"
                  >
                    <p class="text-sm">{{ message.text }}</p>
                    <p class="text-xs mt-1 opacity-75">
                      {{ formatTime(message.timestamp) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- No Conversation Selected -->
            <div v-else class="flex-1 flex items-center justify-center bg-gray-50">
              <div class="text-center text-gray-500">
                <span class="text-4xl mb-4 block">💬</span>
                <p class="text-lg font-medium">Select a conversation</p>
                <p class="text-sm mt-1">Choose a conversation from the list to start messaging</p>
              </div>
            </div>

            <!-- Message Input -->
            <div v-if="selectedConversation" class="border-t border-gray-200 p-4">
              <div class="flex gap-2">
                <input 
                  type="text" 
                  v-model="newMessage"
                  @keyup.enter="sendMessage"
                  placeholder="Type your message..."
                  class="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                >
                <button 
                  @click="sendMessage"
                  :disabled="!newMessage.trim()"
                  class="px-4 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
          <h3 class="text-lg font-bold text-green-800">Recent Contacts</h3>
          <button 
            @click="viewAllContacts"
            class="text-green-700 hover:text-green-800 text-sm font-medium transition-colors"
          >
            View All →
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div 
            v-for="contact in recentContacts" 
            :key="contact.id"
            @click="startConversation(contact)"
            class="text-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors group"
          >
            <div class="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-sm font-medium"
                 :class="getUserBadgeClass(contact.type)">
              {{ getInitials(contact.name) }}
            </div>
            <p class="text-xs font-medium text-gray-900 truncate">{{ contact.name }}</p>
            <p class="text-xs text-gray-500 truncate">{{ contact.role }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- New Message Modal -->
    <div v-if="showNewMessageModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeNewMessageModal">
      <div class="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-bold text-green-800">New Message</h3>
            <button 
              @click="closeNewMessageModal"
              class="text-gray-400 hover:text-gray-600 text-xl transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
              <select 
                v-model="newMessageRecipient"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
              >
                <option value="" disabled>Select recipient</option>
                <option v-for="contact in allContacts" :key="contact.id" :value="contact.id">
                  {{ contact.name }} ({{ contact.role }})
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea 
                v-model="newMessageContent"
                rows="4"
                class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors"
                placeholder="Type your message here..."
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button 
              type="button"
              @click="closeNewMessageModal"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="sendNewMessage"
              :disabled="!newMessageRecipient || !newMessageContent.trim()"
              class="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentMessages',
  components: {
    StudentLayout
  },
  setup() {
    // State
    const searchQuery = ref('')
    const selectedType = ref('')
    const selectedStatus = ref('')
    const selectedConversation = ref(null)
    const newMessage = ref('')
    const showNewMessageModal = ref(false)
    const newMessageRecipient = ref('')
    const newMessageContent = ref('')
    
    // Stats
    const messageStats = ref({
      totalMessages: 28,
      unreadMessages: 3,
      instructorMessages: 18,
      adminMessages: 10
    })
    
    // Conversations data
    const conversations = ref([
      {
        id: 1,
        name: 'Instructor A',
        role: 'Driving Instructor',
        type: 'instructor',
        status: 'unread',
        lastMessage: 'See you in class tomorrow!',
        lastMessageTime: '2025-11-15T14:30:00',
        unreadCount: 1,
        messages: [
          { id: 1, text: 'Hello, are you done with your activity?', sender: 'instructor', timestamp: '2025-11-15T14:20:00' },
          { id: 2, text: 'Yes sir, I already uploaded it.', sender: 'student', timestamp: '2025-11-15T14:25:00' },
          { id: 3, text: 'Great! I\'ll check it later.', sender: 'instructor', timestamp: '2025-11-15T14:28:00' },
          { id: 4, text: 'See you in class tomorrow!', sender: 'instructor', timestamp: '2025-11-15T14:30:00' }
        ]
      },
      {
        id: 2,
        name: 'Instructor B',
        role: 'Traffic Rules Instructor',
        type: 'instructor',
        status: 'read',
        lastMessage: 'Upload your assignment.',
        lastMessageTime: '2025-11-14T10:15:00',
        unreadCount: 0,
        messages: [
          { id: 5, text: 'Don\'t forget to submit your assignment by Friday.', sender: 'instructor', timestamp: '2025-11-14T10:10:00' },
          { id: 6, text: 'Sure, I\'ll submit it today.', sender: 'student', timestamp: '2025-11-14T10:12:00' },
          { id: 7, text: 'Upload your assignment.', sender: 'instructor', timestamp: '2025-11-14T10:15:00' }
        ]
      },
      {
        id: 3,
        name: 'Admin',
        role: 'FACET Administration',
        type: 'admin',
        status: 'read',
        lastMessage: 'Please check your attendance records.',
        lastMessageTime: '2025-11-13T09:15:00',
        unreadCount: 0,
        messages: [
          { id: 8, text: 'Your enrollment has been confirmed.', sender: 'admin', timestamp: '2025-11-13T09:10:00' },
          { id: 9, text: 'Thank you! When will classes start?', sender: 'student', timestamp: '2025-11-13T09:12:00' },
          { id: 10, text: 'Classes start next Monday. Please check your attendance records.', sender: 'admin', timestamp: '2025-11-13T09:15:00' }
        ]
      },
      {
        id: 4,
        name: 'Support Team',
        role: 'Technical Support',
        type: 'support',
        status: 'archived',
        lastMessage: 'Your issue has been resolved.',
        lastMessageTime: '2025-11-10T16:45:00',
        unreadCount: 0,
        messages: [
          { id: 11, text: 'I\'m having trouble accessing the portal.', sender: 'student', timestamp: '2025-11-10T16:40:00' },
          { id: 12, text: 'We\'ll look into it right away.', sender: 'support', timestamp: '2025-11-10T16:42:00' },
          { id: 13, text: 'Your issue has been resolved.', sender: 'support', timestamp: '2025-11-10T16:45:00' }
        ]
      }
    ])
    
    // Recent contacts
    const recentContacts = ref([
      { id: 1, name: 'Instructor A', role: 'Driving Instructor', type: 'instructor' },
      { id: 2, name: 'Instructor B', role: 'Traffic Rules Instructor', type: 'instructor' },
      { id: 3, name: 'Admin', role: 'FACET Administration', type: 'admin' },
      { id: 4, name: 'Ms. Reyes', role: 'Safety Instructor', type: 'instructor' },
      { id: 5, name: 'Support Team', role: 'Technical Support', type: 'support' },
      { id: 6, name: 'Mr. Dela Cruz', role: 'Practical Instructor', type: 'instructor' }
    ])
    
    // All contacts (for new message modal)
    const allContacts = ref([
      ...recentContacts.value,
      { id: 7, name: 'Student Affairs', role: 'Student Services', type: 'admin' },
      { id: 8, name: 'Registrar', role: 'Registration Office', type: 'admin' }
    ])
    
    // Computed properties
    const filteredConversations = computed(() => {
      let result = [...conversations.value]
      
      // Apply search
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(conv => 
          conv.name.toLowerCase().includes(query) ||
          conv.role.toLowerCase().includes(query) ||
          conv.lastMessage.toLowerCase().includes(query)
        )
      }
      
      // Apply type filter
      if (selectedType.value) {
        result = result.filter(conv => conv.type === selectedType.value)
      }
      
      // Apply status filter
      if (selectedStatus.value) {
        result = result.filter(conv => conv.status === selectedStatus.value)
      }
      
      // Sort by last message time (newest first)
      result.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
      
      return result
    })
    
    // Methods
    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      } else if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    }
    
    const getUserBadgeClass = (type) => {
      switch(type) {
        case 'instructor': return 'bg-blue-600'
        case 'admin': return 'bg-purple-600'
        case 'support': return 'bg-green-600'
        default: return 'bg-gray-600'
      }
    }
    
    const getStatusBadgeClass = (status) => {
      switch(status) {
        case 'unread': return 'bg-green-100 text-green-800'
        case 'read': return 'bg-gray-100 text-gray-800'
        case 'archived': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    const clearFilters = () => {
      searchQuery.value = ''
      selectedType.value = ''
      selectedStatus.value = ''
    }
    
    const markAllAsRead = () => {
      conversations.value.forEach(conv => {
        conv.status = 'read'
        conv.unreadCount = 0
      })
      messageStats.value.unreadMessages = 0
    }
    
    const selectConversation = (conversation) => {
      selectedConversation.value = conversation
      // Mark as read when selected
      if (conversation.status === 'unread') {
        conversation.status = 'read'
        conversation.unreadCount = 0
        messageStats.value.unreadMessages = Math.max(0, messageStats.value.unreadMessages - 1)
      }
    }
    
    const sendMessage = () => {
      if (!newMessage.value.trim() || !selectedConversation.value) return
      
      const newMsg = {
        id: selectedConversation.value.messages.length + 1,
        text: newMessage.value,
        sender: 'student',
        timestamp: new Date().toISOString()
      }
      
      selectedConversation.value.messages.push(newMsg)
      selectedConversation.value.lastMessage = newMessage.value
      selectedConversation.value.lastMessageTime = newMsg.timestamp
      selectedConversation.value.unreadCount = 0
      
      // Update stats
      messageStats.value.totalMessages++
      
      // Auto-reply simulation (for demo purposes)
      setTimeout(() => {
        const replyMsg = {
          id: selectedConversation.value.messages.length + 1,
          text: getAutoReply(selectedConversation.value.name),
          sender: selectedConversation.value.type,
          timestamp: new Date(Date.now() + 5000).toISOString()
        }
        selectedConversation.value.messages.push(replyMsg)
        selectedConversation.value.lastMessage = replyMsg.text
        selectedConversation.value.lastMessageTime = replyMsg.timestamp
        selectedConversation.value.unreadCount++
        selectedConversation.value.status = 'unread'
        messageStats.value.unreadMessages++
      }, 2000)
      
      newMessage.value = ''
    }
    
    const getAutoReply = (name) => {
      const replies = [
        'Thank you for your message!',
        'I understand, thank you for letting me know.',
        'That sounds good, I will check on that.',
        'Thanks, I appreciate your update.',
        'Got it, thank you for the information.',
        'I will look into this and get back to you.',
        'Thank you for bringing this to my attention.'
      ]
      return replies[Math.floor(Math.random() * replies.length)]
    }
    
    const archiveConversation = (conversation) => {
      conversation.status = 'archived'
      if (selectedConversation.value?.id === conversation.id) {
        selectedConversation.value = null
      }
    }
    
    const deleteConversation = (conversation) => {
      if (confirm(`Delete conversation with ${conversation.name}?`)) {
        const index = conversations.value.findIndex(c => c.id === conversation.id)
        if (index !== -1) {
          conversations.value.splice(index, 1)
          messageStats.value.totalMessages--
          if (conversation.status === 'unread') {
            messageStats.value.unreadMessages = Math.max(0, messageStats.value.unreadMessages - 1)
          }
          if (selectedConversation.value?.id === conversation.id) {
            selectedConversation.value = null
          }
        }
      }
    }
    
    const startNewMessage = () => {
      showNewMessageModal.value = true
    }
    
    const closeNewMessageModal = () => {
      showNewMessageModal.value = false
      newMessageRecipient.value = ''
      newMessageContent.value = ''
    }
    
    const sendNewMessage = () => {
      if (!newMessageRecipient.value || !newMessageContent.value.trim()) return
      
      const contact = allContacts.value.find(c => c.id === newMessageRecipient.value)
      if (!contact) return
      
      // Create new conversation
      const newConversation = {
        id: conversations.value.length + 1,
        name: contact.name,
        role: contact.role,
        type: contact.type,
        status: 'unread',
        lastMessage: newMessageContent.value,
        lastMessageTime: new Date().toISOString(),
        unreadCount: 1,
        messages: [
          { 
            id: 1, 
            text: newMessageContent.value, 
            sender: 'student', 
            timestamp: new Date().toISOString() 
          }
        ]
      }
      
      conversations.value.unshift(newConversation)
      messageStats.value.totalMessages++
      messageStats.value.unreadMessages++
      
      closeNewMessageModal()
      selectConversation(newConversation)
    }
    
    const startConversation = (contact) => {
      // Check if conversation already exists
      const existingConv = conversations.value.find(conv => conv.name === contact.name)
      if (existingConv) {
        selectConversation(existingConv)
      } else {
        newMessageRecipient.value = contact.id
        newMessageContent.value = `Hello ${contact.name.split(' ')[0]}, `
        showNewMessageModal.value = true
      }
    }
    
    const viewAllContacts = () => {
      console.log('Viewing all contacts...')
      // In a real app, navigate to contacts page
    }
    
    onMounted(() => {
      // Load user data from localStorage
      const userData = localStorage.getItem('user')
      const currentUser = userData ? JSON.parse(userData) : null
      
      if (currentUser) {
        // Update student name in messages
        conversations.value.forEach(conv => {
          conv.messages.forEach(msg => {
            if (msg.sender === 'student') {
              // Student messages are from current user
            }
          })
        })
      }
      
      // Select first conversation by default
      if (conversations.value.length > 0) {
        selectConversation(conversations.value[0])
      }
    })
    
    return {
      // State
      searchQuery,
      selectedType,
      selectedStatus,
      selectedConversation,
      newMessage,
      showNewMessageModal,
      newMessageRecipient,
      newMessageContent,
      messageStats,
      conversations,
      recentContacts,
      allContacts,
      
      // Computed
      filteredConversations,
      
      // Methods
      getInitials,
      formatTime,
      getUserBadgeClass,
      getStatusBadgeClass,
      clearFilters,
      markAllAsRead,
      selectConversation,
      sendMessage,
      archiveConversation,
      deleteConversation,
      startNewMessage,
      closeNewMessageModal,
      sendNewMessage,
      startConversation,
      viewAllContacts
    }
  }
}
</script>

<style scoped>
/* Smooth transitions */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

/* Custom scrollbar */
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

/* Chat message styles */
.bg-green-600 {
  background-color: #059669;
}

.bg-blue-100 {
  background-color: #dbeafe;
}

.border-blue-200 {
  border-color: #bfdbfe;
}

.bg-purple-100 {
  background-color: #e9d5ff;
}

.border-purple-200 {
  border-color: #d8b4fe;
}

/* Modal backdrop */
.fixed.inset-0 {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>