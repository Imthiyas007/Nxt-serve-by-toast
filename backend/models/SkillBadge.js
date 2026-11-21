const mongoose = require("mongoose");
const SKILL_BADGES = require("../constants/skillBadges");

const skillBadgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, enum: SKILL_BADGES, required: true },
    status: {
      type: String,
      enum: ["pending", "verified"],
      default: "pending",
    },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verifiedAt: Date,
  },
  { timestamps: true }
);

skillBadgeSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("SkillBadge", skillBadgeSchema);
