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

      <form @submit.prevent="handleLogin" class="space-y-4" id="loginForm" name="loginForm">
        <!-- Username/Email Field -->
        <div>
          <label class="text-sm text-gray-700" for="username">Username / Email:</label>
          <input
            id="username"
            name="username"
            type="text"
            v-model="formData.username"
            autocomplete="username"
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
          <label class="text-sm text-gray-700" for="password">Password:</label>
          <input
            id="password"
            name="password"
            type="password"
            v-model="formData.password"
            autocomplete="current-password"
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

      try {
        const payload = {
          username: this.formData.username.trim(),
          password: this.formData.password,
          track: this.track, // ok kahit admin/instructor; backend ignores
        };

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await res.json();

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

        // ✅ IMPORTANT: use backend redirect (single source of truth)
        if (data.redirect) {
          this.$router.push(data.redirect);
        } else {
          // fallback just in case
          this.$router.push("/login");
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
</style>