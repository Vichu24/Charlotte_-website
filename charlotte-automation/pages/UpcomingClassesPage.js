const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const { goToUpcomingClasses } = require('../utils/enrollmentFlow');

/** Upcoming Classes listing. Covers TC_74-TC_93 (TS-03 tab). */
class UpcomingClassesPage extends BasePage {
  constructor(page) {
    super(page);
    this.sessionCards = page.getByRole('button', { name: /^Select$/i }).locator('xpath=../..');
    this.onlineTag = page.getByText(/^online$/i);
    this.viewScheduleLinks = page.getByRole('link', { name: /view schedule/i }).or(
      page.getByRole('button', { name: /view schedule/i }),
    );
    this.selectButtons = page.getByRole('button', { name: /^select$/i });
    this.fullClassTag = page.getByText(/This Class is Full/i);
    this.joinWaitlistLinks = page.getByRole('link', { name: /join(?: the)? waitlist/i }).or(
      page.getByRole('button', { name: /join(?: the)? waitlist/i }),
    );
    this.lessonTypeFilter = page.getByLabel(/lesson type/i);
    this.courseFilter = page.getByLabel(/course/i);
    this.dateFilter = page.getByRole('button', { name: /class date/i });
    this.noSessionValidationMessage = page.getByText(/Please select a class to continue\.?/i);
    this.noUpcomingClassesMessage = page.getByText(/No upcoming classes available\.?/i);
    this.continueButton = page.getByRole('button', { name: /continue/i });
  }

  async goto(pathname = '/upcoming-classes') {
    if (pathname === '/upcoming-classes') {
      await goToUpcomingClasses(this.page);
      await this.page.getByRole('button', { name: /Continue.*choose later/i }).waitFor();
      return this;
    }
    return super.goto(pathname);
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async expectSessionsInCardLayout() {
    expect(await this.sessionCards.count()).toBeGreaterThan(0);
  }

  async selectFirstSession() {
    const availableSessionButton = this.selectButtons.and(this.page.locator('button:not(:disabled)')).first();
    await availableSessionButton.click();
    await expect(this.page.getByRole('dialog', { name: /select additional product/i })).toBeVisible();
    return this;
  }

  async expectFullClassSelectDisabled() {
    const card = this.sessionCards.filter({ hasText: /This Class is Full/i }).first();
    await expect(card.getByRole('button', { name: /^select$/i })).toBeDisabled();
  }

  async clickJoinWaitlistOnFullClass() {
    const card = this.sessionCards.filter({ hasText: /This Class is Full/i }).first();
    await card.getByRole('link', { name: /join(?: the)? waitlist/i }).or(
      card.getByRole('button', { name: /join(?: the)? waitlist/i }),
    ).click();
    return this;
  }

  async clickViewScheduleOnFirstSession() {
    await this.viewScheduleLinks.first().click();
    return this;
  }

  async filterByLessonType(value) {
    await this.lessonTypeFilter.selectOption({ label: value }).catch(() => this.lessonTypeFilter.fill(value));
    return this;
  }

  async filterByCourse(value) {
    await this.courseFilter.selectOption({ label: value }).catch(() => this.courseFilter.fill(value));
    return this;
  }

  async filterByDate(value) {
    await this.selectDateFromPicker(this.dateFilter, value);
    return this;
  }

  async clickContinueWithoutSelecting() {
    await this.continueButton.click();
    return this;
  }

  async expectNoSessionValidationVisible() {
    await expect(this.noSessionValidationMessage).toBeVisible();
  }

  async expectNoUpcomingClassesMessageVisible() {
    await expect(this.noUpcomingClassesMessage).toBeVisible();
  }
}

module.exports = UpcomingClassesPage;
