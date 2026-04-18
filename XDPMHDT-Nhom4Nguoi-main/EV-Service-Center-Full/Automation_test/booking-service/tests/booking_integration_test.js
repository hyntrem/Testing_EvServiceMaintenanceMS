Feature("booking integration");

let bookingId;

function generateBookingTime() {
  const now = new Date();

  // tăng ngẫu nhiên để tránh trùng slot cũ
  const randomOffset = Math.floor(Math.random() * 300) + 120;
  now.setMinutes(now.getMinutes() + randomOffset);
  now.setSeconds(0);
  now.setMilliseconds(0);

  const start = new Date(now);
  const end = new Date(now);
  end.setHours(end.getHours() + 1);

  const pad = (n) => String(n).padStart(2, "0");

  const formatLocal = (d) => {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return {
    start_time: formatLocal(start),
    end_time: formatLocal(end),
  };
}

Scenario("Full booking flow", async ({ I }) => {
  const { start_time, end_time } = generateBookingTime();

  console.log("start_time:", start_time);
  console.log("end_time:", end_time);

  // random nhẹ để tránh conflict
  const technician_id = Math.floor(Math.random() * 3) + 1;
  const station_id = Math.floor(Math.random() * 3) + 1;

  console.log("technician_id:", technician_id);
  console.log("station_id:", station_id);

  // 1. CREATE BOOKING (USER)
  I.haveRequestHeaders({
    Authorization: `Bearer ${process.env.API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  });

  const createRes = await I.sendPostRequest("/api/bookings/items", {
    service_type: "Battery Maintenance",
    technician_id,
    station_id,
    start_time,
    end_time,
  });

  console.log("CREATE status:", createRes.status);
  console.log("CREATE body:", createRes.data);

  if (![200, 201].includes(createRes.status)) {
    throw new Error(`Create booking failed. Status: ${createRes.status}`);
  }

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
