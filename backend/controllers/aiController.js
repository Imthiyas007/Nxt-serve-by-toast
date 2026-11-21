const ALLOWED_MODELS = new Set([
  "gemini-3.5-flash-lite",
  "gemini-3.8-flash-tts",
]);

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
