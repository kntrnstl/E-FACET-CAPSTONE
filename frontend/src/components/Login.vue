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
        <img src="/facet-logo.png" alt="FACET Logo" class="w-16 h-16" />
      </div>

      <!-- Track title -->
      <h2
        class="text-center font-semibold text-sm mb-1"
        :class="track === 'tesda' ? 'text-blue-800' : 'text-green-800'"
      >
        {{ trackTitle }}
      </h2>

      <p class="text-center text-xs text-gray-500 mb-6">
        {{ trackSubtitle }}
      </p>

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
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
          />
          <p v-if="errors.username" class="text-red-600 text-sm mt-1">
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
            class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2"
            :class="track === 'tesda' ? 'focus:ring-blue-600' : 'focus:ring-green-600'"
          />
          <p v-if="errors.password" class="text-red-600 text-sm mt-1">
            {{ errors.password }}
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full text-white py-2 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="track === 'tesda' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'"
        >
          <span v-if="isLoading">Logging in...</span>
          <span v-else>Login</span>
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
        <img src="/google-icon.png" alt="Google" class="w-5 h-5" />
        <span class="text-gray-700">Google</span>
      </button>

      <!-- Footer Link -->
      <p class="text-center text-sm text-gray-600 mt-4">
        Don't have an account?
        <a href="#" @click.prevent="goToSignup" class="text-blue-600 hover:underline">Create account</a>
      </p>

      <!-- Back to landing -->
      <p class="text-center text-xs text-gray-500 mt-2">
        <a href="#" @click.prevent="goToLanding" class="hover:underline">← Back to enrollment options</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginPage',

  data() {
    return {
      track: 'driving', // default
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

  computed: {
    trackTitle() {
      return this.track === 'tesda'
        ? 'TESDA Student Login'
        : 'Driving Course Student Login'
    },
    trackSubtitle() {
      return this.track === 'tesda'
        ? 'Login to your TESDA training portal'
        : 'Login to your driving course portal'
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
      // keep track in URL
      this.$router.push(`/signup?track=${this.track}`);
    },

    goToLanding() {
      this.$router.push('/');
    },

    // ✅ redirect helper (now track-aware)
    redirectByRole(role, track) {
      if (role === 'admin') return '/admin-dashboard';
      if (role === 'instructor') return '/instructor-dashboard';
      if (role === 'student' || role === 'user') {
        return track === 'tesda' ? '/tesda-dashboard' : '/student-dashboard';
      }
      return null;
    },

    async handleLogin() {
      this.message.text = '';
      this.isRedirecting = false;

      if (!this.validateForm()) return;

      this.isLoading = true;

      try {
        const loginData = {
          username: this.formData.username.trim(),
          password: this.formData.password,
          track: this.track 
        };

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
          credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 'success') {
          if (!data.user) {
            this.message = {
              text: 'Login error: No user data received from server',
              type: 'error'
            };
            return;
          }

          // ✅ Merge track into user data (frontend-only workaround)
          // If backend already returns track later, it will override this.
          const finalUser = { ...data.user };

          // only set track for student/user roles
          if (finalUser.role === 'student' || finalUser.role === 'user') {
            finalUser.track = finalUser.track || this.track || 'driving';
          }

          localStorage.setItem('user', JSON.stringify(finalUser));
          localStorage.setItem('lastSelectedTrack', finalUser.track || this.track);

          this.message = {
            text: data.message || 'Login successful! Redirecting...',
            type: 'success'
          };

          this.isRedirecting = true;

          setTimeout(() => {
            const role = finalUser?.role;
            const redirectPath = this.redirectByRole(role, finalUser.track);

            if (!redirectPath) {
              this.message = {
                text: 'Unknown user role. Please contact administrator.',
                type: 'error'
              };
              this.isRedirecting = false;
              return;
            }

            this.$router.push(redirectPath);
          }, 800);

        } else {
          if (data.errors) this.errors = data.errors;

          this.message = {
            text: data.message || 'Login failed. Please check your credentials.',
            type: 'error'
          };
        }

      } catch (error) {
        this.message = {
          text: 'Network error. Please check your connection and try again.',
          type: 'error'
        };
        console.error('Login error:', error);
      } finally {
        this.isLoading = false;
      }
    },

    handleGoogleLogin() {
      console.log('Google login clicked');
    },

    readTrackFromQuery() {
      const q = this.$route?.query?.track;
      if (q === 'tesda' || q === 'driving') {
        this.track = q;
        localStorage.setItem('lastSelectedTrack', q);
        return;
      }

      // fallback: use last choice
      const last = localStorage.getItem('lastSelectedTrack');
      if (last === 'tesda' || last === 'driving') {
        this.track = last;
      }
    }
  },

  mounted() {
    // detect track from url or saved selection
    this.readTrackFromQuery();

    // auto redirect if logged in
    const user = localStorage.getItem('user');
    if (!user) return;

    try {
      const userData = JSON.parse(user);
      if (userData.user_id && userData.role) {
        const redirectPath = this.redirectByRole(userData.role, userData.track);
        if (redirectPath) this.$router.push(redirectPath);
        else localStorage.removeItem('user');
      }
    } catch (e) {
      localStorage.removeItem('user');
    }
  },

  watch: {
    // If user changes /login?track=..., update UI live
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