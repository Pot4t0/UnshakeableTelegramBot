import { Bot, CallbackQueryContext, Filter } from 'grammy';
import { BotContext } from '../../app/_index';
import { Database } from '../../database_mongoDB/_db-init';
import { Names } from '../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../models/_SessionData';
import { dbMessaging } from '../../database_mongoDB/functions/_index';
import { removeInLineButton } from '../../app/_telefunctions';

// Settings Callbacks
// Any overall bot admin settings
export const settings = (bot: Bot<BotContext>) => {
  bot.callbackQuery('settingsAnnouncements', settingsAnnouncements_Write); //Settings Announcements Input
  //Settings Announcements Output is located in BotOnFunctions
};

// Settings Announcements Input
const settingsAnnouncements_Write = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await removeInLineButton(ctx);
  await ctx.reply(
    `Write down the bot announcement msg. It wll broadcast to everyone using the bot.
	  `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  ctx.session.botOnType = 31;
};

// Settings Announcements Output
// Used in _botOn_functions.ts
// Refer to case botOntype = 31
export const settingsAnnouncements_Send = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const announcement = '<b>Bot Announcement:</b>\n' + ctx.message.text;
  if (announcement == null || ctx.session.botOnType == null) {
    settingsAnnouncements_Send(ctx);
  } else {
    const allNames = Database.getMongoRepository(Names).find();
    const sendUsers = (await allNames)
      .map((n) => n.teleUser)
      .filter((n) => n != '');
    await Promise.all(
      sendUsers.map(async (n) => {
        const sentMsg = await dbMessaging.sendMessageUser(n, announcement, ctx);
        try {
          await ctx.pinChatMessage(sentMsg.message_id);
        } catch (err) {
          console.log(err);
        }
        console.log(announcement + `(${n})`);
      })
    );

    await ctx.reply(`Announcement sent!`);

    ctx.session = initial();
  }
};

const newUserManagement = async (ctx: CallbackQueryContext<BotContext>) => {};
