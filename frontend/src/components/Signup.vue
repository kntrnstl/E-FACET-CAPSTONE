<template>
  <div class="bg-gray-900 flex items-center justify-center min-h-screen py-4">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img src="/background.png" alt="Background" class="w-full h-full object-cover blur-sm brightness-75">
    </div>

    <div class="relative z-10 bg-white/95 backdrop-blur-md p-8 rounded-xl shadow-lg w-[28rem]">
      <!-- Logo -->
      <div class="flex justify-center mb-4">
        <img src="/facet-logo.png" alt="FACET Logo" class="w-16 h-16">
      </div>

      <h2 class="text-center text-green-800 font-semibold text-sm mb-6">
        Create Your FACET Account
      </h2>

      <!-- General message -->
      <div 
        v-if="message.text"
        :class="[
          'text-center mb-4 p-2 rounded-md font-medium',
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        ]"
      >
        {{ message.text }}
      </div>

      <form @submit.prevent="handleSignup" class="space-y-4">
        <!-- Full Name -->
        <div>
          <label class="text-sm text-gray-700">Full Name: *</label>
          <input 
            type="text" 
            v-model="formData.fullname" 
            required 
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <p 
            v-if="errors.fullname" 
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.fullname }}
          </p>
        </div>

        <!-- Username -->
        <div>
          <label class="text-sm text-gray-700">Username: *</label>
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

        <!-- Email -->
        <div>
          <label class="text-sm text-gray-700">Email: *</label>
          <input 
            type="email" 
            v-model="formData.email" 
            required 
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <p 
            v-if="errors.email" 
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.email }}
          </p>
        </div>

        <!-- Contact (Optional) -->
        <div>
          <label class="text-sm text-gray-700">Contact Number:</label>
          <input 
            type="text" 
            v-model="formData.contact" 
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Optional"
          />
          <p 
            v-if="errors.contact" 
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.contact }}
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="text-sm text-gray-700">Password: *</label>
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

        <!-- Confirm Password -->
        <div>
          <label class="text-sm text-gray-700">Confirm Password: *</label>
          <input 
            type="password" 
            v-model="formData.confirm" 
            required 
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <p 
            v-if="errors.confirm" 
            class="text-red-600 text-sm mt-1"
          >
            {{ errors.confirm }}
          </p>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Creating Account...</span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center my-4">
        <div class="flex-grow border-t border-gray-300"></div>
        <span class="px-2 text-sm text-gray-500">or sign up with</span>
        <div class="flex-grow border-t border-gray-300"></div>
      </div>

      <!-- Google Button -->
      <button 
        @click="handleGoogleSignup"
        class="w-full bg-white border border-gray-300 rounded-md py-2 flex justify-center items-center space-x-2 hover:bg-gray-50 transition"
      >
        <img src="/google-icon.png" alt="Google" class="w-5 h-5">
        <span class="text-gray-700">Google</span>
      </button>

      <!-- Footer -->
      <p class="text-center text-sm text-gray-600 mt-4">
        Already have an account? 
        <a href="#" @click.prevent="goToLogin" class="text-blue-600 hover:underline">Login here</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupPage',
  
  data() {
    return {
      formData: {
        fullname: '',
        username: '',
        email: '',
        contact: '',
        password: '',
        confirm: ''
      },
      errors: {},
      message: {
        text: '',
        type: ''
      },
      isLoading: false
    }
  },

  methods: {
    validateForm() {
      // Clear previous errors
      this.errors = {};
      let isValid = true;

      // Trim values
      const fullname = this.formData.fullname.trim();
      const username = this.formData.username.trim();
      const email = this.formData.email.trim();
      const contact = this.formData.contact.trim();

      // Required fields validation (exact same as PHP)
      if (!fullname) {
        this.errors.fullname = 'Full name is required';
        isValid = false;
      }
      if (!username) {
        this.errors.username = 'Username is required';
        isValid = false;
      }
      if (!email) {
        this.errors.email = 'Email is required';
        isValid = false;
      } else if (!this.isValidEmail(email)) {
        this.errors.email = 'Please enter a valid email';
        isValid = false;
      }
      if (!this.formData.password) {
        this.errors.password = 'Password is required';
        isValid = false;
      }
      if (!this.formData.confirm) {
        this.errors.confirm = 'Confirm password is required';
        isValid = false;
      }

      // Password match validation
      if (this.formData.password && this.formData.confirm && 
          this.formData.password !== this.formData.confirm) {
        this.errors.confirm = 'Passwords do not match';
        isValid = false;
      }

      return isValid;
    },

    isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    goToLogin() {
      // Change the URL
      window.history.pushState({}, '', '/');
      // Force page reload to trigger App.vue check
      window.location.reload();
    },

    async handleSignup() {
      // Clear previous messages and errors
      this.message.text = '';
      this.errors = {};
      
      // Validate form
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        // Call backend API
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullname: this.formData.fullname.trim(),
            username: this.formData.username.trim(),
            email: this.formData.email.trim(),
            contact: this.formData.contact.trim(),
            password: this.formData.password,
            confirm: this.formData.confirm
          })
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.message = {
            text: data.message || 'Account created successfully!',
            type: 'success'
          };
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.goToLogin();
          }, 2000);
        } else if (data.status === 'error') {
          // Set field-specific errors from backend
          if (data.errors) {
            this.errors = data.errors;
          }
          
          // General error message
          if (data.errors?.general) {
            this.message = {
              text: data.errors.general,
              type: 'error'
            };
          } else {
            // Fallback error message
            this.message = {
              text: 'Please check the form for errors',
              type: 'error'
            };
          }
        }
      } catch (error) {
        this.message = {
          text: 'An error occurred. Please try again.',
          type: 'error'
        };
        console.error('Signup error:', error);
      } finally {
        this.isLoading = false;
      }
    },

    handleGoogleSignup() {
      console.log('Google signup clicked');
      // Implement Google OAuth here if needed
    }
  }
}
</script>

<style scoped>
/* Remove scroll and fix height */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>