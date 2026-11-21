const ALLOWED_MODELS = new Set([
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash-tts",
]);
const Job = require("../models/Job");

exports.matchJobs = async (req, res) => {
  if (req.user.role !== "jobseeker") {
    return res.status(403).json({ message: "Only job seekers can request matches." });
  }
  const skills = Array.isArray(req.user.skills) ? req.user.skills : [];
  if (skills.length === 0) {
    return res.status(400).json({ message: "Add skills to your profile first." });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: "AI service is not configured." });
  }

  try {
    const jobs = await Job.find({ isClosed: false })
      .sort({ createdAt: -1 })
      .limit(15)
      .select("title description requirements location category type salaryMin salaryMax currency company")
      .populate("company", "companyName companyLogo")
      .lean();
    if (jobs.length === 0) return res.json([]);

    const jobSummaries = jobs.map((job) => ({
      id: String(job._id),
      title: job.title,
      location: job.location,
      category: job.category,
      type: job.type,
      description: String(job.description || "").slice(0, 1000),
      requirements: String(job.requirements || "").slice(0, 1000),
    }));
    const requestBody = {
      contents: [{
        role: "user",
        parts: [{
          text: `Match this jobseeker's skills to the open jobs. Return a JSON object with a "matches" array. Include only plausible matches, with a score from 0 to 100 and a short explanation grounded in the provided information. Do not invent qualifications.\nSkills: ${JSON.stringify(skills)}\nJobs: ${JSON.stringify(jobSummaries)}`,
        }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            matches: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  jobId: { type: "STRING" },
                  score: { type: "INTEGER" },
                  explanation: { type: "STRING" },
                },
                propertyOrdering: ["jobId", "score", "explanation"],
              },
            },
          },
          propertyOrdering: ["matches"],
        },
      },
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );
      if (!response.ok) {
        console.error("Gemini job matching failed:", response.status);
        return res.status(502).json({ message: "Job matching is temporarily unavailable." });
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(generatedText);
      if (!Array.isArray(parsed.matches)) {
        return res.status(502).json({ message: "Job matching returned an invalid response." });
      }

      const jobsById = new Map(jobs.map((job) => [String(job._id), job]));
      const matches = parsed.matches
        .filter((match) => jobsById.has(match.jobId))
        .map((match) => {
          const job = jobsById.get(match.jobId);
          return {
            job: {
              ...job,
              company: job.company,
            },
            score: Math.max(0, Math.min(100, Number(match.score) || 0)),
            explanation: String(match.explanation || "").slice(0, 500),
          };
        })
        .sort((left, right) => right.score - left.score);
      return res.json(matches);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("Gemini job matching request failed:", error.message);
    return res.status(502).json({ message: "Job matching is temporarily unavailable." });
  }
};

exports.generateContent = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: "AI service is not configured." });
  }

  const { model, payload } = req.body || {};
  if (
    !ALLOWED_MODELS.has(model) ||
    !Array.isArray(payload?.contents) ||
    payload.contents.length === 0 ||
    payload.contents.length > 100
  ) {
    return res.status(400).json({ message: "Invalid AI request." });
  }

  const requestBody = { contents: payload.contents };
  if (payload.generationConfig && typeof payload.generationConfig === "object") {
    requestBody.generationConfig = payload.generationConfig;
  }

  if (Buffer.byteLength(JSON.stringify(requestBody)) > 80_000) {
    return res.status(413).json({ message: "AI request is too large." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );
    const result = await response.json();
    if (response.status === 401 || response.status === 403) {
      return res.status(502).json({
        code: "AI_AUTH_FAILED",
        message: "AI service authentication failed.",
      });
    }
    return res.status(response.status).json(result);
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    return res.status(502).json({ message: "AI service request failed." });
  } finally {
    clearTimeout(timeout);
  }
};
