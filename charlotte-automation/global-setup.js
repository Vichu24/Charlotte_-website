const { request } = require('@playwright/test');
const { baseURL, activeEnv } = require('./config/environments');
const logger = require('./utils/logger');
const projectLogger = require('./utils/projectLogger');

/**
 * Runs once before the whole suite. Fails fast with a clear message
 * if the target environment is down, instead of letting every test
 * time out individually.
 */
module.exports = async () => {
  projectLogger.initializeLogs({ rotate: true });
  logger.info(`Running suite against [${activeEnv.name}] -> ${baseURL}`);

  const context = await request.newContext();
  const startedAt = Date.now();
  projectLogger.writeApi({
    event: 'request',
    method: 'GET',
    url: projectLogger.safeUrl(baseURL),
    source: 'global_setup',
  });
  try {
    const response = await context.get(baseURL, { timeout: 15_000 });
    projectLogger.writeApi({
      event: 'response',
      method: 'GET',
      url: projectLogger.safeUrl(baseURL),
      status: response.status(),
      durationMs: Date.now() - startedAt,
      source: 'global_setup',
    });
    projectLogger.writePerformance({
      event: 'response',
      method: 'GET',
      url: projectLogger.safeUrl(baseURL),
      resourceType: 'document',
      status: response.status(),
      durationMs: Date.now() - startedAt,
      source: 'global_setup',
    });
    if (!response.ok()) {
      projectLogger.writeError({
        type: 'http_response',
        url: projectLogger.safeUrl(baseURL),
        status: response.status(),
        source: 'global_setup',
      });
      throw new Error(`Base URL returned HTTP ${response.status()}.`);
    }
  } catch (err) {
    logger.error(`Could not reach ${baseURL} before starting tests: ${err.message}`);
    projectLogger.writeError({
      type: 'global_setup_request_failed',
      url: projectLogger.safeUrl(baseURL),
      error: err.message,
    });
    throw err;
  } finally {
    await context.dispose();
  }
};
