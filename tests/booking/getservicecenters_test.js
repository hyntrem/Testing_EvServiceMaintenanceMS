Feature("getservicecenters");

Scenario("Get service centers - success", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/centers");

  console.log("status:", response.status);
  console.log("body:", response.data);

  I.seeResponseCodeIsSuccessful();
});

Scenario("Get service centers - empty list", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/centers");

  console.log("empty status:", response.status);
  console.log("empty body:", response.data);

  I.seeResponseCodeIsSuccessful();
});
