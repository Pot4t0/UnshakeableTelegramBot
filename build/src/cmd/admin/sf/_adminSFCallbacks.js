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
exports.adminSF = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../../database_mongoDB/Entity/_tableEntity");
const _SessionData_1 = require("../../../models/_SessionData");
const _index_1 = require("../../../gsheets/_index");
const _index_2 = require("../../../database_mongoDB/functions/_index");
const _adminSFInternal_1 = require("./_adminSFInternal");
const adminSF = (bot) => {
    // SF Reminder
    bot.callbackQuery('manageSFReminder', reminderManagement);
    bot.callbackQuery('sendReminder-Admin', sendNotInReminder);
    bot.callbackQuery('manualSF', manualSF);
    bot.callbackQuery(/^manualSFName-/g, sendsf);
    bot.callbackQuery(/^manualSendSF-/g, manualSFYesNo);
};
exports.adminSF = adminSF;
// Reminder Management
const reminderManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield _index_2.reminder.reminderMenu(ctx, 'Admin');
});
const sendNotInReminder = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield _index_2.reminder.reminderSendAllNotIn_ReminderMessage(ctx);
});
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
        ctx.session.botOnType = _adminSFInternal_1.adminSFBotOn.manualSFNoFunction;
    }
    else {
        yield ctx.reply('ERROR! Pls try again.');
        ctx.session = yield (0, _SessionData_1.initial)();
    }
});
