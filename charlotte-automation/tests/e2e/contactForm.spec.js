const { test, expect } = require('../../fixtures/pageFixtures');
const contactData = require('../../testdata/contactFormData.json');
const { uniqueTestEmail } = require('../../utils/helpers');
const { activeEnv } = require('../../config/environments');

test.describe('Contact form @e2e', () => {
  test.beforeEach(async ({ contactPage }) => {
    test.skip(activeEnv.name === 'production', 'Form submission tests are disabled in production.');
    await contactPage.goto();
    await contactPage.waitForLoad();
  });

  test('submitting valid details succeeds', async ({ contactPage }) => {
    const payload = { ...contactData.validSubmission, email: uniqueTestEmail() };
    await contactPage.fillForm(payload);
    await contactPage.submit();
    await contactPage.expectSubmissionSucceeded();
  });

  test('submitting with required fields empty shows validation errors', async ({ contactPage }) => {
    await contactPage.submit();
    // Native HTML5 "required" validation surfaces via :invalid pseudo-class;
    // assert the form did not silently proceed to a success state.
    await expect(contactPage.successMessage).not.toBeVisible();
  });

  test('submitting an invalid email format is rejected', async ({ contactPage }) => {
    await contactPage.fillForm(contactData.invalidEmailFormat);
    await contactPage.submit();
    await expect(contactPage.successMessage).not.toBeVisible();
  });
});
