const { test, expect } = require('../../fixtures/pageFixtures');

test.describe('Homepage @smoke', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('loads successfully with correct title and header/footer', async ({ homePage }) => {
    await expect(homePage.page).toHaveTitle(/Charlotte Driving Academy/i);
    await homePage.expectHeaderVisible();
    await homePage.scrollToFooter();
    await homePage.expectFooterVisible();
  });

  test('primary navigation items are visible', async ({ homePage }, testInfo) => {
    if (testInfo.project.use.isMobile) {
      await homePage.header.mobileMenuButton.click();
      const mobileMenu = homePage.page.locator('#mobile-menu');
      await expect(mobileMenu.getByRole('link', { name: 'HOME', exact: true })).toBeVisible();
      await expect(mobileMenu.getByRole('button', { name: 'DRIVER TRAINING', exact: true })).toBeVisible();
      await expect(mobileMenu.getByRole('link', { name: 'SIMULATORS', exact: true })).toBeVisible();
      await expect(mobileMenu.getByRole('button', { name: 'ABOUT CDA', exact: true })).toBeVisible();
      await expect(mobileMenu.getByRole('link', { name: 'CONTACT US', exact: true })).toBeVisible();
      return;
    }

    await expect(homePage.header.homeLink).toBeVisible();
    await expect(homePage.header.driverTrainingMenu).toBeVisible();
    await expect(homePage.header.simulatorsLink).toBeVisible();
    await expect(homePage.header.aboutCdaMenu).toBeVisible();
    await expect(homePage.header.contactUsLink).toBeVisible();
  });

  test('"Let\'s get you started" package selector widget is visible', async ({ homePage }) => {
    await homePage.expectGetStartedWidgetVisible();
    await expect(homePage.dobInput).toBeVisible();
    await expect(homePage.studentTypeOptions.newStudent).toBeVisible();
    await expect(homePage.studentTypeOptions.transferStudent).toBeVisible();
    await expect(homePage.studentTypeOptions.additionalLessons).toBeVisible();
    await expect(homePage.studentTypeOptions.roadTest).toBeVisible();
  });

  test('footer legal links and social links are present', async ({ homePage }) => {
    await homePage.scrollToFooter();
    await expect(homePage.footer.termsOfServiceLink).toBeVisible();
    await expect(homePage.footer.privacyPolicyLink).toBeVisible();
    await expect(homePage.footer.facebookLink).toHaveAttribute('href', /facebook\.com/);
    await expect(homePage.footer.linkedinLink).toHaveAttribute('href', /linkedin\.com/);
  });
});
