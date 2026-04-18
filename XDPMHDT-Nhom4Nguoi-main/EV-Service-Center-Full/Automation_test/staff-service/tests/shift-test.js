const assert = require('assert');

Feature('Shift API');

let shiftId = null;


Before(async ({ auth, I }) => {
  await auth.login(I);
});


// lấy tất cả shifts
Scenario('Get all shifts', async ({ I }) => {
  const res = await I.sendGetRequest('/api/shifts/');

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Tạo shift mới
Scenario('Create shift - success', async ({ I }) => {

  const res = await I.sendPostRequest('/api/shifts/', {
    staff_id: 2,

    shift_date: '2026-04-20',
    shift_type: 'morning',

    start_time: '08:00:00',
    end_time: '12:00:00',

    notes: 'Auto test shift'
  });

  console.log(res.data);

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);

  shiftId = res.data.shift.id;
});


// Lấy chi tiết shift vừa tạo
Scenario('Get shift detail', async ({ I }) => {

  if (!shiftId) return;

  const res = await I.sendGetRequest(`/api/shifts/?staff_id=2`);

  console.log(res.data);

  assert.equal(res.status, 200);
});


// Cập nhật shift
Scenario('Update shift', async ({ I }) => {

  if (!shiftId) return;

  const res = await I.sendPutRequest(`/api/shifts/${shiftId}`, {
    notes: 'Updated shift test',
    status: 'scheduled'
  });

  console.log(res.data);

  assert.equal(res.status, 200);
});


// Check-in shift
Scenario('Check-in shift', async ({ I }) => {

  if (!shiftId) return;

  const res = await I.sendPutRequest(`/api/shifts/${shiftId}/check-in`);

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Check-out shift
Scenario('Check-out shift', async ({ I }) => {

  if (!shiftId) return;

  const res = await I.sendPutRequest(`/api/shifts/${shiftId}/check-out`);

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Xóa shift
Scenario('Delete shift', async ({ I }) => {

  if (!shiftId) return;

  const res = await I.sendDeleteRequest(`/api/shifts/${shiftId}`);

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Tạo shift - không có token
Scenario('Create shift - no token', async ({ I }) => {

  I.clearHeader('Authorization');

  const res = await I.sendPostRequest('/api/shifts/', {
    staff_id: 2,
    shift_date: '2026-04-20',
    shift_type: 'morning',
    start_time: '08:00:00',
    end_time: '12:00:00'
  });

  console.log(res.data);

  assert.equal(res.status, 401);
});

// Tạo shift - thiếu field bắt buộc
Scenario('Create shift - missing required field', async ({ I }) => {

  const res = await I.sendPostRequest('/api/shifts/', {
    staff_id: 2
    // thiếu field còn lại
  });

  console.log(res.data);

  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.equal(res.data.error, 'Missing required fields');
});
// Tạo shift - staff không tồn tại
Scenario('Create shift - invalid staff', async ({ I }) => {

  const res = await I.sendPostRequest('/api/shifts/', {
    staff_id: 999999,
    shift_date: '2026-04-20',
    shift_type: 'morning',
    start_time: '08:00:00',
    end_time: '12:00:00'
  });

  console.log(res.data);

  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
  assert.equal(res.data.error, 'Staff not found');
});

// Lấy shift không tồn tại
Scenario('Get shift not found', async ({ I }) => {

  const res = await I.sendGetRequest('/api/shifts/?staff_id=999999');

  console.log(res.data);

  assert.equal(res.status, 200); // list API vẫn 200
});
// Check-in shift - không có token
Scenario('Check-in shift - no token', async ({ I }) => {

  I.clearHeader('Authorization');

  const res = await I.sendPutRequest(`/api/shifts/${shiftId}/check-in`, {});

  console.log(res.data);

  assert.equal(res.status, 401);
});
// Check-out shift - không có token
Scenario('Check-out shift - no token', async ({ I }) => {

  I.clearHeader('Authorization');

  const res = await I.sendPutRequest(`/api/shifts/${shiftId}/check-out`, {});

  console.log(res.data);

  assert.equal(res.status, 401);
});
// Xóa shift 
Scenario('Delete shift - success', async ({ I }) => {

  const res = await I.sendDeleteRequest(`/api/shifts/${shiftId}`);

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Xóa shift - không có token
Scenario('Delete shift - no token', async ({ I }) => {

  I.clearHeader('Authorization');

  const res = await I.sendDeleteRequest(`/api/shifts/${shiftId}`);

  console.log(res.data);

  assert.equal(res.status, 401);
});