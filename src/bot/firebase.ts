import { Telegraf } from 'telegraf';
import { Context } from 'telegraf/typings/context';
import { Update, BotCommand } from 'telegraf/typings/core/types/typegram';
import db, { getValue } from '../firebase';
import { lines } from './utils';

export const COMMANDS: BotCommand[] = [
  {
    command: 'firebase_set_data',
    description: 'Set data in Firebase (as string)',
  },
  {
    command: 'firebase_get_data',
    description: 'Get data in Firebase',
  },
  {
    command: 'firebase_set_data_json',
    description: 'Set data in Firebase with JSON format',
  },
  {
    command: 'firebase_get_data_json',
    description: 'Get data in Firebase with JSON format',
  },
];

export function mount(bot: Telegraf<Context<Update>>): void {
  bot.command('firebase_set_data', async (ctx) => {
    try {
      const [, path, value] =
        ctx.message.text.match(
          /^\/firebase_set_data ([^ \r\n]+)[ \r\n]([\s\S]*)$/,
        ) || [];

      if (!path || value === undefined) {
        return await ctx.reply('*Usage:* `/firebase_set_data <path> <value>`', {
          parse_mode: 'MarkdownV2',
        });
      }

      await db.ref(`data/${path}`).set(value);

      await ctx.reply(
        `Data has been set, you can now use \`/firebase_get_data ${path}\` to retrieve it`,
        {
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (e) {
      console.error(e);
    }
  });

  bot.command('firebase_get_data', async (ctx) => {
    try {
      const [, path] =
        ctx.message.text.match(/^\/firebase_get_data ([^ ]+)$/) || [];

      if (!path) {
        return await ctx.reply('*Usage:* `/firebase_get_data <path>`', {
          parse_mode: 'MarkdownV2',
        });
      }

      const snapshot = await getValue(db.ref(`data/${path}`));

      await ctx.reply(snapshot.val());
    } catch (e) {
      console.error(e);
    }
  });

  bot.command('firebase_set_data_json', async (ctx) => {
    try {
      const [, path, jsonString] =
        ctx.message.text.match(
          /^\/firebase_set_data_json ([^ \r\n]+)[ \r\n]([\s\S]*)$/,
        ) || [];

      let json = NaN;
      try {
        json = JSON.parse(jsonString);
      } catch (e) {
        if (path && jsonString) {
          await ctx.reply(
            lines('```json', jsonString, '```', 'is not valid JSON'),
            {
              parse_mode: 'MarkdownV2',
            },
          );
        }
      }

      if (!path || Number.isNaN(json)) {
        return await ctx.reply(
          '*Usage:* `/firebase_set_data_json <path> <json>`',
          {
            parse_mode: 'MarkdownV2',
          },
        );
      }

      await db.ref(`data/${path}`).set(json);

      await ctx.reply(
        `Data has been set, you can now use \`/firebase_get_data_json ${path}\` to retrieve it`,
        {
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (e) {
      console.error(e);
    }
  });

  bot.command('firebase_get_data_json', async (ctx) => {
    try {
      const [, path] =
        ctx.message.text.match(/^\/firebase_get_data_json ([^ ]+)$/) || [];

      if (!path) {
        return await ctx.reply('*Usage:* `/firebase_get_data_json <path>`', {
          parse_mode: 'MarkdownV2',
        });
      }

      const snapshot = await getValue(db.ref(`data/${path}`));

      await ctx.reply(
        lines('```json', JSON.stringify(snapshot.toJSON(), null, 2), '```'),
        {
          parse_mode: 'MarkdownV2',
        },
      );
    } catch (e) {
      console.error(e);
    }
  });
}
