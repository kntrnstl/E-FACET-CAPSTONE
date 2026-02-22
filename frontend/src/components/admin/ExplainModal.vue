<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div class="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200">
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="font-bold text-green-800">🧠 Analytics Explanation</h3>
        <button @click="$emit('close')" class="border px-3 py-1 rounded">Close</button>
      </div>

      <div class="p-4 space-y-4">
        <div class="p-4 bg-gray-50 border rounded">
          <p class="text-sm font-semibold">Descriptive</p>
          <p class="text-xs text-gray-600">
            Shows totals, counts, distributions. Based on actual stored data.
          </p>
        </div>

        <div class="p-4 bg-purple-50 border rounded">
          <p class="text-sm font-semibold text-purple-800">Predictive</p>
          <p class="text-xs text-purple-700">
            Uses moving average + trend slope to estimate next enrollment value.
          </p>
          <p class="text-xs mt-2">
            Forecast: {{ forecast.nextForecast }}
            ({{ forecast.low }} – {{ forecast.high }})
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ExplainModal",
  props: {
    open: Boolean,
    forecast: Object
  }
};
</script>