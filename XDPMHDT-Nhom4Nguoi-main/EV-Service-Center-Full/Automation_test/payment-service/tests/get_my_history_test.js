const assert = require("assert");
Feature("Payment Service - Get My Payment History (User Only)");

const userToken = process.env.USER_TOKEN;

// ============================================================
// FUNCTION 49 - getMyPaymentHistory (/api/payments/history/my)
// ============================================================

Scenario("ITC_49.1 - User lấy lịch sử thanh toán thành công", async ({ I }) => {
  const res = await I.sendGetRequest("/api/payments/history/my", {
    Authorization: `Bearer ${userToken}`
  });

  assert.strictEqual(res.status, 200, "Lấy lịch sử thành công phải trả về 200");
  assert.ok(Array.isArray(res.data), "Kết quả trả về phải là một mảng (Array)");
  
  // Nếu mảng có dữ liệu, test thêm các trường cơ bản
  if (res.data.length > 0) {
    assert.ok(res.data[0].id, "Giao dịch phải có ID");
    assert.ok(res.data[0].amount, "Giao dịch phải có số tiền");
  }
});

Scenario("ITC_49.3 - Lỗi gọi API khi chưa đăng nhập (Thiếu Token)", async ({ I }) => {
  const res = await I.sendGetRequest("/api/payments/history/my");

  // Giống như API Get All History của Admin, thiếu token sẽ bị 401 Unauthorized
  assert.strictEqual(res.status, 401, "Thiếu Token phải trả về 401 Unauthorized");
});