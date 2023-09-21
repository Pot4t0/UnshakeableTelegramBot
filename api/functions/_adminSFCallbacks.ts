import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Names } from '../database_mongoDB/Entity/_tableEntity';
import { sendMessageUser } from './_db_functions';
import { initial } from '../models/_SessionData';
import { gsheet } from '../gsheets/_index';

// Reminder Management
export const reminderManagement = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Send to members that have not turned in',
        callback_data: 'sendSFNotInReminder',
      },
    ],
    [
      {
        text: 'Send to specific member',
        callback_data: 'sendSFSpecificReminder',
      },
    ],
  ]);

  await ctx.reply(
    `
		Choose option
		\n(Send all option will exclude the person its for)

	  \nDO NOT ABUSE THE REMINDER SYSTEM.
		`,
    {
      reply_markup: inlineKeyboard,
    }
  );
};
export const sendNotInReminder_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.botOnType = 16;
  await ctx.reply(
    `Write down the reminder msg for people that have not sent it in
	  \nSuggestion to put /sendsf so that user can click on it
	  `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};
//Uses botOnType = 16 to work
export const sendNotInReminder_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.text = (await ctx.message.text) || '';
  await ctx.reply(
    `Enter Service Date in dd/mm/yyyy
		`,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
  ctx.session.botOnType = 17;
};
//Uses botOnType = 17 to work
export const sendNotInReminder_3 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const textDate = (await ctx.message.text) || '';
  const textDateArray = textDate.split('/');
  const svcDate = new Date(
    parseInt(textDateArray[2]),
    parseInt(textDateArray[1]) - 1,
    parseInt(textDateArray[0])
  );
  const totalNames = await Database.getMongoRepository(Names).find();
  const reminder = ctx.session.text || '';
  await gsheet.unshakeableSFSpreadsheet.loadInfo();
  const sheet = await gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram'];
  for (let i = 4; i <= totalNames.length + 3; i++) {
    await sheet.loadCells(`F${i}`);
    const time = await sheet.getCellByA1(`F${i}`);
    const date = new Date(time.value?.toString() || '');
    const offset = (date.getTime() - svcDate.getTime()) / 86400000; // in days
    if (offset > 3 || time.value == null) {
      const user = await Database.getMongoRepository(Names).find({
        sfrow: i,
      });
      await sendMessageUser(user[0].teleUser, reminder, ctx);
    }
  }
  await ctx.reply(`Reminder sent!`);

  ctx.session = await initial();
};

//Send Specific Person Reminder Msg

export const sendSpecificReminder_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `reminderSFSpecificNames-${n.teleUser}`,
      },
    ])
  );
  await ctx.reply('Choose member:', {
    reply_markup: inlineKeyboard,
  });
};
export const sendSpecificReminder_2 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  const telegramUser = await ctx.update.callback_query.data.substring(
    'reminderSFSpecificNames-'.length
  );
  ctx.session.reminderUser = telegramUser;
  ctx.session.botOnType = 18;
  await ctx.reply(
    `Write down the reminder msg that you want to send to @${telegramUser}
	  \nSuggestion to put /sendsf so that user can click on it
	  `,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};

//Uses botOnType = 18 to work
export const sendSpecificReminder_3 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  if (ctx.session.reminderUser) {
    const reminder = (await ctx.message.text) || '';
    await sendMessageUser(ctx.session.reminderUser, reminder, ctx);
    await ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
  }
  ctx.session = await initial();
};
