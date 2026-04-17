Feature('Inventory Full Test Suite');

const assert = require('assert');

const unique = Date.now();

let token = '';
let itemId = 0;

const itemData = {
    name: 'Test Item ' + unique,
    part_number: 'PART-' + unique,
    price: 100000,
    quantity: 20,
    min_quantity: 5,
    category: 'battery',
    compatible_models: 'VF8'
};

Scenario('FULL Inventory Test: CRUD + Validation + Negative + AI', async ({ I }) => {

    // ===================== 1. LOGIN =====================
    I.say('Bước 1: Đăng nhập lấy token');
    const loginRes = await I.sendPostRequest('/api/login', {
        email_username: 'admin1',
        password: '12345'
    });

    I.seeResponseCodeIs(200);
    I.seeResponseContainsKeys(['access_token']);

    token = loginRes.data.access_token;
    I.amBearerAuthenticated(token);

    // ===================== 2. CREATE =====================
    I.say('Bước 2: Tạo item');
    const createRes = await I.sendPostRequest('/api/inventory/items', itemData);

    I.seeResponseCodeIs(201);
    I.seeResponseContainsKeys(['item']);

    itemId = createRes.data.item.id;

    // ===================== 3. DUPLICATE =====================
    I.say('Bước 3: Test duplicate part_number');
    await I.sendPostRequest('/api/inventory/items', itemData);
    I.seeResponseCodeIs(409);

    // ===================== 4. GET ALL =====================
    I.say('Bước 4: Lấy danh sách items');
    await I.sendGetRequest('/api/inventory/items');
    I.seeResponseCodeIs(200);

    // ===================== 5. GET BY ID =====================
    I.say('Bước 5: Lấy item theo ID');
    await I.sendGetRequest(`/api/inventory/items/${itemId}`);
    I.seeResponseCodeIs(200);

    // ===================== 6. UPDATE (TRỪ KHO) =====================
    I.say('Bước 6: Trừ kho');
    await I.sendPutRequest(`/api/inventory/items/${itemId}`, {
        quantity_to_deduct: 5
    });
    I.seeResponseCodeIs(200);

    const afterUpdate = await I.sendGetRequest(`/api/inventory/items/${itemId}`);
    I.seeResponseContainsJson({
        quantity: 15
    });

    // ===================== 7. UPDATE INVALID =====================
    I.say('Bước 7: Test trừ quá số lượng');
    await I.sendPutRequest(`/api/inventory/items/${itemId}`, {
        quantity_to_deduct: 9999
    });
    I.seeResponseCodeIs(400);

    I.say('Bước 7.1: Test quantity âm');
    await I.sendPutRequest(`/api/inventory/items/${itemId}`, {
        quantity: -10
    });
    I.seeResponseCodeIs(400);

    // ===================== 8. LOW STOCK =====================
    I.say('Bước 8: Kiểm tra low stock');

    await I.sendPutRequest(`/api/inventory/items/${itemId}`, {
        quantity: 3
    });

    const lowStockRes = await I.sendGetRequest('/api/inventory/low-stock');
    I.seeResponseCodeIs(200);

    assert.ok(
        lowStockRes.data.some(item => item.id === itemId),
        'Item không nằm trong low stock'
    );

    // ===================== 9. AI =====================
    I.say('Bước 9: Seed dữ liệu AI');
    await I.sendPostRequest('/api/inventory/seed-ai-data');
    I.seeResponseCodeIs(201);

    I.say('Bước 9.1: Gợi ý phụ tùng');
    const suggestRes = await I.sendPostRequest('/api/inventory/suggest-parts', {
        vehicle_model: 'VF8',
        category: 'battery'
    });

    I.seeResponseCodeIs(200);

    assert.ok(
        Array.isArray(suggestRes.data) && suggestRes.data.length > 0,
        'Suggest API trả về rỗng'
    );

    // ===================== 10. DELETE =====================
    I.say('Bước 10: Xóa item');
    await I.sendDeleteRequest(`/api/inventory/items/${itemId}`);
    I.seeResponseCodeIs(200);

    // ===================== 11. VERIFY DELETE =====================
    I.say('Bước 11: Verify đã xóa');
    await I.sendGetRequest(`/api/inventory/items/${itemId}`);
    I.seeResponseCodeIs(404);

});