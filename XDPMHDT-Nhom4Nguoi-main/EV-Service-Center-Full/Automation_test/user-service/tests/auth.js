const { I } = inject();

// ============================================================
// AUTH
// ============================================================

Feature('Auth');

Scenario('REGISTER - Đăng ký tài khoản mới thành công', async () => {
  const res = await I.sendPostRequest('/api/register', {
    email: 'nht2511@gmail.com',
    username: 'nht2511',
    password: 'tramnh3098',
  });

  I.seeResponseCodeIsSuccessful();                       // 2xx
  I.seeResponseContainsJson({ user: {} });               // có field user
  const body = res.data;
  expect(body.user).to.have.property('email');
  expect(body.user.role).to.be.oneOf(['user', 'admin']);
  expect(body.user).to.not.have.property('password');    // không lộ password
  expect(body.user.id || body.user.user_id).to.exist;
  expect(body.user.email).to.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
});

Scenario('REGISTER - Đăng ký email trùng phải trả về lỗi', async () => {
  const res = await I.sendPostRequest('/api/register', {
    email: 'nht2511@gmail.com',   // email đã tồn tại
    username: 'nht2511',
    password: 'tramnh3098',
  });

  // Backend nên trả về 4xx khi duplicate, kiểm tra không phải 2xx thành công
  expect(res.status).to.be.within(400, 499);
});

Scenario('LOGIN - Đăng nhập thành công, nhận token', async () => {
  const res = await I.sendPostRequest('/api/login', {
    email: process.env.USER_EMAIL || 'nht2511@gmail.com',
    password: process.env.USER_PASSWORD || 'tramnh3098',
  });

  I.seeResponseCodeIsSuccessful();
  const body = res.data;
  expect(body).to.have.property('access_token');
  expect(body.access_token).to.be.a('string').and.not.empty;

  // Lưu token vào biến toàn cục để dùng cho các test sau
  process.env.API_TOKEN = body.access_token;
});

Scenario('LOGIN - Sai password phải trả về 401', async () => {
  const res = await I.sendPostRequest('/api/login', {
    email: 'nht2511@gmail.com',
    password: 'wrong_password_xyz',
  });

  expect(res.status).to.equal(401);
});

Scenario('LOGIN ADMIN - Đăng nhập admin thành công', async () => {
  const res = await I.sendPostRequest('/api/login', {
    email: process.env.ADMIN_EMAIL || 'admin@test.com',
    password: process.env.ADMIN_PASSWORD || '',
  });

  I.seeResponseCodeIsSuccessful();
  const body = res.data;
  expect(body).to.have.property('access_token');
  process.env.ADMIN_TOKEN = body.access_token;
});
