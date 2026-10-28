const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/** Payment success / confirmation screen. Covers TC_210-TC_223. */
class PaymentSuccessPage extends BasePage {
  constructor(page) {
    super(page);
    this.successMessage = page.getByText(/Your enrollment is confirmed/i);
    this.packageName = page.locator('[class*="summary" i]').getByText(/package/i);
    this.amountPaid = page.getByText(/amount paid/i);
    this.transactionReference = page.getByText(/transaction/i);
    this.homeButton = page.getByRole('button', { name: /home/i }).or(page.getByRole('link', { name: /home/i }));
  }

  async expectSuccessMessageVisible() {
    await expect(this.successMessage).toBeVisible();
  }

  async expectPackageNameVisible() {
    await expect(this.packageName).toBeVisible();
  }

  async expectAmountPaidVisible() {
    await expect(this.amountPaid).toBeVisible();
  }

  async expectTransactionReferenceVisible() {
    await expect(this.transactionReference).toBeVisible();
  }

  async expectHomeButtonVisible() {
    await expect(this.homeButton).toBeVisible();
  }

  async clickHome() {
    await this.homeButton.click();
    await this.waitForLoad();
    return this;
  }
}

module.exports = PaymentSuccessPage;
