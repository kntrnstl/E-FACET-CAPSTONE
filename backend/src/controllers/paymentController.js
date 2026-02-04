// src/controllers/paymentController.js
// Wrapper/bridge controller para hindi mag-crash ang adminRoutes.js
// Re-exports functions from your existing student payment controller (if meron),
// then provides SAFE fallbacks for any adminRoutes-required functions.

let studentPaymentController = {};
try {
  // ✅ CHANGE THIS kung iba filename ng student payment controller mo
  studentPaymentController = require("./studentPaymentsController");
} catch (e) {
  console.error(
    "paymentController wrapper: cannot load ./studentPaymentsController. Using fallbacks.",
    e.message,
  );
}

// helper fallback (always a function)
const notImplemented = (name) => async (req, res) => {
  return res.status(501).json({
    status: "error",
    message: `${name} not implemented yet (paymentController wrapper).`,
  });
};

// -----------------------------
// STUDENT PAYMENT EXPORTS (optional)
// -----------------------------
exports.createGcashCheckout =
  studentPaymentController.createGcashCheckout ||
  notImplemented("createGcashCheckout");

exports.createBankCheckout =
  studentPaymentController.createBankCheckout ||
  notImplemented("createBankCheckout");

exports.markPaid =
  studentPaymentController.markPaid || notImplemented("markPaid");

// -----------------------------
// ADMIN PAYMENT EXPORTS (these are what adminRoutes likely needs)
// Add more here as errors appear.
// -----------------------------
exports.listPayments =
  studentPaymentController.listPayments || notImplemented("listPayments");

exports.getPayment =
  studentPaymentController.getPayment || notImplemented("getPayment");

exports.createPayment =
  studentPaymentController.createPayment || notImplemented("createPayment");

// ✅ THIS is the one crashing you right now
exports.updatePayment =
  studentPaymentController.updatePayment || notImplemented("updatePayment");

exports.deletePayment =
  studentPaymentController.deletePayment || notImplemented("deletePayment");
