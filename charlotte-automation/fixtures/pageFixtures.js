const base = require('@playwright/test');
const projectLogger = require('../utils/projectLogger');
const HomePage = require('../pages/HomePage');
const DriverTrainingPage = require('../pages/DriverTrainingPage');
const SimulatorsPage = require('../pages/SimulatorsPage');
const AboutPage = require('../pages/AboutPage');
const ContactPage = require('../pages/ContactPage');
const PackagesPage = require('../pages/PackagesPage');
const PackageListingPage = require('../pages/PackageListingPage');
const PackageDetailPage = require('../pages/PackageDetailPage');
const AgeVerificationPopup = require('../pages/AgeVerificationPopup');
const UpcomingClassesPage = require('../pages/UpcomingClassesPage');
const WaitlistPopup = require('../pages/WaitlistPopup');
const ScheduleDetailsPopup = require('../pages/ScheduleDetailsPopup');
const AddOnSelectionPage = require('../pages/AddOnSelectionPage');
const StudentInformationPage = require('../pages/StudentInformationPage');
const ContractPage = require('../pages/ContractPage');
const PaymentPage = require('../pages/PaymentPage');
const PaymentSuccessPage = require('../pages/PaymentSuccessPage');

/**
 * Extends Playwright's base `test` with one ready-to-use fixture per page
 * object, so specs never new-up a page object manually:
 *
 *   const { test, expect } = require('../../fixtures/pageFixtures');
 *   test('...', async ({ homePage }) => { ... });
 */
const test = base.test.extend({
  projectLogging: [
    async ({ page }, use, testInfo) => {
      const testContext = {
        test: testInfo.title,
        file: testInfo.file,
        project: testInfo.project.name,
        worker: testInfo.workerIndex,
        retry: testInfo.retry,
      };
      const isApiRequest = (request) => ['fetch', 'xhr'].includes(request.resourceType());
      const shouldLogPerformance = (request) =>
        ['document', 'fetch', 'xhr'].includes(request.resourceType());
      const requestStartTimes = new WeakMap();

      page.on('request', (request) => {
        requestStartTimes.set(request, Date.now());
        if (isApiRequest(request)) {
          projectLogger.writeApi({
            ...testContext,
            event: 'request',
            method: request.method(),
            url: projectLogger.safeUrl(request.url()),
            resourceType: request.resourceType(),
          });
        }
      });

      page.on('response', (response) => {
        const request = response.request();
        const status = response.status();
        const logsPerformance = shouldLogPerformance(request);
        const logsApi = isApiRequest(request);
        if (!logsPerformance && !logsApi && status < 400) return;

        const url = projectLogger.safeUrl(response.url());
        const responseDetails = {
          ...testContext,
          method: request.method(),
          url,
          resourceType: request.resourceType(),
          status,
          durationMs: Date.now() - requestStartTimes.get(request),
        };

        if (logsPerformance) {
          projectLogger.writePerformance({
            ...responseDetails,
            event: 'response',
          });
        }

        if (logsApi) {
          projectLogger.writeApi({
            ...responseDetails,
            event: 'response',
          });
        }

        if (status >= 400) {
          projectLogger.writeError({
            ...testContext,
            type: 'http_response',
            method: request.method(),
            url,
            status: response.status(),
          });
        }
      });

      page.on('requestfailed', (request) => {
        if (!shouldLogPerformance(request)) return;

        const failure = request.failure();
        const startedAt = requestStartTimes.get(request);
        const details = {
          ...testContext,
          method: request.method(),
          url: projectLogger.safeUrl(request.url()),
          error: failure ? failure.errorText : 'Unknown request failure',
          durationMs: startedAt === undefined ? null : Date.now() - startedAt,
        };

        projectLogger.writePerformance({
          ...details,
          event: 'request_failed',
          resourceType: request.resourceType(),
        });
        if (isApiRequest(request)) {
          projectLogger.writeApi({
            ...details,
            event: 'request_failed',
          });
        }
        projectLogger.writeError({
          ...details,
          type: 'request_failed',
        });
      });

      page.on('pageerror', (error) => {
        projectLogger.writeError({
          ...testContext,
          type: 'page_error',
          error: projectLogger.sanitizeText(error.message),
        });
      });

      page.on('console', (message) => {
        if (message.type() === 'error') {
          projectLogger.writeError({
            ...testContext,
            type: 'console_error',
            error: projectLogger.sanitizeText(message.text()),
          });
        }
      });

      await use();

      if (testInfo.status !== testInfo.expectedStatus) {
        projectLogger.writeError({
          ...testContext,
          type: 'test_failure',
          status: testInfo.status,
          expectedStatus: testInfo.expectedStatus,
        });
      }
    },
    { auto: true },
  ],
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  driverTrainingPage: async ({ page }, use) => {
    await use(new DriverTrainingPage(page));
  },
  simulatorsPage: async ({ page }, use) => {
    await use(new SimulatorsPage(page));
  },
  aboutPage: async ({ page }, use) => {
    await use(new AboutPage(page));
  },
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  packagesPage: async ({ page }, use) => {
    await use(new PackagesPage(page));
  },
  packageListingPage: async ({ page }, use) => {
    await use(new PackageListingPage(page));
  },
  packageDetailPage: async ({ page }, use) => {
    await use(new PackageDetailPage(page));
  },
  ageVerificationPopup: async ({ page }, use) => {
    await use(new AgeVerificationPopup(page));
  },
  upcomingClassesPage: async ({ page }, use) => {
    await use(new UpcomingClassesPage(page));
  },
  waitlistPopup: async ({ page }, use) => {
    await use(new WaitlistPopup(page));
  },
  scheduleDetailsPopup: async ({ page }, use) => {
    await use(new ScheduleDetailsPopup(page));
  },
  addOnSelectionPage: async ({ page }, use) => {
    await use(new AddOnSelectionPage(page));
  },
  studentInformationPage: async ({ page }, use) => {
    await use(new StudentInformationPage(page));
  },
  contractPage: async ({ page }, use) => {
    await use(new ContractPage(page));
  },
  paymentPage: async ({ page }, use) => {
    await use(new PaymentPage(page));
  },
  paymentSuccessPage: async ({ page }, use) => {
    await use(new PaymentSuccessPage(page));
  },
});

const expect = base.expect;

module.exports = { test, expect };
