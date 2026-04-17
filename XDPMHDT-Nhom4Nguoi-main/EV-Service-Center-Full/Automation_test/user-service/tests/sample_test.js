/**
 * Sample test for user-service (Quản lý người dùng)
 * Port: 5000
 */

Feature('user-service');

BeforeSuite(async ({ I }) => {
  // Setup trước khi chạy suite (vd: login, seed data)
});

AfterSuite(async ({ I }) => {
  // Cleanup sau khi chạy xong
});

Scenario('Health check - user-service is running', async ({ I }) => {
  const res = await I.sendGetRequest('/health');
  I.seeResponseCodeIs(200);
});

// Scenario('GET list items', async ({ I }) => {
//   const res = await I.sendGetRequest('/api/items');
//   I.seeResponseCodeIs(200);
//   I.seeResponseContainsJson({ success: true });
// });
