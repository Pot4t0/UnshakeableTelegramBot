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
exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.sendNotInReminder_3 = exports.sendNotInReminder_2 = exports.sendNotInReminder_1 = exports.reminderManagement = exports.noDelete = exports.yesDelete = exports.confirmDelete = exports.delAttendanceSheet = exports.addAttendanceSheet_No_2 = exports.addAttendanceSheet_No_1 = exports.addAttendanceSheet_Yes_3 = exports.addAttendanceSheet_Yes_2 = exports.addAttendanceSheet_Yes_1 = exports.addAttendanceSheet = void 0;
const grammy_1 = require("grammy");
const db_init_1 = require("../database_mongoDB/db-init");
const tableEntity_1 = require("../database_mongoDB/Entity/tableEntity");
const db_functions_1 = require("./db_functions");
const SessionData_1 = require("../models/SessionData");
const gsheets_1 = require("../gsheets");
const gsheet_init_1 = require("../gsheets/gsheet_init");
const addAttendanceSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`
	Is there LG?
	`, {
        reply_markup: inlineKeyboard,
    });
});
exports.addAttendanceSheet = addAttendanceSheet;
//Add Sheet With LG
const addAttendanceSheet_Yes_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('Enter LG Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 21;
});
exports.addAttendanceSheet_Yes_1 = addAttendanceSheet_Yes_1;
//BotOntype = 21
const addAttendanceSheet_Yes_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.botOnType = yield undefined;
    ctx.session.eventDate = (yield ctx.message.text) || '';
    yield ctx.reply('Enter Worship Experience Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 22;
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.addAttendanceSheet_Yes_2 = addAttendanceSheet_Yes_2;
//BotOntype = 22
const addAttendanceSheet_Yes_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const getText = (yield ctx.message.text) || '';
    ctx.session.botOnType = yield undefined;
    const weDateArray = getText.split('/');
    const lgDateArray = (yield ((_a = ctx.session.eventDate) === null || _a === void 0 ? void 0 : _a.split('/'))) || '';
    ctx.session = (0, SessionData_1.initial)();
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const templateSheet = gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsById[0];
    const sheetExist = yield gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
    if (sheetExist == undefined) {
        yield templateSheet.duplicate({
            title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
        });
        const newSheet = yield gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
        yield newSheet.loadCells();
        const lgDateCell = yield newSheet.getCellByA1(`C2`);
        const weDateCell = yield newSheet.getCellByA1(`F2`);
        weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
        lgDateCell.value = `${lgDateArray[0]}/${lgDateArray[1]}/${lgDateArray[2]}`;
        yield newSheet.saveUpdatedCells();
        yield ctx.reply(`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]} sheet has been created`);
    }
    else {
        yield ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
    }
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.addAttendanceSheet_Yes_3 = addAttendanceSheet_Yes_3;
//Add Sheet without LG
const addAttendanceSheet_No_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('Enter WE Date in dd/mm/yyyy: ', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 23;
});
exports.addAttendanceSheet_No_1 = addAttendanceSheet_No_1;
//BotOntype = 23
const addAttendanceSheet_No_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const getText = (yield ctx.message.text) || '';
    ctx.session.botOnType = yield undefined;
    const weDateArray = getText.split('/');
    ctx.session = (0, SessionData_1.initial)();
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const templateSheet = gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsById[0];
    const sheetExist = yield gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
    if (sheetExist == undefined) {
        yield templateSheet.duplicate({
            title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
        });
        const newSheet = yield gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
        yield newSheet.loadCells();
        2;
        const lgCell = yield newSheet.getCellByA1(`C3`);
        const lgReasonCell = yield newSheet.getCellByA1(`D3`);
        const weDateCell = yield newSheet.getCellByA1(`F2`);
        weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
        lgCell.value = 'No LG';
        lgReasonCell.value = '';
        yield newSheet.saveUpdatedCells();
        yield ctx.reply(`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]} sheet has been created`);
    }
    else {
        yield ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
    }
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.addAttendanceSheet_No_2 = addAttendanceSheet_No_2;
const delAttendanceSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const ghseetArray = yield gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .map((n) => [
        { text: n.title, callback_data: `delAttendanceeSheet-${n.title}` },
    ]));
    yield ctx.reply('Which Google Sheet would you like to delete?', {
        reply_markup: inlineKeyboard,
    });
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.delAttendanceSheet = delAttendanceSheet;
const confirmDelete = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.eventName = yield ctx.update.callback_query.data.substring('delAttendanceeSheet-'.length);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply('Are you sure?', { reply_markup: inlineKeyboard });
});
exports.confirmDelete = confirmDelete;
const yesDelete = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.eventName || ''];
    yield gsheet_init_1.unshakeableAttendanceSpreadsheet.deleteSheet(sheet.sheetId);
    yield ctx.reply(`${ctx.session.eventName} deleted!`);
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.yesDelete = yesDelete;
const noDelete = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('Deletion cancelled!');
});
exports.noDelete = noDelete;
// //Reminder Management
const reminderManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`
		  Choose option
		  \n(Send all option will exclude the person its for)

		  \nDO NOT ABUSE THE REMINDER SYSTEM.
		  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.reminderManagement = reminderManagement;
const sendNotInReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.botOnType = 24;
    yield ctx.reply(`Write down the reminder msg for people that have not sent it in
		\nSuggestion to put /sendattendance so that user can click on it
		`, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendNotInReminder_1 = sendNotInReminder_1;
//Uses botOnType = 24 to work
const sendNotInReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.text = (yield ctx.message.text) || '';
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const ghseetArray = yield gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .map((n) => [
        { text: n.title, callback_data: `notInReminderAttendance-${n.title}` },
    ]));
    yield ctx.reply(`Choose Service Date in dd/mm/yyyy
		  `, {
        reply_markup: inlineKeyboard,
    });
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.sendNotInReminder_2 = sendNotInReminder_2;
const sendNotInReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = yield ctx.update.callback_query.data.substring('notInReminderAttendance-'.length);
    const totalNames = yield db_init_1.Database.getMongoRepository(tableEntity_1.Names).find({});
    const reminder = ctx.session.text || '';
    yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield gsheets_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    for (let i = 4; i <= totalNames.length + 3; i++) {
        yield sheet.loadCells(`F${i}`);
        const checkCell = yield sheet.getCellByA1(`F${i}`);
        if (checkCell.value == null) {
            const user = yield db_init_1.Database.getMongoRepository(tableEntity_1.Names).find({
                attendanceRow: i,
            });
            yield (0, db_functions_1.sendMessageUser)(user[0].teleUser, reminder, ctx);
        }
    }
    yield ctx.reply(`Reminder sent!`);
    ctx.session = yield (0, SessionData_1.initial)();
});
exports.sendNotInReminder_3 = sendNotInReminder_3;
//Send Specific Person Reminder Msg
const sendSpecificReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = yield db_init_1.Database.getRepository(tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `reminderAttendanceSpecificNames-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Choose member:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_1 = sendSpecificReminder_1;
const sendSpecificReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const telegramUser = yield ctx.update.callback_query.data.substring('reminderAttendanceSpecificNames-'.length);
    ctx.session.reminderUser = telegramUser;
    ctx.session.botOnType = 25;
    yield ctx.reply(`Write down the reminder msg that you want to send to @${telegramUser}
		\nSuggestion to put /sendattendance so that user can click on it
		`, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendSpecificReminder_2 = sendSpecificReminder_2;
//Uses botOnType = 25 to work
const sendSpecificReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.session.reminderUser) {
        const reminder = (yield ctx.message.text) || '';
        yield (0, db_functions_1.sendMessageUser)(ctx.session.reminderUser, reminder, ctx);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, SessionData_1.initial)();
});
exports.sendSpecificReminder_3 = sendSpecificReminder_3;
