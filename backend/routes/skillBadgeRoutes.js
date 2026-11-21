const express = require("express");
const {
  getCatalog,
  getMyBadges,
  getPendingBadges,
  requestBadge,
  verifyBadge,
} = require("../controllers/skillBadgeController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/catalog", getCatalog);
router.get("/my", getMyBadges);
router.get("/pending", getPendingBadges);
router.post("/", requestBadge);
router.post("/:id/verify", verifyBadge);

module.exports = router;
