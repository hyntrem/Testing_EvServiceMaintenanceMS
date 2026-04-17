const assert = require("assert");

Feature("Payment & Finance - Integration Flow");

Scenario("full flow: create invoice -> payment -> webhook -> histories", async ({ I }) => {
  let invoiceId;
  let userId;
  let paymentAmount;
  let pgTransactionId;

  const bookingId = Number(process.env.INTEGRATION_BOOKING_ID);

  // 1. Create invoice
  const createInvoiceRes = await I.sendPostRequest(
    "/api/invoices/",
    { booking_id: bookingId },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  console.log("integration createInvoice status:", createInvoiceRes.status);
  console.log("integration createInvoice data:", JSON.stringify(createInvoiceRes.data, null, 2));

  if (createInvoiceRes.status === 201) {
    assert.ok(createInvoiceRes.data.invoice);
    invoiceId = createInvoiceRes.data.invoice.id;
    userId = createInvoiceRes.data.invoice.user_id;
    paymentAmount = createInvoiceRes.data.invoice.total_amount;
  } else if (createInvoiceRes.status === 409) {
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

    assert.ok(existedInvoice, "Booking đã có invoice nhưng không tìm thấy trong danh sách");

    invoiceId = existedInvoice.id;
    userId = existedInvoice.user_id;
    paymentAmount = existedInvoice.total_amount;
  } else {
    throw new Error(
      `Không thể tạo invoice cho bookingId=${bookingId}. Response: ${JSON.stringify(createInvoiceRes.data)}`
    );
  }

  // 2. Get invoice details
  const getInvoiceDetailRes = await I.sendGetRequest(
    `/api/invoices/${invoiceId}`,
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(getInvoiceDetailRes.status, 200);
  assert.strictEqual(String(getInvoiceDetailRes.data.id), String(invoiceId));
  assert.ok(Array.isArray(getInvoiceDetailRes.data.items));

  // 3. Create payment request
  const createPaymentRes = await I.sendPostRequest(
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

  console.log("integration createPayment status:", createPaymentRes.status);
  console.log("integration createPayment data:", JSON.stringify(createPaymentRes.data, null, 2));

  if (createPaymentRes.status === 400) {
    throw new Error(
      `Không thể tạo payment cho invoiceId=${invoiceId}. Response: ${JSON.stringify(createPaymentRes.data)}`
    );
  }

  assert.strictEqual(createPaymentRes.status, 201);
  assert.ok(createPaymentRes.data.pg_transaction_id);

  pgTransactionId = createPaymentRes.data.pg_transaction_id;

  // 4. Handle webhook success
  const webhookRes = await I.sendPostRequest(
    "/api/payments/webhook",
    {
      pg_transaction_id: pgTransactionId,
      status: "success",
    },
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  assert.strictEqual(webhookRes.status, 200);
  assert.ok(webhookRes.data.message);

  // 5. Get my payment history
  const myHistoryRes = await I.sendGetRequest(
    "/api/payments/history/my",
    {
      Authorization: `Bearer ${process.env.USER_TOKEN}`,
    }
  );

  console.log("myHistory status:", myHistoryRes.status);
  console.log("myHistory data:", JSON.stringify(myHistoryRes.data, null, 2));

  assert.strictEqual(myHistoryRes.status, 200);
  assert.ok(Array.isArray(myHistoryRes.data));

  // 6. Get all payment history
  const allHistoryRes = await I.sendGetRequest(
    "/api/payments/history/all",
    {
      Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    }
  );

  console.log("allHistory status:", allHistoryRes.status);
  console.log("allHistory data:", JSON.stringify(allHistoryRes.data, null, 2));

  assert.strictEqual(allHistoryRes.status, 200);
  assert.ok(Array.isArray(allHistoryRes.data));

  const foundInAllHistory = allHistoryRes.data.some(
    (p) => String(p.invoice_id) === String(invoiceId)
  );
  assert.strictEqual(foundInAllHistory, true);
});