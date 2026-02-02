<template>
  <div class="min-h-screen relative overflow-hidden">

    <!-- BACKGROUND IMAGE -->
    <img
      src="/background.png"
      alt="Background"
      class="absolute inset-0 w-full h-full object-cover blur-sm brightness 100"
    />

    <!-- CONTENT WRAPPER -->
    <div class="relative z-10 bg-gray-100/80 min-h-screen flex flex-col">

      <!-- Header -->
      <header class="bg-green-800 text-white px-8 py-5 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">E-FACET</h1>
          <p class="text-sm opacity-90">Enrollment & Training Portal</p>
        </div>
        <router-link
          to="/login"
          class="bg-white text-green-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-100"
        >
          Login
        </router-link>
      </header>

      <!-- Main -->
      <main class="flex-1 flex items-center justify-center px-6">
        <div class="max-w-4xl w-full grid md:grid-cols-2 gap-6">

          <!-- TESDA -->
          <div class="bg-white rounded-xl shadow p-6 border-t-8 border-blue-600">
            <h2 class="text-xl font-bold text-blue-700 mb-2">TESDA Program</h2>
            <p class="text-gray-600 mb-4">
              For TESDA scholars and trainees. Includes requirements upload,
              training schedule, assessment, and certificates.
            </p>

            <div class="flex gap-3">
              <router-link
                to="/signup?track=tesda"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Sign Up
              </router-link>
              <router-link
                to="/login?track=tesda"
                class="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
              >
                Login
              </router-link>
            </div>
          </div>

          <!-- DRIVING -->
          <div class="bg-white rounded-xl shadow p-6 border-t-8 border-green-600">
            <h2 class="text-xl font-bold text-green-700 mb-2">Driving Course</h2>
            <p class="text-gray-600 mb-4">
              For driving students. Includes course enrollment, schedules,
              mock exams, attendance, and certificates.
            </p>

            <div class="flex gap-3">
              <router-link
                to="/signup?track=driving"
                class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Sign Up
              </router-link>
              <router-link
                to="/login?track=driving"
                class="border border-green-600 text-green-600 px-4 py-2 rounded-md hover:bg-green-50"
              >
                Login
              </router-link>
            </div>
          </div>

        </div>
      </main>

      <!-- Footer -->
      <footer class="text-center text-sm text-gray-600 py-4">
        © {{ new Date().getFullYear() }} E-FACET • TESDA & Driving Course System
      </footer>

    </div>
  </div>
</template>