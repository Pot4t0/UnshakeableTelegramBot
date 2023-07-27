import { CallbackQueryContext, InlineKeyboard } from 'grammy';
import { BotContext } from '../app';
import { Database } from '../database_mongoDB/db-init';
import { Events, Names, Wishes } from '../database_mongoDB/Entity/tableEntity';
import { sendMessageUser } from './db_functions';
import { initial } from '../models/SessionData';

// See Wish Callbacks
export const seeWish_1 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const welfareEvent = await Database.getRepository(Events).find();
  const inlineKeyboard = new InlineKeyboard(
    welfareEvent.map((w) => [
      {
        text: w.eventName,
        callback_data: `welfareWish_1-${w.eventName}`,
      },
    ])
  );
  await ctx.reply('Select Welfare Event', {
    reply_markup: inlineKeyboard,
  });
};

export const seeWish_2 = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = ctx.update.callback_query.data.substring(
    'welfareWish_1-'.length
  );
  const welfareWishArray = await Database.getMongoRepository(Wishes).find({
    eventName: callback,
  });
  const wishTable = await welfareWishArray.map(
    (n) => `@${n.teleUser}\nWish: \n${n.wishText}`
  );
  console.log(wishTable);
  const inlineKeyboard = new InlineKeyboard([
    [{ text: 'Back', callback_data: 'seeWelfareWishes' }],
  ]);
  await ctx.reply(wishTable.join('\n\n'), {
    reply_markup: inlineKeyboard,
  });
};

// Reminder Management
export const reminderManagement = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Send to members that have not turned in',
        callback_data: 'sendNotInReminder',
      },
    ],
    [
      {
        text: 'Send to specific member',
        callback_data: 'sendSpecificReminder',
      },
    ],
    [
      {
        text: 'Send to all members',
        callback_data: 'sendAllReminder',
      },
    ],
  ]);

  await ctx.reply(
    `
	  Choose option
	  (Send all option will exlude the person its for)

	  DO NOT ABUSE THE REMINDER SYSTEM.
	  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};
export const sendSpecificReminder_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  const event = await Database.getRepository(Events).find();
  const inlineKeyboard = new InlineKeyboard(
    event.map((n) => [
      {
        text: n.eventName,
        callback_data: `reminderSpecificEvents-${n.eventName}`,
      },
    ])
  );
  await ctx.reply('Choose event:', {
    reply_markup: inlineKeyboard,
  });
};
export const sendSpecificReminder_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  ctx.session.eventName = ctx.update.callback_query.data.substring(
    'reminderSpecificEvents-'.length
  );
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `reminderSpecificNames-${n.teleUser}`,
      },
    ])
  );
  await ctx.reply('Choose member:', {
    reply_markup: inlineKeyboard,
  });
};
export const sendSpecificReminder_3 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  const telegramUser = await ctx.update.callback_query.data.substring(
    'reminderSpecificNames-'.length
  );
  await sendMessageUser(
    telegramUser,
    `Hello this is a friendly reminder to send in your wishes for ${ctx.session.eventName}! 😀 Pls click /sendwish to send`,
    ctx
  );
  initial();
};

//Manage Welfare Events
export const manageWelfareEvent = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Add Welfare Event',
        callback_data: 'addWelfareEvent',
      },
    ],
    [
      {
        text: 'Delete Welfare Event',
        callback_data: 'deleteWelfareEvent',
      },
    ],
    [
      {
        text: 'Edit Welfare Event',
        callback_data: 'editWelfareEvent',
      },
    ],
  ]);

  await ctx.reply(
    `
		  Choose option
		  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};
export const addWelfareEvent = async (
  ctx: CallbackQueryContext<BotContext>
) => {};
export const deleteWelfareEvent = async (
  ctx: CallbackQueryContext<BotContext>
) => {};
export const editWelfareEvent = async (
  ctx: CallbackQueryContext<BotContext>
) => {};
