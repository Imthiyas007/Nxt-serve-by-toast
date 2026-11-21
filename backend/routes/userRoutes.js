const express = require("express");
const {
  updatePreferences,
  updateProfile,
  deleteResume,
  getPublicProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes
router.put("/preferences", protect, updatePreferences);
router.put("/profile", protect, updateProfile);
router.post("/resume", protect, deleteResume);

// Public route
router.get("/:id", getPublicProfile);

module.exports = router;
