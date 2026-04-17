import { setHeadlessWhen, setCommonPlugins } from '@codeceptjs/configure';
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: './tests/**.js',
  output: './output',
  helpers: {
    REST: {
      endpoint: 'http://localhost'
    },
    JSONResponse: {}
  },
  include: {
    I: './steps_file'
  },
  plugins: {
    htmlReporter: {
      enabled: true
    }
  },
  name: 'EV-Service-Center-Full'
}