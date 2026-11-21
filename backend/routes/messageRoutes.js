const express = require("express");
const {
  getConversation,
  searchUsers,
  sendMessage,
} = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/users", searchUsers);
router.get("/conversation/:userId", getConversation);
router.post("/conversation/:userId", sendMessage);

module.exports = router;
