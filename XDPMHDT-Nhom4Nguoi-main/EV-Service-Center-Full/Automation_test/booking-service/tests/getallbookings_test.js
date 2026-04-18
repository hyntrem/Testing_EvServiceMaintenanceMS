Feature("getallbookings");

Scenario("Get all bookings - admin", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/items");

  console.log("admin status:", response.status);
  console.log("admin body:", response.data);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  if (!Array.isArray(response.data)) {
    throw new Error("Expected response body to be an array");
  }
});

Scenario("Get all bookings - user token (BUG EXPECTED)", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/items");

  console.log("user status:", response.status);
  console.log("user body:", response.data);

  // EXPECT: user phải bị chặn
  // ACTUAL: backend đang trả 200 -> BUG phân quyền
  if (![401, 403].includes(response.status)) {
    throw new Error(
      `BUG: User token should not access get all bookings, got ${response.status}`,
    );
  }
});

Scenario("Get all bookings - no token", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: "",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/items");

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);

  if (![401, 422].includes(response.status)) {
    throw new Error(`Expected 401 or 422, got ${response.status}`);
  }
});
