Feature("booking integration");

let bookingId;

Scenario("Full booking flow", async ({ I }) => {
  // 1. CREATE
  const createRes = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id: 1,
    station_id: 1,
    start_time: "2026-05-10T10:00:00",
    end_time: "2026-05-10T11:00:00",
  });

  console.log("CREATE status:", createRes.status);
  console.log("CREATE body:", createRes.data);

  bookingId =
    createRes.data?.id ||
    createRes.data?.booking_id ||
    createRes.data?.booking?.id ||
    createRes.data?.booking?.booking_id;

  console.log("BOOKING ID:", bookingId);

  if (!bookingId) {
    throw new Error("Create booking did not return booking id");
  }

  // 2. GET BY ID
  const getRes = await I.sendGetRequest(`/api/bookings/items/${bookingId}`);
  console.log("GET status:", getRes.status);
  console.log("GET body:", getRes.data);

  // 3. UPDATE STATUS
  const updateRes = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "completed",
    },
  );
  console.log("UPDATE status:", updateRes.status);
  console.log("UPDATE body:", updateRes.data);

  // 4. DELETE
  const deleteRes = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );
  console.log("DELETE status:", deleteRes.status);
  console.log("DELETE body:", deleteRes.data);
});
