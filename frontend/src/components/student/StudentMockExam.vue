<template>
  <StudentLayout active-page="student-quiz">
    <!-- Header Content Slot -->
    <template #header-left>
      <div class="flex-1">
        <h1 class="text-2xl font-bold">🧠 Quizzes & Mock Exams</h1>
      </div>
      <div class="flex items-center gap-3">
        <select 
          v-model="currentLanguage" 
          @change="updateUserLanguage"
          class="bg-white text-green-800 px-3 py-1 rounded border border-green-600"
        >
          <option value="english">🇺🇸 English</option>
          <option value="tagalog">🇵🇭 Tagalog</option>
        </select>
        <button @click="showTutorialModal = true" class="bg-white text-green-800 px-3 py-1 rounded">❓ Tutorial</button>
      </div>
    </template>

    <!-- Main Content -->
    <div class="space-y-6">
      <!-- Welcome Message for First-Time Users -->
      <section v-if="!hasTakenExams" class="bg-white rounded-xl shadow p-6 mb-6 border border-green-200">
        <h2 class="text-lg font-bold text-green-800 mb-2">Welcome to Mock Exams!</h2>
        <p class="text-gray-600 mb-4">It looks like this is your first time here. To get started, take our initial assessment exam to identify your strengths and areas for improvement.</p>
        <div class="flex gap-4">
          <button 
            @click="startInitialExam" 
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            :disabled="loading"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Start Initial Assessment</span>
          </button>
          <div class="flex items-center gap-2">
            <span class="text-gray-600">Language:</span>
            <select 
              v-model="currentLanguage" 
              class="border border-gray-300 rounded px-2 py-1"
              @change="updateUserLanguage"
            >
              <option value="english">English</option>
              <option value="tagalog">Tagalog</option>
            </select>
          </div>
        </div>
      </section>

      <!-- AI Recommendation Section -->
      <section v-if="hasTakenExams && weaknessAnalysis.length > 0" class="bg-white rounded-xl shadow p-6 mb-6 border border-green-200">
        <h2 class="text-lg font-bold text-green-800 mb-4">📊 AI-Powered Performance Analysis</h2>
        <p class="text-gray-600 mb-4">Based on your performance, our AI has identified areas where you need more practice:</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <!-- Weakness Analysis -->
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="font-bold text-gray-700 mb-2">Performance Analysis</h3>
            <div class="space-y-3">
              <div v-for="item in weaknessAnalysis" :key="item.category" class="mb-3">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium">{{ item.category }}</span>
                  <span class="text-sm font-medium">{{ item.score }}%</span>
                </div>
                <div class="progress-bar bg-gray-200">
                  <div 
                    class="progress-fill" 
                    :class="getScoreColorClass(item.score)"
                    :style="{ width: item.score + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recommended Exams -->
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 class="font-bold text-green-800 mb-2">AI Recommendations</h3>
            <ul class="space-y-2 mb-4">
              <li 
                v-for="recommendation in aiRecommendations" 
                :key="recommendation.id"
                class="flex items-center py-1"
              >
                <span class="text-red-600 mr-2">•</span>
                <span class="text-sm">{{ recommendation.title }}</span>
              </li>
            </ul>
            <button 
              @click="startRecommendedExam" 
              class="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition w-full"
              :disabled="loading"
            >
              <span v-if="loading">Loading...</span>
              <span v-else>Start AI-Recommended Practice</span>
            </button>
          </div>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 class="font-bold text-blue-800 mb-2">AI Analysis Summary</h3>
          <p class="text-sm text-gray-700">
            {{ aiSummary }}
          </p>
        </div>
      </section>

      <!-- Quizzes Table -->
      <section class="bg-white rounded-xl shadow p-6 mb-6 border border-green-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-green-800">Available Quizzes</h2>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Search quizzes..." 
            class="w-1/3 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
        </div>
        <div class="overflow-hidden rounded-lg border border-green-700">
          <table class="w-full border-collapse text-sm text-left">
            <thead class="bg-green-700 text-white">
              <tr>
                <th class="py-3 px-4 border-r border-green-600">Quiz Title</th>
                <th class="py-3 px-4 border-r border-green-600">Course</th>
                <th class="py-3 px-4 border-r border-green-600">Status</th>
                <th class="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="quiz in filteredQuizzes" 
                :key="quiz.id"
                class="bg-white hover:bg-gray-50"
              >
                <td class="py-3 px-4 border-t border-green-700">{{ quiz.title }}</td>
                <td class="py-3 px-4 border-t border-green-700">{{ quiz.course_name || 'General' }}</td>
                <td class="py-3 px-4 border-t border-green-700 font-semibold" :class="getStatusClass(quiz.id)">
                  {{ getExamStatus(quiz.id) }}
                </td>
                <td class="py-3 px-4 border-t border-green-700">
                  <button 
                    @click="takeExam(quiz.id)"
                    class="text-white text-sm px-4 py-2 rounded transition"
                    :class="getButtonClass(quiz.id)"
                    :disabled="loading"
                  >
                    {{ getButtonText(quiz.id) }}
                  </button>
                </td>
              </tr>
              <tr v-if="availableQuizzes.length === 0 && !loading">
                <td colspan="4" class="py-4 px-4 border-t border-green-700 text-center text-gray-500">
                  No quizzes available at the moment.
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="4" class="py-4 px-4 border-t border-green-700 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Quiz Results Summary -->
      <section class="bg-white rounded-xl shadow p-6 border border-green-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-green-800">Recent Quiz Results</h2>
          <div class="text-sm text-gray-600">
            Showing {{ Math.min(examResults.length, 10) }} of {{ examResults.length }} results
          </div>
        </div>
        <div class="overflow-hidden rounded-lg border border-green-700">
          <table class="w-full border-collapse text-sm text-left">
            <thead class="bg-green-700 text-white">
              <tr>
                <th class="py-3 px-4 border-r border-green-600">Quiz Title</th>
                <th class="py-3 px-4 border-r border-green-600">Date Taken</th>
                <th class="py-3 px-4 border-r border-green-600">Score</th>
                <th class="py-3 px-4 border-r border-green-600">Remarks</th>
                <th class="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="result in filteredResults" 
                :key="result.id"
                class="bg-white hover:bg-gray-50"
              >
                <td class="py-3 px-4 border-t border-green-700">{{ result.exam_title }}</td>
                <td class="py-3 px-4 border-t border-green-700">{{ formatDate(result.completed_at) }}</td>
                <td class="py-3 px-4 border-t border-green-700 font-semibold" :class="getScoreColorClass(result.score)">
                  {{ result.score }}%
                </td>
                <td class="py-3 px-4 border-t border-green-700">{{ getRemarks(result.score) }}</td>
                <td class="py-3 px-4 border-t border-green-700">
                  <button 
                    @click="reviewExam(result)" 
                    class="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
              <tr v-if="examResults.length === 0 && !loading">
                <td colspan="5" class="py-4 px-4 border-t border-green-700 text-center text-gray-500">
                  No exam results yet. Take your first exam to see results here.
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="5" class="py-4 px-4 border-t border-green-700 text-center">
                  <div class="flex justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- Modals -->
    <!-- Tutorial Modal -->
    <div v-if="showTutorialModal" class="fixed inset-0 flex items-center justify-center backdrop z-50" @click.self="showTutorialModal = false">
      <div class="bg-white w-3/4 max-w-3xl p-6 rounded-xl shadow-lg">
        <h3 class="text-xl font-bold mb-3">How this prototype works (quick tutorial)</h3>
        <ol class="list-decimal pl-5 space-y-2 text-sm text-gray-800">
          <li>Click <strong>Start Initial Assessment</strong> to take your first exam and establish your baseline performance.</li>
          <li>After completing the exam, our AI will analyze your results and identify your weak areas.</li>
          <li>Based on the AI analysis, the system will recommend specific exams to help you improve.</li>
          <li>Take the recommended exams to strengthen your knowledge in specific driving topics.</li>
          <li>As you take more exams, the AI will continue to refine its recommendations based on your performance.</li>
        </ol>
        <div class="mt-6 text-right">
          <button @click="showTutorialModal = false" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Close</button>
        </div>
      </div>
    </div>

    <!-- Exam Modal -->
    <div v-if="showExamModal" class="fixed inset-0 flex items-center justify-center backdrop z-50" @click.self="closeExamModal">
      <div class="bg-white w-4/5 max-w-4xl p-6 rounded-xl shadow-lg overflow-y-auto max-h-[80vh]">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">{{ currentExam.title }}</h3>
          <div class="flex items-center">
            <span class="text-sm text-gray-600 mr-2">Time:</span>
            <div class="font-bold" :class="timerClass">{{ formattedTime }}</div>
          </div>
        </div>
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>Question {{ currentQuestionIndex + 1 }} of {{ currentQuestions.length }}</span>
          </div>
          <div class="progress-bar bg-gray-200">
            <div class="progress-fill bg-green-500" :style="{ width: progressWidth }"></div>
          </div>
        </div>
        
        <!-- Current Question -->
        <div v-if="currentQuestion" class="fade-in p-4 border rounded-lg bg-gray-50">
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ currentQuestionIndex + 1 }}. {{ currentQuestion.question_text }}
            </h3>
          </div>
          
          <div class="space-y-3">
            <div 
              v-for="option in options" 
              :key="option.value"
              class="flex items-center"
            >
              <input 
                type="radio" 
                :id="`option-${currentQuestionIndex}-${option.value}`"
                :name="`answer-${currentQuestionIndex}`"
                :value="option.value"
                :checked="userAnswers[currentQuestionIndex] === option.value"
                @change="selectAnswer(currentQuestionIndex, option.value)"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
              >
              <label 
                :for="`option-${currentQuestionIndex}-${option.value}`"
                class="ml-3 block text-gray-700"
              >
                {{ option.value }}. {{ option.text }}
              </label>
            </div>
          </div>
        </div>
        
        <div class="mt-4 flex justify-between">
          <button 
            @click="previousQuestion"
            :disabled="currentQuestionIndex === 0"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div>
            <button 
              v-if="currentQuestionIndex < currentQuestions.length - 1"
              @click="nextQuestion"
              class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
            >
              Next
            </button>
            
            <button 
              v-else
              @click="submitExam"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Exam Results Modal -->
    <div v-if="showResultsModal" class="fixed inset-0 flex items-center justify-center backdrop z-50" @click.self="showResultsModal = false">
      <div class="bg-white w-3/4 max-w-2xl p-6 rounded-xl shadow-lg">
        <h3 class="text-xl font-bold text-green-800 mb-4">AI-Powered Exam Results</h3>
        <div class="text-center mb-6">
          <div class="text-4xl font-bold mb-2" :class="getScoreColorClass(currentScore)">{{ currentScore }}%</div>
          <p class="text-lg text-gray-700">{{ getResultMessage(currentScore) }}</p>
        </div>
        
        <div class="mb-6">
          <h4 class="font-bold text-gray-700 mb-2">AI Performance Breakdown</h4>
          <div class="space-y-3">
            <div v-for="item in currentWeaknessAnalysis" :key="item.category" class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{{ item.category }}</span>
                <span class="text-sm font-medium">{{ item.score }}%</span>
              </div>
              <div class="progress-bar bg-gray-200">
                <div 
                  class="progress-fill" 
                  :class="getScoreColorClass(item.score)"
                  :style="{ width: item.score + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-600 mt-1">
                {{ item.feedback || getWeaknessFeedback(item.category, item.score) }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ item.correct_answers || 0 }} correct out of {{ item.total_questions || 0 }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
          <h4 class="font-bold text-blue-800 mb-2">AI Recommendations</h4>
          <p class="text-sm text-gray-700">
            {{ currentRecommendation }}
          </p>
        </div>
        
        <div class="flex justify-end">
          <button @click="showResultsModal = false" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">Close</button>
        </div>
      </div>
    </div>

    <!-- Review Exam Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 flex items-center justify-center backdrop z-50" @click.self="showReviewModal = false">
      <div class="bg-white w-4/5 max-w-4xl p-6 rounded-xl shadow-lg overflow-y-auto max-h-[80vh]">
        <h3 class="text-xl font-bold text-green-800 mb-4">Exam Review: {{ currentReviewAttempt?.exam_title }}</h3>
        <div class="space-y-4">
          <div v-for="(question, index) in currentQuestions" :key="index" class="p-4 border rounded-lg" :class="getReviewQuestionClass(index)">
            <div class="flex justify-between items-start mb-2">
              <h4 class="font-semibold">Question {{ index + 1 }}</h4>
              <span class="text-sm px-2 py-1 rounded" :class="getReviewStatusClass(index)">
                {{ getReviewStatus(index) }}
              </span>
            </div>
            <p class="mb-3">{{ question.question_text }}</p>
            <div class="space-y-2 text-sm">
              <div class="flex items-center">
                <span class="w-6 font-medium">A.</span>
                <span :class="{ 'font-bold': currentReviewAnswers[index] === 'A' }">{{ question.option_a }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-6 font-medium">B.</span>
                <span :class="{ 'font-bold': currentReviewAnswers[index] === 'B' }">{{ question.option_b }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-6 font-medium">C.</span>
                <span :class="{ 'font-bold': currentReviewAnswers[index] === 'C' }">{{ question.option_c }}</span>
              </div>
              <div class="flex items-center">
                <span class="w-6 font-medium">D.</span>
                <span :class="{ 'font-bold': currentReviewAnswers[index] === 'D' }">{{ question.option_d }}</span>
              </div>
            </div>
            <div class="mt-3 text-sm">
              <p><strong>Your answer:</strong> {{ currentReviewAnswers[index] || 'Not answered' }}</p>
              <p><strong>Correct answer:</strong> {{ question.correct_answer }}</p>
              <p v-if="question.explanation" class="mt-2 text-blue-600"><strong>Explanation:</strong> {{ question.explanation }}</p>
            </div>
          </div>
        </div>
        <div class="mt-6 text-right">
          <button @click="showReviewModal = false" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">Close</button>
        </div>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import StudentLayout from './StudentLayout.vue'

export default {
  name: 'StudentMockExam',
  components: {
    StudentLayout
  },
  
  setup() {
    // API Configuration - Replace with your actual API endpoint
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    
    // State
    const user = ref({
      id: null,
      name: '',
      email: '',
      preferred_language: 'english'
    })
    
    const currentLanguage = ref('english')
    const availableQuizzes = ref([])
    const examResults = ref([])
    const searchQuery = ref('')
    
    // UI State
    const loading = ref(false)
    const showTutorialModal = ref(false)
    const showExamModal = ref(false)
    const showResultsModal = ref(false)
    const showReviewModal = ref(false)
    
    // AI Analysis State
    const weaknessAnalysis = ref([])
    const aiRecommendations = ref([])
    const aiSummary = ref('')
    
    // Exam State
    const currentExam = ref(null)
    const currentQuestions = ref([])
    const currentQuestionIndex = ref(0)
    const userAnswers = ref([])
    const timeRemaining = ref(0)
    const timerInterval = ref(null)
    
    // Results State
    const currentScore = ref(0)
    const currentWeaknessAnalysis = ref([])
    const currentRecommendation = ref('')
    const usedAIModel = ref(false)
    
    // Review State
    const currentReviewAttempt = ref(null)
    const currentReviewAnswers = ref([])
    
    // Computed Properties
    const hasTakenExams = computed(() => {
      return examResults.value.length > 0
    })
    
    const filteredQuizzes = computed(() => {
      if (!searchQuery.value.trim()) return availableQuizzes.value
      
      const query = searchQuery.value.toLowerCase()
      return availableQuizzes.value.filter(quiz => 
        quiz.title.toLowerCase().includes(query) ||
        (quiz.course_name && quiz.course_name.toLowerCase().includes(query))
      )
    })
    
    const filteredResults = computed(() => {
      return examResults.value.slice(0, 10)
    })
    
    // Exam Modal Computed
    const currentQuestion = computed(() => {
      return currentQuestions.value[currentQuestionIndex.value]
    })
    
    const options = computed(() => {
      if (!currentQuestion.value) return []
      
      return [
        { value: 'A', text: currentQuestion.value.option_a },
        { value: 'B', text: currentQuestion.value.option_b },
        { value: 'C', text: currentQuestion.value.option_c },
        { value: 'D', text: currentQuestion.value.option_d }
      ]
    })
    
    const formattedTime = computed(() => {
      const minutes = Math.floor(timeRemaining.value / 60)
      const seconds = timeRemaining.value % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })
    
    const timerClass = computed(() => {
      return timeRemaining.value < 300 ? 'text-red-600' : 'text-green-700'
    })
    
    const progressWidth = computed(() => {
      return `${((currentQuestionIndex.value + 1) / currentQuestions.value.length) * 100}%`
    })
    
    // API Helper Functions
    async function apiCall(endpoint, method = 'GET', data = null) {
      const token = localStorage.getItem('token')
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include'
      }

      if (data) {
        options.body = JSON.stringify(data)
      }

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
        
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return null
        }
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        console.error('API call failed:', error)
        throw error
      }
    }
    
    // API Service Functions
    async function fetchUserData() {
      try {
        const userData = localStorage.getItem('user')
        if (userData) {
          return JSON.parse(userData)
        }
        
        const response = await apiCall('/auth/me')
        if (response && response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
          return response.user
        }
        
        return {
          id: null,
          name: 'Student',
          email: '',
          preferred_language: 'english'
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        return user.value
      }
    }
    
    async function fetchAvailableQuizzes() {
      try {
        const response = await apiCall('/student/quizzes')
        return response.data || response.quizzes || []
      } catch (error) {
        console.error('Error fetching quizzes:', error)
        return []
      }
    }
    
    async function fetchExamQuestions(examId, language = 'english') {
      try {
        const response = await apiCall(`/student/exams/${examId}/questions?language=${language}`)
        return response.data || response.questions || []
      } catch (error) {
        console.error('Error fetching exam questions:', error)
        return []
      }
    }
    
    async function submitExamAttempt(attemptData) {
      try {
        const response = await apiCall('/student/exam-attempts', 'POST', attemptData)
        return response.data || response.attempt || attemptData
      } catch (error) {
        console.error('Error submitting exam attempt:', error)
        return attemptData
      }
    }
    
    async function analyzePerformanceWithAI(questions, userAnswers) {
      try {
        const response = await apiCall('/ai/analyze-performance', 'POST', {
          questions: questions,
          user_answers: userAnswers
        })
        return response.data || response.analysis
      } catch (error) {
        console.error('Error analyzing performance:', error)
        return performLocalAnalysis(questions, userAnswers)
      }
    }
    
    async function fetchUserResults() {
      try {
        const response = await apiCall('/student/exam-results')
        return response.data || response.results || []
      } catch (error) {
        console.error('Error fetching user results:', error)
        return []
      }
    }
    
    async function updateUserLanguageApi(userId, language) {
      try {
        await apiCall(`/users/${userId}/language`, 'PUT', { language })
      } catch (error) {
        console.error('Error updating language:', error)
      }
    }
    
    // Local Analysis Fallback
    function performLocalAnalysis(questions, userAnswers) {
      const categories = [
        'Vehicle Maintenance', 
        'Traffic Rules', 
        'Road Signs', 
        'Driving Techniques',
        'Safety Procedures'
      ]
      
      const categoryScores = {}
      
      // Initialize categories
      categories.forEach(category => {
        categoryScores[category] = { correct: 0, total: 0, score: 0 }
      })

      // Analyze each answer
      questions.forEach((question, index) => {
        const category = question.category || categories[index % categories.length]
        const userAnswer = userAnswers[index]
        const isCorrect = userAnswer === question.correct_answer
        
        if (!categoryScores[category]) {
          categoryScores[category] = { correct: 0, total: 0, score: 0 }
        }
        
        categoryScores[category].total++
        if (isCorrect) {
          categoryScores[category].correct++
        }
      })

      // Calculate scores
      const weaknessAnalysis = []
      Object.keys(categoryScores).forEach(category => {
        const data = categoryScores[category]
        if (data.total > 0) {
          data.score = Math.round((data.correct / data.total) * 100)
          
          weaknessAnalysis.push({
            category: category,
            score: data.score,
            correct_answers: data.correct,
            total_questions: data.total,
            weakness_score: 100 - data.score
          })
        }
      })

      const totalScore = Math.round((userAnswers.filter((answer, index) => 
        answer === questions[index].correct_answer
      ).length / questions.length) * 100)

      return {
        overall_score: totalScore,
        weakness_analysis: weaknessAnalysis.sort((a, b) => b.weakness_score - a.weakness_score),
        total_questions: questions.length,
        correct_answers: userAnswers.filter((answer, index) => answer === questions[index].correct_answer).length,
        used_model: false,
        recommendation: generateRecommendation(weaknessAnalysis)
      }
    }
    
    function generateRecommendation(weaknessAnalysis) {
      if (weaknessAnalysis.length === 0) return "Complete more exams to get better recommendations."
      
      const weakest = weaknessAnalysis[0]
      if (weakest.score >= 80) {
        return "Excellent performance! You're well-prepared. Consider advanced topics."
      } else if (weakest.score >= 70) {
        return "Good performance. Focus on maintaining consistency across all areas."
      } else if (weakest.score >= 50) {
        return `You need practice in ${weakest.category}. Review the fundamentals and try again.`
      } else {
        return `You need significant practice in ${weakest.category}. Study the basics thoroughly before retaking the exam.`
      }
    }
    
    // Helper Functions
    function getScoreColorClass(score) {
      if (score >= 80) return 'text-green-600'
      if (score >= 60) return 'text-yellow-600'
      return 'text-red-600'
    }
    
    function getStatusClass(examId) {
      const hasTaken = examResults.value.some(r => r.exam_id === examId)
      return hasTaken ? 'text-green-600' : 'text-yellow-600'
    }
    
    function getButtonClass(examId) {
      const hasTaken = examResults.value.some(r => r.exam_id === examId)
      return hasTaken ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
    }
    
    function getButtonText(examId) {
      const hasTaken = examResults.value.some(r => r.exam_id === examId)
      return hasTaken ? 'Review' : 'Take Quiz'
    }
    
    function getExamStatus(examId) {
      const hasTaken = examResults.value.some(r => r.exam_id === examId)
      return hasTaken ? 'Completed' : 'Not Taken'
    }
    
    function formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    function getRemarks(score) {
      if (score >= 80) return 'Excellent'
      if (score >= 70) return 'Good'
      if (score >= 60) return 'Fair'
      return 'Needs Improvement'
    }
    
    function getResultMessage(score) {
      if (score >= 80) return 'Excellent! You passed with flying colors.'
      if (score >= 70) return 'Good job! You passed the exam.'
      return 'You need more practice. Try again!'
    }
    
    function getWeaknessFeedback(category, score) {
      const feedback = {
        'Vehicle Maintenance': {
          high: "You have excellent knowledge of vehicle maintenance procedures.",
          medium: "You understand basic maintenance but need to learn more advanced procedures.",
          low: "Focus on learning basic vehicle maintenance like oil changes, tire pressure, and brake checks."
        },
        'Traffic Rules': {
          high: "Strong understanding of traffic rules and regulations.",
          medium: "Good knowledge but review specific traffic laws and right-of-way rules.",
          low: "Study traffic rules thoroughly - pay attention to speed limits, signaling, and intersection rules."
        },
        'Road Signs': {
          high: "Excellent recognition and understanding of road signs.",
          medium: "You know most signs but need to review less common ones.",
          low: "Memorize all road signs - especially warning, regulatory, and guide signs."
        },
        'Driving Techniques': {
          high: "You demonstrate advanced driving techniques and awareness.",
          medium: "Good basic techniques but practice defensive driving strategies.",
          low: "Practice basic driving maneuvers, parking, and defensive driving techniques."
        },
        'Safety Procedures': {
          high: "Excellent safety awareness and emergency procedures knowledge.",
          medium: "Good safety knowledge but review emergency procedures.",
          low: "Learn safety procedures for emergencies, accidents, and hazardous conditions."
        }
      }

      const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
      return feedback[category] ? feedback[category][level] : "Continue practicing this area."
    }
    
    // Review Modal Helpers
    function getReviewQuestionClass(index) {
      const userAnswer = currentReviewAnswers[index]
      const correctAnswer = currentQuestions.value[index]?.correct_answer
      const isCorrect = userAnswer === correctAnswer
      return isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }
    
    function getReviewStatusClass(index) {
      const userAnswer = currentReviewAnswers[index]
      const correctAnswer = currentQuestions.value[index]?.correct_answer
      const isCorrect = userAnswer === correctAnswer
      return isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
    }
    
    function getReviewStatus(index) {
      const userAnswer = currentReviewAnswers[index]
      const correctAnswer = currentQuestions.value[index]?.correct_answer
      const isCorrect = userAnswer === correctAnswer
      return isCorrect ? '✓ Correct' : '✗ Incorrect'
    }
    
    // Main Methods
    const loadInitialData = async () => {
      loading.value = true
      try {
        // Load user data
        user.value = await fetchUserData()
        currentLanguage.value = user.value.preferred_language || 'english'
        
        // Load available quizzes
        availableQuizzes.value = await fetchAvailableQuizzes()
        
        // Load user's exam results
        examResults.value = await fetchUserResults()
        
        // Load AI recommendations if user has taken exams
        if (hasTakenExams.value) {
          await loadAIRecommendations()
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        loading.value = false
      }
    }
    
    const loadAIRecommendations = async () => {
      if (!hasTakenExams.value || !user.value.id) return
      
      try {
        const latestAttempt = examResults.value[0]
        const analysis = await analyzePerformanceWithAI([], [])
        
        if (analysis) {
          weaknessAnalysis.value = analysis.weakness_analysis || []
          aiRecommendations.value = analysis.recommendations || []
          aiSummary.value = analysis.summary || 'Complete more exams to get personalized recommendations.'
        }
      } catch (error) {
        console.error('Error loading AI recommendations:', error)
        weaknessAnalysis.value = []
        aiRecommendations.value = []
        aiSummary.value = 'AI analysis will be available after completing more exams.'
      }
    }
    
    const startExam = async (examId) => {
      loading.value = true
      try {
        // Reset exam state
        currentExam.value = availableQuizzes.value.find(q => q.id === examId)
        if (!currentExam.value) {
          alert('Exam not found.')
          return
        }
        
        // Load questions
        currentQuestions.value = await fetchExamQuestions(examId, currentLanguage.value)
        
        if (currentQuestions.value.length === 0) {
          alert('No questions found for this exam.')
          return
        }
        
        // Initialize exam state
        currentQuestionIndex.value = 0
        userAnswers.value = new Array(currentQuestions.value.length).fill(null)
        timeRemaining.value = currentExam.value.time_limit || 1800
        
        // Start timer
        startTimer()
        
        // Show exam modal
        showExamModal.value = true
      } catch (error) {
        console.error('Error starting exam:', error)
        alert('Failed to load exam. Please try again.')
      } finally {
        loading.value = false
      }
    }
    
    const startInitialExam = () => {
      // Start the first available exam
      if (availableQuizzes.value.length > 0) {
        startExam(availableQuizzes.value[0].id)
      }
    }
    
    const startRecommendedExam = () => {
      // Start exam based on AI recommendation
      if (availableQuizzes.value.length > 0) {
        startExam(availableQuizzes.value[0].id)
      }
    }
    
    const startTimer = () => {
      if (timerInterval.value) clearInterval(timerInterval.value)
      
      timerInterval.value = setInterval(() => {
        timeRemaining.value--
        
        if (timeRemaining.value <= 0) {
          clearInterval(timerInterval.value)
          submitExam()
        }
      }, 1000)
    }
    
    const selectAnswer = (questionIndex, answer) => {
      userAnswers.value[questionIndex] = answer
    }
    
    const previousQuestion = () => {
      if (currentQuestionIndex.value > 0) {
        currentQuestionIndex.value--
      }
    }
    
    const nextQuestion = () => {
      if (currentQuestionIndex.value < currentQuestions.value.length - 1) {
        currentQuestionIndex.value++
      }
    }
    
    const submitExam = async () => {
      try {
        // Clear timer
        if (timerInterval.value) {
          clearInterval(timerInterval.value)
          timerInterval.value = null
        }
        
        // Close exam modal
        showExamModal.value = false
        
        // Calculate score
        const correctAnswers = currentQuestions.value.filter((q, index) => 
          userAnswers.value[index] === q.correct_answer
        ).length
        
        const score = Math.round((correctAnswers / currentQuestions.value.length) * 100)
        currentScore.value = score
        
        // Call AI analysis
        const analysis = await analyzePerformanceWithAI(currentQuestions.value, userAnswers.value)
        
        currentWeaknessAnalysis.value = analysis.weakness_analysis || []
        currentRecommendation.value = analysis.recommendation || generateRecommendation(currentWeaknessAnalysis.value)
        usedAIModel.value = analysis.used_model || false
        
        // Submit exam attempt
        const attemptData = {
          student_id: user.value.id,
          exam_id: currentExam.value.id,
          score: score,
          total_questions: currentQuestions.value.length,
          correct_answers: correctAnswers,
          time_taken: (currentExam.value.time_limit || 1800) - timeRemaining.value,
          answers: [...userAnswers.value],
          language: currentLanguage.value
        }
        
        const savedAttempt = await submitExamAttempt(attemptData)
        
        // Update local results
        examResults.value.unshift({
          ...savedAttempt,
          exam_title: currentExam.value.title,
          completed_at: new Date().toISOString()
        })
        
        // Update AI recommendations
        if (examResults.value.length === 1) {
          await loadAIRecommendations()
        }
        
        // Show results modal
        showResultsModal.value = true
      } catch (error) {
        console.error('Error submitting exam:', error)
        alert('Failed to submit exam. Please try again.')
      }
    }
    
    const reviewExam = (attempt) => {
      currentReviewAttempt.value = attempt
      currentReviewAnswers.value = attempt.answers || []
      showReviewModal.value = true
    }
    
    const updateUserLanguage = async () => {
      if (user.value.id) {
        await updateUserLanguageApi(user.value.id, currentLanguage.value)
      }
    }
    
    const closeExamModal = () => {
      if (confirm('Are you sure you want to close the exam? Your progress will be lost.')) {
        if (timerInterval.value) {
          clearInterval(timerInterval.value)
          timerInterval.value = null
        }
        showExamModal.value = false
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadInitialData()
    })
    
    return {
      // State
      user,
      currentLanguage,
      availableQuizzes,
      examResults,
      searchQuery,
      loading,
      showTutorialModal,
      showExamModal,
      showResultsModal,
      showReviewModal,
      weaknessAnalysis,
      aiRecommendations,
      aiSummary,
      currentExam,
      currentQuestions,
      currentQuestionIndex,
      userAnswers,
      timeRemaining,
      currentScore,
      currentWeaknessAnalysis,
      currentRecommendation,
      usedAIModel,
      currentReviewAttempt,
      currentReviewAnswers,
      
      // Computed
      hasTakenExams,
      filteredQuizzes,
      filteredResults,
      currentQuestion,
      options,
      formattedTime,
      timerClass,
      progressWidth,
      
      // Methods
      startExam,
      startInitialExam,
      startRecommendedExam,
      selectAnswer,
      previousQuestion,
      nextQuestion,
      submitExam,
      reviewExam,
      updateUserLanguage,
      closeExamModal,
      getScoreColorClass,
      getStatusClass,
      getButtonClass,
      getButtonText,
      getExamStatus,
      formatDate,
      getRemarks,
      getResultMessage,
      getWeaknessFeedback,
      getReviewQuestionClass,
      getReviewStatusClass,
      getReviewStatus
    }
  }
}
</script>

<style scoped>
.backdrop {
  background: rgba(0,0,0,0.4);
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease-in-out;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>