/**
 * Sample E2E test for Frontend (port 80)
 */
Feature('Frontend E2E');

Scenario('Trang chủ load thành công', async ({ I }) => {
  I.amOnPage('/');
  I.see(''); // thêm text cần verify
  I.seeInCurrentUrl('/');
});

// Scenario('Login flow', async ({ I }) => {
//   I.amOnPage('/login');
//   I.fillField('email', process.env.ADMIN_EMAIL);
//   I.fillField('password', process.env.ADMIN_PASSWORD);
//   I.click('Đăng nhập');
//   I.waitForNavigation();
//   I.seeInCurrentUrl('/dashboard');
// });
