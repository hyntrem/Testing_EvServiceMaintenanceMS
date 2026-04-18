Feature("deletebooking");

function formatLocalDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function generateFutureSlot(offsetMinutes = 120) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + offsetMinutes);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const start = new Date(now);
  const end = new Date(now);
  end.setHours(end.getHours() + 1);

  return {
    start_time: formatLocalDateTime(start),
    end_time: formatLocalDateTime(end),
  };
}

async function createBooking(I, baseOffset = 1200, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    const offset = baseOffset + i * 73 + Math.floor(Math.random() * 31);
    const { start_time, end_time } = generateFutureSlot(offset);

    I.haveRequestHeaders({
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    const createRes = await I.sendPostRequest("/api/bookings/items", {
      service_type: "Battery Maintenance",
      technician_id: Math.floor(Math.random() * 3) + 1,
      station_id: Math.floor(Math.random() * 3) + 1,
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

Scenario("Delete booking - success", async ({ I }) => {
  const bookingId = await createBooking(I, 1500, 10);

  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }
});

Scenario("Delete booking - not found", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendDeleteRequest("/api/bookings/items/999999");

  console.log("not found status:", response.status);
  console.log("not found body:", response.data);

  if (![400, 404].includes(response.status)) {
    throw new Error(`Expected 400 or 404, got ${response.status}`);
  }
});

Scenario("Delete booking - no token", async ({ I }) => {
  const bookingId = await createBooking(I, 1900, 10);

  I.haveRequestHeaders({
    Authorization: "",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );

  console.log("no token status:", response.status);
  console.log("no token body:", response.data);

  if (![401, 422].includes(response.status)) {
    throw new Error(`Expected 401 or 422, got ${response.status}`);
  }
});

Scenario("Delete booking - invalid token", async ({ I }) => {
  const bookingId = await createBooking(I, 2300, 10);

  I.haveRequestHeaders({
    Authorization: "Bearer invalid_token",
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const response = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );

  console.log("invalid token status:", response.status);
  console.log("invalid token body:", response.data);

  if (![401, 422].includes(response.status)) {
    throw new Error(`Expected 401 or 422, got ${response.status}`);
  }
});
