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
exports.editWelfareEvent = exports.deleteWelfareEvent = exports.addWelfareEvent = exports.manageWelfareEvent = exports.sendSpecificReminder_3 = exports.sendSpecificReminder_2 = exports.sendSpecificReminder_1 = exports.reminderManagement = exports.seeWish_2 = exports.seeWish_1 = void 0;
const grammy_1 = require("grammy");
const db_init_1 = require("../database_mongoDB/db-init");
const tableEntity_1 = require("../database_mongoDB/Entity/tableEntity");
const db_functions_1 = require("./db_functions");
const SessionData_1 = require("../models/SessionData");
// See Wish Callbacks
const seeWish_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const welfareEvent = yield db_init_1.Database.getRepository(tableEntity_1.Events).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(welfareEvent.map((w) => [
        {
            text: w.eventName,
            callback_data: `welfareWish_1-${w.eventName}`,
        },
    ]));
    yield ctx.reply('Select Welfare Event', {
        reply_markup: inlineKeyboard,
    });
});
exports.seeWish_1 = seeWish_1;
const seeWish_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const callback = ctx.update.callback_query.data.substring('welfareWish_1-'.length);
    const welfareWishArray = yield db_init_1.Database.getMongoRepository(tableEntity_1.Wishes).find({
        eventName: callback,
    });
    const wishTable = yield welfareWishArray.map((n) => `@${n.teleUser}\nWish: \n${n.wishText}`);
    console.log(wishTable);
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [{ text: 'Back', callback_data: 'seeWelfareWishes' }],
    ]);
    yield ctx.reply(wishTable.join('\n\n'), {
        reply_markup: inlineKeyboard,
    });
});
exports.seeWish_2 = seeWish_2;
// Reminder Management
const reminderManagement = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Send to members that have not turned in',
                callback_data: 'sendNotInReminder',
            },
        ],
        [
            {
                text: 'Send to specific member',
                callback_data: 'sendSpecificReminder',
            },
        ],
        [
            {
                text: 'Send to all members',
                callback_data: 'sendAllReminder',
            },
        ],
    ]);
    yield ctx.reply(`
	  Choose option
	  (Send all option will exlude the person its for)

	  DO NOT ABUSE THE REMINDER SYSTEM.
	  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.reminderManagement = reminderManagement;
const sendSpecificReminder_1 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield db_init_1.Database.getRepository(tableEntity_1.Events).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(event.map((n) => [
        {
            text: n.eventName,
            callback_data: `reminderSpecificEvents-${n.eventName}`,
        },
    ]));
    yield ctx.reply('Choose event:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_1 = sendSpecificReminder_1;
const sendSpecificReminder_2 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.session.eventName = ctx.update.callback_query.data.substring('reminderSpecificEvents-'.length);
    const name = yield db_init_1.Database.getRepository(tableEntity_1.Names).find();
    const inlineKeyboard = new grammy_1.InlineKeyboard(name.map((n) => [
        {
            text: n.nameText,
            callback_data: `reminderSpecificNames-${n.teleUser}`,
        },
    ]));
    yield ctx.reply('Choose member:', {
        reply_markup: inlineKeyboard,
    });
});
exports.sendSpecificReminder_2 = sendSpecificReminder_2;
const sendSpecificReminder_3 = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const telegramUser = yield ctx.update.callback_query.data.substring('reminderSpecificNames-'.length);
    yield (0, db_functions_1.sendMessageUser)(telegramUser, `Hello this is a friendly reminder to send in your wishes for ${ctx.session.eventName}! 😀 Pls click /sendwish to send`, ctx);
    (0, SessionData_1.initial)();
});
exports.sendSpecificReminder_3 = sendSpecificReminder_3;
//Manage Welfare Events
const manageWelfareEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const inlineKeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Add Welfare Event',
                callback_data: 'addWelfareEvent',
            },
        ],
        [
            {
                text: 'Delete Welfare Event',
                callback_data: 'deleteWelfareEvent',
            },
        ],
        [
            {
                text: 'Edit Welfare Event',
                callback_data: 'editWelfareEvent',
            },
        ],
    ]);
    yield ctx.reply(`
		  Choose option
		  `, {
        reply_markup: inlineKeyboard,
    });
});
exports.manageWelfareEvent = manageWelfareEvent;
const addWelfareEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () { });
exports.addWelfareEvent = addWelfareEvent;
const deleteWelfareEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () { });
exports.deleteWelfareEvent = deleteWelfareEvent;
const editWelfareEvent = (ctx) => __awaiter(void 0, void 0, void 0, function* () { });
exports.editWelfareEvent = editWelfareEvent;
