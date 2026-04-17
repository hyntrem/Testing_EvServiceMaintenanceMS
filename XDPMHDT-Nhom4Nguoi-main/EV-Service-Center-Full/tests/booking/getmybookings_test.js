Feature("getmybookings");

Scenario("Get my bookings - success", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/my-bookings");

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  I.seeResponseCodeIsSuccessful();
});

Scenario("Get my bookings - invalid token", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: "Bearer invalid_token",
    "Content-Type": "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/my-bookings");

  console.log("invalid token status:", response.status);
  console.log("invalid token body:", response.data);

  I.seeResponseCodeIs(422);
});

Scenario("Get my bookings - no token", async ({ I }) => {
  I.haveRequestHeaders({
    "Content-Type": "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/my-bookings");

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);

  I.seeResponseCodeIsSuccessful();
});
