const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const { subscribe } = require("../controllers/newsletterController");

const originalApiKey = process.env.RESEND_API_KEY;
const originalAudienceId = process.env.RESEND_AUDIENCE_ID;
const originalFetch = global.fetch;
const originalFindOne = NewsletterSubscriber.findOne;
const originalCreate = NewsletterSubscriber.create;

afterEach(() => {
  if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalApiKey;
  if (originalAudienceId === undefined) delete process.env.RESEND_AUDIENCE_ID;
  else process.env.RESEND_AUDIENCE_ID = originalAudienceId;
  global.fetch = originalFetch;
  NewsletterSubscriber.findOne = originalFindOne;
  NewsletterSubscriber.create = originalCreate;
});

const createResponse = () => ({
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
});

test("requires explicit newsletter consent", async () => {
  const response = createResponse();
  await subscribe({ body: { email: "reader@example.com" } }, response);
  assert.equal(response.statusCode, 400);
});

test("reports missing Resend configuration", async () => {
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_AUDIENCE_ID;

  const response = createResponse();
  await subscribe(
    { body: { email: "reader@example.com", consent: true } },
    response
  );
  assert.equal(response.statusCode, 503);
});

test("adds a consented address to Resend and persists the consent time", async () => {
  process.env.RESEND_API_KEY = "test-api-key";
  process.env.RESEND_AUDIENCE_ID = "test-audience";
  NewsletterSubscriber.findOne = async () => null;
  let savedSubscriber;
  NewsletterSubscriber.create = async (subscriber) => {
    savedSubscriber = subscriber;
    return subscriber;
  };
  let requestUrl;
  let requestOptions;
  global.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return { ok: true };
  };

  const response = createResponse();
  await subscribe(
    { body: { email: " Reader@Example.com ", consent: true } },
    response
  );

  assert.equal(response.statusCode, 201);
  assert.equal(requestUrl, "https://api.resend.com/audiences/test-audience/contacts");
  assert.equal(requestOptions.headers.Authorization, "Bearer test-api-key");
  assert.deepEqual(JSON.parse(requestOptions.body), {
    email: "reader@example.com",
    unsubscribed: false,
  });
  assert.equal(savedSubscriber.email, "reader@example.com");
  assert.ok(savedSubscriber.consentedAt instanceof Date);
});
