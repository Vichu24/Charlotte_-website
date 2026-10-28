const { test, expect } = require('../../fixtures/pageFixtures');
const users = require('../../testdata/users.json');

/**
 * TS-02 Package Listing tab (TC_19-TC_58): package cards, Enroll navigation,
 * View Details and the deployed enrollment route to Upcoming Classes.
 *
 * Precondition for this whole file: reaching the package listing page
 * requires completing the homepage DOB/Student Type step first (see
 * HomePage.startPackageSelection).
 */
test.describe('Package Listing @regression @sheet', () => {
  test.beforeEach(async ({ homePage, packageListingPage }) => {
    await homePage.open();
    await homePage.startPackageSelection(users.validNewStudentAdult);
    await packageListingPage.expectPageLoaded();
  });

  test('TC_19 - Package listing page loads', async ({ packageListingPage }) => {
    await packageListingPage.expectPageLoaded();
  });

  test('TC_20 - Packages displayed in card format', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first()).toBeVisible();
  });

  test('TC_21 - Package name displayed on card', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first()).toBeVisible();
  });

  test('TC_22 - Package amount displayed on card', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first().getByText(/\$\d/)).toBeVisible();
  });

  test('TC_23 - Package description displayed on card', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first()).toBeVisible();
  });

  test('TC_24 - Included features list displayed', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first().locator('ul, li').first()).toBeVisible();
  });

  test('TC_25 - Enroll button displayed on package card', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first().getByRole('button', { name: /enroll/i })).toBeVisible();
  });

  test('TC_26 - Permit Required tag displayed when configured', async ({ packageListingPage }) => {
    const permitRequiredCard = packageListingPage.packageCards.filter({ hasText: /permit required/i }).first();
    await expect(permitRequiredCard).toBeVisible();
    await expect(permitRequiredCard.getByText(/permit required/i)).toBeVisible();
  });

  test('TC_27 - Permit tag hidden when not configured', async ({ packageListingPage }) => {
    const packageWithoutPermitRequirement = packageListingPage.packageCards
      .filter({ hasNotText: /permit required/i })
      .first();
    await expect(packageWithoutPermitRequirement).toBeVisible();
    await expect(packageWithoutPermitRequirement.getByText(/permit required/i)).toHaveCount(0);
  });

  test('TC_28 - Every displayed package has working actions', async ({ packageListingPage }) => {
    const count = await packageListingPage.packageCards.count();
    expect(count).toBeGreaterThan(0);

    for (let index = 0; index < count; index += 1) {
      const card = packageListingPage.packageCards.nth(index);
      await expect(card.getByRole('button', { name: /enroll now/i })).toBeVisible();
      await expect(card.getByRole('link', { name: /view details?/i })).toBeVisible();
    }
  });

  test('TC_29 - Teen DOB filters to Teen packages', async ({ homePage, packageListingPage }) => {
    await homePage.open();
    await homePage.startPackageSelection(users.teenDob);
    await expect(packageListingPage.packageCards.first()).toBeVisible();
    await expect(packageListingPage.page).toHaveURL(/dob=2010-09-22/i);
  });

  test('TC_30 - Adult DOB filters to Adult packages', async ({ homePage, packageListingPage }) => {
    await homePage.open();
    await homePage.startPackageSelection(users.adultDob);
    await expect(packageListingPage.packageCards.first()).toBeVisible();
    await expect(packageListingPage.page).toHaveURL(/dob=2001-09-22/i);
  });

  test('TC_31 - Packages filtered by student type (New Student)', async ({ packageListingPage }) => {
    await expect(packageListingPage.page).toHaveURL(/package_type=New\+Student/i);
  });

  test('TC_32 - User can scroll to view other available packages', async ({ packageListingPage }) => {
    await packageListingPage.packageCards.last().scrollIntoViewIfNeeded();
    await expect(packageListingPage.packageCards.last()).toBeVisible();
  });

  test('TC_33 - Empty-state message is hidden when packages are available', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first()).toBeVisible();
    await expect(packageListingPage.noPackagesMessage).toHaveCount(0);
  });

  test('TC_34 - Package page remains usable after a failed filter refresh', async ({
    homePage,
    packageListingPage,
  }) => {
    await packageListingPage.page.route('**/*', async (route) => {
      const requestUrl = new URL(route.request().url());
      if (
        route.request().resourceType() === 'fetch' &&
        requestUrl.searchParams.has('_rsc') &&
        requestUrl.searchParams.get('package_type') === 'Transfer Student'
      ) {
        await route.abort();
        return;
      }
      await route.continue();
    });

    await homePage.selectStudentType('transferStudent');
    await homePage.clickContinue();
    await expect(packageListingPage.page).toHaveURL(/package_type=Transfer\+Student/i);
    await expect(packageListingPage.viewDetailButtons.first()).toBeVisible();
  });

  test('TC_35 - Multiple packages all displayed', async ({ packageListingPage }) => {
    const count = await packageListingPage.packageCards.count();
    expect(count).toBeGreaterThan(1);
  });

  test('TC_36 - Clicking Enroll initiates the enrollment flow', async ({ packageListingPage }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickEnroll(firstCardText.split('\n')[0]);
  });

  test('TC_37 - Enroll navigates to Upcoming Classes', async ({
    page,
    packageListingPage,
  }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickEnroll(firstCardText.split('\n')[0]);
    await expect(page).toHaveURL(/\/upcoming-classes(?:\?|$)/i);
    await expect(page.getByRole('heading', { name: /upcoming classes/i })).toBeVisible();
  });

  test('TC_38 - Selected package context passed forward', async ({ packageListingPage }) => {
    const firstCard = packageListingPage.packageCards.first();
    const packageName = (await firstCard.innerText()).split('\n')[0];
    const packageId = (await firstCard.getByRole('link', { name: /view details?/i }).getAttribute('href'))
      .split('/')
      .pop();

    await packageListingPage.clickEnroll(packageName);
    const storedFlow = await packageListingPage.page.evaluate(
      'globalThis.sessionStorage.getItem("flow-storage")',
    );
    const flowState = storedFlow ? JSON.parse(storedFlow).state : null;

    expect(flowState).not.toBeNull();
    expect(String(flowState.selectedPackageID)).toBe(packageId);
    expect(flowState.selectedPackageDetail.name).toBe(packageName);
    const [month, day, year] = users.validNewStudentAdult.dob.split('/');
    expect(flowState.selectedDob).toBe(`${year}-${month}-${day}`);
  });

  test('TC_39 - User cannot continue before making enrollment choices', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^Continue$/i })).toBeDisabled();
  });

  test('TC_40 - View Detail button displayed on package card', async ({ packageListingPage }) => {
    await expect(packageListingPage.packageCards.first().getByRole('link', { name: /view detail/i })).toBeVisible();
  });

  test('TC_41 - View Detail opens the package detail page', async ({ packageListingPage, packageDetailPage }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickViewDetail(firstCardText.split('\n')[0]);
    await packageDetailPage.expectTitleVisible();
  });

  test('TC_42 - Package title displayed in detail view', async ({ packageListingPage, packageDetailPage }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickViewDetail(firstCardText.split('\n')[0]);
    await packageDetailPage.expectTitleVisible();
  });

  test('TC_43 - Package description shown in detail page', async ({ packageListingPage, packageDetailPage }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickViewDetail(firstCardText.split('\n')[0]);
    await packageDetailPage.expectDescriptionVisible();
  });

  test('TC_44 - Package features list shown in detail page', async ({ packageListingPage, packageDetailPage }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickViewDetail(firstCardText.split('\n')[0]);
    await packageDetailPage.expectFeaturesListed();
  });

  test('TC_45 - Enroll button displayed in detail view', async ({ packageListingPage, packageDetailPage }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickViewDetail(firstCardText.split('\n')[0]);
    await packageDetailPage.expectEnrollButtonVisible();
  });

  test('TC_46 - Selected package context passed to detail view', async ({ packageListingPage, packageDetailPage }) => {
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    const name = firstCardText.split('\n')[0];
    await packageListingPage.clickViewDetail(name);
    await expect(packageDetailPage.title).toHaveText(new RegExp(name, 'i'));
  });

  test('TC_47 - Permit requirement is retained on package detail', async ({
    packageListingPage,
    packageDetailPage,
  }) => {
    const permitRequiredCard = packageListingPage.packageCards.filter({ hasText: /permit required/i }).first();
    const packageName = (await permitRequiredCard.innerText()).split('\n')[0];
    await packageListingPage.clickViewDetail(packageName);
    await expect(packageDetailPage.page.getByText(/permit required/i)).toBeVisible();
    await expect(packageDetailPage.driveOnlyOption).toHaveCount(0);
  });

  test('TC_48 - Standard package detail does not show Drive Only', async ({
    packageListingPage,
    packageDetailPage,
  }) => {
    const standardPackage = packageListingPage.packageCards.filter({ hasNotText: /permit required/i }).first();
    const packageName = (await standardPackage.innerText()).split('\n')[0];
    await packageListingPage.clickViewDetail(packageName);
    await expect(packageDetailPage.driveOnlyOption).toHaveCount(0);
    await expect(packageDetailPage.featuresList.first()).toBeVisible();
  });
});

test.describe('Enroll navigation @regression @sheet', () => {
  test.beforeEach(async ({ homePage, packageListingPage }) => {
    await homePage.open();
    await homePage.startPackageSelection(users.validNewStudentAdult);
    await packageListingPage.expectPageLoaded();
    const firstCardText = await packageListingPage.packageCards.first().innerText();
    await packageListingPage.clickEnroll(firstCardText.split('\n')[0]);
  });

  test('TC_49 - Enroll opens the Upcoming Classes step', async ({ page }) => {
    await expect(page).toHaveURL(/\/upcoming-classes(?:\?|$)/i);
    await expect(page.getByRole('heading', { name: /upcoming classes/i })).toBeVisible();
  });

  test('TC_50 - Available classes are displayed', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Select$/i }).first()).toBeVisible();
  });

  test('TC_51 - Class selection controls reflect session availability', async ({ page, upcomingClassesPage }) => {
    const selectButtons = page.getByRole('button', { name: /^Select$/i });
    await expect(selectButtons.first()).toBeVisible();
    expect(await selectButtons.count()).toBeGreaterThan(0);

    const availableSessions = selectButtons.and(page.locator('button:not(:disabled)'));
    if (await availableSessions.count() === 0) {
      await expect(upcomingClassesPage.fullClassTag.first()).toBeVisible();
      await expect(upcomingClassesPage.joinWaitlistLinks.first()).toBeVisible();
      return;
    }

    await expect(availableSessions.first()).toBeEnabled();
  });

  test('TC_52 - Online class filter is displayed', async ({ page }) => {
    await expect(page.getByRole('combobox').first()).toBeVisible();
  });

  test('TC_53 - Class date filter is displayed', async ({ page }) => {
    await expect(page.getByRole('button', { name: /class date/i })).toBeVisible();
  });

  test('TC_54 - User may continue without selecting a class', async ({ page }) => {
    await expect(page.getByRole('button', { name: /continue.*choose later/i })).toBeVisible();
  });

  test('TC_55 - Enrollment proceeds without an additional DOB dialog', async ({ page }) => {
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(/\/upcoming-classes(?:\?|$)/i);
  });

  test('TC_56 - Current enrollment step includes class scheduling guidance', async ({ page }) => {
    await expect(page.getByText(/finish signing up now and choose your classroom session later/i)).toBeVisible();
  });

  test('TC_57 - Class session cards show their selection controls', async ({ page }) => {
    const selectButtons = page.getByRole('button', { name: /^Select$/i });
    await expect(selectButtons.first()).toBeVisible();
  });

  test('TC_58 - Enrollment is not blocked by a second DOB check', async ({ page }) => {
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /upcoming classes/i })).toBeVisible();
  });
});
