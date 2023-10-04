import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Events, Names, Wishes } from '../database_mongoDB/Entity/_tableEntity';
import { sendMessageUser } from './_db_functions';
import { initial } from '../models/_SessionData';

export const settingsAnnouncements_Input = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  ctx.session.botOnType = 31;
  await ctx.reply(
    `Write down the bot announcement msg. It wll broadcast to everyone using the bot.
	  `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};
export const settingsAnnouncements_Output = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const announcement = (await ctx.message.text) || '';
  const allNames = Database.getMongoRepository(Names).find();
  const sendUsers = (await allNames)
    .map((n) => n.teleUser)
    .filter((n) => n != '');

  await Promise.all(
    sendUsers.map(async (n) => {
      //   await sendMessageUser(n, announcement, ctx);
      await ctx.reply(n + '\n' + announcement);
    })
  );

  await ctx.reply(`Reminder sent!`);

  ctx.session = await initial();
};
