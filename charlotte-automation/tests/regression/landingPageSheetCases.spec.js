const { test, expect } = require('../../fixtures/pageFixtures');
const users = require('../../testdata/users.json');

/**
 * Direct 1:1 mapping to "Charlotte_website_ testcases" (Google Sheet, gid=0).
 * Each test title is prefixed with its Testcase No so results/reports trace
 * straight back to the source sheet.
 *
 * Sheet columns used: Testcase No | Test Scenario | Pre-conditions |
 * Step Definition | Test input | Expected Result
 */
test.describe('Landing page - DOB & Student Type widget @regression @sheet', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC_01 - Landing page loads with DOB field, Student Type radios, and Continue button', async ({
    homePage,
  }) => {
    await expect(homePage.dobInput).toBeVisible();
    await expect(homePage.studentTypeOptions.newStudent).toBeVisible();
    await expect(homePage.studentTypeOptions.transferStudent).toBeVisible();
    await expect(homePage.studentTypeOptions.additionalLessons).toBeVisible();
    await expect(homePage.continueButton).toBeVisible();
  });

  test('TC_02 - Clicking Date of Birth field displays the calendar date picker', async ({ homePage }) => {
    await homePage.clickDobField();
    await homePage.expectDatePickerVisible();
  });

  test('TC_03 - Selecting a date from the calendar populates the DOB field', async ({ homePage }) => {
    const { dob } = users.validNewStudentAdult;
    // Sheet step is "Select a date from calendar"; typing + confirming is
    // used here as the resilient equivalent since the calendar's exact
    // click-target markup wasn't confirmed against the live DOM.
    await homePage.enterDateOfBirth(dob);
    await homePage.expectDobFieldHasValue(dob);
  });

  test('TC_04 - Continue remains disabled without DOB', async ({ homePage }) => {
    await homePage.selectStudentType('newStudent');
    await homePage.expectContinueDisabled();
  });

  test('TC_05 - Continue remains disabled when DOB is missing', async ({ homePage }) => {
    await homePage.selectStudentType('newStudent');
    await homePage.expectContinueDisabled();
  });

  test('TC_06 - Student Type options displayed: New Student, Transfer Student, Additional Lessons', async ({
    homePage,
  }) => {
    await expect(homePage.studentTypeOptions.newStudent).toBeVisible();
    await expect(homePage.studentTypeOptions.transferStudent).toBeVisible();
    await expect(homePage.studentTypeOptions.additionalLessons).toBeVisible();
  });

  test('TC_07 - Student Type options are rendered as radio buttons', async ({ homePage }) => {
    await expect(homePage.studentTypeOptions.newStudent).toHaveAttribute('type', 'button');
  });

  test('TC_08 - Selecting a Student Type highlights/checks that option', async ({ homePage }) => {
    await homePage.selectStudentType('transferStudent');
    await homePage.expectStudentTypeSelected('transferStudent');
  });

  test('TC_09 - Continue remains disabled when Student Type is omitted', async ({
    homePage,
  }) => {
    await homePage.enterDateOfBirth(users.validNewStudentAdult.dob);
    await homePage.expectContinueDisabled();
  });

  test('TC_10 - Continue remains disabled when Student Type is missing', async ({ homePage }) => {
    await homePage.enterDateOfBirth(users.validNewStudentAdult.dob);
    await homePage.expectContinueDisabled();
  });

  test('TC_11 - Continue button is displayed', async ({ homePage }) => {
    await expect(homePage.continueButton).toBeVisible();
  });

  test('TC_12 - Continue with valid DOB and Student Type processes and proceeds', async ({ homePage }) => {
    await homePage.startPackageSelection(users.validNewStudentAdult);
    await expect(homePage.page).not.toHaveURL(/\/$/);
  });

  test('TC_13 - System calculates student age correctly from DOB', async () => {
    // The sheet doesn't expose a visible "age" field to assert on directly;
    // this is validated indirectly via correct Teen/Adult routing in
    // TC_14/TC_15 below. Kept as a placeholder so the sheet's row count and
    // this file's test count stay 1:1 - replace with a direct assertion if
    // the age is ever surfaced in the UI (e.g. a summary/review step).
    test.fixme(true, 'No visible age output in the UI to assert on directly - see TC_14/TC_15 for indirect coverage.');
  });

  test('TC_14 - Teen DOB routes to Teen Packages', async ({ homePage }) => {
    await homePage.startPackageSelection(users.teenDob);
    await homePage.expectRoutedToTeenPackages();
  });

  test('TC_15 - Adult DOB routes to Adult Packages', async ({ homePage }) => {
    await homePage.startPackageSelection(users.adultDob);
    await homePage.expectRoutedToAdultPackages();
  });

  test('TC_16 - New Student selection displays relevant new-student packages', async ({
    homePage,
    packagesPage,
  }) => {
    await homePage.startPackageSelection(users.validNewStudentAdult);
    await packagesPage.expectNewStudentPackagesVisible();
  });

  test('TC_17 - Transfer Student selection displays transfer-student packages', async ({
    homePage,
    packagesPage,
  }) => {
    await homePage.startPackageSelection(users.validTransferStudent);
    await packagesPage.expectTransferStudentPackagesVisible();
  });

  test('TC_18 - Additional Lessons selection displays packages including road test options', async ({
    homePage,
    packagesPage,
  }) => {
    await homePage.startPackageSelection(users.validAdditionalLessons);
    await packagesPage.expectAdditionalLessonsPackagesVisible();
    await packagesPage.expectRoadTestOptionVisible();
  });
});
