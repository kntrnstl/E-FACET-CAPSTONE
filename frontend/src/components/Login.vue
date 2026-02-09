<template>
  <div class="bg-gray-900 flex items-center justify-center min-h-screen p-6">
    <!-- Background Image -->
    <div class="fixed inset-0">
      <img src="/background.png" alt="Background" class="w-full h-full object-cover brightness-50">
    </div>

    <!-- Modern Glass Card -->
    <div class="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-sm">
      <!-- Logo - No background -->
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
            {{ trackTitle }}
          </h2>
        </div>
        <p class="text-xs text-gray-300 mt-1">
          {{ trackSubtitle }}
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

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4" id="loginForm" name="loginForm">
        <!-- Username Field -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1" for="username">
            Username / Email
          </label>
          <input
            id="username"
            name="username"
            type="text"
            v-model="formData.username"
            autocomplete="username"
            required
            :disabled="isLoading"
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition disabled:opacity-50"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
            placeholder="Enter your username or email"
          />
          <p v-if="errors.username" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.username }}
          </p>
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-xs text-gray-300 font-medium mb-1" for="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            v-model="formData.password"
            autocomplete="current-password"
            required
            :disabled="isLoading"
            class="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-gray-100 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition disabled:opacity-50"
            :class="track === 'tesda' ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
            placeholder="Enter your password"
          />
          <p v-if="errors.password" class="text-red-400 text-xs mt-1 flex items-center">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            {{ errors.password }}
          </p>
        </div>

        <!-- Login Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full text-white py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow relative"
          :class="track === 'tesda' 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-green-600 hover:bg-green-700'"
        >
          <span v-if="isLoading" class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span v-else class="flex items-center justify-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
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
            <span class="px-3 text-xs text-gray-400">or continue with</span>
          </div>
        </div>
      </div>

      <!-- Google Button - Clean Design -->
      <button
        @click="handleGoogleLogin"
        :disabled="isLoading"
        class="w-full bg-white border border-gray-300 rounded-lg py-3 flex justify-center items-center space-x-3 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img src="/google-icon.png" alt="Google" class="w-5 h-5" />
        <span class="text-gray-700 font-medium text-sm">Google</span>
      </button>

      <!-- Footer Links -->
      <div class="mt-6 pt-5 border-t border-white/10">
        <p class="text-center text-xs text-gray-400 mb-3">
          Don't have an account?
          <a href="#" @click.prevent="goToSignup" 
             :class="['text-white font-medium hover:underline transition', isLoading ? 'pointer-events-none opacity-50' : '']">
            Create account
          </a>
        </p>

        <p class="text-center text-xs text-gray-500">
          <a href="#" @click.prevent="goToLanding" 
             :class="['hover:text-gray-300 transition inline-flex items-center', isLoading ? 'pointer-events-none opacity-50' : '']">
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
  name: "LoginPage",

  data() {
    return {
      track: "driving",
      formData: {
        username: "",
        password: "",
      },
      errors: {
        username: "",
        password: "",
      },
      message: {
        text: "",
        type: "",
      },
      isLoading: false,
    };
  },

  computed: {
    trackTitle() {
      return this.track === "tesda"
        ? "TESDA Student Login"
        : "Driving Course Login";
    },
    trackSubtitle() {
      return this.track === "tesda"
        ? "Login to your TESDA training portal"
        : "Login to your driving course portal";
    },
  },

  methods: {
    validateForm() {
      this.errors = { username: "", password: "" };
      let ok = true;

      if (!this.formData.username.trim()) {
        this.errors.username = "Username/email is required";
        ok = false;
      }
      if (!this.formData.password) {
        this.errors.password = "Password is required";
        ok = false;
      }
      return ok;
    },

    goToSignup() {
      this.$router.push(`/signup?track=${this.track}`);
    },

    goToLanding() {
      this.$router.push("/");
    },

    readTrackFromQuery() {
      const q = this.$route?.query?.track;
      if (q === "tesda" || q === "driving") {
        this.track = q;
        localStorage.setItem("lastSelectedTrack", q);
        return;
      }

      const last = localStorage.getItem("lastSelectedTrack");
      if (last === "tesda" || last === "driving") {
        this.track = last;
      }
    },

    async handleLogin() {
      this.message = { text: "", type: "" };
      if (!this.validateForm()) return;

      this.isLoading = true;

      // Simulate 2-second minimum loading time
      const minimumLoadTime = new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const payload = {
          username: this.formData.username.trim(),
          password: this.formData.password,
          track: this.track, // ok kahit admin/instructor; backend ignores
        };

        // Wait for minimum load time AND the API call
        const [_, apiResponse] = await Promise.all([
          minimumLoadTime,
          fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          })
        ]);

        const data = await apiResponse.json();

        if (data.status !== "success") {
          if (data.errors) this.errors = { ...this.errors, ...data.errors };
          this.message = {
            text: data.message || "Login failed. Please check your credentials.",
            type: "error",
          };
          return;
        }

        // ✅ store user (make sure track exists for students/users only)
        const finalUser = { ...(data.user || {}) };
        if (finalUser.role === "student" || finalUser.role === "user") {
          finalUser.track = finalUser.track || this.track || "driving";
          localStorage.setItem("lastSelectedTrack", finalUser.track);
        }

        localStorage.setItem("user", JSON.stringify(finalUser));

        this.message = {
          text: data.message || "Login successful! Redirecting...",
          type: "success",
        };

        // Wait a moment to show success message
        await new Promise(resolve => setTimeout(resolve, 500));

        // ✅ IMPORTANT: use backend redirect (single source of truth)
          // normalize id para sa router guard
          finalUser.user_id = finalUser.user_id || finalUser.id;

          // save user
          localStorage.setItem("user", JSON.stringify(finalUser));

          // ROLE-BASED REDIRECT (ito ang kulang mo)
          if (finalUser.role === "admin") {
            this.$router.push("/admin-dashboard");

          } else if (finalUser.role === "instructor") {
            this.$router.push("/instructor-dashboard");

          } else if (finalUser.role === "trainer") {
            this.$router.push("/trainer-dashboard"); // ⭐ ITO ANG GUSTO MO

          } else {
            // student/user
            const home =
              finalUser.track === "tesda"
                ? "/tesda-dashboard"
                : "/student-dashboard";

            this.$router.push(home);
          }

      } catch (err) {
        console.error("Login error:", err);
        this.message = {
          text: "Network error. Please check your connection and try again.",
          type: "error",
        };
      } finally {
        this.isLoading = false;
      }
    },

    handleGoogleLogin() {
      if (this.isLoading) return;
      console.log("Google login clicked");
    },
  },

  mounted() {
    this.readTrackFromQuery();

    // OPTIONAL: don't auto-redirect based on stale localStorage
    // If you want auto-redirect, better to call /api/auth/check and decide from server.
  },

  watch: {
    "$route.query.track"() {
      this.readTrackFromQuery();
    },
  },
};
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

/* Smooth spinner animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>