import { Bot, CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import { Names } from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import { gsheet } from '../../../gsheets/_index';
import { reminder } from '../../../database_mongoDB/functions/_index';
import { adminSFBotOn } from './_adminSFInternal';

export const adminSF = (bot: Bot<BotContext>) => {
  // SF Reminder
  bot.callbackQuery('manageSFReminder', reminderManagement);
  bot.callbackQuery('sendReminder-Admin', sendNotInReminder);

  bot.callbackQuery('manualSF', manualSF);
  bot.callbackQuery(/^manualSFName-/g, sendsf);
  bot.callbackQuery(/^manualSendSF-/g, manualSFYesNo);
};

// Reminder Management
const reminderManagement = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await reminder.reminderMenu(ctx, 'Admin');
};
const sendNotInReminder = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await reminder.reminderSendAllNotIn_ReminderMessage(ctx);
};

const manualSF = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const name = await Database.getRepository(Names).find();
  const inlineKeyboard = new InlineKeyboard(
    name.map((n) => [
      {
        text: n.nameText,
        callback_data: `manualSFName-${n.teleUser}`,
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

const sendsf = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.name = await ctx.update.callback_query.data.substring(
    'manualSFName-'.length
  );
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'manualSendSF-yes',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'manualSendSF-no',
      },
    ],
  ]);
  await ctx.reply('Attendance', {
    reply_markup: inlineKeyboard,
  });
};

const manualSFYesNo = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'manualSendSF-'.length
  );
  if (callback == 'yes') {
    const sfmsg = '';
    await gsheet.unshakeableSFSpreadsheet.loadInfo();
    const sheet =
      gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
    const teleUserName = (await ctx.session.name) || '';
    const user = await Database.getMongoRepository(Names).find({
      teleUser: teleUserName,
    });
    await sheet.addRow({
      timeStamp: Date(),
      name: user[0].nameText,
      sermonFeedback: sfmsg,
      attendance: 'Yes',
      reason: '',
    });
    await ctx.reply('Sent!');
    ctx.session = await initial();
    await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
  } else if (callback == 'no') {
    await ctx.reply(
      `
    Reason
    `,
      {
        reply_markup: { force_reply: true },
      }
    );
    ctx.session.botOnType = adminSFBotOn.manualSFNoFunction;
  } else {
    await ctx.reply('ERROR! Pls try again.');
    ctx.session = await initial();
  }
};
