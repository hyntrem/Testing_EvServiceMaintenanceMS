
import { setHeadlessWhen } from '@codeceptjs/configure';
import dotenv from 'dotenv';

require('dotenv').config();

exports.config = {
  name: 'staff-service',

  tests: './tests/**/*.js',
  output: './output',

 helpers: {
  REST: {
    endpoint: process.env.BASE_URL,
    defaultHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },
},

  include: {
    I: './steps_file.js',
    auth: './helpers/auth.js',
  },

  plugins: {
    retryFailedStep: {
      enabled: true,
      retries: 2,
    },
  },
};