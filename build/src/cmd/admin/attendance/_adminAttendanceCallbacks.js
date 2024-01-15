"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delAttendanceeSheet_Execution = exports.delAttendanceeSheet_CfmMessage = exports.delAttendanceSheet = exports.addAttendanceSheet = exports.adminAttendance = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../gsheets/_index");
const _gsheet_init_1 = require("../../../gsheets/_gsheet_init");
const _index_2 = require("../../../database_mongoDB/functions/_index");
const __adminAttendanceInternal_1 = require("./__adminAttendanceInternal");
const _telefunctions_1 = require("../../../app/_telefunctions");
// Admin Attendance Callbacks
const adminAttendance = (bot) => {
    // Add Attendance Sheet Menu
    bot.callbackQuery('addAttendanceSheet', exports.addAttendanceSheet);
    // Add LG Event
    bot.callbackQuery('yesLGAddAttendance', addAttendanceSheet_LGEventLGDateMessage);
    // Add No LG Event
    bot.callbackQuery('noLGAddAttendance', addAttendanceSheet_NoLGEventWEDateMessage);
    // Add Special Event
    bot.callbackQuery('specialAddAttendance', addAttendanceSheet_SpecialEventMealMessage);
    bot.callbackQuery(/^addSpecialAttendannce-/g, addAttendanceSheet_SpecialEventNameMessage);
    // Delete Attendance Sheet
    bot.callbackQuery('delAttendanceSheet', exports.delAttendanceSheet);
    bot.callbackQuery(/^delAttendanceeSheet-/g, exports.delAttendanceeSheet_CfmMessage);
    bot.callbackQuery(/^CfmDelAttendanceSheet-/g, exports.delAttendanceeSheet_Execution);
    // //Attendance reminders callbacks
    bot.callbackQuery('manageAttendanceReminder', attendanceReminder);
    // //Send not in reminder (attendance)
    bot.callbackQuery('sendAttendanceNotInReminder', attendanceReminder);
    bot.callbackQuery(/^sendAttendanceReminder-/g, attendanceReminder_Menu);
    bot.callbackQuery('sendReminder-Attendance', attendanceReminder_Msg);
    //Send to Attendance Sheet to LG Chat
    bot.callbackQuery('chatAttendance', sendAttendanceToLGChat_EventMenu);
    bot.callbackQuery(/^sendAttendanceToLGChat/g, sendAttendanceToLGChat_Execution);
    // Archive Attendance Sheet
    bot.callbackQuery('archiveAttendance', archiveAttendance_Menu);
    bot.callbackQuery(/^archiveSheet/g, archiveAttendance_Execution);
    // Unarchive Attendance Sheet
    bot.callbackQuery('unarchiveAttendance', unarchiveAttendance_Menu);
    bot.callbackQuery(/^unarchiveSheet/g, unarchiveAttendance_Execution);
};
exports.adminAttendance = adminAttendance;
// Add Attendance Sheet Menu
// Choose between 3 options
// LG Event, No LG Event, Special Event
// Special Event will have an optional meal option
const addAttendanceSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
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
    yield ctx.reply(`
	Choose option:
	`, {
        reply_markup: inlineKeyboard,
    });
});
exports.addAttendanceSheet = addAttendanceSheet;
const removeEventDBDoc = (title) => __awaiter(void 0, void 0, void 0, function* () {
    const activeDoc = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Active',
    });
    if (activeDoc) {
        const index = yield activeDoc.eventTitle.indexOf(title);
        if (index > -1) {
            yield activeDoc.eventTitle.splice(index, 1);
            yield activeDoc.eventDate.splice(index, 1);
            yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventTitle: activeDoc.eventTitle } });
            yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Active' }, { $set: { eventDate: activeDoc.eventDate } });
        }
    }
});
// Add Sheet With LG
// LG Event LG Date
const addAttendanceSheet_LGEventLGDateMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield ctx.reply('Enter Worship Experience Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.lgEventWEDate;
});
// Add Sheet without LG
// No LG Event Worship Experience Date
const addAttendanceSheet_NoLGEventWEDateMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield ctx.reply('Enter WE Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.createNoLgEventBotOn;
});
// Add Sheet Special Event
// Special Event Meal Options
const addAttendanceSheet_SpecialEventMealMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
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
    yield ctx.reply('Does this Special Event have a meal?: ', {
        reply_markup: inlineKeyboard,
    });
});
// Special Event Name
const addAttendanceSheet_SpecialEventNameMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const meal = yield ctx.update.callback_query.data.substring('addSpecialAttendannce-'.length);
    ctx.session.eventMeal = meal;
    yield ctx.reply('Enter Special Event Name:', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = __adminAttendanceInternal_1.adminAttendanceBotOn.splEventDateBotOn;
});
// Delete Attendance Sheet
// Able to delete any attendance sheet except for template and special event template
const delAttendanceSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .map((n) => [
        { text: n.title, callback_data: `delAttendanceeSheet-${n.title}` },
    ]));
    yield ctx.reply('Which Google Sheet would you like to delete?', {
        reply_markup: inlineKeyboard,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.delAttendanceSheet = delAttendanceSheet;
// Delete Attendance Sheet Confirmation Message
const delAttendanceeSheet_CfmMessage = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const sheetName = yield ctx.update.callback_query.data.substring('delAttendanceeSheet-'.length);
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
    yield ctx.reply(`Are you sure you want to delete ${sheetName}?`, {
        reply_markup: inlineKeyboard,
    });
});
exports.delAttendanceeSheet_CfmMessage = delAttendanceeSheet_CfmMessage;
// Delete Attendance Sheet Execution
const delAttendanceeSheet_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const cfm = yield ctx.update.callback_query.data.substring('CfmDelAttendanceSheet-'.length);
    if (cfm == 'Y') {
        if (ctx.session.eventName) {
            yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
            const sheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.eventName];
            yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.deleteSheet(sheet.sheetId);
            yield removeEventDBDoc(ctx.session.eventName);
            yield ctx.reply(`${ctx.session.eventName} deleted!`);
            yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
        }
        else {
            yield ctx.reply(`Error during deletion! Please try again!`);
        }
    }
    else if (cfm == 'N') {
        yield ctx.reply(`Deletion cancelled!`);
    }
    else {
        yield ctx.reply(`Error during deletion! Please try again!`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.delAttendanceeSheet_Execution = delAttendanceeSheet_Execution;
//Reminder Management
//Choose which event to send reminder for
const attendanceReminder = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .map((n) => [
        { text: n.title, callback_data: `sendAttendanceReminder-${n.title}` },
    ]));
    yield ctx.reply(`Choose which event you want to send reminder for:
		  `, {
        reply_markup: inlineKeyboard,
    });
});
//Choose which reminder to send (Not In / Specific)
const attendanceReminder_Menu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const title = yield ctx.update.callback_query.data.substring('sendAttendanceReminder-'.length);
    ctx.session.name = yield title;
    yield _index_2.reminder.reminderMenu(ctx, 'Attendance');
});
//Send Not In Reminder Messaage
const attendanceReminder_Msg = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const title = ctx.session.name;
    if (title) {
        const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[title];
        yield _index_2.reminder.reminderSendAllNotIn_ReminderMessage(ctx, sheet);
    }
});
//Send To LG Chat
//Choose which event to send to LG Chat
const sendAttendanceToLGChat_EventMenu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const activeEvents = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).find({
        name: 'Active',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(activeEvents[0].eventTitle.map((n) => [
        {
            text: n,
            callback_data: `sendAttendanceToLGChat-${n}`,
        },
    ]));
    yield ctx.reply(`Choose which event you want to send to LG Chat:\n`, {
        reply_markup: inlineKeyboard,
    });
});
//Send To LG Chat Execution
const sendAttendanceToLGChat_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = yield ctx.update.callback_query.data.substring('sendAttendanceToLGChat-'.length);
    const totalNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({});
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.loadCells();
    const lgDateCell = yield sheet.getCellByA1('F2');
    const lgCheckCell = yield sheet.getCellByA1('F3');
    const weCheckCell = yield sheet.getCellByA1('C3');
    const weDateCell = yield sheet.getCellByA1('C2');
    const checkSpecialCell = sheet.getCellByA1('B2');
    const mealCheckCell = sheet.getCellByA1('F3');
    let msg = `Unshakeable Attendance`;
    if (checkSpecialCell.value == 'Special Event') {
        let cmgMsg = `\n\n${weCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
        let notCmgMsg = `\n\nNot Coming (${weCheckCell.value}) 😢\n`;
        let nvrSubmitMsg = '\n\nYet to submit ❗️\n';
        let mealCmgMsg = `\n\n${mealCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
        let mealNotCmgMsg = `\n\nNot Coming (${mealCheckCell.value})😢\n`;
        yield Promise.all(totalNames.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            const i = yield n.attendanceRow;
            const attendName = yield sheet.getCellByA1(`B${i}`);
            const eventCell = yield sheet.getCellByA1(`C${i}`);
            const eventReasonCell = yield sheet.getCellByA1(`D${i}`);
            const mealCell = yield sheet.getCellByA1(`F${i}`);
            const mealReasonCell = yield sheet.getCellByA1(`G${i}`);
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
        })));
        msg += cmgMsg + notCmgMsg + mealCmgMsg + mealNotCmgMsg + nvrSubmitMsg;
    }
    else {
        let lgComingMsg = `\n\n<b>${lgCheckCell.value} (${lgDateCell.value}):</b>\n\n<b>Coming 🥳</b>\n`;
        let lgNotCmgMsg = '\n\n<b>Not Coming (LG) 😢</b>\n';
        let weCmgMsg = `\n\n<b>${weCheckCell.value} (${weDateCell.value}):</b>\n\n<b>Coming 🥳</b>\n`;
        let weNotCmgMsg = '\n\n<b>Not Coming (WE) 😢</b>\n';
        let dinnerCmgMsg = `\n\n<b>Dinner (${weDateCell.value}):</b>\n\n<b>Coming 🥳</b>\n`;
        let dinnerNotCmgMsg = '\n\n<b>Not Coming (Dinner) 😢</b>\n';
        let nvrSubmitMsg = '\n\n<b>Yet to submit ❗️</b>\n';
        yield Promise.all(totalNames.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            const i = n.attendanceRow;
            const attendName = sheet.getCellByA1(`B${i}`);
            const weCell = sheet.getCellByA1(`C${i}`);
            const weReasonCell = sheet.getCellByA1(`D${i}`);
            const lgCell = sheet.getCellByA1(`F${i}`);
            const lgReasonCell = sheet.getCellByA1(`G${i}`);
            const dinnerCell = sheet.getCellByA1(`I${i}`);
            const dinnerReasonCell = sheet.getCellByA1(`J${i}`);
            if (lgCheckCell.value != 'No LG') {
                if (lgCell.value == 'Y') {
                    lgComingMsg += `\n${attendName.value}`;
                }
                else if (lgCell.value == 'N') {
                    lgNotCmgMsg += `\n${attendName.value} - ${lgReasonCell.value}`;
                }
            }
            else {
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
        })));
        msg +=
            weCmgMsg +
                weNotCmgMsg +
                lgComingMsg +
                lgNotCmgMsg +
                dinnerCmgMsg +
                dinnerNotCmgMsg +
                nvrSubmitMsg;
    }
    yield ctx.api.sendMessage(process.env.LG_CHATID || '', msg, {
        parse_mode: 'HTML',
    });
    console.log(msg);
    yield ctx.reply(`Sent to LG Chat!`);
    _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
// Archive Attendance Sheet
const archiveAttendance_Menu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const archivedSheets = _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).find({
        name: 'Archive',
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const archivedSheetsArray = (yield archivedSheets)
        .map((n) => n.archive)
        .flat();
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .filter((n) => !archivedSheetsArray.includes(n.title))
        .map((n) => [{ text: n.title, callback_data: `archiveSheet-${n.title}` }]));
    yield ctx.reply('Which sheet would you like to archive?', {
        reply_markup: inlineKeyboard,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
const archiveAttendance_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = yield ctx.update.callback_query.data.substring('archiveSheet-'.length);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.updateProperties({ hidden: true });
    const archiveSheet = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    if (archiveSheet) {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Archive' }, { $set: { archive: archiveSheet.archive.concat(callback) } });
        yield removeEventDBDoc(callback);
        yield ctx.reply(`${callback} archived!`);
    }
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
// Unarchive Attendance Sheet
const unarchiveAttendance_Menu = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const archiveSheet = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    if (archiveSheet) {
        const inlineKeyboard = new grammy_1.InlineKeyboard(archiveSheet.archive.map((n) => [
            { text: n, callback_data: `unarchiveSheet-${n}` },
        ]));
        yield ctx.reply('Which sheet would you like to unarchive?', {
            reply_markup: inlineKeyboard,
        });
    }
    else {
        yield ctx.reply('Unarchive Failed! Please try again');
    }
});
const unarchiveAttendance_Execution = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, _telefunctions_1.removeInLineButton)(ctx);
    const callback = yield ctx.update.callback_query.data.substring('unarchiveSheet-'.length);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.loadCells();
    const date = sheet.getCellByA1('C2').stringValue;
    const archiveSheet = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    if (archiveSheet) {
        if (date) {
            yield sheet.updateProperties({ hidden: false });
            const index = yield archiveSheet.archive.indexOf(callback);
            yield archiveSheet.archive.splice(index, 1);
            yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Archive' }, { $set: { archive: archiveSheet.archive } });
            yield (0, __adminAttendanceInternal_1.createEventDBDoc)(callback, date);
            yield ctx.reply(`${callback} unarchived!`);
        }
        else {
            yield ctx.reply('Unarchive failed! Please try again!');
        }
    }
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
