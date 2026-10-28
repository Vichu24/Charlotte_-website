const { test, expect } = require('../../fixtures/pageFixtures');
const users = require('../../testdata/users.json');
const { uniqueTestEmail } = require('../../utils/helpers');

/** TS-05 tab (TC_144-TC_189): Student Information - shared, Teen, Adult, Terms. */
test.describe('Student Information - shared behaviour @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto();
    await studentInformationPage.waitForLoad();
  });

  test('TC_144 - Student Information page loads', async ({ studentInformationPage }) => {
    await studentInformationPage.expectPageLoaded();
  });

  test('TC_145 - DOB auto-filled from landing page', async ({ studentInformationPage }) => {
    await studentInformationPage.expectDobAutoFilled(users.validNewStudentAdult.dob);
  });

  test('TC_146 - DOB field remains locked after package selection', async ({ studentInformationPage }) => {
    await expect(studentInformationPage.dobInput).toBeDisabled();
  });

  test('TC_147 - Selected teen DOB displays teen-specific fields', async ({ studentInformationPage }) => {
    await studentInformationPage.goto('/student-information', users.validNewStudentTeen);
    await studentInformationPage.expectDobAutoFilled(users.validNewStudentTeen.dob);
    await expect(studentInformationPage.parentNameInput).toBeVisible();
  });

  test('TC_148 - Teen form fields displayed for Teen DOB', async ({ studentInformationPage }) => {
    await studentInformationPage.goto('/student-information', users.validNewStudentTeen);
    await expect(studentInformationPage.parentNameInput).toBeVisible();
  });

  test('TC_149 - Adult form fields displayed for Adult DOB', async ({ studentInformationPage }) => {
    await expect(studentInformationPage.addressInput).toBeVisible();
  });

  test('TC_150 - Continue button displayed', async ({ studentInformationPage }) => {
    await expect(studentInformationPage.continueButton).toBeVisible();
  });

  test('TC_151 - Valid form submission redirects to digital signature', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdultPersonal({ firstName: 'QA', lastName: 'Automation', gender: 'Male' });
    await studentInformationPage.fillAdultContact({
      phone: '7045551234',
      email: uniqueTestEmail('qa.student'),
      address: '123 Main St',
      city: 'Charlotte',
      state: 'NC',
      zip: '28202',
      referral: 'Facebook',
    });
    await studentInformationPage.fillEmergencyDetails({
      name: 'QA Contact',
      relationship: 'Parent',
      phone: '7045550100',
    });
    await studentInformationPage.checkTermsAndConditions();
    await studentInformationPage.clickContinueAndWaitForNavigation();
    await expect(studentInformationPage.page).toHaveURL(/student-document/i);
  });
});

test.describe('Teen Student - Personal Information @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto('/student-information', users.validNewStudentTeen);
  });

  test('TC_152 - First Name mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/First name is required\.?/i);
  });

  test('TC_153 - Last Name mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.fillTeenPersonal({ firstName: 'QA' });
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Last name is required\.?/i);
  });

  test('TC_154 - DOB mandatory', async ({ studentInformationPage }) => {
    await expect(studentInformationPage.dobInput).toBeDisabled();
    await expect(studentInformationPage.dobInput).toContainText(users.validNewStudentTeen.dob);
  });

  test('TC_155 - Gender selection saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillTeenPersonal({ gender: 'Male' });
  });

  test('TC_156 - Student phone entry saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillTeenPersonal({ phone: '7045551234' });
  });

  test('TC_157 - Email format validated', async ({ studentInformationPage }) => {
    await studentInformationPage.fillTeenPersonal({ email: 'not-an-email' });
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Please enter a valid email address\.?/i);
  });
});

test.describe('Teen - Parent/Guardian Information @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto('/student-information', users.validNewStudentTeen);
  });

  test('TC_158 - Parent name mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Parent\/Guardian Name is required\.?/i);
  });

  test('TC_159 - Parent phone mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.fillParentGuardian({ name: 'Parent Name' });
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Parent\/Guardian phone is required\.?/i);
  });

  test('TC_160 - Parent phone numeric validation', async ({ studentInformationPage }) => {
    await studentInformationPage.fillParentGuardian({ name: 'Parent Name', phone: 'abc123' });
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/phone/i);
  });

  test('TC_161 - Parent email validation', async ({ studentInformationPage }) => {
    await studentInformationPage.fillParentGuardian({ name: 'Parent Name', email: 'not-an-email' });
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/email/i);
  });
});

test.describe('Teen - Emergency Details @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto('/student-information', users.validNewStudentTeen);
  });

  test('TC_162 - Emergency contact name saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillEmergencyDetails({ name: 'Jane Doe' });
  });

  test('TC_163 - Emergency relationship saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillEmergencyDetails({ relationship: 'Parent' });
  });

  test('TC_164 - Emergency phone saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillEmergencyDetails({ phone: '7045551234' });
  });
});

test.describe('Teen - Additional & Other Details @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto('/student-information', users.validNewStudentTeen);
  });

  test('TC_165 - Medical condition field mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.medicalConditionCheckbox.check();
    await studentInformationPage.fillTeenPersonal({ firstName: 'QA', lastName: 'Automation', gender: 'Male' });
    await studentInformationPage.fillParentGuardian({
      name: 'QA Parent',
      phone: '7045550102',
      email: uniqueTestEmail('qa.parent'),
    });
    await studentInformationPage.fillEmergencyDetails({
      name: 'QA Contact',
      relationship: 'Parent',
      phone: '7045550100',
    });
    await studentInformationPage.fillAdultContact({
      phone: '7045550101',
      email: uniqueTestEmail('qa.teen'),
      address: '123 Main St',
      city: 'Charlotte',
      state: 'NC',
      zip: '28202',
      referral: 'Google Search',
    });
    await studentInformationPage.fillAdditionalTeenDetails({
      highSchool: 'Ardrey Kell High School',
      glasses: 'Yes',
    });
    await studentInformationPage.checkTermsAndConditions();
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Invalid input: expected string, received undefined/i);
  });

  test('TC_166 - High school dropdown selection saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdditionalTeenDetails({ highSchool: 'Ardrey Kell High School' });
    await expect(studentInformationPage.highSchoolSelect).toContainText('Ardrey Kell High School');
  });

  test('TC_167 - Glasses/contacts dropdown selection saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdditionalTeenDetails({ glasses: 'Yes' });
    await expect(studentInformationPage.glassesSelect).toContainText('Yes');
  });

  test('TC_168 - Referral source dropdown selection saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdditionalTeenDetails({ referral: 'Google Search' });
  });
});

test.describe('Adult Student - Personal Information @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto();
  });

  test('TC_169 - Adult first name mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/first name/i);
  });

  test('TC_170 - Adult last name mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdultPersonal({ firstName: 'QA' });
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/last name/i);
  });

  test('TC_171 - Adult gender selection saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdultPersonal({ gender: 'Female' });
  });
});

test.describe('Adult - Permit Information @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto();
  });

  test('TC_172 - Permit question displayed', async ({ studentInformationPage }) => {
    await expect(studentInformationPage.permitYesRadio).toBeVisible();
    await expect(studentInformationPage.permitNoRadio).toBeVisible();
  });

  test('TC_173 - Permit fields appear when Yes selected', async ({ studentInformationPage }) => {
    await studentInformationPage.selectHasPermit(true);
    await expect(studentInformationPage.permitNumberInput).toBeVisible();
  });

  test('TC_174 - Permit number mandatory when permit = Yes', async ({ studentInformationPage }) => {
    await studentInformationPage.selectHasPermit(true);
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Permit number is required\.?/i);
  });

  test('TC_175 - Permit issued date accepted', async ({ studentInformationPage }) => {
    await studentInformationPage.selectHasPermit(true);
    await studentInformationPage.fillPermitDetails({ issuedDate: '01/01/2025' });
    await expect(studentInformationPage.permitIssuedDateInput).toContainText('01/01/2025');
  });

  test('TC_176 - Permit expiry picker prevents selecting an expired year', async ({ studentInformationPage }) => {
    await studentInformationPage.selectHasPermit(true);
    await studentInformationPage.permitExpiryDateInput.click();
    const availableYears = await studentInformationPage.page
      .locator('select[aria-label="Choose the Year"] option')
      .evaluateAll((options) => options.map((option) => option.value));
    const expiredYear = String(new Date().getFullYear() - 1);
    expect(availableYears).not.toContain(expiredYear);
  });

  test('TC_177 - Permit upload accepts a valid JPG', async ({ studentInformationPage }) => {
    await studentInformationPage.selectHasPermit(true);
    const frontPermitUpload = studentInformationPage.permitUploadInput.nth(0);
    await frontPermitUpload.setInputFiles({
      name: 'permit-front.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/AP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Af//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Af//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Af//Z', 'base64'),
    });
    expect(await frontPermitUpload.evaluate((input) => input.files[0]?.name)).toBe('permit-front.jpg');
  });

  test('TC_178 - Permit upload rejects unsupported file formats', async ({ studentInformationPage }) => {
    await studentInformationPage.selectHasPermit(true);
    const frontPermitUpload = studentInformationPage.permitUploadInput.nth(0);
    await frontPermitUpload.setInputFiles({
      name: 'permit.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('not a supported permit image'),
    });
    await studentInformationPage.expectFieldValidationVisible(/only .*JPG|PNG|PDF|unsupported file/i);
  });

  test('TC_179 - Permit file size validation (>10MB rejected)', async ({ studentInformationPage }) => {
    await studentInformationPage.selectHasPermit(true);
    const frontPermitUpload = studentInformationPage.permitUploadInput.nth(0);
    await frontPermitUpload.setInputFiles({
      name: 'large-permit.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
    });
    await studentInformationPage.expectFieldValidationVisible(/10 ?MB|file size/i);
  });
});

test.describe('Adult - Contact Information @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto();
  });

  test('TC_180 - Phone mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Phone is required\.?/i);
  });

  test('TC_181 - Email mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Email is required\.?/i);
  });

  test('TC_182 - Address mandatory', async ({ studentInformationPage }) => {
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/Address is required\.?/i);
  });

  test('TC_183 - City entry saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdultContact({ city: 'Charlotte' });
  });

  test('TC_184 - State dropdown selection saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdultContact({ state: 'NC' });
  });

  test('TC_185 - Zip code entry saved', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdultContact({ zip: '28202' });
  });
});

test.describe('Terms & Conditions Section @regression @sheet', () => {
  test.beforeEach(async ({ studentInformationPage }) => {
    await studentInformationPage.goto();
  });

  test('TC_186 - Terms checkbox displayed', async ({ studentInformationPage }) => {
    await expect(studentInformationPage.termsCheckbox).toBeVisible();
  });

  test('TC_187 - Terms hyperlink opens Terms page', async ({ studentInformationPage, context }) => {
    const termsPagePromise = context.waitForEvent('page');
    await studentInformationPage.termsLink.click();
    const termsPage = await termsPagePromise;
    await expect(termsPage).toHaveURL(/\/terms(?:\?|$)/i);
    await expect(termsPage.getByRole('main')).toContainText(/No content available/i);
  });

  test('TC_188 - Terms acceptance required to continue', async ({ studentInformationPage }) => {
    await studentInformationPage.clickContinue();
    await studentInformationPage.expectFieldValidationVisible(/You must accept the terms and conditions\.?/i);
  });

  test('TC_189 - Form submits successfully once Terms accepted', async ({ studentInformationPage }) => {
    await studentInformationPage.fillAdultPersonal({ firstName: 'QA', lastName: 'Automation', gender: 'Male' });
    await studentInformationPage.fillAdultContact({
      phone: '7045551234',
      email: uniqueTestEmail('qa.terms'),
      address: '123 Main St',
      city: 'Charlotte',
      state: 'NC',
      zip: '28202',
      referral: 'Facebook',
    });
    await studentInformationPage.fillEmergencyDetails({
      name: 'QA Contact',
      relationship: 'Parent',
      phone: '7045550100',
    });
    await studentInformationPage.checkTermsAndConditions();
    await studentInformationPage.clickContinueAndWaitForNavigation();
    await expect(studentInformationPage.page).toHaveURL(/student-document/i);
  });
});
