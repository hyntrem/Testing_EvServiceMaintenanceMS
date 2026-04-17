import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });

setHeadlessWhen(process.env.HEADLESS === 'true');

export const config: CodeceptJS.MainConfig = {
  name: 'frontend',
  tests: './tests/**/*_test.js',
  output: './output',

  helpers: {
    Playwright: {
      url: process.env.BASE_URL || 'http://localhost:80',
      browser: 'chromium',
      show: process.env.HEADLESS !== 'true',
      waitForNavigation: 'networkidle',
    },
  },

  include: {
    I: './steps_file.ts',
  },

  plugins: {
    retryFailedStep: { enabled: true, retries: 2 },
    screenshotOnFail: { enabled: true, path: './output/screenshots' },
    pauseOnFail: { enabled: false },
  },
};
