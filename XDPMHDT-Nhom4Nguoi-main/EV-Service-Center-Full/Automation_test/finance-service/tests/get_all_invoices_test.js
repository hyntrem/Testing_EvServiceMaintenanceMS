const assert = require("assert");

Feature("Finance Service - Get All Invoices");

const adminToken = process.env.ADMIN_TOKEN;

// 1. Happy Path: Lấy danh sách thành công
Scenario("Happy Path - Lấy danh sách toàn bộ hóa đơn thành công", async ({ I }) => {
  const res = await I.sendGetRequest(
    "/api/invoices/",
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 200, "Status code phải là 200 OK");
  assert.ok(Array.isArray(res.data), "Response data phải trả về định dạng mảng (Array)");
  
  if (res.data.length > 0) {
    console.log(`✅ Tìm thấy ${res.data.length} hóa đơn trong hệ thống.`);
    assert.ok(res.data[0].id, "Phần tử trong mảng phải có thuộc tính id");
    assert.ok(res.data[0].booking_id, "Phần tử trong mảng phải có thuộc tính booking_id");
  } else {
    console.log("⚠️ Danh sách hóa đơn hiện đang trống (Chưa có data).");
  }
});

// 2. Negative Test: Lỗi 401 do không truyền Token
Scenario("Negative Test - Lỗi 401 khi không truyền Token", async ({ I }) => {
  const res = await I.sendGetRequest(
    "/api/invoices/"
    // Cố tình bỏ trống header Authorization
  );

  assert.strictEqual(res.status, 401, "Phải báo lỗi 401 Unauthorized khi thiếu token");
});

// 3. Negative Test: Lỗi định dạng Token (422)
Scenario("Negative Test - Lỗi 422 do Token sai định dạng (Malformed)", async ({ I }) => {
  const res = await I.sendGetRequest(
    "/api/invoices/",
    { Authorization: `Bearer token_nham_nhi_khong_hop_le_123` }
  );

  assert.strictEqual(res.status, 422, "Phải báo lỗi 422 Unprocessable Entity do token không đúng chuẩn JWT");
});

// 4. Negative Test: Lỗi do Token bị sửa đổi chữ ký (Signature Tampering)
Scenario("Negative Test - Lỗi 401/422 khi Token bị chỉnh sửa chữ ký", async ({ I }) => {
  // Lấy token thật từ môi trường
  const validToken = process.env.ADMIN_TOKEN;
  
  // JWT gồm 3 phần: Header.Payload.Signature
  // Chúng ta sẽ cắt bỏ 5 ký tự cuối cùng của chữ ký thật và thay bằng "HACKED"
  const tamperedToken = validToken.slice(0, -5) + "HACKED";

  const res = await I.sendGetRequest(
    "/api/invoices/",
    { Authorization: `Bearer ${tamperedToken}` }
  );

  // Tùy thuộc vào thư viện JWT backend dùng, sai chữ ký có thể văng 401 hoặc 422
  assert.ok(
    [401, 422].includes(res.status), 
    `Bảo mật thất bại! Backend đang cho phép token bị sửa đổi chữ ký đi qua với status: ${res.status}`
  );
});