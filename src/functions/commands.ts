import { CommandContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../app';
import { Database } from '../database_mongoDB/db-init';
import { Events, Names } from '../database_mongoDB/Entity/tableEntity';

/* / start command
 *  Purpose is to tag the username with the name list inside the "names" collection within UnshakeableDB
 */
export const start = async (ctx: CommandContext<BotContext>) => {
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `nameStart-${n.nameText}`,
      },
    ])
  );
  await ctx.reply(
    'Welcome to Unshakeable Telegram Bot\nPlease select your name:',
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const help = async (ctx: CommandContext<BotContext>) => {
  await ctx.reply(`
	**Commands**
	/sendwish -->  Send wishes for Birthday or Welfare events
	/adminWelfare --> Management of resources/data within this telegram bot (FOR WELFARE TEAM ONLY)
	`);
};
export const settings = async (ctx: CommandContext<BotContext>) => {
  await ctx.reply('Settings (in development)');
};

export const sendWish = async (ctx: CommandContext<BotContext>) => {
  const event = await Database.getMongoRepository(Events).find();
  const inlineKeyboard = new InlineKeyboard(
    event.map((e) => [
      {
        text: e.eventName,
        callback_data: `eventName-${e.eventName}`,
      },
    ])
  );

  await ctx.reply('Choose upcoming Welfare Event: ', {
    reply_markup: inlineKeyboard,
  });
};
export const adminWelfare = async (ctx: CommandContext<BotContext>) => {
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Manage Welfare Events',
        callback_data: 'manageWelfareEvent',
      },
    ],
    [
      {
        text: 'Manage Welfare Team',
        callback_data: 'manageWelfareTeam',
      },
    ],
    [
      {
        text: 'View Wishes',
        callback_data: 'seeWelfareWishes',
      },
    ],
    [
      {
        text: 'Send Reminder',
        callback_data: 'manageReminder',
      },
    ],
  ]);

  await ctx.reply(
    `
	Welfare Team Admin Matters 

	Welfare Team and Event Management can only be used by Welfare IC / IT Rep (for technical purposes only)
	All members can view all wishes and send reminders in all welfare events
	Please respect the privacy of LG members by only using the information when deemed necessary.
	Please also do not abuse the reminder system and annoy your fellow lifegroup members
	`,
    {
      reply_markup: inlineKeyboard,
    }
  );
};
