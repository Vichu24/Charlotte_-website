require('dotenv').config();

/**
 * Central place to resolve which environment the suite is running against.
 * Add new environments here (e.g. "uat") without touching any test file.
 */
const environments = {
  staging: {
    name: 'staging',
    baseURL: process.env.STAGING_BASE_URL || 'https://charlottestaging.newagesmb.com',
  },
  production: {
    name: 'production',
    baseURL: process.env.PRODUCTION_BASE_URL || 'https://charlottedrivingacademy.com',
  },
};

const activeEnvKey = (process.env.ENV || 'staging').toLowerCase();
const activeEnv = environments[activeEnvKey];

if (!activeEnv) {
  throw new Error(
    `Unknown ENV "${activeEnvKey}". Valid environments: ${Object.keys(environments).join(', ')}`,
  );
}

function validateBaseUrl(value, envName) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid base URL for ${envName}: expected an absolute HTTP(S) URL.`);
  }

  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
    throw new Error(`Invalid base URL for ${envName}: expected an absolute HTTP(S) URL.`);
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`Invalid base URL for ${envName}: credentials, query strings, and fragments are not allowed.`);
  }
  return url.toString().replace(/\/$/, '');
}

const baseURL = validateBaseUrl(activeEnv.baseURL, activeEnv.name);

module.exports = { environments, activeEnv, baseURL, validateBaseUrl };
