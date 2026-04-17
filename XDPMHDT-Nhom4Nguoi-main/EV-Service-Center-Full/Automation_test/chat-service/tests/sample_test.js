/**
 * Sample test for chat-service (Chat)
 * Port: 8007
 */

Feature('chat-service');

BeforeSuite(async ({ I }) => {
  // Setup trước khi chạy suite (vd: login, seed data)
});

AfterSuite(async ({ I }) => {
  // Cleanup sau khi chạy xong
});

Scenario('Health check - chat-service is running', async ({ I }) => {
  const res = await I.sendGetRequest('/health');
  I.seeResponseCodeIs(200);
});

// Scenario('GET list items', async ({ I }) => {
//   const res = await I.sendGetRequest('/api/items');
//   I.seeResponseCodeIs(200);
//   I.seeResponseContainsJson({ success: true });
// });
