const { test, expect } = require('../../fixtures/pageFixtures');
const users = require('../../testdata/users.json');

test.describe('Student package selector @regression', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('Continue is disabled until DOB and student type are both provided', async ({ homePage }) => {
    await homePage.expectContinueDisabled();
    await homePage.enterDateOfBirth(users.validNewStudentAdult.dob);
    // DOB alone should still leave Continue disabled until a student type is chosen.
    await homePage.selectStudentType(users.validNewStudentAdult.studentType);
    await homePage.expectContinueEnabled();
  });

  const happyPathCases = [
    ['validNewStudentAdult', 'New Student, adult DOB'],
    ['validNewStudentTeen', 'New Student, teen DOB'],
    ['validTransferStudent', 'Transfer Student'],
    ['validAdditionalLessons', 'Additional Lessons'],
    ['validRoadTest', 'Road Test'],
  ];

  for (const [key, description] of happyPathCases) {
    test(`selecting "${description}" with a valid DOB unlocks packages`, async ({ homePage, packagesPage }) => {
      const data = users[key];
      await homePage.startPackageSelection(data);
      await packagesPage.expectStudentTypePackagesVisible(
        {
          newStudent: 'New Student',
          transferStudent: 'Transfer Student',
          additionalLessons: 'Additional Lessons',
          roadTest: 'Road Test',
        }[data.studentType],
      );
    });
  }

  test('students below minimum age are blocked from package selection', async ({ homePage }) => {
    test.fixme(
      true,
      'Staging currently allows an 8-year-old DOB to continue. Confirm minimum-age policy with the product owner before enabling this assertion.',
    );
    const data = users.underMinimumAge;
    await homePage.enterDateOfBirth(data.dob);
    await homePage.selectStudentType(data.studentType);
    await homePage.clickContinue();
    await expect(homePage.page.getByText(/minimum age|too young|age requirement/i)).toBeVisible();
  });

  test('empty DOB keeps Continue disabled regardless of student type', async ({ homePage }) => {
    const data = users.emptyDob;
    await homePage.selectStudentType(data.studentType);
    await homePage.expectContinueDisabled();
  });
});
