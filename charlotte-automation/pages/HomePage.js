const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');

/**
 * Home page ("/") — the "Let's get you started" widget where a visitor
 * enters a Date of Birth (via a calendar date picker) and picks a Student
 * Type (radio buttons) to unlock packages.
 *
 * Locators follow the current date-picker button, calendar dialog, and
 * client-side package results flow.
 */
class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // TC_01 / TC_02 / TC_03 — DOB field + calendar date picker
    this.dobInput = page.getByRole('button', { name: 'Student Date of Birth' });
    this.datePicker = page
      .locator('.react-datepicker, [role="dialog"], [role="application"], [class*="datepicker" i]')
      .first();

    // TC_06 / TC_07 / TC_08 — Student Type buttons styled as radio choices.
    // Sheet's TC_06 expected result lists New Student / Transfer Student /
    // Additional Lessons; the live homepage also renders a 4th option,
    // "Road Test". Both are modeled here; TC_06 assertion only checks the
    // three the sheet names.
    this.studentTypeOptions = {
      newStudent: page.getByRole('button', { name: /^New Student\b/i }),
      transferStudent: page.getByRole('button', { name: /^Transfer Student\b/i }),
      additionalLessons: page.getByRole('button', { name: /^Additional Lessons\b/i }),
      roadTest: page.getByRole('button', { name: /^Road Test\b/i }),
    };

    // TC_11 / TC_12 — Continue button
    this.continueButton = page.getByRole('button', { name: /Continue/i });

    // TC_05 / TC_10 — exact validation copy from the sheet. Regex tolerates
    // straight vs. curly apostrophes since the sheet uses a curly one.
    this.dobRequiredMessage = page.getByText(/Please select the student[’']s Date of Birth\.?/i);
    this.studentTypeRequiredMessage = page.getByText(/Please select a student type to continue\.?/i);

    this.getStartedHeading = page.getByText(/Let's get you started/i);
    this.unlockPackagesHint = page.getByText(/unlock your packages/i);

    // TC_14 / TC_15 — age-based package routing
    const packageCards = page.locator('div.grid > div.group');
    this.teenPackageName = packageCards.getByText(/^Teen /).first();
    this.adultPackageName = packageCards.getByText(/^Adult /).first();
  }

  async open() {
    await this.goto('/');
    await this.waitForLoad();
    return this;
  }

  // TC_02 — clicking the DOB field opens the calendar picker
  async clickDobField() {
    await this.dobInput.click();
    return this;
  }

  async expectDatePickerVisible() {
    await expect(this.datePicker).toBeVisible();
  }

  async enterDateOfBirth(dobString) {
    const selected = await this.selectDateFromPicker(this.dobInput, dobString);
    return selected ? this : false;
  }

  async expectDobFieldHasValue(dobString) {
    await expect(this.dobInput).toHaveText(dobString);
  }

  /**
   * @param {'newStudent'|'transferStudent'|'additionalLessons'|'roadTest'} type
   */
  async selectStudentType(type) {
    const option = this.studentTypeOptions[type];
    if (!option) {
      throw new Error(`Unknown student type "${type}". Valid: ${Object.keys(this.studentTypeOptions).join(', ')}`);
    }
    await option.click();
    return this;
  }

  // TC_08 — selected radio button should be highlighted/checked
  async expectStudentTypeSelected(type) {
    const option = this.studentTypeOptions[type];
    await expect(option.locator('span.rounded-full > span')).toHaveCount(1);
  }

  async clickContinue() {
    await this.continueButton.click();
    return this;
  }

  async clickContinueAndWaitForNavigation() {
    await this.continueButton.click();
    await this.waitForLoad();
    return this;
  }

  /**
   * Full happy-path flow: fill DOB, pick a student type, submit.
   * @param {{dob: string, studentType: 'newStudent'|'transferStudent'|'additionalLessons'|'roadTest'}} params
   */
  async startPackageSelection({ dob, studentType }) {
    await this.enterDateOfBirth(dob);
    await this.selectStudentType(studentType);
    await this.clickContinueAndWaitForNavigation();
    return this;
  }

  async expectContinueEnabled() {
    await expect(this.continueButton).toBeEnabled();
  }

  async expectContinueDisabled() {
    await expect(this.continueButton).toBeDisabled();
  }

  async expectGetStartedWidgetVisible() {
    await expect(this.getStartedHeading).toBeVisible();
  }

  // TC_05
  async expectDobRequiredMessageVisible() {
    await expect(this.dobRequiredMessage).toBeVisible();
  }

  // TC_10
  async expectStudentTypeRequiredMessageVisible() {
    await expect(this.studentTypeRequiredMessage).toBeVisible();
  }

  // TC_14
  async expectRoutedToTeenPackages() {
    await expect(this.page).toHaveURL(/dob=\d{4}-\d{2}-\d{2}/i);
    await expect(this.teenPackageName).toBeVisible();
  }

  // TC_15
  async expectRoutedToAdultPackages() {
    await expect(this.page).toHaveURL(/dob=\d{4}-\d{2}-\d{2}/i);
    await expect(this.adultPackageName).toBeVisible();
  }
}

module.exports = HomePage;
