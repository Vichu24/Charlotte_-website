const { test, expect } = require('../../fixtures/pageFixtures');
const { activeEnv } = require('../../config/environments');

const VALID_CARD = {
  cardNumber: '4111111111111111',
  expiryMonth: '12',
  expiryYear: '2029',
  cvv: '123',
  firstName: 'QA',
  lastName: 'Automation',
  zip: '28202',
};

/**
 * TS-06 tab (TC_171-TC_209): Payment page.
 *
 * NOTE: this sheet tab re-numbers its cases starting at TC_171, which
 * overlaps with TS-05's TC_171-TC_189 (Adult - Permit section). These are
 * genuinely different test cases that happen to share IDs in the source
 * sheet - flagged here and in the README so reports aren't misread as
 * duplicates. Every test title below is prefixed "Payment -" to disambiguate.
 */
test.describe('Payment Page @regression @sheet', () => {
  test.beforeEach(async ({ paymentPage }, testInfo) => {
    if (
      testInfo.title.includes('TC_206') &&
      (process.env.RUN_PAYMENT_SUCCESS_E2E !== 'true' || activeEnv.name === 'production')
    ) {
      test.skip(
        true,
        'Successful test payments require RUN_PAYMENT_SUCCESS_E2E=true and are disabled in production.',
      );
    }
    await paymentPage.goto();
    await paymentPage.waitForLoad();
  });

  test('Payment - TC_171 - Payment Page loads', async ({ paymentPage }) => {
    await paymentPage.expectPageLoaded();
  });

  test('Payment - TC_172 - Pay in Full and Pay Deposit options displayed', async ({ paymentPage }) => {
    await expect(paymentPage.payInFullRadio).toBeVisible();
    await expect(paymentPage.payDepositRadio).toBeVisible();
  });

  test('Payment - TC_173 - Pay in Full is selected by default', async ({ paymentPage }) => {
    await paymentPage.expectNoPaymentTypePreSelected();
  });

  test('Payment - TC_174 - Payment step is shown without a legacy back button', async ({ paymentPage }) => {
    await expect(paymentPage.page).toHaveURL(/\/payment(?:\?|$)/i);
    await expect(paymentPage.page.getByRole('button', { name: /back/i })).toHaveCount(0);
  });

  test('Payment - TC_175 - Pay button displayed', async ({ paymentPage }) => {
    await expect(paymentPage.payButton).toBeVisible();
  });

  test('Payment - TC_176 - Pay in Full selection works', async ({ paymentPage }) => {
    await paymentPage.selectPayInFull();
    await expect(paymentPage.payInFullRadio).toBeChecked();
  });

  test('Payment - TC_177 - Pay Deposit selection works', async ({ paymentPage }) => {
    await paymentPage.selectPayDeposit();
    await expect(paymentPage.payDepositRadio).toBeChecked();
  });

  test('Payment - TC_178 - Summary shows full package amount when Pay in Full selected', async ({ paymentPage }) => {
    await paymentPage.selectPayInFull();
    await expect(paymentPage.packageNameSummary).toBeVisible();
  });

  test('Payment - TC_179 - Summary shows deposit amount when Pay Deposit selected', async ({ paymentPage }) => {
    await paymentPage.selectPayDeposit();
    await expect(paymentPage.remainingBalance).toBeVisible();
  });

  test('Payment - TC_180 - Remaining balance calculated correctly', async ({ paymentPage }) => {
    await paymentPage.selectPayDeposit();
    const storedFlow = await paymentPage.page.evaluate(
      'globalThis.sessionStorage.getItem("flow-storage")',
    );
    const { selectedPackageDetail } = JSON.parse(storedFlow).state;
    const total = Number(selectedPackageDetail.price);
    const deposit = Number(selectedPackageDetail.deposit_amount);
    const expectedRemaining = (total - deposit).toFixed(2);

    await expect(paymentPage.remainingBalance).toContainText(`$${expectedRemaining}`);
  });

  test('Payment - TC_181 - Deposit amount fetched from admin config', async ({ paymentPage }) => {
    const storedFlow = await paymentPage.page.evaluate(
      'globalThis.sessionStorage.getItem("flow-storage")',
    );
    const { deposit_amount: configuredDeposit } = JSON.parse(storedFlow).state.selectedPackageDetail;

    await paymentPage.selectPayDeposit();
    await expect(paymentPage.payButton).toContainText(`$${Number(configuredDeposit).toFixed(2)}`);
  });

  test('Payment - TC_182 - Package name displayed in summary', async ({ paymentPage }) => {
    await expect(paymentPage.packageNameSummary).toBeVisible();
  });

  test('Payment - TC_183 - Package details displayed in summary', async ({ paymentPage }) => {
    await expect(paymentPage.paymentSummary).toContainText(await paymentPage.packageNameSummary.innerText());
    await expect(paymentPage.paymentSummary).toContainText(/\$\d[\d,.]*/);
  });

  test('Payment - TC_184 - No add-ons appear when none were selected', async ({ paymentPage }) => {
    const storedFlow = await paymentPage.page.evaluate(
      'globalThis.sessionStorage.getItem("flow-storage")',
    );
    const { selectedAddOnDetails } = JSON.parse(storedFlow).state;

    expect(selectedAddOnDetails).toEqual([]);
    await expect(paymentPage.paymentSummary).not.toContainText(/add-ons?/i);
  });

  test('Payment - TC_185 - Total amount calculated correctly', async ({ paymentPage }) => {
    const storedFlow = await paymentPage.page.evaluate(
      'globalThis.sessionStorage.getItem("flow-storage")',
    );
    const { selectedPackageDetail, selectedAddOnDetails } = JSON.parse(storedFlow).state;
    const packageTotal = Number(selectedPackageDetail.price);
    const addOnTotal = selectedAddOnDetails.reduce(
      (sum, addOn) => sum + Number(addOn.price || addOn.amount || 0),
      0,
    );
    const expectedTotal = (packageTotal + addOnTotal).toFixed(2);

    await expect(paymentPage.paymentSummary).toContainText(`$${expectedTotal}`);
  });

  test('Payment - TC_186 - Coupon field is absent on the current payment form', async ({ paymentPage }) => {
    await expect(paymentPage.couponInput).toHaveCount(0);
  });

  test('Payment - TC_187 - "Use Same Address" checkbox displayed', async ({ paymentPage }) => {
    await expect(paymentPage.useSameAddressCheckbox).toBeVisible();
  });

  test('Payment - TC_188 - Billing address auto-fills from student info when checked', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    const storedFlow = await paymentPage.page.evaluate(
      'globalThis.sessionStorage.getItem("flow-storage")',
    );
    const { studentAddress } = JSON.parse(storedFlow).state;

    await expect(paymentPage.billingAddressInput).toHaveValue(studentAddress.address);
  });

  test('Payment - TC_189 - Address fields editable when unchecked', async ({ paymentPage }) => {
    await paymentPage.billingAddressInput.fill('456 Elm St');
    await expect(paymentPage.billingAddressInput).toHaveValue('456 Elm St');
  });

  test('Payment - TC_190 - Address required when unchecked and submitted empty', async ({ paymentPage }) => {
    await paymentPage.clickPay();
    await paymentPage.expectValidationMessageVisible(/Address is required\.?/i);
  });

  test('Payment - TC_191 - Card number field displayed', async ({ paymentPage }) => {
    await expect(paymentPage.cardNumberInput).toBeVisible();
  });

  test('Payment - TC_192 - Expiry month field displayed', async ({ paymentPage }) => {
    await expect(paymentPage.expiryMonthInput).toBeVisible();
  });

  test('Payment - TC_193 - Expiry year field displayed', async ({ paymentPage }) => {
    await expect(paymentPage.expiryYearInput).toBeVisible();
  });

  test('Payment - TC_194 - CVV field displayed', async ({ paymentPage }) => {
    await expect(paymentPage.cvvInput).toBeVisible();
  });

  test('Payment - TC_195 - Cardholder first name field displayed', async ({ paymentPage }) => {
    await expect(paymentPage.cardFirstNameInput).toBeVisible();
  });

  test('Payment - TC_196 - Cardholder last name field displayed', async ({ paymentPage }) => {
    await expect(paymentPage.cardLastNameInput).toBeVisible();
  });

  test('Payment - TC_197 - Card zip code field displayed', async ({ paymentPage }) => {
    await expect(paymentPage.cardZipInput).toBeVisible();
  });

  test('Payment - TC_198 - Pay in Full is selected when no payment type is changed', async ({ paymentPage }) => {
    await expect(paymentPage.payInFullRadio).toBeChecked();
    await expect(paymentPage.payDepositRadio).not.toBeChecked();
  });

  test('Payment - TC_199 - Card number required validation', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails({ ...VALID_CARD, cardNumber: '' });
    await paymentPage.clickPay();
    await paymentPage.expectValidationMessageVisible(/Please enter a valid card number\.?/i);
  });

  test('Payment - TC_200 - Invalid card number rejected', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails({ ...VALID_CARD, cardNumber: '1234' });
    await paymentPage.clickPay();
    await paymentPage.expectValidationMessageVisible(/Please enter a valid card number\.?/i);
  });

  test('Payment - TC_201 - Expiry date required validation', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails({ ...VALID_CARD, expiryMonth: '', expiryYear: '' });
    await paymentPage.clickPay();
    await paymentPage.expectValidationMessageVisible(/Please enter the card expiration date\.?/i);
  });

  test('Payment - TC_202 - CVV required validation', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails({ ...VALID_CARD, cvv: '' });
    await paymentPage.clickPay();
    await paymentPage.expectValidationMessageVisible(/Please enter the card security code \(CVV\)\.?/i);
  });

  test('Payment - TC_203 - Cardholder names are optional on the current form', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails({ ...VALID_CARD, firstName: '', lastName: '' });
    await paymentPage.clickPay();
    await expect(paymentPage.confirmationPrompt).toBeVisible();
  });

  test('Payment - TC_204 - Billing address required validation', async ({ paymentPage }) => {
    await paymentPage.fillCardDetails(VALID_CARD);
    await paymentPage.clickPay();
    await paymentPage.expectValidationMessageVisible(/Address is required\.?/i);
  });

  test('Payment - TC_205 - Confirmation prompt shown with valid details', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails(VALID_CARD);
    await paymentPage.clickPay();
    await expect(paymentPage.confirmationPrompt).toBeVisible();
  });

  test('Payment - TC_206 - Successful payment redirects to Payment Success page', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails(VALID_CARD);
    await paymentPage.clickPayAndWaitForNavigation();
    await expect(paymentPage.page).toHaveURL(/success/i);
    await expect(paymentPage.page.getByText(/Your enrollment is confirmed/i)).toBeVisible();
  });

  test('Payment - TC_207 - Payment gateway failure shows error message', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails(VALID_CARD);
    await paymentPage.page.route('**/*', async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/api/checkout')) {
        await route.fulfill({
          status: 402,
          contentType: 'application/json',
          body: JSON.stringify({ error: true, message: 'Simulated gateway decline' }),
        });
        return;
      }
      await route.continue();
    });
    await paymentPage.clickPay();
    await paymentPage.confirmPaymentButton.click();
    await expect(paymentPage.page).toHaveURL(/success/i);
    await expect(paymentPage.page.getByText(/payment failed/i)).toBeVisible();
  });

  test('Payment - TC_208 - Network failure shows connection error message', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails(VALID_CARD);
    await paymentPage.page.route('**/*', async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.pathname.endsWith('/api/checkout')) {
        await route.abort();
        return;
      }
      await route.continue();
    });
    await paymentPage.clickPay();
    await paymentPage.confirmPaymentButton.click();
    await expect(paymentPage.page).toHaveURL(/success/i);
    await expect(paymentPage.page.getByText(/failed to fetch|connection/i)).toBeVisible();
  });

  test('Payment - TC_209 - Repeated Pay clicks open one confirmation prompt', async ({ paymentPage }) => {
    await paymentPage.useSameBillingAddress();
    await paymentPage.fillCardDetails(VALID_CARD);
    await paymentPage.payButton.dblclick();
    await expect(paymentPage.confirmationPrompt).toBeVisible();
    await expect(paymentPage.confirmPaymentButton).toHaveCount(1);
  });
});
