const NewsletterSubscriber = require("../models/NewsletterSubscriber");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.subscribe = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return res.status(400).json({ message: "Enter a valid email address." });
  }
  if (req.body?.consent !== true) {
    return res.status(400).json({ message: "Newsletter consent is required." });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_AUDIENCE_ID) {
    return res.status(503).json({ message: "Newsletter signup is not configured." });
  }

  try {
    const existing = await NewsletterSubscriber.findOne({ email });
    if (existing) {
      return res.json({ message: "You are already subscribed." });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let response;
    try {
      response = await fetch(
        `https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, unsubscribed: false }),
          signal: controller.signal,
        }
      );
    } catch (error) {
      console.error("Resend newsletter signup request failed:", error.message);
      return res.status(502).json({ message: "Newsletter signup failed." });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error("Resend newsletter signup failed:", response.status);
      return res.status(502).json({ message: "Newsletter signup failed." });
    }

    await NewsletterSubscriber.create({ email, consentedAt: new Date() });
    return res.status(201).json({ message: "Newsletter signup successful." });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({ message: "You are already subscribed." });
    }
    console.error("Newsletter signup failed:", error.message);
    return res.status(500).json({ message: "Newsletter signup failed." });
  }
};
