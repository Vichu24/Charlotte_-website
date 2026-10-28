const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/** Add-on selection step. Covers TC_118-TC_128 (TS-03 tab). */
class AddOnSelectionPage extends BasePage {
  constructor(page) {
    super(page);
    this.dialog = page.getByRole('dialog', { name: /select additional product/i });
    this.checkboxes = this.dialog.getByRole('checkbox');
    this.addOnCards = this.checkboxes.locator('xpath=../../..');
    this.continueButton = this.dialog.getByRole('button', { name: /continue/i });
  }

  async goto(pathname = '/add-ons') {
    return super.goto(pathname);
  }

  async expectPageLoaded() {
    await expect(this.dialog).toBeVisible();
  }

  async expectCardsInCardLayout() {
    expect(await this.addOnCards.count()).toBeGreaterThan(0);
  }

  async selectAddOnsByIndex(indices = []) {
    for (const i of indices) {
      // eslint-disable-next-line no-await-in-loop
      const checkbox = this.checkboxes.nth(i);
      await this.addOnCards.nth(i).click();
      // eslint-disable-next-line no-await-in-loop
      await expect(checkbox).toBeChecked();
    }
    return this;
  }

  async expectAddOnsChecked(indices = []) {
    for (const i of indices) {
      // eslint-disable-next-line no-await-in-loop
      await expect(this.checkboxes.nth(i)).toBeChecked();
    }
  }

  async skipAndContinue() {
    await this.continueButton.click();
    await this.waitForLoad();
    return this;
  }

  async clickContinue() {
    await this.continueButton.click();
    await this.waitForLoad();
    return this;
  }
}

module.exports = AddOnSelectionPage;
