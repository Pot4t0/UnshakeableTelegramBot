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
exports.manualSFNo = exports.manualSFYesNo = exports.sendsf = exports.manualSF = exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.sendNotInReminder_3 = exports.sendNotInReminder_2 = exports.sendNotInReminder_1 = exports.reminderManagement = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../models/_SessionData");
const _index_1 = require("../gsheets/_index");
const _index_2 = require("../database_mongoDB/functions/_index");
// Reminder Management
const reminderManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Send to ALL members who yet to send their SF',
                callback_data: 'sendSFNotInReminder',
            },
        ],
        [
            {
                text: 'Send to a specific member',
                callback_data: 'sendSFSpecificReminder',
            },
        ],
    ]);
    yield ctx.reply(`
	  Choose an option

		\n❗️Warning: DO NOT ABUSE THE REMINDER SYSTEM.
	  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.reminderManagement = reminderManagement;
const sendNotInReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.botOnType = 16;
    yield ctx.reply(`Reminder Message:
    \n💡Tip: Put /sendsf in your message!
    `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendNotInReminder_1 = sendNotInReminder_1;
//Uses botOnType = 16 to work
const sendNotInReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.text = yield ctx.message.text;
    if (ctx.session.text == null) {
        (0, exports.sendNotInReminder_2)(ctx);
    }
    yield ctx.reply(`Enter Service Date (dd/mm/yyyy)
		`, {
        reply_markup: {
            force_reply: true,
        },
    });
    ctx.session.botOnType = 17;
});
exports.sendNotInReminder_2 = sendNotInReminder_2;
//Uses botOnType = 17 to work
const sendNotInReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const textDate = yield ctx.message.text;
    if (textDate == null) {
        (0, exports.sendSpecificReminder_3)(ctx);
    }
    if (textDate) {
        const textDateArray = textDate.split('/');
        const offSetDate = new Date(parseInt(textDateArray[2]), parseInt(textDateArray[1]) - 1, parseInt(textDateArray[0]) - 7 + 3); // offsetted to the wk before tues
        const prefix = '<b>Admin Team:</b>\n';
        const reminder = (yield ctx.session.text) || '';
        const InSF = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.SF_mongo).find({
            where: {
                timestamp: { $gte: offSetDate },
            },
        });
        const notInNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            where: {
                teleUser: { $not: { $in: yield InSF.map((n) => `${n.teleUser}`) } },
            },
        });
        const notInUsers = yield notInNames
            .map((n) => `${n.teleUser}`)
            .filter((n) => n != '');
        yield Promise.all(notInUsers.map((n) => __awaiter(void 0, void 0, void 0, function* () {
            yield _index_2.dbMessaging.sendMessageUser(n, prefix + reminder, ctx);
        })));
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
            callback_data: `reminderSFSpecificNames-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Choose member:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_1 = sendSpecificReminder_1;
const sendSpecificReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const telegramUser = yield ctx.update.callback_query.data.substring('reminderSFSpecificNames-'.length);
    ctx.session.reminderUser = telegramUser;
    ctx.session.botOnType = 18;
    yield ctx.reply(`Reminder Message:
    \n💡Tip: Put /sendsf in your message!
    `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendSpecificReminder_2 = sendSpecificReminder_2;
//Uses botOnType = 18 to work
const sendSpecificReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.session.reminderUser) {
        const prefix = '<b>Admin Team:</b>\n';
        const reminder = yield ctx.message.text;
        if (reminder == null) {
            (0, exports.sendSpecificReminder_3)(ctx);
        }
        yield _index_2.dbMessaging.sendMessageUser(ctx.session.reminderUser, prefix + reminder, ctx);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendSpecificReminder_3 = sendSpecificReminder_3;
const manualSF = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const name = yield _db_init_1.Database.getRepository(_tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `manualSFName-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Welcome to Unshakeable Telegram Bot\nPlease select your name:', {
        reply_markup: inlineKeyboard,
    });
});
exports.manualSF = manualSF;
const sendsf = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    ctx.session.name = yield ctx.update.callback_query.data.substring('manualSFName-'.length);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    yield ctx.reply('Attendance', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendsf = sendsf;
const manualSFYesNo = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = yield ctx.update.callback_query.data.substring('manualSendSF-'.length);
    if (callback == 'yes') {
        const sfmsg = '';
        yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
        const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
        const teleUserName = (yield ctx.session.name) || '';
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: teleUserName,
        });
        yield sheet.addRow({
            timeStamp: Date(),
            name: user[0].nameText,
            sermonFeedback: sfmsg,
            attendance: 'Yes',
            reason: '',
        });
        yield ctx.reply('Sent!');
        ctx.session = yield (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
    else if (callback == 'no') {
        yield ctx.reply(`
    Reason
    `, {
            reply_markup: { force_reply: true },
        });
        ctx.session.botOnType = 30;
    }
    else {
        yield ctx.reply('ERROR! Pls try again.');
        ctx.session = yield (0, _SessionData_1.initial)();
    }
});
exports.manualSFYesNo = manualSFYesNo;
//ctx.session.botOnType = 30;
const manualSFNo = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const reason = yield ctx.message.text;
    if (reason == null) {
        (0, exports.manualSFNo)(ctx);
    }
    if (reason) {
        yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
        const sheet = _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram Responses'];
        const teleUserName = (yield ctx.session.name) || '';
        const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
            teleUser: teleUserName,
        });
        yield sheet.addRow({
            timeStamp: Date(),
            name: user[0].nameText,
            sermonFeedback: '',
            attendance: 'No',
            reason: reason,
        });
        yield ctx.reply('Sent!');
        ctx.session = yield (0, _SessionData_1.initial)();
        yield _index_1.gsheet.unshakeableAttendanceSpreadsheet.resetLocalCache();
    }
});
exports.manualSFNo = manualSFNo;
