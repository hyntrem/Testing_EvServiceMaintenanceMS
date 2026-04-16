import { setHeadlessWhen, setCommonPlugins } from "@codeceptjs/configure";
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: "./tests",
  output: "./output",
  helpers: {
    REST: {
      endpoint: "http://localhost:8001",
      defaultHeaders: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc3NjAwMDQ3NCwianRpIjoiNGRhZGI4NDktZWI3Zi00ZWZmLWJkMWItNjkwYjgzNGEzNjk1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NzYwMDA0NzQsImNzcmYiOiIwM2Y4NjI3NS0wYzQzLTQ5MmEtODM5Zi04NTgwYzI3NzVmMGUiLCJleHAiOjE3NzY2MDUyNzQsInJvbGUiOiJhZG1pbiJ9.HRibYyeOGtQhRVUSXiiabHncqGpCa4hYRa85QMjmxLo",
        "Content-Type": "application/json",
      },
    },
    JSONResponse: {},
  },
  include: {
    I: "./steps_file",
  },
  plugins: {
    htmlReporter: {
      enabled: true,
    },
  },
  name: "Testing_EvServiceMaintenanceMS",
};
