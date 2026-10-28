const { expect } = require('@playwright/test');
const BasePage = require('./BasePage');
const { goToStudentInformation } = require('../utils/enrollmentFlow');

/**
 * Student Information step. Covers TC_144-TC_189 (TS-05 tab): shared DOB
 * field, Teen personal/parent/emergency/additional sections, Adult
 * personal/permit/contact sections, and the shared Terms & Conditions
 * checkbox.
 */
class StudentInformationPage extends BasePage {
  constructor(page) {
    super(page);

    // Shared
    this.dobInput = page.getByRole('button', { name: /date of birth/i });
    this.firstNameInput = page.getByLabel(/first name/i);
    this.lastNameInput = page.getByLabel(/last name/i);
    this.genderOptions = {
      male: page.getByLabel(/^male$/i),
      female: page.getByLabel(/^female$/i),
    };
    this.phoneInput = page.getByLabel(/^phone/i);
    this.emailInput = page.getByLabel(/^email/i);
    this.continueButton = page.getByRole('button', { name: /continue/i });

    // Teen - parent/guardian
    this.parentNameInput = page.getByLabel(/parent.*name|guardian.*name/i);
    this.parentPhoneInput = page.getByLabel(/parent.*(phone|cell|contact)|guardian.*(phone|cell|contact)/i);
    this.parentEmailInput = page.getByLabel(/parent.*email|guardian.*email/i);

    // Teen - emergency
    this.emergencyNameInput = page.getByLabel(/emergency.*name/i);
    this.emergencyRelationshipInput = page.getByLabel(/relationship/i);
    this.emergencyPhoneInput = page.getByLabel(/emergency.*phone/i);

    // Teen - additional
    this.medicalConditionCheckbox = page.getByRole('checkbox', { name: /medical conditions/i });
    this.medicalConditionInput = page.locator('#medical_conditions');
    this.highSchoolSelect = page.getByRole('combobox').nth(1);
    this.glassesSelect = page.getByRole('combobox').nth(2);
    this.referralSelect = page.getByRole('combobox').last();

    // Adult - permit
    this.permitYesRadio = page.getByRole('radio', { name: /^yes$/i }).or(page.getByLabel(/^yes$/i));
    this.permitNoRadio = page.getByRole('radio', { name: /^no$/i }).or(page.getByLabel(/^no$/i));
    this.permitNumberInput = page.getByLabel(/permit number/i);
    this.permitIssuedDateInput = page.getByRole('button', { name: /permit issued date/i });
    this.permitExpiryDateInput = page.getByRole('button', { name: /expiry date/i });
    this.permitUploadInput = page.locator('input[type="file"]');

    // Adult - contact/address
    this.addressInput = page.getByLabel(/^address/i);
    this.cityInput = page.getByLabel(/city/i);
    this.stateSelect = page.getByRole('combobox').first();
    this.zipInput = page.getByLabel(/zip/i);

    // Terms
    this.termsCheckbox = page.getByRole('checkbox', { name: /terms/i });
    this.termsLink = page.getByRole('link', { name: 'Terms & Conditions', exact: true });
  }

  async goto(pathname = '/student-information', student) {
    if (pathname === '/student-information') {
      await goToStudentInformation(this.page, student);
      return this;
    }
    return super.goto(pathname);
  }

  async expectPageLoaded() {
    await expect(this.page.getByRole('heading', { level: 1 })).toBeVisible();
  }

  async expectDobAutoFilled(expectedDob) {
    await expect(this.dobInput).toContainText(expectedDob);
  }

  async editDob(newDob) {
    if (!newDob) return false;
    const selected = await this.selectDateFromPicker(this.dobInput, newDob);
    return selected ? this : false;
  }

  async selectGender(gender) {
    const option = this.genderOptions[gender.toLowerCase()];
    if (!option) {
      throw new Error(`Unknown gender "${gender}". Valid: ${Object.keys(this.genderOptions).join(', ')}`);
    }
    await option.check();
  }

  async fillTeenPersonal({ firstName, lastName, dob, gender, phone, email } = {}) {
    if (firstName !== undefined) await this.firstNameInput.fill(firstName);
    if (lastName !== undefined) await this.lastNameInput.fill(lastName);
    if (dob !== undefined) await this.editDob(dob);
    if (gender) await this.selectGender(gender);
    if (phone !== undefined) await this.phoneInput.fill(phone);
    if (email !== undefined) await this.emailInput.fill(email);
    return this;
  }

  async fillParentGuardian({ name, phone, email } = {}) {
    if (name !== undefined) await this.parentNameInput.fill(name);
    if (phone !== undefined) await this.parentPhoneInput.fill(phone);
    if (email !== undefined) await this.parentEmailInput.fill(email);
    return this;
  }

  async fillEmergencyDetails({ name, relationship, phone } = {}) {
    if (name) await this.emergencyNameInput.fill(name);
    if (relationship) await this.emergencyRelationshipInput.fill(relationship);
    if (phone) await this.emergencyPhoneInput.fill(phone);
    return this;
  }

  async fillAdditionalTeenDetails({ medicalCondition, highSchool, glasses, referral } = {}) {
    if (medicalCondition !== undefined) {
      if (!(await this.medicalConditionInput.isVisible())) {
        await this.medicalConditionCheckbox.check();
      }
      await this.medicalConditionInput.fill(medicalCondition);
    }
    if (highSchool) await this.selectComboboxOption(this.highSchoolSelect, highSchool);
    if (glasses) await this.selectComboboxOption(this.glassesSelect, glasses);
    if (referral) await this.selectComboboxOption(this.referralSelect, referral);
    return this;
  }

  async selectComboboxOption(combobox, optionName) {
    await combobox.click();
    await this.page.getByRole('option', { name: optionName, exact: true }).click();
    return this;
  }

  async fillAdultPersonal({ firstName, lastName, gender } = {}) {
    if (firstName !== undefined) await this.firstNameInput.fill(firstName);
    if (lastName !== undefined) await this.lastNameInput.fill(lastName);
    if (gender) await this.selectGender(gender);
    return this;
  }

  async selectHasPermit(hasPermit) {
    await (hasPermit ? this.permitYesRadio : this.permitNoRadio).click();
    return this;
  }

  async fillPermitDetails({ permitNumber, issuedDate, expiryDate, filePath } = {}) {
    if (permitNumber !== undefined) await this.permitNumberInput.fill(permitNumber);
    if (issuedDate) await this.selectDateFromPicker(this.permitIssuedDateInput, issuedDate);
    if (expiryDate) await this.selectDateFromPicker(this.permitExpiryDateInput, expiryDate);
    if (filePath) await this.permitUploadInput.setInputFiles(filePath);
    return this;
  }

  async fillAdultContact({ phone, email, address, city, state, zip, referral } = {}) {
    if (phone !== undefined) await this.phoneInput.fill(phone);
    if (email !== undefined) await this.emailInput.fill(email);
    if (address !== undefined) await this.addressInput.fill(address);
    if (city) await this.cityInput.fill(city);
    if (state) {
      const stateLabel = state.toUpperCase() === 'NC' ? 'North Carolina' : state;
      await this.selectComboboxOption(this.stateSelect, stateLabel);
    }
    if (zip) await this.zipInput.fill(zip);
    if (referral) await this.selectComboboxOption(this.referralSelect, referral);
    return this;
  }

  async checkTermsAndConditions() {
    await this.termsCheckbox.check();
    return this;
  }

  async clickContinue() {
    await this.continueButton.click();
    return this;
  }

  async clickContinueAndWaitForNavigation() {
    await this.continueButton.click();
    await this.waitForLoad();
    return this;
  }

  async expectFieldValidationVisible(messageRegex) {
    await expect(this.page.getByText(messageRegex).first()).toBeVisible();
  }
}

module.exports = StudentInformationPage;
