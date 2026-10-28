const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * DOB / eligibility verification pop-up shown after clicking Enroll.
 * Covers TC_49-TC_58 (TS-02 tab).
 */
class AgeVerificationPopup extends BasePage {
  constructor(page) {
    super(page);
    this.popup = page.locator('[role="dialog"]').first();
    this.dobInput = this.popup.getByPlaceholder(/MM\/DD\/YYYY/i).or(page.getByPlaceholder(/MM\/DD\/YYYY/i));
    this.verifyButton = page.getByRole('button', { name: /verify/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.validationMessage = page.getByText(/validation|please enter|required/i);
    this.ineligibleMessage = page.getByText(/You are not eligible for this package\.?/i);
  }

  async expectVisible() {
    await expect(this.popup).toBeVisible();
  }

  async enterDob(dob) {
    await this.dobInput.fill(dob);
    return this;
  }

  async clickVerify() {
    await this.verifyButton.click();
    return this;
  }

  async clickCancel() {
    await this.cancelButton.click();
    return this;
  }

  async expectClosed() {
    await expect(this.popup).not.toBeVisible();
  }

  async expectValidationMessageVisible() {
    await expect(this.validationMessage.first()).toBeVisible();
  }

  async expectIneligibleMessageVisible() {
    await expect(this.ineligibleMessage).toBeVisible();
  }
}

module.exports = AgeVerificationPopup;
