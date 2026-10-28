const { test, expect } = require('../../fixtures/pageFixtures');

/**
 * The deployed staging flow currently exposes the enrollment entry screen,
 * while the legacy contract/signature step is not reachable.
 */
test.describe('Enrollment entry flow @regression @sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Student Date of Birth' })).toBeVisible();
  });

  test('Enrollment start heading and guidance are displayed', async ({ page }) => {
    await expect(page.getByText(/Let's get you started/i)).toBeVisible();
    await expect(page.getByText(/select your student type to unlock your packages/i)).toBeVisible();
  });

  test('Student Date of Birth selector is displayed', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Student Date of Birth' })).toBeVisible();
  });

  test('Preferred location selector is optional', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: /preferred location \(optional\)/i })).toBeVisible();
  });

  test('All current student types are available', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^New Student\b/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Transfer Student\b/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Additional Lessons\b/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Road Test\b/i })).toBeVisible();
  });

  test('Continue is disabled until required enrollment choices are made', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Continue$/i })).toBeDisabled();
  });

  test('Packages are not shown before enrollment choices are made', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Enroll Now/i })).toHaveCount(0);
  });

  test('Terms of Service is available from the footer', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms');
  });

  test('Privacy Policy is available from the footer', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy');
  });
});
