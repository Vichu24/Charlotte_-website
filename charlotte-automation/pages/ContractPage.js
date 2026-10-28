const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const { goToStudentDocument, drawStudentSignature } = require('../utils/enrollmentFlow');

/** Digital signature step. Covers the currently deployed student-document flow. */
class ContractPage extends BasePage {
  constructor(page) {
    super(page);
    this.contractText = page.getByText(/Digital Signature/i);
    this.selectedPackage = page.getByText(/TEST\d+/i);
    this.selectedAddOns = page.getByText(/add-on/i);
    this.studentSignatureField = page.getByRole('button', { name: /Sign Now/i });
    this.parentSignatureField = page.getByText(/Parent Signature/i);
    this.termsCheckbox = page.locator('#terms');
    this.payNowButton = page.getByRole('button', { name: /^Submit$/i });
  }

  async goto(pathname = '/contract') {
    if (pathname === '/contract') {
      await goToStudentDocument(this.page);
      return this;
    }
    return super.goto(pathname);
  }

  async expectPageLoaded() {
    await expect(this.contractText).toBeVisible();
    await expect(this.studentSignatureField).toBeVisible();
    await expect(this.termsCheckbox).toBeVisible();
  }

  async expectContractReadOnly() {
    await expect(this.page.locator('[contenteditable="true"]')).toHaveCount(0);
  }

  async signAsStudent() {
    await drawStudentSignature(this.page);
    return this;
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
    return this;
  }

  async clickPayNow() {
    await this.payNowButton.click();
    return this;
  }

  async clickPayNowAndWaitForNavigation() {
    await this.payNowButton.click();
    await this.page.getByRole('button', { name: /Pay Now/i }).click();
    await this.page.waitForURL(/\/payment(?:\?|$)/);
    return this;
  }
}

module.exports = ContractPage;
