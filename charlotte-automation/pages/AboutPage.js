const BasePage = require('./BasePage');

/**
 * "ABOUT CDA" is a dropdown nav item with four sub-pages. Rather than one
 * page object per sub-page (they're thin, mostly-content pages), this
 * object models the whole section with a `section` param.
 */
class AboutPage extends BasePage {
  constructor(page) {
    super(page);
    this.subLinks = {
      ourStory: page.getByRole('link', { name: /Our Story/i }),
      ourTeam: page.getByRole('link', { name: /Our Team/i }),
      testimonials: page.getByRole('link', { name: /Testimonials/i }),
      faqs: page.getByRole('link', { name: /FAQs/i }),
    };
    this.pageHeading = page.getByRole('heading', { level: 1 });
  }

  static sectionPaths = {
    ourStory: '/about/our-story',
    ourTeam: '/about/our-team',
    testimonials: '/about/testimonials',
    faqs: '/about/faqs',
  };

  /** @param {'ourStory'|'ourTeam'|'testimonials'|'faqs'} section */
  async goto(section) {
    const pathname = AboutPage.sectionPaths[section];
    if (!pathname) {
      throw new Error(`Unknown About CDA section "${section}"`);
    }
    return super.goto(pathname);
  }

  async openMenu() {
    await this.header.aboutCdaMenu.click();
    return this;
  }

  /** @param {'ourStory'|'ourTeam'|'testimonials'|'faqs'} section */
  async openSectionViaNav(section) {
    await this.openMenu();
    await this.subLinks[section].click();
    await this.waitForLoad();
    return this;
  }
}

module.exports = AboutPage;
