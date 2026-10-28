const fs = require('fs');
const path = require('path');

const logsDirectory = path.join(__dirname, '..', 'logs');
const logFiles = {
  api: path.join(logsDirectory, 'api.log'),
  performance: path.join(logsDirectory, 'performance.log'),
  error: path.join(logsDirectory, 'error.log'),
};
const MAX_LOG_BYTES = 5 * 1024 * 1024;
const streams = {};
let initialized = false;

function rotateLog(filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size < MAX_LOG_BYTES) return;

  const backupPath = filePath.replace(/\.log$/, '.1.log');
  if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath);
  fs.renameSync(filePath, backupPath);
}

function initializeLogs({ rotate = false } = {}) {
  if (initialized) return;

  fs.mkdirSync(logsDirectory, { recursive: true });
  for (const [type, filePath] of Object.entries(logFiles)) {
    if (rotate) rotateLog(filePath);
    streams[type] = fs.createWriteStream(filePath, { flags: 'a' });
    streams[type].on('error', (error) => {
      process.stderr.write(`Unable to write ${type} project log: ${error.message}\n`);
    });
  }
  initialized = true;
}

function sanitizeValue(value) {
  if (typeof value === 'string') return sanitizeText(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /password|token|authorization|email|phone|card|cvv|secret/i.test(key)
          ? '[REDACTED]'
          : sanitizeValue(item),
      ]),
    );
  }
  return value;
}

function writeLog(type, entry) {
  initializeLogs();
  const record = {
    timestamp: new Date().toISOString(),
    ...sanitizeValue(entry),
  };
  streams[type].write(`${JSON.stringify(record)}\n`);
}

function safeUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    return `${url.protocol}//${url.host}`;
  }
  url.search = '';
  url.hash = '';
  url.username = '';
  url.password = '';
  return url.toString();
}

function sanitizeText(value) {
  return String(value)
    .replace(/https?:\/\/[^\s"'<>]+/g, safeUrl)
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(
      /\b(?:password|token|authorization|email|phone|card(?:number)?|cvv|secret)\b(["']?\s*[:=]\s*["']?)(?:Bearer\s+)?[^,\s"'&]+/gi,
      '$1[REDACTED]',
    )
    .replace(/\b(?:\+?1[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[REDACTED_PHONE]')
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_NUMBER]');
}

module.exports = {
  initializeLogs,
  writeApi: (entry) => writeLog('api', entry),
  writePerformance: (entry) => writeLog('performance', entry),
  writeError: (entry) => writeLog('error', entry),
  safeUrl,
  sanitizeText,
};
