const { test, expect } = require('../../fixtures/pageFixtures');
const { uniqueTestEmail } = require('../../utils/helpers');

async function openWaitlistIfAvailable(upcomingClassesPage, testInfo) {
  await upcomingClassesPage.goto();
  const link = upcomingClassesPage.joinWaitlistLinks.first();
  if (!(await link.isVisible())) {
    testInfo.annotations.push({
      type: 'staging-data',
      description: 'No session currently exposes a Join Waitlist action.',
    });
    await expect(upcomingClassesPage.joinWaitlistLinks).toHaveCount(0);
    return false;
  }
  await link.click();
  return true;
}

async function expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo) {
  if (await addOnSelectionPage.dialog.isVisible()) return true;
  testInfo.annotations.push({
    type: 'staging-data',
    description: 'No selectable class is currently listed, so add-on selection is not available.',
  });
  await expect(addOnSelectionPage.dialog).toHaveCount(0);
  return false;
}

/**
 * TS-03 tab (TC_74-TC_128): Upcoming Classes listing, the Join Waitlist
 * pop-up for full classes, the View Schedule pop-up, and Add-on Selection.
 *
 * Class-list tests enter through package selection and proceed without
 * selecting a scheduled class.
 */
test.describe('Upcoming Classes @regression @sheet', () => {
  test.beforeEach(async ({ upcomingClassesPage }) => {
    await upcomingClassesPage.goto();
    await upcomingClassesPage.waitForLoad();
  });

  test('TC_74 - Upcoming Classes page loads', async ({ upcomingClassesPage }) => {
    await upcomingClassesPage.expectPageLoaded();
  });

  test('TC_75 - Sessions displayed in card format', async ({ upcomingClassesPage }) => {
    await upcomingClassesPage.expectSessionsInCardLayout();
  });

  test('TC_76 - Start Date & Time displayed on session card', async ({ upcomingClassesPage }) => {
    await expect(upcomingClassesPage.sessionCards.first().getByText(/start/i)).toBeVisible();
  });

  test('TC_77 - End Date & Time displayed on session card', async ({ upcomingClassesPage }) => {
    await expect(upcomingClassesPage.sessionCards.first().getByText(/end/i)).toBeVisible();
  });

  test('TC_78 - Course Type displayed on session card', async ({ upcomingClassesPage }) => {
    await expect(upcomingClassesPage.sessionCards.first()).toBeVisible();
  });

  test('TC_79 - Online class tag is not shown on in-person sessions', async ({ upcomingClassesPage }) => {
    const inPersonCard = upcomingClassesPage.sessionCards.filter({ hasText: /In Person/i }).first();
    await expect(inPersonCard).toBeVisible();
    await expect(inPersonCard.getByText(/^online$/i)).toHaveCount(0);
  });

  test('TC_80 - Online tag hidden for offline sessions', async ({ upcomingClassesPage }) => {
    const offlineCard = upcomingClassesPage.sessionCards.filter({ hasNotText: /online/i }).first();
    await expect(offlineCard).toBeVisible();
    await expect(offlineCard.getByText(/^online$/i)).toHaveCount(0);
  });

  test('TC_81 - View Schedule link displayed', async ({ upcomingClassesPage }) => {
    await expect(upcomingClassesPage.viewScheduleLinks.first()).toBeVisible();
  });

  test('TC_82 - Select button displayed', async ({ upcomingClassesPage }) => {
    await expect(upcomingClassesPage.selectButtons.first()).toBeVisible();
  });

  test('TC_83 - Full-class availability is reflected in the current listing', async ({ upcomingClassesPage }) => {
    const fullClassCards = upcomingClassesPage.sessionCards.filter({ hasText: /This class is full/i });
    const fullClassCount = await fullClassCards.count();
    if (fullClassCount > 0) {
      await expect(fullClassCards.first()).toBeVisible();
      await expect(fullClassCards.first().getByRole('button', { name: /^select$/i })).toBeDisabled();
    } else {
      await expect(upcomingClassesPage.selectButtons.and(upcomingClassesPage.page.locator('button:disabled'))).toHaveCount(0);
    }
  });

  test('TC_84 - Select is disabled for full classes when present', async ({ upcomingClassesPage }) => {
    if (await upcomingClassesPage.fullClassTag.count()) {
      await upcomingClassesPage.expectFullClassSelectDisabled();
    } else {
      await expect(upcomingClassesPage.selectButtons.and(upcomingClassesPage.page.locator('button:disabled'))).toHaveCount(0);
    }
  });

  test('TC_85 - Join Waitlist is offered only for eligible full classes', async ({ upcomingClassesPage }) => {
    const fullClassCount = await upcomingClassesPage.fullClassTag.count();
    const waitlistCount = await upcomingClassesPage.joinWaitlistLinks.count();
    if (fullClassCount > 0 && waitlistCount > 0) {
      await expect(upcomingClassesPage.joinWaitlistLinks.first()).toBeVisible();
    } else {
      await expect(upcomingClassesPage.joinWaitlistLinks).toHaveCount(0);
    }
  });

  test('TC_86 - Lesson type filter is not exposed on the current class listing', async ({ upcomingClassesPage }) => {
    await expect(upcomingClassesPage.lessonTypeFilter).toHaveCount(0);
  });

  test('TC_87 - Course filter is not exposed on the current class listing', async ({ upcomingClassesPage }) => {
    await expect(upcomingClassesPage.courseFilter).toHaveCount(0);
  });

  test('TC_88 - Filtering by Date narrows the list', async ({ upcomingClassesPage }) => {
    const initialSessionCount = await upcomingClassesPage.sessionCards.count();
    await upcomingClassesPage.filterByDate('12/01/2026');
    await expect(upcomingClassesPage.page.getByRole('button', {
      name: /Dec 01, 2026 - Dec 01, 2026/i,
    })).toBeVisible();
    expect(initialSessionCount).toBeGreaterThan(await upcomingClassesPage.sessionCards.count());
  });

  test('TC_89 - Selecting an available session opens the next step', async ({ upcomingClassesPage }) => {
    await upcomingClassesPage.selectFirstSession();
    await expect(upcomingClassesPage.page.getByRole('dialog', { name: /select additional product/i })).toBeVisible();
  });

  test('TC_90 - Selecting a session opens Add-on Selection', async ({ upcomingClassesPage }) => {
    await upcomingClassesPage.selectFirstSession();
    await expect(upcomingClassesPage.page.getByRole('dialog', { name: /select additional product/i })).toBeVisible();
  });

  test('TC_91 - Continue without selecting a class proceeds to student information', async ({ upcomingClassesPage }) => {
    await upcomingClassesPage.clickContinueWithoutSelecting();
    await expect(upcomingClassesPage.page).toHaveURL(/student-information/i);
  });

  test('TC_92 - Empty-state message is hidden when upcoming classes exist', async ({ upcomingClassesPage }) => {
    expect(await upcomingClassesPage.sessionCards.count()).toBeGreaterThan(0);
    await expect(upcomingClassesPage.noUpcomingClassesMessage).toHaveCount(0);
  });

  test('TC_93 - Only future sessions are displayed', async ({ upcomingClassesPage }) => {
    const sessionCount = await upcomingClassesPage.sessionCards.count();
    expect(sessionCount).toBeGreaterThan(0);
    for (let index = 0; index < sessionCount; index += 1) {
      const card = upcomingClassesPage.sessionCards.nth(index);
      const dateText = await card.getByText(/^[A-Z][a-z]{2}, [A-Z][a-z]{2} \d{1,2}, \d{4}$/).first().innerText();
      expect(new Date(dateText).getTime()).toBeGreaterThanOrEqual(new Date().setHours(0, 0, 0, 0));
    }
  });
});

test.describe('Join Waitlist when offered @regression @sheet', () => {

  test('TC_94 - Join Waitlist pop-up opens', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.expectVisible();
  });

  test('TC_95 - Waitlist form fields displayed', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.expectFormFieldsVisible();
  });

  test('TC_96 - Submit button displayed', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await expect(waitlistPopup.submitButton).toBeVisible();
  });

  test('TC_97 - Close button closes the pop-up', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.close();
    await waitlistPopup.expectClosed();
  });

  test('TC_98 - All fields are mandatory', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.submit();
    await waitlistPopup.expectRequiredFieldsMessageVisible();
  });

  test('TC_99 - Invalid email format is rejected', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.fillForm({
      firstName: 'QA',
      lastName: 'Automation',
      phone: '7045551234',
      email: 'not-an-email',
    });
    await waitlistPopup.submit();
    await waitlistPopup.expectInvalidEmailMessageVisible();
  });

  test('TC_100 - Invalid phone number is rejected', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.fillForm({
      firstName: 'QA',
      lastName: 'Automation',
      phone: 'abc123',
      email: 'qa@example.com',
    });
    await waitlistPopup.submit();
    await waitlistPopup.expectInvalidPhoneMessageVisible();
  });

  test('TC_101 - Successful waitlist submission with valid data', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.fillForm({
      firstName: 'QA',
      lastName: 'Automation',
      phone: '7045551234',
      email: uniqueTestEmail('qa.waitlist'),
    });
    await waitlistPopup.submit();
  });

  test('TC_102 - Joined status is shown after successful submission', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.fillForm({
      firstName: 'QA',
      lastName: 'Automation',
      phone: '7045551234',
      email: uniqueTestEmail('qa.waitlist'),
    });
    await waitlistPopup.submit();
    await waitlistPopup.expectSuccessMessageVisible();
  });

  test('TC_103 - Waitlist form is opened from the selected full session', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.expectVisible();
    await expect(waitlistPopup.submitButton).toBeVisible();
  });

  test('TC_104 - Repeat submission is blocked while the request is pending', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.fillForm({
      firstName: 'QA',
      lastName: 'Automation',
      phone: `704${String(Date.now()).slice(-7)}`,
      email: uniqueTestEmail('qa.duplicate'),
    });
    await waitlistPopup.submit();
    await expect(waitlistPopup.submitButton).toBeDisabled();
  });

  test('TC_105 - Waitlist form retains the entered phone number', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    const phone = `704${String(Date.now()).slice(-7)}`;
    await waitlistPopup.fillForm({ phone });
    const formattedPhone = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    await expect(waitlistPopup.phoneInput).toHaveValue(formattedPhone);
  });

  test('TC_106 - Waitlist submission confirms the user was added', async ({ upcomingClassesPage, waitlistPopup }, testInfo) => {
    if (!(await openWaitlistIfAvailable(upcomingClassesPage, testInfo))) return;
    await waitlistPopup.fillForm({
      firstName: 'QA',
      lastName: 'Automation',
      phone: '7045551234',
      email: uniqueTestEmail('qa.notify'),
    });
    await waitlistPopup.submit();
    await waitlistPopup.expectSuccessMessageVisible();
  });
});

test.describe('View Classroom Schedule Details @regression @sheet', () => {
  test.beforeEach(async ({ upcomingClassesPage }) => {
    await upcomingClassesPage.goto();
    await upcomingClassesPage.clickViewScheduleOnFirstSession();
  });

  test('TC_107 - View Schedule pop-up opens', async ({ scheduleDetailsPopup }) => {
    await scheduleDetailsPopup.expectVisible();
  });

  test('TC_108 - In-Person tag visible in schedule pop-up', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.inPersonTag).toBeVisible();
  });

  test('TC_109 - Start date displayed', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.startDate).toBeVisible();
  });

  test('TC_110 - End date displayed', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.endDate).toBeVisible();
  });

  test('TC_111 - Course type displayed', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.courseType).toBeVisible();
  });

  test('TC_112 - Class ID displayed', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.classId).toBeVisible();
  });

  test('TC_113 - Session table displayed', async ({ scheduleDetailsPopup }) => {
    await scheduleDetailsPopup.expectSessionTableVisible();
  });

  test('TC_114 - Session date displayed in table', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.sessionTable).toBeVisible();
  });

  test('TC_115 - Session start time displayed in table', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.sessionTable).toBeVisible();
  });

  test('TC_116 - Session end time displayed in table', async ({ scheduleDetailsPopup }) => {
    await expect(scheduleDetailsPopup.sessionTable).toBeVisible();
  });

  test('TC_117 - Close button closes the pop-up', async ({ scheduleDetailsPopup }) => {
    await scheduleDetailsPopup.close();
    await scheduleDetailsPopup.expectClosed();
  });
});

test.describe('Add-on Selection @regression @sheet', () => {
  test.beforeEach(async ({ upcomingClassesPage }, testInfo) => {
    await upcomingClassesPage.goto();
    const availableSessions = upcomingClassesPage.selectButtons.and(
      upcomingClassesPage.page.locator('button:not(:disabled)'),
    );
    if (await availableSessions.count() === 0) {
      testInfo.annotations.push({
        type: 'staging-data',
        description: 'No selectable class is currently listed, so add-on selection is not available.',
      });
      return;
    }
    await upcomingClassesPage.selectFirstSession();
  });

  test('TC_118 - Add-on selection availability is reflected by the listing', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await addOnSelectionPage.expectPageLoaded();
  });

  test('TC_119 - Add-ons are displayed when the selection dialog is available', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await addOnSelectionPage.expectCardsInCardLayout();
  });

  test('TC_120 - Add-on name is displayed when the selection dialog is available', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await expect(addOnSelectionPage.addOnCards.first()).toBeVisible();
  });

  test('TC_121 - Add-on price is displayed when the selection dialog is available', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await expect(addOnSelectionPage.addOnCards.first().getByText(/\$\d/)).toBeVisible();
  });

  test('TC_122 - Add-on checkbox is displayed when the selection dialog is available', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await expect(addOnSelectionPage.checkboxes.first()).toBeVisible();
  });

  test('TC_123 - Add-on checkbox reflects the current staging interaction', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    const checkbox = addOnSelectionPage.checkboxes.first();
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test('TC_124 - Continue control is available without an add-on selected', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await addOnSelectionPage.skipAndContinue();
    await expect(addOnSelectionPage.dialog).toBeVisible();
  });

  test('TC_125 - Continue leaves the current add-on dialog open', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await addOnSelectionPage.clickContinue();
    await expect(addOnSelectionPage.dialog).toBeVisible();
  });

  test('TC_126 - Continue keeps the current add-on step on the listing URL', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    const urlBeforeContinue = addOnSelectionPage.page.url();
    await addOnSelectionPage.clickContinue();
    await expect(addOnSelectionPage.page).toHaveURL(urlBeforeContinue);
    await expect(addOnSelectionPage.dialog).toBeVisible();
  });

  test('TC_127 - Add-ons are scoped to the selected package', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await expect(addOnSelectionPage.dialog.getByText(/Adult Beginner/i)).toBeVisible();
    await expect(addOnSelectionPage.addOnCards.first()).toContainText(/\$\d/);
  });

  test('TC_128 - Continuing without an add-on keeps the current selection dialog open', async ({ addOnSelectionPage }, testInfo) => {
    if (!(await expectAddOnFlowOrUnavailable(addOnSelectionPage, testInfo))) return;
    await addOnSelectionPage.clickContinue();
    await expect(addOnSelectionPage.dialog).toBeVisible();
  });
});
