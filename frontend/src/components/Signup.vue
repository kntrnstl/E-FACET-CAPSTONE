<template>
  <div class="bg-gray-900 flex items-center justify-center min-h-screen p-6">
    <!-- Background Image -->
    <div class="fixed inset-0">
      <img src="/background.png" alt="Background" class="w-full h-full object-cover brightness-50">
    </div>

    <!-- Modern Glass Card -->
    <div class="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="/facet-logo.png" alt="FACET Logo" class="w-20 h-20" />
      </div>

      <!-- Track title -->
      <div class="text-center mb-6">
        <div
          class="inline-flex items-center px-3 py-1 rounded-full mb-1"
          :class="track === 'tesda' ? 'bg-blue-500/20' : 'bg-green-500/20'"
        >
          <div
            class="w-2 h-2 rounded-full mr-2"
            :class="track === 'tesda' ? 'bg-blue-400' : 'bg-green-400'"
          ></div>
          <h2
            class="text-sm font-semibold"
            :class="track === 'tesda' ? 'text-blue-200' : 'text-green-200'"
          >
            {{ signupTitle }}
          </h2>
        </div>
        <p class="text-xs text-gray-300 mt-1">
          {{ signupSubtitle }}
        </p>
      </div>

      <!-- Message Alert -->
      <div
        v-if="message.text"
        :class="[
          'mb-5 p-3 rounded-lg text-sm font-medium border',
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        ]"
      >
        {{ message.text }}
      </div>

      <!-- Signup Form -->
      <form @submit.prevent="handleSignup" class="space-y-4">
        <!-- Full Name -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Full Name: *</label>
          <input
            type="text"
            v-model="formData.fullname"
            required
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
            placeholder="Enter your full name"
          />
          <p v-if="errors.fullname" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.fullname }}
          </p>
        </div>

        <!-- Username -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Username: *</label>
          <input
            type="text"
            v-model="formData.username"
            required
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
            placeholder="Choose a username"
          />
          <p v-if="errors.username" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.username }}
          </p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Email: *</label>
          <input
            type="email"
            v-model="formData.email"
            required
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
            placeholder="Enter your email"
          />
          <p v-if="errors.email" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.email }}
          </p>
        </div>

        <!-- Contact -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Contact Number:</label>
          <input
            type="text"
            v-model="formData.contact"
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
            placeholder="Optional"
          />
          <p v-if="errors.contact" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.contact }}
          </p>
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Gender: *</label>
          <select
            v-model="formData.gender"
            required
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
          >
            <option value="" disabled>Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <p v-if="errors.gender" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.gender }}
          </p>
        </div>

        <!-- Birthday -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Birthday: *</label>
          <input
            type="date"
            v-model="formData.birthday"
            required
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
          />
          <p v-if="errors.birthday" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.birthday }}
          </p>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Password: *</label>
          <input
            type="password"
            v-model="formData.password"
            required
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-600'"
            placeholder="Create a password"
          />
          <p v-if="errors.password" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.password }}
          </p>
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1">Confirm Password: *</label>
          <input
            type="password"
            v-model="formData.confirm"
            required
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-600'"
            placeholder="Confirm your password"
          />
          <p v-if="errors.confirm" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.confirm }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
          :class="track === 'tesda'
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-green-600 hover:bg-green-700'"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
          </span>
          <span v-else class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Create Account
          </span>
        </button>
      </form>

      <!-- Divider -->
      <div class="my-5">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/10"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="px-3 text-xs text-gray-400">or sign up with</span>
          </div>
        </div>
      </div>

      <!-- Google Button -->
      <button
        @click="handleGoogleSignup"
        class="w-full bg-white border border-gray-300 rounded-lg py-3 flex justify-center items-center space-x-3 hover:bg-gray-50 transition"
      >
        <img src="/google-icon.png" alt="Google" class="w-5 h-5" />
        <span class="text-gray-700 font-medium text-sm">Google</span>
      </button>

      <!-- Footer Links -->
      <div class="mt-6 pt-5 border-t border-white/10">
        <p class="text-center text-xs text-gray-400 mb-3">
          Already have an account?
          <a href="#" @click.prevent="goToLogin"
             class="text-white font-medium hover:underline transition">
            Login here
          </a>
        </p>

        <p class="text-center text-xs text-gray-500">
          <a href="#" @click.prevent="goToLanding"
             class="hover:text-gray-300 transition inline-flex items-center">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to enrollment options
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupPage',

  data() {
    return {
      track: 'driving',
      formData: {
        fullname: '',
        username: '',
        email: '',
        contact: '',
        gender: '',
        birthday: '',
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

  computed: {
    signupTitle() {
      return this.track === 'tesda'
        ? 'Create Your TESDA Account'
        : 'Create Your Driving Course Account'
    },
    signupSubtitle() {
      return this.track === 'tesda'
        ? 'Register for TESDA training portal access'
        : 'Register for driving course portal access'
    }
  },

  methods: {
    readTrackFromQuery() {
      const q = this.$route?.query?.track;
      if (q === 'tesda' || q === 'driving') {
        this.track = q;
        localStorage.setItem('lastSelectedTrack', q);
        return;
      }
      const last = localStorage.getItem('lastSelectedTrack');
      if (last === 'tesda' || last === 'driving') {
        this.track = last;
      }
    },

    validateForm() {
      this.errors = {};
      let isValid = true;

      const fullname = this.formData.fullname.trim();
      const username = this.formData.username.trim();
      const email = this.formData.email.trim();

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

      if (!this.formData.gender) {
        this.errors.gender = 'Gender is required';
        isValid = false;
      } else if (this.formData.gender !== 'male' && this.formData.gender !== 'female') {
        this.errors.gender = 'Gender must be male or female';
        isValid = false;
      }

      if (!this.formData.birthday) {
        this.errors.birthday = 'Birthday is required';
        isValid = false;
      }

      if (!this.formData.confirm) {
        this.errors.confirm = 'Confirm password is required';
        isValid = false;
      }

      if (
        this.formData.password &&
        this.formData.confirm &&
        this.formData.password !== this.formData.confirm
      ) {
        this.errors.confirm = 'Passwords do not match';
        isValid = false;
      }

      return isValid;
    },

    isValidEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    goToLanding() {
      this.$router.push('/');
    },

    goToLogin() {
      this.$router.push(`/login?track=${this.track}`);
    },

    async handleSignup() {
      this.message.text = '';
      this.errors = {};

      if (!this.validateForm()) return;

      this.isLoading = true;

      try {
        const payload = {
          fullname: this.formData.fullname.trim(),
          username: this.formData.username.trim(),
          email: this.formData.email.trim(),
          contact: this.formData.contact.trim(),
          gender: this.formData.gender,
          birthday: this.formData.birthday,
          password: this.formData.password,
          confirm: this.formData.confirm,

          // ✅ send track even if backend doesn't use it yet
          track: this.track
        };

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.status === 'success') {
          localStorage.setItem('lastSelectedTrack', this.track);

          this.message = {
            text: data.message || 'Account created successfully!',
            type: 'success'
          };

          setTimeout(() => {
            this.$router.push(`/login?track=${this.track}`);
          }, 1000);

        } else if (data.status === 'error') {
          if (data.errors) this.errors = data.errors;

          if (data.errors?.general) {
            this.message = { text: data.errors.general, type: 'error' };
          } else {
            this.message = { text: 'Please check the form for errors', type: 'error' };
          }
        }
      } catch (error) {
        console.error('Signup error:', error);
        this.message = { text: 'An error occurred. Please try again.', type: 'error' };
      } finally {
        this.isLoading = false;
      }
    },

    handleGoogleSignup() {
      console.log('Google signup clicked');
    }
  },

  mounted() {
    this.readTrackFromQuery();
  },

  watch: {
    '$route.query.track'() {
      this.readTrackFromQuery();
    }
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  width: 100%;
  position: relative;
}

/* Input focus styles */
input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input:focus.track-tesda {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input:focus.track-driving {
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Smooth transitions */
button, a, input {
  transition: all 0.2s ease;
}

/* Card hover effect */
.relative.z-10:hover {
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
}
</style>
