Feature("updatebookingstatus");

function formatLocalDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function generateFutureSlot(seedMinutes = 0, attempt = 0) {
  const start = new Date(
    Date.now() +
      (4 * 24 * 60 +
        seedMinutes +
        attempt * 181 +
        Math.floor(Math.random() * 43)) *
        60 *
        1000,
  );
  start.setMilliseconds(0);

  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    start_time: formatLocalDateTime(start),
    end_time: formatLocalDateTime(end),
  };
}

async function createBooking(I, baseOffset = 3000, maxRetries = 12) {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  for (let i = 0; i < maxRetries; i++) {
    const { start_time, end_time } = generateFutureSlot(baseOffset, i);
    const technician_id = (i % 2) + 1;
    const station_id = ((i + 1) % 2) + 1;

    const createRes = await I.sendPostRequest("/api/bookings/items", {
      service_type: "Battery Maintenance",
      technician_id,
      station_id,
      start_time,
      end_time,
    });

    console.log(`create retry ${i + 1} status:`, createRes.status);
    console.log(`create retry ${i + 1} body:`, createRes.data);

    if ([200, 201].includes(createRes.status)) {
      const bookingId =
        createRes.data?.id ||
        createRes.data?.booking_id ||
        createRes.data?.booking?.id ||
        createRes.data?.booking?.booking_id;

      if (!bookingId) {
        throw new Error("Create booking setup did not return booking id");
      }

      return bookingId;
    }

    if (createRes.status !== 409) {
      throw new Error(`Create booking setup failed, got ${createRes.status}`);
    }
  }

  throw new Error(
    "Create booking setup failed after retries because of 409 conflict",
  );
}

Scenario("Update booking status - success", async ({ I }) => {
  const bookingId = await createBooking(I, 3000, 12);

  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "completed",
    },
  );

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  const updatedStatus = response.data?.status || response.data?.booking?.status;

  if (updatedStatus !== "completed") {
    throw new Error(`Expected status completed, got ${updatedStatus}`);
  }
});

Scenario("Update booking status - invalid status", async ({ I }) => {
  const bookingId = await createBooking(I, 4200, 12);

  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "invalid_status",
    },
  );

  console.log("invalid status code:", response.status);
  console.log("invalid status body:", response.data);

  if (![400, 404].includes(response.status)) {
    throw new Error(`Expected 400 or 404, got ${response.status}`);
  }
});

Scenario("Update booking status - not found", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendPutRequest("/api/bookings/items/999999/status", {
    status: "completed",
  });

  console.log("not found status:", response.status);
  console.log("not found body:", response.data);

  if (![400, 404].includes(response.status)) {
    throw new Error(`Expected 400 or 404, got ${response.status}`);
  }
});

Scenario("Update booking status - no token", async ({ I }) => {
  const bookingId = await createBooking(I, 5400, 12);

  I.haveRequestHeaders({
    Authorization: "",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "confirmed",
    },
  );

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);

  if (![401, 422].includes(response.status)) {
    throw new Error(`Expected 401 or 422, got ${response.status}`);
  }
});
