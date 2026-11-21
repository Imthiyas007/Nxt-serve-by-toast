const { afterEach, test } = require("node:test");
const assert = require("node:assert/strict");
const Job = require("../models/Job");
const Application = require("../models/Application");
const SavedJob = require("../models/SavedJob");
const { optionalProtect } = require("../middlewares/authMiddleware");
const { applyToJob, updateStatus } = require("../controllers/applicationController");
const { updateJob } = require("../controllers/jobController");
const { saveJob } = require("../controllers/savedJobController");

const originalFindJob = Job.findById;
const originalFindApplication = Application.findById;
const originalFindOneApplication = Application.findOne;
const originalFindOneSavedJob = SavedJob.findOne;

afterEach(() => {
  Job.findById = originalFindJob;
  Application.findById = originalFindApplication;
  Application.findOne = originalFindOneApplication;
  SavedJob.findOne = originalFindOneSavedJob;
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

test("allows anonymous requests through optional authentication", async () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  await optionalProtect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test("prevents jobseekers from applying to a closed job", async () => {
  Job.findById = async () => ({ isClosed: true });
  Application.findOne = () => assert.fail("closed jobs must not be applied to");

  const response = createResponse();
  await applyToJob(
    { user: { role: "jobseeker" }, params: { jobId: "closed-job" } },
    response
  );

  assert.equal(response.statusCode, 400);
});

test("rejects application statuses outside the supported set", async () => {
  Application.findById = () => assert.fail("invalid status must not query");

  const response = createResponse();
  await updateStatus(
    { body: { status: "Unknown" }, params: { id: "application" } },
    response
  );

  assert.equal(response.statusCode, 400);
});

test("job updates cannot change ownership or closure state", async () => {
  const job = {
    company: { toString: () => "employer-1" },
    isClosed: false,
    title: "Original title",
    save: async () => job,
  };
  Job.findById = async () => job;

  const response = createResponse();
  await updateJob(
    {
      user: { _id: { toString: () => "employer-1" } },
      params: { id: "job-1" },
      body: {
        title: "Updated title",
        company: "employer-2",
        isClosed: true,
      },
    },
    response
  );

  assert.equal(job.title, "Updated title");
  assert.equal(job.company.toString(), "employer-1");
  assert.equal(job.isClosed, false);
});

test("employers cannot use the job seeker save-job workflow", async () => {
  Job.findById = () => assert.fail("non-jobseekers must not save jobs");
  SavedJob.findOne = () => assert.fail("non-jobseekers must not save jobs");

  const response = createResponse();
  await saveJob(
    { user: { role: "employer" }, params: { jobId: "job-1" } },
    response
  );

  assert.equal(response.statusCode, 403);
});
