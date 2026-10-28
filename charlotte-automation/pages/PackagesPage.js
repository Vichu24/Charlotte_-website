const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * The packages/results screen shown after a visitor submits DOB + Student
 * Type on the homepage. Covers TC_16 (New Student), TC_17 (Transfer
 * Student), TC_18 (Additional Lessons, which per the sheet's expected
 * result also surfaces road-test options).
 *
 * NOTE: exact heading/section text could not be confirmed via static fetch
 * (client-rendered route). Locators are intentionally loose (case-insensitive
 * substring match); tighten once you can inspect the live DOM.
 */
class PackagesPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.packageCards = page.locator('div.grid > div.group');
  }

  async expectStudentTypePackagesVisible(studentType) {
    if (studentType === 'Road Test') {
      await expect(this.page.getByText('Road Test', { exact: true })).toBeVisible();
      await expect(this.page.getByRole('button', { name: /Enroll Now/i })).toBeVisible();
      return;
    }

    await expect
      .poll(() => new URL(this.page.url()).searchParams.get('package_type'))
      .toBe(studentType);
    await expect(this.page.getByRole('button', { name: /Enroll Now/i }).first()).toBeVisible();
  }

  async expectNewStudentPackagesVisible() {
    await this.expectStudentTypePackagesVisible('New Student');
  }

  async expectTransferStudentPackagesVisible() {
    await this.expectStudentTypePackagesVisible('Transfer Student');
  }

  async expectAdditionalLessonsPackagesVisible() {
    await this.expectStudentTypePackagesVisible('Additional Lessons');
  }

  async expectRoadTestOptionVisible() {
    await expect(this.packageCards.getByText(/road test/i).first()).toBeVisible();
  }
}

module.exports = PackagesPage;
