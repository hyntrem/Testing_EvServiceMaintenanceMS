const assert = require('assert');

Feature('Assignment API');

const baseUrl = '/api/assignments';
let assignmentId;

// Create assignment - success
Scenario('Create assignment - success', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPostRequest(baseUrl, {
    staff_id: 1,
    maintenance_task_id: 101,
    priority: "high",
    estimated_duration_minutes: 120,
    notes: "Auto test assignment"
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);

  assignmentId = res.data.assignment.id;
});

// Missing fields
Scenario('Create assignment - missing fields', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPostRequest(baseUrl, {
    staff_id: 1
  });

  assert.equal(res.status, 422);
});

// Staff not found
Scenario('Create assignment - staff not found', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPostRequest(baseUrl, {
    staff_id: 99999,
    maintenance_task_id: 101
  });

  assert.equal(res.status, 404);
  assert.equal(res.data.error, "Staff not found");
});

// get assignment detail - success
Scenario('Get assignment detail - success', async ({ I }) => {

  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  // tạo mới trước khi get
  const create = await I.sendPostRequest('/api/assignments', {
    staff_id: 1,
    maintenance_task_id: 101
  });

  const id = create.data.assignment.id;

  const res = await I.sendGetRequest(`/api/assignments/${id}`);

  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

// Not found
Scenario('Get assignment detail - not found', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendGetRequest(`${baseUrl}/999999`);

  assert.equal(res.status, 404);
});
// Accept assignment - success

Scenario('Accept assignment - success', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/${assignmentId}/accept`);

  assert.equal(res.status, 404);
  assert.equal(res.data.assignment.status, "accepted");
});

// No token
Scenario('Accept assignment - no token', async ({ I }) => {
  const res = await I.sendPutRequest(`${baseUrl}/${assignmentId}/accept`);

  assert.equal(res.status, 401);
});

// Not found
Scenario('Accept assignment - not found', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/999999/accept`);

  assert.equal(res.status, 404);
});

// Start assignment - success

Scenario('Start assignment - success', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/${assignmentId}/start`);

  assert.equal(res.status, 404);
  assert.equal(res.data.assignment.status, "in_progress");
});

// No token
Scenario('Start assignment - no token', async ({ I }) => {
  const res = await I.sendPutRequest(`${baseUrl}/${assignmentId}/start`);

  assert.equal(res.status, 401);
});

// Not found
Scenario('Start assignment - not found', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/999999/start`);

  assert.equal(res.status, 404);
});

// Complete assignment - success
Scenario('Complete assignment - success', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/${assignmentId}/complete`, {
    completion_notes: "Done successfully"
  });

  assert.equal(res.status, 404);
  assert.equal(res.data.assignment.status, "completed");
});

// No token
Scenario('Complete assignment - no token', async ({ I }) => {
  const res = await I.sendPutRequest(`${baseUrl}/${assignmentId}/complete`, {
    completion_notes: "test"
  });

  assert.equal(res.status, 401);
});

// Not found
Scenario('Complete assignment - not found', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/999999/complete`, {
    completion_notes: "Done"
  });

  assert.equal(res.status, 404);
});

// =========================
// 6. CANCEL
// =========================

Scenario('Cancel assignment - success', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/${assignmentId}/cancel`);

  assert.equal(res.status, 404);
  assert.equal(res.data.assignment.status, "cancelled");
});

// Invalid id
Scenario('Cancel assignment - invalid id', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPutRequest(`${baseUrl}/999999/cancel`);

  assert.equal(res.status, 404);
});

// All assignments
Scenario('Get all assignments', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendGetRequest(baseUrl);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});

// No token
Scenario('Get all assignments - no token', async ({ I }) => {
  const res = await I.sendGetRequest(baseUrl);

  assert.equal(res.status, 401);
});

// =========================
// 8. BVA
// =========================

// lower boundary = 0
Scenario('Create assignment - BVA staff_id = 0', async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${global.token}`
  });

  const res = await I.sendPostRequest(baseUrl, {
    staff_id: 0,
    maintenance_task_id: 101
  });

  assert.ok([400, 422].includes(res.status));
});