const { test } = require("node:test");
const assert = require("node:assert/strict");
const { matchJobs } = require("../controllers/aiController");
const { sendMessage } = require("../controllers/messageController");
const { requestBadge, verifyBadge } = require("../controllers/skillBadgeController");
const User = require("../models/User");
const { getPublicProfile, updateProfile } = require("../controllers/userController");

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

test("AI job matching requires a jobseeker with profile skills", async () => {
  const employerResponse = createResponse();
  await matchJobs({ user: { role: "employer", skills: ["service"] } }, employerResponse);
  assert.equal(employerResponse.statusCode, 403);

  const skillsResponse = createResponse();
  await matchJobs({ user: { role: "jobseeker", skills: [] } }, skillsResponse);
  assert.equal(skillsResponse.statusCode, 400);
});

test("only jobseekers can request a supported skill badge", async () => {
  const employerResponse = createResponse();
  await requestBadge(
    { user: { role: "employer" }, body: { name: "Food Safety" } },
    employerResponse
  );
  assert.equal(employerResponse.statusCode, 403);

  const invalidBadgeResponse = createResponse();
  await requestBadge(
    { user: { role: "jobseeker", _id: "507f1f77bcf86cd799439011" }, body: { name: "Made up" } },
    invalidBadgeResponse
  );
  assert.equal(invalidBadgeResponse.statusCode, 400);
});

test("only employers can verify a skill badge", async () => {
  const response = createResponse();
  await verifyBadge({ user: { role: "jobseeker" }, params: { id: "invalid" } }, response);
  assert.equal(response.statusCode, 403);
});

test("message sending rejects whitespace and oversized messages", async () => {
  const req = {
    user: { _id: "507f1f77bcf86cd799439011" },
    params: { userId: "507f1f77bcf86cd799439012" },
  };
  const blankResponse = createResponse();
  await sendMessage({ ...req, body: { text: "   " } }, blankResponse);
  assert.equal(blankResponse.statusCode, 400);

  const oversizedResponse = createResponse();
  await sendMessage({ ...req, body: { text: "x".repeat(5001) } }, oversizedResponse);
  assert.equal(oversizedResponse.statusCode, 400);
});

test("resume profile updates reject malformed nested fields", async () => {
  const response = createResponse();
  await updateProfile(
    {
      body: {
        resumeProfile: {
          experience: [{ title: "x".repeat(121) }],
        },
      },
    },
    response
  );
  assert.equal(response.statusCode, 400);
});

test("public profiles do not include private resume-builder details", async () => {
  const originalFindById = User.findById;
  let selectedFields;
  User.findById = () => ({
    select(fields) {
      selectedFields = fields;
      return Promise.resolve({ _id: "507f1f77bcf86cd799439011" });
    },
  });
  try {
    const response = createResponse();
    await getPublicProfile({ params: { id: "507f1f77bcf86cd799439011" } }, response);
    assert.match(selectedFields, /-resumeProfile/);
    assert.equal(response.statusCode, 200);
  } finally {
    User.findById = originalFindById;
  }
});
