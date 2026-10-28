const HomePage = require('../pages/HomePage');
const users = require('../testdata/users.json');
const { randomPhoneNumber, uniqueTestEmail } = require('./helpers');

async function goToUpcomingClasses(page, student = users.validNewStudentAdult) {
  const homePage = new HomePage(page);
  await homePage.open();
  await homePage.startPackageSelection(student);
  const enrollButton = page.getByRole('button', { name: /Enroll Now/i }).first();
  const packageText = await enrollButton.locator('xpath=../..').innerText();
  const packageName = packageText.split('\n')[0].trim();
  await enrollButton.click();
  await page.waitForURL(/\/upcoming-classes(?:\?|$)/);
  await page.getByRole('button', { name: /Continue.*choose later/i }).waitFor();
  return packageName;
}

async function goToStudentInformation(page, student = users.validNewStudentAdult) {
  const packageName = await goToUpcomingClasses(page, student);
  await page.getByRole('button', { name: /Continue.*choose later/i }).click();
  await page.waitForURL(/\/student-information(?:\?|$)/);
  await page.getByLabel(/first name/i).waitFor();
  return packageName;
}

async function fillRequiredStudentInformation(page, student = users.validNewStudentAdult) {
  const packageName = await goToStudentInformation(page, student);
  await page.locator('#first_name').fill('QA');
  await page.locator('#last_name').fill('Automation');
  await page.getByRole('radio', { name: /^male$/i }).click();

  const isTeen = new Date().getFullYear() - Number(student.dob.slice(-4)) < 18;
  if (isTeen) {
    await page.getByLabel(/parent.*name/i).fill('QA Parent');
    await page.getByLabel(/parent.*cell/i).fill('7045550102');
    await page.getByLabel(/parent.*email/i).fill(uniqueTestEmail('qa.parent'));
    await page.locator('select[aria-hidden="true"]').nth(1).selectOption({ index: 1 });
    await page.locator('select[aria-hidden="true"]').nth(2).selectOption({ index: 1 });
  }

  await page.locator('#emergency_contact_name').fill('QA Contact');
  await page.locator('#emergency_contact_relationship').fill('Parent');
  await page.locator('#emergency_contact_phone').fill('7045550100');
  await page.locator('#phone').fill(randomPhoneNumber());
  await page.locator('#email').fill(uniqueTestEmail('qa.student'));
  await page.locator('#address').fill('123 Main St');
  await page.locator('#city').fill('Charlotte');
  await page.locator('select[aria-hidden="true"]').first().selectOption('33');
  await page.locator('#zip_code').fill('28202');
  await page.locator('select[aria-hidden="true"]').last().selectOption('1');
  await page.getByRole('checkbox', { name: /I've read and agree/i }).check();
  await page.getByRole('button', { name: /^Continue$/i }).click();
  await page.waitForURL(/\/student-document(?:\?|$)/);
  return packageName;
}

async function drawStudentSignature(page) {
  await page.getByRole('button', { name: /Sign Now/i }).click();
  const dialog = page.getByRole('dialog');
  const canvas = dialog.locator('canvas');
  await canvas.waitFor();
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('The digital signature canvas is not visible.');

  await page.mouse.move(bounds.x + 30, bounds.y + 40);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 150, bounds.y + 55, { steps: 8 });
  await page.mouse.move(bounds.x + 240, bounds.y + 35, { steps: 8 });
  await page.mouse.up();
  await dialog.getByRole('button', { name: 'Submit', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
}

async function signStudentDocument(page) {
  await drawStudentSignature(page);
  await page.locator('#terms').check();
  await page.getByRole('button', { name: 'Submit', exact: true }).click();
  await page.getByRole('button', { name: /Pay Now/i }).waitFor();
}

async function goToStudentDocument(page, student = users.validNewStudentAdult) {
  return fillRequiredStudentInformation(page, student);
}

async function goToPayment(page, student = users.validNewStudentAdult) {
  const packageName = await goToStudentDocument(page, student);
  await signStudentDocument(page);
  await page.getByRole('button', { name: /Pay Now/i }).click();
  await page.waitForURL(/\/payment(?:\?|$)/);
  return packageName;
}

module.exports = {
  goToUpcomingClasses,
  goToStudentInformation,
  goToStudentDocument,
  goToPayment,
  drawStudentSignature,
  signStudentDocument,
};
