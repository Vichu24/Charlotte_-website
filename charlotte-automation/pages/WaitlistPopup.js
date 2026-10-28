const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/** "Join Waitlist" pop-up for a full class. Covers TC_94-TC_106 (TS-03 tab). */
class WaitlistPopup extends BasePage {
  constructor(page) {
    super(page);
    this.popup = page.getByRole('dialog', { name: /class waitlist/i });
    this.firstNameInput = this.popup.getByPlaceholder(/enter student first name/i);
    this.lastNameInput = this.popup.getByPlaceholder(/enter student last name/i);
    this.birthDateInput = this.popup.getByRole('button', { name: /^\d{2}\/\d{2}\/\d{4}$/ });
    this.phoneInput = this.popup.getByPlaceholder(/enter student phone number/i);
    this.emailInput = this.popup.getByPlaceholder(/enter student email/i);
    this.submitButton = this.popup.getByRole('button', { name: /submit/i });
    this.closeButton = this.popup.getByRole('button', { name: /close/i });
    this.requiredFieldsMessages = [
      this.popup.getByText('First name is required', { exact: true }),
      this.popup.getByText('Last name is required', { exact: true }),
      this.popup.getByText('Phone is required', { exact: true }),
      this.popup.getByText('Email is required', { exact: true }),
    ];
    this.invalidEmailMessage = this.popup.getByText('Invalid email address', { exact: true });
    this.invalidPhoneMessage = this.popup.getByText(/Phone must be in format/i);
    this.successMessage = page.getByText('Waitlist Joined', { exact: true });
  }

  async expectVisible() {
    await expect(this.popup).toBeVisible();
  }

  async expectFormFieldsVisible() {
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.birthDateInput).toBeVisible();
    await expect(this.phoneInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  async fillForm({ firstName, lastName, phone, email }) {
    if (firstName) await this.firstNameInput.fill(firstName);
    if (lastName) await this.lastNameInput.fill(lastName);
    if (phone) await this.phoneInput.fill(phone);
    if (email) await this.emailInput.fill(email);
    return this;
  }

  async submit() {
    await this.submitButton.click();
    return this;
  }

  async close() {
    await this.closeButton.click();
    return this;
  }

  async expectClosed() {
    await expect(this.popup).not.toBeVisible();
  }

  async expectRequiredFieldsMessageVisible() {
    for (const message of this.requiredFieldsMessages) {
      // eslint-disable-next-line no-await-in-loop
      await expect(message).toBeVisible();
    }
  }

  async expectInvalidEmailMessageVisible() {
    await expect(this.invalidEmailMessage).toBeVisible();
  }

  async expectInvalidPhoneMessageVisible() {
    await expect(this.invalidPhoneMessage).toBeVisible();
  }

  async expectSuccessMessageVisible() {
    await expect(this.successMessage).toBeVisible();
  }
}

module.exports = WaitlistPopup;
