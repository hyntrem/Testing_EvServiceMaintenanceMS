import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

setHeadlessWhen(process.env.HEADLESS === 'true');

export const config = {
  name: 'payment-service',
  tests: './tests/**/*_test.js',
  output: './output',

reporter: 'mochawesome',

  mocha: {
    reporterOptions: {
      reportDir: 'output',        // Ép báo cáo xuất vào thư mục output
      reportFilename: 'payment_report', // Đặt tên file báo cáo
      overwrite: true,
      html: true,
      json: true
    }
  },

  helpers: {
    REST: {
      endpoint: process.env.BASE_URL || 'http://localhost',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    BaseHelper: {
      require: '../_shared/helpers/BaseHelper.js',
    },
  },

  include: {
    I: './steps_file.ts',
  },

  plugins: {
    retryFailedStep: {
      enabled: true,
      retries: 2,
    },
    screenshotOnFail: {
      enabled: true,
      path: './output/screenshots',
    },
  },
};
