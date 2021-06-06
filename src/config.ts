// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

class ConfigError extends Error {}

function required(value: string | undefined | null, name: string): string {
  if (!value) {
    const message = `The required ${name} is not set.`;
    console.error(`Error: ${message}`);
    throw new ConfigError(message);
  }

  return value;
}

/** Telegram bot token. */
export const TELEGRAM_BOT_TOKEN = required(
  process.env.TELEGRAM_BOT_TOKEN,
  'environment variable "TELEGRAM_BOT_TOKEN"',
);

/** Firebase database URL */
export const FIREBASE_DATABASE_URL = required(
  process.env.FIREBASE_DATABASE_URL,
  'environment variable "FIREBASE_DATABASE_URL"',
);

/** Firebase service account credential */
export const FIREBASE_SERVICE_ACCOUNT_CREDENTIAL = JSON.parse(
  required(
    process.env.FIREBASE_SERVICE_ACCOUNT_CREDENTIAL,
    'environment variable "FIREBASE_SERVICE_ACCOUNT_CREDENTIAL"',
  ),
);

/** Use a token to protect your URL trigger. */
export const SERVER_TOKEN = process.env.SERVER_TOKEN;

/**
 * The name of the function resource while running on Google Cloud Functions.
 */
export const CLOUD_FUNCTION_NAME = process.env.X_FUNCTION_NAME;

/**
 * The function region (example: `us-central1`) while running on Google Cloud Functions.
 */
export const CLOUD_FUNCTION_REGION = process.env.X_FUNCTION_REGION;

/**
 * The current project ID of the function while running on Google Cloud Functions.
 */
export const CLOUD_FUNCTION_PROJECT_ID = process.env.X_FUNCTION_PROJECT_ID;

/**
 * The URL trigger of the function while running on Google Cloud Functions.
 * @example "https://us-central1-proj.cloudfunctions.net/my-function"
 */
export const CLOUD_FUNCTION_TRIGGER_URL =
  (CLOUD_FUNCTION_NAME &&
    CLOUD_FUNCTION_REGION &&
    CLOUD_FUNCTION_PROJECT_ID &&
    `https://${CLOUD_FUNCTION_REGION}-${CLOUD_FUNCTION_PROJECT_ID}.cloudfunctions.net/${CLOUD_FUNCTION_NAME}`) ||
  process.env.X_FUNCTION_TRIGGER_URL;
