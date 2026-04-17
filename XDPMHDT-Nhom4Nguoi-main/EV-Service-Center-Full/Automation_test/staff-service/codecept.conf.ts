import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

setHeadlessWhen(process.env.HEADLESS === 'true');

export const config: CodeceptJS.MainConfig = {
  name: 'staff-service',
  tests: './tests/**/*_test.js',
  output: './output',

  helpers: {
    REST: {
      endpoint: process.env.BASE_URL || 'http://localhost:8008',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    BaseHelper: {
      require: '../../_shared/helpers/BaseHelper.js',
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
