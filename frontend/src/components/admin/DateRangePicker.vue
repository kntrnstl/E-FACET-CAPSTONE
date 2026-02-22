<template>
  <div class="flex flex-wrap gap-2 items-end">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
      <select
        v-model="localRange"
        class="w-48 p-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="thisMonth">This Month</option>
        <option value="lastMonth">Last Month</option>
        <option value="thisQuarter">This Quarter</option>
        <option value="thisYear">This Year</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>

    <div v-if="localRange === 'custom'" class="flex items-end gap-2">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
        <input
          type="date"
          v-model="localFrom"
          class="w-40 p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
        <input
          type="date"
          v-model="localTo"
          class="w-40 p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DateRangePicker",
  props: {
    range: String,
    from: String,
    to: String,
  },
  emits: ["update:range", "update:from", "update:to"],
  computed: {
    localRange: {
      get() { return this.range; },
      set(v) { this.$emit("update:range", v); }
    },
    localFrom: {
      get() { return this.from; },
      set(v) { this.$emit("update:from", v); }
    },
    localTo: {
      get() { return this.to; },
      set(v) { this.$emit("update:to", v); }
    }
  }
};
</script>