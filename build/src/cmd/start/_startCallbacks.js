"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = void 0;
const grammy_1 = require("grammy");
const _db_init_1 = require("../../database_mongoDB/_db-init");
const _tableEntity_1 = require("../../database_mongoDB/Entity/_tableEntity");
const _telefunctions_1 = require("../../app/_telefunctions");
const start = (bot) => {
    bot.callbackQuery(/^nameStart-/g, _telefunctions_1.loadFunction, startReply);
    bot.callbackQuery('confirm_YES', _telefunctions_1.loadFunction, confirmReply_Yes);
    bot.callbackQuery('select_YES', _telefunctions_1.loadFunction, confirmReply_Yes);
    bot.callbackQuery('confirm_NO', _telefunctions_1.loadFunction, confirmReply_No);
    bot.callbackQuery('select_NO', _telefunctions_1.loadFunction, selectreply_No);
};
exports.start = start;
const startReply = async (ctx) => {
    const nameStart = ctx.update.callback_query.data.substring('nameStart-'.length);
    const name = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).find({
        where: {
            nameText: { $eq: nameStart },
        },
    });
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlineKeyboard_confirm = new grammy_1.InlineKeyboard([
        [{ text: 'Yes', callback_data: 'confirm_YES' }],
        [{ text: 'No', callback_data: 'confirm_NO' }],
    ]);
    const inlineKeyboard_select = new grammy_1.InlineKeyboard([
        [{ text: 'Yes', callback_data: 'select_YES' }],
        [{ text: 'No', callback_data: 'select_NO' }],
    ]);
    const chatid = await name.map((n) => n.chat);
    const teleUser = await name.map((n) => n.teleUser);
    if (chatid.toString() == '' || teleUser.toString() == '') {
        ctx.session.name = nameStart;
        await ctx.reply(`${nameStart} chosen.\nIs this your name?`, {
            reply_markup: inlineKeyboard_confirm,
        });
    }
    else {
        await ctx.reply(`${nameStart} already taken.\nDo you still want to override?`, {
            reply_markup: inlineKeyboard_select,
        });
    }
};
const confirmReply_Yes = async (ctx) => {
    var _a;
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    const keyboard = new grammy_1.Keyboard()
        .text('/help')
        .row()
        .text('/settings')
        .row()
        .text('/sendsf')
        .row()
        .text('/sendwish')
        .row()
        .text('/sendattendance')
        .row()
        .text('/adminwelfare')
        .row()
        .text('/adminbday')
        .row()
        .text('/adminsf')
        .row()
        .text('/adminattendance')
        .row()
        .resized();
    const chatid = await ((_a = ctx.chat) === null || _a === void 0 ? void 0 : _a.id.toString());
    await _db_init_1.Database.getMongoRepository(_tableEntity_1.Names).updateOne({ nameText: ctx.session.name }, {
        $set: {
            teleUser: ctx.update.callback_query.from.username,
            chat: chatid,
        },
    });
    await ctx.reply('Name Logged!\nYou can now use any of the following functions below!', { reply_markup: keyboard });
};
const confirmReply_No = async (ctx) => {
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    await ctx.reply('Understood.\nPlease /start to try again');
};
const selectreply_No = async (ctx) => {
    await ctx.editMessageReplyMarkup({ reply_markup: { inline_keyboard: [] } });
    await ctx.reply('Please contact your respective IT representative for technical support!');
};
