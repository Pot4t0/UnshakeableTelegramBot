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
exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.sendNotInReminder_3 = exports.sendNotInReminder_2 = exports.sendNotInReminder_1 = exports.reminderManagement = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const _db_functions_1 = require("./_db_functions");
const _SessionData_1 = require("../models/_SessionData");
const _index_1 = require("../gsheets/_index");
// Reminder Management
const reminderManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
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
    ctx.session.botOnType = 16;
    yield ctx.reply(`Write down the reminder msg for people that have not sent it in
	  \nSuggestion to put /sendsf so that user can click on it
	  `, {
        reply_markup: {
            force_reply: true,
        },
    });
});
exports.sendNotInReminder_1 = sendNotInReminder_1;
//Uses botOnType = 16 to work
const sendNotInReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.text = (yield ctx.message.text) || '';
    yield ctx.reply(`Enter Service Date in dd/mm/yyyy
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
    var _a;
    const textDate = (yield ctx.message.text) || '';
    const textDateArray = textDate.split('/');
    const svcDate = new Date(parseInt(textDateArray[2]), parseInt(textDateArray[1]) - 1, parseInt(textDateArray[0]));
    const totalNames = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find();
    const reminder = ctx.session.text || '';
    yield _index_1.gsheet.unshakeableSFSpreadsheet.loadInfo();
    const sheet = yield _index_1.gsheet.unshakeableSFSpreadsheet.sheetsByTitle['Telegram'];
    yield sheet.loadCells();
    let i = 4;
    while (i <= totalNames.length + 3) {
        const time = yield sheet.getCellByA1(`F${i}`);
        const date = new Date(((_a = time.value) === null || _a === void 0 ? void 0 : _a.toString()) || '');
        const offset = (date.getTime() - svcDate.getTime()) / 86400000; // in days
        if (offset > 3 || time.value == null) {
            const user = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
                sfrow: i,
            });
            yield (0, _db_functions_1.sendMessageUser)(user[0].teleUser, reminder, ctx);
        }
        i++;
    }
    yield ctx.reply(`Reminder sent!`);
    ctx.session = yield (0, _SessionData_1.initial)();
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
    yield ctx.reply(`Write down the reminder msg that you want to send to @${telegramUser}
	  \nSuggestion to put /sendsf so that user can click on it
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
        const reminder = (yield ctx.message.text) || '';
        yield (0, _db_functions_1.sendMessageUser)(ctx.session.reminderUser, reminder, ctx);
        yield ctx.reply(`Reminder sent to ${ctx.session.reminderUser}`);
    }
    ctx.session = yield (0, _SessionData_1.initial)();
});
exports.sendSpecificReminder_3 = sendSpecificReminder_3;
