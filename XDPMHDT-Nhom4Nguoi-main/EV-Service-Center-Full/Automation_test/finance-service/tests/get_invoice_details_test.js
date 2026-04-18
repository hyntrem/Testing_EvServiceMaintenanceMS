const assert = require("assert");

Feature("Finance Service - Get Invoice Details");

const adminToken = process.env.ADMIN_TOKEN;
let validInvoiceId = null;

// Before: Tự động lấy một hóa đơn có sẵn trong hệ thống để test
Before(async ({ I }) => {
  const res = await I.sendGetRequest("/api/invoices/", { Authorization: `Bearer ${adminToken}` });
  if (res.status === 200 && res.data.length > 0) {
    validInvoiceId = res.data[0].id;
  }
});

// 1. Happy Path
Scenario("Happy Path - Xem chi tiết hóa đơn thành công", async ({ I }) => {
  if (!validInvoiceId) {
    console.log("⚠️ Không có hóa đơn nào để test. Vui lòng tạo 1 hóa đơn trước.");
    return;
  }

  const res = await I.sendGetRequest(
    `/api/invoices/${validInvoiceId}`,
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 200, "Phải trả về mã 200 OK");
  assert.strictEqual(res.data.id, validInvoiceId, "ID trả về phải khớp với ID yêu cầu");
  assert.ok(res.data.total_amount !== undefined, "Hóa đơn phải có thuộc tính total_amount");
});

// 2. Negative Test: ID không tồn tại
Scenario("Negative Test - Báo lỗi 404 khi xem hóa đơn không tồn tại", async ({ I }) => {
  const res = await I.sendGetRequest(
    `/api/invoices/999999999`, // Một ID giả định không bao giờ có thực
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 404, "Phải trả về 404 Not Found");
});

// 3. Negative Test: ID sai định dạng
Scenario("Negative Test - Báo lỗi 404 khi ID không đúng định dạng (không phải số)", async ({ I }) => {
  const res = await I.sendGetRequest(
    `/api/invoices/abc-xyz`, 
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 404, "Backend xử lý sai định dạng path parameter thành 404 Not Found");
});