const assert = require("assert");
Feature("Payment Service - Get All Payment History (Admin Only)");

const adminToken = process.env.ADMIN_TOKEN;
const userToken = process.env.USER_TOKEN;

// ============================================================
// FUNCTION 50 - getAllPaymentHistory (/api/payments/history/all)
// ============================================================

Scenario("ITC_50.1 - Admin truy cập lấy toàn bộ lịch sử thành công", async ({ I }) => {
  const res = await I.sendGetRequest("/api/payments/history/all", {
    Authorization: `Bearer ${adminToken}`
  });

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.data), "Dữ liệu trả về phải là một danh sách giao dịch");
  
  if (res.data.length > 0) {
    const firstPayment = res.data[0];
    assert.ok(firstPayment.id, "Giao dịch phải có ID");
    assert.ok(firstPayment.invoice_id, "Giao dịch phải có Invoice ID");
    assert.ok(firstPayment.status, "Giao dịch phải có trạng thái");
  }
});

Scenario("ITC_50.3 - Lỗi phân quyền: Người dùng thường không thể xem lịch sử Admin", async ({ I }) => {
  const res = await I.sendGetRequest("/api/payments/history/all", {
    Authorization: `Bearer ${userToken}` // Sử dụng Token của khách hàng
  });

  // Cập nhật: Server chuẩn xác trả về 403 Forbidden
  assert.strictEqual(res.status, 403, "User không có quyền Admin phải bị từ chối với lỗi 403");
});

Scenario("ITC_50.4 - Lỗi khi truy cập mà không có Token Authorization", async ({ I }) => {
  const res = await I.sendGetRequest("/api/payments/history/all");

  // Cập nhật: Server chuẩn xác trả về 401 Unauthorized
  assert.strictEqual(res.status, 401, "Truy cập không token phải bị từ chối với lỗi 401");
});