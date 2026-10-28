/* eslint-disable no-console */
const timestamp = () => new Date().toISOString();

const logger = {
  info: (msg) => console.log(`[INFO]  ${timestamp()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN]  ${timestamp()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${timestamp()} - ${msg}`),
  step: (msg) => console.log(`[STEP]  ${timestamp()} - ${msg}`),
  debug: (msg) => {
    if (process.env.DEBUG) console.log(`[DEBUG] ${timestamp()} - ${msg}`);
  },
};

module.exports = logger;
