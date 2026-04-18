const assert = require('assert');

let performanceId;
let staffId = 2; // bạn có thể thay bằng staff thật trong DB

Feature('Performance API');


// =========================
// LOGIN
// =========================
Before(async ({ auth, I }) => {
  await auth.login(I);
});


// Lấy tất cả performance
Scenario('Get all performance', async ({ I }) => {
  const res = await I.sendGetRequest('/api/performance/');

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Tạo performance - success
Scenario('Create performance - success', async ({ I }) => {

  const res = await I.sendPostRequest('/api/performance/', {
    staff_id: staffId,
    period_type: 'monthly',
    period_start: '2026-04-01',
    period_end: '2026-04-30',
    tasks_assigned: 10,
    tasks_completed: 8,
    tasks_cancelled: 2,
    avg_completion_time_minutes: 45,
    on_time_completion_rate: 90,
    customer_rating_avg: 4.5,
    customer_rating_count: 20,
    manager_rating: 4,
    manager_notes: 'Good performance',
    total_work_hours: 160,
    overtime_hours: 10
  });

  console.log(res.data);

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);

  performanceId = res.data.performance.id;
});


// Tạo performance - thiếu trường bắt buộc
Scenario('Create performance - missing required field', async ({ I }) => {

  const res = await I.sendPostRequest('/api/performance/', {
    staff_id: staffId
  });

  console.log(res.data);

  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.equal(res.data.error, 'Missing required fields');
});


// Tạo performance - staff không tồn tại
Scenario('Create performance - invalid staff', async ({ I }) => {

  const res = await I.sendPostRequest('/api/performance/', {
    staff_id: 999999,
    period_type: 'monthly',
    period_start: '2026-04-01',
    period_end: '2026-04-30'
  });

  console.log(res.data);

  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
  assert.equal(res.data.error, 'Staff not found');
});


// Cập nhật performance - success
Scenario('Update performance - success', async ({ I }) => {

  const res = await I.sendPutRequest(`/api/performance/${performanceId}`, {
    manager_rating: 4.8,
    manager_notes: 'Updated review',
    overtime_hours: 12
  });

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Lấy performance hiện tại của staff
Scenario('Get staff current performance', async ({ I }) => {

  const res = await I.sendGetRequest(`/api/performance/staff/${staffId}/current`);

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Dashboard performance
Scenario('Get performance dashboard', async ({ I }) => {

  const res = await I.sendGetRequest('/api/performance/dashboard');

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// BVA - rating min
Scenario('BVA - manager rating min (0)', async ({ I }) => {

  const res = await I.sendPostRequest('/api/performance/', {
    staff_id: staffId,
    period_type: 'monthly',
    period_start: '2026-04-01',
    period_end: '2026-04-30',
    manager_rating: 0
  });

  console.log(res.data);

  assert.ok([201, 400].includes(res.status));
});


// BVA - rating max
Scenario('BVA - manager rating max (5)', async ({ I }) => {

  const res = await I.sendPostRequest('/api/performance/', {
    staff_id: staffId,
    period_type: 'monthly',
    period_start: '2026-04-01',
    period_end: '2026-04-30',
    manager_rating: 5
  });

  console.log(res.data);

  assert.ok([201, 400].includes(res.status));
});


// BVA - invalid rating < 0
Scenario('BVA - invalid rating > 5', async ({ I }) => {

  const res = await I.sendPostRequest('/api/performance/', {
    staff_id: staffId,
    period_type: 'monthly',
    period_start: '2026-04-01',
    period_end: '2026-04-30',
    manager_rating: 10
  });

  console.log(res.data);

  assert.ok([400, 422].includes(res.status));
});


// Tạo performance - không có token
Scenario('Create performance - no token', async ({ I }) => {

  I.clearHeader('Authorization');

  const res = await I.sendPostRequest('/api/performance/', {
    staff_id: staffId,
    period_type: 'monthly',
    period_start: '2026-04-01',
    period_end: '2026-04-30'
  });

  console.log(res.data);

  assert.equal(res.status, 401);
});


// Cap nhật performance không tồn tại staff
Scenario('Update performance - not found', async ({ I }) => {

  const res = await I.sendPutRequest('/api/performance/999999', {
    manager_rating: 3
  });

  console.log(res.data);

  assert.equal(res.status, 404);
});