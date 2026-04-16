Feature("deletebooking");

let bookingId = 26; // đổi sang ID có thật nếu cần

Scenario("Delete booking - success", async ({ I }) => {
  const response = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  I.seeResponseCodeIsSuccessful();
});

Scenario("Delete booking - not found", async ({ I }) => {
  const response = await I.sendDeleteRequest("/api/bookings/items/999999");

  console.log("not found status:", response.status);
  console.log("not found body:", response.data);
});

Scenario("Delete booking - no token", async ({ I }) => {
  I.haveRequestHeaders({
    "Content-Type": "application/json",
  });

  const response = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);
});

Scenario("Delete booking - invalid token", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: "Bearer invalid_token",
    "Content-Type": "application/json",
  });

  const response = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );

  console.log("invalid token status:", response.status);
  console.log("invalid token body:", response.data);
});
