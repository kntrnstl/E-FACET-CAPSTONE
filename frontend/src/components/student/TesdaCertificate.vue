<template>
  <StudentLayoutTesda active-page="certificate">
    <!-- Header Slot -->
    <template #header-left>
      <input 
        type="text" 
        placeholder="Search certificates..." 
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
    </template>
    
    <!-- Main Content -->
    <div>
      <h2 class="text-lg font-bold text-blue-800 mb-6">🎓 TESDA Certificates</h2>

      <!-- Certificate Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-blue-100 p-4 rounded-lg border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Certificates</p>
              <h3 class="text-2xl font-bold text-blue-800 mt-1">
                <!-- Total count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
              <span class="text-blue-700 text-xl">📜</span>
            </div>
          </div>
        </div>
        
        <div class="bg-green-100 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Issued</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">
                <!-- Issued count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
              <span class="text-green-700 text-xl">✅</span>
            </div>
          </div>
        </div>
        
        <div class="bg-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Processing</p>
              <h3 class="text-2xl font-bold text-yellow-800 mt-1">
                <!-- Processing count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center">
              <span class="text-yellow-700 text-xl">⏳</span>
            </div>
          </div>
        </div>
        
        <div class="bg-purple-100 p-4 rounded-lg border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Available</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">
                <!-- Available count will go here -->
              </h3>
            </div>
            <div class="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
              <span class="text-purple-700 text-xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Certificate Table -->
      <div class="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-md font-semibold text-blue-800">TESDA Certificates</h3>
          <div class="flex items-center gap-2">
            <select 
              class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
            <button 
              class="p-1 text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              title="Refresh"
            >
              ↻
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <p class="mt-2 text-gray-600">Loading certificates...</p>
        </div>

        <!-- Certificate Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-blue-800 text-white">
              <tr>
                <th class="py-3 px-4 text-left font-medium">Training Program</th>
                <th class="py-3 px-4 text-left font-medium">Certificate Type</th>
                <th class="py-3 px-4 text-left font-medium">Issue Date</th>
                <th class="py-3 px-4 text-left font-medium">Status</th>
                <th class="py-3 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Table rows will be generated here -->
              
              <tr>
                <td colspan="5" class="py-8 text-center text-gray-500">
                  <div class="text-gray-400">
                    <span class="text-3xl mb-2 block">📜</span>
                    <p class="text-gray-500">No certificates found</p>
                    <p class="text-sm text-gray-400 mt-1">Complete training programs to earn certificates</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Table Footer -->
        <div class="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing 0 of 0 certificates
          </div>
          <div class="flex items-center gap-2">
            <button 
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span class="px-2">Page 1 of 1</span>
            <button 
              class="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- Certificate Preview Modal (Hidden by default - remove comment tags to use) -->
      <!-- 
      <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div class="bg-white w-4/5 max-w-4xl p-6 rounded-xl shadow-lg">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-blue-800">TESDA Certificate Preview</h3>
            <button class="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div class="border-4 border-blue-500 p-8 bg-gradient-to-br from-white to-gray-50">
            <div class="text-center mb-6">
              <div class="flex justify-center mb-4">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-blue-700 text-2xl">🎖️</span>
                </div>
              </div>
              <h1 class="text-3xl font-bold text-gray-800 mb-2">TESDA CERTIFICATE</h1>
              <p class="text-gray-600">Technical Education and Skills Development Authority</p>
              <h2 class="text-4xl font-bold text-blue-800 my-4">NATIONAL CERTIFICATE</h2>
              <p class="text-gray-600">This is to certify that</p>
              <h3 class="text-3xl font-bold text-gray-800 my-3">STUDENT NAME</h3>
              <p class="text-gray-600">has successfully completed the requirements for</p>
              <h4 class="text-2xl font-bold text-gray-700 my-3">TRAINING PROGRAM NAME</h4>
              <p class="text-gray-600">and is hereby awarded this</p>
              <p class="text-lg font-semibold text-blue-700">NATIONAL CERTIFICATE LEVEL II</p>
              <p class="text-gray-600 mt-4">issued on</p>
              <p class="text-lg font-semibold text-gray-700">DATE HERE</p>
            </div>
            
            <div class="flex justify-between mt-8 pt-6 border-t border-gray-300">
              <div class="text-center">
                <div class="font-bold text-gray-700 mb-2">TESDA Representative</div>
                <div class="h-0.5 w-20 bg-gray-400 mx-auto mb-2"></div>
                <div class="text-sm">___________________</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-gray-700 mb-2">Center Administrator</div>
                <div class="h-0.5 w-20 bg-gray-400 mx-auto mb-2"></div>
                <div class="text-sm">___________________</div>
              </div>
              <div class="text-center">
                <div class="font-bold text-gray-700 mb-2">Official Seal</div>
                <div class="h-0.5 w-20 bg-gray-400 mx-auto mb-2"></div>
                <div class="text-sm">
                  <div class="w-12 h-12 bg-blue-800 text-white rounded-full flex items-center justify-center text-xs mx-auto">
                    TESDA
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end gap-3">
            <button 
              class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
            <button 
              class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Share
            </button>
          </div>
        </div>
      </div>
      -->

      <!-- Certificate Types Information -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-md font-semibold text-blue-800">📋 TESDA Certificate Types</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-700">🎓</span>
              </div>
              <h4 class="font-bold text-gray-800">National Certificate (NC)</h4>
            </div>
            <p class="text-sm text-gray-600">
              Certificate issued to individuals who have demonstrated competence in a particular qualification.
            </p>
          </div>

          <div class="border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span class="text-green-700">📜</span>
              </div>
              <h4 class="font-bold text-gray-800">Certificate of Competency (COC)</h4>
            </div>
            <p class="text-sm text-gray-600">
              Issued to individuals who have demonstrated competency in a unit or cluster of units of competency.
            </p>
          </div>

          <div class="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span class="text-purple-700">🏆</span>
              </div>
              <h4 class="font-bold text-gray-800">Training Certificate</h4>
            </div>
            <p class="text-sm text-gray-600">
              Certificate of participation or completion issued for training programs.
            </p>
          </div>
        </div>
      </div>

      <!-- Certificate Request Form -->
      <div class="mt-8 bg-white p-6 rounded-xl shadow border border-gray-200">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-md font-semibold text-blue-800">📝 Request Certificate</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Training Program</label>
            <select class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>Select training program</option>
              <!-- Training options will go here -->
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Certificate Type</label>
            <select class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="" disabled>Select certificate type</option>
              <option value="nc">National Certificate (NC)</option>
              <option value="coc">Certificate of Competency (COC)</option>
              <option value="training">Training Certificate</option>
            </select>
          </div>
        </div>

        <div class="mt-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Purpose of Request</label>
          <textarea 
            rows="3"
            class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Please state the purpose for requesting this certificate..."
          ></textarea>
        </div>

        <div class="mt-6">
          <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  </StudentLayoutTesda>
</template>

<script>
import StudentLayoutTesda from "./StudentLayoutTesda.vue";

export default {
  name: "TesdaStudentCertificate",
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