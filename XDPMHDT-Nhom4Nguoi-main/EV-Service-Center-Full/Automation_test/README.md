# 🧪 Microservice Test Suite

Cấu trúc CodeceptJS cho 11 microservices. Mỗi thành viên chỉ làm việc trong **1 thư mục service** của mình.

---

## 📁 Cấu trúc thư mục

```
tests-restructured/
├── _shared/                        ← Dùng chung, KHÔNG tự sửa
│   ├── helpers/BaseHelper.js       ← Helper dùng chung
│   └── fragments/auth.js           ← Login fragment
│
├── user-service/        (port 5000)
├── inventory-service/   (port 8000)
├── booking-service/     (port 8001)
├── finance-service/     (port 8002)
├── maintenance-service/ (port 8003)
├── payment-service/     (port 8004)
├── notification-service/(port 8005)
├── report-service/      (port 8006)
├── chat-service/        (port 8007)
├── staff-service/       (port 8008)
├── frontend/            (port 80)
│
│   Mỗi service có:
│   ├── codecept.conf.ts   ← Config riêng, port riêng
│   ├── .env               ← Biến môi trường riêng (KHÔNG commit)
│   ├── .env.example       ← Template (commit cái này)
│   ├── steps_file.ts
│   └── tests/
│       └── *_test.js
│
├── scripts/
│   ├── run-all-tests.sh   ← Chạy tất cả
│   └── migrate.sh         ← Migration từ cấu trúc cũ
│
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## 🚀 Bắt đầu nhanh

### 1. Cài dependencies (1 lần, ở root)
```bash
npm install
```

### 2. Setup .env cho service của bạn
```bash
# Ví dụ với booking-service
cp booking-service/.env.example booking-service/.env
# Mở file .env và điền giá trị thật
```

### 3. Chạy test service của mình
```bash
npm run test:booking
# hoặc
npm run test:user
npm run test:inventory
# ...
```

### 4. Chạy tất cả (CI/CD)
```bash
npm run test:all
```

---

## 👥 Phân công

| Thành viên | Service | Port | Thư mục |
|---|---|---|---|
| Member 1 | user-service | 5000 | `user-service/` |
| Member 2 | frontend | 80 | `frontend/` |
| Member 3 | inventory-service | 8000 | `inventory-service/` |
| Member 4 | booking-service | 8001 | `booking-service/` |
| Member 5 | finance-service | 8002 | `finance-service/` |
| Member 6 | maintenance-service | 8003 | `maintenance-service/` |
| Member 7 | payment-service | 8004 | `payment-service/` |
| Member 8 | notification-service | 8005 | `notification-service/` |
| Member 9 | report-service | 8006 | `report-service/` |
| Member 10 | chat-service | 8007 | `chat-service/` |
| Member 11 | staff-service | 8008 | `staff-service/` |

---

## ⚠️ Quy tắc bắt buộc

1. **Chỉ làm việc trong thư mục service của bạn** — không sửa thư mục người khác
2. **KHÔNG commit file `.env`** — chỉ commit `.env.example`
3. **Muốn sửa `_shared/`** — tạo PR, thảo luận với cả team trước
4. **Không cài `node_modules` riêng trong từng service** — chỉ dùng `node_modules` ở root
5. **Đặt tên test file dạng** `ten_chuc_nang_test.js`

---

## 🔧 Viết test mới

```js
// booking-service/tests/create_booking_test.js
const { loginAs } = require('../../_shared/fragments/auth');

Feature('Booking - Tạo đặt phòng');

Before(async ({ I }) => {
  await loginAs(I, 'admin');
});

Scenario('Tạo booking thành công', async ({ I }) => {
  const res = await I.sendPostRequest('/api/bookings', {
    room_id: 1,
    check_in: '2026-05-01',
    check_out: '2026-05-03',
  });
  I.seeResponseCodeIs(201);
  I.seeResponseContainsJson({ success: true });
});
```

---

## 🐛 Troubleshoot

**Lỗi "Cannot find module codeceptjs"**
```bash
# Chạy npm install ở root
cd <project-root>
npm install
```

**Lỗi port connection refused**
```bash
# Kiểm tra docker-compose đang chạy chưa
docker-compose ps
# Kiểm tra .env đúng port chưa
cat booking-service/.env
```

**Muốn xem log chi tiết**
```bash
cd booking-service && npx codeceptjs run --steps --verbose
```
