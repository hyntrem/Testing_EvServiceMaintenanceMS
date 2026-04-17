import { setHeadlessWhen, setCommonPlugins } from "@codeceptjs/configure";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

setHeadlessWhen(process.env.HEADLESS);
setCommonPlugins();

export const config: CodeceptJS.MainConfig = {
  tests: "./tests/**/*_test.js",
  output: "./output",
  helpers: {
    REST: {
      endpoint: process.env.BASE_URL || "http://localhost",
      defaultHeaders: {
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