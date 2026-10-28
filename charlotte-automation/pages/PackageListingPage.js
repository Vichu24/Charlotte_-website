const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * Package cards rendered on the homepage after DOB and student type selection.
 * Covers TC_19-TC_48 (TS-02 tab).
 */
class PackageListingPage extends BasePage {
  constructor(page) {
    super(page);
    this.packageCards = page.locator('a[href^="/package/"]').locator('xpath=..');
    this.firstCard = this.packageCards.first();
    this.enrollButtons = page.getByRole('button', { name: /enroll/i });
    this.viewDetailButtons = page.getByRole('button', { name: /view detail/i }).or(
      page.getByRole('link', { name: /view detail/i }),
    );
    this.permitRequiredTag = page.getByText(/permit required/i);
    this.driveOnlyOption = page.getByText(/drive only/i);
    this.noPackagesMessage = page.getByText(/No packages are currently available\.?/i);
    this.loadErrorMessage = page.getByText(/Unable to load packages\. Please try again\.?/i);
  }

  async goto(pathname = '/packages') {
    return super.goto(pathname);
  }

  async expectPageLoaded() {
    await expect(this.viewDetailButtons.first()).toBeVisible();
  }

  async expectCardsInCardLayout() {
    const count = await this.packageCards.count();
    expect(count).toBeGreaterThan(0);
  }

  /** @param {number} index */
  async cardAt(index) {
    return this.packageCards.nth(index);
  }

  async clickEnrollOnFirstCard() {
    await this.enrollButtons.first().click();
    return this;
  }

  async clickEnroll(packageName) {
    const card = this.packageCards.filter({ hasText: packageName }).first();
    await card.getByRole('button', { name: /enroll now/i }).click();
    await this.page.waitForURL(/\/upcoming-classes(?:\?|$)/i);
    return this;
  }

  async clickViewDetail(packageName) {
    const card = this.packageCards.filter({ hasText: packageName }).first();
    await card.getByRole('link', { name: /view details?/i }).click();
    await this.page.waitForURL(/\/package\/\d+(?:\?|$)/i);
    return this;
  }

  async clickViewDetailOnFirstCard() {
    await this.viewDetailButtons.first().click();
    await this.waitForLoad();
    return this;
  }

  async expectPermitRequiredTagVisible() {
    await expect(this.permitRequiredTag.first()).toBeVisible();
  }

  async expectPermitRequiredTagHidden() {
    await expect(this.permitRequiredTag).toHaveCount(0);
  }

  async expectNoPackagesMessageVisible() {
    await expect(this.noPackagesMessage).toBeVisible();
  }

  async expectLoadErrorMessageVisible() {
    await expect(this.loadErrorMessage).toBeVisible();
  }

  async scrollListing() {
    await this.packageCards.last().scrollIntoViewIfNeeded();
  }
}

module.exports = PackageListingPage;
