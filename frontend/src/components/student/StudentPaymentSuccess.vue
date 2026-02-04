<template>
  <StudentLayout active-page="">
    <div class="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border border-gray-200">
      <h1 class="text-2xl font-bold text-green-800">✅ Payment Success</h1>
      <p class="text-gray-600 mt-2">Finalizing your reservation...</p>

      <div v-if="loading" class="mt-4 text-gray-600">Please wait...</div>

      <div v-if="error" class="mt-4 text-red-600 text-sm">
        {{ error }}
      </div>

      <div v-if="done" class="mt-4">
        <p class="text-green-700 font-semibold">
          Reservation created successfully!
        </p>
        <p class="text-sm text-gray-600 mt-1">
          Reservation ID: <span class="font-mono">{{ reservationId }}</span>
        </p>
      </div>
    </div>
  </StudentLayout>
</template>

<script>
import StudentLayout from "./StudentLayout.vue";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

export default {
  name: "StudentPaymentSuccess",
  components: { StudentLayout },
  data() {
    return {
      loading: true,
      done: false,
      error: "",
      reservationId: null,
    };
  },
  async mounted() {
    try {
      const paymentRef = this.$route.query.payment_ref;
      if (!paymentRef) {
        this.error = "Missing payment_ref in URL.";
        return;
      }

      const res = await api.post("/student/payments/gcash/finalize", {
        payment_ref: paymentRef,
      });

      this.reservationId = res.data?.data?.reservation_id || null;
      if (!this.reservationId) {
        this.error = "Finalize succeeded but reservation_id not returned.";
        return;
      }

      this.done = true;
    } catch (err) {
      console.error("finalize error:", err.response?.data || err);
      this.error = err.response?.data?.message || "Failed to finalize payment.";
    } finally {
      this.loading = false;
    }
  },
};
</script>