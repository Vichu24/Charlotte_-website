const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const logger = require('./logger');

/**
 * Reads and parses a JSON test-data file from the /testdata directory.
 * @param {string} fileName e.g. "users.json"
 */
function readJSON(fileName) {
  const filePath = path.join(__dirname, '..', 'testdata', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Reads a local CSV export from /testdata (e.g. a manually exported copy
 * of the QA test-case sheet) and returns an array of row objects keyed
 * by the header row.
 */
function readCSV(fileName) {
  const filePath = path.join(__dirname, '..', 'testdata', fileName);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

/**
 * Pulls test-case rows directly from a published Google Sheet, via its
 * CSV export endpoint. Only works once the sheet's sharing is set to
 * "Anyone with the link can view" (or published to the web).
 *
 * Usage:
 *   const cases = await readGoogleSheetCSV({
 *     sheetId: '1C6Dim1sJpuRwPIiQfYKCXo5xOX59z9hNP0nYqEheGEE',
 *     gid: '0',
 *   });
 *
 * @param {{sheetId: string, gid?: string}} opts
 * @returns {Promise<Array<Object>>}
 */
async function readGoogleSheetCSV({ sheetId, gid = '0' }) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Sheet fetch failed with status ${response.status}. Is it shared publicly?`);
    }
    const csvText = await response.text();
    return parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  } catch (err) {
    logger.error(`Unable to read Google Sheet test data: ${err.message}`);
    throw err;
  }
}

/**
 * Filters an array of test-case rows (as returned by readCSV / readGoogleSheetCSV)
 * down to only the ones flagged for execution, e.g. { Automate: "Yes" }.
 */
function filterExecutable(rows, { flagColumn = 'Automate', flagValue = 'Yes' } = {}) {
  return rows.filter((row) => (row[flagColumn] || '').trim().toLowerCase() === flagValue.toLowerCase());
}

module.exports = { readJSON, readCSV, readGoogleSheetCSV, filterExecutable };
