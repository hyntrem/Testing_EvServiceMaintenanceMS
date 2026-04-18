Feature("getmybookings");

Scenario("Get my bookings - success", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/my-bookings");

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!Array.isArray(response.data)) {
    throw new Error("Expected response body to be an array");
  }
});

Scenario("Get my bookings - invalid token", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: "Bearer invalid_token",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/my-bookings");

  console.log("invalid token status:", response.status);
  console.log("invalid token body:", response.data);

  if (![401, 422].includes(response.status)) {
    throw new Error(`Expected 401 or 422, got ${response.status}`);
  }
});

Scenario("Get my bookings - no token", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: "",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/my-bookings");

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);

  if (![401, 422].includes(response.status)) {
    throw new Error(`Expected 401 or 422, got ${response.status}`);
  }
});
