Feature("createbooking");

Scenario("Create booking - success", async ({ I }) => {
  const response = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id: 1,
    station_id: 1,
    start_time: "2026-04-30T13:00:00",
    end_time: "2026-04-30T14:00:00",
  });

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  I.seeResponseCodeIsSuccessful();
});

Scenario("Create booking - missing field", async ({ I }) => {
  const response = await I.sendPostRequest("/api/bookings/items", {
    technician_id: 1,
    station_id: 1,
    start_time: "2026-03-23T15:00:00",
    end_time: "2026-03-23T16:00:00",
  });

  console.log("missing field status:", response.status);
  console.log("missing field body:", response.data);

  I.seeResponseCodeIs(400);
});

Scenario("Create booking - invalid time format", async ({ I }) => {
  const response = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id: 1,
    station_id: 1,
    start_time: "abc",
    end_time: "xyz",
  });

  console.log("invalid time status:", response.status);
  console.log("invalid time body:", response.data);

  I.seeResponseCodeIs(500);
});

Scenario("Create booking - conflict", async ({ I }) => {
  const response = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id: 1,
    station_id: 1,
    start_time: "2026-03-23T09:00:00",
    end_time: "2026-03-23T10:00:00",
  });

  console.log("conflict status:", response.status);
  console.log("conflict body:", response.data);

  I.seeResponseCodeIs(409);
});

Scenario("Create booking - past time (BVA)", async ({ I }) => {
  const response = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id: 1,
    station_id: 1,
    start_time: "2024-01-01T09:00:00",
    end_time: "2024-01-01T10:00:00",
  });

  console.log("past time status:", response.status);
  console.log("past time body:", response.data);

  I.seeResponseCodeIs(409);
});
