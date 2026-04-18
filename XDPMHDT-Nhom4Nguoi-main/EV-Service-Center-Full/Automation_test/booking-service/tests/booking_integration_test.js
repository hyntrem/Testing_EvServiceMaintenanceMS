Feature("booking integration");

let bookingId;

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
      (5 * 24 * 60 +
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

async function createBookingWithRetry(I, baseOffset = 5000, maxRetries = 12) {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  for (let i = 0; i < maxRetries; i++) {
    const { start_time, end_time } = generateFutureSlot(baseOffset, i);
    const technician_id = (i % 2) + 1;
    const station_id = ((i + 1) % 2) + 1;

    console.log(`retry ${i + 1} start_time:`, start_time);
    console.log(`retry ${i + 1} end_time:`, end_time);
    console.log(`retry ${i + 1} technician_id:`, technician_id);
    console.log(`retry ${i + 1} station_id:`, station_id);

    const createRes = await I.sendPostRequest("/api/bookings/items", {
      service_type: "Battery Maintenance",
      technician_id,
      station_id,
      start_time,
      end_time,
    });

    console.log(`CREATE retry ${i + 1} status:`, createRes.status);
    console.log(`CREATE retry ${i + 1} body:`, createRes.data);

    if ([200, 201].includes(createRes.status)) {
      return { createRes, start_time, end_time, technician_id, station_id };
    }

    if (createRes.status !== 409) {
      throw new Error(`Create booking failed. Status: ${createRes.status}`);
    }
  }

  throw new Error(
    "Create booking failed after retries because of 409 conflict",
  );
}

Scenario("Full booking flow", async ({ I }) => {
  // 1. CREATE BOOKING (USER)
  const { createRes } = await createBookingWithRetry(I, 5000, 12);

  bookingId =
    createRes.data?.id ||
    createRes.data?.booking_id ||
    createRes.data?.booking?.id ||
    createRes.data?.booking?.booking_id;

  console.log("BOOKING ID:", bookingId);

  if (!bookingId) {
    throw new Error("Create booking did not return booking id");
  }

  // 2. GET BOOKING BY ID (USER)
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    Accept: "application/json",
  });

  const getRes = await I.sendGetRequest(`/api/bookings/items/${bookingId}`);

  console.log("GET status:", getRes.status);
  console.log("GET body:", getRes.data);

  if (getRes.status !== 200) {
    throw new Error(`Get booking by id failed. Status: ${getRes.status}`);
  }

  const getId =
    getRes.data?.id ||
    getRes.data?.booking_id ||
    getRes.data?.booking?.id ||
    getRes.data?.booking?.booking_id;

  if (Number(getId) !== Number(bookingId)) {
    throw new Error(`Booking id mismatch. Expected ${bookingId}, got ${getId}`);
  }

  // 3. UPDATE STATUS (ADMIN)
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const updateRes = await I.sendPutRequest(
    `/api/bookings/items/${bookingId}/status`,
    {
      status: "completed",
    },
  );

  console.log("UPDATE status:", updateRes.status);
  console.log("UPDATE body:", updateRes.data);

  if (updateRes.status !== 200) {
    throw new Error(
      `Update booking status failed. Status: ${updateRes.status}`,
    );
  }

  const updatedStatus =
    updateRes.data?.status || updateRes.data?.booking?.status;

  if (updatedStatus !== "completed") {
    throw new Error(
      `Update status failed. Expected completed, got ${updatedStatus}`,
    );
  }

  // 4. DELETE BOOKING (ADMIN)
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    Accept: "application/json",
  });

  const deleteRes = await I.sendDeleteRequest(
    `/api/bookings/items/${bookingId}`,
  );

  console.log("DELETE status:", deleteRes.status);
  console.log("DELETE body:", deleteRes.data);

  if (deleteRes.status !== 200) {
    throw new Error(`Delete booking failed. Status: ${deleteRes.status}`);
  }
});
