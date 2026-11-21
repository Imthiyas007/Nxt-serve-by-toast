const VERCEL_PREVIEW_ORIGIN =
  /^https:\/\/nxt-serve-by-toast-[a-z0-9-]+\.vercel\.app$/i;

const createCorsOrigin = (frontendUrls = process.env.FRONTEND_URL || "") => {
  const allowedOrigins = new Set([
    ...frontendUrls.split(",").map((origin) => origin.trim()).filter(Boolean),
    "https://nxt-serve-by-toast.vercel.app",
    "http://localhost:5173",
  ]);

  return (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.has(origin) ||
      VERCEL_PREVIEW_ORIGIN.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  };
};

module.exports = createCorsOrigin;
