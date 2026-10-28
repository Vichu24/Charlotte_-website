const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/** Package detail view opened via "View Detail". Covers TC_40-TC_48. */
class PackageDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.title = page.locator('main').getByRole('heading', { level: 1 });
    this.description = page.locator('main p').first();
    this.featuresList = page.locator('main ul li');
    this.enrollButton = page.getByRole('button', { name: /enroll/i });
    this.driveOnlyOption = page.getByText(/drive only/i);
  }

  async expectTitleVisible() {
    await expect(this.title).toBeVisible();
  }

  async expectDescriptionVisible() {
    await expect(this.description).toBeVisible();
  }

  async expectFeaturesListed() {
    const count = await this.featuresList.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectEnrollButtonVisible() {
    await expect(this.enrollButton).toBeVisible();
  }

  async expectDriveOnlyVisible() {
    await expect(this.driveOnlyOption).toBeVisible();
  }

  async expectDriveOnlyHidden() {
    await expect(this.driveOnlyOption).toHaveCount(0);
  }
}

module.exports = PackageDetailPage;
