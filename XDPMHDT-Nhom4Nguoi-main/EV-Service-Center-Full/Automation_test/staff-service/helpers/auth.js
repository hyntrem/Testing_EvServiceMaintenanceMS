const axios = require('axios');

let token = '';

module.exports = {
  async login(I) {
    const res = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/login`,
      {
        email_username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      }
    );

    token = res.data.access_token;

    I.haveRequestHeaders({
      Authorization: `Bearer ${token}`,
    });

    return token;
  }
};