Feature('Internal Staff Flow API');

const assert = require('assert');

const baseUrl = process.env.INTERNAL_BASE_URL || 'http://localhost:8008';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Internal-Token': process.env.INTERNAL_SERVICE_TOKEN
});

Scenario('Internal - missing token -> 401', async ({ I }) => {
  const res = await I.sendGetRequest(`${baseUrl}/internal/staff/available`);

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.data.error, 'Unauthorized internal request');
});

Scenario('Internal - wrong token -> 401', async ({ I }) => {
  I.haveRequestHeaders({
    'X-Internal-Token': 'WRONG_TOKEN'
  });

  const res = await I.sendGetRequest(`${baseUrl}/internal/staff/available`);

  assert.strictEqual(res.status, 401);
});

Scenario('Internal - valid token -> success', async ({ I }) => {
  I.haveRequestHeaders(getHeaders());

  const res = await I.sendGetRequest(`${baseUrl}/internal/staff/available`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
  assert.ok(Array.isArray(res.data.staff));
});

Scenario('Get available staff - filter specialization', async ({ I }) => {
  I.haveRequestHeaders(getHeaders());

  const res = await I.sendGetRequest(
    `${baseUrl}/internal/staff/available?specialization=EV`
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
});

Scenario('Get staff info - success', async ({ I }) => {
  I.haveRequestHeaders(getHeaders());

  const res = await I.sendGetRequest(`${baseUrl}/internal/staff/1`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
});

Scenario('Get staff info - not found', async ({ I }) => {
  I.haveRequestHeaders(getHeaders());

  const res = await I.sendGetRequest(`${baseUrl}/internal/staff/999999`);

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.data.error, 'Staff not found');
});

Scenario('Get assignment by task - success', async ({ I }) => {
  I.haveRequestHeaders(getHeaders());

  const res = await I.sendGetRequest(
    `${baseUrl}/internal/staff/assignment/task/101`
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.success, true);
});

Scenario('Get assignment by task - no assignment', async ({ I }) => {
  I.haveRequestHeaders(getHeaders());

  const res = await I.sendGetRequest(
    `${baseUrl}/internal/staff/assignment/task/999999`
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.assignment, null);
});

Scenario('Internal health check', async ({ I }) => {
  const res = await I.sendGetRequest(`${baseUrl}/internal/staff/health`);

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'healthy');
});