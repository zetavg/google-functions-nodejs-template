import { Markup, Telegraf } from 'telegraf';
import { Context } from 'telegraf/typings/context';
import { Update, BotCommand } from 'telegraf/typings/core/types/typegram';
import {
  assertCbQueryMessageValidity,
  CbQueryMessageInvalidError,
  delay,
  getCbQueryJsonData,
  lines,
} from './utils';

export const COMMANDS: BotCommand[] = [
  {
    command: 'rock_paper_scissors',
    description: 'Play rock paper scissors',
  },
];

export function mount(bot: Telegraf<Context<Update>>): void {
  bot.on('callback_query', async (ctx) => {
    try {
      const data = getCbQueryJsonData(ctx);
      if (data?.type !== 'rock_paper_scissors') return;

      if (data.payload === 'again') {
        ctx.answerCbQuery();
        rockPaperScissors(ctx);
        return;
      }

      assertCbQueryMessageValidity(ctx, 'Game no longer valids');
      const { message } = ctx.callbackQuery;

      const options = ['✊', '✋', '✌'];
      const myOption = Math.floor(Math.random() * 3);
      const mine = options[myOption];
      const yours = data.payload;
      if (typeof yours !== 'string') throw new Error();
      let yourOption = options.indexOf(yours);
      let result;

      if (myOption > yourOption) yourOption += 3;

      if (myOption === yourOption) {
        result = 'Even';
      } else if (yourOption - myOption === 1) {
        result = 'You won';
      } else {
        result = 'I won';
      }

      await ctx.telegram.editMessageText(
        message.chat.id,
        message.message_id,
        undefined,
        lines(`${message.text.split('\n')[0]}`, `Me → ${mine} ${yours} ← You`),
        Markup.inlineKeyboard([
          [
            {
              text: '...',
              callback_data: JSON.stringify({
                type: '...',
              }),
            },
          ],
        ]),
      );

      await delay(1000);

      await Promise.all([
        ctx.reply(`${result}!`, {
          reply_to_message_id: message.message_id,
          allow_sending_without_reply: true,
          ...Markup.inlineKeyboard([
            [
              {
                text: 'Play again',
                callback_data: JSON.stringify({
                  type: 'rock_paper_scissors',
                  payload: 'again',
                }),
              },
            ],
          ]),
        }),
        ctx.telegram.editMessageReplyMarkup(
          message.chat.id,
          message.message_id,
          undefined,
          undefined,
        ),
        ctx.answerCbQuery(),
      ]);
    } catch (e) {
      if (e instanceof CbQueryMessageInvalidError) return;

      console.error(e);
      ctx.answerCbQuery('Error');
    }
  });

  function rockPaperScissors(ctx: Context<Update>) {
    ctx.reply(lines('Rock, paper, scissors...', 'Me → ✊ ✊ ← You'), {
      reply_to_message_id: ctx.message?.message_id,
      allow_sending_without_reply: true,
      ...Markup.inlineKeyboard([
        [
          {
            text: '✊',
            callback_data: JSON.stringify({
              type: 'rock_paper_scissors',
              payload: '✊',
            }),
          },
          {
            text: '✋',
            callback_data: JSON.stringify({
              type: 'rock_paper_scissors',
              payload: '✋',
            }),
          },
          {
            text: '✌',
            callback_data: JSON.stringify({
              type: 'rock_paper_scissors',
              payload: '✌',
            }),
          },
        ],
      ]),
    });
  }

  bot.command('rock_paper_scissors', rockPaperScissors);
}
