const express = require("express");
const router = express.Router();

const adminCertificateController = require("../controllers/adminCertificateController");

// Use your real auth middlewares if meron
const { requireAuth, requireAdmin } = require("../middlewares/authMiddleware");

router.get(
  "/completions",
  requireAuth,
  requireAdmin,
  adminCertificateController.listCompletions,
);
router.post(
  "/generate",
  requireAuth,
  requireAdmin,
  adminCertificateController.generate,
);

router.get(
  "/:id/view",
  requireAuth,
  requireAdmin,
  adminCertificateController.viewPdf,
);
router.get(
  "/:id/download",
  requireAuth,
  requireAdmin,
  adminCertificateController.downloadPdf,
);

router.patch(
  "/:id/revoke",
  requireAuth,
  requireAdmin,
  adminCertificateController.revoke,
);

module.exports = router;
