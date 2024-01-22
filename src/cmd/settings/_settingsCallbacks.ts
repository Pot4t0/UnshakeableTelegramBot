import { Bot, CallbackQueryContext, Keyboard } from 'grammy';
import { BotContext } from '../../app/_index';
import { removeInLineButton } from '../../app/_telefunctions';

// Settings Callbacks
// Any overall bot admin settings
export const settings = (bot: Bot<BotContext>) => {
  bot.callbackQuery('settingsAnnouncements', settingsAnnouncements_Write); //Settings Announcements Input
  bot.callbackQuery('settingsNewUser', newUserManagement); //Settings New User Management
  bot.callbackQuery('settingsLGGroup', lgGroupManagement); //Settings Bot On
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

const newUserManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const button = new Keyboard().requestUser('Add User', 1).oneTime(true);

  await ctx.reply('Click button to go to contact list', {
    reply_markup: button,
  });
};

const lgGroupManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  await removeInLineButton(ctx);
  const button = new Keyboard().requestChat('Choose LG Chat', 1).oneTime(true);
  await ctx.reply(
    `Choose the updated LG Chat. It will let the Bot enter the chat and send messages.
    `,
    {
      reply_markup: button,
    }
  );
};
