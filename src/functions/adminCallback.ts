import { CallbackQueryContext, InlineKeyboard } from 'grammy';

import { BotContext } from '../app';
import { Database } from '../database/db-init';
import { EventTable, WishTable } from '../database/Entity/tableEntity';

export const wishManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'See Wishes',
        callback_data: 'seewish',
      },
    ],
    [
      {
        text: 'Remove Wishes',
        callback_data: 'removewish',
      },
    ],
    [
      {
        text: 'Export Wishes (in developnent)',
        callback_data: 'exportwish',
      },
    ],
    [
      {
        text: 'Track members that have not sent wishes (in developnent)',
        callback_data: 'trackwish',
      },
    ],
    [
      {
        text: 'Remind members to send wish (in developnent)',
        callback_data: 'remindwish',
      },
    ],
  ]);

  await ctx.reply(
    `
	Select option you want to use: 
	`,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const seeWish = async (ctx: CallbackQueryContext<BotContext>) => {
  const events = await Database.getRepository(EventTable).find();
  //await query.select("eventTable", "name");
  const inlineKeyboard = new InlineKeyboard(
    events.map((event) => [
      {
        text: event.name,
        callback_data: `wishEvent-${event.name}`,
      },
    ])
  );

  await ctx.reply('Choose upcoming Welfare Event', {
    reply_markup: inlineKeyboard,
  });
};

export const wishTable = async (ctx: CallbackQueryContext<BotContext>) => {
  const eventName = ctx.update.callback_query.data.substring(
    'wishEvent'.length + 1
  );
  const wish = await Database.getRepository(WishTable).find({
    where: { eventName },
  });
  const wish_formatted =
    eventName +
    ' Wishes\n\n' +
    wish
      .map((w) => [`Name: ${w.name}`, `Wish: ${w.wish}`].join('\n'))
      .join('\n\n');

  // query.select(`wishTable WHERE eventName = "${eventName}"`,"name, wish" );
  const inlineKeyboard = new InlineKeyboard([
    [{ text: 'Back', callback_data: 'wishManagement' }],
  ]);
  await ctx.reply(wish_formatted, {
    reply_markup: inlineKeyboard,
  });
};
