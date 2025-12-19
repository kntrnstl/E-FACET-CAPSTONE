<template>
  <div class="bg-gray-900 flex items-center justify-center min-h-screen py-4">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img src="/background.png" alt="Background" class="w-full h-full object-cover blur-sm brightness-75">
    </div>

    <!-- Login Card -->
    <div class="relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-xl shadow-lg w-[28rem]">
      <!-- Logo -->
      <div class="flex justify-center mb-4">
        <img 
          src="/facet-logo.png" 
          alt="FACET Logo" 
          class="w-16 h-16"
        />
      </div>

      <h2 class="text-center text-green-800 font-semibold text-sm mb-6">
        First Asian Cognizance Executive Training (FACET)
      </h2>

      <!-- General Message -->
      <div 
        v-if="message.text"
        :class="[
          'text-center mb-4 p-2 rounded-md font-medium',
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        ]"
      >
        {{ message.text }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Username/Email Field -->
        <div>
          <label class="text-sm text-gray-700">Username / Email:</label>
          <input 
            type="text" 
            v-model="formData.username" 
            required 
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <p 
            v-if="errors.username" 
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.username }}
          </p>
        </div>

        <!-- Password Field -->
        <div>
          <label class="text-sm text-gray-700">Password:</label>
          <input 
            type="password" 
            v-model="formData.password" 
            required 
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <p 
            v-if="errors.password" 
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.password }}
          </p>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Login to your account</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center my-4">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="px-2 text-sm text-gray-500">or continue with</span>
        <div class="flex-grow border-t border-gray-300"></div>
      </div>

      <!-- Google Login Button -->
      <button 
        @click="handleGoogleLogin"
        class="w-full bg-white border border-gray-300 rounded-md py-2 flex justify-center items-center space-x-2 hover:bg-gray-50 transition"
      >
        <img 
          src="/google-icon.png" 
          alt="Google" 
          class="w-5 h-5"
        />
        <span class="text-gray-700">Google</span>
      </button>

      <!-- Footer Link -->
      <p class="text-center text-sm text-gray-600 mt-4">
        Don't have an account? 
        <a href="#" @click.prevent="goToSignup" class="text-blue-600 hover:underline">Create account</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',
  
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      errors: {
        username: '',
        password: ''
      },
      message: {
        text: '',
        type: ''
      },
      isLoading: false,
      isRedirecting: false
    }
  },

  methods: {
    validateForm() {
      this.errors = { username: '', password: '' };
      let isValid = true;

      if (!this.formData.username.trim()) {
        this.errors.username = 'Username/email is required';
        isValid = false;
      }

      if (!this.formData.password) {
        this.errors.password = 'Password is required';
        isValid = false;
      }

      return isValid;
    },

    goToSignup() {
      this.$router.push('/signup');
    },

    async handleLogin() {
      // Clear previous messages
      this.message.text = '';
      this.isRedirecting = false;
      
      // Validate form
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      console.log('🔄 Login attempt started');

      try {
        const loginData = {
          username: this.formData.username.trim(),
          password: this.formData.password
        };

        console.log('📤 Sending login request:', { 
          username: loginData.username, 
          hasPassword: !!loginData.password 
        });

        // Call backend API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData),
          credentials: 'include'
        });

        console.log('📥 Response status:', response.status);
        
        const data = await response.json();
        console.log('📥 Full response data:', data);

        if (data.status === 'success') {
          console.log('✅ Login successful!');
          console.log('👤 User data:', data.user);
          
          // Store user data in localStorage
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            console.log('💾 User saved to localStorage');
            
            // Show success message with animation
            this.message = {
              text: data.message || 'Login successful! Redirecting...',
              type: 'success'
            };
            
            this.isRedirecting = true;
            
            // Wait 1.5 seconds to show the success message
            setTimeout(() => {
              // Determine where to redirect based on user role
              let redirectPath = '/';
              
              if (data.user.role === 'admin') {
                redirectPath = '/admin-dashboard';
              } else if (data.user.role === 'student') {
                redirectPath = '/student-dashboard';
              } else if (data.user.role === 'user') {
                redirectPath = '/student-dashboard'; // Treat 'user' as student
              } else {
                console.error('❌ Unknown role:', data.user.role);
                this.message = {
                  text: 'Unknown user role. Please contact administrator.',
                  type: 'error'
                };
                this.isRedirecting = false;
                return;
              }
              
              console.log('🎯 Redirecting to:', redirectPath);
              this.$router.push(redirectPath);
              
            }, 1500);
          } else {
            console.error('❌ No user data in response');
            this.message = {
              text: 'Login error: No user data received from server',
              type: 'error'
            };
          }
          
        } else {
          console.log('❌ Login failed:', data.message);
          
          // Set field-specific errors
          if (data.errors) {
            this.errors = data.errors;
          }
          
          this.message = {
            text: data.message || 'Login failed. Please check your credentials.',
            type: 'error'
          };
        }
        
      } catch (error) {
        console.error('🔥 Network/Server error:', error);
        
        this.message = {
          text: 'Network error. Please check your connection and try again.',
          type: 'error'
        };
      } finally {
        this.isLoading = false;
        console.log('🏁 Login process completed');
      }
    },

    handleGoogleLogin() {
      console.log('Google login clicked');
      // window.location.href = '/api/auth/google';
    }
  },

  mounted() {
    console.log('🔍 Checking if user is already logged in...');
    
    // Check if user is already logged in and redirect if needed
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('👤 Found user in localStorage:', userData);
        
        // Auto-redirect if user is already logged in
        if (userData.user_id && userData.role) {
          let redirectPath = '/';
          
          if (userData.role === 'admin') {
            redirectPath = '/admin-dashboard';
          } else if (userData.role === 'student' || userData.role === 'user') {
            redirectPath = '/student-dashboard';
          }
          
          console.log('🔄 Auto-redirecting to:', redirectPath);
          this.$router.push(redirectPath);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user'); // Clear corrupted data
      }
    }
  }
}
</script>

<style scoped>
/* Remove scroll and fix height */
html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto; /* Allow vertical scrolling */
  overflow-x: hidden; /* Prevent horizontal scrolling */
}

#app {
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* Success message animation */
@keyframes fadeInSuccess {
  from {
    opacity: 0;
    transform: translateY(-10px);
    background-color: #d1fae5;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    background-color: #d1fae5;
  }
}

.bg-green-100 {
  animation: fadeInSuccess 0.5s ease-out;
}

/* Redirecting animation */
.redirecting-message {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}
</style>