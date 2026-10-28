const { expect } = require('@playwright/test');
const logger = require('../utils/logger');

/**
 * Every page object extends this. Keep locators in the child class;
 * keep reusable *behaviour* (navigation, waits, common assertions) here.
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.header = {
      logo: page.locator('a[href="/"]').first(),
      homeLink: page.getByRole('banner').getByRole('link', { name: 'HOME', exact: true }),
      driverTrainingMenu: page.getByText('DRIVER TRAINING', { exact: false }).first(),
      simulatorsLink: page.getByRole('link', { name: /SIMULATORS/i }),
      aboutCdaMenu: page.getByText('ABOUT CDA', { exact: false }).first(),
      contactUsLink: page.getByRole('link', { name: /CONTACT US/i }).first(),
      mobileMenuButton: page.locator('button[aria-controls="mobile-menu"]'),
    };
    this.footer = {
      termsOfServiceLink: page.getByRole('link', { name: /Terms of Service/i }),
      privacyPolicyLink: page.getByRole('link', { name: /Privacy Policy/i }),
      copyrightText: page.getByText(/All Rights Reserved/i),
      facebookLink: page.locator('a[href*="facebook.com"]'),
      linkedinLink: page.locator('a[href*="linkedin.com"]'),
    };
  }

  async goto(pathname = '/') {
    logger.step(`Navigating to ${pathname}`);
    await this.page.goto(pathname, { waitUntil: 'domcontentloaded' });
    return this;
  }

  async waitForLoad() {
    await this.page.waitForLoadState('load');
    return this;
  }

  async selectDateFromPicker(trigger, dateString) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateString);
    if (!match) return false;

    const [, monthString, dayString, yearString] = match;
    const month = Number(monthString) - 1;
    const day = Number(dayString);
    const year = Number(yearString);
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      return false;
    }

    const monthName = date.toLocaleString('en-US', { month: 'long' });
    const weekday = date.toLocaleString('en-US', { weekday: 'long' });
    const ordinal =
      day % 100 >= 11 && day % 100 <= 13
        ? 'th'
        : ({ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] || 'th');
    const dialog = this.page.getByRole('dialog');

    await trigger.click();
    await dialog.getByLabel('Choose the Year').first().selectOption(String(year));
    await dialog.getByLabel('Choose the Month').first().selectOption(String(month));
    await dialog
      .getByRole('button', {
        name: `${weekday}, ${monthName} ${day}${ordinal}, ${year}`,
        exact: true,
      })
      .click();
    if (await dialog.isVisible()) {
      await this.page.keyboard.press('Escape');
    }
    await dialog.waitFor({ state: 'hidden' });
    return true;
  }

  async title() {
    return this.page.title();
  }

  async currentURL() {
    return this.page.url();
  }

  async clickNav(linkLocator) {
    await linkLocator.first().click();
    await this.waitForLoad();
  }

  async expectURLContains(fragment) {
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }

  async expectVisible(locator, message = '') {
    await expect(locator, message).toBeVisible();
  }

  async expectHeaderVisible() {
    await expect(this.header.logo).toBeVisible();
  }

  async expectFooterVisible() {
    await expect(this.footer.copyrightText).toBeVisible();
  }

  async scrollToFooter() {
    await this.footer.copyrightText.scrollIntoViewIfNeeded();
  }

  /** Takes a named screenshot into test-results for manual review/debug. */
  async screenshot(name) {
    await this.page.screenshot({ path: `test-results/manual/${name}.png`, fullPage: true });
  }
}

module.exports = BasePage;
