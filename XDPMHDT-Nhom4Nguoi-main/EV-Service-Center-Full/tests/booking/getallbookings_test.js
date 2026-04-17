Feature("getallbookings");

Scenario("Get all bookings - admin", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/items");

  console.log("admin status:", response.status);
  console.log("admin body:", response.data);

  I.seeResponseCodeIsSuccessful();
});

Scenario("Get all bookings - user token", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: "Bearer invalid_or_user_token",
    "Content-Type": "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/items");

  console.log("user status:", response.status);
  console.log("user body:", response.data);
});

Scenario("Get all bookings - no token", async ({ I }) => {
  I.haveRequestHeaders({
    "Content-Type": "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/items");

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);
});
