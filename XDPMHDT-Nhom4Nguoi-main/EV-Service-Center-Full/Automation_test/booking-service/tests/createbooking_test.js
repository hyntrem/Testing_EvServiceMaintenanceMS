Feature("createbooking");

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

function generatePastSlot() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - 120);
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

async function createBookingWithRetry(I, baseOffset = 120, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    const offset = baseOffset + i * 37 + Math.floor(Math.random() * 17);
    const { start_time, end_time } = generateFutureSlot(offset);

    const res = await I.sendPostRequest("/api/bookings/items", {
      service_type: "Battery Maintenance",
      technician_id: Math.floor(Math.random() * 2) + 1,
      station_id: Math.floor(Math.random() * 2) + 1,
      start_time,
      end_time,
    });

    console.log(`retry ${i + 1} status:`, res.status);
    console.log(`retry ${i + 1} body:`, res.data);

    if ([200, 201].includes(res.status)) {
      return { res, start_time, end_time };
    }

    if (res.status !== 409) {
      throw new Error(`Unexpected setup status ${res.status}`);
    }
  }

  throw new Error(
    "Create booking setup failed after retries because of 409 conflict",
  );
}

Scenario("Create booking - success", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  });

  const { res } = await createBookingWithRetry(I, 125);

  console.log("success status:", res.status);
  console.log("success body:", res.data);

  if (![200, 201].includes(res.status)) {
    throw new Error(`Expected success, got ${res.status}`);
  }
});

Scenario("Create booking - missing field", async ({ I }) => {
  const { start_time, end_time } = generateFutureSlot(185);

  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  });

  const res = await I.sendPostRequest("/api/bookings/items", {
    technician_id: 2,
    station_id: 2,
    start_time,
    end_time,
  });

  console.log("missing field status:", res.status);
  console.log("missing field body:", res.data);

  if (![400, 422].includes(res.status)) {
    throw new Error(`Expected 400/422, got ${res.status}`);
  }
});

Scenario(
  "Create booking - invalid time format (BUG EXPECTED)",
  async ({ I }) => {
    I.haveRequestHeaders({
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    });

    const res = await I.sendPostRequest("/api/bookings/items", {
      service_type: "Battery Maintenance",
      technician_id: 2,
      station_id: 2,
      start_time: "abc",
      end_time: "xyz",
    });

    console.log("invalid time status:", res.status);
    console.log("invalid time body:", res.data);

    if (![400, 422].includes(res.status)) {
      throw new Error(
        `BUG: Invalid time should return 400/422, got ${res.status}`,
      );
    }
  },
);

Scenario("Create booking - conflict", async ({ I }) => {
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  });

  const { start_time, end_time } = await createBookingWithRetry(I, 245);

  const res = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id: 2,
    station_id: 2,
    start_time,
    end_time,
  });

  console.log("conflict status:", res.status);
  console.log("conflict body:", res.data);

  if (![400, 409].includes(res.status)) {
    throw new Error(`Expected conflict 400/409, got ${res.status}`);
  }
});

Scenario("Create booking - past time (BVA - BUG EXPECTED)", async ({ I }) => {
  const { start_time, end_time } = generatePastSlot();

  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
  });

  const res = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id: 2,
    station_id: 2,
    start_time,
    end_time,
  });

  console.log("past time status:", res.status);
  console.log("past time body:", res.data);

  if (![400, 409, 422].includes(res.status)) {
    throw new Error(
      `BUG: Past time booking should be rejected, got ${res.status}`,
    );
  }
});
// test
