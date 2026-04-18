const assert = require("assert");

Feature("Finance Service - Create Invoice");

const adminToken = process.env.ADMIN_TOKEN;
const validBookingId = Number(process.env.BOOKING_ID);

// 1. Happy Path: Tạo thành công
Scenario("Happy Path - Tạo hóa đơn thành công (hoặc xử lý nếu đã tồn tại)", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: validBookingId },
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.ok([201, 409].includes(res.status), "Status code phải là 201 (Tạo mới) hoặc 409 (Đã tồn tại)");
  
  if (res.status === 201) {
    assert.ok(res.data.invoice.id, "Phải trả về ID hóa đơn mới");
  }
});

// 2. Negative Test: Bỏ trống trường bắt buộc
Scenario("Negative Test - Lỗi khi không truyền booking_id", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    {}, // Body rỗng, cố tình không truyền booking_id
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 400, "Phải báo lỗi 400 Bad Request");
  assert.ok(res.data.error, "Response phải chứa thông báo lỗi rõ ràng");
});

// 3. BVA Test: Giá trị biên dưới (0)
Scenario("BVA - Lỗi khi tạo hóa đơn với booking_id = 0", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: 0 },
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 400, "Phải báo lỗi 400 Bad Request với ID = 0");
  assert.ok(res.data.error);
});

// 4. BVA Test: Giá trị biên âm (-1)
Scenario("BVA - Lỗi khi tạo hóa đơn với booking_id = -1", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: -1 },
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 400, "Phải báo lỗi 400 Bad Request với ID âm");
  assert.ok(res.data.error);
});