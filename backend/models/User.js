const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const SUPPORTED_LANGUAGES = require("../constants/supportedLanguages");

const resumeEntrySchema = new mongoose.Schema(
  {
    title: { type: String, maxlength: 120 },
    organization: { type: String, maxlength: 120 },
    location: { type: String, maxlength: 120 },
    startDate: { type: String, maxlength: 40 },
    endDate: { type: String, maxlength: 40 },
    description: { type: String, maxlength: 2000 },
  },
  { _id: false }
);

const resumeProfileSchema = new mongoose.Schema(
  {
    summary: { type: String, maxlength: 2000 },
    experience: { type: [resumeEntrySchema], default: [] },
    education: { type: [resumeEntrySchema], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["jobseeker", "employer"], required: true },
  preferredLanguage: { type: String, enum: SUPPORTED_LANGUAGES },
  avatar: String,
  resume: String,
  skills: { type: [String], default: [] },
  resumeProfile: { type: resumeProfileSchema, default: () => ({}) },
  // for employer
  companyName: String,
  companyDescription: String,
  companyLogo: String,
}, { timestamps: true });

// Indexes for frequent queries
userSchema.index({ role: 1 });

// Encrypt password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Match entered password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
