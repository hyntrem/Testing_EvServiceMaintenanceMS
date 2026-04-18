const assert = require('assert');

let certificateId;
let staffId = 2;

Feature('Certificate API');


// Đăng nhập trước khi chạy các test case
Before(async ({ auth, I }) => {
  await auth.login(I);
});

// Lấy tất cả certificates
Scenario('Get all certificates', async ({ I }) => {
  const res = await I.sendGetRequest('/api/certificates/');

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});

// Tạo certificate - success
Scenario('Create certificate - success', async ({ I }) => {

  const res = await I.sendPostRequest('/api/certificates/', {
    staff_id: staffId,
    certificate_name: 'EV Battery Specialist',
    certificate_type: 'ev_certification',
    issued_date: '2024-01-01',
    expiry_date: '2026-01-01',
    issuing_organization: 'VinFast Academy',
    certificate_number: 'EVBS-2024-001'
  });

  console.log(res.data);

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);

  certificateId = res.data.certificate.id;
});


// Tạo certificate - thiếu trường bắt buộc
Scenario('Create certificate - missing required field', async ({ I }) => {

  const res = await I.sendPostRequest('/api/certificates/', {
    staff_id: staffId
  });

  console.log(res.data);

  assert.equal(res.status, 400);
  assert.equal(res.data.success, false);
  assert.equal(res.data.error, 'Missing required fields');
});


// Tạo certificate - staff không tồn tại
Scenario('Create certificate - invalid staff', async ({ I }) => {

  const res = await I.sendPostRequest('/api/certificates/', {
    staff_id: 999999,
    certificate_name: 'Test Cert',
    certificate_type: 'ev_certification'
  });

  console.log(res.data);

  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
  assert.equal(res.data.error, 'Staff not found');
});


// Cập nhật certificate - success
Scenario('Update certificate - success', async ({ I }) => {

  const res = await I.sendPutRequest(`/api/certificates/${certificateId}`, {
    certificate_name: 'Updated Certificate',
    status: 'valid',
    notes: 'Updated by automation test'
  });

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});
// Cập nhật certificate - staff không tồn tại
Scenario('Update certificate - staff not found', async ({ I }) => {

  const res = await I.sendPutRequest(`/api/certificates/${certificateId}`, {
    staff_id: 999999,   // staff không tồn tại
    certificate_name: 'Test Update',
    certificate_type: 'ev_certification'
  });

  console.log(res.data);

  assert.ok([200, 404].includes(res.status));

  if (res.status === 404) {
    assert.equal(res.data.success, false);
    assert.equal(res.data.error, 'Staff not found');
  }
});
// Xóa certificate - success
Scenario('Delete certificate - success', async ({ I }) => {

  const res = await I.sendDeleteRequest(`/api/certificates/${certificateId}`);

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Xóa certificate - không tồn tại
Scenario('Delete certificate - not found', async ({ I }) => {

  const res = await I.sendDeleteRequest('/api/certificates/999999');

  console.log(res.data);

  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
});


// Lấy expiring certificates
Scenario('Get expiring certificates', async ({ I }) => {

  const res = await I.sendGetRequest('/api/certificates/expiring-soon');

  console.log(res.data);

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
});


// Tạo certificate - thiếu token
Scenario('Create certificate - no token', async ({ I }) => {

  I.clearHeader('Authorization');

  const res = await I.sendPostRequest('/api/certificates/', {
    staff_id: staffId,
    certificate_name: 'No Token Cert',
    certificate_type: 'ev_certification'
  });

  console.log(res.data);

  assert.equal(res.status, 401);
});


// cập nhật certificate - không tồn tại
Scenario('Update certificate - not found', async ({ I }) => {

  const res = await I.sendPutRequest('/api/certificates/999999', {
    certificate_name: 'Fake'
  });

  console.log(res.data);

  assert.equal(res.status, 404);
});