import { setHeadlessWhen } from '@codeceptjs/configure';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

setHeadlessWhen(process.env.HEADLESS === 'true');

export const config = {
  name: 'finance-service',
  tests: './tests/**/*_test.js',
  output: './output',

  helpers: {
    REST: {
      endpoint: process.env.BASE_URL || 'http://localhost:8002',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    BaseHelper: {
      require: '../_shared/helpers/BaseHelper.js',
    },
  },

  mocha: {
    reporterOptions: {
      reportDir: './output',
      reportFilename: 'finance_report',
      overwrite: true,
      html: true,
      json: true
    }
  },
  // include: {
  //   I: './steps_file.ts',
  // },


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