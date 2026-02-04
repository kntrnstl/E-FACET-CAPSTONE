<template>
  <StudentLayoutTesda active-page="requirements">
    <!-- Header Slots -->
    <template #header-left>
      <h2 class="text-2xl font-bold text-white-800">Requirements Upload</h2>
    </template>
    
    <template #header-right>
      <div class="flex items-center gap-4">
        <div class="relative">
          <button class="p-2 hover:bg-blue-700 rounded-full transition-colors">
            <span class="text-xl">🔔</span>
          </button>
        </div>
        <div class="w-10 h-10 bg-white text-blue-800 rounded-full flex items-center justify-center text-xl font-bold">
          {{ getUserInitial() }}
        </div>
      </div>
    </template>

    <!-- Main Content -->
    <div>
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Document Requirements</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Requirements List Section -->
        <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
            Required Documents
          </h2>

          <!-- Pending Requirements -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-yellow-500">⏳</span>
              Pending Uploads
            </h3>
            <div class="space-y-4">
              <!-- Requirement Item -->
              <div class="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-semibold text-gray-800">Valid ID</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Government-issued ID (Passport, Driver's License, UMID, etc.)
                    </p>
                  </div>
                  <span class="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Required
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                  File types: PDF, JPG, PNG | Max size: 5MB
                </div>
              </div>

              <!-- Requirement Item -->
              <div class="border-2 border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-semibold text-gray-800">Birth Certificate</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      NSO/PSA authenticated birth certificate
                    </p>
                  </div>
                  <span class="text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Required
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                  File types: PDF, JPG, PNG | Max size: 5MB
                </div>
              </div>
            </div>
          </div>

          <!-- Submitted Requirements -->
          <div>
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span class="text-green-500">✓</span>
              Submitted Documents
            </h3>
            <div class="space-y-4">
              <!-- Submitted Item -->
              <div class="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h4 class="font-semibold text-gray-800">Application Form</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Completed TESDA application form
                    </p>
                  </div>
                  <span class="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                    Submitted
                  </span>
                </div>
                <div class="flex items-center justify-between mt-3">
                  <div class="text-sm text-gray-700">
                    <span class="font-medium">application_form.pdf</span>
                    <span class="text-gray-500 ml-2">(2.4 MB)</span>
                  </div>
                  <div class="flex gap-2">
                    <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View
                    </button>
                    <button class="text-red-600 hover:text-red-800 text-sm font-medium">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upload Section -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h2 class="bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg mb-6 inline-block">
            Upload Documents
          </h2>

          <!-- Upload Area -->
          <div class="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
            <div class="text-blue-600 text-4xl mb-4">📎</div>
            <h3 class="font-semibold text-gray-800 mb-2">Drop files here</h3>
            <p class="text-sm text-gray-600 mb-4">or click to browse</p>
            <p class="text-xs text-gray-500">Supports: PDF, JPG, PNG (Max 5MB each)</p>
          </div>

          <!-- Selected Files -->
          <div class="mt-6">
            <h4 class="font-semibold text-gray-700 mb-3">Selected Files (0)</h4>
            <!-- File list will appear here -->
            <div class="text-center text-gray-500 py-4 border border-dashed border-gray-300 rounded-lg">
              No files selected
            </div>
          </div>

          <!-- Submit Button -->
          <button class="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Submit All Documents
          </button>

          <!-- Upload Progress -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-2">Upload Progress</h4>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" style="width: 33%"></div>
            </div>
            <div class="flex justify-between text-xs text-gray-600 mt-2">
              <span>1 of 3 documents</span>
              <span>33% complete</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Instructions Section -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span class="text-blue-500">ℹ️</span>
          Upload Instructions
        </h3>
        <ul class="space-y-2 text-gray-700">
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            Ensure all documents are clear and readable
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            File names should indicate the document type (e.g., "valid_id_passport.jpg")
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            Uploaded documents will be reviewed within 3-5 business days
          </li>
          <li class="flex items-start gap-2">
            <div class="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
            You will receive a notification once documents are approved
          </li>
        </ul>
      </div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from './StudentLayoutTesda.vue'

export default {
  name: 'TesdaRequirementsUpload',
  components: {
    StudentLayoutTesda
  },
  data() {
    return {
      studentName: 'Student'
    }
  },
  mounted() {
    // Load user data
    this.loadUserData()
  },
  methods: {
    loadUserData() {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          const user = JSON.parse(userData)
          this.studentName = user.name || user.username || 'Student'
        } catch (e) {
          console.error('Error parsing user data:', e)
        }
      }
    },
    getUserInitial() {
      return this.studentName.charAt(0).toUpperCase()
    }
  }
}
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