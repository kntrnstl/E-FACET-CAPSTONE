<!-- frontend/src/components/AdminReports.vue (FULL) -->
<template>
  <AdminLayout>
    <!-- Header-left: search only (shared local search, NOT a global backend filter) -->
    <template #header-left>
      <input
        type="text"
        placeholder="Search in tables..."
        v-model="searchQuery"
        class="w-1/3 p-2 rounded-md text-gray-800 focus:outline-none"
      />
    </template>

    <div class="space-y-6">
      <!-- PAGE HEADER -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold text-green-800">📈 Analytics & Reports</h2>
          <p class="text-xs text-gray-500">
            Descriptive = what happened • Predictive = what may happen next (trend-based).
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            @click="openExplainModal()"
            class="border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            🧠 How Analytics Works
          </button>

          <button
            @click="exportAll('pdf')"
            class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            📄 Export PDF (All)
          </button>

          <button
            @click="exportAll('xlsx')"
            class="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
          >
            📊 Export Excel (All)
          </button>
        </div>
      </div>

      <!-- TOP SUMMARY (always visible) -->
      <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div class="bg-green-50 p-4 rounded-lg border border-green-100">
          <p class="text-sm text-green-700 font-medium">Total Enrolled</p>
          <h3 class="text-2xl font-bold text-green-800 mt-1">{{ summary.totalEnrolled }}</h3>
          <p class="text-xs text-gray-500 mt-1">Descriptive</p>
        </div>

        <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p class="text-sm text-blue-700 font-medium">Most Popular Course</p>
          <h3 class="text-lg font-bold text-blue-800 mt-1">{{ summary.mostPopularCourse || "-" }}</h3>
          <p class="text-xs text-gray-500 mt-1">Descriptive</p>
        </div>

        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <p class="text-sm text-yellow-700 font-medium">Completion Rate</p>
          <h3 class="text-2xl font-bold text-yellow-800 mt-1">{{ summary.completionRate }}%</h3>
          <p class="text-xs text-gray-500 mt-1">Descriptive</p>
        </div>

        <div class="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <p class="text-sm text-orange-700 font-medium">Certificates Issued</p>
          <h3 class="text-2xl font-bold text-orange-800 mt-1">{{ summary.certIssued }}</h3>
          <p class="text-xs text-gray-500 mt-1">Descriptive</p>
        </div>

        <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <p class="text-sm text-emerald-700 font-medium">💰 Verified Revenue</p>
          <h3 class="text-2xl font-bold text-emerald-800 mt-1">
            {{ formatCurrency(summary.totalRevenuePeso) }}
          </h3>
          <p class="text-xs text-gray-500 mt-1">Descriptive</p>
        </div>

        <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <p class="text-sm text-purple-700 font-medium">🔮 Forecast (Enrollments)</p>
          <h3 class="text-2xl font-bold text-purple-800 mt-1">{{ forecast.nextForecast }}</h3>
          <p class="text-xs text-gray-500 mt-1">Predictive • Range: {{ forecast.low }}–{{ forecast.high }}</p>
        </div>
      </div>

      <!-- TABS -->
      <div class="flex flex-wrap gap-2">
        <button
          class="px-3 py-2 rounded-md text-sm font-medium border"
          :class="activeTab==='overview' ? tabActive : tabInactive"
          @click="activeTab='overview'"
        >
          Overview
        </button>

        <button
          class="px-3 py-2 rounded-md text-sm font-medium border"
          :class="activeTab==='revenue' ? tabActive : tabInactive"
          @click="activeTab='revenue'"
        >
          Revenue
        </button>

        <button
          class="px-3 py-2 rounded-md text-sm font-medium border"
          :class="activeTab==='detailed' ? tabActive : tabInactive"
          @click="activeTab='detailed'"
        >
          Detailed Reports
        </button>

        <button
          class="px-3 py-2 rounded-md text-sm font-medium border"
          :class="activeTab==='exams' ? tabActive : tabInactive"
          @click="activeTab='exams'"
        >
          Exams
        </button>
      </div>

      <!-- ===================== OVERVIEW ===================== -->
      <div v-if="activeTab === 'overview'" class="space-y-6">
        <!-- OVERVIEW FILTERS -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div class="flex flex-wrap gap-4">
              <DateRangePicker
                v-model:range="overviewFilters.dateRange"
                v-model:from="overviewFilters.customFrom"
                v-model:to="overviewFilters.customTo"
              />

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Course (Trend)</label>
                <select v-model="overviewFilters.courseId" class="w-56 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All courses</option>
                  <option v-for="c in courses" :key="c.id" :value="String(c.id)">
                    {{ c.course_name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Trend Period</label>
                <div class="flex gap-1">
                  <button
                    @click="setTrendPeriod('day')"
                    :class="trendPeriod==='day' ? btnActive : btnInactive"
                    class="text-sm px-2 py-1 rounded"
                  >Day</button>

                  <button
                    @click="setTrendPeriod('week')"
                    :class="trendPeriod==='week' ? btnActive : btnInactive"
                    class="text-sm px-2 py-1 rounded"
                  >Week</button>

                  <button
                    @click="setTrendPeriod('month')"
                    :class="trendPeriod==='month' ? btnActive : btnInactive"
                    class="text-sm px-2 py-1 rounded"
                  >Month</button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Forecast Horizon</label>
                <select v-model="forecastHorizon" class="w-44 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="next">Next Period</option>
                  <option value="next2">Next 2 Periods</option>
                  <option value="next3">Next 3 Periods</option>
                </select>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 items-end">
              <select v-model="overviewExportFormat" class="p-2 border border-gray-300 rounded-md text-sm">
                <option value="xlsx">Excel</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>

              <button
                @click="reloadOverview()"
                class="px-3 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 text-sm font-medium"
              >
                Apply
              </button>

              <button
                @click="exportSection('overview', overviewExportFormat)"
                class="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm font-medium"
              >
                📤 Export Overview
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <p class="text-xs text-gray-500">Last updated: {{ lastUpdated }}</p>
            <div class="flex gap-2">
              <button @click="downloadChartImage('trend')" class="text-xs px-3 py-2 border rounded hover:bg-gray-50">🖼️ Trend PNG</button>
              <button @click="downloadChartImage('topCourses')" class="text-xs px-3 py-2 border rounded hover:bg-gray-50">🖼️ Top Courses PNG</button>
              <button @click="downloadChartImage('gender')" class="text-xs px-3 py-2 border rounded hover:bg-gray-50">🖼️ Gender PNG</button>
            </div>
          </div>

          <div v-if="overviewError" class="mt-3 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
            {{ overviewError }}
          </div>
        </div>

        <!-- OVERVIEW CHARTS -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Enrollment Trend -->
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 class="text-green-800 font-semibold">Enrollment Trend</h3>
                <p class="text-xs text-gray-500">
                  Course = {{ overviewFilters.courseId ? courseNameById(overviewFilters.courseId) : 'All' }}
                </p>
              </div>
              <button @click="openExplainModal('trend')" class="text-xs px-3 py-2 border rounded hover:bg-gray-50">
                🧠 Explain
              </button>
            </div>

            <div class="h-64">
              <canvas ref="trendCanvas"></canvas>
            </div>

            <div class="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
              <p class="text-xs text-gray-600">
                Forecast = moving average + slope blend. Range band = recent error spread.
              </p>
              <p v-if="overviewLoading" class="text-xs text-gray-500 mt-2">Loading overview…</p>
            </div>
          </div>

          <!-- Top Courses -->
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 class="text-green-800 font-semibold">Top Courses</h3>
                <p class="text-xs text-gray-500">Distribution of enrollments</p>
              </div>
              <div class="flex gap-2">
                <button
                  @click="exportSection('topCourses', overviewExportFormat)"
                  class="text-xs px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  📤 Export
                </button>
                <button @click="openExplainModal('topCourses')" class="text-xs px-3 py-2 border rounded hover:bg-gray-50">
                  🧠 Explain
                </button>
              </div>
            </div>

            <div class="h-64">
              <canvas ref="topCoursesCanvas"></canvas>
            </div>
          </div>

          <!-- Gender Distribution -->
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 class="text-green-800 font-semibold">Students by Gender</h3>
                <p class="text-xs text-gray-500">Descriptive breakdown</p>
              </div>
              <button @click="openExplainModal('gender')" class="text-xs px-3 py-2 border rounded hover:bg-gray-50">
                🧠 Explain
              </button>
            </div>

            <div class="h-64">
              <canvas ref="genderCanvas"></canvas>
            </div>
          </div>

          <!-- Course Monthly Summary -->
          <div class="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 class="text-green-800 font-semibold">Course Enrollments per Month</h3>
                <p class="text-xs text-gray-500">Example: PDC = 3 enrollments this month</p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="exportSection('courseMonthly', overviewExportFormat)"
                  class="text-xs px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  📤 Export
                </button>
                <button @click="openExplainModal('courseMonthly')" class="text-xs px-3 py-2 border rounded hover:bg-gray-50">
                  🧠 Explain
                </button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full border border-gray-200 text-sm">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="py-2 px-3 text-left">Month</th>
                    <th class="py-2 px-3 text-left">Course</th>
                    <th class="py-2 px-3 text-left">Enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(r, i) in courseMonthlyPreview"
                    :key="i"
                    class="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td class="py-2 px-3">{{ r.month_label || "-" }}</td>
                    <td class="py-2 px-3">{{ r.course_name || "-" }}</td>
                    <td class="py-2 px-3 font-semibold">{{ r.count ?? 0 }}</td>
                  </tr>

                  <tr v-if="!overviewLoading && courseMonthlyPreview.length === 0">
                    <td colspan="3" class="py-6 text-center text-gray-500">No data</td>
                  </tr>

                  <tr v-if="overviewLoading">
                    <td colspan="3" class="py-6 text-center text-gray-500">Loading…</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="text-xs text-gray-500 mt-3">
              Tip: Export to Excel para full dataset (hindi lang preview).
            </p>
          </div>
        </div>
      </div>

      <!-- ===================== REVENUE ===================== -->
      <div v-else-if="activeTab === 'revenue'" class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h3 class="text-green-800 font-semibold">💰 Revenue Analytics</h3>
              <p class="text-xs text-gray-500">Filters here affect revenue only (no global filters).</p>
            </div>

            <div class="flex flex-wrap gap-3 items-end">
              <DateRangePicker
                v-model:range="revenueTabFilters.dateRange"
                v-model:from="revenueTabFilters.customFrom"
                v-model:to="revenueTabFilters.customTo"
              />

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Course</label>
                <select v-model="revenueTabFilters.courseId" class="w-56 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All</option>
                  <option v-for="c in courses" :key="c.id" :value="String(c.id)">
                    {{ c.course_name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Payment Status</label>
                <select v-model="revenueTabFilters.status" class="w-44 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="FOR_VERIFICATION">FOR_VERIFICATION</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
                <select v-model="revenueTabFilters.payment_method" class="w-40 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All</option>
                  <option value="GCASH">GCASH</option>
                  <option value="CASH">CASH</option>
                </select>
              </div>

              <select v-model="revenueExportFormat" class="w-32 p-2 border border-gray-300 rounded-md text-sm">
                <option value="xlsx">Excel</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
              </select>

              <button @click="reloadRevenue()" class="text-sm px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800">
                Apply
              </button>

              <button @click="exportSection('revenue', revenueExportFormat)" class="text-sm px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                📤 Export Revenue
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <p class="text-sm text-emerald-700 font-medium">Verified Revenue</p>
              <h3 class="text-2xl font-bold text-emerald-800 mt-1">
                {{ formatCurrency(revenueStats.verifiedRevenuePeso) }}
              </h3>
            </div>
            <div class="bg-green-50 p-4 rounded-lg border border-green-100">
              <p class="text-sm text-green-700 font-medium">Verified Payments</p>
              <h3 class="text-2xl font-bold text-green-800 mt-1">{{ revenueStats.verifiedCount }}</h3>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p class="text-sm text-purple-700 font-medium">Forecast Revenue (Next)</p>
              <h3 class="text-2xl font-bold text-purple-800 mt-1">
                {{ formatCurrency(revenueStats.forecastRevenuePeso) }}
              </h3>
            </div>
          </div>

          <div v-if="revenueError" class="mt-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
            {{ revenueError }}
          </div>
        </div>

        <!-- Revenue Table -->
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-3">
            <div>
              <h4 class="text-green-800 font-semibold">Payments (preview)</h4>
              <p class="text-xs text-gray-500">Search uses the header search (local filter only).</p>
            </div>

            <div class="flex flex-wrap gap-3 items-end">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Rows per page</label>
                <select v-model.number="revenuePageSize" class="w-28 p-2 border border-gray-300 rounded-md text-sm">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>

              <div class="text-xs text-gray-600">
                Showing {{ revenuePageStart }}–{{ revenuePageEnd }} of {{ revenueFiltered.length }}
              </div>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200 text-sm">
              <thead class="bg-gray-200">
                <tr>
                  <th class="py-2 px-3 text-left">Payment Ref</th>
                  <th class="py-2 px-3 text-left">Student</th>
                  <th class="py-2 px-3 text-left">Course</th>
                  <th class="py-2 px-3 text-left">Method</th>
                  <th class="py-2 px-3 text-left">Amount</th>
                  <th class="py-2 px-3 text-left">Status</th>
                  <th class="py-2 px-3 text-left">Verified At</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="p in revenuePaginated"
                  :key="p.payment_ref || `${p.id}-${p.created_at}`"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="py-2 px-3">{{ p.payment_ref || '-' }}</td>
                  <td class="py-2 px-3">{{ p.fullname || '-' }}</td>
                  <td class="py-2 px-3">{{ p.course_name || '-' }}</td>
                  <td class="py-2 px-3">{{ normalizePaymentMethod(p.payment_method) || '-' }}</td>
                  <td class="py-2 px-3">{{ formatCurrency(p.amount_peso || 0) }}</td>
                  <td class="py-2 px-3">{{ p.status || '-' }}</td>
                  <td class="py-2 px-3">{{ p.verified_at ? formatDate(p.verified_at) : '-' }}</td>
                </tr>

                <tr v-if="!revenueLoading && revenueFiltered.length === 0">
                  <td colspan="7" class="py-6 text-center text-gray-500">No payments loaded</td>
                </tr>

                <tr v-if="revenueLoading">
                  <td colspan="7" class="py-6 text-center text-gray-500">Loading payments…</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="revenueTotalPages > 1" class="mt-4 flex justify-between items-center">
            <button
              class="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              :disabled="revenuePage === 1"
              @click="revenuePage--"
            >
              ← Prev
            </button>

            <div class="flex gap-1 flex-wrap justify-center">
              <button
                v-for="p in revenuePageButtons"
                :key="p"
                class="px-3 py-2 border rounded text-sm"
                :class="p === revenuePage ? 'bg-green-700 text-white border-green-700' : 'hover:bg-gray-50'"
                @click="revenuePage = p"
              >
                {{ p }}
              </button>
            </div>

            <button
              class="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              :disabled="revenuePage === revenueTotalPages"
              @click="revenuePage++"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- ===================== DETAILED REPORTS ===================== -->
      <div v-else-if="activeTab === 'detailed'" class="space-y-6">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div class="flex flex-wrap gap-4">
              <DateRangePicker
                v-model:range="detailedTabFilters.dateRange"
                v-model:from="detailedTabFilters.customFrom"
                v-model:to="detailedTabFilters.customTo"
              />

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select v-model="detailedTabFilters.courseId" class="w-56 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All</option>
                  <option v-for="c in courses" :key="c.id" :value="String(c.id)">
                    {{ c.course_name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Group by</label>
                <select v-model="detailedTabFilters.groupBy" class="w-44 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="raw">Raw</option>
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Reservation Status</label>
                <select v-model="detailedTabFilters.status" class="w-44 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DONE">DONE</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select v-model="detailedTabFilters.source" class="w-36 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All</option>
                  <option value="ONLINE">ONLINE</option>
                  <option value="WALKIN">WALKIN</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select v-model="detailedTabFilters.payment_method" class="w-36 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All</option>
                  <option value="GCASH">GCASH</option>
                  <option value="CASH">CASH</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sort</label>
                <select v-model="detailedTabFilters.sort" class="w-44 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="created_desc">Created (newest)</option>
                  <option value="created_asc">Created (oldest)</option>
                  <option value="name_asc">Name (A–Z)</option>
                  <option value="name_desc">Name (Z–A)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Export format</label>
                <select v-model="detailedExportFormat" class="w-32 p-2 border border-gray-300 rounded-md text-sm">
                  <option value="xlsx">Excel</option>
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>

            <div class="flex flex-wrap gap-2 items-end">
              <button @click="reloadDetailed()" class="text-sm px-3 py-2 bg-green-700 text-white rounded hover:bg-green-800">
                Apply
              </button>

              <button @click="exportSection('detailed', detailedExportFormat)" class="text-sm px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                📤 Export Detailed
              </button>

              <button @click="columnsOpen = !columnsOpen" class="text-sm px-3 py-2 border rounded hover:bg-gray-50">
                {{ columnsOpen ? 'Hide' : 'Show' }} Columns
              </button>
            </div>
          </div>

          <div v-if="columnsOpen" class="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p class="text-xs text-gray-600 mb-2 font-semibold">Column visibility</p>
            <div class="flex flex-wrap gap-4 text-sm">
              <label v-for="col in columnOptions" :key="col.key" class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="visibleColumns[col.key]" />
                <span>{{ col.label }}</span>
              </label>
            </div>
          </div>

          <div v-if="detailedError" class="mt-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">
            {{ detailedError }}
          </div>
        </div>

        <!-- Detailed Table -->
        <div class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h3 class="text-lg font-bold text-green-800">📋 Detailed Reports</h3>
              <p class="text-xs text-gray-500">
                GroupBy controls backend aggregation. Search is local (header search).
              </p>
            </div>

            <div class="flex flex-wrap gap-3 items-end">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">Rows per page</label>
                <select v-model.number="detailedPageSize" class="w-28 p-2 border border-gray-300 rounded-md text-sm">
                  <option :value="10">10</option>
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
              </div>

              <div class="text-xs text-gray-600">
                Showing {{ detailedPageStart }}–{{ detailedPageEnd }} of {{ detailedFiltered.length }}
              </div>
            </div>
          </div>

          <table class="min-w-full border border-gray-200 text-sm">
            <thead class="bg-gray-200 text-gray-900">
              <tr>
                <th class="py-2 px-3 text-left">No.</th>
                <th v-if="visibleColumns.client_id" class="py-2 px-3 text-left">Client ID</th>
                <th v-if="visibleColumns.fullname" class="py-2 px-3 text-left">Full Name</th>
                <th v-if="visibleColumns.birthday" class="py-2 px-3 text-left">Birthdate</th>
                <th v-if="visibleColumns.gender" class="py-2 px-3 text-left">Sex</th>

                <th v-if="visibleColumns.instructor_name" class="py-2 px-3 text-left">Instructor</th>
                <th v-if="visibleColumns.course_name" class="py-2 px-3 text-left">Course</th>
                <th v-if="visibleColumns.course_start" class="py-2 px-3 text-left">Course Start</th>
                <th v-if="visibleColumns.course_end" class="py-2 px-3 text-left">Course End</th>

                <th v-if="visibleColumns.dl_code" class="py-2 px-3 text-left">DL Code</th>
                <th v-if="visibleColumns.training_purpose" class="py-2 px-3 text-left">Training Purpose</th>
                <th v-if="visibleColumns.municipality" class="py-2 px-3 text-left">Municipality</th>

                <th v-if="visibleColumns.reservation_status" class="py-2 px-3 text-left">Status</th>
                <th v-if="visibleColumns.reservation_source" class="py-2 px-3 text-left">Source</th>
                <th v-if="visibleColumns.payment_method" class="py-2 px-3 text-left">Payment</th>
                <th v-if="visibleColumns.created_at" class="py-2 px-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(row, idx) in detailedPaginated"
                :key="row.reservation_id || row.group_key || idx"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="py-2 px-3">{{ detailedPageStart + idx }}</td>

                <td v-if="visibleColumns.client_id" class="py-2 px-3">{{ row.client_id || '-' }}</td>
                <td v-if="visibleColumns.fullname" class="py-2 px-3">{{ row.fullname || row.group_label || '-' }}</td>
                <td v-if="visibleColumns.birthday" class="py-2 px-3">{{ row.birthday ? formatDateShort(row.birthday) : '-' }}</td>
                <td v-if="visibleColumns.gender" class="py-2 px-3">
                  {{ row.gender ? (String(row.gender).toLowerCase() === 'male' ? 'M' : 'F') : '-' }}
                </td>

                <td v-if="visibleColumns.instructor_name" class="py-2 px-3">{{ row.instructor_name || '-' }}</td>
                <td v-if="visibleColumns.course_name" class="py-2 px-3">{{ row.course_name || '-' }}</td>
                <td v-if="visibleColumns.course_start" class="py-2 px-3">{{ row.course_start ? formatDate(row.course_start) : '-' }}</td>
                <td v-if="visibleColumns.course_end" class="py-2 px-3">{{ row.course_end ? formatDate(row.course_end) : '-' }}</td>

                <td v-if="visibleColumns.dl_code" class="py-2 px-3">{{ row.dl_code || '-' }}</td>
                <td v-if="visibleColumns.training_purpose" class="py-2 px-3">{{ row.training_purpose || '-' }}</td>
                <td v-if="visibleColumns.municipality" class="py-2 px-3">{{ row.municipality || '-' }}</td>

                <td v-if="visibleColumns.reservation_status" class="py-2 px-3">
                  <span class="px-2 py-1 rounded text-xs" :class="statusBadge(row.reservation_status)">
                    {{ row.reservation_status || '-' }}
                  </span>
                </td>
                <td v-if="visibleColumns.reservation_source" class="py-2 px-3">{{ row.reservation_source || '-' }}</td>
                <td v-if="visibleColumns.payment_method" class="py-2 px-3">{{ normalizePaymentMethod(row.payment_method) || '-' }}</td>
                <td v-if="visibleColumns.created_at" class="py-2 px-3">{{ row.created_at ? formatDate(row.created_at) : '-' }}</td>
              </tr>

              <tr v-if="!detailedLoading && detailedFiltered.length === 0">
                <td :colspan="detailedColspan" class="py-8 text-center text-gray-500">No data for your filters</td>
              </tr>

              <tr v-if="detailedLoading">
                <td :colspan="detailedColspan" class="py-8 text-center text-gray-500">Loading detailed reports…</td>
              </tr>
            </tbody>
          </table>

          <div v-if="detailedTotalPages > 1" class="p-4 flex justify-between items-center">
            <button
              class="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              :disabled="detailedPage === 1"
              @click="detailedPage--"
            >
              ← Prev
            </button>

            <div class="flex gap-1 flex-wrap justify-center">
              <button
                v-for="p in detailedPageButtons"
                :key="p"
                class="px-3 py-2 border rounded text-sm"
                :class="p === detailedPage ? 'bg-green-700 text-white border-green-700' : 'hover:bg-gray-50'"
                @click="detailedPage = p"
              >
                {{ p }}
              </button>
            </div>

            <button
              class="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              :disabled="detailedPage === detailedTotalPages"
              @click="detailedPage++"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <!-- ===================== EXAMS ===================== -->
      <div v-else class="space-y-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-green-800 font-semibold">🧑‍🏫 Exam Analytics</h3>
              <p class="text-xs text-gray-500">Placeholder (backend later)</p>
            </div>
            <button @click="examOpen = !examOpen" class="text-sm px-3 py-1 border rounded hover:bg-gray-50">
              {{ examOpen ? 'Hide' : 'Show' }} Exam Section
            </button>
          </div>

          <div v-if="examOpen" class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-green-50 p-5 rounded-lg border border-green-100 text-center">
                <p class="text-sm text-green-700 font-medium">Passing Rate</p>
                <h3 class="text-3xl font-bold text-green-800 mt-1">{{ examStats.passingRate }}%</h3>
                <p class="text-xs text-gray-500 mt-2">Placeholder</p>
              </div>
              <div class="bg-blue-50 p-5 rounded-lg border border-blue-100 text-center">
                <p class="text-sm text-blue-700 font-medium">Highest Score</p>
                <h3 class="text-3xl font-bold text-blue-800 mt-1">{{ examStats.highestScore }}%</h3>
                <p class="text-xs text-gray-500 mt-2">Placeholder</p>
              </div>
              <div class="bg-red-50 p-5 rounded-lg border border-red-100 text-center">
                <p class="text-sm text-red-700 font-medium">Below Passing</p>
                <h3 class="text-3xl font-bold text-red-800 mt-1">{{ examStats.belowPassing }}%</h3>
                <p class="text-xs text-gray-500 mt-2">Placeholder</p>
              </div>
            </div>

            <div class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p class="text-sm text-gray-700 font-semibold mb-1">Backend later</p>
              <p class="text-xs text-gray-600">
                We'll connect to exam_results: passing rate, distribution, instructor/course performance.
              </p>
            </div>
          </div>

          <div v-else class="mt-6 text-sm text-gray-500">
            Exam section hidden. Click “Show Exam Section”.
          </div>
        </div>
      </div>
    </div>

    <!-- EXPLAIN MODAL -->
    <ExplainModal
      :open="explainOpen"
      :focus="explainFocus"
      :trend="trend"
      :forecast="forecast"
      :gender="gender"
      :topCourses="topCourses"
      @close="explainOpen=false"
    />
  </AdminLayout>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import Chart from "chart.js/auto";
import AdminLayout from "./AdminLayout.vue";

// ✅ External components (NO JSX)
import DateRangePicker from "./DateRangePicker.vue";
import ExplainModal from "./ExplainModal.vue";

export default {
  name: "AdminReports",
  components: { AdminLayout, DateRangePicker, ExplainModal },
  setup() {
    // UI
    const activeTab = ref("overview");
    const examOpen = ref(false);
    const columnsOpen = ref(false);
    const explainOpen = ref(false);
    const explainFocus = ref("");

    const tabActive = "bg-green-700 text-white border-green-700";
    const tabInactive = "bg-white text-gray-700 border-gray-200 hover:bg-gray-50";
    const btnActive = "bg-green-700 text-white";
    const btnInactive = "bg-gray-100 text-gray-700 hover:bg-green-200";

    // Search (local only)
    const searchQuery = ref("");
    const debouncedQuery = ref("");
    let t = null;
    watch(searchQuery, (v) => {
      clearTimeout(t);
      t = setTimeout(() => {
        debouncedQuery.value = String(v || "").trim().toLowerCase();
      }, 250);
    });

    // Filters (per tab)
    const overviewFilters = reactive({
      dateRange: "thisMonth",
      customFrom: "",
      customTo: "",
      courseId: "",
    });

    const revenueTabFilters = reactive({
      dateRange: "thisMonth",
      customFrom: "",
      customTo: "",
      courseId: "",
      status: "",
      payment_method: "",
    });

    const detailedTabFilters = reactive({
      dateRange: "thisMonth",
      customFrom: "",
      customTo: "",
      courseId: "",
      groupBy: "raw",
      status: "",
      source: "",
      payment_method: "",
      sort: "created_desc",
    });

    // Config
    const trendPeriod = ref("month");
    const forecastHorizon = ref("next");
    const overviewExportFormat = ref("xlsx");
    const revenueExportFormat = ref("xlsx");
    const detailedExportFormat = ref("xlsx");

    // Data
    const courses = ref([]);
    const summary = reactive({
      totalEnrolled: 0,
      mostPopularCourse: "",
      completionRate: 0,
      certIssued: 0,
      totalRevenuePeso: 0,
    });

    const trend = reactive({ labels: [], values: [] });
    const topCourses = reactive({ labels: [], values: [] });
    const gender = reactive({ labels: ["Male", "Female"], values: [0, 0] });
    const courseMonthlyPreview = ref([]);

    const forecast = reactive({ nextForecast: 0, low: 0, high: 0 });

    const revenueStats = reactive({
      verifiedCount: 0,
      avgFeePeso: 0,
      verifiedRevenuePeso: 0,
      forecastRevenuePeso: 0,
    });

    const revenuePayments = ref([]);
    const detailedRows = ref([]);

    const overviewLoading = ref(false);
    const revenueLoading = ref(false);
    const detailedLoading = ref(false);

    const overviewError = ref("");
    const revenueError = ref("");
    const detailedError = ref("");

    // Charts
    const trendCanvas = ref(null);
    const topCoursesCanvas = ref(null);
    const genderCanvas = ref(null);

    const trendChart = ref(null);
    const topCoursesChart = ref(null);
    const genderChart = ref(null);

    // Pagination
    const revenuePage = ref(1);
    const revenuePageSize = ref(25);
    const detailedPage = ref(1);
    const detailedPageSize = ref(25);

    // Columns
    const columnOptions = [
      { key: "client_id", label: "Client ID" },
      { key: "fullname", label: "Full Name" },
      { key: "birthday", label: "Birthdate" },
      { key: "gender", label: "Sex" },
      { key: "instructor_name", label: "Instructor" },
      { key: "course_name", label: "Course" },
      { key: "course_start", label: "Course Start" },
      { key: "course_end", label: "Course End" },
      { key: "dl_code", label: "DL Code" },
      { key: "training_purpose", label: "Training Purpose" },
      { key: "municipality", label: "Municipality" },
      { key: "reservation_status", label: "Status" },
      { key: "reservation_source", label: "Source" },
      { key: "payment_method", label: "Payment" },
      { key: "created_at", label: "Created" },
    ];

    const visibleColumns = reactive({
      client_id: true,
      fullname: true,
      birthday: true,
      gender: true,
      instructor_name: true,
      course_name: true,
      course_start: false,
      course_end: false,
      dl_code: false,
      training_purpose: false,
      municipality: true,
      reservation_status: true,
      reservation_source: false,
      payment_method: true,
      created_at: true,
    });

    const detailedColspan = computed(() => 1 + Object.values(visibleColumns).filter(Boolean).length);

    // Exams placeholder
    const examStats = reactive({ passingRate: 0, highestScore: 0, belowPassing: 0 });

    const lastUpdated = computed(() => {
      const now = new Date();
      return now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    });

    // Helpers
    function formatCurrency(amount) {
      const n = Number(amount || 0);
      return "₱" + n.toLocaleString("en-PH");
    }

    function formatDate(dateString) {
      if (!dateString) return "-";
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    function formatDateShort(dateString) {
      if (!dateString) return "-";
      const d = new Date(dateString);
      if (Number.isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
    }

    function statusBadge(status) {
      const s = String(status || "").toUpperCase();
      if (s.includes("APPROVED") || s.includes("CONFIRMED") || s.includes("ACTIVE") || s.includes("DONE"))
        return "bg-green-100 text-green-700";
      if (s.includes("PENDING") || s.includes("FOR")) return "bg-yellow-100 text-yellow-700";
      if (s.includes("REJECT") || s.includes("CANCEL") || s.includes("FAILED")) return "bg-red-100 text-red-700";
      return "bg-gray-100 text-gray-700";
    }

    function normalizePaymentMethod(v) {
      const s = String(v || "").trim().toUpperCase();
      if (!s) return "";
      if (s.includes("G-CASH") || s.includes("GCASH")) return "GCASH";
      if (s.includes("CASH")) return "CASH";
      return s;
    }

function toISODateLocal(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

    function getRangeDates(range, customFrom, customTo) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = today.getMonth();

      if (range === "custom") return { from: customFrom, to: customTo };
if (range === "thisMonth") return { from: toISODateLocal(new Date(yyyy, mm, 1)), to: toISODateLocal(today) };

if (range === "lastMonth") return {
  from: toISODateLocal(new Date(yyyy, mm - 1, 1)),
  to: toISODateLocal(new Date(yyyy, mm, 0)),
};

if (range === "thisQuarter") {
  const qStart = Math.floor(mm / 3) * 3;
  return { from: toISODateLocal(new Date(yyyy, qStart, 1)), to: toISODateLocal(today) };
}

return { from: toISODateLocal(new Date(yyyy, 0, 1)), to: toISODateLocal(today) };
    }

    function courseNameById(id) {
      const c = (courses.value || []).find((x) => String(x.id) === String(id));
      return c?.course_name || "-";
    }

    // Predictive
    function computeForecast(values) {
      const v = (values || []).map((x) => Number(x || 0)).filter((x) => Number.isFinite(x));
      if (v.length === 0) return 0;
      if (v.length === 1) return Math.max(0, Math.round(v[0]));

      const N = Math.min(6, v.length);
      const tail = v.slice(-N);

      const maN = Math.min(3, v.length);
      const ma = v.slice(-maN).reduce((a, b) => a + b, 0) / maN;

      const xs = Array.from({ length: tail.length }, (_, i) => i + 1);
      const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
      const yMean = tail.reduce((a, b) => a + b, 0) / tail.length;

      let num = 0;
      let den = 0;
      for (let i = 0; i < tail.length; i++) {
        num += (xs[i] - xMean) * (tail[i] - yMean);
        den += (xs[i] - xMean) * (xs[i] - xMean);
      }
      const slope = den === 0 ? 0 : num / den;
      const trendForecast = tail[tail.length - 1] + slope;

      const blended = 0.6 * ma + 0.4 * trendForecast;
      return Math.max(0, Math.round(blended));
    }

    function forecastBand(values, pointForecast) {
      const v = (values || []).map((x) => Number(x || 0)).filter((x) => Number.isFinite(x));
      if (v.length < 3) return { low: Math.max(0, pointForecast - 2), high: pointForecast + 2 };

      const residuals = [];
      for (let i = 2; i < v.length; i++) {
        const ma = (v[i] + v[i - 1] + v[i - 2]) / 3;
        residuals.push(v[i] - ma);
      }
      const mean = residuals.reduce((a, b) => a + b, 0) / residuals.length;
      const varr = residuals.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, residuals.length - 1);
      const std = Math.sqrt(varr);

      const delta = Math.max(2, Math.round(1.2 * std));
      return { low: Math.max(0, pointForecast - delta), high: pointForecast + delta };
    }

    function computeForecastAndRevenueModel() {
      const base = computeForecast(trend.values);
      let f = base;
      if (forecastHorizon.value === "next2") f = base * 2;
      if (forecastHorizon.value === "next3") f = base * 3;

      forecast.nextForecast = f;
      const band = forecastBand(trend.values, f);
      forecast.low = band.low;
      forecast.high = band.high;

      const avgFee = Number(revenueStats.avgFeePeso || 0);
      revenueStats.forecastRevenuePeso = avgFee > 0 ? Math.round(avgFee * forecast.nextForecast) : 0;
    }

    // API
    async function apiGet(url) {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed: ${res.status}`);
      }
      return res.json();
    }

    function buildParams(tab, extra = {}) {
      let range, from, to, course_id;

      if (tab === "overview") {
        const r = getRangeDates(overviewFilters.dateRange, overviewFilters.customFrom, overviewFilters.customTo);
        range = overviewFilters.dateRange;
        from = r.from;
        to = r.to;
        course_id = overviewFilters.courseId || "";
      } else if (tab === "revenue") {
        const r = getRangeDates(revenueTabFilters.dateRange, revenueTabFilters.customFrom, revenueTabFilters.customTo);
        range = revenueTabFilters.dateRange;
        from = r.from;
        to = r.to;
        course_id = revenueTabFilters.courseId || "";
      } else {
        const r = getRangeDates(detailedTabFilters.dateRange, detailedTabFilters.customFrom, detailedTabFilters.customTo);
        range = detailedTabFilters.dateRange;
        from = r.from;
        to = r.to;
        course_id = detailedTabFilters.courseId || "";
      }

      const params = new URLSearchParams({
        from: from || "",
        to: to || "",
        course_id,
        ...extra,
      });

      if (range) params.set("date_range", range);
      return params;
    }

    // Loaders
    async function loadCourses() {
      try {
        const json = await apiGet(`/api/admin/courses`);
        courses.value = json.status === "success" ? json.data || [] : [];
      } catch {
        courses.value = [];
      }
    }

    async function loadOverview() {
      overviewLoading.value = true;
      overviewError.value = "";
      try {
        const qs = buildParams("overview", { period: trendPeriod.value });

        const [sum, tr, tc, g, monthly] = await Promise.all([
          apiGet(`/api/admin/reports/summary?${qs.toString()}`),
          apiGet(`/api/admin/reports/trend?${qs.toString()}`),
          apiGet(`/api/admin/reports/top-courses?${qs.toString()}`),
          apiGet(`/api/admin/reports/gender-breakdown?${qs.toString()}`),
          apiGet(`/api/admin/reports/course-monthly-preview?${qs.toString()}`),
        ]);

        if (sum.status === "success" && sum.data) {
          summary.totalEnrolled = Number(sum.data.totalEnrolled || 0);
          summary.mostPopularCourse = String(sum.data.mostPopularCourse || "");
          summary.completionRate = Number(sum.data.completionRate || 0);
          summary.certIssued = Number(sum.data.certIssued || 0);
          summary.totalRevenuePeso = Number(sum.data.totalRevenuePeso || 0);
        }

        if (tr.status === "success" && tr.data) {
          trend.labels = Array.isArray(tr.data.labels) ? tr.data.labels : [];
          trend.values = Array.isArray(tr.data.values) ? tr.data.values : [];
        } else {
          trend.labels = [];
          trend.values = [];
        }

        if (tc.status === "success" && tc.data) {
          topCourses.labels = Array.isArray(tc.data.labels) ? tc.data.labels : [];
          topCourses.values = Array.isArray(tc.data.values) ? tc.data.values : [];
        } else {
          topCourses.labels = [];
          topCourses.values = [];
        }

        if (g.status === "success" && g.data) {
          gender.labels = Array.isArray(g.data.labels) ? g.data.labels : ["Male", "Female"];
          gender.values = Array.isArray(g.data.values) ? g.data.values : [0, 0];
        } else {
          gender.labels = ["Male", "Female"];
          gender.values = [0, 0];
        }

        courseMonthlyPreview.value = monthly.status === "success" && Array.isArray(monthly.data) ? monthly.data : [];

        computeForecastAndRevenueModel();

        await nextTick();
if (activeTab.value === "overview") {
  refreshChartsOrInit();
}

        // ✅ FIX: wait DOM to render canvases, and only draw if tab is overview

      } catch (e) {
        overviewError.value = e?.message || "Failed to load overview.";
        trend.labels = [];
        trend.values = [];
        topCourses.labels = [];
        topCourses.values = [];
        gender.labels = ["Male", "Female"];
        gender.values = [0, 0];
        courseMonthlyPreview.value = [];

      } finally {
        overviewLoading.value = false;
      }
    }

    async function loadRevenue() {
      revenueLoading.value = true;
      revenueError.value = "";
      try {
        const qs = buildParams("revenue", {
          status: revenueTabFilters.status || "",
          payment_method: revenueTabFilters.payment_method
            ? normalizePaymentMethod(revenueTabFilters.payment_method)
            : "",
        });

        const json = await apiGet(`/api/admin/reports/revenue-preview?${qs.toString()}`);

        if (json.status === "success" && json.data) {
          revenueStats.verifiedCount = Number(json.data.verifiedCount || 0);
          revenueStats.avgFeePeso = Number(json.data.avgFeePeso || 0);
          revenueStats.verifiedRevenuePeso = Number(json.data.verifiedRevenuePeso || 0);
          revenuePayments.value = Array.isArray(json.data.payments) ? json.data.payments : [];
        } else {
          revenueStats.verifiedCount = 0;
          revenueStats.avgFeePeso = 0;
          revenueStats.verifiedRevenuePeso = 0;
          revenuePayments.value = [];
        }

        computeForecastAndRevenueModel();
      } catch (e) {
        revenueError.value = e?.message || "Failed to load revenue.";
        revenueStats.verifiedCount = 0;
        revenueStats.avgFeePeso = 0;
        revenueStats.verifiedRevenuePeso = 0;
        revenuePayments.value = [];
        computeForecastAndRevenueModel();
      } finally {
        revenueLoading.value = false;
      }
    }

    async function loadDetailed() {
      detailedLoading.value = true;
      detailedError.value = "";
      try {
        const qs = buildParams("detailed", {
          group_by: detailedTabFilters.groupBy,
          status: detailedTabFilters.status || "",
          source: detailedTabFilters.source || "",
          payment_method: detailedTabFilters.payment_method
            ? normalizePaymentMethod(detailedTabFilters.payment_method)
            : "",
        });

        const json = await apiGet(`/api/admin/reports/detailed?${qs.toString()}`);
        detailedRows.value = json.status === "success" ? (Array.isArray(json.data) ? json.data : []) : [];
      } catch (e) {
        detailedError.value = e?.message || "Failed to load detailed reports.";
        detailedRows.value = [];
      } finally {
        detailedLoading.value = false;
      }
    }

    async function reloadOverview() {
      revenuePage.value = 1;
      detailedPage.value = 1;
      await loadOverview();
    }
    async function reloadRevenue() {
      revenuePage.value = 1;
      await loadRevenue();
    }
    async function reloadDetailed() {
      detailedPage.value = 1;
      await loadDetailed();
    }

    async function setTrendPeriod(p) {
      trendPeriod.value = p;
      await loadOverview();
    }

    // Charts
    function destroyCharts() {
      if (trendChart.value) {
        trendChart.value.destroy();
        trendChart.value = null;
      }
      if (topCoursesChart.value) {
        topCoursesChart.value.destroy();
        topCoursesChart.value = null;
      }
      if (genderChart.value) {
        genderChart.value.destroy();
        genderChart.value = null;
      }
    }

function initCharts() {
  if (!trendCanvas.value || !topCoursesCanvas.value || !genderCanvas.value) return;

  if (trendChart.value) trendChart.value.destroy();
  if (topCoursesChart.value) topCoursesChart.value.destroy();
  if (genderChart.value) genderChart.value.destroy();

  trendChart.value = new Chart(trendCanvas.value, {
    type: "bar",
    data: {
      labels: [...(trend.labels || [])],
      datasets: [{ label: "Enrollments", data: [...(trend.values || [])], borderRadius: 4 }],
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  topCoursesChart.value = new Chart(topCoursesCanvas.value, {
    type: "pie",
    data: {
      labels: [...(topCourses.labels || [])],
      datasets: [{ data: [...(topCourses.values || [])] }],
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  genderChart.value = new Chart(genderCanvas.value, {
    type: "doughnut",
    data: {
      labels: [...(gender.labels || [])],
      datasets: [{ data: [...(gender.values || [])] }],
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}


function refreshChartsOrInit() {
  if (!trendCanvas.value || !topCoursesCanvas.value || !genderCanvas.value) return;

  // If charts not yet created → create them
  if (!trendChart.value || !topCoursesChart.value || !genderChart.value) {
    initCharts();
    return;
  }

  // Otherwise just update data
  trendChart.value.data.labels = [...(trend.labels || [])];
  trendChart.value.data.datasets[0].data = [...(trend.values || [])];
  trendChart.value.update();

  topCoursesChart.value.data.labels = [...(topCourses.labels || [])];
  topCoursesChart.value.data.datasets[0].data = [...(topCourses.values || [])];
  topCoursesChart.value.update();

  genderChart.value.data.labels = [...(gender.labels || [])];
  genderChart.value.data.datasets[0].data = [...(gender.values || [])];
  genderChart.value.update();
}


    function downloadChartImage(which) {
      const canvas =
        which === "trend"
          ? trendCanvas.value
          : which === "topCourses"
          ? topCoursesCanvas.value
          : which === "gender"
          ? genderCanvas.value
          : null;

      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `${which}-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    // Exports
    function exportAll(format) {
      const qs = buildParams("overview", { format, period: trendPeriod.value });
      window.open(`/api/admin/reports/export/all?${qs.toString()}`, "_blank");
    }

    function exportSection(section, format = "xlsx") {
      if (section === "overview") {
        const qs = buildParams("overview", { format, period: trendPeriod.value });
        window.open(`/api/admin/reports/export/overview?${qs.toString()}`, "_blank");
        return;
      }

      if (section === "topCourses") {
        const qs = buildParams("overview", { format });
        window.open(`/api/admin/reports/export/top-courses?${qs.toString()}`, "_blank");
        return;
      }

      if (section === "courseMonthly") {
        const qs = buildParams("overview", { format });
        window.open(`/api/admin/reports/export/course-monthly?${qs.toString()}`, "_blank");
        return;
      }

      if (section === "revenue") {
        const qs = buildParams("revenue", {
          format,
          status: revenueTabFilters.status || "",
          payment_method: revenueTabFilters.payment_method
            ? normalizePaymentMethod(revenueTabFilters.payment_method)
            : "",
        });
        window.open(`/api/admin/reports/export/revenue?${qs.toString()}`, "_blank");
        return;
      }

      if (section === "detailed") {
        const qs = buildParams("detailed", {
          format,
          group_by: detailedTabFilters.groupBy,
          status: detailedTabFilters.status || "",
          source: detailedTabFilters.source || "",
          payment_method: detailedTabFilters.payment_method
            ? normalizePaymentMethod(detailedTabFilters.payment_method)
            : "",
        });
        window.open(`/api/admin/reports/export/detailed?${qs.toString()}`, "_blank");
        return;
      }

      const qs = buildParams("overview", { format, section });
      window.open(`/api/admin/reports/export/section?${qs.toString()}`, "_blank");
    }

    // Explain modal
    function openExplainModal(focus = "") {
      explainFocus.value = focus;
      explainOpen.value = true;
    }

    // Computed: DETAILED filtered/search/sort + pagination
    const detailedFiltered = computed(() => {
      let arr = Array.isArray(detailedRows.value) ? [...detailedRows.value] : [];
      const q = debouncedQuery.value;

      if (q) {
        arr = arr.filter((r) => {
          const hay = [
            r.client_id,
            r.fullname,
            r.group_label,
            r.course_name,
            r.instructor_name,
            r.municipality,
            r.reservation_status,
            r.reservation_source,
            r.payment_method,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });
      }

      const s = detailedTabFilters.sort;
      const safeStr = (x) => String(x || "").toLowerCase();

      if (s === "created_desc") arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      else if (s === "created_asc") arr.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      else if (s === "name_asc") arr.sort((a, b) => safeStr(a.fullname || a.group_label).localeCompare(safeStr(b.fullname || b.group_label)));
      else if (s === "name_desc") arr.sort((a, b) => safeStr(b.fullname || b.group_label).localeCompare(safeStr(a.fullname || a.group_label)));

      return arr;
    });

    const detailedTotalPages = computed(() => Math.max(1, Math.ceil(detailedFiltered.value.length / detailedPageSize.value)));
    const detailedPageStart = computed(() => (detailedFiltered.value.length ? (detailedPage.value - 1) * detailedPageSize.value + 1 : 0));
    const detailedPageEnd = computed(() => Math.min(detailedFiltered.value.length, detailedPage.value * detailedPageSize.value));
    const detailedPaginated = computed(() => {
      const start = (detailedPage.value - 1) * detailedPageSize.value;
      return detailedFiltered.value.slice(start, start + detailedPageSize.value);
    });

    // Computed: REVENUE filtered/search + pagination
    const revenueFiltered = computed(() => {
      let arr = Array.isArray(revenuePayments.value) ? [...revenuePayments.value] : [];
      const q = debouncedQuery.value;
      if (q) {
        arr = arr.filter((p) => {
          const hay = [p.payment_ref, p.fullname, p.course_name, p.status, p.payment_method]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        });
      }
      return arr;
    });

    const revenueTotalPages = computed(() => Math.max(1, Math.ceil(revenueFiltered.value.length / revenuePageSize.value)));
    const revenuePageStart = computed(() => (revenueFiltered.value.length ? (revenuePage.value - 1) * revenuePageSize.value + 1 : 0));
    const revenuePageEnd = computed(() => Math.min(revenueFiltered.value.length, revenuePage.value * revenuePageSize.value));
    const revenuePaginated = computed(() => {
      const start = (revenuePage.value - 1) * revenuePageSize.value;
      return revenueFiltered.value.slice(start, start + revenuePageSize.value);
    });

    function makePageButtons(current, total, maxButtons = 5) {
      if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);
      const half = Math.floor(maxButtons / 2);
      let start = Math.max(1, current - half);
      let end = Math.min(total, start + maxButtons - 1);
      start = Math.max(1, end - maxButtons + 1);
      const pages = [];
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    }

    const detailedPageButtons = computed(() => makePageButtons(detailedPage.value, detailedTotalPages.value, 5));
    const revenuePageButtons = computed(() => makePageButtons(revenuePage.value, revenueTotalPages.value, 5));

    // Fix pages if out of range
watch(detailedTotalPages, (tp) => {
  const total = Number(tp || 1);
  if (detailedPage.value > total) detailedPage.value = total;
  if (detailedPage.value < 1) detailedPage.value = 1;
});

watch(revenueTotalPages, (tp) => {
  const total = Number(tp || 1);
  if (revenuePage.value > total) revenuePage.value = total;
  if (revenuePage.value < 1) revenuePage.value = 1;
});

    watch(debouncedQuery, () => {
      revenuePage.value = 1;
      detailedPage.value = 1;
    });

    // ✅ FIX: destroy charts when leaving overview
watch(activeTab, async (newTab) => {
  if (newTab === "overview") {
    await nextTick();
    if (!trendChart.value) {
      initCharts();
    }
  } else if (newTab === "revenue") {
    loadRevenue();
  } else if (newTab === "detailed") {
    loadDetailed();
  }
});

    // Init
    onMounted(async () => {
      const today = new Date();
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

overviewFilters.customFrom = toISODateLocal(lastMonth);
overviewFilters.customTo = toISODateLocal(today);

revenueTabFilters.customFrom = toISODateLocal(lastMonth);
revenueTabFilters.customTo = toISODateLocal(today);

detailedTabFilters.customFrom = toISODateLocal(lastMonth);
detailedTabFilters.customTo = toISODateLocal(today);

      await loadCourses();
      await loadOverview();
      await loadRevenue();
    });

    onUnmounted(() => {
      destroyCharts();
      clearTimeout(t);
    });

    return {
      // UI
      activeTab,
      examOpen,
      columnsOpen,
      explainOpen,
      explainFocus,
      tabActive,
      tabInactive,
      btnActive,
      btnInactive,

      // search
      searchQuery,

      // filters
      overviewFilters,
      revenueTabFilters,
      detailedTabFilters,

      // config
      trendPeriod,
      forecastHorizon,
      overviewExportFormat,
      revenueExportFormat,
      detailedExportFormat,

      // data
      courses,
      summary,
      trend,
      topCourses,
      gender,
      courseMonthlyPreview,
      forecast,
      revenueStats,
      revenuePayments,
      detailedRows,

      // states
      overviewLoading,
      revenueLoading,
      detailedLoading,
      overviewError,
      revenueError,
      detailedError,

      // refs
      trendCanvas,
      topCoursesCanvas,
      genderCanvas,

      // helpers
      statusBadge,
      normalizePaymentMethod,
      formatCurrency,
      formatDate,
      formatDateShort,
      lastUpdated,
      courseNameById,

      // actions
      reloadOverview,
      reloadRevenue,
      reloadDetailed,
      setTrendPeriod,
      exportAll,
      exportSection,
      downloadChartImage,
      openExplainModal,

      // detailed table
      columnOptions,
      visibleColumns,
      detailedColspan,
      detailedFiltered,
      detailedPaginated,
      detailedPage,
      detailedPageSize,
      detailedTotalPages,
      detailedPageStart,
      detailedPageEnd,
      detailedPageButtons,

      // revenue table
      revenueFiltered,
      revenuePaginated,
      revenuePage,
      revenuePageSize,
      revenueTotalPages,
      revenuePageStart,
      revenuePageEnd,
      revenuePageButtons,

      // exams
      examStats,
    };
  },
};
</script>