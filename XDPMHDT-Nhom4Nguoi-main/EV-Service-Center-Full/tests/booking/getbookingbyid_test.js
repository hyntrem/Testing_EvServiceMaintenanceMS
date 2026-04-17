Feature("getbookingbyid");

let bookingId = 26;

Scenario("Get booking by id - success", async ({ I }) => {
  const response = await I.sendGetRequest(`/api/bookings/items/${bookingId}`);

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  I.seeResponseCodeIsSuccessful();
});

Scenario("Get booking by id - not found", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/items/999999");

  console.log("not found status:", response.status);
  console.log("not found body:", response.data);

  I.seeResponseCodeIs(404);
});

Scenario("Get booking by id - invalid id", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/items/abc");

  console.log("invalid id status:", response.status);
  console.log("invalid id body:", response.data);
});
