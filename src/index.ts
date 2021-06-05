import { HttpFunction } from '@google-cloud/functions-framework/build/src/functions';
import fetch from 'node-fetch';

import {
  SERVER_TOKEN,
  TELEGRAM_BOT_TOKEN,
  CLOUD_FUNCTION_TRIGGER_URL,
} from './config';
import bot from './bot';

export const entry: HttpFunction = async (req, res) => {
  const { token } = req.query;
  if (SERVER_TOKEN && token !== SERVER_TOKEN) {
    console.warn(
      `Invalid access with fallacious server token "?token=${token}" from ${
        req.ip
      } (${req.ips.join(', ')}).`,
    );
    res.status(401).send();
    return;
  }

  try {
    await bot.handleUpdate(req.body, res);
  } catch (e) {
    console.error(e);
  }

  res.status(200).send();
};

// Support some common Google Cloud Functions entry points
export const index = entry;
export const helloWorld = entry;

// Set Telegram bot webhook
(async () => {
  function getWebhookUrl(includeRealTokens = true) {
    const baseUrl = CLOUD_FUNCTION_TRIGGER_URL || '<your-function-url>';

    if (SERVER_TOKEN) {
      const serverToken = includeRealTokens
        ? SERVER_TOKEN
        : '<your-server-token>';
      return `${baseUrl}?token=${serverToken}`;
    }

    return baseUrl;
  }

  function getTelegramSetWebhookUrl(includeRealTokens = true) {
    const telegramBotToken = includeRealTokens
      ? TELEGRAM_BOT_TOKEN
      : '<your-telegram-bot-token>';
    const url = `https://api.telegram.org/bot${telegramBotToken}/setWebhook?url=${encodeURIComponent(
      getWebhookUrl(includeRealTokens),
    )}`;

    if (!includeRealTokens) {
      return url.replace('%3Cyour-server-token%3E', '<your-server-token>');
    }

    return url;
  }

  if (CLOUD_FUNCTION_TRIGGER_URL) {
    try {
      const setWebhookResponse = await fetch(getTelegramSetWebhookUrl(true));
      const setWebhookResponseJson = await setWebhookResponse.json();
      if (setWebhookResponseJson.ok) {
        console.warn(
          `Telegram bot webhook has been automatically set to "${getWebhookUrl(
            false,
          )} by calling ${getTelegramSetWebhookUrl(false)}".`,
        );

        return;
      } else {
        throw new Error(setWebhookResponseJson.description);
      }
    } catch (e) {
      console.error(
        `Telegram webhook setting error: ${e.message || 'unknown error'}.`,
      );
    }
  }

  console.warn(
    `Cannot automatically set Telegram bot webhook, please run \`curl '${getTelegramSetWebhookUrl(
      false,
    )}'\` manually to set the webhook for your bot.`,
  );
})();
