const BasePage = require('./BasePage');

class SimulatorsPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageHeading = page.getByRole('heading', { level: 1 });
  }

  async goto(pathname = '/simulators') {
    return super.goto(pathname);
  }

  async openViaNav() {
    await this.header.simulatorsLink.click();
    await this.waitForLoad();
    return this;
  }
}

module.exports = SimulatorsPage;
