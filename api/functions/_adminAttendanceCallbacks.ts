import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import { Names } from '../database_mongoDB/Entity/_tableEntity';
import { sendMessageUser } from './_db_functions';
import { initial } from '../models/_SessionData';
import { gsheet } from '../gsheets/_index';
import { unshakeableAttendanceSpreadsheet } from '../gsheets/_gsheet_init';
import { sheets } from 'googleapis/build/src/apis/sheets';

export const addAttendanceSheet = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'yesLGAddAttendance',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'noLGAddAttendance',
      },
    ],
  ]);

  await ctx.reply(
    `
	Is there LG?
	`,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

//Add Sheet With LG
export const addAttendanceSheet_Yes_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('Enter LG Date in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 21;
};
//BotOntype = 21
export const addAttendanceSheet_Yes_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  ctx.session.eventDate = (await ctx.message.text) || '';
  await ctx.reply('Enter Worship Experience Date in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 22;
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
//BotOntype = 22
export const addAttendanceSheet_Yes_3 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const getText = (await ctx.message.text) || '';
  ctx.session.botOnType = await undefined;
  const weDateArray = getText.split('/');
  const lgDateArray = (await ctx.session.eventDate?.split('/')) || '';

  ctx.session = initial();
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const templateSheet = unshakeableAttendanceSpreadsheet.sheetsById[0];
  const sheetExist =
    await unshakeableAttendanceSpreadsheet.sheetsByTitle[
      `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
    ];

  if (sheetExist == undefined) {
    await templateSheet.duplicate({
      title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
    });
    const newSheet =
      await unshakeableAttendanceSpreadsheet.sheetsByTitle[
        `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
      ];
    await newSheet.loadCells();
    const lgDateCell = await newSheet.getCellByA1(`C2`);
    const weDateCell = await newSheet.getCellByA1(`F2`);
    weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
    lgDateCell.value = `${lgDateArray[0]}/${lgDateArray[1]}/${lgDateArray[2]}`;
    await newSheet.saveUpdatedCells();
    await ctx.reply(
      `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]} sheet has been created`
    );
  } else {
    await ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
  }
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

//Add Sheet without LG
export const addAttendanceSheet_No_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('Enter WE Date in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 23;
};
//BotOntype = 23
export const addAttendanceSheet_No_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const getText = (await ctx.message.text) || '';
  ctx.session.botOnType = await undefined;
  const weDateArray = getText.split('/');
  ctx.session = initial();
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const templateSheet = unshakeableAttendanceSpreadsheet.sheetsById[0];
  const sheetExist =
    await unshakeableAttendanceSpreadsheet.sheetsByTitle[
      `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
    ];

  if (sheetExist == undefined) {
    await templateSheet.duplicate({
      title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
    });
    const newSheet =
      await unshakeableAttendanceSpreadsheet.sheetsByTitle[
        `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
      ];
    await newSheet.loadCells();
    2;
    const lgCell = await newSheet.getCellByA1(`C3`);
    const lgReasonCell = await newSheet.getCellByA1(`D3`);
    const weDateCell = await newSheet.getCellByA1(`F2`);
    weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
    lgCell.value = 'No LG';
    lgReasonCell.value = '';
    await newSheet.saveUpdatedCells();
    await ctx.reply(
      `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]} sheet has been created`
    );
  } else {
    await ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
  }
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const delAttendanceSheet = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
  const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
  const inlineKeyboard = new InlineKeyboard(
    ghseetArray
      .filter((n) => n != template)
      .map((n) => [
        { text: n.title, callback_data: `delAttendanceeSheet-${n.title}` },
      ])
  );
  await ctx.reply('Which Google Sheet would you like to delete?', {
    reply_markup: inlineKeyboard,
  });
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const confirmDelete = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  ctx.session.eventName = await ctx.update.callback_query.data.substring(
    'delAttendanceeSheet-'.length
  );
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'yesCfmDelAttendanceSheet',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'noCfmDelAttendanceSheet',
      },
    ],
  ]);
  await ctx.reply('Are you sure?', { reply_markup: inlineKeyboard });
};

export const yesDelete = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.eventName || ''];
  await unshakeableAttendanceSpreadsheet.deleteSheet(sheet.sheetId);
  await ctx.reply(`${ctx.session.eventName} deleted!`);
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const noDelete = async (ctx: CallbackQueryContext<BotContext>) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('Deletion cancelled!');
};

// //Reminder Management
export const reminderManagement = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Send to members that have not turned in',
        callback_data: 'sendAttendanceNotInReminder',
      },
    ],
    [
      {
        text: 'Send to specific member',
        callback_data: 'sendAttendanceSpecificReminder',
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
  ctx.session.botOnType = 24;
  await ctx.reply(
    `Write down the reminder msg for people that have not sent it in
		\nSuggestion to put /sendattendance so that user can click on it
		`,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};
//Uses botOnType = 24 to work
export const sendNotInReminder_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.text = (await ctx.message.text) || '';
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
  const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
  const inlineKeyboard = new InlineKeyboard(
    ghseetArray
      .filter((n) => n != template)
      .map((n) => [
        { text: n.title, callback_data: `notInReminderAttendance-${n.title}` },
      ])
  );
  await ctx.reply(
    `Choose Service Date in dd/mm/yyyy
		  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
export const sendNotInReminder_3 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'notInReminderAttendance-'.length
  );
  const totalNames = await Database.getMongoRepository(Names).find({});
  const reminder = ctx.session.text || '';
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  for (let i = 4; i <= totalNames.length + 3; i++) {
    await sheet.loadCells(`F${i}`);
    const checkCell = await sheet.getCellByA1(`F${i}`);
    if (checkCell.value == null) {
      const user = await Database.getMongoRepository(Names).find({
        attendanceRow: i,
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
        callback_data: `reminderAttendanceSpecificNames-${n.teleUser}`,
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
    'reminderAttendanceSpecificNames-'.length
  );
  ctx.session.reminderUser = telegramUser;
  ctx.session.botOnType = 25;
  await ctx.reply(
    `Write down the reminder msg that you want to send to @${telegramUser}
		\nSuggestion to put /sendattendance so that user can click on it
		`,
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );
};

//Uses botOnType = 25 to work
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
