const { I } = inject();
// ============================================================
// PROFILE
// ============================================================

Feature('Profile');

Before(async () => {
  // Đảm bảo luôn có token hợp lệ trước mỗi test Profile
  if (!process.env.API_TOKEN) {
    const res = await I.sendPostRequest('/api/login', {
      email: process.env.USER_EMAIL || 'nht2511@gmail.com',
      password: process.env.USER_PASSWORD || 'tramnh3098',
    });
    process.env.API_TOKEN = res.data.access_token;
  }
  I.amBearerAuthenticated(process.env.API_TOKEN);
});

Scenario('GET MY PROFILE - Lấy thông tin profile thành công', async () => {
  const res = await I.sendGetRequest('/api/profile');

  I.seeResponseCodeIs(200);
  const body = res.data;

  // Kiểm tra đủ trường
  ['email', 'full_name', 'phone_number', 'address', 'bio', 'vehicle_model', 'vin_number'].forEach(field => {
    expect(body).to.have.property(field);
  });

  // Không được trả về password
  expect(body).to.not.have.property('password');

  // Định dạng phone (10–15 chữ số)
  if (body.phone_number) {
    expect(body.phone_number).to.match(/^\d{10,15}$/);
  }

  // full_name không rỗng
  expect(body.full_name).to.not.be.empty;
});

Scenario('GET MY PROFILE - Không có token phải trả về 401', async () => {
  I.amBearerAuthenticated('');   // xóa token
  const res = await I.sendGetRequest('/api/profile');
  expect(res.status).to.equal(401);
});

Scenario('UPDATE MY PROFILE - Cập nhật thông tin thành công', async () => {
  const updateData = {
    full_name: 'Nguyen Thanh Thanh',
    phone_number: '0908731204',
    address: 'Ho Chi Minh City',
  };

  const res = await I.sendPutRequest('/api/profile', updateData);

  I.seeResponseCodeIsSuccessful();
  const body = res.data;

  expect(body).to.have.property('profile');
  const profile = body.profile;

  // Kiểm tra các trường bắt buộc
  ['full_name', 'phone_number', 'address', 'vin_number'].forEach(field => {
    expect(profile).to.have.property(field);
  });

  // Dữ liệu khớp với request
  expect(profile.full_name).to.equal(updateData.full_name.trim());
  expect(profile.phone_number).to.equal(updateData.phone_number);

  // Không lộ password
  expect(profile).to.not.have.property('password');

  // user_id phải tồn tại
  expect(profile.user_id).to.exist;
});

Scenario('UPDATE MY PROFILE - Gửi body rỗng phải xử lý được (200)', async () => {
  const res = await I.sendPutRequest('/api/profile', {});
  I.seeResponseCodeIs(200);
});

Scenario('UPDATE MY PROFILE - Số điện thoại sai định dạng phải trả về lỗi', async () => {
  const res = await I.sendPutRequest('/api/profile', {
    phone_number: '12344',   // quá ngắn, không hợp lệ
  });

  // Backend nên validate và trả về 4xx
  expect(res.status).to.be.within(400, 499);
});

Scenario('DELETE PROFILE - Xóa profile thành công', async () => {
  const res = await I.sendDeleteRequest('/api/profile');

  I.seeResponseCodeIs(200);
  const body = res.data;
  expect(body.message.toLowerCase()).to.include('delete');
});
