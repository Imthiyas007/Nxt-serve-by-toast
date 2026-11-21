const express = require("express");
const { generateContent, matchJobs } = require("../controllers/aiController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/generate", generateContent);
router.get("/matches", protect, matchJobs);

module.exports = router;
