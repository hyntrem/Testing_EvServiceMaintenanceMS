Feature("getservicecenters");

Scenario("Get service centers - success", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/centers");

  console.log("status:", response.status);
  console.log("body:", response.data);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!response.data) {
    throw new Error("Response body is empty");
  }
});

Scenario("Get service centers - empty list", async ({ I }) => {
  const response = await I.sendGetRequest("/api/bookings/centers");

  console.log("empty status:", response.status);
  console.log("empty body:", response.data);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  // chấp nhận array rỗng hoặc có data
  if (!Array.isArray(response.data) && !response.data?.centers) {
    console.warn("Response is not array or centers object, check API format");
  }
});
