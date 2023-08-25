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
exports.selectreply_No = exports.confirmReply_No = exports.confirmReply_Yes = exports.startReply = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../database_mongoDB/_db-init");
const _tableEntity_1 = require("../database_mongoDB/Entity/_tableEntity");
const startReply = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const nameStart = ctx.update.callback_query.data.substring('nameStart-'.length);
    const name = yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            nameText: { $eq: nameStart },
        },
    });
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.answerCallbackQuery({ text: nameStart });
    const inlineKeyboard_confirm = new grammy_1.InlineKeyboard([
        [{ text: 'Yes', callback_data: 'confirm_YES' }],
        [{ text: 'No', callback_data: 'confirm_NO' }],
    ]);
    const inlineKeyboard_select = new grammy_1.InlineKeyboard([
        [{ text: 'Yes', callback_data: 'select_YES' }],
        [{ text: 'No', callback_data: 'select_NO' }],
    ]);
    const teleUser = yield name.map((n) => n.teleUser);
    if (teleUser.toString() == '') {
        ctx.session.name = nameStart;
        yield ctx.reply(`${nameStart} chosen.\nIs this your name?`, {
            reply_markup: inlineKeyboard_confirm,
        });
    }
    else {
        yield ctx.reply(`${nameStart} already taken.\nDo you still want to override?`, {
            reply_markup: inlineKeyboard_select,
        });
    }
});
exports.startReply = startReply;
const confirmReply_Yes = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const keyboard = new grammy_1.Keyboard()
        .text('/help')
        .row()
        .text('/settings')
        .row()
        .text('/sendsf')
        .row()
        .text('/sendwish')
        .row()
        .text('/adminwelfare')
        .row()
        .text('/adminbday')
        .row()
        .text('/adminsf')
        .resized();
    const chatid = yield ((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id.toString());
    yield _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: ctx.session.name }, {
        $set: {
            teleUser: ctx.update.callback_query.from.username,
            chat: chatid,
        },
    });
    yield ctx.reply('Name Logged!\nYou can now use any of the following functions below!', { reply_markup: keyboard });
});
exports.confirmReply_Yes = confirmReply_Yes;
const confirmReply_No = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('Understood.\nPlease /start to try again');
});
exports.confirmReply_No = confirmReply_No;
const selectreply_No = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    yield ctx.reply('Please contact your respective IT representative for technical support!');
});
exports.selectreply_No = selectreply_No;
