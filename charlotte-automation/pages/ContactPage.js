const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * NOTE: charlottestaging.newagesmb.com is a Next.js app that renders the
 * /contact route client-side, so its exact form field names/ids could not
 * be confirmed via static fetch during framework setup. Locators below use
 * resilient, label/placeholder-based strategies that should match common
 * "Name / Email / Phone / Message" contact forms. Re-run `npm run codegen`
 * against /contact once test cases are available and tighten these locators
 * with real selectors (data-testid preferred) if any of them miss.
 */
class ContactPage extends BasePage {
  constructor(page) {
    super(page);

    this.firstNameInput = page.getByLabel(/first name/i).or(page.getByPlaceholder(/first name/i));
    this.lastNameInput = page.getByLabel(/last name/i).or(page.getByPlaceholder(/last name/i));
    this.emailInput = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
    this.phoneInput = page.getByLabel(/phone/i).or(page.getByPlaceholder(/phone/i));
    this.messageInput = page.getByLabel(/message/i).or(page.getByPlaceholder(/message/i));
    this.submitButton = page.getByRole('button', { name: /send|submit|contact/i });
    this.successMessage = page.getByText(/thank you|message sent|we('| ha)ve received/i);
    this.pageHeading = page.getByRole('heading', { level: 1 });
  }

  async goto(pathname = '/contact') {
    return super.goto(pathname);
  }

  async openViaNav() {
    await this.header.contactUsLink.click();
    await this.waitForLoad();
    return this;
  }

  /**
   * @param {{firstName?: string, lastName?: string, email: string, phone?: string, message?: string}} data
   */
  async fillForm(data) {
    if (data.firstName) await this.firstNameInput.fill(data.firstName);
    if (data.lastName) await this.lastNameInput.fill(data.lastName);
    if (data.email) await this.emailInput.fill(data.email);
    if (data.phone) await this.phoneInput.fill(data.phone);
    if (data.message) await this.messageInput.fill(data.message);
    return this;
  }

  async submit() {
    await this.submitButton.click();
    return this;
  }

  async expectSubmissionSucceeded() {
    await expect(this.successMessage).toBeVisible({ timeout: 15_000 });
  }
}

module.exports = ContactPage;
