const assert = require('assert');

Feature('Staff API');
let createdStaffId = null;
let testEmail = null;

Before(async ({ auth, I }) => {
  await auth.login(I);
});

Scenario('Get all staff', async ({ I }) => {
  const res = await I.sendGetRequest('/api/staff');

  console.log(res.data);

  assert.equal(res.status, 200);
});
// Tạo staff mới
Scenario('Create staff - success', async ({ I }) => {

  const ts = Date.now();
  testEmail = `staff_${ts}@gmail.com`;

  const res = await I.sendPostRequest('/api/staff/', {
    full_name: 'Nguyen Van A',
    email: testEmail,
    role: 'technician',
    phone: '0123456789'
  });
  console.log('CREATE:', res.data);

  assert.equal(res.status, 201);

  if (res.status === 201) {
    createdStaffId = res.data.staff.id;
  }
});

// Lấy chi tiết staff vừa tạo
Scenario('Get staff detail - success', async ({ I }) => {

  if (!createdStaffId) {
    console.log('SKIP: no staff created');
    return;
  }

  const res = await I.sendGetRequest(`/api/staff/${createdStaffId}`);

  assert.equal(res.status, 200);
});


// Cập nhật staff
Scenario('Update staff - success', async ({ I }) => {
  const res = await I.sendPutRequest(`/api/staff/${createdStaffId}`, {
    full_name: 'Updated Staff Name',
    phone: '0987654321'
  });

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Lấy staff có sẵn
Scenario('Get available staff - success', async ({ I }) => {
  const res = await I.sendGetRequest('/api/staff/available');

  console.log(res.data);

  assert.equal(res.status, 200);
});


// Tao staff - thiếu trường bắt buộc
Scenario('Create staff - missing required field', async ({ I }) => {
  const res = await I.sendPostRequest('/api/staff/', {
    email: 'invalid@gmail.com'
  });

  console.log(res.data);

  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
});

// Tạo staff - email đã tồn tại
Scenario('Create staff - duplicate email', async ({ I }) => {

  const email = `dup_${Date.now()}@gmail.com`;

  const first = await I.sendPostRequest('/api/staff/', {
    full_name: 'First',
    email,
    role: 'technician'
  });

  assert.equal(first.status, 201);

  const second = await I.sendPostRequest('/api/staff/', {
    full_name: 'Second',
    email,
    role: 'technician'
  });

  assert.equal(second.status, 400);
});

// Lấy staff không tồn tại
Scenario('Get staff not found', async ({ I }) => {
  const res = await I.sendGetRequest('/api/staff/999999');

  console.log(res.data);

  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
});


// Cập nhật staff không tồn tại
Scenario('Update staff not found', async ({ I }) => {
  const res = await I.sendPutRequest('/api/staff/999999', {
    full_name: 'Fake Name'
  });

  console.log(res.data);

  assert.equal(res.status, 404);
});


// Tạo staff - BVA email length
Scenario('Create staff - BVA email length', async ({ I }) => {

  const longEmail = 'a'.repeat(90) + '@gmail.com'; // tránh overflow DB

  const res = await I.sendPostRequest('/api/staff/', {
    full_name: 'BVA Test',
    email: longEmail,
    role: 'technician'
  });

  console.log(res.data);

  assert.ok([201, 400, 422].includes(res.status));
});

// Xóa staff
Scenario('Delete staff - success (soft delete)', async ({ I }) => {
  
  const staffId = createdStaffId;

  const res = await I.sendDeleteRequest(`/api/staff/${staffId}`);

  console.log(res.data);

  const assert = require('assert');

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});
// Staff không tồn tại khi xóa 
Scenario('Delete staff - not found', async ({ I }) => {
  const res = await I.sendDeleteRequest('/api/staff/999999');

  console.log(res.data);

  const assert = require('assert');

  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
});
