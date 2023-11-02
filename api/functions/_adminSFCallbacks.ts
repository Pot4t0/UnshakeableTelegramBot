import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import {
  Attendance_mongo,
  Names,
  SF_mongo,
} from '../database_mongoDB/Entity/_tableEntity';
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
  const offSetDate = new Date(
    parseInt(textDateArray[2]),
    parseInt(textDateArray[1]) - 1,
    parseInt(textDateArray[0]) - 7 + 3
  ); // offsetted to the wk before tues
  const prefix = "<b>Admin Team:</b>/n";
  const reminder = (await ctx.session.text) || '';
  const InSF = await Database.getMongoRepository(SF_mongo).find({
    where: {
      timestamp: { $gte: offSetDate },
    },
  });
  const notInNames = await Database.getMongoRepository(Names).find({
    where: {
      teleUser: { $not: { $in: await InSF.map((n) => `${n.teleUser}`) } },
    },
  });
  const notInUsers = await notInNames
    .map((n) => `${n.teleUser}`)
    .filter((n) => n != '');

  await Promise.all(
    notInUsers.map(async (n) => {
      await sendMessageUser(n, prefix + reminder, ctx);
    })
  );

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
    const prefix = "<b>Admin Team:</b>/n";
    const reminder = (await ctx.message.text) || '';
    await sendMessageUser(ctx.session.reminderUser, prefix + reminder, ctx);
    await ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
  }
  ctx.session = await initial();
};

export const manualSF = async (ctx: CallbackQueryContext<BotContext>) => {
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

export const sendsf = async (ctx: CallbackQueryContext<BotContext>) => {
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

export const manualSFYesNo = async (ctx: CallbackQueryContext<BotContext>) => {
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
    ctx.session.botOnType = 30;
  } else {
    await ctx.reply('ERROR! Pls try again.');
    ctx.session = await initial();
  }
};

//ctx.session.botOnType = 30;
export const manualSFNo = async (ctx: Filter<BotContext, 'message'>) => {
  const reason = (await ctx.message.text) || '';
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
    sermonFeedback: '',
    attendance: 'No',
    reason: reason,
  });

  await ctx.reply('Sent!');

  ctx.session = await initial();

  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
