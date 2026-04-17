const assert = require("assert");

Feature("Finance Service - createInvoice");

let invoiceId;
let userId;
let paymentAmount;


Scenario("createInvoice - success", async ({ I }) => {
  const bookingId = Number(process.env.BOOKING_ID);

  const res = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: bookingId },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  console.log("finance createInvoice status:", res.status);
  console.log("finance createInvoice data:", JSON.stringify(res.data, null, 2));

  if (res.status === 201) {
    assert.ok(res.data.invoice);
    assert.ok(res.data.invoice.id);
    assert.ok(res.data.invoice.booking_id);
    assert.ok(res.data.invoice.total_amount);

    invoiceId = res.data.invoice.id;
    userId = res.data.invoice.user_id;
    paymentAmount = res.data.invoice.total_amount;
    return;
  }

  if (res.status === 409) {
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

    assert.ok(
      existedInvoice,
      "Booking đã có invoice nhưng không tìm thấy invoice tương ứng trong danh sách"
    );

    invoiceId = existedInvoice.id;
    userId = existedInvoice.user_id;
    paymentAmount = existedInvoice.total_amount;
    return;
  }

  if (res.status === 400) {
    throw new Error(
      `BOOKING_ID=${bookingId} không hợp lệ hoặc không tồn tại. Response: ${JSON.stringify(res.data)}`
    );
  }

  assert.strictEqual(res.status, 201);
});

Scenario("createInvoice - missing booking_id", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    {},
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("createInvoice - booking does not exist", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: 999999 },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("getAllInvoices - success", async ({ I }) => {
  const res = await I.sendGetRequest(
    "/api/invoices/",
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.data));
});

Scenario("getInvoiceDetails - success", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có, cần chạy createInvoice trước");

  const res = await I.sendGetRequest(
    `/api/invoices/${invoiceId}`,
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 200);
  assert.strictEqual(String(res.data.id), String(invoiceId));
  assert.ok(Array.isArray(res.data.items));
});

Scenario("getInvoiceDetails - invoice not found", async ({ I }) => {
  const res = await I.sendGetRequest(
    `/api/invoices/${process.env.INVALID_INVOICE_ID}`,
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 404);
  assert.ok(res.data.error);
});

Scenario("updateInvoiceStatus - success", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có, cần chạy createInvoice trước");

  const res = await I.sendPutRequest(
    `/api/invoices/${invoiceId}/status`,
    { status: "pending" },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 200);
  assert.ok(res.data.invoice);
  assert.strictEqual(res.data.invoice.status, "pending");
});

Scenario("updateInvoiceStatus - invalid data", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có, cần chạy createInvoice trước");

  const res = await I.sendPutRequest(
    `/api/invoices/${invoiceId}/status`,
    {},
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("BVA - createInvoice with booking_id = 0", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: 0 },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("BVA - createInvoice with booking_id = -1", async ({ I }) => {
  const res = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: -1 },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});

Scenario("BVA - getInvoiceDetails with invoice_id = 0", async ({ I }) => {
  const res = await I.sendGetRequest(
    "/api/invoices/0",
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.ok([400, 404].includes(res.status));
});

Scenario("BVA - updateInvoiceStatus with empty status", async ({ I }) => {
  assert.ok(invoiceId, "invoiceId chưa có, cần chạy createInvoice trước");

  const res = await I.sendPutRequest(
    `/api/invoices/${invoiceId}/status`,
    { status: "" },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(res.status, 400);
  assert.ok(res.data.error);
});