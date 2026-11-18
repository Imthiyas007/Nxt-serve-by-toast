const mongoose = require("mongoose");

const savedJobSchema = new mongoose.Schema(
  {
    jobseeker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  },
  { timestamps: true }
);

// Indexes for frequent queries
savedJobSchema.index({ jobseeker: 1 });
savedJobSchema.index({ job: 1 });

module.exports = mongoose.model("SavedJob", savedJobSchema);
