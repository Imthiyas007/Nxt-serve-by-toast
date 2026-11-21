const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const SUPPORTED_LANGUAGES = require("../constants/supportedLanguages");

const resumeEntryFieldLengths = {
  title: 120,
  organization: 120,
  location: 120,
  startDate: 40,
  endDate: 40,
  description: 2000,
};

const isValidResumeProfile = (resumeProfile) => {
  if (
    !resumeProfile ||
    typeof resumeProfile !== "object" ||
    Array.isArray(resumeProfile) ||
    Object.keys(resumeProfile).some(
      (key) => !["summary", "experience", "education"].includes(key)
    )
  ) {
    return false;
  }
  if (
    resumeProfile.summary !== undefined &&
    (typeof resumeProfile.summary !== "string" ||
      resumeProfile.summary.length > 2000)
  ) {
    return false;
  }

  return ["experience", "education"].every((section) => {
    const entries = resumeProfile[section];
    return (
      entries === undefined ||
      (Array.isArray(entries) &&
        entries.length <= 20 &&
        entries.every(
          (entry) =>
            entry &&
            typeof entry === "object" &&
            !Array.isArray(entry) &&
            Object.entries(entry).every(
              ([field, value]) =>
                Object.hasOwn(resumeEntryFieldLengths, field) &&
                (value === undefined ||
                  (typeof value === "string" &&
                    value.length <= resumeEntryFieldLengths[field]))
            )
        ))
    );
  });
};

exports.updatePreferences = async (req, res) => {
  const preferredLanguage = req.body?.preferredLanguage;
  if (!SUPPORTED_LANGUAGES.includes(preferredLanguage)) {
    return res.status(400).json({ message: "Unsupported language" });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.preferredLanguage = preferredLanguage;
    await user.save();

    res.json({ preferredLanguage: user.preferredLanguage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user profile (name, avatar, company details)
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      avatar,
      companyName,
      companyDescription,
      companyLogo,
      resume,
      skills,
      resumeProfile,
    } = req.body || {};
    if (
      skills !== undefined &&
      (!Array.isArray(skills) ||
        skills.length > 50 ||
        skills.some((skill) => typeof skill !== "string" || skill.length > 60))
    ) {
      return res.status(400).json({ message: "Invalid skills list" });
    }
    if (resumeProfile !== undefined && !isValidResumeProfile(resumeProfile)) {
      return res.status(400).json({ message: "Invalid resume profile" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.resume = resume || user.resume;

    if (user.role === "jobseeker") {
      if (skills !== undefined) {
        user.skills = [...new Set(skills.map((skill) => skill.trim()).filter(Boolean))];
      }
      if (resumeProfile !== undefined) {
        user.resumeProfile = resumeProfile;
      }
    }

    if (user.role === "employer") {
      user.companyName = companyName || user.companyName;
      user.companyDescription = companyDescription || user.companyDescription;
      user.companyLogo = companyLogo || user.companyLogo;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      companyName: user.companyName,
      companyDescription: user.companyDescription,
      companyLogo: user.companyLogo,
      resume: user.resume || "",
      skills: user.skills || [],
      resumeProfile: user.resumeProfile || {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete resume file (Jobseeker only)
exports.deleteResume = async (req, res) => {
  try {
    const { resumeUrl } = req.body; // expect resumeUrl to be the Cloudinary URL of the resume

    // Validate URL
    if (!resumeUrl) {
      return res.status(400).json({ message: "Resume URL is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role !== "jobseeker")
      return res
        .status(403)
        .json({ message: "Only jobseekers can delete resume" });

    // Extract public_id from Cloudinary URL and delete the file
    // URL format: https://res.cloudinary.com/CLOUD_NAME/resource_type/upload/vTIMESTAMP/folder/public_id.ext
    try {
      const uploadMarker = "/upload/";
      const uploadIndex = resumeUrl.indexOf(uploadMarker);
      if (uploadIndex !== -1) {
        let afterUpload = resumeUrl.substring(uploadIndex + uploadMarker.length);
        // Remove version segment (e.g., "v1234567890/")
        afterUpload = afterUpload.replace(/^v\d+\//, "");
        // Remove file extension to get public_id
        const publicId = afterUpload.replace(/\.[^/.]+$/, "");

        // Determine resource_type from URL path
        const isImage = afterUpload.startsWith("image/");
        const resourceType = isImage ? "image" : "raw";

        await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          type: "upload",
        });
      }
    } catch (cloudErr) {
      // Log but don't fail — continue to clear DB field
      console.error("Cloudinary delete error:", cloudErr.message);
    }

    // Set the user's resume to an empty string
    user.resume = "";
    await user.save();

    res.json({ message: "Resume deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user public profile
exports.getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resumeProfile"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
