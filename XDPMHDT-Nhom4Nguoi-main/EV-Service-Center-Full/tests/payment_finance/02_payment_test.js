const assert = require("assert");

Feature("Payment Service - Payment APIs");

let invoiceId;
let userId;
let paymentAmount;
let pgTransactionId;

Scenario("prepare invoice before payment", async ({ I }) => {
  const bookingId = Number(process.env.PAYMENT_BOOKING_ID);

  const invoiceRes = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: bookingId },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  console.log("prepare invoice status:", invoiceRes.status);
  console.log("prepare invoice data:", JSON.stringify(invoiceRes.data, null, 2));

  if (invoiceRes.status === 201) {
    invoiceId = invoiceRes.data.invoice.id;
    userId = invoiceRes.data.invoice.user_id;
    paymentAmount = invoiceRes.data.invoice.total_amount;
    return;
  }

  if (invoiceRes.status === 409) {
    const listRes = await I.sendGetRequest(
      "/api/invoices/",
      {
        Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
      }
    );

    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data));

    const existedInvoice = listRes.data.find(
      (inv) => String(inv.booking_id) === String(bookingId)
    );

    assert.ok(existedInvoice, "Booking đã có invoice nhưng không tìm thấy invoice trong danh sách");

    invoiceId = existedInvoice.id;
    userId = existedInvoice.user_id;
    paymentAmount = existedInvoice.total_amount;
    return;
  }

  assert.strictEqual(invoiceRes.status, 201);
});

Scenario("createPaymentRequest - success", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có, prepare invoice before payment bị fail");
  assert.ok(userId, "userId chưa có, prepare invoice before payment bị fail");
  assert.ok(paymentAmount, "paymentAmount chưa có, prepare invoice before payment bị fail");

  const res = await I.sendPostRequest(
    "/api/payments/create",
    {
      invoice_id: invoiceId,
      method: process.env.PAYMENT_METHOD,
      user_id: userId,
      amount: paymentAmount,
    },
    {
      Authorization: `Bearer ${process.env.USER_TOKEN}`,
    }
  );

  console.log("create payment success status:", res.status);
  console.log("create payment success data:", JSON.stringify(res.data, null, 2));

  assert.strictEqual(res.status, 201);
  assert.ok(res.data.id);
  assert.ok(res.data.invoice_id);
  assert.ok(res.data.user_id);
  assert.ok(res.data.amount);
  assert.ok(res.data.method);
  assert.ok(res.data.pg_transaction_id);
  assert.ok(String(res.data.status).includes("pending"));

  pgTransactionId = res.data.pg_transaction_id;
});

Scenario("createPaymentRequest - invalid invoice_id", async ({ I }) => {
  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: Number(process.env.INVALID_INVOICE_ID),
    method: process.env.PAYMENT_METHOD,
    user_id: userId || 1,
    amount: 1000,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("createPaymentRequest - missing amount", async ({ I }) => {
  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: invoiceId,
    method: process.env.PAYMENT_METHOD,
    user_id: userId,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("createPaymentRequest - wrong user_id", async ({ I }) => {
  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: invoiceId,
    method: process.env.PAYMENT_METHOD,
    user_id: 999999,
    amount: paymentAmount,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("createPaymentRequest - wrong amount", async ({ I }) => {
  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: invoiceId,
    method: process.env.PAYMENT_METHOD,
    user_id: userId,
    amount: 1000,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("handlePaymentWebhook - success", async ({ I }) => {
  assert.ok(pgTransactionId, "pgTransactionId chưa có, createPaymentRequest - success bị fail");

  const res = await I.sendPostRequest(
    "/api/payments/webhook",
    {
      pg_transaction_id: pgTransactionId,
      status: "success",
    },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  console.log("webhook success status:", res.status);
  console.log("webhook success data:", JSON.stringify(res.data, null, 2));

  assert.strictEqual(res.status, 200);
  assert.ok(res.data.message);
});

Scenario("handlePaymentWebhook - invalid status", async ({ I }) => {
  const res = await I.sendPostRequest("/api/payments/webhook", {
    pg_transaction_id: pgTransactionId,
    status: "done",
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("handlePaymentWebhook - missing field", async ({ I }) => {
  const res = await I.sendPostRequest("/api/payments/webhook", {
    status: "success",
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("getAllPaymentHistory - success", async ({ I }) => {
  const res = await I.sendGetRequest(
    "/api/payments/history/all",
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.data));
});

Scenario("getMyPaymentHistory - success", async ({ I }) => {
  const res = await I.sendGetRequest(
    "/api/payments/history/my",
    {
      Authorization: `Bearer ${process.env.USER_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.data));
});

Scenario("BVA - createPaymentRequest with invoice_id = 0", async ({ I }) => {
  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: 0,
    method: process.env.PAYMENT_METHOD,
    user_id: userId || 1,
    amount: 1000,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("BVA - createPaymentRequest with amount = 0", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có");
  assert.ok(userId, "userId chưa có");

  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: invoiceId,
    method: process.env.PAYMENT_METHOD,
    user_id: userId,
    amount: 0,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("BVA - createPaymentRequest with amount = -1", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có");
  assert.ok(userId, "userId chưa có");

  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: invoiceId,
    method: process.env.PAYMENT_METHOD,
    user_id: userId,
    amount: -1,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("BVA - createPaymentRequest with amount just below invoice total", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có");
  assert.ok(userId, "userId chưa có");
  assert.ok(paymentAmount, "paymentAmount chưa có");

  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: invoiceId,
    method: process.env.PAYMENT_METHOD,
    user_id: userId,
    amount: Number(paymentAmount) - 1,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("BVA - createPaymentRequest with amount just above invoice total", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có");
  assert.ok(userId, "userId chưa có");
  assert.ok(paymentAmount, "paymentAmount chưa có");

  const res = await I.sendPostRequest("/api/payments/create", {
    invoice_id: invoiceId,
    method: process.env.PAYMENT_METHOD,
    user_id: userId,
    amount: Number(paymentAmount) + 1,
  });

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});