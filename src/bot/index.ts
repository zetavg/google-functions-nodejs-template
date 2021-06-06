import { Telegraf, Markup } from 'telegraf';
import { BotCommand } from 'telegraf/typings/core/types/typegram';

import { TELEGRAM_BOT_TOKEN } from '../config';

import { lines, patchBotToSupportMutipleEventHandlers } from './utils';

import { COMMANDS as COUNTER_COMMANDS, mount as mountCounter } from './counter';
import {
  COMMANDS as RPS_COMMANDS,
  mount as mountRps,
} from './rock-paper-scissors';

const COMMANDS: BotCommand[] = [
  {
    command: 'start',
    description: 'Init the bot',
  },
  ...COUNTER_COMMANDS,
  ...RPS_COMMANDS,
  {
    command: 'help',
    description: 'Show help message',
  },
];

const COMMANDS_DESCRIPTION = COMMANDS.map(
  ({ command, description }) => `/${command} - ${description}`,
).join('\n');

const MAIN_KEYBOARD = Markup.keyboard([
  ['/start'],
  ['/counter', '/rock_paper_scissors'],
  ['/help'],
]);

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);
patchBotToSupportMutipleEventHandlers(bot);

bot.telegram.setMyCommands(COMMANDS);

bot.start((ctx) =>
  ctx.reply('Welcome. Send /help for avaliable commands.', MAIN_KEYBOARD),
);

bot.help(async (ctx) => {
  await ctx.reply(
    `<strong>Avaliable commands</strong>:\n${COMMANDS_DESCRIPTION}`,
    {
      parse_mode: 'HTML', // See: https://core.telegram.org/bots/api#formatting-options
    },
  );
  await ctx.reply(
    lines(
      'Or, you can also do the following:',
      ' - Send me a sticker',
      ' - Say "hi"',
    ),
    { disable_notification: true },
  );
});

bot.on('sticker', (ctx) => ctx.reply('👍'));

bot.hears(/[Hh]i/, (ctx) => ctx.reply('Hey there'));

mountCounter(bot);
mountRps(bot);

export default bot;
