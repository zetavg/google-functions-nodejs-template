import { Markup, Telegraf } from 'telegraf';
import { Context } from 'telegraf/typings/context';
import { Update, BotCommand } from 'telegraf/typings/core/types/typegram';
import {
  assertCbQueryMessageValidity,
  CbQueryMessageInvalidError,
  getCbQueryJsonData,
  getHiddenPayload,
  getMessageText,
  getReplyToMessage,
  hiddenPayload,
  withHiddenPayload,
} from './utils';

export const COMMANDS: BotCommand[] = [
  {
    command: 'counter',
    description: 'Show a counter',
  },
];

const COUNTER_INLINE_KEYBOARD = Markup.inlineKeyboard([
  [
    {
      text: '➖',
      callback_data: JSON.stringify({
        type: 'counter',
        payload: '➖',
      }),
    },
    {
      text: 'Set',
      callback_data: JSON.stringify({
        type: 'counter',
        payload: 'set',
      }),
    },
    {
      text: '➕',
      callback_data: JSON.stringify({
        type: 'counter',
        payload: '➕',
      }),
    },
  ],
]);

export function mount(bot: Telegraf<Context<Update>>): void {
  bot.on('callback_query', async (ctx) => {
    try {
      const data = getCbQueryJsonData(ctx);
      if (data?.type !== 'counter') return;

      assertCbQueryMessageValidity(ctx);
      const { message } = ctx.callbackQuery;

      if (data.payload === 'set') {
        ctx.reply(withHiddenPayload('What number do you want to set to?'), {
          reply_to_message_id: message.message_id,
          ...hiddenPayload({
            type: 'counter',
            action: 'set',
            message_id: message.message_id,
            chat_id: message.chat.id,
          }),
          ...Markup.forceReply(),
        });
        return;
      }

      let messageNumber = parseInt(message.text, 10);

      if (data.payload === '➕') {
        messageNumber += 1;
      } else if (data.payload === '➖') {
        messageNumber -= 1;
      }

      if (Number.isNaN(messageNumber)) messageNumber = 0;

      await Promise.all([
        ctx.telegram.editMessageText(
          message.chat.id,
          message.message_id,
          undefined,
          messageNumber.toString(),
          COUNTER_INLINE_KEYBOARD,
        ),
        ctx.answerCbQuery(),
      ]);
    } catch (e) {
      if (e instanceof CbQueryMessageInvalidError) return;

      console.error(e);
      ctx.answerCbQuery('Error');
    }
  });

  bot.on('message', async (ctx) => {
    try {
      const replayToMessage = getReplyToMessage(ctx.message);
      if (!replayToMessage) return;

      const hiddenPayload = getHiddenPayload(replayToMessage);
      if (!hiddenPayload) return;

      if (hiddenPayload.type !== 'counter') return;

      switch (hiddenPayload.action) {
        case 'set': {
          const newValue = parseInt(getMessageText(ctx.message) || '', 10);

          if (Number.isNaN(newValue)) {
            ctx.reply('Invalid number');
            return;
          }

          await Promise.all([
            ctx.telegram.editMessageText(
              hiddenPayload.chat_id as string,
              hiddenPayload.message_id as number,
              undefined,
              newValue.toString(),
              COUNTER_INLINE_KEYBOARD,
            ),
            ctx.reply(`Counter has been set to ${newValue.toString()}`, {
              reply_to_message_id: hiddenPayload.message_id as number,
            }),
          ]);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
  });

  bot.command('counter', (ctx) => ctx.reply('0', COUNTER_INLINE_KEYBOARD));
}
