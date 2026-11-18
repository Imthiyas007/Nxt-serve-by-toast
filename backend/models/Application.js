const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resume: { type: String }, // can store uploaded version or link
    status: {
      type: String,
      enum: ["Applied", "In Review", "Rejected", "Accepted"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

// Indexes for frequent queries
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Application", applicationSchema);
