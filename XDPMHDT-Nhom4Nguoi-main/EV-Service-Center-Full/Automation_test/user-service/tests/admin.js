// tests/admin.js
// Chạy: npx codeceptjs run --steps



const { I } = inject();

// ============================================================
// ADMIN
// ============================================================

Feature('Admin');

Before(async () => {
  if (!process.env.ADMIN_TOKEN) {
    const res = await I.sendPostRequest('/api/login', {
      email: process.env.ADMIN_EMAIL || 'admin@test.com',
      password: process.env.ADMIN_PASSWORD || '',
    });
    process.env.ADMIN_TOKEN = res.data.access_token;
  }
  I.amBearerAuthenticated(process.env.ADMIN_TOKEN);
});

let createdUserId;

Scenario('GET ALL USERS - Admin lấy danh sách user', async () => {
  const res = await I.sendGetRequest('/api/admin/users');

  I.seeResponseCodeIs(200);
  const body = res.data;
  expect(body).to.be.an('array').or.have.property('users');  // tuỳ format backend
});

Scenario('CREATE USER ADMIN - Tạo user mới thành công', async () => {
  const res = await I.sendPostRequest('/api/admin/users', {
    email: 'testTram1125@gmail.com',
    username: 'testTram1125',
    password: '78912',
    role: 'admin',
  });

  I.seeResponseCodeIs(201);
  const body = res.data;
  expect(body).to.have.property('user_id');
  createdUserId = body.user_id;
});

Scenario('TOGGLE LOCK USER - Admin khoá/mở khoá user', async () => {
  if (!createdUserId) { return; }

  const res = await I.sendPutRequest(`/api/admin/users/${createdUserId}/toggle-lock`);

  I.seeResponseCodeIs(200);
  const body = res.data;
  expect(body).to.have.property('status');
});

Scenario('DELETE USER ADMIN - Xóa user thành công', async () => {
  if (!createdUserId) { return; }

  const res = await I.sendDeleteRequest(`/api/admin/users/${createdUserId}`);
  I.seeResponseCodeIs(200);
});
