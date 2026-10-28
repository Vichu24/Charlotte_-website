const { randomInt, randomUUID } = require('crypto');

/**
 * Grab-bag of small, framework-agnostic helpers used by page objects and tests.
 * Keep this file free of Playwright-page-specific logic; that belongs in BasePage.
 */

/**
 * Returns a date string in MM/DD/YYYY, matching the site's DOB input format.
 * @param {number} age - desired age in whole years
 */
function dobForAge(age) {
  const today = new Date();
  const year = today.getFullYear() - age;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
}

/** Today's date formatted MM/DD/YYYY */
function todayFormatted() {
  return dobForAge(0);
}

/** Random 10-digit US-style phone number as a string */
function randomPhoneNumber() {
  return `704${randomInt(1_000_000, 10_000_000)}`;
}

/** Generates a unique, throwaway email for form-submission tests */
function uniqueTestEmail(prefix = 'qa.automation') {
  return `${prefix}+${randomUUID()}@example.com`;
}

/** Basic string title-case, useful for asserting nav/heading text loosely */
function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Strips whitespace/newlines so DOM text comparisons are resilient to formatting */
function normalizeText(str = '') {
  return str.replace(/\s+/g, ' ').trim();
}

async function retry(fn, { attempts = 3, delayMs = 1000 } = {}) {
  let lastError;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }
  }
  throw lastError;
}

module.exports = {
  dobForAge,
  todayFormatted,
  randomPhoneNumber,
  uniqueTestEmail,
  titleCase,
  normalizeText,
  retry,
};
