import { CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../app/_index';
import { Database } from '../database_mongoDB/_db-init';
import {
  Attendance_mongo,
  Names,
} from '../database_mongoDB/Entity/_tableEntity';
import { sendMessageUser } from './_db_functions';
import { initial } from '../models/_SessionData';
import { gsheet } from '../gsheets/_index';
import { unshakeableAttendanceSpreadsheet } from '../gsheets/_gsheet_init';
import { sheets } from 'googleapis/build/src/apis/sheets';
import { arch } from 'os';
import { afterEach } from 'node:test';
import { text } from 'stream/consumers';

export const addAttendanceSheet = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Got LG',
        callback_data: 'yesLGAddAttendance',
      },
    ],
    [
      {
        text: 'No LG',
        callback_data: 'noLGAddAttendance',
      },
    ],
    [
      {
        text: 'Special Event',
        callback_data: 'specialAddAttendance',
      },
    ],
  ]);

  await ctx.reply(
    `
	Is there LG or is it a special event?
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

export const specialAddAttendance_1 = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('Enter Special Event Name:', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 26;
};
//Botontype = 26
export const specialAddAttendance_2 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const getText = (await ctx.message.text) || '';
  ctx.session.eventName = getText;
  await ctx.reply('Enter Special Event Date in dd/mm/yyyy:', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = 27;
};
//Botontype = 27
export const specialAddAttendance_3 = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const event_date = (await ctx.message.text) || '';
  const event_name = ctx.session.eventName;
  ctx.session.botOnType = await undefined;
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const templateSheet =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const sheetExist =
    await unshakeableAttendanceSpreadsheet.sheetsByTitle[
      `${event_name} (${event_date}) created`
    ];

  if (sheetExist == undefined) {
    await templateSheet.duplicate({
      title: `${event_name} (${event_date})`,
    });
    const newSheet =
      await unshakeableAttendanceSpreadsheet.sheetsByTitle[
        `${event_name} (${event_date})`
      ];
    await newSheet.loadCells();
    const eventDateCell = newSheet.getCellByA1('C2');
    const eventNameCell = newSheet.getCellByA1('C3');
    eventDateCell.value = event_date;
    eventNameCell.value = event_name;
    await newSheet.saveUpdatedCells();
    await ctx.reply(`${event_name} (${event_date})`);
  } else {
    await ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
  }
  ctx.session = await initial();
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
export const delAttendanceSheet = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
  const special_template =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
  const inlineKeyboard = new InlineKeyboard(
    ghseetArray
      .filter((n) => n != template)
      .filter((n) => n != special_template)
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
  const special_template =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
  const inlineKeyboard = new InlineKeyboard(
    ghseetArray
      .filter((n) => n != template)
      .filter((n) => n != special_template)
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
  const totalNames = await Database.getMongoRepository(Names).find({
    where: { teleUser: { $not: { $eq: '' } } },
  });

  const reminder = ctx.session.text || '';
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  await sheet.loadCells();
  const checkSpecialCell = sheet.getCellByA1('B2');
  if (checkSpecialCell.value == 'Special Event') {
    // for (let i = 4; i <= totalNames.length + 3; i++) {
    await Promise.all(
      totalNames.map(async (i) => {
        const checkCell = await sheet.getCellByA1(`C${i.attendanceRow}`);
        if (checkCell.value == null) {
          await sendMessageUser(i.teleUser, reminder, ctx);
        }
      })
    );
    // }
  } else {
    // for (let i = 4; i <= totalNames.length + 3; i++) {
    await Promise.all(
      totalNames.map(async (i) => {
        // await sheet.loadCells(`F${i}`);
        const checkCell = await sheet.getCellByA1(`F${i.attendanceRow}`);
        if (checkCell.value == null) {
          await sendMessageUser(i.teleUser, reminder, ctx);
        }
      })
    );
    // }
    await ctx.reply(`Reminder sent!`);
    ctx.session = await initial();
  }
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

export const selectSvcDateChat = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
  const special_template =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
  const inlineKeyboard = new InlineKeyboard(
    ghseetArray
      .filter((n) => n != template)
      .filter((n) => n != special_template)
      .map((n) => [
        { text: n.title, callback_data: `selectSvcDateChat-${n.title}` },
      ])
  );
  await ctx.reply(
    `Choose Service Date in dd/mm/yyyy
		  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

export const sendAttendanceToLGChat = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'selectSvcDateChat-'.length
  );
  const totalNames = await Database.getMongoRepository(Names).find({});
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  await sheet.loadCells();
  const lgDateCell = await sheet.getCellByA1('C2');
  const lgCheckCell = await sheet.getCellByA1('C3');
  const weCheckCell = await sheet.getCellByA1('F3');
  const weDateCell = await sheet.getCellByA1('F2');
  const checkSpecialCell = sheet.getCellByA1('B2');
  let msg = `Unshakeable Attendance`;
  if (checkSpecialCell.value == 'Special Event') {
    let cmgMsg = `\n\n${lgCheckCell.value} (${lgDateCell.value}):\n\nComing 🥳\n`;
    let notCmgMsg = '\n\nNot Coming 😢\n';
    // for (let i = 4; i <= totalNames.length + 3; i++) {
    await Promise.all(
      totalNames.map(async (n) => {
        const i = await n.attendanceRow;
        const attendName = await sheet.getCellByA1(`B${i}`);
        const lgCell = await sheet.getCellByA1(`C${i}`);
        const lgReasonCell = await sheet.getCellByA1(`D${i}`);
        if (lgCell.value == 'Y') {
          cmgMsg += `\n${attendName.value}`;
        } else {
          notCmgMsg += `\n${attendName.value} - ${lgReasonCell.value}`;
        }
      })
    );
    msg += cmgMsg + notCmgMsg;
  } else {
    let lgComingMsg = `\n\n${lgCheckCell.value} (${lgDateCell.value}):\n\nComing 🥳\n`;
    let lgNotCmgMsg = '\n\nNot Coming 😢\n';
    let weCmgMsg = `\n\n${weCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
    let weNotCmgMsg = '\n\nNot Coming 😢\n';
    let dinnerCmgMsg = `\n\nDinner (${weDateCell.value}):\n\nComing 🥳\n`;
    let dinnerNotCmgMsg = '\n\nNot Coming 😢\n';

    // for (let i = 4; i <= totalNames.length + 3; i++) {
    await Promise.all(
      totalNames.map(async (n) => {
        const i = await n.attendanceRow;
        const attendName = await sheet.getCellByA1(`B${i}`);
        const weCell = await sheet.getCellByA1(`F${i}`);
        const weReasonCell = await sheet.getCellByA1(`G${i}`);
        const lgCell = await sheet.getCellByA1(`C${i}`);
        const lgReasonCell = await sheet.getCellByA1(`D${i}`);
        const dinnerCell = await sheet.getCellByA1(`I${i}`);
        const dinnerReasonCell = await sheet.getCellByA1(`J${i}`);
        if (lgCheckCell.value != 'No LG') {
          if (lgCell.value == 'Y') {
            lgComingMsg += `\n${attendName.value}`;
          } else {
            lgNotCmgMsg += `\n${attendName.value} - ${lgReasonCell.value}`;
          }
        }
        if (weCheckCell.value != 'No WE') {
          if (weCell.value == 'Y') {
            weCmgMsg += `\n${attendName.value}`;
          } else {
            weNotCmgMsg += `\n${attendName.value} - ${weReasonCell.value}`;
          }
          if (dinnerCell.value == 'Y') {
            dinnerCmgMsg += `\n${attendName.value}`;
          } else {
            dinnerNotCmgMsg += `\n${attendName.value} - ${dinnerReasonCell.value}`;
          }
        }
      })
    );
    msg +=
      lgComingMsg +
      lgNotCmgMsg +
      weCmgMsg +
      weNotCmgMsg +
      dinnerCmgMsg +
      dinnerNotCmgMsg;
  }
  await ctx.api.sendMessage(process.env.LG_CHATID || '', msg);
  // await ctx.api.sendMessage(611527651, msg);
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

export const archiveAttendance_select = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const archivedSheets = Database.getMongoRepository(Attendance_mongo).find({
    name: 'Archive',
  });
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
  const special_template =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
  const archivedSheetsArray = (await archivedSheets)
    .map((n) => n.archive)
    .flat();
  const inlineKeyboard = new InlineKeyboard(
    ghseetArray
      .filter((n) => n != template)
      .filter((n) => n != special_template)
      .filter((n) => !archivedSheetsArray.includes(n.title))
      .map((n) => [{ text: n.title, callback_data: `archiveSheet-${n.title}` }])
  );
  await ctx.reply('Which sheet would you like to archive?', {
    reply_markup: inlineKeyboard,
  });
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
export const archiveAttendance_archive = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'archiveSheet-'.length
  );
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  await sheet.updateProperties({ hidden: true });
  const archiveSheet = await Database.getMongoRepository(
    Attendance_mongo
  ).findOneBy({
    name: 'Archive',
  });
  await Database.getMongoRepository(Attendance_mongo).updateOne(
    { name: 'Archive' },
    { $set: { archive: archiveSheet?.archive.concat(callback) } }
  );
  await ctx.reply(`${callback} archived!`);
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
export const unarchiveAttendance_select = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const archiveSheet = await Database.getMongoRepository(
    Attendance_mongo
  ).findOneBy({
    name: 'Archive',
  });
  const inlineKeyboard = new InlineKeyboard(
    archiveSheet?.archive.map((n) => [
      { text: n, callback_data: `unarchiveSheet-${n}` },
    ])
  );

  await ctx.reply('Which sheet would you like to unarchive?', {
    reply_markup: inlineKeyboard,
  });
};

export const unarchiveAttendance_unarchive = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'unarchiveSheet-'.length
  );
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  await sheet.updateProperties({ hidden: false });
  const archiveSheet = await Database.getMongoRepository(
    Attendance_mongo
  ).findOneBy({
    name: 'Archive',
  });
  if (archiveSheet) {
    const index = await archiveSheet.archive.indexOf(callback);
    await Database.getMongoRepository(Attendance_mongo).updateOne(
      { name: 'Archive' },
      { $set: { archive: archiveSheet.archive.splice(index, 1) } }
    );
    await ctx.reply(`${callback} unarchived!`);
  }
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
