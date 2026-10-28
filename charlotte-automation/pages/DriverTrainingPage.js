const BasePage = require('./BasePage');

/**
 * "Prepare for Road Test" / Driver Training section. The main nav item is a
 * dropdown/menu ("DRIVER TRAINING") rather than a single link, so this page
 * object exposes both the trigger and whatever sub-items are present.
 */
class DriverTrainingPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.prepareForRoadTestLink = page.getByRole('link', { name: /Prepare for Road Test/i });
  }

  async openViaFooterLink() {
    await this.prepareForRoadTestLink.click();
    await this.waitForLoad();
    return this;
  }

  async openViaNavMenu() {
    await this.header.driverTrainingMenu.click();
    return this;
  }

  async goto(pathname = '/driver-training') {
    return super.goto(pathname);
  }
}

module.exports = DriverTrainingPage;
