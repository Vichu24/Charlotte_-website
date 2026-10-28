const { test } = require('node:test');
const assert = require('node:assert/strict');
const projectLogger = require('../utils/projectLogger');
const { randomPhoneNumber, uniqueTestEmail } = require('../utils/helpers');
const { validateBaseUrl } = require('../config/environments');

test('parallel test data generators return distinct values', () => {
  assert.notEqual(uniqueTestEmail(), uniqueTestEmail());
  assert.match(randomPhoneNumber(), /^704\d{7}$/);
});

test('safeUrl omits credentials, query strings, and fragments', () => {
  assert.equal(
    projectLogger.safeUrl('https://user:password@example.com/path?token=secret#section'),
    'https://example.com/path',
  );
});

test('sanitizeText redacts email addresses and credential-like values', () => {
  const result = projectLogger.sanitizeText(
    'email=driver@example.com contact driver@example.com token=secret phone=7045551234 contact 704-555-1234 authorization=Bearer private-value card=4111111111111111',
  );

  assert.doesNotMatch(result, /driver@example\.com|secret|7045551234|704-555-1234|private-value|4111111111111111/);
  assert.match(result, /\[REDACTED\]/);
  assert.match(result, /\[REDACTED_EMAIL\]/);
  assert.match(result, /\[REDACTED_PHONE\]/);
});

test('base URLs require HTTP(S) and disallow credentials or query values', () => {
  assert.equal(validateBaseUrl('https://example.com/', 'test'), 'https://example.com');
  assert.throws(() => validateBaseUrl('javascript:alert(1)', 'test'), /absolute HTTP\(S\) URL/);
  assert.throws(() => validateBaseUrl('https://user:pass@example.com', 'test'), /credentials/);
  assert.throws(() => validateBaseUrl('https://example.com?token=secret', 'test'), /query strings/);
});
