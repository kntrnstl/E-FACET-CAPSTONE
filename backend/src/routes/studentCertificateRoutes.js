const express = require("express");
const router = express.Router();

const studentCertCtrl = require("../controllers/studentCertificateController");
const { requireStudent } = require("../middlewares/authMiddleware");

router.get("/", requireStudent, studentCertCtrl.listMyCertificates);
router.get("/:id/view", requireStudent, studentCertCtrl.viewMyPdf);
router.get("/:id/download", requireStudent, studentCertCtrl.downloadMyPdf);

module.exports = router;
