const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const { generateContent } = require("../controllers/aiController");
const createCorsOrigin = require("../config/corsOrigin");

const originalApiKey = process.env.GEMINI_API_KEY;
const originalFetch = global.fetch;

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = originalApiKey;
  }
  global.fetch = originalFetch;
});

test("allows configured frontend origins and this project's Vercel previews", () => {
  const originHandler = createCorsOrigin(
    "https://custom.example, https://another.example"
  );
  const checkOrigin = (origin) =>
    new Promise((resolve, reject) =>
      originHandler(origin, (error, allowed) => {
        if (error) reject(error);
        else resolve(allowed);
      })
    );

  return Promise.all([
    checkOrigin("https://custom.example"),
    checkOrigin("https://another.example"),
    checkOrigin("https://nxt-serve-by-toast-git-main-team.vercel.app"),
    checkOrigin("https://unrelated.example"),
  ]).then((results) => {
    assert.deepEqual(results, [true, true, true, false]);
  });
});

const invoke = async (body) => {
  const response = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.body = value;
      return this;
    },
  };
  await generateContent({ body }, response);
  return response;
};

test("rejects AI requests when the server key is not configured", async () => {
  delete process.env.GEMINI_API_KEY;
  global.fetch = () => assert.fail("fetch must not run without an API key");

  const response = await invoke({
    model: "gemini-3.5-flash-lite",
    payload: { contents: [{ parts: [{ text: "hello" }] }] },
  });

  assert.equal(response.statusCode, 503);
});

test("rejects models outside the server allowlist", async () => {
  process.env.GEMINI_API_KEY = "server-secret";
  global.fetch = () => assert.fail("fetch must not run for an invalid model");

  const response = await invoke({
    model: "unapproved-model",
    payload: { contents: [{ parts: [{ text: "hello" }] }] },
  });

  assert.equal(response.statusCode, 400);
});

test("rejects AI payloads that exceed the request-size limit", async () => {
  process.env.GEMINI_API_KEY = "server-secret";
  global.fetch = () => assert.fail("fetch must not run for an oversized payload");

  const response = await invoke({
    model: "gemini-3.5-flash-lite",
    payload: { contents: [{ parts: [{ text: "x".repeat(80_100) }] }] },
  });

  assert.equal(response.statusCode, 413);
});

test("proxies allowed requests with the key in a header, not the URL", async () => {
  process.env.GEMINI_API_KEY = "server-secret";
  const payload = {
    contents: [{ parts: [{ text: "hello" }] }],
    generationConfig: { responseMimeType: "text/plain" },
  };
  let upstreamUrl;
  let upstreamOptions;
  global.fetch = async (url, options) => {
    upstreamUrl = url;
    upstreamOptions = options;
    return { status: 200, json: async () => ({ candidates: [] }) };
  };

  const response = await invoke({
    model: "gemini-3.5-flash-lite",
    payload,
  });

  assert.equal(response.statusCode, 200);
  assert.equal(upstreamOptions.headers["x-goog-api-key"], "server-secret");
  assert.equal(upstreamUrl.includes("server-secret"), false);
  assert.deepEqual(JSON.parse(upstreamOptions.body), payload);
});

test("maps upstream API-key rejection to a non-login error", async () => {
  process.env.GEMINI_API_KEY = "server-secret";
  global.fetch = async () => ({
    status: 403,
    json: async () => ({ error: { message: "Invalid key" } }),
  });

  const response = await invoke({
    model: "gemini-3.5-flash-lite",
    payload: { contents: [{ parts: [{ text: "hello" }] }] },
  });

  assert.equal(response.statusCode, 502);
  assert.equal(response.body.code, "AI_AUTH_FAILED");
});
