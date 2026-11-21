const Application = require("../models/Application");
const Job = require("../models/Job");
const SkillBadge = require("../models/SkillBadge");
const SKILL_BADGES = require("../constants/skillBadges");

exports.getCatalog = (_req, res) => res.json(SKILL_BADGES);

exports.getMyBadges = async (req, res) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "Only job seekers can manage badges." });
  }
  try {
    const badges = await SkillBadge.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(badges);
  } catch (error) {
    console.error("Badge list failed:", error.message);
    return res.status(500).json({ message: "Unable to load badges." });
  }
};

exports.requestBadge = async (req, res) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "Only job seekers can request badges." });
  }
  const { name } = req.body || {};
  if (!SKILL_BADGES.includes(name)) {
    return res.status(400).json({ message: "Choose a supported skill badge." });
  }

  try {
    const existing = await SkillBadge.findOne({ user: req.user._id, name });
    if (existing) {
      return res.status(409).json({ message: "This badge has already been requested." });
    }
    const badge = await SkillBadge.create({ user: req.user._id, name });
    return res.status(201).json(badge);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "This badge has already been requested." });
    }
    console.error("Badge request failed:", error.message);
    return res.status(500).json({ message: "Unable to request badge." });
  }
};

exports.getPendingBadges = async (req, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Only employers can review badges." });
  }
  try {
    const jobs = await Job.find({ company: req.user._id }).select("_id").lean();
    const jobIds = jobs.map(({ _id }) => _id);
    if (jobIds.length === 0) return res.json([]);

    const applications = await Application.find({ job: { $in: jobIds } })
      .select("applicant")
      .lean();
    const applicantIds = [...new Set(applications.map(({ applicant }) => String(applicant)))];
    if (applicantIds.length === 0) return res.json([]);

    const badges = await SkillBadge.find({
      user: { $in: applicantIds },
      status: "pending",
    })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 });
    return res.json(badges);
  } catch (error) {
    console.error("Pending badge fetch failed:", error.message);
    return res.status(500).json({ message: "Unable to load badge requests." });
  }
};

exports.verifyBadge = async (req, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ message: "Only employers can verify badges." });
  }
  try {
    const badge = await SkillBadge.findById(req.params.id);
    if (!badge) return res.status(404).json({ message: "Badge request not found." });
    if (badge.status !== "pending") {
      return res.status(409).json({ message: "This badge is no longer pending." });
    }

    const jobs = await Job.find({ company: req.user._id }).select("_id").lean();
    const jobIds = jobs.map(({ _id }) => _id);
    const application = await Application.findOne({
      job: { $in: jobIds },
      applicant: badge.user,
    });
    if (!application) {
      return res.status(403).json({ message: "You can only verify an applicant to your jobs." });
    }

    badge.status = "verified";
    badge.verifiedBy = req.user._id;
    badge.verifiedAt = new Date();
    await badge.save();
    return res.json(badge);
  } catch (error) {
    console.error("Badge verification failed:", error.message);
    return res.status(500).json({ message: "Unable to verify badge." });
  }
};
