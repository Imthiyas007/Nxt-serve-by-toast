const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nxtserve",
    allowed_formats: ["jpg", "png", "jpeg", "pdf"],
    resource_type: "auto", // auto-detects image vs raw (pdf)
    public_id: (req, file) => `uploads/${Date.now()}-${file.originalname}`,
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, .png, and .pdf formats are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
