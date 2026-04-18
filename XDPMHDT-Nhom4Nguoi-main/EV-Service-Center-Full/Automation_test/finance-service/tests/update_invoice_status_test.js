const assert = require("assert");

Feature("Finance Service - Update Invoice Status");

const adminToken = process.env.ADMIN_TOKEN;
let validInvoiceId = null;

// Before nâng cấp: Tìm đúng hóa đơn CHƯA thanh toán (khác "paid") để test
Before(async ({ I }) => {
  const res = await I.sendGetRequest("/api/invoices/", { Authorization: `Bearer ${adminToken}` });
  
  if (res.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
    // Sửa chữ "PAID" thành "paid" cho khớp với DB
    const unpaidInvoice = res.data.find(inv => inv.status !== "paid");
    
    if (unpaidInvoice) {
      validInvoiceId = unpaidInvoice.id;
      console.log(`✅ Đã tìm thấy hóa đơn chưa thanh toán (ID: ${validInvoiceId}) để test.`);
    } else {
      validInvoiceId = res.data[0].id;
      console.log(`⚠️ Tất cả hóa đơn đều đã 'paid'. Đang test tạm với ID: ${validInvoiceId}`);
    }
  }
});

// 1. Happy Path: Cập nhật thành paid
Scenario("Happy Path - Cập nhật trạng thái hóa đơn thành công sang paid", async ({ I }) => {
  if (!validInvoiceId) return console.log("⚠️ Không có hóa đơn để test.");

  const res = await I.sendPutRequest(
    `/api/invoices/${validInvoiceId}/status`,
    { status: "paid" }, // Truyền đúng chữ thường theo Backend yêu cầu
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.ok([200, 204].includes(res.status), `Update thất bại! Status đang là ${res.status}`);
});

// 2. Negative Test: ID Hóa đơn không tồn tại
Scenario("Negative Test - Báo lỗi 404 khi update hóa đơn không tồn tại", async ({ I }) => {
  const res = await I.sendPutRequest(
    `/api/invoices/999999999/status`,
    { status: "paid" }, // Cập nhật lại thành chữ thường
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.strictEqual(res.status, 404, "Phải báo lỗi 404 Not Found");
});

// 3. Negative Test: Cập nhật một Status linh tinh không có trong hệ thống
Scenario("Negative Test - Báo lỗi 422 (hoặc 400) khi truyền status sai quy định", async ({ I }) => {
  if (!validInvoiceId) return;

  const res = await I.sendPutRequest(
    `/api/invoices/${validInvoiceId}/status`,
    { status: "TRANG_THAI_TAO_LAO" },
    { Authorization: `Bearer ${adminToken}` }
  );

  assert.ok([400, 422].includes(res.status), "Phải báo lỗi Validation khi status không thuộc danh sách cho phép");
});