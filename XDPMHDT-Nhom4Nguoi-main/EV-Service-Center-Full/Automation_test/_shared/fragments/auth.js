/**
 * fragments/auth.js
 * Reusable login steps - dùng chung cho mọi service cần auth
 *
 * Cách dùng trong test:
 *   const { loginAs } = require('../../_shared/fragments/auth');
 *   await loginAs(I, 'admin');
 */

const users = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@test.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  staff: {
    email: process.env.STAFF_EMAIL || 'staff@test.com',
    password: process.env.STAFF_PASSWORD || 'staff123',
  },
};

/**
 * Login và trả về token
 */
async function loginAs(I, role = 'admin') {
  const user = users[role];
  if (!user) throw new Error(`Unknown role: ${role}`);

  const res = await I.sendPostRequest('/auth/login', {
    email: user.email,
    password: user.password,
  });

  const token = res.data?.access_token || res.data?.token;
  if (!token) throw new Error(`Login failed for role: ${role}`);

  await I.setAuthToken(token);
  return token;
}

module.exports = { loginAs, users };
