"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delAttendanceeSheet_Execution = exports.delAttendanceeSheet_CfmMessage = exports.delAttendanceSheet = exports.addAttendanceSheet = exports.adminAttendance = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../database_mongoDB/functions/_index");
const __adminAttendanceInternal_1 = require("./__adminAttendanceInternal");
const _telefunctions_1 = require("../../../app/_telefunctions");
const _initialise_1 = require("../../../functions/_initialise");
// Admin Attendance Callbacks
const adminAttendance = (bot) => {
    let weMsg = '';
    let lgMsg = '';
    // Add Attendance Sheet Menu
    bot.callbackQuery('addAttendanceSheet', _telefunctions_1.loadFunction, exports.addAttendanceSheet);
    // Add LG Event
    bot.callbackQuery('yesLGAddAttendance', _telefunctions_1.loadFunction, addAttendanceSheet_LGEventLGDateMessage);
    // Add No LG Event
    bot.callbackQuery('noLGAddAttendance', _telefunctions_1.loadFunction, addAttendanceSheet_NoLGEventWEDateMessage);
    // Add Special Event
    bot.callbackQuery('specialAddAttendance', _telefunctions_1.loadFunction, addAttendanceSheet_SpecialEventMealMessage);
    bot.callbackQuery(/^addSpecialAttendannce-/g, _telefunctions_1.loadFunction, addAttendanceSheet_SpecialEventNameMessage);
    // Delete Attendance Sheet
    bot.callbackQuery('delAttendanceSheet', _telefunctions_1.loadFunction, exports.delAttendanceSheet);
    bot.callbackQuery(/^delAttendanceeSheet-/g, _telefunctions_1.loadFunction, exports.delAttendanceeSheet_CfmMessage);
    bot.callbackQuery(/^CfmDelAttendanceSheet-/g, _telefunctions_1.loadFunction, exports.delAttendanceeSheet_Execution);
    // //Attendance reminders callbacks
    bot.callbackQuery('manageAttendanceReminder', _telefunctions_1.loadFunction, attendanceReminder);
    // //Send not in reminder (attendance)
    bot.callbackQuery('sendAttendanceNotInReminder', _telefunctions_1.loadFunction, attendanceReminder);
    bot.callbackQuery(/^sendAttendanceReminder-/g, _telefunctions_1.loadFunction, attendanceReminder_Menu);
    bot.callbackQuery('sendReminder-Attendance', _telefunctions_1.loadFunction, attendanceReminder_Msg);
    //Send to Attendance Sheet to LG Chat
    bot.callbackQuery('chatAttendance', _telefunctions_1.loadFunction, sendAttendanceToLGChat_EventMenu);
    bot.callbackQuery(/^sendAttendanceToLGChat/g, _telefunctions_1.loadFunction, async (ctx) => {
        const msgArray = await sendAttendanceToLGChat_Execution(ctx);
        weMsg = msgArray[0];
        lgMsg = msgArray[1];
    });
    bot.callbackQuery(/^sendAttendance-WELGEvent-/g, _telefunctions_1.loadFunction, (ctx) => {
        sendAttendanceToLGChat_WELGEvent(ctx, weMsg, lgMsg);
    });
    // Archive Attendance Sheet
    bot.callbackQuery('archiveAttendance', _telefunctions_1.loadFunction, archiveAttendance_Menu);
    bot.callbackQuery(/^archiveSheet/g, _telefunctions_1.loadFunction, archiveAttendance_Execution);
    // Unarchive Attendance Sheet
    bot.callbackQuery('unarchiveAttendance', _telefunctions_1.loadFunction, unarchiveAttendance_Menu);
    bot.callbackQuery(/^unarchiveSheet/g, _telefunctions_1.loadFunction, unarchiveAttendance_Execution);
};
exports.adminAttendance = adminAttendance;
// Add Attendance Sheet Menu
// Choose between 3 options
// LG Event, No LG Event, Special Event
// Special Event will have an optional meal option
const addAttendanceSheet = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    await ctx.reply(`
	Choose option:
	`, {
        reply_markup: inlineKeyboard,
    });
};
exports.addAttendanceSheet = addAttendanceSheet;
const removeEventDBDoc = async (title) => {
    const activeDoc = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Active',
    });
    if (activeDoc) {
        const index = await activeDoc.eventTitle.indexOf(title);
        if (index > -1) {
            await activeDoc.eventTitle.splice(index, 1);
            await activeDoc.eventDate.splice(index, 1);
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventTitle: activeDoc.eventTitle } });
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventDate: activeDoc.eventDate } });
        }
    }
};
// Add Sheet With LG
// LG Event LG Date
const addAttendanceSheet_LGEventLGDateMessage = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply('Enter Worship Experience Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.lgEventWEDate;
};
// Add Sheet without LG
// No LG Event Worship Experience Date
const addAttendanceSheet_NoLGEventWEDateMessage = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    await ctx.reply('Enter WE Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.createNoLgEventBotOn;
};
// Add Sheet Special Event
// Special Event Meal Options
const addAttendanceSheet_SpecialEventMealMessage = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
const addAttendanceSheet_SpecialEventNameMessage = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const meal = ctx.update.callback_query.data.substring('addSpecialAttendannce-'.length);
    ctx.session.eventMeal = meal;
    await ctx.reply('Enter Special Event Name:', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.splEventDateBotOn;
};
// Delete Attendance Sheet
// Able to delete any attendance sheet except for template and special event template
const delAttendanceSheet = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
    const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = await unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .map((n) => [
        { text: n.title, callback_data: `delAttendanceeSheet-${n.title}` },
    ]));
    await ctx.reply('Which Google Sheet would you like to delete?', {
        reply_markup: inlineKeyboard,
    });
    unshakeableAttendanceSpreadsheet.resetLocalCache();
};
exports.delAttendanceSheet = delAttendanceSheet;
// Delete Attendance Sheet Confirmation Message
const delAttendanceeSheet_CfmMessage = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const sheetName = ctx.update.callback_query.data.substring('delAttendanceeSheet-'.length);
    ctx.session.eventName = sheetName;
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
exports.delAttendanceeSheet_CfmMessage = delAttendanceeSheet_CfmMessage;
// Delete Attendance Sheet Execution
const delAttendanceeSheet_Execution = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const cfm = ctx.update.callback_query.data.substring('CfmDelAttendanceSheet-'.length);
    if (cfm == 'Y') {
        if (ctx.session.eventName) {
            const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
            await unshakeableAttendanceSpreadsheet.loadInfo();
            const sheet = unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.eventName];
            await unshakeableAttendanceSpreadsheet.deleteSheet(sheet.sheetId);
            await removeEventDBDoc(ctx.session.eventName);
            await ctx.reply(`${ctx.session.eventName} deleted!`);
            await unshakeableAttendanceSpreadsheet.resetLocalCache();
        }
        else {
            await ctx.reply(`Error during deletion! Please try again!`);
        }
    }
    else if (cfm == 'N') {
        await ctx.reply(`Deletion cancelled!`);
    }
    else {
        await ctx.reply(`Error during deletion! Please try again!`);
    }
    ctx.session = (0, _SessionData_1.initial)();
};
exports.delAttendanceeSheet_Execution = delAttendanceeSheet_Execution;
//Reminder Management
//Choose which event to send reminder for
const attendanceReminder = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const archivedSheets = _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).find({
        name: 'Archive',
    });
    const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
    await unshakeableAttendanceSpreadsheet.loadInfo();
    const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const archivedSheetsArray = (await archivedSheets)
        .map((n) => n.archive)
        .flat();
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .filter((n) => !archivedSheetsArray.includes(n.title))
        .map((n) => [
        { text: n.title, callback_data: `sendAttendanceReminder-${n.title}` },
    ]));
    await ctx.reply(`Choose which event you want to send reminder for:
		  `, {
        reply_markup: inlineKeyboard,
    });
};
//Choose which reminder to send (Not In / Specific)
const attendanceReminder_Menu = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const title = await ctx.update.callback_query.data.substring('sendAttendanceReminder-'.length);
    ctx.session.name = await title;
    await _index_1.reminder.reminderMenu(ctx, 'Attendance');
};
//Send Not In Reminder Messaage
const attendanceReminder_Msg = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const title = ctx.session.name;
    if (title) {
        const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
        const sheet = unshakeableAttendanceSpreadsheet.sheetsByTitle[title];
        await _index_1.reminder.reminderSendAllNotIn_ReminderMessage(ctx, sheet);
    }
};
//Send To LG Chat
//Choose which event to send to LG Chat
const sendAttendanceToLGChat_EventMenu = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const activeEvents = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).find({
        name: 'Active',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(activeEvents[0].eventTitle.map((n) => [
        {
            text: n,
            callback_data: `sendAttendanceToLGChat-${n}`,
        },
    ]));
    await ctx.reply(`Choose which event you want to send to LG Chat:\n`, {
        reply_markup: inlineKeyboard,
    });
};
//Send To LG Chat Execution
const sendAttendanceToLGChat_Execution = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = await ctx.update.callback_query.data.substring('sendAttendanceToLGChat-'.length);
    const totalNames = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({});
    const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
    await unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    await sheet.loadCells();
    const lgDateCell = sheet.getCellByA1('F2');
    const lgCheckCell = sheet.getCellByA1('F3');
    const weCheckCell = sheet.getCellByA1('C3');
    const weDateCell = sheet.getCellByA1('C2');
    const checkSpecialCell = sheet.getCellByA1('B2');
    const mealCheckCell = sheet.getCellByA1('F3');
    let msg = `Unshakeable Attendance`;
    let weMsg = 'Unshakeable Attendance - WE';
    let lgMsg = 'Unshakeable Attendance - LG';
    if (checkSpecialCell.value == 'Special Event') {
        // Special Event
        let cmgMsg = `\n\n${weCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
        let notCmgMsg = `\n\nNot Coming (${weCheckCell.value}) 😢\n`;
        let nvrSubmitMsg = '\n\nYet to submit ❗️\n';
        let mealCmgMsg = `\n\n${mealCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
        let mealNotCmgMsg = `\n\nNot Coming (${mealCheckCell.value})😢\n`;
        await Promise.all(totalNames.map(async (n) => {
            const i = n.attendanceRow;
            const attendName = sheet.getCellByA1(`B${i}`);
            const eventCell = sheet.getCellByA1(`C${i}`);
            const eventReasonCell = sheet.getCellByA1(`D${i}`);
            const mealCell = sheet.getCellByA1(`F${i}`);
            const mealReasonCell = sheet.getCellByA1(`G${i}`);
            if (eventCell.value == 'Y') {
                cmgMsg += `\n${attendName.value}`;
            }
            else if (eventCell.value == 'N') {
                notCmgMsg += `\n${attendName.value} - ${eventReasonCell.value}`;
            }
            else {
                nvrSubmitMsg += `\n${attendName.value}`;
            }
            if (mealCheckCell.value) {
                if (mealCell.value == 'Y') {
                    mealCmgMsg += `\n${attendName.value}`;
                }
                else if (mealCell.value == 'N') {
                    mealNotCmgMsg += `\n${attendName.value} - ${mealReasonCell.value}`;
                }
            }
            else {
                mealCmgMsg = '';
                mealNotCmgMsg = '';
            }
        }));
        msg += cmgMsg + notCmgMsg + mealCmgMsg + mealNotCmgMsg + nvrSubmitMsg;
    }
    else {
        // WE Sheet
        let lgComingMsg = `\n\n<b>${lgCheckCell.value} (${lgDateCell.value}):</b>\n\n<b>Coming 🥳</b>\n`;
        let lgNotCmgMsg = '\n\n<b>Not Coming (LG) 😢</b>\n';
        let weCmgMsg = `\n\n<b>${weCheckCell.value} (${weDateCell.value}):</b>\n\n<b>Coming 🥳</b>\n`;
        let weNotCmgMsg = '\n\n<b>Not Coming (WE) 😢</b>\n';
        let dinnerCmgMsg = `\n\n<b>Dinner (${weDateCell.value}):</b>\n\n<b>Coming 🥳</b>\n`;
        let dinnerNotCmgMsg = '\n\n<b>Not Coming (Dinner) 😢</b>\n';
        let nvrSubmitMsg = '\n\n<b>Yet to submit ❗️</b>\n';
        await Promise.all(totalNames.map(async (n) => {
            const i = n.attendanceRow;
            const attendName = sheet.getCellByA1(`B${i}`);
            const weCell = sheet.getCellByA1(`C${i}`);
            const weReasonCell = sheet.getCellByA1(`D${i}`);
            const lgCell = sheet.getCellByA1(`F${i}`);
            const lgReasonCell = sheet.getCellByA1(`G${i}`);
            const dinnerCell = sheet.getCellByA1(`I${i}`);
            const dinnerReasonCell = sheet.getCellByA1(`J${i}`);
            if (lgCheckCell.value != 'No LG') {
                // WE + LG
                if (lgCell.value == 'Y') {
                    lgComingMsg += `\n${attendName.value}`;
                }
                else if (lgCell.value == 'N') {
                    lgNotCmgMsg += `\n${attendName.value} - ${lgReasonCell.value}`;
                }
            }
            else {
                // WE only
                lgComingMsg = '';
                lgNotCmgMsg = '';
            }
            if (weCheckCell.value) {
                if (weCell.value == 'Y') {
                    weCmgMsg += `\n${attendName.value}`;
                }
                else if (weCell.value == 'N') {
                    weNotCmgMsg += `\n${attendName.value} - ${weReasonCell.value}`;
                }
                else {
                    nvrSubmitMsg += `\n${attendName.value}`;
                }
                if (dinnerCell.value == 'Y') {
                    dinnerCmgMsg += `\n${attendName.value}`;
                }
                else if (dinnerCell.value == 'N') {
                    dinnerNotCmgMsg += `\n${attendName.value} - ${dinnerReasonCell.value}`;
                }
            }
        }));
        msg +=
            weCmgMsg +
                weNotCmgMsg +
                lgComingMsg +
                lgNotCmgMsg +
                dinnerCmgMsg +
                dinnerNotCmgMsg +
                nvrSubmitMsg;
        weMsg +=
            weCmgMsg + weNotCmgMsg + dinnerCmgMsg + dinnerNotCmgMsg + nvrSubmitMsg;
        lgMsg += lgComingMsg + lgNotCmgMsg + nvrSubmitMsg;
    }
    if (checkSpecialCell.value == 'Special Event' ||
        lgCheckCell.value == 'No LG') {
        await ctx.api.sendMessage(process.env.LG_CHATID || '', msg, {
            parse_mode: 'HTML',
        });
        console.log(msg);
        await ctx.reply(`Sent to LG Chat!`);
    }
    else {
        const inline_keyboard = new grammy_1.InlineKeyboard([
            [
                {
                    text: 'WE',
                    callback_data: `sendAttendance-WELGEvent-WE`,
                },
            ],
            [
                {
                    text: 'LG',
                    callback_data: `sendAttendance-WELGEvent-LG`,
                },
            ],
        ]);
        await ctx.reply(`Do you want to send WE or LG to LG Chat?`, {
            reply_markup: inline_keyboard,
        });
    }
    unshakeableAttendanceSpreadsheet.resetLocalCache();
    return [weMsg, lgMsg];
};
const sendAttendanceToLGChat_WELGEvent = async (ctx, weMsg, lgMsg) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    if (!weMsg || !lgMsg || weMsg == '' || lgMsg == '') {
        await ctx.reply(`Error in sending to LG Chat!`);
        return;
    }
    const msgType = ctx.update.callback_query.data.substring('sendAttendance-WELGEvent-'.length);
    switch (msgType) {
        case 'WE':
            await ctx.api.sendMessage(process.env.LG_CHATID || '', weMsg, {
                parse_mode: 'HTML',
            });
            console.log(weMsg);
            await ctx.reply(`Sent to LG Chat!`);
            break;
        case 'LG':
            await ctx.api.sendMessage(process.env.LG_CHATID || '', lgMsg, {
                parse_mode: 'HTML',
            });
            console.log(lgMsg);
            await ctx.reply(`Sent to LG Chat!`);
            break;
        default:
            await ctx.reply(`Error in sending to LG Chat!`);
            break;
    }
};
// Archive Attendance Sheet
const archiveAttendance_Menu = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const archivedSheets = _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).find({
        name: 'Archive',
    });
    const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
    const template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const archivedSheetsArray = (await archivedSheets)
        .map((n) => n.archive)
        .flat();
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .filter((n) => !archivedSheetsArray.includes(n.title))
        .map((n) => [{ text: n.title, callback_data: `archiveSheet-${n.title}` }]));
    await ctx.reply('Which sheet would you like to archive?', {
        reply_markup: inlineKeyboard,
    });
    unshakeableAttendanceSpreadsheet.resetLocalCache();
};
const archiveAttendance_Execution = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = ctx.update.callback_query.data.substring('archiveSheet-'.length);
    const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
    unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    await sheet.updateProperties({ hidden: true });
    const archiveSheet = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    if (archiveSheet) {
        await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Archive' }, { $set: { archive: archiveSheet.archive.concat(callback) } });
        await removeEventDBDoc(callback);
        await ctx.reply(`${callback} archived!`);
    }
    unshakeableAttendanceSpreadsheet.resetLocalCache();
};
// Unarchive Attendance Sheet
const unarchiveAttendance_Menu = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const archiveSheet = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    if (archiveSheet) {
        const inlineKeyboard = new grammy_1.InlineKeyboard(archiveSheet.archive.map((n) => [
            { text: n, callback_data: `unarchiveSheet-${n}` },
        ]));
        await ctx.reply('Which sheet would you like to unarchive?', {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        await ctx.reply('Unarchive Failed! Please try again');
    }
};
const unarchiveAttendance_Execution = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = await ctx.update.callback_query.data.substring('unarchiveSheet-'.length);
    const unshakeableAttendanceSpreadsheet = await (0, _initialise_1.gsheet)('attendance');
    const sheet = unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    await sheet.loadCells();
    const date = sheet.getCellByA1('C2').stringValue;
    const archiveSheet = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    if (archiveSheet) {
        if (date) {
            await sheet.updateProperties({ hidden: false });
            const index = archiveSheet.archive.indexOf(callback);
            archiveSheet.archive.splice(index, 1);
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Archive' }, { $set: { archive: archiveSheet.archive } });
            await (0, __adminAttendanceInternal_1.createEventDBDoc)(callback, date);
            await ctx.reply(`${callback} unarchived!`);
        }
        else {
            await ctx.reply('Unarchive failed! Please try again!');
        }
    }
    unshakeableAttendanceSpreadsheet.resetLocalCache();
};
