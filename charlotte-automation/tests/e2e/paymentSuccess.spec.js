const { test, expect } = require('../../fixtures/pageFixtures');
const { activeEnv } = require('../../config/environments');

const TEST_CARD = {
  cardNumber: '4111111111111111',
  expiryMonth: '12',
  expiryYear: '2029',
  cvv: '123',
  firstName: 'QA',
  lastName: 'Automation',
  zip: '28202',
};

test.describe('Payment Success @e2e @sheet', () => {
  test('TC_210-TC_218 - Successful payment confirmation and page behavior', async ({
    paymentPage,
    paymentSuccessPage,
  }) => {
    test.skip(
      process.env.RUN_PAYMENT_SUCCESS_E2E !== 'true' || activeEnv.name === 'production',
      'This test submits a payment. Opt in with RUN_PAYMENT_SUCCESS_E2E=true on a non-production environment.',
    );

    await paymentPage.goto();
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails(TEST_CARD);
    await paymentPage.clickPayAndWaitForNavigation();

    await expect(paymentSuccessPage.page).toHaveURL(/success/i);
    await paymentSuccessPage.expectSuccessMessageVisible();
    await paymentSuccessPage.expectPackageNameVisible();
    await paymentSuccessPage.expectAmountPaidVisible();
    await paymentSuccessPage.expectTransactionReferenceVisible();
    await paymentSuccessPage.expectHomeButtonVisible();

    await paymentSuccessPage.page.reload();
    await paymentSuccessPage.expectSuccessMessageVisible();

    await paymentSuccessPage.page.goBack();
    await paymentSuccessPage.page.goForward();
    await paymentSuccessPage.expectSuccessMessageVisible();

    await paymentSuccessPage.clickHome();
    await expect(paymentSuccessPage.page).toHaveURL(/\/$/);
  });

  test('TC_219 - Enrollment record created', async () => {
    test.fixme(true, 'Needs a non-production enrollment API or database assertion.');
  });

  test('TC_220 - Payment details stored', async () => {
    test.fixme(true, 'Needs a non-production payment API or database assertion.');
  });

  test('TC_221 - Transaction ID recorded in audit logs', async () => {
    test.fixme(true, 'Needs access to the non-production audit-log API.');
  });

  test('TC_222 - Confirmation email received', async () => {
    test.fixme(true, 'Needs an email-testing inbox and a test-recipient configuration.');
  });

  test('TC_223 - Confirmation SMS received', async () => {
    test.fixme(true, 'Needs an SMS-testing service and test-recipient configuration.');
  });
});
