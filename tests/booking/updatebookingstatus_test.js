Feature("updatebookingstatus");

let bookingId = 26; // đổi thành ID có thật nếu cần

Scenario("Update booking status - success", async ({ I }) => {
  const response = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "completed",
    },
  );

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  I.seeResponseCodeIsSuccessful();
});

Scenario("Update booking status - invalid status", async ({ I }) => {
  const response = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "invalid_status",
    },
  );

  console.log("invalid status code:", response.status);
  console.log("invalid status body:", response.data);
});

Scenario("Update booking status - not found", async ({ I }) => {
  const response = await I.sendPutRequest("/api/bookings/items/999999/status", {
    status: "completed",
  });

  console.log("not found status:", response.status);
  console.log("not found body:", response.data);
});

Scenario("Update booking status - no token", async ({ I }) => {
  I.haveRequestHeaders({
    "Content-Type": "application/json",
  });

  const response = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "confirmed",
    },
  );

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);
});
