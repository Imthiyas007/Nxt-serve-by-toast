const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

// @desc    Update user profile (name, avatar, company details)
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, companyName, companyDescription, companyLogo, resume } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.avatar = avatar || user.avatar;
    user.resume = resume || user.resume;

    // If employer, allow updating company info
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
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
