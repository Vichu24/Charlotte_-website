const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/** "View Schedule" pop-up. Covers TC_107-TC_117 (TS-03 tab). */
class ScheduleDetailsPopup extends BasePage {
  constructor(page) {
    super(page);
    this.popup = page.locator('[role="dialog"]').first();
    this.onlineTag = this.popup.getByText(/^online$/i);
    this.inPersonTag = this.popup.getByText(/^in-person$/i);
    this.startDate = this.popup.getByText('Start Date', { exact: true });
    this.endDate = this.popup.getByText('End Date', { exact: true });
    this.courseType = this.popup.getByText(/Course Type:\s*\w+/i);
    this.classId = this.popup.getByText(/Class #:\s*\S+/i);
    this.sessionTable = this.popup.locator('table').first();
    this.closeButton = this.popup.locator('[data-slot="dialog-close"]');
  }

  async expectVisible() {
    await expect(this.popup).toBeVisible();
  }

  async expectHeaderDetailsVisible() {
    await expect(this.startDate).toBeVisible();
    await expect(this.endDate).toBeVisible();
    await expect(this.courseType).toBeVisible();
    await expect(this.classId).toBeVisible();
  }

  async expectSessionTableVisible() {
    await expect(this.sessionTable).toBeVisible();
  }

  async close() {
    await this.page.keyboard.press('Escape');
    return this;
  }

  async expectClosed() {
    await expect(this.popup).not.toBeVisible();
  }
}

module.exports = ScheduleDetailsPopup;
