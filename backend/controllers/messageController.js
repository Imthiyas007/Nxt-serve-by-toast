const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateParticipant = (userId, currentUserId) =>
  mongoose.isValidObjectId(userId) && userId !== String(currentUserId);

exports.searchUsers = async (req, res) => {
  const search = String(req.query.q || "").trim();
  if (search.length > 100) {
    return res.status(400).json({ message: "Search text is too long." });
  }

  try {
    const filter = { _id: { $ne: req.user._id } };
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { name: pattern },
        { email: pattern },
        { companyName: pattern },
      ];
    }
    const users = await User.find(filter)
      .select("name email role avatar companyName")
      .sort({ name: 1 })
      .limit(20)
      .lean();
    return res.json(users);
  } catch (error) {
    console.error("User search failed:", error.message);
    return res.status(500).json({ message: "Unable to search users." });
  }
};

exports.getConversation = async (req, res) => {
  const { userId } = req.params;
  if (!validateParticipant(userId, req.user._id)) {
    return res.status(400).json({ message: "Invalid conversation participant." });
  }

  try {
    const recipient = await User.exists({ _id: userId });
    if (!recipient) return res.status(404).json({ message: "User not found." });

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: userId },
        { sender: userId, recipient: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("sender", "name avatar")
      .lean();
    return res.json(messages.reverse());
  } catch (error) {
    console.error("Conversation fetch failed:", error.message);
    return res.status(500).json({ message: "Unable to load conversation." });
  }
};

exports.sendMessage = async (req, res) => {
  const { userId } = req.params;
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  if (!validateParticipant(userId, req.user._id)) {
    return res.status(400).json({ message: "Invalid conversation participant." });
  }
  if (!text || text.length > 5000) {
    return res.status(400).json({ message: "Message must be 1 to 5000 characters." });
  }

  try {
    const recipient = await User.exists({ _id: userId });
    if (!recipient) return res.status(404).json({ message: "User not found." });

    const message = await Message.create({
      sender: req.user._id,
      recipient: userId,
      text,
    });
    return res.status(201).json(message);
  } catch (error) {
    console.error("Message send failed:", error.message);
    return res.status(500).json({ message: "Unable to send message." });
  }
};
