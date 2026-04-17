const Helper = require('@codeceptjs/helper');

/**
 * BaseHelper - Shared across all services
 * Chứa các hàm dùng chung: auth token, retry, log
 */
class BaseHelper extends Helper {
  /**
   * Lấy JWT token và set vào header cho REST helper
   */
  async setAuthToken(token) {
    const { REST } = this.helpers;
    REST.options.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Xóa auth token
   */
  async clearAuthToken() {
    const { REST } = this.helpers;
    delete REST.options.defaultHeaders['Authorization'];
  }

  /**
   * Log thông tin response để debug
   */
  async logResponse(response) {
    console.log(`[${new Date().toISOString()}] Status: ${response.status}`);
    console.log('Body:', JSON.stringify(response.data, null, 2));
  }

  /**
   * Retry một action nếu fail
   */
  async retryAction(action, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (e) {
        if (i === maxRetries - 1) throw e;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
}

module.exports = BaseHelper;
