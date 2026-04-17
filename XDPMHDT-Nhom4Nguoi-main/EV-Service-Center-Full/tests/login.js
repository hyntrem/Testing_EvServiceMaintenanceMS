Feature('Login API');

Scenario('login success', async ({ I }) => {

  const res = await I.sendPostRequest('/api/login', {
    email_username: "admin1",
    password: "12345"
  });

  console.log(res.status);
  console.log(res.data);

  I.seeResponseCodeIsSuccessful();
});