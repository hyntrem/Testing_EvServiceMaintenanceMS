import { setHeadlessWhen } from "@codeceptjs/configure";
import * as dotenv from "dotenv";

dotenv.config({ path: "./booking-service/.env" });

setHeadlessWhen(process.env.HEADLESS === "true");

export const config = {
  name: "booking-service",
  tests: "./tests/**/*_test.js",
  output: "./output",

  helpers: {
    REST: {
      endpoint: process.env.BASE_URL || "http://localhost:8001",
      defaultHeaders: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    },
  },

  include: {
    I: "./steps_file.js",
  },

  plugins: {
    retryFailedStep: {
      enabled: true,
      retries: 2,
    },
  },
};
