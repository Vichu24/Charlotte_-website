const { defineConfig, devices } = require('@playwright/test');
const { baseURL } = require('./config/environments');
require('dotenv').config();

const CI = !!process.env.CI;
const ignoreHTTPSErrors = process.env.IGNORE_HTTPS_ERRORS?.toLowerCase() === 'true';

function integerSetting(name, fallback, minimum) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) {
    throw new Error(`${name} must be an integer greater than or equal to ${minimum}.`);
  }
  return parsed;
}

if (process.env.IGNORE_HTTPS_ERRORS && !['true', 'false'].includes(process.env.IGNORE_HTTPS_ERRORS.toLowerCase())) {
  throw new Error('IGNORE_HTTPS_ERRORS must be "true" or "false".');
}

module.exports = defineConfig({
  testDir: './tests',
  timeout: integerSetting('DEFAULT_TIMEOUT', 30_000, 1),
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  forbidOnly: CI,
  retries: integerSetting('RETRIES', CI ? 2 : 0, 0),
  workers: integerSetting('WORKERS', CI ? 2 : undefined, 1),

  // Multiple reporters: readable console output + shareable HTML + JSON for CI dashboards
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['allure-playwright', { outputFolder: 'reports/allure-results' }],
  ],

  outputDir: 'test-results',

  use: {
    baseURL,
    headless: process.env.HEADLESS ? process.env.HEADLESS !== 'false' : true,
    slowMo: Number(process.env.SLOW_MO) || 0,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],

  globalSetup: require.resolve('./global-setup.js'),
});
