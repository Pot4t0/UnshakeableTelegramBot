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
exports.unarchiveAttendance_unarchive = exports.unarchiveAttendance_select = exports.archiveAttendance_archive = exports.archiveAttendance_select = exports.sendAttendanceToLGChat = exports.selectSvcDateChat = exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.sendNotInReminder_3 = exports.sendNotInReminder_2 = exports.sendNotInReminder_1 = exports.reminderManagement = exports.noDelete = exports.yesDelete = exports.confirmDelete = exports.delAttendanceSheet = exports.specialAddAttendance_3 = exports.specialAddAttendance_2 = exports.specialAddAttendance_1 = exports.addAttendanceSheet_No_2 = exports.addAttendanceSheet_No_1 = exports.addAttendanceSheet_Yes_3 = exports.addAttendanceSheet_Yes_2 = exports.addAttendanceSheet_Yes_1 = exports.addAttendanceSheet = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _db_functions_1 = require("./_db_functions");
const _SessionData_1 = require("../models/_SessionData");
const _index_1 = require("../gsheets/_index");
const _gsheet_init_1 = require("../gsheets/_gsheet_init");
const addAttendanceSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply(`
	Is there LG or is it a special event?
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
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.addAttendanceSheet_Yes_2 = addAttendanceSheet_Yes_2;
//BotOntype = 22
const addAttendanceSheet_Yes_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const getText = (yield ctx.message.text) || '';
    ctx.session.botOnType = yield undefined;
    const weDateArray = getText.split('/');
    const lgDateArray = (yield ((_a = ctx.session.eventDate) === null || _a === void 0 ? void 0 : _a.split('/'))) || '';
    ctx.session = (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const templateSheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsById[0];
    const sheetExist = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
    if (sheetExist == undefined) {
        yield templateSheet.duplicate({
            title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
        });
        const newSheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
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
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
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
    ctx.session = (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const templateSheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsById[0];
    const sheetExist = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
    if (sheetExist == undefined) {
        yield templateSheet.duplicate({
            title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
        });
        const newSheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`];
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
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.addAttendanceSheet_No_2 = addAttendanceSheet_No_2;
const specialAddAttendance_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('Enter Special Event Name:', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 26;
});
exports.specialAddAttendance_1 = specialAddAttendance_1;
//Botontype = 26
const specialAddAttendance_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const getText = (yield ctx.message.text) || '';
    ctx.session.eventName = getText;
    yield ctx.reply('Enter Special Event Date in dd/mm/yyyy:', {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 27;
});
exports.specialAddAttendance_2 = specialAddAttendance_2;
//Botontype = 27
const specialAddAttendance_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event_date = (yield ctx.message.text) || '';
    const event_name = ctx.session.eventName;
    ctx.session.botOnType = yield undefined;
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const templateSheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const sheetExist = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`${event_name} (${event_date}) created`];
    if (sheetExist == undefined) {
        yield templateSheet.duplicate({
            title: `${event_name} (${event_date})`,
        });
        const newSheet = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[`${event_name} (${event_date})`];
        yield newSheet.loadCells();
        const eventDateCell = newSheet.getCellByA1('C2');
        const eventNameCell = newSheet.getCellByA1('C3');
        eventDateCell.value = event_date;
        eventNameCell.value = event_name;
        yield newSheet.saveUpdatedCells();
        yield ctx.reply(`${event_name} (${event_date})`);
    }
    else {
        yield ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.specialAddAttendance_3 = specialAddAttendance_3;
const delAttendanceSheet = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle[ctx.session.eventName || ''];
    yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.deleteSheet(sheet.sheetId);
    yield ctx.reply(`${ctx.session.eventName} deleted!`);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
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
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .map((n) => [
        { text: n.title, callback_data: `notInReminderAttendance-${n.title}` },
    ]));
    yield ctx.reply(`Choose Service Date in dd/mm/yyyy
		  `, {
        reply_markup: inlineKeyboard,
    });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.sendNotInReminder_2 = sendNotInReminder_2;
const sendNotInReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = yield ctx.update.callback_query.data.substring('notInReminderAttendance-'.length);
    const totalNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: { teleUser: { $not: { $eq: '' } } },
    });
    const reminder = ctx.session.text || '';
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.loadCells();
    const checkSpecialCell = sheet.getCellByA1('B2');
    if (checkSpecialCell.value == 'Special Event') {
        // for (let i = 4; i <= totalNames.length + 3; i++) {
        yield Promise.all(totalNames.map((i) => __awaiter(void 0, void 0, void 0, function* () {
            const checkCell = yield sheet.getCellByA1(`C${i.attendanceRow}`);
            if (checkCell.value == null) {
                yield (0, _db_functions_1.sendMessageUser)(i.teleUser, reminder, ctx);
            }
        })));
        // }
    }
    else {
        // for (let i = 4; i <= totalNames.length + 3; i++) {
        yield Promise.all(totalNames.map((i) => __awaiter(void 0, void 0, void 0, function* () {
            // await sheet.loadCells(`F${i}`);
            const checkCell = yield sheet.getCellByA1(`F${i.attendanceRow}`);
            if (checkCell.value == null) {
                yield (0, _db_functions_1.sendMessageUser)(i.teleUser, reminder, ctx);
            }
        })));
        // }
        yield ctx.reply(`Reminder sent!`);
        ctx.session = yield (0, _SessionData_1.initial)();
    }
});
exports.sendNotInReminder_3 = sendNotInReminder_3;
//Send Specific Person Reminder Msg
const sendSpecificReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
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
        yield (0, _db_functions_1.sendMessageUser)(ctx.session.reminderUser, reminder, ctx);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendSpecificReminder_3 = sendSpecificReminder_3;
const selectSvcDateChat = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Template'];
    const special_template = _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
    const ghseetArray = yield _gsheet_init_1.unshakeableAttendanceSpreadsheet.sheetsByIndex;
    const inlineKeyboard = new grammy_1.InlineKeyboard(ghseetArray
        .filter((n) => n != template)
        .filter((n) => n != special_template)
        .map((n) => [
        { text: n.title, callback_data: `selectSvcDateChat-${n.title}` },
    ]));
    yield ctx.reply(`Choose Service Date in dd/mm/yyyy
		  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.selectSvcDateChat = selectSvcDateChat;
const sendAttendanceToLGChat = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = yield ctx.update.callback_query.data.substring('selectSvcDateChat-'.length);
    const totalNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({});
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.loadCells();
    const lgDateCell = yield sheet.getCellByA1('C2');
    const lgCheckCell = yield sheet.getCellByA1('C3');
    const weCheckCell = yield sheet.getCellByA1('F3');
    const weDateCell = yield sheet.getCellByA1('F2');
    const checkSpecialCell = sheet.getCellByA1('B2');
    let msg = `Unshakeable Attendance`;
    if (checkSpecialCell.value == 'Special Event') {
        let cmgMsg = `\n\n${lgCheckCell.value} (${lgDateCell.value}):\n\nComing 🥳\n`;
        let notCmgMsg = '\n\nNot Coming 😢\n';
        // for (let i = 4; i <= totalNames.length + 3; i++) {
        yield Promise.all(totalNames.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            const i = yield n.attendanceRow;
            const attendName = yield sheet.getCellByA1(`B${i}`);
            const lgCell = yield sheet.getCellByA1(`C${i}`);
            const lgReasonCell = yield sheet.getCellByA1(`D${i}`);
            if (lgCell.value == 'Y') {
                cmgMsg += `\n${attendName.value}`;
            }
            else {
                notCmgMsg += `\n${attendName.value} - ${lgReasonCell.value}`;
            }
        })));
        msg += cmgMsg + notCmgMsg;
    }
    else {
        let lgComingMsg = `\n\n${lgCheckCell.value} (${lgDateCell.value}):\n\nComing 🥳\n`;
        let lgNotCmgMsg = '\n\nNot Coming 😢\n';
        let weCmgMsg = `\n\n${weCheckCell.value} (${weDateCell.value}):\n\nComing 🥳\n`;
        let weNotCmgMsg = '\n\nNot Coming 😢\n';
        let dinnerCmgMsg = `\n\nDinner (${weDateCell.value}):\n\nComing 🥳\n`;
        let dinnerNotCmgMsg = '\n\nNot Coming 😢\n';
        // for (let i = 4; i <= totalNames.length + 3; i++) {
        yield Promise.all(totalNames.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            const i = yield n.attendanceRow;
            const attendName = yield sheet.getCellByA1(`B${i}`);
            const weCell = yield sheet.getCellByA1(`F${i}`);
            const weReasonCell = yield sheet.getCellByA1(`G${i}`);
            const lgCell = yield sheet.getCellByA1(`C${i}`);
            const lgReasonCell = yield sheet.getCellByA1(`D${i}`);
            const dinnerCell = yield sheet.getCellByA1(`I${i}`);
            const dinnerReasonCell = yield sheet.getCellByA1(`J${i}`);
            if (lgCheckCell.value != 'No LG') {
                if (lgCell.value == 'Y') {
                    lgComingMsg += `\n${attendName.value}`;
                }
                else {
                    lgNotCmgMsg += `\n${attendName.value} - ${lgReasonCell.value}`;
                }
            }
            if (weCheckCell.value != 'No WE') {
                if (weCell.value == 'Y') {
                    weCmgMsg += `\n${attendName.value}`;
                }
                else {
                    weNotCmgMsg += `\n${attendName.value} - ${weReasonCell.value}`;
                }
                if (dinnerCell.value == 'Y') {
                    dinnerCmgMsg += `\n${attendName.value}`;
                }
                else {
                    dinnerNotCmgMsg += `\n${attendName.value} - ${dinnerReasonCell.value}`;
                }
            }
        })));
        msg +=
            lgComingMsg +
                lgNotCmgMsg +
                weCmgMsg +
                weNotCmgMsg +
                dinnerCmgMsg +
                dinnerNotCmgMsg;
    }
    yield ctx.api.sendMessage(process.env.LG_CHATID || '', msg);
    // await ctx.api.sendMessage(611527651, msg);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.sendAttendanceToLGChat = sendAttendanceToLGChat;
const archiveAttendance_select = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
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
exports.archiveAttendance_select = archiveAttendance_select;
const archiveAttendance_archive = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = yield ctx.update.callback_query.data.substring('archiveSheet-'.length);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.updateProperties({ hidden: true });
    const archiveSheet = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Archive' }, { $set: { archive: archiveSheet === null || archiveSheet === void 0 ? void 0 : archiveSheet.archive.concat(callback) } });
    yield ctx.reply(`${callback} archived!`);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.archiveAttendance_archive = archiveAttendance_archive;
const unarchiveAttendance_select = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const archiveSheet = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    const inlineKeyboard = new grammy_1.InlineKeyboard(archiveSheet === null || archiveSheet === void 0 ? void 0 : archiveSheet.archive.map((n) => [
        { text: n, callback_data: `unarchiveSheet-${n}` },
    ]));
    yield ctx.reply('Which sheet would you like to unarchive?', {
        reply_markup: inlineKeyboard,
    });
});
exports.unarchiveAttendance_select = unarchiveAttendance_select;
const unarchiveAttendance_unarchive = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = yield ctx.update.callback_query.data.substring('unarchiveSheet-'.length);
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.sheetsByTitle[callback];
    yield sheet.updateProperties({ hidden: false });
    const archiveSheet = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).findOneBy({
        name: 'Archive',
    });
    const index = yield (archiveSheet === null || archiveSheet === void 0 ? void 0 : archiveSheet.archive.indexOf(callback));
    if (index) {
        yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Attendance_mongo).updateOne({ name: 'Archive' }, { $set: { archive: archiveSheet === null || archiveSheet === void 0 ? void 0 : archiveSheet.archive.splice(index, 1) } });
        yield ctx.reply(`${callback} unarchived!`);
    }
    yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
});
exports.unarchiveAttendance_unarchive = unarchiveAttendance_unarchive;
