import { Bot, CallbackQueryContext, Filter, InlineKeyboard } from 'grammy';
import { BotContext } from '../../../app/_index';
import { Database } from '../../../database_mongoDB/_db-init';
import {
  Attendance_mongo,
  Names,
} from '../../../database_mongoDB/Entity/_tableEntity';
import { initial } from '../../../models/_SessionData';
import { gsheet } from '../../../gsheets/_index';
import { unshakeableAttendanceSpreadsheet } from '../../../gsheets/_gsheet_init';
import { reminder } from '../../../database_mongoDB/functions/_index';
import {
  adminAttendanceBotOn,
  createEventDBDoc,
} from './__adminAttendanceInternal';

// Admin Attendance Callbacks
export const adminAttendance = (bot: Bot<BotContext>) => {
  // Add Attendance Sheet Menu
  bot.callbackQuery('addAttendanceSheet', addAttendanceSheet);
  // Add LG Event
  bot.callbackQuery(
    'yesLGAddAttendance',
    addAttendanceSheet_LGEventLGDateMessage
  );
  // Add No LG Event
  bot.callbackQuery(
    'noLGAddAttendance',
    addAttendanceSheet_NoLGEventWEDateMessage
  );
  // Add Special Event
  bot.callbackQuery(
    'specialAddAttendance',
    addAttendanceSheet_SpecialEventMealMessage
  );
  bot.callbackQuery(
    /^addSpecialAttendannce-/g,
    addAttendanceSheet_SpecialEventNameMessage
  );
  // Delete Attendance Sheet
  bot.callbackQuery('delAttendanceSheet', delAttendanceSheet);
  bot.callbackQuery(/^delAttendanceeSheet-/g, delAttendanceeSheet_CfmMessage);
  bot.callbackQuery(/^CfmDelAttendanceSheet-/g, delAttendanceeSheet_Execution);
  // //Attendance reminders callbacks
  bot.callbackQuery('manageAttendanceReminder', attendanceReminder);
  // //Send not in reminder (attendance)
  bot.callbackQuery('sendAttendanceNotInReminder', attendanceReminder);
  bot.callbackQuery(/^sendAttendanceReminder-/g, attendanceReminder_Menu);
  bot.callbackQuery('sendReminder-Attendance', attendanceReminder_Msg);
  //Send to Attendance Sheet to LG Chat
  bot.callbackQuery('chatAttendance', sendAttendanceToLGChat_EventMenu);
  bot.callbackQuery(
    /^sendAttendanceToLGChat/g,
    sendAttendanceToLGChat_Execution
  );
  // Archive Attendance Sheet
  bot.callbackQuery('archiveAttendance', archiveAttendance_Menu);
  bot.callbackQuery(/^archiveSheet/g, archiveAttendance_Execution);
  // Unarchive Attendance Sheet
  bot.callbackQuery('unarchiveAttendance', unarchiveAttendance_Menu);
  bot.callbackQuery(/^unarchiveSheet/g, unarchiveAttendance_Execution);
};
// Add Attendance Sheet Menu
// Choose between 3 options
// LG Event, No LG Event, Special Event
// Special Event will have an optional meal option
export const addAttendanceSheet = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'WE with LG',
        callback_data: 'yesLGAddAttendance',
      },
    ],
    [
      {
        text: 'WE only',
        callback_data: 'noLGAddAttendance',
      },
    ],
    [
      {
        text: 'Special Event (With/Without Meal)',
        callback_data: 'specialAddAttendance',
      },
    ],
  ]);

  await ctx.reply(
    `
	Choose option:
	`,
    {
      reply_markup: inlineKeyboard,
    }
  );
};

const removeEventDBDoc = async (title: string) => {
  const activeDoc = await Database.getMongoRepository(
    Attendance_mongo
  ).findOneBy({
    name: 'Active',
  });
  if (activeDoc) {
    const index = await activeDoc.eventTitle.indexOf(title);
    if (index > -1) {
      await activeDoc.eventTitle.splice(index, 1);
      await activeDoc.eventDate.splice(index, 1);

      await Database.getMongoRepository(Attendance_mongo).updateOne(
        { name: 'Active' },
        { $set: { eventTitle: activeDoc.eventTitle } }
      );
      await Database.getMongoRepository(Attendance_mongo).updateOne(
        { name: 'Active' },
        { $set: { eventDate: activeDoc.eventDate } }
      );
    }
  }
};

// Add Sheet With LG
// LG Event LG Date
const addAttendanceSheet_LGEventLGDateMessage = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('Enter Worship Experience Date in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = adminAttendanceBotOn.lgEventWEDate;
};

// Add Sheet without LG
// No LG Event Worship Experience Date
const addAttendanceSheet_NoLGEventWEDateMessage = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  await ctx.reply('Enter WE Date in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = adminAttendanceBotOn.createNoLgEventBotOn;
};

// Add Sheet Special Event
// Special Event Meal Options
const addAttendanceSheet_SpecialEventMealMessage = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Breakfast',
        callback_data: 'addSpecialAttendannce-Breakfast',
      },
    ],
    [
      {
        text: 'Lunch',
        callback_data: 'addSpecialAttendannce-Lunch',
      },
    ],
    [
      {
        text: 'Dinner',
        callback_data: 'addSpecialAttendannce-Dinner',
      },
    ],
    [
      {
        text: 'No Meal',
        callback_data: 'addSpecialAttendannce-NM',
      },
    ],
  ]);
  await ctx.reply('Does this Special Event have a meal?: ', {
    reply_markup: inlineKeyboard,
  });
};
// Special Event Name
const addAttendanceSheet_SpecialEventNameMessage = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const meal = await ctx.update.callback_query.data.substring(
    'addSpecialAttendannce-'.length
  );
  ctx.session.eventMeal = meal;
  await ctx.reply('Enter Special Event Name:', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = adminAttendanceBotOn.splEventDateBotOn;
};

// Delete Attendance Sheet
// Able to delete any attendance sheet except for template and special event template
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
// Delete Attendance Sheet Confirmation Message
export const delAttendanceeSheet_CfmMessage = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const sheetName = await ctx.update.callback_query.data.substring(
    'delAttendanceeSheet-'.length
  );
  ctx.session.eventName = sheetName;
  const inlineKeyboard = new InlineKeyboard([
    [
      {
        text: 'Yes',
        callback_data: 'CfmDelAttendanceSheet-Y',
      },
    ],
    [
      {
        text: 'No',
        callback_data: 'CfmDelAttendanceSheet-N',
      },
    ],
  ]);
  await ctx.reply(`Are you sure you want to delete ${sheetName}?`, {
    reply_markup: inlineKeyboard,
  });
};
// Delete Attendance Sheet Execution
export const delAttendanceeSheet_Execution = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const cfm = await ctx.update.callback_query.data.substring(
    'CfmDelAttendanceSheet-'.length
  );
  if (cfm == 'Y') {
    if (ctx.session.eventName) {
      await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
      const sheet =
        unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.eventName];
      await unshakeableAttendanceSpreadsheet.deleteSheet(sheet.sheetId);
      await removeEventDBDoc(ctx.session.eventName);
      await ctx.reply(`${ctx.session.eventName} deleted!`);
      await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    } else {
      await ctx.reply(`Error during deletion! Please try again!`);
    }
  } else if (cfm == 'N') {
    await ctx.reply(`Deletion cancelled!`);
  } else {
    await ctx.reply(`Error during deletion! Please try again!`);
  }
  ctx.session = await initial();
};

//Reminder Management
//Choose which event to send reminder for
const attendanceReminder = async (ctx: CallbackQueryContext<BotContext>) => {
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
        { text: n.title, callback_data: `sendAttendanceReminder-${n.title}` },
      ])
  );
  await ctx.reply(
    `Choose which event you want to send reminder for:
		  `,
    {
      reply_markup: inlineKeyboard,
    }
  );
};
//Choose which reminder to send (Not In / Specific)
const attendanceReminder_Menu = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const title = await ctx.update.callback_query.data.substring(
    'sendAttendanceReminder-'.length
  );
  ctx.session.name = await title;

  await reminder.reminderMenu(ctx, 'Attendance');
};
//Send Not In Reminder Messaage
const attendanceReminder_Msg = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });

  const title = ctx.session.name;
  if (title) {
    const sheet =
      await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[title];
    await reminder.reminderSendAllNotIn_ReminderMessage(ctx, sheet);
  }
};

//Send To LG Chat
//Choose which event to send to LG Chat
const sendAttendanceToLGChat_EventMenu = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const activeEvents = await Database.getMongoRepository(Attendance_mongo).find(
    {
      name: 'Active',
    }
  );
  const inlineKeyboard = new InlineKeyboard(
    activeEvents[0].eventTitle.map((n) => [
      {
        text: n,
        callback_data: `sendAttendanceToLGChat-${n}`,
      },
    ])
  );
  await ctx.reply(`Choose which event you want to send to LG Chat:\n`, {
    reply_markup: inlineKeyboard,
  });
};
//Send To LG Chat Execution
const sendAttendanceToLGChat_Execution = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'sendAttendanceToLGChat-'.length
  );
  const totalNames = await Database.getMongoRepository(Names).find({});
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  await sheet.loadCells();
  const lgDateCell = await sheet.getCellByA1('F2');
  const lgCheckCell = await sheet.getCellByA1('F3');
  const weCheckCell = await sheet.getCellByA1('C3');
  const weDateCell = await sheet.getCellByA1('C2');
  const checkSpecialCell = sheet.getCellByA1('B2');
  const mealCheckCell = sheet.getCellByA1('F3');
  let msg = `Unshakeable Attendance`;
  if (checkSpecialCell.value == 'Special Event') {
    let cmgMsg = `\n\n${weCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
    let notCmgMsg = `\n\nNot Coming (${weCheckCell.value}) 😢\n`;
    let nvrSubmitMsg = '\n\nYet to submit ❗️\n';
    let mealCmgMsg = `\n\n${mealCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
    let mealNotCmgMsg = `\n\nNot Coming (${mealCheckCell.value})😢\n`;

    await Promise.all(
      totalNames.map(async (n) => {
        const i = await n.attendanceRow;
        const attendName = await sheet.getCellByA1(`B${i}`);
        const eventCell = await sheet.getCellByA1(`C${i}`);
        const eventReasonCell = await sheet.getCellByA1(`D${i}`);
        const mealCell = await sheet.getCellByA1(`F${i}`);
        const mealReasonCell = await sheet.getCellByA1(`G${i}`);

        if (eventCell.value == 'Y') {
          cmgMsg += `\n${attendName.value}`;
        } else if (eventCell.value == 'N') {
          notCmgMsg += `\n${attendName.value} - ${eventReasonCell.value}`;
        } else {
          nvrSubmitMsg += `\n${attendName.value}`;
        }
        if (mealCheckCell.value) {
          if (mealCell.value == 'Y') {
            mealCmgMsg += `\n${attendName.value}`;
          } else if (mealCell.value == 'N') {
            mealNotCmgMsg += `\n${attendName.value} - ${mealReasonCell.value}`;
          }
        } else {
          mealCmgMsg = '';
          mealNotCmgMsg = '';
        }
      })
    );
    msg += cmgMsg + notCmgMsg + mealCmgMsg + mealNotCmgMsg + nvrSubmitMsg;
  } else {
    let lgComingMsg = `\n\n${lgCheckCell.value} (${lgDateCell.value}):\n\nComing 🥳\n`;
    let lgNotCmgMsg = '\n\nNot Coming (LG) 😢\n';
    let weCmgMsg = `\n\n${weCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
    let weNotCmgMsg = '\n\nNot Coming (WE) 😢\n';
    let dinnerCmgMsg = `\n\nDinner (${weDateCell.value}):\n\nComing 🥳\n`;
    let dinnerNotCmgMsg = '\n\nNot Coming (Dinner) 😢\n';
    let nvrSubmitMsg = '\n\nYet to submit ❗️\n';

    await Promise.all(
      totalNames.map(async (n) => {
        const i = await n.attendanceRow;
        const attendName = await sheet.getCellByA1(`B${i}`);
        const weCell = await sheet.getCellByA1(`C${i}`);
        const weReasonCell = await sheet.getCellByA1(`D${i}`);
        const lgCell = await sheet.getCellByA1(`F${i}`);
        const lgReasonCell = await sheet.getCellByA1(`G${i}`);
        const dinnerCell = await sheet.getCellByA1(`I${i}`);
        const dinnerReasonCell = await sheet.getCellByA1(`J${i}`);
        if (lgCheckCell.value != 'No LG') {
          if (lgCell.value == 'Y') {
            lgComingMsg += `\n${attendName.value}`;
          } else if (lgCell.value == 'N') {
            lgNotCmgMsg += `\n${attendName.value} - ${lgReasonCell.value}`;
          }
        } else {
          lgComingMsg = '';
          lgNotCmgMsg = '';
        }
        if (weCheckCell.value) {
          if (weCell.value == 'Y') {
            weCmgMsg += `\n${attendName.value}`;
          } else if (weCell.value == 'N') {
            weNotCmgMsg += `\n${attendName.value} - ${weReasonCell.value}`;
          } else {
            nvrSubmitMsg += `\n${attendName.value}`;
          }
          if (dinnerCell.value == 'Y') {
            dinnerCmgMsg += `\n${attendName.value}`;
          } else if (dinnerCell.value == 'N') {
            dinnerNotCmgMsg += `\n${attendName.value} - ${dinnerReasonCell.value}`;
          }
        }
      })
    );
    msg +=
      weCmgMsg +
      weNotCmgMsg +
      lgComingMsg +
      lgNotCmgMsg +
      dinnerCmgMsg +
      dinnerNotCmgMsg +
      nvrSubmitMsg;
  }
  await ctx.api.sendMessage(process.env.LG_CHATID || '', msg);
  console.log(msg);
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

// Archive Attendance Sheet
const archiveAttendance_Menu = async (
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
const archiveAttendance_Execution = async (
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
  if (archiveSheet) {
    await Database.getMongoRepository(Attendance_mongo).updateOne(
      { name: 'Archive' },
      { $set: { archive: archiveSheet.archive.concat(callback) } }
    );
    await removeEventDBDoc(callback);
    await ctx.reply(`${callback} archived!`);
  }
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};

// Unarchive Attendance Sheet
const unarchiveAttendance_Menu = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const archiveSheet = await Database.getMongoRepository(
    Attendance_mongo
  ).findOneBy({
    name: 'Archive',
  });
  if (archiveSheet) {
    const inlineKeyboard = new InlineKeyboard(
      archiveSheet.archive.map((n) => [
        { text: n, callback_data: `unarchiveSheet-${n}` },
      ])
    );

    await ctx.reply('Which sheet would you like to unarchive?', {
      reply_markup: inlineKeyboard,
    });
  } else {
    await ctx.reply('Unarchive Failed! Please try again');
  }
};

const unarchiveAttendance_Execution = async (
  ctx: CallbackQueryContext<BotContext>
) => {
  await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
  const callback = await ctx.update.callback_query.data.substring(
    'unarchiveSheet-'.length
  );
  await gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
  const sheet =
    await gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
  await sheet.loadCells();
  const date = sheet.getCellByA1('C2').stringValue;
  const archiveSheet = await Database.getMongoRepository(
    Attendance_mongo
  ).findOneBy({
    name: 'Archive',
  });
  if (archiveSheet) {
    if (date) {
      await sheet.updateProperties({ hidden: false });
      const index = await archiveSheet.archive.indexOf(callback);
      await archiveSheet.archive.splice(index, 1);
      await Database.getMongoRepository(Attendance_mongo).updateOne(
        { name: 'Archive' },
        { $set: { archive: archiveSheet.archive } }
      );
      await createEventDBDoc(callback, date);
      await ctx.reply(`${callback} unarchived!`);
    } else {
      await ctx.reply('Unarchive failed! Please try again!');
    }
  }
  await gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
};
