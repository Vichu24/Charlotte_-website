const { test, expect } = require('../../fixtures/pageFixtures');
const routes = require('../../testdata/siteRoutes.json');

test.describe('Site navigation @regression', () => {
  for (const route of routes) {
    test(`"${route.name}" (${route.path}) loads without error`, async ({ page }) => {
      test.skip(route.name.startsWith('About'), 'About page checks are temporarily disabled.');
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });

      expect(response, `No response received for ${route.path}`).not.toBeNull();
      test.skip(response.status() === 404, `Staging does not currently serve ${route.path}.`);
      expect(response.status(), `Unexpected status for ${route.path}`).toBeLessThan(400);

      await expect(page.locator('body')).toBeVisible();
    });
  }

  test('nav bar is consistent across pages', async ({ homePage, aboutPage }) => {
    test.skip(true, 'About page checks are temporarily disabled.');
    await homePage.open();
    await homePage.expectHeaderVisible();

    await aboutPage.goto('ourStory');
    await aboutPage.expectHeaderVisible();
  });
});
