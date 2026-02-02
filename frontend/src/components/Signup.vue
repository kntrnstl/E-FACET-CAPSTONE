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

      <h2
        class="text-center font-semibold text-sm mb-1"
        :class="track === 'tesda' ? 'text-blue-800' : 'text-green-800'"
      >
        {{ signupTitle }}
      </h2>

      <p class="text-center text-xs text-gray-500 mb-6">
        {{ signupSubtitle }}
      </p>

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
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
          />
          <p v-if="errors.fullname" class="text-red-600 text-sm mt-1">
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
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
          />
          <p v-if="errors.username" class="text-red-600 text-sm mt-1">
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
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
          />
          <p v-if="errors.email" class="text-red-600 text-sm mt-1">
            {{ errors.email }}
          </p>
        </div>

        <!-- Contact -->
        <div>
          <label class="text-sm text-gray-700">Contact Number:</label>
          <input
            type="text"
            v-model="formData.contact"
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
            placeholder="Optional"
          />
          <p v-if="errors.contact" class="text-red-600 text-sm mt-1">
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
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
          />
          <p v-if="errors.password" class="text-red-600 text-sm mt-1">
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
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
          />
          <p v-if="errors.confirm" class="text-red-600 text-sm mt-1">
            {{ errors.confirm }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full text-white py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="track === 'tesda' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'"
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

      <p class="text-center text-xs text-gray-500 mt-2">
        <a href="#" @click.prevent="goToLanding" class="hover:underline">← Back to enrollment options</a>
      </p>
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
</style>