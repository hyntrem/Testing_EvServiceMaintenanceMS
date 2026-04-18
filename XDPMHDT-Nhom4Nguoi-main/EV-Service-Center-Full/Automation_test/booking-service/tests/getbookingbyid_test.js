Feature("getbookingbyid");

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

async function createBooking(I, offsetMinutes = 120) {
  const { start_time, end_time } = generateFutureSlot(offsetMinutes);

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

  console.log("create status:", createRes.status);
  console.log("create body:", createRes.data);

  if (![200, 201].includes(createRes.status)) {
    throw new Error(`Create booking setup failed, got ${createRes.status}`);
  }

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

Scenario("Get booking by id - success", async ({ I }) => {
  const randomOffset = Math.floor(Math.random() * 300) + 120;
  const bookingId = await createBooking(I, randomOffset);

  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    Accept: "application/json",
  });

  const response = await I.sendGetRequest(`/api/bookings/items/${bookingId}`);

  console.log("success status:", response.status);
  console.log("success body:", response.data);

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  const returnedId =
    response.data?.id ||
    response.data?.booking_id ||
    response.data?.booking?.id ||
    response.data?.booking?.booking_id;

  if (Number(returnedId) !== Number(bookingId)) {
    throw new Error(`Expected booking id ${bookingId}, got ${returnedId}`);
  }
});

Scenario("Get booking by id - not found", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/items/999999");

  console.log("not found status:", response.status);
  console.log("not found body:", response.data);

  if (![404, 400].includes(response.status)) {
    throw new Error(`Expected 404 or 400, got ${response.status}`);
  }
});

Scenario("Get booking by id - invalid id", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    Accept: "application/json",
  });

  const response = await I.sendGetRequest("/api/bookings/items/abc");

  console.log("invalid id status:", response.status);
  console.log("invalid id body:", response.data);

  if (![400, 404, 422].includes(response.status)) {
    throw new Error(`Expected 400, 404 or 422, got ${response.status}`);
  }
});
