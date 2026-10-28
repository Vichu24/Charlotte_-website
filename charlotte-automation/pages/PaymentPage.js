const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const { goToPayment } = require('../utils/enrollmentFlow');

/**
 * Payment step. NOTE: this sheet tab numbers its cases TC_171-TC_209,
 * which overlaps with the Student Information tab's TC_171-TC_189
 * (permit section). They are different test cases that happen to share
 * IDs in the source sheet - see README for details. Spec titles are
 * prefixed "Payment -" to keep them unambiguous in reports.
 */
class PaymentPage extends BasePage {
  constructor(page) {
    super(page);

    this.payInFullRadio = page.getByRole('radio', { name: /pay in full/i });
    this.payDepositRadio = page.getByRole('radio', { name: /pay deposit/i });
    this.payButton = page.getByRole('button', { name: /^Pay(?:\s|$)/i });

    this.packageNameSummary = page.getByRole('heading', { level: 3 });
    this.paymentSummary = page.getByText('Payment Summary', { exact: true }).locator('xpath=..').last();
    this.remainingBalance = page.getByText('Remaining', { exact: true }).last().locator('xpath=..');
    this.totalAmountLabel = page.getByText('Total Amount', { exact: true });
    this.couponInput = page.getByLabel(/coupon/i);

    this.useSameAddressCheckbox = page.getByRole('checkbox', { name: /use same address/i });
    this.billingAddressInput = page.locator('#billing-address');

    this.cardNumberInput = page
      .frameLocator('iframe[title="Secure card number input frame"]')
      .locator('input[autocomplete="cc-number"]');
    this.expiryMonthInput = page
      .frameLocator('iframe[title="Secure expiration date input frame"]')
      .locator('input[autocomplete="cc-exp"]');
    this.expiryYearInput = this.expiryMonthInput;
    this.cvvInput = page
      .frameLocator('iframe[title="Secure CVC input frame"]')
      .locator('input[autocomplete="cc-csc"]');
    this.cardFirstNameInput = page.locator('#card-first-name');
    this.cardLastNameInput = page.locator('#card-last-name');
    this.cardZipInput = page.locator('#card-zip');

    this.confirmationPrompt = page.getByRole('heading', { name: /confirm payment/i });
    this.confirmPaymentButton = page.getByRole('button', { name: /confirm payment/i });
  }

  async goto(pathname = '/payment') {
    if (pathname === '/payment') {
      const packageName = await goToPayment(this.page);
      this.packageNameSummary = this.page.getByRole('heading', { name: packageName, exact: true });
      await expect(this.cardNumberInput).toBeVisible();
      return this;
    }
    return super.goto(pathname);
  }

  async expectPageLoaded() {
    await expect(this.payInFullRadio).toBeVisible();
    await expect(this.payDepositRadio).toBeVisible();
    await expect(this.payButton).toBeVisible();
  }

  async expectNoPaymentTypePreSelected() {
    await expect(this.payInFullRadio).toBeChecked();
  }

  async selectPayInFull() {
    await this.payInFullRadio.click();
    return this;
  }

  async selectPayDeposit() {
    await this.payDepositRadio.click();
    return this;
  }

  async clickBack() {
    await this.page.goBack();
    await expect(this.page).toHaveURL(/\/payment(?:\?|$)/i);
    return this;
  }

  async useSameBillingAddress() {
    await this.useSameAddressCheckbox.check();
    return this;
  }

  async fillCardDetails({ cardNumber, expiryMonth, expiryYear, cvv, firstName, lastName, zip } = {}) {
    if (cardNumber !== undefined) await this.cardNumberInput.fill(cardNumber);
    if (expiryMonth && expiryYear) {
      await this.expiryMonthInput.fill(`${expiryMonth}/${expiryYear.slice(-2)}`);
    }
    if (cvv !== undefined) await this.cvvInput.fill(cvv);
    if (firstName) await this.cardFirstNameInput.fill(firstName);
    if (lastName) await this.cardLastNameInput.fill(lastName);
    if (zip) await this.cardZipInput.fill(zip);
    return this;
  }

  async clickPay() {
    await this.payButton.click();
    return this;
  }

  async clickPayAndWaitForNavigation() {
    await this.payButton.click();
    await expect(this.confirmationPrompt).toBeVisible();
    await this.confirmPaymentButton.click();
    await this.page.waitForURL(/success/i);
    return this;
  }

  async expectValidationMessageVisible(messageRegex) {
    await expect(this.page.getByText(messageRegex).first()).toBeVisible();
  }
}

module.exports = PaymentPage;
